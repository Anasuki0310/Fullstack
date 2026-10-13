

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { useTickets, TicketItem } from '../contexts/TicketContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useRole } from '../contexts/RoleContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useBuildingStaff } from '../contexts/BuildingStaffContext';
import {
  MessageSquare,
  Check,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  ArrowLeft,
  Clock,
  UserCheck,
  Wrench,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ShieldCheck,
  GraduationCap,
  Bell,
  Sparkles,
  Volume2,
  Trash2,
  AlertTriangle,
  Building2,
  Sliders,
  Users
} from 'lucide-react';

const TECHNICIANS_LIST = [
  { name: 'Dave M. (Plumber)', role: 'Plumber', phone: '081-456-7890', email: 'dave.m@cmu.ac.th', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { name: 'Kittisak P. (Electrician)', role: 'Electrician', phone: '089-123-4567', email: 'kittisak.p@cmu.ac.th', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { name: 'Somchai R. (HVAC)', role: 'HVAC Specialist', phone: '086-789-0123', email: 'somchai.r@cmu.ac.th', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
  { name: 'Anan T. (AV Tech)', role: 'AV/IT Technician', phone: '082-345-6789', email: 'anan.t@cmu.ac.th', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
  { name: 'Prasert K. (Carpenter)', role: 'Carpenter', phone: '084-567-8901', email: 'prasert.k@cmu.ac.th', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
  { name: 'Suda W. (Cleaning)', role: 'Cleaning Supervisor', phone: '085-678-9012', email: 'suda.w@cmu.ac.th', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
  { name: 'Somsak W. (General Maintenance)', role: 'General Maintenance', phone: '084-555-6677', email: 'somsak.w@cmu.ac.th', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80' },
  { name: 'Unassigned', role: 'Awaiting Assignment', phone: '-', email: '-', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }
];

export default function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTicketById, updateTicket, deleteTicket } = useTickets();
  const { getBuildingAllocation, getLeadTechForBuilding, technicians } = useBuildingStaff();
  const { language } = useLanguage();
  const { role } = useRole();
  const {
    notifyTicketCompleted,
    notifyTicketStatusChange,
    notifyTechnicianAssigned
  } = useNotifications();

  const foundTicket = id ? getTicketById(id) : undefined;

  const ticketId = foundTicket ? foundTicket.id : (id || 'REQ-1042');
  const ticketStatus = foundTicket ? foundTicket.status : 'Pending';
  const ticketPriority = foundTicket ? foundTicket.priority : 'Medium';
  const reporterName = foundTicket ? foundTicket.reporterName : 'Supakorn (You)';
  const submittedDate = foundTicket ? (foundTicket.submittedDate || foundTicket.date) : 'Oct 24, 2026';
  const locationStr = foundTicket ? foundTicket.location : 'Engineering Bldg, Room 302';
  const categoryStr = foundTicket ? foundTicket.category : 'General';
  const descriptionStr = foundTicket ? (foundTicket.description || foundTicket.issue) : 'Maintenance request details.';
  const photos = foundTicket?.photos && foundTicket.photos.length > 0 ? foundTicket.photos : [];
  const assignedTo = foundTicket?.assignedTo || 'Unassigned';

  const ticketProgress = foundTicket?.progress !== undefined
    ? foundTicket.progress
    : (ticketStatus === 'Completed' ? 100 : ticketStatus === 'In Progress' ? 50 : 25);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<string>(assignedTo);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Array<{ id: number; author: string; time: string; text: string }>>([
    { id: 1, author: 'Facilities Admin', time: 'Yesterday at 14:30', text: 'Received request, dispatching maintenance personnel to inspect location.' }
  ]);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCommentModalOpen(false);
        setIsDeleteModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  const buildingAlloc = foundTicket?.building ? getBuildingAllocation(foundTicket.building) : getBuildingAllocation(locationStr);
  const buildingLeadTech = foundTicket?.building ? getLeadTechForBuilding(foundTicket.building) : getLeadTechForBuilding(locationStr);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleStatusChange = (newStatus: TicketItem['status']) => {
    if (role !== 'admin') {
      showToast(language === 'th' ? 'เฉพาะผู้ดูแลระบบ (Admin/Staff) เท่านั้นที่สามารถเปลี่ยนสถานะได้' : 'Only Admins/Staff can update status.');
      return;
    }
    if (!foundTicket) return;
    const updates: Partial<TicketItem> = { status: newStatus };
    if (newStatus === 'Completed') {
      updates.progress = 100;
    }
    updateTicket(foundTicket.id, updates);

    if (newStatus === 'Completed') {
      notifyTicketCompleted({ ...foundTicket, status: 'Completed', progress: 100 });
      showToast(language === 'th' ? `🎉 ซ่อมเสร็จสมบูรณ์แล้ว! ส่งการแจ้งเตือนเรียบร้อยแล้ว 🔔` : `Status updated to "Completed"! Notification sent 🔔`);
    } else {
      notifyTicketStatusChange({ ...foundTicket, status: newStatus }, newStatus);
      showToast(language === 'th' ? `อัปเดตสถานะเป็น "${newStatus}" สำเร็จแล้ว!` : `Status updated to "${newStatus}" successfully!`);
    }
  };

  const handleProgressChange = (newProgress: number) => {
    if (role !== 'admin') return;
    if (!foundTicket) return;

    const updates: Partial<TicketItem> = { progress: newProgress };
    if (newProgress === 100) {
      updates.status = 'Completed';
    } else if (foundTicket.status === 'Completed' && newProgress < 100) {
      updates.status = 'In Progress';
    }

    updateTicket(foundTicket.id, updates);

    if (newProgress === 100) {
      notifyTicketCompleted({ ...foundTicket, status: 'Completed', progress: 100 });
      showToast(language === 'th' ? `🎉 ปรับโปรเกรส 100% (เสร็จสิ้น) และส่งแจ้งเตือนแล้ว 🔔` : `Progress set to 100% (Completed)! Notification sent 🔔`);
    } else {
      showToast(language === 'th' ? `อัปเดตความคืบหน้าเป็น ${newProgress}% เรียบร้อยแล้ว` : `Progress updated to ${newProgress}%`);
    }
  };

  const handleTechnicianChange = (techName: string) => {
    if (role !== 'admin') {
      showToast(language === 'th' ? 'เฉพาะผู้ดูแลระบบ (Admin/Staff) เท่านั้นที่สามารถมอบหมายช่างได้' : 'Only Admins/Staff can assign technicians.');
      return;
    }
    if (!foundTicket) return;
    setSelectedTechnician(techName);
    const updates: Partial<TicketItem> = { assignedTo: techName };
    if (techName !== 'Unassigned' && (foundTicket.status === 'Pending' || foundTicket.status === 'Open')) {
      updates.status = 'In Progress';
      if (!foundTicket.progress || foundTicket.progress < 25) {
        updates.progress = 50;
      }
    }
    updateTicket(foundTicket.id, updates);
    notifyTechnicianAssigned({ ...foundTicket, ...updates }, techName);
    showToast(language === 'th' ? `มอบหมายช่างให้ "${techName}" สำเร็จแล้ว!` : `Assigned technician "${techName}" successfully!`);
  };

  const handleConfirmDelete = () => {
    if (!foundTicket) return;
    deleteTicket(foundTicket.id);
    navigate('/tickets');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments([
      ...comments,
      {
        id: Date.now(),
        author: role === 'admin' ? 'Staff (You)' : 'User (You)',
        time: 'Just now',
        text: commentText.trim()
      }
    ]);
    setCommentText('');
    setIsCommentModalOpen(false);
    showToast(language === 'th' ? 'เพิ่มความคิดเห็นเรียบร้อยแล้ว' : 'Comment added successfully');
  };

  const matchedTech = technicians.find(t => t.name === assignedTo);
  const currentTechInfo = matchedTech ? {
    name: matchedTech.name,
    role: language === 'th' ? matchedTech.roleTh : matchedTech.roleEn,
    phone: matchedTech.phone,
    email: matchedTech.email,
    avatar: matchedTech.avatar
  } : (TECHNICIANS_LIST.find(t => t.name === assignedTo) || {
    name: assignedTo,
    role: 'Technician',
    phone: '081-456-7890',
    email: 'facilities@cmu.ac.th',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-sm animate-in fade-in slide-in-from-top-2 border border-slate-700">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Link
            to="/tickets"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#0A3D91] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            {language === 'th' ? 'กลับไปยังรายการแจ้งซ่อมทั้งหมด' : 'Back to All Tickets'}
          </Link>

          {role === 'admin' && (
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'th' ? 'ลบคำร้องนี้' : 'Delete Ticket'}</span>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              {language === 'th' ? 'รายละเอียดใบแจ้งซ่อม' : 'Ticket Details'} | {ticketId}
            </h2>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <span className={`border px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(ticketStatus)}`}>
                {ticketStatus}
              </span>
              <span className={`border px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getPriorityBadge(ticketPriority)}`}>
                {language === 'th' ? 'ความสำคัญ:' : 'Priority:'} {ticketPriority}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsCommentModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 mr-2 text-[#0A3D91]" />
            {language === 'th' ? 'เพิ่มความคิดเห็น' : 'Add Comment'}
          </button>
        </div>

        {role === 'admin' ? (
          <div className="bg-gradient-to-r from-blue-900 via-[#0A3D91] to-indigo-900 text-white rounded-2xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  {language === 'th' ? '🛠️ แผงควบคุมผู้ดูแลระบบ (Admin & Staff Controls)' : '🛠️ Admin & Staff Control Panel'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-red-200 hover:text-white bg-red-500/30 hover:bg-red-500/50 px-2.5 py-1 rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'th' ? 'ลบคำร้องนี้' : 'Delete'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold uppercase tracking-wider">
                  <Wrench className="w-4 h-4 text-amber-300" />
                  <span>{language === 'th' ? 'สถานะงานซ่อม:' : 'Ticket Status:'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'Open', labelTh: 'เปิดใหม่', labelEn: 'Open', color: 'hover:bg-sky-500', active: 'bg-sky-500 text-white ring-2 ring-white/50 font-bold' },
                    { key: 'Pending', labelTh: 'รอดำเนินการ', labelEn: 'Pending', color: 'hover:bg-amber-500', active: 'bg-amber-500 text-white ring-2 ring-white/50 font-bold' },
                    { key: 'In Progress', labelTh: 'กำลังซ่อม', labelEn: 'In Progress', color: 'hover:bg-blue-500', active: 'bg-blue-500 text-white ring-2 ring-white/50 font-bold' },
                    { key: 'Completed', labelTh: '✔ เสร็จสิ้น', labelEn: '✔ Completed', color: 'hover:bg-emerald-600', active: 'bg-emerald-500 text-white ring-2 ring-emerald-300 font-black' },
                  ].map((s) => {
                    const isCurrent = ticketStatus === s.key;
                    return (
                      <button
                        key={s.key}
                        onClick={() => handleStatusChange(s.key as TicketItem['status'])}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                          isCurrent
                            ? s.active
                            : 'bg-white/10 text-white/90 border border-white/20 ' + s.color
                        }`}
                      >
                        {isCurrent && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        {language === 'th' ? s.labelTh : s.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-blue-100 text-xs font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-300" />
                    <span>{language === 'th' ? 'ปรับโปรเกรส (% ความคืบหน้า):' : 'Progress Control:'}</span>
                  </div>
                  <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded text-xs">
                    {ticketProgress}%
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { val: 10, label: '10%' },
                    { val: 25, label: '25%' },
                    { val: 50, label: '50%' },
                    { val: 75, label: '75%' },
                    { val: 100, label: '100%' },
                  ].map((p) => {
                    const isCurrent = ticketProgress === p.val;
                    return (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => handleProgressChange(p.val)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          isCurrent
                            ? 'bg-emerald-500 text-white border-emerald-300 shadow-sm ring-2 ring-white/40'
                            : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden mt-1">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${ticketProgress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-blue-100 text-xs font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-amber-300" />
                    <span>{language === 'th' ? 'มอบหมายช่าง:' : 'Assign Tech:'}</span>
                  </div>
                  {buildingAlloc && (
                    <Link
                      to="/building-staff"
                      className="text-[10px] text-blue-200 hover:text-white underline inline-flex items-center gap-1"
                    >
                      <Building2 className="w-2.5 h-2.5" />
                      <span>{buildingAlloc.zone}</span>
                    </Link>
                  )}
                </div>

                <div className="relative">
                  <select
                    value={assignedTo}
                    onChange={(e) => handleTechnicianChange(e.target.value)}
                    className="w-full bg-slate-900/90 text-white text-xs font-medium rounded-lg px-3 py-2 pr-8 border border-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none cursor-pointer"
                  >
                    <option value="Unassigned">-- {language === 'th' ? 'ยังไม่ระบุช่าง (Unassigned)' : 'Unassigned'} --</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.name}>
                        {tech.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-white/70 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {assignedTo === 'Unassigned' && buildingLeadTech && (
                  <div className="bg-white/10 rounded-lg p-2 text-[11px] text-blue-100 flex items-center justify-between">
                    <span className="truncate">
                      🏢 {language === 'th' ? 'ช่างหลักตึกนี้:' : 'Lead:'} <b>{buildingLeadTech.name}</b>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTechnicianChange(buildingLeadTech.name)}
                      className="shrink-0 ml-2 bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs"
                    >
                      {language === 'th' ? 'มอบหมายทันที' : 'Assign'}
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (

          ticketStatus === 'Completed' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {language === 'th' ? '🎉 ซ่อมเสร็จสมบูรณ์แล้ว (Completed)' : '🎉 Completed'}
                    </span>
                    <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                      <Bell className="w-3 h-3 text-amber-500" />
                      {language === 'th' ? 'ระบบส่งแจ้งเตือนเรียบร้อย' : 'Notification delivered'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1">
                    {language === 'th'
                      ? 'งานซ่อมนี้ได้รับการแก้ไขเสร็จสิ้นเรียบร้อยแล้วโดยทีมช่างผู้เชี่ยวชาญ'
                      : 'This repair request has been successfully completed.'}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2 text-xs font-bold text-emerald-800 bg-white px-3.5 py-2 rounded-xl border border-emerald-300 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>{language === 'th' ? 'สถานะ: เสร็จสิ้น (100%)' : 'Status: Completed (100%)'}</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0A3D91] flex items-center justify-center shrink-0 shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0A3D91] border border-blue-200">
                      {language === 'th' ? '🎓 มุมมองนิสิต (Student View)' : '🎓 Student View'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {language === 'th' ? 'ติดตามความคืบหน้าของงานซ่อม' : 'Tracking Progress'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    {language === 'th'
                      ? 'คุณสามารถติดตามสถานะการดำเนินงานได้ตามไทม์ไลน์ด้านล่าง'
                      : 'You can monitor the repair progression below.'}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span>{language === 'th' ? 'โปรเกรสปัจจุบัน:' : 'Current Progress:'} <b>{ticketProgress}%</b></span>
              </div>
            </div>
          )
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0A3D91]" />
                <h3 className="font-semibold text-lg text-slate-900">
                  {language === 'th' ? 'ข้อมูลคำร้อง' : 'Information'}
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {ticketProgress}%
              </span>
            </div>

            <div className="p-6 space-y-6 flex-1">

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{language === 'th' ? 'ความคืบหน้าการซ่อมบำรุง' : 'Overall Progress'}</span>
                  <span className="text-[#0A3D91] font-bold">{ticketProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ticketProgress === 100 ? 'bg-emerald-500' : ticketProgress >= 50 ? 'bg-blue-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${ticketProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {ticketProgress === 100
                    ? (language === 'th' ? 'ซ่อมแซมและทดสอบระบบเสร็จสมบูรณ์' : 'Repairs completed and verified.')
                    : ticketProgress >= 50
                    ? (language === 'th' ? 'ช่างกำลังดำเนินการแก้ไขหน้างาน' : 'Technician on-site fixing issue.')
                    : (language === 'th' ? 'รับเรื่องและกำลังจัดส่งทีมช่าง' : 'Received, dispatching crew.')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                    {language === 'th' ? 'ผู้แจ้ง' : 'Reporter'}
                  </p>
                  <p className="font-medium text-slate-900">{reporterName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                    {language === 'th' ? 'วันที่ส่งคำร้อง' : 'Date Submitted'}
                  </p>
                  <p className="font-medium text-slate-900">{submittedDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                    {language === 'th' ? 'สถานที่' : 'Location'}
                  </p>
                  <p className="font-medium text-slate-900">{locationStr}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                    {language === 'th' ? 'หมวดหมู่' : 'Category'}
                  </p>
                  <p className="font-medium text-slate-900">{categoryStr}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                  {language === 'th' ? 'รายละเอียด' : 'Detailed Description'}
                </p>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {descriptionStr}
                </div>
              </div>

              {photos.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                    {language === 'th' ? 'รูปถ่ายแนบ' : 'Attached Photos'}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {photos.map((url, idx) => (
                      <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                        <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-semibold text-lg text-slate-900">
                {language === 'th' ? 'สถานะการดำเนินงาน' : 'Tracking Timeline'}
              </h3>
            </div>
            <div className="p-6 flex-1">
              <div className="relative pl-3 mt-2">
                <div className="absolute top-2 bottom-4 left-6 w-0.5 bg-slate-200"></div>

                <div className="relative flex items-start gap-4 mb-8">
                  <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm mt-0.5">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {language === 'th' ? 'เปิดคำร้องแจ้งซ่อมเรียบร้อย' : 'Ticket Created'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{submittedDate}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {language === 'th' ? 'ส่งเรื่องเข้าสู่ระบบฝ่ายอาคารสถานที่แล้ว' : 'Request logged in maintenance system.'}
                    </p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4 mb-8">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm mt-0.5 ${
                    assignedTo !== 'Unassigned' ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-500'
                  }`}>
                    {assignedTo !== 'Unassigned' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {language === 'th' ? 'มอบหมายช่างผู้รับผิดชอบ' : 'Technician Assigned'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {assignedTo !== 'Unassigned' ? assignedTo : (language === 'th' ? 'รอดำเนินการ' : 'Pending')}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {assignedTo !== 'Unassigned'
                        ? (language === 'th' ? `มอบหมายงานให้ ${assignedTo} เข้าตรวจรับงานแล้ว` : `Assigned to ${assignedTo}.`)
                        : (language === 'th' ? 'อยู่ระหว่างรอเจ้าหน้าที่จัดสรรช่าง' : 'Awaiting assignment.')}
                    </p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4 mb-8">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm mt-0.5 ${
                    ticketStatus === 'In Progress' || ticketStatus === 'Completed' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {ticketStatus === 'Completed' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Wrench className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {language === 'th' ? 'กำลังดำเนินการซ่อมแซม' : 'Work in Progress'}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {ticketStatus === 'In Progress' || ticketStatus === 'Completed'
                        ? (language === 'th' ? 'ทีมช่างกำลังเข้าพื้นที่เพื่อทำการซ่อมแซม' : 'Technician is actively fixing the issue.')
                        : (language === 'th' ? 'รอเริ่มงานซ่อม' : 'Awaiting work start.')}
                    </p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm mt-0.5 ${
                    ticketStatus === 'Completed' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {language === 'th' ? 'ซ่อมแซมเสร็จสิ้น' : 'Resolved & Completed'}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {ticketStatus === 'Completed'
                        ? (language === 'th' ? 'งานซ่อมเสร็จสมบูรณ์ และส่งแจ้งเตือนแล้ว' : 'All repairs resolved.')
                        : (language === 'th' ? 'ยังไม่เสร็จสิ้น' : 'Not yet completed.')}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-slate-900">
                {language === 'th' ? 'ช่างผู้รับผิดชอบ' : 'Assigned Staff'}
              </h3>
              {buildingAlloc && (
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {buildingAlloc.zone}
                </span>
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-4 border-slate-100 shadow-md">
                <img src={currentTechInfo.avatar} alt={currentTechInfo.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="font-bold text-base text-slate-900">{currentTechInfo.name}</h4>
              <p className="text-xs text-[#0A3D91] font-semibold mt-0.5 mb-4">{currentTechInfo.role}</p>

              <div className="w-full space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
                <div className="flex items-center text-xs">
                  <Phone className="w-4 h-4 mr-2.5 text-slate-400 shrink-0" />
                  <span className="text-slate-700 font-medium">{currentTechInfo.phone}</span>
                </div>
                <div className="flex items-center text-xs">
                  <Mail className="w-4 h-4 mr-2.5 text-slate-400 shrink-0" />
                  <span className="text-slate-700 font-medium truncate">{currentTechInfo.email}</span>
                </div>
              </div>

              {buildingAlloc && (
                <div className="w-full bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-left text-xs mb-4">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold mb-1">
                    <Building2 className="w-3.5 h-3.5 text-[#0A3D91]" />
                    <span>{language === 'th' ? 'การจัดสรรประจำอาคารนี้:' : 'Building Staff:'}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {language === 'th' ? 'หัวหน้าช่างประจำตึก:' : 'Lead Tech:'} <b>{buildingAlloc.leadTechnician}</b>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {buildingAlloc.notes}
                  </p>
                </div>
              )}

              <div className="mt-auto w-full pt-2">
                <button
                  onClick={() => setIsCommentModalOpen(true)}
                  className="w-full flex items-center justify-center px-4 py-2.5 border-2 border-[#0A3D91] rounded-lg text-xs font-bold text-[#0A3D91] hover:bg-[#0A3D91] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A3D91] cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {language === 'th' ? 'ติดต่อ / ประสานงานช่าง' : 'Contact Support'}
                </button>
              </div>
            </div>
          </div>

        </div>

        {comments.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#0A3D91]" />
              {language === 'th' ? 'บันทึกความคิดเห็นและการประสานงาน' : 'Communication & Notes'}
            </h3>
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 text-xs">{c.author}</span>
                    <span className="text-[11px] text-slate-400">{c.time}</span>
                  </div>
                  <p className="text-slate-700 text-xs sm:text-sm">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setIsDeleteModalOpen(false); }}
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
                      ? `คุณกำลังจะลบคำร้อง #${ticketId} "${descriptionStr}" ออกจากระบบถาวร ข้อมูลและการติดตามทั้งหมดจะถูกลบ`
                      : `Are you sure you want to permanently delete ticket #${ticketId}? This action cannot be undone.`}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
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

        {isCommentModalOpen && (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setIsCommentModalOpen(false); }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {language === 'th' ? 'เพิ่มความคิดเห็น / บันทึกการซ่อม' : 'Add Note / Comment'}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {language === 'th' ? 'พิมพ์ข้อความหรือคำชี้แจงสำหรับงานแจ้งซ่อมนี้' : 'Type updates or instructions for this maintenance request'}
              </p>
              <form onSubmit={handleAddComment}>
                <textarea
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={language === 'th' ? 'ระบุรายละเอียด เช่น ตรวจสอบแล้ว พบอะไหล่ชำรุด...' : 'Type message here...'}
                  className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-transparent mb-4"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCommentModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#0A3D91] hover:bg-blue-900 rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    {language === 'th' ? 'บันทึกความคิดเห็น' : 'Submit Comment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
