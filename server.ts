import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import NodeCache from 'node-cache';
import nodemailer from 'nodemailer';
import { buildKnowledgeBase, retrieveRelevantContext, invalidateRAGCache } from './ragService';

dotenv.config();

const PORT = 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

// Nodemailer SMTP Transporter Setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

// Helper to format and send the complete chat transcript
async function sendTranscriptEmail(sessionId: string, titleLine: string, leadData: any, messages: any[]) {
  const emailUser = process.env.SMTP_USER;
  const emailPass = process.env.SMTP_PASS;

  const conversationHtml = messages.map(m => {
    const sender = m.role === 'user' ? 'Visitor' : 'Sankalp\'s AI Assistant';
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
    from: `"Sankalp AI Assistant" <${emailUser || 'noreply@portfolio.com'}>`,
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
    console.warn('--- NODEMAILER LOG ---');
    console.warn('SMTP_USER and SMTP_PASS are not configured in your env file.');
    console.warn(`To: ${mailOptions.to}`);
    console.warn(`Subject: ${mailOptions.subject}`);
    console.warn('--- EMAIL CONVERSATION END ---');
    return false;
  }

  await transporter.sendMail(mailOptions);
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

const firebaseApp = firebaseConfig ? initializeApp(firebaseConfig) : null;
const db = firebaseApp ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId) : null;

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  app.use(express.json());

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
    const { messages } = req.body;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be an array of conversation items.' });
    }

    try {
      // Map roles correctly for context and feed full conversational text formatting
      const conversationHistory = messages.map(m => {
        return `${m.role === 'user' ? 'Visitor' : 'Sankalp\'s AI Assistant'}: ${m.content}`;
      }).join('\n');

      // 1. EXTRACT LATEST QUERY
      const userMessages = messages.filter((m: any) => m.role === 'user');
      const latestQuery = userMessages.length > 0 ? userMessages[userMessages.length - 1].content : '';

      // 2. RETRIEVE RELEVANT CONTEXT (RAG Semantic Search)
      const retrievedContext = await retrieveRelevantContext(latestQuery, ai, db);

      // 3. COMPOSE SYSTEM PROMPT WITH SECURE COMPREHENSIVE CONTEXT
      const systemPrompt = `You are Sankalp Suman’s premium representational AI and Career Assistant, acting as a high-end digital liaison on Sankalp Suman's portfolio.

Your prime directive is to respond with high confidence, accuracy, and intelligence. While you should prioritize the verified portfolio context retrieved from Sankalp's digital assets, you are ALSO fully empowered to answer any questions or general inquiries using your own general knowledge and understanding.

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

RULES FOR OPERATION and ANSWER COMPOSITION:
1. Base specific answers regarding Sankalp's experience, contact info, projects, and roles on the retrieved context above.
2. If the user asks general technical, software testing, Agile/Scrum, QA methodology, or miscellaneous knowledge-based questions not explicitly covered in Sankalp's specific context, use your own intelligence and industry understanding to provide helpful, comprehensive, and highly professional answers on his behalf.
3. If the question is about Sankalp himself but you don't find it in the context, do NOT refuse rigidly. Instead, answer using your best professional estimation, or kindly guide them to contact Sankalp directly at sankalpsmn@gmail.com while offering whatever helpful related insights you can.
4. Maintain an elite, polite, highly professional and conversational tone ("Sankalp's AI version"). Always refer to Sankalp in the third person.
5. Highlight relocations, career interests in India & global hubs (USA/Germany/etc.), Scrum Master qualifications (ISTQB/Scrum Master CSM), and invite the user to schedule an interview using the built-in "Book Interview" scheduler link.
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

      const response = await ai.models.generateContent({
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
    const { sessionId, leadData, messages, force } = req.body;

    if (!sessionId || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Session ID and a valid conversation are required.' });
    }

    // Check if we've already dispatched this session unless force is true
    if (dispatchedSessions.has(sessionId) && !force) {
      return res.json({ success: true, message: 'Email already dispatched for this session.' });
    }

    try {
      const isLead = leadData && (leadData.recruiterName || leadData.companyName || leadData.email);
      const titleLine = isLead 
        ? `🚨 Recruiter Lead from ${leadData.recruiterName || 'AnonymousRecruiter'} at ${leadData.companyName || 'Unknown Corp'}`
        : `💬 Portfolio chat transcript session: ${sessionId.slice(0, 8)}`;

      const mailed = await sendTranscriptEmail(sessionId, titleLine, leadData, messages);
      
      dispatchedSessions.add(sessionId);
      res.json({ success: true, mailed });
    } catch (error: any) {
      console.error('Failed to send transcript email:', error);
      res.status(500).json({ error: error?.message || 'Failed to send transcript email.' });
    }
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/ai/generate', async (req, res) => {
    const { prompt, userInput } = req.body;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    try {
      const response = await (ai as any).models.generateContent({
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

  app.post('/api/ai/suggest-image', async (req, res) => {
    const { title, excerpt } = req.body;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    try {
      const response = await (ai as any).models.generateContent({
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
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Development metadata injection (optional, works if you refresh)
    app.get('*', async (req, res, next) => {
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

      // If it looks like an asset (has an extension) and we're here, it means express.static missed it
      const knownAssets = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.json'];
      if (path.extname(urlPath) && knownAssets.includes(path.extname(urlPath).toLowerCase())) {
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
