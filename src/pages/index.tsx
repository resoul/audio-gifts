import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { StickyCTA } from "@/components/StickyCTA";
import { Helmet } from "react-helmet-async";

export function IndexRoute() {
  return (
    <>
      <Helmet>
        <title>GiftedEmotions — Personalized Songs Released Worldwide</title>
        <meta property="og:title" content="GiftedEmotions — Create a Song That Lives Forever" />
        <meta property="og:description"
              content="Personalized music gifts, professionally produced and released globally on every major streaming platform." />
        <meta name="description"
              content="GiftedEmotions.com — order a custom music gift, professionally produced and released on Spotify, Apple Music & TikTok. A song that lives forever." />
      </Helmet>

      <div className="min-h-screen">
        <Header />
        <main>
          <Hero />
          <HowItWorks />
        </main>
        <Footer />
        <StickyCTA />
      </div>
    </>
  );
}
