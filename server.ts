import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import NodeCache from 'node-cache';
import nodemailer from 'nodemailer';
import { buildKnowledgeBase, retrieveRelevantContext, invalidateRAGCache } from './ragService';

dotenv.config();

const PORT = 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

// Nodemailer SMTP Transporter Setup
function getSMTPConfig() {
  const host = (process.env.SMTP_HOST || process.env.VITE_SMTP_HOST || 'smtp.gmail.com').trim();
  const portStr = process.env.SMTP_PORT || process.env.VITE_SMTP_PORT || '587';
  const port = parseInt(portStr.trim() || '587');
  const secure = port === 465;
  const user = (process.env.SMTP_USER || process.env.VITE_SMTP_USER || '').trim();
  const rawPass = process.env.SMTP_PASS || process.env.VITE_SMTP_PASS || '';
  
  // Gmail app passwords usually display 16 letters grouped in 4-character blocks with spaces (e.g. 'xxxx xxxx xxxx xxxx').
  // We strip all whitespace to make it work seamlessly, even if pasted with spaces!
  const pass = rawPass.replace(/\s+/g, '');

  console.log(`[SMTP Config Diagnostics] Host: "${host}", Port: ${port}, Secure: ${secure}, SMTP_USER len: ${user.length}, SMTP_PASS len: ${pass.length}`);

  return { host, port, secure, user, pass };
}

