import { Globe, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n, type Lang } from "@/lib/i18n";

type Props = {
  /** "stacked" — globe icon button with a label below (used in hero); "compact" — small inline pill */
  variant?: "stacked" | "compact";
  className?: string;
};

const LANGS: { code: Lang; labelKey: string; flag: string }[] = [
  { code: "en", labelKey: "lang.english", flag: "🇬🇧" },
  { code: "ru", labelKey: "lang.russian", flag: "🇷🇺" },
];

export function LanguageSwitcher({ variant = "stacked", className = "" }: Props) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click / escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSelect = (code: Lang) => {
    setLang(code);
    setOpen(false);
  };

  if (variant === "compact") {
    return (
      <div ref={wrapperRef} className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={t("lang.label")}
          aria-expanded={open}
          className="h-9 w-9 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <Globe className="h-4 w-4 text-foreground" />
        </button>
        {open && <LangMenu currentLang={lang} onSelect={handleSelect} t={t} align="right" />}
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className={`relative inline-flex flex-col items-center ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("lang.label")}
        aria-expanded={open}
        className="group h-14 w-14 rounded-full glass flex items-center justify-center hover:bg-white/10 hover:-translate-y-0.5 transition-all shadow-[0_0_24px_oklch(0.7_0.22_295/0.25)]"
      >
        <Globe className="h-6 w-6 text-foreground group-hover:text-accent transition-colors" />
      </button>
      <span className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {t("lang.label")}
      </span>
      {open && <LangMenu currentLang={lang} onSelect={handleSelect} t={t} align="center" />}
    </div>
  );
}

function LangMenu({
  currentLang,
  onSelect,
  t,
  align,
}: {
  currentLang: Lang;
  onSelect: (l: Lang) => void;
  t: (k: string) => string;
  align: "center" | "right";
}) {
  const alignment =
    align === "right"
      ? "right-0 top-full mt-2"
      : "left-1/2 -translate-x-1/2 top-full mt-3";

  return (
    <div
      role="listbox"
      className={`absolute ${alignment} z-50 min-w-[180px] glass rounded-2xl border border-white/10 p-1.5 shadow-[0_20px_60px_-10px_oklch(0.2_0.05_295/0.5)] animate-fade-up`}
    >
      {LANGS.map((l) => {
        const active = currentLang === l.code;
        return (
          <button
            key={l.code}
            role="option"
            aria-selected={active}
            onClick={() => onSelect(l.code)}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
              active ? "bg-primary/15 text-foreground" : "text-foreground/85 hover:bg-white/5"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-base leading-none">{l.flag}</span>
              <span className="font-medium">{t(l.labelKey)}</span>
            </span>
            {active && <Check className="h-4 w-4 text-accent" />}
          </button>
        );
      })}
    </div>
  );
}
