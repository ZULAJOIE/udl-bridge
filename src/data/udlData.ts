import {
  SchoolLevel, ModificationLevel, StrategyItem, StrategyCategory, StrategyRelation,
  ObservedDifficultyCategory, ObservedDifficultyItem, SupportRecommendationResult
} from '../types';

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
  {
    id: 't_bold_keyword', label: '핵심어 굵게 표시', recommendedForLevel: [1], conflictLevels: [4, 5],
    category: 'coreFocus',
    description: '문장 속 핵심 단어를 굵게 표시해 눈에 띄게 합니다.',
    principle: '원문의 문장과 표현은 그대로 유지합니다.',
    exampleBefore: '식물은 햇빛을 받아 광합성을 통해 양분을 만듭니다.',
    exampleAfter: '식물은 햇빛을 받아 「광합성」을 통해 「양분」을 만듭니다.'
  },
  {
    id: 't_highlight_important', label: '중요한 문장 표시', recommendedForLevel: [1], conflictLevels: [4, 5],
    category: 'coreFocus',
    description: '글에서 가장 중요한 문장에 표시를 추가해 알려줍니다.',
    principle: '원문 문장의 순서와 표현은 그대로 유지합니다.',
    exampleBefore: '식물은 햇빛, 물, 이산화탄소를 이용해 광합성을 합니다. 이 과정에서 산소가 만들어집니다.',
    exampleAfter: '▶식물은 햇빛, 물, 이산화탄소를 이용해 광합성을 합니다.◀ 이 과정에서 산소가 만들어집니다.'
  },
  {
    id: 't_underline_key', label: '핵심 부분 밑줄', recommendedForLevel: [1], conflictLevels: [4, 5],
    category: 'coreFocus',
    description: '문장에서 핵심이 되는 부분에 밑줄을 그어 표시합니다.',
    principle: '원문 문장 구조를 그대로 유지한 채 강조만 추가합니다.',
    exampleBefore: '광합성은 식물이 빛 에너지를 이용해 양분을 만드는 과정입니다.',
    exampleAfter: '광합성은 식물이 __빛 에너지를 이용해 양분을 만드는 과정__입니다.'
  },

  // Level 2
  {
    id: 't_easy_vocab', label: '어려운 어휘 쉬운 말 풀이', recommendedForLevel: [2], conflictLevels: [5],
    category: 'readability',
    description: '어려운 낱말을 본문 안에서 쉬운 말로 바꾸어 풀어 씁니다.',
    principle: '핵심 교과 어휘는 유지하고 그 뜻을 함께 풀어줍니다.',
    exampleBefore: '광합성은 식물의 필수적인 생리 작용입니다.',
    exampleAfter: '광합성은 식물이 살아가는 데 꼭 필요한 활동입니다.'
  },
  {
    id: 't_vocab_bracket', label: '어려운 어휘 괄호 설명', recommendedForLevel: [2], conflictLevels: [5],
    category: 'readability',
    description: '어려운 낱말 뒤에 괄호로 뜻을 간단히 설명합니다.',
    principle: '원래 어휘는 유지하고 괄호 설명만 덧붙입니다.',
    exampleBefore: '식물은 광합성을 합니다.',
    exampleAfter: '식물은 광합성(빛으로 양분을 만드는 것)을 합니다.'
  },
  {
    id: 't_highlight_main', label: '핵심 문장 강조', recommendedForLevel: [2], conflictLevels: [5],
    category: 'coreFocus',
    description: '문단에서 가장 중요한 한 문장을 색이나 굵기로 강조합니다.',
    principle: '문단의 나머지 문장은 원문 그대로 유지합니다.',
    exampleBefore: '광합성은 식물이 빛 에너지를 이용해 양분을 만드는 과정입니다. 이때 이산화탄소와 물이 사용됩니다.',
    exampleAfter: '「광합성은 식물이 빛 에너지를 이용해 양분을 만드는 과정입니다.」 이때 이산화탄소와 물이 사용됩니다.'
  },

  // Level 3
  {
    id: 't_split_long_sentences', label: '긴 문장을 짧게 나누기', recommendedForLevel: [3], compatibleLevels: [2, 3, 4],
    category: 'readability',
    description: '여러 정보가 포함된 긴 문장을 짧은 문장으로 나누어 제시합니다.',
    principle: '핵심 의미와 필수 교과 어휘는 유지합니다.',
    exampleBefore: '식물은 햇빛을 받아 양분을 만들고 산소를 내보냅니다.',
    exampleAfter: '식물은 햇빛을 받습니다. 식물은 양분을 만듭니다. 식물은 산소를 내보냅니다.'
  },
  {
    id: 't_one_sentence_one_info', label: '한 문장에 하나의 정보', recommendedForLevel: [3], compatibleLevels: [2, 3, 4],
    category: 'readability',
    description: '한 문장에는 하나의 정보만 담아 이해하기 쉽게 만듭니다.',
    principle: '정보의 순서와 인과관계는 유지합니다.',
    exampleBefore: '물은 뿌리로 흡수되어 줄기를 통해 잎까지 이동합니다.',
    exampleAfter: '물은 뿌리로 흡수됩니다. 흡수된 물은 줄기를 지나갑니다. 물은 잎까지 이동합니다.'
  },
  {
    id: 't_summary_box', label: '핵심 요약 박스 제공', recommendedForLevel: [3], compatibleLevels: [2, 3, 4],
    category: 'coreFocus',
    description: '글의 핵심 내용을 별도의 요약 박스로 따로 정리해 제공합니다.',
    principle: '본문은 그대로 유지하고 요약은 추가 정보로 제공합니다.',
    exampleBefore: '(본문 여러 문단)',
    exampleAfter: '[핵심 요약] 식물은 햇빛·물·이산화탄소로 양분과 산소를 만듭니다.'
  },
  {
    id: 't_step_numbers', label: '단계별 번호 제공', recommendedForLevel: [3], compatibleLevels: [2, 3, 4],
    category: 'sequence',
    description: '순서가 있는 내용에 1, 2, 3과 같은 단계 번호를 붙입니다.',
    principle: '내용의 순서와 인과관계는 그대로 유지합니다.',
    exampleBefore: '뿌리로 물을 흡수하고, 줄기로 옮기고, 잎에서 광합성을 합니다.',
    exampleAfter: '① 뿌리로 물을 흡수해요. ② 줄기로 물을 옮겨요. ③ 잎에서 광합성을 해요.'
  },

  // Level 4
  {
    id: 't_change_easy_vocab', label: '쉬운 어휘로 변경', recommendedForLevel: [4], conflictLevels: [1],
    category: 'readability',
    description: '어려운 낱말 자체를 더 쉬운 낱말로 바꾸어 씁니다.',
    principle: '핵심 학습 개념은 유지하되 표현을 적극적으로 쉽게 바꿉니다.',
    exampleBefore: '광합성은 식물의 생리적 작용입니다.',
    exampleAfter: '광합성은 식물이 하는 중요한 일이에요.'
  },
  {
    id: 't_short_sentence_rewrite', label: '짧은 문장 중심 재작성', recommendedForLevel: [4], conflictLevels: [1],
    category: 'readability',
    description: '문장 전체를 짧고 쉬운 표현으로 다시 씁니다.',
    principle: '핵심 의미는 유지하되 문장 구조는 자유롭게 바꿀 수 있습니다.',
    exampleBefore: '광합성은 식물이 빛 에너지를 이용하여 이산화탄소와 물로부터 양분을 합성하는 과정입니다.',
    exampleAfter: '식물은 햇빛을 이용해 양분을 만들어요. 이것을 광합성이라고 해요.'
  },
  {
    id: 't_real_life_example', label: '실생활 예시 추가', recommendedForLevel: [4], conflictLevels: [1],
    category: 'contentClarity',
    description: '학생이 이미 알고 있는 실생활 예시를 덧붙여 개념을 이해하도록 돕습니다.',
    principle: '원래 학습 개념은 바꾸지 않고 예시만 추가합니다.',
    exampleBefore: '광합성은 식물이 양분을 만드는 과정입니다.',
    exampleAfter: '광합성은 식물이 양분을 만드는 과정이에요. 우리가 밥을 먹고 힘을 내는 것과 비슷해요.'
  },

  // Level 5
  {
    id: 't_one_info_per_line', label: '한 문장에 한 정보', recommendedForLevel: [5], conflictLevels: [1, 2],
    category: 'readability',
    description: '한 줄에 정보를 하나만 담아 아주 단순하게 제시합니다.',
    principle: '핵심 의미만 남기고 나머지 설명은 생략할 수 있습니다.',
    exampleBefore: '식물은 햇빛과 물, 이산화탄소를 이용해 양분과 산소를 만듭니다.',
    exampleAfter: '식물은 햇빛이 필요해요. 식물은 물이 필요해요. 식물은 양분을 만들어요.'
  },
  {
    id: 't_essential_words_only', label: '필수 핵심어 중심 구성', recommendedForLevel: [5], conflictLevels: [1, 2],
    category: 'coreFocus',
    description: '꼭 필요한 핵심 단어 중심으로 내용을 최소화하여 구성합니다.',
    principle: '필수 교과 어휘는 반드시 남깁니다.',
    exampleBefore: '광합성은 식물이 햇빛, 물, 이산화탄소를 이용해 양분과 산소를 만드는 과정입니다.',
    exampleAfter: '광합성: 햇빛 + 물 + 이산화탄소 → 양분 + 산소'
  },
  {
    id: 't_card_units', label: '작은 카드 단위로 분리', recommendedForLevel: [5], conflictLevels: [1, 2],
    category: 'sequence',
    description: '내용을 작은 카드 단위로 나누어 한 번에 하나씩 보여줍니다.',
    principle: '카드의 순서는 원래 학습 순서를 따릅니다.',
    exampleBefore: '(긴 본문 한 문단)',
    exampleAfter: '[카드1] 햇빛 → [카드2] 물 → [카드3] 양분'
  }
];

