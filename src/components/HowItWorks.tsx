import { Music, Mic, Globe2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function HowItWorks() {
  const { t } = useI18n();
  const steps = [
    { icon: Music, title: t("how.s1.title"), desc: t("how.s1.desc") },
    { icon: Mic, title: t("how.s2.title"), desc: t("how.s2.desc") },
    { icon: Globe2, title: t("how.s3.title"), desc: t("how.s3.desc") },
  ];

  return (
    <section id="how" className="py-32 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-20">
          <p className="text-sm uppercase tracking-[0.2em] text-accent mb-4">{t("how.eyebrow")}</p>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter">
            {t("how.title.l1")} <span className="text-gradient-brand">{t("how.title.l2")}</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="glass rounded-3xl p-8 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-6 right-6 text-6xl font-semibold text-white/5 group-hover:text-white/10 transition-colors">
                0{i + 1}
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-brand flex items-center justify-center mb-6 shadow-[0_0_30px_oklch(0.7_0.22_295/0.4)]">
                <step.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3 tracking-tight">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
