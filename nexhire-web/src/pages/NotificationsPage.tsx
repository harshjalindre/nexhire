import { Bell, Check, CheckCheck, Briefcase, Gift, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/features/notifications/hooks/useNotifications";
import { SkeletonListRows } from "@/components/shared/Skeletons";
import type { NotificationType } from "@/types/notification.types";

const iconMap: Record<NotificationType, React.ReactNode> = { drive_created: <Briefcase className="h-5 w-5 text-blue-500" />, application_update: <AlertCircle className="h-5 w-5 text-amber-500" />, shortlisted: <Check className="h-5 w-5 text-indigo-500" />, offer: <Gift className="h-5 w-5 text-emerald-500" />, system: <Bell className="h-5 w-5 text-gray-500" />, reminder: <AlertCircle className="h-5 w-5 text-orange-500" /> };

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();
  const notifications = data?.data || [];
  return (
    <div className="space-y-6">
      <FadeIn><PageHeader title="Notifications" description="Stay updated on your placement journey" actions={<Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}><CheckCheck className="h-4 w-4 mr-2" /> Mark all as read</Button>} /></FadeIn>
      {isLoading ? (<SkeletonListRows count={5} />
      ) : notifications.length === 0 ? (<EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
      ) : (<div className="space-y-2">{notifications.map((notif, i) => (
        <FadeIn key={notif.id} delay={i * 0.03}><Card className={cn("cursor-pointer transition-all hover:shadow-md", !notif.read && "border-primary/30 bg-primary/5")} onClick={() => !notif.read && markRead.mutate(notif.id)}><CardContent className="p-4 flex items-start gap-4">
          <div className="rounded-full bg-muted p-2 shrink-0">{iconMap[notif.type] || <Bell className="h-5 w-5" />}</div>
          <div className="flex-1 min-w-0"><div className="flex items-start justify-between gap-2"><h4 className={cn("text-sm font-medium", !notif.read && "font-semibold")}>{notif.title}</h4>{!notif.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}</div><p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p><p className="text-xs text-muted-foreground mt-1">{formatDate(notif.createdAt)}</p></div>
        </CardContent></Card></FadeIn>
      ))}</div>)}
    </div>
  );
}
