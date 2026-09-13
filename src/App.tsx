import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WizardProvider } from './context/WizardContext';
import { Header } from './components/common/Header';
import { WizardLayout } from './components/wizard/WizardLayout';
import { MaterialResultView } from './components/result/MaterialResultView';
import { MyMaterialsView } from './components/mymaterials/MyMaterialsView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LandingScreen } from './components/auth/LandingScreen';
import { AuthSelectionModal } from './components/auth/AuthSelectionModal';
import { UserTypeOnboardingModal } from './components/auth/UserTypeOnboardingModal';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { Footer } from './components/common/Footer';
import { LegalModal, LegalTab } from './components/common/LegalModal';

import { PendingApprovalScreen } from './components/auth/PendingApprovalScreen';

const MainContent: React.FC = () => {
  const { user, needsUserTypeOnboarding, isAuthInitializing, updateUserType } = useAuth();
  const [activeTab, setActiveTab] = useState<'wizard' | 'mymaterials' | 'admin'>('wizard');
  const [viewMode, setViewMode] = useState<'wizard' | 'result'>('wizard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('terms');

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

  const handleOpenLegal = (tab: LegalTab) => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  // 1. Loading State during Auth Initialization
  if (isAuthInitializing) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] text-charcoal flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#2D5A3F] flex items-center justify-center text-white font-bold text-lg shadow-sm animate-pulse">
            UDL
          </div>
          <p className="text-sm font-semibold text-[#1A3323]">UDL-Bridge를 로딩하는 중입니다...</p>
        </div>
      </div>
    );
  }

  // 2. Landing Screen when User is not logged in (Requirement 1, 2, 9, 12)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] text-charcoal flex flex-col justify-between font-sans">
        <LandingScreen
          onStart={() => setIsAuthModalOpen(true)}
          onOpenLegal={handleOpenLegal}
        />
        <AuthSelectionModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onShowToast={showToast}
        />
        <LegalModal
          isOpen={isLegalModalOpen}
          initialTab={legalModalTab}
          onClose={() => setIsLegalModalOpen(false)}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  // 2.5 Pending Admin Approval Screen for teachers awaiting approval
  if (user.role !== 'admin' && user.status === 'pending') {
    return <PendingApprovalScreen />;
  }

  // 3. Main Web Application with Step 1~4, My Materials, Admin Dashboard
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

      {/* 4. First-time or missing userType onboarding modal (Requirement 4, 5, 6, 7) */}
      {(needsUserTypeOnboarding || !user.userType) && (
        <UserTypeOnboardingModal
          onSelectUserType={async (selectedType) => {
            await updateUserType(selectedType);
            showToast('success', '설정 완료', 'UDL-Bridge에 오신 것을 환영합니다! STEP 1 수업자료 업로드를 시작하세요.');
          }}
        />
      )}

      {/* Shared Footer & Legal Modal */}
      <Footer onOpenLegal={handleOpenLegal} />

      <LegalModal
        isOpen={isLegalModalOpen}
        initialTab={legalModalTab}
        onClose={() => setIsLegalModalOpen(false)}
      />

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
