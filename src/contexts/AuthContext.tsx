/**
 * @file AuthContext.tsx
 * @description คอนเท็กซ์จัดการระบบความปลอดภัย บัญชีผู้ใช้ และการเข้าสู่ระบบ (Authentication & User State)
 * 
 * หน้าที่ของไฟล์นี้:
 * 1. ตรวจสอบและติดตามสถานะผู้ใช้งาน (Firebase Authentication & Google OAuth)
 * 2. จัดเก็บข้อมูลโปรไฟล์ผู้ใช้งาน เช่น ชื่อ, อีเมล, รหัสนิสิต, คณะ, สาขา, รูปโปรไฟล์
 * 3. รองรับการล็อกอินด้วย Google Account (signInWithGoogle) หรือโหมด Demo/Manual User (setManualUser)
 * 4. รองรับการแก้ไขข้อมูลโปรไฟล์ส่วนตัว (updateUserProfile) และรีเซ็ตกลับเป็นข้อมูลเดิมของ Google (resetProfileToGoogle)
 * 5. ตรวจสอบบทบาทเริ่มต้น เช่น หากอีเมลมีคำว่า 'admin' หรือเป็นอีเมลผู้ดูแล จะได้รับสิทธิ์ Admin อัตโนมัติ
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { 
  googleSignIn, 
  logoutUser, 
  initAuth, 
  fetchGoogleUserProfile,
  GoogleUserInfo,
  getCachedAccessToken 
} from '../lib/firebase';
import { useRole } from './RoleContext';
import { 
  CMUUserInfo, 
  getStoredCMUUser, 
  storeCMUUser, 
  isCMUStaff 
} from '../lib/cmuOAuth';

/** ข้อมูลโปรไฟล์เพิ่มเติมที่ผู้ใช้สามารถปรับแต่งเองได้ */
export interface UserCustomData {
  displayName?: string; // ชื่อที่แสดง
  studentId?: string;   // รหัสนิสิต
  faculty?: string;     // คณะ
  major?: string;       // สาขาวิชา
  photoURL?: string;    // ลิงก์รูปโปรไฟล์
}

