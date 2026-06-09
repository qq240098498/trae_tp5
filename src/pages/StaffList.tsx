import { useEffect, useState } from 'react';
import { Plus, Phone, Star, Calendar, Edit2, Trash2, Eye, X } from 'lucide-react';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';
import type { Staff } from '../../shared/types';

const STATUS_LABEL: Record<string, string> = { active: '在职', leave: '休假', inactive: '离职' };
const STATUS_COLOR: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  leave: 'bg-amber-100 text-amber-700',
  inactive: 'bg-slate-100 text-slate-500',
};

const PRESET_SKILLS = ['犬类护理', '猫科护理', '宠物美容', '基础训练', '医疗辅助', '遛狗服务', '上门喂养', '异宠护理'];

export default function StaffList() {
  const staff = useAppStore((s) => s.staff);
  const setStaff = useAppStore((s) => s.setStaff);
  const salaryRecords = useAppStore((s) => s.salaryRecords);
  const setSalaryRecords = useAppStore((s) => s.setSalaryRecords);
  const [keyword, setKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    skills: [] as string[],
    baseSalary: 3500,
    performanceRate: 1.0,
    status: 'active' as 'active' | 'leave' | 'inactive',
    hireDate: new Date().toISOString().slice(0, 10),
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    api.staff.list().then((r) => setStaff(r as Staff[]));
    api.staff.salaryRecords().then((r) => setSalaryRecords(r as never));
  }, [setStaff, setSalaryRecords]);

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const addCustomSkill = () => {
    const skill = skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
      setSkillInput('');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || formData.skills.length === 0) return;
    setLoading(true);
    try {
      const newStaff = await api.staff.create(formData);
      setStaff([...staff, newStaff as Staff]);
      setShowModal(false);
      setFormData({
        name: '',
        phone: '',
        skills: [],
        baseSalary: 3500,
        performanceRate: 1.0,
        status: 'active',
        hireDate: new Date().toISOString().slice(0, 10),
      });
    } catch (err) {
      alert('新增失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

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
        <button className="btn-primary" onClick={() => setShowModal(true)}>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-800">新增饲养员</h2>
                <p className="mt-0.5 text-xs text-slate-500">录入饲养员基本信息和技能</p>
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
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">姓名 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="请输入姓名"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">联系电话 *</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="请输入手机号"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">入职日期</label>
                  <input
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'leave' | 'inactive' })}
                    className="select-field"
                  >
                    <option value="active">在职</option>
                    <option value="leave">休假</option>
                    <option value="inactive">离职</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">基本工资 (元)</label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: parseInt(e.target.value) || 0 })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">绩效系数</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={formData.performanceRate}
                    onChange={(e) => setFormData({ ...formData, performanceRate: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">专业技能 *（至少选择1项）</label>
                <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-50 p-3">
                  {PRESET_SKILLS.map((skill) => {
                    const selected = formData.skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                          selected
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-brand-50 hover:text-brand-700'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                    placeholder="输入自定义技能后回车添加"
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="btn-secondary whitespace-nowrap"
                  >
                    添加
                  </button>
                </div>
                {formData.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {formData.skills.map((sk) => (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700"
                      >
                        {sk}
                        <button
                          type="button"
                          onClick={() => toggleSkill(sk)}
                          className="ml-0.5 text-brand-500 hover:text-brand-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
                disabled={loading || !formData.name || !formData.phone || formData.skills.length === 0}
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
