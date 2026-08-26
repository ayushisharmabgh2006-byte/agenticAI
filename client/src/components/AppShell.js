import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Workflow,
  Sparkles,
  Activity,
  Cable,
  MessageCircle,
  Database,
  Settings2,
  Zap,
  Bell,
  LogOut,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useWorkflowStore } from '../store/workflowStore';
import NotificationsDrawer from './NotificationsDrawer';

const navigation = [
  { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { href: '/workflows', label: 'Workflows', icon: Workflow },
  { href: '/workflows/builder', label: 'AI Studio', icon: Sparkles },
  { href: '/chat', label: 'College Chat', icon: MessageCircle },
  { href: '/knowledge', label: 'Knowledge Base', icon: Database },
  { href: '/executions', label: 'Executions', icon: Activity },
  { href: '/integrations', label: 'Integrations', icon: Cable },
  { href: '/settings', label: 'Settings', icon: Settings2 }
];

export default function AppShell({ children, activeTitle = null }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { notifications, toggleNotifications } = useWorkflowStore();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const currentNav = navigation.find(item => {
    if (item.href === '/workflows' && router.pathname.startsWith('/workflows') && router.pathname !== '/workflows/builder') return true;
    return router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href) && item.href !== '/workflows');
  });

  const pageTitle = activeTitle || currentNav?.label || 'Command Center';

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'OP';

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Brand */}
        <Link href="/dashboard" className="brand group">
          <span className="brand-mark group-hover:scale-105 transition-transform">
            <Zap size={18} />
          </span>
          <span className="flex items-center tracking-tight">
            agentflow<span className="text-[#c7f36b]">_AI</span>
          </span>
        </Link>

        <div className="mt-8 mb-3 px-3 flex items-center justify-between">
          <span className="eyebrow">WORKSPACE / 01</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1b1f26] text-[#c7f36b] border border-[#262c35]">
            v1.0
          </span>
        </div>

        {/* Navigation */}
        <nav>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentNav?.href === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Multi-Agent Status Indicator */}
        <div className="mt-6 p-3.5 rounded-xl bg-[#14181d] border border-[#262c35] text-xs">
          <div className="flex items-center justify-between font-mono text-[11px] text-muted-light">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#c7f36b] animate-pulse"></span>
              Orchestrator
            </span>
            <span className="text-[#c7f36b] font-bold">5 Agents</span>
          </div>
          <p className="text-[10px] font-mono text-muted mt-1.5 leading-relaxed">
            Planner • Execution • Validation • Recovery • Monitoring
          </p>
        </div>

        {/* Footer / User Profile */}
        <div className="sidebar-foot">
          <div className="user-chip">
            <div className="user-avatar">{userInitials}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <b className="text-xs text-white truncate">{user?.name || 'Alex Rivera'}</b>
              </div>
              <small className="text-[11px] font-mono text-muted flex items-center gap-1">
                <ShieldCheck size={11} className="text-[#c7f36b]" />
                {user?.role === 'admin' ? 'Admin' : 'Operator'}
              </small>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 rounded-md text-muted hover:text-[#fb7185] hover:bg-[#1b1f26] transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow flex items-center gap-1.5">
              <span>Agentflow OS</span>
              <ChevronRight size={12} />
              <span className="text-white">{pageTitle}</span>
            </span>
            <h1>{pageTitle}</h1>
          </div>

          <div className="top-actions">
            <span className="live-pill">
              <span className="live-dot" />
              <span>Real-Time Engine</span>
            </span>

            <button
              onClick={toggleNotifications}
              className="icon-button"
              aria-label="Open notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && <span className="badge-dot" />}
            </button>
          </div>
        </header>

        {children}
      </main>

      {/* Slide-over Notifications Drawer */}
      <NotificationsDrawer />
    </div>
  );
}
