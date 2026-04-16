import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
export function ThemeToggle() {
  const [dark, setDark] = useState(() => typeof window !== "undefined" && document.documentElement.classList.contains("dark"));
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); localStorage.setItem("nexhire-theme", dark ? "dark" : "light"); }, [dark]);
  return <Button variant="ghost" size="icon" onClick={() => setDark(!dark)} className="rounded-full">{dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</Button>;
}
