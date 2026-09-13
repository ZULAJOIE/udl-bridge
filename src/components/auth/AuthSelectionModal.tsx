import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Sparkles, X, AlertCircle } from 'lucide-react';

interface AuthSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const AuthSelectionModal: React.FC<AuthSelectionModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { loginWithGoogle, loginAnonymously } = useAuth();
  const [loading, setLoading] = useState<'google' | 'anonymous' | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading('google');
    try {
      await loginWithGoogle();
      if (onShowToast) {
        onShowToast('success', 'Google 로그인 완료', '반갑습니다!');
      }
      onClose();
    } catch (error) {
      if (onShowToast) {
        onShowToast('error', '로그인 오류', 'Google 로그인 중 문제가 발생했습니다.');
      }
    } finally {
      setLoading(null);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading('anonymous');
    try {
      await loginAnonymously();
      if (onShowToast) {
        onShowToast('info', '체험 시작', '로그인 없이 체험을 시작합니다.');
      }
      onClose();
    } catch (error) {
      if (onShowToast) {
        onShowToast('error', '오류 발생', '체험 시작 중 문제가 발생했습니다.');
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-[#F8F6F0] border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-charcoal-400 hover:text-charcoal p-1.5 rounded-full hover:bg-black/5 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[#EAF2EC] text-[#2D5A3F] flex items-center justify-center mb-5 mx-auto shadow-xs">
          <LogIn className="w-6 h-6" />
        </div>

        {/* Titles */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1A3323] tracking-tight mb-2">
            UDL-Bridge 시작하기
          </h2>
          <p className="text-sm text-charcoal-600 leading-relaxed">
            로그인하면 만든 자료를 저장하고 다시 사용할 수 있어요.
          </p>
        </div>

        {/* Login Option Buttons */}
        <div className="space-y-4 mb-6">
          {/* Option 1: Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-gray-300 text-charcoal font-semibold py-3.5 px-5 rounded-2xl shadow-xs transition-all duration-200 disabled:opacity-50"
          >
            {loading === 'google' ? (
              <div className="w-5 h-5 border-2 border-[#2D5A3F] border-t-transparent rounded-full animate-spin" />
            ) : (
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
            )}
            <span>Google로 계속하기</span>
          </button>

          {/* Option 2: 로그인 없이 체험하기 (No Anonymous wording) */}
          <button
            onClick={handleAnonymousLogin}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-2 bg-[#2D5A3F] hover:bg-[#234731] text-white font-semibold py-3.5 px-5 rounded-2xl shadow-xs transition-all duration-200 disabled:opacity-50"
          >
            {loading === 'anonymous' ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span>로그인 없이 체험하기</span>
          </button>
        </div>

        {/* Helper Disclaimer Note */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-2.5 text-left">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            체험 중 만든 자료는 계정을 연결하지 않으면 다른 기기에서 다시 불러오기 어려울 수 있어요.
          </p>
        </div>
      </div>
    </div>
  );
};
