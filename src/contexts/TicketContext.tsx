/**
 * @file TicketContext.tsx
 * @description คอนเท็กซ์จัดการข้อมูลใบแจ้งซ่อมบำรุงส่วนกลาง (Central Maintenance Tickets State)
 * 
 * หน้าที่ของไฟล์นี้:
 * 1. จัดเก็บรายการใบแจ้งซ่อมทั้งหมดในระบบ (TicketItem[]) พร้อมข้อมูลหมวดหมู่, สถานที่, วันที่, สถานะ, ความเร่งด่วน, ช่างที่ได้รับมอบหมาย
 * 2. จัดเตรียมฟังก์ชันสร้างใบแจ้งซ่อมใหม่ (addTicket)
 * 3. จัดเตรียมฟังก์ชันอัปเดตใบแจ้งซ่อม (updateTicket) เช่น อัปเดตสถานะ, มอบหมายช่าง, เปอร์เซ็นต์ความคืบหน้า (Progress 0-100%)
 * 4. จัดเตรียมฟังก์ชันลบใบแจ้งซ่อม (deleteTicket)
 * 5. จัดเตรียมฟังก์ชันค้นหาใบแจ้งซ่อมตาม ID (getTicketById)
 * 6. บันทึกและซิงค์ข้อมูลลงใน localStorage อัตโนมัติ พร้อมส่งต่อไปยัง Backend API (ถ้ามีรันอยู่)
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

/** โครงสร้างข้อมูลใบแจ้งซ่อมบำรุง */
export interface TicketItem {
  id: string;               // รหัสใบแจ้งซ่อม เช่น 'REQ-1045'
  issue: string;            // หัวข้อปัญหาหรือสรุปความต้องการ
  category: string;         // หมวดหมู่งานซ่อม (Plumbing, Electrical, HVAC, Carpentry, Cleaning, General ฯลฯ)
  location: string;         // สถานที่สรุป (ตึก, ชั้น, ห้อง)
  building?: string;        // ชื่ออาคาร
  floor?: string;           // ชั้น
  room?: string;            // เลขห้อง
  description?: string;     // รายละเอียดปัญหาเพิ่มเติม
  date: string;             // วันที่แบบฟอร์แมตแสดงผล เช่น 'Oct 25, 2026'
  submittedDate: string;    // วันที่ส่งคำร้อง
  createdAt: number;        // Timestamp ของเวลาที่สร้าง (ใช้เรียงลำดับใหม่สุดขึ้นก่อน)
  status: 'Open' | 'Pending' | 'In Progress' | 'Completed'; // สถานะงาน
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';          // ระดับความเร่งด่วน
  progress?: number;        // ความคืบหน้าการทำงาน (0 ถึง 100%)
  reporterId: string;       // รหัสผู้แจ้ง
  reporterName: string;     // ชื่อผู้แจ้ง
  assignedTo: string;       // ชื่อช่างผู้รับผิดชอบงาน
  photos?: string[];        // ลิงก์หรือ base64 รูปภาพประกอบ
  contactName?: string;     // ชื่อผู้ติดต่อ
  contactPhone?: string;    // เบอร์โทรผู้ติดต่อ
  contactEmail?: string;    // อีเมลผู้ติดต่อ
}

/** โครงสร้างข้อมูลฟอร์มส่งคำร้องแจ้งซ่อมใหม่ */
export interface NewTicketInput {
  building: string;
  floor: string;
  room: string;
  category: string;
  description: string;
  priority?: 'Urgent' | 'High' | 'Medium' | 'Low';
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  photos?: string[];
}

/** Interface สำหรับ TicketContext */
export interface TicketContextType {
  tickets: TicketItem[];    // รายการใบแจ้งซ่อมทั้งหมด (เรียงลำดับใหม่สุดขึ้นก่อน)
  addTicket: (input: NewTicketInput) => TicketItem; // สร้างใบแจ้งซ่อมใหม่
  updateTicket: (id: string, updates: Partial<TicketItem>) => void; // อัปเดตข้อมูลตั๋ว
  deleteTicket: (id: string) => void; // ลบใบแจ้งซ่อม
  getTicketById: (id: string) => TicketItem | undefined; // ค้นหาตั๋วตาม ID
}