interface AuthContextType {
  firebaseUser: User | null;          // ออบเจ็กต์ Firebase User ปัจจุบัน
  googleProfile: GoogleUserInfo | null; // ข้อมูลโปรไฟล์จาก Google
  cmuUser: CMUUserInfo | null;        // ข้อมูลโปรไฟล์จาก CMU OAuth
  accessToken: string | null;         // Google / OAuth Access Token
  displayName: string;                // ชื่อที่แสดงผล (คำนวณจาก Custom/CMU/Google/Manual)
  email: string;                      // อีเมลผู้ใช้
  photoURL: string;                   // URL รูปภาพโปรไฟล์
  studentId: string;                  // รหัสนิสิต/นักศึกษา
  faculty: string;                    // คณะ
  major: string;                      // สาขา
  isAuthenticated: boolean;           // สถานะว่าเข้าสู่ระบบแล้วหรือไม่
  isGoogleUser: boolean;              // ล็อกอินผ่านบัญชี Google หรือไม่
  isCmuUser: boolean;                 // ล็อกอินผ่านบัญชี CMU Account หรือไม่
  loading: boolean;                   // กำลังโหลดสถานะล็อกอินหรือไม่
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>; // ฟังก์ชันเข้าสู่ระบบด้วย Google
  signInWithCmu: (userInfo: CMUUserInfo) => void; // ฟังก์ชันเข้าสู่ระบบด้วย CMU Account
  signOut: () => Promise<void>;       // ฟังก์ชันออกจากระบบ
  setManualUser: (email: string, name?: string) => void; // ฟังก์ชันตั้งค่าผู้ใช้แบบ Manual / Demo
  updateUserProfile: (data: Partial<UserCustomData>) => Promise<void>; // ฟังก์ชันแก้ไขข้อมูลโปรไฟล์
  resetProfileToGoogle: () => void;   // ฟังก์ชันคืนค่าโปรไฟล์เป็นค่าเดิมของ Google
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { role, setRole } = useRole();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [googleProfile, setGoogleProfile] = useState<GoogleUserInfo | null>(null);
  const [cmuUser, setCmuUser] = useState<CMUUserInfo | null>(() => getStoredCMUUser());
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Custom profile data persisted in localStorage (e.g. customized name, student ID, etc.)
  const [customData, setCustomData] = useState<UserCustomData>(() => {
    try {
      const stored = localStorage.getItem('app_user_custom_data');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Manual fallback user (e.g. standard email login or demo)
  const [manualUser, setManualUserInternal] = useState<{ email: string; name: string } | null>(() => {
    try {
      const stored = localStorage.getItem('app_manual_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        setFirebaseUser(user);
        if (token) {
          setAccessToken(token);
          const profile = await fetchGoogleUserProfile(token);
          if (profile) setGoogleProfile(profile);
        } else {
          // If logged in via Firebase Auth session without fresh access token in memory,
          // user details are still available directly on Firebase User!
          setGoogleProfile({
            sub: user.uid,
            name: user.displayName || 'Google User',
            email: user.email || '',
            picture: user.photoURL || undefined,
            email_verified: user.emailVerified,
          });
        }
        
        // Auto-assign admin if email matches admin pattern, only if no role was saved
        const savedRole = localStorage.getItem('app_user_role');
        if (!savedRole) {
          if (user.email === 'bimcub12345@cmu.ac.th' || user.email?.includes('admin')) {
            setRole('admin');
          } else {
            setRole('student');
          }
        }

        setLoading(false);
      },
      () => {
        setFirebaseUser(null);
        setGoogleProfile(null);
        setAccessToken(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [setRole]);

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const res = await googleSignIn();
      setFirebaseUser(res.user);
      setAccessToken(res.accessToken);
      setGoogleProfile(res.googleProfile);
      
      // Determine role based on email or admin privileges
      if (res.user.email === 'bimcub12345@cmu.ac.th' || res.user.email?.includes('admin')) {
        setRole('admin');
      } else {
        setRole('student');
      }

      localStorage.removeItem('app_manual_user');
      setManualUserInternal(null);
      storeCMUUser(null);
      setCmuUser(null);
      return { success: true };
    } catch (err: unknown) {
      console.error('Google Sign-In Error:', err);
      const message = err instanceof Error ? err.message : 'Google Sign-In failed. Please try again.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /** เข้าสู่ระบบด้วย CMU Account จาก CMU OAuth */
  const signInWithCmu = (userInfo: CMUUserInfo) => {
    setCmuUser(userInfo);
    storeCMUUser(userInfo);

    // ปรับบทบาทตามประเภทบัญชี CMU (บุคลากร/Admin หรือ นักศึกษา)
    const isAdmin = isCMUStaff(userInfo);
    setRole(isAdmin ? 'admin' : 'student');

    // อัปเดตข้อมูลโปรไฟล์พื้นฐานจาก CMU
    const fullNameTh = `${userInfo.prename_TH || ''}${userInfo.firstname_TH} ${userInfo.lastname_TH}`.trim();
    const fullNameEn = `${userInfo.prename_EN || ''} ${userInfo.firstname_EN} ${userInfo.lastname_EN}`.trim();
    const displayName = fullNameTh || fullNameEn || userInfo.cmuitaccount_name;

    const newCustomData: UserCustomData = {
      ...customData,
      displayName,
      studentId: userInfo.student_id || customData.studentId || '',
      faculty: userInfo.organization_name_TH || userInfo.organization_name_EN || customData.faculty,
    };
    setCustomData(newCustomData);
    try {
      localStorage.setItem('app_user_custom_data', JSON.stringify(newCustomData));
    } catch {
      // ignore
    }

    // ล้างบัญชีแบบ manual
    setManualUserInternal(null);
    localStorage.removeItem('app_manual_user');
  };

  const signOut = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn('Logout error', e);
    }
    setFirebaseUser(null);
    setGoogleProfile(null);
    setAccessToken(null);
    setManualUserInternal(null);
    setCmuUser(null);
    storeCMUUser(null);
    localStorage.removeItem('app_manual_user');
  };

  const setManualUser = (email: string, name?: string) => {
    const newUser = {
      email,
      name: name || (email.split('@')[0] || 'User'),
    };
    setManualUserInternal(newUser);
    try {
      localStorage.setItem('app_manual_user', JSON.stringify(newUser));
    } catch {
      // ignore
    }
  };

  const updateUserProfile = async (data: Partial<UserCustomData>) => {
    const updated = { ...customData, ...data };
    setCustomData(updated);
    try {
      localStorage.setItem('app_user_custom_data', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save user custom data to localStorage', e);
    }

    if (firebaseUser) {
      try {
        await updateFirebaseProfile(firebaseUser, {
          displayName: updated.displayName || firebaseUser.displayName || undefined,
          photoURL: updated.photoURL || firebaseUser.photoURL || undefined,
        });
      } catch (err) {
        console.warn('Failed to sync updated profile to Firebase User', err);
      }
    }
  };

  const resetProfileToGoogle = () => {
    const updated: UserCustomData = {
      ...customData,
      displayName: googleProfile?.name || firebaseUser?.displayName || '',
      photoURL: googleProfile?.picture || firebaseUser?.photoURL || '',
    };
    setCustomData(updated);
    try {
      localStorage.setItem('app_user_custom_data', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to reset profile', e);
    }
  };

  const isGoogleUser = Boolean(firebaseUser && (googleProfile || firebaseUser.email));
  const isCmuUser = Boolean(cmuUser);

  const displayName = useMemo(() => {
    if (customData.displayName && customData.displayName.trim() !== '') {
      return customData.displayName;
    }
    if (cmuUser) {
      const thName = `${cmuUser.prename_TH || ''}${cmuUser.firstname_TH} ${cmuUser.lastname_TH}`.trim();
      if (thName) return thName;
      return `${cmuUser.firstname_EN} ${cmuUser.lastname_EN}`.trim();
    }
    if (googleProfile?.name) return googleProfile.name;
    if (firebaseUser?.displayName) return firebaseUser.displayName;
    if (manualUser?.name) return manualUser.name;
    return role === 'admin' ? 'Admin Supakorn Suksomboon' : 'Supakorn Suksomboon';
  }, [customData.displayName, cmuUser, googleProfile, firebaseUser, manualUser, role]);

  const email = useMemo(() => {
    if (cmuUser?.cmuitaccount) return cmuUser.cmuitaccount;
    if (googleProfile?.email) return googleProfile.email;
    if (firebaseUser?.email) return firebaseUser.email;
    if (manualUser?.email) return manualUser.email;
    return role === 'admin' ? 'facilities.admin@cmu.ac.th' : 'student@cmu.ac.th';
  }, [cmuUser, googleProfile, firebaseUser, manualUser, role]);

  const photoURL = useMemo(() => {
    if (customData.photoURL && customData.photoURL.trim() !== '') {
      return customData.photoURL;
    }
    if (googleProfile?.picture) return googleProfile.picture;
    if (firebaseUser?.photoURL) return firebaseUser.photoURL;
    return 'https://i.pravatar.cc/150?u=a042581f4e29026704d';
  }, [customData.photoURL, googleProfile, firebaseUser]);

  const studentId = useMemo(() => {
    if (cmuUser?.student_id) return cmuUser.student_id;
    return customData.studentId || '650610123';
  }, [cmuUser, customData.studentId]);

  const faculty = useMemo(() => {
    if (cmuUser?.organization_name_TH) return cmuUser.organization_name_TH;
    if (cmuUser?.organization_name_EN) return cmuUser.organization_name_EN;
    return customData.faculty || 'Faculty of Engineering';
  }, [cmuUser, customData.faculty]);

  const major = useMemo(() => {
    return customData.major || 'Integrated Engineering';
  }, [customData.major]);

  const isAuthenticated = Boolean(firebaseUser || manualUser || cmuUser);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        googleProfile,
        cmuUser,
        accessToken: accessToken || getCachedAccessToken(),
        displayName,
        email,
        photoURL,
        studentId,
        faculty,
        major,
        isAuthenticated,
        isGoogleUser,
        isCmuUser,
        loading,
        signInWithGoogle,
        signInWithCmu,
        signOut,
        setManualUser,
        updateUserProfile,
        resetProfileToGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