export const TEXT_STRATEGY_CATEGORY_LABELS: Record<StrategyCategory, string> = {
  readability: '읽기 쉽게',
  coreFocus: '핵심을 찾기 쉽게',
  sequence: '순서를 이해하기 쉽게',
  contentClarity: '내용을 이해하기 쉽게',
  grouping: '관련 정보 정리하기'
};

export const TEXT_STRATEGY_CATEGORY_ORDER: StrategyCategory[] = [
  'readability', 'coreFocus', 'sequence', 'contentClarity'
];

// Pairwise relationships between text strategies when BOTH are selected.
// Anything not listed here is treated as 'compatible' (no warning) — conflicts are
// intentionally kept sparse and only cover genuinely opposing editing principles.
export const TEXT_STRATEGY_RELATIONS: StrategyRelation[] = [
  {
    aId: 't_bold_keyword', bId: 't_change_easy_vocab', type: 'adjustable',
    note: '강조할 단어가 쉬운 말로 바뀔 수 있어요. 바뀐 어휘를 기준으로 굵게 표시를 적용하세요.'
  },
  {
    aId: 't_highlight_important', bId: 't_split_long_sentences', type: 'adjustable',
    note: '문장이 나뉘면 표시할 문장 단위가 달라질 수 있어요. 나뉜 문장 중 핵심 문장에 표시를 적용하세요.'
  },
  {
    aId: 't_underline_key', bId: 't_short_sentence_rewrite', type: 'conflicting',
    explanationA: '원래 문장의 표현과 구조를 그대로 유지한 채 핵심 부분에 밑줄로 강조합니다.',
    explanationB: '문장을 짧고 쉬운 표현으로 적극적으로 다시 씁니다. 원래 문장 구조가 달라질 수 있어요.',
    priorityALabel: '밑줄 강조를 우선', priorityADetail: '표현을 최대한 유지하고 꼭 필요한 부분만 밑줄로 강조합니다.',
    priorityBLabel: '문장 다시 쓰기를 우선', priorityBDetail: '핵심 의미는 유지하되 문장을 쉽게 다시 씁니다. 밑줄은 새로 쓰인 문장의 핵심 부분에 적용합니다.'
  },
  {
    aId: 't_highlight_important', bId: 't_one_info_per_line', type: 'conflicting',
    explanationA: '원래 문장을 그대로 두고 그중 중요한 문장에 표시를 추가합니다.',
    explanationB: '문장을 한 줄에 하나의 정보만 담도록 잘게 나눕니다. 표시할 문장의 단위 자체가 사라질 수 있어요.',
    priorityALabel: '문장 표시를 우선', priorityADetail: '원래 문장을 유지하고 그 안에서 중요한 문장에 표시합니다.',
    priorityBLabel: '한 정보씩 나누기를 우선', priorityBDetail: '문장을 잘게 나누고, 나뉜 문장 중 핵심 내용에 표시를 적용합니다.'
  }
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
  {
    id: 'v_original_as_is', label: '원본 그대로 제시', recommendedForLevel: [1], conflictLevels: [4, 5],
    category: 'readability',
    description: '원본 시각자료를 그대로 사용합니다.',
    principle: '이미지 내용과 구성을 변경하지 않습니다.',
    exampleBefore: '(교과서 원본 그림)',
    exampleAfter: '(동일한 원본 그림, 제목만 정리)'
  },
  {
    id: 'v_highlight_core_only', label: '핵심 부분만 표시', recommendedForLevel: [1], conflictLevels: [4, 5],
    category: 'coreFocus',
    description: '원본 이미지에서 핵심이 되는 부분에만 표시를 추가합니다.',
    principle: '원본 이미지는 그대로 두고 표시만 추가합니다.',
    exampleBefore: '(원본 이미지)',
    exampleAfter: '(원본 이미지 + 핵심 부분 테두리 표시)'
  },

  // Level 2
  {
    id: 'v_border_highlight', label: '중요한 부분 강조', recommendedForLevel: [2], conflictLevels: [5],
    category: 'coreFocus',
    description: '중요한 요소에 테두리나 색으로 강조를 추가합니다.',
    principle: '이미지의 나머지 구성 요소는 그대로 유지합니다.',
    exampleBefore: '(원본 이미지)',
    exampleAfter: '(중요 요소에 노란 테두리 강조)'
  },
  {
    id: 'v_arrows', label: '화살표 추가', recommendedForLevel: [2], conflictLevels: [5],
    category: 'sequence',
    description: '요소 간의 관계나 순서를 화살표로 표시합니다.',
    principle: '원래 이미지 구성 요소는 그대로 두고 관계 표시만 추가합니다.',
    exampleBefore: '햇빛 그림, 식물 그림, 양분 그림이 나열됨',
    exampleAfter: '햇빛 그림 → 식물 그림 → 양분 그림'
  },
  {
    id: 'v_add_labels', label: '핵심 요소 라벨', recommendedForLevel: [2], conflictLevels: [5],
    category: 'coreFocus',
    description: '그림의 핵심 요소 옆에 이름표(라벨)를 붙입니다.',
    principle: '원본 이미지 구성은 유지하고 라벨만 추가합니다.',
    exampleBefore: '(라벨 없는 그림)',
    exampleAfter: "(그림 + '햇빛', '잎', '뿌리' 라벨)"
  },

  // Level 3
  {
    id: 'v_remove_bg', label: '불필요한 배경 제거', recommendedForLevel: [3], compatibleLevels: [2, 3, 4],
    category: 'readability',
    description: '학습과 관계없는 배경 요소를 제거합니다.',
    principle: '핵심 피사체는 그대로 유지합니다.',
    exampleBefore: '(복잡한 배경 속 식물 그림)',
    exampleAfter: '(단색 배경 위 식물 그림)'
  },
  {
    id: 'v_core_element_only', label: '핵심 요소 중심으로 구성', recommendedForLevel: [3], compatibleLevels: [2, 3, 4],
    category: 'readability',
    description: '핵심 요소만 남기고 나머지를 정리합니다.',
    principle: '학습에 꼭 필요한 요소는 반드시 남깁니다.',
    exampleBefore: '(여러 요소가 섞인 복잡한 그림)',
    exampleAfter: '(핵심 요소 2~3개만 남은 그림)'
  },

  // Level 4
  {
    id: 'v_flowchart', label: '순서도 활용', recommendedForLevel: [4], conflictLevels: [1],
    category: 'sequence',
    description: '내용을 순서도 형태로 재구성해 보여줍니다.',
    principle: '원래 학습 개념과 순서는 유지합니다.',
    exampleBefore: '(글로만 설명된 과정)',
    exampleAfter: '(1단계 → 2단계 → 3단계 순서도)'
  },
  {
    id: 'v_step_images', label: '단계별 그림 제공', recommendedForLevel: [4], conflictLevels: [1],
    category: 'sequence',
    description: '각 단계를 별도의 그림으로 나누어 제공합니다.',
    principle: '단계의 순서는 원래 학습 순서를 따릅니다.',
    exampleBefore: '(하나의 큰 그림)',
    exampleAfter: '(1단계 그림, 2단계 그림, 3단계 그림)'
  },
  {
    id: 'v_grouping_info', label: '관련 정보끼리 시각적 그룹화', recommendedForLevel: [4], conflictLevels: [1],
    category: 'grouping',
    description: '관련 있는 정보끼리 묶어서 배치합니다.',
    principle: '정보 간의 관계는 원래 내용과 같게 유지합니다.',
    exampleBefore: '(정보가 흩어져 배치됨)',
    exampleAfter: '(관련 정보끼리 박스로 묶여 배치됨)'
  },

  // Level 5
  {
    id: 'v_one_concept_per_screen', label: '한 화면에 한 개념', recommendedForLevel: [5], conflictLevels: [1, 2],
    category: 'readability',
    description: '한 화면(카드)에 하나의 핵심 개념만 담습니다.',
    principle: '핵심 개념 하나는 반드시 명확히 전달합니다.',
    exampleBefore: '(여러 개념이 담긴 큰 그림)',
    exampleAfter: '(개념 1개 + 큰 아이콘 1개)'
  },
  {
    id: 'v_picture_and_keyword', label: '그림 + 핵심어 구성', recommendedForLevel: [5], conflictLevels: [1, 2],
    category: 'coreFocus',
    description: '그림과 핵심 단어 하나를 함께 제시합니다.',
    principle: '핵심 단어는 꼭 필요한 교과 어휘를 사용합니다.',
    exampleBefore: '(그림만 있음)',
    exampleAfter: "(그림 + '광합성' 핵심어)"
  }
];

