# 🛠️ University Maintenance Request System
### ระบบแจ้งซ่อมบำรุงและจัดการอุปกรณ์ภายในมหาวิทยาลัย (Fullstack Web Application)

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

---

## 📖 เกี่ยวกับโปรเจกต์ (About The Project)

**University Maintenance Request System** เป็นเว็บแอปพลิเคชันแบบ **Fullstack** ที่พัฒนาขึ้นเพื่ออำนวยความสะดวกแก่นักศึกษา อาจารย์ และบุคลากรภายในมหาวิทยาลัย ในการแจ้งซ่อมอุปกรณ์ อาคารสถานที่ ระบบไฟฟ้า ประปา แอร์ และโสตทัศนูปกรณ์ พร้อมทั้งมีแดชบอร์ดสำหรับเจ้าหน้าที่ในการติดตามสถานะและมอบหมายงานซ่อมได้อย่างมีประสิทธิภาพ

---

## ✨ ฟีเจอร์หลัก (Key Features)

- 📝 **ส่งเรื่องแจ้งซ่อมออนไลน์ (Submit Request):** เลือกอาคาร, ชั้น, ห้อง, หมวดหมู่งานซ่อม และระบุรายละเอียดปัญหา
- 📷 **ถ่ายภาพหรือแนบหลักฐาน (Camera & Photo Upload):** รองรับการถ่ายรูปผ่านกล้องเว็บแคมหรืออัปโหลดภาพปัญหาที่พบ
- ⚡ **การจัดลำดับความสำคัญ (Priority Levels):** กำหนดระดับความเร่งด่วน (Urgent, High, Medium, Low)
- 📊 **แดชบอร์ดสรุปสถิติ (Analytics Dashboard):** กราฟแสดงสถิติตามหมวดหมู่และสถานะงาน (Open, In Progress, Completed)
- 🔍 **ค้นหาและกรองข้อมูล (Search & Filter):** ค้นหารายการแจ้งซ่อมตามชื่อ, หมายเลขอ้างอิง, สถานะ หรือหมวดหมู่
- 🔄 **อัปเดตสถานะงานแบบ Real-time:** เจ้าหน้าที่สามารถอัปเดตสถานะและช่างผู้รับผิดชอบได้ทันที
- 💾 **ระบบฐานข้อมูลแบบ Relational Database:** เชื่อมโยงข้อมูลผ่าน **PostgreSQL** บน Docker จัดการผ่าน **DBeaver**

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### **Frontend (หน้าบ้าน)**
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Charts:** Recharts

### **Backend (หลังบ้าน)**
- **Runtime:** Node.js (Express.js)
- **Database Driver:** `pg` (node-postgres connection pool)
- **Middleware:** CORS, Express JSON parser

### **Database (ฐานข้อมูล)**
- **DBMS:** PostgreSQL 16 (Alpine)
- **Containerization:** Docker & Docker Compose
- **Database Management Tool:** DBeaver Community Edition

---

## 📂 โครงสร้างโฟลเดอร์ (Directory Structure)

```text
├── database/                   # สคริปต์ฐานข้อมูล PostgreSQL
│   └── schema.sql              # คำสั่ง SQL สร้างตาราง tickets และข้อมูลตัวอย่าง
│
├── server.js                   # Backend API Server (Node.js + Express + pg)
├── docker-compose.yml          # ไฟล์ตั้งค่า Docker PostgreSQL Container
│
├── src/                        # Frontend Application (React + TypeScript)
│   ├── components/             # คอมโพเนนต์หน้าเว็บ UI
│   │   ├── DashboardLayout.tsx # Layout เมนูหลักและแถบนำทาง
│   │   ├── DashboardPage.tsx   # หน้าแดชบอร์ดสรุปภาพรวมและสถิติ
│   │   ├── SubmitRequestPage.tsx # แบบฟอร์มส่งคำขอแจ้งซ่อม
│   │   ├── TicketsPage.tsx     # หน้ารวมรายการแจ้งซ่อมทั้งหมด + ตัวกรอง
│   │   ├── TicketDetailsPage.tsx # หน้ารายละเอียดและอัปเดตสถานะตั๋วซ่อม
│   │   ├── CameraCaptureModal.tsx # โมดอลถ่ายภาพจากกล้อง
│   │   └── LoginPage.tsx       # หน้าเข้าสู่ระบบ
│   │
│   ├── contexts/               # จัดการ State ส่วนกลาง
│   │   ├── TicketContext.tsx   # Context เชื่อมต่อ API / จัดการข้อมูล tickets
│   │   └── AuthContext.tsx     # Context จัดการสถานะผู้ใช้งาน
│   │
│   ├── App.tsx                 # รูทหลักของระบบ Routing
│   ├── main.tsx                # จุดเริ่มต้นของ React (Entry Point)
│   └── index.css               # สไตล์ส่วนกลาง (Tailwind CSS)
│
├── .env.example                # ตัวอย่างการตั้งค่า Environment Variables
├── package.json                # ข้อมูล Dependencies และคำสั่ง Script
├── tsconfig.json               # การตั้งค่า TypeScript Compiler
└── vite.config.ts              # การตั้งค่า Vite Build Tool
```

---

## 🚀 วิธีการติดตั้งและเริ่มใช้งาน (Getting Started)

