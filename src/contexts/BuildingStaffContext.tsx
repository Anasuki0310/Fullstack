/**
 * @file BuildingStaffContext.tsx
 * @description คอนเท็กซ์จัดการข้อมูลช่างซ่อมบำรุงและการจัดสรรบุคลากรประจำแต่ละอาคาร (Technicians & Building Allocations State)
 * 
 * หน้าที่ของไฟล์นี้:
 * 1. เก็บและจัดการฐานข้อมูลช่างซ่อมบำรุง (Technician Profiles) เช่น ชื่อ, เบอร์โทร, ความเชี่ยวชาญ, สถานะการทำงาน
 * 2. เก็บและจัดการข้อมูลการจัดสรรช่างประจำอาคารต่างๆ ในมหาวิทยาลัย (Lead Tech & Support Techs)
 * 3. มีฟังก์ชันระบบเพิ่มช่างใหม่ (Add Technician) ที่สามารถระบุตัวช่างเดิมเพื่อสลับแทนที่ได้ทันที
 * 4. มีระบบสลับ/แทนที่ช่างอัตโนมัติ 1-Click (Replace Technician) เพื่ออัปเดตทุกอาคารที่ช่างคนเดิมรับผิดชอบ
 * 5. บันทึกและซิงค์ข้อมูลลงใน localStorage อัตโนมัติ เพื่อให้ข้อมูลคงอยู่แม้รีเฟรชหน้าเว็บ
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

/** ข้อมูลโปรไฟล์ของช่างซ่อมบำรุง */
export interface TechnicianProfile {
  id: string;             // รหัสประจำตัวช่าง เช่น 'tech-1'
  name: string;           // ชื่อ-นามสกุล และความเชี่ยวชาญ
  roleTh: string;         // ตำแหน่งหน้าที่ภาษาไทย
  roleEn: string;         // ตำแหน่งหน้าที่ภาษาอังกฤษ
  specialty: string;      // ความเชี่ยวชาญเฉพาะทาง (Electrical, Plumbing, HVAC, Carpentry, AV/IT, Cleaning)
  phone: string;          // เบอร์โทรศัพท์ติดต่อ
  email: string;          // อีเมลติดต่อ
  avatar: string;         // รูปภาพโปรไฟล์
  status: 'active' | 'on_leave' | 'busy'; // สถานะความพร้อมในการปฏิบัติงาน
}

/** ข้อมูลการจัดสรรบุคลากรประจำอาคาร */
export interface BuildingAllocation {
  id: string;             // รหัสอาคาร
  nameEn: string;         // ชื่ออาคารภาษาอังกฤษ
  nameTh: string;         // ชื่ออาคารภาษาไทย
  zone: 'North Campus' | 'Central Campus' | 'South Campus' | 'Engineering Zone'; // โซนที่ตั้ง
  leadTechnician: string; // ชื่อหัวหน้าช่างประจำตึก
  leadTechnicianPhone: string; // เบอร์โทรศัพท์ติดต่อหัวหน้าช่าง
  supportTechnicians: string[]; // รายชื่อช่างสนับสนุนประจำตึก
  notes?: string;         // หมายเหตุหรือระบบพิเศษประจำตึก
  updatedAt: string;      // วันที่อัปเดตข้อมูลล่าสุด
}

