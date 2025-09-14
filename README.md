# AI 네일 아트 생성기

AI를 활용한 네일 아트 디자인 생성 애플리케이션입니다. Google OAuth 인증, 사용자별 이미지 저장, 구독 기반 요금제를 지원합니다.

## 프로젝트 구조

```
ai-nail-art-generator/
├── frontend/                         # 프론트엔드 (React + Vite)
│   ├── src/
│   │   ├── components/               # React 컴포넌트
│   │   ├── context/                  # React Context (인증 등)
│   │   ├── hooks/                    # 커스텀 훅
│   │   ├── lib/                      # 유틸리티 라이브러리
│   │   ├── services/                 # API 서비스
│   │   └── utils/                    # 유틸리티 함수
│   ├── public/                       # 정적 파일
│   └── package.json
├── backend/                          # 백엔드 (Next.js API)
│   ├── src/
│   │   ├── app/api/                  # API 라우트
│   │   ├── lib/                      # 라이브러리 (Supabase 등)
│   │   ├── types/                    # TypeScript 타입 정의
│   │   └── utils/                    # 유틸리티 함수
│   └── package.json
└── README.md
```

## 프론트엔드 (frontend)

React + Vite로 구성된 프론트엔드 애플리케이션입니다.

### 실행 방법

```bash
cd frontend
npm install
npm run dev
```

## 백엔드 (backend)

Next.js API Routes로 구성된 백엔드 서버입니다.

### 기능

- **이미지 업로드**: `/api/upload` - 손톱 이미지 업로드 및 최적화
- **AI 생성**: `/api/generate` - Google Gemini를 활용한 네일 아트 디자인 생성
- **영감 데이터**: `/api/inspiration` - 네일 아트 영감 카테고리 제공
- **헬스 체크**: `/api/health` - 서버 상태 확인

### 환경 설정

1. `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# AI API Keys
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

2. Google Gemini API 키를 발급받아 설정하세요:
   - [Google AI Studio](https://makersuite.google.com/app/apikey)에서 API 키 발급

### 실행 방법

```bash
cd backend
npm install
npm run dev
```

백엔드 서버는 `http://localhost:3001`에서 실행됩니다.

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

### 프론트엔드 개발
- React + TypeScript + Vite 환경
- 다국어 지원 (한국어/영어)
- 반응형 디자인

### 백엔드 개발
- Next.js API Routes
- TypeScript
- Google Gemini AI 연동
- 이미지 처리 (Sharp)
- 파일 업로드 (Multer)

## 배포

### 프론트엔드
```bash
cd AI-nail-art-generator-version-2
npm run build
```

### 백엔드
```bash
cd backend
npm run build
npm start
```

## 라이선스

MIT License
