import React, { useState } from 'react';
import { UserType, USER_TYPES } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { User, X, Check, Building2, Info, Link, Sparkles } from 'lucide-react';

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
  const { user, updateUserType, linkGoogleAccount } = useAuth();
  const [isEditingType, setIsEditingType] = useState(false);
  const [selectedType, setSelectedType] = useState<UserType>(user?.userType || 'special_class_teacher');
  const [saving, setSaving] = useState(false);
  const [linking, setLinking] = useState(false);

  if (!isOpen || !user) return null;

  const currentLabel = user.userType ? USER_TYPES[user.userType] : '미설정';
  const isAnonymous = user.authType === 'anonymous';

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

  const handleLinkAccount = async () => {
    setLinking(true);
    try {
      const success = await linkGoogleAccount();
      if (success) {
        onShowToast('success', '계정 연결 성공', 'Google 계정과 연동되었습니다. 이제 작성한 자료가 영구 저장됩니다!');
      } else {
        onShowToast('error', '연결 실패', 'Google 계정 연결 중 문제가 발생했습니다.');
      }
    } catch (err) {
      onShowToast('error', '연결 오류', 'Google 계정 연결 중 오류가 발생했습니다.');
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="max-w-md w-full bg-[#FBF9F5] border border-border rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-white hover:bg-gray-100 text-charcoal-500 hover:text-charcoal transition-colors border border-border"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EAF2EC] border border-[#C5DDCB] flex items-center justify-center text-[#2D5A3F]">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1A3323]">내 프로필 정보</h3>
            <p className="text-xs text-charcoal-600">
              {isAnonymous ? '로그인 없이 체험 중인 사용자' : (user.email || 'Google 계정 로그인')}
            </p>
          </div>
        </div>

        {/* Anonymous Account Linking Notice (Requirement #8) */}
        {isAnonymous && (
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 space-y-3">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 mb-0.5">Google 계정 연결 권장</h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  이 자료를 계속 보관하려면 Google 계정을 연결하세요. 저장된 작성 내용이 유지됩니다.
                </p>
              </div>
            </div>
            <button
              onClick={handleLinkAccount}
              disabled={linking}
              className="w-full flex items-center justify-center gap-2 bg-[#2D5A3F] hover:bg-[#234731] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-xs disabled:opacity-50"
            >
              <Link className="w-3.5 h-3.5" />
              <span>{linking ? '연결 중...' : 'Google 계정 연결'}</span>
            </button>
          </div>
        )}

        {/* User Profile Card */}
        <div className="p-4 rounded-2xl bg-white border border-border space-y-4">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-border">
            <span className="text-charcoal-500">인증 방식</span>
            <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
              isAnonymous ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
            }`}>
              {isAnonymous ? '로그인 없이 체험' : 'Google 로그인'}
            </span>
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
                  className="px-2.5 py-1 rounded-lg bg-[#EAF2EC] hover:bg-[#d8e8dc] text-[#2D5A3F] text-xs font-bold transition-colors"
                >
                  변경
                </button>
              )}
            </div>

            {!isEditingType ? (
              <div className="p-3 rounded-xl bg-[#F5F8F5] border border-border text-sm font-bold text-[#2D5A3F] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#2D5A3F]" />
                <span>{currentLabel}</span>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {(Object.keys(USER_TYPES) as UserType[]).map((tKey) => (
                    <button
                      key={tKey}
                      type="button"
                      onClick={() => setSelectedType(tKey)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                        selectedType === tKey
                          ? 'bg-[#2D5A3F] text-white border-[#2D5A3F] shadow-xs'
                          : 'bg-white text-charcoal-700 border-border hover:bg-[#F5F8F5]'
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
                    className="w-full bg-[#2D5A3F] hover:bg-[#234731] text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors"
                  >
                    {saving ? '저장 중...' : '확인 및 저장'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingType(false)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-charcoal font-bold py-2 px-3 rounded-xl text-xs transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-3 rounded-xl bg-white border border-border text-[11px] text-charcoal-500 flex items-start gap-2">
          <Info className="w-4 h-4 text-[#2D5A3F] shrink-0 mt-0.5" />
          <p>
            사용자 유형 정보는 UDL-Bridge의 서비스 개선 및 집계 통계를 위해서만 활용되며 개인 식별에는 사용되지 않습니다.
          </p>
        </div>

        <div className="pt-1">
          <button
            onClick={onClose}
            className="w-full bg-white hover:bg-gray-50 border border-border text-charcoal font-semibold py-2.5 text-xs rounded-xl transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
