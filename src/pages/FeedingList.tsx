import { useEffect, useState } from 'react';
import { Plus, Search, MapPin, Clock, User, Edit2, CheckCircle, Eye, X } from 'lucide-react';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';
import type { FeedingOrder, Staff, Pet, Customer } from '../../shared/types';

const STATUS_LABEL: Record<string, string> = {
  pending: '待分配',
  assigned: '已分配',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
};
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  assigned: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

export default function FeedingList() {
  const orders = useAppStore((s) => s.feedingOrders);
  const setOrders = useAppStore((s) => s.setFeedingOrders);
  const staff = useAppStore((s) => s.staff);
  const pets = useAppStore((s) => s.pets);
  const customers = useAppStore((s) => s.customers);
  const setStaff = useAppStore((s) => s.setStaff);
  const setPets = useAppStore((s) => s.setPets);
  const setCustomers = useAppStore((s) => s.setCustomers);

  const [filter, setFilter] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<FeedingOrder | null>(null);
  const [assignStaffId, setAssignStaffId] = useState('');

  useEffect(() => {
    api.feeding.orders().then((r) => setOrders(r as FeedingOrder[]));
    api.staff.list().then((r) => setStaff(r as Staff[]));
    api.pets.list().then((r) => setPets(r as Pet[]));
    api.customers.list().then((r) => setCustomers(r as Customer[]));
  }, [setOrders, setStaff, setPets, setCustomers]);

  const filtered = orders.filter((o) => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (keyword) {
      const pet = pets.find((p) => p.id === o.petId);
      const k = keyword.toLowerCase();
      if (!o.id.toLowerCase().includes(k) && !pet?.name.toLowerCase().includes(k) && !o.petAddress.includes(keyword)) return false;
    }
    return true;
  });

  const assign = async () => {
    if (!selected || !assignStaffId) return;
    await api.feeding.updateOrder(selected.id, { staffId: assignStaffId, status: 'assigned' });
    const r = (await api.feeding.orders()) as FeedingOrder[];
    setOrders(r);
    setSelected(null);
    setAssignStaffId('');
  };

  const updateStatus = async (id: string, status: FeedingOrder['status']) => {
    await api.feeding.updateOrder(id, { status });
    const r = (await api.feeding.orders()) as FeedingOrder[];
    setOrders(r);
  };

  const stats = [
    { key: 'all', label: '全部', c: orders.length },
    { key: 'pending', label: '待分配', c: orders.filter((o) => o.status === 'pending').length },
    { key: 'assigned', label: '已分配', c: orders.filter((o) => o.status === 'assigned').length },
    { key: 'in_progress', label: '进行中', c: orders.filter((o) => o.status === 'in_progress').length },
    { key: 'completed', label: '已完成', c: orders.filter((o) => o.status === 'completed').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">上门喂养订单</h1>
          <p className="mt-1 text-sm text-slate-500">管理宠物上门喂养服务，分配饲养员</p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4" />
          新增喂养订单
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {stats.map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              filter === s.key
                ? 'bg-brand-700 text-white shadow-md'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {s.label}
            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${filter === s.key ? 'bg-white/20' : 'bg-slate-100'}`}>
              {s.c}
            </span>
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-50 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索地址、宠物名..."
              className="input-field pl-10"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">订单号</th>
                <th className="table-th">宠物 / 客户</th>
                <th className="table-th">服务地址</th>
                <th className="table-th">预约时间</th>
                <th className="table-th">时长</th>
                <th className="table-th">饲养员</th>
                <th className="table-th">金额</th>
                <th className="table-th">状态</th>
                <th className="table-th text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const pet = pets.find((p) => p.id === o.petId);
                const cust = customers.find((c) => c.id === o.customerId);
                const stf = staff.find((s) => s.id === o.staffId);
                return (
                  <tr key={o.id} className="hover:bg-slate-50/50">
                    <td className="table-td font-mono text-xs font-semibold text-slate-800">
                      {o.id.toUpperCase()}
                    </td>
                    <td className="table-td">
                      <p className="font-semibold text-slate-800">{pet?.name || '-'}</p>
                      <p className="text-xs text-slate-500">{cust?.name}</p>
                    </td>
                    <td className="table-td max-w-[240px]">
                      <div className="flex items-start gap-1 text-xs text-slate-600">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                        <span className="line-clamp-2">{o.petAddress}</span>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <div>
                          <p>{o.scheduledDate}</p>
                          <p className="font-semibold text-slate-700">{o.scheduledTime}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-slate-700">{o.duration}分钟</td>
                    <td className="table-td">
                      {stf ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                            {stf.name[0]}
                          </div>
                          <span className="text-sm text-slate-700">{stf.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">未分配</span>
                      )}
                    </td>
                    <td className="table-td font-bold text-slate-800">¥{o.amount}</td>
                    <td className="table-td">
                      <span className={`badge ${STATUS_COLOR[o.status]}`}>{STATUS_LABEL[o.status]}</span>
                    </td>
                    <td className="table-td">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setSelected(o); setAssignStaffId(o.staffId || ''); }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600" title="查看/分配">
                          <Eye className="h-4 w-4" />
                        </button>
                        {(o.status === 'assigned') && (
                          <button onClick={() => updateStatus(o.id, 'in_progress')} className="rounded-lg p-2 text-slate-500 hover:bg-purple-50 hover:text-purple-600" title="开始服务">
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                        {o.status === 'in_progress' && (
                          <button onClick={() => updateStatus(o.id, 'completed')} className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600" title="完成服务">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {o.status === 'pending' && (
                          <button onClick={() => { setSelected(o); }} className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600" title="分配饲养员">
                            <User className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">
                {selected.status === 'pending' ? '分配饲养员' : '订单详情'}
              </h3>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-4 p-6 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">订单号</p>
                  <p className="mt-0.5 font-mono font-semibold">{selected.id.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">状态</p>
                  <p className="mt-0.5"><span className={`badge ${STATUS_COLOR[selected.status]}`}>{STATUS_LABEL[selected.status]}</span></p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">预约时间</p>
                  <p className="mt-0.5 font-semibold">{selected.scheduledDate} {selected.scheduledTime}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">服务时长</p>
                  <p className="mt-0.5 font-semibold">{selected.duration}分钟</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">服务地址</p>
                <p className="mt-0.5 rounded-xl bg-slate-50 p-3 text-slate-700">{selected.petAddress}</p>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-700">分配饲养员</p>
                <select value={assignStaffId} onChange={(e) => setAssignStaffId(e.target.value)} className="select-field">
                  <option value="">请选择饲养员</option>
                  {staff.filter((s) => s.status === 'active').map((s) => (
                    <option key={s.id} value={s.id}>{s.name} - {s.skills.join('、')}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs text-slate-500">服务内容</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selected.services.map((s) => (
                    <span key={s} className="badge bg-brand-50 text-brand-700">{s}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={assign} disabled={!assignStaffId} className="btn-primary flex-1 justify-center">确认分配</button>
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1 justify-center">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
