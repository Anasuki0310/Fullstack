/**
 * @file App.tsx
 * @description จุดเริ่มต้นหลักของแอปพลิเคชัน (Root Component)
 * 
 * หน้าที่ของไฟล์นี้:
 * 1. กำหนดลำดับชั้นของ Context Providers (Language, Role, Auth, Ticket, BuildingStaff, Notification)
 *    เพื่อให้ทุกคอมโพเนนต์ลูกสามารถเข้าถึงข้อมูลส่วนกลาง (Global State) ได้อย่างทั่วถึง
 * 2. กำหนดระบบเส้นทาง (Routing) ด้วย react-router-dom สำหรับเปลี่ยนหน้าระหว่าง:
 *    - หน้าเข้าสู่ระบบ (LoginPage)
 *    - หน้าแดชบอร์ดแอดมิน (DashboardPage)
 *    - หน้าแจ้งซ่อมของนิสิต (SubmitRequestPage)
 *    - หน้ารายการตั๋วแจ้งซ่อม (TicketsPage)
 *    - หน้ารายละเอียดงานซ่อม (TicketDetailsPage)
 *    - หน้าระบบจัดการช่างและอาคาร (BuildingStaffPage)
 *    - หน้าตั้งค่าระบบ (SettingsPage)
 * 3. แสดงผลคอมโพเนนต์ส่วนกลาง เช่น แบนเนอร์แจ้งเตือนงานด่วน (NotificationBanner) และระบบแจ้งเตือนป็อปอัป (Toaster)
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { RoleProvider } from './contexts/RoleContext';
import { AuthProvider } from './contexts/AuthContext';
import { TicketProvider } from './contexts/TicketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { BuildingStaffProvider } from './contexts/BuildingStaffContext';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import SubmitRequestPage from './components/SubmitRequestPage';
import TicketDetailsPage from './components/TicketDetailsPage';
import TicketsPage from './components/TicketsPage';
import SettingsPage from './components/SettingsPage';
import BuildingStaffPage from './components/BuildingStaffPage';
import CMUCallbackPage from './components/CMUCallbackPage';
import NotificationBanner from './components/NotificationBanner';
import { Toaster } from './components/ui/toaster';

/**
 * ฟังก์ชัน App:
 * คอมโพเนนต์หลักที่ห่อหุ้ม Providers ทั้งหมดและกำหนด Route ของทั้งระบบ
 */
export default function App() {
  return (
    // ระบบสลับภาษา (TH / EN)
    <LanguageProvider>
      {/* ระบบสิทธิ์บทบาท (Admin / Student) */}
      <RoleProvider>
        {/* ระบบการตรวจสอบสิทธิ์และบัญชีผู้ใช้ (Authentication) */}
        <AuthProvider>
          {/* ระบบจัดการข้อมูลตั๋วแจ้งซ่อมส่วนกลาง */}
          <TicketProvider>
            {/* ระบบจัดการข้อมูลช่างและการจัดสรรตึก */}
            <BuildingStaffProvider>
              {/* ระบบแจ้งเตือนและข้อความด่วน */}
              <NotificationProvider>
                {/* ระบบนำทาง URL (React Router) */}
                <BrowserRouter>
                  {/* แบนเนอร์แจ้งเตือนงานด่วนลอยมุมบนขวา */}
                  <NotificationBanner />
                  {/* กล่อง Toast แจ้งผลการทำงาน */}
                  <Toaster />
                  <Routes>
                    {/* เส้นทางหน้าล็อกอิน */}
                    <Route path="/" element={<LoginPage />} />
                    {/* เส้นทางรับ Callback จากระบบ CMU OAuth */}
                    <Route path="/cmu-callback" element={<CMUCallbackPage />} />
                    <Route path="/callback" element={<CMUCallbackPage />} />
                    <Route path="/auth/callback" element={<CMUCallbackPage />} />
                    <Route path="/api/auth/callback" element={<CMUCallbackPage />} />
                    <Route path="/oauth/callback" element={<CMUCallbackPage />} />
                    {/* เส้นทางหน้าแดชบอร์ดภาพรวม */}
                    <Route path="/dashboard" element={<DashboardPage />} />
                    {/* เส้นทางหน้านิสิตส่งคำร้องแจ้งซ่อม */}
                    <Route path="/submit-request" element={<SubmitRequestPage />} />
                    {/* เส้นทางหน้ารายการใบแจ้งซ่อมทั้งหมด */}
                    <Route path="/tickets" element={<TicketsPage />} />
                    {/* เส้นทางหน้ารายละเอียดใบแจ้งซ่อมตาม ID */}
                    <Route path="/ticket/:id" element={<TicketDetailsPage />} />
                    <Route path="/tickets/:id" element={<TicketDetailsPage />} />
                    {/* เส้นทางหน้าระบบจัดการช่างและอาคาร */}
                    <Route path="/building-staff" element={<BuildingStaffPage />} />
                    {/* เส้นทางหน้าตั้งค่าระบบ */}
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </BrowserRouter>
              </NotificationProvider>
            </BuildingStaffProvider>
          </TicketProvider>
        </AuthProvider>
      </RoleProvider>
    </LanguageProvider>
  );
}
