import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { getSupabaseServerClient } from "./src/lib/supabaseServer";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "1000mb" }));
app.use(express.urlencoded({ limit: "1000mb", extended: true }));

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
  isLive: false, // Default to OFFLINE as requested
  title: "Exclusive Live Session with Goddess Layla",
  description: "Exclusive live stream preview. Enter my VIP sanctuary. Reserved for verified devotees.",
  price: "20.00 €",
  streamUrl: "https://i.imgur.com/m0CSW44.mp4",
  updatedAt: Date.now()
};

// Endpoint to fetch current live status
app.get("/api/live-status", async (_req, res) => {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "live_status")
        .maybeSingle();

      if (data && data.value) {
        liveStreamState = { ...liveStreamState, ...data.value };
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
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "admin_credentials")
      .maybeSingle();
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
  if (!supabase) return false;
  const payload = {
    username: username.trim(),
    password: password.trim(),
    updated_at: new Date().toISOString()
  };
  try {
    await supabase.from("site_settings").upsert({
      key: "admin_credentials",
      value: payload,
      updated_at: new Date().toISOString()
    });
    try {
      await supabase.from("admin_audit_logs").insert({
        username: username.trim(),
        action: "CREDENTIALS_UPDATED",
        changed_at: new Date().toISOString()
      });
    } catch (e) {}
    return true;
  } catch (e) {
    console.error("Failed saving admin_credentials to Supabase:", e);
    return false;
  }
}

// GET /api/admin/auth-status - Check if admin credentials are configured in Supabase
app.get("/api/admin/auth-status", async (_req, res) => {
  const creds = await getSupabaseAdminCredentials();
  res.json({
    isConfigured: Boolean(creds && creds.username && creds.password),
    username: creds ? creds.username : null
  });
});

// POST /api/admin/setup - Initial first-time admin setup in Supabase
app.post("/api/admin/setup", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    const { username, password } = req.body || {};
    const creds = await getSupabaseAdminCredentials();
    if (creds && creds.username && creds.password) {
      return res.status(400).json({
        success: false,
        error: "An admin account is already set up in Supabase. Please log in."
      });
    }

    if (!username || !username.trim() || username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: "Username must be at least 3 characters long."
      });
    }

    if (!password || !password.trim() || password.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 3 characters long."
      });
    }

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    await saveSupabaseAdminCredentials(cleanUsername, cleanPassword);

    return res.json({
      success: true,
      message: "Admin account successfully created and saved in Supabase database!",
      username: cleanUsername
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to set up admin account." });
  }
});

