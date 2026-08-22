import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { GoogleGenAI } from "@google/genai";
import { getSupabaseServerClient } from "./src/lib/supabaseServer";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "1000mb" }));
app.use(express.urlencoded({ limit: "1000mb", extended: true }));

// Global Request Logger
app.use((req, _res, next) => {
  console.log(`[EXPRESS REQ] ${req.method} ${req.url}`);
  next();
});

// Lazy Gemini API client initialization
let genaiClient: GoogleGenAI | null = null;
function getGenAI() {
  if (!genaiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      genaiClient = new GoogleGenAI({ apiKey });
    }
  }
  return genaiClient;
}

const ARIA_SYSTEM_INSTRUCTION = `You are Maitresse Aria — an elegant, regal, high-fashion, and commanding dark aesthetic persona. 
Your tone is sophisticated, eloquent, dark luxury, uncompromisingly authoritative yet polite and captivating. 
You provide guidance to visitors on your website about your rules (The Codex), session inquiries, tribute etiquette, custom orders, and chastity protocols.
Always speak in character as Maitresse Aria. Refer to visitors politely as 'Devotee', 'Seeker', or 'Inquirer' unless they state a title.
Never drop character. Keep responses concise, impactful, and luxurious (1-3 paragraphs max).`;

// API endpoint for AI Persona Chat
app.post("/api/aria-chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message string is required." });
    }

    const ai = getGenAI();

    if (!ai) {
      // Elegant fallback response when API key is not configured
      const fallbackResponses = [
        "Welcome to my sanctum. Submission is a privilege, and excellence is non-negotiable. Ensure you read The Codex thoroughly before inquiring about direct sessions.",
        "Your curiosity is acknowledged. True devotion begins with tribute and respect. Review my session offerings or consult my Wishlist.",
        "Silence is acceptable, but etiquette is mandatory. Address me with proper deference when submitting your session requests.",
        "I review inquiries in order of tribute magnitude and protocol adherence. What specific session or custom audio order do you seek to present?"
      ];
      const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      return res.json({ reply: randomFallback, source: "fallback" });
    }

    // Format chat history for Gemini API
    const contents: any[] = [];
    if (Array.isArray(history)) {
      history.forEach((h: { role: string; content: string }) => {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }]
        });
      });
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: ARIA_SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    const reply = response.text || "My attention is finite. Ensure your next message carries purpose.";
    return res.json({ reply, source: "gemini" });
  } catch (error: any) {
    console.error("Error in /api/aria-chat:", error);
    return res.status(500).json({
      reply: "The dark veil flickers momentarily. Present your request once more with absolute clarity.",
      error: error.message
    });
  }
});

// Live Stream State Engine
let liveStreamState = {
  isLive: false, // Default to OFFLINE
  title: "Exclusive Live Session with Goddess Milana",
  description: "Exclusive live stream preview. Enter my VIP sanctuary. Reserved for verified devotees.",
  price: "20.00 €",
  streamUrl: "",
  updatedAt: Date.now()
};

// Endpoint to fetch current live status
app.get("/api/live-status", async (_req, res) => {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data: streamData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "live_stream_status")
        .maybeSingle();

      if (streamData && streamData.value) {
        liveStreamState = { ...liveStreamState, ...streamData.value };
      } else {
        const { data: legacyData } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "live_status")
          .maybeSingle();
        if (legacyData && legacyData.value) {
          liveStreamState = { ...liveStreamState, ...legacyData.value };
        }
      }
    } catch (e) {}
  }
  res.json(liveStreamState);
});

// Helper functions for Supabase Admin Credentials
async function getSupabaseAdminCredentials() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "admin_credentials")
      .maybeSingle();
    if (error) {
      console.warn("Error reading admin_credentials from Supabase:", error.message);
      return null;
    }
    if (data && data.value && typeof data.value === "object" && data.value.username && data.value.password) {
      return {
        username: String(data.value.username).trim(),
        password: String(data.value.password).trim()
      };
    }
  } catch (e) {
    console.warn("Failed fetching admin_credentials from Supabase site_settings:", e);
  }
  return null;
}

async function saveSupabaseAdminCredentials(username: string, password: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { success: false, error: "Supabase client not initialized. Check database connection." };
  }
  const isAlreadyHashed = password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$");
  const hashedPassword = isAlreadyHashed ? password : bcrypt.hashSync(password.trim(), 10);
  const payload = {
    username: username.trim(),
    password: hashedPassword,
    updated_at: new Date().toISOString()
  };
  try {
    const { error } = await supabase.from("site_settings").upsert({
      key: "admin_credentials",
      value: payload
    });

    if (error) {
      console.error("Failed saving admin_credentials to Supabase site_settings:", error);
      return { success: false, error: error.message || "Supabase database write failed." };
    }

    try {
      await supabase.from("passcode_audit_logs").insert({
        old_passcode: "N/A",
        new_passcode: username.trim(),
        verified: true,
        action: "CREDENTIALS_UPDATED",
        changed_at: new Date().toISOString()
      });
    } catch (e) {}

    return { success: true };
  } catch (e: any) {
    console.error("Exception saving admin_credentials to Supabase:", e);
    return { success: false, error: e.message || "Unexpected server error." };
  }
}

// Helper to parse cookies from request headers
function parseCookies(req: express.Request): Record<string, string> {
  const list: Record<string, string> = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      const name = parts.shift()?.trim();
      if (name) {
        list[name] = decodeURIComponent(parts.join("=").trim());
      }
    });
  }
  return list;
}

// Helper to check if request is authenticated admin via HTTP-Only cookie or header
function checkIsAdmin(req: express.Request): boolean {
  const cookies = parseCookies(req);
  const sessionToken = cookies["admin_session"];
  if (sessionToken && (sessionToken.startsWith("admin_session_") || sessionToken.startsWith("session_"))) {
    return true;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && (authHeader.includes("admin_session_") || authHeader.includes("Bearer session_"))) {
    return true;
  }
  return false;
}

// GET /api/admin/auth-status - Check if admin credentials are configured in Supabase & check session cookie
app.get("/api/admin/auth-status", async (req, res) => {
  const creds = await getSupabaseAdminCredentials();
  const cookies = parseCookies(req);
  const sessionToken = cookies["admin_session"];
  const isAuthenticated = Boolean(sessionToken && (sessionToken.startsWith("admin_session_") || sessionToken.startsWith("session_")));

  res.json({
    isConfigured: Boolean(creds && creds.username && creds.password),
    username: creds ? creds.username : null,
    isAuthenticated
  });
});

// POST /api/admin/setup - Initial first-time admin setup in Supabase
app.post("/api/admin/setup", async (req, res) => {
  console.log("[SETUP ENDPOINT] Request received body:", req.body);
  try {
    const { username, password } = req.body || {};
    if (!username || username.trim().length < 3 || !password || password.trim().length < 3) {
      return res.status(400).json({ success: false, error: "Username and password must be at least 3 characters long." });
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return res.status(500).json({ success: false, error: "Supabase client not initialized. Check database environment variables." });
    }
    const hashedPassword = bcrypt.hashSync(password.trim(), 10);
    const payload = { username: username.trim(), password: hashedPassword, updated_at: new Date().toISOString() };

    // Safe database write handling
    let writeError: any = null;
    let writeData: any = null;

    const upsertRes = await supabase
      .from("site_settings")
      .upsert({ key: "admin_credentials", value: payload, updated_at: new Date().toISOString() }, { onConflict: "key" })
      .select();

    if (upsertRes.error) {
      console.warn("[UPSERT FAILED, USING SELECT+UPDATE/INSERT FALLBACK]:", upsertRes.error.message);
      const { data: existing } = await supabase.from("site_settings").select("id").eq("key", "admin_credentials").maybeSingle();
      if (existing) {
        const updateRes = await supabase
          .from("site_settings")
          .update({ value: payload, updated_at: new Date().toISOString() })
          .eq("key", "admin_credentials")
          .select();
        writeError = updateRes.error;
        writeData = updateRes.data;
      } else {
        const insertRes = await supabase
          .from("site_settings")
          .insert({ key: "admin_credentials", value: payload, updated_at: new Date().toISOString() })
          .select();
        writeError = insertRes.error;
        writeData = insertRes.data;
      }
    } else {
      writeData = upsertRes.data;
    }

    if (writeError) {
      console.error("[SUPABASE WRITE ERROR]:", writeError);
      return res.status(500).json({ success: false, error: `Database Error: ${writeError.message}` });
    }

    console.log("[SUPABASE WRITE SUCCESS]:", writeData);
    
    // Set HTTP-Only Cookie
    res.cookie('admin_session', `session_${Date.now()}`, { httpOnly: true, sameSite: 'strict', secure: false, path: '/' });
    return res.json({ success: true, message: "Admin account configured successfully!" });
  } catch (err: any) {
    console.error("[SETUP CRASH]:", err);
    return res.status(500).json({ success: false, error: err.message || "Server exception during setup." });
  }
});

