"use client";

import Link from "next/link";
import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { USER_ROLE } from "@/constants/roles";
import { MyCampaignList } from "@/features/campaign/components/MyCampaignList";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type DashboardPageProps = {
  params: Promise<Record<string, never>>;
};

export default function DashboardPage({ params }: DashboardPageProps) {
  void params;
  const { user } = useCurrentUser();
  const router = useRouter();

  const isAdvertiser = user?.role === USER_ROLE.ADVERTISER;

  useEffect(() => {
    if (user && user.role === USER_ROLE.INFLUENCER) {
      router.replace('/my/applications');
    }
  }, [user, router]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">대시보드</h1>
          <p className="mt-1 text-slate-600">
            {user?.email ?? "알 수 없는 사용자"} 님, 환영합니다
          </p>
        </div>
        {isAdvertiser && (
          <Link href="/campaigns/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              체험단 등록
            </Button>
          </Link>
        )}
      </header>

      {isAdvertiser && (
        <section>
          <h2 className="mb-4 text-2xl font-semibold">내 체험단 관리</h2>
          <MyCampaignList />
        </section>
      )}
    </div>
  );
}