/** รูปแบบ Interface สำหรับส่งออกผ่าน Context */
export interface BuildingStaffContextType {
  allocations: BuildingAllocation[]; // รายการการจัดสรรช่างประจำอาคารทั้งหมด
  technicians: TechnicianProfile[];   // รายชื่อช่างซ่อมบำรุงทั้งหมดในระบบ
  /** อัปเดตช่างประจำอาคาร */
  updateAllocation: (buildingId: string, leadTech: string, supportTechs: string[], notes?: string) => void;
  /** เพิ่มช่างคนใหม่ พร้อมตัวเลือกสลับแทนที่ช่างเดิมทันที */
  addTechnician: (tech: Omit<TechnicianProfile, 'id'>, replacesTechName?: string) => TechnicianProfile;
  /** แก้ไขข้อมูลโปรไฟล์ช่าง */
  updateTechnician: (id: string, updates: Partial<TechnicianProfile>) => void;
  /** ลบช่างออกจากระบบ พร้อมโอนย้ายงานให้อีกคน */
  deleteTechnician: (id: string, replacementTechName?: string) => void;
  /** โอนย้าย/แทนที่งานช่างคนเก่าด้วยช่างคนใหม่ทุกอาคาร */
  replaceTechnician: (oldTechName: string, newTechName: string) => void;
  /** ดึงข้อมูลหัวหน้าช่างประจำอาคารจากชื่อตึก */
  getLeadTechForBuilding: (buildingName: string) => TechnicianProfile | undefined;
  /** ดึงข้อมูลช่างสนับสนุนประจำอาคารจากชื่อตึก */
  getSupportTechsForBuilding: (buildingName: string) => TechnicianProfile[];
  /** ค้นหาข้อมูลอาคารจากการค้นหาชื่อตึก */
  getBuildingAllocation: (buildingName: string) => BuildingAllocation | undefined;
  /** รีเซ็ตข้อมูลกลับสู่ค่าเริ่มต้น */
  resetToDefaults: () => void;
}

export const initialTechnicians: TechnicianProfile[] = [
  {
    id: 'tech-1',
    name: 'Kittisak P. (Electrician)',
    roleTh: 'หัวหน้าช่างไฟฟ้าและระบบสื่อสาร',
    roleEn: 'Lead Electrical & Power Tech',
    specialty: 'Electrical',
    phone: '081-456-7890',
    email: 'kittisak.p@cmu.ac.th',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    status: 'active',
  },
  {
    id: 'tech-2',
    name: 'Dave M. (Plumber)',
    roleTh: 'ช่างชำนาญการประปาและสุขาภิบาล',
    roleEn: 'Senior Plumbing & Sanitization Tech',
    specialty: 'Plumbing',
    phone: '082-345-6789',
    email: 'dave.m@cmu.ac.th',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    status: 'active',
  },
  {
    id: 'tech-3',
    name: 'Somchai R. (HVAC)',
    roleTh: 'วิศวกรระบบปรับอากาศและความเย็น',
    roleEn: 'HVAC & Cooling Systems Specialist',
    specialty: 'HVAC',
    phone: '089-876-5432',
    email: 'somchai.r@cmu.ac.th',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    status: 'active',
  },
  {
    id: 'tech-4',
    name: 'Prasert K. (Carpenter)',
    roleTh: 'ช่างไม้ อาคาร และโครงสร้างทั่วไป',
    roleEn: 'Carpentry & Structural Tech',
    specialty: 'Carpentry',
    phone: '086-123-4567',
    email: 'prasert.k@cmu.ac.th',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    status: 'active',
  },
  {
    id: 'tech-5',
    name: 'Anan T. (AV Tech)',
    roleTh: 'ช่างเทคนิคโสตทัศนูปกรณ์และเครือข่าย',
    roleEn: 'Audio/Visual & IT Hardware Tech',
    specialty: 'AV/IT',
    phone: '085-987-6543',
    email: 'anan.t@cmu.ac.th',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    status: 'active',
  },
  {
    id: 'tech-6',
    name: 'Suda W. (Cleaning)',
    roleTh: 'หัวหน้างานแม่บ้านและการจัดภูมิทัศน์',
    roleEn: 'Sanitation & Custodial Supervisor',
    specialty: 'Cleaning',
    phone: '083-222-3344',
    email: 'suda.w@cmu.ac.th',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    status: 'active',
  },
  {
    id: 'tech-7',
    name: 'Somsak W. (General Maintenance)',
    roleTh: 'ช่างซ่อมบำรุงเอนกประสงค์ประจำอาคาร',
    roleEn: 'General Facility Handyman',
    specialty: 'General',
    phone: '084-555-6677',
    email: 'somsak.w@cmu.ac.th',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    status: 'active',
  },
];

