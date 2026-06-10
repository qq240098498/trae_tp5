import { create } from 'zustand';
import type {
  BoardingOrder,
  FeedingOrder,
  Staff,
  SalaryRecord,
  Pet,
  Customer,
  PricingRule,
  AddonService,
  DashboardStats,
  MemberDiscount,
  Review,
  ReviewSummary,
  PerformanceAdjustment,
} from '../../shared/types';

interface FiveStarStat {
  staffId: string;
  staffName: string;
  month: string;
  completedOrders: number;
  fiveStarCount: number;
  fiveStarReviews: Array<{
    id: string;
    content: string;
    customerId: string;
    tags: string[];
    rating: number;
    createdAt: string;
  }>;
  basePerformance: number;
  totalFiveStarBonus: number;
  adjustments: PerformanceAdjustment[];
  adjustmentBonus: number;
  adjustmentPenalty: number;
  totalBonus: number;
}

interface AppState {
  isAuthenticated: boolean;
  user: { name: string; role: string } | null;
  login: (name: string, role: string) => void;
  logout: () => void;

  dashboardStats: DashboardStats | null;
  setDashboardStats: (s: DashboardStats) => void;

  boardingOrders: BoardingOrder[];
  setBoardingOrders: (o: BoardingOrder[]) => void;
  feedingOrders: FeedingOrder[];
  setFeedingOrders: (o: FeedingOrder[]) => void;
  feedingVersion: number;
  incrementFeedingVersion: () => void;
  staff: Staff[];
  setStaff: (s: Staff[]) => void;
  salaryRecords: SalaryRecord[];
  setSalaryRecords: (s: SalaryRecord[]) => void;
  pets: Pet[];
  setPets: (p: Pet[]) => void;
  customers: Customer[];
  setCustomers: (c: Customer[]) => void;
  pricingRules: PricingRule[];
  setPricingRules: (p: PricingRule[]) => void;
  addonServices: AddonService[];
  setAddonServices: (a: AddonService[]) => void;
  memberDiscounts: MemberDiscount[];
  setMemberDiscounts: (m: MemberDiscount[]) => void;
  reviews: Review[];
  setReviews: (r: Review[]) => void;
  reviewSummaries: ReviewSummary[];
  setReviewSummaries: (r: ReviewSummary[]) => void;
  fiveStarStats: FiveStarStat[];
  setFiveStarStats: (f: FiveStarStat[]) => void;
  performanceAdjustments: PerformanceAdjustment[];
  setPerformanceAdjustments: (p: PerformanceAdjustment[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (name, role) => set({ isAuthenticated: true, user: { name, role } }),
  logout: () => set({ isAuthenticated: false, user: null }),

  dashboardStats: null,
  setDashboardStats: (s) => set({ dashboardStats: s }),

  boardingOrders: [],
  setBoardingOrders: (o) => set({ boardingOrders: o }),
  feedingOrders: [],
  setFeedingOrders: (o) => set({ feedingOrders: o }),
  feedingVersion: 0,
  incrementFeedingVersion: () => set((s) => ({ feedingVersion: s.feedingVersion + 1 })),
  staff: [],
  setStaff: (s) => set({ staff: s }),
  salaryRecords: [],
  setSalaryRecords: (s) => set({ salaryRecords: s }),
  pets: [],
  setPets: (p) => set({ pets: p }),
  customers: [],
  setCustomers: (c) => set({ customers: c }),
  pricingRules: [],
  setPricingRules: (p) => set({ pricingRules: p }),
  addonServices: [],
  setAddonServices: (a) => set({ addonServices: a }),
  memberDiscounts: [],
  setMemberDiscounts: (m) => set({ memberDiscounts: m }),
  reviews: [],
  setReviews: (r) => set({ reviews: r }),
  reviewSummaries: [],
  setReviewSummaries: (r) => set({ reviewSummaries: r }),
  fiveStarStats: [],
  setFiveStarStats: (f) => set({ fiveStarStats: f }),
  performanceAdjustments: [],
  setPerformanceAdjustments: (p) => set({ performanceAdjustments: p }),
}));
