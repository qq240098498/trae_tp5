import { useEffect, useState } from 'react';
import {
  Star,
  Plus,
  TrendingUp,
  Award,
  ChevronDown,
  X,
  DollarSign,
  User,
  Trash2,
  Gift,
  AlertCircle,
  Info,
  Sparkles,
  ChevronRight,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';
import type { AdjustmentType, Staff, Customer, PerformanceAdjustment } from '../../shared/types';

const ADJUSTMENT_TYPE_LABEL: Record<AdjustmentType, string> = {
  bonus: '绩效奖励',
  penalty: '绩效扣款',
  five_star_bonus: '五星好评奖励',
  allowance_extra: '额外津贴',
  other: '其他调整',
};

const ADJUSTMENT_TYPE_COLOR: Record<string, string> = {
  bonus: 'bg-emerald-50 text-emerald-700',
  penalty: 'bg-rose-50 text-rose-700',
  five_star_bonus: 'bg-amber-50 text-amber-700',
  allowance_extra: 'bg-sky-50 text-sky-700',
  other: 'bg-slate-50 text-slate-700',
};

interface FiveStarStat {
  staffId: string;
  staffName: string;
  month: string;
  completedOrders: number;
  fiveStarCount: number;
  fiveStarReviews: Array<{
    id: string;
    content: string;
    customerId: string;
    tags: string[];
    rating: number;
    createdAt: string;
  }>;
  basePerformance: number;
  totalFiveStarBonus: number;
  adjustments: PerformanceAdjustment[];
  adjustmentBonus: number;
  adjustmentPenalty: number;
  totalBonus: number;
}

export default function Performance() {
  const staff = useAppStore((s) => s.staff);
  const customers = useAppStore((s) => s.customers);
  const fiveStarStats = useAppStore((s) => s.fiveStarStats as FiveStarStat[]);
  const setStaff = useAppStore((s) => s.setStaff);
  const setCustomers = useAppStore((s) => s.setCustomers);
  const setFiveStarStats = useAppStore((s) => s.setFiveStarStats);
  const setPerformanceAdjustments = useAppStore((s) => s.setPerformanceAdjustments);

  const [month, setMonth] = useState('2026-06');
  const [filterStaff, setFilterStaff] = useState('all');
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [expandStaff, setExpandStaff] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  useEffect(() => {
    api.staff.list().then((r) => setStaff(r as Staff[]));
    api.customers.list().then((r) => setCustomers(r as Customer[]));
    refreshStats();
  }, [setStaff, setCustomers]);

  useEffect(() => {
    refreshStats();
  }, [month]);

  const refreshStats = () => {
    const staffId = filterStaff === 'all' ? undefined : filterStaff;
    api.staff.performance.fiveStarStats(month, staffId).then((r) => {
      setFiveStarStats(r as FiveStarStat[]);
    });
    api.staff.performance.adjustments({ month, staffId }).then((r) => {
      setPerformanceAdjustments(r as any);
    });
  };

  useEffect(() => {
    refreshStats();
  }, [filterStaff]);

  const filteredStats = filterStaff === 'all'
    ? fiveStarStats
    : fiveStarStats.filter((f) => f.staffId === filterStaff);

  const totalOrders = filteredStats.reduce((s, f) => s + f.completedOrders, 0);
  const totalBasePerf = filteredStats.reduce((s, f) => s + f.basePerformance, 0);
  const totalFiveStars = filteredStats.reduce((s, f) => s + f.fiveStarCount, 0);
  const totalFiveStarBonus = filteredStats.reduce((s, f) => s + f.totalFiveStarBonus, 0);
  const totalAdjBonus = filteredStats.reduce((s, f) => s + f.adjustmentBonus, 0);
  const totalAdjPenalty = filteredStats.reduce((s, f) => s + f.adjustmentPenalty, 0);
  const totalAllBonus = filteredStats.reduce((s, f) => s + f.totalBonus, 0);

  const getCustomerName = (id: string) => customers.find((c) => c.id === id)?.name || '-';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">饲养员绩效管理</h1>
          <p className="mt-1 text-sm text-slate-500">
            基础绩效（默认¥300起）+ 五星好评奖励（每条¥50）+ 绩效调整，完整关联评价体系
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="input-field pr-9"
            />
          </div>
          <div className="relative">
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              className="select-field pr-9"
            >
              <option value="all">全部饲养员</option>
              {staff.filter((s) => s.status !== 'inactive').map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setAdjustOpen(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            绩效调整
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          {
            label: '完成订单',
            value: totalOrders + ' 单',
            icon: FileText,
            color: 'from-sky-500 to-blue-600',
          },
          {
            label: '五星好评总数',
            value: totalFiveStars + ' 个',
            icon: Star,
            color: 'from-amber-500 to-orange-500',
          },
          {
            label: '基础绩效合计',
            value: '¥' + totalBasePerf.toLocaleString(),
            icon: Award,
            color: 'from-indigo-500 to-purple-600',
          },
          {
            label: '五星奖励合计',
            value: '+¥' + totalFiveStarBonus.toLocaleString(),
            icon: Sparkles,
            color: 'from-amber-400 to-yellow-500',
          },
          {
            label: '额外奖励/扣款',
            value: (totalAdjBonus - totalAdjPenalty >= 0 ? '+' : '') + '¥' + (totalAdjBonus - totalAdjPenalty).toLocaleString(),
            icon: Gift,
            color: totalAdjBonus - totalAdjPenalty >= 0 ? 'from-emerald-500 to-teal-600' : 'from-rose-500 to-pink-600',
          },
          {
            label: '绩效净额',
            value: '¥' + totalAllBonus.toLocaleString(),
            icon: TrendingUp,
            color: 'from-brand-500 to-brand-700',
          },
        ].map((c) => (
          <div key={c.label} className={`stat-card bg-gradient-to-br ${c.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-white/80">{c.label}</p>
                <p className="mt-2 text-xl font-bold">{c.value}</p>
              </div>
              <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm ring-1 ring-white/30">
                <c.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {filteredStats.length === 0 ? (
          <div className="card p-12 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-3 text-slate-500">暂无绩效数据</p>
          </div>
        ) : (
          filteredStats.map((stat) => (
            <div key={stat.staffId} className="card overflow-hidden">
              <div
                className="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={() => setExpandStaff(expandStaff === stat.staffId ? null : stat.staffId)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
                    <Star className="h-6 w-6 fill-white text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-800">{stat.staffName}</h3>
                      <span className="badge bg-sky-50 text-sky-700">
                        <FileText className="h-3 w-3" />
                        本月 {stat.completedOrders} 单
                      </span>
                      <span className="badge bg-indigo-50 text-indigo-700">
                        <CheckCircle2 className="h-3 w-3" />
                        基础绩效 ¥{stat.basePerformance}
                      </span>
                      <span className="badge bg-amber-50 text-amber-700">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        本月 {stat.fiveStarCount} 个五星
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                      <span>五星奖励：<span className="font-semibold text-amber-600">+¥{stat.totalFiveStarBonus}</span></span>
                      <span className="text-slate-300">|</span>
                      <span>额外奖励：<span className="font-semibold text-emerald-600">+¥{stat.adjustmentBonus}</span></span>
                      <span className="text-slate-300">|</span>
                      <span>扣款：<span className="font-semibold text-rose-600">-¥{stat.adjustmentPenalty}</span></span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">本月绩效净额</p>
                    <p className="text-2xl font-bold text-brand-600">¥{stat.totalBonus.toLocaleString()}</p>
                  </div>
                  <ChevronRight
                    className={`h-5 w-5 text-slate-400 transition-transform ${
                      expandStaff === stat.staffId ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </div>

              {expandStaff === stat.staffId && (
                <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-5 space-y-6">
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          五星好评明细 ({stat.fiveStarCount}条)
                        </h4>
                        <span className="text-xs text-amber-600 font-semibold">每条奖励 ¥50</span>
                      </div>
                      {stat.fiveStarReviews.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                          <Info className="mx-auto h-8 w-8 text-slate-300" />
                          <p className="mt-2 text-sm text-slate-400">本月暂无五星好评</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                          {stat.fiveStarReviews.map((rev) => (
                            <div
                              key={rev.id}
                              className="rounded-xl bg-white border border-amber-100 p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                      <Star
                                        key={i}
                                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                                      />
                                    ))}
                                    <span className="text-xs text-slate-400 ml-2">{rev.createdAt}</span>
                                  </div>
                                  <p className="text-sm text-slate-700 leading-relaxed line-clamp-2">{rev.content}</p>
                                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {getCustomerName(rev.customerId)}
                                    </span>
                                  </div>
                                  {rev.tags.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {rev.tags.map((t) => (
                                        <span
                                          key={t}
                                          className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700"
                                        >
                                          #{t}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-shrink-0">
                                  <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600">
                                    +¥50
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4 text-brand-600" />
                          绩效调整记录 ({stat.adjustments.length}条)
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const s = staff.find((x) => x.id === stat.staffId);
                            if (s) {
                              setSelectedStaff(s);
                              setAdjustOpen(true);
                            }
                          }}
                          className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                        >
                          <Plus className="h-3.5 w-3.5 inline mr-0.5" />
                          新增调整
                        </button>
                      </div>
                      {stat.adjustments.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                          <DollarSign className="mx-auto h-8 w-8 text-slate-300" />
                          <p className="mt-2 text-sm text-slate-400">本月暂无手动调整记录</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                          {stat.adjustments.map((adj) => (
                            <div
                              key={adj.id}
                              className={`rounded-xl bg-white border p-4 hover:shadow-md transition-shadow ${
                                adj.amount >= 0
                                  ? 'border-emerald-100'
                                  : 'border-rose-100'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className={`badge ${ADJUSTMENT_TYPE_COLOR[adj.type]}`}>
                                      {ADJUSTMENT_TYPE_LABEL[adj.type]}
                                    </span>
                                    <span className="text-xs text-slate-400">{adj.createdAt}</span>
                                  </div>
                                  <p className="text-sm text-slate-700">{adj.reason}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span
                                    className={`text-base font-bold ${
                                      adj.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                    }`}
                                  >
                                    {adj.amount >= 0 ? '+' : ''}¥{adj.amount}
                                  </span>
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (confirm('确定要删除这条调整记录吗？')) {
                                        await api.staff.performance.deleteAdjustment(adj.id);
                                        refreshStats();
                                      }
                                    }}
                                    className="rounded-lg p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                    title="删除"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-r from-brand-50 to-amber-50 p-5 border border-brand-100">
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-7">
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">完成订单</p>
                        <p className="text-lg font-bold text-sky-600">{stat.completedOrders} 单</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">五星好评数</p>
                        <p className="text-lg font-bold text-amber-600">{stat.fiveStarCount} 个</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">基础绩效</p>
                        <p className="text-lg font-bold text-indigo-600">¥{stat.basePerformance}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">五星奖励</p>
                        <p className="text-lg font-bold text-amber-600">+¥{stat.totalFiveStarBonus}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">额外奖励</p>
                        <p className="text-lg font-bold text-emerald-600">+¥{stat.adjustmentBonus}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">扣款合计</p>
                        <p className="text-lg font-bold text-rose-600">-¥{stat.adjustmentPenalty}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">本月绩效净额</p>
                        <p className="text-2xl font-bold text-brand-700">¥{stat.totalBonus.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {adjustOpen && (
        <AdjustmentModal
          staff={staff}
          month={month}
          selectedStaffId={selectedStaff?.id}
          onClose={() => {
            setAdjustOpen(false);
            setSelectedStaff(null);
          }}
          onCreated={() => {
            setAdjustOpen(false);
            setSelectedStaff(null);
            refreshStats();
          }}
        />
      )}
    </div>
  );
}

function AdjustmentModal({
  staff,
  month,
  selectedStaffId,
  onClose,
  onCreated,
}: {
  staff: Staff[];
  month: string;
  selectedStaffId?: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [staffId, setStaffId] = useState(selectedStaffId || '');
  const [type, setType] = useState<AdjustmentType>('bonus');
  const [amount, setAmount] = useState<number>(100);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const presetReasons: Record<string, string[]> = {
    bonus: ['超额完成任务', '客户特别表扬', '临时加班', '工作表现优秀'],
    penalty: ['迟到早退', '工作失误', '客户投诉', '违反规定'],
    five_star_bonus: ['累计五星好评达标', '月度五星之星'],
    allowance_extra: ['交通补贴', '餐费补贴', '高温补贴', '节日津贴'],
    other: ['月度全勤奖', '特殊贡献', '其他奖励'],
  };

  const submit = async () => {
    if (!staffId || !amount || !reason.trim()) return;
    setLoading(true);
    try {
      const finalAmount = type === 'penalty' ? -Math.abs(amount) : Math.abs(amount);
      await api.staff.performance.createAdjustment({
        staffId,
        month,
        type,
        amount: finalAmount,
        reason: reason.trim(),
      });
      onCreated();
    } finally {
      setLoading(false);
    }
  };

  const sign = type === 'penalty' ? '-' : '+';
  const preset = presetReasons[type] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-slate-800">绩效调整</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <div className="space-y-5 p-6">
          <div className="rounded-xl bg-brand-50/50 p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
              <DollarSign className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">{month} 月份绩效调整</p>
              <p className="text-xs text-slate-500">调整将在下次工资核算时自动计入</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              选择饲养员 <span className="text-rose-500">*</span>
            </label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="select-field"
            >
              <option value="">请选择饲养员</option>
              {staff.filter((s) => s.status !== 'inactive').map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              调整类型 <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ADJUSTMENT_TYPE_LABEL).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setType(key as AdjustmentType)}
                  className={`rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                    type === key
                      ? key === 'penalty'
                        ? 'border-rose-400 bg-rose-50 text-rose-700'
                        : 'border-brand-400 bg-brand-50 text-brand-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              调整金额（元） <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold ${
                  type === 'penalty' ? 'text-rose-500' : 'text-emerald-500'
                }`}
              >
                {sign}¥
              </span>
              <input
                type="number"
                value={Math.abs(amount)}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="input-field pl-14 text-lg font-semibold"
                min={0}
                placeholder="请输入金额"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[50, 100, 200, 500].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                    Math.abs(amount) === v
                      ? type === 'penalty'
                        ? 'bg-rose-500 text-white'
                        : 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sign}{v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              调整原因 <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {preset.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    reason === r
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请填写调整的具体原因..."
              className="input-field min-h-[80px]"
            />
          </div>

          <div
            className={`rounded-xl p-4 ${
              type === 'penalty'
                ? 'border border-rose-200 bg-rose-50'
                : 'border border-emerald-200 bg-emerald-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">调整后金额</span>
              <span
                className={`text-2xl font-bold ${
                  type === 'penalty' ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {sign}¥{Math.abs(amount).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 border-t border-slate-100 px-6 py-4 sticky bottom-0 bg-white">
          <button
            onClick={submit}
            disabled={!staffId || !amount || !reason.trim() || loading}
            className="btn-primary flex-1 justify-center disabled:opacity-60"
          >
            {loading ? '提交中...' : '确认调整'}
          </button>
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
