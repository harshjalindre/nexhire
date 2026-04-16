import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/stores/notificationStore";
export function NotificationBell() {
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();
  return (
    <Button variant="ghost" size="icon" className="relative rounded-full" onClick={() => navigate("/notifications")}>
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>}
    </Button>
  );
}
