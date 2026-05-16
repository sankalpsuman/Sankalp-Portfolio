import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
      // Use the helper to generate content
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", 
        systemInstruction: "You are a professional Quality Engineering AI Assistant. Your task is to provide EXACTLY what is requested. No conversational filler, no introductions, no pleasantries. Be concise, technical, and accurate."
      });

      const result = await model.generateContent(`${prompt}\n\nUser Input: ${userInput}`);
      const response = await result.response;
      res.json({ text: response.text() });
    } catch (error) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: 'Failed to generate AI response' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    
    // Serve static files with a long max-age for hashed assets
    app.use(express.static(distPath, {
      maxAge: '1y',
      index: false,
    }));

    // For all other GET requests, serve index.html
    // but exclude anything that looks like a file or API call
    app.get('*', (req, res, next) => {
      // If the request is for an API route that wasn't handled, return 404 JSON
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
      }

      // If the request looks like a file (has an extension), it probably was a missing asset
      if (path.extname(req.path)) {
        return res.status(404).send('Asset not found');
      }

      // Otherwise, it's a client-side route, serve index.html
      res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) {
          console.error('Error sending index.html:', err);
          res.status(500).send('Internal Server Error');
        }
      });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
