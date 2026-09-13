import { SavedMaterial, RecommendationEvent, UsageEvent, AdminStats, UserProfile, UserType, AccountStatus } from '../types';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, addDoc, getDocs, getDoc, setDoc, query, where, orderBy, deleteDoc, doc, Timestamp, updateDoc } from 'firebase/firestore';
import { INITIAL_SAVED_MATERIALS, MOCK_ADMIN_STATS } from '../data/mockAdminData';

const LOCAL_STORAGE_MATERIALS_KEY = 'udl_bridge_saved_materials';
const LOCAL_STORAGE_EVENTS_KEY = 'udl_bridge_usage_events';
const LOCAL_STORAGE_RECOMMENDATIONS_KEY = 'udl_bridge_recommendation_events';
const LOCAL_STORAGE_USER_PROFILES = 'udl_bridge_user_profiles';
const LOCAL_STORAGE_ALL_USERS_KEY = 'udl_bridge_all_users_list';

const INITIAL_MOCK_USERS: UserProfile[] = [
  {
    uid: 'demo-teacher-01',
    email: 'teacher@school.ed.kr',
    displayName: '김특수 교사',
    userType: 'special_class_teacher',
    role: 'teacher',
    status: 'approved',
    authType: 'google',
    createdAt: '2026-03-01T09:00:00.000Z'
  },
  {
    uid: 'pending-teacher-02',
    email: 'park.special@school.ed.kr',
    displayName: '박민지 교사',
    userType: 'special_school_teacher',
    role: 'teacher',
    status: 'pending',
    authType: 'google',
    createdAt: '2026-09-13T10:15:00.000Z'
  },
  {
    uid: 'pending-teacher-03',
    email: 'lee.general@elementary.es.kr',
    displayName: '이동현 교사',
    userType: 'general_teacher',
    role: 'teacher',
    status: 'pending',
    authType: 'google',
    createdAt: '2026-09-13T11:30:00.000Z'
  },
  {
    uid: 'demo-admin-01',
    email: 'admin@school.ed.kr',
    displayName: '김관리 수석교사',
    userType: 'administrator',
    role: 'admin',
    status: 'approved',
    authType: 'google',
    createdAt: '2026-01-15T09:00:00.000Z'
  }
];

function getLocalMaterials(): SavedMaterial[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_MATERIALS_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_MATERIALS_KEY, JSON.stringify(INITIAL_SAVED_MATERIALS));
    return INITIAL_SAVED_MATERIALS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_SAVED_MATERIALS;
  }
}

function setLocalMaterials(materials: SavedMaterial[]) {
  localStorage.setItem(LOCAL_STORAGE_MATERIALS_KEY, JSON.stringify(materials));
}

function getLocalUsersList(): UserProfile[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_ALL_USERS_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_ALL_USERS_KEY, JSON.stringify(INITIAL_MOCK_USERS));
    return INITIAL_MOCK_USERS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_MOCK_USERS;
  }
}

function setLocalUsersList(users: UserProfile[]) {
  localStorage.setItem(LOCAL_STORAGE_ALL_USERS_KEY, JSON.stringify(users));
}

export async function saveMaterial(materialData: Omit<SavedMaterial, 'id' | 'createdAt'>): Promise<SavedMaterial> {
  const newMaterial: SavedMaterial = {
    ...materialData,
    id: `mat-${Date.now()}`,
    createdAt: new Date().toLocaleString('ko-KR', { hour12: false })
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'materials'), {
        ...newMaterial,
        createdAt: Timestamp.now()
      });
      newMaterial.id = docRef.id;
    } catch (e) {
      console.warn("Firestore saveMaterial error, fallback to local:", e);
    }
  }

  const local = getLocalMaterials();
  local.unshift(newMaterial);
  setLocalMaterials(local);
  return newMaterial;
}

export async function getSavedMaterials(userId: string): Promise<SavedMaterial[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'materials'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const firebaseMaterials: SavedMaterial[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          ...data,
          id: d.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString('ko-KR', { hour12: false }) : data.createdAt
        } as SavedMaterial;
      });
      if (firebaseMaterials.length > 0) return firebaseMaterials;
    } catch (e) {
      console.warn("Firestore getSavedMaterials error, fallback to local:", e);
    }
  }

  const local = getLocalMaterials();
  return local.filter(m => m.userId === userId || userId.startsWith('demo-'));
}

export async function getAllSavedMaterials(): Promise<SavedMaterial[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'materials'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const firebaseMaterials: SavedMaterial[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          ...data,
          id: d.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString('ko-KR', { hour12: false }) : data.createdAt
        } as SavedMaterial;
      });
      if (firebaseMaterials.length > 0) return firebaseMaterials;
    } catch (e) {
      console.warn("Firestore getAllSavedMaterials error, fallback to local:", e);
    }
  }
  return getLocalMaterials();
}

export async function deleteSavedMaterial(materialId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'materials', materialId));
    } catch (e) {
      console.warn("Firestore deleteSavedMaterial error:", e);
    }
  }

  const local = getLocalMaterials();
  const filtered = local.filter(m => m.id !== materialId);
  setLocalMaterials(filtered);
}

export async function duplicateSavedMaterial(material: SavedMaterial): Promise<SavedMaterial> {
  const duplicated: Omit<SavedMaterial, 'id' | 'createdAt'> = {
    ...material,
    title: `${material.title} (사본)`
  };
  return saveMaterial(duplicated);
}

