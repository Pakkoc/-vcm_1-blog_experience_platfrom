import type { Hono } from 'hono';
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
import { z } from 'zod';
import {
  CampaignCreateSchema,
  CampaignUpdateSchema,
  CampaignQuerySchema,
} from './schema';
import {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  updateCampaignStatus,
  getMyCampaigns,
} from './service';
import {
  campaignErrorCodes,
  type CampaignServiceError,
} from './error';

export const registerCampaignRoutes = (app: Hono<AppEnv>) => {
  console.log('[Campaign Routes] Registering campaign routes...');
  
  app.post('/campaigns', async (c) => {
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
        failure(401, campaignErrorCodes.unauthorized, '인증이 필요합니다')
      );
    }

    const body = await c.req.json();
    const parsedBody = CampaignCreateSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          campaignErrorCodes.invalidRequest,
          '입력값이 올바르지 않습니다',
          parsedBody.error.format()
        )
      );
    }

    const result = await createCampaign(supabase, authData.user.id, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<CampaignServiceError, unknown>;

      if (errorResult.error.code === campaignErrorCodes.campaignCreationFailed) {
        logger.error('Campaign creation failed', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  app.get('/campaigns', async (c) => {
    console.log('[Campaign Routes] GET /campaigns called');
    const supabase = getSupabase(c);
    
    const queryParams = {
      status: c.req.query('status'),
      sort: c.req.query('sort'),
      page: c.req.query('page'),
      limit: c.req.query('limit'),
    };
    
    console.log('[Campaign Routes] Query params:', queryParams);

    const parsedQuery = CampaignQuerySchema.safeParse(queryParams);

    if (!parsedQuery.success) {
      console.error('[Campaign Routes] Query validation failed:', parsedQuery.error);
      return respond(
        c,
        failure(
          400,
          campaignErrorCodes.invalidRequest,
          '잘못된 쿼리 파라미터입니다',
          parsedQuery.error.format()
        )
      );
    }

    console.log('[Campaign Routes] Fetching campaigns with params:', parsedQuery.data);
    const result = await getAllCampaigns(supabase, parsedQuery.data);
    
    console.log('[Campaign Routes] Result:', result.ok ? 'success' : 'failure', result);

    return respond(c, result);
  });

  app.get('/campaigns/my', async (c) => {
    const config = getConfig(c);
    const supabase = createBrowserClient({
      url: config.supabase.url,
      anonKey: config.supabase.anonKey,
    }, c);

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return respond(
        c,
        failure(401, campaignErrorCodes.unauthorized, '인증이 필요합니다')
      );
    }

    const result = await getMyCampaigns(supabase, authData.user.id);

    return respond(c, result);
  });

  app.get('/campaigns/:id', async (c) => {
    const supabase = getSupabase(c);
    const id = c.req.param('id');

    const idSchema = z.string().uuid();
    const parsedId = idSchema.safeParse(id);

    if (!parsedId.success) {
      return respond(
        c,
        failure(400, campaignErrorCodes.invalidRequest, '올바른 ID 형식이 아닙니다')
      );
    }

    const result = await getCampaignById(supabase, parsedId.data);

    return respond(c, result);
  });

  app.patch('/campaigns/:id', async (c) => {
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
        failure(401, campaignErrorCodes.unauthorized, '인증이 필요합니다')
      );
    }

    const id = c.req.param('id');
    const idSchema = z.string().uuid();
    const parsedId = idSchema.safeParse(id);

    if (!parsedId.success) {
      return respond(
        c,
        failure(400, campaignErrorCodes.invalidRequest, '올바른 ID 형식이 아닙니다')
      );
    }

    const body = await c.req.json();
    const parsedBody = CampaignUpdateSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          campaignErrorCodes.invalidRequest,
          '입력값이 올바르지 않습니다',
          parsedBody.error.format()
        )
      );
    }

    const result = await updateCampaign(
      supabase,
      authData.user.id,
      parsedId.data,
      parsedBody.data
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<CampaignServiceError, unknown>;

      if (errorResult.error.code === campaignErrorCodes.campaignUpdateFailed) {
        logger.error('Campaign update failed', errorResult.error.message);
      }
    }

    return respond(c, result);
  });

  app.patch('/campaigns/:id/status', async (c) => {
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
        failure(401, campaignErrorCodes.unauthorized, '인증이 필요합니다')
      );
    }

    const id = c.req.param('id');
    const idSchema = z.string().uuid();
    const parsedId = idSchema.safeParse(id);

    if (!parsedId.success) {
      return respond(
        c,
        failure(400, campaignErrorCodes.invalidRequest, '올바른 ID 형식이 아닙니다')
      );
    }

    const body = await c.req.json();
    const statusSchema = z.object({
      status: z.enum(['recruiting', 'recruit_ended', 'selection_completed', 'cancelled']),
    });
    const parsedBody = statusSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(400, campaignErrorCodes.invalidRequest, '올바른 상태값이 아닙니다')
      );
    }

    const result = await updateCampaignStatus(
      supabase,
      authData.user.id,
      parsedId.data,
      parsedBody.data.status
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<CampaignServiceError, unknown>;

      if (errorResult.error.code === campaignErrorCodes.campaignUpdateFailed) {
        logger.error('Campaign status update failed', errorResult.error.message);
      }
    }

    return respond(c, result);
  });
};