export const VISUAL_STRATEGY_CATEGORY_LABELS: Record<StrategyCategory, string> = {
  readability: '단순하게 보기',
  coreFocus: '핵심을 찾기 쉽게',
  sequence: '순서를 이해하기 쉽게',
  contentClarity: '내용 구체화하기',
  grouping: '관련 정보 정리하기'
};

export const VISUAL_STRATEGY_CATEGORY_ORDER: StrategyCategory[] = [
  'readability', 'coreFocus', 'sequence', 'grouping'
];

// Pairwise relationships between visual strategies when BOTH are selected (see TEXT_STRATEGY_RELATIONS).
export const VISUAL_STRATEGY_RELATIONS: StrategyRelation[] = [
  {
    aId: 'v_border_highlight', bId: 'v_remove_bg', type: 'adjustable',
    note: '배경을 정리하면 강조 표시가 더 잘 보여요. 배경 정리 후 강조 위치를 다시 확인하세요.'
  },
  {
    aId: 'v_highlight_core_only', bId: 'v_flowchart', type: 'conflicting',
    explanationA: '원본 이미지는 그대로 두고 핵심 부분만 표시로 강조합니다.',
    explanationB: '원본을 순서도 형태로 새롭게 재구성합니다. 원본 이미지 형태가 유지되지 않을 수 있어요.',
    priorityALabel: '원본 강조를 우선', priorityADetail: '원본 이미지를 유지하고 핵심 부분만 표시로 강조합니다.',
    priorityBLabel: '순서도 재구성을 우선', priorityBDetail: '원본을 순서도 형태로 다시 구성하고, 순서도 안에서 핵심 단계를 강조합니다.'
  }
];

