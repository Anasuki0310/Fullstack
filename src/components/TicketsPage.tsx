/**
 * @file TicketsPage.tsx
 * @description หน้ารายการใบแจ้งซ่อมบำรุงทั้งหมด (Maintenance Tickets Management List)
 * 
 * หน้าที่ของไฟล์นี้:
 * 1. แสดงตารางรายการแจ้งซ่อมทั้งหมด ทั้งในมุมมองแอดมิน (All Tickets) และมุมมองนิสิต (My Tickets / Campus Tickets)
 * 2. ระบบกรองสถานะแบบแท็บ (Status Filter Tabs):
 *    - ทั้งหมด (All), รอดำเนินการ (Pending), กำลังซ่อม (In Progress), เสร็จสิ้น (Completed)
 *    - ซิงค์ค่าตัวกรองกับ URL Search Params (`?status=pending`) อัตโนมัติ
 * 3. ระบบจัดการงานของแอดมินโดยตรงจากตาราง (Inline Admin Actions):
 *    - ปรับเปอร์เซ็นต์ความคืบหน้า (Progress Bar Slider 0-100%) พร้อมบันทึกทันที
 *    - เปลี่ยนสถานะงาน (Status Dropdown) พร้อมส่งเสียงและป็อปอัปแจ้งเตือน
 *    - มอบหมายช่าง (Assign Technician Dropdown)
 *    - ลบใบแจ้งซ่อม (Delete Ticket Modal พร้อมยืนยัน)
 * 4. นำทางเข้าสู่หน้ารายละเอียดเมื่อคลิกรายการตั๋ว (`/ticket/:id`)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { useRole } from '../contexts/RoleContext';
import { useTickets, TicketItem } from '../contexts/TicketContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useBuildingStaff } from '../contexts/BuildingStaffContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  ChevronRight, 
  User, 
  ListFilter, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Bell, 
  Trash2, 
  AlertTriangle, 
  Building2, 
  Sliders, 
  Users 
} from 'lucide-react';

export default function TicketsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();
  const { role } = useRole();
  const { toast } = useToast();
  const { tickets, updateTicket, deleteTicket } = useTickets();
  const { notifyTicketCompleted, notifyTicketStatusChange } = useNotifications();
  const { technicians } = useBuildingStaff();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [studentViewScope, setStudentViewScope] = useState<'my' | 'all'>('my');

  // Modal State for Ticket Deletion
  const [ticketToDelete, setTicketToDelete] = useState<TicketItem | null>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTicketToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Synchronize state with URL search parameters on mount or when params change
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setStatusFilter(statusParam.toLowerCase());
    } else {
      setStatusFilter('all');
    }
  }, [searchParams]);

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    const params = new URLSearchParams(searchParams);
    if (newStatus === 'all') {
      params.delete('status');
    } else {
      params.set('status', newStatus);
    }
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setSearchParams(new URLSearchParams());
  };

  const baseTickets = useMemo(() => {
    if (role === 'student') {
      return studentViewScope === 'my'
        ? tickets.filter(t => t.reporterId === 'student-me')
        : tickets;
    }
    return tickets;
  }, [role, studentViewScope, tickets]);

  const statusCounts = useMemo(() => {
    const counts = {
      all: baseTickets.length,
      pending: 0,
      in_progress: 0,
      completed: 0,
      open: 0,
    };

    baseTickets.forEach(ticket => {
      const s = ticket.status.toLowerCase();
      if (s === 'open') counts.open += 1;
      else if (s === 'pending') counts.pending += 1;
      else if (s === 'in progress') counts.in_progress += 1;
      else if (s === 'completed') counts.completed += 1;
    });

    return counts;
  }, [baseTickets]);

  const statusCategories = useMemo(() => [
    {
      id: 'all',
      labelEn: 'All Tickets',
      labelTh: 'ทั้งหมด',
      count: statusCounts.all,
      icon: ListFilter,
      activeClass: 'bg-[#0A3D91] text-white border-[#0A3D91] shadow-sm',
      inactiveClass: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300',
      dotColor: 'bg-slate-400',
      activeDotColor: 'bg-white',
    },
    {
      id: 'pending',
      labelEn: 'Pending',
      labelTh: 'รอดำเนินการ',
      count: statusCounts.pending,
      icon: Clock,
      activeClass: 'bg-amber-600 text-white border-amber-700 shadow-sm',
      inactiveClass: 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50/60 hover:border-amber-300',
      dotColor: 'bg-amber-500',
      activeDotColor: 'bg-white',
    },
    {
      id: 'in_progress',
      labelEn: 'In Progress',
      labelTh: 'กำลังดำเนินการ',
      count: statusCounts.in_progress,
      icon: Wrench,
      activeClass: 'bg-blue-600 text-white border-blue-700 shadow-sm',
      inactiveClass: 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50/60 hover:border-blue-300',
      dotColor: 'bg-blue-500',
      activeDotColor: 'bg-white',
    },
    {
      id: 'completed',
      labelEn: 'Completed',
      labelTh: 'ซ่อมเสร็จสิ้น',
      count: statusCounts.completed,
      icon: CheckCircle2,
      activeClass: 'bg-emerald-600 text-white border-emerald-700 shadow-sm',
      inactiveClass: 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/60 hover:border-emerald-300',
      dotColor: 'bg-emerald-500',
      activeDotColor: 'bg-white',
    },
    {
      id: 'open',
      labelEn: 'Open',
      labelTh: 'เปิดใหม่',
      count: statusCounts.open,
      icon: AlertCircle,
      activeClass: 'bg-sky-600 text-white border-sky-700 shadow-sm',
      inactiveClass: 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50/60 hover:border-sky-300',
      dotColor: 'bg-sky-500',
      activeDotColor: 'bg-white',
    }
  ], [statusCounts]);

  const filteredTickets = useMemo(() => {
    // Sort so the newest is at the top
    const sorted = [...baseTickets].sort((a, b) => {
      const timeA = a.createdAt || (a.submittedDate ? new Date(a.submittedDate).getTime() : 0) || (a.date ? new Date(a.date).getTime() : 0) || 0;
      const timeB = b.createdAt || (b.submittedDate ? new Date(b.submittedDate).getTime() : 0) || (b.date ? new Date(b.date).getTime() : 0) || 0;
      return timeB - timeA;
    });

    return sorted.filter(ticket => {
      // Status filter
      if (statusFilter !== 'all') {
        const s = ticket.status.toLowerCase();
        if (statusFilter === 'open' && s !== 'open') return false;
        if (statusFilter === 'pending' && s !== 'pending') return false;
        if ((statusFilter === 'in_progress' || statusFilter === 'inprogress') && s !== 'in progress') return false;
        if ((statusFilter === 'completed' || statusFilter === 'resolved') && s !== 'completed') return false;
      }
      return true;
    });
  }, [baseTickets, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'High':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Confirm delete ticket handler
  const handleConfirmDelete = () => {
    if (!ticketToDelete) return;
    deleteTicket(ticketToDelete.id);
    toast({
      title: language === 'th' ? 'ลบคำร้องสำเร็จ' : 'Ticket Deleted',
      description: language === 'th' 
        ? `ลบคำร้อง #${ticketToDelete.id} ออกจากระบบเรียบร้อยแล้ว`
        : `Ticket #${ticketToDelete.id} has been permanently deleted.`,
    });
    setTicketToDelete(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {role === 'admin'
                  ? (language === 'th' ? 'รายการแจ้งซ่อมทั้งหมด' : 'All Maintenance Requests')
                  : (language === 'th' ? 'รายการแจ้งซ่อมของฉัน' : 'My Maintenance Requests')}
              </h2>
              {role === 'student' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0A3D91] border border-blue-200">
                  {language === 'th' ? 'นักศึกษา' : 'Student'}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {role === 'admin'
                ? (language === 'th' ? 'ผู้ดูแลระบบสามารถปรับปรุงโปรเกรส มอบหมายช่าง และจัดการคำร้องได้โดยตรง' : 'Full Admin Controls: Edit progress, dispatch technicians, or delete records.')
                : (language === 'th' ? 'ติดตามสถานะคำขอแจ้งซ่อมและประวัติการซ่อมบำรุง' : 'Track and manage your submitted facilities maintenance requests.')}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Admin: Staff Allocation quick link */}
            {role === 'admin' && (
              <Link 
                to="/building-staff"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs"
              >
                <Users className="w-3.5 h-3.5 text-[#0A3D91]" />
                <span>{language === 'th' ? 'จัดสรรช่างประจำตึก' : 'Staff Allocation'}</span>
              </Link>
            )}

            <Link 
              to="/submit-request" 
              className="inline-flex items-center justify-center space-x-2 bg-[#0A3D91] hover:bg-blue-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'th' ? 'แจ้งซ่อมใหม่' : 'New Request'}</span>
            </Link>
          </div>
        </div>

        {/* Status Category Filter Tabs Bar */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-2 sm:p-2.5 flex items-center justify-between overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
            {statusCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = statusFilter === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleStatusChange(cat.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none ${
                    isActive ? cat.activeClass : cat.inactiveClass
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? cat.activeDotColor : cat.dotColor}`} />
                  <Icon className="w-3.5 h-3.5" />
                  <span>{language === 'th' ? cat.labelTh : cat.labelEn}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {statusFilter !== 'all' && (
            <button
              onClick={() => handleStatusChange('all')}
              className="text-xs font-medium text-slate-500 hover:text-[#0A3D91] px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors shrink-0 ml-2"
            >
              {language === 'th' ? 'แสดงทั้งหมด' : 'Show All'}
            </button>
          )}
        </div>

        {/* Data Table Container */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-semibold text-slate-500">
                  <th className="p-4 pl-6 whitespace-nowrap">{language === 'th' ? 'รหัสแจ้งซ่อม' : 'Ticket ID'}</th>
                  <th className="p-4 min-w-45">{language === 'th' ? 'ปัญหา' : 'Issue'}</th>
                  <th className="p-4 whitespace-nowrap">{language === 'th' ? 'หมวดหมู่' : 'Category'}</th>
                  <th className="p-4 whitespace-nowrap">{language === 'th' ? 'สถานที่' : 'Location'}</th>
                  <th className="p-4 whitespace-nowrap">{language === 'th' ? 'ความเร่งด่วน' : 'Priority'}</th>
                  <th className="p-4 whitespace-nowrap">{language === 'th' ? 'ช่างผู้รับผิดชอบ' : 'Assigned To'}</th>
                  <th className="p-4 whitespace-nowrap min-w-35">{language === 'th' ? 'ความคืบหน้า (Progress)' : 'Progress'}</th>
                  <th className="p-4 whitespace-nowrap">{language === 'th' ? 'สถานะ' : 'Status'}</th>
                  <th className="p-4 pr-6 whitespace-nowrap text-right">{language === 'th' ? 'จัดการ' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => {
                    const currentProgress = ticket.progress !== undefined 
                      ? ticket.progress 
                      : (ticket.status === 'Completed' ? 100 : ticket.status === 'In Progress' ? 50 : 25);

                    return (
                      <tr 
                        key={ticket.id} 
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                        onClick={() => navigate(`/ticket/${ticket.id}`)}
                      >
                        <td className="p-4 pl-6 font-semibold text-[#0A3D91] whitespace-nowrap group-hover:underline">
                          #{ticket.id}
                        </td>
                        <td className="p-4 font-medium text-slate-800">
                          <span className="line-clamp-1">{ticket.issue}</span>
                          <span className="text-[11px] text-slate-400 block font-normal">{ticket.submittedDate || ticket.date}</span>
                        </td>
                        <td className="p-4 text-slate-600 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium text-slate-700">
                            {ticket.category}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 whitespace-nowrap">
                          {ticket.location}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadge(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {role === 'admin' ? (
                            <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={ticket.assignedTo || 'Unassigned'}
                                onChange={(e) => {
                                  const newTech = e.target.value;
                                  updateTicket(ticket.id, { 
                                    assignedTo: newTech,
                                    ...(newTech !== 'Unassigned' && (ticket.status === 'Open' || ticket.status === 'Pending') ? { status: 'In Progress' } : {})
                                  });
                                }}
                                className={`text-xs font-medium rounded-lg px-2.5 py-1 border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0A3D91] ${
                                  ticket.assignedTo && ticket.assignedTo !== 'Unassigned'
                                    ? 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                }`}
                              >
                                <option value="Unassigned">-- {language === 'th' ? 'ยังไม่ระบุ' : 'Unassigned'} --</option>
                                {technicians.map((t) => (
                                  <option key={t.id} value={t.name}>
                                    {t.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            /* Student View: Read-Only */
                            <div className="text-xs">
                              {ticket.assignedTo && ticket.assignedTo !== 'Unassigned' ? (
                                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  {ticket.assignedTo}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-slate-400 italic bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {language === 'th' ? 'รอการจัดสรรช่าง' : 'Unassigned'}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Progress Column: Admin can click & adjust progress % directly */}
                        <td className="p-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          {role === 'admin' ? (
                            <div className="space-y-1 w-28">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-700">{currentProgress}%</span>
                                <select
                                  value={currentProgress}
                                  onChange={(e) => {
                                    const p = Number(e.target.value);
                                    updateTicket(ticket.id, { progress: p });
                                    if (p === 100) {
                                      notifyTicketCompleted({ ...ticket, status: 'Completed', progress: 100 });
                                    }
                                  }}
                                  title={language === 'th' ? 'เปลี่ยนเปอร์เซ็นต์ความคืบหน้า' : 'Change Progress'}
                                  className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded px-1 py-0.5 font-semibold text-slate-700 focus:outline-none cursor-pointer"
                                >
                                  <option value={10}>10% (รับเรื่อง)</option>
                                  <option value={25}>25% (ตรวจงาน)</option>
                                  <option value={50}>50% (กำลังซ่อม)</option>
                                  <option value={75}>75% (ทดสอบ)</option>
                                  <option value={100}>100% (เสร็จสิ้น)</option>
                                </select>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    currentProgress === 100 ? 'bg-emerald-500' : currentProgress >= 50 ? 'bg-blue-600' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${currentProgress}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1 w-24">
                              <span className="text-xs font-bold text-slate-700">{currentProgress}%</span>
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    currentProgress === 100 ? 'bg-emerald-500' : 'bg-[#0A3D91]'
                                  }`}
                                  style={{ width: `${currentProgress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Status Column */}
                        <td className="p-4 whitespace-nowrap">
                          {role === 'admin' ? (
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <div className="relative inline-block">
                                <select
                                  value={ticket.status}
                                  onChange={(e) => {
                                    const newStatus = e.target.value as TicketItem['status'];
                                    updateTicket(ticket.id, { status: newStatus });
                                    if (newStatus === 'Completed') {
                                      notifyTicketCompleted({ ...ticket, status: 'Completed', progress: 100 });
                                    } else {
                                      notifyTicketStatusChange({ ...ticket, status: newStatus }, newStatus);
                                    }
                                  }}
                                  className={`text-xs font-bold uppercase tracking-wider rounded-full px-2.5 py-1 border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0A3D91] ${getStatusBadge(ticket.status)}`}
                                >
                                  <option value="Open">Open</option>
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              </div>

                              {/* Quick Complete Button for tickets not yet completed */}
                              {ticket.status !== 'Completed' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateTicket(ticket.id, { status: 'Completed', progress: 100 });
                                    notifyTicketCompleted({ ...ticket, status: 'Completed', progress: 100 });
                                  }}
                                  title={language === 'th' ? 'กดเสร็จสิ้นงานซ่อมและส่งการแจ้งเตือนทันที' : 'Mark as Completed & Notify'}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shadow-2xs transition-all cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>{language === 'th' ? 'เสร็จสิ้น' : 'Done'}</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            /* Student View: Read-Only Badge */
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          )}
                        </td>

                        {/* Action Column */}
                        <td className="p-4 pr-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            
                            {/* Admin Delete Action Button */}
                            {role === 'admin' && (
                              <button
                                type="button"
                                onClick={() => setTicketToDelete(ticket)}
                                title={language === 'th' ? 'ลบคำร้องนี้' : 'Delete Ticket'}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}

                            <button 
                              className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-[#0A3D91] hover:bg-blue-50 rounded-lg transition-colors focus:outline-none"
                              onClick={() => navigate(`/ticket/${ticket.id}`)}
                            >
                              <span className="sr-only">View</span>
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="p-12 text-center">
                      <div className="max-w-sm mx-auto flex flex-col items-center justify-center text-slate-500">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                          <ListFilter className="w-6 h-6" />
                        </div>
                        <p className="font-semibold text-slate-800 text-base mb-1">
                          {statusFilter !== 'all'
                            ? (language === 'th' 
                                ? `ไม่พบรายการในสถานะ "${statusCategories.find(c => c.id === statusFilter)?.labelTh || statusFilter}"` 
                                : `No "${statusCategories.find(c => c.id === statusFilter)?.labelEn || statusFilter}" requests found`)
                            : (language === 'th' ? 'ไม่พบรายการที่ตรงกับตัวกรอง' : 'No tickets found')}
                        </p>
                        <p className="text-sm text-slate-500 mb-4">
                          {statusFilter !== 'all'
                            ? (language === 'th' ? 'ไม่มีรายการที่ตรงกับสถานะนี้' : 'There are currently no tickets matching this status category.')
                            : (language === 'th' ? 'ยังไม่มีรายการแจ้งซ่อมในระบบ' : 'There are currently no maintenance tickets in the system.')}
                        </p>
                        {statusFilter !== 'all' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStatusChange('all')}
                              className="px-4 py-2 text-xs font-semibold text-white bg-[#0A3D91] hover:bg-blue-900 rounded-lg transition-colors shadow-xs"
                            >
                              {language === 'th' ? 'ดูรายการสถานะทั้งหมด' : 'Show All Statuses'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 rounded-b-xl flex items-center justify-between sm:justify-end">
            <span className="text-sm text-slate-500 mr-4">
              {language === 'th' 
                ? `แสดง ${filteredTickets.length > 0 ? 1 : 0} ถึง ${filteredTickets.length} จากทั้งหมด ${filteredTickets.length} รายการ`
                : `Showing ${filteredTickets.length > 0 ? 1 : 0} to ${filteredTickets.length} of ${filteredTickets.length} results`}
            </span>
            <nav className="inline-flex items-center -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button className="relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-[#0A3D91] border border-[#0A3D91] focus:z-20 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#0A3D91]">
                1
              </button>
              <button className="relative inline-flex items-center rounded-r-md px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0">
                Next
              </button>
            </nav>
          </div>

        </div>

        {/* Modal: Delete Ticket Confirmation */}
        {ticketToDelete && (
          <div 
            onClick={(e) => { if (e.target === e.currentTarget) setTicketToDelete(null); }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden transform transition-all">
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {language === 'th' ? 'ยืนยันการลบคำร้องแจ้งซ่อม?' : 'Delete Maintenance Ticket?'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'th' 
                      ? `คุณกำลังจะลบคำร้อง #${ticketToDelete.id} "${ticketToDelete.issue}" ออกจากระบบถาวร การกระทำนี้ไม่สามารถยกเลิกได้`
                      : `Are you sure you want to permanently delete ticket #${ticketToDelete.id} "${ticketToDelete.issue}"? This action cannot be undone.`}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-left text-slate-600 space-y-1">
                  <div><b>{language === 'th' ? 'สถานที่:' : 'Location:'}</b> {ticketToDelete.location}</div>
                  <div><b>{language === 'th' ? 'สถานะปัจจุบัน:' : 'Current Status:'}</b> {ticketToDelete.status}</div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTicketToDelete(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'th' ? 'ยืนยันลบคำร้อง' : 'Delete Ticket'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
