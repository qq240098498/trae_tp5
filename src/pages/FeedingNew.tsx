import { useEffect, useState } from 'react';
import { ArrowLeft, Calculator, Award, Percent, Tag, MapPin, Clock, Utensils } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';
import type { Pet, Customer, MemberLevel } from '../../shared/types';

const LEVEL_INFO: Record<MemberLevel, { label: string; color: string }> = {
  normal: { label: '普通会员', color: 'from-slate-400 to-slate-600' },
  silver: { label: '银卡会员', color: 'from-slate-300 to-slate-500' },
  gold: { label: '金卡会员', color: 'from-amber-400 to-orange-500' },
  diamond: { label: '钻石会员', color: 'from-sky-400 via-cyan-400 to-teal-500' },
};

const DURATION_OPTIONS = [
  { value: 30, label: '30分钟', basePrice: 40 },
  { value: 45, label: '45分钟', basePrice: 60 },
  { value: 60, label: '60分钟', basePrice: 80 },
  { value: 90, label: '90分钟', basePrice: 120 },
  { value: 120, label: '120分钟', basePrice: 160 },
];

const SERVICE_OPTIONS = [
  '喂饭',
  '换水',
  '遛狗',
  '清理猫砂',
  '陪玩',
  '清理',
  '洗澡',
  '训练',
  '梳毛',
  '喂药',
];

