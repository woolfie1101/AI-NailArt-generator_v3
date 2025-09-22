import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export class ImageProcessor {
  /**
   * 이미지를 최적화합니다
   */
  static async optimizeImage(
    inputBuffer: Buffer,
    options: ImageProcessingOptions = {}
  ): Promise<Buffer> {
    const {
      width = 1024,
      height = 1024,
      quality = 85,
      format = 'jpeg'
    } = options;

    let processor = sharp(inputBuffer);

    // 크기 조정
    processor = processor.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    });

    // 포맷별 최적화
    switch (format) {
      case 'jpeg':
        processor = processor.jpeg({ quality });
        break;
      case 'png':
        processor = processor.png({ quality });
        break;
      case 'webp':
        processor = processor.webp({ quality });
        break;
    }

    return await processor.toBuffer();
  }

  /**
   * 이미지 메타데이터를 추출합니다
   */
  static async getImageMetadata(inputBuffer: Buffer) {
    const metadata = await sharp(inputBuffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: inputBuffer.length,
      hasAlpha: metadata.hasAlpha,
      channels: metadata.channels
    };
  }

  /**
   * 썸네일을 생성합니다
   */
  static async generateThumbnail(
    inputBuffer: Buffer,
    size: number = 200
  ): Promise<Buffer> {
    return await sharp(inputBuffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  /**
   * 안전한 파일명을 생성합니다
   */
  static generateSafeFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `upload_${timestamp}_${random}${ext}`;
  }

  /**
   * 업로드 디렉토리를 생성합니다
   */
  static ensureUploadDirectory(uploadDir: string): void {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  /**
   * 파일을 안전하게 저장합니다
   */
  static async saveFile(
    buffer: Buffer,
    filepath: string
  ): Promise<void> {
    const dir = path.dirname(filepath);
    this.ensureUploadDirectory(dir);
    fs.writeFileSync(filepath, buffer);
  }
}
