
import React, { useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, AlertCircle, Info, Check, Trash2 } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { Notification, NotificationPriority } from '../../types/notification';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';

export const NotificationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>(() => notificationService.getAll());
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'CRITICAL'>('ALL');

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
    setNotifications(notificationService.getAll());
    showToast('success', 'All marked as read', 'Your notifications inbox is up to date.');
  };

  const handleItemRead = (id: string) => {
    notificationService.markAsRead(id);
    setNotifications(notificationService.getAll());
  };

  const filtered = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'CRITICAL') return n.priority === 'Critical';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Notification Center</h2>
          <p className="text-sm text-slate-500 mt-1">Alerts for critical diagnostic labs, drug stock warnings, and patient check-ins.</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-subtle transition"
        >
          <Check className="w-3.5 h-3.5 text-blue-600" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {(['ALL', 'UNREAD', 'CRITICAL'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab === 'ALL' && 'All Alerts'}
            {tab === 'UNREAD' && `Unread (${notifications.filter(n => !n.isRead).length})`}
            {tab === 'CRITICAL' && 'Critical STAT Alerts'}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle divide-y divide-slate-100 overflow-hidden">
        {filtered.length > 0 ? (
          filtered.map(n => {
            let icon = <Info className="w-5 h-5 text-blue-500" />;
            if (n.priority === 'Critical') icon = <AlertCircle className="w-5 h-5 text-rose-600" />;
            else if (n.priority === 'Urgent') icon = <AlertTriangle className="w-5 h-5 text-amber-500" />;

            return (
              <div
                key={n.id}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition ${
                  !n.isRead ? 'bg-blue-50/20' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 shrink-0">{icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm leading-tight ${!n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {n.title}
                      </h4>
                      <StatusBadge status={n.priority} size="sm" />
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{n.description}</p>
                    <span className="text-[11px] text-slate-400 mt-1.5 block">{n.timestamp} • Category: {n.category}</span>
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    onClick={() => handleItemRead(n.id)}
                    className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-xs text-slate-400">
            No notifications in this view.
          </div>
        )}
      </div>
    </div>
  );
};
