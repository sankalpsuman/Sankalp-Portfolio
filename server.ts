import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import NodeCache from 'node-cache';

dotenv.config();

const PORT = 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

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
        model: "gemini-1.5-flash",
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
        model: "gemini-1.5-flash",
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
