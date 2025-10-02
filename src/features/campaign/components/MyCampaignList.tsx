"use client";

import Link from "next/link";
import { useMyCampaigns } from "@/features/campaign/hooks/useCampaign";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  recruiting: { label: "모집중", variant: "default" },
  recruit_ended: { label: "모집종료", variant: "secondary" },
  selection_completed: { label: "선정완료", variant: "outline" },
  cancelled: { label: "취소", variant: "destructive" },
};

export function MyCampaignList() {
  const { isAuthenticated } = useCurrentUser();
  const { data: campaigns, isLoading, error } = useMyCampaigns(isAuthenticated);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="h-32 animate-pulse bg-slate-200 p-6" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-600">체험단 목록을 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="mb-4 text-slate-600">등록된 체험단이 없습니다.</p>
        <Link href="/campaigns/create">
          <Button>첫 체험단 등록하기</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => {
        const statusInfo = STATUS_LABEL[campaign.status] || STATUS_LABEL.recruiting;

        return (
          <Card key={campaign.id} className="group transition hover:shadow-md">
            <Link href={`/dashboard/campaigns/${campaign.id}`}>
              <div className="flex items-center justify-between p-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-600">
                      {campaign.title}
                    </h3>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{campaign.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>모집: {campaign.recruitCount}명</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        마감:{" "}
                        {format(new Date(campaign.recruitEndDate), "yyyy.MM.dd HH:mm", {
                          locale: ko,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1" />
              </div>
            </Link>
          </Card>
        );
      })}
    </div>
  );
}

