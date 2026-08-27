import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Zap, Lock, Mail, ArrowRight, Loader2, AlertTriangle, ShieldCheck, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('operator@agentflow.io');
  const [password, setPassword] = useState('password123');
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    const res = await login(email, password);
    if (res.success) {
      router.push('/dashboard');
    }
  };

  const handleQuickFill = (role) => {
    if (role === 'operator') {
      setEmail('operator@agentflow.io');
      setPassword('password123');
    } else if (role === 'admin') {
      setEmail('admin@agentflow.io');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-[#1f3825]/30 to-[#1b2b38]/30 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#13161a] border border-[#262c35] rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mx-auto">
            <div className="h-9 w-9 rounded-lg bg-[#a855f7] text-black grid place-items-center font-black">
              <Zap size={20} />
            </div>
            <span className="font-grotesk font-bold text-xl tracking-tight">
              agentflow<span className="text-[#a855f7]">_AI</span>
            </span>
          </Link>
          <h2 className="font-grotesk text-2xl font-bold mt-5">Sign In to Console</h2>
          <p className="text-xs font-mono text-muted mt-1">Access your automation workspace</p>
        </div>

        {/* Demo Quick Fill Buttons */}
        <div className="mt-6 p-3.5 rounded-xl bg-[#181c22] border border-[#262c35]">
          <span className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-2 font-semibold">
            One-Click Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('operator')}
              className="py-1.5 px-2.5 rounded-lg bg-[#20252e] hover:bg-[#28303c] border border-[#303845] text-xs font-mono text-[#a855f7] flex items-center justify-center gap-1.5 transition-colors"
            >
              <User size={13} /> Operator Mode
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="py-1.5 px-2.5 rounded-lg bg-[#20252e] hover:bg-[#28303c] border border-[#303845] text-xs font-mono text-[#38bdf8] flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck size={13} /> Admin Mode
            </button>
          </div>
        </div>

        {(error || localError) && (
          <div className="mt-4 p-3 rounded-lg bg-[#2b181b] border border-[#fb7185]/40 text-xs text-[#fb7185] flex items-center gap-2 font-mono">
            <AlertTriangle size={14} /> {error || localError}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@agentflow.io"
                className="w-full bg-[#181b21] border border-[#262c35] rounded-xl px-3.5 py-2.5 text-xs text-white pl-9 focus:outline-none focus:border-[#a855f7]"
              />
              <Mail size={15} className="absolute left-3 top-3 text-muted" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-muted mb-1.5">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#181b21] border border-[#262c35] rounded-xl px-3.5 py-2.5 text-xs text-white pl-9 focus:outline-none focus:border-[#a855f7]"
              />
              <Lock size={15} className="absolute left-3 top-3 text-muted" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full primary-button mt-4 justify-center"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-mono text-muted">
          Don't have an account?{' '}
          <Link href="/register" className="text-[#a855f7] hover:underline font-bold">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
