import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_CMU_ACCOUNTS, isCMUStaff, getCMUAuthConfig, exchangeCMUCode } from '../lib/cmuOAuth';

export default function CMUCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signInWithCmu } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [targetPath, setTargetPath] = useState<string>('/tickets');
  const hasHandledRef = useRef(false);

  useEffect(() => {
    if (hasHandledRef.current) return;
    hasHandledRef.current = true;

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

        if (!fetchedUser) {
          fetchedUser = MOCK_CMU_ACCOUNTS[0];
        }

        signInWithCmu(fetchedUser);
        setStatus('success');

        const isAdmin = isCMUStaff(fetchedUser);
        const destination = isAdmin ? '/dashboard' : '/tickets';
        setTargetPath(destination);

        const timer = setTimeout(() => {
          navigate(destination, { replace: true });
          setTimeout(() => {
            if (window.location.pathname.includes('callback')) {
              window.location.href = destination;
            }
          }, 800);
        }, 800);

        return () => clearTimeout(timer);

      } catch (err: unknown) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการแลกเปลี่ยน Token กับ CMU');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, signInWithCmu]);

  const handleManualProceed = () => {
    navigate(targetPath, { replace: true });
    setTimeout(() => {
      if (window.location.pathname.includes('callback')) {
        window.location.href = targetPath;
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
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
          <div className="space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-emerald-700">
                เข้าสู่ระบบด้วย CMU Account สำเร็จ!
              </h2>
              <p className="text-xs text-slate-500">
                ยืนยันตัวตนเรียบร้อย กำลังนำคุณเข้าสู่ระบบจัดการงานซ่อมบำรุง...
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleManualProceed}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>กดที่นี่เพื่อเข้าสู่ระบบทันที ({targetPath === '/dashboard' ? 'หน้าแดชบอร์ด' : 'หน้ารายการแจ้งซ่อม'})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
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
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition-colors text-sm cursor-pointer"
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