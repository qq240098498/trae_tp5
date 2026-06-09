import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Database,
  User,
  Mail,
  Phone,
  Lock,
  Save,
} from 'lucide-react';

export default function Settings() {
  const [tab, setTab] = useState('general');
  const [saved, setSaved] = useState(false);

  const showSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const tabs = [
    { id: 'general', label: '基本设置', icon: SettingsIcon },
    { id: 'notify', label: '通知设置', icon: Bell },
    { id: 'security', label: '安全设置', icon: Shield },
    { id: 'users', label: '用户管理', icon: User },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">系统设置</h1>
        <p className="mt-1 text-sm text-slate-500">配置系统参数和账户信息</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="card p-2 lg:col-span-1 h-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'bg-brand-700 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="card p-6 lg:col-span-3">
          {tab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Palette className="h-5 w-5 text-brand-600" />
                基本设置
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">系统名称</label>
                  <input defaultValue="宠爱管家 - 宠物服务管理系统" className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">联系电话</label>
                  <input defaultValue="400-888-8888" className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">公司地址</label>
                  <input defaultValue="北京市朝阳区建国路88号SOHO现代城" className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">默认寄养时长(天)</label>
                  <input type="number" defaultValue={3} className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">默认喂养时长(分钟)</label>
                  <input type="number" defaultValue={60} className="input-field" />
                </div>
              </div>
              <button onClick={showSave} className="btn-primary">
                <Save className="h-4 w-4" />
                {saved ? '✓ 已保存' : '保存设置'}
              </button>
            </div>
          )}

          {tab === 'notify' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Bell className="h-5 w-5 text-accent-600" />
                通知设置
              </h3>
              {[
                { name: '新订单通知', desc: '有新的寄养或喂养订单时通知', on: true },
                { name: '入住提醒', desc: '寄养宠物入住当天提醒', on: true },
                { name: '退房提醒', desc: '寄养宠物退房前1天提醒', on: true },
                { name: '喂养任务提醒', desc: '喂养任务开始前1小时提醒', on: true },
                { name: '工资发放提醒', desc: '每月10号工资核算提醒', on: false },
                { name: '系统公告', desc: '接收系统升级和公告通知', on: true },
              ].map((n, i) => (
                <div key={i} className="flex items-start justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50/50">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{n.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{n.desc}</p>
                  </div>
                  <button className={`relative h-6 w-11 rounded-full transition-all ${n.on ? 'bg-brand-600' : 'bg-slate-200'}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${n.on ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Shield className="h-5 w-5 text-rose-600" />
                安全设置
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <Mail className="h-4 w-4" />
                    邮箱地址
                  </label>
                  <input defaultValue="admin@petcare.com" className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <Phone className="h-4 w-4" />
                    绑定手机
                  </label>
                  <input defaultValue="138****8888" className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <Lock className="h-4 w-4" />
                    当前密码
                  </label>
                  <input type="password" className="input-field" placeholder="请输入当前密码" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">新密码</label>
                    <input type="password" className="input-field" placeholder="至少8位" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">确认密码</label>
                    <input type="password" className="input-field" placeholder="再次输入" />
                  </div>
                </div>
              </div>
              <button onClick={showSave} className="btn-primary">
                <Save className="h-4 w-4" />
                {saved ? '✓ 已保存' : '更新安全设置'}
              </button>
            </div>
          )}

          {tab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Database className="h-5 w-5 text-sky-600" />
                系统用户
              </h3>
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="table-th">用户</th>
                      <th className="table-th">角色</th>
                      <th className="table-th">状态</th>
                      <th className="table-th">最后登录</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'admin', role: '系统管理员', status: '在线', last: '刚刚' },
                      { name: 'ops01', role: '运营人员', status: '在线', last: '10分钟前' },
                      { name: 'finance', role: '财务人员', status: '离线', last: '昨天 18:30' },
                      { name: 'ops02', role: '运营人员', status: '离线', last: '2天前' },
                    ].map((u, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="table-td">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
                              {u.name[0].toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-800">{u.name}</span>
                          </div>
                        </td>
                        <td className="table-td">
                          <span className="badge bg-brand-50 text-brand-700">{u.role}</span>
                        </td>
                        <td className="table-td">
                          <span className={`badge ${u.status === '在线' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {u.status === '在线' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" />}
                            {u.status}
                          </span>
                        </td>
                        <td className="table-td text-slate-500">{u.last}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
