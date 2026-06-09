import { useEffect, useState } from 'react';
import { Plus, Search, Syringe, Weight, Stethoscope, Cat, Dog, Bird } from 'lucide-react';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';
import type { Pet, Customer, PetType } from '../../../shared/types';

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

  useEffect(() => {
    api.pets.list().then((r) => setPets(r as Pet[]));
    api.customers.list().then((r) => setCustomers(r as Customer[]));
  }, [setPets, setCustomers]);

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
        <button className="btn-primary">
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
    </div>
  );
}
