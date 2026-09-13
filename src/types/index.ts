export type SchoolLevel = 'elementary' | 'middle' | 'high';

export type UserType =
  | 'special_school_teacher'
  | 'special_class_teacher'
  | 'general_teacher'
  | 'researcher'
  | 'administrator'
  | 'pre_service_teacher'
  | 'other';

export const USER_TYPES: Record<UserType, string> = {
  special_school_teacher: '특수학교 교사',
  special_class_teacher: '일반학교 특수학급 교사',
  general_teacher: '일반학급 교사',
  researcher: '교육 관련 연구자',
  administrator: '교육 관리자',
  pre_service_teacher: '예비교사',
  other: '기타',
};

export type AccountStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  userType?: UserType;
  authType?: 'google' | 'anonymous';
  role: 'teacher' | 'admin';
  status?: AccountStatus;
  termsAgreed?: boolean;
  termsAgreedAt?: string;
  privacyAgreed?: boolean;
  privacyAgreedAt?: string;
  createdAt: string;
  lastLoginAt?: string;
  updatedAt?: string;
}

export type ModificationLevel = 1 | 2 | 3 | 4 | 5;

// STEP 2: concrete, observable classroom difficulties a teacher can select for a student.
// This is NOT a diagnosis/disability classification — it only records what the teacher
// observes during class, and drives rule-based support recommendations below.
export type ObservedDifficultyCategory =
  | 'reading' | 'vocabulary' | 'taskSequence' | 'memory' | 'expression' | 'visual' | 'engagement';

export interface ObservedDifficultyItem {
  id: string;
  category: ObservedDifficultyCategory;
  label: string;
}

// Output of the rule-based (or, later, AI-based) support recommendation engine.
// textStrategies/visualStrategies use the SAME canonical strategy labels as Step 3
// (ALL_TEXT_STRATEGIES / ALL_VISUAL_STRATEGIES) so a recommendation can be applied
// directly into WizardState.textStrategies / visualStrategies without any translation.
export interface SupportRecommendationResult {
  textLevel: ModificationLevel;
  visualLevel: ModificationLevel;
  textStrategies: string[];
  visualStrategies: string[];
}

// Teacher-facing purpose grouping for the "다른 수정 방법" browser (Step 3).
// Purely a display/organization concept — does not affect level values, AI prompt mapping, or Firebase schema.
export type StrategyCategory = 'readability' | 'coreFocus' | 'sequence' | 'contentClarity' | 'grouping';

export interface StrategyItem {
  id: string;
  label: string;
  description?: string;
  recommendedForLevel?: ModificationLevel[];
  compatibleLevels?: ModificationLevel[];
  conflictLevels?: ModificationLevel[];
  // Purpose-based grouping for the "다른 수정 방법" list (teacher-facing UI only)
  category?: StrategyCategory;
  // Tooltip/popover metadata (teacher-facing UI only — never sent to AI prompt / preview / export)
  principle?: string;
  exampleBefore?: string;
  exampleAfter?: string;
}

// Relationship between two strategies when BOTH are selected at once.
// 'compatible' is the default and is not stored — only exceptions are listed.
export type StrategyRelationType = 'adjustable' | 'conflicting';

export interface StrategyRelation {
  aId: string;
  bId: string;
  type: StrategyRelationType;
  // Shown as a short non-blocking note when type === 'adjustable'
  note?: string;
  // Shown in the confirmation modal when type === 'conflicting'
  explanationA?: string;
  explanationB?: string;
  priorityALabel?: string;
  priorityADetail?: string;
  priorityBLabel?: string;
  priorityBDetail?: string;
}

// A teacher's chosen priority between two strategies that were flagged as 'conflicting'.
// Kept in wizard UI state only (not part of SavedMaterial/Firebase schema) and optionally
// summarized into the AI prompt as an additional note.
export interface StrategyResolution {
  domain: 'text' | 'visual';
  strategyLabels: [string, string];
  priorityLabel: string;
}

export interface MaterialFile {
  name: string;
  type: 'pdf' | 'image';
  mimeType: string;
  size: number;
  url?: string;
  previewUrl?: string;
  base64Data?: string;
  extractedText?: string;
}

export interface MaterialActivity {
  id: string;
  type: 'concept' | 'activity' | 'question';
  title: string;
  content: string;
  options?: string[];
  hint?: string;
}

export type VisualFormatStyle = 'simple_drawing' | 'photorealistic' | 'illustration' | 'diagram';

export const VISUAL_STYLE_LABELS: Record<VisualFormatStyle, string> = {
  simple_drawing: '간단한 그림 (배경 제거)',
  photorealistic: '실사 이미지',
  illustration: '일러스트(카툰)',
  diagram: '단순 도식'
};

export interface VisualSuggestion {
  id: string;
  sectionId?: string;
  title: string;
  description: string;
  reason?: string;
  visualLevel: ModificationLevel;
  strategies: string[];
  visualStyle?: VisualFormatStyle;
}

export interface WorksheetVerificationInput {
  originalText: string;
  worksheetContent: {
    title: string;
    coreConcept?: string;
    simplifiedContent?: string;
    keywords?: string[];
    summaryNote?: string;
    teacherNote?: string;
    activities?: MaterialActivity[];
  };
}

export interface VerificationFinding {
  type: 'correct' | 'warning' | 'error';
  category: '팩트 검증' | '핵심 개념 누락' | '수준 및 맞춤법' | '관련 없는 내용 (주제 외 내용)';
  message: string;
  suggestion?: string;
  cleanedText?: string;
}

