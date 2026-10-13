/**
 * @file utils.ts
 * @description ยูทิลิตีฟังก์ชันส่วนกลางสำหรับจัดการ ClassNames ของ Tailwind CSS
 * 
 * ฟังก์ชันหลัก:
 * - `cn`: ผสาน class names แบบ dynamic โดยใช้ `clsx` ร่วมกับ `tailwind-merge`
 *   ช่วยแก้ไขปัญหา class ที่ทับซ้อนกัน (เช่น 'p-2' ทับกับ 'p-4') ให้ตัวหลังสุดมีผลอย่างถูกต้อง
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ฟังก์ชัน cn:
 * รวมและคัดกรอง Class Names ของ Tailwind CSS
 * @param inputs รายการคลาสที่ส่งเข้ามา
 * @returns สตริงคลาสที่ถูก merge ให้ไม่มีการชนกันของ css property
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
