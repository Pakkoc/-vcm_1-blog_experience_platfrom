import { createHonoApp } from '@/backend/hono/app';

export const runtime = 'nodejs';

const app = createHonoApp();

export const GET = (req: Request) => {
  console.log('[Next.js Route] GET request:', req.url);
  return app.fetch(req);
};

export const POST = (req: Request) => {
  console.log('[Next.js Route] POST request:', req.url);
  return app.fetch(req);
};

export const PUT = (req: Request) => {
  console.log('[Next.js Route] PUT request:', req.url);
  return app.fetch(req);
};

export const PATCH = (req: Request) => {
  console.log('[Next.js Route] PATCH request:', req.url);
  return app.fetch(req);
};

export const DELETE = (req: Request) => {
  console.log('[Next.js Route] DELETE request:', req.url);
  return app.fetch(req);
};

export const OPTIONS = (req: Request) => {
  console.log('[Next.js Route] OPTIONS request:', req.url);
  return app.fetch(req);
};
