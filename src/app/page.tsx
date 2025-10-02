"use client";

import Link from "next/link";
import Image from "next/image";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { CampaignList } from "@/features/campaign/components/CampaignList";
import { Users, Store, TrendingUp, Shield, Zap, Heart } from "lucide-react";

type HomePageProps = {
  params: Promise<Record<string, never>>;
};

export default function HomePage({ params }: HomePageProps) {
  void params;
  const { isAuthenticated } = useCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-6 py-8">

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            모집 중인 체험단
          </h2>
          <CampaignList />
        </section>

        <section className="rounded-xl bg-slate-100 p-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            {isAuthenticated
              ? "새로운 체험단에 참여해보세요!"
              : "지금 가입하고 체험단에 참여하세요!"}
          </h2>
          <p className="mt-3 text-slate-600">
            {isAuthenticated
              ? "다양한 브랜드와 함께 특별한 경험을 만들어가세요"
              : "인플루언서라면 무료로 다양한 상품과 서비스를 체험할 수 있습니다"}
          </p>
          {!isAuthenticated && (
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/signup"
                className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-700"
              >
                회원가입하기
              </Link>
            </div>
          )}
        </section>

        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight text-slate-900">
              인플루언서와 광고주를
              <br />
              <span className="text-blue-600">연결하는 플랫폼</span>
            </h1>
            <p className="text-xl text-slate-600">
              체험단을 통해 브랜드를 알리고, 진정성 있는 콘텐츠를 만드세요.
              블로그 체험단 플랫폼이 함께합니다.
            </p>
            <div className="flex gap-4">
              <Link
                href="/signup"
                className="rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700"
              >
                무료로 시작하기
              </Link>
              <Link
                href="#features"
                className="rounded-lg border-2 border-slate-900 px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
              >
                자세히 알아보기
              </Link>
            </div>
          </div>

          <figure className="overflow-hidden rounded-2xl border border-slate-200 shadow-2xl">
            <Image
              src="https://picsum.photos/seed/hero/800/600"
              alt="체험단 플랫폼"
              width={800}
              height={600}
              className="h-full w-full object-cover"
              priority
            />
          </figure>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              왜 블로그 체험단인가요?
            </h2>
            <p className="mt-2 text-slate-600">
              인플루언서와 광고주 모두를 위한 최적의 솔루션
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-6 transition hover:shadow-lg">
              <div className="mb-4 inline-block rounded-lg bg-blue-100 p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">
                검증된 인플루언서
              </h3>
              <p className="text-slate-600">
                SNS 채널을 검증하여 신뢰할 수 있는 인플루언서만 매칭됩니다.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-6 transition hover:shadow-lg">
              <div className="mb-4 inline-block rounded-lg bg-green-100 p-3">
                <Store className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">
                간편한 체험단 관리
              </h3>
              <p className="text-slate-600">
                체험단 등록부터 지원자 선정까지 한 곳에서 관리하세요.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-6 transition hover:shadow-lg">
              <div className="mb-4 inline-block rounded-lg bg-purple-100 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">
                효과적인 마케팅
              </h3>
              <p className="text-slate-600">
                진정성 있는 리뷰로 브랜드 신뢰도를 높이고 매출을 증대하세요.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-6 transition hover:shadow-lg">
              <div className="mb-4 inline-block rounded-lg bg-orange-100 p-3">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">
                안전한 거래
              </h3>
              <p className="text-slate-600">
                사업자 등록증 검증으로 안전하고 투명한 거래를 보장합니다.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-6 transition hover:shadow-lg">
              <div className="mb-4 inline-block rounded-lg bg-pink-100 p-3">
                <Zap className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">
                빠른 매칭
              </h3>
              <p className="text-slate-600">
                AI 기반 매칭으로 최적의 인플루언서를 빠르게 찾아드립니다.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-6 transition hover:shadow-lg">
              <div className="mb-4 inline-block rounded-lg bg-red-100 p-3">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">
                진정성 있는 콘텐츠
              </h3>
              <p className="text-slate-600">
                실제 경험을 바탕으로 한 솔직한 리뷰로 신뢰를 구축하세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              어떻게 이용하나요?
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* 인플루언서 플로우 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full bg-blue-600 p-2">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  인플루언서
                </h3>
              </div>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    1
                  </span>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      회원가입 & SNS 채널 등록
                    </h4>
                    <p className="text-sm text-slate-600">
                      인스타그램, 유튜브, 블로그 등 운영 중인 채널을 등록하세요
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    2
                  </span>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      체험단 탐색 & 지원
                    </h4>
                    <p className="text-sm text-slate-600">
                      관심 있는 체험단을 찾고 각오 한마디와 함께 지원하세요
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    3
                  </span>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      선정 & 체험
                    </h4>
                    <p className="text-sm text-slate-600">
                      선정되면 체험 후 솔직한 리뷰 콘텐츠를 작성하세요
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* 광고주 플로우 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full bg-green-600 p-2">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">광고주</h3>
              </div>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600">
                    1
                  </span>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      회원가입 & 사업자 등록
                    </h4>
                    <p className="text-sm text-slate-600">
                      사업자 정보를 등록하고 검증을 완료하세요
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600">
                    2
                  </span>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      체험단 등록
                    </h4>
                    <p className="text-sm text-slate-600">
                      상품/서비스 정보와 모집 조건을 입력하여 체험단을
                      등록하세요
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600">
                    3
                  </span>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      지원자 선정 & 관리
                    </h4>
                    <p className="text-sm text-slate-600">
                      지원자 중 원하는 인플루언서를 선정하고 체험단을 관리하세요
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-900 py-16 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold">지금 시작하세요</h2>
          <p className="mb-8 text-slate-300">
            인플루언서든 광고주든, 블로그 체험단과 함께 성장하세요
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            무료로 시작하기
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="container mx-auto px-6 text-center text-sm text-slate-600">
          <p>© 2025 블로그 체험단. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
