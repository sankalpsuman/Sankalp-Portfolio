import { app, initPromise } from '../server';

export default async function handler(req: any, res: any) {
  // Await any asynchronous server setups (e.g. Firebase, SMTP transporter config)
  await initPromise;
  
  // Forward the request and response to the Express server instance
  return app(req, res);
}
