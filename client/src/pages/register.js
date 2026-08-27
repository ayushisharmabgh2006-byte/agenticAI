import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Zap, Lock, Mail, User, ArrowRight, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('operator');
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    const res = await register({ name, email, password, role });
    if (res.success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-[#1f3825]/30 to-[#1b2b38]/30 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#13161a] border border-[#262c35] rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mx-auto">
            <div className="h-9 w-9 rounded-lg bg-[#a855f7] text-black grid place-items-center font-black">
              <Zap size={20} />
            </div>
            <span className="font-grotesk font-bold text-xl tracking-tight">
              agentflow<span className="text-[#a855f7]">_AI</span>
            </span>
          </Link>
          <h2 className="font-grotesk text-2xl font-bold mt-5">Create Operator Account</h2>
          <p className="text-xs font-mono text-muted mt-1">Start orchestrating multi-agent flows</p>
        </div>

        {(error || localError) && (
          <div className="mt-5 p-3 rounded-lg bg-[#2b181b] border border-[#fb7185]/40 text-xs text-[#fb7185] flex items-center gap-2 font-mono">
            <AlertTriangle size={14} /> {error || localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted mb-1.5">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full bg-[#181b21] border border-[#262c35] rounded-xl px-3.5 py-2.5 text-xs text-white pl-9 focus:outline-none focus:border-[#a855f7]"
              />
              <User size={15} className="absolute left-3 top-3 text-muted" />
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-mono text-muted mb-1.5">Access Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#181b21] border border-[#262c35] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#a855f7]"
            >
              <option value="operator">Operator (Workflow Designer & Executor)</option>
              <option value="admin">Administrator (Full System & Security Access)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full primary-button mt-4 justify-center"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-mono text-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-[#a855f7] hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
