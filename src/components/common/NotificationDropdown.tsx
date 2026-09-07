
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertCircle, CheckCircle, Info, ExternalLink } from 'lucide-react';
import { notificationService } from '../../services/notificationService';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = notificationService.getAll();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const navigate = useNavigate();

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
    setIsOpen(false);
  };

  const handleItemClick = (link?: string, id?: string) => {
    if (id) notificationService.markAsRead(id);
    setIsOpen(false);
    if (link) navigate(link);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-xl border border-slate-200 shadow-xl z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length > 0 ? (
                notifications.slice(0, 5).map(n => {
                  let icon = <Info className="w-4 h-4 text-blue-500" />;
                  if (n.priority === 'Critical') icon = <AlertCircle className="w-4 h-4 text-rose-600" />;
                  else if (n.priority === 'Urgent') icon = <AlertCircle className="w-4 h-4 text-amber-500" />;
                  
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleItemClick(n.linkUrl, n.id)}
                      className={`p-3 hover:bg-slate-50 cursor-pointer transition flex items-start gap-3 ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className="mt-0.5 shrink-0">{icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-tight ${!n.isRead ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.description}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">No notifications</div>
              )}
            </div>

            <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
              >
                <span>View all notifications</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