export function findStrategyByLabel(label: string, list: StrategyItem[]): StrategyItem | undefined {
  return list.find(s => s.label === label);
}

export function findStrategyRelation(
  idA: string,
  idB: string,
  relations: StrategyRelation[]
): StrategyRelation | undefined {
  return relations.find(r => (r.aId === idA && r.bId === idB) || (r.aId === idB && r.bId === idA));
}

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

// ============================================================================
// STEP 2 — Observed classroom difficulties → recommended supports (Step 3 strategies)
//
// This is NOT a disability/level classification. Teachers select concrete, observable
// classroom behaviors ("what I see in class"); the engine below maps those observations
// to candidate Step 3 strategies (same canonical labels as ALL_TEXT_STRATEGIES /
// ALL_VISUAL_STRATEGIES) so a recommendation can be applied directly into
// WizardState.textStrategies / visualStrategies with no translation step.
//
// Kept as plain configuration + a pure function (no UI, no side effects) so it can be
// swapped for an AI-based recommendation provider later without touching Step2's UI.
// ============================================================================

export const OBSERVED_DIFFICULTY_CATEGORY_LABELS: Record<ObservedDifficultyCategory, string> = {
  reading: '읽기·이해',
  vocabulary: '어휘·개념',
  taskSequence: '과제·순서',
  memory: '정보·기억',
  expression: '표현·응답',
  visual: '시각적 이해',
  engagement: '집중·참여'
};

