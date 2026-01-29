import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bell, Sparkles, BookOpen, Calendar, Award, AlertCircle } from 'lucide-react';
import nativeService from '../services/NativeService';

// In-App Notification Component
const InAppNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for push notifications received in foreground
    const handleNotification = (event) => {
      const notification = event.detail;
      addNotification({
        id: Date.now(),
        title: notification.title || 'I Ching del Benessere',
        body: notification.body,
        icon: getIconForType(notification.data?.type),
        url: notification.data?.url,
        type: notification.data?.type || 'info',
        timestamp: new Date()
      });
    };

    window.addEventListener('iching-notification', handleNotification);
    return () => window.removeEventListener('iching-notification', handleNotification);
  }, []);

  const addNotification = (notification) => {
    nativeService.haptic('light');
    setNotifications(prev => [notification, ...prev].slice(0, 3));
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(notification.id);
    }, 5000);
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notification) => {
    nativeService.haptic('light');
    if (notification.url) {
      navigate(notification.url);
    }
    dismissNotification(notification.id);
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'consultation': return Sparkles;
      case 'daily': return Calendar;
      case 'library': return BookOpen;
      case 'achievement': return Award;
      case 'alert': return AlertCircle;
      default: return Bell;
    }
  };

  const getColorForType = (type) => {
    switch (type) {
      case 'consultation': return 'bg-[#C44D38]';
      case 'daily': return 'bg-purple-500';
      case 'library': return 'bg-blue-500';
      case 'achievement': return 'bg-amber-500';
      case 'alert': return 'bg-red-500';
      default: return 'bg-[#2C2C2C]';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[90] space-y-2 pointer-events-none">
      {notifications.map((notification) => {
        const Icon = notification.icon;
        return (
          <div
            key={notification.id}
            className="bg-white rounded-2xl shadow-xl border border-[#D1CDC7] overflow-hidden pointer-events-auto animate-slide-down"
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex items-start p-4">
              <div className={`w-10 h-10 rounded-xl ${getColorForType(notification.type)} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 ml-3 mr-2">
                <h4 className="font-medium text-[#2C2C2C] text-sm">
                  {notification.title}
                </h4>
                <p className="text-[#595959] text-sm mt-0.5 line-clamp-2">
                  {notification.body}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissNotification(notification.id);
                }}
                className="p-1 text-[#888] hover:text-[#2C2C2C] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Notification Permission Request Component
export const NotificationPermissionRequest = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Check if we should show the request
    const checkPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        // Don't show immediately, wait for user interaction
        const hasSeenRequest = localStorage.getItem('notificationRequestSeen');
        if (!hasSeenRequest) {
          setTimeout(() => setIsVisible(true), 60000); // Show after 1 minute
        }
      }
    };
    
    checkPermission();
  }, []);

  const handleAllow = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        nativeService.haptic('success');
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    }
    localStorage.setItem('notificationRequestSeen', 'true');
    setIsVisible(false);
    onDismiss?.();
  };

  const handleDismiss = () => {
    localStorage.setItem('notificationRequestSeen', 'true');
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 lg:left-auto lg:right-4 lg:w-80 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-xl border border-[#D1CDC7] p-4">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bell className="w-6 h-6 text-purple-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#2C2C2C] mb-1">
              Attiva le notifiche
            </h3>
            <p className="text-sm text-[#595959] mb-3">
              Ricevi l'esagramma del giorno e consigli personalizzati
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleAllow}
                className="flex-1 bg-[#C44D38] text-white py-2 px-3 rounded-lg text-sm font-medium"
              >
                Attiva
              </button>
              <button
                onClick={handleDismiss}
                className="py-2 px-3 text-[#595959] text-sm"
              >
                Dopo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Action Toast
export const QuickActionToast = ({ message, action, actionLabel, onAction, onDismiss, duration = 4000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 lg:left-auto lg:right-4 lg:w-96 animate-slide-up">
      <div className="bg-[#2C2C2C] text-white rounded-2xl shadow-xl p-4 flex items-center justify-between">
        <span className="text-sm">{message}</span>
        {action && (
          <button
            onClick={() => {
              onAction?.();
              setIsVisible(false);
              onDismiss?.();
            }}
            className="ml-4 text-[#C44D38] font-medium text-sm whitespace-nowrap"
          >
            {actionLabel || 'Annulla'}
          </button>
        )}
      </div>
    </div>
  );
};

export default InAppNotification;
