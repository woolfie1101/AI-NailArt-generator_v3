#!/bin/bash

# AI Nail Art Generator - Google Cloud Run 배포 스크립트

set -e

echo "🚀 AI Nail Art Generator 배포 시작..."

# 환경 변수 확인
if [ -z "$GOOGLE_CLOUD_PROJECT" ]; then
    echo "❌ GOOGLE_CLOUD_PROJECT 환경변수가 설정되지 않았습니다."
    echo "export GOOGLE_CLOUD_PROJECT=your-project-id 를 실행하세요."
    exit 1
fi

# Supabase 환경 변수 확인
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Supabase 환경변수가 설정되지 않았습니다."
    echo "다음 환경변수를 설정하세요:"
    echo "export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "export NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo "export SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key"
    exit 1
fi

# Google AI API Key 확인
if [ -z "$GOOGLE_AI_API_KEY" ]; then
    echo "❌ GOOGLE_AI_API_KEY 환경변수가 설정되지 않았습니다."
    echo "export GOOGLE_AI_API_KEY=your_google_ai_api_key 를 실행하세요."
    exit 1
fi

# Google Cloud CLI 인증 확인
echo "🔍 Google Cloud 인증 확인 중..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "."; then
    echo "❌ Google Cloud에 로그인이 필요합니다."
    echo "gcloud auth login 을 실행하세요."
    exit 1
fi

# 프로젝트 설정
echo "📋 프로젝트 설정: $GOOGLE_CLOUD_PROJECT"
gcloud config set project $GOOGLE_CLOUD_PROJECT

# API 활성화
echo "🔧 필요한 API 활성화 중..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Artifact Registry 저장소 생성 (이미 있으면 무시)
echo "📦 Artifact Registry 저장소 설정 중..."
gcloud artifacts repositories create ai-nail-art \
    --repository-format=docker \
    --location=asia-northeast3 \
    --description="AI Nail Art Generator repository" || true

# Docker 인증 설정
echo "🔐 Docker 인증 설정 중..."
gcloud auth configure-docker asia-northeast3-docker.pkg.dev

# Docker buildx 설정 (멀티플랫폼 지원)
echo "🔧 Docker buildx 설정 중..."
docker buildx create --use --name multiplatform || docker buildx use multiplatform

# Docker 이미지 빌드 및 푸시 (AMD64 플랫폼용)
echo "🏗️  Docker 이미지 빌드 중 (AMD64 플랫폼)..."
IMAGE_NAME="asia-northeast3-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/ai-nail-art/ai-nail-art-generator:latest"

docker buildx build \
  --platform linux/amd64 \
  --push \
  -t $IMAGE_NAME \
  .

# Cloud Run 배포
echo "☁️  Cloud Run에 배포 중..."
gcloud run deploy ai-nail-art-generator \
  --image=$IMAGE_NAME \
  --region=asia-northeast3 \
  --platform=managed \
  --allow-unauthenticated \
  --port=3001 \
  --memory=1Gi \
  --cpu=1 \
  --max-instances=10 \
  --set-env-vars="NODE_ENV=production,NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY,GOOGLE_AI_API_KEY=$GOOGLE_AI_API_KEY"

echo "✅ 배포 완료!"
echo "🌐 서비스 URL:"
gcloud run services describe ai-nail-art-generator --region=asia-northeast3 --format="value(status.url)"