import { Hono } from 'hono';
import { errorBoundary } from '@/backend/middleware/error';
import { withAppContext } from '@/backend/middleware/context';
import { withSupabase } from '@/backend/middleware/supabase';
import { registerExampleRoutes } from '@/features/example/backend/route';
import { registerSignupRoutes } from '@/features/signup/backend/route';
import { registerInfluencerRoutes } from '@/features/influencer/backend/route';
import { registerAdvertiserRoutes } from '@/features/advertiser/backend/route';
import { registerCampaignRoutes } from '@/features/campaign/backend/route';
import { registerApplicationRoutes } from '@/features/application/backend/route';
import type { AppEnv } from '@/backend/hono/context';

let singletonApp: Hono<AppEnv> | null = null;

export const createHonoApp = () => {
  // 개발 환경에서는 항상 새로운 앱 생성
  const isDevelopment = process.env.NODE_ENV !== 'production';

  if (singletonApp && !isDevelopment) {
    console.log('[Hono] Using cached app instance');
    return singletonApp;
  }

  console.log('[Hono] Creating new app instance...');
  const rootApp = new Hono<AppEnv>();
  const app = new Hono<AppEnv>();

  console.log('[Hono] Applying middlewares to /api routes...');
  app.use('*', errorBoundary());
  app.use('*', withAppContext());
  app.use('*', withSupabase());

  console.log('[Hono] Registering routes under /api ...');
  console.log('[Hono] Registering example routes...');
  registerExampleRoutes(app);
  console.log('[Hono] Registering signup routes...');
  registerSignupRoutes(app);
  console.log('[Hono] Registering influencer routes...');
  registerInfluencerRoutes(app);
  console.log('[Hono] Registering advertiser routes...');
  registerAdvertiserRoutes(app);
  console.log('[Hono] Registering campaign routes...');
  registerCampaignRoutes(app);
  console.log('[Hono] Registering application routes...');
  registerApplicationRoutes(app);

  rootApp.route('/api', app);
  console.log('[Hono] All routes registered successfully under /api');

  if (!isDevelopment) {
    singletonApp = rootApp;
  }

  return rootApp;
};
