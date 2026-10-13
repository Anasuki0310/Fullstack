

export const GOOGLE_CLIENT_ID =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_CLIENT_ID ||
  '919851798361-72lqg958mq6bjl6s91smtmlmotp51b9t.apps.googleusercontent.com';

export interface GoogleUserProfile {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email: string;
  email_verified?: boolean;
}


export function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    if ((window as unknown as { google?: { accounts?: { oauth2?: unknown } } }).google?.accounts?.oauth2) {
      return resolve();
    }

    const existingScript = document.getElementById('google-gsi-client');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}


export async function triggerGoogleOAuth(clientId = GOOGLE_CLIENT_ID): Promise<GoogleUserProfile> {
  await loadGsiScript();

  return new Promise((resolve, reject) => {
    const googleAny = (window as unknown as {
      google?: {
        accounts?: {
          oauth2?: {
            initTokenClient: (config: unknown) => { requestAccessToken: (opts?: unknown) => void }
          }
        }
      }
    }).google;

    if (!googleAny?.accounts?.oauth2) {
      reject(new Error('Google Identity Services SDK is not available'));
      return;
    }

    try {
      const tokenClient = googleAny.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse: { access_token?: string; error?: string; error_description?: string }) => {
          if (tokenResponse.error) {
            reject(new Error(tokenResponse.error_description || tokenResponse.error));
            return;
          }

          if (!tokenResponse.access_token) {
            reject(new Error('ไม่พบ Access Token จาก Google'));
            return;
          }

          try {

            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });

            if (!res.ok) {
              throw new Error(`Google UserInfo Error: ${res.statusText}`);
            }

            const profile: GoogleUserProfile = await res.json();
            resolve(profile);
          } catch (fetchErr) {
            reject(fetchErr);
          }
        },
        error_callback: (err: { message?: string }) => {
          reject(new Error(err?.message || 'Google OAuth Popup Error'));
        },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (initErr) {
      reject(initErr);
    }
  });
}
