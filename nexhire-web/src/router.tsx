import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { Role } from "@/lib/constants";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const SignupPage = lazy(() => import("@/pages/auth/SignupPage"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const TenantManagement = lazy(() => import("@/pages/admin/TenantManagement"));
const CollegeDashboard = lazy(() => import("@/pages/college/CollegeDashboard"));
const DriveManagement = lazy(() => import("@/pages/college/DriveManagement"));
const CompanyManagement = lazy(() => import("@/pages/college/CompanyManagement"));
const StudentManagement = lazy(() => import("@/pages/college/StudentManagement"));
const StudentDashboard = lazy(() => import("@/pages/student/StudentDashboard"));
const DriveListingPage = lazy(() => import("@/pages/student/DriveListingPage"));
const ApplicationsPage = lazy(() => import("@/pages/student/ApplicationsPage"));
const ProfilePage = lazy(() => import("@/pages/student/ProfilePage"));
const ResumePage = lazy(() => import("@/pages/student/ResumePage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/auth/login" replace /> },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Lazy><LoginPage /></Lazy> },
      { path: "signup", element: <Lazy><SignupPage /></Lazy> },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      { path: "/admin", element: <RoleGuard allowedRoles={[Role.SUPER_ADMIN]}><Lazy><AdminDashboard /></Lazy></RoleGuard> },
      { path: "/admin/tenants", element: <RoleGuard allowedRoles={[Role.SUPER_ADMIN]}><Lazy><TenantManagement /></Lazy></RoleGuard> },
      { path: "/college", element: <RoleGuard allowedRoles={[Role.COLLEGE_ADMIN]}><Lazy><CollegeDashboard /></Lazy></RoleGuard> },
      { path: "/college/drives", element: <RoleGuard allowedRoles={[Role.COLLEGE_ADMIN]}><Lazy><DriveManagement /></Lazy></RoleGuard> },
      { path: "/college/companies", element: <RoleGuard allowedRoles={[Role.COLLEGE_ADMIN]}><Lazy><CompanyManagement /></Lazy></RoleGuard> },
      { path: "/college/students", element: <RoleGuard allowedRoles={[Role.COLLEGE_ADMIN]}><Lazy><StudentManagement /></Lazy></RoleGuard> },
      { path: "/student", element: <RoleGuard allowedRoles={[Role.STUDENT]}><Lazy><StudentDashboard /></Lazy></RoleGuard> },
      { path: "/student/drives", element: <RoleGuard allowedRoles={[Role.STUDENT]}><Lazy><DriveListingPage /></Lazy></RoleGuard> },
      { path: "/student/applications", element: <RoleGuard allowedRoles={[Role.STUDENT]}><Lazy><ApplicationsPage /></Lazy></RoleGuard> },
      { path: "/student/profile", element: <RoleGuard allowedRoles={[Role.STUDENT]}><Lazy><ProfilePage /></Lazy></RoleGuard> },
      { path: "/student/resume", element: <RoleGuard allowedRoles={[Role.STUDENT]}><Lazy><ResumePage /></Lazy></RoleGuard> },
      { path: "/notifications", element: <Lazy><NotificationsPage /></Lazy> },
      { path: "/settings", element: <Lazy><SettingsPage /></Lazy> },
    ],
  },
]);
