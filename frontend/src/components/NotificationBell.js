import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, Check } from 'lucide-react';

const API = (process.env.REACT_APP_BACKEND_URL || 'https://iching-backend-ac3n.onrender.com') + '/api';

/*
 * Campanella notifiche con badge + dropdown.
 *
 * Riceve `language` come prop; non importa l'auth context per restare
 * leggera (può essere usata anche in pagine pubbliche dopo login).
 */
const NotificationBell = ({ language = 'it' }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ notifications: [], unread_count: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const rootRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/notifications/inbox`, { headers: headers() });
      setData(r.data);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch + refresh every 60s
  useEffect(() => {
    fetchInbox();
    const id = setInterval(fetchInbox, 60_000);
    return () => clearInterval(id);
  }, []);

  const toggle = () => {
    if (!open) fetchInbox();
    setOpen(!open);
  };

  const openItem = async (n) => {
    // Mark read on backend
    try {
      await axios.post(`${API}/notifications/${encodeURIComponent(n.id)}/read`, {}, { headers: headers() });
    } catch {}
    // Mark locally
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((x) => x.id === n.id ? { ...x, read: true } : x),
      unread_count: Math.max(0, prev.unread_count - (n.read ? 0 : 1)),
    }));
    setOpen(false);
    if (n.deeplink) navigate(n.deeplink);
  };

  const markAllRead = async () => {
    try {
      await axios.post(`${API}/notifications/mark-all-read`, {}, { headers: headers() });
    } catch {}
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((x) => ({ ...x, read: true })),
      unread_count: 0,
    }));
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={toggle}
        className="relative p-2 rounded-full hover:bg-[#E5E0D8]/60 transition"
        aria-label={language === 'it' ? 'Notifiche' : 'Notifications'}
      >
        <Bell className="w-5 h-5 text-[#3a3a3a]" />
        {data.unread_count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-[#C44D38] rounded-full">
            {data.unread_count > 9 ? '9+' : data.unread_count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-2rem)] bg-white border border-[#D1CDC7] rounded-xl shadow-2xl z-50 overflow-hidden"
          role="menu"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-[#F9F7F2] border-b border-[#E5E0D8]">
            <h3 className="font-serif text-base text-[#2C2C2C]">
              {language === 'it' ? 'Notifiche intelligenti' : 'Smart notifications'}
            </h3>
            {data.unread_count > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[#C44D38] hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                {language === 'it' ? 'Segna tutte lette' : 'Mark all read'}
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading && data.notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-[#7a6f63]">…</div>
            ) : data.notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#7a6f63]">
                {language === 'it' ? 'Nessuna notifica al momento.' : 'No notifications right now.'}
              </div>
            ) : (
              data.notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => openItem(n)}
                  className={`w-full text-left px-4 py-3 border-b border-[#F1ECE2] hover:bg-[#FDF4F1]/50 transition flex gap-3 ${
                    n.read ? 'opacity-60' : ''
                  }`}
                >
                  <span className="text-xl flex-shrink-0 leading-none mt-0.5">{n.icon || '•'}</span>
                  <span className="flex-1 min-w-0">
                    <span className={`block text-sm leading-snug ${n.read ? 'font-normal text-[#3a3a3a]' : 'font-medium text-[#2C2C2C]'}`}>
                      {n.title}
                    </span>
                    {n.body && (
                      <span className="block text-xs text-[#7a6f63] mt-1 leading-snug line-clamp-2">
                        {n.body}
                      </span>
                    )}
                  </span>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[#C44D38] flex-shrink-0 mt-2" />
                  )}
                </button>
              ))
            )}
          </div>

          <div className="px-4 py-2 bg-[#F9F7F2] border-t border-[#E5E0D8] text-center">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs text-[#C44D38] hover:underline"
            >
              {language === 'it' ? 'Impostazioni notifiche →' : 'Notification settings →'}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
