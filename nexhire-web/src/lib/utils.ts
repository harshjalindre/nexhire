import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// #19 — Null-safe date formatting
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try { return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(date)); }
  catch { return "—"; }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function getRoleDashboardPath(role: string): string {
  const map: Record<string, string> = { super_admin: "/admin", college_admin: "/college", student: "/student", recruiter: "/recruiter" };
  return map[role] || "/student";
}
