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

export interface UserCustomData {
  displayName?: string;
  studentId?: string;
  faculty?: string;
  major?: string;
  photoURL?: string;
}

interface AuthContextType {
  firebaseUser: User | null;
  googleProfile: GoogleUserInfo | null;
  accessToken: string | null;
  displayName: string;
  email: string;
  photoURL: string;
  studentId: string;
  faculty: string;
  major: string;
  isAuthenticated: boolean;
  isGoogleUser: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  setManualUser: (email: string, name?: string) => void;
  updateUserProfile: (data: Partial<UserCustomData>) => Promise<void>;
  resetProfileToGoogle: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { role, setRole } = useRole();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [googleProfile, setGoogleProfile] = useState<GoogleUserInfo | null>(null);
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
        
        // Auto-assign admin if email matches admin pattern
        if (user.email === 'bimcub12345@cmu.ac.th' || user.email?.includes('admin')) {
          setRole('admin');
        } else {
          setRole('student');
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
      return { success: true };
    } catch (err: unknown) {
      console.error('Google Sign-In Error:', err);
      const message = err instanceof Error ? err.message : 'Google Sign-In failed. Please try again.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
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

  const displayName = useMemo(() => {
    if (customData.displayName && customData.displayName.trim() !== '') {
      return customData.displayName;
    }
    if (googleProfile?.name) return googleProfile.name;
    if (firebaseUser?.displayName) return firebaseUser.displayName;
    if (manualUser?.name) return manualUser.name;
    return role === 'admin' ? 'Admin Supakorn Suksomboon' : 'Supakorn Suksomboon';
  }, [customData.displayName, googleProfile, firebaseUser, manualUser, role]);

  const email = useMemo(() => {
    if (googleProfile?.email) return googleProfile.email;
    if (firebaseUser?.email) return firebaseUser.email;
    if (manualUser?.email) return manualUser.email;
    return role === 'admin' ? 'facilities.admin@cmu.ac.th' : 'student@cmu.ac.th';
  }, [googleProfile, firebaseUser, manualUser, role]);

  const photoURL = useMemo(() => {
    if (customData.photoURL && customData.photoURL.trim() !== '') {
      return customData.photoURL;
    }
    if (googleProfile?.picture) return googleProfile.picture;
    if (firebaseUser?.photoURL) return firebaseUser.photoURL;
    return 'https://i.pravatar.cc/150?u=a042581f4e29026704d';
  }, [customData.photoURL, googleProfile, firebaseUser]);

  const studentId = useMemo(() => {
    return customData.studentId || '650610123';
  }, [customData.studentId]);

  const faculty = useMemo(() => {
    return customData.faculty || 'Faculty of Engineering';
  }, [customData.faculty]);

  const major = useMemo(() => {
    return customData.major || 'Integrated Engineering';
  }, [customData.major]);

  const isAuthenticated = Boolean(firebaseUser || manualUser);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        googleProfile,
        accessToken: accessToken || getCachedAccessToken(),
        displayName,
        email,
        photoURL,
        studentId,
        faculty,
        major,
        isAuthenticated,
        isGoogleUser,
        loading,
        signInWithGoogle,
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
