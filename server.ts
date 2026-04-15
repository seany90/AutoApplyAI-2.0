import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import * as admin from 'firebase-admin';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import Stripe from 'stripe';

// Lazy initialization helpers
let db: admin.firestore.Firestore | null = null;
function getDb() {
  if (!db) {
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'ai-studio-applet-webapp-f353e',
      });
    }
    db = admin.firestore();
  }
  return db;
}

let aiClient: GoogleGenAI | null = null;
function getAi() {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy' });
  }
  return aiClient;
}

let stripeClient: Stripe | null = null;
function getStripe() {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is missing");
    stripeClient = new Stripe(key, { apiVersion: '2025-02-24.acacia' as any });
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Copilot Generation Endpoint
  app.post("/api/copilot/generate", async (req, res) => {
    try {
      const { userId, jobDescription, url } = req.body;
      
      if (!userId) {
        return res.status(400).json({ success: false, error: "Missing userId" });
      }

      const firestore = getDb();
      const ai = getAi();

      // 1. Fetch user data (resume, profile)
      const userDoc = await firestore.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (!userData || !userData.resumeText) {
        return res.status(400).json({ success: false, error: "Please upload your resume first." });
      }

      // 2. Generate personalized content using Gemini
      const prompt = `
        You are an expert career coach and ATS optimization AI.
        Given the following user resume and job description, generate a highly personalized cover letter and answers to common application questions.
        Do NOT hallucinate. Only use facts from the user's resume.
        
        User Resume:
        ${userData.resumeText}
        
        Job Description:
        ${jobDescription}
        
        Output JSON format:
        {
          "coverLetter": "...",
          "answers": {
            "Why do you want to work here?": "...",
            "What is your greatest strength?": "..."
          },
          "matchScore": 92,
          "matchReasoning": "..."
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      let content;
      try {
        content = JSON.parse(response.text || "{}");
      } catch (e) {
        content = { error: "Failed to parse AI response" };
      }

      // 3. Save to Firestore
      await firestore.collection('users').doc(userId).collection('applications').add({
        url,
        jobDescription: jobDescription.substring(0, 500) + '...',
        content,
        status: 'Generated',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.json({ success: true, content });
    } catch (error: any) {
      console.error("Copilot generate error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
