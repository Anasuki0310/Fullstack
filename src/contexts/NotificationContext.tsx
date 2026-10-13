

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TicketItem } from './TicketContext';


export interface NotificationItem {
  id: string;
  type: 'completed' | 'in_progress' | 'pending' | 'open' | 'assigned' | 'info' | 'line';
  ticketId?: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  unread: boolean;
  reporterName?: string;
  assignedTo?: string;
}


export interface FloatingAlert {
  id: string;
  title: string;
  message: string;
  ticketId?: string;
  type?: 'completed' | 'success' | 'info';
  timestamp: number;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  hasUnread: boolean;
  activeAlert: FloatingAlert | null;
  lineAlertEnabled: boolean;
  setLineAlertEnabled: (enabled: boolean) => void;
  dismissActiveAlert: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (item: {
    type: NotificationItem['type'];
    ticketId?: string;
    title: string;
    message: string;
    reporterName?: string;
    assignedTo?: string;
  }) => void;
  notifyTicketCompleted: (ticket: TicketItem, customMessage?: string) => void;
  notifyTicketStatusChange: (ticket: TicketItem, newStatus: string) => void;
  notifyTechnicianAssigned: (ticket: TicketItem, techName: string) => void;
  playNotificationChime: () => void;
}

const STORAGE_KEY = 'campusfix_notifications_v2';
const LINE_STORAGE_KEY = 'campusfix_line_alerts_enabled';

const defaultNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'in_progress',
    ticketId: 'REQ-1042',
    title: 'คำร้องอยู่ระหว่างดำเนินการซ่อม',
    message: 'ใบแจ้งซ่อม #REQ-1042 กำลังอยู่ระหว่างการซ่อมแซมโดยช่างผู้เชี่ยวชาญ',
    time: '10 นาทีที่แล้ว',
    timestamp: Date.now() - 10 * 60 * 1000,
    unread: true,
  },
  {
    id: 'notif-2',
    type: 'completed',
    ticketId: 'REQ-1038',
    title: 'คำร้องซ่อมเสร็จสิ้นแล้ว (Completed)',
    message: 'ใบแจ้งซ่อม #REQ-1038 (Clogged sink) ได้รับการซ่อมเสร็จสมบูรณ์เรียบร้อยแล้ว',
    time: '2 ชั่วโมงที่แล้ว',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    unread: true,
  },
  {
    id: 'notif-3',
    type: 'info',
    title: 'ประกาศปรับปรุงระบบเครือข่าย',
    message: 'งานบริหารอาคารแจ้งกำหนดการตรวจสอบหม้อแปลงไฟฟ้าคืนนี้ เวลา 23:00 - 02:00 น.',
    time: '1 วันที่แล้ว',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    unread: false,
  },
];


export const playNotificationChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;


    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);


    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.1);
    gain2.gain.setValueAtTime(0.35, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.55);


    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(1108.73, now + 0.2);
    gain3.gain.setValueAtTime(0.2, now + 0.2);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.2);
    osc3.stop(now + 0.7);
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
};


