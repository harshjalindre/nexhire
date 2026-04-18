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
const AuditTrailPage = lazy(() => import("@/pages/college/AuditTrailPage"));
const BillingPage = lazy(() => import("@/pages/college/BillingPage"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const TenantSignupPage = lazy(() => import("@/pages/auth/TenantSignupPage"));
const TermsPage = lazy(() => import("@/pages/legal/TermsPage"));
const PrivacyPage = lazy(() => import("@/pages/legal/PrivacyPage"));
const RecruiterDashboard = lazy(() => import("@/pages/recruiter/RecruiterDashboard"));
const RecruiterDrives = lazy(() => import("@/pages/recruiter/RecruiterDrives"));
const ApplicantReview = lazy(() => import("@/pages/recruiter/ApplicantReview"));
const CreateDrive = lazy(() => import("@/pages/recruiter/CreateDrive"));
const RecruiterSignupPage = lazy(() => import("@/pages/auth/RecruiterSignupPage"));

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  { path: "/", element: <Lazy><LandingPage /></Lazy> },
  { path: "/terms", element: <Lazy><TermsPage /></Lazy> },
  { path: "/privacy", element: <Lazy><PrivacyPage /></Lazy> },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Lazy><LoginPage /></Lazy> },
      { path: "signup", element: <Lazy><SignupPage /></Lazy> },
      { path: "signup/tenant", element: <Lazy><TenantSignupPage /></Lazy> },
      { path: "signup/recruiter", element: <Lazy><RecruiterSignupPage /></Lazy> },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      { path: "/admin", element: <RoleGuard allowedRoles={[Role.SUPER_ADMIN]}><Lazy><AdminDashboard /></Lazy></RoleGuard> },
      { path: "/admin/tenants", element: <RoleGuard allowedRoles={[Role.SUPER_ADMIN]}><Lazy><TenantManagement /></Lazy></RoleGuard> },
      { path: "/admin/audit", element: <RoleGuard allowedRoles={[Role.SUPER_ADMIN]}><Lazy><AuditTrailPage /></Lazy></RoleGuard> },
      { path: "/college", element: <RoleGuard allowedRoles={[Role.COLLEGE_ADMIN]}><Lazy><CollegeDashboard /></Lazy></RoleGuard> },
      { path: "/college/drives", element: <RoleGuard allowedRoles={[Role.COLLEGE_ADMIN]}><Lazy><DriveManagement /></Lazy></RoleGuard> },
      { path: "/college/companies", element: <RoleGuard allowedRoles={[Role.COLLEGE_ADMIN]}><Lazy><CompanyManagement /></Lazy></RoleGuard> },
      { path: "/college/students", element: <RoleGuard allowedRoles={[Role.COLLEGE_ADMIN]}><Lazy><StudentManagement /></Lazy></RoleGuard> },
      { path: "/college/audit", element: <RoleGuard allowedRoles={[Role.COLLEGE_ADMIN]}><Lazy><AuditTrailPage /></Lazy></RoleGuard> },
      { path: "/college/billing", element: <RoleGuard allowedRoles={[Role.COLLEGE_ADMIN]}><Lazy><BillingPage /></Lazy></RoleGuard> },
      { path: "/student", element: <RoleGuard allowedRoles={[Role.STUDENT]}><Lazy><StudentDashboard /></Lazy></RoleGuard> },
      { path: "/student/drives", element: <RoleGuard allowedRoles={[Role.STUDENT]}><Lazy><DriveListingPage /></Lazy></RoleGuard> },
      { path: "/student/applications", element: <RoleGuard allowedRoles={[Role.STUDENT]}><Lazy><ApplicationsPage /></Lazy></RoleGuard> },
      { path: "/student/profile", element: <RoleGuard allowedRoles={[Role.STUDENT]}><Lazy><ProfilePage /></Lazy></RoleGuard> },
      { path: "/student/resume", element: <RoleGuard allowedRoles={[Role.STUDENT]}><Lazy><ResumePage /></Lazy></RoleGuard> },
      { path: "/recruiter", element: <RoleGuard allowedRoles={[Role.RECRUITER]}><Lazy><RecruiterDashboard /></Lazy></RoleGuard> },
      { path: "/recruiter/drives", element: <RoleGuard allowedRoles={[Role.RECRUITER]}><Lazy><RecruiterDrives /></Lazy></RoleGuard> },
      { path: "/recruiter/drives/new", element: <RoleGuard allowedRoles={[Role.RECRUITER]}><Lazy><CreateDrive /></Lazy></RoleGuard> },
      { path: "/recruiter/drives/:driveId/applicants", element: <RoleGuard allowedRoles={[Role.RECRUITER]}><Lazy><ApplicantReview /></Lazy></RoleGuard> },
      { path: "/notifications", element: <Lazy><NotificationsPage /></Lazy> },
      { path: "/settings", element: <Lazy><SettingsPage /></Lazy> },
    ],
  },
]);
