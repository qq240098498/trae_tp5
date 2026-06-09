import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Calendar, Edit, Eye, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';
import type { BoardingOrder, Staff, Pet, Customer } from '../../shared/types';

const STATUS_LABEL: Record<string, string> = {
  pending: '待入住',
  checked_in: '已入住',
  checked_out: '已退房',
  cancelled: '已取消',
};
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  checked_in: 'bg-emerald-100 text-emerald-700',
  checked_out: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-rose-100 text-rose-700',
};
const ROOM_LABEL: Record<string, string> = {
  standard: '标准间',
  deluxe: '豪华间',
  suite: '套房',
};

export default function BoardingList() {
  const orders = useAppStore((s) => s.boardingOrders);
  const setOrders = useAppStore((s) => s.setBoardingOrders);
  const staff = useAppStore((s) => s.staff);
  const pets = useAppStore((s) => s.pets);
  const customers = useAppStore((s) => s.customers);
  const setStaff = useAppStore((s) => s.setStaff);
  const setPets = useAppStore((s) => s.setPets);
  const setCustomers = useAppStore((s) => s.setCustomers);

  const [filter, setFilter] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<BoardingOrder | null>(null);

  useEffect(() => {
    api.boarding.orders().then((r) => setOrders(r as BoardingOrder[]));
    api.staff.list().then((r) => setStaff(r as Staff[]));
    api.pets.list().then((r) => setPets(r as Pet[]));
    api.customers.list().then((r) => setCustomers(r as Customer[]));
  }, [setOrders, setStaff, setPets, setCustomers]);

  const filtered = orders.filter((o) => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (keyword) {
      const pet = pets.find((p) => p.id === o.petId);
      const cust = customers.find((c) => c.id === o.customerId);
      const k = keyword.toLowerCase();
      if (
        !o.id.toLowerCase().includes(k) &&
        !pet?.name.toLowerCase().includes(k) &&
        !cust?.name.toLowerCase().includes(k)
      ) return false;
    }
    return true;
  });

  const updateStatus = async (id: string, status: BoardingOrder['status']) => {
    await api.boarding.updateOrder(id, { status });
    const r = (await api.boarding.orders()) as BoardingOrder[];
    setOrders(r);
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">寄养订单管理</h1>
          <p className="mt-1 text-sm text-slate-500">管理宠物寄养服务订单和入住状态</p>
        </div>
        <Link to="/boarding/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          新建寄养订单
        </Link>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { key: 'all', label: '全部订单', count: orders.length, color: 'bg-brand-50 text-brand-700 border-brand-100' },
          { key: 'pending', label: '待入住', count: orders.filter((o) => o.status === 'pending').length, color: 'bg-amber-50 text-amber-700 border-amber-100' },
          { key: 'checked_in', label: '已入住', count: orders.filter((o) => o.status === 'checked_in').length, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
          { key: 'checked_out', label: '已退房', count: orders.filter((o) => o.status === 'checked_out').length, color: 'bg-slate-50 text-slate-700 border-slate-200' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-2xl border p-4 text-left transition-all ${t.color} ${
              filter === t.key ? 'ring-2 ring-offset-2 ring-brand-500 scale-[1.02]' : 'hover:shadow-md'
            }`}
          >
            <p className="text-xs font-medium opacity-75">{t.label}</p>
            <p className="mt-1 text-2xl font-bold">{t.count}</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索订单号、宠物名、客户名..."
              className="input-field pl-10"
            />
          </div>
          <button className="btn-secondary">
            <Filter className="h-4 w-4" />
            高级筛选
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">订单号</th>
                <th className="table-th">宠物 / 客户</th>
                <th className="table-th">房型</th>
                <th className="table-th">入住 - 退房</th>
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
                const stf = staff.find((s) => s.id === o.assignedStaffId);
                return (
                  <tr key={o.id} className="hover:bg-slate-50/50">
                    <td className="table-td">
                      <span className="font-mono text-xs font-semibold text-slate-800">
                        {o.id.toUpperCase()}
                      </span>
                    </td>
                    <td className="table-td">
                      <p className="font-semibold text-slate-800">{pet?.name || '-'}</p>
                      <p className="text-xs text-slate-500">{cust?.name || '-'}</p>
                    </td>
                    <td className="table-td">
                      <span className="badge bg-brand-50 text-brand-700">
                        {ROOM_LABEL[o.roomType]}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{o.checkIn.slice(5)}</span>
                        <X className="h-3 w-3 text-slate-300" />
                        <span>{o.checkOut.slice(5)}</span>
                      </div>
                    </td>
                    <td className="table-td">
                      {stf ? (
                        <span className="text-sm text-slate-700">{stf.name}</span>
                      ) : (
                        <span className="text-xs text-slate-400">未分配</span>
                      )}
                    </td>
                    <td className="table-td font-bold text-slate-800">¥{o.totalAmount}</td>
                    <td className="table-td">
                      <span className={`badge ${STATUS_COLOR[o.status]}`}>
                        {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setSelected(o)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600"
                          title="查看"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {o.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(o.id, 'checked_in')}
                            className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                            title="办理入住"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {o.status === 'checked_in' && (
                          <button
                            onClick={() => updateStatus(o.id, 'checked_out')}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            title="办理退房"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-slate-400">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">订单详情</h3>
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
                  <p className="text-xs text-slate-500">入住时间</p>
                  <p className="mt-0.5 font-semibold text-slate-800">{selected.checkIn}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">退房时间</p>
                  <p className="mt-0.5 font-semibold text-slate-800">{selected.checkOut}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">房型</p>
                  <p className="mt-0.5 font-semibold text-slate-800">{ROOM_LABEL[selected.roomType]}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">金额</p>
                  <p className="mt-0.5 text-lg font-bold text-brand-700">¥{selected.totalAmount}</p>
                </div>
              </div>
              {selected.notes && (
                <div>
                  <p className="text-xs text-slate-500">备注</p>
                  <p className="mt-0.5 rounded-xl bg-slate-50 p-3 text-slate-700">{selected.notes}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              {selected.status === 'pending' && (
                <button onClick={() => updateStatus(selected.id, 'checked_in')} className="btn-primary flex-1">
                  办理入住
                </button>
              )}
              {selected.status === 'checked_in' && (
                <button onClick={() => updateStatus(selected.id, 'checked_out')} className="btn-primary flex-1">
                  办理退房
                </button>
              )}
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
