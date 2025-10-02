# 블로그 체험단 SaaS — 데이터베이스 설계 문서

## 📊 데이터플로우 (Data Flow)

### 1️⃣ 회원가입 & 역할선택

```
사용자 입력
  ↓
[users] 레코드 생성
  ├── 이름, 이메일, 휴대폰, 역할(influencer/advertiser)
  ↓
[terms_agreements] 약관 동의 이력 저장
  └── 약관 버전, 동의 일시
```

**데이터 흐름:**
- Supabase Auth에서 사용자 계정 생성
- `users` 테이블에 프로필 정보 저장
- `terms_agreements` 테이블에 약관 동의 이력 기록
- 역할에 따라 다음 단계로 분기 (인플루언서 등록 / 광고주 등록)

---

### 2️⃣ 인플루언서 정보 등록

```
[users] (role = 'influencer')
  ↓
[influencer_profiles] 생성
  ├── 생년월일
  ├── 프로필 상태 (draft/pending/approved)
  ↓
[influencer_channels] 1:N 생성
  ├── 채널 유형 (instagram/youtube/blog/tiktok)
  ├── 채널명, URL
  └── 검증 상태 (pending/verified/failed)
```

**데이터 흐름:**
- `influencer_profiles` 테이블에 기본 프로필 생성
- `influencer_channels` 테이블에 SNS 채널 정보 저장 (다중 채널 가능)
- 채널 검증 상태는 비동기 검증 잡에 의해 업데이트
- 프로필이 승인되면 체험단 지원 가능

---

### 3️⃣ 광고주 정보 등록

```
[users] (role = 'advertiser')
  ↓
[advertiser_profiles] 생성
  ├── 업체명
  ├── 위치, 카테고리
  ├── 사업자등록번호
  └── 검증 상태 (pending/verified/failed)
```

**데이터 흐름:**
- `advertiser_profiles` 테이블에 광고주 정보 저장
- 사업자등록번호는 외부 API를 통해 비동기 검증
- 검증 완료 후 체험단 생성 권한 부여

---

### 4️⃣ 체험단 생성 (광고주)

```
[users] (role = 'advertiser')
  ↓
[advertiser_profiles] 권한 확인 (verified)
  ↓
[campaigns] 생성
  ├── 제목, 설명, 매장 위치
  ├── 혜택, 미션
  ├── 모집 인원, 모집 기간
  ├── 체험 기간
  └── 상태 = 'recruiting'
```

**데이터 흐름:**
- 광고주 프로필 검증 상태 확인
- `campaigns` 테이블에 체험단 정보 저장
- 초기 상태는 'recruiting' (모집 중)
- 홈 화면 체험단 목록에 자동 노출

---

### 5️⃣ 체험단 지원 (인플루언서)

```
[users] (role = 'influencer')
  ↓
[influencer_profiles] 등록 확인 (approved)
  ↓
[campaigns] 조회
  ├── 모집 중 (status = 'recruiting')
  ├── 모집 기간 내
  ↓
[applications] 생성
  ├── 각오 한마디
  ├── 방문 예정일자
  └── 상태 = 'submitted'
```

**데이터 흐름:**
- 인플루언서 프로필 승인 여부 확인
- 모집 중인 체험단 조회 및 필터링
- `applications` 테이블에 지원 정보 저장
- 중복 지원 방지 (UNIQUE 제약조건)
- 지원 완료 후 '내 지원 목록'에서 조회 가능

---

### 6️⃣ 지원자 선정 (광고주)

```
[campaigns] 조회
  ↓
[applications] 조회 (해당 체험단의 지원자 목록)
  ↓
광고주 선정 작업
  ↓
[campaigns] 상태 변경
  └── 'recruiting' → 'recruit_ended' → 'selection_completed'
  ↓
[applications] 상태 변경
  ├── 선정 인원 → 'selected'
  └── 나머지 → 'rejected'
```

