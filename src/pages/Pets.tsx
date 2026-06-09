import { useEffect, useState } from 'react';
import { Plus, Search, Syringe, Weight, Stethoscope, Cat, Dog, Bird, X } from 'lucide-react';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';
import type { Pet, Customer, PetType } from '../../shared/types';

const PET_LABEL: Record<PetType, { label: string; icon: typeof Cat; color: string }> = {
  dog: { label: '狗狗', icon: Dog, color: 'from-sky-400 to-sky-600' },
  cat: { label: '猫咪', icon: Cat, color: 'from-pink-400 to-rose-500' },
  other: { label: '其他', icon: Bird, color: 'from-violet-400 to-purple-500' },
};

export default function Pets() {
  const pets = useAppStore((s) => s.pets);
  const customers = useAppStore((s) => s.customers);
  const setPets = useAppStore((s) => s.setPets);
  const setCustomers = useAppStore((s) => s.setCustomers);
  const [filter, setFilter] = useState<PetType | 'all'>('all');
  const [keyword, setKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'dog' as PetType,
    breed: '',
    age: 1,
    weight: 1,
    customerId: '',
    vaccineDate: '',
    healthNote: '',
  });

  useEffect(() => {
    api.pets.list().then((r) => setPets(r as Pet[]));
    api.customers.list().then((r) => setCustomers(r as Customer[]));
  }, [setPets, setCustomers]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.breed || !formData.customerId) return;
    setLoading(true);
    try {
      const newPet = await api.pets.create(formData);
      setPets([...pets, newPet as Pet]);
      setShowModal(false);
      setFormData({
        name: '',
        type: 'dog',
        breed: '',
        age: 1,
        weight: 1,
        customerId: '',
        vaccineDate: '',
        healthNote: '',
      });
    } catch (err) {
      alert('新增失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const filtered = pets.filter((p) => {
    if (filter !== 'all' && p.type !== filter) return false;
    if (keyword) {
      const k = keyword.toLowerCase();
      const cust = customers.find((c) => c.id === p.customerId);
      if (!p.name.toLowerCase().includes(k) && !p.breed.includes(keyword) && !cust?.name.includes(keyword)) return false;
    }
    return true;
  });

  const getCustomer = (id: string) => customers.find((c) => c.id === id);

  const counts = {
    all: pets.length,
    dog: pets.filter((p) => p.type === 'dog').length,
    cat: pets.filter((p) => p.type === 'cat').length,
    other: pets.filter((p) => p.type === 'other').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">宠物档案</h1>
          <p className="mt-1 text-sm text-slate-500">管理所有宠物的基本信息和健康记录</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          新增宠物档案
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {(['all', 'dog', 'cat', 'other'] as const).map((t) => {
          const info = t === 'all' ? { label: '全部', color: 'bg-slate-700' } : { label: PET_LABEL[t].label, color: '' };
          const IconComp = t !== 'all' ? PET_LABEL[t].icon : null;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                filter === t
                  ? 'bg-brand-700 text-white shadow-lg shadow-brand-700/25'
                  : 'bg-white ring-1 ring-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {IconComp && <IconComp className="h-4 w-4" />}
              {info.label}
              <span className={`rounded-full px-2 py-0.5 text-xs ${filter === t ? 'bg-white/20' : 'bg-slate-100'}`}>
                {counts[t]}
              </span>
            </button>
          );
        })}
        <div className="relative ml-auto max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索名字、品种、主人..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => {
          const cfg = PET_LABEL[p.type];
          const cust = getCustomer(p.customerId);
          return (
            <div
              key={p.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl"
            >
              <div className={`relative h-32 bg-gradient-to-br ${cfg.color}`}>
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/30" />
                  <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/20" />
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-lg ring-4 ring-white/50">
                    <cfg.icon className="h-10 w-10 text-slate-700" />
                  </div>
                </div>
                <span className="absolute left-3 top-3 badge bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm">
                  {cfg.label}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{p.name}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{p.breed}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">主人</p>
                    <p className="text-sm font-semibold text-slate-700">{cust?.name || '-'}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <div className="flex items-center gap-1 text-[10px] font-medium uppercase text-slate-500">
                      <Weight className="h-3 w-3" /> 体重
                    </div>
                    <p className="mt-0.5 text-sm font-bold text-slate-800">{p.weight} kg</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <div className="flex items-center gap-1 text-[10px] font-medium uppercase text-slate-500">
                      🎂 年龄
                    </div>
                    <p className="mt-0.5 text-sm font-bold text-slate-800">{p.age} 岁</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 border-t border-slate-50 pt-4">
                  {p.vaccineDate && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Syringe className="h-3.5 w-3.5 text-emerald-500" />
                      疫苗：{p.vaccineDate}
                    </div>
                  )}
                  {p.healthNote && (
                    <div className="flex items-start gap-2 text-xs text-slate-600">
                      <Stethoscope className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-rose-500" />
                      <span className="line-clamp-2">{p.healthNote}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card py-16 text-center text-slate-400">
          暂无宠物档案
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-800">新增宠物档案</h2>
                <p className="mt-0.5 text-xs text-slate-500">填写宠物详细信息</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">宠物名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="请输入宠物名"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">宠物类型 *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as PetType })}
                    className="select-field"
                  >
                    <option value="dog">狗狗</option>
                    <option value="cat">猫咪</option>
                    <option value="other">其他</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">品种 *</label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  placeholder="如：金毛、英短、布偶等"
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">年龄 (岁)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">体重 (kg)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">所属客户 *</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="select-field"
                >
                  <option value="">请选择客户</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">疫苗接种日期</label>
                <input
                  type="date"
                  value={formData.vaccineDate}
                  onChange={(e) => setFormData({ ...formData, vaccineDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">健康备注</label>
                <textarea
                  value={formData.healthNote}
                  onChange={(e) => setFormData({ ...formData, healthNote: e.target.value })}
                  placeholder="如：过敏史、慢性疾病、用药情况等"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sticky bottom-0">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.name || !formData.breed || !formData.customerId}
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
