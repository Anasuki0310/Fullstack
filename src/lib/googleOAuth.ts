export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

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

export async function fetchGoogleUserProfile(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลบัญชี Google ได้');
  return response.json() as Promise<GoogleUserInfo>;
}

export function clearGoogleSession() {
  sessionStorage.removeItem('google_access_token');
  sessionStorage.removeItem('google_user');
}
