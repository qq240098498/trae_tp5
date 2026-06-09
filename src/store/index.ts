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
} from '../../shared/types';

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
}));
