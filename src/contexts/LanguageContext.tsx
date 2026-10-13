/**
 * @file LanguageContext.tsx
 * @description คอนเท็กซ์จัดการภาษาของแอปพลิเคชัน (Internationalization / Language State)
 * 
 * หน้าที่ของไฟล์นี้:
 * 1. จัดเก็บภาษาปัจจุบันของระบบ โดยรองรับ 2 ภาษา: 'th' (ไทย) และ 'en' (อังกฤษ)
 * 2. ซิงค์ภาษาที่ผู้ใช้เลือกลงใน localStorage อัตโนมัติ เพื่อให้จำค่าเดิมได้เมื่อเปิดเว็บใหม่
 * 3. ส่งมอบค่า `language` และฟังก์ชัน `setLanguage` ให้ทุกคอมโพเนนต์นำไปสลับข้อความ UI
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

/** ประเภทภาษาที่รองรับ: 'en' (อังกฤษ) หรือ 'th' (ไทย) */
export type Language = 'en' | 'th';

interface LanguageContextType {
  language: Language;                  // ภาษาปัจจุบัน
  setLanguage: (lang: Language) => void; // ฟังก์ชันสลับภาษา
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // โหลดค่าภาษาจาก localStorage (ค่าเริ่มต้นเป็น 'en')
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('app_language');
    return (stored === 'en' || stored === 'th') ? stored : 'en';
  });

  // บันทึกลง localStorage เมื่อภาษาเปลี่ยนแปลง
  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook useLanguage:
 * ใช้ดึงค่าภาษาปัจจุบัน (language) และฟังก์ชันเปลี่ยนภาษา (setLanguage)
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
