import { NextResponse } from 'next/server';
import { AIService } from '@/utils/aiService';
import { HealthResponse } from '@/types/api';

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    let aiStatus = 'not_configured';
    
    if (apiKey) {
      const aiService = new AIService(apiKey);
      const isHealthy = await aiService.checkHealth();
      aiStatus = isHealthy ? 'healthy' : 'error';
    }

    const response: HealthResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'connected',
        ai: aiStatus
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('헬스 체크 오류:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'error',
        ai: 'error'
      }
    }, { status: 500 });
  }
}
