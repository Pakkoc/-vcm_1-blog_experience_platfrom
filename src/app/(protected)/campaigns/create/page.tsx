"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { USER_ROLE } from "@/constants/roles";
import { CampaignCreateForm } from "@/features/campaign/components/CampaignCreateForm";
import { useAdvertiserProfile } from "@/features/advertiser/hooks/useAdvertiserProfile";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

type CampaignCreatePageProps = {
  params: Promise<Record<string, never>>;
};

export default function CampaignCreatePage({ params }: CampaignCreatePageProps) {
  void params;
  const router = useRouter();
  const { user, isAuthenticated, isLoading: userLoading } = useCurrentUser();
  const { data: advertiserProfile, isLoading: profileLoading, error: profileError } = useAdvertiserProfile(
    isAuthenticated && user?.role === USER_ROLE.ADVERTISER
  );

  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      router.replace("/login");
    }
    
    if (!userLoading && isAuthenticated && user?.role !== USER_ROLE.ADVERTISER) {
      router.replace("/");
    }
  }, [isAuthenticated, userLoading, user, router]);

  if (!isAuthenticated || userLoading || profileLoading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 광고주 프로필이 없으면 온보딩 페이지로 안내
  if (profileError || !advertiserProfile) {
    return (
      <div className="container mx-auto min-h-screen max-w-2xl px-6 py-16">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-orange-500" />
          <h2 className="mb-2 text-xl font-bold">광고주 프로필 등록이 필요합니다</h2>
          <p className="mb-6 text-slate-600">
            체험단을 등록하려면 먼저 광고주 정보를 등록해야 합니다.
          </p>
          <Link
            href="/onboarding/advertiser"
            className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
          >
            광고주 정보 등록하러 가기
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen max-w-4xl px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">체험단 등록</h1>
        <p className="mt-2 text-slate-600">
          인플루언서와 함께할 체험단을 등록하세요
        </p>
      </div>

      <CampaignCreateForm />
    </div>
  );
}

