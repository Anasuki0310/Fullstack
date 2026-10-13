/**
 * @file cmuOAuth.ts
 * @description โมดูลจัดการระบบการยืนยันตัวตน CMU OAuth (Chiang Mai University OAuth Authentication)
 * 
 * หน้าที่ของไฟล์นี้:
 * 1. กำหนดโครงสร้างข้อมูลโปรไฟล์ของบัญชีผู้ใช้ CMU (CMUUserInfo) ตามมาตรฐานของ ITSC มหาวิทยาลัยเชียงใหม่
 * 2. สร้าง URL สำหรับ Redirect ผู้ใช้ไปยังหน้าล็อกอิน CMU OAuth (oauth.cmu.ac.th)
 * 3. จัดการการแลกเปลี่ยน Authorization Code เป็น Access Token และดึงข้อมูลผู้ใช้
 * 4. บันทึกและดึงข้อมูลการตั้งค่า Client ID / Secret จาก Environment Variables หรือ localStorage
 * 5. จัดเตรียมบัญชีจำลอง (Mock CMU Accounts) สำหรับทดสอบระบบทั้งในฝั่งนักศึกษาและเจ้าหน้าที่/แอดมิน
 */

/** โครงสร้างข้อมูลบัญชี CMU Account จาก CMU OAuth / API */
export interface CMUUserInfo {
  cmuitaccount_name: string;        // เช่น 'somchai.j'
  cmuitaccount: string;             // เช่น 'somchai.j@cmu.ac.th'
  prename_id?: string;              // รหัสคำนำหน้าชื่อ
  prename_TH?: string;              // คำนำหน้าภาษาไทย เช่น 'นาย', 'นางสาว'
  prename_EN?: string;              // คำนำหน้าภาษาอังกฤษ เช่น 'Mr.', 'Ms.'
  firstname_TH: string;             // ชื่อภาษาไทย
  firstname_EN: string;             // ชื่อภาษาอังกฤษ
  lastname_TH: string;              // นามสกุลภาษาไทย
  lastname_EN: string;              // นามสกุลภาษาอังกฤษ
  student_id?: string;              // รหัสนักศึกษา (เฉพาะนักศึกษา) เช่น '650610123'
  organization_code?: string;       // รหัสสังกัด/คณะ
  organization_name_TH?: string;    // ชื่อคณะ/หน่วยงานภาษาไทย เช่น 'คณะวิศวกรรมศาสตร์'
  organization_name_EN?: string;    // ชื่อคณะ/หน่วยงานภาษาอังกฤษ เช่น 'Faculty of Engineering'
  itaccounttype_id?: string;        // รหัสประเภทบัญชี เช่น 'StdAcc', 'StaffAcc', 'AlumAcc'
  itaccounttype_TH?: string;        // ประเภทบัญชีภาษาไทย เช่น 'นักศึกษา', 'บุคลากร'
  itaccounttype_EN?: string;        // ประเภทบัญชีภาษาอังกฤษ เช่น 'Student', 'Staff'
}

/** การตั้งค่า CMU OAuth */
export interface CMUAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authUrl: string;
  scope: string;
}

// บัญชี Client ID และ Secret ของ CMU OAuth ที่ได้รับจากอาจารย์/ITSC
export const DEFAULT_CMU_CLIENT_ID = 'MWM9PxVFyADkwn6pTSxbKlVbw4Fq7me2xzOGLqW4';
export const DEFAULT_CMU_CLIENT_SECRET = 'hmYddTEV2GJr5MVXl2UaBIdjxGGpUPxJj86GFzUKgB2YH2Kdimn1vyxFF3UGWkX7HX6GQb9PTBV8FVE8ig7VFxZuWcTZwz8745REIqvaY8OH2tZmQEHhOECfOfx12DsQ';

