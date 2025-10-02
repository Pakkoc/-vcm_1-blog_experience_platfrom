"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCampaign } from "@/features/campaign/hooks/useCampaign";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { USER_ROLE } from "@/constants/roles";
import { ApplicationForm } from "@/features/application/components/ApplicationForm";

type ApplyPageProps = {
  params: Promise<{ id: string }>;
};

export default function ApplyPage({ params }: ApplyPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const { data: campaign, isLoading: campaignLoading, error } = useCampaign(id);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user && user.role !== USER_ROLE.INFLUENCER) {
      router.replace("/");
    }
  }, [user, router]);

  if (isLoading || campaignLoading) {
    return (
      <div className="container mx-auto min-h-screen max-w-4xl px-6 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-32 bg-slate-200 rounded" />
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 rounded" />
            <div className="h-32 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== USER_ROLE.INFLUENCER) {
    return null;
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto min-h-screen max-w-4xl px-6 py-16">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-600">체험단을 찾을 수 없습니다.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (campaign.status !== "recruiting") {
    return (
      <div className="container mx-auto min-h-screen max-w-4xl px-6 py-16">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-8 text-center">
          <p className="text-yellow-800">현재 모집 중이 아닌 체험단입니다.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push(`/campaigns/${id}`)}>
            체험단 상세로 이동
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen max-w-4xl px-6 py-16">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        뒤로 가기
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">체험단 지원하기</h1>
        <p className="mt-2 text-slate-600">
          지원 정보를 정확하게 입력해주세요
        </p>
      </div>

      <ApplicationForm campaignId={id} campaignTitle={campaign.title} />
    </div>
  );
}