export const OBSERVED_DIFFICULTY_CATEGORY_ICONS: Record<ObservedDifficultyCategory, string> = {
  reading: '📖',
  vocabulary: '📚',
  taskSequence: '🧩',
  memory: '🧠',
  expression: '💬',
  visual: '🖼️',
  engagement: '🎯'
};

export const OBSERVED_DIFFICULTY_CATEGORY_ORDER: ObservedDifficultyCategory[] = [
  'reading', 'vocabulary', 'taskSequence', 'memory', 'expression', 'visual', 'engagement'
];

export const OBSERVED_DIFFICULTIES: ObservedDifficultyItem[] = [
  // 읽기·이해
  { id: 'read_finish_long_text', category: 'reading', label: '긴 글을 끝까지 읽기 어려워해요' },
  { id: 'read_long_sentence_meaning', category: 'reading', label: '긴 문장의 뜻을 이해하기 어려워해요' },
  { id: 'read_find_key_content', category: 'reading', label: '글에서 중요한 내용을 찾기 어려워해요' },
  { id: 'read_flow_order', category: 'reading', label: '글의 순서나 흐름을 이해하기 어려워해요' },

  // 어휘·개념
  { id: 'vocab_hard_words', category: 'vocabulary', label: '어려운 단어의 뜻을 이해하기 어려워해요' },
  { id: 'vocab_need_example', category: 'vocabulary', label: '새로운 개념을 이해하려면 구체적인 예가 필요해요' },
  { id: 'vocab_abstract', category: 'vocabulary', label: '추상적인 내용을 이해하기 어려워해요' },
  { id: 'vocab_repeat_core', category: 'vocabulary', label: '핵심 교과 어휘를 반복해서 제시하면 이해하기 쉬워요' },

  // 과제·순서
  { id: 'task_multi_step', category: 'taskSequence', label: '여러 단계의 지시를 한 번에 수행하기 어려워해요' },
  { id: 'task_where_to_start', category: 'taskSequence', label: '무엇부터 시작해야 할지 어려워해요' },
  { id: 'task_remember_order', category: 'taskSequence', label: '활동 순서를 기억하기 어려워해요' },
  { id: 'task_start_end', category: 'taskSequence', label: '과제의 시작과 끝을 파악하기 어려워해요' },

  // 정보·기억
  { id: 'memory_too_much_at_once', category: 'memory', label: '많은 정보가 한꺼번에 나오면 어려워해요' },
  { id: 'memory_recall_prior', category: 'memory', label: '배운 내용을 다시 떠올리는 데 도움이 필요해요' },
  { id: 'memory_repeat_helps', category: 'memory', label: '내용을 반복해서 제시하면 이해하기 쉬워요' },
  { id: 'memory_need_time', category: 'memory', label: '생각하고 반응할 시간이 충분히 필요해요' },

  // 표현·응답
  { id: 'expr_long_answer', category: 'expression', label: '긴 문장으로 답하기 어려워해요' },
  { id: 'expr_choice_helps', category: 'expression', label: '선택지가 있으면 답하기 쉬워요' },
  { id: 'expr_organize_thoughts', category: 'expression', label: '자신의 생각을 문장으로 구성하기 어려워해요' },
  { id: 'expr_alt_response', category: 'expression', label: '말이나 글 이외의 응답 방법이 필요해요' },

  // 시각적 이해
  { id: 'visual_picture_helps', category: 'visual', label: '그림이나 사진이 있으면 이해하기 쉬워요' },
  { id: 'visual_find_key_in_complex', category: 'visual', label: '복잡한 그림에서 중요한 부분을 찾기 어려워해요' },
  { id: 'visual_highlight_helps', category: 'visual', label: '중요한 정보를 눈에 띄게 표시하면 이해하기 쉬워요' },
  { id: 'visual_too_much_at_once', category: 'visual', label: '여러 시각정보가 동시에 제시되면 어려워해요' },

  // 집중·참여
  { id: 'engage_sustain_focus', category: 'engagement', label: '활동에 집중을 오래 유지하기 어려워해요' },
  { id: 'engage_start_end_unclear', category: 'engagement', label: '활동의 시작과 끝을 알기 어려워해요' },
  { id: 'engage_choice_helps', category: 'engagement', label: '선택권이 있으면 활동에 더 잘 참여해요' },
  { id: 'engage_interest_helps', category: 'engagement', label: '관심사가 포함되면 활동에 더 잘 참여해요' },
  { id: 'engage_small_steps_help', category: 'engagement', label: '작은 단계로 제시하면 활동에 참여하기 쉬워요' }
];

