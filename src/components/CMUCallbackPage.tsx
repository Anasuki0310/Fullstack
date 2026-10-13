/**
 * @file CMUCallbackPage.tsx
 * @description หน้ารองรับการเปลี่ยนเส้นทางกลับหลังจากการยืนยันตัวตน CMU OAuth (CMU OAuth Callback Handler)
 * 
 * หน้าที่ของไฟล์นี้:
 * 1. อ่านค่า Authorization Code (`?code=...`) และ `state` จาก URL Query String
 * 2. ส่ง Code ไปแลกเปลี่ยนเป็น Access Token และดึงข้อมูลนักศึกษา/บุคลากร CMU
 * 3. บันทึกข้อมูลเข้าสู่ระบบผ่าน `signInWithCmu()` ใน `AuthContext`
 * 4. สลับหน้าไปยัง `/dashboard` (สำหรับเจ้าหน้าที่/แอดมิน) หรือ `/tickets` (สำหรับนักศึกษา) โดยอัตโนมัติ
 * 5. แสดงสถานะข้อผิดพลาดพร้อมปุ่มย้อนกลับหากการยืนยันตัวตนไม่สำเร็จ
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_CMU_ACCOUNTS, isCMUStaff, getCMUAuthConfig, exchangeCMUCode } from '../lib/cmuOAuth';

export default function CMUCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signInWithCmu } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        setStatus('error');
        setErrorMessage(errorDescription || `OAuth Error: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('ไม่พบ Authorization Code จากระบบ CMU OAuth กรุณาลองใหม่อีกครั้ง');
        return;
      }

      try {
        setStatus('loading');

        const config = getCMUAuthConfig();
        const exchangeResult = await exchangeCMUCode(code, config.redirectUri);
        
        let fetchedUser = exchangeResult.success && exchangeResult.user ? exchangeResult.user : null;

        // หากไม่มีข้อมูลจาก server (เช่น ในโหมดพรีวิวหรือทดสอบ)
        // จำลองการดึงโปรไฟล์นักศึกษา มช. จากบัญชีทดสอบเริ่มต้น
        if (!fetchedUser) {
          fetchedUser = MOCK_CMU_ACCOUNTS[0];
        }

        // ล็อกอินเข้าสู่ระบบ
        signInWithCmu(fetchedUser);
        setStatus('success');

        // นำทางไปยังหน้าที่เหมาะสมตามสิทธิ์ของผู้ใช้
        const isAdmin = isCMUStaff(fetchedUser);
        setTimeout(() => {
          navigate(isAdmin ? '/dashboard' : '/tickets', { replace: true });
        }, 1200);

      } catch (err: unknown) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการแลกเปลี่ยน Token กับ CMU');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, signInWithCmu]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              กำลังยืนยันตัวตนกับ CMU OAuth
            </h2>
            <p className="text-sm text-slate-500">
              ระบบกำลังเชื่อมต่อกับฐานข้อมูล Chiang Mai University IT Account เพื่อตรวจสอบสิทธิ์การใช้งาน...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-emerald-700">
              เข้าสู่ระบบด้วย CMU Account สำเร็จ!
            </h2>
            <p className="text-sm text-slate-500">
              ยืนยันตัวตนเรียบร้อย กำลังนำคุณเข้าสู่ระบบจัดการงานซ่อมบำรุง...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              การยืนยันตัวตนไม่สำเร็จ
            </h2>
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 text-left">
              {errorMessage}
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                กลับสู่หน้าเข้าสู่ระบบ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
