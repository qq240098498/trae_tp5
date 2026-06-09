import { useEffect, useState } from 'react';
import { Edit2, Save, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';
import type { PricingRule, PetType, RoomType } from '../../shared/types';

const PET_LABEL: Record<PetType, string> = { dog: '犬类', cat: '猫类', other: '其他' };
const ROOM_LABEL: Record<RoomType, string> = { standard: '标准间', deluxe: '豪华间', suite: '套房' };

export default function BoardingPricing() {
  const rules = useAppStore((s) => s.pricingRules);
  const setRules = useAppStore((s) => s.setPricingRules);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<PricingRule | null>(null);

  useEffect(() => {
    api.boarding.pricing().then((r) => setRules(r as PricingRule[]));
  }, [setRules]);

  const startEdit = (r: PricingRule) => {
    setEditing(r.id);
    setDraft({ ...r });
  };

  const saveEdit = async () => {
    if (!draft) return;
    await api.boarding.updatePricing(draft.id, {
      basePricePerDay: draft.basePricePerDay,
      weekendSurcharge: draft.weekendSurcharge,
      description: draft.description,
      active: draft.active,
    });
    const r = (await api.boarding.pricing()) as PricingRule[];
    setRules(r);
    setEditing(null);
    setDraft(null);
  };

  const categories: { type: PetType; label: string; icon: string }[] = [
    { type: 'dog', label: '犬类寄养', icon: '🐕' },
    { type: 'cat', label: '猫类寄养', icon: '🐈' },
    { type: 'other', label: '其他宠物', icon: '🐾' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">寄养计费规则</h1>
        <p className="mt-1 text-sm text-slate-500">配置不同房型和宠物类型的寄养价格</p>
      </div>

      <div className="card bg-gradient-to-r from-accent-50 via-amber-50 to-brand-50 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white p-2 shadow-sm">
            <Sparkles className="h-5 w-5 text-accent-600" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-slate-800">计费说明</p>
            <p className="mt-1 text-slate-600">
              寄养费用按天计算，入住当天计1天；周末（周六、周日）会额外加收周末加价，可灵活调整各房型基础价格和周末附加费用。
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {categories.map((cat) => (
          <div key={cat.type} className="card overflow-hidden">
            <div className="bg-gradient-to-r from-brand-700 to-brand-800 px-6 py-5 text-white">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{cat.icon}</span>
                <h3 className="text-lg font-bold">{cat.label}</h3>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {rules
                .filter((r) => r.petType === cat.type)
                .map((rule) => {
                  const isEditing = editing === rule.id;
                  const d = isEditing && draft ? draft : rule;
                  return (
                    <div key={rule.id} className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="badge bg-brand-100 text-brand-800">
                              {ROOM_LABEL[d.roomType]}
                            </span>
                            {!d.active && (
                              <span className="badge bg-slate-100 text-slate-500">停用</span>
                            )}
                          </div>
                          <p className="mt-2 text-xs text-slate-500">{d.description}</p>
                        </div>
                        {!isEditing ? (
                          <button onClick={() => startEdit(rule)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600">
                            <Edit2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <button onClick={saveEdit} className="rounded-lg p-2 text-brand-600 hover:bg-brand-50">
                            <Save className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">基础日价</p>
                          {isEditing ? (
                            <input
                              type="number"
                              value={d.basePricePerDay}
                              onChange={(e) => setDraft({ ...d, basePricePerDay: +e.target.value })}
                              className="mt-1 w-full rounded-md border-0 bg-white p-1.5 text-base font-bold text-slate-800 shadow-sm outline-none ring-1 ring-brand-200 focus:ring-2 focus:ring-brand-400"
                            />
                          ) : (
                            <p className="mt-1 text-base font-bold text-slate-800">¥{d.basePricePerDay}</p>
                          )}
                        </div>
                        <div className="rounded-xl bg-amber-50 p-3">
                          <p className="text-[10px] uppercase tracking-wider text-amber-600">周末加价</p>
                          {isEditing ? (
                            <input
                              type="number"
                              value={d.weekendSurcharge}
                              onChange={(e) => setDraft({ ...d, weekendSurcharge: +e.target.value })}
                              className="mt-1 w-full rounded-md border-0 bg-white p-1.5 text-base font-bold text-slate-800 shadow-sm outline-none ring-1 ring-amber-200 focus:ring-2 focus:ring-amber-400"
                            />
                          ) : (
                            <p className="mt-1 text-base font-bold text-amber-700">¥{d.weekendSurcharge}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
