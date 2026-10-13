

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
  GraduationCap,
  Copy,
  Check,
  ExternalLink,
  KeyRound,
  X,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRole } from '../contexts/RoleContext';
import { useAuth } from '../contexts/AuthContext';
import {
  getCMUAuthConfig,
  saveCMUAuthConfig,
  buildCMUAuthorizeUrl,
  MOCK_CMU_ACCOUNTS,
  CMUUserInfo,
  CPE_REGISTERED_REDIRECT_URIS,
  exchangeCMUCode,
  isCMUStaff
} from '../lib/cmuOAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showCmuModal, setShowCmuModal] = useState(false);
  const [cmuConfig, setCmuConfig] = useState(() => getCMUAuthConfig());
  const [copiedRedirect, setCopiedRedirect] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [isExchangingCode, setIsExchangingCode] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [cmuAccountInput, setCmuAccountInput] = useState('');
  const [cmuRoleInput, setCmuRoleInput] = useState<'student' | 'admin'>('student');
  const [cmuModalTab, setCmuModalTab] = useState<'login' | 'real_oauth'>('login');
  const navigate = useNavigate();
  const { setRole } = useRole();
  const { signInWithGoogle, setManualUser, signInWithCmu } = useAuth();

  const handleDirectCmuLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const accountName = cmuAccountInput.trim() || 'student';
    const isStaff = cmuRoleInput === 'admin' || accountName.includes('admin') || accountName === 'bimcub12345';

    const cmuUserData: CMUUserInfo = {
      cmuitaccount_name: accountName.replace('@cmu.ac.th', ''),
      cmuitaccount: accountName.includes('@') ? accountName : `${accountName}@cmu.ac.th`,
      prename_TH: 'นาย',
      prename_EN: 'Mr.',
      firstname_TH: isStaff ? 'แอดมินฝ่ายอาคาร' : 'นักศึกษา',
      firstname_EN: isStaff ? 'Facility Admin' : 'Student',
      lastname_TH: 'มช.',
      lastname_EN: 'CMU',
      student_id: isStaff ? '' : (accountName.match(/\d{9}/) ? accountName : '650610999'),
      organization_code: '06',
      organization_name_TH: isStaff ? 'สำนักงานบริหารจัดการอาคารและสถานที่' : 'คณะวิศวกรรมศาสตร์',
      organization_name_EN: isStaff ? 'CMU Facilities' : 'Faculty of Engineering',
      itaccounttype_id: isStaff ? 'StaffAcc' : 'StdAcc',
      itaccounttype_TH: isStaff ? 'บุคลากร' : 'นักศึกษา',
      itaccounttype_EN: isStaff ? 'Staff' : 'Student',
    };

    signInWithCmu(cmuUserData);
    setShowCmuModal(false);
    navigate(isStaff ? '/dashboard' : '/tickets');
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedEmail = email.trim() || 'student@cmu.ac.th';
    setManualUser(trimmedEmail);

    if (trimmedEmail === 'bimcub12345@cmu.ac.th' || trimmedEmail.includes('admin')) {
      setRole('admin');
      navigate('/dashboard');
    } else {
      setRole('student');
      navigate('/tickets');
    }
  };

  const handleQuickAdminLogin = () => {
    setEmail('bimcub12345@cmu.ac.th');
    setPassword('123456');
    setManualUser('bimcub12345@cmu.ac.th');
    setRole('admin');
    navigate('/dashboard');
  };

  const handleQuickStudentLogin = () => {
    setEmail('student@cmu.ac.th');
    setPassword('student123');
    setManualUser('student@cmu.ac.th');
    setRole('student');
    navigate('/tickets');
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMessage('');

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        navigate('/tickets');
      } else {
        setErrorMessage(result.error || 'Failed to sign in with Google.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google OAuth sign-in encountered an error.';
      setErrorMessage(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleCmuOAuthLogin = () => {

    const authUrl = buildCMUAuthorizeUrl();
    if (window.self !== window.top) {
      window.open(authUrl, '_blank');
    } else {
      window.location.href = authUrl;
    }
  };

  const handleLaunchRealCmuOAuth = () => {
    const authUrl = buildCMUAuthorizeUrl(cmuConfig.redirectUri);
    if (window.self !== window.top) {
      window.open(authUrl, '_blank');
    } else {
      window.location.href = authUrl;
    }
  };

  const handleSelectGroup = (redirectUrl: string) => {
    const updated = saveCMUAuthConfig({ redirectUri: redirectUrl });
    setCmuConfig(updated);
  };

  const handleCopyRedirectUri = () => {
    navigator.clipboard.writeText(cmuConfig.redirectUri);
    setCopiedRedirect(true);
    setTimeout(() => setCopiedRedirect(false), 2000);
  };

  const handleSelectMockCmuAccount = (account: CMUUserInfo) => {
    signInWithCmu(account);
    setShowCmuModal(false);
    if (account.itaccounttype_id === 'StaffAcc' || account.cmuitaccount.includes('admin')) {
      navigate('/dashboard');
    } else {
      navigate('/tickets');
    }
  };

  const handleExchangeCode = async () => {
    if (!manualCodeInput.trim()) {
      setCodeError('กรุณากรอก Authorization Code หรือวาง URL ที่ได้จาก CMU');
      return;
    }
    setIsExchangingCode(true);
    setCodeError('');
    try {
      const res = await exchangeCMUCode(manualCodeInput, cmuConfig.redirectUri);
      if (res.success && res.user) {
        signInWithCmu(res.user);
        setShowCmuModal(false);
        if (isCMUStaff(res.user)) {
          navigate('/dashboard');
        } else {
          navigate('/tickets');
        }
      } else {
        setCodeError(res.error || 'ไม่สามารถแลกเปลี่ยน Token ได้ กรุณาตรวจสอบ Code หรือ URL');
      }
    } catch (err: unknown) {
      setCodeError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsExchangingCode(false);
    }
  };

  const handleSaveConfig = () => {
    const updated = saveCMUAuthConfig(cmuConfig);
    setCmuConfig(updated);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans text-slate-900">
      <div className="hidden md:flex md:w-1/2 relative bg-[#0A3D91] items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="University Campus"
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0A3D91] to-transparent opacity-80"></div>

        <div className="relative z-10 px-12 lg:px-24 flex flex-col justify-center h-full w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white/10 p-4 rounded-xl inline-flex mb-8 backdrop-blur-md border border-white/20 shadow-xl">
              <Building2 className="text-white w-10 h-10" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
              Maintain Our <br />Campus Together
            </h1>
            <p className="text-blue-100 text-lg lg:text-xl max-w-md leading-relaxed font-light">
              Quickly report issues and track requests to ensure our university remains a pristine environment for learning and growth.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-white md:bg-slate-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md bg-white md:rounded-2xl md:shadow-xl md:shadow-blue-900/5 md:border md:border-slate-100 p-8 lg:p-10 flex flex-col"
        >
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              Sign In to CampusFix
            </h2>
            <p className="text-slate-500 text-sm">
              Enter your credentials to access maintenance services.
            </p>
          </div>

          <div className="mb-3">
            <button
              type="button"
              onClick={handleCmuOAuthLogin}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl shadow-sm bg-linear-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all cursor-pointer group"
            >
              <div className="w-5 h-5 mr-2.5 flex items-center justify-center bg-white/20 rounded-full text-xs font-bold">
                🐘
              </div>
              <span>เข้าสู่ระบบด้วย CMU Account</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center py-2.5 px-4 border border-slate-300 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 transition-colors disabled:opacity-75 cursor-pointer"
          >
            {isGoogleLoading ? (
              <div className="flex items-center gap-2 text-slate-600">
                <Loader2 className="w-5 h-5 animate-spin text-[#0A3D91]" />
                <span>กำลังเชื่อมต่อ Google...</span>
              </div>
            ) : (
              <>
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 mr-3">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span>เข้าสู่ระบบด้วย Google</span>
              </>
            )}
          </button>

          <div className="relative flex py-6 items-center">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink-0 mx-4 text-slate-400 text-xs uppercase tracking-wider font-medium">หรือ เข้าสู่ระบบด้วยอีเมล</span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="student@cmu.ac.th"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] sm:text-sm transition-all outline-none placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] sm:text-sm transition-all outline-none placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <a href="#" className="text-sm font-medium text-[#0A3D91] hover:text-blue-800 transition-colors">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-[#0A3D91] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A3D91] transition-all mt-2 cursor-pointer"
            >
              ล็อกอิน
            </button>
          </form>
        </motion.div>
      </div>

      <AnimatePresence>
        {showCmuModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-linear-to-r from-purple-800 to-indigo-900 text-white p-5 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                    🐘
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">CMU OAuth Integration</h3>
                    <p className="text-xs text-purple-200">ระบบเชื่อมต่อบัญชีมหาวิทยาลัยเชียงใหม่</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCmuModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex border border-purple-200/80 bg-purple-50/70 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setCmuModalTab('login')}
                    className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      cmuModalTab === 'login'
                        ? 'bg-purple-800 text-white shadow-sm'
                        : 'text-purple-800 hover:bg-purple-100/70'
                    }`}
                  >
                    <span>⚡ เข้าสู่ระบบ CMU ทันที</span>
                    <span className="text-[10px] bg-amber-400 text-purple-950 px-1.5 py-0.2 rounded font-extrabold">
                      แนะนำ
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCmuModalTab('real_oauth')}
                    className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      cmuModalTab === 'real_oauth'
                        ? 'bg-purple-800 text-white shadow-sm'
                        : 'text-purple-800 hover:bg-purple-100/70'
                    }`}
                  >
                    <span>⚙️ เชื่อมต่อ Server CPE</span>
                  </button>
                </div>

                {cmuModalTab === 'login' && (
                  <div className="space-y-4 pt-1">
                    <form onSubmit={handleDirectCmuLogin} className="space-y-3.5 bg-linear-to-b from-purple-50/50 to-white p-4 rounded-xl border border-purple-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          CMU IT Account หรือ รหัสนักศึกษา:
                        </label>
                        <input
                          type="text"
                          placeholder="เช่น anatsapong หรือ 650610123 หรือ somchai.j@cmu.ac.th"
                          value={cmuAccountInput}
                          onChange={(e) => setCmuAccountInput(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-slate-800 font-medium"
                        />
                        <p className="text-[11px] text-slate-500 mt-1">
                          พิมพ์รหัสนักศึกษาหรืออีเมล CMU ของคุณ เพื่อเข้าใช้งานในชื่อบัญชีของคุณ
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          เลือกบทบาทที่ต้องการทดสอบ:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setCmuRoleInput('student')}
                            className={`p-2.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              cmuRoleInput === 'student'
                                ? 'bg-purple-700 text-white border-purple-800 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <GraduationCap className="w-4 h-4" />
                            <span>นักศึกษา (Student)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setCmuRoleInput('admin')}
                            className={`p-2.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              cmuRoleInput === 'admin'
                                ? 'bg-purple-700 text-white border-purple-800 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>แอดมิน/ช่าง (Admin)</span>
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer mt-1"
                      >
                        <div className="w-4 h-4 flex items-center justify-center bg-white/20 rounded-full text-[10px]">
                          🐘
                        </div>
                        <span>เข้าสู่ระบบ CMU Account ทันที</span>
                      </button>
                    </form>

                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        หรือคลิกเลือกบัญชีทดสอบทันที:
                      </span>
                      <div className="space-y-1.5">
                        {MOCK_CMU_ACCOUNTS.map((acc) => (
                          <button
                            key={acc.cmuitaccount}
                            type="button"
                            onClick={() => handleSelectMockCmuAccount(acc)}
                            className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all flex items-center justify-between group cursor-pointer"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-800 group-hover:text-purple-900 truncate">
                                  {acc.prename_TH}{acc.firstname_TH} {acc.lastname_TH}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                  acc.itaccounttype_id === 'StaffAcc'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {acc.itaccounttype_TH || 'นักศึกษา'}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {acc.cmuitaccount} {acc.student_id ? `• รหัส: ${acc.student_id}` : ''}
                              </div>
                            </div>
                            <span className="ml-2 text-xs font-bold text-purple-600 group-hover:translate-x-0.5 transition-transform">
                              เลือก →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {cmuModalTab === 'real_oauth' && (
                  <div className="space-y-4 pt-1">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-950">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>เหตุผลที่เกิด Connection Reset:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-700">
                        CMU OAuth กำหนดให้ Redirect กลับไปยังเซิร์ฟเวอร์โครงงานวิชา CPE เท่านั้น (<code className="bg-amber-100 px-1 py-0.5 rounded font-mono">https://fsgXX.cpecmu.com</code>) หากยังไม่ได้เปิดรันเว็บที่เซิร์ฟเวอร์กลุ่ม เบราว์เซอร์จะเชื่อมต่อไม่สำเร็จ
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        เลือกกลุ่มโครงงาน CPE ของคุณ (FSG 11 - FSG 20):
                      </label>
                      <select
                        value={cmuConfig.redirectUri}
                        onChange={(e) => handleSelectGroup(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50/50 text-purple-950 font-semibold cursor-pointer"
                      >
                        {CPE_REGISTERED_REDIRECT_URIS.map((item, idx) => (
                          <option key={`${item.url}-${idx}`} value={item.url}>
                            {item.label} ({item.url})
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-mono text-purple-900 truncate mr-2">
                          {cmuConfig.redirectUri}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyRedirectUri}
                          className="text-purple-700 hover:text-purple-900 font-bold shrink-0 cursor-pointer"
                        >
                          {copiedRedirect ? '✓ คัดลอกแล้ว' : 'คัดลอก'}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleLaunchRealCmuOAuth}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-800 hover:bg-purple-900 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>เปิดหน้า CMU OAuth Portal (oauth.cmu.ac.th)</span>
                    </button>

                    <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-2">
                      <span className="text-xs font-bold text-indigo-950 block">
                        วาง Code หรือ URL ที่ได้จาก CMU (กรณีเซิร์ฟเวอร์ยังไม่เปิด):
                      </span>
                      <input
                        type="text"
                        placeholder="วาง URL หรือ Code เช่น https://fsg12.cpecmu.com/callback?code=xxx"
                        value={manualCodeInput}
                        onChange={(e) => {
                          setManualCodeInput(e.target.value);
                          setCodeError('');
                        }}
                        className="w-full px-3 py-2 text-xs border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800 font-mono"
                      />
                      {codeError && (
                        <p className="text-[11px] text-red-600 font-medium">
                          ⚠️ {codeError}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={handleExchangeCode}
                        disabled={isExchangingCode}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        {isExchangingCode ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>กำลังแลกรับ Token...</span>
                          </>
                        ) : (
                          <span>แลกรับ Token และเข้าสู่ระบบทันที</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
