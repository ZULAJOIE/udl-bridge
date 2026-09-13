import React, { useState } from 'react';
import { UserType, USER_TYPES, UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { User, X, Check, Building2, Info } from 'lucide-react';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const { user, updateUserType } = useAuth();
  const [isEditingType, setIsEditingType] = useState(false);
  const [selectedType, setSelectedType] = useState<UserType>(user?.userType || 'special_class_teacher');
  const [saving, setSaving] = useState(false);

  if (!isOpen || !user) return null;

  const currentLabel = user.userType ? USER_TYPES[user.userType] : '미설정 (기본: 일반학교 특수학급 교사)';

  const handleSaveType = async () => {
    setSaving(true);
    try {
      await updateUserType(selectedType);
      setIsEditingType(false);
      onShowToast('success', '사용자 유형 변경 완료', `사용자 유형이 '${USER_TYPES[selectedType]}' (으)로 업데이트되었습니다.`);
    } catch (err) {
      onShowToast('error', '업데이트 실패', '사용자 유형 변경 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fadeIn">
      <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-6 space-y-6 shadow-xl relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-oat-50 hover:bg-oat-100 text-charcoal-500 hover:text-charcoal transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sage-100 border border-sage-300 flex items-center justify-center text-forest-700">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-charcoal">내 프로필 정보</h3>
            <p className="text-xs text-charcoal-500">{user.email || 'Google 계정 로그인 사용자'}</p>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="p-4 rounded-xl bg-oat-50 border border-border space-y-4">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-border">
            <span className="text-charcoal-500">계정 이름</span>
            <span className="font-bold text-charcoal">{user.displayName}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-charcoal-500">사용자 유형</span>
              {!isEditingType && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType(user.userType || 'special_class_teacher');
                    setIsEditingType(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-sage-100 hover:bg-sage-200 text-forest-700 text-xs font-bold border border-sage-300 transition-colors"
                >
                  변경
                </button>
              )}
            </div>

            {!isEditingType ? (
              <div className="p-3 rounded-lg bg-white border border-border text-sm font-bold text-forest-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sage-600" />
                <span>{currentLabel}</span>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {(Object.keys(USER_TYPES) as UserType[]).map((tKey) => (
                    <button
                      key={tKey}
                      type="button"
                      onClick={() => setSelectedType(tKey)}
                      className={`w-full p-2.5 rounded-lg border text-xs font-bold transition-all text-left flex items-center justify-between ${
                        selectedType === tKey
                          ? 'bg-forest-600 text-white border-forest-600 shadow-sm'
                          : 'bg-white text-charcoal-600 border-border hover:bg-oat-50'
                      }`}
                    >
                      <span>{USER_TYPES[tKey]}</span>
                      {selectedType === tKey && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveType}
                    disabled={saving}
                    className="btn-primary flex-1 py-2 text-xs"
                  >
                    {saving ? '저장 중...' : '확인 및 저장'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingType(false)}
                    className="btn-secondary py-2 px-3 text-xs"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-3 rounded-lg bg-oat-50 border border-border text-[11px] text-charcoal-500 flex items-start gap-2">
          <Info className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
          <p>
            사용자 유형은 UDL-Bridge의 서비스 개선 및 집계 통계를 위해 활용됩니다. 개인별 사용자를 분석하기 위한 목적으로 사용하지 않습니다.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="btn-secondary w-full py-3 text-xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
