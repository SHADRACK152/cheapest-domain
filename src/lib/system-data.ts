// System-wide data storage for demo purposes
// In production, this would be managed by a real database

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  accountType: 'personal' | 'business';
  createdAt: string;
  status: 'active' | 'suspended';
}

export interface SystemDomain {
  id: string;
  name: string;
  userId: string;
  userName: string;
  userEmail: string;
  registrationDate: string;
  expiryDate: string;
  status: 'active' | 'pending' | 'expired' | 'transferred';
  price: number;
  autoRenew: boolean;
  protected: boolean;
}

export interface SystemOrder {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  domains: string[];
  total: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

// Initialize with demo data
let systemUsers: SystemUser[] = [
  {
    id: 'admin-001',
    name: 'Admin User',
    email: 'admin@truehost.co.ke',
    phone: '+254 20 528 0000',
    password: 'admin123', // In production, this would be hashed
    accountType: 'business',
    createdAt: '2024-01-15T10:00:00Z',
    status: 'active',
  },
  {
    id: 'user-001',
    name: 'John Mwangi',
    email: 'john.mwangi@example.com',
    phone: '+254 712 345 678',
    password: 'password123',
    accountType: 'business',
    createdAt: '2025-06-20T08:30:00Z',
    status: 'active',
  },
  {
    id: 'user-002',
    name: 'Sarah Wanjiku',
    email: 'sarah.w@startup.ke',
    phone: '+254 722 987 654',
    password: 'password123',
    accountType: 'business',
    createdAt: '2025-08-15T14:20:00Z',
    status: 'active',
  },
  {
    id: 'user-003',
    name: 'David Omondi',
    email: 'david.o@gmail.com',
    phone: '+254 733 456 789',
    password: 'password123',
    accountType: 'personal',
    createdAt: '2025-11-10T09:15:00Z',
    status: 'active',
  },
  {
    id: 'user-004',
    name: 'Grace Achieng',
    email: 'grace@developer.io',
    phone: '+254 744 567 890',
    password: 'password123',
    accountType: 'personal',
    createdAt: '2026-01-05T11:45:00Z',
    status: 'active',
  },
];

let systemDomains: SystemDomain[] = [
  {
    id: 'domain-001',
    name: 'techstartup.co.ke',
    userId: 'user-001',
    userName: 'John Mwangi',
    userEmail: 'john.mwangi@example.com',
    registrationDate: '2025-06-20T08:45:00Z',
    expiryDate: '2026-06-20T08:45:00Z',
    status: 'active',
    price: 9.99,
    autoRenew: true,
    protected: true,
  },
  {
    id: 'domain-002',
    name: 'mybusiness.com',
    userId: 'user-001',
    userName: 'John Mwangi',
    userEmail: 'john.mwangi@example.com',
    registrationDate: '2025-07-10T10:20:00Z',
    expiryDate: '2026-07-10T10:20:00Z',
    status: 'active',
    price: 12.99,
    autoRenew: true,
    protected: false,
  },
  {
    id: 'domain-003',
    name: 'sarahstartup.io',
    userId: 'user-002',
    userName: 'Sarah Wanjiku',
    userEmail: 'sarah.w@startup.ke',
    registrationDate: '2025-08-15T14:30:00Z',
    expiryDate: '2026-08-15T14:30:00Z',
    status: 'active',
    price: 39.99,
    autoRenew: true,
    protected: true,
  },
  {
    id: 'domain-004',
    name: 'davidomondi.com',
    userId: 'user-003',
    userName: 'David Omondi',
    userEmail: 'david.o@gmail.com',
    registrationDate: '2025-11-10T09:30:00Z',
    expiryDate: '2026-11-10T09:30:00Z',
    status: 'active',
    price: 12.99,
    autoRenew: false,
    protected: false,
  },
  {
    id: 'domain-005',
    name: 'gracedev.co.ke',
    userId: 'user-004',
    userName: 'Grace Achieng',
    userEmail: 'grace@developer.io',
    registrationDate: '2026-01-05T12:00:00Z',
    expiryDate: '2027-01-05T12:00:00Z',
    status: 'active',
    price: 9.99,
    autoRenew: true,
    protected: true,
  },
  {
    id: 'domain-006',
    name: 'portfolio.net',
    userId: 'user-004',
    userName: 'Grace Achieng',
    userEmail: 'grace@developer.io',
    registrationDate: '2026-01-20T15:30:00Z',
    expiryDate: '2026-03-20T15:30:00Z', // Expiring soon
    status: 'active',
    price: 14.99,
    autoRenew: false,
    protected: false,
  },
  {
    id: 'domain-007',
    name: 'techblog.ke',
    userId: 'user-002',
    userName: 'Sarah Wanjiku',
    userEmail: 'sarah.w@startup.ke',
    registrationDate: '2025-09-01T10:00:00Z',
    expiryDate: '2026-09-01T10:00:00Z',
    status: 'active',
    price: 9.99,
    autoRenew: true,
    protected: false,
  },
  {
    id: 'domain-008',
    name: 'newproject.com',
    userId: 'user-001',
    userName: 'John Mwangi',
    userEmail: 'john.mwangi@example.com',
    registrationDate: '2026-02-10T09:00:00Z',
    expiryDate: '2027-02-10T09:00:00Z',
    status: 'pending',
    price: 12.99,
    autoRenew: false,
    protected: false,
  },
];

let systemOrders: SystemOrder[] = [
  {
    id: 'ORD-001',
    userId: 'user-001',
    userName: 'John Mwangi',
    userEmail: 'john.mwangi@example.com',
    domains: ['techstartup.co.ke'],
    total: 19.98, // 9.99 + 9.99 protection
    paymentMethod: 'M-Pesa',
    status: 'completed',
    createdAt: '2025-06-20T08:45:00Z',
  },
  {
    id: 'ORD-002',
    userId: 'user-001',
    userName: 'John Mwangi',
    userEmail: 'john.mwangi@example.com',
    domains: ['mybusiness.com'],
    total: 12.99,
    paymentMethod: 'Credit Card',
    status: 'completed',
    createdAt: '2025-07-10T10:20:00Z',
  },
  {
    id: 'ORD-003',
    userId: 'user-002',
    userName: 'Sarah Wanjiku',
    userEmail: 'sarah.w@startup.ke',
    domains: ['sarahstartup.io'],
    total: 49.98, // 39.99 + 9.99 protection
    paymentMethod: 'M-Pesa',
    status: 'completed',
    createdAt: '2025-08-15T14:30:00Z',
  },
  {
    id: 'ORD-004',
    userId: 'user-003',
    userName: 'David Omondi',
    userEmail: 'david.o@gmail.com',
    domains: ['davidomondi.com'],
    total: 12.99,
    paymentMethod: 'PayPal',
    status: 'completed',
    createdAt: '2025-11-10T09:30:00Z',
  },
  {
    id: 'ORD-005',
    userId: 'user-004',
    userName: 'Grace Achieng',
    userEmail: 'grace@developer.io',
    domains: ['gracedev.co.ke'],
    total: 19.98,
    paymentMethod: 'M-Pesa',
    status: 'completed',
    createdAt: '2026-01-05T12:00:00Z',
  },
  {
    id: 'ORD-006',
    userId: 'user-004',
    userName: 'Grace Achieng',
    userEmail: 'grace@developer.io',
    domains: ['portfolio.net'],
    total: 14.99,
    paymentMethod: 'Credit Card',
    status: 'completed',
    createdAt: '2026-01-20T15:30:00Z',
  },
  {
    id: 'ORD-007',
    userId: 'user-002',
    userName: 'Sarah Wanjiku',
    userEmail: 'sarah.w@startup.ke',
    domains: ['techblog.ke'],
    total: 9.99,
    paymentMethod: 'M-Pesa',
    status: 'completed',
    createdAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 'ORD-008',
    userId: 'user-001',
    userName: 'John Mwangi',
    userEmail: 'john.mwangi@example.com',
    domains: ['newproject.com'],
    total: 12.99,
    paymentMethod: 'M-Pesa',
    status: 'pending',
    createdAt: '2026-02-10T09:00:00Z',
  },
];

// Analytics data
let monthlyRevenue = [
  { month: 'Sep 2025', revenue: 12.99 },
  { month: 'Oct 2025', revenue: 0 },
  { month: 'Nov 2025', revenue: 12.99 },
  { month: 'Dec 2025', revenue: 0 },
  { month: 'Jan 2026', revenue: 34.97 },
  { month: 'Feb 2026', revenue: 12.99 },
];

// CRUD Operations for Users
export function getAllUsers(): SystemUser[] {
  return systemUsers;
}

export function getUserById(id: string): SystemUser | undefined {
  return systemUsers.find(u => u.id === id);
}

export function getUserByEmail(email: string): SystemUser | undefined {
  return systemUsers.find(u => u.email === email);
}

export function createUser(user: Omit<SystemUser, 'id' | 'createdAt'>): SystemUser {
  const newUser: SystemUser = {
    ...user,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  systemUsers.push(newUser);
  return newUser;
}

export function updateUser(id: string, updates: Partial<SystemUser>): SystemUser | undefined {
  const index = systemUsers.findIndex(u => u.id === id);
  if (index === -1) return undefined;
  
  systemUsers[index] = { ...systemUsers[index], ...updates };
  return systemUsers[index];
}

// CRUD Operations for Domains
export function getAllDomains(): SystemDomain[] {
  return systemDomains;
}

export function getDomainsByUserId(userId: string): SystemDomain[] {
  return systemDomains.filter(d => d.userId === userId);
}

export function getDomainsByUserEmail(email: string): SystemDomain[] {
  return systemDomains.filter(d => d.userEmail === email);
}

export function createDomain(domain: Omit<SystemDomain, 'id' | 'registrationDate'>): SystemDomain {
  const newDomain: SystemDomain = {
    ...domain,
    id: `domain-${Date.now()}`,
    registrationDate: new Date().toISOString(),
  };
  systemDomains.push(newDomain);
  return newDomain;
}

// CRUD Operations for Orders
export function getAllOrders(): SystemOrder[] {
  return systemOrders;
}

export function getOrdersByUserId(userId: string): SystemOrder[] {
  return systemOrders.filter(o => o.userId === userId);
}

export function getOrdersByUserEmail(email: string): SystemOrder[] {
  return systemOrders.filter(o => o.userEmail === email);
}

export function createOrder(order: Omit<SystemOrder, 'id' | 'createdAt'>): SystemOrder {
  const newOrder: SystemOrder = {
    ...order,
    id: `ORD-${String(systemOrders.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
  };
  systemOrders.push(newOrder);
  return newOrder;
}

// Analytics
export function getMonthlyRevenue() {
  return monthlyRevenue;
}

export function getTotalRevenue(): number {
  return systemOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);
}

export function getStats() {
  const totalUsers = systemUsers.length;
  const activeUsers = systemUsers.filter(u => u.status === 'active').length;
  const totalDomains = systemDomains.length;
  const activeDomains = systemDomains.filter(d => d.status === 'active').length;
  const expiringDomains = systemDomains.filter(d => {
    const expiryDate = new Date(d.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0 && d.status === 'active';
  }).length;
  const pendingDomains = systemDomains.filter(d => d.status === 'pending').length;
  const protectedDomains = systemDomains.filter(d => d.protected).length;
  const totalOrders = systemOrders.length;
  const completedOrders = systemOrders.filter(o => o.status === 'completed').length;
  const pendingOrders = systemOrders.filter(o => o.status === 'pending').length;
  const totalRevenue = getTotalRevenue();

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
    },
    domains: {
      total: totalDomains,
      active: activeDomains,
      expiring: expiringDomains,
      pending: pendingDomains,
      protected: protectedDomains,
    },
    orders: {
      total: totalOrders,
      completed: completedOrders,
      pending: pendingOrders,
    },
    revenue: {
      total: totalRevenue,
    },
  };
}

// Recent activity for admin dashboard
export function getRecentActivity(limit: number = 10) {
  return systemOrders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map(order => ({
      id: order.id,
      type: order.status === 'completed' ? 'purchase' : 'pending',
      user: order.userName,
      description: `${order.domains.join(', ')}`,
      amount: order.total,
      timestamp: order.createdAt,
    }));
}

// Top domain extensions
export function getTopExtensions() {
  const extensions = systemDomains.reduce((acc, domain) => {
    const ext = domain.name.split('.').pop() || '';
    if (!acc[ext]) {
      acc[ext] = { count: 0, revenue: 0 };
    }
    acc[ext].count++;
    acc[ext].revenue += domain.price;
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  return Object.entries(extensions)
    .map(([ext, data]) => ({
      extension: `.${ext}`,
      domains: data.count,
      revenue: data.revenue,
      growth: Math.random() * 20 - 5, // Random growth for demo
    }))
    .sort((a, b) => b.domains - a.domains)
    .slice(0, 5);
}
