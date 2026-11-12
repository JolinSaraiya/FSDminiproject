import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SocketContext } from './socketContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

const REALTIME_EVENTS = [
  'hotel:created',
  'hotel:updated',
  'hotel:deleted',
  'booking:created',
  'booking:cancelled',
];

function SocketProvider({ children }) {
  const [socketInstance, setSocketInstance] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    function handleConnect() {
      setConnected(true);
    }

    function handleDisconnect() {
      setConnected(false);
    }

    function handleRealtimeNotification(payload) {
      const item = {
        ...payload,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };

      setNotifications((prev) => [item, ...prev].slice(0, 30));
      setUnreadCount((count) => count + 1);
      setToast(item);

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
      }, 4500);
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    REALTIME_EVENTS.forEach((eventName) => {
      socket.on(eventName, handleRealtimeNotification);
    });

    queueMicrotask(() => {
      setSocketInstance(socket);
    });

    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      REALTIME_EVENTS.forEach((eventName) => {
        socket.off(eventName, handleRealtimeNotification);
      });
      socket.disconnect();
    };
  }, []);

  const markAllRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketInstance,
        connected,
        notifications,
        unreadCount,
        markAllRead,
        clearNotifications,
      }}
    >
      {children}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-5 bottom-5 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-amber-500/30 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur-md"
        >
          <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400" />
          <div className="flex-1 text-sm">
            <p className="text-xs font-bold tracking-wider text-amber-400 uppercase">Live Sync</p>
            <p className="mt-0.5 text-slate-200">{toast.message}</p>
          </div>
          <button
            type="button"
            onClick={dismissToast}
            aria-label="Dismiss notification"
            className="cursor-pointer rounded-lg px-1.5 py-0.5 text-xs text-slate-400 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </SocketContext.Provider>
  );
}

export default SocketProvider;
