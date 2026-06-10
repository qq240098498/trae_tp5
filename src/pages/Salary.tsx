import { useEffect, useState } from 'react';
import {
  Calculator,
  Wallet,
  TrendingUp,
  FileText,
  CheckCircle2,
  Clock,
  ChevronDown,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  DollarSign,
  Info,
  Star,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';
import type { SalaryRecord, Staff, ReviewSummary } from '../../shared/types';

const STATUS_LABEL: Record<string, string> = { pending: '待发放', paid: '已发放' };
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
};

export default function Salary() {
  const staff = useAppStore((s) => s.staff);
  const records = useAppStore((s) => s.salaryRecords);
  const reviewSummaries = useAppStore((s) => s.reviewSummaries);
  const setStaff = useAppStore((s) => s.setStaff);
  const setRecords = useAppStore((s) => s.setSalaryRecords);
  const setReviewSummaries = useAppStore((s) => s.setReviewSummaries);
  const [month, setMonth] = useState('2026-06');
  const [calcLoading, setCalcLoading] = useState<string | null>(null);

  useEffect(() => {
    api.staff.list().then((r) => setStaff(r as Staff[]));
    api.staff.salaryRecords().then((r) => setRecords(r as SalaryRecord[]));
    api.reviews.summary().then((r) => setReviewSummaries(r as ReviewSummary[]));
  }, [setStaff, setRecords, setReviewSummaries]);

  const monthRecords = records.filter((r) => r.month === month);
  const totalBase = monthRecords.reduce((s, r) => s + r.baseSalary, 0);
  const totalPerf = monthRecords.reduce((s, r) => s + r.performance, 0);
  const totalFiveStarBonus = monthRecords.reduce((s, r) => s + ((r as any).fiveStarBonus || 0), 0);
  const totalAllow = monthRecords.reduce((s, r) => s + r.allowance, 0);
  const totalDed = monthRecords.reduce((s, r) => s + r.deduction, 0);
  const totalNet = monthRecords.reduce((s, r) => s + r.total, 0);
  const paidCount = monthRecords.filter((r) => r.status === 'paid').length;
  const totalPenalty = reviewSummaries.reduce((s, r) => s + r.totalPenalty, 0);
  const totalPendingNeg = reviewSummaries.reduce((s, r) => s + r.pendingNegativeCount, 0);
  const totalFiveStars = reviewSummaries.reduce((s, r) => s + (r.fiveStarCount || 0), 0);

  const chartData = monthRecords.map((r) => ({
    name: staff.find((s) => s.id === r.staffId)?.name || '未知',
    基本工资: r.baseSalary,
    基础绩效: r.performance,
    五星奖励: (r as any).fiveStarBonus || 0,
    津贴补贴: r.allowance,
    扣款: -r.deduction,
  }));

  const calcSalary = async (staffId: string) => {
    setCalcLoading(staffId);
    try {
      const rec = (await api.staff.calcSalary(staffId, month)) as SalaryRecord;
      const existing = monthRecords.find((r) => r.staffId === staffId);
      if (existing) {
        await api.staff.updateSalaryRecord(existing.id, {
          baseSalary: rec.baseSalary,
          performance: rec.performance,
          allowance: rec.allowance,
          deduction: rec.deduction,
          total: rec.total,
          completedOrders: rec.completedOrders,
        });
      } else {
        await api.staff.createSalaryRecord(rec);
      }
      const r = (await api.staff.salaryRecords()) as SalaryRecord[];
      setRecords(r);
    } finally {
      setCalcLoading(null);
    }
  };

  const markPaid = async (id: string) => {
    await api.staff.updateSalaryRecord(id, { status: 'paid' });
    const r = (await api.staff.salaryRecords()) as SalaryRecord[];
    setRecords(r);
  };

  const batchCalc = async () => {
    for (const s of staff.filter((x) => x.status !== 'inactive')) {
      await calcSalary(s.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">饲养员工资核算</h1>
          <p className="mt-1 text-sm text-slate-500">自动计算基本工资 + 绩效 + 津贴</p>
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
          <button onClick={batchCalc} className="btn-primary">
            <Calculator className="h-4 w-4" />
            一键核算
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-8">
        {[
          {
            label: '应发总金额',
            value: '¥' + totalNet.toLocaleString(),
            icon: Wallet,
            color: 'from-brand-500 to-brand-700',
          },
          {
            label: '基本工资',
            value: '¥' + totalBase.toLocaleString(),
            icon: FileText,
            color: 'from-sky-500 to-sky-700',
          },
          {
            label: '基础绩效',
            value: '¥' + totalPerf.toLocaleString(),
            icon: TrendingUp,
            color: 'from-accent-500 to-orange-500',
          },
          {
            label: '五星奖励',
            value: '¥' + totalFiveStarBonus.toLocaleString(),
            icon: Star,
            color: 'from-amber-400 to-yellow-500',
          },
          {
            label: '津贴补贴',
            value: '¥' + totalAllow.toLocaleString(),
            icon: Sparkles,
            color: 'from-emerald-500 to-teal-600',
          },
          {
            label: '扣款合计',
            value: '¥' + totalDed.toLocaleString(),
            icon: DollarSign,
            color: 'from-rose-500 to-pink-600',
          },
          {
            label: '差评扣款总额',
            value: '¥' + totalPenalty.toLocaleString(),
            icon: ThumbsDown,
            color: 'from-rose-600 to-red-700',
          },
          {
            label: '五星好评总数',
            value: totalFiveStars + '个',
            icon: Star,
            color: 'from-amber-500 to-orange-500',
          },
        ].map((c) => (
          <div key={c.label} className={`stat-card bg-gradient-to-br ${c.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-white/80">{c.label}</p>
                <p className="mt-2 text-2xl font-bold">{c.value}</p>
              </div>
              <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm ring-1 ring-white/30">
                <c.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Chart */}
        <div className="card p-6 xl:col-span-2">
          <h3 className="mb-4 text-base font-bold text-slate-800">工资构成对比</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="基本工资" stackId="a" fill="#0F766E" radius={[0, 0, 0, 0]} />
                <Bar dataKey="基础绩效" stackId="a" fill="#F59E0B" />
                <Bar dataKey="五星奖励" stackId="a" fill="#FBBF24" />
                <Bar dataKey="津贴补贴" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="扣款" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Records */}
        <div className="card overflow-hidden xl:col-span-3">
          <div className="border-b border-slate-50 px-6 py-4">
            <h3 className="text-base font-bold text-slate-800">工资明细</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">饲养员</th>
                  <th className="table-th">完成订单</th>
                  <th className="table-th text-center">五星好评</th>
                  <th className="table-th text-center">好评/差评</th>
                  <th className="table-th text-right">基本工资</th>
                  <th className="table-th text-right">基础绩效</th>
                  <th className="table-th text-right">五星奖励</th>
                  <th className="table-th text-right">津贴</th>
                  <th className="table-th text-right">扣款(差评)</th>
                  <th className="table-th text-right">实发</th>
                  <th className="table-th">备注</th>
                  <th className="table-th">状态</th>
                  <th className="table-th text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {staff.filter((s) => s.status !== 'inactive').map((s) => {
                  const rec = monthRecords.find((r) => r.staffId === s.id);
                  const rs = reviewSummaries.find((x) => x.staffId === s.id);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
                            {s.name[0]}
                          </div>
                          <span className="font-semibold text-slate-800">{s.name}</span>
                        </div>
                      </td>
                      <td className="table-td">
                        {rec ? (
                          <span className="font-semibold text-slate-700">{rec.completedOrders}单</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="table-td text-center">
                        {rs && rs.fiveStarCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-sm font-semibold text-amber-700">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {rs.fiveStarCount}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="table-td">
                        {rs && rs.totalReviews > 0 ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-700">
                              <ThumbsUp className="h-3 w-3" />
                              {rs.positiveCount}
                            </span>
                            <span className="text-slate-300">/</span>
                            <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${rs.negativeCount > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                              <ThumbsDown className="h-3 w-3" />
                              {rs.negativeCount}
                            </span>
                            {rs.pendingNegativeCount > 0 && (
                              <span className="inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                {rs.pendingNegativeCount}待处理
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">暂无评价</span>
                        )}
                      </td>
                      <td className="table-td text-right font-medium text-slate-700">
                        {rec ? `¥${rec.baseSalary.toLocaleString()}` : '-'}
                      </td>
                      <td className="table-td text-right font-medium text-accent-600">
                        {rec ? `+¥${rec.performance}` : '-'}
                      </td>
                      <td className="table-td text-right font-medium text-amber-600">
                        {rec && (rec as any).fiveStarBonus ? `+¥${(rec as any).fiveStarBonus}` : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="table-td text-right font-medium text-emerald-600">
                        {rec ? `+¥${rec.allowance}` : '-'}
                      </td>
                      <td className="table-td text-right">
                        {rec && rec.deduction ? (
                          <div>
                            <span className="font-medium text-rose-600">-¥{rec.deduction}</span>
                            {rs && rs.totalPenalty > 0 && (
                              <div className="text-[10px] text-rose-500 mt-0.5">
                                (差评扣款¥{rs.totalPenalty})
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="table-td text-right">
                        {rec ? (
                          <span className="text-lg font-bold text-brand-700">
                            ¥{rec.total.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="table-td">
                        {rec?.remark ? (
                          <div className="group relative">
                            <Info className="h-4 w-4 text-slate-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-48 rounded-lg bg-slate-800 px-3 py-2 text-xs text-white shadow-lg">
                              {rec.remark}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="table-td">
                        {rec ? (
                          <span className={`badge ${STATUS_COLOR[rec.status]}`}>
                            {rec.status === 'paid' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            {STATUS_LABEL[rec.status]}
                          </span>
                        ) : (
                          <span className="badge bg-slate-100 text-slate-500">未核算</span>
                        )}
                      </td>
                      <td className="table-td">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => calcSalary(s.id)}
                            disabled={calcLoading === s.id}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 disabled:opacity-60"
                          >
                            {calcLoading === s.id ? '核算中...' : rec ? '重新核算' : '核算'}
                          </button>
                          {rec && rec.status === 'pending' && (
                            <button
                              onClick={() => markPaid(rec.id)}
                              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                            >
                              标记发放
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
      </div>
    </div>
  );
}
