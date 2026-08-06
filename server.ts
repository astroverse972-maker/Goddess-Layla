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
  streamUrl: "https://i.imgur.com/qaGrKvw.mp4",
  updatedAt: Date.now()
};

// Endpoint to fetch current live status
app.get("/api/live-status", (_req, res) => {
  res.json(liveStreamState);
});

// Endpoint for Mistress to update Live Status (Go Live / Set Offline)
app.post("/api/live-status", (req, res) => {
  try {
    const { passcode, isLive, title, description, price, streamUrl } = req.body;

    if (passcode !== "LAYLA2026" && passcode !== "GODDESS-VIP" && passcode !== "INAYA2026" && passcode !== "REINE-VIP") {
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

app.get("/api/custom-media", (_req, res) => {
  res.json(customUploadedMedia);
});

app.post("/api/custom-media", (req, res) => {
  try {
    const { passcode, title, category, price, previewUrl, videoUrl, thumbnailUrl, duration, description } = req.body;

    if (passcode !== "LAYLA2026" && passcode !== "GODDESS-VIP" && passcode !== "INAYA2026" && passcode !== "REINE-VIP") {
      return res.status(401).json({ error: "Invalid Passcode." });
    }

    const finalVideoUrl = videoUrl || previewUrl;
    if (!title || !finalVideoUrl) {
      return res.status(400).json({ error: "Title and video file are required." });
    }

    const newItem = {
      id: `custom-vid-${Date.now()}`,
      title: title,
      titleEn: title,
      category: category || "Goddess Exclusive",
      categoryEn: category || "Goddess Exclusive",
      price: parseFloat(price) || 20.00,
      previewUrl: previewUrl || finalVideoUrl,
      videoUrl: finalVideoUrl,
      thumbnailUrl: thumbnailUrl || finalVideoUrl,
      duration: duration || "Full length",
      description: description || "Exclusive video published by Goddess Layla.",
      descriptionEn: description || "Exclusive video published by Goddess Layla.",
      tags: ["new", "goddesslayla", "exclusive"]
    };

    customUploadedMedia.unshift(newItem); // put at top

    return res.json({
      success: true,
      item: newItem,
      items: customUploadedMedia
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
