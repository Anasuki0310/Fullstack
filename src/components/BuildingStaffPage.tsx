/**
 * @file BuildingStaffPage.tsx
 * @description หน้าระบบจัดการช่างซ่อมบำรุงและการจัดสรรบุคลากรประจำแต่ละอาคาร (Building Staff Allocation & Technician Management)
 * 
 * หน้าที่ของไฟล์นี้:
 * 1. แสดงและจัดการข้อมูลการจัดสรรช่างประจำอาคาร (Tab: อาคารและโซนรับผิดชอบ / Buildings Tab):
 *    - กรองตามโซนมหาวิทยาลัย (North, Central, South, Engineering) หรือค้นหาชื่อตึก
 *    - แสดงหัวหน้าช่างหลัก (Lead Tech) พร้อมเบอร์โทร และช่างสนับสนุน (Support Techs)
 *    - แสดงจำนวนงานซ่อมที่ค้างอยู่จริงในแต่ละตึก
 * 2. แสดงและจัดการทีมช่างทั้งหมด (Tab: ช่างซ่อมบำรุงทั้งหมด / Technicians Tab):
 *    - แสดงการ์ดข้อมูลช่าง, ความเชี่ยวชาญ, เบอร์โทร, อีเมล, สถานะ (พร้อมปฏิบัติงาน / ลางาน / กำลังซ่อม)
 *    - แสดงรายชื่ออาคารที่ช่างคนนี้รับผิดชอบอยู่
 * 3. ระบบเพิ่มช่างใหม่ (Modal 1: Add New Technician Modal):
 *    - กรอกชื่อ, เบอร์โทร, อีเมล, เลือกรูปภาพโปรไฟล์, เลือกตำแหน่งและความเชี่ยวชาญ
 *    - มีตัวเลือก "มาแทนที่ช่างเดิม": โอนย้ายงานทุกตึกของช่างเดิมให้ช่างคนใหม่ทันที
 * 4. ระบบเปลี่ยนตัวช่างแบบ 1-Click (Modal 2: 1-Click Replace Technician Modal):
 *    - โอนย้ายงานทุกอาคารของช่างคนหนึ่งไปยังช่างอีกคนโดยอัตโนมัติ
 * 5. ระบบยืนยันลบช่าง (Modal 3: Delete Technician Modal):
 *    - เลือกว่าจะโอนย้ายงานให้อีกคน หรือปรับสถานะเป็นว่าง (Unassigned)
 * 6. ระบบแก้ไขการจัดสรรช่างประจำอาคาร (Modal 4: Edit Building Allocation Modal):
 *    - เลือกหัวหน้าช่างและช่างสนับสนุนประจำตึก พร้อมบันทึกหมายเหตุระบบประจำตึก
 * 7. รองรับการกดปุ่ม Escape และคลิกพื้นที่ภายนอก (Backdrop Click) เพื่อปิด Modal ทุกตัวอย่างราบรื่น
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  UserCheck, 
  UserPlus,
  Phone, 
  Mail, 
  Search, 
  Filter, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  AlertCircle,
  ShieldCheck,
  Plus,
  RefreshCw,
  Sparkles,
  MapPin,
  Info,
  Trash2,
  ArrowRightLeft,
  Check,
  X
} from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { useRole } from '../contexts/RoleContext';
import { useTickets } from '../contexts/TicketContext';
import { useBuildingStaff, BuildingAllocation, TechnicianProfile } from '../contexts/BuildingStaffContext';
import { useToast } from '@/hooks/use-toast';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80',
];

export default function BuildingStaffPage() {
  const { language } = useLanguage();
  const { role } = useRole();
  const { toast } = useToast();
  const { tickets } = useTickets();
  const { 
    allocations, 
    technicians, 
    updateAllocation, 
    addTechnician,
    updateTechnician,
    deleteTechnician,
    replaceTechnician,
    resetToDefaults 
  } = useBuildingStaff();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'buildings' | 'technicians'>('buildings');

  // Modal State for Editing Allocation
  const [editingBuilding, setEditingBuilding] = useState<BuildingAllocation | null>(null);
  const [selectedLeadTech, setSelectedLeadTech] = useState<string>('');
  const [selectedSupportTechs, setSelectedSupportTechs] = useState<string[]>([]);
  const [buildingNotes, setBuildingNotes] = useState<string>('');

  // Modal State for Adding New Technician
  const [isAddTechModalOpen, setIsAddTechModalOpen] = useState(false);
  const [techFullName, setTechFullName] = useState('');
  const [techSpecialty, setTechSpecialty] = useState('Electrical');
  const [techRoleTh, setTechRoleTh] = useState('ช่างไฟฟ้าและระบบสื่อสาร');
  const [techRoleEn, setTechRoleEn] = useState('Electrical & Power Tech');
  const [techPhone, setTechPhone] = useState('');
  const [techEmail, setTechEmail] = useState('');
  const [techAvatar, setTechAvatar] = useState(PRESET_AVATARS[0]);
  const [techStatus, setTechStatus] = useState<'active' | 'on_leave' | 'busy'>('active');
  const [isReplacement, setIsReplacement] = useState(false);
  const [replacesTechName, setReplacesTechName] = useState('');

  // Modal State for 1-Click Replace Existing Technician
  const [replacingTech, setReplacingTech] = useState<TechnicianProfile | null>(null);
  const [replacementTargetName, setReplacementTargetName] = useState<string>('');

  // Modal State for Delete Technician
  const [techToDelete, setTechToDelete] = useState<TechnicianProfile | null>(null);
  const [deleteReplacementName, setDeleteReplacementName] = useState<string>('');

  const openEditModal = (building: BuildingAllocation) => {
    setEditingBuilding(building);
    setSelectedLeadTech(building.leadTechnician);
    setSelectedSupportTechs(building.supportTechnicians);
    setBuildingNotes(building.notes || '');
  };

  const closeEditModal = () => {
    setEditingBuilding(null);
  };

  // Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddTechModalOpen(false);
        setReplacingTech(null);
        setTechToDelete(null);
        setEditingBuilding(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSaveAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBuilding) return;

    updateAllocation(
      editingBuilding.id,
      selectedLeadTech,
      selectedSupportTechs,
      buildingNotes
    );

    toast({
      title: language === 'th' ? 'บันทึกการจัดสรรสำเร็จ' : 'Allocation Updated',
      description: language === 'th' 
        ? `อัปเดตช่างผู้รับผิดชอบสำหรับ "${editingBuilding.nameTh}" เรียบร้อยแล้ว`
        : `Staff allocation for "${editingBuilding.nameEn}" has been successfully updated.`,
    });

    closeEditModal();
  };

  const toggleSupportTech = (techName: string) => {
    if (techName === selectedLeadTech) return; // Lead tech cannot be support tech at same time
    if (selectedSupportTechs.includes(techName)) {
      setSelectedSupportTechs(selectedSupportTechs.filter(t => t !== techName));
    } else {
      setSelectedSupportTechs([...selectedSupportTechs, techName]);
    }
  };

  // Preset role labels when specialty changes
  const handleSpecialtyChange = (spec: string) => {
    setTechSpecialty(spec);
    switch (spec) {
      case 'Electrical':
        setTechRoleTh('ช่างไฟฟ้าและระบบสื่อสาร');
        setTechRoleEn('Electrical & Power Tech');
        break;
      case 'Plumbing':
        setTechRoleTh('ช่างประปาและสุขาภิบาล');
        setTechRoleEn('Plumbing & Sanitization Tech');
        break;
      case 'HVAC':
        setTechRoleTh('วิศวกรระบบปรับอากาศและความเย็น');
        setTechRoleEn('HVAC Specialist');
        break;
      case 'Carpentry':
        setTechRoleTh('ช่างไม้ อาคาร และโครงสร้าง');
        setTechRoleEn('Carpentry & Structural Tech');
        break;
      case 'AV/IT':
        setTechRoleTh('ช่างเทคนิคโสตทัศนูปกรณ์และเครือข่าย');
        setTechRoleEn('Audio/Visual & IT Tech');
        break;
      case 'Cleaning':
        setTechRoleTh('หัวหน้างานแม่บ้านและทำความสะอาด');
        setTechRoleEn('Custodial & Sanitation Supervisor');
        break;
      default:
        setTechRoleTh('ช่างซ่อมบำรุงทั่วไปประจำอาคาร');
        setTechRoleEn('General Maintenance Tech');
        break;
    }
  };

  // Submit Handler: Add New Technician
  const handleCreateTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    if (!techFullName.trim()) return;

    // Format display name: e.g., "Somchai K. (Electrician)"
    let displayName = techFullName.trim();
    if (!displayName.includes('(')) {
      displayName = `${displayName} (${techSpecialty})`;
    }

    const created = addTechnician(
      {
        name: displayName,
        roleTh: techRoleTh.trim() || 'ช่างซ่อมบำรุง',
        roleEn: techRoleEn.trim() || 'Maintenance Tech',
        specialty: techSpecialty,
        phone: techPhone.trim() || '081-000-0000',
        email: techEmail.trim() || `${techFullName.toLowerCase().replace(/\s+/g, '.')}@cmu.ac.th`,
        avatar: techAvatar,
        status: techStatus,
      },
      isReplacement && replacesTechName ? replacesTechName : undefined
    );

    toast({
      title: language === 'th' ? '🎉 เพิ่มช่างคนใหม่สำเร็จ!' : 'Technician Added!',
      description: isReplacement && replacesTechName
        ? (language === 'th' 
            ? `เพิ่ม "${created.name}" และโอนย้ายงานตึกจาก "${replacesTechName}" เรียบร้อยแล้ว`
            : `Added "${created.name}" and transferred building roles from "${replacesTechName}".`)
        : (language === 'th'
            ? `เพิ่ม "${created.name}" เข้าสู่ระบบเรียบร้อยแล้ว`
            : `Added "${created.name}" to the technician roster.`),
    });

    // Reset Form & Close
    setTechFullName('');
    setTechPhone('');
    setTechEmail('');
    setIsReplacement(false);
    setReplacesTechName('');
    setIsAddTechModalOpen(false);
  };

  // Handler: Replace Technician Assignments
  const handleConfirmReplace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacingTech || !replacementTargetName) return;

    replaceTechnician(replacingTech.name, replacementTargetName);

    toast({
      title: language === 'th' ? 'โอนย้ายความรับผิดชอบสำเร็จ' : 'Assignments Transferred',
      description: language === 'th'
        ? `โอนย้ายอาคารทั้งหมดของ "${replacingTech.name}" ให้กับ "${replacementTargetName}" เรียบร้อยแล้ว`
        : `Transferred all buildings from "${replacingTech.name}" to "${replacementTargetName}".`,
    });

    setReplacingTech(null);
    setReplacementTargetName('');
  };

  // Handler: Delete Technician
  const handleConfirmDelete = () => {
    if (!techToDelete) return;

    deleteTechnician(
      techToDelete.id, 
      deleteReplacementName && deleteReplacementName !== 'none' ? deleteReplacementName : undefined
    );

    toast({
      title: language === 'th' ? 'ลบช่างเรียบร้อยแล้ว' : 'Technician Removed',
      description: deleteReplacementName && deleteReplacementName !== 'none'
        ? (language === 'th'
            ? `ลบ "${techToDelete.name}" และโอนย้ายตึกให้ "${deleteReplacementName}" เรียบร้อย`
            : `Removed "${techToDelete.name}" and reassigned buildings to "${deleteReplacementName}".`)
        : (language === 'th'
            ? `ลบข้อมูล "${techToDelete.name}" ออกจากระบบแล้ว`
            : `Removed "${techToDelete.name}" from technician directory.`),
    });

    setTechToDelete(null);
    setDeleteReplacementName('');
  };

  // Filtered allocations
  const filteredAllocations = allocations.filter(b => {
    if (selectedZone !== 'all' && b.zone !== selectedZone) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.nameEn.toLowerCase().includes(q) || b.nameTh.toLowerCase().includes(q);
      const matchTech = b.leadTechnician.toLowerCase().includes(q) || b.supportTechnicians.some(t => t.toLowerCase().includes(q));
      const matchZone = b.zone.toLowerCase().includes(q);
      return matchName || matchTech || matchZone;
    }
    return true;
  });

  // Filtered technicians
  const filteredTechnicians = technicians.filter(t => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.roleTh.toLowerCase().includes(q) ||
        t.roleEn.toLowerCase().includes(q) ||
        t.specialty.toLowerCase().includes(q) ||
        t.phone.includes(q)
      );
    }
    return true;
  });

  // Calculate ticket counts per building
  const getTicketCountForBuilding = (bldgName: string) => {
    const clean = bldgName.toLowerCase();
    return tickets.filter(t => {
      const b = (t.building || t.location || '').toLowerCase();
      return b.includes(clean) || clean.includes(b);
    }).length;
  };

  const getActiveTicketCountForBuilding = (bldgName: string) => {
    const clean = bldgName.toLowerCase();
    return tickets.filter(t => {
      const b = (t.building || t.location || '').toLowerCase();
      const matchBldg = b.includes(clean) || clean.includes(b);
      return matchBldg && (t.status === 'Open' || t.status === 'Pending' || t.status === 'In Progress');
    }).length;
  };

  const zones = [
    { id: 'all', labelEn: 'All Zones', labelTh: 'ทุกโซนอาคาร' },
    { id: 'Engineering Zone', labelEn: 'Engineering Zone', labelTh: 'โซนวิศวกรรมศาสตร์' },
    { id: 'Central Campus', labelEn: 'Central Campus', labelTh: 'โซนกลางมหาวิทยาลัย' },
    { id: 'North Campus', labelEn: 'North Campus', labelTh: 'โซนเหนือ (วิทยาศาสตร์)' },
    { id: 'South Campus', labelEn: 'South Campus', labelTh: 'โซนใต้ (หอพัก/กีฬา)' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0A3D91] via-blue-900 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-blue-100 border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                <span>{language === 'th' ? 'ระบบผู้ดูแลระบบ (Admin Facility Management)' : 'Admin Facility Control'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {language === 'th' ? 'การจัดสรรพนักงานและระบบจัดการช่าง' : 'Building Staff Allocation & Technicians'}
              </h1>
              <p className="text-blue-100/90 text-sm max-w-2xl leading-relaxed">
                {language === 'th' 
                  ? 'มอบหมายและจัดสรรทีมช่างประจำแต่ละอาคาร เพิ่มช่างคนใหม่ หรือโอนย้ายช่างมาแทนที่เมื่อมีการเปลี่ยนบุคลากร' 
                  : 'Assign primary and support technicians to campus buildings, add new technicians, or transfer building duties to replacement staff.'}
              </p>
            </div>

            {/* Quick Summary Stats & Add Button */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="bg-white/15 rounded-xl p-3 px-4 border border-white/20 text-center shadow-xs">
                <span className="block text-2xl font-bold">{allocations.length}</span>
                <span className="text-[11px] text-blue-200">{language === 'th' ? 'อาคารที่ดูแล' : 'Buildings'}</span>
              </div>
              <div className="bg-white/15 rounded-xl p-3 px-4 border border-white/20 text-center shadow-xs">
                <span className="block text-2xl font-bold">{technicians.length}</span>
                <span className="text-[11px] text-blue-200">{language === 'th' ? 'ช่างในระบบ' : 'Technicians'}</span>
              </div>

              {/* Prominent Add Technician Button */}
              {role === 'admin' && (
                <button
                  type="button"
                  onClick={() => setIsAddTechModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer border border-emerald-400/60"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{language === 'th' ? 'เพิ่มช่างคนใหม่' : 'Add Technician'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab & Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('buildings')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'buildings'
                  ? 'bg-white text-[#0A3D91] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{language === 'th' ? 'อาคารและทีมช่าง' : 'Buildings & Teams'} ({allocations.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('technicians')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'technicians'
                  ? 'bg-white text-[#0A3D91] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{language === 'th' ? 'ทำเนียบช่างทั้งหมด' : 'Technician Directory'} ({technicians.length})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'th' ? 'ค้นหาชื่ออาคาร, ช่าง...' : 'Search building or tech...'}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:bg-white transition-all"
              />
            </div>

            {/* Zone Filter (Only on buildings tab) */}
            {activeTab === 'buildings' ? (
              <div className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {language === 'th' ? z.labelTh : z.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              /* Add Tech Shortcut on Tech Tab */
              role === 'admin' && (
                <button
                  type="button"
                  onClick={() => setIsAddTechModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A3D91] hover:bg-blue-900 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'th' ? 'เพิ่มช่างใหม่' : 'New Tech'}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Tab Content 1: Buildings & Staff Allocation Cards */}
        {activeTab === 'buildings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAllocations.map((building) => {
              const activeTicketsCount = getActiveTicketCountForBuilding(building.nameEn);
              const totalTicketsCount = getTicketCountForBuilding(building.nameEn);
              const leadTech = technicians.find(t => t.name === building.leadTechnician);

              return (
                <div
                  key={building.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Top Zone Indicator Bar */}
                  <div className={`h-1.5 w-full absolute top-0 left-0 ${
                    building.zone === 'Engineering Zone' ? 'bg-blue-600' :
                    building.zone === 'North Campus' ? 'bg-emerald-500' :
                    building.zone === 'Central Campus' ? 'bg-amber-500' : 'bg-purple-600'
                  }`} />

                  <div className="space-y-4">
                    {/* Building Name & Zone Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                            {building.zone}
                          </span>
                          {activeTicketsCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertCircle className="w-2.5 h-2.5" />
                              {activeTicketsCount} {language === 'th' ? 'งานค้าง' : 'Active'}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-[#0A3D91] transition-colors">
                          {language === 'th' ? building.nameTh : building.nameEn}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1">{building.nameEn}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => openEditModal(building)}
                        title={language === 'th' ? 'แก้ไขการจัดสรรช่าง' : 'Edit Allocation'}
                        className="p-1.5 text-slate-400 hover:text-[#0A3D91] hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100 cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Primary Lead Technician Card */}
                    <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-xs bg-blue-200">
                        {leadTech?.avatar ? (
                          <img src={leadTech.avatar} alt={building.leadTechnician} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-blue-800 text-xs">
                            {building.leadTechnician.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                            {language === 'th' ? 'หัวหน้าช่างประจำตึก' : 'Lead Tech'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                          {building.leadTechnician}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-0.5">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {building.leadTechnicianPhone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Support Technicians */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        {language === 'th' ? 'ทีมช่างสนับสนุนประจำพื้นที่:' : 'Support Technicians:'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {building.supportTechnicians.length > 0 ? (
                          building.supportTechnicians.map((st) => (
                            <span
                              key={st}
                              className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                            >
                              <Wrench className="w-2.5 h-2.5 text-slate-500" />
                              {st}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            {language === 'th' ? 'ไม่มีช่างสนับสนุนเสริม' : 'No secondary tech'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Facility Notes */}
                    {building.notes && (
                      <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{building.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px]">
                      {language === 'th' ? 'สถิติคำร้องสะสม:' : 'Total Tickets:'} <b>{totalTicketsCount}</b>
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditModal(building)}
                      className="text-[#0A3D91] hover:underline font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>{language === 'th' ? 'ปรับเปลี่ยนช่าง' : 'Reassign'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab Content 2: Full Technician Directory & Management */}
        {activeTab === 'technicians' && (
          <div className="space-y-4">
            
            {/* Top Subheader for Tech Tab */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-900 block sm:inline">
                  {language === 'th' ? 'รายชื่อช่างผู้เชี่ยวชาญทั้งหมดในระบบ' : 'Campus Maintenance Technicians'}
                </span>
                <span className="hidden sm:inline mx-1.5">|</span>
                <span>
                  {language === 'th' 
                    ? 'คุณสามารถเพิ่มช่างคนใหม่ โอนย้ายความรับผิดชอบ หรือเปลี่ยนช่างมาแทนที่ได้ที่นี่' 
                    : 'Add new technicians or reassign duties to replacements.'}
                </span>
              </div>

              {role === 'admin' && (
                <button
                  type="button"
                  onClick={() => setIsAddTechModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{language === 'th' ? '+ เพิ่มช่างคนใหม่' : '+ Add Technician'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTechnicians.map((tech) => {
                const leadBldgs = allocations.filter(b => b.leadTechnician === tech.name);
                const supportBldgs = allocations.filter(b => b.supportTechnicians.includes(tech.name));
                const assignedTickets = tickets.filter(t => t.assignedTo === tech.name);
                const activeTickets = assignedTickets.filter(t => t.status !== 'Completed');

                return (
                  <div
                    key={tech.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      
                      {/* Top Row: Avatar & Status & Actions */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-blue-100 shadow-xs bg-slate-100">
                          <img src={tech.avatar} alt={tech.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                              tech.status === 'active' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : tech.status === 'busy'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                tech.status === 'active' ? 'bg-emerald-500' : tech.status === 'busy' ? 'bg-amber-500' : 'bg-slate-400'
                              }`}></span>
                              {tech.status === 'active' ? (language === 'th' ? 'พร้อมงาน' : 'Active') : tech.status === 'busy' ? (language === 'th' ? 'ติดงาน' : 'Busy') : (language === 'th' ? 'ลาพัก' : 'Leave')}
                            </span>

                            {/* Admin Quick Action Controls */}
                            {role === 'admin' && (
                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReplacingTech(tech);
                                    setReplacementTargetName('');
                                  }}
                                  title={language === 'th' ? 'หาช่างมาแทนที่คนนี้' : 'Replace Technician'}
                                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTechToDelete(tech);
                                    setDeleteReplacementName('');
                                  }}
                                  title={language === 'th' ? 'ลบช่างคนนี้' : 'Delete Technician'}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          <h3 className="font-bold text-slate-900 text-sm mt-1 truncate">
                            {tech.name}
                          </h3>
                          <p className="text-xs text-[#0A3D91] font-semibold truncate">
                            {language === 'th' ? tech.roleTh : tech.roleEn}
                          </p>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-600 space-y-1.5 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{tech.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{tech.email}</span>
                        </div>
                      </div>

                      {/* Assigned Buildings Breakdown */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                          <span>{language === 'th' ? 'อาคารที่ดูแลหลัก (Lead):' : 'Lead Buildings:'}</span>
                          <span className="text-[#0A3D91] font-bold">{leadBldgs.length} {language === 'th' ? 'แห่ง' : 'locations'}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {leadBldgs.length > 0 ? (
                            leadBldgs.map(b => (
                              <span
                                key={b.id}
                                className="text-[10px] font-medium bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 truncate max-w-[200px]"
                              >
                                🏢 {language === 'th' ? b.nameTh : b.nameEn}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              {language === 'th' ? 'ยังไม่ได้มอบหมายตึกหลัก' : 'No lead building'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Active Workload Indicator & Quick Replace Trigger */}
                    <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">
                        {language === 'th' ? 'งานซ่อมค้าง:' : 'Active Tasks:'} <b>{activeTickets.length}</b>
                      </span>

                      {role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setReplacingTech(tech);
                            setReplacementTargetName('');
                          }}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>{language === 'th' ? 'โอนงานให้ช่างอื่น' : 'Reassign'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1: ADD NEW TECHNICIAN (พร้อมตัวเลือกมาแทนที่ช่างเดิม) */}
        {/* ========================================================================= */}
        {isAddTechModalOpen && (
          <div 
            onClick={(e) => { if (e.target === e.currentTarget) setIsAddTechModalOpen(false); }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden transform transition-all max-h-[92vh] flex flex-col">
              
              {/* Modal Header */}
              <div className="bg-[#0A3D91] text-white p-5 px-6 flex items-start justify-between shrink-0">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs text-blue-200 font-medium mb-1">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{language === 'th' ? 'ทะเบียนบุคลากรช่าง' : 'Technician Management'}</span>
                  </div>
                  <h3 className="text-lg font-bold">
                    {language === 'th' ? 'เพิ่มช่างคนใหม่ / บรรจุช่างมาแทนที่' : 'Add New Technician / Replacement'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {language === 'th' 
                      ? 'กรอกข้อมูลช่างคนใหม่เพื่อเพิ่มในระบบและเลือกโอนย้ายงานตึกได้ทันที' 
                      : 'Register new personnel and optionally reassign existing building duties.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddTechModalOpen(false)}
                  className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Scrollable Form */}
              <form onSubmit={handleCreateTechnician} className="p-6 space-y-4 overflow-y-auto">
                
                {/* 1. Name & Specialty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      {language === 'th' ? 'ชื่อ-นามสกุลช่าง' : 'Full Name'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={techFullName}
                      onChange={(e) => setTechFullName(e.target.value)}
                      placeholder="e.g. Wichai S. หรือ สมนึก ดีแท้"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-[#0A3D91] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      {language === 'th' ? 'สายงานความเชี่ยวชาญ' : 'Specialty'}
                    </label>
                    <select
                      value={techSpecialty}
                      onChange={(e) => handleSpecialtyChange(e.target.value)}
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-[#0A3D91] focus:outline-none cursor-pointer"
                    >
                      <option value="Electrical">⚡ ไฟฟ้าและสื่อสาร (Electrical)</option>
                      <option value="Plumbing">🚰 ประปาและสุขาภิบาล (Plumbing)</option>
                      <option value="HVAC">❄️ เครื่องปรับอากาศ (HVAC)</option>
                      <option value="Carpentry">🔨 โครงสร้างและงานไม้ (Carpentry)</option>
                      <option value="AV/IT">💻 โสตทัศนูปกรณ์และไอที (AV/IT)</option>
                      <option value="Cleaning">🧹 สุขอนามัยและความสะอาด (Cleaning)</option>
                      <option value="General">🛠️ ซ่อมบำรุงทั่วไป (General)</option>
                    </select>
                  </div>
                </div>

                {/* 2. Role Title in Thai & English */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      {language === 'th' ? 'ตำแหน่งงาน (ภาษาไทย)' : 'Role Title (TH)'}
                    </label>
                    <input
                      type="text"
                      value={techRoleTh}
                      onChange={(e) => setTechRoleTh(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-[#0A3D91] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      {language === 'th' ? 'ตำแหน่งงาน (ภาษาอังกฤษ)' : 'Role Title (EN)'}
                    </label>
                    <input
                      type="text"
                      value={techRoleEn}
                      onChange={(e) => setTechRoleEn(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-[#0A3D91] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 3. Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      {language === 'th' ? 'เบอร์โทรศัพท์ติดต่อ' : 'Phone Number'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={techPhone}
                      onChange={(e) => setTechPhone(e.target.value)}
                      placeholder="081-234-5678"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-[#0A3D91] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      {language === 'th' ? 'อีเมลมหาวิทยาลัย' : 'Email'}
                    </label>
                    <input
                      type="email"
                      value={techEmail}
                      onChange={(e) => setTechEmail(e.target.value)}
                      placeholder="technician@cmu.ac.th"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-[#0A3D91] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 4. Avatar Presets */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    {language === 'th' ? 'เลือกรูปภาพประจำตัวช่าง' : 'Select Avatar Preset'}
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {PRESET_AVATARS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTechAvatar(av)}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer relative ${
                          techAvatar === av ? 'border-[#0A3D91] ring-2 ring-blue-300 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={av} alt="Avatar" className="w-full h-full object-cover" />
                        {techAvatar === av && (
                          <div className="absolute inset-0 bg-[#0A3D91]/40 flex items-center justify-center text-white">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. ⭐ REPLACEMENT FEATURE: มาแทนที่ช่างคนเดิมหรือไม่? */}
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      id="isReplacementCheck"
                      type="checkbox"
                      checked={isReplacement}
                      onChange={(e) => {
                        setIsReplacement(e.target.checked);
                        if (!e.target.checked) setReplacesTechName('');
                        else if (!replacesTechName && technicians.length > 0) {
                          setReplacesTechName(technicians[0].name);
                        }
                      }}
                      className="rounded text-[#0A3D91] focus:ring-[#0A3D91] h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="isReplacementCheck" className="text-xs font-bold text-amber-900 cursor-pointer flex items-center gap-1.5">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-amber-700" />
                      <span>{language === 'th' ? 'ช่างท่านนี้มาแทนที่ช่างคนเดิมในระบบ' : 'This technician replaces an existing technician'}</span>
                    </label>
                  </div>

                  {isReplacement && (
                    <div className="pt-2 border-t border-amber-200/80 animate-in fade-in space-y-2">
                      <label className="block text-[11px] font-bold text-amber-950 uppercase">
                        {language === 'th' ? 'เลือกช่างคนเดิมที่ต้องการให้มาแทนที่:' : 'Select who this technician is replacing:'}
                      </label>
                      <select
                        value={replacesTechName}
                        onChange={(e) => setReplacesTechName(e.target.value)}
                        className="w-full text-xs font-bold bg-white border border-amber-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        {technicians.map((t) => (
                          <option key={t.id} value={t.name}>
                            {t.name} — {t.roleTh} ({allocations.filter(b => b.leadTechnician === t.name).length} อาคาร)
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-amber-800 leading-snug">
                        💡 <b>ระบบจะอัปเดตอัตโนมัติ:</b> อาคารทั้งหมดที่ช่างคนเดิมเป็นหัวหน้าช่าง (Lead) หรือทีมสนับสนุน (Support) จะถูกโอนย้ายมาให้ช่างคนใหม่นี้ดูแลแทนทันที
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsAddTechModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{language === 'th' ? 'บันทึกเพิ่มช่าง' : 'Register Technician'}</span>
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: 1-CLICK REPLACE TECHNICIAN (โอนย้ายงานให้ช่างคนอื่น) */}
        {/* ========================================================================= */}
        {replacingTech && (
          <div 
            onClick={(e) => { if (e.target === e.currentTarget) setReplacingTech(null); }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden transform transition-all">
              
              <div className="bg-indigo-900 text-white p-5 px-6 flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs text-indigo-200 font-medium mb-1">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>{language === 'th' ? 'โอนย้ายหน้าที่ประจำอาคาร' : 'Transfer Assignments'}</span>
                  </div>
                  <h3 className="text-lg font-bold">
                    {language === 'th' ? 'เปลี่ยนช่างมาแทนที่' : 'Replace Technician'}
                  </h3>
                  <p className="text-xs text-indigo-100 mt-0.5">
                    {replacingTech.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReplacingTech(null)}
                  className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConfirmReplace} className="p-6 space-y-4">
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <p><b>{language === 'th' ? 'ช่างปัจจุบัน:' : 'Current Tech:'}</b> {replacingTech.name}</p>
                  <p>
                    <b>{language === 'th' ? 'อาคารที่ดูแลหลัก:' : 'Lead Buildings:'}</b>{' '}
                    {allocations.filter(b => b.leadTechnician === replacingTech.name).length} {language === 'th' ? 'แห่ง' : 'buildings'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    {language === 'th' ? 'เลือกช่างคนใหม่ที่จะมารับหน้าที่แทน:' : 'Select New Replacement Technician:'}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    required
                    value={replacementTargetName}
                    onChange={(e) => setReplacementTargetName(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  >
                    <option value="" disabled>
                      -- {language === 'th' ? 'เลือกช่างที่มาแทนที่' : 'Select replacement tech'} --
                    </option>
                    {technicians.filter(t => t.id !== replacingTech.id).map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.specialty}) — {t.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setReplacingTech(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={!replacementTargetName}
                    className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>{language === 'th' ? 'ยืนยันโอนย้ายงาน' : 'Confirm Replacement'}</span>
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: DELETE TECHNICIAN CONFIRMATION */}
        {/* ========================================================================= */}
        {techToDelete && (
          <div 
            onClick={(e) => { if (e.target === e.currentTarget) setTechToDelete(null); }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden transform transition-all">
              <div className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-900">
                    {language === 'th' ? 'ยืนยันการลบช่างออกจากระบบ?' : 'Delete Technician?'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'th' 
                      ? `คุณกำลังจะลบ "${techToDelete.name}" ออกจากระบบช่าง`
                      : `You are about to remove "${techToDelete.name}".`}
                  </p>
                </div>

                {/* If tech is assigned to buildings, prompt replacement */}
                {allocations.some(b => b.leadTechnician === techToDelete.name) && (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs space-y-2">
                    <p className="font-bold text-amber-900">
                      ⚠️ ช่างท่านนี้มีอาคารที่ดูแลหลักอยู่ {allocations.filter(b => b.leadTechnician === techToDelete.name).length} แห่ง
                    </p>
                    <label className="block text-[11px] font-semibold text-slate-700">
                      {language === 'th' ? 'เลือกช่างที่จะเข้ามารับช่วงต่อ (แนะนำ):' : 'Reassign buildings to:'}
                    </label>
                    <select
                      value={deleteReplacementName}
                      onChange={(e) => setDeleteReplacementName(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-amber-300 rounded-lg p-2"
                    >
                      <option value="none">-- {language === 'th' ? 'ไม่ระบุ (ปล่อยเป็น Unassigned)' : 'Leave Unassigned'} --</option>
                      {technicians.filter(t => t.id !== techToDelete.id).map(t => (
                        <option key={t.id} value={t.name}>{t.name} ({t.phone})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTechToDelete(null)}
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
                    <span>{language === 'th' ? 'ยืนยันลบช่าง' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 4: EDIT BUILDING ALLOCATION MODAL */}
        {/* ========================================================================= */}
        {editingBuilding && (
          <div 
            onClick={(e) => { if (e.target === e.currentTarget) closeEditModal(); }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden transform transition-all">
              
              {/* Modal Header */}
              <div className="bg-[#0A3D91] text-white p-5 px-6 flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs text-blue-200 font-medium mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{editingBuilding.zone}</span>
                  </div>
                  <h3 className="text-lg font-bold">
                    {language === 'th' ? 'จัดสรรช่างผู้รับผิดชอบ' : 'Edit Staff Allocation'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {language === 'th' ? editingBuilding.nameTh : editingBuilding.nameEn}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveAllocation} className="p-6 space-y-5">
                
                {/* 1. Primary Lead Technician Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    {language === 'th' ? '🛠️ ช่างผู้รับผิดชอบหลัก (Primary Lead Tech)' : 'Primary Lead Technician'}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={selectedLeadTech}
                    onChange={(e) => {
                      const newLead = e.target.value;
                      setSelectedLeadTech(newLead);
                      setSelectedSupportTechs(selectedSupportTechs.filter(t => t !== newLead));
                    }}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-[#0A3D91] focus:outline-none cursor-pointer"
                    required
                  >
                    {technicians.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} — {t.roleTh} ({t.phone})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {language === 'th' 
                      ? 'คำร้องใหม่ที่แจ้งเข้ามายังอาคารนี้ จะได้รับการแนะนำหรือมอบหมายให้ช่างท่านนี้เป็นลำดับแรก' 
                      : 'New repair tickets in this building will default to this lead specialist.'}
                  </p>
                </div>

                {/* 2. Support Technicians Multi-Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    {language === 'th' ? '🤝 ทีมช่างสนับสนุนสำรอง (Support Technicians)' : 'Support Technicians'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {technicians.map((t) => {
                      const isLead = t.name === selectedLeadTech;
                      const isSelected = selectedSupportTechs.includes(t.name);

                      return (
                        <button
                          key={t.id}
                          type="button"
                          disabled={isLead}
                          onClick={() => toggleSupportTech(t.name)}
                          className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-all border cursor-pointer ${
                            isLead 
                              ? 'opacity-40 bg-slate-200 border-slate-300 cursor-not-allowed'
                              : isSelected
                              ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isLead}
                            readOnly
                            className="rounded text-[#0A3D91] pointer-events-none"
                          />
                          <div className="truncate">
                            <p className="font-semibold truncate">{t.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{t.specialty}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Building Facility Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    {language === 'th' ? '📝 บันทึกข้อมูลเฉพาะของอาคาร (Facility Notes)' : 'Facility Notes'}
                  </label>
                  <textarea
                    rows={2}
                    value={buildingNotes}
                    onChange={(e) => setBuildingNotes(e.target.value)}
                    placeholder={language === 'th' ? 'ระบุลักษณะระบบไฟ ท่อแอร์ หรือข้อควรระวังในอาคารนี้...' : 'Special building equipment, access keys, or hazards...'}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-[#0A3D91] focus:outline-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-[#0A3D91] hover:bg-blue-900 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {language === 'th' ? 'บันทึกการจัดสรร' : 'Save Allocation'}
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
