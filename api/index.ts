import type { Request, Response } from 'express';
import { createApp } from '../server';

// Vercel invokes this function for every /api/* request.  The Express app is
// created once per warm serverless instance and never calls app.listen().
const appPromise = createApp();

export default async function handler(req: Request, res: Response) {
  const app = await appPromise;
  return app(req, res);
}
