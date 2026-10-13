/**
 * @file main.tsx
 * @description จุดเริ่มต้นในการเรนเดอร์ React App เข้าสู่ DOM ของเบราว์เซอร์ (Application Entry Point)
 * 
 * หน้าที่ของไฟล์นี้:
 * 1. ค้นหา root DOM element (`#root`) ในไฟล์ `index.html`
 * 2. ใช้ `createRoot` จาก React 18+ ในการ mount คอมโพเนนต์ `<App />`
 * 3. ห่อหุ้มด้วย `<StrictMode>` เพื่อช่วยตรวจสอบ code hygiene และ side-effects ในระหว่าง development
 * 4. โหลดสไตล์หลักทั่วทั้งแอปพลิเคชันจาก `index.css` (Tailwind CSS)
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// เรนเดอร์คอมโพเนนต์หลักลงใน root container ของ index.html
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

