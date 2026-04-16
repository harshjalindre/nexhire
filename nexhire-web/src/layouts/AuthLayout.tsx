import { Outlet, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "@/components/shared/Logo";
import { useAuthStore } from "@/stores/authStore";
import { getRoleDashboardPath } from "@/lib/utils";

export function AuthLayout() {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) return <Navigate to={getRoleDashboardPath(user.role)} replace />;

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary animate-gradient-shift bg-[length:200%_200%]" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-white/10 animate-float" />
        <div className="absolute bottom-32 right-16 w-32 h-32 rounded-full bg-white/5 animate-float [animation-delay:1s]" />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-xl bg-white/10 animate-float [animation-delay:2s] rotate-45" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="glass rounded-2xl p-10 text-center max-w-lg">
            <Logo size="lg" variant="light" />
            <h2 className="text-3xl font-bold text-white mt-6">Campus Placement Platform</h2>
            <p className="text-white/80 mt-3 text-lg">Connecting 100,000+ students with top employers across 500+ colleges.</p>
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="text-center"><p className="text-2xl font-bold text-white">500+</p><p className="text-sm text-white/70">Colleges</p></div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center"><p className="text-2xl font-bold text-white">100K+</p><p className="text-sm text-white/70">Students</p></div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center"><p className="text-2xl font-bold text-white">2K+</p><p className="text-sm text-white/70">Companies</p></div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-full max-w-md">
          <div className="lg:hidden mb-8"><Logo size="lg" /></div>
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
