import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AlertCircle,
  Clock,
  CheckCircle2,
  FileWarning
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useRole } from '../contexts/RoleContext';
import { useTickets } from '../contexts/TicketContext';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import DashboardLayout from './DashboardLayout';

// Mock Data for Charts
const repairTrendsData = [
  { name: 'Mon', tickets: 12 },
  { name: 'Tue', tickets: 19 },
  { name: 'Wed', tickets: 15 },
  { name: 'Thu', tickets: 22 },
  { name: 'Fri', tickets: 28 },
  { name: 'Sat', tickets: 10 },
  { name: 'Sun', tickets: 5 },
];

const categoryData = [
  { name: 'Plumbing', value: 35 },
  { name: 'Electrical', value: 25 },
  { name: 'HVAC', value: 20 },
  { name: 'Carpentry', value: 15 },
  { name: 'Other', value: 5 },
];
const COLORS = ['#0A3D91', '#f59e0b', '#10b981', '#6366f1', '#94a3b8'];

// Mock Data for Table
const recentTickets = [
  { id: 'TKT-2041', desc: 'Leaking pipe in Science Bldg', location: 'Science Hall 302', priority: 'High', status: 'In Progress', tech: 'John Smith', date: 'Oct 24, 2023' },
  { id: 'TKT-2042', desc: 'Projector mount broken', location: 'Business Annex 101', priority: 'Medium', status: 'Open', tech: 'Unassigned', date: 'Oct 24, 2023' },
  { id: 'TKT-2038', desc: 'AC not cooling', location: 'Dormitory A, Rm 412', priority: 'High', status: 'In Progress', tech: 'Mike Johnson', date: 'Oct 23, 2023' },
  { id: 'TKT-2035', desc: 'Squeaky door hinge', location: 'Library Main Entrance', priority: 'Low', status: 'Completed', tech: 'Sarah Lee', date: 'Oct 22, 2023' },
  { id: 'TKT-2031', desc: 'Flickering lights', location: 'Gymnasium', priority: 'Medium', status: 'Open', tech: 'David Chen', date: 'Oct 21, 2023' },
];

export default function DashboardPage() {
  const { language } = useLanguage();
  const { role } = useRole();
  const navigate = useNavigate();
  const { tickets } = useTickets();

  useEffect(() => {
    if (role === 'student') {
      navigate('/tickets', { replace: true });
    }
  }, [role, navigate]);

  if (role === 'student') {
    return null;
  }

  const openCount = tickets.filter(t => t.status === 'Open').length;
  const pendingCount = tickets.filter(t => t.status === 'Pending').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const completedCount = tickets.filter(t => t.status === 'Completed').length;

  const displayRecentTickets = tickets.slice(0, 5);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Low':
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
      case 'Open':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{language === 'th' ? 'แดชบอร์ดการแจ้งซ่อม' : 'Maintenance Dashboard'}</h2>
          <p className="text-sm text-slate-500 mt-1">{language === 'th' ? 'ติดตามสถิติการแจ้งซ่อมและกิจกรรมล่าสุด' : 'Monitor campus maintenance metrics and recent activities.'}</p>
        </div>

        {/* Summary Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Open Tickets */}
          <Link 
            to="/tickets?status=open"
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between group hover:shadow-md hover:border-blue-300 cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 group-hover:text-[#0A3D91] transition-colors">{language === 'th' ? 'งานเปิดใหม่' : 'Open Tickets'}</h3>
              <div className="p-2 bg-blue-50 text-[#0A3D91] rounded-lg group-hover:bg-blue-100 transition-colors">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-bold text-slate-900">42</span>
              <p className="text-xs font-medium text-slate-500 mt-1 flex items-center">
                <span className="text-green-600 mr-1">↓ 12%</span> from last week
              </p>
            </div>
          </Link>

          {/* Card 2: Pending Repairs */}
          <Link 
            to="/tickets?status=pending"
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between group hover:shadow-md hover:border-amber-300 cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 group-hover:text-amber-700 transition-colors">{language === 'th' ? 'รอดำเนินการ' : 'Pending Repairs'}</h3>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100 transition-colors">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-bold text-slate-900">18</span>
              <p className="text-xs font-medium text-slate-500 mt-1 flex items-center">
                <span className="text-red-600 mr-1">↑ 4%</span> from last week
              </p>
            </div>
          </Link>

          {/* Card 3: Completed Repairs */}
          <Link 
            to="/tickets?status=completed"
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between group hover:shadow-md hover:border-green-300 cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 group-hover:text-green-700 transition-colors">{language === 'th' ? 'ซ่อมเสร็จสิ้น' : 'Completed Repairs'}</h3>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition-colors">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-bold text-slate-900">128</span>
              <p className="text-xs font-medium text-slate-500 mt-1 flex items-center">
                <span className="text-green-600 mr-1">↑ 22%</span> from last month
              </p>
            </div>
          </Link>

          {/* Card 4: Urgent Tickets */}
          <Link 
            to="/tickets?priority=urgent"
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between group hover:shadow-md hover:border-red-300 cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 group-hover:text-red-700 transition-colors">{language === 'th' ? 'งานเร่งด่วน' : 'Urgent Tickets'}</h3>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors">
                <FileWarning className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-bold text-slate-900">5</span>
              <p className="text-xs font-medium text-slate-500 mt-1 flex items-center">
                Requires immediate action
              </p>
            </div>
          </Link>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Line Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-6">Repair Trends (Past 7 Days)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={repairTrendsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="tickets" stroke="#0A3D91" strokeWidth={3} dot={{ r: 4, fill: '#0A3D91', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-6">Maintenance by Category</h3>
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    itemStyle={{ color: '#0f172a' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Tickets Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">{language === 'th' ? 'รายการแจ้งซ่อมล่าสุด' : 'Recent Tickets'}</h3>
            <Link to="/tickets" className="text-sm font-medium text-[#0A3D91] hover:text-blue-800 transition-colors">
              {language === 'th' ? 'ดูทั้งหมด' : 'View All'}
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-semibold text-slate-500">
                  <th className="p-4 pl-6 whitespace-nowrap">Ticket ID</th>
                  <th className="p-4 whitespace-nowrap">Description</th>
                  <th className="p-4 whitespace-nowrap">Location</th>
                  <th className="p-4 whitespace-nowrap">Priority</th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                  <th className="p-4 whitespace-nowrap">Assigned Tech</th>
                  <th className="p-4 pr-6 whitespace-nowrap text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {displayRecentTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/ticket/${ticket.id}`)}
                  >
                    <td className="p-4 pl-6 font-medium text-[#0A3D91] group-hover:underline whitespace-nowrap">
                      {ticket.id}
                    </td>
                    <td className="p-4 text-slate-700 min-w-[200px]">
                      {ticket.issue}
                    </td>
                    <td className="p-4 text-slate-500 whitespace-nowrap">
                      {ticket.location}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 whitespace-nowrap">
                      {ticket.assignedTo}
                    </td>
                    <td className="p-4 pr-6 text-slate-500 text-right whitespace-nowrap">
                      {ticket.submittedDate || ticket.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
