import type { Request, Response } from 'express';

export function health(_req: Request, res: Response): void {
  console.log('Health check requested');
  res.json({ status: 'ok', uptime: process.uptime() });
}
