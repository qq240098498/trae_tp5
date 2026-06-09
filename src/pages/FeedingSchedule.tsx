import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, User } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';
import type { FeedingOrder, Pet, Staff } from '../../../shared/types';

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-400',
  assigned: 'bg-blue-400',
  in_progress: 'bg-purple-400',
  completed: 'bg-emerald-400',
  cancelled: 'bg-rose-400',
};

export default function FeedingSchedule() {
  const orders = useAppStore((s) => s.feedingOrders);
  const setOrders = useAppStore((s) => s.setFeedingOrders);
  const pets = useAppStore((s) => s.pets);
  const staff = useAppStore((s) => s.staff);
  const setPets = useAppStore((s) => s.setPets);
  const setStaff = useAppStore((s) => s.setStaff);

  const [baseDate, setBaseDate] = useState(new Date('2026-06-09'));

  useEffect(() => {
    api.feeding.orders().then((r) => setOrders(r as FeedingOrder[]));
    api.pets.list().then((r) => setPets(r as Pet[]));
    api.staff.list().then((r) => setStaff(r as Staff[]));
  }, [setOrders, setPets, setStaff]);

  const weekDates = () => {
    const base = new Date(baseDate);
    const day = base.getDay();
    const diff = base.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(base.setDate(diff));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  };
  const days = weekDates();
  const dayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const hours = Array.from({ length: 14 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

  const weekNum = (() => {
    const d = new Date(baseDate);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7);
  })();

  const shiftWeek = (n: number) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + n * 7);
    setBaseDate(d);
  };

  const monthLabel = `${days[0].slice(0, 7)} 第${weekNum}周`;

  const getPetName = (id: string) => pets.find((p) => p.id === id)?.name || '-';
  const getStaffName = (id?: string) => (id ? staff.find((s) => s.id === id)?.name : '未分配');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">喂养日程调度</h1>
          <p className="mt-1 text-sm text-slate-500">以周视图查看和安排上门喂养服务</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => shiftWeek(-1)} className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50">
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-800">
            {monthLabel}
          </div>
          <button onClick={() => shiftWeek(1)} className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50">
            <ChevronRight className="h-5 w-5 text-slate-600" />
          </button>
          <button onClick={() => setBaseDate(new Date('2026-06-09'))} className="btn-secondary">
            回到今天
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-100 bg-slate-50/80">
          <div className="p-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">时间</div>
          {days.map((d, i) => {
            const isToday = d === '2026-06-09';
            return (
              <div key={d} className={`border-l border-slate-100 p-3 text-center ${isToday ? 'bg-brand-50/50' : ''}`}>
                <p className="text-xs font-semibold text-slate-500">{dayLabels[i]}</p>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <span className={`text-lg font-bold ${isToday ? 'text-brand-700' : 'text-slate-800'}`}>{d.slice(8)}</span>
                  {isToday && <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[10px] font-semibold text-white">今天</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
          {hours.map((h) => (
            <div key={h} className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-50 min-h-[70px]">
              <div className="p-2 text-center text-xs font-medium text-slate-400">{h}</div>
              {days.map((d) => {
                const dayOrders = orders.filter(
                  (o) => o.scheduledDate === d && Math.abs(parseInt(o.scheduledTime) - parseInt(h)) < 2
                );
                const isToday = d === '2026-06-09';
                return (
                  <div
                    key={d + h}
                    className={`relative border-l border-slate-50 p-1.5 ${isToday ? 'bg-brand-50/20' : ''}`}
                  >
                    {dayOrders.map((o) =>
                      parseInt(o.scheduledTime) === parseInt(h) ? (
                        <div
                          key={o.id}
                          className={`mb-1 rounded-lg border-l-4 p-2 shadow-sm transition-all hover:shadow-md ${STATUS_COLOR[o.status]}10 ${STATUS_COLOR[o.status].replace('bg-', 'border-')}`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-xs font-bold text-slate-800">
                                {getPetName(o.petId)} · {o.scheduledTime}
                              </p>
                              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-600">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{o.petAddress.slice(0, 12)}...</span>
                              </p>
                              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                                <User className="h-3 w-3 flex-shrink-0" />
                                {getStaffName(o.staffId)}
                              </p>
                            </div>
                            <span className={`h-2 w-2 flex-shrink-0 rounded-full ${STATUS_COLOR[o.status]}`} />
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-3 text-sm font-bold text-slate-800">图例</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          {[
            { c: 'bg-amber-400', l: '待分配' },
            { c: 'bg-blue-400', l: '已分配' },
            { c: 'bg-purple-400', l: '进行中' },
            { c: 'bg-emerald-400', l: '已完成' },
          ].map((i) => (
            <div key={i.l} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${i.c}`} />
              <span className="text-slate-600">{i.l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