interface DifficultySupportMapping {
  text?: string[];
  visual?: string[];
  textLevel?: ModificationLevel;
  visualLevel?: ModificationLevel;
}

// Maps each observed difficulty to candidate Step 3 strategy labels (rule-based).
// A difficulty with no realistic match in the current strategy vocabulary (e.g. purely
// pedagogical/pacing observations like "충분한 반응 시간") is intentionally left unmapped
// rather than forced onto an unrelated strategy.
export const DIFFICULTY_SUPPORT_MAP: Record<string, DifficultySupportMapping> = {
  read_finish_long_text: { text: ['긴 문장을 짧게 나누기', '핵심 요약 박스 제공', '단계별 번호 제공'], textLevel: 3 },
  read_long_sentence_meaning: { text: ['긴 문장을 짧게 나누기', '한 문장에 하나의 정보', '쉬운 어휘로 변경'], textLevel: 3 },
  read_find_key_content: { text: ['중요한 문장 표시', '핵심 문장 강조', '핵심 요약 박스 제공'], visual: ['핵심 부분만 표시'] },
  read_flow_order: { text: ['단계별 번호 제공', '핵심 요약 박스 제공'], visual: ['순서도 활용'] },

  vocab_hard_words: { text: ['어려운 어휘 쉬운 말 풀이', '어려운 어휘 괄호 설명'] },
  vocab_need_example: { text: ['실생활 예시 추가'] },
  vocab_abstract: { text: ['실생활 예시 추가', '쉬운 어휘로 변경'], visual: ['핵심 요소 중심으로 구성'] },
  vocab_repeat_core: { text: ['핵심어 굵게 표시', '필수 핵심어 중심 구성'] },

  task_multi_step: { text: ['단계별 번호 제공'], visual: ['순서도 활용', '단계별 그림 제공'] },
  task_where_to_start: { text: ['단계별 번호 제공'], visual: ['화살표 추가'] },
  task_remember_order: { text: ['단계별 번호 제공'], visual: ['순서도 활용', '단계별 그림 제공'] },
  task_start_end: { text: ['작은 카드 단위로 분리'], visual: ['단계별 그림 제공'] },

  memory_too_much_at_once: { text: ['한 문장에 하나의 정보', '작은 카드 단위로 분리'], visual: ['핵심 요소 중심으로 구성', '한 화면에 한 개념'] },
  memory_recall_prior: { text: ['핵심 요약 박스 제공', '실생활 예시 추가'] },
  memory_repeat_helps: { text: ['필수 핵심어 중심 구성', '핵심어 굵게 표시'] },
  memory_need_time: {},

  expr_long_answer: { text: ['짧은 문장 중심 재작성'] },
  expr_choice_helps: {},
  expr_organize_thoughts: { text: ['쉬운 어휘로 변경'] },
  expr_alt_response: { visual: ['그림 + 핵심어 구성'] },

  visual_picture_helps: { visual: ['원본 그대로 제시', '핵심 요소 중심으로 구성'], visualLevel: 2 },
  visual_find_key_in_complex: { visual: ['핵심 부분만 표시', '중요한 부분 강조', '불필요한 배경 제거'] },
  visual_highlight_helps: { visual: ['중요한 부분 강조', '핵심 요소 라벨'] },
  visual_too_much_at_once: { visual: ['한 화면에 한 개념', '핵심 요소 중심으로 구성'] },

  engage_sustain_focus: { text: ['작은 카드 단위로 분리'], visual: ['한 화면에 한 개념'] },
  engage_start_end_unclear: { text: ['단계별 번호 제공'], visual: ['단계별 그림 제공'] },
  engage_choice_helps: {},
  engage_interest_helps: { text: ['실생활 예시 추가'] },
  engage_small_steps_help: { text: ['단계별 번호 제공', '작은 카드 단위로 분리'], visual: ['단계별 그림 제공'] }
};