// รายการ Redirect URIs ทั้งหมดที่ลงทะเบียนไว้ในระบบ CMU OAuth สำหรับ Client ID นี้
export const CPE_REGISTERED_REDIRECT_URIS = [
  { group: 'localhost', label: 'Localhost - /api/auth/callback (แนะนำ)', url: 'http://localhost:3000/api/auth/callback' },
  { group: 'localhost', label: 'Localhost - /callback', url: 'http://localhost:3000/callback' },
  { group: 'localhost', label: 'Localhost - /auth/callback', url: 'http://localhost:3000/auth/callback' },
  { group: 'fsg11', label: 'FSG 11 - /auth/callback', url: 'https://fsg11.cpecmu.com/auth/callback' },
  { group: 'fsg12', label: 'FSG 12 - /callback', url: 'https://fsg12.cpecmu.com/callback' },
  { group: 'fsg12', label: 'FSG 12 - /auth/callback', url: 'https://fsg12.cpecmu.com/auth/callback' },
  { group: 'fsg12', label: 'FSG 12 - /api/auth/callback', url: 'https://fsg12.cpecmu.com/api/auth/callback' },
  { group: 'fsg13', label: 'FSG 13 - /callback', url: 'https://fsg13.cpecmu.com/callback' },
  { group: 'fsg13', label: 'FSG 13 - /auth/callback', url: 'https://fsg13.cpecmu.com/auth/callback' },
  { group: 'fsg13', label: 'FSG 13 - /api/auth/callback', url: 'https://fsg13.cpecmu.com/api/auth/callback' },
  { group: 'fsg14', label: 'FSG 14 - /callback', url: 'https://fsg14.cpecmu.com/callback' },
  { group: 'fsg14', label: 'FSG 14 - /auth/callback', url: 'https://fsg14.cpecmu.com/auth/callback' },
  { group: 'fsg14', label: 'FSG 14 - /api/auth/callback', url: 'https://fsg14.cpecmu.com/api/auth/callback' },
  { group: 'fsg15', label: 'FSG 15 - /callback', url: 'https://fsg15.cpecmu.com/callback' },
  { group: 'fsg15', label: 'FSG 15 - /auth/callback', url: 'https://fsg15.cpecmu.com/auth/callback' },
  { group: 'fsg15', label: 'FSG 15 - /api/auth/callback', url: 'https://fsg15.cpecmu.com/api/auth/callback' },
  { group: 'fsg16', label: 'FSG 16 - /callback', url: 'https://fsg16.cpecmu.com/callback' },
  { group: 'fsg16', label: 'FSG 16 - /auth/callback', url: 'https://fsg16.cpecmu.com/auth/callback' },
  { group: 'fsg16', label: 'FSG 16 - /api/auth/callback', url: 'https://fsg16.cpecmu.com/api/auth/callback' },
  { group: 'fsg17', label: 'FSG 17 - /callback', url: 'https://fsg17.cpecmu.com/callback' },
  { group: 'fsg17', label: 'FSG 17 - /auth/callback', url: 'https://fsg17.cpecmu.com/auth/callback' },
  { group: 'fsg17', label: 'FSG 17 - /api/auth/callback', url: 'https://fsg17.cpecmu.com/api/auth/callback' },
  { group: 'fsg18', label: 'FSG 18 - /callback', url: 'https://fsg18.cpecmu.com/callback' },
  { group: 'fsg18', label: 'FSG 18 - /auth/callback', url: 'https://fsg18.cpecmu.com/auth/callback' },
  { group: 'fsg18', label: 'FSG 18 - /api/auth/callback', url: 'https://fsg18.cpecmu.com/api/auth/callback' },
  { group: 'fsg19', label: 'FSG 19 - /callback', url: 'https://fsg19.cpecmu.com/callback' },
  { group: 'fsg19', label: 'FSG 19 - /auth/callback', url: 'https://fsg19.cpecmu.com/auth/callback' },
  { group: 'fsg19', label: 'FSG 19 - /api/auth/callback', url: 'https://fsg19.cpecmu.com/api/auth/callback' },
  { group: 'fsg20', label: 'FSG 20 - /callback', url: 'https://fsg20.cpecmu.com/callback' },
  { group: 'fsg20', label: 'FSG 20 - /auth/callback', url: 'https://fsg20.cpecmu.com/auth/callback' },
  { group: 'fsg20', label: 'FSG 20 - /api/auth/callback', url: 'https://fsg20.cpecmu.com/api/auth/callback' },
];

const STORAGE_KEY_CONFIG = 'cmu_oauth_config';
const STORAGE_KEY_USER = 'cmu_oauth_user_session';

export const CPE_AUTH_AUTHORIZE_URL = 'https://oauth497.cpecmu.com/application/o/authorize/';
export const CPE_AUTH_TOKEN_URL = 'https://oauth497.cpecmu.com/application/o/token/';
export const CPE_AUTH_USERINFO_URL = 'https://oauth497.cpecmu.com/application/o/userinfo/';
export const CPE_AUTH_DEFAULT_SCOPE = 'openid profile email basic_info';

