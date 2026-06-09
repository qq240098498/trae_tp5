import { useEffect, useState } from 'react';
import { Plus, Search, Phone, MapPin, Award, TrendingUp, X } from 'lucide-react';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';
import type { Customer, Pet } from '../../shared/types';

const LEVEL_INFO: Record<string, { label: string; color: string; min: number }> = {
  normal: { label: '普通会员', color: 'from-slate-400 to-slate-600', min: 0 },
  silver: { label: '银卡会员', color: 'from-slate-300 to-slate-500', min: 3000 },
  gold: { label: '金卡会员', color: 'from-accent-400 to-accent-600', min: 10000 },
  diamond: { label: '钻石会员', color: 'from-sky-400 via-cyan-400 to-teal-500', min: 30000 },
};

export default function Customers() {
  const customers = useAppStore((s) => s.customers);
  const pets = useAppStore((s) => s.pets);
  const setCustomers = useAppStore((s) => s.setCustomers);
  const setPets = useAppStore((s) => s.setPets);
  const [keyword, setKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.customers.list().then((r) => setCustomers(r as Customer[]));
    api.pets.list().then((r) => setPets(r as Pet[]));
  }, [setCustomers, setPets]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) return;
    setLoading(true);
    try {
      const newCustomer = await api.customers.create({
        ...formData,
        memberLevel: 'normal',
        totalSpent: 0,
      });
      setCustomers([...customers, newCustomer as Customer]);
      setShowModal(false);
      setFormData({ name: '', phone: '', address: '' });
    } catch (err) {
      alert('新增失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter((c) => {
    if (!keyword) return true;
    return c.name.includes(keyword) || c.phone.includes(keyword) || c.address.includes(keyword);
  });

  const petCountByCustomer = (id: string) => pets.filter((p) => p.customerId === id).length;
  const totalPets = pets.length;
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">客户管理</h1>
          <p className="mt-1 text-sm text-slate-500">查看和管理所有客户信息</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          新增客户
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: '总客户数', value: customers.length, icon: Award, color: 'from-brand-500 to-brand-700' },
          { label: '宠物总数', value: totalPets, icon: TrendingUp, color: 'from-accent-500 to-orange-500' },
          { label: '累计消费', value: '¥' + totalRevenue.toLocaleString(), icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
          { label: '钻石会员', value: customers.filter((c) => c.memberLevel === 'diamond').length, icon: Award, color: 'from-sky-500 to-cyan-600' },
        ].map((c) => (
          <div key={c.label} className={`stat-card bg-gradient-to-br ${c.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-white/80">{c.label}</p>
                <p className="mt-2 text-3xl font-bold">{c.value}</p>
              </div>
              <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm ring-1 ring-white/30">
                <c.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-50 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索客户名、电话、地址..."
              className="input-field pl-10"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">客户信息</th>
                <th className="table-th">联系方式</th>
                <th className="table-th">地址</th>
                <th className="table-th">会员等级</th>
                <th className="table-th">宠物数量</th>
                <th className="table-th text-right">累计消费</th>
                <th className="table-th">注册时间</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const info = LEVEL_INFO[c.memberLevel];
                const nextLevel = Object.entries(LEVEL_INFO).find(([, v]) => v.min > c.totalSpent);
                const nextMin = nextLevel ? nextLevel[1].min : c.totalSpent;
                const progress = Math.min(100, (c.totalSpent / Math.max(1, nextMin)) * 100);
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${info.color} text-sm font-bold text-white shadow-md`}>
                          {c.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{c.name}</p>
                          <p className="text-xs text-slate-500">ID: {c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5 text-sm text-slate-700">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-mono">{c.phone}</span>
                      </div>
                    </td>
                    <td className="table-td max-w-[280px]">
                      <div className="flex items-start gap-1.5 text-xs text-slate-600">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                        <span className="line-clamp-2">{c.address}</span>
                      </div>
                    </td>
                    <td className="table-td">
                      <div>
                        <span className={`badge bg-gradient-to-r ${info.color} text-white shadow-sm`}>
                          <Award className="h-3 w-3" />
                          {info.label}
                        </span>
                        {nextLevel && (
                          <div className="mt-2">
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                              <span>距{nextLevel[1].label}</span>
                              <span>¥{(nextMin - c.totalSpent).toLocaleString()}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${info.color} transition-all`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-td">
                      <span className="badge bg-brand-50 text-brand-700 font-semibold">
                        {petCountByCustomer(c.id)}只宠物
                      </span>
                    </td>
                    <td className="table-td text-right">
                      <p className="text-lg font-bold text-slate-800">¥{c.totalSpent.toLocaleString()}</p>
                    </td>
                    <td className="table-td text-xs text-slate-500">{c.createdAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">新增客户</h2>
                <p className="mt-0.5 text-xs text-slate-500">填写客户基本信息</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">客户姓名 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入客户姓名"
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">联系电话 *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="请输入联系电话"
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">家庭地址</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="请输入家庭地址"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.name || !formData.phone}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {loading ? '保存中...' : '确认新增'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
