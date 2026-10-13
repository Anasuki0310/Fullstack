# 🛠️ University Maintenance Request Portal (Frontend)
### เว็บแอปพลิเคชันระบบแจ้งซ่อมบำรุงและจัดการงานช่างภายในมหาวิทยาลัย

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📖 เกี่ยวกับโปรเจกต์ (About The Project)

**University Maintenance Request Portal** เป็นเว็บแอปพลิเคชันฝั่งผู้ใช้งาน (Frontend) ที่ออกแบบมาสำหรับนักศึกษา อาจารย์ และเจ้าหน้าที่มหาวิทยาลัย เพื่อใช้แจ้งปัญหาและติดตามสถานะงานซ่อมบำรุง เช่น ระบบไฟฟ้า ประปา แอร์ และโสตทัศนูปกรณ์ 

ตัวระบบพัฒนาด้วยสถาปัตยกรรม Component-driven มีระบบจัดการ State และแคชข้อมูลในตัว (**Client-side LocalStorage Persistence**) ทำให้สามารถเปิดรันและทดสอบการทำงานได้ทันทีโดยไม่ต้องพึ่งพาเซิร์ฟเวอร์ภายนอก

---

## ✨ ฟีเจอร์หลัก (Key Features)

- 📝 **ระบบส่งคำขอแจ้งซ่อม (Submit Request):** เลือกอาคาร, ชั้น, เลขห้อง, หมวดหมู่งาน และระบุรายละเอียดปัญหาอย่างละเอียด
- 📸 **ถ่ายภาพหรือแนบหลักฐาน (Camera & Photo Attachment):** รองรับการเปิดกล้องเว็บแคมถ่ายภาพสด หรืออัปโหลดรูปภาพหลักฐานความเสียหาย
- ⚡ **จัดลำดับความเร่งด่วน (Priority Levels):** แบ่งระดับความเร่งด่วนตามสี (Urgent, High, Medium, Low)
- 📊 **แดชบอร์ดสรุปสถิติ (Interactive Dashboard):** กราฟแท่งและแผนภูมิสรุปจำนวนงานซ่อมตามหมวดหมู่และสถานะ
- 🔍 **ค้นหาและคัดกรองขั้นสูง (Search & Filtering):** ค้นหาตามรหัสแจ้งซ่อม (Ticket ID), สถานะงาน, หมวดหมู่ และสถานที่
- 🔄 **อัปเดตสถานะงานซ่อม:** สามารถดูรายละเอียดใบแจ้งซ่อมและทดลองเปลี่ยนสถานะงาน (Open, In Progress, Completed)
- 💾 **การบันทึกข้อมูลอัตโนมัติ (LocalStorage Sync):** ข้อมูลที่เพิ่มใหม่จะถูกบันทึกไว้ใน Browser ทันที รีเฟรชหน้าแล้วข้อมูลไม่หาย

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **UI Framework:** React 19 (Functional Components & Hooks)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (Modern Utility-first CSS)
- **Build Tool:** Vite 6
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **State Management:** React Context API + LocalStorage

---

## 📂 โครงสร้างโฟลเดอร์ (Directory Structure)

