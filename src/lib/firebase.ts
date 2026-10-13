

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};


const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);


export const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'openid',
];

export const googleProvider = new GoogleAuthProvider();
SCOPES.forEach((scope) => googleProvider.addScope(scope));

googleProvider.setCustomParameters({
  prompt: 'select_account',
});


let isSigningIn = false;

let cachedAccessToken: string | null = null;

export interface GoogleUserInfo {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email: string;
  email_verified?: boolean;
  locale?: string;
  hd?: string;
}


export async function fetchGoogleUserProfile(accessToken: string): Promise<GoogleUserInfo | null> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) {
      console.warn('Failed to fetch Google userinfo:', res.statusText);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn('Error fetching Google user profile:', err);
    return null;
  }
}


export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {

        if (onAuthSuccess) onAuthSuccess(user, null);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};


export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
  googleProfile: GoogleUserInfo | null;
}> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;

    if (!accessToken) {
      throw new Error('Failed to obtain Google access token from OAuth credential');
    }

    cachedAccessToken = accessToken;


    const googleProfile = await fetchGoogleUserProfile(accessToken);

    return {
      user: result.user,
      accessToken,
      googleProfile,
    };
  } finally {
    isSigningIn = false;
  }
};


export const logoutUser = async (): Promise<void> => {
  cachedAccessToken = null;
  await firebaseSignOut(auth);
};

export const getCachedAccessToken = () => cachedAccessToken;
