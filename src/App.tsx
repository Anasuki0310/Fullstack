

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { RoleProvider } from './contexts/RoleContext';
import { AuthProvider } from './contexts/AuthContext';
import { TicketProvider } from './contexts/TicketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { BuildingStaffProvider } from './contexts/BuildingStaffContext';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import SubmitRequestPage from './components/SubmitRequestPage';
import TicketDetailsPage from './components/TicketDetailsPage';
import TicketsPage from './components/TicketsPage';
import SettingsPage from './components/SettingsPage';
import BuildingStaffPage from './components/BuildingStaffPage';
import CMUCallbackPage from './components/CMUCallbackPage';
import NotificationBanner from './components/NotificationBanner';
import { Toaster } from './components/ui/toaster';


export default function App() {
  return (

    <LanguageProvider>
      <RoleProvider>
        <AuthProvider>
          <TicketProvider>
            <BuildingStaffProvider>
              <NotificationProvider>
                <BrowserRouter>
                  <NotificationBanner />
                  <Toaster />
                  <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/cmu-callback" element={<CMUCallbackPage />} />
                    <Route path="/callback" element={<CMUCallbackPage />} />
                    <Route path="/auth/callback" element={<CMUCallbackPage />} />
                    <Route path="/api/auth/callback" element={<CMUCallbackPage />} />
                    <Route path="/oauth/callback" element={<CMUCallbackPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/submit-request" element={<SubmitRequestPage />} />
                    <Route path="/tickets" element={<TicketsPage />} />
                    <Route path="/ticket/:id" element={<TicketDetailsPage />} />
                    <Route path="/tickets/:id" element={<TicketDetailsPage />} />
                    <Route path="/building-staff" element={<BuildingStaffPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </BrowserRouter>
              </NotificationProvider>
            </BuildingStaffProvider>
          </TicketProvider>
        </AuthProvider>
      </RoleProvider>
    </LanguageProvider>
  );
}
