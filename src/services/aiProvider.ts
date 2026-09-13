import {
  MaterialGenerationInput,
  GeneratedMaterial,
  VisualGenerationInput,
  GeneratedVisual,
  VisualSuggestion,
  ModificationLevel,
  VisualFormatStyle
} from '../types';

export function buildGeneratedPrompt(input: MaterialGenerationInput): string {
  const schoolText = input.schoolLevel === 'elementary' ? '초등' : input.schoolLevel === 'middle' ? '중등' : '고등';
  const disabilityText = input.disabilityCategories && input.disabilityCategories.length > 0 
    ? input.disabilityCategories.join(', ') 
    : '특이사항 없음';
  const needsText = input.primaryNeeds && input.primaryNeeds.length > 0
    ? input.primaryNeeds.join(', ')
    : '기본 학습 지원';
  const strategyPriorityText = input.strategyResolutions && input.strategyResolutions.length > 0
    ? input.strategyResolutions
        .map(r => `${r.strategyLabels.join(' / ')} 중 "${r.priorityLabel}"를 우선 적용`)
        .join('; ')
    : '';

  const orientationText = input.pageOrientation === 'landscape' ? 'A4 가로형 (297 × 210mm)' : 'A4 세로형 (210 × 297mm)';
  const lengthText = input.pageLength === 'a4_1'
    ? 'A4 1장 (한 페이지 완결 배치)'
    : input.pageLength === 'a4_2'
    ? 'A4 2장 이상 (여유로운 글씨/여백 및 심화/복습 활동 추가)'
    : '자동 (내용량에 맞춘 5장 이내 조절)';

  const sourceContentText = input.sourceText || input.mustKeepText || input.topic || '교과서 주요 학습 내용';

  return `당신은 특수교육 및 UDL(보편적 학습 설계) 기반 교수적 수정 전문가입니다.

[1. 원본 수업자료 본문 텍스트 (반드시 100% 분석 및 반영)]
${sourceContentText}

[2. 학습자료 기본 정보 및 용지 설정]
- 학교급: ${schoolText}학교
- 교과: ${input.subject}
- 단원/주제: ${input.topic || '교과서 주요 학습 내용'}
- 용지 방향: ${orientationText}
- 결과물 분량 설정: ${lengthText}
- 원본 파일 첨부: ${input.file ? `${input.file.name} (${input.file.type.toUpperCase()})` : '없음'}

[3. 학생 특성 및 교육적 요구]
- 학생 분류: ${disabilityText}
- 선택된 주요 지원: ${needsText}

[4. 교수적 수정 설정]
- 텍스트 수정 Level: Level ${input.textModificationLevel}
- 선택된 텍스트 수정 전략: ${input.textStrategies.length > 0 ? input.textStrategies.join(', ') : '기본 전략 적용'}
- 시각자료 수정 Level: Level ${input.visualModificationLevel}
- 선택된 시각자료 수정 전략: ${input.visualStrategies.length > 0 ? input.visualStrategies.join(', ') : '기본 전략 적용'}
${strategyPriorityText ? `- 전략 간 우선순위 (교사 지정): ${strategyPriorityText}` : ''}

[5. 반드시 보존할 요소]
- 보존 항목: ${input.mustKeepOptions.length > 0 ? input.mustKeepOptions.join(', ') : '원래 학습목표, 핵심 개념'}
${input.mustKeepText ? `- 교사 지정 보존 어휘/문장: ${input.mustKeepText}` : ''}

[6. 교사 추가 요청사항]
${input.teacherRequest ? `- ${input.teacherRequest}` : '- 특이사항 없음'}

위 조건에 맞춰 [1. 원본 수업자료 본문 텍스트]의 내용과 어휘, 수치, 사실 정보를 100% 반영하여 특수교육대상 학생 및 학습 지원이 필요한 학생을 위한 최적화된 [학생용 교수적 수정 학습자료]와 [교사용 정답/안내]를 작성해주세요.`;
}

