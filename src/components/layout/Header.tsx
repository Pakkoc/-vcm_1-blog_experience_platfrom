"use client";

import Link from "next/link";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { USER_ROLE } from "@/constants/roles";

export function Header() {
  const { user, isAuthenticated, logout } = useCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link 
          href="/" 
          className="flex items-center space-x-2 transition-opacity hover:opacity-80"
        >
          <h1 className="text-2xl font-bold text-primary">블로그 체험단</h1>
        </Link>

        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {user?.role === USER_ROLE.ADVERTISER && (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost">대시보드</Button>
                  </Link>
                  <Link href="/campaigns/create">
                    <Button variant="ghost">체험단 등록</Button>
                  </Link>
                </>
              )}
              
              {user?.role === USER_ROLE.INFLUENCER && (
                <Link href="/my/applications">
                  <Button variant="ghost">내 지원 목록</Button>
                </Link>
              )}
              
              <Button variant="outline" onClick={logout}>
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">로그인</Button>
              </Link>
              <Link href="/signup">
                <Button>회원가입</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

