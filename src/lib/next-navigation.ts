/**
 * @file next-navigation.ts
 * @description ตัวแปลงคำสั่งระบบนำทาง (Navigation Adapter) เพื่อให้โค้ดที่อิงกับ Next.js Router ทำงานได้บน React Router DOM
 * 
 * หน้าที่ของไฟล์นี้:
 * 1. เลียนแบบ API ของ `useRouter` จาก `next/navigation`
 * 2. แมป method ต่างๆ เช่น `push`, `replace`, `back`, `forward`, `refresh` ให้ทำงานร่วมกับ `useNavigate()` ของ `react-router-dom`
 * 3. ช่วยให้คอมโพเนนต์หรือ UI library สำเร็จรูปที่สร้างตามสไตล์ Next.js สามารถนำมาใช้ต่อได้อย่างราบรื่น
 */

import { useNavigate } from 'react-router-dom';

/**
 * อินเตอร์เฟซกำหนดรูปแบบ method ของ Router ที่เข้ากันได้กับ Next.js
 */
export interface AppRouterInstance {
  /** เปลี่ยนเส้นทางหน้าจอไปยัง URL ที่กำหนด */
  push: (href: string) => void;
  /** แทนที่หน้าปัจจุบันด้วย URL ใหม่ (ไม่เก็บประวัติใน history stack) */
  replace: (href: string) => void;
  /** ย้อนกลับไปหน้าก่อนหน้า */
  back: () => void;
  /** เลื่อนไปข้างหน้า */
  forward: () => void;
  /** รีโหลดหน้าจอใหม่ */
  refresh: () => void;
  /** โหลดหน้าล่วงหน้า (Mocked สำหรับ React Router) */
  prefetch: (href: string) => void;
}

/**
 * ฮุก useRouter:
 * ส่งคืน Object จำลองการสั่งงาน router ในรูปแบบ Next.js โดยใช้ react-router-dom ภายใต้เบื้องหลัง
 */
export function useRouter(): AppRouterInstance {
  const navigate = useNavigate();

  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => window.location.reload(),
    prefetch: () => {},
  };
}

