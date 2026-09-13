export type SchoolLevel = 'elementary' | 'middle' | 'high';

export type UserType =
  | 'special_school_teacher'
  | 'special_class_teacher'
  | 'inclusive_class_teacher'
  | 'researcher_admin'
  | 'other'
  | 'prefer_not_to_say';

export const USER_TYPES: Record<UserType, string> = {
  special_school_teacher: '특수학교 교사',
  special_class_teacher: '일반학교 특수학급 교사',
  inclusive_class_teacher: '통합학급을 운영하는 일반교사',
  researcher_admin: '특수교육 관련 연구자·관리자',
  other: '기타',
  prefer_not_to_say: '선택하지 않음',
};

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  userType?: UserType;
  role: 'teacher' | 'admin';
  createdAt: string;
  lastLoginAt?: string;
  updatedAt?: string;
}

export type ModificationLevel = 1 | 2 | 3 | 4 | 5;

export interface StrategyItem {
  id: string;
  label: string;
  description?: string;
  recommendedForLevel?: ModificationLevel[];
  compatibleLevels?: ModificationLevel[];
  conflictLevels?: ModificationLevel[];
}

export interface MaterialFile {
  name: string;
  type: 'pdf' | 'image';
  mimeType: string;
  size: number;
  url?: string;
  previewUrl?: string;
}

export interface MaterialActivity {
  id: string;
  type: 'concept' | 'activity' | 'question';
  title: string;
  content: string;
  options?: string[];
  hint?: string;
}

export type VisualFormatStyle = 'photorealistic' | 'illustration' | 'diagram';

export const VISUAL_STYLE_LABELS: Record<VisualFormatStyle, string> = {
  photorealistic: '실사형 (Photorealistic)',
  illustration: '교육용 일러스트',
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
  file?: MaterialFile | null;
  sourceMaterials?: SourceMaterial[];
  pageSize?: 'A4';
  pageOrientation?: 'portrait' | 'landscape';

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
