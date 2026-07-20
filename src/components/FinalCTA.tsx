import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Waveform } from "@/components/Waveform";
import { useI18n } from "@/lib/i18n";

export function FinalCTA() {
  const { t } = useI18n();
  return (
    <section className="py-32 px-6">
      <div className="mx-auto max-w-4xl">
        <div className="relative rounded-[2rem] glass p-12 md:p-20 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-brand opacity-10" />
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter mb-6">
              {t("finalcta.title.l1")} <br />
              <span className="text-gradient-brand">{t("finalcta.title.l2")}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              {t("finalcta.subtitle")}
            </p>
            <Button variant="hero" size="xl" className="group mb-12" asChild>
              <Link to="/choose-song">
                {t("finalcta.cta")}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <div className="opacity-50 max-w-md mx-auto">
              <Waveform bars={48} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
