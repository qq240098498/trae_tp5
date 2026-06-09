import { useEffect } from 'react';
import {
  ClipboardList,
  Home,
  Clock,
  TrendingUp,
  ArrowRight,
  PawPrint,
  Dog,
  Bird,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import type { DashboardStats } from '../../../shared/types';

const PIE_COLORS = ['#0F766E', '#F59E0B', '#FB923C', '#10B981', '#8B5CF6'];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    checked_in: 'bg-emerald-100 text-emerald-700',
    in_progress: 'bg-blue-100 text-blue-700',
    assigned: 'bg-brand-100 text-brand-700',
    completed: 'bg-slate-100 text-slate-700',
    checked_out: 'bg-slate-100 text-slate-700',
  };
  const labelMap: Record<string, string> = {
    pending: '待处理',
    checked_in: '已入住',
    in_progress: '进行中',
    assigned: '已分配',
    completed: '已完成',
    checked_out: '已退房',
  };
  return (
    <span className={`badge ${map[status] || 'bg-slate-100 text-slate-700'}`}>
      {labelMap[status] || status}
    </span>
  );
}

function isBoarding(o: unknown): o is { roomType: string; checkIn: string } {
  return (o as { roomType?: string }).roomType !== undefined;
}

export default function Dashboard() {
  const stats = useAppStore((s) => s.dashboardStats);
  const setStats = useAppStore((s) => s.setDashboardStats);
  const customers = useAppStore((s) => s.customers);
  const pets = useAppStore((s) => s.pets);
  const setCustomers = useAppStore((s) => s.setCustomers);
  const setPets = useAppStore((s) => s.setPets);

  useEffect(() => {
    api.dashboard.stats().then((s) => setStats(s as DashboardStats));
    api.customers.list().then((c) => setCustomers(c as never[]));
    api.pets.list().then((p) => setPets(p as never[]));
  }, [setStats, setCustomers, setPets]);

  if (!stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  const statCards = [
    {
      label: '今日订单',
      value: stats.todayOrders,
      unit: '单',
      icon: ClipboardList,
      color: 'from-brand-500 to-brand-700',
      hint: '较昨日 +3',
      link: '/boarding',
    },
    {
      label: '在寄宠物',
      value: stats.boardingInHouse,
      unit: '只',
      icon: Home,
      color: 'from-accent-500 to-orange-500',
      hint: '2只今日入住',
      link: '/boarding',
    },
    {
      label: '待处理任务',
      value: stats.pendingTasks,
      unit: '项',
      icon: Clock,
      color: 'from-rose-500 to-pink-500',
      hint: '3个紧急',
      link: '/feeding',
    },
    {
      label: '本月营收',
      value: stats.monthlyRevenue.toLocaleString(),
      unit: '元',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      hint: '较上月 +12.5%',
      link: '/staff/salary',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((c) => (
          <Link to={c.link} key={c.label} className="group">
            <div
              className={`stat-card bg-gradient-to-br ${c.color}`}
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl transition-all group-hover:bg-white/20" />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-white/80">
                      {c.label}
                    </p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        {c.value}
                      </span>
                      <span className="text-sm text-white/80">{c.unit}</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm ring-1 ring-white/30">
                    <c.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-white/70">{c.hint}</span>
                  <ArrowRight className="h-4 w-4 opacity-70 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card p-6 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">近7日订单趋势</h3>
              <p className="mt-0.5 text-xs text-slate-500">寄养和上门喂养订单数量对比</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
                寄养
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-500" />
                上门喂养
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.orderTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="boarding"
                  name="寄养"
                  stroke="#0F766E"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0F766E' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="feeding"
                  name="上门喂养"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#F59E0B' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="mb-1 text-base font-bold text-slate-800">服务类型分布</h3>
          <p className="mb-4 text-xs text-slate-500">本月各业务营收占比</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.serviceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {stats.serviceDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {stats.serviceDistribution.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ background: PIE_COLORS[i] }}
                  />
                  <span className="text-slate-600">{s.name}</span>
                </span>
                <span className="font-semibold text-slate-800">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders & Quick Stats */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-50 px-6 py-4">
            <h3 className="text-base font-bold text-slate-800">最近订单</h3>
            <Link to="/boarding" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              查看全部 →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-th">订单号</th>
                  <th className="table-th">类型</th>
                  <th className="table-th">宠物</th>
                  <th className="table-th">日期</th>
                  <th className="table-th">金额</th>
                  <th className="table-th">状态</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => {
                  const pet = pets.find((p) => p.id === o.petId);
                  const boarding = isBoarding(o);
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/50">
                      <td className="table-td font-mono text-xs font-semibold text-slate-800">
                        {o.id.toUpperCase()}
                      </td>
                      <td className="table-td">
                        <span className={`badge ${boarding ? 'bg-brand-50 text-brand-700' : 'bg-accent-50 text-accent-700'}`}>
                          {boarding ? (
                            <Dog className="h-3 w-3" />
                          ) : (
                            <PawPrint className="h-3 w-3" />
                          )}
                          {boarding ? '寄养' : '上门喂养'}
                        </span>
                      </td>
                      <td className="table-td font-medium text-slate-800">{pet?.name || '-'}</td>
                      <td className="table-td text-slate-600">
                        {boarding ? o.checkIn : (o as { scheduledDate: string }).scheduledDate}
                      </td>
                      <td className="table-td font-semibold text-slate-800">
                        ¥{boarding ? o.totalAmount : (o as { amount: number }).amount}
                      </td>
                      <td className="table-td">
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="mb-4 text-base font-bold text-slate-800">快捷统计</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-brand-50/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                    <Bird className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">宠物总数</p>
                    <p className="text-xl font-bold text-slate-800">{pets.length}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-accent-50/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">客户总数</p>
                    <p className="text-xl font-bold text-slate-800">{customers.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white">
            <h3 className="text-sm font-semibold text-white/90">快速操作</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                to="/boarding/new"
                className="rounded-xl bg-white/10 p-3 text-center text-xs font-medium ring-1 ring-white/20 transition-all hover:bg-white/20"
              >
                新建寄养订单
              </Link>
              <Link
                to="/feeding"
                className="rounded-xl bg-white/10 p-3 text-center text-xs font-medium ring-1 ring-white/20 transition-all hover:bg-white/20"
              >
                安排喂养
              </Link>
              <Link
                to="/staff/salary"
                className="rounded-xl bg-white/10 p-3 text-center text-xs font-medium ring-1 ring-white/20 transition-all hover:bg-white/20"
              >
                核算工资
              </Link>
              <Link
                to="/pets"
                className="rounded-xl bg-white/10 p-3 text-center text-xs font-medium ring-1 ring-white/20 transition-all hover:bg-white/20"
              >
                新增宠物
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
