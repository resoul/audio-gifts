import { useI18n } from "@/lib/i18n";

const platforms = ["Spotify", "Apple Music", "TikTok", "YouTube Music", "Amazon Music", "Deezer"];

export function Trust() {
  const { t } = useI18n();
  const testimonials = [
    { quote: t("trust.t1.quote"), name: t("trust.t1.name"), detail: t("trust.t1.detail") },
    { quote: t("trust.t2.quote"), name: t("trust.t2.name"), detail: t("trust.t2.detail") },
    { quote: t("trust.t3.quote"), name: t("trust.t3.name"), detail: t("trust.t3.detail") },
  ];

  return (
    <section className="py-32 px-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-sm uppercase tracking-[0.2em] text-muted-foreground mb-8">
          {t("trust.releasedOn")}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4 mb-24 opacity-60">
          {platforms.map((p) => (
            <span key={p} className="text-lg md:text-xl font-medium tracking-tight">{p}</span>
          ))}
        </div>

        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-accent mb-4">{t("trust.eyebrow")}</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter">
            {t("trust.title.l1")} <span className="text-gradient-brand">{t("trust.title.l2")}</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((tm) => (
            <div key={tm.name} className="glass rounded-3xl p-8 hover:-translate-y-1 transition-all duration-500">
              <div className="text-4xl text-accent/40 mb-4 leading-none">"</div>
              <p className="text-foreground/90 leading-relaxed mb-6">{tm.quote}</p>
              <div>
                <div className="font-medium">{tm.name}</div>
                <div className="text-sm text-muted-foreground">{tm.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