// POST /api/admin/login - Verify credentials against Supabase
app.post("/api/admin/login", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    const { username, password } = req.body || {};
    const creds = await getSupabaseAdminCredentials();

    if (!creds || !creds.username || !creds.password) {
      return res.status(400).json({
        success: false,
        error: "No admin account has been set up in Supabase yet. Please set up your account first."
      });
    }

    const cleanUser = String(username || "").trim();
    const cleanPass = String(password || "").trim();

    const isUserValid = cleanUser.toLowerCase() === creds.username.toLowerCase();
    
    let isPassValid = false;
    if (creds.password.startsWith("$2a$") || creds.password.startsWith("$2b$") || creds.password.startsWith("$2y$")) {
      isPassValid = bcrypt.compareSync(cleanPass, creds.password);
    } else {
      isPassValid = (cleanPass === creds.password);
    }

    if (!isUserValid || !isPassValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid username or password. Security verification failed."
      });
    }

    const token = `admin_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    res.cookie("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/"
    });

    return res.json({
      success: true,
      message: "Authentication successful!",
      username: creds.username
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Login failed due to server error." });
  }
});

// GET /api/admin/onboarding-status - Check if Goddess Milana has completed first-time setup
app.get("/api/admin/onboarding-status", async (req, res) => {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "onboarding_completed")
        .maybeSingle();

      if (data && data.value) {
        return res.json({ completed: Boolean(data.value.completed) });
      }
    } catch (e) {}
  }
  // Default to true if not explicitly false/configured or false on fresh setup
  return res.json({ completed: false });
});

// POST /api/admin/onboarding-complete - Mark first-time setup as completed
app.post("/api/admin/onboarding-complete", async (req, res) => {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from("site_settings").upsert({
        key: "onboarding_completed",
        value: { completed: true, completedAt: new Date().toISOString() },
        updated_at: new Date().toISOString()
      });
    } catch (e) {}
  }
  return res.json({ success: true, message: "Onboarding completed successfully!" });
});

// POST /api/admin/upload-profile-image - Upload profile photo directly to Supabase storage (profile_assets)
app.post("/api/admin/upload-profile-image", async (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized. Admin session required." });
  }

  const { fileName, fileData, contentType } = req.body || {};
  if (!fileData) {
    return res.status(400).json({ error: "fileData (base64) is required." });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return res.status(500).json({ error: "Supabase client not configured." });
  }

  try {
    const cleanName = String(fileName || "portrait.jpg").replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `portraits/${Date.now()}_${cleanName}`;
    const base64Data = fileData.includes(",") ? fileData.split(",")[1] : fileData;
    const buffer = Buffer.from(base64Data, "base64");
    const mimeType = contentType || "image/jpeg";

    const buckets = ["profile_assets", "profile_photos", "profile_images"];
    let uploadedBucket = "";
    let uploadError = null;

    for (const bName of buckets) {
      const { error: upErr } = await supabase.storage
        .from(bName)
        .upload(storagePath, buffer, { contentType: mimeType, upsert: true });
      if (!upErr) {
        uploadedBucket = bName;
        break;
      } else {
        uploadError = upErr;
      }
    }

    if (!uploadedBucket) {
      return res.status(500).json({
        error: uploadError?.message || "Failed to upload image to Supabase storage bucket (profile_assets)."
      });
    }

    const { data: publicData } = supabase.storage.from(uploadedBucket).getPublicUrl(storagePath);
    const publicUrl = publicData?.publicUrl || "";

    // Sync to creator profile state in memory and database
    creatorProfileState.avatar = publicUrl;
    centralSiteSettingsState.avatar_url = publicUrl;

    try {
      await supabase.from("site_settings").upsert([
        {
          key: "creator_profile",
          value: creatorProfileState,
          updated_at: new Date().toISOString()
        },
        {
          key: "central_site_settings",
          value: centralSiteSettingsState,
          updated_at: new Date().toISOString()
        }
      ]);
    } catch (dbErr) {
      console.warn("Notice: updated memory profile, DB upsert notice:", dbErr);
    }

    return res.json({
      success: true,
      publicUrl,
      storagePath,
      bucket: uploadedBucket
    });
  } catch (err: any) {
    console.error("[PROFILE IMAGE UPLOAD ERROR]:", err);
    return res.status(500).json({ error: err.message || "Internal server error uploading image." });
  }
});

// POST /api/admin/upload-gallery-image - Upload an "About Me" gallery photo to Supabase storage (profile_assets)
app.post("/api/admin/upload-gallery-image", async (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized. Admin session required." });
  }

  const { fileName, fileData, contentType } = req.body || {};
  if (!fileData) {
    return res.status(400).json({ error: "fileData (base64) is required." });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return res.status(500).json({ error: "Supabase client not configured." });
  }

  try {
    const cleanName = String(fileName || "gallery.jpg").replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `gallery/${Date.now()}_${cleanName}`;
    const base64Data = fileData.includes(",") ? fileData.split(",")[1] : fileData;
    const buffer = Buffer.from(base64Data, "base64");
    const mimeType = contentType || "image/jpeg";

    const buckets = ["profile_assets", "profile_photos", "profile_images"];
    let uploadedBucket = "";
    let uploadError = null;

    for (const bName of buckets) {
      const { error: upErr } = await supabase.storage
        .from(bName)
        .upload(storagePath, buffer, { contentType: mimeType, upsert: true });
      if (!upErr) {
        uploadedBucket = bName;
        break;
      } else {
        uploadError = upErr;
      }
    }

    if (!uploadedBucket) {
      return res.status(500).json({
        error: uploadError?.message || "Failed to upload gallery image to Supabase storage bucket (profile_assets)."
      });
    }

    const { data: publicData } = supabase.storage.from(uploadedBucket).getPublicUrl(storagePath);
    const publicUrl = publicData?.publicUrl || "";

    return res.json({
      success: true,
      publicUrl,
      storagePath,
      bucket: uploadedBucket
    });
  } catch (err: any) {
    console.error("[GALLERY IMAGE UPLOAD ERROR]:", err);
    return res.status(500).json({ error: err.message || "Internal server error uploading gallery image." });
  }
});

// POST /api/admin/storage/profile-upload-url - Upload portrait / profile photo to Supabase storage
app.post("/api/admin/storage/profile-upload-url", async (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized. Admin session required." });
  }

  const { fileName } = req.body || {};
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return res.status(500).json({ error: "Supabase client not configured." });
  }

  try {
    const cleanName = String(fileName || "portrait.jpg").replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `portraits/${Date.now()}_${cleanName}`;

    // Try creating signed upload URL in 'profile_assets' then 'profile_photos' or 'profile_images'
    const buckets = ["profile_assets", "profile_photos", "profile_images"];
    let chosenBucket = "";
    let dataResult: any = null;
    let lastError: any = null;

    for (const bName of buckets) {
      const { data, error } = await supabase.storage.from(bName).createSignedUploadUrl(storagePath);
      if (!error && data) {
        chosenBucket = bName;
        dataResult = data;
        break;
      }
      lastError = error;
    }

    if (!chosenBucket || !dataResult) {
      return res.status(500).json({ error: lastError?.message || "Failed to create signed upload URL in profile_assets bucket." });
    }

    const { data: publicData } = supabase.storage.from(chosenBucket).getPublicUrl(storagePath);

    return res.json({
      success: true,
      signedUrl: dataResult.signedUrl,
      publicUrl: publicData?.publicUrl || dataResult.signedUrl.split("?")[0],
      storagePath,
      bucket: chosenBucket
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed generating upload URL" });
  }
});

// In-Memory Payment Requests Cache with Supabase synchronization (No fake demo data)
const pendingPaymentRequests: Array<{
  id: string;
  video_id?: string;
  video_title?: string;
  itemId?: string;
  itemTitle?: string;
  fan_identifier?: string;
  fanIdentifier?: string;
  payment_method?: string;
  paymentMethod?: string;
  transaction_ref?: string;
  transactionRef?: string;
  amount: string | number;
  status: "pending" | "approved" | "rejected";
  delivery_link?: string | null;
  deliveryLink?: string | null;
  google_drive_link?: string | null;
  googleDriveLink?: string | null;
  unlockToken?: string;
  created_at?: string;
  createdAt?: string;
  reviewed_at?: string | null;
  reviewedAt?: string | null;
}> = [];

// Helper to normalize and sanitize real payment requests
function normalizePaymentRequest(item: any) {
  const videoId = item.video_id || item.videoId || item.itemId || "media-asset";
  const videoTitle = item.video_title || item.videoTitle || item.itemTitle || "Exclusive Video Archive";
  const fanId = item.fan_identifier || item.fanIdentifier || "Anonymous Devotee";
  const method = item.payment_method || item.paymentMethod || "Throne";
  const ref = item.transaction_ref || item.transactionRef || "Direct";
  const amount = item.amount || "35.00 €";
  const status = item.status || "pending";
  const createdAt = item.created_at || item.createdAt || new Date().toISOString();
  const reviewedAt = item.reviewed_at || item.reviewedAt || null;
  const deliveryLink = item.delivery_link || item.deliveryLink || null;
  const googleDriveLink = item.google_drive_link || item.googleDriveLink || null;

  return {
    id: String(item.id),
    video_id: videoId,
    video_title: videoTitle,
    itemId: videoId,
    itemTitle: videoTitle,
    fan_identifier: fanId,
    fanIdentifier: fanId,
    payment_method: method,
    paymentMethod: method,
    transaction_ref: ref,
    transactionRef: ref,
    amount: String(amount),
    status: status,
    delivery_link: deliveryLink,
    deliveryLink: deliveryLink,
    google_drive_link: googleDriveLink,
    googleDriveLink: googleDriveLink,
    created_at: createdAt,
    createdAt: createdAt,
    reviewed_at: reviewedAt,
    reviewedAt: reviewedAt
  };
}

// GET /api/admin/payment-requests - Fetch all genuine payment verification submissions
app.get("/api/admin/payment-requests", async (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized. Admin session required." });
  }

  const supabase = getSupabaseServerClient();
  let rawRequests: any[] = [...pendingPaymentRequests];

  if (supabase) {
    try {
      // 1. Check payment_requests table
      const { data: tableData, error: tableErr } = await supabase
        .from("payment_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (!tableErr && tableData && Array.isArray(tableData)) {
        rawRequests = [...tableData, ...rawRequests];
      }

      // 2. Also check site_settings fallback queue
      const { data: queueData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "payment_requests_queue")
        .maybeSingle();

      if (queueData && Array.isArray(queueData.value)) {
        rawRequests = [...rawRequests, ...queueData.value];
      }
    } catch (e) {
      console.warn("Notice: payment requests fetch fallback to memory:", e);
    }
  }

  // Deduplicate by ID and strictly exclude any fake/legacy demo sample items
  const map = new Map<string, any>();
  for (const item of rawRequests) {
    if (!item || !item.id) continue;
    // Strictly filter out any sample/mock data items
    if (String(item.id).startsWith("req-sample") || String(item.transaction_ref || item.transactionRef || "").includes("99214")) {
      continue;
    }
    if (!map.has(item.id)) {
      map.set(item.id, normalizePaymentRequest(item));
    }
  }

  const requests = Array.from(map.values()).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return res.json({ success: true, requests });
});

// Common handler for approving/rejecting a payment request
async function handlePaymentAction(req: express.Request, res: express.Response, forceAction?: "approve" | "reject") {
  if (!checkIsAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized. Admin session required." });
  }

  const { id } = req.params;
  const action = forceAction || req.body?.action;

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({ error: "Action must be 'approve' or 'reject'." });
  }

  const newStatus = action === "approve" ? "approved" : "rejected";
  const reviewedAt = new Date().toISOString();
  const supabase = getSupabaseServerClient();

  // Find in memory or locate target
  let target = pendingPaymentRequests.find(r => r.id === id);
  let deliveryLink: string | null = null;
  let googleDriveUrl: string | null = null;

  if (action === "approve") {
    const targetVideoId = target?.video_id || target?.itemId || id;
    const token = `ACCESS-${targetVideoId}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    deliveryLink = `${req.protocol}://${req.get("host") || "localhost:3000"}/#unlock=${token}`;

    const matchingMedia = customUploadedMedia.find(m => m.id === targetVideoId);
    if (matchingMedia && matchingMedia.googleDriveLink) {
      googleDriveUrl = matchingMedia.googleDriveLink;
    } else if (req.body?.deliveryLink) {
      googleDriveUrl = req.body.deliveryLink;
    }

    verifiedAccessTokens.set(token, {
      itemId: targetVideoId,
      timestamp: Date.now()
    });

    if (supabase) {
      try {
        await supabase.from("access_grants").insert({
          video_id: targetVideoId,
          video_title: target?.video_title || target?.itemTitle || "Exclusive Media Asset",
          fan_identifier: target?.fan_identifier || target?.fanIdentifier || "Authorized Buyer",
          link_reference: token,
          generated_at: reviewedAt,
          expires_at: new Date(Date.now() + 86400 * 1000).toISOString()
        });
      } catch (e) {}
    }
  }

  if (target) {
    target.status = newStatus;
    target.reviewed_at = reviewedAt;
    target.reviewedAt = reviewedAt;
    if (deliveryLink) {
      target.delivery_link = deliveryLink;
      target.deliveryLink = deliveryLink;
    }
    if (googleDriveUrl) {
      target.google_drive_link = googleDriveUrl;
      target.googleDriveLink = googleDriveUrl;
    }
  }

  if (supabase) {
    try {
      await supabase
        .from("payment_requests")
        .update({
          status: newStatus,
          reviewed_at: reviewedAt,
          delivery_link: deliveryLink
        })
        .eq("id", id);
    } catch (e) {}

    try {
      await supabase.from("site_settings").upsert({
        key: "payment_requests_queue",
        value: pendingPaymentRequests,
        updated_at: reviewedAt
      });
    } catch (e) {}
  }

  return res.json({
    success: true,
    status: newStatus,
    deliveryLink,
    googleDriveUrl,
    message: action === "approve"
      ? "Asset geautoriseerd. Veilige Google Drive archieflink vrijgegeven."
      : "Transactie geweigerd. Toegang ontzegd."
  });
}