export function buildImageGenerationPrompt(input: VisualGenerationInput): string {
  const visualStyle = input.visualStyle || 'photorealistic';

  const styleGuides: Record<VisualFormatStyle, string> = {
    photorealistic: `[표현 방식: 실사형 (Photorealistic Educational Photograph)]
- 실제 고화질 카메라로 촬영한 사실적이고 자연스러운 교육용 사진 스타일로 렌더링합니다.
- 학생용 교육자료에 적합하도록 핵심 피사체(예: 실제 식물 잎, 햇빛, 물방울 등)를 크고 명확하게 중앙에 배치합니다.
- 복잡하거나 어지러운 배경, 학습과 관계없는 주위 요소를 배제하고 대상을 선명하게 부각합니다.
- 시각적 과부하를 방지하기 위해 불필요한 장식이나 아티팩트를 금지합니다.`,

    illustration: `[표현 방식: 교육용 일러스트 (Educational Digital Illustration)]
- 학생들에게 친근한 높은 명암 대비의 깔끔한 디지털 벡터 일러스트레이션으로 생성합니다.
- 핵심 대상과 요소 간 관계가 한눈에 들어오도록 선명한 윤곽선과 원색을 사용합니다.`,

    diagram: `[표현 방식: 단순 도식 (Simple Schematic Diagram)]
- 2D 평면 순서도 및 단계별 관계선 중심의 미니멀 그래픽 도식으로 생성합니다.
- 복잡한 입체 효과 대신 한눈에 파악할 수 있는 단순 구조도를 사용합니다.`
  };

  const levelNames: Record<ModificationLevel, string> = {
    1: 'Level 1 · 원본 유지',
    2: 'Level 2 · 핵심 강조 (하이라이트, 화살표, 테두리)',
    3: 'Level 3 · 단순화 (복잡 배경 제거, 명확한 핵심 피사체)',
    4: 'Level 4 · 시각적 구조화 (순서도, 단계별 그림)',
    5: 'Level 5 · 핵심 시각정보 중심 (1개 핵심 피사체/아이콘)'
  };

  const stratsText = input.strategies && input.strategies.length > 0
    ? input.strategies.map(s => `- ${s}`).join('\n')
    : '- 기본 시각적 수정 원칙 적용';

  const customRequestSection = input.teacherCustomPrompt
    ? `\n\n6. 교사 추가 수정 지침 (Teacher Custom Request):\n- ${input.teacherCustomPrompt}`
    : '';

  return `[AI 시각자료 생성 지시문 (Image AI Prompt)]

1. 학습 주제 및 목적:
- 학습 주제: ${input.topic}
- 시각자료 세부 지침: ${input.suggestionDescription}

2. Visual Style & Rendering Rule:
${styleGuides[visualStyle]}

3. 시각자료 교수적 수정 Level 및 세부 전략:
- 수정 Level: ${levelNames[input.visualLevel] || `Level ${input.visualLevel}`}
- 선택된 세부 전략:
${stratsText}

4. 텍스트 처리 원칙 (Text Generation Constraint):
- 이미지 내부에는 긴 한글 문장이나 복잡한 텍스트를 직접 그리지 마세요. (필요한 제목/라벨은 웹/DOCX/PDF 레이아웃에서 별도 텍스트로 배치됩니다.)
- 필요 시 최소한의 시각적 기호(화살표, 테두리, 1, 2, 3 번호)만 사용하세요.

5. 핵심 생성 제약조건:
- 핵심 대상(Primary Focus Subject)을 크고 명확하게 표현합니다.
- 장식적 요소 및 어지러운 배경을 최소화하여 특수교육 대상 학생의 시각적 과부하를 방지합니다.
- 원래 학습 개념을 왜곡하거나 변형하지 않습니다.${customRequestSection}`;
}

export interface BlockRewriteInput {
  action: 'simplify' | 'shorten' | 'add_example';
  content: string;
  context?: {
    schoolLevel?: string;
    subject?: string;
    topic?: string;
    mustKeepText?: string;
  };
}

export interface TextAIProvider {
  generateMaterial(input: MaterialGenerationInput): Promise<GeneratedMaterial>;
  rewriteBlock?(input: BlockRewriteInput): Promise<string>;
}

export interface ImageAIProvider {
  generateVisual(input: VisualGenerationInput): Promise<GeneratedVisual>;
}

export interface AIProvider extends TextAIProvider, ImageAIProvider {
  regenerateSection?(materialId: string, sectionId: string, instruction: string): Promise<string>;
}

/**
 * Generate educational SVG graphic dynamically for Mock mode
 */
