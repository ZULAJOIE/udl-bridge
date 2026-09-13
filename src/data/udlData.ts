import { SchoolLevel, ModificationLevel, StrategyItem } from '../types';

export const SCHOOL_LEVEL_LABELS: Record<SchoolLevel, string> = {
  elementary: '초등학교',
  middle: '중학교',
  high: '고등학교',
};

export const SUBJECTS_BY_LEVEL: Record<SchoolLevel, string[]> = {
  elementary: [
    '국어', '수학', '바른 생활', '슬기로운 생활', '즐거운 생활',
    '사회', '도덕', '과학', '실과', '체육', '음악', '미술', '영어'
  ],
  middle: [
    '국어', '사회', '역사', '도덕', '수학', '과학', '기술', '가정',
    '정보', '체육', '음악', '미술', '영어', '한문', '환경',
    '중국어', '일본어', '보건', '진로와 직업'
  ],
  high: [
    '국어', '수학', '영어', '사회', '한국사', '과학', '체육', '예술',
    '기술', '가정', '정보', '제2외국어', '한문', '교양'
  ]
};

// Simplified primary chips for STEP 2
export const PRIMARY_NEED_CHIPS = [
  { id: 'need_long_text', label: '긴 글 이해', category: '읽기·이해' },
  { id: 'need_hard_vocab', label: '어려운 단어', category: '어휘·개념' },
  { id: 'need_core_content', label: '핵심 내용 찾기', category: '읽기·이해' },
  { id: 'need_step_by_step', label: '단계적 안내', category: '주의·실행' },
  { id: 'need_visual_help', label: '그림으로 이해', category: '시각적 접근' },
  { id: 'need_answer_support', label: '답하기 지원', category: '의사소통·표현' },
  { id: 'need_memory_help', label: '기억하기', category: '기억·정보처리' },
  { id: 'need_focus_engagement', label: '집중·참여', category: '참여·동기' }
];

export const SPECIAL_EDUCATION_TARGETS = [
  '시각장애',
  '청각장애',
  '지적장애',
  '지체장애',
  '정서·행동장애',
  '자폐성장애',
  '의사소통장애',
  '학습장애',
  '건강장애',
  '발달지체'
];

export const GENERAL_STUDENT_TARGETS = [
  '느린학습자',
  'ADHD',
  '기타',
  '해당 없음'
];

export const DISABILITY_CATEGORIES = [
  ...SPECIAL_EDUCATION_TARGETS,
  ...GENERAL_STUDENT_TARGETS
];

export const EDUCATIONAL_NEEDS_BY_CATEGORY: Record<string, string[]> = {
  '읽기·이해': [
    '긴 글 이해가 어려움',
    '핵심 내용을 찾기 어려움',
    '복잡한 문장을 이해하기 어려움',
    '글의 순서를 이해하기 어려움',
    '원인과 결과를 파악하기 어려움'
  ],
  '어휘·개념': [
    '어려운 어휘를 이해하기 어려움',
    '추상적인 개념을 이해하기 어려움',
    '새로운 개념에 구체적인 예가 필요함',
    '핵심 교과 어휘를 반복해서 제시할 필요가 있음'
  ],
  '주의·실행': [
    '과제를 시작하기 어려움',
    '여러 단계 지시를 수행하기 어려움',
    '많은 정보가 동시에 제시되면 어려움',
    '과제의 시작과 끝을 파악하기 어려움',
    '활동 순서를 기억하기 어려움'
  ],
  '의사소통·표현': [
    '긴 문장으로 답하기 어려움',
    '선택지를 통해 답하는 것이 쉬움',
    '그림·상징을 활용한 표현이 필요함',
    '말 이외의 응답 방법이 필요함',
    '자신의 생각을 구성해서 표현하기 어려움'
  ],
  '기억·정보처리': [
    '많은 정보를 한 번에 기억하기 어려움',
    '반복적인 정보 제시가 필요함',
    '이전에 배운 내용을 떠올리는 데 지원이 필요함',
    '처리 시간을 충분히 제공할 필요가 있음'
  ],
  '시각적 접근': [
    '그림·사진이 있으면 이해하기 쉬움',
    '복잡한 시각자료에서 핵심을 찾기 어려움',
    '중요한 정보를 시각적으로 강조할 필요가 있음',
    '여러 시각정보가 동시에 제시되면 어려움'
  ],
  '참여·동기': [
    '관심사가 포함되면 참여도가 높아짐',
    '선택권이 있으면 참여하기 쉬움',
    '작은 성공 경험이 필요함',
    '활동 완료 여부를 확인할 필요가 있음',
    '활동 목표를 먼저 제시하면 참여하기 쉬움'
  ]
};