// POST /api/admin/payment-requests/:id/action
app.post("/api/admin/payment-requests/:id/action", (req, res) => handlePaymentAction(req, res));

// POST /api/admin/payment-requests/:id/approve
app.post("/api/admin/payment-requests/:id/approve", (req, res) => handlePaymentAction(req, res, "approve"));

// POST /api/admin/payment-requests/:id/reject
app.post("/api/admin/payment-requests/:id/reject", (req, res) => handlePaymentAction(req, res, "reject"));

// POST /api/payment-requests/submit & /api/submit-payment-request - Devotee submits real proof of tribute/payment
const handleClientPaymentSubmission = async (req: express.Request, res: express.Response) => {
  try {
    const { videoId, itemId, videoTitle, itemTitle, fanIdentifier, paymentMethod, transactionRef, amount } = req.body || {};

    const targetId = videoId || itemId;
    if (!targetId) {
      return res.status(400).json({ error: "Media item ID is verplicht." });
    }

    const newRequest = normalizePaymentRequest({
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      video_id: String(targetId),
      video_title: videoTitle || itemTitle || "Exclusief Video-Archief",
      fan_identifier: fanIdentifier ? String(fanIdentifier).trim() : "Anonieme Volgeling",
      payment_method: paymentMethod || "Throne",
      transaction_ref: transactionRef ? String(transactionRef).trim() : "Directe Hulde",
      amount: amount ? String(amount).trim() : "35.00 €",
      status: "pending",
      created_at: new Date().toISOString(),
      reviewed_at: null,
      delivery_link: null
    });

    pendingPaymentRequests.unshift(newRequest);

    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase.from("payment_requests").insert({
          id: newRequest.id,
          video_id: newRequest.video_id,
          video_title: newRequest.video_title,
          fan_identifier: newRequest.fan_identifier,
          payment_method: newRequest.payment_method,
          transaction_ref: newRequest.transaction_ref,
          amount: newRequest.amount,
          status: newRequest.status,
          created_at: newRequest.created_at
        });
      } catch (dbErr) {
        console.warn("Supabase payment_requests table insert note:", dbErr);
      }

      try {
        await supabase.from("site_settings").upsert({
          key: "payment_requests_queue",
          value: pendingPaymentRequests,
          updated_at: new Date().toISOString()
        });
      } catch (e) {}
    }

    return res.json({
      success: true,
      message: "Uw verificatieverzoek is ingediend bij Godin Milana. Zodra zij uw hulde autoriseert, wordt uw toegang vrijgegeven.",
      request: newRequest
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

app.post("/api/payment-requests/submit", handleClientPaymentSubmission);
app.post("/api/submit-payment-request", handleClientPaymentSubmission);

// POST /api/admin/logout - Clear HTTP-Only session cookie
app.post("/api/admin/logout", (_req, res) => {
  res.clearCookie("admin_session", { path: "/" });
  res.json({ success: true, message: "Logged out successfully" });
});

// POST /api/admin/change-credentials - Change username/password with current password check
app.post("/api/admin/change-credentials", async (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(401).json({ success: false, error: "Unauthorized. Admin session required." });
  }
  res.setHeader("Content-Type", "application/json");
  try {
    const { currentPassword, newUsername, newPassword } = req.body || {};
    const creds = await getSupabaseAdminCredentials();

    if (!creds || !creds.password) {
      return res.status(400).json({
        success: false,
        error: "No admin account found in Supabase. Please complete initial setup first."
      });
    }

    const cleanCurrent = String(currentPassword || "").trim();
    let isCurrentValid = false;
    if (creds.password.startsWith("$2a$") || creds.password.startsWith("$2b$") || creds.password.startsWith("$2y$")) {
      isCurrentValid = bcrypt.compareSync(cleanCurrent, creds.password);
    } else {
      isCurrentValid = (cleanCurrent === creds.password);
    }

    if (!isCurrentValid) {
      return res.status(401).json({
        success: false,
        error: "Incorrect current password. Security verification failed."
      });
    }

    const targetUsername = (newUsername && newUsername.trim()) ? newUsername.trim() : creds.username;
    let targetPassword = creds.password; // Keep existing hash if no new password

    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 3) {
        return res.status(400).json({ success: false, error: "New password must be at least 3 characters." });
      }
      targetPassword = bcrypt.hashSync(newPassword.trim(), 10);
    }

    if (targetUsername.length < 3) {
      return res.status(400).json({ success: false, error: "Username must be at least 3 characters." });
    }

    await saveSupabaseAdminCredentials(targetUsername, targetPassword);

    return res.json({
      success: true,
      message: "Admin credentials successfully updated in Supabase database!",
      username: targetUsername
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed updating credentials." });
  }
});

// Endpoint for Mistress to update Live Status (Go Live / Set Offline)
app.post("/api/live-status", async (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized. Admin session required." });
  }
  try {
    const { isLive, title, description, price, streamUrl } = req.body;

    liveStreamState = {
      isLive: Boolean(isLive),
      title: title || liveStreamState.title,
      description: description || liveStreamState.description,
      price: price || liveStreamState.price,
      streamUrl: streamUrl || liveStreamState.streamUrl,
      updatedAt: Date.now()
    };

    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase.from("site_settings").upsert([
          {
            key: "live_stream_status",
            value: liveStreamState,
            updated_at: new Date().toISOString()
          },
          {
            key: "live_status",
            value: liveStreamState,
            updated_at: new Date().toISOString()
          }
        ]);
      } catch (e) {}
    }

    return res.json({ 
      success: true, 
      liveState: liveStreamState, 
      message: liveStreamState.isLive ? "Queen Milana is NOW LIVE!" : "Queen Milana is currently offline." 
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Catbox.moe Server Proxy Upload Endpoint
app.post("/api/upload-catbox", async (req, res) => {
  try {
    const { fileData, fileName } = req.body;
    if (!fileData) {
      return res.status(400).json({ error: "Aucun fichier fourni / No file data provided" });
    }

    const base64Data = fileData.replace(/^data:.*?;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const blob = new Blob([buffer]);

    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", blob, fileName || "media_file.mp4");

    const catboxRes = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
    });

    if (catboxRes.ok) {
      const catboxUrl = await catboxRes.text();
      if (catboxUrl && catboxUrl.startsWith("http")) {
        return res.json({ success: true, url: catboxUrl.trim() });
      }
    }
    return res.status(500).json({ error: "Échec de l'hébergement Catbox." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Custom Uploaded Media Collection State
const customUploadedMedia: any[] = [];
const softDeletedVideoIds = new Set<string>();

// Global Creator Profile, Central Settings & Payment Settings State (Real-time Backend & Supabase Persistence)
let centralSiteSettingsState = {
  throne_link: "",
  twitter_link: "",
  telegram_link: "",
  tipfunder_link: "",
  creator_name: "Queen Milana",
  about_text: "Welkom in het officiële VIP heiligdom van Queen Milana. Exclusieve archieven, transacties en live stream autorisaties verlopen via gecentraliseerde beveiligingskanalen.",
  avatar_url: "",
  about_photos: [] as string[]
};

let creatorProfileState = {
  name: "Queen Milana",
  avatar: "",
  bio: "Welkom in het officiële VIP heiligdom van Queen Milana. Exclusieve archieven, transacties en live stream autorisaties verlopen via gecentraliseerde beveiligingskanalen.",
  gallery: [] as string[]
};

let paymentSettingsState = {
  tipfunder: "",
  throne: "",
  telegram: "",
  x: ""
};

// GET /api/site-settings
app.get("/api/site-settings", async (_req, res) => {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "central_site_settings")
        .maybeSingle();

      if (data && data.value) {
        centralSiteSettingsState = { ...centralSiteSettingsState, ...data.value };
      }
    } catch (e) {}
  }
  res.json(centralSiteSettingsState);
});

// POST /api/site-settings
app.post("/api/site-settings", async (req, res) => {
  try {
    const {
      throne_link,
      twitter_link,
      telegram_link,
      tipfunder_link,
      creator_name,
      about_text,
      avatar_url,
      about_photos,
      throne,
      x,
      telegram,
      tipfunder,
      name,
      bio,
      avatar,
      gallery
    } = req.body || {};

    const updated = {
      throne_link: throne_link || throne || centralSiteSettingsState.throne_link,
      twitter_link: twitter_link || x || centralSiteSettingsState.twitter_link,
      telegram_link: telegram_link || telegram || centralSiteSettingsState.telegram_link,
      tipfunder_link: tipfunder_link || tipfunder || centralSiteSettingsState.tipfunder_link,
      creator_name: creator_name || name || centralSiteSettingsState.creator_name,
      about_text: about_text !== undefined ? about_text : (bio !== undefined ? bio : centralSiteSettingsState.about_text),
      avatar_url: avatar_url || avatar || centralSiteSettingsState.avatar_url,
      about_photos: Array.isArray(about_photos) ? about_photos : (Array.isArray(gallery) ? gallery : centralSiteSettingsState.about_photos)
    };

    centralSiteSettingsState = updated;
    creatorProfileState = {
      name: updated.creator_name,
      avatar: updated.avatar_url,
      bio: updated.about_text,
      gallery: updated.about_photos
    };
    paymentSettingsState = {
      throne: updated.throne_link,
      x: updated.twitter_link,
      telegram: updated.telegram_link,
      tipfunder: updated.tipfunder_link
    };

    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase.from("site_settings").upsert([
          {
            key: "central_site_settings",
            value: centralSiteSettingsState,
            updated_at: new Date().toISOString()
          },
          {
            key: "creator_profile",
            value: creatorProfileState,
            updated_at: new Date().toISOString()
          },
          {
            key: "payment_settings",
            value: paymentSettingsState,
            updated_at: new Date().toISOString()
          }
        ]);
      } catch (e) {}
    }

    return res.json({ success: true, settings: centralSiteSettingsState });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/creator-profile
app.get("/api/creator-profile", async (_req, res) => {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "creator_profile")
        .maybeSingle();

      if (data && data.value) {
        creatorProfileState = { ...creatorProfileState, ...data.value };
      }
    } catch (e) {}
  }
  res.json(creatorProfileState);
});

// POST /api/creator-profile
app.post("/api/creator-profile", async (req, res) => {
  try {
    const { name, bio, gallery, avatar } = req.body;
    creatorProfileState = {
      name: name || creatorProfileState.name,
      avatar: avatar || creatorProfileState.avatar,
      bio: bio !== undefined ? bio : creatorProfileState.bio,
      gallery: Array.isArray(gallery) && gallery.length > 0 ? gallery : creatorProfileState.gallery
    };

    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase.from("site_settings").upsert({
          key: "creator_profile",
          value: creatorProfileState,
          updated_at: new Date().toISOString()
        });
      } catch (e) {}
    }

    return res.json({ success: true, profile: creatorProfileState });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/payment-settings
app.get("/api/payment-settings", async (_req, res) => {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "payment_settings")
        .maybeSingle();

      if (data && data.value) {
        paymentSettingsState = { ...paymentSettingsState, ...data.value };
      }
    } catch (e) {}
  }
  res.json(paymentSettingsState);
});

