import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'student' | 'admin';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    try {
      const stored = localStorage.getItem('app_user_role');
      return stored === 'admin' || stored === 'student' ? stored : 'student';
    } catch {
      return 'student';
    }
  });

  const setRole = (newRole: UserRole) => {
    try {
      localStorage.setItem('app_user_role', newRole);
    } catch {
      // ignore
    }
    setRoleState(newRole);
  };

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