export async function logUsageEvent(event: Omit<UsageEvent, 'id' | 'createdAt'>): Promise<void> {
  const fullEvent: UsageEvent = {
    ...event,
    id: `evt-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, 'usageEvents'), {
        ...fullEvent,
        createdAt: Timestamp.now()
      });
    } catch (e) {
      // ignore
    }
  }

  const stored = localStorage.getItem(LOCAL_STORAGE_EVENTS_KEY);
  const events: UsageEvent[] = stored ? JSON.parse(stored) : [];
  events.push(fullEvent);
  localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(events));
}

export async function logRecommendationEvent(recEvent: Omit<RecommendationEvent, 'id' | 'createdAt'>): Promise<void> {
  const fullEvent: RecommendationEvent = {
    ...recEvent,
    id: `rec-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, 'recommendationEvents'), {
        ...fullEvent,
        createdAt: Timestamp.now()
      });
    } catch (e) {
      // ignore
    }
  }

  const stored = localStorage.getItem(LOCAL_STORAGE_RECOMMENDATIONS_KEY);
  const events: RecommendationEvent[] = stored ? JSON.parse(stored) : [];
  events.push(fullEvent);
  localStorage.setItem(LOCAL_STORAGE_RECOMMENDATIONS_KEY, JSON.stringify(events));
}

export async function getAdminStats(): Promise<AdminStats> {
  const localMaterials = getLocalMaterials();
  const customCount = localMaterials.length - INITIAL_SAVED_MATERIALS.length;

  return {
    ...MOCK_ADMIN_STATS,
    materialsGenerated: MOCK_ADMIN_STATS.materialsGenerated + Math.max(0, customCount),
    materialsSaved: MOCK_ADMIN_STATS.materialsSaved + Math.max(0, customCount)
  };
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          uid: docSnap.id,
          userType: data.userType,
          authType: data.authType || 'google',
          role: data.role || 'teacher',
          status: data.status || 'approved',
          email: data.email || '',
          displayName: data.displayName || '',
          termsAgreed: data.termsAgreed ?? true,
          termsAgreedAt: data.termsAgreedAt,
          privacyAgreed: data.privacyAgreed ?? true,
          privacyAgreedAt: data.privacyAgreedAt,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
        } as UserProfile;
      }
    } catch (e) {
      console.warn("Firestore getUserProfile error:", e);
    }
  }

  // LocalStorage Fallback
  const stored = localStorage.getItem(`${LOCAL_STORAGE_USER_PROFILES}_${uid}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  
  const users = getLocalUsersList();
  const found = users.find(u => u.uid === uid);
  return found || null;
}

async function withTimeout<T>(promise: Promise<T>, ms: number = 1000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Firestore operation timeout')), ms))
  ]);
}

export async function saveUserProfile(
  uid: string,
  userType: UserType,
  authType?: 'google' | 'anonymous',
  email?: string,
  displayName?: string,
  role: 'teacher' | 'admin' = 'teacher',
  status?: AccountStatus,
  termsAgreed: boolean = true,
  termsAgreedAt?: string,
  privacyAgreed: boolean = true,
  privacyAgreedAt?: string
): Promise<UserProfile> {
  const now = new Date().toISOString();
  // Default status to 'approved' for smooth immediate access
  const userStatus: AccountStatus = status || 'approved';
  const agreedTime = termsAgreedAt || now;
  const privacyTime = privacyAgreedAt || now;

  const profileData: UserProfile = {
    uid,
    userType,
    authType: authType || 'google',
    role,
    status: userStatus,
    email: email || '',
    displayName: displayName || '',
    termsAgreed,
    termsAgreedAt: agreedTime,
    privacyAgreed,
    privacyAgreedAt: privacyTime,
    createdAt: now,
    updatedAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'users', uid);
      await withTimeout(
        setDoc(docRef, {
          uid,
          authType: authType || 'google',
          userType,
          role,
          status: userStatus,
          email: email || '',
          displayName: displayName || '',
          termsAgreed,
          termsAgreedAt: agreedTime,
          privacyAgreed,
          privacyAgreedAt: privacyTime,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }, { merge: true }),
        1000
      );
    } catch (e) {
      console.warn("Firestore saveUserProfile error, fallback to local:", e);
    }
  }

  localStorage.setItem(`${LOCAL_STORAGE_USER_PROFILES}_${uid}`, JSON.stringify(profileData));

  // Update in local users list
  const users = getLocalUsersList();
  const idx = users.findIndex(u => u.uid === uid);
  if (idx !== -1) {
    users[idx] = profileData;
  } else {
    users.unshift(profileData);
  }
  setLocalUsersList(users);

  return profileData;
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const firebaseUsers: UserProfile[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          uid: d.id,
          userType: data.userType,
          authType: data.authType || 'google',
          role: data.role || 'teacher',
          status: data.status || 'approved',
          email: data.email || '',
          displayName: data.displayName || '',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
        } as UserProfile;
      });
      if (firebaseUsers.length > 0) return firebaseUsers;
    } catch (e) {
      console.warn("Firestore getAllUserProfiles error, fallback to local:", e);
    }
  }
  return getLocalUsersList();
}

export async function updateUserStatus(uid: string, status: AccountStatus): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.now()
      });
    } catch (e) {
      console.warn("Firestore updateUserStatus error:", e);
    }
  }

  const users = getLocalUsersList();
  const index = users.findIndex(u => u.uid === uid);
  if (index !== -1) {
    users[index].status = status;
    users[index].updatedAt = new Date().toISOString();
    setLocalUsersList(users);
  }

  const singleKey = `${LOCAL_STORAGE_USER_PROFILES}_${uid}`;
  const stored = localStorage.getItem(singleKey);
  if (stored) {
    try {
      const profile = JSON.parse(stored);
      profile.status = status;
      localStorage.setItem(singleKey, JSON.stringify(profile));
    } catch (e) {}
  }
}
