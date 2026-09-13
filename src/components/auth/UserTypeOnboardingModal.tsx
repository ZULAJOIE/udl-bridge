import React, { useState } from 'react';
import { UserType, USER_TYPES } from '../../types';
import { School, UserCheck, Building2, Users, BookOpen, ChevronRight, Info } from 'lucide-react';

interface UserTypeOnboardingModalProps {
  onSelectUserType: (userType: UserType) => void;
}

const USER_TYPE_ICONS: Record<UserType, React.ReactNode> = {
  special_school_teacher: <Building2 className="w-5 h-5 text-forest-600" />,
  special_class_teacher: <School className="w-5 h-5 text-sage-600" />,
  inclusive_class_teacher: <Users className="w-5 h-5 text-forest-600" />,
  researcher_admin: <BookOpen className="w-5 h-5 text-brown-600" />,
  other: <UserCheck className="w-5 h-5 text-sage-600" />,
  prefer_not_to_say: <Info className="w-5 h-5 text-charcoal-400" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fadeIn">
      <div className="max-w-lg w-full bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">

        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-100 border border-sage-300 text-sage-800 text-xs font-bold">
            <span>최초 로그인 사용자 설정</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-charcoal">
            어떤 사용자에 가장 가까운가요?
          </h2>

          <p className="text-xs sm:text-sm text-charcoal-500 leading-relaxed">
            서비스 개선을 위한 집계 통계에 활용됩니다.<br />
            개인별 분석에는 사용하지 않습니다.
          </p>
        </div>

        {/* User Type Single Select Grid */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2.5">
            {(Object.keys(USER_TYPES) as UserType[]).map((typeKey) => {
              const label = USER_TYPES[typeKey];
              const isSelected = selectedType === typeKey;

              return (
                <button
                  key={typeKey}
                  type="button"
                  onClick={() => setSelectedType(typeKey)}
                  className={`w-full p-4 rounded-xl border transition-all text-left flex items-center justify-between ${
                    isSelected
                      ? 'bg-sage-100 border-forest-600 text-charcoal'
                      : 'bg-white hover:bg-oat-50 border-border text-charcoal-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-white border border-sage-300' : 'bg-oat-50 border border-border'}`}>
                      {USER_TYPE_ICONS[typeKey]}
                    </div>
                    <span className="font-bold text-sm sm:text-base">{label}</span>
                  </div>

                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                    isSelected ? 'bg-forest-600 border-forest-600 text-white' : 'border-border'
                  }`}>
                    {isSelected ? '✓' : ''}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Privacy Disclaimer Notice */}
          <div className="p-3.5 rounded-lg bg-oat-50 border border-border text-[11px] text-charcoal-500 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
            <p>
              사용자 유형은 UDL-Bridge의 서비스 개선 및 집계 통계를 위해 활용됩니다. 개인별 사용자를 분석하기 위한 목적으로 사용하지 않습니다.
            </p>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-4 px-6 text-base"
          >
            <span>{isSubmitting ? '설정 저장 중...' : 'udl·bridge 시작하기'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
