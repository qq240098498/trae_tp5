import { useEffect, useState } from 'react';
import { ArrowLeft, Calculator } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';
import type { Pet, Customer, RoomType, PetType, AddonService } from '../../../shared/types';

export default function BoardingNew() {
  const pets = useAppStore((s) => s.pets);
  const customers = useAppStore((s) => s.customers);
  const setPets = useAppStore((s) => s.setPets);
  const setCustomers = useAppStore((s) => s.setCustomers);
  const addonServices = useAppStore((s) => s.addonServices);
  const setAddonServices = useAppStore((s) => s.setAddonServices);
  const navigate = useNavigate();

  const [customerId, setCustomerId] = useState('');
  const [petId, setPetId] = useState('');
  const [checkIn, setCheckIn] = useState('2026-06-09');
  const [checkOut, setCheckOut] = useState('2026-06-12');
  const [roomType, setRoomType] = useState<RoomType>('standard');
  const [services, setServices] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.pets.list().then((r) => setPets(r as Pet[]));
    api.customers.list().then((r) => setCustomers(r as Customer[]));
    api.boarding.addons().then((r) => setAddonServices(r as AddonService[]));
  }, [setPets, setCustomers, setAddonServices]);

  const filteredPets = customerId ? pets.filter((p) => p.customerId === customerId) : pets;

  const selectedPet = pets.find((p) => p.id === petId);

  useEffect(() => {
    if (petId && selectedPet && checkIn && checkOut) {
      api.boarding
        .calcPrice({ checkIn, checkOut, roomType, petType: selectedPet.type, services })
        .then((r) => setEstimatedPrice((r as { price: number }).price));
    }
  }, [petId, checkIn, checkOut, roomType, services, selectedPet]);

  const toggleService = (id: string) => {
    setServices((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !petId) return;
    setLoading(true);
    try {
      await api.boarding.createOrder({ customerId, petId, checkIn, checkOut, roomType, services, status: 'pending', notes });
      navigate('/boarding');
    } finally {
      setLoading(false);
    }
  };

  const petTypeLabel: Record<PetType, string> = { dog: '犬类', cat: '猫类', other: '其他' };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/boarding" className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">新建寄养订单</h1>
          <p className="mt-1 text-sm text-slate-500">填写宠物寄养服务信息并自动计算费用</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h3 className="mb-4 text-base font-bold text-slate-800">基本信息</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">客户</label>
                <select value={customerId} onChange={(e) => { setCustomerId(e.target.value); setPetId(''); }} className="select-field" required>
                  <option value="">请选择客户</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">宠物</label>
                <select value={petId} onChange={(e) => setPetId(e.target.value)} className="select-field" required>
                  <option value="">请选择宠物</option>
                  {filteredPets.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({petTypeLabel[p.type]} - {p.breed})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">入住日期</label>
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">退房日期</label>
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="input-field" required />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 text-base font-bold text-slate-800">房型选择</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { key: 'standard' as RoomType, label: '标准间', price: '¥80-120/天', desc: '基础舒适，适合小型宠物', color: 'border-brand-200 bg-brand-50' },
                { key: 'deluxe' as RoomType, label: '豪华间', price: '¥150-200/天', desc: '独立空间，含额外服务', color: 'border-accent-200 bg-accent-50' },
                { key: 'suite' as RoomType, label: '套房', price: '¥350/天起', desc: '专人照料，VIP级待遇', color: 'border-rose-200 bg-rose-50' },
              ].map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRoomType(r.key)}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${r.color} ${
                    roomType === r.key ? 'ring-2 ring-brand-500 ring-offset-2' : 'hover:shadow-md'
                  }`}
                >
                  <p className="font-bold text-slate-800">{r.label}</p>
                  <p className="mt-0.5 text-xs font-semibold text-brand-700">{r.price}</p>
                  <p className="mt-2 text-xs text-slate-500">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 text-base font-bold text-slate-800">附加服务</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {addonServices.map((s) => (
                <label
                  key={s.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                    services.includes(s.id)
                      ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-200'
                      : 'border-slate-200 bg-white hover:border-brand-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={services.includes(s.id)}
                      onChange={() => toggleService(s.id)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.description}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-brand-700">+¥{s.price}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 text-base font-bold text-slate-800">备注信息</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="特殊饮食要求、健康状况、注意事项等..."
              className="input-field resize-none"
            />
          </div>
        </div>

        {/* Price summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 overflow-hidden">
            <div className="bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Calculator className="h-4 w-4" />
                费用预估
              </div>
              {estimatedPrice !== null ? (
                <div className="mt-3">
                  <div className="text-4xl font-bold">¥{estimatedPrice}</div>
                  <p className="mt-1 text-xs text-white/70">
                    实际以退房结算为准
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-white/70">请选择宠物和日期查看预估</p>
              )}
            </div>
            <div className="space-y-3 p-6 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">房型费用</span>
                <span className="font-semibold text-slate-800">自动计算</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">周末加价</span>
                <span className="font-semibold text-slate-800">按日计算</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">附加服务</span>
                <span className="font-semibold text-slate-800">{services.length}项</span>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <button type="submit" disabled={loading || !customerId || !petId} className="btn-primary w-full justify-center">
                  {loading ? '创建中...' : '创建订单'}
                </button>
                <Link to="/boarding" className="btn-secondary mt-3 w-full justify-center">
                  取消
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
