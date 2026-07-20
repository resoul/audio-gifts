import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useI18n } from "@/lib/i18n";
import { Helmet } from "react-helmet-async";

export default function LegalPage() {
  const { lang } = useI18n();
  const isRu = lang === "ru";

  return (
    <>
      <Helmet>
        <title>Privacy & Terms — GiftedEmotions</title>
        <meta name="description"
              content="Privacy policy, terms of use, and content rules for GiftedEmotions personalized music gifts." />
      </Helmet>

      <div className="min-h-screen">
        <Header />
        <main className="pt-32 pb-20 px-6">
          <article className="mx-auto max-w-3xl prose prose-invert prose-headings:tracking-tighter prose-headings:font-semibold">
            {isRu ? <RuContent /> : <EnContent />}
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
}

function EnContent() {
  return (
    <>
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter mb-4">Privacy & Terms</h1>
      <p className="text-muted-foreground mb-10">Last updated: May 2026</p>

      <h2 className="text-2xl mt-10 mb-3">1. Who we are</h2>
      <p className="text-foreground/80 leading-relaxed">
        GiftedEmotions.com creates personalized music gifts and releases them on streaming platforms
        such as Spotify, Apple Music, TikTok, YouTube Music, Amazon Music and Deezer. By placing an
        order you agree to these Terms and our Privacy Policy.
      </p>

      <h2 className="text-2xl mt-10 mb-3">2. Privacy Policy</h2>
      <p className="text-foreground/80 leading-relaxed">
        We collect only the data needed to deliver your order: name, email, the dedication text,
        any uploaded image or voice message, and payment details processed by our payment provider.
        We never sell your data. You can request deletion of your personal data at any time by
        contacting us via the contact form.
      </p>
      <ul className="list-disc pl-6 text-foreground/80 space-y-1">
        <li>We store order data for up to 24 months for accounting and support.</li>
        <li>Voice messages and images are stored only as long as needed to produce and release the track.</li>
        <li>We use cookies only for essential site functionality.</li>
      </ul>

      <h2 className="text-2xl mt-10 mb-3">3. Track titles & dedications — content rules</h2>
      <p className="text-foreground/80 leading-relaxed">Titles and dedication text must follow these rules:</p>
      <ul className="list-disc pl-6 text-foreground/80 space-y-1">
        <li>No profanity, slurs, hate speech or harassment.</li>
        <li>No threats, violence or sexually explicit content.</li>
        <li>No content that targets minors inappropriately.</li>
        <li>No third-party trademarks, brand names or platform names (Spotify, TikTok, etc.).</li>
        <li>No emojis, hashtags, URLs or phone numbers in the title.</li>
        <li>No impersonation of real public figures or other artists.</li>
      </ul>

      <h2 className="text-2xl mt-10 mb-3">4. Image upload rules</h2>
      <p className="text-foreground/80 leading-relaxed">
        If you upload a cover image, you confirm that you own all rights to it or have explicit
        permission from everyone visible in it. Images must:
      </p>
      <ul className="list-disc pl-6 text-foreground/80 space-y-1">
        <li>Be at least 1400×1400 px, square, JPG or PNG, under 10 MB.</li>
        <li>Not contain logos, brand marks, watermarks or copyrighted artwork you do not own.</li>
        <li>Not contain nudity, violence, weapons, drugs or hateful symbols.</li>
        <li>Not include text mentioning streaming platforms (e.g. "Spotify", "Apple Music").</li>
        <li>Not include readable phone numbers, URLs, QR codes or contact details.</li>
        <li>Show people only with their permission. For images of minors, written consent of a parent or legal guardian is required.</li>
      </ul>

      <h2 className="text-2xl mt-10 mb-3">5. Voice message rules</h2>
      <p className="text-foreground/80 leading-relaxed">
        Voice messages are used inside your track or as a private dedication. By uploading a voice
        message you confirm:
      </p>
      <ul className="list-disc pl-6 text-foreground/80 space-y-1">
        <li>The voice belongs to you, or the speaker has given clear consent to be recorded and used in a music release.</li>
        <li>The recording does not contain illegal, threatening, defamatory or sexually explicit content.</li>
        <li>The recording does not contain copyrighted music, film or TV audio in the background.</li>
        <li>Maximum length: 60 seconds. Format: MP3, M4A or WAV, under 25 MB.</li>
        <li>For minors, written consent of a parent or legal guardian is required.</li>
      </ul>

      <h2 className="text-2xl mt-10 mb-3">6. Review, rejection and refunds</h2>
      <p className="text-foreground/80 leading-relaxed">
        Every order is reviewed before release. Content that violates these rules will be rejected.
        We will contact you to request a corrected version. If a rule violation cannot be fixed, the
        release may be cancelled and the order refunded minus any production costs already incurred.
        Streaming platforms can remove releases at their discretion; in that case we cannot refund
        platform fees.
      </p>

      <h2 className="text-2xl mt-10 mb-3">7. Rights & licensing</h2>
      <p className="text-foreground/80 leading-relaxed">
        You receive a personal, non-exclusive license to your finished track for private and social
        media use. Master rights, composition rights and distribution rights remain with
        GiftedEmotions and its producers unless an "Exclusive" tier is purchased.
      </p>

      <h2 className="text-2xl mt-10 mb-3">8. Contact</h2>
      <p className="text-foreground/80 leading-relaxed">
        Questions about privacy, content rules or your order? Use the contact page and we'll get back
        to you within 2 business days.
      </p>
    </>
  );
}

function RuContent() {
  return (
    <>
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter mb-4">Политика и условия</h1>
      <p className="text-muted-foreground mb-10">Последнее обновление: май 2026</p>

      <h2 className="text-2xl mt-10 mb-3">1. О нас</h2>
      <p className="text-foreground/80 leading-relaxed">
        GiftedEmotions.com создаёт персональные музыкальные подарки и выпускает их на стриминговых
        площадках: Spotify, Apple Music, TikTok, YouTube Music, Amazon Music, Deezer и других.
        Оформляя заказ, вы соглашаетесь с настоящими Условиями и Политикой конфиденциальности.
      </p>

      <h2 className="text-2xl mt-10 mb-3">2. Политика конфиденциальности</h2>
      <p className="text-foreground/80 leading-relaxed">
        Мы собираем только данные, необходимые для выполнения заказа: имя, email, текст посвящения,
        загруженное изображение или голосовое сообщение, а также платёжные данные, обрабатываемые
        нашим провайдером. Мы никогда не продаём ваши данные. Вы можете в любой момент запросить
        удаление своих персональных данных, написав нам через форму контактов.
      </p>
      <ul className="list-disc pl-6 text-foreground/80 space-y-1">
        <li>Данные о заказах хранятся до 24 месяцев для бухгалтерии и поддержки.</li>
        <li>Голосовые сообщения и изображения хранятся только до выпуска трека.</li>
        <li>Cookies используются только для базовой работы сайта.</li>
      </ul>

      <h2 className="text-2xl mt-10 mb-3">3. Названия и посвящения — правила контента</h2>
      <p className="text-foreground/80 leading-relaxed">Название трека и текст посвящения должны соответствовать правилам:</p>
      <ul className="list-disc pl-6 text-foreground/80 space-y-1">
        <li>Без мата, оскорблений, языка вражды и травли.</li>
        <li>Без угроз, насилия и сексуально откровенного контента.</li>
        <li>Без контента, неприемлемо затрагивающего несовершеннолетних.</li>
        <li>Без чужих торговых марок, брендов и названий площадок (Spotify, TikTok и т. п.).</li>
        <li>Без эмодзи, хэштегов, ссылок и телефонов в названии.</li>
        <li>Без выдачи себя за реальных публичных лиц или артистов.</li>
      </ul>

      <h2 className="text-2xl mt-10 mb-3">4. Правила загрузки изображений</h2>
      <p className="text-foreground/80 leading-relaxed">
        Загружая обложку, вы подтверждаете, что обладаете всеми правами на изображение или имеете
        явное разрешение всех изображённых на нём людей. Изображения должны:
      </p>
      <ul className="list-disc pl-6 text-foreground/80 space-y-1">
        <li>Быть не меньше 1400×1400 px, квадратными, в формате JPG или PNG, до 10 МБ.</li>
        <li>Не содержать чужих логотипов, водяных знаков и защищённых авторским правом материалов.</li>
        <li>Не содержать наготы, насилия, оружия, наркотиков и символов вражды.</li>
        <li>Не содержать упоминаний стриминговых платформ (например «Spotify», «Apple Music»).</li>
        <li>Не содержать читаемых телефонов, ссылок, QR-кодов и контактных данных.</li>
        <li>Изображать людей только с их согласия. Для несовершеннолетних — письменное согласие родителя или опекуна.</li>
      </ul>

      <h2 className="text-2xl mt-10 mb-3">5. Правила голосовых сообщений</h2>
      <p className="text-foreground/80 leading-relaxed">
        Голосовое сообщение используется внутри трека или как личное посвящение. Загружая запись,
        вы подтверждаете:
      </p>
      <ul className="list-disc pl-6 text-foreground/80 space-y-1">
        <li>Голос принадлежит вам, либо говорящий дал явное согласие на запись и использование в музыкальном релизе.</li>
        <li>Запись не содержит незаконного, угрожающего, клеветнического или сексуально откровенного контента.</li>
        <li>На фоне нет защищённой авторским правом музыки, фильмов или ТВ-аудио.</li>
        <li>Максимальная длительность: 60 секунд. Форматы: MP3, M4A или WAV, до 25 МБ.</li>
        <li>Для несовершеннолетних — письменное согласие родителя или опекуна.</li>
      </ul>

      <h2 className="text-2xl mt-10 mb-3">6. Проверка, отказ и возврат</h2>
      <p className="text-foreground/80 leading-relaxed">
        Каждый заказ проходит проверку перед релизом. Контент, нарушающий правила, будет отклонён —
        мы свяжемся с вами, чтобы запросить исправленную версию. Если нарушение нельзя исправить,
        релиз отменяется, а средства возвращаются за вычетом уже понесённых производственных
        расходов. Стриминговые площадки могут удалить релиз по собственному усмотрению; в этом
        случае платформенные сборы не возвращаются.
      </p>

      <h2 className="text-2xl mt-10 mb-3">7. Права и лицензия</h2>
      <p className="text-foreground/80 leading-relaxed">
        Вы получаете личную неисключительную лицензию на готовый трек для личного использования и
        соцсетей. Мастер-права, права на композицию и дистрибуцию остаются за GiftedEmotions и
        продюсерами, если не приобретён тариф «Exclusive».
      </p>

      <h2 className="text-2xl mt-10 mb-3">8. Контакты</h2>
      <p className="text-foreground/80 leading-relaxed">
        Вопросы о приватности, правилах контента или заказе? Напишите через страницу контактов —
        ответим в течение 2 рабочих дней.
      </p>
    </>
  );
}
