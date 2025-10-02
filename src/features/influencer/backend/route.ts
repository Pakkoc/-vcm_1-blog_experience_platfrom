import type { Hono } from 'hono';
import {
  failure,
  respond,
  type ErrorResult,
} from '@/backend/http/response';
import {
  getLogger,
  getConfig,
  type AppEnv,
} from '@/backend/hono/context';
import { createBrowserClient } from '@/backend/supabase/client';
import { InfluencerProfileCreateSchema } from './schema';
import { createInfluencerProfile, getInfluencerProfileByUserId } from './service';
import {
  influencerErrorCodes,
  type InfluencerServiceError,
} from './error';

export const registerInfluencerRoutes = (app: Hono<AppEnv>) => {
  app.post('/influencer/profile', async (c) => {
    const config = getConfig(c);
    const logger = getLogger(c);
    const supabase = createBrowserClient({
      url: config.supabase.url,
      anonKey: config.supabase.anonKey,
    }, c);

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return respond(
        c,
        failure(401, influencerErrorCodes.unauthorized, '인증이 필요합니다')
      );
    }

    const body = await c.req.json();
    const parsedBody = InfluencerProfileCreateSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          influencerErrorCodes.invalidRequest,
          '입력값이 올바르지 않습니다',
          parsedBody.error.format()
        )
      );
    }

    const result = await createInfluencerProfile(
      supabase,
      authData.user.id,
      parsedBody.data
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<InfluencerServiceError, unknown>;

      if (
        errorResult.error.code === influencerErrorCodes.profileCreationFailed ||
        errorResult.error.code === influencerErrorCodes.channelCreationFailed
      ) {
        logger.error('Influencer profile creation failed', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  app.get('/influencer/profile', async (c) => {
    const config = getConfig(c);
    const supabase = createBrowserClient({
      url: config.supabase.url,
      anonKey: config.supabase.anonKey,
    }, c);

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return respond(
        c,
        failure(401, influencerErrorCodes.unauthorized, '인증이 필요합니다')
      );
    }

    const result = await getInfluencerProfileByUserId(supabase, authData.user.id);

    return respond(c, result);
  });
};

