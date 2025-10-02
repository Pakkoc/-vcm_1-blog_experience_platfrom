"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { MapPin, Calendar, Users, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCampaign } from "@/features/campaign/hooks/useCampaign";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { USER_ROLE } from "@/constants/roles";

type CampaignDetailPageProps = {
  params: Promise<{ id: string }>;
};

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  recruiting: { label: "모집중", variant: "default" },
  recruit_ended: { label: "모집종료", variant: "secondary" },
  selection_completed: { label: "선정완료", variant: "outline" },
  cancelled: { label: "취소", variant: "destructive" },
};

export default function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useCurrentUser();
  const { data: campaign, isLoading, error } = useCampaign(id);

  if (isLoading) {
    return (
      <div className="container mx-auto min-h-screen max-w-4xl px-6 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-32 bg-slate-200 rounded" />
          <div className="h-64 bg-slate-200 rounded" />
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 rounded" />
            <div className="h-6 bg-slate-200 rounded" />
            <div className="h-6 w-3/4 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
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

  const statusInfo = STATUS_LABEL[campaign.status] || STATUS_LABEL.recruiting;
  const canApply = isAuthenticated && user?.role === USER_ROLE.INFLUENCER && campaign.status === "recruiting";

  return (
    <div className="container mx-auto min-h-screen max-w-4xl px-6 py-16">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        뒤로 가기
      </Button>

      <div className="space-y-6">
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
          <img
            src={`https://picsum.photos/seed/${campaign.id}/800/450`}
            alt={campaign.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">{campaign.title}</h1>
            <div className="mt-2 flex items-center gap-2 text-slate-600">
              <MapPin className="h-4 w-4" />
              <span>{campaign.location}</span>
            </div>
          </div>
          <Badge variant={statusInfo.variant} className="text-sm">
            {statusInfo.label}
          </Badge>
        </div>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">모집 정보</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">모집 인원</p>
                <p className="text-slate-600">{campaign.recruitCount}명</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">모집 기간</p>
                <p className="text-slate-600">
                  {format(new Date(campaign.recruitStartDate), "yyyy.MM.dd", { locale: ko })} ~{" "}
                  {format(new Date(campaign.recruitEndDate), "yyyy.MM.dd HH:mm", { locale: ko })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">체험 기간</p>
                <p className="text-slate-600">
                  {format(new Date(campaign.experienceStartDate), "yyyy.MM.dd", { locale: ko })} ~{" "}
                  {format(new Date(campaign.experienceEndDate), "yyyy.MM.dd", { locale: ko })}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">상세 설명</h2>
          <p className="whitespace-pre-wrap text-slate-700">{campaign.description}</p>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">제공 혜택</h2>
          <p className="whitespace-pre-wrap text-slate-700">{campaign.benefits}</p>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">미션 내용</h2>
          <p className="whitespace-pre-wrap text-slate-700">{campaign.mission}</p>
        </Card>

        {canApply && (
          <div className="sticky bottom-6 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">이 체험단에 지원하시겠습니까?</p>
                <p className="text-sm text-slate-600">
                  마감: {format(new Date(campaign.recruitEndDate), "yyyy.MM.dd HH:mm", { locale: ko })}
                </p>
              </div>
              <Link href={`/campaigns/${campaign.id}/apply`}>
                <Button size="lg">
                  <FileText className="mr-2 h-4 w-4" />
                  지원하기
                </Button>
              </Link>
            </div>
          </div>
        )}

        {!isAuthenticated && campaign.status === "recruiting" && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-center">
            <p className="mb-4 text-blue-900">이 체험단에 지원하려면 로그인이 필요합니다.</p>
            <div className="flex justify-center gap-3">
              <Link href="/login">
                <Button variant="outline">로그인</Button>
              </Link>
              <Link href="/signup">
                <Button>회원가입</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

