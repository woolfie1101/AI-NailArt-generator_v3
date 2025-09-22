import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

export interface AIGenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class AIService {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * 네일 아트 디자인을 생성합니다
   */
  async generateNailArt(
    imagePath: string,
    prompt: string,
    style: string = '자연스러운',
    options: AIGenerationOptions = {}
  ): Promise<string> {
    try {
      const {
        model = 'gemini-1.5-flash',
        temperature = 0.7
      } = options;

      // 이미지 파일 읽기
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // Gemini 모델 초기화
      const modelInstance = this.genAI.getGenerativeModel({ 
        model,
        generationConfig: {
          temperature,
          maxOutputTokens: 2048,
        }
      });

      // 프롬프트 구성
      const fullPrompt = this.buildPrompt(prompt, style);

      // 이미지와 텍스트를 함께 처리
      const result = await modelInstance.generateContent([
        fullPrompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/jpeg'
          }
        }
      ]);

      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('AI 생성 오류:', error);
      throw new Error('AI 네일 아트 생성 중 오류가 발생했습니다.');
    }
  }

  /**
   * 프롬프트를 구성합니다
   */
  private buildPrompt(userPrompt: string, style: string): string {
    return `
당신은 전문적인 네일 아트 디자이너입니다. 제공된 손톱 이미지를 분석하고 ${style} 스타일의 아름다운 네일 아트 디자인을 제안해주세요.

사용자 요청: ${userPrompt}

다음 요소들을 포함하여 구체적인 디자인 설명을 제공해주세요:

1. **색상 팔레트**: 추천 색상과 그 조합
2. **디자인 패턴**: 사용할 패턴이나 모티브
3. **장식 요소**: 글리터, 스톤, 스티커 등 장식 아이템
4. **기법**: 그라데이션, 오므브레, 프렌치 등 적용할 기법
5. **단계별 설명**: 실제로 적용할 수 있는 구체적인 단계
6. **팁과 주의사항**: 더 나은 결과를 위한 조언

창의적이고 실현 가능한 디자인을 제안해주세요.
    `.trim();
  }

  /**
   * 스타일별 프롬프트를 생성합니다
   */
  static getStylePrompts(): Record<string, string> {
    return {
      '클래식': '우아하고 세련된 클래식 스타일',
      '모던': '현대적이고 트렌디한 모던 스타일',
      '플로럴': '꽃과 식물을 모티브로 한 자연스러운 스타일',
      '미니멀': '심플하고 깔끔한 미니멀 스타일',
      '글리터': '화려하고 반짝이는 글리터 스타일',
      '기하학적': '선과 도형을 활용한 기하학적 스타일',
      '바이브런트': '생생하고 밝은 색상의 대담한 스타일',
      '로맨틱': '로맨틱하고 우아한 스타일'
    };
  }

  /**
   * AI 서비스 상태를 확인합니다
   */
  async checkHealth(): Promise<boolean> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      await model.generateContent('Hello');
      return true;
    } catch (error) {
      console.error('AI 서비스 상태 확인 실패:', error);
      return false;
    }
  }
}
