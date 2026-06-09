import { useEffect, useState } from 'react';
import { Plus, Phone, Star, Calendar, Edit2, Trash2, Eye } from 'lucide-react';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';
import type { Staff } from '../../../shared/types';

const STATUS_LABEL: Record<string, string> = { active: '在职', leave: '休假', inactive: '离职' };
const STATUS_COLOR: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  leave: 'bg-amber-100 text-amber-700',
  inactive: 'bg-slate-100 text-slate-500',
};

export default function StaffList() {
  const staff = useAppStore((s) => s.staff);
  const setStaff = useAppStore((s) => s.setStaff);
  const salaryRecords = useAppStore((s) => s.salaryRecords);
  const setSalaryRecords = useAppStore((s) => s.setSalaryRecords);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    api.staff.list().then((r) => setStaff(r as Staff[]));
    api.staff.salaryRecords().then((r) => setSalaryRecords(r as never));
  }, [setStaff, setSalaryRecords]);

  const filtered = staff.filter((s) => {
    if (!keyword) return true;
    const k = keyword.toLowerCase();
    return s.name.includes(keyword) || s.phone.includes(keyword) || s.skills.some((x) => x.includes(keyword));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">饲养员档案</h1>
          <p className="mt-1 text-sm text-slate-500">管理饲养员基本信息和技能</p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4" />
          新增饲养员
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: '在职员工', v: staff.filter((s) => s.status === 'active').length, c: 'text-emerald-600' },
          { label: '休假中', v: staff.filter((s) => s.status === 'leave').length, c: 'text-amber-600' },
          { label: '本月发薪总额', v: '¥' + salaryRecords.reduce((s, r) => s + r.total, 0).toLocaleString(), c: 'text-brand-700' },
          { label: '平均基本工资', v: '¥' + Math.round(staff.reduce((s, x) => s + x.baseSalary, 0) / Math.max(1, staff.length)), c: 'text-accent-600' },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
            <p className={`mt-1.5 text-2xl font-bold ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-50 p-4">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索姓名、电话、技能..."
            className="input-field max-w-md"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => {
            const lastSalary = salaryRecords
              .filter((r) => r.staffId === s.id)
              .sort((a, b) => b.month.localeCompare(a.month))[0];
            return (
              <div
                key={s.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-50 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-bold text-white shadow-md">
                        {s.name[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{s.name}</h3>
                        <span className={`badge ${STATUS_COLOR[s.status]} mt-1`}>
                          {STATUS_LABEL[s.status]}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-accent-600">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{s.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>入职：{s.hireDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-3.5 w-3.5 text-slate-400" />
                      <span>绩效系数：{s.performanceRate}x</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">专业技能</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.skills.map((sk) => (
                        <span key={sk} className="badge bg-brand-50 text-brand-700">{sk}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div>
                      <p className="text-[10px] font-medium uppercase text-slate-500">基本工资</p>
                      <p className="text-base font-bold text-slate-800">¥{s.baseSalary.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-medium uppercase text-slate-500">上月实发</p>
                      <p className="text-base font-bold text-brand-700">
                        {lastSalary ? `¥${lastSalary.total.toLocaleString()}` : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
