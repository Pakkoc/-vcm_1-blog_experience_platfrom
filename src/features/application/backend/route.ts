import type { Hono } from 'hono';
import { z } from 'zod';
import {
  failure,
  respond,
  type ErrorResult,
} from '@/backend/http/response';
import {
  getLogger,
  getConfig,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import { createBrowserClient } from '@/backend/supabase/client';
import { ApplicationCreateSchema } from './schema';
import {
  createApplication,
  getMyApplications,
  getCampaignApplications,
  updateApplicationStatus,
  getApplicationStatusByCampaign,
  bulkUpdateApplicationStatus,
} from './service';
import {
  applicationErrorCodes,
  type ApplicationServiceError,
} from './error';

export const registerApplicationRoutes = (app: Hono<AppEnv>) => {
  console.log('[Application Routes] Registering application routes...');

  app.post('/applications', async (c) => {
    console.log('[Application Routes] POST /applications called');
    const config = getConfig(c);
    const logger = getLogger(c);
    const serviceSupabase = getSupabase(c);
    const authSupabase = createBrowserClient(
      {
        url: config.supabase.url,
        anonKey: config.supabase.anonKey,
      },
      c
    );

    const { data: authData } = await authSupabase.auth.getUser();

    if (!authData.user) {
      return respond(
        c,
        failure(401, applicationErrorCodes.unauthorized, '인증이 필요합니다')
      );
    }

    const body = await c.req.json();
    const parsedBody = ApplicationCreateSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          applicationErrorCodes.invalidRequest,
          '입력값이 올바르지 않습니다',
          parsedBody.error.format()
        )
      );
    }

    const result = await createApplication(
      serviceSupabase,
      authData.user.id,
      parsedBody.data
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<
        ApplicationServiceError,
        unknown
      >;

      logger.warn('[Application Routes] POST /applications failed', {
        status: errorResult.status,
        code: errorResult.error.code,
        message: errorResult.error.message,
      });

      if (
        errorResult.error.code ===
        applicationErrorCodes.applicationCreationFailed
      ) {
        logger.error(
          'Application creation failed',
          errorResult.error.message
        );
      }
    }

    return respond(c, result);
  });

  app.get('/applications/my', async (c) => {
    const config = getConfig(c);
    const logger = getLogger(c);
    const serviceSupabase = getSupabase(c);
    const authSupabase = createBrowserClient(
      {
        url: config.supabase.url,
        anonKey: config.supabase.anonKey,
      },
      c
    );

    const { data: authData } = await authSupabase.auth.getUser();

    if (!authData.user) {
      return respond(
        c,
        failure(401, applicationErrorCodes.unauthorized, '인증이 필요합니다')
      );
    }

    const result = await getMyApplications(
      serviceSupabase,
      authData.user.id
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<
        ApplicationServiceError,
        unknown
      >;

      logger.warn('[Application Routes] GET /applications/my failed', {
        status: errorResult.status,
        code: errorResult.error.code,
        message: errorResult.error.message,
      });
    }

    return respond(c, result);
  });

  app.get('/campaigns/:campaignId/application-status', async (c) => {
    const config = getConfig(c);
    const serviceSupabase = getSupabase(c);
    const authSupabase = createBrowserClient(
      {
        url: config.supabase.url,
        anonKey: config.supabase.anonKey,
      },
      c
    );
    const campaignId = c.req.param('campaignId');

    const { data: authData } = await authSupabase.auth.getUser();

    if (!authData.user) {
      return respond(
        c,
        failure(401, applicationErrorCodes.unauthorized, '인증이 필요합니다')
      );
    }

    const idSchema = z.string().uuid();
    const parsedId = idSchema.safeParse(campaignId);

    if (!parsedId.success) {
      return respond(
        c,
        failure(
          400,
          applicationErrorCodes.invalidRequest,
          '올바른 ID 형식이 아닙니다'
        )
      );
    }

    const result = await getApplicationStatusByCampaign(
      serviceSupabase,
      authData.user.id,
      parsedId.data
    );

    return respond(c, result);
  });

  app.get('/campaigns/:campaignId/applications', async (c) => {
    const config = getConfig(c);
    const serviceSupabase = getSupabase(c);
    const authSupabase = createBrowserClient(
      {
        url: config.supabase.url,
        anonKey: config.supabase.anonKey,
      },
      c
    );
    const campaignId = c.req.param('campaignId');

    const { data: authData } = await authSupabase.auth.getUser();

    if (!authData.user) {
      return respond(
        c,
        failure(401, applicationErrorCodes.unauthorized, '인증이 필요합니다')
      );
    }

    const idSchema = z.string().uuid();
    const parsedId = idSchema.safeParse(campaignId);

    if (!parsedId.success) {
      return respond(
        c,
        failure(
          400,
          applicationErrorCodes.invalidRequest,
          '올바른 ID 형식이 아닙니다'
        )
      );
    }

    const result = await getCampaignApplications(
      serviceSupabase,
      authData.user.id,
      parsedId.data
    );

    return respond(c, result);
  });

  app.post('/campaigns/:campaignId/select-applicants', async (c) => {
    const config = getConfig(c);
    const logger = getLogger(c);
    const serviceSupabase = getSupabase(c);
    const authSupabase = createBrowserClient(
      {
        url: config.supabase.url,
        anonKey: config.supabase.anonKey,
      },
      c
    );
    const campaignId = c.req.param('campaignId');

    const { data: authData } = await authSupabase.auth.getUser();

    if (!authData.user) {
      return respond(
        c,
        failure(401, applicationErrorCodes.unauthorized, '인증이 필요합니다')
      );
    }

    const idSchema = z.string().uuid();
    const parsedId = idSchema.safeParse(campaignId);

    if (!parsedId.success) {
      return respond(
        c,
        failure(
          400,
          applicationErrorCodes.invalidRequest,
          '올바른 ID 형식이 아닙니다'
        )
      );
    }

    const body = await c.req.json();
    const selectionSchema = z.object({
      selectedApplicationIds: z
        .array(z.string().uuid())
        .min(1, '최소 1명 이상 선정해야 합니다'),
    });
    const parsedBody = selectionSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          applicationErrorCodes.invalidRequest,
          '올바른 요청이 아닙니다',
          parsedBody.error.format()
        )
      );
    }

    const result = await bulkUpdateApplicationStatus(
      serviceSupabase,
      authData.user.id,
      parsedId.data,
      parsedBody.data.selectedApplicationIds
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<
        ApplicationServiceError,
        unknown
      >;

      if (
        errorResult.error.code ===
        applicationErrorCodes.applicationCreationFailed
      ) {
        logger.error(
          'Bulk applicant selection failed',
          errorResult.error.message
        );
      }
    }

    return respond(c, result);
  });

  app.patch('/applications/:id/status', async (c) => {
    const config = getConfig(c);
    const logger = getLogger(c);
    const serviceSupabase = getSupabase(c);
    const authSupabase = createBrowserClient(
      {
        url: config.supabase.url,
        anonKey: config.supabase.anonKey,
      },
      c
    );
    const applicationId = c.req.param('id');

    const { data: authData } = await authSupabase.auth.getUser();

    if (!authData.user) {
      return respond(
        c,
        failure(401, applicationErrorCodes.unauthorized, '인증이 필요합니다')
      );
    }

    const idSchema = z.string().uuid();
    const parsedId = idSchema.safeParse(applicationId);

    if (!parsedId.success) {
      return respond(
        c,
        failure(
          400,
          applicationErrorCodes.invalidRequest,
          '올바른 ID 형식이 아닙니다'
        )
      );
    }

    const body = await c.req.json();
    const statusSchema = z.object({
      status: z.enum(['selected', 'rejected']),
    });
    const parsedBody = statusSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(400, applicationErrorCodes.invalidRequest, '올바른 상태값이 아닙니다')
      );
    }

    const result = await updateApplicationStatus(
      serviceSupabase,
      authData.user.id,
      parsedId.data,
      parsedBody.data.status
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<
        ApplicationServiceError,
        unknown
      >;

      if (
        errorResult.error.code ===
        applicationErrorCodes.applicationCreationFailed
      ) {
        logger.error(
          'Application status update failed',
          errorResult.error.message
        );
      }
    }

    return respond(c, result);
  });
};

