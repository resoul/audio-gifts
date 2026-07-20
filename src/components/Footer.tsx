import { Link } from "@tanstack/react-router";
import { Music2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-brand flex items-center justify-center">
            <Music2 className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">GiftedEmotions</span>
          <span className="text-sm text-muted-foreground ml-2">{t("footer.copyright")}</span>
        </div>
        <div className="flex gap-8 text-sm text-muted-foreground">
          <Link to="/legal" className="hover:text-foreground transition-colors">{t("footer.legal")}</Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">{t("footer.contact")}</Link>
        </div>
      </div>
    </footer>
  );
}
