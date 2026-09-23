import React from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { useTickets } from '../contexts/TicketContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  MessageSquare, 
  Check, 
  Phone, 
  Mail, 
  MessageCircle,
  FileText,
  ArrowLeft,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function TicketDetailsPage() {
  const { id } = useParams();
  const { getTicketById } = useTickets();
  const { language } = useLanguage();
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completed':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'High':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Low':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        
        {/* Back link */}
        <div className="mb-4">
          <Link to="/tickets" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-[#0A3D91] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            {language === 'th' ? 'กลับไปหน้ารายการแจ้งซ่อม' : 'Back to Requests'}
          </Link>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
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
          <button className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 transition-colors">
            <MessageSquare className="w-4 h-4 mr-2" />
            {language === 'th' ? 'เพิ่มความคิดเห็น' : 'Add Comment'}
          </button>
        </div>

        {/* 3-Column Grid Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Ticket Info */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0A3D91]" />
              <h3 className="font-semibold text-lg text-slate-900">
                {language === 'th' ? 'ข้อมูลคำร้อง' : 'Information'}
              </h3>
            </div>
            <div className="p-6 space-y-6 flex-1">
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

          {/* Middle Column: Tracking Timeline */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-semibold text-lg text-slate-900">
                {language === 'th' ? 'สถานะการดำเนินงาน' : 'Tracking Timeline'}
              </h3>
            </div>
            <div className="p-6 flex-1">
              <div className="relative pl-3 mt-2">
                {/* Vertical Line */}
                <div className="absolute top-2 bottom-4 left-6 w-0.5 bg-slate-200"></div>

                {/* Step 1: Ticket Created */}
                <div className="relative flex items-start gap-4 mb-8">
                  <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm mt-0.5">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {language === 'th' ? 'ส่งคำร้องแล้ว' : 'Ticket Created'}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{submittedDate}</p>
                  </div>
                </div>

                {/* Step 2: Assigned */}
                <div className={`relative flex items-start gap-4 mb-8 ${ticketStatus === 'Pending' ? 'opacity-60' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm mt-0.5 ${
                    ticketStatus === 'Pending' ? 'bg-amber-400' : 'bg-green-500'
                  }`}>
                    {ticketStatus === 'Pending' ? (
                      <Clock className="w-3 h-3 text-white" strokeWidth={3} />
                    ) : (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {ticketStatus === 'Pending' 
                        ? (language === 'th' ? 'รอเจ้าหน้าที่รับเรื่อง' : 'Awaiting Assignment')
                        : (language === 'th' ? 'มอบหมายช่างแล้ว' : 'Assigned to Technician')}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {ticketStatus === 'Pending' 
                        ? (language === 'th' ? 'อยู่ระหว่างรอการจัดสรรช่าง' : 'Pending technician assignment')
                        : assignedTo}
                    </p>
                  </div>
                </div>

                {/* Step 3: In Progress */}
                <div className={`relative flex items-start gap-4 mb-8 ${
                  ticketStatus === 'In Progress' ? '' : 'opacity-40'
                }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm mt-0.5 ${
                    ticketStatus === 'In Progress' 
                      ? 'bg-[#0A3D91]' 
                      : ticketStatus === 'Completed' ? 'bg-green-500' : 'bg-slate-200'
                  }`}>
                    {ticketStatus === 'In Progress' ? (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    ) : ticketStatus === 'Completed' ? (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    ) : (
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <h4 className={`text-sm font-bold ${ticketStatus === 'In Progress' ? 'text-[#0A3D91]' : 'text-slate-700'}`}>
                      {language === 'th' ? 'กำลังดำเนินการซ่อม' : 'In Progress'}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {ticketStatus === 'In Progress'
                        ? (language === 'th' ? 'ช่างกำลังตรวจสอบและดำเนินการ' : 'Technician is actively working')
                        : (language === 'th' ? 'รอเริ่มงาน' : 'Pending start')}
                    </p>
                  </div>
                </div>

                {/* Step 4: Closed / Completed */}
                <div className={`relative flex items-start gap-4 ${ticketStatus === 'Completed' ? '' : 'opacity-40'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm mt-0.5 ${
                    ticketStatus === 'Completed' ? 'bg-green-500' : 'bg-slate-200'
                  }`}>
                    {ticketStatus === 'Completed' ? (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    ) : (
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">
                      {language === 'th' ? 'ดำเนินการเสร็จสิ้น' : 'Resolved / Closed'}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {ticketStatus === 'Completed'
                        ? (language === 'th' ? 'งานซ่อมเสร็จสมบูรณ์' : 'Repairs successfully finished')
                        : (language === 'th' ? 'รอดำเนินการ' : 'Pending')}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Assigned Technician or Assignment Info */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-semibold text-lg text-slate-900">
                {language === 'th' ? 'ช่างผู้รับผิดชอบ' : 'Assigned Technician'}
              </h3>
            </div>
            
            <div className="p-6 flex flex-col items-center flex-1">
              <div className="relative mb-5 mt-2">
                <div className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-md overflow-hidden bg-slate-100 flex items-center justify-center">
                  <img 
                    src={assignedTo !== 'Unassigned' ? "https://i.pravatar.cc/150?u=tech1" : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                    alt={assignedTo} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div 
                  className={`absolute bottom-1 right-1 w-4 h-4 border-2 border-white rounded-full ${
                    assignedTo !== 'Unassigned' ? 'bg-green-500' : 'bg-amber-400'
                  }`}
                  title={assignedTo !== 'Unassigned' ? "Active" : "Awaiting"}
                ></div>
              </div>
              
              <h4 className="text-xl font-bold text-slate-900 text-center">
                {assignedTo !== 'Unassigned' ? assignedTo : (language === 'th' ? 'รอการมอบหมายช่าง' : 'Awaiting Assignment')}
              </h4>
              <p className="text-sm font-medium text-[#0A3D91] mt-1 mb-8 bg-blue-50 px-3 py-1 rounded-full">
                {categoryStr} {language === 'th' ? 'ทีมช่างวิศวกรรม' : 'Maintenance Team'}
              </p>

              <div className="w-full space-y-4 mb-8">
                <div className="flex items-center text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mr-3 shrink-0 border border-slate-100 text-slate-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-slate-700 font-medium">02-555-1234 ext. 889</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mr-3 shrink-0 border border-slate-100 text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-slate-700 font-medium">facilities@eng.cmu.ac.th</span>
                </div>
              </div>

              <div className="mt-auto w-full pt-4">
                <button className="w-full flex items-center justify-center px-4 py-2.5 border-2 border-[#0A3D91] rounded-lg text-sm font-bold text-[#0A3D91] hover:bg-[#0A3D91] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A3D91]">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {language === 'th' ? 'ติดต่อฝ่ายซ่อมบำรุง' : 'Contact Support'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
