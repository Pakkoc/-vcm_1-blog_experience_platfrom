"use client";

import Link from "next/link";
import { MapPin, Users, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CampaignListItem } from "@/features/campaign/lib/dto";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

type CampaignCardProps = {
  campaign: CampaignListItem;
};

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  recruiting: { label: "모집중", variant: "default" },
  recruit_ended: { label: "모집종료", variant: "secondary" },
  selection_completed: { label: "선정완료", variant: "outline" },
  cancelled: { label: "취소", variant: "destructive" },
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  const statusInfo = STATUS_LABEL[campaign.status] || STATUS_LABEL.recruiting;

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <Card className="group overflow-hidden transition hover:shadow-lg">
        <div className="aspect-video w-full bg-gradient-to-br from-slate-100 to-slate-200">
          <div className="flex h-full items-center justify-center">
            <img
              src={`https://picsum.photos/seed/${campaign.id}/400/300`}
              alt={campaign.title}
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 flex-1 font-semibold text-slate-900 transition group-hover:text-slate-600">
              {campaign.title}
            </h3>
            <Badge variant={statusInfo.variant} className="shrink-0">
              {statusInfo.label}
            </Badge>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{campaign.location}</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0" />
              <span>모집 인원: {campaign.recruitCount}명</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                마감:{" "}
                {format(new Date(campaign.recruitEndDate), "yyyy.MM.dd HH:mm", {
                  locale: ko,
                })}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

