import { useState } from 'react';
import { Bell, Check, CheckCheck, X, AlertTriangle, CheckCircle, Info, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useWorkflowStore } from '../store/workflowStore';

export default function NotificationsDrawer() {
  const { notifications, isNotificationsOpen, toggleNotifications, markAllNotificationsRead } = useWorkflowStore();
  const [filter, setFilter] = useState('all');

  if (!isNotificationsOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#13161a] border-l border-[#262c35] text-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-[#262c35] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#1b1f26] border border-[#262c35] grid place-items-center text-[#a855f7]">
                <Bell size={16} />
              </div>
              <div>
                <h3 className="font-grotesk font-semibold text-lg">Notifications</h3>
                <p className="text-xs text-muted font-mono">{unreadCount} unread system alert{unreadCount !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs text-muted hover:text-white flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-[#1b1f26] transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} /> Mark all
                </button>
              )}
              <button
                onClick={toggleNotifications}
                className="h-8 w-8 rounded-lg hover:bg-[#1b1f26] grid place-items-center text-muted hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="px-5 py-2.5 bg-[#171a1f] border-b border-[#262c35] flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`text-xs px-3 py-1 rounded-full font-mono transition-colors ${filter === 'all' ? 'bg-[#a855f7] text-ink font-bold' : 'text-muted hover:text-white'}`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`text-xs px-3 py-1 rounded-full font-mono transition-colors ${filter === 'unread' ? 'bg-[#a855f7] text-ink font-bold' : 'text-muted hover:text-white'}`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-muted">
                <CheckCircle size={32} className="text-[#a855f7]/40 mb-3" />
                <p className="text-sm font-medium">All caught up</p>
                <p className="text-xs font-mono text-muted/70 mt-1">No notifications matching filter.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isSuccess = notif.type === 'success';
                const isError = notif.type === 'error';
                const isWarning = notif.type === 'warning';

                return (
                  <div
                    key={notif.id || notif._id}
                    className={`p-4 rounded-xl border transition-all ${
                      notif.isRead
                        ? 'bg-[#171a1f]/60 border-[#262c35] opacity-75'
                        : 'bg-[#1b1f26] border-[#38414e] shadow-lg'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 h-6 w-6 rounded-md grid place-items-center shrink-0 ${
                        isSuccess ? 'bg-[#a855f7]/15 text-[#a855f7]' :
                        isError ? 'bg-[#fb7185]/15 text-[#fb7185]' :
                        isWarning ? 'bg-[#fbbf24]/15 text-[#fbbf24]' : 'bg-[#38bdf8]/15 text-[#38bdf8]'
                      }`}>
                        {isSuccess ? <Check size={13} /> : isError ? <AlertTriangle size={13} /> : <Info size={13} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-white tracking-wide truncate">{notif.title}</h4>
                          <span className="text-[10px] font-mono text-muted shrink-0">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-light mt-1 leading-relaxed">{notif.message}</p>

                        {notif.executionId && (
                          <div className="mt-3 pt-2 border-t border-[#262c35] flex items-center justify-between">
                            <span className="text-[10px] font-mono text-muted">ID: {notif.executionId.slice(0, 14)}...</span>
                            <Link
                              href={`/executions/${notif.executionId}`}
                              onClick={toggleNotifications}
                              className="text-[11px] text-[#a855f7] hover:underline flex items-center gap-1 font-medium"
                            >
                              View run <ExternalLink size={11} />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
