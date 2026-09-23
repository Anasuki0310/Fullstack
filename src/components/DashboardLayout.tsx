import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useRole } from '../contexts/RoleContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, 
  LayoutDashboard, 
  Ticket, 
  Settings, 
  Search, 
  Bell, 
  Menu, 
  X, 
  LogOut, 
  PlusCircle, 
  MessageCircle, 
  Wrench, 
  CheckCircle2, 
  Info, 
  User 
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lineEnabled, setLineEnabled] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const { language } = useLanguage();
  const { role } = useRole();
  const { displayName, email, photoURL, isGoogleUser, signOut } = useAuth();

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'update', ticketId: 'REQ-1042', message: 'Your ticket #REQ-1042 is now In Progress', time: '10 mins ago', unread: true, icon: Wrench, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950/50' },
    { id: 2, type: 'resolved', ticketId: 'REQ-1038', message: 'Ticket #REQ-1038 has been resolved', time: '2 hours ago', unread: true, icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-950/50' },
    { id: 3, type: 'info', message: 'Scheduled maintenance for campus Wi-Fi tonight', time: '1 day ago', unread: false, icon: Info, color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-700' },
  ]);

  const hasUnread = notifications.some(n => n.unread);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const getNotificationUrl = (notification: { type: string; message: string; ticketId?: string }) => {
    if (notification.ticketId) {
      return `/tickets/${notification.ticketId}`;
    }
    const match = notification.message.match(/#(REQ-\d+)/i) || notification.message.match(/(REQ-\d+)/i);
    if (match) {
      return `/tickets/${match[1]}`;
    }
    return '#';
  };

  const handleNotificationClick = (e: React.MouseEvent, id: number, url: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
    setIsNotificationsOpen(false);
    if (url === '#') {
      e.preventDefault();
    }
  };

  // Role-based navigation items
  const navItems = role === 'student'
    ? [
        { name: language === 'th' ? 'รายการแจ้งซ่อมของฉัน' : 'My Tickets', path: '/tickets', icon: Ticket },
        { name: language === 'th' ? 'แจ้งซ่อมใหม่' : 'New Request', path: '/submit-request', icon: PlusCircle },
        { name: language === 'th' ? 'การตั้งค่า' : 'Settings', path: '/settings', icon: Settings },
      ]
    : [
        { name: language === 'th' ? 'หน้าหลัก' : 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: language === 'th' ? 'รายการแจ้งซ่อมทั้งหมด' : 'All Tickets', path: '/tickets', icon: Ticket },
        { name: language === 'th' ? 'แจ้งซ่อมใหม่' : 'New Request', path: '/submit-request', icon: PlusCircle },
        { name: language === 'th' ? 'การตั้งค่า' : 'Settings', path: '/settings', icon: Settings },
      ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#0A3D91] dark:bg-slate-950 text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <Building2 className="h-8 w-8 text-white mr-3" />
          <span className="text-lg font-bold tracking-tight">CampusFix</span>
          <button 
            className="ml-auto lg:hidden text-white/70 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile Snippet */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg overflow-hidden shadow-inner ring-2 ring-white/30 relative">
              <img src={photoURL} alt={displayName} className="h-full w-full object-cover" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-white truncate max-w-[140px]">
                  {displayName}
                </p>
                {isGoogleUser && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Connected via Google" />
                )}
              </div>
              <p className="text-xs text-blue-200 font-medium truncate max-w-[150px]">
                {role === 'admin' ? (language === 'th' ? 'ผู้ดูแลระบบ' : 'Facilities Admin') : (language === 'th' ? 'นักศึกษา' : 'Student (Reporter)')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith('/ticket') && item.path === '/tickets');
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name}
                to={item.path} 
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-lg group transition-colors ${
                  isActive 
                    ? 'bg-white/10 dark:bg-slate-800 text-white' 
                    : 'text-blue-100 dark:text-slate-300 hover:bg-white/5 dark:hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-blue-200' : 'text-blue-300 group-hover:text-white'}`} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* LINE Notifications Toggle */}
        <div className="p-4 mt-auto">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-md bg-[#00C300] flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-white">LINE Alerts</span>
              </div>
              <button 
                type="button"
                role="switch"
                aria-checked={lineEnabled}
                onClick={() => setLineEnabled(!lineEnabled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 ${lineEnabled ? 'bg-[#00C300]' : 'bg-white/20'}`}
              >
                <span className="sr-only">Enable LINE Notifications</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${lineEnabled ? 'translate-x-4' : 'translate-x-0'}`}
                />
              </button>
            </div>
            <p className="text-xs text-blue-200 leading-tight">
              Get real-time status updates for your active tickets.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 shrink-0 shadow-sm">
          <div className="flex items-center flex-1">
            <button 
              className="lg:hidden p-2 -ml-2 mr-2 text-slate-500 hover:text-slate-700 rounded-md"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="max-w-md w-full relative hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search tickets, work orders..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-transparent transition-colors placeholder:text-slate-400 dark:text-white"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-slate-400 hover:text-slate-500 relative transition-colors focus:outline-none"
              >
                <Bell className="h-5 w-5" />
                {hasUnread && <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />}
              </button>

              {isNotificationsOpen && (
                <>
                  {/* Invisible overlay to close dropdown when clicking outside */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsNotificationsOpen(false)} 
                  />
                  
                  {/* Popover Container */}
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden flex flex-col origin-top-right animate-in fade-in zoom-in-95 duration-200">
                    
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notifications</h3>
                      {hasUnread && (
                        <button 
                          onClick={markAllAsRead} 
                          className="text-xs text-[#0A3D91] hover:underline font-medium focus:outline-none"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    {/* List */}
                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                          {notifications.map((notification) => {
                            const Icon = notification.icon;
                            const url = getNotificationUrl(notification);
                            return (
                              <Link 
                                key={notification.id} 
                                to={url}
                                href={url}
                                onClick={(e) => handleNotificationClick(e, notification.id, url)}
                                className="p-4 flex gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative group block text-left"
                              >
                                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notification.bgColor} ${notification.color}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 pr-4">
                                  <p className={`text-sm leading-tight ${notification.unread ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                                </div>
                                {notification.unread && (
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#0A3D91]" />
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-8 flex flex-col items-center justify-center text-center">
                          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
                            <Bell className="w-6 h-6 text-slate-400" />
                          </div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">No new notifications</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">You're all caught up!</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <Link 
                      to="/tickets"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="p-3 border-t border-slate-100 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer group block"
                    >
                      <span className="text-xs font-semibold text-[#0A3D91] dark:text-blue-400 group-hover:text-blue-900 dark:group-hover:text-blue-300 transition-colors">
                        {language === 'th' ? 'ดูการแจ้งเตือนทั้งหมด' : 'View all notifications'}
                      </span>
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-8 w-8 rounded-full bg-slate-200 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:ring-offset-2 transition-all hover:opacity-80 hover:ring-2 hover:ring-slate-300 hover:ring-offset-1 flex items-center justify-center overflow-hidden relative"
              >
                <img src={photoURL} alt={displayName} className="h-full w-full object-cover" />
                {isGoogleUser && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                )}
              </button>

              {isProfileOpen && (
                <>
                  {/* Invisible overlay */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileOpen(false)} 
                  />
                  
                  {/* Dropdown Container */}
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden flex flex-col origin-top-right animate-in fade-in zoom-in-95 duration-200">
                    
                    {/* User Info Section */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col bg-slate-50/50 dark:bg-slate-800/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight truncate max-w-[190px]">
                          {displayName}
                        </span>
                        {isGoogleUser && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Google
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {email}
                      </span>
                      <span className="mt-3 inline-flex items-center px-2 py-1 rounded border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 text-[#0A3D91] dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider w-fit">
                        {role === 'admin' 
                          ? (language === 'th' ? 'ผู้ดูแลระบบ กองอาคารสถานที่' : 'System Administrator, Campus Facilities') 
                          : (language === 'th' ? 'นักศึกษา คณะวิศวกรรมศาสตร์' : 'Undergraduate Student, Faculty of Engineering')}
                      </span>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="p-1.5">
                      <Link 
                        to="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        My Profile
                      </Link>
                      <Link 
                        to="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        Settings
                      </Link>
                    </div>
                    
                    {/* Logout Action */}
                    <div className="p-1.5 border-t border-slate-100 dark:border-slate-700">
                      <button 
                        onClick={async () => {
                          setIsProfileOpen(false);
                          await signOut();
                          window.location.href = '/';
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-500 dark:text-red-400" />
                        Log out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
}
