import { useState } from 'react';
import {
  Settings2,
  User,
  Shield,
  Key,
  Database,
  Lock,
  CheckCircle2,
  Server,
  Activity,
  LogOut,
  Save,
  Check
} from 'lucide-react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuthStore } from '../store/authStore';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [name, setName] = useState(user?.name || 'Alex Rivera');
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <ProtectedRoute>
      <AppShell activeTitle="Settings">
        <div className="space-y-6 max-w-4xl">
          {/* Profile Section */}
          <div className="card-panel">
            <div className="flex items-center gap-3 pb-4 border-b border-[#262c35]">
              <div className="h-8 w-8 rounded-lg bg-[#1b1f26] border border-[#262c35] grid place-items-center text-[#a855f7]">
                <User size={16} />
              </div>
              <div>
                <h3 className="font-grotesk font-bold text-base text-white">Operator Profile</h3>
                <p className="text-xs text-muted font-mono">Account details and workspace role</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-muted mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#181b21] border border-[#262c35] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#a855f7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted mb-1.5">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'operator@agentflow.io'}
                    className="w-full bg-[#181b21] border border-[#262c35] rounded-xl px-3.5 py-2.5 text-xs text-muted font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono text-muted flex items-center gap-1.5">
                  <Shield size={14} className="text-[#a855f7]" /> Role:{' '}
                  <span className="text-white font-bold uppercase">{user?.role || 'Operator'}</span>
                </span>

                <button type="submit" className="primary-button small">
                  {saved ? <Check size={14} /> : <Save size={14} />}
                  <span>{saved ? 'Updated' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Security & Cryptographic Health Check */}
          <div className="card-panel">
            <div className="flex items-center gap-3 pb-4 border-b border-[#262c35]">
              <div className="h-8 w-8 rounded-lg bg-[#1b1f26] border border-[#262c35] grid place-items-center text-[#38bdf8]">
                <Key size={16} />
              </div>
              <div>
                <h3 className="font-grotesk font-bold text-base text-white">Cryptographic Health Checks</h3>
                <p className="text-xs text-muted font-mono">Token encryption and authentication security</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-[#171a1f] border border-[#262c35] flex items-center justify-between">
                <div>
                  <b className="text-white">CREDENTIAL_ENCRYPTION_KEY</b>
                  <p className="text-[11px] text-muted mt-0.5">AES-256-GCM symmetric encryption for OAuth tokens at rest</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#17241a] text-[#a855f7] border border-[#2e472e] text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#171a1f] border border-[#262c35] flex items-center justify-between">
                <div>
                  <b className="text-white">JWT_SECRET</b>
                  <p className="text-[11px] text-muted mt-0.5">HMAC-SHA256 session token signature</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#17241a] text-[#a855f7] border border-[#2e472e] text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#171a1f] border border-[#262c35] flex items-center justify-between">
                <div>
                  <b className="text-white">BCRYPT_PASSWORD_HASHING</b>
                  <p className="text-[11px] text-muted mt-0.5">Cost factor 12 salt rounds</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#17241a] text-[#a855f7] border border-[#2e472e] text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* Infrastructure & Storage State */}
          <div className="card-panel">
            <div className="flex items-center gap-3 pb-4 border-b border-[#262c35]">
              <div className="h-8 w-8 rounded-lg bg-[#1b1f26] border border-[#262c35] grid place-items-center text-[#c084fc]">
                <Database size={16} />
              </div>
              <div>
                <h3 className="font-grotesk font-bold text-base text-white">System Diagnostics</h3>
                <p className="text-xs text-muted font-mono">Backend runtime substrate and queue topology</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#171a1f] border border-[#262c35]">
                <span className="text-[10px] text-muted uppercase">Database Substrate</span>
                <div className="text-sm font-bold text-white mt-1">Zero-Config Memory</div>
                <span className="text-[10px] text-[#a855f7] mt-1 block">MongoDB URI Ready</span>
              </div>

              <div className="p-4 rounded-xl bg-[#171a1f] border border-[#262c35]">
                <span className="text-[10px] text-muted uppercase">Job Scheduling</span>
                <div className="text-sm font-bold text-white mt-1">Async Event Queue</div>
                <span className="text-[10px] text-[#38bdf8] mt-1 block">BullMQ / Redis Ready</span>
              </div>

              <div className="p-4 rounded-xl bg-[#171a1f] border border-[#262c35]">
                <span className="text-[10px] text-muted uppercase">Real-Time Streaming</span>
                <div className="text-sm font-bold text-[#a855f7] mt-1">Socket.IO 4.7.5</div>
                <span className="text-[10px] text-muted mt-1 block">Port 4000 Connected</span>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
