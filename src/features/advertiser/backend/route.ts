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
import { AdvertiserProfileCreateSchema } from './schema';
import { createAdvertiserProfile, getAdvertiserProfileByUserId } from './service';
import {
  advertiserErrorCodes,
  type AdvertiserServiceError,
} from './error';

export const registerAdvertiserRoutes = (app: Hono<AppEnv>) => {
  app.post('/advertiser/profile', async (c) => {
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
        failure(401, advertiserErrorCodes.unauthorized, '인증이 필요합니다')
      );
    }

    const body = await c.req.json();
    const parsedBody = AdvertiserProfileCreateSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          advertiserErrorCodes.invalidRequest,
          '입력값이 올바르지 않습니다',
          parsedBody.error.format()
        )
      );
    }

    const result = await createAdvertiserProfile(
      supabase,
      authData.user.id,
      parsedBody.data
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<AdvertiserServiceError, unknown>;

      if (errorResult.error.code === advertiserErrorCodes.profileCreationFailed) {
        logger.error('Advertiser profile creation failed', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  app.get('/advertiser/profile', async (c) => {
    const config = getConfig(c);
    const supabase = createBrowserClient({
      url: config.supabase.url,
      anonKey: config.supabase.anonKey,
    }, c);

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return respond(
        c,
        failure(401, advertiserErrorCodes.unauthorized, '인증이 필요합니다')
      );
    }

    const result = await getAdvertiserProfileByUserId(supabase, authData.user.id);

    return respond(c, result);
  });
};

