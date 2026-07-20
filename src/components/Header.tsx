import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Music2 } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

export function Header() {
  const { t } = useI18n();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-full bg-gradient-brand flex items-center justify-center shadow-[0_0_20px_oklch(0.7_0.22_295/0.5)] group-hover:scale-110 transition-transform">
            <Music2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight text-lg">GiftedEmotions</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground" />

        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="compact" />
          <Button variant="hero" size="sm" asChild>
            <Link to="/choose-song">{t("nav.createSong")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
