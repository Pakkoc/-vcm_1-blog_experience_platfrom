"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ArrowLeft, Calendar, Users, MapPin, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  useCampaign,
  useUpdateCampaignStatus,
} from "@/features/campaign/hooks/useCampaign";

type CampaignManagePageProps = {
  params: Promise<{ id: string }>;
};

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  recruiting: { label: "모집중", variant: "default" },
  recruit_ended: { label: "모집종료", variant: "secondary" },
  selection_completed: { label: "선정완료", variant: "outline" },
  cancelled: { label: "취소", variant: "destructive" },
};

export default function CampaignManagePage({ params }: CampaignManagePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: campaign, isLoading, error } = useCampaign(id);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateCampaignStatus(id);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-6 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-32 bg-slate-200 rounded" />
          <div className="h-64 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-600">체험단을 찾을 수 없습니다.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard")}>
            대시보드로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_LABEL[campaign.status] || STATUS_LABEL.recruiting;
  const canEndRecruit = campaign.status === "recruiting";
  const canCancel = campaign.status !== "cancelled" && campaign.status !== "selection_completed";

  const handleEndRecruit = () => {
    if (confirm("모집을 조기종료하시겠습니까?")) {
      updateStatus("recruit_ended");
    }
  };

  const handleCancel = () => {
    if (confirm("이 체험단을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      updateStatus("cancelled");
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-6 py-12">
      <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        대시보드로 돌아가기
      </Button>

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{campaign.title}</h1>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </div>
            <div className="mt-2 flex items-center gap-2 text-slate-600">
              <MapPin className="h-4 w-4" />
              <span>{campaign.location}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {canEndRecruit && (
              <Button
                variant="outline"
                onClick={handleEndRecruit}
                disabled={isUpdating}
              >
                모집 조기종료
              </Button>
            )}
            {canCancel && (
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                체험단 취소
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">모집 정보</h2>
            <div className="space-y-3">
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
            <p className="whitespace-pre-wrap text-sm text-slate-700">{campaign.description}</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">지원자 관리</h2>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
            <p className="text-slate-600">
              지원자 목록 기능은 구현 예정입니다
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

