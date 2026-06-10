import { useEffect, useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Star,
  AlertTriangle,
  Phone,
  CheckCircle2,
  X,
  Search,
  Plus,
  Filter,
  TrendingUp,
  DollarSign,
  MessageSquare,
  ChevronDown,
  AlertCircle,
  Clock,
  User,
  PawPrint,
  Undo2,
  RotateCcw,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';
import type { Review, Staff, Pet, Customer, FeedingOrder, BoardingOrder } from '../../shared/types';

const TYPE_LABEL: Record<string, string> = { positive: '好评', negative: '差评' };
const TYPE_COLOR: Record<string, string> = {
  positive: 'bg-emerald-100 text-emerald-700',
  negative: 'bg-rose-100 text-rose-700',
};
const STATUS_LABEL: Record<string, string> = {
  pending: '待处理',
  resolved: '已解决',
  escalated: '已升级',
};
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  escalated: 'bg-rose-100 text-rose-700',
};
const PENALTY_MAP: Record<number, number> = { 1: 200, 2: 150, 3: 100, 4: 0, 5: 0 };
const POSITIVE_TAGS = ['准时', '细心', '专业', '视频反馈好', '照顾周到', '环境干净', '服务态度好', '耐心'];
const NEGATIVE_TAGS = ['迟到', '服务不周到', '宠物情绪差', '清理不干净', '猫粮不足', '细节待改进', '态度不好', '遗漏服务'];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const reviews = useAppStore((s) => s.reviews);
  const setReviews = useAppStore((s) => s.setReviews);
  const reviewSummaries = useAppStore((s) => s.reviewSummaries);
  const setReviewSummaries = useAppStore((s) => s.setReviewSummaries);
  const staff = useAppStore((s) => s.staff);
  const pets = useAppStore((s) => s.pets);
  const customers = useAppStore((s) => s.customers);
  const setStaff = useAppStore((s) => s.setStaff);
  const setPets = useAppStore((s) => s.setPets);
  const setCustomers = useAppStore((s) => s.setCustomers);
  const feedingOrders = useAppStore((s) => s.feedingOrders);
  const boardingOrders = useAppStore((s) => s.boardingOrders);
  const setFeedingOrders = useAppStore((s) => s.setFeedingOrders);
  const setBoardingOrders = useAppStore((s) => s.setBoardingOrders);

  const [filterStaff, setFilterStaff] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<Review | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<Review | null>(null);

  useEffect(() => {
    api.reviews.list().then((r) => setReviews(r as Review[]));
    api.reviews.summary().then((r) => setReviewSummaries(r as any));
    api.staff.list().then((r) => setStaff(r as Staff[]));
    api.pets.list().then((r) => setPets(r as Pet[]));
    api.customers.list().then((r) => setCustomers(r as Customer[]));
    api.feeding.orders().then((r) => setFeedingOrders(r as FeedingOrder[]));
    api.boarding.orders().then((r) => setBoardingOrders(r as BoardingOrder[]));
  }, [setReviews, setReviewSummaries, setStaff, setPets, setCustomers, setFeedingOrders, setBoardingOrders]);

  const refresh = () => {
    api.reviews.list().then((r) => setReviews(r as Review[]));
    api.reviews.summary().then((r) => setReviewSummaries(r as any));
  };

  const filtered = reviews.filter((r) => {
    if (filterStaff !== 'all' && r.staffId !== filterStaff) return false;
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (keyword) {
      const cust = customers.find((c) => c.id === r.customerId);
      const stf = staff.find((s) => s.id === r.staffId);
      const k = keyword.toLowerCase();
      if (
        !r.content.toLowerCase().includes(k) &&
        !cust?.name.toLowerCase().includes(k) &&
        !stf?.name.toLowerCase().includes(k)
      )
        return false;
    }
    return true;
  });

  const totalReviews = reviews.length;
  const positiveCount = reviews.filter((r) => r.type === 'positive').length;
  const negativeCount = reviews.filter((r) => r.type === 'negative').length;
  const pendingNeg = reviews.filter((r) => r.type === 'negative' && r.status === 'pending').length;
  const avgRating =
    totalReviews > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / totalReviews) * 10) / 10
      : 0;
  const totalPenalty = reviews
    .filter((r) => r.type === 'negative')
    .reduce((s, r) => s + (r.penaltyAmount || 0), 0);

  const recordContact = async (id: string) => {
    await api.reviews.recordContact(id);
    refresh();
    if (selected && selected.id === id) {
      const updated = await api.reviews.get(id);
      setSelected(updated as Review);
    }
  };

  const updateStatus = async (id: string, status: Review['status'], note?: string) => {
    const data: Partial<Review> = { status };
    if (note) data.resolutionNote = note;
    await api.reviews.update(id, data);
    refresh();
    setSelected(null);
  };

  const revokeReview = async (review: Review, reason: string) => {
    await api.reviews.update(review.id, {
      type: 'positive',
      rating: Math.max(review.rating, 4),
      status: 'resolved',
      penaltyAmount: 0,
      tags: [],
      resolutionNote: `【差评已撤销】撤销原因：${reason}。原差评内容：${review.content}`,
    });
    refresh();
    setRevokeTarget(null);
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">饲养员评价管理</h1>
          <p className="mt-1 text-sm text-slate-500">管理客户对饲养员的好评差评，处理投诉并关联绩效</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          新增评价
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          {
            label: '总评价数',
            value: totalReviews,
            icon: MessageSquare,
            color: 'from-brand-500 to-brand-700',
          },
          {
            label: '好评数',
            value: positiveCount,
            icon: ThumbsUp,
            color: 'from-emerald-500 to-teal-600',
          },
          {
            label: '差评数',
            value: negativeCount,
            icon: ThumbsDown,
            color: 'from-rose-500 to-pink-600',
          },
          {
            label: '待处理差评',
            value: pendingNeg,
            icon: AlertTriangle,
            color: 'from-amber-500 to-orange-500',
          },
          {
            label: '平均评分',
            value: avgRating + '★',
            icon: Star,
            color: 'from-sky-500 to-indigo-600',
          },
          {
            label: '差评扣款合计',
            value: '¥' + totalPenalty,
            icon: DollarSign,
            color: 'from-purple-500 to-fuchsia-600',
          },
        ].map((c) => (
          <div key={c.label} className={`stat-card bg-gradient-to-br ${c.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-white/80">{c.label}</p>
                <p className="mt-2 text-xl font-bold">{c.value}</p>
              </div>
              <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm ring-1 ring-white/30">
                <c.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Staff Summary Table */}
      <div className="card overflow-hidden">
        <div className="border-b border-slate-50 px-6 py-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-600" />
            饲养员评价汇总
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">饲养员</th>
                <th className="table-th text-center">总评价</th>
                <th className="table-th text-center">好评</th>
                <th className="table-th text-center">差评</th>
                <th className="table-th text-center">待处理</th>
                <th className="table-th text-center">平均分</th>
                <th className="table-th text-right">扣款合计</th>
              </tr>
            </thead>
            <tbody>
              {reviewSummaries.map((sum) => {
                const s = staff.find((x) => x.id === sum.staffId);
                return (
                  <tr key={sum.staffId} className="hover:bg-slate-50/50">
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
                          {s?.name?.[0] || '?'}
                        </div>
                        <span className="font-semibold text-slate-800">{s?.name || '未知'}</span>
                      </div>
                    </td>
                    <td className="table-td text-center">
                      <span className="font-semibold text-slate-700">{sum.totalReviews}</span>
                    </td>
                    <td className="table-td text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm font-semibold text-emerald-700">
                        <ThumbsUp className="h-3 w-3" />
                        {sum.positiveCount}
                      </span>
                    </td>
                    <td className="table-td text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-sm font-semibold text-rose-700">
                        <ThumbsDown className="h-3 w-3" />
                        {sum.negativeCount}
                      </span>
                    </td>
                    <td className="table-td text-center">
                      {sum.pendingNegativeCount > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-sm font-semibold text-amber-700">
                          <AlertCircle className="h-3 w-3" />
                          {sum.pendingNegativeCount}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="table-td text-center">
                      <div className="inline-flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-slate-700">{sum.avgRating || '-'}</span>
                      </div>
                    </td>
                    <td className="table-td text-right">
                      {sum.totalPenalty > 0 ? (
                        <span className="font-bold text-rose-600">-¥{sum.totalPenalty}</span>
                      ) : (
                        <span className="text-slate-400 text-sm">¥0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索评价内容、饲养员、客户名..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={filterStaff}
                onChange={(e) => setFilterStaff(e.target.value)}
                className="select-field pr-9"
              >
                <option value="all">全部饲养员</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="select-field pr-9"
              >
                <option value="all">全部评价类型</option>
                <option value="positive">好评</option>
                <option value="negative">差评</option>
              </select>
            </div>
            <div className="relative">
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="select-field pr-9"
              >
                <option value="all">全部状态</option>
                <option value="pending">待处理</option>
                <option value="resolved">已解决</option>
                <option value="escalated">已升级</option>
              </select>
            </div>
            {(filterStaff !== 'all' || filterType !== 'all' || filterStatus !== 'all' || keyword) && (
              <button
                onClick={() => {
                  setFilterStaff('all');
                  setFilterType('all');
                  setFilterStatus('all');
                  setKeyword('');
                }}
                className="btn-secondary text-xs"
              >
                清除筛选
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <Filter className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-3 text-slate-500">暂无符合条件的评价</p>
          </div>
        ) : (
          filtered.map((r) => {
            const s = staff.find((x) => x.id === r.staffId);
            const c = customers.find((x) => x.id === r.customerId);
            const p = pets.find((x) => x.id === r.petId);
            return (
              <div key={r.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`badge ${TYPE_COLOR[r.type]}`}>
                        {r.type === 'positive' ? (
                          <ThumbsUp className="h-3 w-3" />
                        ) : (
                          <ThumbsDown className="h-3 w-3" />
                        )}
                        {TYPE_LABEL[r.type]}
                      </span>
                      <span className={`badge ${STATUS_COLOR[r.status]}`}>
                        {r.status === 'pending' ? (
                          <Clock className="h-3 w-3" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {STATUS_LABEL[r.status]}
                      </span>
                      <Stars rating={r.rating} />
                      {r.penaltyAmount && r.penaltyAmount > 0 && (
                        <span className="badge bg-rose-50 text-rose-700">
                          <DollarSign className="h-3 w-3" />
                          扣款 ¥{r.penaltyAmount}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 leading-relaxed">{r.content}</p>
                    {r.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {r.tags.map((t) => (
                          <span
                            key={t}
                            className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
                              r.type === 'positive'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        饲养员：<span className="font-medium text-slate-700">{s?.name || '-'}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        客户：<span className="font-medium text-slate-700">{c?.name || '-'}</span>
                        {c?.phone && <span className="text-slate-400">({c.phone})</span>}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <PawPrint className="h-3.5 w-3.5" />
                        宠物：<span className="font-medium text-slate-700">{p?.name || '-'}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {r.createdAt}
                      </span>
                      {r.contactAttempts !== undefined && r.contactAttempts > 0 && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          已联系{r.contactAttempts}次
                          {r.lastContactAt && `（${r.lastContactAt}）`}
                        </span>
                      )}
                    </div>
                    {r.type === 'negative' && r.followUpDate && (
                      <p className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        建议跟进日期：{r.followUpDate}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 lg:flex-col lg:items-stretch">
                    <button
                      onClick={() => setSelected(r)}
                      className="btn-secondary text-xs"
                    >
                      查看详情
                    </button>
                    {r.type === 'negative' && (
                      <button
                        onClick={() => setRevokeTarget(r)}
                        className="rounded-lg bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                        撤销差评
                      </button>
                    )}
                    {r.type === 'negative' && r.status === 'pending' && (
                      <>
                        <button
                          onClick={() => recordContact(r.id)}
                          className="btn-primary text-xs"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          记录联系客户
                        </button>
                        <button
                          onClick={() => updateStatus(r.id, 'resolved')}
                          className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          标记已解决
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selected && (
        <ReviewDetailModal
          review={selected}
          staff={staff}
          customers={customers}
          pets={pets}
          onClose={() => setSelected(null)}
          onContact={() => recordContact(selected.id)}
          onUpdateStatus={(status, note) => updateStatus(selected.id, status, note)}
          onRevoke={() => { setRevokeTarget(selected); }}
        />
      )}

      {createOpen && (
        <CreateReviewModal
          staff={staff}
          customers={customers}
          pets={pets}
          feedingOrders={feedingOrders}
          boardingOrders={boardingOrders}
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false);
            refresh();
          }}
          penaltyMap={PENALTY_MAP}
          positiveTags={POSITIVE_TAGS}
          negativeTags={NEGATIVE_TAGS}
        />
      )}

      {revokeTarget && (
        <RevokeConfirmDialog
          review={revokeTarget}
          onClose={() => setRevokeTarget(null)}
          onConfirm={(reason) => revokeReview(revokeTarget, reason)}
        />
      )}
    </div>
  );
}

function ReviewDetailModal({
  review,
  staff,
  customers,
  pets,
  onClose,
  onContact,
  onUpdateStatus,
  onRevoke,
}: {
  review: Review;
  staff: Staff[];
  customers: Customer[];
  pets: Pet[];
  onClose: () => void;
  onContact: () => void;
  onUpdateStatus: (status: Review['status'], note?: string) => void;
  onRevoke: () => void;
}) {
  const s = staff.find((x) => x.id === review.staffId);
  const c = customers.find((x) => x.id === review.customerId);
  const p = pets.find((x) => x.id === review.petId);
  const [resolutionNote, setResolutionNote] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-slate-800">评价详情</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <div className="space-y-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ${TYPE_COLOR[review.type]}`}>
              {review.type === 'positive' ? <ThumbsUp className="h-3 w-3" /> : <ThumbsDown className="h-3 w-3" />}
              {TYPE_LABEL[review.type]}
            </span>
            <span className={`badge ${STATUS_COLOR[review.status]}`}>{STATUS_LABEL[review.status]}</span>
            <Stars rating={review.rating} />
            {review.penaltyAmount && review.penaltyAmount > 0 && (
              <span className="badge bg-rose-50 text-rose-700">绩效扣款 ¥{review.penaltyAmount}</span>
            )}
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500 mb-2">评价内容</p>
            <p className="text-slate-700 leading-relaxed">{review.content}</p>
          </div>

          {review.tags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">标签</p>
              <div className="flex flex-wrap gap-1.5">
                {review.tags.map((t) => (
                  <span
                    key={t}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                      review.type === 'positive' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-brand-50/50 p-4">
              <p className="text-xs font-medium text-slate-500 mb-1.5">饲养员</p>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {s?.name?.[0] || '?'}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{s?.name || '-'}</p>
                  {s?.phone && <p className="text-xs text-slate-500">{s.phone}</p>}
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-sky-50 p-4">
              <p className="text-xs font-medium text-slate-500 mb-1.5">客户信息</p>
              <p className="font-semibold text-slate-800">{c?.name || '-'}</p>
              {c?.phone && <p className="text-xs text-slate-500">📞 {c.phone}</p>}
              {c?.address && <p className="text-xs text-slate-500 mt-1">📍 {c.address}</p>}
            </div>
            <div className="rounded-xl bg-accent-50 p-4">
              <p className="text-xs font-medium text-slate-500 mb-1.5">宠物信息</p>
              <p className="font-semibold text-slate-800">{p?.name || '-'}</p>
              {p?.breed && <p className="text-xs text-slate-500">{p.breed}</p>}
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500 mb-1.5">联系跟进</p>
              <p className="text-sm text-slate-700">
                联系次数：<span className="font-semibold">{review.contactAttempts || 0} 次</span>
              </p>
              {review.lastContactAt && (
                <p className="text-xs text-slate-500 mt-1">上次联系：{review.lastContactAt}</p>
              )}
              {review.followUpDate && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  建议跟进：{review.followUpDate}
                </p>
              )}
            </div>
          </div>

          {review.resolutionNote && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-medium text-emerald-700 mb-1.5">处理说明</p>
              <p className="text-sm text-emerald-800">{review.resolutionNote}</p>
            </div>
          )}

          {review.type === 'negative' && review.status === 'pending' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                差评处理：请饲养员主动联系客户
              </p>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">处理说明</label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="填写联系客户后的处理结果..."
                  className="input-field min-h-[80px]"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={onContact} className="btn-primary text-xs">
                  <Phone className="h-3.5 w-3.5" />
                  记录联系客户
                </button>
                <button
                  onClick={() => onUpdateStatus('resolved', resolutionNote)}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  确认解决
                </button>
                <button
                  onClick={() => onUpdateStatus('escalated', resolutionNote)}
                  className="rounded-lg bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  升级处理
                </button>
              </div>
            </div>
          )}

          {review.type === 'negative' && (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-sky-800 flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4" />
                撤销差评：确认该评价为误判或客户已撤回投诉
              </p>
              <p className="text-xs text-sky-700">
                撤销后将转为好评，清除 {review.penaltyAmount ? `¥${review.penaltyAmount}` : ''} 绩效扣款，并更新工资核算。
              </p>
              <button
                onClick={onRevoke}
                className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-600"
              >
                <Undo2 className="h-3.5 w-3.5" />
                撤销该差评
              </button>
            </div>
          )}
        </div>
        <div className="border-t border-slate-100 px-6 py-4 sticky bottom-0 bg-white">
          <button onClick={onClose} className="btn-secondary w-full justify-center">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateReviewModal({
  staff,
  customers,
  pets,
  feedingOrders,
  boardingOrders,
  onClose,
  onCreated,
  penaltyMap,
  positiveTags,
  negativeTags,
}: {
  staff: Staff[];
  customers: Customer[];
  pets: Pet[];
  feedingOrders: FeedingOrder[];
  boardingOrders: BoardingOrder[];
  onClose: () => void;
  onCreated: () => void;
  penaltyMap: Record<number, number>;
  positiveTags: string[];
  negativeTags: string[];
}) {
  const [orderType, setOrderType] = useState<'feeding' | 'boarding'>('feeding');
  const [orderId, setOrderId] = useState('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [penalty, setPenalty] = useState(0);
  const [followUpDate, setFollowUpDate] = useState('');

  const availableOrders = (orderType === 'feeding' ? feedingOrders : boardingOrders).filter(
    (o) => (o as any).status === 'completed' || (o as any).status === 'checked_out'
  );
  const selectedOrder = availableOrders.find((o) => o.id === orderId);
  const type: 'positive' | 'negative' = rating >= 4 ? 'positive' : 'negative';
  const availTags = type === 'positive' ? positiveTags : negativeTags;

  useEffect(() => {
    if (type === 'negative') {
      setPenalty(penaltyMap[rating] || 0);
    } else {
      setPenalty(0);
    }
  }, [rating, type, penaltyMap]);

  useEffect(() => {
    if (selectedOrder) {
      setSelectedTags([]);
    }
  }, [orderId]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const submit = async () => {
    if (!selectedOrder || !content.trim()) return;
    const orderStaffId = orderType === 'feeding'
      ? (selectedOrder as FeedingOrder).staffId
      : (selectedOrder as BoardingOrder).assignedStaffId;
    if (!orderStaffId) {
      alert('该订单未分配饲养员，无法创建评价');
      return;
    }
    await api.reviews.create({
      orderId: selectedOrder.id,
      orderType,
      staffId: orderStaffId,
      customerId: selectedOrder.customerId,
      petId: selectedOrder.petId,
      type,
      rating,
      content: content.trim(),
      tags: selectedTags,
      status: type === 'negative' ? 'pending' : 'resolved',
      penaltyAmount: penalty > 0 ? penalty : undefined,
      followUpDate: type === 'negative' && followUpDate ? followUpDate : undefined,
      contactAttempts: 0,
    });
    onCreated();
  };

  const selectedCustomer = customers.find((c) => c.id === selectedOrder?.customerId);
  const selectedPet = pets.find((p) => p.id === selectedOrder?.petId);
  const selectedStaff = staff.find(
    (s) => s.id === (orderType === 'feeding' ? (selectedOrder as FeedingOrder)?.staffId : (selectedOrder as BoardingOrder)?.assignedStaffId)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-slate-800">新增评价</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <div className="space-y-5 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">订单类型</label>
              <select value={orderType} onChange={(e) => { setOrderType(e.target.value as any); setOrderId(''); }} className="select-field">
                <option value="feeding">上门喂养</option>
                <option value="boarding">寄养服务</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">选择订单</label>
              <select value={orderId} onChange={(e) => setOrderId(e.target.value)} className="select-field">
                <option value="">请选择已完成的订单</option>
                {availableOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id.toUpperCase()} - {orderType === 'feeding' ? (o as FeedingOrder).scheduledDate : (o as BoardingOrder).checkIn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedOrder && (
            <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-4">
              <div>
                <p className="text-xs text-slate-500">饲养员</p>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">{selectedStaff?.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">客户</p>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">{selectedCustomer?.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">宠物</p>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">{selectedPet?.name || '-'}</p>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">服务评分</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    onClick={() => setRating(i)}
                    className="p-1 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 hover:text-amber-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className={`badge ${TYPE_COLOR[type]}`}>
                {TYPE_LABEL[type]}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">评价标签</label>
            <div className="flex flex-wrap gap-2">
              {availTags.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedTags.includes(t)
                      ? type === 'positive'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500 text-white'
                      : type === 'positive'
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">评价内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入详细的评价内容..."
              className="input-field min-h-[100px]"
            />
          </div>

          {type === 'negative' && (
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4">
              <div>
                <label className="text-sm font-medium text-rose-700 mb-1.5 block flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  绩效扣款（元）
                </label>
                <input
                  type="number"
                  value={penalty}
                  onChange={(e) => setPenalty(Number(e.target.value))}
                  className="input-field bg-white"
                  min={0}
                />
                <p className="text-xs text-rose-600 mt-1">1星¥200 / 2星¥150 / 3星¥100</p>
              </div>
              <div>
                <label className="text-sm font-medium text-rose-700 mb-1.5 block flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  建议跟进日期
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="input-field bg-white"
                />
                <p className="text-xs text-rose-600 mt-1">提醒饲养员主动联系客户</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 border-t border-slate-100 px-6 py-4 sticky bottom-0 bg-white">
          <button
            onClick={submit}
            disabled={!selectedOrder || !content.trim()}
            className="btn-primary flex-1 justify-center disabled:opacity-60"
          >
            提交评价
          </button>
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

function RevokeConfirmDialog({
  review,
  onClose,
  onConfirm,
}: {
  review: Review;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [step, setStep] = useState<'reason' | 'confirm'>('reason');

  const presetReasons = [
    '客户误操作，要求撤回差评',
    '问题已妥善解决，客户表示满意',
    '评价内容与事实不符，经核实后撤销',
    '系统操作失误',
    '其他原因',
  ];

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'reason' ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Undo2 className="h-5 w-5 text-sky-600" />
                撤销差评
              </h3>
              <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-5 p-6">
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-100">
                    <ThumbsDown className="h-5 w-5 text-rose-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Stars rating={review.rating} />
                      <span className="badge bg-rose-100 text-rose-700">差评</span>
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-3">{review.content}</p>
                    {review.penaltyAmount && review.penaltyAmount > 0 && (
                      <p className="mt-2 text-xs font-semibold text-rose-600">
                        当前绩效扣款：¥{review.penaltyAmount}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-sky-100 bg-sky-50 p-4 space-y-3">
                <p className="text-xs font-semibold text-sky-800">撤销后将执行以下操作：</p>
                <ul className="text-xs text-sky-700 space-y-1.5">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-sky-600" />
                    评价类型变更为「好评」
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-sky-600" />
                    评分调整为不低于 4 星
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-sky-600" />
                    清除绩效扣款 ¥{review.penaltyAmount || 0}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-sky-600" />
                    清除差评标签，状态标记为已解决
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-sky-600" />
                    下次工资核算时自动补回绩效
                  </li>
                </ul>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  撤销原因 <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {presetReasons.map((r) => (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        reason === r
                          ? 'bg-sky-500 text-white'
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
                  placeholder="请详细说明撤销差评的原因..."
                  className="input-field min-h-[80px]"
                />
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setStep('confirm')}
                disabled={!reason.trim()}
                className="btn-primary flex-1 justify-center disabled:opacity-60"
              >
                下一步：确认
              </button>
              <button onClick={onClose} className="btn-secondary flex-1 justify-center">
                取消
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                确认撤销
              </h3>
              <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-5 p-6">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  操作不可逆警告
                </p>
                <p className="text-sm text-amber-700">
                  差评撤销后，原评价内容将以「处理说明」形式保留，但评价类型、扣款记录不可恢复。请确认以下信息无误：
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">评价类型</span>
                  <span className="text-sm font-medium">
                    <span className="text-rose-600">差评</span>
                    <span className="mx-2 text-slate-300">→</span>
                    <span className="text-emerald-600">好评</span>
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">评分</span>
                  <span className="text-sm font-medium">
                    <Stars rating={review.rating} />
                    <span className="mx-2 text-slate-300">→</span>
                    <Stars rating={Math.max(review.rating, 4)} />
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">绩效扣款</span>
                  <span className="text-sm font-medium">
                    <span className="text-rose-600">-¥{review.penaltyAmount || 0}</span>
                    <span className="mx-2 text-slate-300">→</span>
                    <span className="text-emerald-600">¥0</span>
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">撤销原因</span>
                  <span className="text-sm font-medium text-slate-700 max-w-[240px] text-right line-clamp-2">
                    {reason}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setStep('reason')} className="btn-secondary flex-1 justify-center">
                返回修改
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 flex items-center justify-center gap-1.5"
              >
                <Undo2 className="h-4 w-4" />
                确认撤销差评
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
