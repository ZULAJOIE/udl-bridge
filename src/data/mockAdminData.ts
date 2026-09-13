import { AdminStats, SavedMaterial } from '../types';

export const INITIAL_SAVED_MATERIALS: SavedMaterial[] = [
  {
    id: 'mat-demo-1',
    userId: 'demo-teacher-01',
    userEmail: 'teacher@school.ed.kr',
    title: '[중등 과학] 광합성의 원리와 반응 조건 (학생용 학습자료)',
    schoolLevel: 'middle',
    subject: '과학',
    topic: '광합성의 원리와 반응 조건',
    fileName: '광합성_교과서_본문.pdf',
    fileType: 'pdf',
    disabilityCategories: ['지적장애', '학습장애'],
    educationalNeeds: ['긴 글 이해', '어려운 단어', '단계적 안내'],
    textModificationLevel: 3,
    textStrategies: ['긴 문장을 짧게 나누기', '어려운 어휘 쉬운 말 풀이', '핵심 요약 박스 제공'],
    visualModificationLevel: 4,
    visualStrategies: ['순서도 활용', '단계별 그림 제공', '관련 정보끼리 시각적 그룹화'],
    mustKeepOptions: ['원래 학습목표', '핵심 개념', '필수 교과 어휘'],
    mustKeepText: '광합성, 산소, 이산화탄소, 햇빛 세 가지는 반드시 유지해주세요.',
    teacherRequest: '학생이 식물을 키우는 활동을 좋아하므로 화분 물주기 예시를 사용해주세요.',
    generatedPrompt: `당신은 특수교육 및 UDL(보편적 학습 설계) 기반 교수적 수정 전문가입니다.

[1. 학습자료 기본 정보]
- 학교급: 중학교
- 교과: 과학
- 단원/주제: 광합성의 원리와 반응 조건
- 원본 파일 첨부: 광합성_교과서_본문.pdf (PDF)

[2. 학생 특성 및 교육적 요구]
- 학생 분류: 지적장애, 학습장애
- 선택된 주요 지원: 긴 글 이해, 어려운 단어, 단계적 안내

[3. 교수적 수정 설정]
- 텍스트 수정 Level: Level 3 (구조화)
- 선택된 텍스트 수정 전략: 긴 문장을 짧게 나누기, 어려운 어휘 쉬운 말 풀이, 핵심 요약 박스 제공
- 시각자료 수정 Level: Level 4 (시각적 구조화)
- 선택된 시각자료 수정 전략: 순서도 활용, 단계별 그림 제공, 관련 정보끼리 시각적 그룹화

[4. 반드시 보존할 요소]
- 보존 항목: 원래 학습목표, 핵심 개념, 필수 교과 어휘
- 교사 지정 보존 어휘/문장: 광합성, 산소, 이산화탄소, 햇빛 세 가지는 반드시 유지해주세요.

[5. 교사 추가 요청사항]
- 학생이 식물을 키우는 활동을 좋아하므로 화분 물주기 예시를 사용해주세요.

위 조건에 맞춰 특수교육대상 학생 및 학습 지원이 필요한 학생을 위한 최적화된 [학생용 교수적 수정 학습자료]와 [교사용 정답/안내]를 작성해주세요.`,
    generatedContent: {
      id: 'mat-gen-1',
      title: '[학생용 맞춤 자료] 광합성의 원리와 반응 조건',
      schoolLevel: 'middle',
      subject: '과학',
      topic: '광합성의 원리와 반응 조건',
      targetAudience: '중등 과학 / 긴 글 이해, 어려운 단어 지원 필요',
      coreConcept: '광합성의 원리와 3가지 조건(햇빛, 물, 이산화탄소)',
      simplifiedContent: `📌 **한눈에 정리하는 광합성이야기**\n\n1. **광합성이란?** 식물이 햇빛과 물, 공기(이산화탄소)를 이용해 스스로 양분을 만드는 과정이에요.\n2. **꼭 필요한 3가지:** ☀️ 햇빛, 💧 물, 💨 이산화탄소\n3. **만들어지는 것:** 🌿 식물의 양분(포도당), 🎈 우리가 마시는 산소`,
      keywords: ['광합성', '햇빛', '물', '이산화탄소', '산소'],
      activities: [
        {
          id: 'act-1',
          type: 'concept',
          title: '1. 광합성 3요소 연결하기',
          content: '식물 화분에 물을 줄 때 일어나는 반응을 선으로 연결해 보세요.\n\nㆍ 햇빛 ──────── ( 식물이 에너지를 얻는 밝은 빛 )\nㆍ 물 ────────── ( 뿌리에서 쑥쑥 흡수해요 )\nㆍ 이산화탄소 ─── ( 공기 중에서 받아들여요 )'
        },
        {
          id: 'act-2',
          type: 'question',
          title: '2. 알아보기 확인 문제',
          content: '식물이 광합성을 마치면 우리에게 선물로 주는 기체는 무엇일까요?',
          options: ['1) 산소', '2) 먼지', '3) 얼음']
        }
      ],
      generatedPrompt: `당신은 특수교육 및 UDL(보편적 학습 설계) 기반 교수적 수정 전문가입니다.

[1. 학습자료 기본 정보]
- 학교급: 중학교
- 교과: 과학
- 단원/주제: 광합성의 원리와 반응 조건
- 원본 파일 첨부: 광합성_교과서_본문.pdf (PDF)

[2. 학생 특성 및 교육적 요구]
- 학생 분류: 지적장애, 학습장애
- 선택된 주요 지원: 긴 글 이해, 어려운 단어, 단계적 안내

[3. 교수적 수정 설정]
- 텍스트 수정 Level: Level 3 (구조화)
- 선택된 텍스트 수정 전략: 긴 문장을 짧게 나누기, 어려운 어휘 쉬운 말 풀이, 핵심 요약 박스 제공
- 시각자료 수정 Level: Level 4 (시각적 구조화)
- 선택된 시각자료 수정 전략: 순서도 활용, 단계별 그림 제공, 관련 정보끼리 시각적 그룹화

[4. 반드시 보존할 요소]
- 보존 항목: 원래 학습목표, 핵심 개념, 필수 교과 어휘
- 교사 지정 보존 어휘/문장: 광합성, 산소, 이산화탄소, 햇빛 세 가지는 반드시 유지해주세요.

[5. 교사 추가 요청사항]
- 학생이 식물을 키우는 활동을 좋아하므로 화분 물주기 예시를 사용해주세요.

위 조건에 맞춰 특수교육대상 학생 및 학습 지원이 필요한 학생을 위한 최적화된 [학생용 교수적 수정 학습자료]와 [교사용 정답/안내]를 작성해주세요.`,
      summaryNote: '적용된 교수적 수정: 글 Level 3 / 시각 Level 4',
      teacherNote: '교사 지도 참고: 학생에게 1번 연결 활동을 시각 힌트와 함께 먼저 수행하도록 지도하세요.',
      createdAt: '2026-09-12 14:20:00'
    },
    createdAt: '2026-09-12 14:20:00'
  }
];