export const initialBuildingAllocations: BuildingAllocation[] = [
  {
    id: 'bldg-eng-30',
    nameEn: '30th Anniversary Building (อาคาร 30 ปี)',
    nameTh: 'อาคาร 30 ปี คณะวิศวกรรมศาสตร์',
    zone: 'Engineering Zone',
    leadTechnician: 'Kittisak P. (Electrician)',
    leadTechnicianPhone: '081-456-7890',
    supportTechnicians: ['Somchai R. (HVAC)', 'Somsak W. (General Maintenance)'],
    notes: 'อาคารเรียนรวมและห้องประชุมใหญ่ มีระบบแอร์ชิลเลอร์ส่วนกลาง',
    updatedAt: '2026-09-20',
  },
  {
    id: 'bldg-eng-me',
    nameEn: 'Department of Mechanical Engineering',
    nameTh: 'ภาควิชาวิศวกรรมเครื่องกล',
    zone: 'Engineering Zone',
    leadTechnician: 'Somchai R. (HVAC)',
    leadTechnicianPhone: '089-876-5432',
    supportTechnicians: ['Dave M. (Plumber)', 'Prasert K. (Carpenter)'],
    notes: 'พื้นที่ห้องแล็บปฏิบัติการเครื่องจักรกลและระบบลม',
    updatedAt: '2026-09-18',
  },
  {
    id: 'bldg-eng-ee',
    nameEn: 'Department of Electrical Engineering',
    nameTh: 'ภาควิชาวิศวกรรมไฟฟ้า',
    zone: 'Engineering Zone',
    leadTechnician: 'Kittisak P. (Electrician)',
    leadTechnicianPhone: '081-456-7890',
    supportTechnicians: ['Anan T. (AV Tech)'],
    notes: 'หม้อแปลงไฟฟ้าแรงสูงและห้องเซิร์ฟเวอร์หลัก',
    updatedAt: '2026-09-15',
  },
  {
    id: 'bldg-eng-lib',
    nameEn: 'Engineering Library (ห้องสมุด วิศวฯ)',
    nameTh: 'ห้องสมุดคณะวิศวกรรมศาสตร์',
    zone: 'Engineering Zone',
    leadTechnician: 'Anan T. (AV Tech)',
    leadTechnicianPhone: '085-987-6543',
    supportTechnicians: ['Prasert K. (Carpenter)', 'Somchai R. (HVAC)'],
    notes: 'ระบบคอมพิวเตอร์ค้นคว้า และระบบปรับอากาศแบบเงียบ',
    updatedAt: '2026-09-22',
  },
  {
    id: 'bldg-science',
    nameEn: 'Science Hall',
    nameTh: 'อาคารวิทยาศาสตร์และห้องทดลอง',
    zone: 'North Campus',
    leadTechnician: 'Dave M. (Plumber)',
    leadTechnicianPhone: '082-345-6789',
    supportTechnicians: ['Kittisak P. (Electrician)', 'Somchai R. (HVAC)'],
    notes: 'ท่อน้ำสารเคมี ท่อระบายน้ำทิ้งชั้นใต้ดิน และเครื่องดูดควัน',
    updatedAt: '2026-09-25',
  },
  {
    id: 'bldg-main-lib',
    nameEn: 'Main Library',
    nameTh: 'หอสมุดกลางมหาวิทยาลัย',
    zone: 'Central Campus',
    leadTechnician: 'Prasert K. (Carpenter)',
    leadTechnicianPhone: '086-123-4567',
    supportTechnicians: ['Anan T. (AV Tech)', 'Suda W. (Cleaning)'],
    notes: 'ประตูบานเลื่อนอัตโนมัติ ล็อคเกอร์ และโซนอ่านหนังสือ 24 ชม.',
    updatedAt: '2026-09-10',
  },
  {
    id: 'bldg-dorm-a',
    nameEn: 'Dormitory A',
    nameTh: 'หอพักนักศึกษา อาคาร A',
    zone: 'South Campus',
    leadTechnician: 'Dave M. (Plumber)',
    leadTechnicianPhone: '082-345-6789',
    supportTechnicians: ['Somsak W. (General Maintenance)', 'Kittisak P. (Electrician)'],
    notes: 'ระบบประปาหอพัก ท่อน้ำอุ่น และก๊อกน้ำห้องน้ำรวม',
    updatedAt: '2026-09-12',
  },
  {
    id: 'bldg-dorm-b',
    nameEn: 'Dormitory B',
    nameTh: 'หอพักนักศึกษา อาคาร B',
    zone: 'South Campus',
    leadTechnician: 'Kittisak P. (Electrician)',
    leadTechnicianPhone: '081-456-7890',
    supportTechnicians: ['Prasert K. (Carpenter)', 'Dave M. (Plumber)'],
    notes: 'สัญญาณไฟเตือนอัคคีภัย หลอดไฟทางเดิน และประตูคีย์การ์ด',
    updatedAt: '2026-09-14',
  },
  {
    id: 'bldg-lecture-1',
    nameEn: 'Lecture Hall 1',
    nameTh: 'อาคารเรียนรวม 1 (RB1)',
    zone: 'Central Campus',
    leadTechnician: 'Anan T. (AV Tech)',
    leadTechnicianPhone: '085-987-6543',
    supportTechnicians: ['Somchai R. (HVAC)', 'Somsak W. (General Maintenance)'],
    notes: 'ระบบโปรเจกเตอร์ ไมโครโฟน และระบบเสียงห้องเรียน 500 ที่นั่ง',
    updatedAt: '2026-09-08',
  },
  {
    id: 'bldg-gym',
    nameEn: 'Gymnasium',
    nameTh: 'ศูนย์กีฬาและโรงยิมเนเซียม',
    zone: 'South Campus',
    leadTechnician: 'Somsak W. (General Maintenance)',
    leadTechnicianPhone: '084-555-6677',
    supportTechnicians: ['Kittisak P. (Electrician)', 'Prasert K. (Carpenter)'],
    notes: 'สปอร์ตไลท์สนามบาสเกตบอล พื้นไม้ปาร์เกต์ และห้องอาบน้ำนักกีฬา',
    updatedAt: '2026-09-05',
  },
  {
    id: 'bldg-biz-annex',
    nameEn: 'Business Annex',
    nameTh: 'อาคารคณะบริหารธุรกิจ',
    zone: 'Central Campus',
    leadTechnician: 'Somchai R. (HVAC)',
    leadTechnicianPhone: '089-876-5432',
    supportTechnicians: ['Anan T. (AV Tech)'],
    notes: 'ห้องเรียนอัจฉริยะ Smart Classroom และเครื่องปรับอากาศ VRF',
    updatedAt: '2026-09-01',
  },
];

