/**
 * @file RoleContext.tsx
 * @description คอนเท็กซ์จัดการบทบาทและสิทธิ์การใช้งานของผู้ใช้ (User Role State)
 * 
 * หน้าที่ของไฟล์นี้:
 * 1. กำหนดและสลับบทบาทระหว่าง 'admin' (ผู้ดูแลระบบ/ช่างอาคาร) และ 'student' (นิสิต/ผู้ใช้ทั่วไป)
 * 2. บันทึกบทบาทปัจจุบันลงใน localStorage เพื่อคงสถานะบทบาทไว้หลังรีเฟรชหน้าเว็บ
 * 3. ส่งมอบค่า `role` และฟังก์ชัน `setRole` ให้คอมโพเนนต์ต่างๆ นำไปกำหนดเงื่อนไขการแสดงผล UI
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

/** ชนิดของบทบาทผู้ใช้: 'student' (นิสิต) หรือ 'admin' (ผู้ดูแลระบบ) */
export type UserRole = 'student' | 'admin';

interface RoleContextType {
  role: UserRole;                  // บทบาทปัจจุบัน
  setRole: (role: UserRole) => void; // ฟังก์ชันเปลี่ยนบทบาท
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  // ดึงค่าบทบาทเริ่มต้นจาก localStorage (ค่าเริ่มต้นคือ 'admin')
  const [role, setRoleState] = useState<UserRole>(() => {
    try {
      const stored = localStorage.getItem('app_user_role');
      return stored === 'student' ? 'admin' : (stored as UserRole) || 'admin';
    } catch {
      return 'admin';
    }
  });

  /**
   * ฟังก์ชัน setRole:
   * สลับบทบาทผู้ใช้ และบันทึกค่าใหม่ลงใน localStorage ทันที
   */
  const setRole = useCallback((newRole: UserRole) => {
    try {
      localStorage.setItem('app_user_role', newRole);
    } catch {
      // ignore
    }
    setRoleState(newRole);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

/**
 * Hook useRole:
 * ใช้สำหรับเรียกดู role และฟังก์ชัน setRole ในคอมโพเนนต์ใดๆ
 */
export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
