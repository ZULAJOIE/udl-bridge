import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserType } from '../types';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getUserProfile, saveUserProfile } from '../services/dataService';

interface AuthContextType {
  user: UserProfile | null;
  needsUserTypeOnboarding: boolean;
  isFirebaseActive: boolean;
  loginWithGoogle: () => Promise<void>;
  loginDemoUser: (role?: 'teacher' | 'admin') => void;
  logout: () => Promise<void>;
  updateUserType: (userType: UserType) => Promise<void>;
  switchDemoRole: (role: 'teacher' | 'admin') => void;
}

const DEFAULT_DEMO_USER: UserProfile = {
  uid: 'demo-teacher-01',
  email: 'teacher@school.ed.kr',
  displayName: '김특수 교사',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  userType: 'special_class_teacher',
  role: 'teacher',
  createdAt: '2026-03-01',
  lastLoginAt: new Date().toISOString()
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_DEMO_USER);
  const [needsUserTypeOnboarding, setNeedsUserTypeOnboarding] = useState<boolean>(false);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const storedProfile = await getUserProfile(fbUser.uid);
        if (storedProfile && storedProfile.userType) {
          setUser({
            ...storedProfile,
            email: fbUser.email || storedProfile.email,
            displayName: fbUser.displayName || storedProfile.displayName,
            photoURL: fbUser.photoURL || storedProfile.photoURL,
            lastLoginAt: new Date().toISOString()
          });
          setNeedsUserTypeOnboarding(false);
        } else {
          // New user or userType not set yet
          const partialUser: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email || 'user@school.ed.kr',
            displayName: fbUser.displayName || '교사 사용자',
            photoURL: fbUser.photoURL || undefined,
            role: fbUser.email?.includes('admin') ? 'admin' : 'teacher',
            createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          };
          setUser(partialUser);
          setNeedsUserTypeOnboarding(true);
        }
      }
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
            email: fbUser.email || storedProfile.email,
            displayName: fbUser.displayName || storedProfile.displayName,
            photoURL: fbUser.photoURL || storedProfile.photoURL,
          });
          setNeedsUserTypeOnboarding(false);
        } else {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email || 'user@school.ed.kr',
            displayName: fbUser.displayName || '구글 사용자',
            photoURL: fbUser.photoURL || undefined,
            role: 'teacher',
            createdAt: new Date().toISOString()
          });
          setNeedsUserTypeOnboarding(true);
        }
      } catch (err) {
        console.error("Google Auth error:", err);
      }
    } else {
      // Demo Mode Google Login Simulation
      const demoUid = `google-demo-${Date.now()}`;
      const stored = await getUserProfile('demo-teacher-01');
      if (stored && stored.userType) {
        setUser({
          ...DEFAULT_DEMO_USER,
          displayName: '구글 연동 교사',
          email: 'google.teacher@school.ed.kr',
          userType: stored.userType
        });
        setNeedsUserTypeOnboarding(false);
      } else {
        setUser({
          uid: demoUid,
          displayName: '구글 연동 교사',
          email: 'google.teacher@school.ed.kr',
          role: 'teacher',
          createdAt: new Date().toISOString()
        });
        setNeedsUserTypeOnboarding(true);
      }
    }
  };

  const loginDemoUser = (role: 'teacher' | 'admin' = 'teacher') => {
    setUser({
      ...DEFAULT_DEMO_USER,
      role,
      userType: 'special_class_teacher',
      displayName: role === 'admin' ? '김관리 수석교사' : '김특수 교사'
    });
    setNeedsUserTypeOnboarding(false);
  };

  const updateUserType = async (userType: UserType) => {
    if (!user) return;
    const updated = await saveUserProfile(user.uid, userType, user.email, user.displayName, user.role);
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
        displayName: role === 'admin' ? '김관리 수석교사' : '김특수 교사'
      });
    } else {
      setUser({
        ...DEFAULT_DEMO_USER,
        role,
        displayName: role === 'admin' ? '김관리 수석교사' : '김특수 교사'
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        needsUserTypeOnboarding,
        isFirebaseActive: isFirebaseConfigured,
        loginWithGoogle,
        loginDemoUser,
        logout,
        updateUserType,
        switchDemoRole
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