function createMockEducationalSvg(input: VisualGenerationInput): string {
  const level = input.visualLevel;
  const title = input.suggestionTitle || input.topic;
  const safeTitle = title || '';
  const visualStyle = input.visualStyle || 'photorealistic';
  const styleLabel = visualStyle === 'photorealistic' ? '📷 실사형' : visualStyle === 'illustration' ? '🎨 일러스트' : '📐 도식';

  const isFireworks = safeTitle.includes('불꽃') || safeTitle.includes('축제') || safeTitle.includes('자산') || safeTitle.includes('경제');
  const isPhotosynthesis = safeTitle.includes('광합성') || safeTitle.includes('식물') || safeTitle.includes('햇빛');

  let contentSvg = '';

  if (isFireworks) {
    if (level === 5) {
      contentSvg = `
        <rect x="180" y="70" width="240" height="140" rx="16" fill="#1e1b4b" stroke="#818cf8" stroke-width="3"/>
        <text x="300" y="125" font-size="42" text-anchor="middle" fill="#fbbf24">🎆 → 🏬</text>
        <text x="300" y="175" font-size="16" font-weight="bold" text-anchor="middle" fill="#ffffff">세계 불꽃 축제 도시 자산</text>
      `;
    } else if (level === 4) {
      contentSvg = `
        <rect x="40" y="90" width="150" height="90" rx="12" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
        <text x="115" y="120" font-size="13" font-weight="bold" fill="#38bdf8" text-anchor="middle">1단계: 축제</text>
        <text x="115" y="150" font-size="20" text-anchor="middle">🎆 불꽃 축제</text>

        <text x="215" y="142" font-size="24" fill="#94a3b8" text-anchor="middle">➔</text>

        <rect x="235" y="90" width="150" height="90" rx="12" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
        <text x="310" y="120" font-size="13" font-weight="bold" fill="#34d399" text-anchor="middle">2단계: 방문</text>
        <text x="310" y="150" font-size="20" text-anchor="middle">👥 100만 명</text>

        <text x="410" y="142" font-size="24" fill="#94a3b8" text-anchor="middle">➔</text>

        <rect x="430" y="90" width="130" height="90" rx="12" fill="#0f172a" stroke="#f43f5e" stroke-width="2"/>
        <text x="495" y="120" font-size="13" font-weight="bold" fill="#f43f5e" text-anchor="middle">3단계: 효과</text>
        <text x="495" y="150" font-size="20" text-anchor="middle">💰 295억 원</text>
      `;
    } else if (level === 3) {
      contentSvg = `
        <rect x="80" y="80" width="440" height="110" rx="16" fill="#0284c7" fill-opacity="0.15" stroke="#0284c7" stroke-width="2" stroke-dasharray="6,6"/>
        <circle cx="160" cy="135" r="35" fill="#f59e0b"/>
        <text x="160" y="144" font-size="26" text-anchor="middle">🎆</text>
        
        <text x="230" y="142" font-size="22" fill="#38bdf8" text-anchor="middle">+</text>
        
        <circle cx="300" cy="135" r="35" fill="#10b981"/>
        <text x="300" y="144" font-size="26" text-anchor="middle">🏬</text>
        
        <text x="370" y="142" font-size="22" fill="#38bdf8" text-anchor="middle">=</text>

        <circle cx="440" cy="135" r="35" fill="#6366f1"/>
        <text x="440" y="144" font-size="26" text-anchor="middle">💰</text>
      `;
    } else {
      contentSvg = `
        <rect x="60" y="85" width="480" height="100" rx="14" fill="#0f172a" stroke="#f59e0b" stroke-width="3"/>
        <text x="140" y="130" font-size="15" font-weight="bold" fill="#fef08a" text-anchor="middle">【 🎆 불꽃 축제 】</text>
        <text x="240" y="130" font-size="20" fill="#f59e0b" text-anchor="middle">➔</text>
        <text x="340" y="130" font-size="15" font-weight="bold" fill="#6ee7b7" text-anchor="middle">【 🏬 동네 상권 】</text>
        <text x="430" y="130" font-size="20" fill="#f59e0b" text-anchor="middle">➔</text>
        <text x="485" y="130" font-size="15" font-weight="bold" fill="#c084fc" text-anchor="middle">【 💰 295억 원 】</text>
      `;
    }
  } else if (isPhotosynthesis) {
    if (level === 5) {
      contentSvg = `
        <rect x="180" y="70" width="240" height="140" rx="16" fill="#1e1b4b" stroke="#818cf8" stroke-width="3"/>
        <text x="300" y="125" font-size="42" text-anchor="middle" fill="#fbbf24">☀️ → 🌿</text>
        <text x="300" y="175" font-size="20" font-weight="bold" text-anchor="middle" fill="#ffffff">${title}</text>
      `;
    } else {
      contentSvg = `
        <rect x="80" y="80" width="440" height="110" rx="16" fill="#0284c7" fill-opacity="0.15" stroke="#0284c7" stroke-width="2" stroke-dasharray="6,6"/>
        <circle cx="160" cy="135" r="35" fill="#f59e0b"/>
        <text x="160" y="142" font-size="26" text-anchor="middle">☀️</text>
        <text x="230" y="142" font-size="22" fill="#38bdf8" text-anchor="middle">+</text>
        <circle cx="300" cy="135" r="35" fill="#10b981"/>
        <text x="300" y="142" font-size="26" text-anchor="middle">🌿</text>
        <text x="370" y="142" font-size="22" fill="#38bdf8" text-anchor="middle">=</text>
        <circle cx="440" cy="135" r="35" fill="#6366f1"/>
        <text x="440" y="142" font-size="26" text-anchor="middle">🧪</text>
      `;
    }
  } else {
    // Universal Educational SVG for any custom topics
    contentSvg = `
      <rect x="60" y="85" width="480" height="100" rx="14" fill="#0f172a" stroke="#38bdf8" stroke-width="3"/>
      <text x="140" y="130" font-size="15" font-weight="bold" fill="#38bdf8" text-anchor="middle">【 📌 핵심 개념 】</text>
      <text x="240" y="130" font-size="20" fill="#94a3b8" text-anchor="middle">➔</text>
      <text x="340" y="130" font-size="15" font-weight="bold" fill="#34d399" text-anchor="middle">【 💡 교수적 수정 】</text>
      <text x="430" y="130" font-size="20" fill="#94a3b8" text-anchor="middle">➔</text>
      <text x="485" y="130" font-size="15" font-weight="bold" fill="#fbbf24" text-anchor="middle">【 🎯 맞춤 학습 】</text>
    `;
  }

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240" width="100%" height="100%">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#090d16" />
          <stop offset="100%" stop-color="#111827" />
        </linearGradient>
      </defs>
      
      <!-- Outer Card Background -->
      <rect x="0" y="0" width="600" height="240" rx="20" fill="url(#bgGrad)" stroke="#334155" stroke-width="2" />
      
      <!-- Card Header -->
      <rect x="20" y="18" width="560" height="34" rx="8" fill="#1e293b" />
      <text x="35" y="40" font-size="12" font-weight="bold" fill="#38bdf8">🎨 AI 시각자료 [ Level ${level} ] · ${styleLabel}</text>
      <text x="565" y="40" font-size="10" font-weight="bold" fill="#f59e0b" text-anchor="end">🧪 Mock 시각자료 (Real Provider 준비완료)</text>
      
      <!-- Graphic Content -->
      ${contentSvg}

      <!-- Bottom Caption -->
      <text x="300" y="222" font-size="11" fill="#64748b" text-anchor="middle">${input.suggestionDescription || title}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

export class MockAIProvider implements AIProvider {
  async generateMaterial(input: MaterialGenerationInput): Promise<GeneratedMaterial> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    const schoolText = input.schoolLevel === 'elementary' ? '초등' : input.schoolLevel === 'middle' ? '중등' : '고등';
    const topicTitle = input.topic || `${input.subject} 주요 핵심 학습 내용`;
    const levelText = `글 Level ${input.textModificationLevel} (${input.textModificationLevel >= 4 ? '쉬운 표현 중심' : '구조화 중심'}) / 시각 Level ${input.visualModificationLevel}`;
    const generatedPrompt = buildGeneratedPrompt(input);

    const safeTopic = input.topic || '';
    const isFireworksSample = safeTopic.includes('불꽃') || safeTopic.includes('도시 자산');

    let simplifiedContent = "";
    if (isFireworksSample) {
      simplifiedContent = `🎆 **세계 불꽃 축제는 도시에 큰 도움이 돼요!**\n\n` +
        `1. **밤하늘의 축제**: 매년 가을, 밤하늘을 수놓는 아름다운 불꽃 축제가 열려요.\n` +
        `2. **295억 원의 경제 효과**: 불꽃 축제 덕분에 도시에 약 **295억 원**의 큰 경제적 이익이 생겨요.\n` +
        `3. **동네 가게가 살아나요**: 매년 **100만 명 이상**(외국인 관광객 포함)이 찾아와 동네 식당과 가게에서 소비를 해요.\n` +
        `4. **새로운 일자리**: 축제 기간 동안 일할 수 있는 임시 일자리가 늘어나 주민들에게 도움을 줘요.\n\n` +
        `> 💡 **선생님의 힌트:** '도시 자산'이란 건물이나 땅처럼 도시에 큰 도움과 이익을 주는 보물 같은 것을 뜻해요!`;
    } else if (input.textModificationLevel >= 4) {
      simplifiedContent = `🌱 **한눈에 알아봐요!**\n\n1. **${topicTitle}**은 수업에서 가장 중요한 내용이에요.\n2. 복잡하고 긴 문장을 쉬운 단어로 나누어 놓았어요.\n3. 핵심 낱말만 굵게 표시되어 있으니 천천히 읽어 보세요.\n\n> 💡 **선생님의 힌트:** ${input.teacherRequest || '그림과 단어를 짝지어 생각하면 훨씬 이해하기 쉬워요!'}`;
    } else if (input.textModificationLevel === 3) {
      simplifiedContent = `📌 **주요 개념 한 줄 정리**\n\n- **개념 1:** ${topicTitle}의 기본 의미를 파악합니다.\n- **개념 2:** 주요 과정과 특징을 순서대로 살펴봅니다.\n- **개념 3:** 실생활 예시를 통해 개념을 확인합니다.\n\n---\n\n[핵심 요약 박스]\n* 필수 교과 어휘: ${input.mustKeepText || '학습 필수 어휘 포함'}\n* 핵심 원리: 원문의 핵심 학습목표를 보존하여 작성되었습니다.`;
    } else {
      simplifiedContent = `📖 **수업 자료 본문 (강조 및 구조화)**\n\n본문 내용 중 **핵심 개념**과 **필수 어휘**에 하이라이트가 적용되었습니다. 순서에 따라 단계별로 읽고 활동을 진행하세요.`;
    }

    const activities = isFireworksSample
      ? [
          {
            id: 'act-1',
            type: 'concept' as const,
            title: '1. 꼭 기억해야 할 핵심 개념',
            content: `**세계 불꽃 축제와 도시 자산**\n\n- 핵심 원리: 불꽃 축제는 단순한 볼거리가 아니라 동네 상권(식당, 가게)을 살리고 일자리를 만들어 주는 소중한 경제적 자산입니다.\n- 알맞은 말에 동그라미 표 하세요: 불꽃 축제는 동네 가게 장사에 ( 도움을 준다 / 안 준다 ).`
          },
          {
            id: 'act-2',
            type: 'activity' as const,
            title: '2. 낱말과 뜻 짝짓기 (시각 힌트 지원)',
            content: `[1단계] 아래 알맞은 단어와 설명을 화살표로 연결해 보세요.\n\nㆍ 295억 원 ─────────── ( 축제로 생기는 경제 효과 )\nㆍ 소상공인 ─────────── ( 동네에서 작은 가게를 운영하는 사장님 )\nㆍ 100만 명 ─────────── ( 매년 축제를 보러 오는 사람 수 )`,
            hint: '힌트: 불꽃 축제에 정말 많은 사람들이 놀러 오는 모습을 떠올려 보세요!'
          },
          {
            id: 'act-3',
            type: 'question' as const,
            title: '3. 확인 문제 (선택형 응답)',
            content: `세계 불꽃 축제가 도시에 가져다주는 좋은 점으로 알맞은 것은 무엇일까요?`,
            options: ['1) 동네 가게와 식당 매출이 늘어남', '2) 아무도 구경하러 오지 않음', '3) 도시에 돈이 전혀 안 됨']
          }
        ]
      : [
          {
            id: 'act-1',
            type: 'concept' as const,
            title: '1. 꼭 기억해야 할 핵심 개념',
            content: `**${topicTitle}**\n\n- 핵심 원리: 식물이 햇빛, 물, 이산화탄소를 이용해 양분과 산소를 만드는 과정입니다.\n- 알맞은 말에 동그라미 표 하세요: ( 햇빛 / 빛이 없는 곳 )에서 잘 일어납니다.`
          },
          {
            id: 'act-2',
            type: 'activity' as const,
            title: '2. 단계별 학습 활동 (그림 및 힌트 지원)',
            content: `[1단계] 아래 그림을 보고 알맞은 단어를 연결해 보세요.\n\nㆍ 햇빛 ─────────── ( 식물이 에너지를 얻는 빛 )\nㆍ 물 ──────────── ( 뿌리에서 흡수해요 )\nㆍ 산소 ─────────── ( 식물이 만들어내는 기체 )`,
            hint: '힌트: 화분에 물을 줄 때 식물이 쑥쑥 자라는 모습을 생각해보세요!'
          },
          {
            id: 'act-3',
            type: 'question' as const,
            title: '3. 확인 문제 (선택형 응답)',
            content: `다음 중 **${topicTitle}**에 필요한 요소가 **아닌** 것은 무엇일까요?`,
            options: ['1) 햇빛', '2) 물', '3) 얼음 조각']
          }
        ];

    if (input.pageLength === 'a4_2' && !isFireworksSample) {
      activities.push({
        id: 'act-4',
        type: 'activity' as const,
        title: '4. 심화 복습 및 생각 넓히기 (A4 2장 이상 확장)',
        content: `[스스로 체크하기]\n☑ 식물이 밥(양분)을 만드는 데 꼭 필요한 빛의 이름을 써보세요: (                 )\n☑ 식물 잎에서 새로 만들어져 나오는 기체는 ( 산소 / 이산화탄소 )입니다.`,
        hint: '힌트: 낮에 하늘에 뜨는 따뜻한 빛을 생각해보세요!'
      });
      activities.push({
        id: 'act-5',
        type: 'activity' as const,
        title: '5. 짝꿍과 함께하는 또래 협동 활동',
        content: `🤝 짝과 역할을 나누어 돋보기로 실제 식물 잎을 관찰해 봅시다.\nㆍ 짝꿍: 식물 잎을 움직이지 않게 잡아줍니다.\nㆍ 나: 돋보기로 관찰한 모양에 ◯ 표를 해보세요. ( [  ] 넓은 잎  /  [  ] 뾰족한 잎 )`,
        hint: '힌트: 짝꿍과 역할을 차례대로 바꾸어 관찰해보세요!'
      });
    }

    const isPhotosynthesisTopic = safeTopic.includes('광합성') || safeTopic.includes('식물') || input.subject === '과학';

    const keywords = isFireworksSample
      ? ['세계 불꽃 축제', '도시 자산', '295억 원', '소상공인', '외국인 관광객']
      : isPhotosynthesisTopic
      ? ['광합성', '햇빛', '물', '이산화탄소', '양분']
      : [safeTopic || input.subject, '핵심 개념', '필수 어휘', '학습 내용', '주요 원리'];

    // Provide 2 Visual Suggestions for Teacher to optionally click [✨ 그림 생성하기]
    const visualSuggestions: VisualSuggestion[] = isFireworksSample
      ? [
          {
            id: 'sugg-concept-1',
            sectionId: 'concept',
            title: `세계 불꽃 축제 도시 자산 도식`,
            description: '불꽃 축제 ➔ 100만 명 방문 ➔ 295억 원 경제 효과 및 소상공인 매출 증대 구조도',
            reason: '불꽃 축제가 지역 상권과 일자리에 가져다주는 문화·경제적 자산 가치를 시각화합니다.',
            visualLevel: input.visualModificationLevel,
            strategies: input.visualStrategies
          },
          {
            id: 'sugg-activity-2',
            sectionId: 'activity-2',
            title: '핵심 어휘 매칭 시각 카드',
            description: '295억 원, 소상공인, 외국인 관광객 시각 어휘 카드',
            reason: '핵심 경제 개념 어휘의 직관적 이해 지원',
            visualLevel: input.visualModificationLevel,
            strategies: input.visualStrategies
          }
        ]
      : [
          {
            id: 'sugg-concept-1',
            sectionId: 'concept',
            title: `${topicTitle} 핵심 개념 구조도`,
            description: `${topicTitle}의 주요 원리와 핵심 요소를 한눈에 파악할 수 있는 시각자료`,
            reason: `${topicTitle}의 핵심 개념 파지 및 시각적 이해 지원`,
            visualLevel: input.visualModificationLevel,
            strategies: input.visualStrategies
          },
          {
            id: 'sugg-activity-2',
            sectionId: 'activity-2',
            title: '핵심 어휘 매칭 시각 카드',
            description: '주요 어휘와 개념을 연결하는 시각 카드',
            reason: '어휘 장벽 해소 및 시각 지원',
            visualLevel: input.visualModificationLevel,
            strategies: input.visualStrategies
          }
        ];

    const pageLengthDesc = input.pageLength === 'a4_1' ? 'A4 1장 맞춤' : input.pageLength === 'a4_2' ? 'A4 2장 이상' : '자동 분량';

    const baseResult: GeneratedMaterial = {
      id: `mat-${Date.now()}`,
      title: `[학생용 교수적 수정] ${schoolText} ${input.subject} - ${topicTitle}`,
      schoolLevel: input.schoolLevel,
      subject: input.subject,
      topic: input.topic,
      targetAudience: `${schoolText} ${input.subject} / ${input.primaryNeeds.join(', ') || '기본 교육적 요구'}`,
      coreConcept: topicTitle,
      simplifiedContent,
      keywords,
      activities,
      visualSuggestions,
      visuals: [], // Initially empty! Teacher must explicitly click [✨ 그림 생성하기]
      pageSize: input.pageSize || 'A4',
      pageOrientation: input.pageOrientation || 'portrait',
      pageLength: input.pageLength || 'auto',
      summaryNote: `적용된 교수적 수정: ${levelText} | 설정 분량: ${pageLengthDesc}`,
      teacherNote: input.teacherRequest ? `교사 추가 요청 반영: ${input.teacherRequest}` : '정답: 1. 핵심 개념 (햇빛) / 2. 연결 활동 (햇빛-빛, 물-뿌리) / 3. 확인 문제 (3번 얼음 조각)',
      generatedPrompt,
      createdAt: new Date().toLocaleString('ko-KR', { hour12: false })
    };

    return {
      ...baseResult,
      originalGeneratedContent: { ...baseResult }
    };
  }

  async generateVisual(input: VisualGenerationInput): Promise<GeneratedVisual> {
    // Simulate image generation API network latency
    await new Promise(resolve => setTimeout(resolve, 800));

    const visualStyle = input.visualStyle || 'photorealistic';
    const generationPrompt = buildImageGenerationPrompt({ ...input, visualStyle });
    const imageUrl = createMockEducationalSvg({ ...input, visualStyle });

    return {
      id: `vis-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      suggestionId: input.suggestionId,
      sectionId: input.sectionId,
      imageUrl,
      description: input.suggestionDescription,
      reason: input.reason,
      generationPrompt,
      visualLevel: input.visualLevel,
      strategies: input.strategies,
      visualStyle,
      isMock: true,
      source: 'ai',
      createdAt: new Date().toISOString()
    };
  }

  async regenerateSection(materialId: string, sectionId: string, instruction: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return `[AI 부분 수정 완료 (${instruction})]: 학생의 이해도를 돕기 위해 더욱 쉬운 단어와 실생활 예시로 다시 작성된 내용입니다.`;
  }

  async rewriteBlock(input: BlockRewriteInput): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const { action, content } = input;
    
    if (action === 'simplify') {
      // Simplify sentences and terms directly without meta logs
      const cleanContent = content.replace(/🌱 \*\*한눈에 알아봐요!\*\*\s*/g, '').trim();
      return `🌱 **쉬운 단어로 알아봐요!**\n\n1. 핵심 내용을 쉬운 낱말로 풀어서 설명해요.\n2. ${cleanContent.replace(/복잡하고 긴 문장을 쉬운 단어로 나누어 놓았어요\./g, '중요한 말을 차근차근 읽어 보세요.')}`;
    } else if (action === 'shorten') {
      // Shorten while maintaining core meaning
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      if (lines.length > 2) {
        return lines.slice(0, 2).join('\n');
      }
      return content.length > 50 ? content.substring(0, 50) + '...' : content;
    } else if (action === 'add_example') {
      // Add clear concrete example
      return `${content}\n\n💡 **구체적 예시:**\n- 식물이 햇빛을 받아 자라는 것은 사람이 밥을 먹고 힘을 내는 것과 같아요!`;
    }

    return content;
  }
}

export class GeminiAIProvider implements AIProvider {
  private mock = new MockAIProvider();

  private getApiKey(): string | undefined {
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
        return import.meta.env.VITE_GEMINI_API_KEY;
      }
      if (typeof process !== 'undefined' && process.env && process.env.VITE_GEMINI_API_KEY) {
        return process.env.VITE_GEMINI_API_KEY;
      }
    } catch (e) {
      // Ignore env reading errors
    }
    return undefined;
  }

  async generateMaterial(input: MaterialGenerationInput): Promise<GeneratedMaterial> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.log('VITE_GEMINI_API_KEY environment variable not found. Using Mock AI Provider.');
      return this.mock.generateMaterial(input);
    }

    try {
      const prompt = buildGeneratedPrompt(input);
      const systemInstruction = `당신은 특수교육 및 UDL(보편적 학습 설계) 교수적 수정 전문가입니다.
다음 조건에 따라 순수 JSON 형식으로만 응답해주세요. markdown 코드 블록 (\`\`\`json ...) 없이 오직 유효한 JSON 문자열만 반환해야 합니다.

JSON Schema format:
{
  "title": "학습지 제목",
  "coreConcept": "핵심 개념 1~2문장",
  "keywords": ["핵심어1", "핵심어2", "핵심어3"],
  "simplifiedContent": "학생용 쉬운 본문 내용 (필요시 **볼드** 및 순서 번호 활용)",
  "activities": [
    {
      "id": "act-1",
      "type": "concept",
      "title": "1. 활동 제목",
      "content": "활동 내용 설명",
      "options": ["1) 보기1", "2) 보기2", "3) 보기3"]
    }
  ],
  "summaryNote": "적용된 교수적 수정 지침 요약",
  "teacherNote": "교사 정답 및 지도 참고 가이드"
}`;

      const userParts: any[] = [
        { text: `${systemInstruction}\n\n[요청 조건 지시문]\n${prompt}` }
      ];

      if (input.file && input.file.base64Data) {
        userParts.push({
          inlineData: {
            mimeType: input.file.mimeType || 'image/png',
            data: input.file.base64Data
          }
        });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: userParts
              }
            ],
            generationConfig: {
              temperature: 0.4,
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const resData = await response.json();
      const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanJsonStr = rawText.replace(/```json\s*|\s*```/g, '').trim();

      const parsed = JSON.parse(cleanJsonStr);

      const schoolText = input.schoolLevel === 'elementary' ? '초등' : input.schoolLevel === 'middle' ? '중등' : '고등';
      const topicTitle = input.topic || `${input.subject} 주요 핵심 학습 내용`;
      const levelText = `글 Level ${input.textModificationLevel} / 시각 Level ${input.visualModificationLevel}`;

      const baseResult: GeneratedMaterial = {
        id: `mat-gemini-${Date.now()}`,
        title: parsed.title || `[학생용 교수적 수정] ${schoolText} ${input.subject} - ${topicTitle}`,
        schoolLevel: input.schoolLevel,
        subject: input.subject,
        topic: input.topic,
        targetAudience: `${schoolText} ${input.subject} / ${input.primaryNeeds.join(', ') || '기본 교육적 요구'}`,
        coreConcept: parsed.coreConcept || topicTitle,
        simplifiedContent: parsed.simplifiedContent || '',
        keywords: parsed.keywords || ['핵심어'],
        activities: parsed.activities || [],
        visualSuggestions: [
          {
            id: 'sugg-gemini-1',
            sectionId: 'concept',
            title: `${topicTitle} 단계별 시각자료`,
            description: `${topicTitle}의 핵심 개념과 발생 과정을 한눈에 파악할 수 있는 시각자료`,
            reason: '개념 이해 및 인지 파지 지원',
            visualLevel: input.visualModificationLevel,
            strategies: input.visualStrategies
          },
          {
            id: 'sugg-gemini-2',
            sectionId: 'activity-2',
            title: '핵심 어휘 매칭 시각 카드',
            description: '핵심 어휘와 그림을 매칭하는 시각자료',
            reason: '어휘 장벽 해소 및 시각 지원',
            visualLevel: input.visualModificationLevel,
            strategies: input.visualStrategies
          }
        ],
        visuals: [],
        pageSize: input.pageSize || 'A4',
        pageOrientation: input.pageOrientation || 'portrait',
        pageLength: input.pageLength || 'auto',
        summaryNote: parsed.summaryNote || `Google Gemini 1.5 UDL 교수적 수정 | ${levelText}`,
        teacherNote: parsed.teacherNote || '교사용 정답 및 지도 가이드',
        generatedPrompt: prompt,
        createdAt: new Date().toLocaleString('ko-KR', { hour12: false })
      };

      return {
        ...baseResult,
        originalGeneratedContent: { ...baseResult }
      };
    } catch (err) {
      console.warn('Gemini API request failed. Falling back to Mock AI Provider:', err);
      return this.mock.generateMaterial(input);
    }
  }

  async generateVisual(input: VisualGenerationInput): Promise<GeneratedVisual> {
    return this.mock.generateVisual(input);
  }

  async rewriteBlock(input: BlockRewriteInput): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) return this.mock.rewriteBlock(input);

    try {
      const actionGuide =
        input.action === 'simplify'
          ? '학생 눈높이에 맞추어 더 쉬운 낱말과 구어체 문장으로'
          : input.action === 'shorten'
          ? '핵심 내용만 간추려 1~2줄의 짧은 요약문으로'
          : '구체적인 일상생활 사례 예시를 추가하여';

      const prompt = `다음 특수교육 학습지 본문 단락을 ${actionGuide} 다시 작성해주세요.

[원문 내용]
${input.content}

오직 새로 작성된 학습지 단락 내용만 출력해주세요. 메타 설명이나 인사말은 금지합니다.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3 }
          })
        }
      );

      if (!response.ok) throw new Error(`Gemini rewrite error: ${response.status}`);
      const resData = await response.json();
      return resData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || input.content;
    } catch (e) {
      console.warn('Gemini rewrite failed. Falling back to Mock:', e);
      return this.mock.rewriteBlock(input);
    }
  }
}

export class ServerAIProvider implements AIProvider {
  private gemini = new GeminiAIProvider();

  async generateMaterial(input: MaterialGenerationInput): Promise<GeneratedMaterial> {
    return this.gemini.generateMaterial(input);
  }

  async generateVisual(input: VisualGenerationInput): Promise<GeneratedVisual> {
    return this.gemini.generateVisual(input);
  }

  async rewriteBlock(input: BlockRewriteInput): Promise<string> {
    return this.gemini.rewriteBlock(input);
  }
}

export const defaultAiProvider: AIProvider = new GeminiAIProvider();