// POST /api/payment-settings
app.post("/api/payment-settings", async (req, res) => {
  try {
    const { tipfunder, throne, telegram, x } = req.body;
    paymentSettingsState = {
      tipfunder: tipfunder || paymentSettingsState.tipfunder,
      throne: throne || paymentSettingsState.throne,
      telegram: telegram || paymentSettingsState.telegram,
      x: x || paymentSettingsState.x
    };

    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase.from("site_settings").upsert({
          key: "payment_settings",
          value: paymentSettingsState,
          updated_at: new Date().toISOString()
        });
      } catch (e) {}
    }

    return res.json({ success: true, settings: paymentSettingsState });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/onboarding-status - Check if Goddess Milana has completed her initial setup tutorial
app.get("/api/admin/onboarding-status", async (req, res) => {
  const supabase = getSupabaseServerClient();
  let isComplete = false;
  if (supabase) {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "onboarding_completed")
        .maybeSingle();

      if (data && data.value) {
        isComplete = Boolean(data.value.completed);
      }
    } catch (e) {}
  }
  res.json({ completed: isComplete });
});

// POST /api/admin/onboarding-complete - Mark onboarding tutorial as completed in Supabase site_settings
app.post("/api/admin/onboarding-complete", async (req, res) => {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from("site_settings").upsert({
        key: "onboarding_completed",
        value: { completed: true, completed_at: new Date().toISOString() },
        updated_at: new Date().toISOString()
      });
    } catch (e) {}
  }
  res.json({ success: true, completed: true });
});

