export type RoomType = 'standard' | 'deluxe' | 'suite';
export type BoardingStatus = 'pending' | 'checked_in' | 'checked_out' | 'cancelled';
export type FeedingStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type SalaryStatus = 'pending' | 'paid';
export type PetType = 'dog' | 'cat' | 'other';

export interface BoardingOrder {
  id: string;
  customerId: string;
  petId: string;
  checkIn: string;
  checkOut: string;
  roomType: RoomType;
  services: string[];
  status: BoardingStatus;
  totalAmount: number;
  assignedStaffId?: string;
  notes?: string;
  createdAt: string;
}

export interface FeedingOrder {
  id: string;
  customerId: string;
  petId: string;
  petAddress: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  services: string[];
  staffId?: string;
  status: FeedingStatus;
  amount: number;
  notes?: string;
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  phone: string;
  skills: string[];
  baseSalary: number;
  performanceRate: number;
  avatar?: string;
  status: 'active' | 'leave' | 'inactive';
  hireDate: string;
}

export interface SalaryRecord {
  id: string;
  staffId: string;
  month: string;
  baseSalary: number;
  performance: number;
  allowance: number;
  deduction: number;
  total: number;
  status: SalaryStatus;
  completedOrders: number;
  remark?: string;
  createdAt: string;
}

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  breed: string;
  age: number;
  weight: number;
  customerId: string;
  avatar?: string;
  healthNote?: string;
  vaccineDate?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  memberLevel: 'normal' | 'silver' | 'gold' | 'diamond';
  totalSpent: number;
  createdAt: string;
}

export interface PricingRule {
  id: string;
  name: string;
  roomType: RoomType;
  petType: PetType;
  basePricePerDay: number;
  weekendSurcharge: number;
  description?: string;
  active: boolean;
}

export interface AddonService {
  id: string;
  name: string;
  category: 'grooming' | 'training' | 'medical' | 'other';
  price: number;
  description?: string;
  active: boolean;
}

export interface DashboardStats {
  todayOrders: number;
  boardingInHouse: number;
  pendingTasks: number;
  monthlyRevenue: number;
  orderTrend: { date: string; boarding: number; feeding: number }[];
  serviceDistribution: { name: string; value: number }[];
  recentOrders: (BoardingOrder | FeedingOrder)[];
}
