/**
 * @file toaster.tsx
 * @description คอมโพเนนต์แสดงผลการแจ้งเตือนป็อปอัป (Toast Notification Container & Render List)
 * 
 * หน้าที่ของไฟล์นี้:
 * 1. ดึงรายการ toast จาก `useToast()`
 * 2. แสดงผลกล่องแจ้งเตือนลอยที่มุมบนขวาของหน้าจอ (`fixed top-5 right-5 z-[9999]`)
 * 3. ปรับสไตล์ตาม Variant:
 *    - `destructive`: พื้นหลังสีแดง พร้อมไอคอน AlertCircle (สำหรับข้อผิดพลาด/ลบข้อมูล)
 *    - `success`: พื้นหลังสีเขียวเอเมอรัลด์ พร้อมไอคอน CheckCircle2 (สำหรับการบันทึกสำเร็จ)
 *    - `default`: พื้นหลังสีขาว/กรมท่าคลาสสิก (สำหรับข้อความทั่วไป)
 * 4. มีปุ่มกากบาท (X) เพื่อปิดการแจ้งเตือนได้ทันที
 */

import React from 'react';
import { useToast } from '../../hooks/use-toast';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

/**
 * คอมโพเนนต์ Toaster:
 * วางไว้ที่ระดับบนสุดของแอป (App.tsx) เพื่อทำหน้าที่เรนเดอร์ Toast ทุกตัวที่ถูก dispatch
 */
export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => {
        const isDestructive = t.variant === 'destructive';
        const isSuccess = t.variant === 'success';
        return (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all transform animate-in slide-in-from-top-3 duration-200 ${
              isDestructive
                ? 'bg-red-50 border-red-200 text-red-900'
                : isSuccess
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-950 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-100'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
            }`}
          >
            <div className={`mt-0.5 shrink-0 ${isDestructive ? 'text-red-600' : isSuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#0A3D91] dark:text-blue-400'}`}>
              {isDestructive ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0 pr-1">
              {t.title && (
                <div className="text-sm font-semibold leading-snug">
                  {t.title}
                </div>
              )}
              {t.description && (
                <div className={`text-xs mt-1 leading-relaxed ${isSuccess ? 'text-emerald-800 dark:text-emerald-200' : 'text-slate-600 dark:text-slate-300'}`}>
                  {t.description}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors shrink-0 -mr-1 -mt-1"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default Toaster;