/** ดึงการตั้งค่า CMU OAuth ปัจจุบัน */
export function getCMUAuthConfig(): CMUAuthConfig {
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  
  let defaultRedirect = 'http://localhost:3000/api/auth/callback';
  if (currentHost.includes('cpecmu.com')) {
    defaultRedirect = `${currentOrigin}/callback`;
  } else if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
    defaultRedirect = 'http://localhost:3000/api/auth/callback';
  } else {
    defaultRedirect = 'http://localhost:3000/api/auth/callback';
  }

  const envClientId = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_CMU_OAUTH_CLIENT_ID || DEFAULT_CMU_CLIENT_ID;
  const envClientSecret = (import.meta as unknown as { env?: Record<string, string> }).env?.CMU_OAUTH_CLIENT_SECRET || DEFAULT_CMU_CLIENT_SECRET;

  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      // หาก saved config ชี้ไปที่ oauth.cmu.ac.th เก่า ให้อัปเกรดเป็น oauth497.cpecmu.com อัตโนมัติ
      const isOldAuthUrl = parsed.authUrl?.includes('oauth.cmu.ac.th');
      return {
        clientId: parsed.clientId || envClientId,
        clientSecret: parsed.clientSecret || envClientSecret,
        redirectUri: parsed.redirectUri || defaultRedirect,
        authUrl: isOldAuthUrl ? CPE_AUTH_AUTHORIZE_URL : (parsed.authUrl || CPE_AUTH_AUTHORIZE_URL),
        scope: isOldAuthUrl || !parsed.scope ? CPE_AUTH_DEFAULT_SCOPE : parsed.scope,
      };
    }
  } catch {
    // fallback
  }

  return {
    clientId: envClientId,
    clientSecret: envClientSecret,
    redirectUri: defaultRedirect,
    authUrl: CPE_AUTH_AUTHORIZE_URL,
    scope: CPE_AUTH_DEFAULT_SCOPE,
  };
}

/** บันทึกการตั้งค่า CMU OAuth ลงใน localStorage */
export function saveCMUAuthConfig(config: Partial<CMUAuthConfig>) {
  const current = getCMUAuthConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
  return updated;
}

/** สร้าง URL สำหรับส่งผู้ใช้ไปยืนยันตัวตนที่ CMU OAuth */
export function buildCMUAuthorizeUrl(customRedirectUri?: string): string {
  const config = getCMUAuthConfig();
  const redirectUri = customRedirectUri || config.redirectUri;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId || DEFAULT_CMU_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: config.scope || CPE_AUTH_DEFAULT_SCOPE,
    state: Math.random().toString(36).substring(7),
  });

  return `${config.authUrl}?${params.toString()}`;
}

/** ตรวจสอบว่าบัญชี CMU นี้เป็นประเภทเจ้าหน้าที่หรือผู้ดูแลหรือไม่ */
export function isCMUStaff(user: CMUUserInfo): boolean {
  if (user.cmuitaccount === 'bimcub12345@cmu.ac.th' || user.cmuitaccount.includes('admin')) {
    return true;
  }
  if (user.itaccounttype_id === 'StaffAcc' || user.itaccounttype_EN?.toLowerCase().includes('staff')) {
    return true;
  }
  if (!user.student_id && user.organization_name_TH?.includes('กองอาคาร')) {
    return true;
  }
  return false;
}