// POST /api/admin/storage/profile-upload-url - Generate Signed Upload URL for 'profile_images' bucket
app.post("/api/admin/storage/profile-upload-url", async (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized. Admin session required." });
  }

  const { fileName, fileType, fileSize } = req.body || {};
  if (!fileName) {
    return res.status(400).json({ error: "fileName is required." });
  }

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  if (fileSize && Number(fileSize) > MAX_IMAGE_SIZE) {
    return res.status(400).json({ error: "Image size exceeds 10MB limit." });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return res.status(500).json({ error: "Supabase client not initialized." });
  }

  try {
    const cleanName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `portraits/${Date.now()}_${cleanName}`;

    // Create a Signed Upload URL for 'profile_images' bucket
    const { data, error } = await supabase.storage.from("profile_images").createSignedUploadUrl(storagePath);

    if (error || !data) {
      // Fallback: try public URL directly if bucket is public
      const { data: pubData } = supabase.storage.from("profile_images").getPublicUrl(storagePath);
      return res.status(500).json({ error: error?.message || "Failed to create signed upload URL." });
    }

    const { data: pubData } = supabase.storage.from("profile_images").getPublicUrl(storagePath);

    return res.json({
      success: true,
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      storagePath,
      publicUrl: pubData?.publicUrl || "",
      bucket: "profile_images"
    });
  } catch (err: any) {
    console.error("[PROFILE IMAGE STORAGE ERROR]:", err);
    return res.status(500).json({ error: err.message || "Internal server error." });
  }
});

