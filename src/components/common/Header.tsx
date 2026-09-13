import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { USER_TYPES } from '../../types';
import { ProfileSettingsModal } from '../auth/ProfileSettingsModal';
import { Sparkles, FolderHeart, BarChart3, LogOut, ShieldCheck, UserCheck, Database, LogIn, User } from 'lucide-react';

interface HeaderProps {
  activeTab: 'wizard' | 'mymaterials' | 'admin';
  setActiveTab: (tab: 'wizard' | 'mymaterials' | 'admin') => void;
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onShowToast }) => {
  const { user, isFirebaseActive, loginWithGoogle, logout, switchDemoRole } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const userTypeLabel = user?.userType ? USER_TYPES[user.userType] : '교사 회원';

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('wizard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-forest-600 flex items-center justify-center group-hover:bg-forest-700 transition-colors">
              <Sparkles className="w-5 h-5 text-sage-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-charcoal tracking-tight lowercase">
                  udl<span className="text-sage-600">·</span>bridge
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sage-100 border border-sage-300 text-sage-800">
                  v2.0 AI 학습자료
                </span>
              </div>
              <p className="text-xs text-charcoal-500 font-normal hidden sm:block">
                특수교육 맞춤형 학생용 학습자료 생성 서비스
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('wizard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'wizard'
                  ? 'bg-sage-100 text-forest-700 border border-sage-300'
                  : 'text-charcoal-500 hover:text-charcoal hover:bg-oat-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>학습자료 만들기</span>
            </button>

            <button
              onClick={() => setActiveTab('mymaterials')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'mymaterials'
                  ? 'bg-sage-100 text-forest-700 border border-sage-300'
                  : 'text-charcoal-500 hover:text-charcoal hover:bg-oat-50'
              }`}
            >
              <FolderHeart className="w-4 h-4" />
              <span>내 자료</span>
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-sage-100 text-forest-700 border border-sage-300'
                    : 'text-charcoal-500 hover:text-charcoal hover:bg-oat-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>관리자 대시보드</span>
              </button>
            )}
          </nav>

          {/* User Info & Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-oat-50 border border-border text-xs text-charcoal-600">
              <Database className={`w-3.5 h-3.5 ${isFirebaseActive ? 'text-forest-600' : 'text-brown-600'}`} />
              <span>{isFirebaseActive ? 'Firebase 연동' : '데모/로컬 모드'}</span>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                {user.authType === 'anonymous' && (
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="hidden sm:inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors"
                  >
                    <span>체험 중 (계정 연결)</span>
                  </button>
                )}

                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#F5F8F5] border border-border transition-colors text-right"
                  title="내 정보 / 프로필 설정"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#EAF2EC] border border-[#C5DDCB] flex items-center justify-center text-[#2D5A3F] font-bold text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="hidden md:flex flex-col">
                    <span className="text-xs font-semibold text-charcoal leading-tight">{user.displayName}</span>
                    <span className="text-[10px] text-[#2D5A3F] font-medium truncate max-w-[120px]">{userTypeLabel}</span>
                  </div>
                </button>

                {!isFirebaseActive && (
                  <button
                    onClick={() => switchDemoRole(user.role === 'admin' ? 'teacher' : 'admin')}
                    title={`역할 전환 (현재: ${user.role})`}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#F5F8F5] border border-border text-[11px] text-charcoal-600 flex items-center gap-1 transition-colors"
                  >
                    {user.role === 'admin' ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-[#2D5A3F]" />
                    )}
                    <span className="hidden sm:inline">{user.role === 'admin' ? '관리자' : '일반 교사'}</span>
                  </button>
                )}

                <button
                  onClick={logout}
                  title="로그아웃"
                  className="p-2 rounded-xl text-charcoal-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="inline-flex items-center gap-2 bg-[#2D5A3F] hover:bg-[#234731] text-white px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Google 로그인</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onShowToast={onShowToast || (() => {})}
      />
    </>
  );
};
