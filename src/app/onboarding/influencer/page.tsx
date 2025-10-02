"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { InfluencerOnboardingForm } from "@/features/influencer/components/InfluencerOnboardingForm";

type InfluencerOnboardingPageProps = {
  params: Promise<Record<string, never>>;
};

export default function InfluencerOnboardingPage({
  params,
}: InfluencerOnboardingPageProps) {
  void params;
  const router = useRouter();
  const { isAuthenticated, isLoading, refresh } = useCurrentUser();

  const [isRestoringSession, setIsRestoringSession] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (typeof window === "undefined") {
        setIsRestoringSession(false);
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const currentUrl = new URL(window.location.href);
      const code = currentUrl.searchParams.get("code");
      const type = currentUrl.searchParams.get("type");
      const hashParams = new URLSearchParams(currentUrl.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      const hasAuthParams = Boolean(code || accessToken || refreshToken || type);

      if (!hasAuthParams) {
        setIsRestoringSession(false);
        return;
      }

      try {
        let restored = false;

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw new Error(error.message);
          }

          restored = true;
          currentUrl.searchParams.delete("code");
          currentUrl.searchParams.delete("type");
          window.history.replaceState(
            window.history.state,
            "",
            `${currentUrl.pathname}${currentUrl.search}`
          );
        }

        if (!restored && accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw new Error(error.message);
          }

          restored = true;
          window.location.hash = "";
        }

        if (restored) {
          await refresh();
          router.replace(`${window.location.pathname}${window.location.search}`);
        } else if (type === "signup" || type === "email_change") {
          console.warn(
            "[Influencer Onboarding] 인증 파라미터가 없어 세션 복원이 필요하지만 토큰을 찾지 못했습니다."
          );
        }
      } catch (error) {
        console.error(
          "[Influencer Onboarding] Unexpected session restore error",
          error
        );
      } finally {
        setIsRestoringSession(false);
      }
    };

    void restoreSession();
  }, [refresh, router]);
  useEffect(() => {
    if (isRestoringSession || isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, isRestoringSession, router]);

  if (isRestoringSession || isLoading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen max-w-4xl px-6 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">인플루언서 프로필 등록</h1>
        <p className="mt-2 text-slate-600">
          체험단에 지원하기 위해 프로필을 완성해주세요
        </p>
      </div>

      <InfluencerOnboardingForm />
    </div>
  );
}