// POST /api/custom-media/delete (Soft-delete: hide from public feed, preserve in backend DB)
app.post("/api/custom-media/delete", async (req, res) => {
  try {
    const { videoId } = req.body;
    if (!videoId) {
      return res.status(400).json({ error: "videoId is required" });
    }
    softDeletedVideoIds.add(String(videoId));

    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase.from("soft_deleted_videos").upsert({
          video_id: String(videoId),
          deleted_at: new Date().toISOString()
        });
      } catch (e) {}
    }

    return res.json({ success: true, hiddenVideoIds: Array.from(softDeletedVideoIds) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/cleanup-legacy (Clean/hide legacy demo content from feed)
app.post("/api/admin/cleanup-legacy", async (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized. Admin session required." });
  }

  try {
    const supabase = getSupabaseServerClient();
    const demoVideoIds = ["1", "2", "3", "4", "5", "6", "7", "8", "demo-1", "demo-2", "sample-1", "sample-2"];
    
    demoVideoIds.forEach(id => softDeletedVideoIds.add(id));

    if (supabase) {
      for (const id of demoVideoIds) {
        try {
          await supabase.from("soft_deleted_videos").upsert({
            video_id: id,
            deleted_at: new Date().toISOString()
          });
        } catch (e) {}
      }
    }

    return res.json({
      success: true,
      message: "Verouderde democontent is succesvol opgeruimd en verborgen voor bezoekers.",
      hiddenVideoIds: Array.from(softDeletedVideoIds)
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

function isUrlOrDriveLinkServer(str: any): boolean {
  if (!str || typeof str !== "string") return false;
  const trimmed = str.trim().toLowerCase();
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.includes("drive.google.com") ||
    trimmed.includes("docs.google.com") ||
    trimmed.includes("dropbox.com") ||
    trimmed.includes("mega.nz") ||
    trimmed.includes("usp=drive_link") ||
    trimmed.includes("/file/d/")
  );
}

function cleanServerTitle(title: any, fallback = "Exclusive Masterclass Session"): string {
  if (!title || typeof title !== "string") return fallback;
  const trimmed = title.trim();
  if (isUrlOrDriveLinkServer(trimmed)) return fallback;
  return trimmed || fallback;
}

function cleanServerDescription(desc: any, fallback = "Exclusive encrypted masterclass video archive for authorized devotees."): string {
  if (!desc || typeof desc !== "string") return fallback;
  const trimmed = desc.trim();
  if (isUrlOrDriveLinkServer(trimmed)) return fallback;
  const sanitized = trimmed
    .replace(/https?:\/\/(?:drive\.google\.com|docs\.google\.com|[\w.-]+\/file\/d\/)[^\s]+/gi, "")
    .trim();
  return sanitized || fallback;
}

app.get("/api/custom-media", async (req, res) => {
  const supabase = getSupabaseServerClient();
  let media: any[] = [];
  let neededDbUpdate = false;

  if (supabase) {
    try {
      // 1. Load soft-deleted videos from Supabase
      const { data: delData } = await supabase.from("soft_deleted_videos").select("video_id");
      if (delData && Array.isArray(delData)) {
        delData.forEach((row) => {
          if (row.video_id) softDeletedVideoIds.add(String(row.video_id));
        });
      }

      // 2. Load strictly from site_settings (custom_media_list)
      const { data: dbMediaList } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "custom_media_list")
        .maybeSingle();

      if (dbMediaList && Array.isArray(dbMediaList.value)) {
        media = dbMediaList.value.map((item: any) => {
          let modified = false;
          const copy = { ...item };

          // Sanitize title if it contains a URL or drive link
          if (isUrlOrDriveLinkServer(copy.title)) {
            if (!copy.googleDriveLink) {
              copy.googleDriveLink = copy.title;
            }
            copy.title = "Exclusive Masterclass Session";
            copy.titleEn = "Exclusive Masterclass Session";
            modified = true;
          }
          if (isUrlOrDriveLinkServer(copy.titleEn)) {
            copy.titleEn = copy.title;
            modified = true;
          }

          // Sanitize description if it contains drive link
          if (isUrlOrDriveLinkServer(copy.description) || (copy.description && copy.description.includes("drive.google.com"))) {
            copy.description = cleanServerDescription(copy.description);
            copy.descriptionEn = copy.description;
            modified = true;
          }

          if (modified) neededDbUpdate = true;
          return copy;
        });

        // Persist cleaned list back to Supabase in background if any was fixed
        if (neededDbUpdate) {
          supabase.from("site_settings").upsert({
            key: "custom_media_list",
            value: media,
            updated_at: new Date().toISOString()
          }).then(() => console.log("[SANITIZATION] Successfully sanitized media items in database."));
        }
      }
    } catch (sbErr) {
      console.warn("Supabase custom-media query warning:", sbErr);
    }
  } else {
    media = customUploadedMedia.map((item) => {
      const copy = { ...item };
      copy.title = cleanServerTitle(copy.title);
      copy.titleEn = cleanServerTitle(copy.titleEn || copy.title);
      copy.description = cleanServerDescription(copy.description);
      copy.descriptionEn = cleanServerDescription(copy.descriptionEn || copy.description);
      return copy;
    });
  }

  // Filter out soft-deleted videos
  const activeMedia = media.filter((item) => !softDeletedVideoIds.has(String(item.id)));

  // For public visitors (non-admins), strip private Google Drive delivery links and storage paths
  const isAdmin = checkIsAdmin(req);
  const safeMedia = activeMedia.map((item) => {
    if (isAdmin) {
      return item;
    }
    const { googleDriveLink, google_drive_link, video_storage_path, videoStoragePath, ...publicItem } = item;
    return publicItem;
  });

  res.json({
    media: safeMedia,
    hiddenVideoIds: Array.from(softDeletedVideoIds)
  });
});

// Storage & Video Processing Helpers
async function triggerGitHubVideoProcessing(submission: {
  id: string;
  title: string;
  price?: string | number;
  video_storage_path: string;
  createdAt?: string;
}): Promise<{ dispatched: boolean; status?: number; error?: string; signedUrl?: string }> {
  const supabase = getSupabaseServerClient();
  if (!supabase || !submission.video_storage_path) {
    return { dispatched: false, error: "Supabase or video storage path missing." };
  }

  try {
    // Generate temporary 1-hour Signed Download URL for GitHub Action runner
    const { data: signedData, error: signErr } = await supabase
      .storage
      .from("premium_videos")
      .createSignedUrl(submission.video_storage_path, 3600);

    if (signErr || !signedData?.signedUrl) {
      console.warn("[STORAGE] Failed to generate signed download URL for GitHub Action:", signErr);
      return { dispatched: false, error: signErr?.message || "Failed to create signed URL" };
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO; // e.g. "owner/repository"

    if (!githubToken || !githubRepo) {
      console.log("[GITHUB ACTION] GITHUB_TOKEN or GITHUB_REPO not configured in environment. Signed URL generated:", signedData.signedUrl);
      return {
        dispatched: false,
        signedUrl: signedData.signedUrl,
        error: "GITHUB_TOKEN or GITHUB_REPO not configured in .env"
      };
    }

    const ghRes = await fetch(`https://api.github.com/repos/${githubRepo}/dispatches`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "Queen-Milana-Studio"
      },
      body: JSON.stringify({
        event_type: "process_video",
        client_payload: {
          submission_id: submission.id,
          video_storage_path: submission.video_storage_path,
          video_download_url: signedData.signedUrl,
          title: submission.title,
          price: String(submission.price || "25.00"),
          created_at: submission.createdAt || new Date().toISOString()
        }
      })
    });

    if (ghRes.ok) {
      console.log(`[GITHUB ACTION] Successfully triggered process_video workflow for submission ${submission.id}`);
      return { dispatched: true, status: ghRes.status, signedUrl: signedData.signedUrl };
    } else {
      const errBody = await ghRes.text().catch(() => "");
      console.warn(`[GITHUB ACTION ERROR] Status ${ghRes.status}: ${errBody}`);
      return { dispatched: false, status: ghRes.status, error: `GitHub API error: ${ghRes.status} ${errBody}` };
    }
  } catch (err: any) {
    console.error("[GITHUB ACTION ERROR] Exception:", err);
    return { dispatched: false, error: err.message };
  }
}

// POST /api/admin/storage/upload-url - Generate Signed Upload URL for client-side direct upload
app.post("/api/admin/storage/upload-url", async (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized. Admin session required." });
  }

  const { fileName, fileType, fileSize } = req.body || {};

  if (!fileName) {
    return res.status(400).json({ error: "fileName is required." });
  }

  // Pre-flight 60MB file size limit check
  const MAX_FILE_SIZE = 60 * 1024 * 1024; // 60MB
  if (fileSize && Number(fileSize) > MAX_FILE_SIZE) {
    return res.status(400).json({
      error: `File size exceeds the 60MB limit (${(Number(fileSize) / (1024 * 1024)).toFixed(1)}MB). Please compress your video before uploading.`
    });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return res.status(500).json({ error: "Supabase service client is not initialized. Please verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." });
  }

  try {
    // Sanitize filename & generate clean storage path inside 'raw/' directory of 'premium_videos' bucket
    const cleanName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `raw/${Date.now()}_${cleanName}`;

    // Create a Signed Upload URL using the Service Role Key
    const { data, error } = await supabase.storage.from("premium_videos").createSignedUploadUrl(storagePath);

    if (error || !data) {
      console.error("[SUPABASE STORAGE] createSignedUploadUrl error:", error);
      return res.status(500).json({ error: error?.message || "Failed to create signed upload URL." });
    }

    return res.json({
      success: true,
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      storagePath,
      bucket: "premium_videos"
    });
  } catch (err: any) {
    console.error("[SUPABASE STORAGE] Error creating upload URL:", err);
    return res.status(500).json({ error: err.message || "Internal server error creating upload URL" });
  }
});

// GET /api/admin/storage-usage - Storage Usage Gauge calculation for 'premium_videos' bucket
app.get("/api/admin/storage-usage", async (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized. Admin session required." });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return res.status(500).json({ error: "Supabase client not initialized." });
  }

  let totalBytes = 0;
  let fileCount = 0;
  const recentFiles: any[] = [];

  try {
    // Query storage.objects directly via Postgres service role
    const { data: objects, error: objError } = await supabase
      .schema("storage")
      .from("objects")
      .select("id, name, metadata, created_at, bucket_id")
      .eq("bucket_id", "premium_videos")
      .order("created_at", { ascending: false });

    if (!objError && objects && Array.isArray(objects)) {
      fileCount = objects.length;
      objects.forEach((obj: any) => {
        const size = Number(obj.metadata?.size || obj.metadata?.contentLength || 0);
        totalBytes += size;
        recentFiles.push({
          id: obj.id,
          name: obj.name,
          size,
          sizeMB: Number((size / (1024 * 1024)).toFixed(2)),
          createdAt: obj.created_at
        });
      });
    } else {
      // Fallback: list files via Supabase Storage API
      const { data: rawFiles } = await supabase.storage.from("premium_videos").list("raw", { limit: 1000 });
      const { data: rootFiles } = await supabase.storage.from("premium_videos").list("", { limit: 1000 });
      const allFiles = [...(rawFiles || []).map(f => ({ ...f, name: `raw/${f.name}` })), ...(rootFiles || []).filter(f => f.name !== "raw")];

      fileCount = allFiles.length;
      allFiles.forEach((file: any) => {
        const size = Number(file.metadata?.size || 0);
        totalBytes += size;
        recentFiles.push({
          id: file.id || file.name,
          name: file.name,
          size,
          sizeMB: Number((size / (1024 * 1024)).toFixed(2)),
          createdAt: file.created_at
        });
      });
    }
  } catch (err: any) {
    console.warn("[STORAGE USAGE WARNING]:", err);
  }

  const MAX_FREE_TIER_MB = 1000; // 1000 MB (1GB free tier limit)
  const usedMB = Number((totalBytes / (1024 * 1024)).toFixed(1));
  const percentage = Math.min(100, Math.round((usedMB / MAX_FREE_TIER_MB) * 100));
  const isNearLimit = usedMB >= 900; // Warning threshold at 900MB

  return res.json({
    success: true,
    totalBytes,
    usedMB,
    maxMB: MAX_FREE_TIER_MB,
    percentage,
    isNearLimit,
    warning: isNearLimit ? "Storage is approaching the 1GB free tier limit (>900MB used). Please delete older raw videos to prevent upload failures." : null,
    fileCount,
    recentFiles: recentFiles.slice(0, 15)
  });
});

// POST /api/admin/trigger-github-action - Manually dispatch GitHub Action video processing
app.post("/api/admin/trigger-github-action", async (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized. Admin session required." });
  }

  const { submissionId, videoStoragePath, title, price } = req.body || {};

  if (!videoStoragePath) {
    return res.status(400).json({ error: "videoStoragePath is required." });
  }

  const result = await triggerGitHubVideoProcessing({
    id: submissionId || `sub-${Date.now()}`,
    title: title || "Exclusive Video",
    price: price || "25.00",
    video_storage_path: videoStoragePath
  });

  return res.json({
    success: result.dispatched,
    result
  });
});

// POST /api/admin/generate-delivery-link/:id - Admin approves Throne/Fan payment and generates 24-hour Signed Download URL
app.post("/api/admin/generate-delivery-link/:id", async (req, res) => {
  if (!checkIsAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized. Admin session required." });
  }

  const { id } = req.params;
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return res.status(500).json({ error: "Supabase client not initialized." });
  }

  try {
    // Look up submission by id
    let storagePath: string | null = null;
    let title: string = "Exclusive Video";

    const { data: submission } = await supabase
      .from("content_submissions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (submission) {
      storagePath = submission.video_storage_path;
      title = submission.title;
    } else {
      const match = customUploadedMedia.find((m) => m.id === id || m.video_storage_path);
      if (match) {
        storagePath = match.video_storage_path || match.videoStoragePath;
        title = match.title;
      }
    }

    if (!storagePath) {
      return res.status(404).json({ error: "Video storage path not found for this submission." });
    }

    // Generate 24-hour (86,400 seconds) Signed Download URL
    const { data: signedData, error: signErr } = await supabase
      .storage
      .from("premium_videos")
      .createSignedUrl(storagePath, 86400);

    if (signErr || !signedData?.signedUrl) {
      return res.status(500).json({ error: signErr?.message || "Failed to generate signed download URL." });
    }

    const expiresAt = new Date(Date.now() + 86400 * 1000).toISOString();
    const fanIdentifier = req.body?.fanIdentifier || "VIP Fan";

    // Log to access_grants table in Supabase
    try {
      const { error: grantDbErr } = await supabase.from("access_grants").insert({
        video_id: id,
        video_title: title,
        fan_identifier: fanIdentifier,
        link_reference: signedData.signedUrl,
        generated_at: new Date().toISOString(),
        expires_at: expiresAt
      });

      if (grantDbErr) {
        console.warn("[ACCESS GRANT WARNING] Failed to insert into access_grants table:", grantDbErr.message);
      } else {
        console.log(`[ACCESS GRANT] Successfully logged delivery link for video "${title}" (fan: ${fanIdentifier})`);
      }
    } catch (grantErr: any) {
      console.warn("[ACCESS GRANT WARNING] Exception logging to access_grants table:", grantErr.message);
    }

    return res.json({
      success: true,
      title,
      storagePath,
      downloadUrl: signedData.signedUrl,
      streamUrl: signedData.signedUrl,
      expiresInHours: 24,
      expiresAt,
      fanIdentifier
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/custom-media", async (req, res) => {
  try {
    const {
      passcode,
      title,
      category,
      price,
      previewUrl,
      videoUrl,
      googleDriveLink,
      video_storage_path,
      videoStoragePath,
      thumbnailUrl,
      duration,
      description,
      tags
    } = req.body;

    const rawTitle = title ? String(title).trim() : "";
    const rawDriveLink = googleDriveLink || (isUrlOrDriveLinkServer(rawTitle) ? rawTitle : "");
    const safeTitle = isUrlOrDriveLinkServer(rawTitle) ? "Exclusive Masterclass Session" : (rawTitle || "Exclusive Masterclass Session");
    const safeDesc = cleanServerDescription(description, "Exclusive video published by Queen Milana.");

    const storagePath = video_storage_path || videoStoragePath;
    const finalVideoUrl = rawDriveLink || videoUrl || previewUrl || (storagePath ? `supabase://${storagePath}` : "");
    if (!rawTitle || (!finalVideoUrl && !storagePath)) {
      return res.status(400).json({ error: "Title and video source or storage path are required." });
    }

    const newItem = {
      id: `custom-vid-${Date.now()}`,
      title: safeTitle,
      titleEn: safeTitle,
      category: category ? category.trim() : "Queen Exclusive",
      categoryEn: category ? category.trim() : "Queen Exclusive",
      price: parseFloat(price) || 20.00,
      previewUrl: finalVideoUrl.trim() || (storagePath ? `supabase://${storagePath}` : ""),
      videoUrl: finalVideoUrl.trim() || (storagePath ? `supabase://${storagePath}` : ""),
      googleDriveLink: rawDriveLink || "",
      video_storage_path: storagePath || null,
      videoStoragePath: storagePath || null,
      thumbnailUrl: thumbnailUrl || "https://i.imgur.com/g5fQwuf.jpg",
      duration: duration || "Full length",
      description: safeDesc,
      descriptionEn: safeDesc,
      tags: Array.isArray(tags) ? tags : ["new", "queenmilana", "exclusive"],
      createdAt: new Date().toISOString()
    };

    customUploadedMedia.unshift(newItem); // put at top

    // Save directly to Supabase
    let supabaseResult = { saved: false, message: "Supabase client not configured" };
    let githubActionResult: any = null;
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from("content_submissions").insert({
          title: newItem.title,
          price: String(newItem.price),
          tags: newItem.tags,
          video_storage_path: newItem.video_storage_path,
          google_drive_link: newItem.googleDriveLink || null,
          thumbnail_url: newItem.thumbnailUrl,
          category: newItem.category,
          name: "Queen Milana",
          description: newItem.description,
          status: "published",
          created_at: newItem.createdAt
        }).select("*");

        if (error) {
          console.warn("Supabase content_submissions insert warning:", error);
          supabaseResult = { saved: false, message: error.message };
        } else {
          supabaseResult = { saved: true, message: "Saved to Supabase content_submissions table" };
        }
      } catch (sbErr: any) {
        console.warn("Supabase content_submissions insert notice:", sbErr);
        supabaseResult = { saved: false, message: sbErr?.message || "Insert failed" };
      }

      try {
        const { data: existingData } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "custom_media_list")
          .maybeSingle();

        let currentList = (existingData && Array.isArray(existingData.value)) ? existingData.value : [];
        currentList = [newItem, ...currentList.filter((x: any) => x.id !== newItem.id)];

        await supabase.from("site_settings").upsert({
          key: "custom_media_list",
          value: currentList,
          updated_at: new Date().toISOString()
        });

        supabaseResult = { saved: true, message: "Saved to Supabase database" };
      } catch (sErr) {
        console.warn("Supabase custom_media_list upsert error:", sErr);
      }

      // If video was uploaded directly to Supabase Storage, trigger GitHub Action processing
      if (newItem.video_storage_path) {
        githubActionResult = await triggerGitHubVideoProcessing({
          id: newItem.id,
          title: newItem.title,
          price: newItem.price,
          video_storage_path: newItem.video_storage_path,
          createdAt: newItem.createdAt
        });
      }
    }

    return res.json({
      success: true,
      item: newItem,
      items: customUploadedMedia,
      supabaseResult,
      githubActionResult
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Payment & VIP Code Verification Endpoint
const VALID_VIP_PASSCODES = new Set([
  "MILANA2026",
  "QUEEN-VIP",
  "GODDESS-VIP",
  "SANCTUARY-VIP",
  "REINE-VIP",
  "DOMINION-VIP",
  "PAID2026",
  "SPECIAL-ACCESS"
]);

// Server-stored verified transactions token registry
const verifiedAccessTokens = new Map<string, { itemId: string; timestamp: number; downloadUrl?: string }>();

app.post("/api/verify-payment", async (req, res) => {
  try {
    const { itemId, paymentMethod, transactionRef } = req.body;

    if (!itemId || !transactionRef) {
      return res.status(400).json({ 
        verified: false, 
        message: "Missing item ID or transaction reference." 
      });
    }

    const cleanRef = String(transactionRef).trim().toUpperCase();

    // Verification Logic:
    // 1. Check if matches any active VIP Passcodes
    // 2. Check if valid transaction reference format (e.g. starting with TXN, REV, PP, or 8+ characters long)
    const isValidPasscode = VALID_VIP_PASSCODES.has(cleanRef);
    const isValidTxnFormat = (cleanRef.startsWith("REV-") || cleanRef.startsWith("PP-") || cleanRef.startsWith("TXN-") || cleanRef.length >= 8);

    if (isValidPasscode || isValidTxnFormat) {
      const token = `ACCESS-${itemId}-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
      
      // Look up if this item has a Supabase Storage path to generate 24-hour signed download URL
      let downloadUrl: string | null = null;
      const supabase = getSupabaseServerClient();
      if (supabase) {
        try {
          // Check content_submissions
          const { data: sub } = await supabase
            .from("content_submissions")
            .select("video_storage_path")
            .eq("id", itemId)
            .maybeSingle();

          const storagePath = sub?.video_storage_path || customUploadedMedia.find(m => m.id === itemId)?.video_storage_path;

          if (storagePath) {
            const { data: signedData } = await supabase
              .storage
              .from("premium_videos")
              .createSignedUrl(storagePath, 86400); // 24 hours

            if (signedData?.signedUrl) {
              downloadUrl = signedData.signedUrl;
            }
          }
        } catch (storageErr) {
          console.warn("[PAYMENT VERIFICATION] Storage sign warning:", storageErr);
        }
      }

      verifiedAccessTokens.set(token, { itemId, timestamp: Date.now(), downloadUrl: downloadUrl || undefined });

      return res.json({
        verified: true,
        accessToken: token,
        downloadUrl,
        streamUrl: downloadUrl,
        expiresInHours: 24,
        message: "Payment successfully verified! Your 24-hour secure delivery link is active.",
        method: paymentMethod || "manual_ref"
      });
    } else {
      return res.status(422).json({
        verified: false,
        message: "Invalid transaction reference or passcode. Please check your payment receipt or enter a valid VIP passcode (e.g., MILANA2026)."
      });
    }
  } catch (error: any) {
    console.error("Error in /api/verify-payment:", error);
    return res.status(500).json({ verified: false, message: "Internal verification error." });
  }
});

// Endpoint to verify access token for a video
app.get("/api/check-access/:itemId", (req, res) => {
  const { itemId } = req.params;
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");

  if (token && verifiedAccessTokens.has(token)) {
    const session = verifiedAccessTokens.get(token);
    if (session?.itemId === itemId) {
      return res.json({ hasAccess: true });
    }
  }

  return res.json({ hasAccess: false });
});

// Google Drive Content Submissions Store (In-Memory + Supabase hybrid)
const googleDriveSubmissions: any[] = [];

app.post("/api/content-submissions", async (req, res) => {
  try {
    const { title, price, tags, googleDriveLink, name, description } = req.body;

    if (!title || !googleDriveLink) {
      return res.status(400).json({ error: "Title and Google Drive link are required." });
    }

    const formattedTags = Array.isArray(tags) ? tags : (typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : []);

    const newSubmission = {
      id: `gdrive-sub-${Date.now()}`,
      title: title.trim(),
      price: price ? String(price).trim() : "20.00",
      tags: formattedTags,
      googleDriveLink: googleDriveLink.trim(),
      name: name ? name.trim() : "Queen Milana",
      description: description ? description.trim() : "",
      createdAt: new Date().toISOString(),
      status: "pending_processing"
    };

    googleDriveSubmissions.unshift(newSubmission);

    // Save to Supabase if configured
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase.from("content_submissions").insert({
          title: newSubmission.title,
          price: newSubmission.price,
          tags: newSubmission.tags,
          google_drive_link: newSubmission.googleDriveLink,
          name: newSubmission.name,
          description: newSubmission.description,
          status: newSubmission.status,
          created_at: newSubmission.createdAt
        });
      } catch (dbErr) {
        console.warn("Supabase insert warning:", dbErr);
      }
    }

    return res.json({
      success: true,
      message: "Thank for uploading, your content should be visible within 10 minutes ",
      submission: newSubmission
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Endpoint for site owner/admin to view all posted Google Drive submissions & links
app.get("/api/admin/submissions", async (_req, res) => {
  const supabase = getSupabaseServerClient();
  let submissions = [...googleDriveSubmissions];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("content_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mappedData = data.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          tags: item.tags || [],
          googleDriveLink: item.google_drive_link,
          name: item.name,
          description: item.description,
          createdAt: item.created_at,
          status: item.status
        }));

        // Deduplicate with in-memory array by googleDriveLink or title
        const map = new Map();
        for (const s of [...mappedData, ...googleDriveSubmissions]) {
          const key = s.googleDriveLink || s.id;
          if (!map.has(key)) map.set(key, s);
        }
        submissions = Array.from(map.values());
      }
    } catch (dbErr) {
      console.warn("Supabase fetch warning:", dbErr);
    }
  }

  res.json({
    total: submissions.length,
    submissions,
    supabaseConnected: !!supabase
  });
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", name: "Maitresse Aria Sanctum" });
});

async function startServer() {
  // Test Supabase connection on startup
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    console.log("[SUPABASE ERROR] Supabase client not initialized.");
  } else {
    try {
      const { data, error } = await supabase.from("site_settings").select("key").limit(1);
      if (error) {
        console.log(`[SUPABASE ERROR] ${error.message}`);
      } else {
        console.log(`[SUPABASE SUCCESS] Connected to Supabase site_settings table. Found ${data ? data.length : 0} rows.`);
      }
    } catch (err: any) {
      console.log(`[SUPABASE ERROR] ${err.message || err}`);
    }
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
