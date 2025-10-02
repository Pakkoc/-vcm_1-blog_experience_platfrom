"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { USER_ROLE, ROLE_LABELS, type UserRole } from "@/constants/roles";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type SignupVerifyPageProps = {
  params: Promise<Record<string, never>>;
};

const getOnboardingPath = (role: UserRole) => {
  return role === USER_ROLE.ADVERTISER
    ? "/onboarding/advertiser"
    : "/onboarding/influencer";
};

export default function SignupVerifyPage({ params }: SignupVerifyPageProps) {
  void params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, refresh } = useCurrentUser();
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const role = useMemo<UserRole>(() => {
    const fromParams = searchParams.get("role");
    return fromParams === USER_ROLE.ADVERTISER
      ? USER_ROLE.ADVERTISER
      : USER_ROLE.INFLUENCER;
  }, [searchParams]);

  const email = searchParams.get("email") ?? "";
  const onboardingPath = getOnboardingPath(role);

  useEffect(() => {
    const restoreSessionFromUrl = async () => {
      if (typeof window === "undefined") {
        setIsRestoringSession(false);
        return;
      }

      const supabase = getSupabaseBrowserClient();
      let restored = false;

      try {
        const currentUrl = new URL(window.location.href);
        const code = currentUrl.searchParams.get("code");
        const urlType = currentUrl.searchParams.get("type");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            throw new Error(error.message);
          }
          restored = true;
        } else {
          const hash = window.location.hash.replace(/^#/, "");
          const hashParams = new URLSearchParams(hash);
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (error) {
              throw new Error(error.message);
            }
            restored = true;
          } else if (urlType === "signup" || urlType === "email_change") {
            setRestoreError("세션 정보를 복원할 수 없습니다. 다시 인증 링크를 시도해주세요.");
          }
        }

        if (restored) {
          await refresh();
          router.replace(onboardingPath);
          return;
        }
      } catch (error) {
        console.error("[Signup Verify] Session restore failed", error);
        setRestoreError(
          error instanceof Error
            ? error.message
            : "세션 복원 중 문제가 발생했습니다. 다시 시도해주세요."
        );
      } finally {
        setIsRestoringSession(false);
      }
    };

    void restoreSessionFromUrl();
  }, [onboardingPath, refresh, router, searchParams]);

  useEffect(() => {
    if (!isRestoringSession && isAuthenticated) {
      router.replace(onboardingPath);
    }
  }, [isAuthenticated, isRestoringSession, onboardingPath, router]);

  const handleContinue = () => {
    router.push(onboardingPath);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold">이메일 인증이 필요합니다</h1>
        <p className="text-slate-500">가입하신 이메일로 인증 메일을 전송했습니다.</p>
      </header>
      <div className="grid w-full gap-8 md:grid-cols-2">
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">{email || '가입하신 이메일'}</span> 주소로 인증 링크를 보냈습니다.
            </p>
            <ol className="space-y-3 text-sm text-slate-600">
              <li>1. 받은 메일에서 '이메일 인증하기' 버튼을 눌러주세요.</li>
              <li>2. 인증이 완료되면 {ROLE_LABELS[role]} 온보딩 페이지로 자동 이동합니다.</li>
              <li>3. 인증 완료가 보이지 않을 경우 아래 버튼으로 직접 이동할 수 있습니다.</li>
            </ol>
            {restoreError && (
              <p className="text-sm text-red-500">{restoreError}</p>
            )}
          </div>
          <Button
            type="button"
            className="mt-6 w-full"
            onClick={handleContinue}
            disabled={isRestoringSession}
          >
            {isRestoringSession ? '세션 복원 중...' : '온보딩 계속하기'}
          </Button>
        </div>
        <figure className="overflow-hidden rounded-xl border border-slate-200">
          <Image
            src="https://picsum.photos/seed/email-verify/640/640"
            alt="이메일 인증 안내"
            width={640}
            height={640}
            className="h-full w-full object-cover"
            priority
          />
        </figure>
      </div>
    </div>
  );
}
