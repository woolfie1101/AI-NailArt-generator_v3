import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { ImageProcessor } from '@/utils/imageProcessor';
import { UploadResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ 
        success: false,
        error: '이미지 파일이 필요합니다.' 
      }, { status: 400 });
    }

    // 파일 유효성 검사
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        success: false,
        error: '이미지 파일만 업로드 가능합니다.'
      }, { status: 400 });
    }

    // 파일 크기 검사 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: '파일 크기는 10MB를 초과할 수 없습니다.'
      }, { status: 400 });
    }

    // 파일을 버퍼로 변환
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 이미지 메타데이터 확인
    const metadata = await ImageProcessor.getImageMetadata(buffer);
    console.log('이미지 메타데이터:', metadata);
    
    // 이미지 최적화
    const optimizedBuffer = await ImageProcessor.optimizeImage(buffer, {
      width: 1024,
      height: 1024,
      quality: 85,
      format: 'jpeg'
    });

    // 안전한 파일명 생성
    const filename = ImageProcessor.generateSafeFilename(file.name);
    const uploadDir = path.join(process.cwd(), 'uploads');
    const filepath = path.join(uploadDir, filename);

    // 파일 저장
    await ImageProcessor.saveFile(optimizedBuffer, filepath);

    const response: UploadResponse = {
      success: true,
      filename,
      filepath,
      size: optimizedBuffer.length
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('파일 업로드 오류:', error);
    return NextResponse.json({
      success: false,
      error: '파일 업로드 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