export const TEXT_MODIFICATION_LEVELS: Record<ModificationLevel, { name: string; purpose: string }> = {
  1: { name: 'Level 1. 원문 유지', purpose: '원문의 내용과 문장 구조를 거의 그대로 유지합니다.' },
  2: { name: 'Level 2. 부분 지원', purpose: '원문의 의미와 표현을 최대한 유지하면서 이해를 돕습니다.' },
  3: { name: 'Level 3. 구조화', purpose: '원문의 핵심 의미를 유지하면서 정보 구조를 쉽게 파악할 수 있도록 합니다.' },
  4: { name: 'Level 4. 쉬운 자료로 재구성', purpose: '핵심 학습목표와 개념은 유지하면서 학생의 수행 수준에 맞게 표현을 적극적으로 수정합니다.' },
  5: { name: 'Level 5. 핵심 개념 중심', purpose: '학생이 반드시 이해해야 하는 핵심 의미를 최소 단위로 제시합니다.' }
};

export const ALL_TEXT_STRATEGIES: StrategyItem[] = [
  // Level 1
  { id: 't_bold_keyword', label: '핵심어 굵게 표시', recommendedForLevel: [1], conflictLevels: [4, 5] },
  { id: 't_highlight_important', label: '중요한 문장 표시', recommendedForLevel: [1], conflictLevels: [4, 5] },
  { id: 't_underline_key', label: '핵심 부분 밑줄', recommendedForLevel: [1], conflictLevels: [4, 5] },

  // Level 2
  { id: 't_easy_vocab', label: '어려운 어휘 쉬운 말 풀이', recommendedForLevel: [2], conflictLevels: [5] },
  { id: 't_vocab_bracket', label: '어려운 어휘 괄호 설명', recommendedForLevel: [2], conflictLevels: [5] },
  { id: 't_highlight_main', label: '핵심 문장 강조', recommendedForLevel: [2], conflictLevels: [5] },

  // Level 3
  { id: 't_split_long_sentences', label: '긴 문장을 짧게 나누기', recommendedForLevel: [3], compatibleLevels: [2, 3, 4] },
  { id: 't_one_sentence_one_info', label: '한 문장에 하나의 정보', recommendedForLevel: [3], compatibleLevels: [2, 3, 4] },
  { id: 't_summary_box', label: '핵심 요약 박스 제공', recommendedForLevel: [3], compatibleLevels: [2, 3, 4] },
  { id: 't_step_numbers', label: '단계별 번호 제공', recommendedForLevel: [3], compatibleLevels: [2, 3, 4] },

  // Level 4
  { id: 't_change_easy_vocab', label: '쉬운 어휘로 변경', recommendedForLevel: [4], conflictLevels: [1] },
  { id: 't_short_sentence_rewrite', label: '짧은 문장 중심 재작성', recommendedForLevel: [4], conflictLevels: [1] },
  { id: 't_real_life_example', label: '실생활 예시 추가', recommendedForLevel: [4], conflictLevels: [1] },

  // Level 5
  { id: 't_one_info_per_line', label: '한 문장에 한 정보', recommendedForLevel: [5], conflictLevels: [1, 2] },
  { id: 't_essential_words_only', label: '필수 핵심어 중심 구성', recommendedForLevel: [5], conflictLevels: [1, 2] },
  { id: 't_card_units', label: '작은 카드 단위로 분리', recommendedForLevel: [5], conflictLevels: [1, 2] }
];

export const VISUAL_MODIFICATION_LEVELS: Record<ModificationLevel, { name: string; purpose: string }> = {
  1: { name: 'Level 1. 원본 유지', purpose: '원본 시각자료를 유지하되 타이틀 최소 정리를 수행합니다.' },
  2: { name: 'Level 2. 핵심 강조', purpose: '시각 요소 중 주요 개념에 하이라이트, 테두리, 화살표를 추가합니다.' },
  3: { name: 'Level 3. 단순화', purpose: '불필요한 배경과 장식을 제거하고 핵심 요소 위주로 복잡도를 낮춥니다.' },
  4: { name: 'Level 4. 시각적 구조화', purpose: '순서도, 단계별 그림, 비교표, 그룹화 아이콘을 통해 시각적 구조를 제시합니다.' },
  5: { name: 'Level 5. 핵심 시각정보 중심', purpose: '한 화면에 하나의 핵심 시각 요소와 선택지/카드 위주로 명료하게 구성합니다.' }
};

