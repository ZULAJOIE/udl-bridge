import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { USER_TYPES } from '../../types';
import { ProfileSettingsModal } from '../auth/ProfileSettingsModal';
import { UdlGuideModal } from './UdlGuideModal';
import {
  Sparkles, FolderHeart, BarChart3, LogOut, ShieldCheck, UserCheck,
  Database, LogIn, User, BookOpen, Menu, X
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'wizard' | 'mymaterials' | 'admin';
  setActiveTab: (tab: 'wizard' | 'mymaterials' | 'admin') => void;
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onShowToast }) => {
  const { user, isFirebaseActive, loginWithGoogle, logout, switchDemoRole } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUdlGuideModal, setShowUdlGuideModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userTypeLabel = user?.userType ? USER_TYPES[user.userType] : '교사 회원';

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-[4rem] py-2 flex items-center justify-between gap-2">
          
          {/* Left: Brand Logo */}
          <div
            onClick={() => setActiveTab('wizard')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-forest-600 flex items-center justify-center group-hover:bg-forest-700 transition-colors shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-sage-100" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-base sm:text-lg font-bold text-charcoal tracking-tight lowercase">
                  udl<span className="text-sage-600">·</span>bridge
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sage-100 border border-sage-300 text-sage-800 shrink-0 hidden xs:inline-block">
                  v2.0 AI
                </span>
              </div>
              <p className="text-[11px] text-charcoal-500 font-normal hidden lg:block whitespace-nowrap">
                특수교육 맞춤형 학생용 학습자료 생성 서비스
              </p>
            </div>
          </div>

          {/* Desktop Center: Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <button
              onClick={() => setActiveTab('wizard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'wizard'
                  ? 'bg-sage-100 text-forest-700 border border-sage-300 shadow-2xs'
                  : 'text-charcoal-500 hover:text-charcoal hover:bg-oat-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-forest-600" />
              <span>학습자료 만들기</span>
            </button>

            <button
              onClick={() => setActiveTab('mymaterials')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'mymaterials'
                  ? 'bg-sage-100 text-forest-700 border border-sage-300 shadow-2xs'
                  : 'text-charcoal-500 hover:text-charcoal hover:bg-oat-50'
              }`}
            >
              <FolderHeart className="w-4 h-4 text-brown-600" />
              <span>내 자료</span>
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'admin'
                    ? 'bg-sage-100 text-forest-700 border border-sage-300 shadow-2xs'
                    : 'text-charcoal-500 hover:text-charcoal hover:bg-oat-50'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-amber-600" />
                <span>관리자 대시보드</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowUdlGuideModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#2D5A3F] bg-[#EAF2EC] hover:bg-[#d8e8dc] border border-[#C5DDCB] transition-all shadow-2xs whitespace-nowrap"
              title="보편적 학습 설계(UDL) 3.0 가이드라인 지침 도표 확인"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#2D5A3F]" />
              <span>UDL 지침 3.0</span>
            </button>
          </nav>

          {/* Right: User Info & Actions */}
          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-oat-50 border border-border text-xs text-charcoal-600 whitespace-nowrap">
              <Database className={`w-3.5 h-3.5 ${isFirebaseActive ? 'text-forest-600' : 'text-brown-600'}`} />
              <span>{isFirebaseActive ? 'Firebase 연동' : '데모/로컬 모드'}</span>
            </div>

            {user ? (
              <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                {user.authType === 'anonymous' && (
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="hidden sm:inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-semibold px-2 py-1 rounded-full transition-colors whitespace-nowrap"
                  >
                    <span>체험 중 (계정 연결)</span>
                  </button>
                )}

                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#F5F8F5] border border-border transition-colors text-right shrink-0 whitespace-nowrap"
                  title="내 정보 / 프로필 설정"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#EAF2EC] border border-[#C5DDCB] flex items-center justify-center text-[#2D5A3F] font-bold text-xs shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold text-charcoal leading-tight whitespace-nowrap">{user.displayName}</span>
                    <span className="text-[10px] text-[#2D5A3F] font-medium truncate max-w-[110px] whitespace-nowrap">{userTypeLabel}</span>
                  </div>
                </button>

                {!isFirebaseActive && (
                  <button
                    onClick={() => switchDemoRole(user.role === 'admin' ? 'teacher' : 'admin')}
                    title={`역할 전환 (현재: ${user.role})`}
                    className="hidden sm:flex px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#F5F8F5] border border-border text-[11px] text-charcoal-600 items-center gap-1 transition-colors whitespace-nowrap"
                  >
                    {user.role === 'admin' ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-[#2D5A3F]" />
                    )}
                    <span>{user.role === 'admin' ? '관리자' : '일반 교사'}</span>
                  </button>
                )}

                <button
                  onClick={logout}
                  title="로그아웃"
                  className="p-2 rounded-xl text-charcoal-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>

                {/* Mobile Menu Hamburger Button (< md) */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-xl text-charcoal-600 hover:bg-oat-100 border border-border transition-all shrink-0"
                  aria-label="메뉴 열기"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="inline-flex items-center gap-1.5 bg-[#2D5A3F] hover:bg-[#234731] text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs whitespace-nowrap shrink-0"
              >
                <LogIn className="w-4 h-4" />
                <span>Google 로그인</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Navigation Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden p-3 bg-surface border-t border-border space-y-2 animate-in slide-in-from-top duration-200 shadow-md">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  setActiveTab('wizard');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg text-xs font-bold whitespace-nowrap border ${
                  activeTab === 'wizard'
                    ? 'bg-sage-100 text-forest-700 border-sage-300'
                    : 'bg-white text-charcoal-600 border-border'
                }`}
              >
                <Sparkles className="w-4 h-4 text-forest-600" />
                <span>학습자료 만들기</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('mymaterials');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg text-xs font-bold whitespace-nowrap border ${
                  activeTab === 'mymaterials'
                    ? 'bg-sage-100 text-forest-700 border-sage-300'
                    : 'bg-white text-charcoal-600 border-border'
                }`}
              >
                <FolderHeart className="w-4 h-4 text-brown-600" />
                <span>내 자료</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowUdlGuideModal(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-bold text-[#2D5A3F] bg-[#EAF2EC] border border-[#C5DDCB] flex-1 whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#2D5A3F]" />
                <span>UDL 지침 3.0 가이드</span>
              </button>

              {user?.role === 'admin' && (
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-bold border flex-1 whitespace-nowrap ${
                    activeTab === 'admin'
                      ? 'bg-sage-100 text-forest-700 border-sage-300'
                      : 'bg-white text-charcoal-600 border-border'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-amber-600" />
                  <span>관리자 대시보드</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onShowToast={onShowToast || (() => {})}
      />

      {/* UDL Guidelines Help Modal */}
      <UdlGuideModal
        isOpen={showUdlGuideModal}
        onClose={() => setShowUdlGuideModal(false)}
      />
    </>
  );
};
