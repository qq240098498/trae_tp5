const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '请求失败' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  dashboard: {
    stats: () => request('/dashboard/stats'),
  },
  auth: {
    login: (username: string, password: string) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  },
  boarding: {
    orders: (status?: string) =>
      request(`/boarding/orders${status ? `?status=${status}` : ''}`),
    getOrder: (id: string) => request(`/boarding/orders/${id}`),
    createOrder: (data: unknown) =>
      request('/boarding/orders', { method: 'POST', body: JSON.stringify(data) }),
    updateOrder: (id: string, data: unknown) =>
      request(`/boarding/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    calcPrice: (data: unknown) =>
      request('/boarding/calculate-price', { method: 'POST', body: JSON.stringify(data) }),
    pricing: () => request('/boarding/pricing'),
    updatePricing: (id: string, data: unknown) =>
      request(`/boarding/pricing/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    addons: () => request('/boarding/addons'),
  },
  feeding: {
    orders: (status?: string) =>
      request(`/feeding/orders${status ? `?status=${status}` : ''}`),
    getOrder: (id: string) => request(`/feeding/orders/${id}`),
    createOrder: (data: unknown) =>
      request('/feeding/orders', { method: 'POST', body: JSON.stringify(data) }),
    updateOrder: (id: string, data: unknown) =>
      request(`/feeding/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  staff: {
    list: () => request('/staff'),
    get: (id: string) => request(`/staff/${id}`),
    create: (data: unknown) =>
      request('/staff', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      request(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: string) =>
      request(`/staff/${id}`, { method: 'DELETE' }),
    salaryRecords: (month?: string) =>
      request(`/staff/salary/records${month ? `?month=${month}` : ''}`),
    calcSalary: (staffId: string, month: string) =>
      request('/staff/salary/calculate', {
        method: 'POST',
        body: JSON.stringify({ staffId, month }),
      }),
    createSalaryRecord: (data: unknown) =>
      request('/staff/salary/records', { method: 'POST', body: JSON.stringify(data) }),
    updateSalaryRecord: (id: string, data: unknown) =>
      request(`/staff/salary/records/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  pets: {
    list: (customerId?: string) =>
      request(`/pets${customerId ? `?customerId=${customerId}` : ''}`),
    get: (id: string) => request(`/pets/${id}`),
    create: (data: unknown) =>
      request('/pets', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      request(`/pets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: string) => request(`/pets/${id}`, { method: 'DELETE' }),
  },
  customers: {
    list: () => request('/customers'),
    get: (id: string) => request(`/customers/${id}`),
    create: (data: unknown) =>
      request('/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: string) => request(`/customers/${id}`, { method: 'DELETE' }),
  },
  memberDiscounts: {
    list: () => request('/member-discounts'),
    get: (id: string) => request(`/member-discounts/${id}`),
    getByLevel: (level: string) => request(`/member-discounts/level/${level}`),
    create: (data: unknown) =>
      request('/member-discounts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      request(`/member-discounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: string) => request(`/member-discounts/${id}`, { method: 'DELETE' }),
  },
};
