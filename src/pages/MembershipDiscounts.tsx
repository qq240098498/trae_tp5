import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Check, X, Award, Percent, TrendingUp, Users, Sparkles, Save } from 'lucide-react';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';
import type { MemberDiscount, MemberLevel, Customer } from '../../shared/types';

const LEVEL_STYLES: Record<MemberLevel, { gradient: string; badge: string; icon: string }> = {
  normal: {
    gradient: 'from-slate-400 to-slate-600',
    badge: 'bg-slate-100 text-slate-700 ring-slate-200',
    icon: '👤',
  },
  silver: {
    gradient: 'from-slate-300 via-slate-400 to-slate-500',
    badge: 'bg-slate-50 text-slate-700 ring-slate-300',
    icon: '🥈',
  },
  gold: {
    gradient: 'from-amber-400 via-orange-400 to-amber-600',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    icon: '🥇',
  },
  diamond: {
    gradient: 'from-sky-400 via-cyan-400 to-teal-500',
    badge: 'bg-sky-50 text-sky-700 ring-sky-200',
    icon: '💎',
  },
};

const EMPTY_FORM: Omit<MemberDiscount, 'id' | 'createdAt'> = {
  level: 'normal',
  levelName: '',
  discountRate: 1,
  minSpent: 0,
  description: '',
  active: true,
};