### 1. ความต้องการของระบบ (Prerequisites)
- [Node.js](https://nodejs.org/) (เวอร์ชัน 18 ขึ้นไป)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [DBeaver](https://dbeaver.io/) (แนะนำสำหรับการจัดการดูข้อมูลในตาราง)

---

### 2. ดาวน์โหลดโปรเจกต์ (Clone Repository)
```bash
git clone https://github.com/your-username/university-maintenance-system.git
cd university-maintenance-system
```

---

### 3. ติดตั้ง Dependencies
```bash
npm install
```

---

### 4. เปิดใช้งานฐานข้อมูล PostgreSQL (Docker)
สั่งรัน Docker container ด้วย Docker Compose:
```bash
docker compose up -d
```
> **หมายเหตุ:** คอนเทนเนอร์จะเปิดพอร์ต `5432` สำหรับ PostgreSQL  
> - **Host:** `localhost`  
> - **Port:** `5432`  
> - **Database:** `university_maintenance`  
> - **Username:** `admin`  
> - **Password:** `password123`

---

### 5. ตั้งค่าตารางใน DBeaver (Database Initialization)
1. เปิดโปรแกรม **DBeaver** กดสร้างการเชื่อมต่อใหม่ (`New Database Connection`) -> เลือก **PostgreSQL**
2. กรอกข้อมูลการเชื่อมต่อ:
   - **Host:** `localhost`
   - **Port:** `5432`
   - **Database:** `university_maintenance`
   - **Username:** `admin`
   - **Password:** `password123`
3. กด **Test Connection** แล้วกด **Finish**
4. เปิด **SQL Editor** แล้วนำคำสั่งจากไฟล์ [`database/schema.sql`](./database/schema.sql) ไปวางและกด **Execute Script (Ctrl + Enter)** เพื่อสร้างตาราง `tickets`

---

### 6. เริ่มการทำงานของเซิร์ฟเวอร์ (Start Servers)

#### รัน Backend API Server (พอร์ต 5000):
```bash
npm run server
```
*(จะขึ้นข้อความ: `🚀 Maintenance API Server กำลังทำงานที่: http://localhost:5000`)*

#### รัน Frontend Client (พอร์ต 3000):
เปิด Terminal อีกหน้าต่างหนึ่ง แล้วสั่งรัน:
```bash
npm run dev
```
*(เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`)*

---

## 📡 API Endpoints (REST API)

| Method | Endpoint | Description | Body ตัวอย่าง |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/tickets` | ดึงรายการแจ้งซ่อมทั้งหมด | - |
| **POST** | `/api/tickets` | บันทึกการแจ้งซ่อมใหม่ลง Database | `{ "id": "REQ-1046", "issue": "...", "category": "Plumbing", "location": "...", "contactName": "...", "contactPhone": "..." }` |
| **PATCH** | `/api/tickets/:id` | อัปเดตสถานะงานซ่อม หรือช่างผู้รับผิดชอบ | `{ "status": "In Progress", "assignedTo": "นายสมชาย ช่างแอร์" }` |

---

## 🗄️ โครงสร้างตารางฐานข้อมูล (Database Schema)

ตาราง `tickets`:

| คอลัมน์ (Column) | ประเภท (Type) | คำอธิบาย |
| :--- | :--- | :--- |
| `id` | VARCHAR(50) PRIMARY KEY | รหัสอ้างอิงงาน เช่น `REQ-1045` |
| `issue` | VARCHAR(255) NOT NULL | หัวข้อปัญหา |
| `description` | TEXT | รายละเอียดเพิ่มเติม |
| `category` | VARCHAR(50) NOT NULL | หมวดหมู่ (Plumbing, Electrical, HVAC ฯลฯ) |
| `location` | VARCHAR(255) NOT NULL | สถานที่เกิดเหตุ (อาคาร, ชั้น, ห้อง) |
| `priority` | VARCHAR(20) | ความเร่งด่วน (Urgent, High, Medium, Low) |
| `status` | VARCHAR(50) | สถานะงาน (Open, Pending, In Progress, Completed) |
| `contact_name` | VARCHAR(100) | ชื่อผู้แจ้ง |
| `contact_phone` | VARCHAR(50) | เบอร์โทรศัพท์ติดต่อ |
| `contact_email` | VARCHAR(100) | อีเมลผู้แจ้ง |
| `assigned_to_name`| VARCHAR(100) | ชื่อช่างหรือเจ้าหน้าที่ผู้รับผิดชอบ |
| `created_at` | TIMESTAMP WITH TIME ZONE | วันที่และเวลาที่บันทึกข้อมูล |
| `updated_at` | TIMESTAMP WITH TIME ZONE | วันที่และเวลาที่แก้ไขล่าสุด |

---

## 🔒 การตั้งค่าสภาพแวดล้อม (.env)

สร้างไฟล์ `.env` ในโฟลเดอร์หลักของโปรเจกต์:
```env
# Database Configuration
DB_USER=admin
DB_HOST=localhost
DB_NAME=university_maintenance
DB_PASSWORD=password123
DB_PORT=5432

# Backend Port
PORT=5000

# Frontend API URL
VITE_API_BASE_URL=http://localhost:5000
```

---

## 👥 ผู้พัฒนา (Author)
- **พัฒนาโดย:** นักศึกษาคณะเทคโนโลยีสารสนเทศ / วิศวกรรมคอมพิวเตอร์
- **ติดต่อ:** anatsapong0310@gmail.com

---

## 📄 ใบอนุญาต (License)
โปรเจกต์นี้เผยแพร่ภายใต้ใบอนุญาต [MIT License](LICENSE)