export default function FeedingNew() {
  const pets = useAppStore((s) => s.pets);
  const customers = useAppStore((s) => s.customers);
  const setPets = useAppStore((s) => s.setPets);
  const setCustomers = useAppStore((s) => s.setCustomers);
  const navigate = useNavigate();

  const [customerId, setCustomerId] = useState('');
  const [petId, setPetId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('2026-06-10');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [duration, setDuration] = useState(45);
  const [services, setServices] = useState<string[]>(['喂饭', '换水']);
  const [petAddress, setPetAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.pets.list().then((r) => setPets(r as Pet[]));
    api.customers.list().then((r) => setCustomers(r as Customer[]));
  }, [setPets, setCustomers]);

  const filteredPets = customerId ? pets.filter((p) => p.customerId === customerId) : pets;
  const selectedPet = pets.find((p) => p.id === petId);
  const selectedCustomer = customers.find((c) => c.id === customerId);

  useEffect(() => {
    if (selectedCustomer && !petAddress) {
      setPetAddress(selectedCustomer.address);
    }
  }, [selectedCustomer, petAddress]);

  useEffect(() => {
    if (selectedPet && selectedCustomer && !petAddress) {
      setPetAddress(selectedCustomer.address);
    }
  }, [selectedPet, selectedCustomer, petAddress]);

  const toggleService = (s: string) => {
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const basePrice = DURATION_OPTIONS.find((d) => d.value === duration)?.basePrice || 0;
  const extraServiceCount = services.filter((s) => !['喂饭', '换水'].includes(s)).length;
  const extraPrice = extraServiceCount * 20;

  const originalAmount = basePrice + extraPrice;
  let finalPrice = originalAmount;
  let discountAmount = 0;
  let discountRate = 1;

  if (selectedCustomer) {
    const rates: Record<MemberLevel, number> = {
      normal: 1,
      silver: 0.95,
      gold: 0.88,
      diamond: 0.8,
    };
    discountRate = rates[selectedCustomer.memberLevel] || 1;
    finalPrice = Math.round(originalAmount * discountRate);
    discountAmount = originalAmount - finalPrice;
  }

  const hasDiscount = discountAmount > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !petId || !petAddress || services.length === 0) return;
    setLoading(true);
    try {
      await api.feeding.createOrder({
        customerId,
        petId,
        petAddress,
        scheduledDate,
        scheduledTime,
        duration,
        services,
        status: 'pending',
        amount: originalAmount,
        notes,
      });
      navigate('/feeding');
    } catch (err) {
      alert('创建失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const petTypeLabel: Record<string, string> = { dog: '犬类', cat: '猫类', other: '其他' };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/feeding" className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">新建喂养订单</h1>
          <p className="mt-1 text-sm text-slate-500">填写上门喂养服务信息并自动计算费用</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h3 className="mb-4 text-base font-bold text-slate-800">基本信息</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">客户</label>
                <select
                  value={customerId}
                  onChange={(e) => {
                    setCustomerId(e.target.value);
                    setPetId('');
                  }}
                  className="select-field"
                  required
                >
                  <option value="">请选择客户</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.phone} [{LEVEL_INFO[c.memberLevel].label}]
                    </option>
                  ))}
                </select>
                {selectedCustomer && (
                  <div
                    className={`mt-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${LEVEL_INFO[selectedCustomer.memberLevel].color} px-3 py-1 text-xs font-semibold text-white shadow-sm`}
                  >
                    <Award className="h-3 w-3" />
                    {LEVEL_INFO[selectedCustomer.memberLevel].label}
                    {selectedCustomer.totalSpent > 0 && (
                      <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                        累计¥{selectedCustomer.totalSpent.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">宠物</label>
                <select
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                  className="select-field"
                  required
                >
                  <option value="">请选择宠物</option>
                  {filteredPets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({petTypeLabel[p.type]} - {p.breed})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">预约日期</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">预约时间</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 text-base font-bold text-slate-800">服务时长</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDuration(d.value)}
                  className={`rounded-2xl border-2 p-4 text-center transition-all ${
                    duration === d.value
                      ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-200'
                      : 'border-slate-200 bg-white hover:border-brand-200 hover:shadow-md'
                  }`}
                >
                  <p className="text-lg font-bold text-slate-800">{d.value}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-slate-500">分钟</p>
                  <p className="mt-1 text-xs font-bold text-brand-700">¥{d.basePrice}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 text-base font-bold text-slate-800">
              服务内容
              <span className="ml-2 text-xs font-normal text-slate-400">（喂饭、换水免费，其余每项+¥20）</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {SERVICE_OPTIONS.map((s) => {
                const isFree = ['喂饭', '换水'].includes(s);
                const checked = services.includes(s);
                return (
                  <label
                    key={s}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                      checked
                        ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-200'
                        : 'border-slate-200 bg-white hover:border-brand-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleService(s)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm font-semibold text-slate-800">{s}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold ${
                        isFree ? 'text-slate-400' : 'text-brand-700'
                      }`}
                    >
                      {isFree ? '免费' : '+¥20'}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 text-base font-bold text-slate-800">服务地址</h3>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <textarea
                value={petAddress}
                onChange={(e) => setPetAddress(e.target.value)}
                rows={3}
                placeholder="请输入上门服务的详细地址"
                className="input-field resize-none pl-10"
                required
              />
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 text-base font-bold text-slate-800">备注信息</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="特殊饮食要求、钥匙位置、宠物习性等..."
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
              <div className="mt-3">
                {hasDiscount && (
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
                      <Tag className="mr-0.5 inline h-2.5 w-2.5" />
                      会员{Math.round(discountRate * 100)}折
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  {hasDiscount && (
                    <span className="text-lg text-white/50 line-through">¥{originalAmount}</span>
                  )}
                  <div className="text-4xl font-bold">¥{finalPrice}</div>
                </div>
                <p className="mt-1 text-xs text-white/70">
                  创建订单后分配饲养员
                </p>
              </div>
            </div>
            <div className="space-y-3 p-6 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-1">
                  <Utensils className="h-3.5 w-3.5" />
                  服务时长（{duration}分钟）
                </span>
                <span className="font-semibold text-slate-800">¥{basePrice}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">附加服务（{extraServiceCount}项）</span>
                <span className="font-semibold text-slate-800">¥{extraPrice}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">预约时间</span>
                <span className="font-semibold text-slate-800">{scheduledDate.slice(5)} {scheduledTime}</span>
              </div>
              {hasDiscount && (
                <>
                  <div className="my-1 border-t border-dashed border-slate-200" />
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Percent className="h-3.5 w-3.5" />
                      原价
                    </span>
                    <span className="font-semibold text-slate-500 line-through">
                      ¥{originalAmount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center rounded-xl bg-emerald-50 px-3 py-2 -mx-2">
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      会员折扣
                    </span>
                    <span className="font-bold text-emerald-700">
                      -¥{discountAmount}
                    </span>
                  </div>
                </>
              )}
              <div className="border-t border-slate-100 pt-3">
                <button
                  type="submit"
                  disabled={loading || !customerId || !petId || !petAddress || services.length === 0}
                  className="btn-primary w-full justify-center"
                >
                  {loading ? '创建中...' : '创建订单'}
                </button>
                <Link to="/feeding" className="btn-secondary mt-3 w-full justify-center">
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
