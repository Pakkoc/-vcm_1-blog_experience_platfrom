"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUserContext } from "../context/current-user-context";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export const useCurrentUser = () => {
  const context = useCurrentUserContext();
  const router = useRouter();

  const logout = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    context.refresh();
    router.push("/");
  }, [context, router]);

  return useMemo(
    () => ({
      user: context.user,
      status: context.status,
      isAuthenticated: context.isAuthenticated,
      isLoading: context.isLoading,
      refresh: context.refresh,
      logout,
    }),
    [context, logout]
  );
};
