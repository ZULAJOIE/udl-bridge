import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WizardProvider } from './context/WizardContext';
import { Header } from './components/common/Header';
import { WizardLayout } from './components/wizard/WizardLayout';
import { MaterialResultView } from './components/result/MaterialResultView';
import { MyMaterialsView } from './components/mymaterials/MyMaterialsView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LoginView } from './components/auth/LoginView';
import { UserTypeOnboardingModal } from './components/auth/UserTypeOnboardingModal';
import { ToastContainer, ToastMessage } from './components/common/Toast';

const MainContent: React.FC = () => {
  const { user, needsUserTypeOnboarding, updateUserType } = useAuth();
  const [activeTab, setActiveTab] = useState<'wizard' | 'mymaterials' | 'admin'>('wizard');
  const [viewMode, setViewMode] = useState<'wizard' | 'result'>('wizard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleTabChange = (tab: 'wizard' | 'mymaterials' | 'admin') => {
    setActiveTab(tab);
    if (tab === 'wizard') {
      setViewMode('wizard');
    }
  };

  // If user is not logged in, render clean Google Login Screen (Requirement 1 & 9)
  if (!user) {
    return (
      <div className="min-h-screen bg-background text-charcoal flex flex-col justify-between font-sans">
        <LoginView onShowToast={showToast} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-charcoal font-sans">
      <Header activeTab={activeTab} setActiveTab={handleTabChange} onShowToast={showToast} />

      <main className="flex-1 pb-16">
        {activeTab === 'wizard' && (
          viewMode === 'wizard' ? (
            <WizardLayout
              onMaterialGenerated={() => setViewMode('result')}
              onShowToast={showToast}
            />
          ) : (
            <MaterialResultView
              onShowToast={showToast}
              onBackToWizard={() => setViewMode('wizard')}
              onNavigateToMyMaterials={() => setActiveTab('mymaterials')}
            />
          )
        )}

        {activeTab === 'mymaterials' && (
          <MyMaterialsView
            onShowToast={showToast}
            onNavigateToWizard={() => {
              setActiveTab('wizard');
              setViewMode('wizard');
            }}
            onOpenMaterialResult={() => {
              setActiveTab('wizard');
              setViewMode('result');
            }}
          />
        )}

        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* First-time login onboarding user type selection modal (Requirement 2, 3, 5, 8) */}
      {needsUserTypeOnboarding && (
        <UserTypeOnboardingModal
          onSelectUserType={async (selectedType) => {
            await updateUserType(selectedType);
            showToast('success', '사용자 설정 완료', 'UDL-Bridge에 오신 것을 환영합니다!');
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-background py-6 text-center text-xs text-charcoal-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>udl·bridge © 2026 특수교육 학생용 교수적 수정 학습자료 생성 서비스</span>
          <span className="text-charcoal-300">장애유형보다 교육적 요구 중심 • AI 추천 교사 최종 결정을 준수합니다.</span>
        </div>
      </footer>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <WizardProvider>
        <MainContent />
      </WizardProvider>
    </AuthProvider>
  );
}

export default App;
