import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie-consent");
    if (!accepted) setTimeout(() => setShow(true), 2000);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-4">
      <div className="max-w-4xl mx-auto bg-card border rounded-xl shadow-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Cookie className="h-5 w-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-sm text-muted-foreground flex-1">
          We use essential cookies for authentication. No tracking cookies are used. By continuing, you agree to our{" "}
          <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" onClick={accept}>Accept</Button>
          <Button size="sm" variant="ghost" onClick={() => setShow(false)}><X className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}