function getTransporter() {
  const { host, port, secure, user, pass } = getSMTPConfig();
  
  const transportConfig: any = {
    auth: {
      user,
      pass,
    },
    tls: {
      // Do not fail on self-signed/unauthorized certificates
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    connectionTimeout: 10000,  // 10s connection timeout for reliable cold-start delivery on serverless platforms
    greetingTimeout: 10000,    // 10s greeting timeout
    socketTimeout: 15000,      // 15s socket inactivity timeout
    logger: true,              // Log connection data to server console
    debug: true                // Detailed debug info for troubleshooting
  };

  // If using Gmail, use the official built-in service definition for absolute reliability
  if (host.toLowerCase().includes('gmail') || host.toLowerCase().includes('googlemail')) {
    transportConfig.service = 'gmail';
  } else {
    transportConfig.host = host;
    transportConfig.port = port;
    transportConfig.secure = secure;
  }

  return nodemailer.createTransport(transportConfig);
}

// Helper to format and send the complete chat transcript
async function sendTranscriptEmail(sessionId: string, titleLine: string, leadData: any, messages: any[]) {
  const { user: emailUser, pass: emailPass } = getSMTPConfig();

  const conversationHtml = messages.map(m => {
    const sender = m.role === 'user' ? 'Visitor' : 'Sankalp\'s Representative';
    const bg = m.role === 'user' ? '#f3f4f6' : '#eff6ff';
    const border = m.role === 'user' ? '#e5e7eb' : '#bfdbfe';
    const color = m.role === 'user' ? '#1f2937' : '#1e3a8a';

    return `
      <div style="margin-bottom: 12px; padding: 12px 16px; background-color: ${bg}; border: 1px solid ${border}; border-radius: 8px; color: ${color}; font-family: sans-serif;">
        <strong style="display: block; font-size: 11px; text-transform: uppercase; margin-bottom: 4px; color: #4b5563;">${sender}</strong>
        <div style="font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${m.content}</div>
      </div>
    `;
  }).join('');

  const leadHtml = leadData ? `
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-family: sans-serif; font-size: 14px;">
      <tr style="background-color: #2563eb; color: white;">
        <th colspan="2" style="padding: 12px; text-align: left; border-radius: 6px 6px 0 0;">RECRUITER LEAD DETAILS</th>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; width: 33%;">Recruiter Name</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;">${leadData.recruiterName || 'Not shared yet'}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Company Name</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;">${leadData.companyName || 'Not shared yet'}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Email / Contact</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;">${leadData.email || 'Not shared yet'}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Role Details</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;">${leadData.roleDetails || 'Not shared yet'}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Location</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;">${leadData.location || 'Not shared yet'}</td>
      </tr>
    </table>
  ` : '<p style="font-family: sans-serif; color: #dc2626; font-weight: bold;">No explicit recruiter lead details collected.</p>';

  const mailOptions = {
    from: `"Sankalp's Representative" <${emailUser || 'noreply@portfolio.com'}>`,
    to: 'sankalpsmn@gmail.com',
    subject: `[AI Portfolio Chatbot] ${titleLine}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif; line-height: 1.5; color: #1f2937;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">New Representative Chat Transcript</h2>
        <p style="font-size: 14px; color: #4b5563;">
          A visitor has interacted with your AI representative at <strong>${new Date().toLocaleString()}</strong>.<br/>
          Session ID: <code style="background-color: #f3f4f6; padding: 2px 4px; border-radius: 4px;">${sessionId}</code>
        </p>

        ${leadHtml}

        <h3 style="color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">CONVERSATION HISTORY</h3>
        <div style="margin-top: 12px;">
          ${conversationHtml}
        </div>

        <footer style="margin-top: 32px; font-size: 11px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          System representative chatbot designed for Sankalp Suman.
        </footer>
      </div>
    `,
  };

  if (!emailUser || !emailPass) {
    throw new Error('SMTP credentials (SMTP_USER/SMTP_PASS) are not configured in your environment variables.');
  }

  await getTransporter().sendMail(mailOptions);
  return true;
}

// Helper to format and send contact form inquiry email
async function sendInquiryEmail(name: string, email: string, message: string) {
  const { user: emailUser, pass: emailPass } = getSMTPConfig();

  const mailOptions = {
    from: `"Sankalp's Portfolio" <${emailUser || 'noreply@portfolio.com'}>`,
    to: 'sankalpsmn@gmail.com',
    subject: `🚨 [Portfolio Inquiry] New message from ${name}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif; line-height: 1.5; color: #1f2937;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">New Message Submission</h2>
        <p style="font-size: 14px; color: #4b5563;">
          A visitor has left a message on your portfolio contact form at <strong>${new Date().toLocaleString()}</strong>.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; width: 30%; font-family: sans-serif;">Name</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb; font-family: sans-serif;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; font-family: sans-serif;">Email</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb; font-family: sans-serif;"><a href="mailto:${email}">${email}</a></td>
          </tr>
        </table>
        <h3 style="color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; font-family: sans-serif;">MESSAGE CONTENT</h3>
        <div style="background-color: #f3f4f6; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: sans-serif; font-size: 14px; white-space: pre-wrap; color: #1f2937; margin-top: 12px;">${message}</div>
        <footer style="margin-top: 32px; font-size: 11px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px; font-family: sans-serif;">
          Designed for Sankalp Suman.
        </footer>
      </div>
    `,
  };

  if (!emailUser || !emailPass) {
    throw new Error('SMTP credentials (SMTP_USER/SMTP_PASS) are not configured in your environment variables.');
  }

  await getTransporter().sendMail(mailOptions);
  return true;
}

// Server-side cache for SEO and settings
const metadataCache = new NodeCache({ stdTTL: 60 }); // 1 minute cache

// Initialize Firebase for server-side metadata fetching
let firebaseConfig: any;
try {
  firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8'));
} catch (e) {
  console.warn('Firebase config not found for server-side SEO');
}

let firebaseApp: any = null;
let db: any = null;

if (firebaseConfig) {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
  } catch (error) {
    console.error('Failed to initialize Firebase SDK server-side:', error);
  }
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function generateContentWithFallback(aiInstance: any, params: any) {
  const requestedModel = params.model || "gemini-3.5-flash";
  const modelsToTry = [requestedModel];
  if (requestedModel !== "gemini-3.1-flash-lite") {
    modelsToTry.push("gemini-3.1-flash-lite");
  }
  
  let lastError: any = null;

  for (const model of modelsToTry) {
    const maxRetries = 2;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Gemini Backend] Calling generateContent with model: ${model} (attempt ${attempt}/${maxRetries})`);
        const response = await aiInstance.models.generateContent({
          ...params,
          model,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const errStatus = err?.status;
        console.log(`[Gemini Backend Info] Model ${model} busy on attempt ${attempt}. Checking fallbacks...`);

        const isTransient = 
          errStatus === 503 || 
          errStatus === 429 || 
          errMsg.includes("503") || 
          errMsg.includes("429") || 
          errMsg.toLowerCase().includes("unavailable") || 
          errMsg.toLowerCase().includes("high demand") ||
          errMsg.toLowerCase().includes("overloaded");

        if (!isTransient) {
          break;
        }

        if (attempt < maxRetries) {
          const delay = attempt * 1200;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }

  throw lastError || new Error("Failed to generate content after attempting fallbacks");
}

export const app = express();

// A simple, safe logging middleware to help debug API requests on Vercel or locally
app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    console.log(`[API Request] ${req.method} ${req.url}`);
  }
  next();
});

// Standard, fully-compatible Express body parsing middleware for all environments with a generous size limit
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

export let initPromise: Promise<void> | null = null;

async function startServer() {
  const dispatchedSessions = new Set<string>();

  // RAG content synchronization endpoint
  app.post('/api/chat/sync', async (req, res) => {
    try {
      await invalidateRAGCache();
      await buildKnowledgeBase(db, ai);
      res.json({ success: true, message: 'Chatbot RAG knowledge base successfully re-indexed from current Firestore state.' });
    } catch (error: any) {
      console.error('[RAG Sync] Failed re-initializing knowledge database index:', error);
      res.status(500).json({ error: error?.message || 'Re-indexing failed' });
    }
  });

  app.post('/api/chat/message', async (req, res) => {
    try {
      const { messages } = req.body || {};

      if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      }

      if (!Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages must be an array of conversation items.' });
      }

      // Map roles correctly for context and feed full conversational text formatting
      const conversationHistory = messages.map(m => {
        return `${m.role === 'user' ? 'Visitor' : 'Sankalp\'s Representative'}: ${m.content}`;
      }).join('\n');

      // 1. EXTRACT LATEST QUERY
      const userMessages = messages.filter((m: any) => m.role === 'user');
      const latestQuery = userMessages.length > 0 ? userMessages[userMessages.length - 1].content : '';

      // 2. RETRIEVE RELEVANT CONTEXT (RAG Semantic Search)
      const retrievedContext = await retrieveRelevantContext(latestQuery, ai, db);

      // 3. COMPOSE SYSTEM PROMPT WITH SECURE COMPREHENSIVE CONTEXT
      const systemPrompt = `You are Sankalp Suman’s premium professional Manager and Digital Representative based in India, acting as a real-world human liaison on Sankalp Suman's portfolio.

Your prime directive is to respond in a highly professional, conversational, and natural human tone. While you should prioritize the verified portfolio context retrieved from Sankalp's digital assets, you are ALSO fully empowered to answer any questions or general inquiries using your own general knowledge and QA industry understanding.

STRICT CONTEXT-DRIVEN KNOWLEDGE BASE (Use this to answer specifics about Sankalp):
---
${retrievedContext}
---

SANKALP'S PROFILE SETTINGS FOR THE CHATBOT:
- **Notice Period**: 1 month / negotiable (comfortable with transitional timelines).
- **Relocation**: Globally open! Highly enthusiastic to work or relocate to India, Germany 🇩🇪, USA 🇺🇸, or any other global destination.
- **Salary/Package Expectations**: Highly competitive, open to discussion depending on location, cost of living index, and comprehensive relocation/visa support package.
- **Visa Sponsorship**: Welcomes opportunities with or without visa sponsorship, and is globally adaptable.
- **Geography**: COMPLETELY GLOBAL (fully open to roles based in India, USA, Germany, or other international locations).

RULES FOR OPERATION and ANSWER COMPOSITION (CRITICAL FOR TONE):
1. Base specific answers regarding Sankalp's experience, contact info, projects, and roles on the retrieved context above.
2. If the user asks general technical, software testing, Agile/Scrum, QA methodology, or miscellaneous knowledge-based questions not explicitly covered in Sankalp's specific context, use your own intelligence and industry understanding to provide helpful, comprehensive, and highly professional answers on his behalf.
3. If the question is about Sankalp himself but you don't find it in the context, do NOT refuse rigidly. Instead, answer using your best professional estimation, or kindly guide them to contact Sankalp directly at sankalpsmn@gmail.com while offering whatever helpful related insights you can.
4. STRICT HUMAN TONALITY REQUIREMENT: Speak EXACTLY like a highly polished, warm professional human colleague or manager from India representing Sankalp Suman.
   - Do NOT use typical AI or assistant phrasing (Avoid: "Certainly, here is the information", "Let me assist you", "As an AI...", "I do not have access to real-time...", "Delve", "Furthermore", "In summary").
   - Use warm, polite, and direct conversational Indian-English business phrasing (e.g., "Hi! Glad to connect with you.", "Sankalp has been doing some fantastic work leading the testing team at Amdocs in Gurgaon.", "Yes, absolutely! He's completed both ISTQB and CSM certifications and has a very strong command over Selenium and API testing.").
   - Sound genuine, respectful, highly skilled, and straightforward. Write in natural and readable sentences with professional humility and high technical authority.
   - Refer to Sankalp in the third person (e.g., "Sankalp", "he", "his") as his manager/liaison.
5. Highlight relocations, career interests in India & global hubs (USA/Germany/etc.), Scrum Master qualifications (ISTQB/Scrum Master CSM), and invite the user to schedule an interview using the built-in "Book Interview" scheduler link. Mention that recruiters can automatically generate/download his customized, professionally translated, and formatted ATS-friendly resume/CV in French, German, Hindi, or English by clicking the 'Generate AI Resume' button in the Hero section of the portfolio homepage!
6. Recruiters: If keywords like "hiring", "interview", "opportunity", "role", "job", "salary", "relocation", "sponsorship" are mentioned in the conversation, politely ask for recruiter's contact details (Name, Company, Contact Email, Location, Role Details) so Sankalp can follow up.

RESPOND WITH THE FOLLOWING JSON FORMAT ONLY:
{
  "reply": "Your markdown-formatted text response goes here",
  "isRecruiterLead": true if visitor is offering a job, representing a recruiter, or inquiring about hiring details, else false,
  "leadData": {
    "recruiterName": "extracted recruiter name, can be null or empty",
    "companyName": "extracted company name, can be null or empty",
    "email": "extracted contact email, can be null or empty",
    "roleDetails": "extracted role title/details, can be null or empty",
    "location": "extracted location/opportunities info, can be null or empty"
  }
}`;

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: `${systemPrompt}\n\nClient Conversation History:\n${conversationHistory}\n\nAssess this conversation, and respond in the required JSON format. Provide the next reply.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: "The chatbot's text or markdown response to the user. Keep it natural, conversational, polite and highly structured on retrieved info."
              },
              isRecruiterLead: {
                type: Type.BOOLEAN,
                description: "Set to true if user messages indicate they are a recruiter, hiring manager, or looking to hire."
              },
              leadData: {
                type: Type.OBJECT,
                description: "Extracted recruiter details so far. Keep any existing values if and only if they are confirmable, or extract new ones as they appear in user messages.",
                properties: {
                  recruiterName: { type: Type.STRING },
                  companyName: { type: Type.STRING },
                  email: { type: Type.STRING },
                  roleDetails: { type: Type.STRING },
                  location: { type: Type.STRING }
                }
              }
            },
            required: ["reply", "isRecruiterLead"]
          }
        }
      });

      const text = response.text || '{}';
      const data = JSON.parse(text.trim() || '{}');
      res.json(data);
    } catch (error: any) {
      console.error('Gemini API Error in chat:', error);
      res.status(500).json({ error: error?.message || 'Failed to generate chat response' });
    }
  });

  app.post('/api/chat/email', async (req, res) => {
    try {
      const { sessionId, leadData, messages, force } = req.body || {};

      if (!sessionId || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Session ID and a valid conversation are required.' });
      }

      // Check if we've already dispatched this session unless force is true
      if (dispatchedSessions.has(sessionId) && !force) {
        return res.json({ success: true, message: 'Email already dispatched for this session.' });
      }

      const isLead = leadData && (leadData.recruiterName || leadData.companyName || leadData.email);
      const titleLine = isLead 
        ? `🚨 Recruiter Lead from ${leadData.recruiterName || 'AnonymousRecruiter'} at ${leadData.companyName || 'Unknown Corp'}`
        : `💬 Portfolio chat transcript session: ${sessionId.slice(0, 8)}`;

      const mailed = await sendTranscriptEmail(sessionId, titleLine, leadData, messages);
      
      dispatchedSessions.add(sessionId);
      res.json({ success: true, mailed });
    } catch (error: any) {
      console.error('Failed to send transcript email:', error);
      // Soft fail with 200 OK but success false to prevent severe client-side or gateway block errors
      res.json({ success: false, error: error?.message || 'Failed to send transcript email.' });
    }
  });

  app.post('/api/contact/email', async (req, res) => {
    try {
      const { name, email, message } = req.body || {};

      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
      }

      const mailed = await sendInquiryEmail(name, email, message);
      res.json({ success: mailed, mailed });
    } catch (error: any) {
      console.error('Failed to send inquiry email:', error);
      // Soft fail with 200 OK but success false to prevent severe client-side or gateway block errors
      res.json({ success: false, error: error?.message || 'Failed to send inquiry email.' });
    }
  });

  // Diagnostic path to verify SMTP mail credentials and configurations on Vercel instantly
  app.get('/api/contact/test-email', async (req, res) => {
    try {
      const config = getSMTPConfig();
      const info = {
        host: config.host,
        port: config.port,
        secure: config.secure,
        hasUser: !!config.user,
        hasPass: !!config.pass,
        userLength: config.user.length,
        passLength: config.pass.length,
      };

      if (!config.user || !config.pass) {
        return res.status(400).json({
          success: false,
          error: 'SMTP credentials (SMTP_USER/SMTP_PASS) are not configured in your environment variables.',
          config: info
        });
      }

      console.log('[SMTP Diagnostic Route] Checking SMTP connection...');
      const transporter = getTransporter();
      
      const verified = await transporter.verify();
      
      const result = await transporter.sendMail({
        from: `"Sankalp SMTP Test" <${config.user}>`,
        to: 'sankalpsmn@gmail.com',
        subject: '🧪 [Portfolio SMTP Diagnostic] Test Email',
        text: 'Your portfolio email integration is 100% working and configured correctly!',
        html: '<p>Your portfolio email integration is <strong>100% working</strong> and configured correctly!</p>',
      });

      res.json({
        success: true,
        message: 'SMTP handshake and test email dispatch completed successfully!',
        verified,
        config: info,
        result
      });
    } catch (error: any) {
      console.error('[SMTP Diagnostic Failure]:', error);
      res.status(500).json({
        success: false,
        error: error.message || String(error),
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        stack: error.stack,
        config: {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || '587',
          user: process.env.SMTP_USER ? 'CONFIGURED' : 'EMPTY'
        }
      });
    }
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/ai/generate', async (req, res) => {
    try {
      const { prompt, userInput } = req.body || {};

      if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      }

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: `${prompt}\n\nUser Input: ${userInput}`,
        config: {
          systemInstruction: `You are Sankalp's Advanced Quality Engineering AI Agent. Use EXTREME PRECISION and MINIMALISM.

STRICT OPERATIONAL RULES:
1. ONLY provide the internal content requested. NO introductions, NO "Here is...", NO "Certainly!", NO polite closing.
2. If the user asks for a SPECIFIC field (e.g., "URL", "Repo", "Status"), respond with ONLY that string and nothing else.
3. If providing a broader report, use professional Markdown (Tables for test cases).
4. Do NOT hallucinate conversational context. 
5. TONE: 100% technical and target-oriented.
6. FORMATTING: Use remark-gfm enhanced tables but keep them dense.`,
        }
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: error?.message || 'Failed to generate AI response' });
    }
  });

  app.post('/api/ai/translate', async (req, res) => {
    try {
      const { content } = req.body || {};
      if (!content || typeof content !== 'object') {
        return res.status(400).json({ error: 'content object is required' });
      }

      if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      }

      const systemPrompt = `You are a professional, high-end translation agent for a software QA & AI Engineering portfolio.
Translate the provided key-value pairs (which represent text content, descriptions, bullets, or metrics from the portfolio) into three languages:
1. Hindi (hi)
2. French (fr)
3. German (de)

STRICT OPERATIONAL RULES:
1. Return ONLY a valid JSON object matches the requested output structure. No conversational text.
2. Keep all technical terms, brands, names (e.g. "Sankalp Suman", "Amdocs", "Selenium", "API", "QA", "ISTQB", "CSM", "Python", "React", "Next.js", "Docker", "Sankalp") in their original english-friendly spelling or standard recognized local script form.
3. Do NOT translate URLs, emails, dates or numbers/metrics unless the metrics are written as words.
4. Translate full sentences/paragraphs smoothly, preserving technical flow, elegance, and professionalism.

The input flat key-value pair representation:
${JSON.stringify(content, null, 2)}

Expected output format:
{
  "hi": {
    "key1": "translated key 1",
    "key2": "translated key 2"
  },
  "fr": {
    "key1": "translated key 1",
    "key2": "translated key 2"
  },
  "de": {
    "key1": "translated key 1",
    "key2": "translated key 2"
  }
}`;

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: `${systemPrompt}\n\nPerform translations and return the JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hi: {
                type: Type.OBJECT,
                description: "Map of translated key-value pairs in Hindi"
              },
              fr: {
                type: Type.OBJECT,
                description: "Map of translated key-value pairs in French"
              },
              de: {
                type: Type.OBJECT,
                description: "Map of translated key-value pairs in German"
              }
            },
            required: ["hi", "fr", "de"]
          }
        }
      });

      const translated = JSON.parse(response.text || '{}');
      res.json(translated);
    } catch (error: any) {
      console.error('Translate API Error:', error);
      res.status(500).json({ error: error?.message || 'Failed to translate' });
    }
  });

  // Dynamic AI-powered Resume Generator endpoint
  app.post('/api/ai/generate-resume', async (req, res) => {
    try {
      const { targetLanguage, portfolioData } = req.body || {};
      
      if (!targetLanguage) {
        return res.status(400).json({ error: 'targetLanguage is required' });
      }

      if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      }

      const systemPrompt = `You are an elite, professional ATS Resume and CV Writer.
Your goal is to synthesize 100% of the raw portfolio data into a highly polished, clean, recruiter-ready resume/CV optimized for ATS (Applicant Tracking Systems).

STRICT DATA PROCESSING & OPERATIONAL RULES:
1. ZERO DATA LOSS & 100% COMPREHENSIVE INCLUSION:
   - Carefully scan and extract details from EVERY single input section. Ensure the following details are always included and never omitted, regardless of standard template constraints:
     * Full Name (personalInfo.name)
     * Professional Title / Current Role (personalInfo.title)
     * Contact Information (Email, Phone, Location) (personalInfo.email, personalInfo.phone, personalInfo.location)
     * LinkedIn Profile (personalInfo.linkedin)
     * Portfolio Website (personalInfo.website, mapped to the provided "portfolioUrl")
     * Professional Summary (personalInfo.summary)
     * Total Years of Experience (personalInfo.yearsOfExperience, calculated or summarized from history)
     * Languages (personalInfo.languages, translated/extracted from "about" or other sections, or fallback list)
     * Work Experience (experience, with responsibilities, achievements, and quantified metrics)
     * Projects (projects, with name, role, descriptions, technologies used, outcomes, and links)
     * Technical Skills / Tools & Technologies (skills, categorized domain lists containing all technical languages, frameworks, automation tools, and assistive systems)
     * Certifications (certifications)
     * Education (education)
     * Awards & Achievements (achievements, combining major recognitions and metrics)
     * Career Timeline / Career Journey (integrated dynamically or added under achievements/additionalSections)
     * Publications, Blogs, or Content (as an additionalSection, or list details under "Technical Publications & Written Insight")
     * All External Links (under contact, projects, and certifications where available)
   - Under "personalInfo", the "website" field MUST be mapped to the provided "portfolioUrl" in the payload (unless there is an official custom website specified in "contact") to guarantee recruiters can access the live portfolio!
   - For every single project in "projects", always capture and include its live/GitHub url as "link" in the response schema. Never omit the links.
   - If there are custom user-added blocks or sections that do not map directly to standard resume headers, map them elegantly under "additionalSections" in the response schema. Never omit any custom sections, no matter how small.

2. INTELLIGENT MERGING & ZERO DUPLICATION:
   - Identify career journey milestones in "timeline" that represent the same job role and company as listed in the primary "experience" history. MERGE their descriptions, highlights, and insights together into standard action-oriented bullet points under the unified Experience block. DO NOT produce separate duplicative job blocks.
   - If a "timeline" milestone represents a school degree/academic milestone, map it neatly to "education".
   - Merge all tools from "aiTools", technical stack listings from "projects", and core competencies from "skills" into a unified, clean, highly-organized, non-redundant checklist under "skills" categorized by logical domains.
   - Incorporate qualitative QA breakthroughs from "impactStories", quantitative metrics from "qaMetrics" and "about.metrics", and current focus from "now" into either the corresponding experience bullets, or inside "achievements" (which is an array of strings in the schema), or as specific additional sections (e.g. "Key QA Metrics & Direct Impact") under "additionalSections".
   - Include direct, clean mentions of blog titles ("blogs") under a section named "Technical Publications & Written Insight" inside "additionalSections" to show active thought leadership, linking them properly as text descriptions or list links if available.

3. TARGET LANGUAGE: Translate ALL sections (titles, names, professional summaries, role names, descriptions, bullet points, locations, etc.) into the specified target language: "${targetLanguage}".
   - Standard industry names and tools (e.g. "Selenium", "PostgreSQL", "React", "Docker", "QA", "ISTQB", "CSM", "Python", "Next.js", "Jenkins") should retain their standard technical/English spelling as widely recognized in professional job markets.

4. ELEVATE CONTENT & PRESERVE FACTS:
   - Convert general descriptive paragraphs or passive bullets into punchy, recruiter-ready, action-oriented descriptions. Use active verbs (e.g., "Led", "Engineered", "Optimized", "Architected", "Spearheaded", "Revamped").
   - Quantify impact and performance in QA wherever possible using the candidate's exact numeric metrics.
   - Never invent, extrapolate, or hallucinate credentials, dates, companies, or degrees. Use ONLY the facts provided in the raw portfolio data.

5. VERIFICATION:
   - Validate that none of the core sections (personalInfo, experience, projects, skills, education) are missing before outputting the final JSON.

Raw Portfolio JSON:
${JSON.stringify(portfolioData, null, 2)}

Respond with ONLY the structured resume JSON matching the requested response schema.`;

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: `${systemPrompt}\n\nGenerate and return the formatted ATS resume JSON in the target language: "${targetLanguage}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              personalInfo: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  title: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  email: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  location: { type: Type.STRING },
                  linkedin: { type: Type.STRING },
                  github: { type: Type.STRING },
                  website: { type: Type.STRING },
                  yearsOfExperience: { type: Type.STRING },
                  languages: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["name", "title", "summary"]
              },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    role: { type: Type.STRING },
                    company: { type: Type.STRING },
                    period: { type: Type.STRING },
                    location: { type: Type.STRING },
                    bullets: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["role", "company", "period", "bullets"]
                }
              },
              projects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    techStack: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    link: { type: Type.STRING },
                    role: { type: Type.STRING }
                  },
                  required: ["name", "description"]
                }
              },
              skills: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    items: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["category", "items"]
                }
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    degree: { type: Type.STRING },
                    institution: { type: Type.STRING },
                    period: { type: Type.STRING },
                    grade: { type: Type.STRING }
                  },
                  required: ["degree", "institution"]
                }
              },
              certifications: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    issuer: { type: Type.STRING },
                    date: { type: Type.STRING },
                    link: { type: Type.STRING }
                  },
                  required: ["name", "issuer"]
                }
              },
              achievements: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              testimonials: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    author: { type: Type.STRING },
                    role: { type: Type.STRING },
                    company: { type: Type.STRING },
                    text: { type: Type.STRING }
                  },
                  required: ["author", "text"]
                }
              },
              additionalSections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    bullets: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["title", "bullets"]
                }
              }
            },
            required: ["personalInfo", "experience", "projects", "skills"]
          }
        }
      });

      const parsedResume = JSON.parse(response.text || '{}');
      res.json(parsedResume);
    } catch (error: any) {
      console.error('Generate Resume API Error:', error);
      res.status(500).json({ error: error?.message || 'Failed to generate resume data' });
    }
  });

  app.post('/api/ai/suggest-image', async (req, res) => {
    try {
      const { title, excerpt } = req.body || {};

      if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      }

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: `Provide exactly 3 keywords separated by commas that describe a professional, high-quality technical or business-related image for this blog post.
        Title: ${title}
        Excerpt: ${excerpt}
        Keywords:`,
        config: {
          systemInstruction: "You are an expert editor for a high-end tech portfolio blog. You specialize in picking perfect stock photo keywords for software engineering, QA, and AI content. Output ONLY the 3 keywords, nothing else.",
        }
      });
      const keywords = response.text?.trim().replace(/\.$/, '') || "technology,software,business";
      res.json({ keywords });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: error?.message || 'Failed to suggest image keywords' });
    }
  });

  const getMetadata = async (urlPath: string, host: string, protocol: string) => {
    const cacheKey = `metadata_${urlPath}`;
    const cached = metadataCache.get(cacheKey);
    if (cached) return cached as any;

    let title = "Sankalp Suman | QA Engineering & AI Portfolio";
    let description = "Advanced AI-Powered QA Engineering Portfolio. Features interactive AI playgrounds, live quality dashboards, impact stories, and professional career insights.";
    let image = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200&h=630";
    let url = `${protocol}://${host}${urlPath}`;

    try {
      if (!db) throw new Error('DB not initialized');

      // Efficiently load settings and seo in parallel
      const [settingsSnap, seoSnap] = await Promise.all([
        getDoc(doc(db, 'settings/global')),
        getDoc(doc(db, 'seo/config'))
      ]);

      if (settingsSnap.exists()) {
        const settingsData = settingsSnap.data();
        if (settingsData.logoUrl) image = settingsData.logoUrl;
      }

      if (seoSnap.exists()) {
        const seoData = seoSnap.data();
        title = seoData.title || title;
        description = seoData.description || description;
        image = seoData.ogImage || image;
      }

      // 3. Page specific overrides
      if (urlPath.startsWith('/blog/')) {
        const slug = urlPath.replace('/blog/', '');
        const blogsRef = collection(db, 'blogs');
        const q = query(blogsRef, where('slug', '==', slug));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const blogData = querySnapshot.docs[0].data();
          title = `${blogData.title} | Sankalp Suman Blog`;
          description = blogData.excerpt || blogData.seoDescription || description;
          image = blogData.imageUrl || image;
        }
      }
    } catch (e) {
      console.warn('Metadata fetch partially failed:', e);
    }

    const metadata = { title, description, image, url };
    metadataCache.set(cacheKey, metadata);
    return metadata;
  };

  const injectMetadata = (html: string, metadata: { title: string, description: string, image: string, url: string }) => {
    return html
      .replace(/<title>.*?<\/title>/, `<title>${metadata.title}</title>`)
      .replace(/<meta name="title" content=".*?" \/>/, `<meta name="title" content="${metadata.title}" />`)
      .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${metadata.description}" />`)
      .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${metadata.title}" />`)
      .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${metadata.description}" />`)
      .replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${metadata.image}" />`)
      .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${metadata.url}" />`)
      .replace(/<meta property="twitter:title" content=".*?" \/>/, `<meta property="twitter:title" content="${metadata.title}" />`)
      .replace(/<meta property="twitter:description" content=".*?" \/>/, `<meta property="twitter:description" content="${metadata.description}" />`)
      .replace(/<meta property="twitter:image" content=".*?" \/>/, `<meta property="twitter:image" content="${metadata.image}" />`)
      .replace(/<meta property="twitter:url" content=".*?" \/>/, `<meta property="twitter:url" content="${metadata.url}" />`);
  };

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Development metadata injection (optional, works if you refresh)
    app.get('*', async (req, res, next) => {
      const urlPath = req.path;

      // Skip API routes
      if (urlPath.startsWith('/api/')) {
        return next();
      }

      // If it looks like an asset (has any file extension except .html) and we're here, it means Vite missed it (e.g. 404 in dev)
      const ext = path.extname(urlPath).toLowerCase();
      if (ext && ext !== '.html') {
        return res.status(404).send('Asset not found');
      }

      try {
        const url = req.originalUrl;
        const protocol = req.protocol === 'http' && req.headers['x-forwarded-proto'] ? req.headers['x-forwarded-proto'] as string : req.protocol;
        const metadata = await getMetadata(url, req.get('host') || 'localhost', protocol);
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const html = injectMetadata(template, metadata);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    
    // Serve static files with a long max-age for hashed assets
    app.use(express.static(distPath, {
      maxAge: '1y',
      index: false,
    }));

    // For all other GET requests, serve index.html with meta injection
    app.get('*', async (req, res) => {
      const urlPath = req.path;

      // Skip API routes - they should have been handled above
      if (urlPath.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
      }

      // If it looks like an asset (has any file extension except .html) and we're here, it means express.static missed it
      const ext = path.extname(urlPath).toLowerCase();
      if (ext && ext !== '.html') {
        return res.status(404).send('Asset not found');
      }

      try {
        const indexHtmlPath = path.join(distPath, 'index.html');
        if (!fs.existsSync(indexHtmlPath)) {
          console.error('index.html not found at:', indexHtmlPath);
          return res.status(500).send('Application build missing. Please run build first.');
        }

        const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
        const protocol = req.protocol === 'http' && req.headers['x-forwarded-proto'] ? req.headers['x-forwarded-proto'] as string : req.protocol;
        const metadata = await getMetadata(urlPath, req.get('host') || 'localhost', protocol);
        const html = injectMetadata(indexHtml, metadata);
        res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
      } catch (error) {
        console.error('Error serving index.html:', error);
        res.status(500).send('Internal Server Error');
      }
    });
  }

  // Global error-handling middleware to return clean JSON error responses for payload limits or uncaught exceptions
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('[Express Global Error]:', err);
    res.status(err.status || err.statusCode || 500).json({
      error: err.message || 'An unexpected server error occurred.'
    });
  });

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

initPromise = startServer();
