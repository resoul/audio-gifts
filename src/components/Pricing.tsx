import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Pricing() {
  const { t } = useI18n();

  const tiers = [
    {
      name: t("pricing.basic.name"),
      price: "$99",
      desc: t("pricing.basic.desc"),
      features: [
        t("pricing.basic.f1"),
        t("pricing.basic.f2"),
        t("pricing.basic.f3"),
        t("pricing.basic.f4"),
        t("pricing.basic.f5"),
      ],
    },
    {
      name: t("pricing.premium.name"),
      price: "$199",
      desc: t("pricing.premium.desc"),
      features: [
        t("pricing.premium.f1"),
        t("pricing.premium.f2"),
        t("pricing.premium.f3"),
        t("pricing.premium.f4"),
        t("pricing.premium.f5"),
        t("pricing.premium.f6"),
      ],
      featured: true,
    },
    {
      name: t("pricing.exclusive.name"),
      price: "$399",
      desc: t("pricing.exclusive.desc"),
      features: [
        t("pricing.exclusive.f1"),
        t("pricing.exclusive.f2"),
        t("pricing.exclusive.f3"),
        t("pricing.exclusive.f4"),
        t("pricing.exclusive.f5"),
        t("pricing.exclusive.f6"),
      ],
    },
  ];

  return (
    <section id="pricing" className="py-32 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-accent mb-4">{t("pricing.eyebrow")}</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter">
            {t("pricing.title.l1")} <span className="text-gradient-brand">{t("pricing.title.l2")}</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 ${
                tier.featured
                  ? "bg-gradient-brand text-primary-foreground shadow-[0_30px_80px_-20px_oklch(0.7_0.22_295/0.6)]"
                  : "glass"
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-background text-foreground text-xs font-medium border border-white/10">
                  {t("pricing.mostLoved")}
                </div>
              )}
              <h3 className="text-xl font-semibold tracking-tight mb-1">{tier.name}</h3>
              <p className={`text-sm mb-6 ${tier.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {tier.desc}
              </p>
              <div className="mb-8">
                <span className="text-5xl font-semibold tracking-tighter">{tier.price}</span>
              </div>
              <Button
                variant={tier.featured ? "glass" : "hero"}
                size="lg"
                className={`w-full mb-8 ${tier.featured ? "bg-background/20 text-primary-foreground hover:bg-background/30" : ""}`}
              >
                {t("pricing.choose")} {tier.name}
              </Button>
              <ul className="space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${tier.featured ? "" : "text-accent"}`} />
                    <span className={tier.featured ? "" : "text-foreground/80"}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
