import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserType } from '../types';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import { signInWithPopup, signInAnonymously, linkWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getUserProfile, saveUserProfile } from '../services/dataService';

interface AuthContextType {
  user: UserProfile | null;
  needsUserTypeOnboarding: boolean;
  isAuthInitializing: boolean;
  isFirebaseActive: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAnonymously: () => Promise<void>;
  linkGoogleAccount: () => Promise<boolean>;
  loginDemoUser: (role?: 'teacher' | 'admin', status?: 'approved' | 'pending') => void;
  logout: () => Promise<void>;
  updateUserType: (userType: UserType) => Promise<void>;
  switchDemoRole: (role: 'teacher' | 'admin') => void;
  reloadUserProfile: () => Promise<void>;
}

const DEFAULT_DEMO_USER: UserProfile = {
  uid: 'demo-teacher-01',
  email: 'teacher@school.ed.kr',
  displayName: '김특수 교사',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  userType: 'special_class_teacher',
  authType: 'google',
  role: 'teacher',
  status: 'approved',
  createdAt: '2026-03-01',
  lastLoginAt: new Date().toISOString()
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [needsUserTypeOnboarding, setNeedsUserTypeOnboarding] = useState<boolean>(false);
  const [isAuthInitializing, setIsAuthInitializing] = useState<boolean>(true);

  const reloadUserProfile = async () => {
    if (user?.uid) {
      const refreshed = await getUserProfile(user.uid);
      if (refreshed) {
        setUser(refreshed);
      }
    }
  };

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setIsAuthInitializing(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const storedProfile = await getUserProfile(fbUser.uid);
        const isAnon = fbUser.isAnonymous;
        
        if (storedProfile && storedProfile.userType) {
          setUser({
            ...storedProfile,
            authType: isAnon ? 'anonymous' : 'google',
            email: fbUser.email || storedProfile.email || '',
            displayName: fbUser.displayName || storedProfile.displayName || (isAnon ? '체험 사용자' : '교사 사용자'),
            photoURL: fbUser.photoURL || storedProfile.photoURL,
            status: storedProfile.status || 'pending',
            lastLoginAt: new Date().toISOString()
          });
          setNeedsUserTypeOnboarding(false);
        } else {
          // User exists in Auth but userType profile is missing
          const partialUser: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || (isAnon ? '체험 사용자' : '교사 사용자'),
            photoURL: fbUser.photoURL || undefined,
            authType: isAnon ? 'anonymous' : 'google',
            role: fbUser.email?.includes('admin') ? 'admin' : 'teacher',
            status: fbUser.email?.includes('admin') ? 'approved' : 'pending',
            createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          };
          setUser(partialUser);
          setNeedsUserTypeOnboarding(true);
        }
      } else {
        setUser(null);
        setNeedsUserTypeOnboarding(false);
      }
      setIsAuthInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        const res = await signInWithPopup(auth, googleProvider);
        const fbUser = res.user;
        const storedProfile = await getUserProfile(fbUser.uid);

        if (storedProfile && storedProfile.userType) {
          setUser({
            ...storedProfile,
            authType: 'google',
            email: fbUser.email || storedProfile.email,
            displayName: fbUser.displayName || storedProfile.displayName,
            photoURL: fbUser.photoURL || storedProfile.photoURL,
          });
          setNeedsUserTypeOnboarding(false);
        } else {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || '구글 사용자',
            photoURL: fbUser.photoURL || undefined,
            authType: 'google',
            role: 'teacher',
            status: 'pending',
            createdAt: new Date().toISOString()
          });
          setNeedsUserTypeOnboarding(true);
        }
      } catch (err) {
        console.error("Google Auth error:", err);
      }
    } else {
      // Demo Mode Google Login
      const demoUid = `google-demo-${Date.now()}`;
      const stored = await getUserProfile('demo-teacher-01');
      if (stored && stored.userType) {
        setUser({
          ...DEFAULT_DEMO_USER,
          displayName: '구글 연동 교사',
          email: 'google.teacher@school.ed.kr',
          authType: 'google',
          userType: stored.userType,
          status: 'approved'
        });
        setNeedsUserTypeOnboarding(false);
      } else {
        setUser({
          uid: demoUid,
          displayName: '구글 연동 교사',
          email: 'google.teacher@school.ed.kr',
          authType: 'google',
          role: 'teacher',
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        setNeedsUserTypeOnboarding(true);
      }
    }
  };

  const loginAnonymously = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        const res = await signInAnonymously(auth);
        const fbUser = res.user;
        const storedProfile = await getUserProfile(fbUser.uid);

        if (storedProfile && storedProfile.userType) {
          setUser({
            ...storedProfile,
            authType: 'anonymous',
            displayName: storedProfile.displayName || '체험 사용자',
          });
          setNeedsUserTypeOnboarding(false);
        } else {
          setUser({
            uid: fbUser.uid,
            email: '',
            displayName: '체험 사용자',
            authType: 'anonymous',
            role: 'teacher',
            status: 'approved',
            createdAt: new Date().toISOString()
          });
          setNeedsUserTypeOnboarding(true);
        }
      } catch (err) {
        console.error("Anonymous Auth error:", err);
      }
    } else {
      // Demo Mode Anonymous Login
      const demoUid = `anon-demo-${Date.now()}`;
      setUser({
        uid: demoUid,
        displayName: '체험 사용자',
        email: '',
        authType: 'anonymous',
        role: 'teacher',
        status: 'approved',
        createdAt: new Date().toISOString()
      });
      setNeedsUserTypeOnboarding(true);
    }
  };

  const linkGoogleAccount = async (): Promise<boolean> => {
    if (isFirebaseConfigured && auth && auth.currentUser) {
      try {
        const res = await linkWithPopup(auth.currentUser, googleProvider);
        const fbUser = res.user;
        const currentType = user?.userType || 'other';
        const updatedUser: UserProfile = {
          ...user!,
          email: fbUser.email || user?.email || '',
          displayName: fbUser.displayName || user?.displayName || '구글 연동 교사',
          photoURL: fbUser.photoURL || user?.photoURL,
          authType: 'google',
        };
        await saveUserProfile(
          updatedUser.uid,
          currentType,
          'google',
          updatedUser.email,
          updatedUser.displayName,
          updatedUser.role,
          updatedUser.status || 'pending'
        );
        setUser(updatedUser);
        return true;
      } catch (err) {
        console.error("Account linking error:", err);
        return false;
      }
    } else {
      // Demo mode link simulation
      if (user) {
        const currentType = user.userType || 'other';
        const updatedUser: UserProfile = {
          ...user,
          email: 'linked.teacher@gmail.com',
          displayName: '구글 연동 완료 교사',
          authType: 'google'
        };
        await saveUserProfile(
          updatedUser.uid,
          currentType,
          'google',
          updatedUser.email,
          updatedUser.displayName,
          updatedUser.role,
          updatedUser.status || 'pending'
        );
        setUser(updatedUser);
        return true;
      }
      return false;
    }
  };

  const loginDemoUser = (role: 'teacher' | 'admin' = 'teacher', status: 'approved' | 'pending' = 'approved') => {
    setUser({
      ...DEFAULT_DEMO_USER,
      role,
      status: role === 'admin' ? 'approved' : status,
      userType: 'special_class_teacher',
      displayName: role === 'admin' ? '김관리 수석교사' : (status === 'pending' ? '박승인대기 교사' : '김특수 교사')
    });
    setNeedsUserTypeOnboarding(false);
  };

  const updateUserType = async (userType: UserType) => {
    if (!user) return;
    const initialStatus = user.role === 'admin' ? 'approved' : (user.status || 'pending');
    const updated = await saveUserProfile(
      user.uid,
      userType,
      user.authType || 'google',
      user.email,
      user.displayName,
      user.role,
      initialStatus
    );
    setUser(updated);
    setNeedsUserTypeOnboarding(false);
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    setUser(null);
    setNeedsUserTypeOnboarding(false);
  };

  const switchDemoRole = (role: 'teacher' | 'admin') => {
    if (user) {
      setUser({
        ...user,
        role,
        status: role === 'admin' ? 'approved' : (user.status || 'approved'),
        displayName: role === 'admin' ? '김관리 수석교사' : '김특수 교사'
      });
    } else {
      setUser({
        ...DEFAULT_DEMO_USER,
        role,
        status: role === 'admin' ? 'approved' : 'approved',
        displayName: role === 'admin' ? '김관리 수석교사' : '김특수 교사'
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        needsUserTypeOnboarding,
        isAuthInitializing,
        isFirebaseActive: isFirebaseConfigured,
        loginWithGoogle,
        loginAnonymously,
        linkGoogleAccount,
        loginDemoUser,
        logout,
        updateUserType,
        switchDemoRole,
        reloadUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
