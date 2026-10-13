/**
 * @file toast.tsx
 * @description ไฟล์สะพานเชื่อม (Re-export Barrel) สำหรับส่วนประกอบ Toast UI
 * 
 * หน้าที่ของไฟล์นี้:
 * 1. ส่งออกฟังก์ชัน `useToast`, `toast` จาก hook กลาง `../../hooks/use-toast`
 * 2. ส่งออกคอมโพเนนต์ `<Toaster />` จาก `./toaster` เพื่อให้เรียกใช้ได้สะดวกจากโฟลเดอร์ ui/
 */

export * from '../../hooks/use-toast';
export { Toaster } from './toaster';

