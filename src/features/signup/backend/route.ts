import type { Hono } from 'hono';
import {
  failure,
  respond,
  type ErrorResult,
} from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import { SignupRequestSchema } from '@/features/signup/backend/schema';
import { signupUser } from './service';
import {
  signupErrorCodes,
  type SignupServiceError,
} from './error';

export const registerSignupRoutes = (app: Hono<AppEnv>) => {
  app.post('/auth/signup', async (c) => {
    const body = await c.req.json();

    const parsedBody = SignupRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          signupErrorCodes.invalidRequest,
          '입력값이 올바르지 않습니다',
          parsedBody.error.format()
        )
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const requestUrl = new URL(c.req.url);

    const result = await signupUser(supabase, parsedBody.data, {
      origin: requestUrl.origin,
    });

    if (!result.ok) {
      const errorResult = result as ErrorResult<SignupServiceError, unknown>;

      if (errorResult.error.code === signupErrorCodes.authCreationFailed) {
        logger.error('Signup failed', errorResult.error.message);
      }
    }

    return respond(c, result);
  });
};
