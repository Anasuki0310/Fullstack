import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from './DashboardLayout';
import { CloudUpload, X, Camera, Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTickets } from '../contexts/TicketContext';
import { useAuth } from '../contexts/AuthContext';
import CameraCaptureModal from './CameraCaptureModal';

interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  source?: 'camera' | 'upload';
}

const engineeringBuildings = [
  '30th Anniversary Building (อาคาร 30 ปี)',
  'Department of Mechanical Engineering',
  'RTT Building',
  'Department of Civil Engineering',
  'Department of Electrical Engineering',
  'Department of Mining and Petroleum Engineering',
  'Department of Industrial Engineering',
  'Department of Environmental Engineering',
  '3-Storey Lecture Building (อาคารเรียนรวม 3 ชั้น)',
  '4-Storey Lecture Building (อาคารเรียนรวม 4 ชั้น)',
  'Engineering Library (ห้องสมุด วิศวฯ)',
  'Ruam Jai Building (อาคารวิศวฯ รวมใจ)',
  'Engineering Canteen (โรงอาหาร วิศวฯ)',
  'Chotmanotum Building (อาคารโชติมโนธรรม)',
  "Dean's Office (Chairatchakarn Building)",
  'ME Building 1, 2, 3, 4',
  'High Voltage Laboratory Building',
  'Multidisciplinary Engineering College',
];

