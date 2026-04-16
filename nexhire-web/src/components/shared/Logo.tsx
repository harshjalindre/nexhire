import { cn } from "@/lib/utils";

interface LogoProps { size?: "sm" | "md" | "lg"; variant?: "light" | "dark" | "auto"; showText?: boolean; }

export function Logo({ size = "md", variant = "auto", showText = true }: LogoProps) {
  const sizes = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14" };
  const textSizes = { sm: "text-lg", md: "text-xl", lg: "text-3xl" };
  const textColor = variant === "light" ? "text-white" : variant === "dark" ? "text-foreground" : "text-foreground";

  return (
    <div className="flex items-center gap-2.5">
      <div className={cn("rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/25", sizes[size])}>
        <span className={cn("font-extrabold text-white", size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-lg")}>N</span>
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight", textSizes[size], textColor)}>
          Nex<span className="gradient-text">Hire</span>
        </span>
      )}
    </div>
  );
}
