import React, { useState } from 'react';
import { User, X, Check, ArrowRight } from 'lucide-react';
import { LegalModal, LegalTab } from '../common/LegalModal';

interface GoogleAccountPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: { displayName: string; email: string }) => void;
}

export const GoogleAccountPickerModal: React.FC<GoogleAccountPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
}) => {
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customEmail, setCustomEmail] = useState<string>('');
  const [legalModalTab, setLegalModalTab] = useState<LegalTab | null>(null);

  if (!isOpen) return null;

  // Saved / Default account options
  const defaultAccounts = [
    {
      displayName: 'Seed권주희',
      email: 'kweon135@seed.or.kr',
      initial: 'S',
      bgColor: 'bg-[#437a54]',
    },
    {
      displayName: '김특수 교사',
      email: 'teacher@school.ed.kr',
      initial: '김',
      bgColor: 'bg-[#2b537e]',
    }
  ];

  const handleSelectDefault = (account: { displayName: string; email: string }) => {
    onSelectAccount(account);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) return;

    let emailVal = customEmail.trim();
    if (!emailVal.includes('@')) {
      emailVal += '@gmail.com';
    }

    onSelectAccount({
      displayName: customName.trim(),
      email: emailVal,
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn font-sans">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden relative">
          
          {/* Top Bar Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              {/* Official Google G Logo */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
              <span className="text-sm font-medium text-gray-700">Google 계정으로 로그인</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Body */}
          <div className="p-8">
            
            {/* App Icon / Logo */}
            <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white mb-6">
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>

            {/* Header Titles */}
            <h2 className="text-2xl font-normal text-gray-900 tracking-tight mb-1">
              계정을 선택하세요.
            </h2>
            <p className="text-sm font-medium text-[#1a73e8] mb-6">
              UDL-Bridge(으)로 이동
            </p>

            {/* Account List */}
            {!isCustomMode ? (
              <div className="space-y-1 mb-8">
                {defaultAccounts.map((acc, index) => (
                  <div key={index}>
                    <button
                      onClick={() => handleSelectDefault(acc)}
                      className="w-full py-3.5 px-3 flex items-center gap-3.5 rounded-xl hover:bg-gray-100/80 transition-colors text-left group cursor-pointer"
                    >
                      <div className={`w-10 h-10 rounded-full ${acc.bgColor} text-white flex items-center justify-center font-semibold text-base shrink-0 shadow-xs`}>
                        {acc.initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate group-hover:text-black">
                          {acc.displayName}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {acc.email}
                        </div>
                      </div>
                    </button>
                    <div className="h-px bg-gray-200 my-1 mx-3" />
                  </div>
                ))}

                {/* 다른 계정 사용 (Use another account) */}
                <button
                  onClick={() => setIsCustomMode(true)}
                  className="w-full py-3.5 px-3 flex items-center gap-3.5 rounded-xl hover:bg-gray-100/80 transition-colors text-left group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full border border-gray-300 bg-gray-50 text-gray-600 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-gray-900 group-hover:text-black">
                    다른 계정 사용
                  </span>
                </button>
              </div>
            ) : (
              /* Custom Account Input Form */
              <form onSubmit={handleCustomSubmit} className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    이름 (성명)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 권주희"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Google 이메일 주소
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="예: kweon135@seed.or.kr"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    이전 목록
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Google 로그인</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Disclaimer text */}
            <p className="text-xs text-gray-500 leading-relaxed">
              앱을 사용하기 전에 UDL-Bridge의{' '}
              <button
                type="button"
                onClick={() => setLegalModalTab('privacy')}
                className="text-[#1a73e8] underline font-medium"
              >
                개인정보처리방침
              </button>{' '}
              및{' '}
              <button
                type="button"
                onClick={() => setLegalModalTab('terms')}
                className="text-[#1a73e8] underline font-medium"
              >
                서비스 약관
              </button>
              을 검토하세요.
            </p>
          </div>

          {/* Footer Bar */}
          <div className="px-8 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>한국어 ▼</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setLegalModalTab('terms')} className="hover:underline">
                약관
              </button>
              <button onClick={() => setLegalModalTab('privacy')} className="hover:underline">
                개인정보처리방침
              </button>
            </div>
          </div>

        </div>
      </div>

      <LegalModal
        isOpen={Boolean(legalModalTab)}
        initialTab={legalModalTab || 'terms'}
        onClose={() => setLegalModalTab(null)}
      />
    </>
  );
};
