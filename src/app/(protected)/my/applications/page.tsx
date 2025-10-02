'use client';

import { useMyApplications } from '@/features/application/hooks/useApplication';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const STATUS_MAP = {
  submitted: { label: '신청완료', variant: 'secondary' as const },
  selected: { label: '선정', variant: 'default' as const },
  rejected: { label: '반려', variant: 'destructive' as const },
};

export default function MyApplicationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useCurrentUser();
  const { data: applications, isLoading } = useMyApplications(isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || isLoading) {
    return (
      <div className="container mx-auto flex min-h-[400px] items-center justify-center px-6 py-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">내 지원 목록</h1>
        <p className="mt-2 text-muted-foreground">
          지원한 체험단의 상태를 확인하세요
        </p>
      </div>

      {!applications || applications.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center py-12">
            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">지원한 체험단이 없습니다</p>
            <p className="mt-2 text-sm text-muted-foreground">
              관심있는 체험단에 지원해보세요
            </p>
            <Link
              href="/"
              className="mt-6 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              체험단 둘러보기
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {applications.map((application) => (
            <Card key={application.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/campaigns/${application.campaignId}`}>
                      <CardTitle className="hover:text-primary">
                        {application.campaignTitle}
                      </CardTitle>
                    </Link>
                    <CardDescription className="mt-2 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        방문 예정: {application.visitDate}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant={STATUS_MAP[application.status].variant}>
                    {STATUS_MAP[application.status].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">각오 한마디</p>
                    <p className="mt-1 text-sm">{application.message}</p>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
                    <span>
                      지원일: {new Date(application.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                    <Link
                      href={`/campaigns/${application.campaignId}`}
                      className="text-primary hover:underline"
                    >
                      체험단 상세 보기 →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