export const categoryDisplayMap: Record<string, string> = {
  hvac: 'HVAC',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  furniture: 'Furniture',
  carpentry: 'Carpentry',
  cleaning: 'Cleaning',
  'av/it': 'AV/IT',
  other: 'General',
  general: 'General',
};

export const initialTicketsData: TicketItem[] = [
  { 
    id: 'REQ-1045', 
    issue: 'Main water pipe leak in basement', 
    category: 'Plumbing', 
    location: 'Science Hall B1', 
    building: 'Science Hall', 
    floor: 'B1', 
    room: 'Basement', 
    date: 'Oct 25, 2026', 
    submittedDate: '10/25/2026', 
    createdAt: 1792886400000, 
    status: 'Open', 
    priority: 'Urgent', 
    progress: 15,
    reporterId: 'student-me', 
    reporterName: 'Supakorn (You)', 
    assignedTo: 'Dave M. (Plumber)' 
  },
  { 
    id: 'REQ-1044', 
    issue: 'Power surge in computer laboratory', 
    category: 'Electrical', 
    location: 'Engineering Bldg, Rm 204', 
    building: 'Engineering Bldg', 
    floor: '2', 
    room: '204', 
    date: 'Oct 25, 2026', 
    submittedDate: '10/25/2026', 
    createdAt: 1792886300000, 
    status: 'Open', 
    priority: 'Urgent', 
    progress: 10,
    reporterId: 'other-1', 
    reporterName: 'Dr. Jane Smith', 
    assignedTo: 'Kittisak P. (Electrician)' 
  },
  { 
    id: 'REQ-1043', 
    issue: 'Broken window in lecture hall', 
    category: 'General', 
    location: 'Lecture Hall 1', 
    building: 'Lecture Hall 1', 
    floor: '1', 
    room: '101', 
    date: 'Oct 24, 2026', 
    submittedDate: '10/24/2026', 
    createdAt: 1792800000000, 
    status: 'Open', 
    priority: 'High', 
    progress: 10,
    reporterId: 'other-2', 
    reporterName: 'Facilities Staff', 
    assignedTo: 'Unassigned' 
  },
  { 
    id: 'REQ-1042', 
    issue: 'Leaking AC unit', 
    category: 'HVAC', 
    location: 'Engineering Bldg, Room 302', 
    building: 'Engineering Bldg', 
    floor: '3', 
    room: '302', 
    date: 'Oct 24, 2026', 
    submittedDate: '10/24/2026', 
    createdAt: 1792799900000, 
    status: 'Pending', 
    priority: 'High', 
    progress: 25,
    reporterId: 'student-me', 
    reporterName: 'Supakorn (You)', 
    assignedTo: 'Somchai R. (HVAC)' 
  },
  { 
    id: 'REQ-1041', 
    issue: 'Projector mount broken', 
    category: 'AV/IT', 
    location: 'Business Annex 101', 
    building: 'Business Annex', 
    floor: '1', 
    room: '101', 
    date: 'Oct 23, 2026', 
    submittedDate: '10/23/2026', 
    createdAt: 1792713600000, 
    status: 'In Progress', 
    priority: 'Medium', 
    progress: 60,
    reporterId: 'other-3', 
    reporterName: 'Prof. Anderson', 
    assignedTo: 'Anan T. (AV Tech)' 
  },
  { 
    id: 'REQ-1039', 
    issue: 'Fire alarm beeping intermittently', 
    category: 'Electrical', 
    location: 'Dormitory B, 3rd Fl', 
    building: 'Dormitory B', 
    floor: '3', 
    room: 'Corridor', 
    date: 'Oct 23, 2026', 
    submittedDate: '10/23/2026', 
    createdAt: 1792713500000, 
    status: 'Pending', 
    priority: 'Urgent', 
    progress: 30,
    reporterId: 'other-4', 
    reporterName: 'Resident Advisor', 
    assignedTo: 'Kittisak P. (Electrician)' 
  },
  { 
    id: 'REQ-1038', 
    issue: 'Clogged sink', 
    category: 'Plumbing', 
    location: 'Dormitory A, Rm 412', 
    building: 'Dormitory A', 
    floor: '4', 
    room: '412', 
    date: 'Oct 22, 2026', 
    submittedDate: '10/22/2026', 
    createdAt: 1792627200000, 
    status: 'Completed', 
    priority: 'Low', 
    progress: 100,
    reporterId: 'student-me', 
    reporterName: 'Supakorn (You)', 
    assignedTo: 'Dave M. (Plumber)' 
  },
  { 
    id: 'REQ-1035', 
    issue: 'Squeaky door hinge', 
    category: 'Carpentry', 
    location: 'Library Main Entrance', 
    building: 'Library Main', 
    floor: '1', 
    room: 'Entrance', 
    date: 'Oct 20, 2026', 
    submittedDate: '10/20/2026', 
    createdAt: 1792454400000, 
    status: 'In Progress', 
    priority: 'Low', 
    progress: 75,
    reporterId: 'student-me', 
    reporterName: 'Supakorn (You)', 
    assignedTo: 'Prasert K. (Carpenter)' 
  },
  { 
    id: 'REQ-1031', 
    issue: 'Flickering lights', 
    category: 'Electrical', 
    location: 'Gymnasium', 
    building: 'Gymnasium', 
    floor: '1', 
    room: 'Main Court', 
    date: 'Oct 19, 2026', 
    submittedDate: '10/19/2026', 
    createdAt: 1792368000000, 
    status: 'In Progress', 
    priority: 'Urgent', 
    progress: 50,
    reporterId: 'other-5', 
    reporterName: 'Coach Mike', 
    assignedTo: 'Kittisak P. (Electrician)' 
  },
  { 
    id: 'REQ-1029', 
    issue: 'Broken window latch', 
    category: 'General', 
    location: 'Science Hall 204', 
    building: 'Science Hall', 
    floor: '2', 
    room: '204', 
    date: 'Oct 18, 2026', 
    submittedDate: '10/18/2026', 
    createdAt: 1792281600000, 
    status: 'Completed', 
    priority: 'Medium', 
    progress: 100,
    reporterId: 'other-6', 
    reporterName: 'Lab Assistant', 
    assignedTo: 'Prasert K. (Carpenter)' 
  },
  { 
    id: 'REQ-1027', 
    issue: 'Thermostat malfunction', 
    category: 'HVAC', 
    location: 'Faculty Lounge', 
    building: 'Faculty Lounge', 
    floor: '1', 
    room: 'Lounge', 
    date: 'Oct 17, 2026', 
    submittedDate: '10/17/2026', 
    createdAt: 1792195200000, 
    status: 'Pending', 
    priority: 'Medium', 
    progress: 30,
    reporterId: 'other-7', 
    reporterName: 'Faculty Secretary', 
    assignedTo: 'Somchai R. (HVAC)' 
  },
  { 
    id: 'REQ-1024', 
    issue: 'Restroom door lock jammed', 
    category: 'Carpentry', 
    location: 'Main Library 2F', 
    building: 'Main Library', 
    floor: '2', 
    room: 'Restroom', 
    date: 'Oct 16, 2026', 
    submittedDate: '10/16/2026', 
    createdAt: 1792108800000, 
    status: 'Open', 
    priority: 'High', 
    progress: 10,
    reporterId: 'other-8', 
    reporterName: 'Library Staff', 
    assignedTo: 'Unassigned' 
  },
];

