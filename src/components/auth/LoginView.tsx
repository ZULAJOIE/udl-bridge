import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { BridgeMotif } from '../common/BridgeMotif';
import { LegalModal, LegalTab } from '../common/LegalModal';
import { GoogleAccountPickerModal } from './GoogleAccountPickerModal';

interface LoginViewProps {
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onShowToast }) => {
  const { loginWithGoogle, loginWithGoogleAccount, isFirebaseActive } = useAuth();
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState<boolean>(false);
  const [showConsentError, setShowConsentError] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab | null>(null);
  const [showGooglePicker, setShowGooglePicker] = useState<boolean>(false);

  const allAgreed = agreedToTerms && agreedToPrivacy;

  const handleMasterToggle = () => {
    const nextState = !allAgreed;
    setAgreedToTerms(nextState);
    setAgreedToPrivacy(nextState);
    if (nextState) setShowConsentError(false);
  };

  const handleGoogleLoginClick = () => {
    if (!agreedToTerms || !agreedToPrivacy) {
      setShowConsentError(true);
      if (onShowToast) {
        onShowToast(
          'info',
          '약관 및 개인정보 동의 필수',
          '서비스 이용을 위해 이용약관 및 개인정보처리방침에 모두 동의해 주세요.'
        );
      }
      return;
    }

    if (isFirebaseActive) {
      handleGoogleLogin();
    } else {
      setShowGooglePicker(true);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      if (onShowToast) {
        onShowToast('success', 'Google 로그인 성공', '환영합니다!');
      }
    } catch (err) {
      if (onShowToast) {
        onShowToast('error', '로그인 오류', '로그인 처리 중 문제가 발생했습니다.');
      }
    }
  };

  const handleSelectAccount = async (acc: { displayName: string; email: string }) => {
    setShowGooglePicker(false);
    try {
      await loginWithGoogleAccount(acc);
      if (onShowToast) {
        onShowToast('success', 'Google 로그인 완료', `${acc.displayName}님 환영합니다!`);
      }
    } catch (err) {
      if (onShowToast) {
        onShowToast('error', '로그인 오류', 'Google 로그인 중 문제가 발생했습니다.');
      }
    }
  };

  return (
    <>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 texture-paper font-sans">
        <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 sm:p-10 shadow-sm space-y-7 text-center">

          {/* App Logo & Badge */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-100 border border-sage-300 text-sage-800 text-xs font-bold">
              <span>UDL &amp; 교수적 수정 AI 플랫폼</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight lowercase">
              udl<span className="text-sage-600">·</span>bridge
            </h1>

            <p className="text-sm sm:text-base text-charcoal-500 font-medium leading-relaxed">
              모든 학생이 배움에 접근할 수 있도록<br />
              AI와 함께 교수적 수정 자료를 만들어보세요.
            </p>

            <BridgeMotif className="w-40 h-4 mx-auto text-sage-400" />
          </div>

          {/* 필수 개인정보 및 이용약관 동의 영역 */}
          <div
            className={`p-4 rounded-2xl border transition-all text-left space-y-3 ${
              showConsentError && (!agreedToTerms || !agreedToPrivacy)
                ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-200'
                : 'bg-white border-border shadow-2xs'
            }`}
          >
            {/* Master Toggle */}
            <div
              onClick={handleMasterToggle}
              className="flex items-center gap-2.5 pb-2.5 border-b border-gray-200 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={allAgreed}
                onChange={handleMasterToggle}
                className="w-4 h-4 text-[#2D5A3F] border-gray-300 rounded focus:ring-[#2D5A3F] cursor-pointer"
              />
              <span className="text-xs font-extrabold text-[#1A3323]">
                이용약관 및 개인정보 처리방침 전체 동의
              </span>
            </div>

            {/* Item 1: 이용약관 동의 */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="login-view-agree-terms"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (e.target.checked && agreedToPrivacy) setShowConsentError(false);
                  }}
                  className="w-4 h-4 text-[#2D5A3F] border-gray-300 rounded focus:ring-[#2D5A3F] cursor-pointer shrink-0"
                />
                <label htmlFor="login-view-agree-terms" className="text-charcoal-700 cursor-pointer select-none font-semibold">
                  <span className="text-[#2D5A3F] font-bold">[필수]</span> 이용약관 동의
                </label>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setLegalModalTab('terms');
                }}
                className="text-[11px] text-charcoal-500 hover:text-[#2D5A3F] underline font-medium"
              >
                [전문 보기]
              </button>
            </div>

            {/* Item 2: 개인정보 처리방침 동의 */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="login-view-agree-privacy"
                  checked={agreedToPrivacy}
                  onChange={(e) => {
                    setAgreedToPrivacy(e.target.checked);
                    if (e.target.checked && agreedToTerms) setShowConsentError(false);
                  }}
                  className="w-4 h-4 text-[#2D5A3F] border-gray-300 rounded focus:ring-[#2D5A3F] cursor-pointer shrink-0"
                />
                <label htmlFor="login-view-agree-privacy" className="text-charcoal-700 cursor-pointer select-none font-semibold">
                  <span className="text-[#2D5A3F] font-bold">[필수]</span> 개인정보 처리방침 동의
                </label>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setLegalModalTab('privacy');
                }}
                className="text-[11px] text-charcoal-500 hover:text-[#2D5A3F] underline font-medium"
              >
                [전문 보기]
              </button>
            </div>

            {/* Validation Error Message */}
            {showConsentError && (!agreedToTerms || !agreedToPrivacy) && (
              <p className="text-[11px] font-bold text-rose-600 pt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>계속 진행하려면 필수 동의 항목에 모두 체크해 주세요.</span>
              </p>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="space-y-4 pt-1">
            <button
              onClick={handleGoogleLoginClick}
              className="w-full py-4 px-6 rounded-xl bg-white hover:bg-oat-50 text-charcoal font-bold text-base shadow-sm flex items-center justify-center gap-3 transition-all border border-border cursor-pointer"
            >
              {/* Google Icon SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google로 계속하기</span>
              <ArrowRight className="w-4 h-4 text-charcoal-400" />
            </button>
          </div>

          {/* Informational Footer */}
          <div className="pt-4 border-t border-border text-[11px] text-charcoal-400 space-y-1">
            <p className="flex items-center justify-center gap-1 text-charcoal-500">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-600" />
              보안 로그인 &amp; 특수교육 지원
            </p>
            <p>
              생성한 학습자료 보관 및 내 자료 관리를 위해 구글 로그인이 활용됩니다.
            </p>
          </div>

        </div>
      </div>

      {/* Google 계정 선택 모달 */}
      <GoogleAccountPickerModal
        isOpen={showGooglePicker}
        onClose={() => setShowGooglePicker(false)}
        onSelectAccount={handleSelectAccount}
      />

      {/* 이용약관 및 개인정보처리방침 팝업 모달 */}
      <LegalModal
        isOpen={Boolean(legalModalTab)}
        initialTab={legalModalTab || 'terms'}
        onClose={() => setLegalModalTab(null)}
      />
    </>
  );
};
