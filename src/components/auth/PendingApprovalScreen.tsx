import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { USER_TYPES } from '../../types';
import { Clock, ShieldAlert, RefreshCw, LogOut, CheckCircle2, UserCheck, ArrowRight } from 'lucide-react';
import { updateUserStatus } from '../../services/dataService';

export const PendingApprovalScreen: React.FC = () => {
  const { user, logout, reloadUserProfile, loginDemoUser } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await reloadUserProfile();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleSimulateSelfApprove = async () => {
    if (user?.uid) {
      await updateUserStatus(user.uid, 'approved');
      await reloadUserProfile();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-charcoal flex flex-col justify-between items-center p-4 sm:p-8 font-sans texture-paper">
      
      {/* Header Logo */}
      <header className="w-full max-w-4xl flex items-center justify-between py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#2D5A3F] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            UDL
          </div>
          <span className="font-bold text-lg text-[#1A3323] tracking-tight">UDL·Bridge</span>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 text-xs text-charcoal-500 hover:text-charcoal font-semibold bg-white border border-border px-3 py-1.5 rounded-xl transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>로그아웃</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-lg mx-auto bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6 my-auto">
        
        {/* Status Icon */}
        <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A3323] tracking-tight">
            교사 계정 승인 대기 중
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
            관리자 교사 승인 후 특수교육 UDL 학습지 생성 기능을 바로 이용하실 수 있습니다.
          </p>
        </div>

        {/* User Info Card */}
        {user && (
          <div className="bg-[#F8F6F0] border border-border rounded-2xl p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-border/60">
              <span className="text-charcoal-500 font-medium">신청 교사:</span>
              <span className="font-bold text-charcoal-800">{user.displayName || '교사'}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/60">
              <span className="text-charcoal-500 font-medium">이메일:</span>
              <span className="font-mono text-charcoal-700">{user.email || '미등록이메일'}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/60">
              <span className="text-charcoal-500 font-medium">교사 유형:</span>
              <span className="font-bold text-[#2D5A3F]">
                {user.userType ? USER_TYPES[user.userType] : '교사'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-charcoal-500 font-medium">현재 상태:</span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[11px] border border-amber-300">
                <Clock className="w-3 h-3" /> 관리자 승인 대기
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#2D5A3F] hover:bg-[#234731] active:bg-[#1E3F2B] text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-all text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? '승인 상태 확인 중...' : '승인 상태 새로고침'}</span>
          </button>
        </div>

        {/* Test Helper Card */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-left space-y-2 text-xs text-emerald-900">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>[시연 및 테스트용] 관리자 승인 시뮬레이션</span>
          </div>
          <p className="text-[11px] text-emerald-700 leading-relaxed">
            관리자 계정으로 전환하여 승인하거나, 이 계정을 즉시 승인 상태로 변경하여 앱 기능을 테스트할 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={() => loginDemoUser('admin')}
              className="flex-1 bg-white hover:bg-emerald-100 text-emerald-800 font-bold py-2 px-3 rounded-lg border border-emerald-300 transition-colors flex items-center justify-center gap-1"
            >
              <span>👑 관리자 모드로 전환</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSimulateSelfApprove}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>즉시 승인 처리하기</span>
            </button>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-charcoal-400">
        udl·bridge © 2026 특수교육 교사 및 학생 지원 서비스
      </footer>

    </div>
  );
};
