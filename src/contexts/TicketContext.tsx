import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export interface TicketItem {
  id: string;
  issue: string;
  category: string;
  location: string;
  building?: string;
  floor?: string;
  room?: string;
  description?: string;
  date: string;
  submittedDate: string;
  createdAt: number;
  status: 'Open' | 'Pending' | 'In Progress' | 'Completed';
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  reporterId: string;
  reporterName: string;
  assignedTo: string;
  photos?: string[];
  contactName?: string;
  contactPhone?: string;
}

export interface NewTicketInput {
  building: string;
  floor: string;
  room: string;
  category: string;
  description: string;
  priority?: 'Urgent' | 'High' | 'Medium' | 'Low';
  contactName?: string;
  contactPhone?: string;
  photos?: string[];
}

export interface TicketContextType {
  tickets: TicketItem[];
  addTicket: (input: NewTicketInput) => TicketItem;
  updateTicket: (id: string, updates: Partial<TicketItem>) => void;
  getTicketById: (id: string) => TicketItem | undefined;
}

export const categoryDisplayMap: Record<string, string> = {
  hvac: 'HVAC',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  furniture: 'Furniture',
  carpentry: 'Carpentry',
  cleaning: 'Cleaning',
  'av/it': 'AV/IT',
  other: 'General',
  general: 'General',
};

export const initialTicketsData: TicketItem[] = [
  { 
    id: 'REQ-1045', 
    issue: 'Main water pipe leak in basement', 
    category: 'Plumbing', 
    location: 'Science Hall B1', 
    building: 'Science Hall', 
    floor: 'B1', 
    room: 'Basement', 
    date: 'Oct 25, 2026', 
    submittedDate: '10/25/2026', 
    createdAt: 1792886400000, 
    status: 'Open', 
    priority: 'Urgent', 
    reporterId: 'student-me', 
    reporterName: 'Supakorn (You)', 
    assignedTo: 'Dave M. (Plumber)' 
  },
  { 
    id: 'REQ-1044', 
    issue: 'Power surge in computer laboratory', 
    category: 'Electrical', 
    location: 'Engineering Bldg, Rm 204', 
    building: 'Engineering Bldg', 
    floor: '2', 
    room: '204', 
    date: 'Oct 25, 2026', 
    submittedDate: '10/25/2026', 
    createdAt: 1792886300000, 
    status: 'Open', 
    priority: 'Urgent', 
    reporterId: 'other-1', 
    reporterName: 'Dr. Jane Smith', 
    assignedTo: 'Kittisak P. (Electrician)' 
  },
  { 
    id: 'REQ-1043', 
    issue: 'Broken window in lecture hall', 
    category: 'General', 
    location: 'Lecture Hall 1', 
    building: 'Lecture Hall 1', 
    floor: '1', 
    room: '101', 
    date: 'Oct 24, 2026', 
    submittedDate: '10/24/2026', 
    createdAt: 1792800000000, 
    status: 'Open', 
    priority: 'High', 
    reporterId: 'other-2', 
    reporterName: 'Facilities Staff', 
    assignedTo: 'Unassigned' 
  },
  { 
    id: 'REQ-1042', 
    issue: 'Leaking AC unit', 
    category: 'HVAC', 
    location: 'Engineering Bldg, Room 302', 
    building: 'Engineering Bldg', 
    floor: '3', 
    room: '302', 
    date: 'Oct 24, 2026', 
    submittedDate: '10/24/2026', 
    createdAt: 1792799900000, 
    status: 'Pending', 
    priority: 'High', 
    reporterId: 'student-me', 
    reporterName: 'Supakorn (You)', 
    assignedTo: 'Somchai R. (HVAC)' 
  },
  { 
    id: 'REQ-1041', 
    issue: 'Projector mount broken', 
    category: 'AV/IT', 
    location: 'Business Annex 101', 
    building: 'Business Annex', 
    floor: '1', 
    room: '101', 
    date: 'Oct 23, 2026', 
    submittedDate: '10/23/2026', 
    createdAt: 1792713600000, 
    status: 'In Progress', 
    priority: 'Medium', 
    reporterId: 'other-3', 
    reporterName: 'Prof. Anderson', 
    assignedTo: 'Anan T. (AV Tech)' 
  },
  { 
    id: 'REQ-1039', 
    issue: 'Fire alarm beeping intermittently', 
    category: 'Electrical', 
    location: 'Dormitory B, 3rd Fl', 
    building: 'Dormitory B', 
    floor: '3', 
    room: 'Corridor', 
    date: 'Oct 23, 2026', 
    submittedDate: '10/23/2026', 
    createdAt: 1792713500000, 
    status: 'Pending', 
    priority: 'Urgent', 
    reporterId: 'other-4', 
    reporterName: 'Resident Advisor', 
    assignedTo: 'Kittisak P. (Electrician)' 
  },
  { 
    id: 'REQ-1038', 
    issue: 'Clogged sink', 
    category: 'Plumbing', 
    location: 'Dormitory A, Rm 412', 
    building: 'Dormitory A', 
    floor: '4', 
    room: '412', 
    date: 'Oct 22, 2026', 
    submittedDate: '10/22/2026', 
    createdAt: 1792627200000, 
    status: 'Completed', 
    priority: 'Low', 
    reporterId: 'student-me', 
    reporterName: 'Supakorn (You)', 
    assignedTo: 'Dave M. (Plumber)' 
  },
  { 
    id: 'REQ-1035', 
    issue: 'Squeaky door hinge', 
    category: 'Carpentry', 
    location: 'Library Main Entrance', 
    building: 'Library Main', 
    floor: '1', 
    room: 'Entrance', 
    date: 'Oct 20, 2026', 
    submittedDate: '10/20/2026', 
    createdAt: 1792454400000, 
    status: 'In Progress', 
    priority: 'Low', 
    reporterId: 'student-me', 
    reporterName: 'Supakorn (You)', 
    assignedTo: 'Prasert K. (Carpenter)' 
  },
  { 
    id: 'REQ-1031', 
    issue: 'Flickering lights', 
    category: 'Electrical', 
    location: 'Gymnasium', 
    building: 'Gymnasium', 
    floor: '1', 
    room: 'Main Court', 
    date: 'Oct 19, 2026', 
    submittedDate: '10/19/2026', 
    createdAt: 1792368000000, 
    status: 'In Progress', 
    priority: 'Urgent', 
    reporterId: 'other-5', 
    reporterName: 'Coach Mike', 
    assignedTo: 'Kittisak P. (Electrician)' 
  },
  { 
    id: 'REQ-1029', 
    issue: 'Broken window latch', 
    category: 'General', 
    location: 'Science Hall 204', 
    building: 'Science Hall', 
    floor: '2', 
    room: '204', 
    date: 'Oct 18, 2026', 
    submittedDate: '10/18/2026', 
    createdAt: 1792281600000, 
    status: 'Completed', 
    priority: 'Medium', 
    reporterId: 'other-6', 
    reporterName: 'Lab Assistant', 
    assignedTo: 'Prasert K. (Carpenter)' 
  },
  { 
    id: 'REQ-1027', 
    issue: 'Thermostat malfunction', 
    category: 'HVAC', 
    location: 'Faculty Lounge', 
    building: 'Faculty Lounge', 
    floor: '1', 
    room: 'Lounge', 
    date: 'Oct 17, 2026', 
    submittedDate: '10/17/2026', 
    createdAt: 1792195200000, 
    status: 'Pending', 
    priority: 'Medium', 
    reporterId: 'other-7', 
    reporterName: 'Faculty Secretary', 
    assignedTo: 'Somchai R. (HVAC)' 
  },
  { 
    id: 'REQ-1024', 
    issue: 'Restroom door lock jammed', 
    category: 'Carpentry', 
    location: 'Main Library 2F', 
    building: 'Main Library', 
    floor: '2', 
    room: 'Restroom', 
    date: 'Oct 16, 2026', 
    submittedDate: '10/16/2026', 
    createdAt: 1792108800000, 
    status: 'Open', 
    priority: 'High', 
    reporterId: 'other-8', 
    reporterName: 'Library Staff', 
    assignedTo: 'Unassigned' 
  },
];