**데이터 흐름:**
- 광고주가 체험단 상세에서 지원자 목록 조회
- 모집 종료 버튼 클릭 시 `campaigns.status` → 'recruit_ended'
- 선정 프로세스 실행 시:
  - 선정된 지원자: `applications.status` → 'selected'
  - 선정되지 않은 지원자: `applications.status` → 'rejected'
  - 체험단 상태: `campaigns.status` → 'selection_completed'
- 인플루언서는 '내 지원 목록'에서 상태 변경 확인

---

### 7️⃣ 내 지원 목록 조회 (인플루언서)

```
[users] (role = 'influencer')
  ↓
[applications] 조회
  ├── WHERE influencer_profile_id = current_user
  ├── 상태 필터 (submitted/selected/rejected)
  ↓
[campaigns] JOIN (체험단 정보)
  └── 체험단 제목, 매장 위치, 기간 등
```

**데이터 흐름:**
- 현재 로그인한 인플루언서의 지원 내역 조회
- 상태별 필터링 가능
- 체험단 정보와 JOIN하여 상세 정보 제공

---

### 8️⃣ 체험단 관리 (광고주)

```
[users] (role = 'advertiser')
  ↓
[campaigns] 조회
  ├── WHERE advertiser_profile_id = current_user
  ↓
각 체험단별
  ├── [applications] 조회 (지원자 수, 상태별 집계)
  └── 상태 전환 작업 (recruiting → recruit_ended → selection_completed)
```

**데이터 흐름:**
- 광고주가 등록한 체험단 목록 조회
- 각 체험단의 지원 현황 집계
- 상태 전환 및 선정 관리

---

## 🗄️ 데이터베이스 스키마

### ERD (Entity Relationship Diagram)

```
┌─────────────────┐
│     users       │
│─────────────────│
│ id (PK)         │
│ name            │
│ phone           │
│ email           │
│ role            │
└─────────────────┘
        │
        ├─────────────────────────────┐
        │                             │
        ▼                             ▼
┌─────────────────┐         ┌─────────────────┐
│ influencer_     │         │ advertiser_     │
│ profiles        │         │ profiles        │
│─────────────────│         │─────────────────│
│ id (PK)         │         │ id (PK)         │
│ user_id (FK)    │         │ user_id (FK)    │
│ birth_date      │         │ company_name    │
│ profile_status  │         │ location        │
└─────────────────┘         │ category        │
        │                   │ business_number │
        │                   │ verification_   │
        │                   │ status          │
        │                   └─────────────────┘
        │                           │
        ├───────────┐               │
        ▼           ▼               ▼
┌─────────────┐ ┌────────────┐ ┌──────────────┐
│ influencer_ │ │ applications│ │  campaigns   │
│ channels    │ │─────────────│ │──────────────│
│─────────────│ │ id (PK)     │ │ id (PK)      │
│ id (PK)     │ │ campaign_id │ │ advertiser_  │
│ influencer_ │ │   (FK)      │ │ profile_id   │
│ profile_id  │ │ influencer_ │ │   (FK)       │
│   (FK)      │ │ profile_id  │ │ title        │
│ channel_type│ │   (FK)      │ │ description  │
│ channel_name│ │ message     │ │ location     │
│ channel_url │ │ visit_date  │ │ benefits     │
│ verification│ │ status      │ │ mission      │
│ _status     │ └─────────────┘ │ recruit_count│
└─────────────┘        ▲        │ recruit_start│
                       │        │ _date        │
                       │        │ recruit_end_ │
                       │        │ date         │
                       └────────│ experience_  │
                                │ start_date   │
                                │ experience_  │
                                │ end_date     │
                                │ status       │
                                └──────────────┘

┌─────────────────┐
│ terms_          │
│ agreements      │
│─────────────────│
│ id (PK)         │
│ user_id (FK)    │
│ terms_version   │
│ agreed_at       │
└─────────────────┘
        ▲
        │
        └─── users
```

---

### 테이블 정의

#### 1. **users** (사용자)

