import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, User, Calendar, ArrowRight } from "lucide-react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SkeletonListRows } from "@/components/shared/Skeletons";
import { FadeIn } from "@/components/animations/FadeIn";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

interface AuditLog {
  id: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string | null;
  meta: unknown;
  ip: string | null;
  createdAt: string;
}

function useAuditLogs(params: { action?: string; entity?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => api.get("/audit-logs", { params }).then(r => r.data),
  });
}

const actionColors: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  UPDATE: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  LOGIN: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
};

const entities = ["", "drive", "company", "tenant", "student", "application", "user"];

export default function AuditTrailPage() {
  const [search, setSearch] = useState("");
  const [entity, setEntity] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useAuditLogs({ action: debouncedSearch || undefined, entity: entity || undefined, page, limit: 15 });
  const logs: AuditLog[] = data?.data || [];

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      <FadeIn><PageHeader title="Audit Trail" description="Track all actions performed on the platform" /></FadeIn>
      <FadeIn delay={0.1}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by action..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select value={entity} onChange={(e) => { setEntity(e.target.value); setPage(1); }} className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm w-full sm:w-40">
            <option value="">All entities</option>
            {entities.filter(Boolean).map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
          </select>
        </div>
      </FadeIn>

      {isLoading ? <SkeletonListRows count={8} /> : logs.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground"><Shield className="h-12 w-12 mx-auto mb-3 opacity-30" /><p className="font-medium">No audit logs found</p><p className="text-sm">Actions will appear here as users interact with the platform</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log, i) => (
            <FadeIn key={log.id} delay={i * 0.02}>
              <Card className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${actionColors[log.action.toUpperCase()] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
                    {log.action.slice(0, 3).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{log.userName}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{log.action}</span>
                      <Badge variant="outline" className="text-[10px]">{log.entity}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{log.userEmail}</span>
                      {log.ip && <span>IP: {log.ip}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(log.createdAt)}</span>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={data?.totalPages || 1} total={data?.total} pageSize={15} onPageChange={setPage} />
    </div>
  );
}