export const MOCK_ADMIN_STATS: AdminStats = {
  totalTeachers: 284,
  activeUsers: 142,
  materialsGenerated: 1248,
  materialsSaved: 632,
  materialsReused: 415,
  recommendationsUsed: 890,
  schoolLevelBreakdown: {
    elementary: 520,
    middle: 480,
    high: 248
  },
  topEducationalNeeds: [
    { name: '긴 글 이해가 어려움', count: 642, percentage: 51.4 },
    { name: '어려운 어휘를 이해하기 어려움', count: 589, percentage: 47.2 },
    { name: '여러 단계 지시를 수행하기 어려움', count: 480, percentage: 38.5 },
    { name: '핵심 내용을 찾기 어려움', count: 412, percentage: 33.0 },
    { name: '추상적인 개념을 이해하기 어려움', count: 395, percentage: 31.6 },
    { name: '새로운 개념에 구체적인 예가 필요함', count: 340, percentage: 27.2 },
    { name: '많은 정보가 동시에 제시되면 어려움', count: 310, percentage: 24.8 },
    { name: '그림·사진이 있으면 이해하기 쉬움', count: 295, percentage: 23.6 }
  ],
  textLevelDistribution: {
    1: 52,
    2: 210,
    3: 510,
    4: 360,
    5: 116
  },
  visualLevelDistribution: {
    1: 38,
    2: 190,
    3: 420,
    4: 490,
    5: 110
  },
  topTextStrategies: [
    { name: '긴 문장을 짧게 나누기', count: 780 },
    { name: '어려운 어휘 쉬운 말 풀이', count: 690 },
    { name: '핵심어 굵게 표시', count: 650 },
    { name: '한 문장에 하나의 정보', count: 540 },
    { name: '실생활 예시 추가', count: 490 }
  ],
  topVisualStrategies: [
    { name: '중요한 부분 강조', count: 610 },
    { name: '화살표 추가', count: 570 },
    { name: '단계별 그림 제공', count: 510 },
    { name: '관련 정보끼리 시각적 그룹화', count: 380 }
  ],
  udlRatio: {
    representation: 48,
    actionExpression: 31,
    engagement: 21
  },
  recommendationStats: [
    { strategyName: '긴 문장을 짧게 나누기', recommendedCount: 530, acceptedRate: 84 },
    { strategyName: '핵심어 굵게 표시', recommendedCount: 490, acceptedRate: 72 },
    { strategyName: '그림 + 핵심어 구성', recommendedCount: 380, acceptedRate: 76 },
    { strategyName: '단계별 번호 제공', recommendedCount: 350, acceptedRate: 61 }
  ],
  disabilityCategoryPatterns: [
    {
      category: '지적장애',
      count: 310,
      topNeeds: ['긴 글 이해', '어려운 단어', '단계적 안내'],
      topStrategies: ['쉬운 어휘', '문장 분절', '그림과 글 함께 제시'],
      avgTextLevel: 3.8,
      avgVisualLevel: 3.6
    },
    {
      category: '학습장애',
      count: 290,
      topNeeds: ['핵심 내용 찾기', '어려운 단어', '긴 글 부담'],
      topStrategies: ['핵심어 굵게', '어려운 어휘 괄호 설명', '요약 박스'],
      avgTextLevel: 2.9,
      avgVisualLevel: 3.1
    }
  ]
};