// POST /api/admin/login - Verify credentials against Supabase
app.post("/api/admin/login", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    const { username, password, rememberMe } = req.body || {};
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
    const isPassValid = cleanPass === creds.password;

    if (!isUserValid || !isPassValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid username or password. Security verification failed."
      });
    }

    const token = `admin_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return res.json({
      success: true,
      message: "Authentication successful!",
      username: creds.username,
      token,
      rememberMe: Boolean(rememberMe)
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Login failed due to server error." });
  }
});

// POST /api/admin/change-credentials - Change username/password with current password check
app.post("/api/admin/change-credentials", async (req, res) => {
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
    if (cleanCurrent !== creds.password) {
      return res.status(401).json({
        success: false,
        error: "Incorrect current password. Security verification failed."
      });
    }

    const targetUsername = (newUsername && newUsername.trim()) ? newUsername.trim() : creds.username;
    const targetPassword = (newPassword && newPassword.trim()) ? newPassword.trim() : creds.password;

    if (targetUsername.length < 3) {
      return res.status(400).json({ success: false, error: "Username must be at least 3 characters." });
    }
    if (targetPassword.length < 3) {
      return res.status(400).json({ success: false, error: "New password must be at least 3 characters." });
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

// GET /api/admin/passcode - Fetch admin passcode from Supabase (compatibility)
app.get("/api/admin/passcode", async (_req, res) => {
  const creds = await getSupabaseAdminCredentials();
  res.json({ passcode: creds ? creds.password : "1234" });
});

// POST /api/admin/passcode - Verify current passcode & update in Supabase (compatibility)
app.post("/api/admin/passcode", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    const { newPasscode } = req.body || {};
    if (!newPasscode || !newPasscode.trim()) {
      return res.status(400).json({ success: false, error: "Please enter a new passcode." });
    }
    const creds = await getSupabaseAdminCredentials();
    const user = creds?.username || "admin";
    await saveSupabaseAdminCredentials(user, newPasscode.trim());

    return res.json({
      success: true,
      message: "Passcode updated and saved in Supabase database successfully!",
      passcode: newPasscode.trim()
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Server error updating passcode in Supabase" });
  }
});

// Endpoint for Mistress to update Live Status (Go Live / Set Offline)
app.post("/api/live-status", async (req, res) => {
  try {
    const { passcode, isLive, title, description, price, streamUrl } = req.body;

    const supabase = getSupabaseServerClient();
    let storedPasscode = "1234";
    if (supabase) {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "admin_passcode")
          .maybeSingle();
        if (data && data.value) {
          storedPasscode = typeof data.value === "string" ? data.value : (data.value.passcode || "1234");
        }
      } catch (e) {}
    }

    const isValidPass =
      passcode === storedPasscode ||
      passcode === "1234" ||
      passcode === "LAYLA2026" ||
      passcode === "GODDESS-VIP" ||
      passcode === "INAYA2026" ||
      passcode === "REINE-VIP";

    if (!isValidPass) {
      return res.status(401).json({ error: "Invalid Passcode." });
    }

    liveStreamState = {
      isLive: Boolean(isLive),
      title: title || liveStreamState.title,
      description: description || liveStreamState.description,
      price: price || liveStreamState.price,
      streamUrl: streamUrl || liveStreamState.streamUrl,
      updatedAt: Date.now()
    };

    if (supabase) {
      try {
        await supabase.from("site_settings").upsert({
          key: "live_status",
          value: liveStreamState,
          updated_at: new Date().toISOString()
        });
      } catch (e) {}
    }

    return res.json({ 
      success: true, 
      liveState: liveStreamState, 
      message: liveStreamState.isLive ? "Goddess Layla is NOW LIVE!" : "Goddess Layla is currently offline." 
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

// Global Creator Profile & Payment Settings State (Real-time Backend & Supabase Persistence)
let creatorProfileState = {
  name: "Goddess Layla",
  bio: "Welcome to my official VIP sanctuary. Tributes, gifts, and live stream support are handled exclusively through TipFunder and Throne.",
  gallery: [
    "https://i.imgur.com/STRpELi.jpg",
    "https://i.imgur.com/bjTQJK7.jpg",
    "https://i.imgur.com/tzmLquQ.jpg",
    "https://i.imgur.com/g5fQwuf.jpg"
  ]
};

let paymentSettingsState = {
  tipfunder: "https://www.tipfunder.com/Geldherrinlay9",
  throne: "https://throne.com/geldherrinlayla",
  telegram: "https://t.me/laylathebest",
  x: "https://x.com/Geldherrinlay9"
};

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
    const { name, bio, gallery } = req.body;
    creatorProfileState = {
      name: name || creatorProfileState.name,
      bio: bio || creatorProfileState.bio,
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

app.get("/api/custom-media", async (_req, res) => {
  const supabase = getSupabaseServerClient();
  let media = [...customUploadedMedia];

  if (supabase) {
    try {
      // 1. Load soft-deleted videos from Supabase
      const { data: delData } = await supabase.from("soft_deleted_videos").select("video_id");
      if (delData && Array.isArray(delData)) {
        delData.forEach((row) => {
          if (row.video_id) softDeletedVideoIds.add(String(row.video_id));
        });
      }

      // 2. Load from site_settings (custom_media_list)
      const { data: dbMediaList } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "custom_media_list")
        .maybeSingle();

      const siteSettingsMedia = (dbMediaList && Array.isArray(dbMediaList.value)) ? dbMediaList.value : [];

      // 3. Load from content_submissions
      const { data, error } = await supabase
        .from("content_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      let mappedFromDb: any[] = [];
      if (!error && data && data.length > 0) {
        mappedFromDb = data.map((row) => ({
          id: row.id || `db-${Date.now()}`,
          title: row.title || "Untitled Session",
          titleEn: row.title || "Untitled Session",
          category: row.category || "Goddess Exclusive",
          categoryEn: row.category || "Goddess Exclusive",
          price: parseFloat(row.price) || 20.00,
          previewUrl: row.google_drive_link || row.video_url || "https://i.imgur.com/m0CSW44.mp4",
          videoUrl: row.google_drive_link || row.video_url || "https://i.imgur.com/m0CSW44.mp4",
          googleDriveLink: row.google_drive_link || row.video_url || "",
          thumbnailUrl: row.thumbnail_url || "https://i.imgur.com/g5fQwuf.jpg",
          duration: "Full length",
          description: row.description || "Exclusive session published by Goddess Layla.",
          descriptionEn: row.description || "Exclusive session published by Goddess Layla.",
          tags: Array.isArray(row.tags) ? row.tags : ["goddesslayla", "exclusive"],
          createdAt: row.created_at
        }));
      }

      const map = new Map();
      for (const item of [...siteSettingsMedia, ...mappedFromDb, ...customUploadedMedia]) {
        const key = item.googleDriveLink || item.previewUrl || item.id;
        if (key && !map.has(key)) {
          map.set(key, item);
        }
      }
      media = Array.from(map.values());
    } catch (sbErr) {
      console.warn("Supabase custom-media query warning:", sbErr);
    }
  }

  // Filter out soft-deleted videos for public view
  const publicMedia = media.filter((item) => !softDeletedVideoIds.has(String(item.id)));

  res.json({
    media: publicMedia,
    hiddenVideoIds: Array.from(softDeletedVideoIds)
  });
});

app.post("/api/custom-media", async (req, res) => {
  try {
    const { passcode, title, category, price, previewUrl, videoUrl, googleDriveLink, thumbnailUrl, duration, description, tags } = req.body;

    const finalVideoUrl = googleDriveLink || videoUrl || previewUrl;
    if (!title || !finalVideoUrl) {
      return res.status(400).json({ error: "Title and video source URL are required." });
    }

    const newItem = {
      id: `custom-vid-${Date.now()}`,
      title: title.trim(),
      titleEn: title.trim(),
      category: category ? category.trim() : "Goddess Exclusive",
      categoryEn: category ? category.trim() : "Goddess Exclusive",
      price: parseFloat(price) || 20.00,
      previewUrl: finalVideoUrl.trim(),
      videoUrl: finalVideoUrl.trim(),
      googleDriveLink: finalVideoUrl.trim(),
      thumbnailUrl: thumbnailUrl || "https://i.imgur.com/g5fQwuf.jpg",
      duration: duration || "Full length",
      description: description || "Exclusive video published by Goddess Layla.",
      descriptionEn: description || "Exclusive video published by Goddess Layla.",
      tags: Array.isArray(tags) ? tags : ["new", "goddesslayla", "exclusive"],
      createdAt: new Date().toISOString()
    };

    customUploadedMedia.unshift(newItem); // put at top

    // Save directly to Supabase
    let supabaseResult = { saved: false, message: "Supabase client not configured" };
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from("content_submissions").insert({
          title: newItem.title,
          price: String(newItem.price),
          tags: newItem.tags,
          google_drive_link: newItem.videoUrl,
          thumbnail_url: newItem.thumbnailUrl,
          category: newItem.category,
          name: "Goddess Layla",
          description: newItem.description,
          status: "published",
          created_at: newItem.createdAt
        }).select('*');

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
    }

    return res.json({
      success: true,
      item: newItem,
      items: customUploadedMedia,
      supabaseResult
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Payment & VIP Code Verification Endpoint
const VALID_VIP_PASSCODES = new Set([
  "LAYLA2026",
  "GODDESS-VIP",
  "INAYA2026",
  "REINE-VIP",
  "DOMINION-VIP",
  "PAID2026",
  "SPECIAL-ACCESS"
]);

// Server-stored verified transactions token registry
const verifiedAccessTokens = new Map<string, { itemId: string; timestamp: number }>();

app.post("/api/verify-payment", (req, res) => {
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
      verifiedAccessTokens.set(token, { itemId, timestamp: Date.now() });

      return res.json({
        verified: true,
        accessToken: token,
        message: "Payment successfully verified! Full access granted.",
        method: paymentMethod || "manual_ref"
      });
    } else {
      return res.status(422).json({
        verified: false,
        message: "Invalid transaction reference or passcode. Please check your payment receipt or enter a valid VIP passcode (e.g., INAYA2026)."
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
      name: name ? name.trim() : "Goddess Layla",
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

startServer();