사용자 기본 정보 및 역할 관리

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK | Supabase Auth user id |
| name | varchar(100) | NOT NULL | 이름 |
| phone | varchar(20) | NOT NULL | 휴대폰번호 |
| email | varchar(255) | NOT NULL, UNIQUE | 이메일 |
| role | enum | NOT NULL | 역할 ('influencer', 'advertiser') |
| created_at | timestamptz | NOT NULL | 생성일시 |
| updated_at | timestamptz | NOT NULL | 수정일시 |

**인덱스:**
- `idx_users_email` ON email
- `idx_users_role` ON role

---

#### 2. **terms_agreements** (약관 동의)

약관 동의 이력 관리

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK | 고유 ID |
| user_id | uuid | FK → users.id, NOT NULL | 사용자 ID |
| terms_version | varchar(50) | NOT NULL | 약관 버전 |
| agreed_at | timestamptz | NOT NULL | 동의 일시 |
| created_at | timestamptz | NOT NULL | 생성일시 |
| updated_at | timestamptz | NOT NULL | 수정일시 |

**인덱스:**
- `idx_terms_agreements_user_id` ON user_id

---

#### 3. **influencer_profiles** (인플루언서 프로필)

인플루언서 상세 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK | 고유 ID |
| user_id | uuid | FK → users.id, UNIQUE, NOT NULL | 사용자 ID |
| birth_date | date | NOT NULL | 생년월일 |
| profile_status | enum | NOT NULL, DEFAULT 'draft' | 프로필 상태 ('draft', 'pending', 'approved', 'rejected') |
| created_at | timestamptz | NOT NULL | 생성일시 |
| updated_at | timestamptz | NOT NULL | 수정일시 |

**인덱스:**
- `idx_influencer_profiles_user_id` ON user_id
- `idx_influencer_profiles_status` ON profile_status

---

#### 4. **influencer_channels** (인플루언서 SNS 채널)

인플루언서의 SNS 채널 정보 (1:N)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK | 고유 ID |
| influencer_profile_id | uuid | FK → influencer_profiles.id, NOT NULL | 인플루언서 프로필 ID |
| channel_type | enum | NOT NULL | 채널 유형 ('instagram', 'youtube', 'blog', 'tiktok') |
| channel_name | varchar(200) | NOT NULL | 채널명 |
| channel_url | varchar(500) | NOT NULL | 채널 URL |
| verification_status | enum | NOT NULL, DEFAULT 'pending' | 검증 상태 ('pending', 'verified', 'failed') |
| created_at | timestamptz | NOT NULL | 생성일시 |
| updated_at | timestamptz | NOT NULL | 수정일시 |

**인덱스:**
- `idx_influencer_channels_profile_id` ON influencer_profile_id
- `idx_influencer_channels_verification` ON verification_status

---

#### 5. **advertiser_profiles** (광고주 프로필)

광고주 상세 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK | 고유 ID |
| user_id | uuid | FK → users.id, UNIQUE, NOT NULL | 사용자 ID |
| company_name | varchar(200) | NOT NULL | 업체명 |
| location | varchar(500) | NOT NULL | 위치 |
| category | varchar(100) | NOT NULL | 카테고리 |
| business_number | varchar(50) | NOT NULL, UNIQUE | 사업자등록번호 |
| verification_status | enum | NOT NULL, DEFAULT 'pending' | 검증 상태 ('pending', 'verified', 'failed') |
| created_at | timestamptz | NOT NULL | 생성일시 |
| updated_at | timestamptz | NOT NULL | 수정일시 |

**인덱스:**
- `idx_advertiser_profiles_user_id` ON user_id
- `idx_advertiser_profiles_business_number` ON business_number
- `idx_advertiser_profiles_verification` ON verification_status

---

#### 6. **campaigns** (체험단)

