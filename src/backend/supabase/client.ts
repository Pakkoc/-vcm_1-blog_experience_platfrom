import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Context } from 'hono';

export type ServiceClientConfig = {
  url: string;
  serviceRoleKey: string;
};

export const createServiceClient = ({
  url,
  serviceRoleKey,
}: ServiceClientConfig): SupabaseClient =>
  createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

export type BrowserClientConfig = {
  url: string;
  anonKey: string;
};

export const createBrowserClient = ({
  url,
  anonKey,
}: BrowserClientConfig, c: Context) => {
  const getCookie = (name: string) => {
    return c.req.header('cookie')
      ?.split(';')
      .map(cookie => cookie.trim())
      .find(cookie => cookie.startsWith(`${name}=`))
      ?.split('=')[1];
  };

  const getAllCookies = () => {
    const cookieHeader = c.req.header('cookie');
    if (!cookieHeader) return [];
    
    return cookieHeader.split(';').map(cookie => {
      const [name, ...valueParts] = cookie.trim().split('=');
      return {
        name,
        value: valueParts.join('='),
      };
    });
  };

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return getAllCookies();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          let cookieString = `${name}=${value}`;
          
          if (options?.maxAge) cookieString += `; Max-Age=${options.maxAge}`;
          if (options?.path) cookieString += `; Path=${options.path}`;
          if (options?.domain) cookieString += `; Domain=${options.domain}`;
          if (options?.sameSite) cookieString += `; SameSite=${options.sameSite}`;
          if (options?.secure) cookieString += '; Secure';
          if (options?.httpOnly) cookieString += '; HttpOnly';
          
          c.header('Set-Cookie', cookieString, { append: true });
        });
      },
    },
  });
};
