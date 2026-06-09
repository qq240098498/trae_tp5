import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, Lock, User, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const login = useAppStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    login(username, username === 'admin' ? '系统管理员' : '运营人员');
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-400/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
              <PawPrint className="h-8 w-8 text-accent-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              宠物服务管理系统
            </h1>
            <p className="mt-2 flex items-center gap-1 text-sm text-brand-200">
              <Sparkles className="h-4 w-4" />
              专业的寄养 · 喂养 · 工资一体化管理平台
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/20"
          >
            <h2 className="mb-6 text-xl font-bold text-slate-800">登录账号</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field pl-10"
                    placeholder="请输入用户名"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10"
                    placeholder="请输入密码"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/25 transition-all hover:from-brand-700 hover:to-brand-800 hover:shadow-xl active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? '登录中...' : '登 录'}
              </button>
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
              <p className="font-medium text-slate-600">测试账号：</p>
              <p className="mt-1">用户名: admin / 密码: admin123</p>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-brand-200/70">
            © 2026 宠物服务管理系统 · 让爱宠无忧
          </p>
        </div>
      </div>
    </div>
  );
}
