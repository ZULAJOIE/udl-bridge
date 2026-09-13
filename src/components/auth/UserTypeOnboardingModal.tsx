import React, { useState } from 'react';
import { UserType, USER_TYPES } from '../../types';
import { School, UserCheck, Building2, Users, BookOpen, ChevronRight, ShieldCheck, GraduationCap, Briefcase } from 'lucide-react';

interface UserTypeOnboardingModalProps {
  onSelectUserType: (userType: UserType) => void;
}

const USER_TYPE_ICONS: Record<UserType, React.ReactNode> = {
  special_school_teacher: <Building2 className="w-5 h-5 text-[#2D5A3F]" />,
  special_class_teacher: <School className="w-5 h-5 text-[#2D5A3F]" />,
  general_teacher: <Users className="w-5 h-5 text-[#2D5A3F]" />,
  researcher: <BookOpen className="w-5 h-5 text-[#2D5A3F]" />,
  administrator: <Briefcase className="w-5 h-5 text-[#2D5A3F]" />,
  pre_service_teacher: <GraduationCap className="w-5 h-5 text-[#2D5A3F]" />,
  other: <UserCheck className="w-5 h-5 text-[#2D5A3F]" />,
};

const USER_TYPE_DESCRIPTIONS: Record<UserType, string> = {
  special_school_teacher: '특수학교 수업 및 교수적 수정 전담',
  special_class_teacher: '일반학교 내 특수학급 개별화 교육',
  general_teacher: '통합학급 및 일반 교과 수업 운영',
  researcher: '특수교육/통합교육 및 UDL 관련 연구',
  administrator: '교육청 및 학교 교육과정 관리',
  pre_service_teacher: '사범대/교육대 예비 교원',
  other: '기타 교육 관계자 및 파트너',
};

export const UserTypeOnboardingModal: React.FC<UserTypeOnboardingModalProps> = ({ onSelectUserType }) => {
  const [selectedType, setSelectedType] = useState<UserType>('special_class_teacher');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSelectUserType(selectedType);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#F8F6F0] overflow-y-auto animate-fadeIn font-sans texture-paper">
      <div className="max-w-xl w-full bg-[#F8F6F0] border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 my-auto">

        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF2EC] border border-[#C5DDCB] text-[#2D5A3F] text-xs font-bold">
            <span>환경 설정</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#1A3323] tracking-tight">
            어떤 환경에서 UDL-Bridge를 사용하시나요?
          </h2>

          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
            서비스 개선을 위한 참고 정보이며 학생 개인정보는 수집하지 않습니다.
          </p>
        </div>

        {/* User Type Selection Grid (Large Tile Selection) */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
            {(Object.keys(USER_TYPES) as UserType[]).map((typeKey) => {
              const label = USER_TYPES[typeKey];
              const desc = USER_TYPE_DESCRIPTIONS[typeKey];
              const isSelected = selectedType === typeKey;

              return (
                <button
                  key={typeKey}
                  type="button"
                  onClick={() => setSelectedType(typeKey)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#EAF2EC] border-[#2D5A3F] shadow-xs'
                      : 'bg-white hover:bg-white/80 border-border text-charcoal-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-3 rounded-xl ${isSelected ? 'bg-white border border-[#C5DDCB]' : 'bg-[#F5F8F5] border border-border'}`}>
                      {USER_TYPE_ICONS[typeKey]}
                    </div>
                    <div>
                      <div className="font-bold text-sm sm:text-base text-[#1A3323]">{label}</div>
                      <div className="text-xs text-charcoal-500 font-normal">{desc}</div>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                    isSelected ? 'bg-[#2D5A3F] border-[#2D5A3F] text-white' : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected ? '✓' : ''}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Privacy Disclaimer Notice */}
          <div className="p-3.5 rounded-xl bg-white border border-border text-[11px] text-charcoal-500 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#2D5A3F] shrink-0 mt-0.5" />
            <p>
              입력하신 사용자 유형 정보는 통계적 서비스 개선 목적으로만 수집되며, 학생 이름, 학번, 학교명 등 식별 가능한 개별 정보는 어떠한 경우에도 수집하지 않습니다.
            </p>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-[#2D5A3F] hover:bg-[#234731] active:bg-[#1E3F2B] text-white font-semibold py-4 px-6 rounded-2xl shadow-sm transition-all duration-200 text-base"
          >
            <span>{isSubmitting ? '설정 저장 중...' : 'UDL-Bridge 시작하기'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
