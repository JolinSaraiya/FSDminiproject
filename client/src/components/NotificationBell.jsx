import { useState } from 'react';
import useSocket from '../hooks/useSocket';

function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, connected, markAllRead, clearNotifications } =
    useSocket();

  function handleToggle() {
    setIsOpen((prev) => {
      const nextOpen = !prev;
      if (nextOpen && unreadCount > 0) {
        markAllRead();
      }
      return nextOpen;
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Live activity notifications"
        aria-expanded={isOpen}
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 hover:text-white"
      >
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        <span
          title={connected ? 'Real-Time Sync Active' : 'Offline'}
          className={`absolute right-1 bottom-1 h-2 w-2 rounded-full ring-2 ring-slate-950 ${
            connected ? 'bg-emerald-400' : 'bg-slate-500'
          }`}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-extrabold text-slate-950 shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-3 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-stone-200 bg-white text-slate-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/80 px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Real-Time Feed</h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    connected ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                Socket.IO: {connected ? 'Connected & Syncing' : 'Reconnecting'}
              </p>
            </div>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearNotifications}
                className="cursor-pointer text-xs font-semibold text-amber-700 hover:text-amber-800"
              >
                Clear
              </button>
            )}
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto p-3">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm font-medium text-slate-600">All caught up</p>
                <p className="mt-1 text-xs text-slate-400">
                  Live room &amp; booking updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-xl border border-stone-100 bg-stone-50/70 p-3 transition hover:bg-stone-100/70"
                >
                  <p className="text-xs leading-relaxed font-medium text-slate-800">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
