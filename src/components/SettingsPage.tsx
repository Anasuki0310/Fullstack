import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { Camera, Bell, Palette, Globe, MessageCircle, CheckCircle2, ShieldCheck, Key, RefreshCw, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');
  
  const { language: globalLanguage, setLanguage: setGlobalLanguage } = useLanguage();
  const { 
    displayName, 
    email, 
    photoURL, 
    studentId: authStudentId,
    faculty: authFaculty,
    major: authMajor,
    isGoogleUser, 
    signInWithGoogle, 
    loading,
    updateUserProfile,
    resetProfileToGoogle
  } = useAuth();

  // Profile Form States
  const [fullName, setFullName] = useState(displayName);
  const [studentId, setStudentId] = useState(authStudentId);
  const [faculty, setFaculty] = useState(authFaculty);
  const [major, setMajor] = useState(authMajor);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  // Sync profile form states when auth data updates
  useEffect(() => {
    setFullName(displayName);
  }, [displayName]);

  useEffect(() => {
    setStudentId(authStudentId);
  }, [authStudentId]);

  useEffect(() => {
    setFaculty(authFaculty);
  }, [authFaculty]);

  useEffect(() => {
    setMajor(authMajor);
  }, [authMajor]);

  // Settings States
  const [emailNotif, setEmailNotif] = useState(false);
  const [lineNotif, setLineNotif] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [localLanguage, setLocalLanguage] = useState<'en' | 'th'>(globalLanguage);

  // Toast State
  const [toast, setToast] = useState<{ visible: boolean; title: string; description: string } | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setToast({
        visible: true,
        title: globalLanguage === 'th' ? 'กรุณากรอกชื่อ-นามสกุล' : 'Name Required',
        description: globalLanguage === 'th' ? 'โปรดระบุชื่อ-นามสกุลก่อนบันทึก' : 'Please provide your full name before saving.',
      });
      setTimeout(() => setToast((prev) => (prev ? { ...prev, visible: false } : null)), 3000);
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateUserProfile({
        displayName: fullName.trim(),
        studentId: studentId.trim(),
        faculty: faculty.trim(),
        major: major.trim(),
      });

      setToast({
        visible: true,
        title: globalLanguage === 'th' ? 'บันทึกข้อมูลสำเร็จ' : 'Profile Saved Successfully',
        description: globalLanguage === 'th' 
          ? `อัปเดตชื่อผู้ใช้เป็น "${fullName.trim()}" และบันทึกข้อมูลเรียบร้อยแล้ว` 
          : `Your name is now updated to "${fullName.trim()}".`,
      });

      setTimeout(() => {
        setToast((prev) => (prev ? { ...prev, visible: false } : null));
      }, 3500);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setToast({
        visible: true,
        title: globalLanguage === 'th' ? 'เกิดข้อผิดพลาดในการบันทึก' : 'Save Error',
        description: globalLanguage === 'th' ? 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง' : 'Failed to save profile. Please try again.',
      });
      setTimeout(() => setToast((prev) => (prev ? { ...prev, visible: false } : null)), 3000);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setToast({
        visible: true,
        title: globalLanguage === 'th' ? 'ขนาดไฟล์เกินกำหนด' : 'File Too Large',
        description: globalLanguage === 'th' ? 'กรุณาเลือกไฟล์ภาพขนาดไม่เกิน 5MB' : 'Please choose an image under 5MB.',
      });
      setTimeout(() => setToast((prev) => (prev ? { ...prev, visible: false } : null)), 3000);
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await updateUserProfile({ photoURL: dataUrl });
      setToast({
        visible: true,
        title: globalLanguage === 'th' ? 'เปลี่ยนรูปโปรไฟล์แล้ว' : 'Photo Updated',
        description: globalLanguage === 'th' ? 'อัปเดตรูปภาพโปรไฟล์เรียบร้อยแล้ว' : 'Profile picture updated successfully.',
      });
      setTimeout(() => setToast((prev) => (prev ? { ...prev, visible: false } : null)), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    resetProfileToGoogle();
    setToast({
      visible: true,
      title: globalLanguage === 'th' ? 'รีเซ็ตรูปโปรไฟล์' : 'Photo Reset',
      description: globalLanguage === 'th' ? 'กู้คืนรูปโปรไฟล์ตามค่าเริ่มต้นแล้ว' : 'Profile photo restored to default.',
    });
    setTimeout(() => setToast((prev) => (prev ? { ...prev, visible: false } : null)), 3000);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();

    // Apply Theme
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    // Apply Global Language
    setGlobalLanguage(localLanguage);

    // Show Toast
    setToast({
      visible: true,
      title: localLanguage === 'th' ? 'บันทึกการตั้งค่าแล้ว' : 'Preferences Saved',
      description: localLanguage === 'th' ? 'อัปเดตการตั้งค่าลักษณะที่ปรากฏและภาษาแล้ว' : 'Your appearance and language settings have been updated.',
    });

    // Hide toast after 3 seconds
    setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, visible: false } : null));
    }, 3000);
  };

  // Translations Map
  const t = {
    preferencesTab: globalLanguage === 'th' ? 'การตั้งค่าและกำหนดค่า' : 'Preferences & Settings',
    notifications: globalLanguage === 'th' ? 'การแจ้งเตือน' : 'Notifications',
    appearance: globalLanguage === 'th' ? 'ลักษณะที่ปรากฏ' : 'Appearance',
    language: globalLanguage === 'th' ? 'ภาษา' : 'Language',
    saveBtn: globalLanguage === 'th' ? 'บันทึกการตั้งค่า' : 'Save Preferences',
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your profile information and preferences.</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('profile')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-[#0A3D91] text-[#0A3D91]'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {globalLanguage === 'th' ? 'โปรไฟล์ของฉัน' : 'My Profile'}
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'preferences'
                  ? 'border-[#0A3D91] text-[#0A3D91] dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              {t.preferencesTab}
            </button>
          </nav>
        </div>

        {/* Tab Content: My Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
            {/* Hidden file input for changing profile photo */}
            <input
              type="file"
              ref={photoInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />

            <form onSubmit={handleSaveProfile}>
              
              {/* Google OAuth & Authorization Status */}
              <div className="p-6 md:p-8 bg-blue-50/50 border-b border-blue-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-white rounded-xl shadow-xs border border-blue-200 shrink-0">
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {globalLanguage === 'th' ? 'การเชื่อมต่อและสิทธิ์เข้าถึงบัญชี Google' : 'Google Account Authorization'}
                        </h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {isGoogleUser ? (globalLanguage === 'th' ? 'เชื่อมต่อแล้ว' : 'Connected & Authorized') : (globalLanguage === 'th' ? 'พร้อมเชื่อมต่อ' : 'Available')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {globalLanguage === 'th' 
                          ? 'ระบบได้รับอนุญาตดึงข้อมูลโปรไฟล์ (ชื่อ รูปโปรไฟล์) และอีเมลผ่าน Google OAuth 2.0 อย่างปลอดภัย' 
                          : 'CampusFix is securely authorized via Google OAuth 2.0 to access your Google profile name, email, and photo.'}
                      </p>
                      
                      {/* Authorized Scopes */}
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-slate-200 text-slate-600">
                          <ShieldCheck className="w-3 h-3 text-blue-600" /> userinfo.profile
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-slate-200 text-slate-600">
                          <ShieldCheck className="w-3 h-3 text-blue-600" /> userinfo.email
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-slate-200 text-slate-600">
                          <Key className="w-3 h-3 text-blue-600" /> openid
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    <button
                      type="button"
                      onClick={() => signInWithGoogle()}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                      {globalLanguage === 'th' ? 'ซิงค์ข้อมูล Google อีกครั้ง' : 'Re-sync Google Data'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Profile Picture Section */}
              <div className="p-6 md:p-8 flex items-center gap-6 border-b border-slate-100">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-sm overflow-hidden ring-2 ring-blue-100">
                    <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => photoInputRef.current?.click()}
                    title={globalLanguage === 'th' ? 'เปลี่ยนรูปโปรไฟล์' : 'Upload photo'}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-[#0A3D91] hover:border-[#0A3D91] transition-colors shadow-sm"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">{displayName}</h3>
                    {isGoogleUser && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Google Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-4">{email}</p>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button" 
                      onClick={() => photoInputRef.current?.click()}
                      className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                      {globalLanguage === 'th' ? 'เปลี่ยนรูปภาพ' : 'Change Photo'}
                    </button>
                    <button 
                      type="button" 
                      onClick={handleRemovePhoto}
                      className="px-4 py-2 bg-transparent text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors focus:outline-none"
                    >
                      {globalLanguage === 'th' ? 'รีเซ็ต' : 'Reset'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="p-6 md:p-8 space-y-6 border-b border-slate-100">
                <h3 className="text-base font-semibold text-slate-900">
                  {globalLanguage === 'th' ? 'ข้อมูลส่วนตัว' : 'Personal Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                      {globalLanguage === 'th' ? 'ชื่อ-นามสกุล' : 'Full Name'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={globalLanguage === 'th' ? 'กรอกชื่อ-นามสกุล' : 'Full Name'}
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D91] transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="studentId" className="block text-sm font-medium text-slate-700">
                      {globalLanguage === 'th' ? 'รหัสนักศึกษา/บุคลากร' : 'Student/Staff ID'}
                    </label>
                    <input
                      id="studentId"
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="6XXXXXXX"
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D91] transition-colors"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                      {globalLanguage === 'th' ? 'อีเมล' : 'Email Address'}
                    </label>
                    <input
                      id="email"
                      type="email"
                      defaultValue={email}
                      key={`email-${email}`}
                      placeholder="student@cmu.ac.th"
                      disabled
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="p-6 md:p-8 space-y-6">
                <h3 className="text-base font-semibold text-slate-900">
                  {globalLanguage === 'th' ? 'ข้อมูลการศึกษา / สังกัด' : 'Academic Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="university" className="block text-sm font-medium text-slate-700">
                      {globalLanguage === 'th' ? 'มหาวิทยาลัย' : 'University'}
                    </label>
                    <input
                      id="university"
                      type="text"
                      defaultValue="Chiang Mai University"
                      disabled
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="faculty" className="block text-sm font-medium text-slate-700">
                      {globalLanguage === 'th' ? 'คณะ / ส่วนงาน' : 'Faculty'}
                    </label>
                    <input
                      id="faculty"
                      type="text"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      placeholder={globalLanguage === 'th' ? 'คณะวิศวกรรมศาสตร์' : 'Faculty of Engineering'}
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D91] transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="major" className="block text-sm font-medium text-slate-700">
                      {globalLanguage === 'th' ? 'สาขาวิชา / ภาควิชา' : 'Major/Program'}
                    </label>
                    <input
                      id="major"
                      type="text"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder={globalLanguage === 'th' ? 'วิศวกรรมบูรณาการ' : 'Integrated Engineering'}
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D91] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs text-slate-500">
                  {globalLanguage === 'th' 
                    ? 'เมื่อกดบันทึก ชื่อใหม่จะถูกอัปเดตและแสดงผลทั่วทั้งระบบโดยอัตโนมัติ' 
                    : 'Changes will immediately update your name in the dashboard, header, and tickets.'}
                </p>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0A3D91] hover:bg-blue-900 text-white rounded-lg text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A3D91] disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {isSavingProfile ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {globalLanguage === 'th' ? 'กำลังบันทึก...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {globalLanguage === 'th' ? 'บันทึกการเปลี่ยนแปลง' : 'Save Changes'}
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Tab Content: Preferences & Settings */}
        {activeTab === 'preferences' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in duration-300 relative">
            <form onSubmit={handleSavePreferences}>
              
              {/* Notifications */}
              <div className="p-6 md:p-8 space-y-6 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
                  <Bell className="w-5 h-5 text-slate-400" />
                  <h3 className="text-base font-semibold">{t.notifications}</h3>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="pr-4">
                    <p className="text-sm font-medium text-slate-900">Email Notifications</p>
                    <p className="text-sm text-slate-500">Receive updates about your tickets via email.</p>
                  </div>
                  <button 
                    type="button"
                    role="switch"
                    aria-checked={emailNotif}
                    onClick={() => setEmailNotif(!emailNotif)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D91] focus-visible:ring-offset-2 ${emailNotif ? 'bg-[#0A3D91]' : 'bg-slate-200'}`}
                  >
                    <span className="sr-only">Toggle Email Notifications</span>
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${emailNotif ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="pr-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">LINE Notifications</p>
                      <div className="w-4 h-4 rounded-full bg-[#00C300] flex items-center justify-center">
                        <MessageCircle className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Get real-time alerts on your LINE app.</p>
                  </div>
                  <button 
                    type="button"
                    role="switch"
                    aria-checked={lineNotif}
                    onClick={() => setLineNotif(!lineNotif)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C300] focus-visible:ring-offset-2 ${lineNotif ? 'bg-[#00C300]' : 'bg-slate-200'}`}
                  >
                    <span className="sr-only">Toggle LINE Notifications</span>
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${lineNotif ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Appearance */}
              <div className="p-6 md:p-8 space-y-6 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
                  <Palette className="w-5 h-5 text-slate-400" />
                  <h3 className="text-base font-semibold">{t.appearance}</h3>
                </div>
                
                <div className="max-w-md space-y-2">
                  <label htmlFor="theme" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Theme</label>
                  <select 
                    id="theme" 
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                    className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A3D91] transition-colors"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                  </select>
                </div>
              </div>

              {/* Language */}
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
                  <Globe className="w-5 h-5 text-slate-400" />
                  <h3 className="text-base font-semibold">{t.language}</h3>
                </div>
                
                <div className="max-w-md space-y-2">
                  <label htmlFor="language" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Display Language</label>
                  <select 
                    id="language" 
                    value={localLanguage}
                    onChange={(e) => setLocalLanguage(e.target.value as 'en' | 'th')}
                    className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A3D91] transition-colors"
                  >
                    <option value="en">English</option>
                    <option value="th">Thai (ภาษาไทย)</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0A3D91] text-white rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A3D91]"
                >
                  {t.saveBtn}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Global Toast Notification */}
        {toast && toast.visible && (
          <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-xl p-4 pr-12 flex items-start gap-3 relative max-w-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{toast.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{toast.description}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
