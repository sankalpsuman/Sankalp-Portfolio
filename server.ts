import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

dotenv.config();

const PORT = 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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
  apiKey: GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  app.use(express.json());

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
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `${prompt}\n\nUser Input: ${userInput}`,
        config: {
          systemInstruction: "You are a professional Quality Engineering AI Assistant. Your task is to provide EXACTLY what is requested. No conversational filler, no introductions, no pleasantries. Be concise, technical, and accurate.",
        }
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: 'Failed to generate AI response' });
    }
  });

  app.post('/api/ai/suggest-image', async (req, res) => {
    const { title, excerpt } = req.body;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
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
    } catch (error) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: 'Failed to suggest image keywords' });
    }
  });

  const getMetadata = async (urlPath: string) => {
    let title = "Sankalp Suman | QA Engineering & AI Portfolio";
    let description = "Advanced AI-Powered QA Engineering Portfolio. Features interactive AI playgrounds, live quality dashboards, impact stories, and professional career insights.";
    let image = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200&h=630";
    let url = `https://ais-pre-f6bmxsvqedm4r3t2gz5255-638313012041.asia-southeast1.run.app${urlPath}`;

    if (db && urlPath.startsWith('/blog/')) {
      const slug = urlPath.replace('/blog/', '');
      try {
        const blogsRef = collection(db, 'blogs');
        const q = query(blogsRef, where('slug', '==', slug));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const blogData = querySnapshot.docs[0].data();
          title = `${blogData.title} | Sankalp Suman Blog`;
          description = blogData.excerpt || blogData.seoDescription || description;
          image = blogData.imageUrl || image;
        }
      } catch (e) {
        console.error('Error fetching blog metadata:', e);
      }
    } else if (db && urlPath === '/') {
      try {
        const seoSnap = await getDoc(doc(db, 'seo/config'));
        if (seoSnap.exists()) {
          const seoData = seoSnap.data();
          title = seoData.title || title;
          description = seoData.description || description;
          image = seoData.ogImage || image;
        }
      } catch (e) {
        console.warn('Global SEO fetch failed:', e);
      }
    }

    return { title, description, image, url };
  };

  const injectMetadata = (html: string, metadata: { title: string, description: string, image: string, url: string }) => {
    return html
      .replace(/<title>.*?<\/title>/g, `<title>${metadata.title}</title>`)
      .replace(/<meta name="title" content=".*?" \/>/g, `<meta name="title" content="${metadata.title}" />`)
      .replace(/<meta name="description" content=".*?" \/>/g, `<meta name="description" content="${metadata.description}" />`)
      .replace(/<meta property="og:title" content=".*?" \/>/g, `<meta property="og:title" content="${metadata.title}" />`)
      .replace(/<meta property="og:description" content=".*?" \/>/g, `<meta property="og:description" content="${metadata.description}" />`)
      .replace(/<meta property="og:image" content=".*?" \/>/g, `<meta property="og:image" content="${metadata.image}" />`)
      .replace(/<meta property="og:url" content=".*?" \/>/g, `<meta property="og:url" content="${metadata.url}" />`)
      .replace(/<meta property="twitter:title" content=".*?" \/>/g, `<meta property="twitter:title" content="${metadata.title}" />`)
      .replace(/<meta property="twitter:description" content=".*?" \/>/g, `<meta property="twitter:description" content="${metadata.description}" />`)
      .replace(/<meta property="twitter:image" content=".*?" \/>/g, `<meta property="twitter:image" content="${metadata.image}" />`)
      .replace(/<meta property="twitter:url" content=".*?" \/>/g, `<meta property="twitter:url" content="${metadata.url}" />`);
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
        const metadata = await getMetadata(url);
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

    const indexHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');

    // For all other GET requests, serve index.html
    app.get('*', async (req, res) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      if (path.extname(req.path)) {
        return res.status(404).send('Asset not found');
      }

      const metadata = await getMetadata(req.path);
      const html = injectMetadata(indexHtml, metadata);
      res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
