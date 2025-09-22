import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { AIService } from '@/utils/aiService';
import { GenerateRequest, GenerateResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const { imagePath, prompt, style }: GenerateRequest = await request.json();

    if (!imagePath) {
      return NextResponse.json({ 
        success: false,
        error: '이미지 경로가 필요합니다.' 
      }, { status: 400 });
    }

    // API 키 확인
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'AI API 키가 설정되지 않았습니다.'
      }, { status: 500 });
    }

    // 이미지 파일 존재 확인
    if (!fs.existsSync(imagePath)) {
      return NextResponse.json({
        success: false,
        error: '이미지 파일을 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // AI 서비스 초기화
    const aiService = new AIService(apiKey);

    // 네일 아트 생성
    const result = await aiService.generateNailArt(
      imagePath,
      prompt || '기본적인 네일 아트 디자인',
      style || '자연스러운'
    );

    const response: GenerateResponse = {
      success: true,
      result,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('AI 생성 오류:', error);
    return NextResponse.json({
      success: false,
      error: 'AI 네일 아트 생성 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
