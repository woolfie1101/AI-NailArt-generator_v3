export const translations = {
  en: {
    // Header
    headerTitle: 'AI Nail Art Studio',
    headerSubtitle: 'Turn your nail art dreams into reality.',
    
    // Inspiration Carousel
    inspirationTitle: 'Get Inspired',
    inspirationAlt: 'Nail art inspiration',

    // Mode Selector
    generationMode: 'Generation Mode',
    inspirationMode: 'Inspiration',
    tryonMode: 'Try On',
    inspirationModeDesc: 'Generate new art inspired by a style image.',
    tryonModeDesc: 'Apply an existing nail art design to your hand.',

    // Image Uploaders
    handPhotoTitleInspiration: 'Your Hand Photo',
    handPhotoTitleTryon: 'Your Hand (Nail shape will be kept)',
    handPhotoDesc: 'Capture your entire hand with all nails visible. Bare, unpolished nails work best for a clean application.',
    styleImageTitleInspiration: 'Style Reference Image',
    styleImageTitleTryon: 'Nail Art Design Photo',
    styleImageDescInspiration: 'Upload any image with the mood or style you want to create.',
    styleImageDescTryon: 'For best results, use a photo showing a full set of the desired nail art.',
    changeImage: 'Change Image',
    clickToUpload: 'Click to upload',
    dragAndDrop: 'or drag & drop',
    imageFormats: 'PNG, JPG, etc.',

    // Prompt
    promptLabel: 'Describe your desired mood (Optional)',
    promptPlaceholder: "e.g., 'cosmic glitter', 'delicate floral', 'bold geometric'",

    // Generate Button
    generateButton: 'Generate Nail Art',
    generatingButton: 'Generating...',

    // Loading Messages
    loading1: 'Analyzing hand photo...',
    loading2: 'Reading style image...',
    loading3: 'Generating photorealistic nail art...',
    loading4: 'Applying glossy top coat...',
    
    // Regeneration Loading Messages
    regenLoading1: 'Analyzing your requests...',
    regenLoading2: 'Re-rendering the design...',
    regenLoading3: 'Perfecting the details...',

    // Errors
    errorUpload: 'Please upload both a hand photo and a style image.',
    errorQuota: "Today's nail art generation is closed.",
    errorGeneric: 'Failed to generate nail art.',
    errorRegenerate: 'Failed to regenerate nail art.',
    errorNoImageToRegen: 'No image to regenerate from.',
    
    // Result Display
    resultTitle: 'Your Masterpiece ✨',
    downloadAriaLabel: 'Download image',
    historyTitle: 'Generation History',
    historyAriaLabel: 'Select version',
    
    // AI Design Studio
    studioTitle: 'AI Design Studio',
    
    // Color Changer
    colorChangerTitle: '1. Smart Color Changer',
    colorChangerDesc: 'Click a color from your design, then pick a new color to replace it.',
    analyzingColors: 'Analyzing colors...',
    colorsInYourDesign: 'COLORS IN YOUR DESIGN:',
    replaceWith: "REPLACE '{color}' WITH:",

    // Style Effects
    styleEffectsTitle: '2. One-Click Style Effects',
    
    // Refine with Text
    refineTextTitle: '3. Refine with Text',
    refineTextPlaceholder: "e.g., 'add a small star on the ring finger'",

    // AI Generated Tags
    aiTagsTitle: '4. AI Generated Tags',
    aiTagsDesc: 'Tags describing your nail art. Feel free to add, remove, or edit them.',
    generatingTags: 'Generating tags...',
    addTagPlaceholder: 'Add a new tag',
    addTagButton: 'Add',
    
    // Staged Changes
    stagedChangesTitle: 'Changes to Apply:',
    stagedChangesPlaceholder: 'Select a modification above to get started.',
    stagedChangeColor: '🎨 Change <b>{from}</b> to <b>{to}</b>',
    stagedChangeStyle: '🌟 Apply Style: <b>{style}</b>',
    stagedChangeText: '✍️ Refine: "<b>{text}</b>"',
    applyChangesButton: 'Apply Changes',

    // Error Modal
    modalTitle: 'Alert',
    modalCloseAria: 'Close modal',
    modalOkButton: 'OK',

    // Footer
    footerCopyright: 'All rights reserved.',
    footerPoweredBy: 'Powered by Gemini AI',

    // Landing
    landing: {
      heroBadge: 'Instant AI nail studio',
      heroTitle: 'Bring salon-perfect nail art to your hand photos',
      heroSubtitle: 'AI Nail Art Generator blends photorealistic manicures onto your own hand using Google Gemini and Supabase-backed history.',
      heroCta: 'Sign in with Google',
      heroLoading: 'Preparing...',
      heroSecondary: 'Start for free and upgrade whenever you need more generations.',
      previewTitle: 'Ultra realistic',
      previewDesc: 'Keep the hand, lighting, and nail shape while transforming the art.',
      promptTitle: 'Creative direction',
      promptDesc: 'Describe moods or effects and let Gemini refine every detail for you.',
      workflowTitle: 'How it works',
      workflowStep1: 'Upload a bare-hand photo and a style reference image.',
      workflowStep2: 'Let Gemini map the design with salon-grade precision.',
      workflowStep3: 'Save results and iterate with smart color edits.',
      featuresTitle: 'Why creators love it',
      feature1Title: 'Salon-grade results',
      feature1Desc: 'Photorealistic blends that respect natural nail shape, lighting, and gloss.',
      feature2Title: 'Smart editing tools',
      feature2Desc: 'Swap colors, add effects, and refine prompts without starting over.',
      feature3Title: 'Ready for teams',
      feature3Desc: 'Supabase sync keeps profiles, history, and usage caps under control.',
      pricingTitle: 'Plans for every artist',
      pricingSubtitle: 'Start free, then scale your studio when your clients do.',
      freePlanName: 'Starter',
      freePlanPrice: '$0',
      freePlanDesc: 'Perfect for quick mockups and personal experimentation.',
      freePlanFeature1: '5 generations per month',
      freePlanFeature2: 'Access to core AI editing tools',
      premiumPlanName: 'Premium',
      premiumPlanPrice: '$19 / mo',
      premiumPlanDesc: 'For emerging nail artists growing their digital catalog.',
      premiumPlanFeature1: 'Unlimited generations',
      premiumPlanFeature2: 'High-resolution downloads',
      premiumPlanFeature3: 'Priority Gemini quota',
      proPlanName: 'Pro Studio',
      proPlanPrice: '$39 / mo',
      proPlanDesc: 'Collaborative workspace for studios and nail art teams.',
      proPlanFeature1: 'Team analytics & usage controls',
      proPlanFeature2: 'Shared inspiration library',
      proPlanFeature3: 'Dedicated support',
      pricingCta: 'Unlock with Google',
      pricingLoading: 'Connecting...'
    },

    // Localized Studio Content
    colors: {
      burgundy: 'Burgundy',
      navyBlue: 'Navy Blue',
      dustyRose: 'Dusty Rose',
      emeraldGreen: 'Emerald Green',
      lavender: 'Lavender',
      mustardYellow: 'Mustard Yellow',
      charcoalGray: 'Charcoal Gray',
      teal: 'Teal',
    },
    styleModifiers: {
      addGlitter: 'Add subtle glitter',
      magneticGel: 'Add magnetic gel effect',
      matteFinish: 'Make it matte finish',
      chromePowder: 'Add chrome powder effect'
    }
  },
  ko: {
    // Header
    headerTitle: 'AI 네일아트 스튜디오',
    headerSubtitle: '당신의 네일아트 꿈을 현실로 만들어보세요.',
    
    // Inspiration Carousel
    inspirationTitle: '영감 얻기',
    inspirationAlt: '네일아트 영감',

    // Mode Selector
    generationMode: '생성 모드',
    inspirationMode: '영감',
    tryonMode: '가상 체험',
    inspirationModeDesc: '스타일 이미지로부터 영감을 받아 새로운 아트를 생성합니다.',
    tryonModeDesc: '기존 네일아트 디자인을 당신의 손에 적용합니다.',
    
    // Image Uploaders
    handPhotoTitleInspiration: '손 사진',
    handPhotoTitleTryon: '손 사진 (손톱 모양 유지)',
    handPhotoDesc: '모든 손톱이 보이도록 손 전체 사진을 올려주세요. 깨끗한 적용을 위해 아무것도 바르지 않은 맨 손톱이 가장 좋습니다.',
    styleImageTitleInspiration: '스타일 참고 이미지',
    styleImageTitleTryon: '네일아트 디자인 사진',
    styleImageDescInspiration: '만들고 싶은 분위기나 스타일의 이미지를 업로드하세요.',
    styleImageDescTryon: '원하는 네일아트가 모두 보이는 전체 손 사진을 사용하면 가장 좋습니다.',
    changeImage: '이미지 변경',
    clickToUpload: '클릭하여 업로드',
    dragAndDrop: '또는 이미지를 끌어다 놓으세요',
    imageFormats: 'PNG, JPG 등',

    // Prompt
    promptLabel: '원하는 분위기를 설명해주세요 (선택사항)',
    promptPlaceholder: "예: '우주 글리터', '은은한 꽃무늬', '과감한 기하학 패턴'",

    // Generate Button
    generateButton: '네일아트 생성하기',
    generatingButton: '생성 중...',
    
    // Loading Messages
    loading1: '손 사진 분석 중...',
    loading2: '스타일 이미지 읽는 중...',
    loading3: '실사 네일아트 생성 중...',
    loading4: '광택 탑코트 적용 중...',
    
    // Regeneration Loading Messages
    regenLoading1: '요청 분석 중...',
    regenLoading2: '디자인 다시 렌더링 중...',
    regenLoading3: '세부사항 다듬는 중...',

    // Errors
    errorUpload: '손 사진과 스타일 이미지를 모두 업로드해주세요.',
    errorQuota: '오늘의 네일아트 생성 한도가 마감되었습니다.',
    errorGeneric: '네일아트를 생성하지 못했습니다.',
    errorRegenerate: '네일아트를 다시 생성하지 못했습니다.',
    errorNoImageToRegen: '다시 생성할 이미지가 없습니다.',

    // Result Display
    resultTitle: '당신의 작품 ✨',
    downloadAriaLabel: '이미지 다운로드',
    historyTitle: '생성 내역',
    historyAriaLabel: '버전 선택',
    
    // AI Design Studio
    studioTitle: 'AI 디자인 스튜디오',
    
    // Color Changer
    colorChangerTitle: '1. 스마트 색상 변경',
    colorChangerDesc: '디자인에서 색상을 클릭한 후, 바꿀 새로운 색상을 선택하세요.',
    analyzingColors: '색상 분석 중...',
    colorsInYourDesign: '디자인에 사용된 색상:',
    replaceWith: "'{color}' 색상을 다음으로 변경:",

    // Style Effects
    styleEffectsTitle: '2. 원클릭 스타일 효과',

    // Refine with Text
    refineTextTitle: '3. 텍스트로 수정하기',
    refineTextPlaceholder: "예: '약지 손톱에 작은 별을 추가해줘'",

    // AI Generated Tags
    aiTagsTitle: '4. AI 생성 태그',
    aiTagsDesc: '네일아트를 설명하는 태그입니다. 자유롭게 추가, 삭제, 수정하세요.',
    generatingTags: '태그 생성 중...',
    addTagPlaceholder: '새 태그 추가',
    addTagButton: '추가',

    // Staged Changes
    stagedChangesTitle: '적용할 변경사항:',
    stagedChangesPlaceholder: '시작하려면 위에서 수정사항을 선택하세요.',
    stagedChangeColor: '🎨 <b>{from}</b> 색상을 <b>{to}</b>(으)로 변경',
    stagedChangeStyle: '🌟 스타일 적용: <b>{style}</b>',
    stagedChangeText: '✍️ 텍스트 수정: "<b>{text}</b>"',
    applyChangesButton: '변경사항 적용하기',

    // Error Modal
    modalTitle: '알림',
    modalCloseAria: '모달 닫기',
    modalOkButton: '확인',
    
    // Footer
    footerCopyright: 'All rights reserved.',
    footerPoweredBy: 'Powered by Gemini AI',

    // Landing
    landing: {
      heroBadge: '즉시 사용 가능한 AI 네일 스튜디오',
      heroTitle: '살롱급 네일아트를 당신의 손 사진에 구현하세요',
      heroSubtitle: 'AI 네일 아트 생성기는 Google Gemini와 Supabase 기반 저장소를 활용해 실사처럼 어우러지는 네일 디자인을 적용합니다.',
      heroCta: 'Google 계정으로 시작하기',
      heroLoading: '준비 중...',
      heroSecondary: '무료로 시작하고, 필요할 때 업그레이드하세요.',
      previewTitle: '초실감 구현',
      previewDesc: '손 모양과 조명은 그대로 유지한 채 네일아트만 바꿉니다.',
      promptTitle: '맞춤 프롬프트',
      promptDesc: '원하는 분위기를 설명하면 Gemini가 세밀하게 반영해줍니다.',
      workflowTitle: '사용 순서',
      workflowStep1: '맨손 사진과 스타일 참고 이미지를 업로드하세요.',
      workflowStep2: 'Gemini가 살롱급 정밀도로 디자인을 매핑합니다.',
      workflowStep3: '결과를 저장하고 스마트 컬러 편집으로 반복 수정하세요.',
      featuresTitle: '사람들이 좋아하는 이유',
      feature1Title: '살롱급 결과물',
      feature1Desc: '자연스러운 손톱 모양과 광택을 살린 초현실적 합성.',
      feature2Title: '똑똑한 편집 도구',
      feature2Desc: '색상 교체와 스타일 이펙트를 한 번에 적용하고 재생성하세요.',
      feature3Title: '팀 협업 준비 완료',
      feature3Desc: 'Supabase 동기화로 프로필, 히스토리, 사용량을 안정적으로 관리합니다.',
      pricingTitle: '누구나 맞는 요금제',
      pricingSubtitle: '무료로 먼저 체험하고, 고객이 늘어나면 바로 확장하세요.',
      freePlanName: '스타터',
      freePlanPrice: '월 0원',
      freePlanDesc: '빠른 목업과 개인 연습에 적합합니다.',
      freePlanFeature1: '월 5회 생성',
      freePlanFeature2: '핵심 AI 편집 기능 제공',
      premiumPlanName: '프리미엄',
      premiumPlanPrice: '월 19,000원',
      premiumPlanDesc: '성장 중인 네일 아티스트를 위한 디지털 포트폴리오.',
      premiumPlanFeature1: '무제한 생성',
      premiumPlanFeature2: '고해상도 다운로드',
      premiumPlanFeature3: '우선순위 Gemini 쿼터',
      proPlanName: '프로 스튜디오',
      proPlanPrice: '월 39,000원',
      proPlanDesc: '살롱과 팀을 위한 협업 공간.',
      proPlanFeature1: '팀 분석 및 사용량 제어',
      proPlanFeature2: '공유 영감 라이브러리',
      proPlanFeature3: '전담 지원',
      pricingCta: 'Google 로그인으로 시작',
      pricingLoading: '연결 중...'
    },

    // Localized Studio Content
    colors: {
      burgundy: '버건디',
      navyBlue: '네이비 블루',
      dustyRose: '더스티 로즈',
      emeraldGreen: '에메랄드 그린',
      lavender: '라벤더',
      mustardYellow: '머스타드 옐로우',
      charcoalGray: '차콜 그레이',
      teal: '틸',
    },
    styleModifiers: {
      addGlitter: '은은한 글리터 추가',
      magneticGel: '마그네틱 젤 효과 추가',
      matteFinish: '매트하게 변경',
      chromePowder: '크롬 파우더 효과 추가'
    }
  }
};
