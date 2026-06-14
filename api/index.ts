export default async function handler(req: any, res: any) {
  try {
    // Dynamically import the pre-bundled ESM server build to resolve all imports securely on Vercel
    // @ts-ignore
    const { app, initPromise } = await import('./_server.js');

    // Await any asynchronous server setups (e.g. Firebase, SMTP transporter config)
    if (initPromise) {
      await initPromise;
    }
    
    // Forward the request and response to the Express server instance
    return app(req, res);
  } catch (err: any) {
    console.error('[VERCEL SERVERLESS FUNCTION CRASH]:', err);
    
    // Always return clean, well-formed JSON to prevent frontend JSON parse crashes
    res.status(500).json({
      success: false,
      error: 'Vercel Serverless Function Crash during initialization or routing.',
      details: err?.message || String(err),
      stack: err?.stack || ''
    });
  }
}