export interface WorksheetVerificationResult {
  status: 'all_good' | 'issues_found';
  score: number;
  summary: string;
  findings: VerificationFinding[];
}

export interface GeneratedVisual {
  id: string;
  suggestionId?: string;
  sectionId?: string;
  imageUrl: string;
  description: string;
  reason?: string;
  generationPrompt: string;
  visualLevel: ModificationLevel;
  strategies: string[];
  visualStyle?: VisualFormatStyle;
  isMock?: boolean;
  source?: 'ai' | 'teacher_upload';
  createdAt: string;
}

export interface VisualGenerationInput {
  suggestionId?: string;
  sectionId?: string;
  topic: string;
  suggestionTitle: string;
  suggestionDescription: string;
  reason?: string;
  visualLevel: ModificationLevel;
  strategies: string[];
  visualStyle?: VisualFormatStyle;
  teacherCustomPrompt?: string;
}

export const MAX_SOURCE_PAGES = 1;
export const MAX_FILE_SIZE_MB = 15;

export interface SourceMaterial {
  id: string;
  type: 'pdf' | 'image' | 'clipboard';
  fileName?: string;
  fileUrl?: string;
  previewUrl?: string;
  pageNumber?: number;
  fileSize?: number;
  mimeType?: string;
}

export interface GeneratedMaterial {
  id: string;
  title: string;
  schoolLevel?: SchoolLevel;
  subject?: string;
  topic?: string;
  targetAudience: string;
  coreConcept: string;
  simplifiedContent: string;
  keywords?: string[];
  activities: MaterialActivity[];
  visualSuggestions?: VisualSuggestion[];
  visuals?: GeneratedVisual[];
  sourceMaterials?: SourceMaterial[];
  pageSize?: 'A4';
  pageOrientation?: 'portrait' | 'landscape';
  pageLength?: 'auto' | 'a4_1' | 'a4_2';
  summaryNote?: string;
  teacherNote?: string;
  generatedPrompt: string;
  originalGeneratedContent?: Omit<GeneratedMaterial, 'originalGeneratedContent'>;
  createdAt: string;
}

export interface MaterialGenerationInput {
  schoolLevel: SchoolLevel;
  subject: string;
  topic?: string;
  sourceText?: string;
  file?: MaterialFile | null;
  sourceMaterials?: SourceMaterial[];
  pageSize?: 'A4';
  pageOrientation?: 'portrait' | 'landscape';
  pageLength?: 'auto' | 'a4_1' | 'a4_2';

  primaryNeeds: string[];
  educationalNeeds: string[];
  disabilityCategories?: string[];

  textModificationLevel: ModificationLevel;
  textStrategies: string[];

  visualModificationLevel: ModificationLevel;
  visualStrategies: string[];

  mustKeepOptions: string[];
  mustKeepText?: string;
  teacherRequest?: string;

  // Optional: teacher-resolved priorities between strategies flagged as conflicting (Step 3).
  // Additive only — existing prompt fields/mapping are unaffected when this is absent.
  strategyResolutions?: StrategyResolution[];
}

export interface SavedMaterial {
  id: string;
  userId: string;
  userEmail?: string;
  title: string;

  schoolLevel: SchoolLevel;
  subject: string;
  topic?: string;
  fileName?: string;
  fileType?: 'pdf' | 'image';
  filePreviewUrl?: string;

  sourceMaterials?: SourceMaterial[];
  pageSize?: 'A4';
  pageOrientation?: 'portrait' | 'landscape';
  pageLength?: 'auto' | 'a4_1' | 'a4_2';

  disabilityCategories?: string[];
  educationalNeeds: string[];

  textModificationLevel: ModificationLevel;
  textStrategies: string[];

  visualModificationLevel: ModificationLevel;
  visualStrategies: string[];

  mustKeepOptions: string[];
  mustKeepText?: string;

  teacherRequest?: string;

  generatedContent: GeneratedMaterial;
  generatedPrompt: string;

  createdAt: string;
  updatedAt?: string;
}

export interface RecommendationEvent {
  id?: string;
  userId: string;
  schoolLevel: string;
  subject: string;
  educationalNeeds: string[];
  recommendedStrategies: string[];
  teacherSelectedStrategies: string[];
  teacherRejectedStrategies: string[];
  createdAt: string;
}

export interface UsageEvent {
  id?: string;
  userId: string;
  eventType: 'login' | 'generate_material' | 'recommendation_trigger' | 'recommendation_select' | 'copy_material' | 'save_material' | 'edit_material' | 'regenerate_material';
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface RecommendationStat {
  strategyName: string;
  recommendedCount: number;
  acceptedRate: number; // 0 ~ 100
}

export interface AdminStats {
  totalTeachers: number;
  activeUsers: number;
  materialsGenerated: number;
  materialsSaved: number;
  materialsReused: number;
  recommendationsUsed: number;
  schoolLevelBreakdown: Record<SchoolLevel, number>;
  topEducationalNeeds: { name: string; count: number; percentage: number }[];
  textLevelDistribution: Record<ModificationLevel, number>;
  visualLevelDistribution: Record<ModificationLevel, number>;
  topTextStrategies: { name: string; count: number }[];
  topVisualStrategies: { name: string; count: number }[];
  udlRatio: { representation: number; actionExpression: number; engagement: number };
  recommendationStats: RecommendationStat[];
  disabilityCategoryPatterns: {
    category: string;
    count: number;
    topNeeds: string[];
    topStrategies: string[];
    avgTextLevel: number;
    avgVisualLevel: number;
  }[];
}
