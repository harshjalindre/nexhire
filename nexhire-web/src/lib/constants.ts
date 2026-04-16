import { LayoutDashboard, Building2, GraduationCap, Briefcase, Users, FileText, Settings } from "lucide-react";

export enum Role {
  SUPER_ADMIN = "super_admin",
  COLLEGE_ADMIN = "college_admin",
  STUDENT = "student",
}

export const NAV_ITEMS = {
  [Role.SUPER_ADMIN]: [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Tenants", path: "/admin/tenants", icon: Building2 },
    { label: "Settings", path: "/settings", icon: Settings },
  ],
  [Role.COLLEGE_ADMIN]: [
    { label: "Dashboard", path: "/college", icon: LayoutDashboard },
    { label: "Drives", path: "/college/drives", icon: Briefcase },
    { label: "Companies", path: "/college/companies", icon: Building2 },
    { label: "Students", path: "/college/students", icon: GraduationCap },
    { label: "Settings", path: "/settings", icon: Settings },
  ],
  [Role.STUDENT]: [
    { label: "Dashboard", path: "/student", icon: LayoutDashboard },
    { label: "Drives", path: "/student/drives", icon: Briefcase },
    { label: "Applications", path: "/student/applications", icon: FileText },
    { label: "Profile", path: "/student/profile", icon: Users },
    { label: "Resume", path: "/student/resume", icon: FileText },
    { label: "Settings", path: "/settings", icon: Settings },
  ],
};

export const BRANCHES = [
  "Computer Science", "Information Technology", "Electronics",
  "Mechanical", "Civil", "Electrical", "Chemical",
] as const;

export const APPLICATION_STATUSES = [
  "applied", "shortlisted", "interview", "offered", "rejected", "withdrawn",
] as const;

export const DRIVE_STATUSES = ["draft", "active", "closed", "completed"] as const;

export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
