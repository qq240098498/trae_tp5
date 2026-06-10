export type RoomType = 'standard' | 'deluxe' | 'suite';
export type BoardingStatus = 'pending' | 'checked_in' | 'checked_out' | 'cancelled';
export type FeedingStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type SalaryStatus = 'pending' | 'paid';
export type PetType = 'dog' | 'cat' | 'other';
export type MemberLevel = 'normal' | 'silver' | 'gold' | 'diamond';
export type ReviewType = 'positive' | 'negative';
export type ReviewStatus = 'pending' | 'resolved' | 'escalated';
export type OrderType = 'feeding' | 'boarding';

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
  originalAmount?: number;
  discountRate?: number;
  discountAmount?: number;
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
  originalAmount?: number;
  discountRate?: number;
  discountAmount?: number;
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
  memberLevel: MemberLevel;
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

export interface MemberDiscount {
  id: string;
  level: MemberLevel;
  levelName: string;
  discountRate: number;
  minSpent: number;
  description?: string;
  active: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  orderType: OrderType;
  staffId: string;
  customerId: string;
  petId: string;
  type: ReviewType;
  rating: number;
  content: string;
  tags: string[];
  status: ReviewStatus;
  resolutionNote?: string;
  followUpDate?: string;
  contactAttempts?: number;
  lastContactAt?: string;
  penaltyAmount?: number;
  createdAt: string;
}

export interface ReviewSummary {
  staffId: string;
  totalReviews: number;
  positiveCount: number;
  negativeCount: number;
  fiveStarCount: number;
  pendingNegativeCount: number;
  avgRating: number;
  totalPenalty: number;
}

export type AdjustmentType = 'bonus' | 'penalty' | 'five_star_bonus' | 'allowance_extra' | 'other';

export interface PerformanceAdjustment {
  id: string;
  staffId: string;
  month: string;
  type: AdjustmentType;
  amount: number;
  reason: string;
  relatedReviewId?: string;
  createdAt: string;
}

export interface SalaryRecord {
  id: string;
  staffId: string;
  month: string;
  baseSalary: number;
  performance: number;
  fiveStarBonus: number;
  allowance: number;
  deduction: number;
  adjustments: PerformanceAdjustment[];
  total: number;
  status: SalaryStatus;
  completedOrders: number;
  fiveStarCount: number;
  remark?: string;
  createdAt: string;
}
