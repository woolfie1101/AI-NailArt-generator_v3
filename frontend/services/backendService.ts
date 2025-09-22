import type { ImageData } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface UploadResponse {
  success: boolean;
  filename: string;
  filepath: string;
  size: number;
}

export interface GenerateResponse {
  success: boolean;
  result: string;
  timestamp: string;
}

export interface InspirationResponse {
  success: boolean;
  data: Array<{
    id: number;
    title: string;
    description: string;
    image: string;
    tags: string[];
  }>;
  total: number;
}

export class BackendService {
  /**
   * 이미지를 백엔드에 업로드합니다
   */
  static async uploadImage(imageFile: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${BACKEND_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '이미지 업로드에 실패했습니다.');
    }

    return await response.json();
  }

  /**
   * AI를 사용하여 네일 아트를 생성합니다
   */
  static async generateNailArt(
    imagePath: string,
    prompt: string,
    style: string = '자연스러운'
  ): Promise<GenerateResponse> {
    const response = await fetch(`${BACKEND_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imagePath,
        prompt,
        style,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'AI 생성에 실패했습니다.');
    }

    return await response.json();
  }

  /**
   * 영감 카테고리를 가져옵니다
   */
  static async getInspiration(category?: string, limit?: number): Promise<InspirationResponse> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (limit) params.append('limit', limit.toString());

    const response = await fetch(`${BACKEND_URL}/api/inspiration?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '영감 데이터를 가져오는데 실패했습니다.');
    }

    return await response.json();
  }

  /**
   * 서버 상태를 확인합니다
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/health`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      console.error('서버 상태 확인 실패:', error);
      return false;
    }
  }

  /**
   * ImageData를 File로 변환합니다
   */
  static imageDataToFile(imageData: ImageData, filename: string = 'image.jpg'): File {
    const byteCharacters = atob(imageData.data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: imageData.mimeType });
    return new File([blob], filename, { type: imageData.mimeType });
  }

  /**
   * File을 ImageData로 변환합니다
   */
  static async fileToImageData(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve({
          data: base64,
          mimeType: file.type,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
