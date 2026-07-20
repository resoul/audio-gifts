import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export function StickyCTA() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      <Button variant="hero" size="lg" className="shadow-[0_20px_60px_-10px_oklch(0.7_0.22_295/0.6)]" asChild>
        <Link to="/choose-song">
          <Sparkles className="h-4 w-4" />
          {t("sticky.cta")}
        </Link>
      </Button>
    </div>
  );
}
