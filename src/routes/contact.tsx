import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — GiftedEmotions" },
      { name: "description", content: "Get in touch with the GiftedEmotions team about your personalized music gift." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(1).max(1000),
});

function ContactPage() {
  const { lang } = useI18n();
  const isRu = lang === "ru";
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [sent, setSent] = useState(false);

  const L = isRu
    ? {
        title: "Свяжитесь с нами",
        subtitle: "Напишите нам — ответим в течение 2 рабочих дней.",
        name: "Имя",
        email: "Email",
        message: "Сообщение",
        submit: "Отправить",
        sent: "Спасибо! Мы получили ваше сообщение.",
        errName: "Введите имя (до 100 символов)",
        errEmail: "Введите корректный email",
        errMessage: "Введите сообщение (до 1000 символов)",
      }
    : {
        title: "Contact us",
        subtitle: "Send us a message — we'll reply within 2 business days.",
        name: "Name",
        email: "Email",
        message: "Message",
        submit: "Send",
        sent: "Thanks! We've received your message.",
        errName: "Enter your name (max 100 characters)",
        errEmail: "Enter a valid email address",
        errMessage: "Enter a message (max 1000 characters)",
      };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      const flat = result.error.flatten().fieldErrors;
      if (flat.name?.length) fieldErrors.name = L.errName;
      if (flat.email?.length) fieldErrors.email = L.errEmail;
      if (flat.message?.length) fieldErrors.message = L.errMessage;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSent(true);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-xl">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter mb-4">{L.title}</h1>
          <p className="text-muted-foreground mb-10">{L.subtitle}</p>

          {sent ? (
            <div className="glass rounded-2xl p-6 text-foreground">{L.sent}</div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <Label htmlFor="name" className="mb-2 block">{L.name}</Label>
                <Input
                  id="name"
                  value={form.name}
                  maxLength={100}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="email" className="mb-2 block">{L.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  maxLength={255}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="message" className="mb-2 block">{L.message}</Label>
                <Textarea
                  id="message"
                  rows={5}
                  value={form.message}
                  maxLength={1000}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
                {errors.message && <p className="text-sm text-destructive mt-1">{errors.message}</p>}
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full">
                {L.submit}
              </Button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
