import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Utensils,
  Users,
  Wallet,
  Cat,
  UserCircle,
  Settings,
  PawPrint,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  CalendarClock,
  Crown,
  MessageSquare,
  Star,
} from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '@/store';

const navGroups = [
  {
    label: '工作台',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: '数据仪表盘' },
    ],
  },
  {
    label: '寄养服务',
    items: [
      { to: '/boarding', icon: Home, label: '寄养订单' },
      { to: '/boarding/pricing', icon: Wallet, label: '计费规则' },
    ],
  },
  {
    label: '上门喂养',
    items: [
      { to: '/feeding', icon: Utensils, label: '喂养订单' },
      { to: '/feeding/schedule', icon: CalendarClock, label: '日程调度' },
    ],
  },
  {
    label: '饲养员管理',
    items: [
      { to: '/staff', icon: Users, label: '饲养员档案' },
      { to: '/staff/reviews', icon: MessageSquare, label: '评价管理' },
      { to: '/staff/performance', icon: Star, label: '绩效管理' },
      { to: '/staff/salary', icon: Wallet, label: '工资核算' },
    ],
  },
  {
    label: '档案管理',
    items: [
      { to: '/pets', icon: Cat, label: '宠物档案' },
      { to: '/customers', icon: UserCircle, label: '客户管理' },
    ],
  },
  {
    label: '会员体系',
    items: [
      { to: '/membership-discounts', icon: Crown, label: '等级与折扣' },
    ],
  },
  {
    label: '系统',
    items: [{ to: '/settings', icon: Settings, label: '系统设置' }],
  },
];

const breadcrumbMap: Record<string, string[]> = {
  '/dashboard': ['工作台', '仪表盘'],
  '/boarding': ['寄养服务', '寄养订单'],
  '/boarding/new': ['寄养服务', '新建订单'],
  '/boarding/pricing': ['寄养服务', '计费规则'],
  '/feeding': ['上门喂养', '喂养订单'],
  '/feeding/new': ['上门喂养', '新建订单'],
  '/feeding/schedule': ['上门喂养', '日程调度'],
  '/staff': ['饲养员管理', '饲养员档案'],
  '/staff/reviews': ['饲养员管理', '评价管理'],
  '/staff/performance': ['饲养员管理', '绩效管理'],
  '/staff/salary': ['饲养员管理', '工资核算'],
  '/pets': ['档案管理', '宠物档案'],
  '/customers': ['档案管理', '客户管理'],
  '/membership-discounts': ['会员体系', '等级与折扣'],
  '/settings': ['系统', '系统设置'],
};

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  const breadcrumb =
    Object.entries(breadcrumbMap).find(([k]) => pathname.startsWith(k))?.[1] || [
      '首页',
    ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gradient-to-b from-brand-900 via-brand-800 to-brand-900 transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-400 to-accent-500 shadow-lg shadow-accent-500/30">
                <PawPrint className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">宠爱管家</h1>
                <p className="text-[10px] text-brand-300">PetCare Admin</p>
              </div>
            </div>
            <button
              className="rounded-lg p-1.5 text-brand-200 hover:bg-white/10 lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-4 pb-4">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-brand-400/80">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-white/10 p-4">
            <button
              onClick={handleLogout}
              className="nav-item nav-item-inactive w-full"
            >
              <LogOut className="h-4 w-4" />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <nav className="flex items-center gap-2 text-sm">
              {breadcrumb.map((b, i) => (
                <span key={b} className="flex items-center gap-2">
                  {i > 0 && (
                    <span className="text-slate-300">/</span>
                  )}
                  <span
                    className={
                      i === breadcrumb.length - 1
                        ? 'font-semibold text-slate-800'
                        : 'text-slate-500'
                    }
                  >
                    {b}
                  </span>
                </span>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索..."
                className="w-56 rounded-xl border border-slate-100 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <button className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-semibold text-white">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold text-slate-800">
                  {user?.name || '管理员'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {user?.role || '系统管理员'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