export const ALL_VISUAL_STRATEGIES: StrategyItem[] = [
  // Level 1
  { id: 'v_original_as_is', label: '원본 그대로 제시', recommendedForLevel: [1], conflictLevels: [4, 5] },
  { id: 'v_highlight_core_only', label: '핵심 부분만 표시', recommendedForLevel: [1], conflictLevels: [4, 5] },

  // Level 2
  { id: 'v_border_highlight', label: '중요한 부분 강조', recommendedForLevel: [2], conflictLevels: [5] },
  { id: 'v_arrows', label: '화살표 추가', recommendedForLevel: [2], conflictLevels: [5] },
  { id: 'v_add_labels', label: '핵심 요소 라벨', recommendedForLevel: [2], conflictLevels: [5] },

  // Level 3
  { id: 'v_remove_bg', label: '불필요한 배경 제거', recommendedForLevel: [3], compatibleLevels: [2, 3, 4] },
  { id: 'v_core_element_only', label: '핵심 요소 중심으로 구성', recommendedForLevel: [3], compatibleLevels: [2, 3, 4] },

  // Level 4
  { id: 'v_flowchart', label: '순서도 활용', recommendedForLevel: [4], conflictLevels: [1] },
  { id: 'v_step_images', label: '단계별 그림 제공', recommendedForLevel: [4], conflictLevels: [1] },
  { id: 'v_grouping_info', label: '관련 정보끼리 시각적 그룹화', recommendedForLevel: [4], conflictLevels: [1] },

  // Level 5
  { id: 'v_one_concept_per_screen', label: '한 화면에 한 개념', recommendedForLevel: [5], conflictLevels: [1, 2] },
  { id: 'v_picture_and_keyword', label: '그림 + 핵심어 구성', recommendedForLevel: [5], conflictLevels: [1, 2] }
];

export const MUST_KEEP_OPTIONS = [
  '원래 학습목표',
  '핵심 개념',
  '필수 교과 어휘',
  '원래 활동 방식',
  '원래 문제 유형',
  '핵심 그림·자료',
  '또래와 함께 수행하는 활동'
];

/**
 * Intelligent Rule-Based Recommendation Engine
 */
export function getRecommendedStrategiesForNeeds(
  primaryNeeds: string[],
  detailedNeeds: string[]
): {
  suggestedTextLevel: ModificationLevel;
  suggestedVisualLevel: ModificationLevel;
  recommendedTextStrats: string[];
  recommendedVisualStrats: string[];
} {
  const allNeeds = [...primaryNeeds, ...detailedNeeds];
  const textStrats = new Set<string>();
  const visualStrats = new Set<string>();

  let suggestedTextLevel: ModificationLevel = 3;
  let suggestedVisualLevel: ModificationLevel = 3;

  allNeeds.forEach(need => {
    if (need.includes('긴 글') || need.includes('긴 글 이해')) {
      suggestedTextLevel = 3;
      textStrats.add('긴 문장을 짧게 나누기');
      textStrats.add('한 문장에 하나의 정보');
      textStrats.add('핵심 요약 박스 제공');
    }
    if (need.includes('어려운 단어') || need.includes('어휘')) {
      textStrats.add('어려운 어휘 쉬운 말 풀이');
      textStrats.add('쉬운 어휘로 변경');
    }
    if (need.includes('핵심 내용') || need.includes('핵심')) {
      textStrats.add('핵심어 굵게 표시');
      visualStrats.add('중요한 부분 강조');
    }
    if (need.includes('단계적 안내') || need.includes('단계')) {
      textStrats.add('단계별 번호 제공');
      visualStrats.add('순서도 활용');
      visualStrats.add('단계별 그림 제공');
    }
    if (need.includes('그림으로 이해') || need.includes('그림')) {
      suggestedVisualLevel = 4;
      visualStrats.add('그림 + 핵심어 구성');
      visualStrats.add('관련 정보끼리 시각적 그룹화');
    }
  });

  if (textStrats.size === 0) {
    textStrats.add('긴 문장을 짧게 나누기');
    textStrats.add('핵심어 굵게 표시');
    textStrats.add('어려운 어휘 쉬운 말 풀이');
  }
  if (visualStrats.size === 0) {
    visualStrats.add('중요한 부분 강조');
    visualStrats.add('핵심 요소 라벨');
  }

  return {
    suggestedTextLevel,
    suggestedVisualLevel,
    recommendedTextStrats: Array.from(textStrats),
    recommendedVisualStrats: Array.from(visualStrats)
  };
}
