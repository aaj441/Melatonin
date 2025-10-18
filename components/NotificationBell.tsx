import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { Bell, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface NotificationBellProps {
  userId: number;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const trpc = useTRPC();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const notifications = useQuery(
    trpc.getUserNotifications.queryOptions(
      { userId, unreadOnly: false },
      { refetchInterval: 30000 } // Refetch every 30 seconds
    )
  );
  
  const markAsRead = useMutation(trpc.markNotificationRead.mutationOptions());
  
  const unreadCount = notifications.data?.notifications.filter(n => !n.isRead).length || 0;
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead.mutateAsync({ notificationId, userId });
      notifications.refetch();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-cosmic-purple hover:text-ethereal-purple hover:bg-cosmic-navy/30 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-cosmic-darker border border-cosmic-purple/30 rounded-lg shadow-glow z-50">
          <div className="p-4 border-b border-cosmic-purple/20">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-mystical text-ethereal-purple">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-cosmic-navy/50 transition-colors"
              >
                <X size={16} className="text-cosmic-purple" />
              </button>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.data?.notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={32} className="mx-auto text-cosmic-purple mb-2 opacity-50" />
                <p className="text-sm text-ethereal-silver/70">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-cosmic-purple/20">
                {notifications.data?.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors ${
                      notification.isRead
                        ? 'bg-cosmic-darker'
                        : 'bg-cosmic-indigo/10 hover:bg-cosmic-indigo/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${
                            notification.type === 'REMINDER'
                              ? 'text-ethereal-purple'
                              : notification.type === 'ACHIEVEMENT'
                              ? 'text-ethereal-gold'
                              : 'text-cosmic-purple'
                          }`}>
                            {notification.type}
                          </span>
                          {!notification.isRead && (
                            <span className="w-2 h-2 rounded-full bg-cosmic-indigo" />
                          )}
                        </div>
                        <p className="text-sm text-ethereal-silver leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-xs text-cosmic-purple mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-1.5 rounded hover:bg-cosmic-navy/50 transition-colors flex-shrink-0"
                          title="Mark as read"
                        >
                          <Check size={14} className="text-cosmic-purple" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
