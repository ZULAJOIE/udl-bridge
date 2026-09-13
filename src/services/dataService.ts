import { SavedMaterial, RecommendationEvent, UsageEvent, AdminStats, UserProfile, UserType } from '../types';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, addDoc, getDocs, getDoc, setDoc, query, where, orderBy, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { INITIAL_SAVED_MATERIALS, MOCK_ADMIN_STATS } from '../data/mockAdminData';

const LOCAL_STORAGE_MATERIALS_KEY = 'udl_bridge_saved_materials';
const LOCAL_STORAGE_EVENTS_KEY = 'udl_bridge_usage_events';
const LOCAL_STORAGE_RECOMMENDATIONS_KEY = 'udl_bridge_recommendation_events';

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

const LOCAL_STORAGE_USER_PROFILES = 'udl_bridge_user_profiles';

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
          email: data.email || '',
          displayName: data.displayName || '',
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
  return null;
}

export async function saveUserProfile(
  uid: string,
  userType: UserType,
  authType?: 'google' | 'anonymous',
  email?: string,
  displayName?: string,
  role: 'teacher' | 'admin' = 'teacher'
): Promise<UserProfile> {
  const now = new Date().toISOString();
  const profileData: UserProfile = {
    uid,
    userType,
    authType: authType || 'google',
    role,
    email: email || '',
    displayName: displayName || '',
    createdAt: now,
    updatedAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'users', uid);
      await setDoc(docRef, {
        uid,
        authType: authType || 'google',
        userType,
        role,
        email: email || '',
        displayName: displayName || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (e) {
      console.warn("Firestore saveUserProfile error:", e);
    }
  }

  localStorage.setItem(`${LOCAL_STORAGE_USER_PROFILES}_${uid}`, JSON.stringify(profileData));
  return profileData;
}
