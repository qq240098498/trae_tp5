import {
  customers,
  pets,
  staff,
  pricingRules,
  addonServices,
  boardingOrders,
  feedingOrders,
  salaryRecords,
  memberDiscounts,
  reviews,
} from './mockData';
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
  RoomType,
  PetType,
  MemberDiscount,
  MemberLevel,
  Review,
  ReviewSummary,
} from '../../shared/types';

const genId = (prefix: string) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

interface Store {
  customers: Customer[];
  pets: Pet[];
  staff: Staff[];
  pricingRules: PricingRule[];
  addonServices: AddonService[];
  boardingOrders: BoardingOrder[];
  feedingOrders: FeedingOrder[];
  salaryRecords: SalaryRecord[];
  memberDiscounts: MemberDiscount[];
  reviews: Review[];
}

let store: Store = {
  customers: [...customers],
  pets: [...pets],
  staff: [...staff],
  pricingRules: [...pricingRules],
  addonServices: [...addonServices],
  boardingOrders: [...boardingOrders],
  feedingOrders: [...feedingOrders],
  salaryRecords: [...salaryRecords],
  memberDiscounts: [...memberDiscounts],
  reviews: [...reviews],
};

const calcBoardingPrice = (
  checkIn: string,
  checkOut: string,
  roomType: RoomType,
  petType: PetType,
  services: string[]
): number => {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const days = Math.max(1, Math.ceil((outDate.getTime() - inDate.getTime()) / 86400000));
  const rule = store.pricingRules.find(
    (r) => r.roomType === roomType && r.petType === petType && r.active
  );
  let total = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(inDate.getTime() + i * 86400000);
    const day = d.getDay();
    const isWeekend = day === 0 || day === 6;
    total += rule
      ? rule.basePricePerDay + (isWeekend ? rule.weekendSurcharge : 0)
      : 100;
  }
  services.forEach((sid) => {
    const svc = store.addonServices.find((a) => a.id === sid);
    if (svc) total += svc.price;
  });
  return total;
};

const getDiscountByLevel = (level: MemberLevel): MemberDiscount | undefined => {
  return store.memberDiscounts.find((d) => d.level === level && d.active);
};

const applyDiscount = (originalPrice: number, level: MemberLevel) => {
  const discount = getDiscountByLevel(level);
  if (!discount) {
    return {
      originalAmount: originalPrice,
      totalAmount: originalPrice,
      discountRate: 1,
      discountAmount: 0,
    };
  }
  const discountRate = discount.discountRate;
  const totalAmount = Math.round(originalPrice * discountRate);
  const discountAmount = originalPrice - totalAmount;
  return {
    originalAmount: originalPrice,
    totalAmount,
    discountRate,
    discountAmount,
  };
};

const calcBoardingPriceWithDiscount = (
  checkIn: string,
  checkOut: string,
  roomType: RoomType,
  petType: PetType,
  services: string[],
  customerId?: string
) => {
  const originalPrice = calcBoardingPrice(checkIn, checkOut, roomType, petType, services);
  if (!customerId) {
    return {
      originalAmount: originalPrice,
      price: originalPrice,
      discountRate: 1,
      discountAmount: 0,
    };
  }
  const customer = store.customers.find((c) => c.id === customerId);
  if (!customer) {
    return {
      originalAmount: originalPrice,
      price: originalPrice,
      discountRate: 1,
      discountAmount: 0,
    };
  }
  const result = applyDiscount(originalPrice, customer.memberLevel);
  return {
    originalAmount: result.originalAmount,
    price: result.totalAmount,
    discountRate: result.discountRate,
    discountAmount: result.discountAmount,
  };
};

