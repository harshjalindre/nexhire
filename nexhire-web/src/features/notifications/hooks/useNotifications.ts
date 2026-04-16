import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Notification } from "@/types/notification.types";
import type { PaginatedResponse } from "@/types/common.types";
import { useNotificationStore } from "@/stores/notificationStore";
import { useEffect } from "react";

export function useNotifications(filters?: { read?: boolean }) {
  const { setUnreadCount } = useNotificationStore();
  const query = useQuery({ queryKey: ["notifications", filters], queryFn: async () => { const res = await api.get<PaginatedResponse<Notification>>("/notifications", { params: filters }); return res.data; } });
  useEffect(() => { if (query.data) { const unread = query.data.data.filter((n) => !n.read).length; setUnreadCount(unread); } }, [query.data, setUnreadCount]);
  return query;
}
export function useMarkAsRead() { const qc = useQueryClient(); return useMutation({ mutationFn: async (id: string) => { await api.put(`/notifications/${id}/read`); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }) }); }
export function useMarkAllAsRead() { const qc = useQueryClient(); return useMutation({ mutationFn: async () => { await api.put("/notifications/read-all"); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }) }); }
