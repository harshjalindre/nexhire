import { create } from "zustand";
import type { Notification } from "@/types/notification.types";

interface NotificationState {
  unreadCount: number; recent: Notification[];
  setUnreadCount: (count: number) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0, recent: [],
  setUnreadCount: (count) => set({ unreadCount: count }),
  addNotification: (notification) => set((state) => ({ recent: [notification, ...state.recent].slice(0, 10), unreadCount: state.unreadCount + 1 })),
  markAsRead: (id) => set((state) => ({ recent: state.recent.map((n) => (n.id === id ? { ...n, read: true } : n)), unreadCount: Math.max(0, state.unreadCount - 1) })),
  clearAll: () => set({ recent: [], unreadCount: 0 }),
}));