const getDashboardStats = (): DashboardStats => {
  const today = new Date('2026-06-09').toISOString().split('T')[0];
  const todayOrders =
    store.boardingOrders.filter((o) => o.checkIn === today).length +
    store.feedingOrders.filter((o) => o.scheduledDate === today).length;
  const boardingInHouse = store.boardingOrders.filter(
    (o) => o.status === 'checked_in'
  ).length;
  const pendingTasks =
    store.feedingOrders.filter((o) => o.status === 'pending' || o.status === 'assigned').length +
    store.boardingOrders.filter((o) => o.status === 'pending').length;

  const monthStart = '2026-06-01';
  const monthlyRevenue =
    store.boardingOrders
      .filter((o) => o.createdAt >= monthStart)
      .reduce((s, o) => s + o.totalAmount, 0) +
    store.feedingOrders
      .filter((o) => o.createdAt >= monthStart)
      .reduce((s, o) => s + o.amount, 0);

  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date('2026-06-09').getTime() - i * 86400000;
    const date = new Date(d).toISOString().split('T')[0];
    const boarding = store.boardingOrders.filter((o) => o.createdAt === date).length;
    const feeding = store.feedingOrders.filter((o) => o.createdAt === date).length;
    trend.push({ date: date.slice(5), boarding, feeding });
  }

  const serviceDistribution = [
    { name: '寄养服务', value: store.boardingOrders.length * 10 },
    { name: '上门喂养', value: store.feedingOrders.length * 10 },
    { name: '美容服务', value: 25 },
    { name: '训练服务', value: 18 },
    { name: '医疗服务', value: 12 },
  ];

  const recentOrders = [...store.boardingOrders, ...store.feedingOrders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  return {
    todayOrders,
    boardingInHouse,
    pendingTasks,
    monthlyRevenue,
    orderTrend: trend,
    serviceDistribution,
    recentOrders,
  };
};