체험단 모집 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK | 고유 ID |
| advertiser_profile_id | uuid | FK → advertiser_profiles.id, NOT NULL | 광고주 프로필 ID |
| title | varchar(200) | NOT NULL | 체험단 제목 |
| description | text | NOT NULL | 설명 |
| location | varchar(500) | NOT NULL | 매장 위치 |
| benefits | text | NOT NULL | 혜택 |
| mission | text | NOT NULL | 미션 |
| recruit_count | integer | NOT NULL | 모집 인원 |
| recruit_start_date | timestamptz | NOT NULL | 모집 시작일 |
| recruit_end_date | timestamptz | NOT NULL | 모집 종료일 |
| experience_start_date | date | NOT NULL | 체험 시작일 |
| experience_end_date | date | NOT NULL | 체험 종료일 |
| status | enum | NOT NULL, DEFAULT 'recruiting' | 상태 ('recruiting', 'recruit_ended', 'selection_completed', 'cancelled') |
| created_at | timestamptz | NOT NULL | 생성일시 |
| updated_at | timestamptz | NOT NULL | 수정일시 |

**제약조건:**
- `CHECK (recruit_end_date >= recruit_start_date)`
- `CHECK (experience_end_date >= experience_start_date)`
- `CHECK (recruit_count > 0)`

**인덱스:**
- `idx_campaigns_advertiser_id` ON advertiser_profile_id
- `idx_campaigns_status` ON status
- `idx_campaigns_recruit_dates` ON (recruit_start_date, recruit_end_date)
- `idx_campaigns_created_at` ON created_at DESC

---

#### 7. **applications** (체험단 지원)

인플루언서의 체험단 지원 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK | 고유 ID |
| campaign_id | uuid | FK → campaigns.id, NOT NULL | 체험단 ID |
| influencer_profile_id | uuid | FK → influencer_profiles.id, NOT NULL | 인플루언서 프로필 ID |
| message | text | NOT NULL | 각오 한마디 |
| visit_date | date | NOT NULL | 방문 예정일자 |
| status | enum | NOT NULL, DEFAULT 'submitted' | 지원 상태 ('submitted', 'selected', 'rejected') |
| created_at | timestamptz | NOT NULL | 생성일시 |
| updated_at | timestamptz | NOT NULL | 수정일시 |

**제약조건:**
- `UNIQUE (campaign_id, influencer_profile_id)` - 중복 지원 방지

**인덱스:**
- `idx_applications_campaign_id` ON campaign_id
- `idx_applications_influencer_id` ON influencer_profile_id
- `idx_applications_status` ON status
- `idx_applications_created_at` ON created_at DESC

---

## 🔗 관계 (Relationships)

### 1:1 관계
- `users` ←→ `influencer_profiles` (user_id UNIQUE)
- `users` ←→ `advertiser_profiles` (user_id UNIQUE)

### 1:N 관계
- `users` → `terms_agreements` (한 사용자는 여러 약관 동의 이력 보유)
- `influencer_profiles` → `influencer_channels` (한 인플루언서는 여러 SNS 채널 등록 가능)
- `influencer_profiles` → `applications` (한 인플루언서는 여러 체험단 지원 가능)
- `advertiser_profiles` → `campaigns` (한 광고주는 여러 체험단 등록 가능)
- `campaigns` → `applications` (한 체험단은 여러 지원자 보유)

### N:M 관계
- `influencer_profiles` ←→ `campaigns` (through `applications`)
  - 인플루언서와 체험단은 지원(applications)을 통해 다대다 관계

---

## 🎯 비즈니스 규칙

### 1. 역할 기반 접근 제어
- **인플루언서**: `influencer_profiles`이 'approved' 상태일 때만 체험단 지원 가능
- **광고주**: `advertiser_profiles`이 'verified' 상태일 때만 체험단 생성 가능

### 2. 체험단 상태 전환 규칙
```
recruiting → recruit_ended → selection_completed
                ↓
            cancelled (언제든지 가능)
```

### 3. 지원 상태 전환 규칙
```
submitted → selected (선정됨)
         → rejected (탈락)
```

### 4. 중복 방지
- 한 인플루언서는 동일 체험단에 중복 지원 불가 (UNIQUE 제약조건)
- 사업자등록번호는 중복 불가 (UNIQUE 제약조건)