export default function MembershipDiscounts() {
  const memberDiscounts = useAppStore((s) => s.memberDiscounts);
  const setMemberDiscounts = useAppStore((s) => s.setMemberDiscounts);
  const customers = useAppStore((s) => s.customers);
  const setCustomers = useAppStore((s) => s.setCustomers);

  const [keyword, setKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.memberDiscounts.list().then((r) => setMemberDiscounts(r as MemberDiscount[]));
    api.customers.list().then((r) => setCustomers(r as Customer[]));
  }, [setMemberDiscounts, setCustomers]);

  const openCreate = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item: MemberDiscount) => {
    setEditingId(item.id);
    setFormData({
      level: item.level,
      levelName: item.levelName,
      discountRate: item.discountRate,
      minSpent: item.minSpent,
      description: item.description || '',
      active: item.active,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.levelName) return;
    setLoading(true);
    try {
      if (editingId) {
        await api.memberDiscounts.update(editingId, formData);
      } else {
        await api.memberDiscounts.create(formData);
      }
      const r = (await api.memberDiscounts.list()) as MemberDiscount[];
      setMemberDiscounts(r);
      setShowModal(false);
    } catch (err) {
      alert('保存失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此折扣规则吗？')) return;
    try {
      await api.memberDiscounts.remove(id);
      const r = (await api.memberDiscounts.list()) as MemberDiscount[];
      setMemberDiscounts(r);
    } catch (err) {
      alert('删除失败：' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const toggleActive = async (item: MemberDiscount) => {
    try {
      await api.memberDiscounts.update(item.id, { active: !item.active });
      const r = (await api.memberDiscounts.list()) as MemberDiscount[];
      setMemberDiscounts(r);
    } catch (err) {
      alert('操作失败：' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const filtered = memberDiscounts.filter((d) => {
    if (!keyword) return true;
    return d.levelName.includes(keyword) || d.description?.includes(keyword);
  });

  const customerCountByLevel = (level: MemberLevel) =>
    customers.filter((c) => c.memberLevel === level).length;

  const totalDiscounts = memberDiscounts.filter((d) => d.active).length;
  const avgDiscount = memberDiscounts.length
    ? (memberDiscounts.reduce((s, d) => s + d.discountRate, 0) / memberDiscounts.length * 100).toFixed(0)
    : '0';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">会员等级与折扣管理</h1>
          <p className="mt-1 text-sm text-slate-500">配置会员等级规则，管理不同等级的折扣比例</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          新增等级规则
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="stat-card bg-gradient-to-br from-brand-500 to-brand-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/80">等级总数</p>
              <p className="mt-2 text-3xl font-bold">{memberDiscounts.length}</p>
            </div>
            <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm ring-1 ring-white/30">
              <Award className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card bg-gradient-to-br from-emerald-500 to-teal-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/80">已启用规则</p>
              <p className="mt-2 text-3xl font-bold">{totalDiscounts}</p>
            </div>
            <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm ring-1 ring-white/30">
              <Check className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card bg-gradient-to-br from-accent-500 to-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/80">平均折扣率</p>
              <p className="mt-2 text-3xl font-bold">{avgDiscount}%</p>
            </div>
            <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm ring-1 ring-white/30">
              <Percent className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card bg-gradient-to-br from-sky-500 to-cyan-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/80">客户总数</p>
              <p className="mt-2 text-3xl font-bold">{customers.length}</p>
            </div>
            <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm ring-1 ring-white/30">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="card overflow-hidden">
        <div className="border-b border-slate-50 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索等级名称、描述..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-2">
          {filtered.map((d) => {
            const style = LEVEL_STYLES[d.level];
            const memberCount = customerCountByLevel(d.level);
            const discountPct = Math.round((1 - d.discountRate) * 100);
            return (
              <div
                key={d.id}
                className={`group relative overflow-hidden rounded-2xl border border-slate-100 bg-white transition-all hover:shadow-lg ${
                  !d.active ? 'opacity-60' : ''
                }`}
              >
                {/* Header gradient */}
                <div className={`bg-gradient-to-r ${style.gradient} px-5 py-4 text-white`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-2xl ring-1 ring-white/30">
                        {style.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{d.levelName}</h3>
                        <p className="text-xs text-white/80 uppercase tracking-wider">{d.level}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleActive(d)}
                        className={`rounded-lg p-1.5 transition hover:bg-white/20 ${
                          d.active ? 'text-white' : 'text-white/60'
                        }`}
                        title={d.active ? '点击禁用' : '点击启用'}
                      >
                        {d.active ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => openEdit(d)}
                        className="rounded-lg p-1.5 text-white transition hover:bg-white/20"
                        title="编辑"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="rounded-lg p-1.5 text-white transition hover:bg-rose-500/40"
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="space-y-4 p-5">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">折扣</p>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-brand-700">
                          {Math.round(d.discountRate * 100)}
                        </span>
                        <span className="text-sm text-slate-500">%</span>
                      </div>
                      {discountPct > 0 && (
                        <p className="mt-0.5 text-[10px] text-emerald-600 font-medium">
                          省{discountPct}%
                        </p>
                      )}
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">门槛</p>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-lg font-bold text-slate-800">¥</span>
                        <span className="text-2xl font-bold text-slate-800">
                          {d.minSpent.toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-slate-500">累计消费</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">会员数</p>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-800">{memberCount}</span>
                        <span className="text-sm text-slate-500">人</span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        {customers.length ? Math.round((memberCount / customers.length) * 100) : 0}%占比
                      </p>
                    </div>
                  </div>

                  {d.description && (
                    <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
                      <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                      <p className="text-xs text-slate-600 leading-relaxed">{d.description}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span
                      className={`badge ring-1 ${d.active ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-500 ring-slate-200'}`}
                    >
                      {d.active ? '已启用' : '已禁用'}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <TrendingUp className="h-3.5 w-3.5" />
                      创建于 {d.createdAt}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400">
              <Award className="mx-auto mb-3 h-12 w-12 opacity-40" />
              <p>暂无折扣规则数据</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingId ? '编辑折扣规则' : '新增等级规则'}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">配置会员等级及其折扣比例</p>
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
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">会员等级 *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as MemberLevel })}
                    className="select-field"
                    disabled={!!editingId}
                  >
                    <option value="normal">普通会员 (normal)</option>
                    <option value="silver">银卡会员 (silver)</option>
                    <option value="gold">金卡会员 (gold)</option>
                    <option value="diamond">钻石会员 (diamond)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">等级名称 *</label>
                  <input
                    type="text"
                    value={formData.levelName}
                    onChange={(e) => setFormData({ ...formData, levelName: e.target.value })}
                    placeholder="如：金卡会员"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    折扣率（%）*
                    <span className="ml-1 text-xs font-normal text-slate-400">88表示88折</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      step="1"
                      value={Math.round(formData.discountRate * 100)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountRate: Math.max(0.01, Math.min(1, Number(e.target.value) / 100)),
                        })
                      }
                      className="input-field pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                      %
                    </span>
                  </div>
                  {formData.discountRate < 1 && (
                    <p className="mt-1 text-xs text-emerald-600">
                      相当于优惠 {(100 - Math.round(formData.discountRate * 100))}%
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    升级门槛（元）*
                    <span className="ml-1 text-xs font-normal text-slate-400">累计消费</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                      ¥
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={formData.minSpent}
                      onChange={(e) =>
                        setFormData({ ...formData, minSpent: Math.max(0, Number(e.target.value)) })
                      }
                      className="input-field pl-8"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">等级说明</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="描述该等级的权益、福利等..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-300 hover:bg-brand-50/40">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">启用该规则</p>
                  <p className="text-xs text-slate-500">关闭后该等级折扣将不再生效</p>
                </div>
              </label>
            </div>

            <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.levelName}
                className="btn-primary flex-1 justify-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    确认保存
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
