

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  FileWarning,
  Wrench,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Download,
  Building2,
  Users,
  Percent,
  Layers,
  ArrowRight,
  Sparkles,
  Printer
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useRole } from '../contexts/RoleContext';
import { useTickets, TicketItem } from '../contexts/TicketContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import DashboardLayout from './DashboardLayout';

const PIE_COLORS = ['#0A3D91', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#64748b'];

export default function DashboardPage() {
  const { language } = useLanguage();
  const { role } = useRole();
  const navigate = useNavigate();
  const { tickets } = useTickets();


  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(9);

  useEffect(() => {
    if (role === 'student') {
      navigate('/tickets', { replace: true });
    }
  }, [role, navigate]);

  if (role === 'student') {
    return null;
  }

  const months = [
    { value: 0, labelEn: 'January', labelTh: 'มกราคม' },
    { value: 1, labelEn: 'February', labelTh: 'กุมภาพันธ์' },
    { value: 2, labelEn: 'March', labelTh: 'มีนาคม' },
    { value: 3, labelEn: 'April', labelTh: 'เมษายน' },
    { value: 4, labelEn: 'May', labelTh: 'พฤษภาคม' },
    { value: 5, labelEn: 'June', labelTh: 'มิถุนายน' },
    { value: 6, labelEn: 'July', labelTh: 'กรกฎาคม' },
    { value: 7, labelEn: 'August', labelTh: 'สิงหาคม' },
    { value: 8, labelEn: 'September', labelTh: 'กันยายน' },
    { value: 9, labelEn: 'October', labelTh: 'ตุลาคม' },
    { value: 10, labelEn: 'November', labelTh: 'พฤศจิกายน' },
    { value: 11, labelEn: 'December', labelTh: 'ธันวาคม' },
  ];

  const currentMonthLabel = language === 'th'
    ? `${months[selectedMonth].labelTh} ${selectedYear + 543}`
    : `${months[selectedMonth].labelEn} ${selectedYear}`;

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };


  const getTicketMonthYear = (ticket: TicketItem) => {
    if (ticket.createdAt) {
      const d = new Date(ticket.createdAt);
      return { month: d.getMonth(), year: d.getFullYear(), date: d.getDate() };
    }
    if (ticket.submittedDate) {
      const d = new Date(ticket.submittedDate);
      if (!isNaN(d.getTime())) {
        return { month: d.getMonth(), year: d.getFullYear(), date: d.getDate() };
      }
    }

    return { month: 9, year: 2026, date: 20 };
  };


  const monthlyTickets = useMemo(() => {
    return tickets.filter(t => {
      const { month, year } = getTicketMonthYear(t);
      return month === selectedMonth && year === selectedYear;
    });
  }, [tickets, selectedMonth, selectedYear]);


  const totalMonthlyCount = monthlyTickets.length;
  const completedMonthlyCount = monthlyTickets.filter(t => t.status === 'Completed').length;
  const inProgressMonthlyCount = monthlyTickets.filter(t => t.status === 'In Progress').length;
  const pendingMonthlyCount = monthlyTickets.filter(t => t.status === 'Pending').length;
  const openMonthlyCount = monthlyTickets.filter(t => t.status === 'Open').length;
  const urgentMonthlyCount = monthlyTickets.filter(t => t.priority === 'Urgent').length;


  const resolutionRate = totalMonthlyCount > 0
    ? Math.round((completedMonthlyCount / totalMonthlyCount) * 100)
    : 0;


  const averageProgress = totalMonthlyCount > 0
    ? Math.round(monthlyTickets.reduce((acc, t) => acc + (t.progress !== undefined ? t.progress : (t.status === 'Completed' ? 100 : t.status === 'In Progress' ? 50 : 20)), 0) / totalMonthlyCount)
    : 0;


  const monthlyTrendData = useMemo(() => {
    const weeks = [
      { name: language === 'th' ? 'สัปดาห์ 1 (1-7)' : 'Week 1', total: 0, completed: 0 },
      { name: language === 'th' ? 'สัปดาห์ 2 (8-14)' : 'Week 2', total: 0, completed: 0 },
      { name: language === 'th' ? 'สัปดาห์ 3 (15-21)' : 'Week 3', total: 0, completed: 0 },
      { name: language === 'th' ? 'สัปดาห์ 4 (22-31)' : 'Week 4', total: 0, completed: 0 },
    ];

    monthlyTickets.forEach(t => {
      const { date } = getTicketMonthYear(t);
      let weekIdx = 0;
      if (date <= 7) weekIdx = 0;
      else if (date <= 14) weekIdx = 1;
      else if (date <= 21) weekIdx = 2;
      else weekIdx = 3;

      weeks[weekIdx].total += 1;
      if (t.status === 'Completed') {
        weeks[weekIdx].completed += 1;
      }
    });

    return weeks;
  }, [monthlyTickets, language]);


  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    monthlyTickets.forEach(t => {
      const cat = t.category || 'General';
      map[cat] = (map[cat] || 0) + 1;
    });

    const result = Object.entries(map).map(([name, value]) => ({ name, value }));
    return result.length > 0 ? result : [
      { name: 'General', value: 1 }
    ];
  }, [monthlyTickets]);


  const topBuildingsData = useMemo(() => {
    const map: Record<string, { total: number; completed: number; active: number }> = {};
    monthlyTickets.forEach(t => {
      const bldg = t.building || t.location?.split(',')[0] || 'Campus Building';
      if (!map[bldg]) map[bldg] = { total: 0, completed: 0, active: 0 };
      map[bldg].total += 1;
      if (t.status === 'Completed') map[bldg].completed += 1;
      else map[bldg].active += 1;
    });

    return Object.entries(map)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [monthlyTickets]);

  const handleExportCSV = () => {
    if (monthlyTickets.length === 0) {
      alert(language === 'th' ? 'ไม่มีข้อมูลคำร้องในเดือนนี้' : 'No ticket data for this month');
      return;
    }
    const headers = ['ID', 'Issue', 'Category', 'Location', 'Status', 'Progress(%)', 'Priority', 'AssignedTo', 'SubmittedDate'];
    const rows = monthlyTickets.map(t => [
      t.id,
      `"${(t.issue || '').replace(/"/g, '""')}"`,
      t.category,
      `"${(t.location || '').replace(/"/g, '""')}"`,
      t.status,
      t.progress || 0,
      t.priority,
      `"${(t.assignedTo || '').replace(/"/g, '""')}"`,
      t.submittedDate || t.date
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Maintenance_Report_${selectedYear}_${selectedMonth + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'High':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#0A3D91] border border-blue-200">
                {language === 'th' ? '📊 แดชบอร์ดสรุปงานรายเดือน' : 'Monthly Performance Dashboard'}
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-500 font-medium">
                {language === 'th' ? 'สถิติภาพรวมและการดำเนินงานของช่าง' : 'Campus facility maintenance analytics'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span>{language === 'th' ? 'สรุปงานประจำเดือน' : 'Monthly Overview:'}</span>
              <span className="text-[#0A3D91]">{currentMonthLabel}</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                title={language === 'th' ? 'เดือนก่อนหน้า' : 'Previous Month'}
                className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>
                      {language === 'th' ? m.labelTh : m.labelEn}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                title={language === 'th' ? 'เดือนถัดไป' : 'Next Month'}
                className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'th' ? 'ส่งออกสรุป (CSV)' : 'Export CSV'}</span>
            </button>

            <Link
              to="/building-staff"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0A3D91] hover:bg-blue-900 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{language === 'th' ? 'จัดสรรช่างประจำตึก' : 'Staff Allocation'}</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {language === 'th' ? 'คำร้องในเดือนนี้' : 'Monthly Tickets'}
              </span>
              <div className="p-2 bg-blue-50 text-[#0A3D91] rounded-xl">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{totalMonthlyCount}</span>
                <span className="text-xs text-slate-500">{language === 'th' ? 'รายการ' : 'requests'}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>{language === 'th' ? 'เปิดใหม่:' : 'Open:'} <b>{openMonthlyCount}</b> | {language === 'th' ? 'รอดำเนินการ:' : 'Pending:'} <b>{pendingMonthlyCount}</b></span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {language === 'th' ? 'อัตราปิดงานสำเร็จ' : 'Resolution Rate'}
              </span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-600">{resolutionRate}%</span>
                <span className="text-xs text-emerald-700 font-medium">({completedMonthlyCount}/{totalMonthlyCount || 0})</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${resolutionRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {language === 'th' ? 'กำลังซ่อมแซม' : 'In Progress Workload'}
              </span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-indigo-600">{inProgressMonthlyCount}</span>
                <span className="text-xs text-slate-500">{language === 'th' ? 'งานที่ช่างกำลังทำ' : 'active tasks'}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>{language === 'th' ? 'โปรเกรสเฉลี่ยเดือนนี้:' : 'Avg Progress:'} <b>{averageProgress}%</b></span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {language === 'th' ? 'งานด่วนฉุกเฉิน' : 'Urgent Tickets'}
              </span>
              <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-red-600">{urgentMonthlyCount}</span>
                <span className="text-xs text-red-500 font-medium">{language === 'th' ? 'ต้องแก้ด่วน' : 'critical'}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {urgentMonthlyCount > 0
                  ? (language === 'th' ? '⚠️ มีงานซ่อมที่มีผลกระทบต่ออาคารสูง' : 'Immediate technician priority')
                  : (language === 'th' ? '✅ ไม่มีงานด่วนค้างในเดือนนี้' : 'No critical emergencies')}
              </p>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {language === 'th' ? 'แนวโน้มการแจ้งซ่อมรายสัปดาห์ในเดือนนี้' : 'Weekly Maintenance Progression'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'th' ? `เปรียบเทียบคำร้องเข้าใหม่ vs งานที่ปิดสำเร็จใน ${currentMonthLabel}` : `Tickets incoming vs resolved in ${currentMonthLabel}`}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#0A3D91]"></span>
                  <span>{language === 'th' ? 'คำร้องทั้งหมด' : 'Total Incoming'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span>{language === 'th' ? 'ซ่อมเสร็จแล้ว' : 'Resolved'}</span>
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A3D91" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#0A3D91" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="total" name={language === 'th' ? 'คำร้องทั้งหมด' : 'Total Tickets'} stroke="#0A3D91" strokeWidth={3} fillOpacity={1} fill="url(#totalGrad)" />
                  <Area type="monotone" dataKey="completed" name={language === 'th' ? 'ซ่อมเสร็จสิ้น' : 'Completed'} stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#completedGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {language === 'th' ? 'หมวดหมู่งานซ่อมในเดือนนี้' : 'Monthly Category Share'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'th' ? 'สัดส่วนปัญหาที่พบบ่อย' : 'Repair distribution by trade'}
              </p>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${val} ${language === 'th' ? 'รายการ' : 'tickets'}`, '']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              {categoryData.slice(0, 4).map((c, i) => (
                <div key={c.name} className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                  <span className="truncate">{c.name}: <b>{c.value}</b></span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {language === 'th' ? 'ตึกที่มีการแจ้งซ่อมมากที่สุด' : 'Top Campus Buildings'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'th' ? `จัดอันดับอาคารในเดือน ${currentMonthLabel}` : `Locations with most incidents in ${currentMonthLabel}`}
                </p>
              </div>
              <Link
                to="/building-staff"
                className="text-xs font-bold text-[#0A3D91] hover:underline flex items-center gap-1"
              >
                <span>{language === 'th' ? 'ดูการจัดสรรช่าง' : 'Manage Staff'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5 pt-1">
              {topBuildingsData.length > 0 ? (
                topBuildingsData.map((bldg, idx) => {
                  const percentOfTotal = totalMonthlyCount > 0 ? Math.round((bldg.total / totalMonthlyCount) * 100) : 0;
                  return (
                    <div key={bldg.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5 truncate max-w-50">
                          <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="truncate">{bldg.name}</span>
                        </span>
                        <span className="text-slate-500">
                          <b>{bldg.total}</b> {language === 'th' ? 'รายการ' : 'reqs'} ({percentOfTotal}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                        <div
                          className="bg-[#0A3D91] h-full"
                          style={{ width: `${(bldg.completed / (bldg.total || 1)) * 100}%` }}
                          title={`Completed: ${bldg.completed}`}
                        />
                        <div
                          className="bg-amber-400 h-full"
                          style={{ width: `${(bldg.active / (bldg.total || 1)) * 100}%` }}
                          title={`Active: ${bldg.active}`}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  {language === 'th' ? 'ไม่มีข้อมูลคำร้องในเดือนที่เลือก' : 'No building incidents in this month.'}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {language === 'th' ? 'รายการแจ้งซ่อมประจำเดือน' : 'Tickets for this Month'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'th' ? `แสดงรายการคำร้องที่ถูกแจ้งใน ${currentMonthLabel}` : `Recent submissions in ${currentMonthLabel}`}
                </p>
              </div>
              <Link
                to="/tickets"
                className="text-xs font-bold text-[#0A3D91] hover:underline flex items-center gap-1"
              >
                <span>{language === 'th' ? 'ดูทั้งหมดในตาราง' : 'View in Table'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">{language === 'th' ? 'รหัส / ปัญหา' : 'ID / Issue'}</th>
                    <th className="pb-3">{language === 'th' ? 'สถานที่' : 'Location'}</th>
                    <th className="pb-3">{language === 'th' ? 'ความคืบหน้า' : 'Progress'}</th>
                    <th className="pb-3">{language === 'th' ? 'สถานะ' : 'Status'}</th>
                    <th className="pb-3 text-right">{language === 'th' ? 'ช่าง' : 'Tech'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {monthlyTickets.slice(0, 5).map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => navigate(`/ticket/${t.id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 pr-2">
                        <span className="font-bold text-[#0A3D91] block">{t.id}</span>
                        <span className="text-slate-600 line-clamp-1 max-w-45">{t.issue}</span>
                      </td>
                      <td className="py-3 text-slate-600 pr-2">
                        <span className="line-clamp-1 max-w-35">{t.location}</span>
                      </td>
                      <td className="py-3 pr-2">
                        <div className="w-20">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 mb-0.5">
                            <span>{t.progress || (t.status === 'Completed' ? 100 : 25)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                t.status === 'Completed' ? 'bg-emerald-500' : 'bg-[#0A3D91]'
                              }`}
                              style={{ width: `${t.progress || (t.status === 'Completed' ? 100 : 25)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-600 font-medium whitespace-nowrap">
                        {t.assignedTo && t.assignedTo !== 'Unassigned' ? t.assignedTo.split(' ')[0] : '-'}
                      </td>
                    </tr>
                  ))}
                  {monthlyTickets.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        {language === 'th' ? 'ไม่มีรายการแจ้งซ่อมในเดือนนี้' : 'No maintenance tickets submitted this month.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
