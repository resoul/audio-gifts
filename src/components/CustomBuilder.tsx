import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Mic, Upload } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function CustomBuilder() {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [genre, setGenre] = useState("Pop");
  const [mood, setMood] = useState("Romantic");
  const [tempo, setTempo] = useState("Mid");

  const steps = [
    t("cb.steps.genre"),
    t("cb.steps.mood"),
    t("cb.steps.tempo"),
    t("cb.steps.voice"),
    t("cb.steps.dedication"),
  ];

  const genres = [
    { id: "Pop", label: t("genres.pop") },
    { id: "Hip-Hop", label: t("genres.hiphop") },
    { id: "EDM", label: t("genres.edm") },
    { id: "Acoustic", label: t("genres.acoustic") },
  ];
  const moods = [
    { id: "Joyful", label: t("cb.mood.joyful") },
    { id: "Romantic", label: t("cb.mood.romantic") },
    { id: "Nostalgic", label: t("cb.mood.nostalgic") },
    { id: "Uplifting", label: t("cb.mood.uplifting") },
  ];
  const tempos = [
    { id: "Slow", label: t("cb.tempo.slow") },
    { id: "Mid", label: t("cb.tempo.mid") },
    { id: "Upbeat", label: t("cb.tempo.upbeat") },
    { id: "Fast", label: t("cb.tempo.fast") },
  ];

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <section className="py-32 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-accent mb-4">{t("cb.eyebrow")}</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter">
            {t("cb.title.l1")} <span className="text-gradient-brand">{t("cb.title.l2")}</span>
          </h2>
        </div>

        <div className="glass rounded-3xl p-8 md:p-12 shadow-soft">
          {/* Progress */}
          <div className="mb-10">
            <div className="flex justify-between mb-3 text-xs text-muted-foreground">
              <span>{t("cb.step")} {step + 1} {t("cb.of")} {steps.length}</span>
              <span>{steps[step]}</span>
            </div>
            <div className="h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-brand transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          <div className="min-h-[280px]">
            {step === 0 && (
              <div className="animate-fade-up">
                <h3 className="text-2xl font-semibold mb-6 tracking-tight">{t("cb.pickGenre")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {genres.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGenre(g.id)}
                      className={`p-6 rounded-2xl border transition-all ${
                        genre === g.id
                          ? "border-primary bg-primary/10 shadow-[0_0_30px_oklch(0.7_0.22_295/0.3)]"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="font-medium">{g.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="animate-fade-up">
                <h3 className="text-2xl font-semibold mb-6 tracking-tight">{t("cb.setMood")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {moods.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMood(m.id)}
                      className={`p-6 rounded-2xl border transition-all ${
                        mood === m.id
                          ? "border-primary bg-primary/10 shadow-[0_0_30px_oklch(0.7_0.22_295/0.3)]"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="font-medium">{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-up">
                <h3 className="text-2xl font-semibold mb-6 tracking-tight">{t("cb.chooseTempo")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {tempos.map((tp) => (
                    <button
                      key={tp.id}
                      onClick={() => setTempo(tp.id)}
                      className={`p-6 rounded-2xl border transition-all ${
                        tempo === tp.id
                          ? "border-primary bg-primary/10 shadow-[0_0_30px_oklch(0.7_0.22_295/0.3)]"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="font-medium">{tp.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-up">
                <h3 className="text-2xl font-semibold mb-6 tracking-tight">{t("cb.addVoice")}</h3>
                <div className="border-2 border-dashed border-white/15 rounded-2xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="h-14 w-14 rounded-full glass flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-6 w-6 text-accent" />
                  </div>
                  <p className="font-medium mb-1">{t("cb.dropVoice")}</p>
                  <p className="text-sm text-muted-foreground mb-4">{t("cb.voiceFormats")}</p>
                  <Button variant="glass" size="sm">
                    <Mic className="h-4 w-4" /> {t("cb.recordNow")}
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-fade-up">
                <h3 className="text-2xl font-semibold mb-6 tracking-tight">{t("cb.writeDedication")}</h3>
                <textarea
                  placeholder={t("cb.dedicationPlaceholder")}
                  className="w-full h-40 p-5 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none placeholder:text-muted-foreground"
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-10 pt-6 border-t border-white/5">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              {t("cb.back")}
            </Button>
            {step < steps.length - 1 ? (
              <Button variant="hero" onClick={() => setStep(step + 1)}>
                {t("cb.continue")}
              </Button>
            ) : (
              <Button variant="hero">
                <Check className="h-4 w-4" /> {t("cb.preview")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