### 5. 데이터 정합성
- 모집 종료일 >= 모집 시작일
- 체험 종료일 >= 체험 시작일
- 모집 인원 > 0
- 방문 예정일자는 체험 기간 내에 포함되어야 함 (애플리케이션 레벨에서 검증)

---

## 📈 쿼리 패턴

### 자주 사용되는 쿼리

#### 1. 홈 화면 - 모집 중인 체험단 목록
```sql
SELECT c.*, a.company_name
FROM campaigns c
JOIN advertiser_profiles a ON c.advertiser_profile_id = a.id
WHERE c.status = 'recruiting'
  AND c.recruit_start_date <= NOW()
  AND c.recruit_end_date >= NOW()
ORDER BY c.created_at DESC
LIMIT 20;
```

#### 2. 내 지원 목록 (인플루언서)
```sql
SELECT a.*, c.title, c.location, c.status as campaign_status
FROM applications a
JOIN campaigns c ON a.campaign_id = c.id
WHERE a.influencer_profile_id = :influencer_profile_id
  AND a.status = :filter_status  -- optional filter
ORDER BY a.created_at DESC;
```

#### 3. 체험단 지원자 목록 (광고주)
```sql
SELECT 
  a.*,
  u.name,
  u.email,
  ip.birth_date,
  COUNT(ic.id) as channel_count
FROM applications a
JOIN influencer_profiles ip ON a.influencer_profile_id = ip.id
JOIN users u ON ip.user_id = u.id
LEFT JOIN influencer_channels ic ON ip.id = ic.influencer_profile_id
WHERE a.campaign_id = :campaign_id
GROUP BY a.id, u.name, u.email, ip.birth_date
ORDER BY a.created_at ASC;
```

#### 4. 광고주 체험단 관리 목록
```sql
SELECT 
  c.*,
  COUNT(a.id) as total_applications,
  COUNT(CASE WHEN a.status = 'selected' THEN 1 END) as selected_count
FROM campaigns c
LEFT JOIN applications a ON c.id = a.campaign_id
WHERE c.advertiser_profile_id = :advertiser_profile_id
GROUP BY c.id
ORDER BY c.created_at DESC;
```

---

## 🔒 보안 고려사항

### 1. RLS (Row Level Security) - 비활성화
- 프로젝트 가이드라인에 따라 RLS는 사용하지 않음
- 애플리케이션 레벨에서 권한 제어 수행

### 2. 민감 정보 보호
- 사업자등록번호는 암호화 권장 (애플리케이션 레벨)
- 휴대폰번호는 마스킹 처리 (프론트엔드)

### 3. 데이터 검증
- 모든 입력값은 zod 스키마로 검증
- SQL Injection 방지를 위해 Prepared Statement 사용

---

## 🚀 성능 최적화 전략

### 1. 인덱스 전략
- 자주 조회되는 컬럼에 인덱스 생성 (status, dates, foreign keys)
- 복합 인덱스 활용 (recruit_start_date, recruit_end_date)

### 2. 쿼리 최적화
- JOIN 최소화
- 필요한 컬럼만 SELECT
- LIMIT를 통한 페이징 처리

### 3. 캐싱
- 홈 화면 체험단 목록은 캐싱 권장 (5분)
- React Query의 staleTime 활용

---

## 📝 마이그레이션 순서

1. **0002_create_core_tables.sql**
   - users, terms_agreements, profiles, campaigns, applications 테이블 생성
   - 기본 제약조건 및 외래키 설정

2. **0003_create_indexes.sql**
   - 모든 인덱스 생성

3. **0004_create_triggers.sql**
   - updated_at 자동 업데이트 트리거 생성

---

## 🎨 확장 고려사항

### 추후 추가 가능한 테이블

1. **notifications** - 알림 관리
2. **reviews** - 체험 후기
3. **audit_logs** - 감사 로그
4. **campaign_images** - 체험단 이미지
5. **messages** - 광고주-인플루언서 메시징

---

**문서 버전**: 1.0.0  
**최종 수정일**: 2025-10-01  
**작성자**: VibeMafia Development Team