const STORAGE_KEY = 'campusfix_building_staff_allocations_v1';
const TECHS_STORAGE_KEY = 'campusfix_technicians_list_v2';

const BuildingStaffContext = createContext<BuildingStaffContextType | undefined>(undefined);

export const BuildingStaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allocations, setAllocations] = useState<BuildingAllocation[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err) {
        console.error('Failed to load building allocations from localStorage', err);
      }
    }
    return initialBuildingAllocations;
  });

  const [technicians, setTechnicians] = useState<TechnicianProfile[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(TECHS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err) {
        console.error('Failed to load technicians from localStorage', err);
      }
    }
    return initialTechnicians;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allocations));
    } catch (err) {
      console.error('Failed to save building allocations to localStorage', err);
    }
  }, [allocations]);

  useEffect(() => {
    try {
      localStorage.setItem(TECHS_STORAGE_KEY, JSON.stringify(technicians));
    } catch (err) {
      console.error('Failed to save technicians to localStorage', err);
    }
  }, [technicians]);

  /**
   * ฟังก์ชัน updateAllocation:
   * อัปเดตข้อมูลการจัดสรรช่างประจำอาคารเป้าหมาย
   * - หาเบอร์โทรของหัวหน้าช่างใหม่อัตโนมัติจากฐานข้อมูลช่าง
   * - บันทึกรายชื่อช่างหลัก (Lead Tech) และช่างสนับสนุน (Support Techs)
   * - อัปเดตวันที่แก้ไข (updatedAt) เป็นวันปัจจุบัน
   */
  const updateAllocation = (
    buildingId: string,
    leadTech: string,
    supportTechs: string[],
    notes?: string
  ) => {
    const tech = technicians.find((t) => t.name === leadTech);
    const techPhone = tech?.phone || '081-000-0000';

    setAllocations((prev) =>
      prev.map((b) => {
        if (b.id === buildingId) {
          return {
            ...b,
            leadTechnician: leadTech,
            leadTechnicianPhone: techPhone,
            supportTechnicians: supportTechs,
            notes: notes !== undefined ? notes : b.notes,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return b;
      })
    );
  };

  /**
   * ฟังก์ชัน addTechnician:
   * เพิ่มช่างซ่อมบำรุงคนใหม่เข้าสู่ระบบ
   * - สร้างรหัสประจำตัวอัตโนมัติ (ID จาก timestamp)
   * - เพิ่มโปรไฟล์ช่างใหม่ลงในรายการช่าง
   * - หากมีระบุ `replacesTechName` ระบบจะเรียกใช้ replaceTechnician อัตโนมัติ
   *   เพื่อโอนย้ายงานทุกตึกของช่างคนเก่าให้ช่างคนใหม่ทันที
   */
  const addTechnician = (
    techData: Omit<TechnicianProfile, 'id'>,
    replacesTechName?: string
  ): TechnicianProfile => {
    const newId = `tech-${Date.now()}`;
    const newTech: TechnicianProfile = {
      ...techData,
      id: newId,
    };

    setTechnicians((prev) => [newTech, ...prev]);

    // หากช่างใหม่มาแทนที่ช่างเดิม ทำการโอนย้ายความรับผิดชอบทุกตึกทันที
    if (replacesTechName && replacesTechName.trim()) {
      replaceTechnician(replacesTechName.trim(), newTech.name);
    }

    return newTech;
  };

  /**
   * ฟังก์ชัน replaceTechnician:
   * โอนย้ายความรับผิดชอบและสลับตัวช่างแบบ 1-Click
   * - ค้นหาเบอร์โทรของช่างคนใหม่
   * - วนลูปตรวจสอบทุกอาคาร: หากอาคารใดมีช่างคนเก่าเป็นหัวหน้าช่าง ให้เปลี่ยนเป็นช่างใหม่พร้อมอัปเดตเบอร์โทร
   * - หากอาคารใดมีช่างคนเก่าเป็นช่างสนับสนุน ให้เปลี่ยนชื่อในลิสต์สนับสนุนเป็นช่างใหม่
   */
  const replaceTechnician = (oldTechName: string, newTechName: string) => {
    const newTechProfile = technicians.find((t) => t.name === newTechName);
    const phone = newTechProfile?.phone || '081-000-0000';

    setAllocations((prev) =>
      prev.map((b) => {
        let updatedLead = b.leadTechnician;
        let updatedPhone = b.leadTechnicianPhone;
        let updatedSupports = [...b.supportTechnicians];

        if (b.leadTechnician === oldTechName) {
          updatedLead = newTechName;
          updatedPhone = phone;
        }

        if (b.supportTechnicians.includes(oldTechName)) {
          updatedSupports = b.supportTechnicians.map((t) => (t === oldTechName ? newTechName : t));
        }

        return {
          ...b,
          leadTechnician: updatedLead,
          leadTechnicianPhone: updatedPhone,
          supportTechnicians: updatedSupports,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  /**
   * ฟังก์ชัน updateTechnician:
   * แก้ไขข้อมูลช่าง (เช่น ชื่อ, เบอร์โทร, ความเชี่ยวชาญ, สถานะ)
   * - หากมีการแก้ไขชื่อหรือเบอร์โทร จะอัปเดตข้อมูลในอาคารที่ช่างคนนี้สังกัดอยู่ด้วยโดยอัตโนมัติ
   */
  const updateTechnician = (id: string, updates: Partial<TechnicianProfile>) => {
    setTechnicians((prev) => {
      const oldTech = prev.find((t) => t.id === id);
      const updatedList = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));

      // หากเปลี่ยนชื่อช่าง ให้ไปอัปเดตชื่อในรายการอาคารด้วย
      if (oldTech && updates.name && updates.name !== oldTech.name) {
        replaceTechnician(oldTech.name, updates.name);
      } else if (oldTech && updates.phone && updates.phone !== oldTech.phone) {
        setAllocations((allocs) =>
          allocs.map((b) => (b.leadTechnician === oldTech.name ? { ...b, leadTechnicianPhone: updates.phone! } : b))
        );
      }

      return updatedList;
    });
  };

  /**
   * ฟังก์ชัน deleteTechnician:
   * ลบช่างออกจากระบบ
   * - หากระบุ `replacementTechName` ระบบจะโอนย้ายตึกทั้งหมดให้ช่างคนดังกล่าว
   * - หากไม่ได้ระบุ ระบบจะปรับสถานะหัวหน้าช่างของตึกนั้นเป็น 'Unassigned' และถอนชื่อออกจากช่างสนับสนุน
   */
  const deleteTechnician = (id: string, replacementTechName?: string) => {
    const techToDelete = technicians.find((t) => t.id === id);
    if (!techToDelete) return;

    if (replacementTechName && replacementTechName.trim()) {
      replaceTechnician(techToDelete.name, replacementTechName.trim());
    } else {
      // หากไม่มีคนมาแทน ให้เคลียร์เป็น Unassigned
      setAllocations((prev) =>
        prev.map((b) => {
          if (b.leadTechnician === techToDelete.name) {
            return {
              ...b,
              leadTechnician: 'Unassigned',
              leadTechnicianPhone: '-',
            };
          }
          if (b.supportTechnicians.includes(techToDelete.name)) {
            return {
              ...b,
              supportTechnicians: b.supportTechnicians.filter((t) => t !== techToDelete.name),
            };
          }
          return b;
        })
      );
    }

    setTechnicians((prev) => prev.filter((t) => t.id !== id));
  };

  /**
   * ฟังก์ชัน getBuildingAllocation:
   * ค้นหาข้อมูลการจัดสรรอาคารจากชื่อตึก รองรับทั้งชื่อภาษาไทยและภาษาอังกฤษ
   */
  const getBuildingAllocation = (buildingName: string): BuildingAllocation | undefined => {
    if (!buildingName) return undefined;
    const clean = buildingName.toLowerCase().trim();
    return allocations.find(
      (b) =>
        b.nameEn.toLowerCase().includes(clean) ||
        clean.includes(b.nameEn.toLowerCase()) ||
        b.nameTh.toLowerCase().includes(clean) ||
        clean.includes(b.nameTh.toLowerCase())
    );
  };

  /**
   * ฟังก์ชัน getLeadTechForBuilding:
   * ค้นหาโปรไฟล์ของหัวหน้าช่างประจำอาคารจากชื่อตึก
   */
  const getLeadTechForBuilding = (buildingName: string): TechnicianProfile | undefined => {
    const alloc = getBuildingAllocation(buildingName);
    if (!alloc) return undefined;
    return technicians.find((t) => t.name === alloc.leadTechnician);
  };

  /**
   * ฟังก์ชัน getSupportTechsForBuilding:
   * ดึงรายการโปรไฟล์ช่างสนับสนุนทั้งหมดประจำอาคารนั้นๆ
   */
  const getSupportTechsForBuilding = (buildingName: string): TechnicianProfile[] => {
    const alloc = getBuildingAllocation(buildingName);
    if (!alloc) return [];
    return technicians.filter((t) => alloc.supportTechnicians.includes(t.name));
  };

  /**
   * ฟังก์ชัน resetToDefaults:
   * รีเซ็ตข้อมูลการจัดสรรและรายชื่อช่างทั้งหมดกลับเป็นค่าเริ่มต้น และล้าง localStorage
   */
  const resetToDefaults = () => {
    setAllocations(initialBuildingAllocations);
    setTechnicians(initialTechnicians);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TECHS_STORAGE_KEY);
    } catch {}
  };

  return (
    <BuildingStaffContext.Provider
      value={{
        allocations,
        technicians,
        updateAllocation,
        addTechnician,
        updateTechnician,
        deleteTechnician,
        replaceTechnician,
        getLeadTechForBuilding,
        getSupportTechsForBuilding,
        getBuildingAllocation,
        resetToDefaults,
      }}
    >
      {children}
    </BuildingStaffContext.Provider>
  );
};

export const useBuildingStaff = (): BuildingStaffContextType => {
  const context = useContext(BuildingStaffContext);
  if (!context) {
    throw new Error('useBuildingStaff must be used within a BuildingStaffProvider');
  }
  return context;
};