export default function SubmitRequestPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addTicket } = useTickets();
  const { displayName, email, isGoogleUser } = useAuth();

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs on component unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, []);

  const processFiles = (newFiles: File[], source: 'camera' | 'upload' = 'upload') => {
    const validFiles = newFiles.filter(
      (f) => f.type.startsWith('image/') || f.name.toLowerCase().endsWith('.heic')
    );

    if (validFiles.length === 0) return;

    setImages((prev) => {
      const availableSlots = 3 - prev.length;
      if (availableSlots <= 0) {
        toast({
          title: language === 'th' ? 'จำกัดรูปภาพ' : 'Limit Exceeded',
          description:
            language === 'th'
              ? 'สามารถอัปโหลดได้สูงสุด 3 รูปเท่านั้น'
              : 'You can only upload a maximum of 3 images.',
          variant: 'destructive',
        });
        return prev;
      }

      const filesToAdd = validFiles.slice(0, availableSlots);
      if (validFiles.length > availableSlots) {
        toast({
          title: language === 'th' ? 'จำกัดรูปภาพ' : 'Notice',
          description:
            language === 'th'
              ? `เพิ่มได้เพียง ${availableSlots} รูป (สูงสุด 3 รูป)`
              : `Added only ${availableSlots} image(s). Maximum 3 images allowed.`,
        });
      }

      const newUploaded: UploadedImage[] = filesToAdd.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        source,
      }));

      return [...prev, ...newUploaded];
    });
  };

  const handleCameraCapture = (file: File) => {
    processFiles([file], 'camera');
    toast({
      title: language === 'th' ? 'บันทึกภาพถ่ายแล้ว' : 'Photo Captured',
      description:
        language === 'th'
          ? 'แนบรูปภาพจากกล้องถ่ายรูปเรียบร้อยแล้ว'
          : 'Attached maintenance photo from camera.',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files), 'upload');
      e.target.value = '';
    }
  };

  const handleRemoveImage = (idToRemove: string) => {
    setImages((prev) => {
      const itemToRemove = prev.find((item) => item.id === idToRemove);
      if (itemToRemove) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }
      return prev.filter((item) => item.id !== idToRemove);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const building = (formData.get('building') as string) || '';
    const floor = (formData.get('floor') as string) || '';
    const room = (formData.get('room') as string) || '';
    const category = (formData.get('category') as string) || 'General';
    const description = (formData.get('description') as string) || '';
    const contactName = (formData.get('name') as string) || displayName || 'Supakorn Suksomboon';
    const contactPhone = (formData.get('phone') as string) || '081-234-5678';
    const contactEmail = (formData.get('email') as string) || email || 'student@cmu.ac.th';

    // Construct new ticket object containing actual input values (Building, Floor, Room, Category)
    // Add submittedDate property using current date (new Date().toLocaleDateString())
    // Add status property set to 'Pending' by default
    // Append this new ticket object to the global ticket state right before triggering the success toast and redirecting
    addTicket({
      building,
      floor,
      room,
      category,
      description,
      contactName,
      contactPhone,
      contactEmail,
      priority: 'Medium',
      photos: images.map((img) => img.previewUrl),
    });

    toast({
      title: language === 'th' ? 'ส่งเรื่องสำเร็จ' : 'Request Submitted',
      description: language === 'th' ? 'ระบบได้รับเรื่องแจ้งซ่อมของคุณแล้ว' : 'Your maintenance request has been submitted successfully.',
    });

    navigate('/tickets');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{language === 'th' ? 'แบบฟอร์มแจ้งซ่อมแซม' : 'University Maintenance Request'}</h2>
          <p className="text-sm text-slate-500 mt-1">{language === 'th' ? 'กรุณากรอกแบบฟอร์มด้านล่างเพื่อแจ้งปัญหา' : 'Please fill out the form below to report a maintenance issue on campus.'}</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <form className="p-6 md:p-8 space-y-8" onSubmit={handleSubmit}>
            
            {/* Core fields */}
            <div className="space-y-6">
              
              {/* Location: 3-column grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Building (Dropdown Select) */}
                <div className="space-y-2">
                  <label htmlFor="building" className="block text-sm font-medium text-slate-700">
                    {language === 'th' ? 'อาคาร' : 'Building'} <span className="text-red-500">*</span>
                  </label>
                  <select 
                    id="building" 
                    name="building"
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A3D91] disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      {language === 'th' ? 'เลือกอาคาร...' : 'Select Building...'}
                    </option>
                    {engineeringBuildings.map((building) => (
                      <option key={building} value={building}>
                        {building}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Column 2: Floor (Input Field) */}
                <div className="space-y-2">
                  <label htmlFor="floor" className="block text-sm font-medium text-slate-700">
                    {language === 'th' ? 'ชั้น' : 'Floor'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="floor"
                    name="floor"
                    type="text"
                    placeholder={language === 'th' ? 'ชั้น (เช่น 3)' : 'Floor (e.g., 3)'}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
                    required
                  />
                </div>

                {/* Column 3: Room Number (Input Field) */}
                <div className="space-y-2">
                  <label htmlFor="room" className="block text-sm font-medium text-slate-700">
                    {language === 'th' ? 'ห้อง' : 'Room'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="room"
                    name="room"
                    type="text"
                    placeholder={language === 'th' ? 'ห้อง (เช่น 302)' : 'Room (e.g., 302)'}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-slate-700">
                  {language === 'th' ? 'หมวดหมู่งานซ่อม' : 'Issue Category'} <span className="text-red-500">*</span>
                </label>
                <select 
                  id="category" 
                  name="category"
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A3D91] disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>{language === 'th' ? 'เลือกหมวดหมู่...' : 'Select a category...'}</option>
                  <option value="hvac">HVAC / Climate Control</option>
                  <option value="plumbing">Plumbing / Water</option>
                  <option value="electrical">Electrical / Lighting</option>
                  <option value="furniture">Furniture / Fixtures</option>
                  <option value="cleaning">Cleaning / Custodial</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                  {language === 'th' ? 'รายละเอียดปัญหา' : 'Issue Description'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="flex min-h-[100px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A3D91] resize-y"
                  placeholder={language === 'th' ? 'โปรดระบุรายละเอียดของปัญหา...' : 'Please describe the problem in detail (e.g., The AC unit is leaking water near the window)...'}
                  required
                />
              </div>

              {/* Upload Photos */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      {language === 'th' ? 'รูปภาพประกอบจุดชำรุด' : 'Maintenance Photos'}{' '}
                      <span className="text-slate-400 font-normal">
                        ({language === 'th' ? 'ทางเลือก' : 'Optional'})
                      </span>
                    </label>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'th'
                        ? 'ถ่ายภาพจุดชำรุดด้วยกล้องหรืออัปโหลดภาพจากเครื่องเพื่อความรวดเร็วในการตรวจสอบ'
                        : 'Take a photo with your camera or upload images to speed up inspection.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      disabled={images.length >= 3}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0A3D91] hover:bg-blue-800 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold shadow-xs transition-colors"
                      title={language === 'th' ? 'เปิดกล้องถ่ายภาพ' : 'Open Camera'}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {language === 'th' ? 'ถ่ายภาพด้วยกล้อง' : 'Take Photo'}
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={images.length >= 3}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-700 text-xs font-medium transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {language === 'th' ? 'เลือกไฟล์' : 'Upload'}
                    </button>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      {images.length}/3
                    </span>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/jpeg, image/png, image/heic"
                  className="hidden"
                />
                
                {/* Drag and Drop Zone with Camera Quick Action */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center transition-all ${
                    images.length >= 3
                      ? 'border-slate-200 bg-slate-100/60 opacity-80'
                      : 'border-slate-300 bg-slate-50/70 hover:bg-slate-50 hover:border-[#0A3D91]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      disabled={images.length >= 3}
                      className="p-3 bg-white rounded-full shadow-xs border border-slate-200 hover:border-[#0A3D91] hover:scale-105 active:scale-95 transition-all text-[#0A3D91] group cursor-pointer disabled:pointer-events-none disabled:opacity-50"
                      title={language === 'th' ? 'ถ่ายภาพด้วยกล้อง' : 'Take Photo with Camera'}
                    >
                      <Camera className="h-6 w-6 group-hover:text-blue-700 transition-colors" />
                    </button>
                    <span className="text-slate-300 font-light">|</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={images.length >= 3}
                      className="p-3 bg-white rounded-full shadow-xs border border-slate-200 hover:border-[#0A3D91] hover:scale-105 active:scale-95 transition-all text-slate-600 group cursor-pointer disabled:pointer-events-none disabled:opacity-50"
                      title={language === 'th' ? 'อัปโหลดรูปภาพ' : 'Upload Images'}
                    >
                      <CloudUpload className="h-6 w-6 group-hover:text-[#0A3D91] transition-colors" />
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-slate-700 text-center mb-1">
                    {language === 'th' ? 'ถ่ายภาพจุดชำรุด หรือ ลากไฟล์มาวางที่นี่' : 'Take a photo or drag & drop files here'}
                  </p>
                  <p className="text-xs text-slate-500 text-center">
                    {language === 'th'
                      ? 'รองรับภาพถ่ายจากกล้อง หรือไฟล์ JPG, PNG, HEIC (สูงสุด 3 ภาพ)'
                      : 'Supports camera capture or JPG, PNG, HEIC (up to 3 photos)'}
                  </p>
                </div>

                {/* Dynamic Image Previews */}
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-4 pt-1">
                    {images.map((img) => (
                      <div key={img.id} className="relative group">
                        <div className="w-24 h-24 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shadow-xs relative">
                          <img
                            src={img.previewUrl}
                            alt={img.file.name}
                            className="w-full h-full object-cover"
                          />
                          {img.source === 'camera' && (
                            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] font-semibold text-white flex items-center gap-1">
                              <Camera className="w-2.5 h-2.5 text-blue-400" />
                              <span>{language === 'th' ? 'กล้อง' : 'Camera'}</span>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(img.id);
                          }}
                          className="absolute -top-2 -right-2 bg-white text-slate-500 hover:text-red-600 rounded-full border border-slate-200 p-1 shadow-sm hover:shadow transition-colors"
                          title={language === 'th' ? 'ลบรูปภาพ' : 'Remove photo'}
                          aria-label={language === 'th' ? 'ลบรูปภาพ' : 'Remove photo'}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <p className="text-[10px] text-slate-500 mt-1 max-w-[96px] truncate text-center">
                          {img.file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="pt-6 mt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  {language === 'th' ? 'ข้อมูลผู้แจ้งและติดต่อ' : 'Contact Information'}
                </h3>
                {isGoogleUser && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {language === 'th' ? 'ข้อมูลจากบัญชี Google' : 'Google Verified Account'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                    {language === 'th' ? 'ชื่อ-นามสกุล' : 'Full Name'}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={displayName}
                    key={`name-${displayName}`}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                    {language === 'th' ? 'อีเมล' : 'Email Address'}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={email}
                    key={`email-${email}`}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                    {language === 'th' ? 'เบอร์โทรศัพท์' : 'Phone Number'}
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder={language === 'th' ? '08x-xxx-xxxx' : '(555) 000-0000'}
                    defaultValue="081-234-5678"
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate('/tickets')}
                className="w-full sm:w-auto px-6 py-2.5 mt-3 sm:mt-0 text-sm font-medium text-slate-700 bg-transparent hover:bg-slate-100 border border-transparent rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                {language === 'th' ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-[#0A3D91] hover:bg-blue-900 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A3D91]"
              >
                {language === 'th' ? 'ส่งเรื่องแจ้งซ่อม' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        language={language}
      />
    </DashboardLayout>
  );
}