function pickMode(votes: ModificationLevel[], fallback: ModificationLevel): ModificationLevel {
  if (votes.length === 0) return fallback;
  const counts = new Map<ModificationLevel, number>();
  votes.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
  let best = fallback;
  let bestCount = -1;
  counts.forEach((count, level) => {
    if (count > bestCount) {
      best = level;
      bestCount = count;
    }
  });
  return best;
}

/**
 * Rule-based recommendation: observed classroom difficulties -> candidate Step 3 strategies.
 * Ranks candidates by how many selected difficulties point to them and returns the top 3-5
 * per domain. Pure function — safe to call for a live preview before anything is applied.
 */
export function recommendSupportsForDifficulties(selectedDifficultyLabels: string[]): SupportRecommendationResult {
  const selectedItems = OBSERVED_DIFFICULTIES.filter(d => selectedDifficultyLabels.includes(d.label));

  const textScores = new Map<string, number>();
  const visualScores = new Map<string, number>();
  const textLevelVotes: ModificationLevel[] = [];
  const visualLevelVotes: ModificationLevel[] = [];

  selectedItems.forEach(item => {
    const mapping = DIFFICULTY_SUPPORT_MAP[item.id];
    if (!mapping) return;
    mapping.text?.forEach(label => textScores.set(label, (textScores.get(label) || 0) + 1));
    mapping.visual?.forEach(label => visualScores.set(label, (visualScores.get(label) || 0) + 1));
    if (mapping.textLevel) textLevelVotes.push(mapping.textLevel);
    if (mapping.visualLevel) visualLevelVotes.push(mapping.visualLevel);
  });

  const rankTop = (scores: Map<string, number>, max: number): string[] =>
    Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, max)
      .map(([label]) => label);

  return {
    textLevel: pickMode(textLevelVotes, 3),
    visualLevel: pickMode(visualLevelVotes, 3),
    textStrategies: rankTop(textScores, 5),
    visualStrategies: rankTop(visualScores, 5)
  };
}
