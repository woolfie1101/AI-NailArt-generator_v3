import { NextRequest, NextResponse } from 'next/server';

// 네일 아트 영감 데이터
const inspirationData = [
  {
    id: 1,
    title: "클래식 프렌치",
    description: "우아하고 세련된 프렌치 매니큐어 스타일",
    image: "/inspiration/french.jpg",
    tags: ["클래식", "우아함", "세련됨"]
  },
  {
    id: 2,
    title: "플로럴 아트",
    description: "꽃과 식물을 모티브로 한 자연스러운 디자인",
    image: "/inspiration/floral.jpg",
    tags: ["자연", "꽃", "부드러움"]
  },
  {
    id: 3,
    title: "기하학적 패턴",
    description: "선과 도형을 활용한 모던한 디자인",
    image: "/inspiration/geometric.jpg",
    tags: ["모던", "기하학", "대담함"]
  },
  {
    id: 4,
    title: "글리터 & 스팽클",
    description: "반짝이는 장식으로 화려한 느낌",
    image: "/inspiration/glitter.jpg",
    tags: ["화려함", "반짝임", "파티"]
  },
  {
    id: 5,
    title: "미니멀리스트",
    description: "심플하고 깔끔한 디자인",
    image: "/inspiration/minimalist.jpg",
    tags: ["심플", "깔끔함", "미니멀"]
  },
  {
    id: 6,
    title: "바이브런트 컬러",
    description: "생생하고 밝은 색상의 대담한 디자인",
    image: "/inspiration/vibrant.jpg",
    tags: ["밝음", "대담함", "컬러풀"]
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');

    let filteredData = inspirationData;

    // 카테고리 필터링
    if (category) {
      filteredData = inspirationData.filter(item => 
        item.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
      );
    }

    // 개수 제한
    if (limit) {
      const limitNum = parseInt(limit);
      filteredData = filteredData.slice(0, limitNum);
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      total: filteredData.length
    });

  } catch (error) {
    console.error('영감 데이터 조회 오류:', error);
    return NextResponse.json(
      { error: '영감 데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
