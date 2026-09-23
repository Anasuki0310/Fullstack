/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { RoleProvider } from './contexts/RoleContext';
import { AuthProvider } from './contexts/AuthContext';
import { TicketProvider } from './contexts/TicketContext';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import SubmitRequestPage from './components/SubmitRequestPage';
import TicketDetailsPage from './components/TicketDetailsPage';
import TicketsPage from './components/TicketsPage';
import SettingsPage from './components/SettingsPage';
import { Toaster } from './components/ui/toaster';

export default function App() {
  return (
    <LanguageProvider>
      <RoleProvider>
        <AuthProvider>
          <TicketProvider>
            <BrowserRouter>
              <Toaster />
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/submit-request" element={<SubmitRequestPage />} />
                <Route path="/tickets" element={<TicketsPage />} />
                <Route path="/ticket/:id" element={<TicketDetailsPage />} />
                <Route path="/tickets/:id" element={<TicketDetailsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </BrowserRouter>
          </TicketProvider>
        </AuthProvider>
      </RoleProvider>
    </LanguageProvider>
  );
}