const STORAGE_KEY = 'university_maintenance_tickets';

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<TicketItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err) {
        console.error('Failed to load tickets from localStorage', err);
      }
    }
    return initialTicketsData;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    } catch (err) {
      console.error('Failed to save tickets to localStorage', err);
    }
  }, [tickets]);

  const addTicket = (input: NewTicketInput): TicketItem => {
    // Generate next sequential Ticket ID
    let nextNum = 1046;
    try {
      const existingNums = tickets
        .map((t) => {
          const m = t.id.match(/\d+/);
          return m ? parseInt(m[0], 10) : 0;
        })
        .filter((n) => !isNaN(n) && n > 0);
      if (existingNums.length > 0) {
        nextNum = Math.max(...existingNums) + 1;
      }
    } catch {
      nextNum = 1046;
    }

    const id = `REQ-${nextNum}`;
    const now = new Date();
    const submittedDate = now.toLocaleDateString();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const categoryKey = input.category.toLowerCase().trim();
    const categoryDisplay = categoryDisplayMap[categoryKey] || input.category;
    
    // Construct location string
    const locationParts: string[] = [];
    if (input.building) locationParts.push(input.building);
    if (input.floor) locationParts.push(`Fl ${input.floor}`);
    if (input.room) locationParts.push(`Rm ${input.room}`);
    const location = locationParts.length > 0 ? locationParts.join(', ') : 'Campus Building';

    // Derive concise issue title from description
    const issue = input.description ? input.description.trim() : 'Maintenance Request';

    const newTicket: TicketItem = {
      id,
      issue,
      category: categoryDisplay,
      location,
      building: input.building,
      floor: input.floor,
      room: input.room,
      description: input.description,
      submittedDate,
      date: formattedDate,
      createdAt: now.getTime(),
      status: 'Pending', // Default status as requested
      priority: input.priority || 'Medium',
      reporterId: 'student-me',
      reporterName: input.contactName || 'Supakorn (You)',
      assignedTo: 'Unassigned',
      photos: input.photos || [],
      contactName: input.contactName || 'Supakorn Suksomboon',
      contactPhone: input.contactPhone || '081-234-5678',
    };

    setTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  };

  const updateTicket = (id: string, updates: Partial<TicketItem>) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const getTicketById = (id: string) => {
    return tickets.find((t) => t.id === id);
  };

  // Keep tickets sorted so newest is at the top
  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => {
      const timeA = a.createdAt || (a.submittedDate ? new Date(a.submittedDate).getTime() : 0) || 0;
      const timeB = b.createdAt || (b.submittedDate ? new Date(b.submittedDate).getTime() : 0) || 0;
      return timeB - timeA;
    });
  }, [tickets]);

  return (
    <TicketContext.Provider
      value={{
        tickets: sortedTickets,
        addTicket,
        updateTicket,
        getTicketById,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = (): TicketContextType => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};
