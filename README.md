# 블로그 체험단 SaaS 플랫폼

인플루언서와 광고주를 연결하는 체험단 매칭 플랫폼

## 🚀 시작하기

### 1. 환경 설정

#### 필수 요구사항
- Node.js 20.x 이상
- npm 또는 yarn
- Supabase 계정

#### 환경변수 설정

1. `.env.local` 파일을 생성합니다:
```bash
cp .env.example .env.local
```

2. Supabase 프로젝트 설정에서 다음 값을 가져와 `.env.local`에 입력합니다:
   - 프로젝트 URL
   - Anon (public) key
   - Service role key

**Supabase 키 확인 경로**:
```
Supabase Dashboard → Your Project → Settings → API
```

3. `.env.local` 파일 예시:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 데이터베이스 마이그레이션

Supabase Dashboard의 SQL Editor에서 다음 순서로 실행:

1. `supabase/migrations/0002_create_core_tables.sql`
2. `supabase/migrations/0003_create_indexes.sql`
3. `supabase/migrations/0004_create_triggers.sql`

또는 Supabase CLI 사용:
```bash
supabase db push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 📁 프로젝트 구조

```
├── docs/                    # 문서
│   ├── prd.md              # 제품 요구사항 정의서
│   ├── userflow.md         # 사용자 플로우
│   ├── database.md         # 데이터베이스 설계
│   └── 00N/                # 유스케이스별 상세 문서
│       ├── spec.md         # 유스케이스 명세
│       └── plan.md         # 구현 계획
│
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (protected)/    # 인증 필요 페이지
│   │   ├── api/            # API 라우트 (Hono)
│   │   ├── login/          # 로그인 페이지
│   │   └── signup/         # 회원가입 페이지
│   │
│   ├── features/           # 기능별 모듈
│   │   ├── auth/           # 인증
│   │   ├── signup/         # 회원가입
│   │   └── [feature]/
│   │       ├── backend/    # 백엔드 로직
│   │       │   ├── route.ts    # Hono 라우터
│   │       │   ├── service.ts  # 비즈니스 로직
│   │       │   ├── schema.ts   # Zod 스키마
│   │       │   └── error.ts    # 에러 정의
│   │       ├── components/ # React 컴포넌트
│   │       ├── hooks/      # Custom hooks
│   │       └── lib/        # 유틸리티
│   │
│   ├── backend/            # 공통 백엔드
│   │   ├── hono/           # Hono 앱 설정
│   │   ├── middleware/     # 미들웨어
│   │   ├── http/           # HTTP 응답 헬퍼
│   │   └── supabase/       # Supabase 클라이언트
│   │
│   ├── components/ui/      # shadcn-ui 컴포넌트
│   ├── lib/                # 공통 유틸리티
│   └── constants/          # 상수
│
└── supabase/
    └── migrations/         # 데이터베이스 마이그레이션
```

---

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Library**: shadcn-ui
- **State Management**: 
  - React Query (서버 상태)
  - Zustand (클라이언트 상태)
- **Form**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend
- **API Framework**: Hono
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **Validation**: Zod
- **HTTP Client**: Axios

### DevOps
- **Hosting**: Vercel (권장)
- **Database**: Supabase Cloud
- **Version Control**: Git

---

## 📚 주요 기능

### 인플루언서
- ✅ 회원가입 및 프로필 등록
- ✅ SNS 채널 연동
- ✅ 체험단 목록 탐색
- ✅ 체험단 지원
- ✅ 내 지원 목록 관리

### 광고주
- ✅ 회원가입 및 사업자 등록
- ✅ 체험단 등록 및 관리
- ✅ 지원자 목록 조회
- ✅ 지원자 선정 및 관리

---

## 🗄️ 데이터베이스

### 주요 테이블
- `users` - 사용자 정보
- `influencer_profiles` - 인플루언서 프로필
- `influencer_channels` - SNS 채널
- `advertiser_profiles` - 광고주 프로필
- `campaigns` - 체험단
- `applications` - 지원 내역
- `terms_agreements` - 약관 동의

상세 스키마는 [`docs/database.md`](./docs/database.md) 참조

---

## 🧪 테스트

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

---

## 📖 개발 가이드

### 코딩 컨벤션
- [AGENTS.md](./AGENTS.md) 참조
- TypeScript 사용
- Functional Programming 우선
- Early Returns 패턴
- Pure Functions

### 새 기능 추가 시
1. `docs/00N/spec.md` 작성 (유스케이스)
2. `docs/00N/plan.md` 작성 (구현 계획)
3. 마이그레이션 파일 생성 (필요 시)
4. Backend 구현 (route → service → schema)
5. Frontend 구현 (components → hooks → pages)
6. 테스트 작성

### shadcn-ui 컴포넌트 추가
```bash
npx shadcn@latest add [component-name]
```

---

## 🚢 배포

### Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경변수 설정 (Dashboard → Settings → Environment Variables)
3. 자동 배포 (main 브랜치 push 시)

### 환경변수 설정 (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

---

## 📝 라이선스

Private Project

---

## 👥 팀

- Senior Full-Stack Developer
- Product Manager
- UI/UX Designer

---

## 🔗 링크

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [shadcn-ui](https://ui.shadcn.com)
- [Next.js Docs](https://nextjs.org/docs)

---

## ❓ FAQ

### Q: 환경변수가 제대로 설정되었는지 확인하려면?
A: 개발 서버 실행 시 콘솔에 "환경 변수 검증 실패" 에러가 없으면 정상입니다.

### Q: Supabase 마이그레이션 순서는?
A: 0002 → 0003 → 0004 순서로 실행해야 합니다.

### Q: 로컬에서 Supabase를 실행해야 하나요?
A: 아니요, Supabase Cloud를 사용합니다. (로컬 실행 불필요)

### Q: TypeScript 에러가 발생하면?
A: `npm run lint` 로 확인 후 수정하거나, AGENTS.md의 코딩 가이드를 참고하세요.