/** รายชื่อบัญชีทดสอบ CMU Account (Mock Accounts สำหรับนักศึกษาและผู้ดูแล) */
export const MOCK_CMU_ACCOUNTS: CMUUserInfo[] = [
  {
    cmuitaccount_name: 'supakorn.suk',
    cmuitaccount: 'supakorn.suk@cmu.ac.th',
    prename_TH: 'นาย',
    prename_EN: 'Mr.',
    firstname_TH: 'ศุภกร',
    firstname_EN: 'Supakorn',
    lastname_TH: 'สุขสมบูรณ์',
    lastname_EN: 'Suksomboon',
    student_id: '650610123',
    organization_code: '06',
    organization_name_TH: 'คณะวิศวกรรมศาสตร์ (สาขาวิศวกรรมคอมพิวเตอร์)',
    organization_name_EN: 'Faculty of Engineering (Computer Engineering)',
    itaccounttype_id: 'StdAcc',
    itaccounttype_TH: 'นักศึกษา',
    itaccounttype_EN: 'Student',
  },
  {
    cmuitaccount_name: 'chayanon.k',
    cmuitaccount: 'chayanon.k@cmu.ac.th',
    prename_TH: 'นาย',
    prename_EN: 'Mr.',
    firstname_TH: 'ชยานนท์',
    firstname_EN: 'Chayanon',
    lastname_TH: 'เกียรติวงศ์',
    lastname_EN: 'Kiatwong',
    student_id: '640610789',
    organization_code: '06',
    organization_name_TH: 'คณะวิศวกรรมศาสตร์ (สาขาวิศวกรรมไฟฟ้า)',
    organization_name_EN: 'Faculty of Engineering (Electrical Engineering)',
    itaccounttype_id: 'StdAcc',
    itaccounttype_TH: 'นักศึกษา',
    itaccounttype_EN: 'Student',
  },
  {
    cmuitaccount_name: 'bimcub12345',
    cmuitaccount: 'bimcub12345@cmu.ac.th',
    prename_TH: 'นาย',
    prename_EN: 'Mr.',
    firstname_TH: 'แอดมินฝ่ายอาคาร',
    firstname_EN: 'Facility Admin',
    lastname_TH: 'มช.',
    lastname_EN: 'CMU Facilities',
    student_id: '',
    organization_code: '99',
    organization_name_TH: 'สำนักงานบริหารจัดการอาคารและสถานที่ มหาวิทยาลัยเชียงใหม่',
    organization_name_EN: 'CMU Physical Plant and Facility Services',
    itaccounttype_id: 'StaffAcc',
    itaccounttype_TH: 'บุคลากร',
    itaccounttype_EN: 'Staff',
  },
];

/** ดึงข้อมูลผู้ใช้ CMU จาก Local Session */
export function getStoredCMUUser(): CMUUserInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** บันทึกข้อมูลผู้ใช้ CMU ลงใน Local Session */
export function storeCMUUser(user: CMUUserInfo | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_USER);
  }
}

/**
 * แลกเปลี่ยน Authorization Code (หรือ URL เต็มที่มี ?code=...) เป็นโปรไฟล์ผู้ใช้ CMU
 */
export async function exchangeCMUCode(
  codeOrUrl: string,
  customRedirectUri?: string
): Promise<{ success: boolean; user?: CMUUserInfo; error?: string }> {
  try {
    let cleanCode = codeOrUrl.trim();
    if (!cleanCode) {
      return { success: false, error: 'กรุณาระบุ Authorization Code หรือ URL' };
    }

    let redirectUri = customRedirectUri || config.redirectUri;

    // หากผู้ใช้วางมาเป็น Full URL เช่น http://localhost:3000/api/auth/callback?code=abc... หรือ https://fsg12.cpecmu.com/callback?code=abc...
    if (cleanCode.includes('?') || cleanCode.includes('code=')) {
      try {
        const urlObj = new URL(cleanCode.startsWith('http') ? cleanCode : `http://localhost:3000/${cleanCode}`);
        const parsedCode = urlObj.searchParams.get('code');
        if (parsedCode) {
          cleanCode = parsedCode;
        }
        // ถ้าเป็น Full URL ให้ดึง redirect_uri ดั้งเดิมจาก URL นั้นมาใช้แลก Token ทันที เพื่อไม่ให้เกิด redirect_uri mismatch
        if (codeOrUrl.trim().startsWith('http')) {
          redirectUri = urlObj.origin + urlObj.pathname;
        }
      } catch {
        const match = cleanCode.match(/code=([^&]+)/);
        if (match && match[1]) {
          cleanCode = decodeURIComponent(match[1]);
        }
      }
    }

    const res = await fetch('/api/cmu-oauth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: cleanCode,
        redirectUri,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `Server error ${res.status}: ${text}` };
    }

    const data = await res.json();
    if (data.success && data.user) {
      return { success: true, user: data.user };
    }

    return {
      success: false,
      error: data.error || 'ไม่สามารถดึงข้อมูลผู้ใช้จาก CMU OAuth ได้',
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ CMU OAuth',
    };
  }
}