```text
├── src/
│   ├── components/                 # คอมโพเนนต์หน้าจอและส่วนประกอบ UI
│   │   ├── DashboardLayout.tsx     # เมนูนำทาง (Sidebar) และ Header
│   │   ├── DashboardPage.tsx       # แดชบอร์ดสรุปภาพรวมและสถิติ
│   │   ├── SubmitRequestPage.tsx   # แบบฟอร์มกรอกคำขอแจ้งซ่อม
│   │   ├── TicketsPage.tsx         # ตารางแสดงรายการแจ้งซ่อมทั้งหมด + ตัวกรอง
│   │   ├── TicketDetailsPage.tsx   # หน้ารายละเอียดงานซ่อมและประวัติ
│   │   ├── CameraCaptureModal.tsx  # หน้าต่างถ่ายภาพผ่านกล้อง Webcam
│   │   ├── LoginPage.tsx           # หน้าเข้าสู่ระบบจำลอง
│   │   ├── SettingsPage.tsx        # หน้าการตั้งค่าบัญชี
│   │   └── ui/                     # UI Primitives
│   │
│   ├── contexts/                   # State Management ส่วนกลาง
│   │   ├── TicketContext.tsx       # ตัวจัดการข้อมูลตั๋วแจ้งซ่อมและ LocalStorage
│   │   └── AuthContext.tsx         # ตัวจัดการสถานะผู้ใช้งาน
│   │
│   ├── App.tsx                     # ตัวกำหนดเส้นทาง (Routing) และจัดการวิว
│   ├── main.tsx                    # จุดเริ่มต้นของ React (Entry Point)
│   └── index.css                   # สไตล์หลัก (Tailwind CSS)
│
├── public/                         # ไฟล์ภาพ ไอคอน และทรัพยากร Static
├── index.html                      # ไฟล์ HTML หลัก
├── package.json                    # ข้อมูล Dependencies และสคริปต์
├── tsconfig.json                   # การตั้งค่า TypeScript
└── vite.config.ts                  # การตั้งค่าการทำงานของ Vite
```

---

## 🚀 ขั้นตอนการติดตั้งและเริ่มใช้งาน (Getting Started)

### 1. ความต้องการของระบบ (Prerequisites)
- [Node.js](https://nodejs.org/) (เวอร์ชัน 18.0.0 ขึ้นไป)
- [Git](https://git-scm.com/)

---

### 2. โคลนโปรเจกต์ (Clone Repository)
```bash
git clone https://github.com/your-username/your-repository-name.git
cd your-repository-name
```

---

### 3. ติดตั้ง Dependencies
```bash
npm install
```

---

### 4. สั่งรันโปรเจกต์ (Run Development Server)
```bash
npm run dev
```

เปิดเว็บเบราว์เซอร์ไปที่:
👉 **`http://localhost:3000`** (หรือ URL ที่แสดงขึ้นบน Terminal)

---

## 💻 คำสั่งสคริปต์ที่ใช้งานได้ (Available Scripts)

- `npm run dev` : เริ่มรัน Local Development Server (รองรับ Fast Refresh)
- `npm run build` : ทำการ Compile TypeScript และสร้างไฟล์ Production ในโฟลเดอร์ `dist/`
- `npm run preview` : ทดสอบรันหน้าเว็บจากไฟล์ Production Build
- `npm run lint` : ตรวจสอบความถูกต้องของโค้ด TypeScript (`tsc --noEmit`)

---

## 📱 การจัดการข้อมูล (Data & State Management)

ตัวโปรเจกต์ใช้ **React Context API** (`src/contexts/TicketContext.tsx`) ในการเป็น Single Source of Truth:
- **ข้อมูลเริ่มต้น (Initial Mock Data):** มีข้อมูลจำลองงานซ่อมหลากหลายประเภทเตรียมไว้ให้พร้อมใช้งาน
- **Client Storage:** ทุกการเพิ่มใบแจ้งซ่อมใหม่ (`addTicket`) หรือการเปลี่ยนสถานะ (`updateTicket`) จะบันทึกลงใน `localStorage` ของเบราว์เซอร์อัตโนมัติ ทำให้ผู้ตรวจหรืออาจารย์สามารถทดสอบการทำงานได้อย่างสมบูรณ์

---

## 👥 ผู้พัฒนา (Author)
- **ผู้พัฒนา:** นักศึกษาผู้จัดทำโครงการ
- **ติดต่อ:** anatsapong0310@gmail.com

---

## 📄 ใบอนุญาต (License)
โปรเจกต์นี้ได้รับอนุญาตให้ใช้งานภายใต้ใบอนุญาต [MIT License](LICENSE)
