import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Waveform } from "@/components/Waveform";
import { useI18n } from "@/lib/i18n";

export function SamplePlayer() {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  const samples = [
    { title: t("sample.s1.title"), genre: t("sample.s1.genre"), duration: "3:24" },
    { title: t("sample.s2.title"), genre: t("sample.s2.genre"), duration: "4:02" },
    { title: t("sample.s3.title"), genre: t("sample.s3.genre"), duration: "3:18" },
  ];

  return (
    <section id="samples" className="py-32 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-accent mb-4">{t("sample.eyebrow")}</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter">
            {t("sample.title.l1")} <span className="text-gradient-brand">{t("sample.title.l2")}</span>
          </h2>
        </div>

        <div className="glass rounded-3xl p-8 md:p-12 shadow-soft">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-wider text-accent mb-2">{samples[active].genre}</p>
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">{samples[active].title}</h3>
          </div>

          <div className="mb-8">
            <Waveform bars={56} animated={playing} className="h-20" />
            <div className="flex justify-between text-xs text-muted-foreground mt-3">
              <span>0:00</span>
              <span>{samples[active].duration}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setActive((a) => (a - 1 + samples.length) % samples.length)}
              className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
            >
              <SkipBack className="h-5 w-5" />
            </button>
            <button
              onClick={() => setPlaying(!playing)}
              className="h-16 w-16 rounded-full bg-gradient-brand flex items-center justify-center shadow-[0_0_40px_oklch(0.7_0.22_295/0.5)] hover:scale-105 transition-transform"
            >
              {playing ? (
                <Pause className="h-6 w-6 text-primary-foreground fill-current" />
              ) : (
                <Play className="h-6 w-6 text-primary-foreground fill-current ml-1" />
              )}
            </button>
            <button
              onClick={() => setActive((a) => (a + 1) % samples.length)}
              className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {samples.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-8 bg-gradient-brand" : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