const triggerBrowserNotification = (title: string, body: string) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  try {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  } catch {

  }
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
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
        console.error('Failed to load notifications from localStorage', err);
      }
    }
    return defaultNotifications;
  });

  const [lineAlertEnabled, setLineAlertEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LINE_STORAGE_KEY);
        return saved !== null ? JSON.parse(saved) : true;
      } catch {
        return true;
      }
    }
    return true;
  });

  const [activeAlert, setActiveAlert] = useState<FloatingAlert | null>(null);

  const setLineAlertEnabled = (enabled: boolean) => {
    setLineAlertEnabledState(enabled);
    try {
      localStorage.setItem(LINE_STORAGE_KEY, JSON.stringify(enabled));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (err) {
      console.error('Failed to save notifications to localStorage', err);
    }
  }, [notifications]);


  useEffect(() => {
    if (!activeAlert) return;
    const timer = setTimeout(() => {
      setActiveAlert(null);
    }, 5500);
    return () => clearTimeout(timer);
  }, [activeAlert]);

  const dismissActiveAlert = () => {
    setActiveAlert(null);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const addNotification = (item: {
    type: NotificationItem['type'];
    ticketId?: string;
    title: string;
    message: string;
    reporterName?: string;
    assignedTo?: string;
  }) => {
    const newItem: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: item.type,
      ticketId: item.ticketId,
      title: item.title,
      message: item.message,
      time: 'เมื่อสักครู่ (Just now)',
      timestamp: Date.now(),
      unread: true,
      reporterName: item.reporterName,
      assignedTo: item.assignedTo,
    };

    setNotifications((prev) => [newItem, ...prev]);
  };


  const notifyTicketCompleted = (ticket: TicketItem, customMessage?: string) => {
    const ticketId = ticket.id;
    const issueName = ticket.issue || ticket.description || 'งานซ่อมบำรุง';
    const reporter = ticket.reporterName || 'ผู้แจ้ง';
    const technician = ticket.assignedTo && ticket.assignedTo !== 'Unassigned' ? ticket.assignedTo : 'ทีมช่างวิศวกรรม';

    const title = `🎉 แจ้งเตือน: ซ่อมเสร็จสมบูรณ์แล้ว! #${ticketId}`;
    const message = customMessage || `คำร้อง #${ticketId} (${issueName}) ดำเนินการซ่อมเสร็จสิ้นเรียบร้อยแล้วโดย ${technician}`;


    playNotificationChime();


    addNotification({
      type: 'completed',
      ticketId,
      title: `งานซ่อม #${ticketId} เสร็จสิ้นสมบูรณ์แล้ว`,
      message: `คำร้อง "${issueName}" ดำเนินการซ่อมเสร็จสิ้น (Completed) เรียบร้อยแล้ว - ส่งแจ้งเตือนไปยัง ${reporter} แล้ว`,
      reporterName: reporter,
      assignedTo: technician,
    });


    triggerBrowserNotification(
      `CampusFix: งานซ่อม #${ticketId} เสร็จสิ้นแล้ว`,
      `${issueName} ได้รับการซ่อมเสร็จสมบูรณ์แล้วโดย ${technician}`
    );


    setActiveAlert({
      id: `alert-${Date.now()}`,
      title,
      message: `${message}. ระบบได้ส่งการแจ้งเตือนไปยัง ${reporter} และบันทึกลงในกระดิ่งแจ้งเตือน 🔔 แล้ว`,
      ticketId,
      type: 'completed',
      timestamp: Date.now(),
    });
  };


  const notifyTicketStatusChange = (ticket: TicketItem, newStatus: string) => {
    if (newStatus === 'Completed') {
      notifyTicketCompleted(ticket);
      return;
    }

    const ticketId = ticket.id;
    const issueName = ticket.issue || 'งานซ่อมบำรุง';
    playNotificationChime();

    const title = `อัปเดตสถานะคำร้อง #${ticketId}`;
    const message = `ใบแจ้งซ่อม #${ticketId} (${issueName}) เปลี่ยนสถานะเป็น "${newStatus}"`;

    addNotification({
      type: newStatus === 'In Progress' ? 'in_progress' : newStatus === 'Pending' ? 'pending' : 'open',
      ticketId,
      title,
      message,
    });

    setActiveAlert({
      id: `alert-${Date.now()}`,
      title,
      message,
      ticketId,
      type: 'info',
      timestamp: Date.now(),
    });
  };


  const notifyTechnicianAssigned = (ticket: TicketItem, techName: string) => {
    const ticketId = ticket.id;
    playNotificationChime();

    const title = `มอบหมายช่างแล้ว #${ticketId}`;
    const message = `คำร้อง #${ticketId} ได้รับการมอบหมายให้ช่าง "${techName}" รับผิดชอบ`;

    addNotification({
      type: 'assigned',
      ticketId,
      title,
      message,
      assignedTo: techName,
    });

    setActiveAlert({
      id: `alert-${Date.now()}`,
      title,
      message,
      ticketId,
      type: 'info',
      timestamp: Date.now(),
    });
  };

  const unreadCount = notifications.filter((n) => n.unread).length;
  const hasUnread = unreadCount > 0;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        hasUnread,
        activeAlert,
        lineAlertEnabled,
        setLineAlertEnabled,
        dismissActiveAlert,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        addNotification,
        notifyTicketCompleted,
        notifyTicketStatusChange,
        notifyTechnicianAssigned,
        playNotificationChime,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
