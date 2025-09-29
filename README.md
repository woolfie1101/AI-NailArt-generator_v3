# AI 네일 아트 생성기

AI를 활용한 네일 아트 디자인 생성 애플리케이션입니다. Google OAuth 인증, 사용자별 이미지 저장, 구독 기반 요금제를 지원합니다.

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=flat-square&logo=github)](https://github.com/woolfie1101/AI-NailArt-generator_v3)
[![React](https://img.shields.io/badge/React-18+-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)

## 프로젝트 구조

⚠️ **통합 완료**: 프론트엔드와 백엔드가 하나의 Next.js 프로젝트로 통합되었습니다.

```
ai-nail-art-generator/
├── backend/                          # 통합된 Next.js 풀스택 애플리케이션
│   ├── src/
│   │   ├── app/                      # Next.js App Router
│   │   │   ├── api/                  # API 라우트
│   │   │   ├── globals.css           # 글로벌 스타일
│   │   │   ├── layout.tsx            # 루트 레이아웃
│   │   │   └── page.tsx              # 홈페이지
│   │   ├── components/               # React 컴포넌트
│   │   ├── context/                  # React Context (인증 등)
│   │   ├── hooks/                    # 커스텀 훅
│   │   ├── lib/                      # 라이브러리 (Supabase 등)
│   │   ├── services/                 # API 서비스
│   │   ├── types/                    # TypeScript 타입 정의
│   │   └── utils/                    # 유틸리티 함수
│   ├── public/                       # 정적 파일 (파비콘 등)
│   ├── App.tsx                       # 메인 React 앱
│   ├── .env                          # 배포용 환경 변수
│   ├── .env.local                    # 로컬 개발용 환경 변수
│   └── package.json
├── Dockerfile                        # Docker 배포 설정
├── deploy.sh                         # 배포 스크립트
└── README.md
```

## 통합된 Next.js 애플리케이션

프론트엔드와 백엔드가 하나의 Next.js 프로젝트로 통합되어 있습니다.

### 기능

- **이미지 업로드**: `/api/upload` - 손톱 이미지 업로드 및 최적화
- **AI 생성**: `/api/generate` - Google Gemini를 활용한 네일 아트 디자인 생성
- **영감 데이터**: `/api/inspiration` - 네일 아트 영감 카테고리 제공
- **헬스 체크**: `/api/health` - 서버 상태 확인

### 환경 설정

#### 로컬 개발용 환경 변수

`backend/.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Google Gemini AI API Key
NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 서버 설정
NODE_ENV=development

# 파일 업로드 설정
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

#### 배포용 환경 변수

`backend/.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Google Gemini AI API Key
NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 프로덕션 설정
NODE_ENV=production

# 파일 업로드 설정
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

#### API 키 발급 방법

1. **Google Gemini API 키**:
   - [Google AI Studio](https://makersuite.google.com/app/apikey)에서 API 키 발급

2. **Supabase 설정**:
   - [Supabase 대시보드](https://supabase.com/dashboard)에서 프로젝트 생성
   - Settings > API에서 URL과 키 복사

### 로컬 개발 실행 방법

```bash
# 1. 프로젝트 루트에서 backend 폴더로 이동
cd backend

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정 (.env.local 파일 생성 후 위의 환경 변수 입력)

# 4. 개발 서버 실행
npm run dev
```

애플리케이션은 `http://localhost:3000`에서 실행됩니다.

### API 엔드포인트

#### POST /api/upload
이미지 파일을 업로드하고 최적화합니다.

**요청:**
- `multipart/form-data` 형식
- `image` 필드에 이미지 파일

**응답:**
```json
{
  "success": true,
  "filename": "upload_1234567890.jpg",
  "filepath": "/path/to/uploads/upload_1234567890.jpg",
  "size": 123456
}
```

#### POST /api/generate
AI를 활용하여 네일 아트 디자인을 생성합니다.

**요청:**
```json
{
  "imagePath": "/path/to/uploaded/image.jpg",
  "prompt": "자연스러운 꽃무늬 디자인",
  "style": "플로럴"
}
```

**응답:**
```json
{
  "success": true,
  "result": "생성된 네일 아트 디자인 설명...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### GET /api/inspiration
네일 아트 영감 카테고리를 조회합니다.

**쿼리 파라미터:**
- `category`: 카테고리 필터 (선택사항)
- `limit`: 결과 개수 제한 (선택사항)

**응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "클래식 프렌치",
      "description": "우아하고 세련된 프렌치 매니큐어 스타일",
      "image": "/inspiration/french.jpg",
      "tags": ["클래식", "우아함", "세련됨"]
    }
  ],
  "total": 6
}
```

#### GET /api/health
서버 상태를 확인합니다.

**응답:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "ai": "configured"
  }
}
```

## 개발 가이드

### 통합 개발 환경
- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **인증**: Supabase Auth (Google OAuth)
- **데이터베이스**: Supabase PostgreSQL
- **AI**: Google Gemini API
- **UI 컴포넌트**: React + Lucide React
- **이미지 처리**: Sharp
- **다국어 지원**: 한국어/영어
- **반응형 디자인**: 모바일 최적화

## 배포 가이드

### Google Cloud Run 배포

#### 1. 사전 준비

```bash
# Google Cloud CLI 설치 및 로그인
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Docker 및 Cloud Run 서비스 활성화
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

#### 2. Docker 이미지 빌드

```bash
# 프로젝트 루트에서 실행
# AMD64 플랫폼용 이미지 빌드 (Cloud Run 호환성)
docker buildx build --platform linux/amd64 -t ai-nail-art-generator .
```

#### 3. 이미지 태그 및 푸시

```bash
# Google Container Registry에 태그
docker tag ai-nail-art-generator gcr.io/YOUR_PROJECT_ID/ai-nail-art-generator

# 이미지 푸시
docker push gcr.io/YOUR_PROJECT_ID/ai-nail-art-generator
```

#### 4. Cloud Run 배포

```bash
# Cloud Run 서비스 배포
gcloud run deploy ai-nail-art-generator \
  --image gcr.io/YOUR_PROJECT_ID/ai-nail-art-generator \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10
```

#### 5. 환경 변수 설정

배포 전에 다음 환경 변수들을 설정해야 합니다:

```bash
# Supabase 설정
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
export SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"

# Google AI 설정
export GOOGLE_AI_API_KEY="your_google_ai_api_key"

# Google Cloud 프로젝트 설정
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

**중요한 Supabase 설정:**

1. **Supabase 프로젝트 생성**: [Supabase](https://supabase.com)에서 새 프로젝트를 생성하세요.

2. **OAuth 리다이렉트 URL 설정**: Supabase 대시보드 > Authentication > URL Configuration에서 다음 URL들을 추가하세요:
   - `https://your-cloud-run-url.run.app/home`
   - `https://your-cloud-run-url.run.app/auth/callback`
   - `http://localhost:3001/home` (로컬 개발용)

3. **Google OAuth 설정**: Supabase 대시보드 > Authentication > Providers > Google에서 Google OAuth를 활성화하고 클라이언트 ID와 시크릿을 설정하세요.

4. **데이터베이스 마이그레이션**: `supabase/migrations/` 폴더의 SQL 파일을 Supabase에서 실행하세요.

배포 스크립트가 자동으로 환경 변수를 Cloud Run에 설정합니다.

### 코드 수정 후 재배포 방법

코드를 수정한 후 다시 배포하려면 다음 단계를 따르세요:

```bash
# 1. Docker 이미지 재빌드
docker buildx build --platform linux/amd64 -t ai-nail-art-generator .

# 2. 새 버전으로 태그 (선택사항 - 버전 관리용)
docker tag ai-nail-art-generator gcr.io/YOUR_PROJECT_ID/ai-nail-art-generator:v1.1

# 3. 이미지 푸시
docker push gcr.io/YOUR_PROJECT_ID/ai-nail-art-generator
# 또는 버전 태그 사용시
# docker push gcr.io/YOUR_PROJECT_ID/ai-nail-art-generator:v1.1

# 4. Cloud Run 서비스 업데이트
gcloud run deploy ai-nail-art-generator \
  --image gcr.io/YOUR_PROJECT_ID/ai-nail-art-generator \
  --platform managed \
  --region asia-northeast3
```

### 자동 배포 스크립트

빠른 재배포를 위해 `deploy.sh` 스크립트를 사용할 수 있습니다:

```bash
# 실행 권한 부여
chmod +x deploy.sh

# 배포 실행
./deploy.sh
```

### 배포 후 확인사항

1. **서비스 상태 확인**:
   ```bash
   gcloud run services describe ai-nail-art-generator --region asia-northeast3
   ```

2. **로그 확인**:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=ai-nail-art-generator" --limit 50
   ```

3. **브라우저에서 접속 테스트**:
   - 배포된 URL로 접속하여 기능 테스트
   - Google OAuth 로그인 테스트
   - AI 이미지 생성 기능 테스트

### 환경별 설정

- **개발 환경**: `npm run dev` (localhost:3000)
- **프로덕션 환경**: Cloud Run (HTTPS 자동 제공)
- **환경 변수**: 개발용 `.env.local`, 배포용 `.env`

## 라이선스

MIT License
