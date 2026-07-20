import { Link } from 'react-router-dom';
import { useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Helmet } from "react-helmet-async";

const emailSchema = z.string().trim().email().max(255);
const nameSchema = z.string().trim().min(1).max(100);

export default function CreateCustomTrackPage() {
  const { t } = useI18n();
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [touchedEmail, setTouchedEmail] = useState(false);

  const emailValid = useMemo(() => emailSchema.safeParse(email).success, [email]);
  const nameValid = useMemo(() => nameSchema.safeParse(name).success, [name]);
  const descValid = description.trim().length > 0;
  const canSubmit = descValid && nameValid && emailValid;

  return (
    <>
      <Helmet>
        <title>Create Custom Track — GiftedEmotions</title>
        <meta property="og:title" content="Create Custom Track — GiftedEmotions" />
        <meta property="og:description"
              content="Describe your dream track and we'll produce a personalized song, released worldwide." />
        <meta name="description"
              content="Describe your dream track and our producers will craft a personalized song just for you." />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-32 pb-24 px-6">
          <div className="mx-auto max-w-3xl">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("custom.back")}
            </Link>

            <div className="text-center mb-12 animate-fade-up">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                {t("custom.badge")}
              </div>
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter leading-[1] mb-4">
                {t("custom.title.l1")} <span className="text-gradient-brand">{t("custom.title.l2")}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                {t("custom.subtitle")}
              </p>
            </div>

            {/* Availability notice */}
            <div className="glass rounded-2xl p-4 md:p-5 mb-6 border border-accent/20 flex items-start gap-3 animate-fade-up">
              <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("custom.availability")}
              </p>
            </div>

            <div className="glass rounded-3xl p-8 md:p-12 shadow-soft animate-fade-up space-y-6">
              {/* Name + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="contact-name" className="text-sm uppercase tracking-[0.2em] text-accent">
                    {t("custom.nameLabel")}
                  </Label>
                  <Input
                    id="contact-name"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 100))}
                    placeholder={t("custom.namePlaceholder")}
                    maxLength={100}
                    className="h-11 bg-white/5 border-white/10 focus-visible:ring-primary/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-sm uppercase tracking-[0.2em] text-accent">
                    {t("custom.emailLabel")}
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.slice(0, 255))}
                    onBlur={() => setTouchedEmail(true)}
                    placeholder={t("custom.emailPlaceholder")}
                    maxLength={255}
                    className="h-11 bg-white/5 border-white/10 focus-visible:ring-primary/40"
                  />
                  {touchedEmail && email.length > 0 && !emailValid && (
                    <p className="text-xs text-destructive">{t("custom.emailInvalid")}</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground -mt-2">{t("custom.contactNote")}</p>

              {/* Description */}
              <div className="space-y-3">
                <Label htmlFor="track-description" className="text-sm uppercase tracking-[0.2em] text-accent">
                  {t("custom.descLabel")}
                </Label>
                <textarea
                  id="track-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("custom.descPlaceholder")}
                  className="w-full h-64 p-5 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none placeholder:text-muted-foreground text-base leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {description.length} {t("custom.chars")}
              </span>
                <Button variant="hero" size="lg" disabled={!canSubmit}>
                  {t("custom.submit")}
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
