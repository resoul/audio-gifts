import { Button } from "@/components/ui/button";
import { Waveform } from "@/components/Waveform";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from 'react-router-dom';
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/hero-waves.jpg"
          alt=""
          width={1920}
          height={1280}
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
      </div>

      <div className="mx-auto max-w-5xl px-6 text-center animate-fade-up">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          {t("hero.badge")}
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter leading-[0.95] mb-6">
          {t("hero.title.line1")}
          <br />
          <span className="text-gradient-brand">{t("hero.title.line2")}</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          {t("hero.subtitle")}
        </p>

        {/* Language switcher — placed above the primary CTA */}
        <div className="flex justify-center mb-6">
          <LanguageSwitcher variant="stacked" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-16">
          <Button variant="hero" size="xl" className="group" asChild>
            <Link to="/choose-song">
              {t("hero.cta.choose")}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button variant="glass" size="xl" asChild>
            <Link to="/create-custom-track">{t("hero.cta.custom")}</Link>
          </Button>
        </div>

        <div className="max-w-2xl mx-auto opacity-70">
          <Waveform bars={64} />
        </div>
      </div>
    </section>
  );
}
