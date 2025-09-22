// API 응답 타입 정의

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadResponse {
  success: boolean;
  filename: string;
  filepath: string;
  size: number;
}

export interface GenerateRequest {
  imagePath: string;
  prompt?: string;
  style?: string;
}

export interface GenerateResponse {
  success: boolean;
  result: string;
  timestamp: string;
}

export interface InspirationItem {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
}

export interface InspirationResponse {
  success: boolean;
  data: InspirationItem[];
  total: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  services: {
    database: string;
    ai: string;
  };
}

// 에러 타입
export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: any;
}
