# CMU Fix

ระบบจัดการคำร้องแจ้งซ่อมและงานบำรุงรักษาภายในมหาวิทยาลัยเชียงใหม่ พัฒนาด้วย React, TypeScript และ Vite รองรับนักศึกษา เจ้าหน้าที่ และผู้ดูแลระบบ

## ความสามารถหลัก

- เข้าสู่ระบบด้วย Google OAuth หรือ CMU OAuth
- สลับบทบาทระหว่าง Student และ Admin
- สร้างคำร้องแจ้งซ่อม พร้อมรายละเอียด รูปภาพ อาคาร ห้อง และระดับความเร่งด่วน
- ดูรายการคำร้อง กรองตามสถานะ และดูรายละเอียดคำร้อง
- อัปเดตสถานะและเปอร์เซ็นต์ความคืบหน้าของงาน
- จัดสรรช่างประจำอาคาร เพิ่ม แก้ไข แทนที่ และลบข้อมูลช่าง
- แสดง Dashboard สรุปจำนวนคำร้อง อัตราการแก้ไข และสถิติรายเดือน
- ระบบแจ้งเตือนและ Toast notification
- รองรับภาษาไทยและภาษาอังกฤษ
- รองรับการถ่ายภาพจากกล้อง

## เทคโนโลยีที่ใช้

- React 19 และ TypeScript
- Vite และ Tailwind CSS
- React Router
- Firebase Authentication
- CMU OAuth 2.0 และ Google Identity Services
- Recharts, Lucide React และ Motion

## ความต้องการของระบบ

- Node.js 18 ขึ้นไป
- npm
- OAuth credentials หากต้องการทดสอบการเข้าสู่ระบบจริง

## การติดตั้ง

```bash
git clone <repository-url>
cd Fullstack
npm install
```

คัดลอกไฟล์ตัวแปรสภาพแวดล้อม:

```bash
copy .env.example .env
```

บน macOS หรือ Linux ใช้ `cp .env.example .env` จากนั้นแก้ค่าใน `.env` ให้ตรงกับ Firebase, Google OAuth, CMU OAuth และ Backend API

## ตัวแปรสภาพแวดล้อมที่สำคัญ

| ตัวแปร | รายละเอียด |
| --- | --- |
| `VITE_API_BASE_URL` | URL ของ Backend API เช่น `http://localhost:5000` |
| `VITE_CMU_OAUTH_CLIENT_ID` | Client ID สำหรับ CMU OAuth |
| `CMU_OAUTH_CLIENT_SECRET` | Client Secret สำหรับ CMU OAuth |
| `VITE_CMU_OAUTH_REDIRECT_URI` | URL สำหรับรับผลลัพธ์จาก CMU OAuth |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `VITE_FIREBASE_API_KEY` | Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |

ห้าม commit ไฟล์ `.env` หรือเปิดเผยค่า Client Secret ใน repository สาธารณะ

## การใช้งาน

เริ่มโหมดพัฒนา:

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

คำสั่งอื่นที่ใช้บ่อย:

```bash
npm run build    # สร้างไฟล์สำหรับ Production
npm run preview  # เปิดดูไฟล์ Build
npm run lint     # ตรวจสอบ TypeScript
```

## เส้นทางหลักของระบบ

| Path | หน้าที่ |
| --- | --- |
| `/` | หน้าเข้าสู่ระบบ |
| `/dashboard` | Dashboard ภาพรวม |
| `/submit-request` | สร้างคำร้องแจ้งซ่อม |
| `/tickets` | รายการคำร้องทั้งหมด |
| `/ticket/:id` | รายละเอียดคำร้อง |
| `/building-staff` | จัดการช่างและการจัดสรรอาคาร |
| `/settings` | ตั้งค่าบัญชีและระบบ |
| `/cmu-callback` | รับผลลัพธ์จาก CMU OAuth |

## โครงสร้างโครงการ

```text
src/
├── components/       หน้าจอและคอมโพเนนต์ของระบบ
├── components/ui/    คอมโพเนนต์ UI ที่ใช้ซ้ำ เช่น Toast
├── contexts/         Global state และ business logic
├── hooks/            React hooks ที่ใช้ซ้ำ
├── lib/              Firebase, OAuth และ utility functions
├── App.tsx           Provider และ routing หลัก
├── main.tsx          จุดเริ่มต้นของแอปพลิเคชัน
└── index.css         Global styles และ Tailwind CSS
```

## หมายเหตุด้านการพัฒนา

- Vite มี middleware สำหรับรับคำขอ `/api/cmu-oauth/callback` ระหว่างการพัฒนา เพื่อแลก Authorization Code กับ CMU OAuth
- ข้อมูลบางส่วนใช้ Context และ Local Storage เพื่อรองรับการทดสอบบนเครื่องผู้พัฒนา
- ก่อนนำไปใช้งานจริง ควรเชื่อมต่อ Backend, Database และระบบจัดการ Secret ที่ปลอดภัย
- Redirect URI ที่ตั้งในผู้ให้บริการ OAuth ต้องตรงกับ URL ที่ใช้เปิดระบบ

## Build สำหรับ Production

```bash
npm run build
npm run preview
```

ไฟล์ที่สร้างจะอยู่ในโฟลเดอร์ `dist/`
