import { motion } from "framer-motion";

interface FadeInProps { children: React.ReactNode; delay?: number; duration?: number; direction?: "up" | "down" | "left" | "right"; className?: string; }

export function FadeIn({ children, delay = 0, duration = 0.5, direction = "up", className }: FadeInProps) {
  const directionMap = { up: { y: 24 }, down: { y: -24 }, left: { x: 24 }, right: { x: -24 } };
  return (
    <motion.div initial={{ opacity: 0, ...directionMap[direction] }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}
