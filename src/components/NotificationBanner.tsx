/**
 * @file NotificationBanner.tsx
 * @description คอมโพเนนต์แบนเนอร์แจ้งเตือนงานด่วนลอยมุมบนขวา (Floating Real-time Notification Banner)
 * 
 * หน้าที่ของไฟล์นี้:
 * 1. แสดงกล่องแจ้งเตือนป็อปอัปแบบ Floating Card ที่มุมบนขวาของหน้าจอ (`fixed top-4 right-4 z-[9999]`)
 * 2. ตอบสนองต่อเหตุการณ์สำคัญแบบเรียลไทม์ เช่น:
 *    - งานซ่อมเสร็จสิ้นสมบูรณ์ (Completed Alert - ธีมสีเขียวมรกต)
 *    - การเปลี่ยนสถานะงานหรือมอบหมายช่าง (Update Alert - ธีมสีน้ำเงินเข้ม)
 * 3. แสดงข้อมูลสถานะการส่งการแจ้งเตือน (LINE Alert badge, บันทึกลงกระดิ่งแจ้งเตือนแล้ว)
 * 4. มีปุ่มลัด "เปิดดูคำร้องนี้" (View ticket) เพื่อกดนำทางไปยังหน้ารายละเอียดตั๋วได้ทันที
 * 5. ปิดอัตโนมัติหรือปิดได้ด้วยตนเองผ่านปุ่ม X, ปุ่มรับทราบ, หรือกดปุ่ม Escape บนคีย์บอร์ด
 */

import React, { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircle2, Bell, X, ArrowRight, MessageCircle, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationBanner() {
  const { activeAlert, dismissActiveAlert, lineAlertEnabled } = useNotifications();
  const { language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissActiveAlert();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dismissActiveAlert]);

  if (!activeAlert) return null;

  const isCompleted = activeAlert.type === 'completed';

  return (
    <div className="fixed top-4 right-4 sm:top-5 sm:right-6 z-[9999] max-w-md w-[calc(100vw-2rem)] sm:w-full animate-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className={`rounded-2xl p-4 sm:p-5 shadow-2xl border backdrop-blur-md transition-all ${
        isCompleted 
          ? 'bg-gradient-to-r from-emerald-900/95 via-green-800/95 to-teal-900/95 border-emerald-400/40 text-white ring-2 ring-emerald-400/30'
          : 'bg-gradient-to-r from-blue-900/95 via-indigo-900/95 to-slate-900/95 border-blue-400/40 text-white ring-2 ring-blue-400/30'
      }`}>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
              isCompleted ? 'bg-emerald-500/30 text-emerald-300' : 'bg-blue-500/30 text-blue-300'
            }`}>
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 animate-pulse text-emerald-300" />
              ) : (
                <Bell className="w-5 h-5 text-blue-300 animate-bounce" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isCompleted ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' : 'bg-blue-400/20 text-blue-300 border border-blue-400/30'
                }`}>
                  {isCompleted 
                    ? (language === 'th' ? '🎉 แจ้งเตือนเสร็จสิ้น' : '🎉 Completed Notification')
                    : (language === 'th' ? '🔔 มีการอัปเดต' : '🔔 Notification')}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-white/70">
                  <Volume2 className="w-3 h-3 text-amber-300" />
                  {language === 'th' ? 'เสียงเตือน' : 'Audio Chime'}
                </span>
              </div>
              <h4 className="font-bold text-sm sm:text-base text-white mt-0.5 leading-snug">
                {activeAlert.title}
              </h4>
            </div>
          </div>

          <button
            onClick={dismissActiveAlert}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message body */}
        <p className="text-xs sm:text-sm text-white/90 leading-relaxed pl-11 mb-3">
          {activeAlert.message}
        </p>

        {/* Badges / Integrations notification preview */}
        <div className="pl-11 flex flex-wrap items-center gap-2 mb-3">
          {lineAlertEnabled && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00C300]/25 border border-[#00C300]/50 text-white text-[11px] font-semibold">
              <MessageCircle className="w-3.5 h-3.5 text-[#00C300] fill-[#00C300]" />
              <span>{language === 'th' ? 'ส่งแจ้งเตือนทาง LINE Alert แล้ว' : 'LINE Alert sent'}</span>
            </div>
          )}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-white/90 text-[11px]">
            <Bell className="w-3 h-3 text-amber-300" />
            <span>{language === 'th' ? 'บันทึกในศูนย์แจ้งเตือนแล้ว' : 'Saved in Notification Center'}</span>
          </div>
        </div>

        {/* Actions row */}
        <div className="pl-11 flex items-center justify-between gap-2 pt-2 border-t border-white/10">
          {activeAlert.ticketId ? (
            <button
              onClick={() => {
                navigate(`/ticket/${activeAlert.ticketId}`);
                dismissActiveAlert();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              <span>{language === 'th' ? 'เปิดดูคำร้องนี้' : 'View this ticket'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : <div />}

          <button
            onClick={dismissActiveAlert}
            className="px-3 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-semibold text-white transition-colors"
          >
            {language === 'th' ? 'รับทราบ' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
}
