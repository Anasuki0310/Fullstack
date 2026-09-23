import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { useRole } from '../contexts/RoleContext';
import { useTickets, TicketItem } from '../contexts/TicketContext';
import { 
  Plus, 
  ChevronRight, 
  User,
  ListFilter,
  Clock,
  Wrench,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function TicketsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();
  const { role } = useRole();
  const { tickets } = useTickets();

  const [statusFilter, setStatusFilter] = useState<string>('all');

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
    return role === 'student' 
      ? tickets.filter(ticket => ticket.reporterId === 'student-me')
      : tickets;
  }, [tickets, role]);

  const statusCounts = useMemo(() => {
    return {
      all: baseTickets.length,
      pending: baseTickets.filter(t => t.status.toLowerCase() === 'pending').length,
      in_progress: baseTickets.filter(t => t.status.toLowerCase() === 'in progress').length,
      completed: baseTickets.filter(t => t.status.toLowerCase() === 'completed').length,
      open: baseTickets.filter(t => t.status.toLowerCase() === 'open').length,
    };
  }, [baseTickets]);

  const statusCategories = useMemo(() => [
    {
      id: 'all',
      labelEn: 'All Requests',
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
      activeClass: 'bg-amber-500 text-white border-amber-600 shadow-sm',
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
                  {language === 'th' ? 'รายการของคุณ' : 'My Tickets'}
                </span>
              )}
              {role === 'admin' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  {language === 'th' ? 'มุมมองผู้ดูแล' : 'Admin View'}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {role === 'admin'
                ? (language === 'th' ? 'จัดการและติดตามปัญหาการแจ้งซ่อมที่ส่งมาทั้งหมดในมหาวิทยาลัย' : 'Manage and track all submitted maintenance issues across the campus.')
                : (language === 'th' ? 'ติดตามและจัดการปัญหาการแจ้งซ่อมที่คุณส่ง' : 'Track and manage maintenance requests you have submitted.')}
            </p>
          </div>
          <Link 
            to="/submit-request" 
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0A3D91] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A3D91] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {language === 'th' ? 'แจ้งซ่อมใหม่' : 'New Request'}
          </Link>
        </div>

        {/* Status Category Filter Tabs Bar */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-2 sm:p-2.5 flex items-center justify-between overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 hidden sm:inline">
              {language === 'th' ? 'สถานะ:' : 'Status:'}
            </span>
            {statusCategories.map((cat) => {
              const isActive = statusFilter === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleStatusChange(cat.id)}
                  className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-all duration-150 select-none ${
                    isActive
                      ? `${cat.activeClass} ring-2 ring-offset-1 ring-slate-400/20`
                      : cat.inactiveClass
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? cat.activeDotColor : cat.dotColor}`}></span>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{language === 'th' ? cat.labelTh : cat.labelEn}</span>
                  <span
                    className={`ml-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
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
                  <th className="p-4 min-w-[200px]">{language === 'th' ? 'ปัญหา' : 'Issue'}</th>
                  <th className="p-4 whitespace-nowrap">{language === 'th' ? 'หมวดหมู่' : 'Category'}</th>
                  <th className="p-4 whitespace-nowrap">{language === 'th' ? 'สถานที่' : 'Location'}</th>
                  <th className="p-4 whitespace-nowrap">{language === 'th' ? 'ความเร่งด่วน' : 'Priority'}</th>
                  <th className="p-4 whitespace-nowrap">{language === 'th' ? 'วันที่แจ้ง' : 'Date Submitted'}</th>
                  {role === 'admin' && (
                    <th className="p-4 whitespace-nowrap">{language === 'th' ? 'ช่างผู้รับผิดชอบ' : 'Assigned To'}</th>
                  )}
                  <th className="p-4 whitespace-nowrap">{language === 'th' ? 'สถานะ' : 'Status'}</th>
                  <th className="p-4 pr-6 whitespace-nowrap text-right">{language === 'th' ? 'จัดการ' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <tr 
                      key={ticket.id} 
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/ticket/${ticket.id}`)}
                    >
                      <td className="p-4 pl-6 font-semibold text-[#0A3D91] whitespace-nowrap group-hover:underline">
                        #{ticket.id}
                      </td>
                      <td className="p-4 font-medium text-slate-800">
                        {ticket.issue}
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
                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {ticket.submittedDate || ticket.date}
                      </td>
                      {role === 'admin' && (
                        <td className="p-4 whitespace-nowrap">
                          {ticket.assignedTo && ticket.assignedTo !== 'Unassigned' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              {ticket.assignedTo}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              {language === 'th' ? 'ยังไม่ได้มอบหมาย' : 'Unassigned'}
                            </span>
                          )}
                        </td>
                      )}
                      <td className="p-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right whitespace-nowrap">
                        <button 
                          className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-[#0A3D91] hover:bg-blue-50 rounded-lg transition-colors focus:outline-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/ticket/${ticket.id}`);
                          }}
                        >
                          <span className="sr-only">View</span>
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={role === 'admin' ? 9 : 8} className="p-12 text-center">
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
              <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-[#0A3D91] border border-[#0A3D91] focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A3D91]">
                1
              </button>
              <button className="relative inline-flex items-center rounded-r-md px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0">
                Next
              </button>
            </nav>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