export const storeApi = {
  getDashboardStats,

  getCustomers: () => store.customers,
  getCustomer: (id: string) => store.customers.find((c) => c.id === id),
  createCustomer: (data: Omit<Customer, 'id' | 'createdAt' | 'totalSpent'>) => {
    const c: Customer = {
      ...data,
      id: genId('c'),
      totalSpent: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    store.customers.push(c);
    return c;
  },
  updateCustomer: (id: string, data: Partial<Customer>) => {
    const idx = store.customers.findIndex((c) => c.id === id);
    if (idx >= 0) {
      store.customers[idx] = { ...store.customers[idx], ...data };
      return store.customers[idx];
    }
    return null;
  },
  deleteCustomer: (id: string) => {
    store.customers = store.customers.filter((c) => c.id !== id);
    return true;
  },

  getPets: (customerId?: string) =>
    customerId ? store.pets.filter((p) => p.customerId === customerId) : store.pets,
  getPet: (id: string) => store.pets.find((p) => p.id === id),
  createPet: (data: Omit<Pet, 'id'>) => {
    const p: Pet = { ...data, id: genId('p') };
    store.pets.push(p);
    return p;
  },
  updatePet: (id: string, data: Partial<Pet>) => {
    const idx = store.pets.findIndex((p) => p.id === id);
    if (idx >= 0) {
      store.pets[idx] = { ...store.pets[idx], ...data };
      return store.pets[idx];
    }
    return null;
  },
  deletePet: (id: string) => {
    store.pets = store.pets.filter((p) => p.id !== id);
    return true;
  },

  getStaff: () => store.staff,
  getStaffMember: (id: string) => store.staff.find((s) => s.id === id),
  createStaff: (data: Omit<Staff, 'id'>) => {
    const s: Staff = { ...data, id: genId('s') };
    store.staff.push(s);
    return s;
  },
  updateStaff: (id: string, data: Partial<Staff>) => {
    const idx = store.staff.findIndex((s) => s.id === id);
    if (idx >= 0) {
      store.staff[idx] = { ...store.staff[idx], ...data };
      return store.staff[idx];
    }
    return null;
  },
  deleteStaff: (id: string) => {
    store.staff = store.staff.filter((s) => s.id !== id);
    return true;
  },

  getPricingRules: () => store.pricingRules,
  updatePricingRule: (id: string, data: Partial<PricingRule>) => {
    const idx = store.pricingRules.findIndex((r) => r.id === id);
    if (idx >= 0) {
      store.pricingRules[idx] = { ...store.pricingRules[idx], ...data };
      return store.pricingRules[idx];
    }
    return null;
  },
  getAddonServices: () => store.addonServices,

  getBoardingOrders: (status?: string) =>
    status && status !== 'all'
      ? store.boardingOrders.filter((o) => o.status === status)
      : store.boardingOrders,
  getBoardingOrder: (id: string) => store.boardingOrders.find((o) => o.id === id),
  createBoardingOrder: (
    data: Omit<BoardingOrder, 'id' | 'createdAt' | 'totalAmount' | 'originalAmount' | 'discountRate' | 'discountAmount'>
  ) => {
    const pet = store.pets.find((p) => p.id === data.petId);
    const customer = store.customers.find((c) => c.id === data.customerId);
    const originalAmount = calcBoardingPrice(
      data.checkIn,
      data.checkOut,
      data.roomType,
      pet?.type || 'dog',
      data.services
    );
    const discountResult = customer ? applyDiscount(originalAmount, customer.memberLevel) : {
      originalAmount,
      totalAmount: originalAmount,
      discountRate: 1,
      discountAmount: 0,
    };
    const o: BoardingOrder = {
      ...data,
      id: genId('b'),
      originalAmount: discountResult.originalAmount,
      totalAmount: discountResult.totalAmount,
      discountRate: discountResult.discountRate,
      discountAmount: discountResult.discountAmount,
      createdAt: new Date().toISOString().split('T')[0],
    };
    store.boardingOrders.push(o);
    return o;
  },
  updateBoardingOrder: (id: string, data: Partial<BoardingOrder>) => {
    const idx = store.boardingOrders.findIndex((o) => o.id === id);
    if (idx >= 0) {
      store.boardingOrders[idx] = { ...store.boardingOrders[idx], ...data };
      return store.boardingOrders[idx];
    }
    return null;
  },
  calcBoardingPrice,
  calcBoardingPriceWithDiscount,

  getFeedingOrders: (status?: string) =>
    status && status !== 'all'
      ? store.feedingOrders.filter((o) => o.status === status)
      : store.feedingOrders,
  getFeedingOrder: (id: string) => store.feedingOrders.find((o) => o.id === id),
  createFeedingOrder: (data: Omit<FeedingOrder, 'id' | 'createdAt' | 'originalAmount' | 'discountRate' | 'discountAmount'>) => {
    const customer = store.customers.find((c) => c.id === data.customerId);
    const originalAmount = data.amount;
    const discountResult = customer ? applyDiscount(originalAmount, customer.memberLevel) : {
      originalAmount,
      totalAmount: originalAmount,
      discountRate: 1,
      discountAmount: 0,
    };
    const o: FeedingOrder = {
      ...data,
      amount: discountResult.totalAmount,
      originalAmount: discountResult.originalAmount,
      discountRate: discountResult.discountRate,
      discountAmount: discountResult.discountAmount,
      id: genId('f'),
      createdAt: new Date().toISOString().split('T')[0],
    };
    store.feedingOrders.push(o);
    return o;
  },
  updateFeedingOrder: (id: string, data: Partial<FeedingOrder>) => {
    const idx = store.feedingOrders.findIndex((o) => o.id === id);
    if (idx >= 0) {
      store.feedingOrders[idx] = { ...store.feedingOrders[idx], ...data };
      return store.feedingOrders[idx];
    }
    return null;
  },

  getSalaryRecords: (month?: string) =>
    month ? store.salaryRecords.filter((s) => s.month === month) : store.salaryRecords,
  createSalaryRecord: (data: Omit<SalaryRecord, 'id' | 'createdAt'>) => {
    const s: SalaryRecord = {
      ...data,
      id: genId('sal'),
      createdAt: new Date().toISOString().split('T')[0],
    };
    store.salaryRecords.push(s);
    return s;
  },
  updateSalaryRecord: (id: string, data: Partial<SalaryRecord>) => {
    const idx = store.salaryRecords.findIndex((s) => s.id === id);
    if (idx >= 0) {
      store.salaryRecords[idx] = { ...store.salaryRecords[idx], ...data };
      return store.salaryRecords[idx];
    }
    return null;
  },
  calculateSalary: (staffId: string, month: string): SalaryRecord => {
    const member = store.staff.find((s) => s.id === staffId);
    if (!member) throw new Error('Staff not found');
    const start = `${month}-01`;
    const end = `${month}-31`;
    const completedFeedings = store.feedingOrders.filter(
      (o) =>
        o.staffId === staffId &&
        o.status === 'completed' &&
        o.scheduledDate >= start &&
        o.scheduledDate <= end
    ).length;
    const assignedBoardings = store.boardingOrders.filter(
      (o) =>
        o.assignedStaffId === staffId &&
        o.status !== 'cancelled' &&
        o.checkIn >= start &&
        o.checkIn <= end
    ).length;
    const monthReviews = store.reviews.filter(
      (r) => r.staffId === staffId && r.createdAt >= start && r.createdAt <= end
    );
    const negativePenalty = monthReviews
      .filter((r) => r.type === 'negative')
      .reduce((sum, r) => sum + (r.penaltyAmount || 0), 0);
    const positiveBonus = monthReviews.filter((r) => r.type === 'positive').length * 20;
    const performance = Math.round(
      (completedFeedings * 50 + assignedBoardings * 80) * member.performanceRate + positiveBonus
    );
    const allowance = completedFeedings > 30 ? 800 : completedFeedings > 15 ? 500 : 300;
    const deduction = negativePenalty;
    const baseSalary = member.baseSalary;
    const total = baseSalary + performance + allowance - deduction;
    const negativeCount = monthReviews.filter((r) => r.type === 'negative').length;
    const remarkParts: string[] = [];
    if (negativeCount > 0) remarkParts.push(`差评${negativeCount}条`);
    if (positiveBonus > 0) remarkParts.push(`好评奖金+¥${positiveBonus}`);
    if (negativePenalty > 0) remarkParts.push(`差评扣款-¥${negativePenalty}`);
    return {
      id: genId('sal'),
      staffId,
      month,
      baseSalary,
      performance,
      allowance,
      deduction,
      total: Math.max(0, total),
      status: 'pending',
      completedOrders: completedFeedings + assignedBoardings,
      remark: remarkParts.length > 0 ? remarkParts.join('，') : undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };
  },

  getReviews: (params?: { staffId?: string; type?: string; status?: string }) => {
    let result = store.reviews;
    if (params?.staffId) result = result.filter((r) => r.staffId === params.staffId);
    if (params?.type && params.type !== 'all') result = result.filter((r) => r.type === params.type);
    if (params?.status && params.status !== 'all') result = result.filter((r) => r.status === params.status);
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  getReview: (id: string) => store.reviews.find((r) => r.id === id),
  createReview: (data: Omit<Review, 'id' | 'createdAt'>) => {
    const r: Review = {
      ...data,
      id: genId('r'),
      createdAt: new Date().toISOString().split('T')[0],
    };
    store.reviews.push(r);
    return r;
  },
  updateReview: (id: string, data: Partial<Review>) => {
    const idx = store.reviews.findIndex((r) => r.id === id);
    if (idx >= 0) {
      store.reviews[idx] = { ...store.reviews[idx], ...data };
      return store.reviews[idx];
    }
    return null;
  },
  deleteReview: (id: string) => {
    store.reviews = store.reviews.filter((r) => r.id !== id);
    return true;
  },
  getReviewSummary: (staffId?: string): ReviewSummary[] => {
    const staffList = staffId ? store.staff.filter((s) => s.id === staffId) : store.staff;
    return staffList.map((s) => {
      const staffReviews = store.reviews.filter((r) => r.staffId === s.id);
      const positiveCount = staffReviews.filter((r) => r.type === 'positive').length;
      const negativeCount = staffReviews.filter((r) => r.type === 'negative').length;
      const pendingNegativeCount = staffReviews.filter(
        (r) => r.type === 'negative' && r.status === 'pending'
      ).length;
      const avgRating =
        staffReviews.length > 0
          ? Math.round(
              (staffReviews.reduce((sum, r) => sum + r.rating, 0) / staffReviews.length) * 10
            ) / 10
          : 0;
      const totalPenalty = staffReviews
        .filter((r) => r.type === 'negative')
        .reduce((sum, r) => sum + (r.penaltyAmount || 0), 0);
      return {
        staffId: s.id,
        totalReviews: staffReviews.length,
        positiveCount,
        negativeCount,
        pendingNegativeCount,
        avgRating,
        totalPenalty,
      };
    });
  },
  recordContact: (reviewId: string) => {
    const idx = store.reviews.findIndex((r) => r.id === reviewId);
    if (idx >= 0) {
      store.reviews[idx] = {
        ...store.reviews[idx],
        contactAttempts: (store.reviews[idx].contactAttempts || 0) + 1,
        lastContactAt: new Date().toISOString().split('T')[0],
      };
      return store.reviews[idx];
    }
    return null;
  },

  getMemberDiscounts: () => store.memberDiscounts,
  getMemberDiscount: (id: string) => store.memberDiscounts.find((d) => d.id === id),
  getMemberDiscountByLevel: (level: MemberLevel) => getDiscountByLevel(level),
  createMemberDiscount: (data: Omit<MemberDiscount, 'id' | 'createdAt'>) => {
    const d: MemberDiscount = {
      ...data,
      id: genId('md'),
      createdAt: new Date().toISOString().split('T')[0],
    };
    store.memberDiscounts.push(d);
    return d;
  },
  updateMemberDiscount: (id: string, data: Partial<MemberDiscount>) => {
    const idx = store.memberDiscounts.findIndex((d) => d.id === id);
    if (idx >= 0) {
      store.memberDiscounts[idx] = { ...store.memberDiscounts[idx], ...data };
      return store.memberDiscounts[idx];
    }
    return null;
  },
  deleteMemberDiscount: (id: string) => {
    store.memberDiscounts = store.memberDiscounts.filter((d) => d.id !== id);
    return true;
  },
};
