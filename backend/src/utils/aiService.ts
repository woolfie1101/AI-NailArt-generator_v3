import { GoogleGenerativeAI } from '@google/generative-ai';
export class AIService {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateNailArt(params: GenerateNailArtParams): Promise<GeneratedImageResult> {
    const {
      baseImage,
      styleImage,
      prompt,
      mode = 'inspiration',
      isRegeneration = false,
    } = params;

    if (!baseImage?.data) {
      throw new Error('Base image data is required for generation.');
    }

    try {
      const modelInstance = this.genAI.getGenerativeModel({
        model: params.model ?? 'gemini-1.5-flash',
        generationConfig: {
          temperature: params.temperature ?? 0.7,
          maxOutputTokens: params.maxTokens ?? 2048,
        },
      });

      const parts: Array<
        | { text: string }
        | { inlineData: { data: string; mimeType: string } }
      > = [];

      const promptText = buildPrompt({
        prompt,
        mode,
        isRegeneration,
      });

      parts.push({ inlineData: baseImage });

      if (!isRegeneration && styleImage) {
        parts.push({ inlineData: styleImage });
      }

      parts.push({ text: promptText });

      const result = await modelInstance.generateContent(parts);
      const response = await result.response;

      const allParts = (response.candidates ?? []).flatMap((candidate) => candidate.content?.parts ?? []);

      const imagePart = allParts.find(isInlineDataPart);

      if (imagePart) {
        return {
          data: imagePart.inlineData.data,
          mimeType: imagePart.inlineData.mimeType ?? 'image/png',
        };
      }

      const textPart = allParts.find(isTextPart);

      if (textPart) {
        console.warn('Gemini API returned text instead of an image:', textPart.text);
      }

      throw new Error('AI response did not contain an image payload.');
    } catch (error) {
      console.error('AI 생성 오류:', error);
      throw new Error('AI 네일 아트 생성 중 오류가 발생했습니다.');
    }
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

interface GenerateNailArtParams {
  baseImage: { data: string; mimeType: string };
  styleImage?: { data: string; mimeType: string } | null;
  prompt: string;
  mode?: 'inspiration' | 'tryon';
  isRegeneration?: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface GeneratedImageResult {
  data: string;
  mimeType: string;
}

interface InlineDataPart {
  inlineData: {
    data: string;
    mimeType?: string;
  };
  text?: never;
}

interface TextPart {
  text: string;
  inlineData?: never;
}

function buildPrompt({
  prompt,
  mode,
  isRegeneration,
}: {
  prompt: string;
  mode: 'inspiration' | 'tryon';
  isRegeneration: boolean;
}): string {
  const qualityInstructions =
    'The resulting nail art must be hyper-photorealistic, seamlessly blended with the original hand photo. Match lighting, shadows, and reflections. Preserve the hand shape, pose, skin texture, and nail shape. Apply a glossy finish.';

  if (isRegeneration) {
    const crucialRule =
      'Crucial rule: Only modify the nail art. Do not alter the hand shape, pose, skin texture, nail shape, or background.';
    return `Edit the nail art on the hand in the image based on the following instruction: "${prompt}". ${qualityInstructions} ${crucialRule}`;
  }

  if (mode === 'tryon') {
    return `Objective: transfer the nail art design from the reference image onto the client's hand photo with perfect realism. ${qualityInstructions}

1. Nail shape and length must match the base hand exactly.
2. Preserve the hand and background from the base image.
3. Map designs finger-to-finger when multiple patterns exist; otherwise create a cohesive set.
4. Produce a result indistinguishable from a real-world manicure.

User request: "${prompt}".`;
  }

  const crucialRule =
    'ABSOLUTE DIRECTIVE: Preserve the original nail shape and length from the base image. Only the nail art changes.';
  return `Apply nail art to the hand photo inspired by the reference image. The user request: "${prompt}". ${qualityInstructions} ${crucialRule}`;
}

function isInlineDataPart(part: unknown): part is InlineDataPart {
  if (typeof part !== 'object' || part === null) {
    return false;
  }

  const candidate = part as { inlineData?: unknown };
  if (!candidate.inlineData || typeof candidate.inlineData !== 'object') {
    return false;
  }

  const inline = candidate.inlineData as { data?: unknown; mimeType?: unknown };
  return typeof inline.data === 'string';
}

function isTextPart(part: unknown): part is TextPart {
  if (typeof part !== 'object' || part === null) {
    return false;
  }

  const candidate = part as { text?: unknown };
  return typeof candidate.text === 'string';
}
