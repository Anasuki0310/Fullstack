import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App safely (avoid duplicate init)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Authorized OAuth Scopes
export const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'openid',
];

export const googleProvider = new GoogleAuthProvider();
SCOPES.forEach((scope) => googleProvider.addScope(scope));
// Set custom parameters to always prompt account selection if desired
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to track ongoing sign in flow
let isSigningIn = false;
// Cached access token in memory (never stored in localStorage/sessionStorage)
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
  hd?: string; // Hosted domain (e.g. cmu.ac.th)
}

/**
 * Fetches Google User Profile data using the OAuth access token
 */
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

/**
 * Initialize auth listener with in-memory token handling
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User is logged in across reloads, but access token needs fresh popup if OAuth API calls are needed
        if (onAuthSuccess) onAuthSuccess(user, null);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Trigger Google OAuth Sign-in popup with authorized scopes
 */
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

    // Fetch Google User Profile info
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

/**
 * Sign out of Firebase Auth
 */
export const logoutUser = async (): Promise<void> => {
  cachedAccessToken = null;
  await firebaseSignOut(auth);
};

export const getCachedAccessToken = () => cachedAccessToken;
