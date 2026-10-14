

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  fetchGoogleUserProfile,
  GoogleUserInfo,
  clearGoogleSession,
} from '../lib/googleOAuth';
import { useRole } from './RoleContext';
import {
  CMUUserInfo,
  getStoredCMUUser,
  storeCMUUser,
  isCMUStaff
} from '../lib/cmuOAuth';


export interface UserCustomData {
  displayName?: string;
  studentId?: string;
  faculty?: string;
  major?: string;
  photoURL?: string;
}

interface AuthContextType {
  googleUser: GoogleUserInfo | null;
  googleProfile: GoogleUserInfo | null;
  cmuUser: CMUUserInfo | null;
  accessToken: string | null;
  displayName: string;
  email: string;
  photoURL: string;
  studentId: string;
  faculty: string;
  major: string;
  isAuthenticated: boolean;
  isGoogleUser: boolean;
  isCmuUser: boolean;
  loading: boolean;
  signInWithGoogle: (accessToken: string) => Promise<{ success: boolean; error?: string }>;
  signInWithCmu: (userInfo: CMUUserInfo) => void;
  signOut: () => Promise<void>;
  setManualUser: (email: string, name?: string) => void;
  updateUserProfile: (data: Partial<UserCustomData>) => Promise<void>;
  resetProfileToGoogle: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { role, setRole } = useRole();
  const [googleProfile, setGoogleProfile] = useState<GoogleUserInfo | null>(null);
  const [cmuUser, setCmuUser] = useState<CMUUserInfo | null>(() => getStoredCMUUser());
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);


  const [customData, setCustomData] = useState<UserCustomData>(() => {
    try {
      const stored = localStorage.getItem('app_user_custom_data');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });


  const [manualUser, setManualUserInternal] = useState<{ email: string; name: string } | null>(() => {
    try {
      const stored = localStorage.getItem('app_manual_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const savedToken = sessionStorage.getItem('google_access_token');
    const savedUser = sessionStorage.getItem('google_user');
    if (savedToken && savedUser) {
      setAccessToken(savedToken);
      setGoogleProfile(JSON.parse(savedUser) as GoogleUserInfo);
    }
    setLoading(false);
  }, []);

  const signInWithGoogle = async (token: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const profile = await fetchGoogleUserProfile(token);
      setAccessToken(token);
      setGoogleProfile(profile);
      sessionStorage.setItem('google_access_token', token);
      sessionStorage.setItem('google_user', JSON.stringify(profile));


      if (profile.email === 'bimcub12345@cmu.ac.th' || profile.email.includes('admin')) {
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


  const signInWithCmu = (userInfo: CMUUserInfo) => {
    setCmuUser(userInfo);
    storeCMUUser(userInfo);


    const isAdmin = isCMUStaff(userInfo);
    setRole(isAdmin ? 'admin' : 'student');


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

    }


    setManualUserInternal(null);
    localStorage.removeItem('app_manual_user');
  };

  const signOut = async () => {
    clearGoogleSession();
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

  };

  const resetProfileToGoogle = () => {
    const updated: UserCustomData = {
      ...customData,
      displayName: googleProfile?.name || '',
      photoURL: googleProfile?.picture || '',
    };
    setCustomData(updated);
    try {
      localStorage.setItem('app_user_custom_data', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to reset profile', e);
    }
  };

  const isGoogleUser = Boolean(googleProfile);
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
    if (manualUser?.name) return manualUser.name;
    return role === 'admin' ? 'Admin Supakorn Suksomboon' : 'Supakorn Suksomboon';
  }, [customData.displayName, cmuUser, googleProfile, manualUser, role]);

  const email = useMemo(() => {
    if (cmuUser?.cmuitaccount) return cmuUser.cmuitaccount;
    if (googleProfile?.email) return googleProfile.email;
    if (manualUser?.email) return manualUser.email;
    return role === 'admin' ? 'facilities.admin@cmu.ac.th' : 'student@cmu.ac.th';
  }, [cmuUser, googleProfile, manualUser, role]);

  const photoURL = useMemo(() => {
    if (customData.photoURL && customData.photoURL.trim() !== '') {
      return customData.photoURL;
    }
    if (googleProfile?.picture) return googleProfile.picture;

return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><rect width="128" height="128" fill="%23E2E8F0"/><circle cx="64" cy="46" r="24" fill="%2394A3B8"/><path d="M24 114c0-22 18-38 40-38s40 16 40 38" fill="%2394A3B8"/></svg>';
  }, [customData.photoURL, googleProfile]);

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

  const isAuthenticated = Boolean(googleProfile || manualUser || cmuUser);

  return (
    <AuthContext.Provider
      value={{
        googleUser: googleProfile,
        googleProfile,
        cmuUser,
        accessToken,
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