const STORAGE_KEY = 'university_maintenance_tickets';

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<TicketItem[]>(() => {
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
        console.error('Failed to load tickets from localStorage', err);
      }
    }
    return initialTicketsData;
  });

  const API_URL = ((import.meta as any).env?.VITE_API_BASE_URL as string) || 'http://localhost:5000';

  // Load from Backend API only if no local storage data exists
  useEffect(() => {
    let isMounted = true;
    const hasLocal = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY);
    if (hasLocal) return;

    const loadFromApi = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tickets`, {
          signal: AbortSignal.timeout(1000),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && isMounted) {
            setTickets(data);
          }
        }
      } catch {
        // Backend not running, silently use localStorage
      }
    };
    loadFromApi();
    return () => { isMounted = false; };
  }, [API_URL]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    } catch (err) {
      console.error('Failed to save tickets to localStorage', err);
    }
  }, [tickets]);

  /**
   * ฟังก์ชัน addTicket:
   * สร้างใบแจ้งซ่อมใหม่จากข้อมูลฟอร์มที่ส่งเข้ามา
   * - สร้างรหัสอัตโนมัติ (เช่น REQ-1046) โดยหาเลขสูงสุดที่มีอยู่แล้วบวก 1
   * - บันทึกวันเวลาที่ส่ง (submittedDate, createdAt)
   * - กำหนดสถานะเริ่มต้นเป็น 'Pending' (รอดำเนินการ)
   * - กำหนด Progress เริ่มต้นเป็น 25%
   * - มอบหมายช่างเริ่มต้นเป็น 'Unassigned'
   * - เพิ่มตั๋วใหม่ขึ้นบนสุดของ State และซิงค์ลง localStorage
   */
  const addTicket = (input: NewTicketInput): TicketItem => {
    // Generate next sequential Ticket ID
    let nextNum = 1046;
    try {
      const existingNums = tickets
        .map((t) => {
          const m = t.id.match(/\d+/);
          return m ? parseInt(m[0], 10) : 0;
        })
        .filter((n) => !isNaN(n) && n > 0);
      if (existingNums.length > 0) {
        nextNum = Math.max(...existingNums) + 1;
      }
    } catch {
      nextNum = 1046;
    }

    const id = `REQ-${nextNum}`;
    const now = new Date();
    const submittedDate = now.toLocaleDateString();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const categoryKey = input.category.toLowerCase().trim();
    const categoryDisplay = categoryDisplayMap[categoryKey] || input.category;
    
    // Construct location string
    const locationParts: string[] = [];
    if (input.building) locationParts.push(input.building);
    if (input.floor) locationParts.push(`Fl ${input.floor}`);
    if (input.room) locationParts.push(`Rm ${input.room}`);
    const location = locationParts.length > 0 ? locationParts.join(', ') : 'Campus Building';

    // Derive concise issue title from description
    const issue = input.description ? input.description.trim() : 'Maintenance Request';

    const newTicket: TicketItem = {
      id,
      issue,
      category: categoryDisplay,
      location,
      building: input.building,
      floor: input.floor,
      room: input.room,
      description: input.description,
      submittedDate,
      date: formattedDate,
      createdAt: now.getTime(),
      status: 'Pending', // Default status as requested
      priority: input.priority || 'Medium',
      progress: 25, // Default progress for newly pending ticket
      reporterId: 'student-me',
      reporterName: input.contactName || 'Supakorn (You)',
      assignedTo: 'Unassigned',
      photos: input.photos || [],
      contactName: input.contactName || 'Supakorn Suksomboon',
      contactPhone: input.contactPhone || '081-234-5678',
      contactEmail: input.contactEmail || 'supakorn@cmu.ac.th',
    };

    setTickets((prev) => [newTicket, ...prev]);

    // Async sync to Backend API if server is running
    fetch(`${API_URL}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTicket),
    }).catch(() => {
      // Backend not running, already saved in state & localStorage
    });

    return newTicket;
  };

  /**
   * ฟังก์ชัน updateTicket:
   * อัปเดตข้อมูลตั๋วแจ้งซ่อม เช่น เปลี่ยนสถานะ, มอบหมายช่าง, เปลี่ยนระดับความสำคัญ หรือปรับ Progress
   * - ซิงค์สถานะกับ Progress อัตโนมัติ: ถ้า progress = 100% จะตั้งสถานะเป็น 'Completed' ให้ทันที
   * - บันทึกลง localStorage และส่งต่อไปยัง Backend API
   */
  const updateTicket = (id: string, updates: Partial<TicketItem>) => {
    if (!id) return;
    const cleanId = id.replace('#', '').trim().toLowerCase();

    // Smart sync between progress and status if needed
    const finalUpdates: Partial<TicketItem> = { ...updates };
    if (finalUpdates.progress !== undefined) {
      if (finalUpdates.progress === 100 && !finalUpdates.status) {
        finalUpdates.status = 'Completed';
      } else if (finalUpdates.progress < 100 && finalUpdates.progress > 0 && finalUpdates.status === undefined) {
        // If not completed, make sure it's at least in progress
        const target = tickets.find((t) => t.id.toLowerCase() === cleanId || t.id.replace('#', '').toLowerCase() === cleanId);
        if (target && target.status === 'Completed') {
          finalUpdates.status = 'In Progress';
        }
      }
    }
    if (finalUpdates.status === 'Completed' && finalUpdates.progress === undefined) {
      finalUpdates.progress = 100;
    }

    setTickets((prev) => {
      const updated = prev.map((t) => {
        const matches = t.id.toLowerCase() === cleanId || t.id.replace('#', '').toLowerCase() === cleanId;
        return matches ? { ...t, ...finalUpdates } : t;
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save tickets to localStorage', err);
      }
      return updated;
    });

    // Best-effort sync to Backend API if server is running
    if (API_URL) {
      fetch(`${API_URL}/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalUpdates),
      }).catch(() => {
        // Backend not running, already updated locally
      });
    }
  };

  /**
   * ฟังก์ชัน deleteTicket:
   * ลบใบแจ้งซ่อมออกจากระบบตาม ID
   * - ลบออกจาก State ทันทีและอัปเดตลงใน localStorage
   */
  const deleteTicket = (id: string) => {
    if (!id) return;
    const cleanId = id.replace('#', '').trim().toLowerCase();
    setTickets((prev) => {
      const filtered = prev.filter((t) => !(t.id.toLowerCase() === cleanId || t.id.replace('#', '').toLowerCase() === cleanId));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      } catch (err) {
        console.error('Failed to save tickets to localStorage', err);
      }
      return filtered;
    });

    // Best-effort sync to Backend API if server is running
    if (API_URL) {
      fetch(`${API_URL}/api/tickets/${id}`, {
        method: 'DELETE',
      }).catch(() => {
        // Backend not running, already deleted locally
      });
    }
  };

  /**
   * ฟังก์ชัน getTicketById:
   * ค้นหาใบแจ้งซ่อมจาก ID (รองรับทั้งแบบมี '#' หรือไม่มี '#')
   */
  const getTicketById = (id: string) => {
    if (!id) return undefined;
    const cleanId = id.replace('#', '').trim().toLowerCase();
    return tickets.find((t) => t.id.toLowerCase() === cleanId || t.id.replace('#', '').toLowerCase() === cleanId);
  };

  /**
   * sortedTickets (useMemo):
   * เรียงลำดับตั๋วทั้งหมดให้ใบแจ้งซ่อมที่สร้างใหม่ที่สุดขึ้นมาแสดงด้านบนสุดเสมอ
   */
  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => {
      const timeA = a.createdAt || (a.submittedDate ? new Date(a.submittedDate).getTime() : 0) || 0;
      const timeB = b.createdAt || (b.submittedDate ? new Date(b.submittedDate).getTime() : 0) || 0;
      return timeB - timeA;
    });
  }, [tickets]);

  return (
    <TicketContext.Provider
      value={{
        tickets: sortedTickets,
        addTicket,
        updateTicket,
        deleteTicket,
        getTicketById,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = (): TicketContextType => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};
