import { Play } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Genres() {
  const { t } = useI18n();
  const genres = [
    { name: t("genres.pop"), desc: t("genres.popDesc"), emoji: "✨" },
    { name: t("genres.hiphop"), desc: t("genres.hiphopDesc"), emoji: "🎤" },
    { name: t("genres.edm"), desc: t("genres.edmDesc"), emoji: "⚡" },
    { name: t("genres.acoustic"), desc: t("genres.acousticDesc"), emoji: "🎸" },
    { name: t("genres.rnb"), desc: t("genres.rnbDesc"), emoji: "🌙" },
    { name: t("genres.indie"), desc: t("genres.indieDesc"), emoji: "🌊" },
  ];

  return (
    <section id="genres" className="py-32 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between mb-16 flex-wrap gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-accent mb-4">{t("genres.eyebrow")}</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter max-w-xl">
              {t("genres.title.l1")} <span className="text-gradient-brand">{t("genres.title.l2")}</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md">{t("genres.subtitle")}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {genres.map((g) => (
            <button
              key={g.name}
              className="group relative aspect-[5/4] rounded-3xl glass p-6 text-left overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_oklch(0.7_0.22_295/0.5)]"
            >
              <div className="absolute inset-0 bg-gradient-brand opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              <div className="text-3xl mb-auto">{g.emoji}</div>
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight">{g.name}</h3>
                  <p className="text-sm text-muted-foreground">{g.desc}</p>
                </div>
                <div className="h-11 w-11 rounded-full bg-gradient-brand flex items-center justify-center shadow-[0_0_20px_oklch(0.7_0.22_295/0.5)] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                  <Play className="h-4 w-4 text-primary-foreground fill-current ml-0.5" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
