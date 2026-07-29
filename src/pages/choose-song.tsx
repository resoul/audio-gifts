import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Waveform } from "@/components/Waveform";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Mic,
  Pause,
  Play,
  Sparkles,
  Upload,
  CalendarDays,
  CreditCard,
  Music2,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  Info,
  ShieldAlert,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { useI18n, type Lang } from "@/lib/i18n";
import { Helmet } from "react-helmet-async";
import { fetchGenres, fetchMoods, fetchSongs, getAudioUrl } from "@/lib/supabase";

const FALLBACK_GENRES = ["All", "Pop", "Hip-Hop", "EDM", "Acoustic", "R&B", "Indie"] as const;
const FALLBACK_MOODS = ["All", "Joyful", "Romantic", "Nostalgic", "Uplifting", "Melancholic"] as const;

type Track = {
  id: string;
  trackName: string;
  artistName: string;
  genre: string;
  mood: string;
  duration: string;
  durationSec: number;
  startTime: number | null;
  endpoint: string | null;
};

const PLATFORMS = [
  { id: "spotify", name: "Spotify" },
  { id: "apple", name: "Apple Music" },
  { id: "tiktok", name: "TikTok" },
  { id: "youtube", name: "YouTube Music" },
  { id: "amazon", name: "Amazon Music" },
  { id: "deezer", name: "Deezer" },
] as const;

const STEPS = [
  { id: 1, labelKey: "cs.steps.chooseTrack" },
  { id: 2, labelKey: "cs.steps.voice" },
  { id: 3, labelKey: "cs.steps.cover" },
  { id: 4, labelKey: "cs.steps.release" },
  { id: 5, labelKey: "cs.steps.summary" },
] as const;

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function parseSeconds(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    // "mm:ss" or "hh:mm:ss"
    if (trimmed.includes(":")) {
      const parts = trimmed.split(":").map((p) => Number(p));
      if (parts.some((p) => !Number.isFinite(p))) return null;
      return parts.reduce((acc, p) => acc * 60 + p, 0);
    }
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function todayPlusDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatPrettyDate(iso: string, lang: Lang = "en") {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function ChooseSongPage() {
  const { t, lang } = useI18n();
  const [step, setStep] = useState(1);

  // Step 1
  const [genres, setGenres] = useState<string[]>([...FALLBACK_GENRES]);
  const [genre, setGenre] = useState<string>("All");
  const [moods, setMoods] = useState<string[]>([...FALLBACK_MOODS]);
  const [mood, setMood] = useState<string>("All");
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previewProgress, setPreviewProgress] = useState(0); // 0..1
  const [previewLoading, setPreviewLoading] = useState(false);

  // Step 2
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [voiceDuration, setVoiceDuration] = useState<number>(8); // mock seconds
  const [insertAt, setInsertAt] = useState<number>(0); // seconds in track
  const [isRecording, setIsRecording] = useState(false);
  const [voiceRulesAccepted, setVoiceRulesAccepted] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);
  const recordTimer = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Step 3
  const [coverPrompt, setCoverPrompt] = useState("");
  const [coverGenerating, setCoverGenerating] = useState(false);
  const [coverGradient, setCoverGradient] = useState<string | null>(null);
  const [customCoverUrl, setCustomCoverUrl] = useState<string | null>(null);

  const handleCustomCover = (file: File) => {
    const url = URL.createObjectURL(file);
    setCustomCoverUrl(url);
    // Clear AI gradient so the uploaded image takes over
    setCoverGradient(null);
  };

  // Step 4
  const [platforms, setPlatforms] = useState<string[]>(PLATFORMS.map((p) => p.id));
  const [releaseDate, setReleaseDate] = useState<string>(todayPlusDays(31));
  const [trackTitle, setTrackTitle] = useState<string>("");
  const [titleRulesAccepted, setTitleRulesAccepted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      try {
        const [genresData, moodsData] = await Promise.all([fetchGenres(), fetchMoods()]);
        if (!isMounted) return;
        const genreNames = genresData.map((item) => item.name).filter(Boolean);
        const moodNames = moodsData.map((item) => item.name).filter(Boolean);
        setGenres(["All", ...genreNames]);
        setMoods(["All", ...moodNames]);
      } catch {
        if (!isMounted) return;
        setGenres([...FALLBACK_GENRES]);
        setMoods([...FALLBACK_MOODS]);
      }
    };

    void loadOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadTracks = async () => {
      setTracksLoading(true);

      try {
        const genresData = await fetchGenres();
        const moodsData = await fetchMoods();
        const songsData = await fetchSongs({
          genreId: genre === "All" ? undefined : genresData.find((item) => item.name === genre)?.id,
          moodId: mood === "All" ? undefined : moodsData.find((item) => item.name === mood)?.id,
        });

        if (!isMounted) return;

        const mappedTracks: Track[] = (songsData ?? []).map((song) => {
          const durationSec = parseSeconds(song.duration);
          const startTimeSec = parseSeconds(song.start_time);
          return {
            id: song.id,
            trackName: song.trackName ?? "Untitled track",
            artistName: song.artistName ?? "Unknown artist",
            genre: genresData.find((item) => item.id === song.genre_id)?.name ?? "Unknown",
            mood: moodsData.find((item) => item.id === song.mood_id)?.name ?? "Unknown",
            duration: durationSec !== null ? formatTime(durationSec) : "—",
            durationSec: durationSec ?? 0,
            startTime: startTimeSec,
            endpoint: song.endpoint ?? null,
          };
        });

        setTracks(mappedTracks);
      } catch {
        if (!isMounted) return;
        setTracks([]);
      } finally {
        if (isMounted) {
          setTracksLoading(false);
        }
      }
    };

    void loadTracks();

    return () => {
      isMounted = false;
    };
  }, [genre, mood]);

  const filtered = useMemo(() => tracks, [tracks]);

  // Mini-player: play/pause whichever track is currently set as previewId
  useEffect(() => {
    if (!previewId) {
      audioRef.current?.pause();
      return;
    }

    const track = tracks.find((tr) => tr.id === previewId) ?? selectedTrack;
    const url = getAudioUrl(track?.endpoint);

    if (!url) {
      setPreviewId(null);
      return;
    }

    const startAt = track?.startTime && track.startTime > 0 ? track.startTime : 0;

    let cancelled = false;
    setPreviewProgress(0);
    setPreviewLoading(true);

    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.src = url;

    const onTimeUpdate = () => {
      if (audio.duration > 0) setPreviewProgress(audio.currentTime / audio.duration);
    };
    const onEnded = () => {
      setPreviewProgress(0);
      setPreviewId(null);
    };
    const onLoadedMetadata = () => {
      if (cancelled) return;
      if (startAt > 0 && startAt < audio.duration) {
        audio.currentTime = startAt;
      }
    };
    const onCanPlay = () => {
      if (cancelled) return;
      setPreviewLoading(false);
      void audio.play().catch(() => setPreviewId(null));
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("canplay", onCanPlay);
    audio.load();

    return () => {
      cancelled = true;
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("canplay", onCanPlay);
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewId]);

  // Stop playback entirely when leaving step 1 or unmounting
  useEffect(() => {
    if (step !== 1) {
      setPreviewId(null);
    }
  }, [step]);

  // Seek current preview to a fraction (0..1) of its duration, e.g. from a waveform/progress click
  const seekPreview = (fraction: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const clamped = Math.min(1, Math.max(0, fraction));
    audio.currentTime = clamped * audio.duration;
    setPreviewProgress(clamped);
  };

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (recordTimer.current) window.clearInterval(recordTimer.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      mediaStreamRef.current?.getTracks().forEach((tr) => tr.stop());
    };
  }, []);

  // Step gating
  const hasVoice = !!voiceFile;
  const trimmedTitle = trackTitle.trim();
  const titleValid =
      trimmedTitle.length >= 2 &&
      trimmedTitle.length <= 60 &&
      /^[\p{L}\p{N} '’\-,.&!?]+$/u.test(trimmedTitle);
  const canContinue = useMemo(() => {
    if (step === 1) return !!selectedTrack;
    if (step === 2) return hasVoice ? voiceRulesAccepted : true; // optional, but rules required if uploaded/recorded
    if (step === 3) return !!coverGradient || !!customCoverUrl;
    if (step === 4) return platforms.length > 0 && !!releaseDate && titleValid && titleRulesAccepted;
    return true;
  }, [step, selectedTrack, hasVoice, voiceRulesAccepted, coverGradient, customCoverUrl, platforms, releaseDate, titleValid, titleRulesAccepted]);

  const progress = (step / STEPS.length) * 100;

  // Voice handlers
  const handleVoiceFile = (file: File) => {
    setVoiceFile(file);
    const url = URL.createObjectURL(file);
    setVoiceUrl(url);
    // Try to read real duration; fall back to mock
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setVoiceDuration(Math.round(audio.duration));
      }
    });
  };

  const startRecording = async () => {
    setRecordError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setRecordError(t("s2.record.errorUnsupported"));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      recordedChunksRef.current = [];

      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ].find((type) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(type));

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.start();
      setIsRecording(true);

      let elapsed = 0;
      recordTimer.current = window.setInterval(() => {
        elapsed += 1;
        setVoiceDuration(elapsed);
        if (elapsed >= 30) stopRecording();
      }, 1000);

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const file = new File([blob], "recording.webm", { type: blob.type });
        const url = URL.createObjectURL(blob);

        setVoiceFile(file);
        setVoiceUrl(url);
        // Chrome can report Infinity/NaN duration for freshly recorded blobs until
        // playback seeks once, so fall back to the timer's elapsed seconds.
        setVoiceDuration(elapsed > 0 ? elapsed : 1);

        const audio = new Audio(url);
        audio.addEventListener("loadedmetadata", () => {
          if (Number.isFinite(audio.duration) && audio.duration > 0) {
            setVoiceDuration(Math.round(audio.duration));
          }
        });

        mediaStreamRef.current?.getTracks().forEach((tr) => tr.stop());
        mediaStreamRef.current = null;
      };
    } catch {
      setRecordError(t("s2.record.errorDenied"));
      mediaStreamRef.current?.getTracks().forEach((tr) => tr.stop());
      mediaStreamRef.current = null;
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordTimer.current) {
      window.clearInterval(recordTimer.current);
      recordTimer.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  // Cover gen mock
  const generateCover = async () => {
    setCoverGenerating(true);
    await new Promise((r) => setTimeout(r, 1400));
    const seed = (coverPrompt + (selectedTrack?.trackName ?? "")).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const h1 = (seed * 7) % 360;
    const h2 = (seed * 13 + 80) % 360;
    const h3 = (seed * 23 + 200) % 360;
    setCoverGradient(
        `radial-gradient(circle at 30% 20%, oklch(0.78 0.18 ${h1}) 0%, transparent 55%), radial-gradient(circle at 75% 70%, oklch(0.72 0.2 ${h2}) 0%, transparent 60%), linear-gradient(135deg, oklch(0.35 0.1 ${h3}), oklch(0.18 0.05 ${(h3 + 60) % 360}))`,
    );
    setCoverGenerating(false);
  };

  const togglePlatform = (id: string) => {
    setPlatforms((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const trackLen = selectedTrack?.durationSec ?? 0;

  return (
      <>
        <Helmet>
          <title>Choose a Song — GiftedEmotions</title>
          <meta property="og:title" content="Choose a Song — GiftedEmotions" />
          <meta property="og:description"
                content="A 5-step flow to craft and release your personalized song worldwide." />
          <meta name="description"
                content="Pick your track, add a voice dedication, generate a cover with AI, choose where to release it, and check out — all in one elegant flow." />
        </Helmet>

        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pt-28 pb-24 px-6">
            <div className="mx-auto max-w-5xl">
              <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("cs.backHome")}
              </Link>

              {/* Header */}
              <div className="text-center mb-10 animate-fade-up">
                <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-5 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  {t("cs.stepOf")} {step} {t("cs.of")} {STEPS.length} · {t(STEPS[step - 1].labelKey)}
                </div>
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1]">
                  {t("cs.heading.l1")} <span className="text-gradient-brand">{t("cs.heading.l2")}</span>
                </h1>
              </div>

              {/* Stepper */}
              <div className="glass rounded-2xl p-4 mb-8">
                <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                  <span>{t("cs.progress")}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1 rounded-full bg-white/10 overflow-hidden mb-5">
                  <div
                      className="h-full bg-gradient-brand transition-all duration-500"
                      style={{ width: `${progress}%` }}
                  />
                </div>
                <ol className="grid grid-cols-5 gap-2 text-[11px] md:text-xs">
                  {STEPS.map((s) => {
                    const done = s.id < step;
                    const active = s.id === step;
                    return (
                        <li
                            key={s.id}
                            className={`flex flex-col items-center gap-1.5 text-center ${
                                active ? "text-foreground" : done ? "text-accent" : "text-muted-foreground"
                            }`}
                        >
                    <span
                        className={`h-7 w-7 rounded-full flex items-center justify-center border transition-all ${
                            active
                                ? "border-primary bg-primary/20 shadow-[0_0_20px_oklch(0.7_0.22_295/0.4)]"
                                : done
                                    ? "border-accent/60 bg-accent/10"
                                    : "border-white/10"
                        }`}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : s.id}
                    </span>
                          <span className="hidden sm:block">{t(s.labelKey)}</span>
                        </li>
                    );
                  })}
                </ol>
              </div>

              {/* Step content */}
              <div className="glass rounded-3xl p-6 md:p-10 shadow-soft min-h-[480px]">
                {step === 1 && (
                    <Step1
                        genre={genre}
                        setGenre={setGenre}
                        mood={mood}
                        setMood={setMood}
                        genres={genres}
                        moods={moods}
                        tracks={filtered}
                        tracksLoading={tracksLoading}
                        selectedTrack={selectedTrack}
                        onSelect={setSelectedTrack}
                        previewId={previewId}
                        setPreviewId={setPreviewId}
                        previewProgress={previewProgress}
                        previewLoading={previewLoading}
                        onSeekPreview={seekPreview}
                        onContinue={() => setStep((s) => Math.min(STEPS.length, s + 1))}
                        onClearSelection={() => {
                          setSelectedTrack(null);
                          setPreviewId(null);
                        }}
                    />
                )}

                {step === 2 && (
                    <Step2
                        track={selectedTrack}
                        voiceFile={voiceFile}
                        voiceUrl={voiceUrl}
                        voiceDuration={voiceDuration}
                        insertAt={insertAt}
                        setInsertAt={setInsertAt}
                        onVoiceFile={handleVoiceFile}
                        isRecording={isRecording}
                        startRecording={startRecording}
                        stopRecording={stopRecording}
                        rulesAccepted={voiceRulesAccepted}
                        setRulesAccepted={setVoiceRulesAccepted}
                        resetVoice={() => {
                          setVoiceFile(null);
                          setVoiceUrl(null);
                          setVoiceDuration(8);
                          setVoiceRulesAccepted(false);
                          setRecordError(null);
                        }}
                        recordError={recordError}
                    />
                )}

                {step === 3 && (
                    <Step3
                        track={selectedTrack}
                        prompt={coverPrompt}
                        setPrompt={setCoverPrompt}
                        generating={coverGenerating}
                        gradient={coverGradient}
                        onGenerate={generateCover}
                        customCoverUrl={customCoverUrl}
                        onCustomCover={handleCustomCover}
                        clearCustomCover={() => setCustomCoverUrl(null)}
                    />
                )}

                {step === 4 && (
                    <Step4
                        t={t}
                        lang={lang}
                        platforms={platforms}
                        togglePlatform={togglePlatform}
                        releaseDate={releaseDate}
                        setReleaseDate={setReleaseDate}
                        trackTitle={trackTitle}
                        setTrackTitle={setTrackTitle}
                        titleValid={titleValid}
                        titleRulesAccepted={titleRulesAccepted}
                        setTitleRulesAccepted={setTitleRulesAccepted}
                    />
                )}

                {step === 5 && (
                    <Step5
                        t={t}
                        lang={lang}
                        track={selectedTrack}
                        voiceFile={voiceFile}
                        voiceDuration={voiceDuration}
                        insertAt={insertAt}
                        trackLen={trackLen}
                        gradient={coverGradient}
                        platforms={platforms}
                        releaseDate={releaseDate}
                        trackTitle={trackTitle}
                    />
                )}
              </div>

              {/* Nav */}
              <div className="flex items-center justify-between mt-6">
                <Button
                    variant="ghost"
                    onClick={() => setStep((s) => Math.max(1, s - 1))}
                    disabled={step === 1}
                >
                  <ArrowLeft className="h-4 w-4" /> {t("cs.back")}
                </Button>
                {step < STEPS.length ? (
                    <Button
                        variant="hero"
                        size="lg"
                        onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
                        disabled={!canContinue}
                    >
                      {step === 2 && !hasVoice
                          ? t("cs.continueNoAudio")
                          : t("cs.continue")} <ArrowRight className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button variant="hero" size="lg">
                      <CreditCard className="h-4 w-4" /> {t("cs.confirmPay")}
                    </Button>
                )}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </>
  );
}

// ───────────────── Step 1 ─────────────────

function Step1(props: {
  genre: string;
  setGenre: (g: string) => void;
  mood: string;
  setMood: (m: string) => void;
  genres: string[];
  moods: string[];
  tracks: Track[];
  tracksLoading: boolean;
  selectedTrack: Track | null;
  onSelect: (t: Track) => void;
  previewId: string | null;
  setPreviewId: (id: string | null) => void;
  previewProgress: number;
  previewLoading: boolean;
  onSeekPreview: (fraction: number) => void;
  onContinue: () => void;
  onClearSelection: () => void;
}) {
  const {
    genre,
    setGenre,
    mood,
    setMood,
    genres,
    moods,
    tracks,
    tracksLoading,
    selectedTrack,
    onSelect,
    previewId,
    setPreviewId,
    previewProgress,
    previewLoading,
    onSeekPreview,
    onContinue,
    onClearSelection,
  } = props;
  const { t } = useI18n();

  const getGenreLabel = (value: string) => {
    const translated = t(`s1.genre.${value}`);
    return translated === `s1.genre.${value}` ? value : translated;
  };

  if (selectedTrack) {
    const playing = previewId === selectedTrack.id;
    return (
        <div className="animate-fade-up">
          <h2 className="text-2xl font-semibold tracking-tight mb-2">{t("s1.great")}</h2>
          <p className="text-muted-foreground mb-6">
            {t("s1.continueOrBack")}
          </p>

          <div className="rounded-3xl border border-primary bg-primary/10 shadow-[0_0_40px_oklch(0.7_0.22_295/0.25)] p-6 md:p-8 mb-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-accent mb-1.5">
                  {getGenreLabel(selectedTrack.genre)} · {selectedTrack.mood}
                </p>
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight truncate">
                  {selectedTrack.trackName}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5">{selectedTrack.artistName}</p>
                <p className="text-xs text-muted-foreground mt-1.5">{t("s1.duration")} · {selectedTrack.duration}</p>
              </div>
              <button
                  onClick={() => setPreviewId(playing ? null : selectedTrack.id)}
                  className="h-12 w-12 rounded-full bg-gradient-brand flex items-center justify-center shadow-[0_0_24px_oklch(0.7_0.22_295/0.5)] hover:scale-105 transition-transform shrink-0"
                  aria-label={playing ? "Pause preview" : "Play preview"}
              >
                {playing && previewLoading ? (
                    <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
                ) : playing ? (
                    <Pause className="h-5 w-5 text-primary-foreground fill-current" />
                ) : (
                    <Play className="h-5 w-5 text-primary-foreground fill-current ml-0.5" />
                )}
              </button>
            </div>
            <Waveform bars={48} animated={playing && !previewLoading} className="h-14" />
            {playing && (
                <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                      className="h-full bg-gradient-brand transition-[width] duration-150"
                      style={{ width: `${Math.round(previewProgress * 100)}%` }}
                  />
                </div>
            )}
            <div className="mt-5 inline-flex items-center gap-1.5 text-xs text-accent">
              <Check className="h-3.5 w-3.5" /> {t("s1.selectedForRelease")}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="hero" size="lg" className="w-full sm:flex-1" onClick={onContinue}>
              {t("cs.continue")} <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="glass" size="lg" className="w-full sm:flex-1" onClick={onClearSelection}>
              <ArrowLeft className="h-4 w-4" /> {t("s1.backToList")}
            </Button>
          </div>
        </div>
    );
  }

  return (
      <div className="animate-fade-up">
        <h2 className="text-2xl font-semibold tracking-tight mb-2">{t("s1.title")}</h2>
        <p className="text-muted-foreground mb-6">{t("s1.subtitle")}</p>

        <div className="space-y-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent mb-2">{t("s1.genre")}</p>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                  <button
                      key={g}
                      onClick={() => setGenre(g)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all ${
                          genre === g
                              ? "border-primary bg-primary/15 text-foreground"
                              : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                      }`}
                  >
                    {getGenreLabel(g)}
                  </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent mb-2">{t("s1.mood")}</p>
            <div className="flex flex-wrap gap-2">
              {moods.map((m) => (
                  <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all ${
                          mood === m
                              ? "border-primary bg-primary/15 text-foreground"
                              : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                      }`}
                  >
                    {m}
                  </button>
              ))}
            </div>
          </div>
        </div>

        {tracksLoading ? (
            <div className="text-center py-16 text-muted-foreground">
              Loading tracks...
            </div>
        ) : tracks.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              {t("s1.empty")}
            </div>
        ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tracks.map((tr) => {
                const playing = previewId === tr.id;
                return (
                    <div
                        key={tr.id}
                        className="group rounded-2xl p-5 border border-white/10 bg-white/[0.02] hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-accent mb-1">{getGenreLabel(tr.genre)} · {tr.mood}</p>
                          <h3 className="font-semibold tracking-tight">{tr.trackName}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{tr.artistName}</p>
                        </div>
                        <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewId(playing ? null : tr.id);
                            }}
                            className="h-9 w-9 rounded-full bg-gradient-brand flex items-center justify-center shadow-[0_0_18px_oklch(0.7_0.22_295/0.45)] hover:scale-105 transition-transform shrink-0"
                            aria-label={playing ? "Pause preview" : "Play preview"}
                        >
                          {playing && previewLoading ? (
                              <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                          ) : playing ? (
                              <Pause className="h-4 w-4 text-primary-foreground fill-current" />
                          ) : (
                              <Play className="h-4 w-4 text-primary-foreground fill-current ml-0.5" />
                          )}
                        </button>
                      </div>
                      <div
                          className={playing ? "cursor-pointer" : undefined}
                          onClick={(e) => {
                            if (!playing) return;
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            const fraction = (e.clientX - rect.left) / rect.width;
                            onSeekPreview(fraction);
                          }}
                      >
                        <Waveform bars={28} animated={playing && !previewLoading} className="h-10" />
                        {playing && (
                            <div className="mt-2 h-0.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                  className="h-full bg-gradient-brand transition-[width] duration-150"
                                  style={{ width: `${Math.round(previewProgress * 100)}%` }}
                              />
                            </div>
                        )}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-3 mb-3">
                        <span>{t("s1.preview")}</span>
                        <span>{tr.duration}</span>
                      </div>
                      <Button
                          variant="hero"
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(tr);
                          }}
                      >
                        <Check className="h-4 w-4" /> {t("s1.selectTrack")}
                      </Button>
                    </div>
                );
              })}
            </div>
        )}
      </div>
  );
}

// ───────────────── Step 2 ─────────────────

function Step2(props: {
  track: Track | null;
  voiceFile: File | null;
  voiceUrl: string | null;
  voiceDuration: number;
  insertAt: number;
  setInsertAt: (s: number) => void;
  onVoiceFile: (f: File) => void;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  rulesAccepted: boolean;
  setRulesAccepted: (v: boolean) => void;
  resetVoice: () => void;
  recordError: string | null;
}) {
  const {
    track, voiceFile, voiceUrl, voiceDuration, insertAt, setInsertAt,
    onVoiceFile, isRecording, startRecording, stopRecording,
    rulesAccepted, setRulesAccepted, resetVoice, recordError,
  } = props;
  const { t } = useI18n();
  const [rulesOpen, setRulesOpen] = useState(true);

  const trackLen = track?.durationSec ?? 180;

  return (
      <div className="animate-fade-up">
        <h2 className="text-2xl font-semibold tracking-tight mb-2">{t("s2.title")}</h2>
        <p className="text-muted-foreground mb-6">
          {t("s2.subtitlePre")} <span className="text-foreground font-medium">{track?.trackName ?? t("s2.yourTrack")}</span>.
        </p>

        <div className="grid md:grid-cols-2 gap-5 mb-8">
          {/* Upload */}
          <div className="border-2 border-dashed border-white/15 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-full glass flex items-center justify-center mx-auto mb-3">
              <Upload className="h-5 w-5 text-accent" />
            </div>
            <p className="font-medium mb-1">{t("s2.upload.title")}</p>
            <p className="text-xs text-muted-foreground mb-4">{t("s2.upload.formats")}</p>
            <label className="inline-block">
              <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onVoiceFile(f);
                  }}
              />
              <span className="inline-flex items-center gap-2 h-9 px-4 rounded-full text-xs font-medium glass cursor-pointer hover:bg-white/10 transition">
              {t("s2.upload.browse")}
            </span>
            </label>
          </div>

          {/* Record */}
          <div className="rounded-2xl p-8 text-center border border-white/10 bg-white/[0.02]">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 ${isRecording ? "bg-destructive/20 animate-pulse-glow" : "glass"}`}>
              <Mic className={`h-5 w-5 ${isRecording ? "text-destructive" : "text-accent"}`} />
            </div>
            <p className="font-medium mb-1">{isRecording ? t("s2.record.recording") : t("s2.record.title")}</p>
            <p className="text-xs text-muted-foreground mb-4">{t("s2.record.limit")}</p>
            {!isRecording ? (
                <Button variant="glass" size="sm" onClick={startRecording}>
                  {t("s2.record.start")}
                </Button>
            ) : (
                <Button variant="default" size="sm" onClick={stopRecording}>
                  {t("s2.record.stop")}
                </Button>
            )}
            {recordError && (
                <p className="text-xs text-destructive mt-3">{recordError}</p>
            )}
          </div>
        </div>

        {/* Preview + insertion */}
        {(voiceFile || isRecording) && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-accent mb-1">{t("s2.preview.eyebrow")}</p>
                  <p className="font-medium">
                    {voiceFile?.name || t("s2.preview.newRecording")} · {formatTime(voiceDuration)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={resetVoice}>
                  <RefreshCw className="h-4 w-4" /> {t("s2.preview.replace")}
                </Button>
              </div>

              {voiceUrl && (
                  <audio src={voiceUrl} controls className="w-full mb-6" />
              )}

              <p className="text-xs uppercase tracking-[0.2em] text-accent mb-3">
                {t("s2.preview.insertAt")}
              </p>

              {/* Visual track timeline with draggable insertion marker */}
              <div className="relative">
                <div className="relative h-24 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                  <Waveform bars={80} className="h-full opacity-60" />
                  {/* Voice clip overlay — proportional width */}
                  <div
                      className="absolute top-0 bottom-0 bg-gradient-brand/40 border-x-2 border-primary backdrop-blur-sm flex items-center justify-center"
                      style={{
                        left: `${(insertAt / trackLen) * 100}%`,
                        width: `${Math.min(100 - (insertAt / trackLen) * 100, (voiceDuration / trackLen) * 100)}%`,
                      }}
                  >
                    <Mic className="h-4 w-4 text-foreground" />
                  </div>
                </div>

                <input
                    type="range"
                    min={0}
                    max={Math.max(0, trackLen - voiceDuration)}
                    step={1}
                    value={insertAt}
                    onChange={(e) => setInsertAt(Number(e.target.value))}
                    className="w-full mt-4 accent-primary"
                />

                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>0:00</span>
                  <span className="text-foreground font-medium">
                {t("s2.preview.insertSummary")} {formatTime(insertAt)} → {t("s2.preview.endsAt")} {formatTime(insertAt + voiceDuration)}
              </span>
                  <span>{formatTime(trackLen)}</span>
                </div>
              </div>

              {/* Quick presets */}
              <div className="flex flex-wrap gap-2 mt-5">
                {[
                  { label: t("s2.preset.intro"), at: 0 },
                  { label: t("s2.preset.afterVerse"), at: Math.round(trackLen * 0.25) },
                  { label: t("s2.preset.midBridge"), at: Math.round(trackLen * 0.5) },
                  { label: t("s2.preset.beforeOutro"), at: Math.max(0, trackLen - voiceDuration - 12) },
                ].map((p) => (
                    <button
                        key={p.label}
                        onClick={() => setInsertAt(p.at)}
                        className="px-3 py-1.5 rounded-full text-xs border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 transition"
                    >
                      {p.label}
                    </button>
                ))}
              </div>
            </div>
        )}

        {/* Recording rules — only required when a voice clip exists */}
        {(voiceFile || isRecording) && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <Collapsible open={rulesOpen} onOpenChange={setRulesOpen}>
                <CollapsibleTrigger className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full glass flex items-center justify-center shrink-0">
                      <ShieldAlert className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t("s2.rules.title")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("s2.rules.subtitle")}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                          rulesOpen ? "rotate-180" : ""
                      }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-5 pb-5 space-y-4 text-sm text-muted-foreground">
                    <ul className="space-y-2 list-disc pl-5">
                      <li>{t("s2.rules.r1")}</li>
                      <li>{t("s2.rules.r2")}</li>
                      <li>{t("s2.rules.r3")}</li>
                      <li>{t("s2.rules.r4")}</li>
                      <li>{t("s2.rules.r5")}</li>
                      <li>{t("s2.rules.r6")}</li>
                      <li>{t("s2.rules.r7")}</li>
                    </ul>
                    <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 text-xs text-foreground/80 flex gap-2">
                      <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      <p>{t("s2.rules.disclaimer")}</p>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer pt-1">
                      <Checkbox
                          checked={rulesAccepted}
                          onCheckedChange={(v) => setRulesAccepted(v === true)}
                          className="mt-0.5"
                      />
                      <span className="text-sm text-foreground">
                    {t("s2.rules.accept")}
                  </span>
                    </label>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
        )}

        <p className="text-xs text-muted-foreground mt-6">
          {voiceFile || isRecording
              ? rulesAccepted
                  ? t("s2.status.accepted")
                  : t("s2.status.needAccept")
              : t("s2.status.optional")}
        </p>
      </div>
  );
}

// ───────────────── Step 3 ─────────────────

type CoverMode = "choice" | "generate" | "upload";

function Step3(props: {
  track: Track | null;
  prompt: string;
  setPrompt: (s: string) => void;
  generating: boolean;
  gradient: string | null;
  onGenerate: () => void;
  customCoverUrl: string | null;
  onCustomCover: (file: File) => void;
  clearCustomCover: () => void;
}) {
  const {
    track,
    prompt,
    setPrompt,
    generating,
    gradient,
    onGenerate,
    customCoverUrl,
    onCustomCover,
    clearCustomCover,
  } = props;
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [rulesOpen, setRulesOpen] = useState(true);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [mode, setMode] = useState<CoverMode>(() => {
    if (gradient) return "generate";
    if (customCoverUrl) return "upload";
    return "choice";
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onCustomCover(file);
    e.target.value = "";
  };

  const handleUploadClick = () => {
    if (!rulesAccepted) {
      setRulesOpen(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const goToChoice = () => {
    clearCustomCover();
    setMode("choice");
  };

  const switchToUpload = () => {
    clearCustomCover();
    setMode("upload");
  };

  const switchToGenerate = () => {
    clearCustomCover();
    setMode("generate");
  };

  const previewBlock = (
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-accent mb-2">{t("s3.preview")}</p>
        <div className="aspect-square rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center relative">
          {generating ? (
              <div className="text-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-accent" />
                {t("s3.painting")}
              </div>
          ) : customCoverUrl ? (
              <div className="absolute inset-0">
                <img
                    src={customCoverUrl}
                    alt={t("s3.uploadedAlt")}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/60 via-transparent">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">{track?.genre}</p>
                  <p className="text-xl font-semibold text-white tracking-tight">{track?.trackName}</p>
                </div>
              </div>
          ) : gradient ? (
              <div className="absolute inset-0" style={{ background: gradient }}>
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/60 via-transparent">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">{track?.genre}</p>
                  <p className="text-xl font-semibold text-white tracking-tight">{track?.trackName}</p>
                </div>
              </div>
          ) : (
              <div className="text-center text-muted-foreground p-8">
                <ImageIcon className="h-8 w-8 mx-auto mb-3 opacity-50" />
                {t("s3.yourCoverHere")}
              </div>
          )}
        </div>
      </div>
  );

  // ───── CHOICE: initial picker ─────
  if (mode === "choice" && !gradient && !customCoverUrl) {
    return (
        <div className="animate-fade-up">
          <h2 className="text-2xl font-semibold tracking-tight mb-2">{t("s3.choice.title")}</h2>
          <p className="text-muted-foreground mb-6">
            {t("s3.choice.desc.pre")}{" "}
            <span className="text-foreground font-medium">{track?.trackName ?? t("s3.yourTrack")}</span>.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <button
                onClick={() => setMode("generate")}
                className="group text-left p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/40 transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-brand flex items-center justify-center mb-4 shadow-[0_8px_24px_oklch(0.7_0.22_295/0.4)]">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <p className="font-semibold text-base mb-1">{t("s3.choice.generate.title")}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("s3.choice.generate.desc")}
              </p>
            </button>
            <button
                onClick={() => setMode("upload")}
                className="group text-left p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-accent/40 transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-accent" />
              </div>
              <p className="font-semibold text-base mb-1">{t("s3.choice.upload.title")}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("s3.choice.upload.desc")}
              </p>
            </button>
          </div>
        </div>
    );
  }

  // ───── GENERATE mode ─────
  if (mode === "generate") {
    return (
        <div className="animate-fade-up">
          <div className="flex items-center justify-between mb-2 gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">{t("s3.gen.title")}</h2>
            {!gradient && (
                <button
                    onClick={goToChoice}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 shrink-0"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> {t("s3.back")}
                </button>
            )}
          </div>
          <p className="text-muted-foreground mb-6">
            {t("s3.gen.desc.pre")}{" "}
            <span className="text-foreground font-medium">{track?.trackName ?? t("s3.yourTrack")}</span>.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              {!gradient && (
                  <>
                    <label className="block text-xs uppercase tracking-[0.2em] text-accent mb-2">
                      {t("s3.gen.label")}
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t("s3.gen.placeholder")}
                        className="w-full h-40 p-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none placeholder:text-muted-foreground text-sm"
                    />
                    <Button
                        variant="hero"
                        size="lg"
                        className="mt-4 w-full"
                        onClick={onGenerate}
                        disabled={generating}
                    >
                      {generating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> {t("s3.gen.generating")}
                          </>
                      ) : (
                          <>
                            <Sparkles className="h-4 w-4" /> {t("s3.gen.generate")}
                          </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      {t("s3.gen.tip")}
                    </p>
                  </>
              )}

              {gradient && (
                  <div className="space-y-3">
                    <div className="px-4 py-3 rounded-xl border border-primary/30 bg-primary/[0.06] text-xs text-muted-foreground">
                      <p className="text-foreground font-medium mb-1">{t("s3.gen.ready.title")}</p>
                      <p>{t("s3.gen.ready.desc")}</p>
                    </div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-accent mb-2 mt-4">
                      {t("s3.gen.label")}
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t("s3.gen.adjustPlaceholder")}
                        className="w-full h-28 p-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none placeholder:text-muted-foreground text-sm"
                    />
                    <Button
                        variant="hero"
                        size="lg"
                        className="w-full"
                        onClick={onGenerate}
                        disabled={generating}
                    >
                      {generating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> {t("s3.gen.generating")}
                          </>
                      ) : (
                          <>
                            <Sparkles className="h-4 w-4" /> {t("s3.gen.regenerate")}
                          </>
                      )}
                    </Button>
                    <Button
                        variant="glass"
                        size="lg"
                        className="w-full"
                        onClick={switchToUpload}
                    >
                      <Upload className="h-4 w-4" /> {t("s3.gen.switchUpload")}
                    </Button>
                  </div>
              )}
            </div>

            {previewBlock}
          </div>
        </div>
    );
  }

  // ───── UPLOAD mode ─────
  return (
      <div className="animate-fade-up">
        <div className="flex items-center justify-between mb-2 gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">{t("s3.up.title")}</h2>
          {!customCoverUrl && (
              <button
                  onClick={goToChoice}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 shrink-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> {t("s3.back")}
              </button>
          )}
        </div>
        <p className="text-muted-foreground mb-6">
          {t("s3.up.desc.pre")}{" "}
          <span className="text-foreground font-medium">{track?.trackName ?? t("s3.yourTrack")}</span>.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
            />

            {!customCoverUrl && (
                <>
                  <Collapsible open={rulesOpen} onOpenChange={setRulesOpen}>
                    <CollapsibleTrigger className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left">
                  <span className="flex items-center gap-2 text-xs">
                    <Info className="h-3.5 w-3.5 text-accent" />
                    <span className="font-medium">{t("s3.up.rulesToggle")}</span>
                  </span>
                      <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform ${rulesOpen ? "rotate-180" : ""}`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                      <div className="mt-2 px-4 py-4 rounded-xl border border-white/10 bg-white/[0.02] text-xs text-muted-foreground space-y-3 leading-relaxed">
                        <div>
                          <p className="text-foreground font-medium text-[13px] mb-1.5">{t("s3.up.rules.formatTitle")}</p>
                          <ul className="space-y-1.5 list-disc pl-4">
                            <li>{t("s3.up.rules.f1.a")} <span className="text-foreground">{t("s3.up.rules.f1.b")}</span> {t("s3.up.rules.f1.c")}</li>
                            <li>{t("s3.up.rules.f2.a")} <span className="text-foreground">{t("s3.up.rules.f2.b")}</span>{t("s3.up.rules.f2.c")}</li>
                            <li>{t("s3.up.rules.f3")}</li>
                            <li>{t("s3.up.rules.f4")}</li>
                            <li>{t("s3.up.rules.f5")}</li>
                          </ul>
                        </div>

                        <div className="rounded-lg border border-accent/30 bg-accent/[0.06] p-3">
                          <p className="text-foreground font-medium text-[13px] mb-1.5 flex items-center gap-1.5">
                            <ShieldAlert className="h-3.5 w-3.5 text-accent" />
                            {t("s3.up.rules.personalTitle")}
                          </p>
                          <ul className="space-y-1.5 list-disc pl-4">
                            <li><span className="text-foreground">{t("s3.up.rules.p1")}</span></li>
                            <li>{t("s3.up.rules.p2.a")} <span className="text-foreground">{t("s3.up.rules.p2.b")}</span> {t("s3.up.rules.p2.c")}</li>
                            <li>{t("s3.up.rules.p3")}</li>
                            <li>{t("s3.up.rules.p4")}</li>
                            <li>{t("s3.up.rules.p5")}</li>
                          </ul>
                        </div>

                        <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                          <Checkbox
                              checked={rulesAccepted}
                              onCheckedChange={(v) => setRulesAccepted(v === true)}
                              className="mt-0.5"
                          />
                          <span className="text-[12px] text-foreground leading-snug">
                        {t("s3.up.rules.accept")}
                      </span>
                        </label>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Button
                      variant="hero"
                      size="lg"
                      className="w-full mt-3"
                      onClick={handleUploadClick}
                      disabled={!rulesAccepted}
                      title={!rulesAccepted ? t("s3.up.acceptFirst") : undefined}
                  >
                    <Upload className="h-4 w-4" /> {t("s3.up.chooseImage")}
                  </Button>
                  {!rulesAccepted && (
                      <p className="text-[11px] text-muted-foreground mt-2 text-center">
                        {t("s3.up.enableHint")}
                      </p>
                  )}
                </>
            )}

            {customCoverUrl && (
                <div className="space-y-3">
                  <div className="px-4 py-3 rounded-xl border border-accent/30 bg-accent/[0.06] text-xs text-muted-foreground">
                    <p className="text-foreground font-medium mb-1">{t("s3.up.uploaded.title")}</p>
                    <p>{t("s3.up.uploaded.desc")}</p>
                  </div>
                  <Button
                      variant="glass"
                      size="lg"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" /> {t("s3.up.uploadDifferent")}
                  </Button>
                  <Button
                      variant="glass"
                      size="lg"
                      className="w-full"
                      onClick={switchToGenerate}
                  >
                    <Sparkles className="h-4 w-4" /> {t("s3.up.switchGenerate")}
                  </Button>
                  <button
                      onClick={goToChoice}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors block mx-auto pt-1"
                  >
                    {t("s3.up.removeStart")}
                  </button>
                </div>
            )}
          </div>

          {previewBlock}
        </div>
      </div>
  );
}

// ───────────────── Step 4 ─────────────────

function Step4(props: {
  t: (key: string) => string;
  lang: Lang;
  platforms: string[];
  togglePlatform: (id: string) => void;
  releaseDate: string;
  setReleaseDate: (d: string) => void;
  trackTitle: string;
  setTrackTitle: (t: string) => void;
  titleValid: boolean;
  titleRulesAccepted: boolean;
  setTitleRulesAccepted: (v: boolean) => void;
}) {
  const {
    t,
    lang,
    releaseDate,
    setReleaseDate,
    trackTitle,
    setTrackTitle,
    titleValid,
    titleRulesAccepted,
    setTitleRulesAccepted,
  } = props;
  const minDate = todayPlusDays(30);
  const trimmed = trackTitle.trim();
  const showTitleError = trackTitle.length > 0 && !titleValid;

  return (
      <div className="animate-fade-up">
        <h2 className="text-2xl font-semibold tracking-tight mb-2">{t("s4.title")}</h2>
        <p className="text-muted-foreground mb-6">
          {t("s4.subtitle")}
        </p>

        {/* Track title */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-accent mb-3">{t("s4.trackTitle")}</p>
          <div className="rounded-2xl border border-white/10 bg-white/2 p-5">
            <input
                type="text"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value.slice(0, 60))}
                placeholder={t("s4.titlePlaceholder")}
                maxLength={60}
                className="w-full bg-transparent text-base font-medium focus:outline-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center justify-between mt-2 text-xs">
            <span className={showTitleError ? "text-destructive" : "text-muted-foreground"}>
              {showTitleError ? t("s4.titleError") : t("s4.titleHelper")}
            </span>
              <span className="text-muted-foreground">{trimmed.length}/60</span>
            </div>
          </div>

          {/* Collapsible title rules — must be accepted to continue */}
          <Collapsible defaultOpen className="mt-3">
            <CollapsibleTrigger className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left group">
            <span className="flex items-center gap-2 text-xs">
              <Info className="h-3.5 w-3.5 text-accent" />
              <span className="font-medium">{t("s4.rulesToggle")}</span>
            </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
              <div className="mt-2 px-4 py-4 rounded-xl border border-white/10 bg-white/[0.02] text-xs text-muted-foreground space-y-3 leading-relaxed">
                <div>
                  <p className="text-foreground font-medium text-[13px] mb-1.5">{t("s4.rules.goodExamples")}</p>
                  <ul className="space-y-1 list-disc pl-4">
                    <li>{t("s4.rules.ex1")}</li>
                    <li>{t("s4.rules.ex2")}</li>
                    <li>{t("s4.rules.ex3")}</li>
                    <li>{t("s4.rules.ex4")}</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-accent/30 bg-accent/[0.06] p-3">
                  <p className="text-foreground font-medium text-[13px] mb-1.5 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-accent" />
                    {t("s4.rules.notAllowed")}
                  </p>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li>{t("s4.rules.na1")}</li>
                    <li>{t("s4.rules.na2")}</li>
                    <li>{t("s4.rules.na3")}</li>
                    <li>{t("s4.rules.na4")}</li>
                    <li>{t("s4.rules.na5")}</li>
                    <li>{t("s4.rules.na6")}</li>
                    <li>{t("s4.rules.na7")}</li>
                  </ul>
                </div>

                <p>{t("s4.rules.disclaimer")}</p>

                <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                  <Checkbox
                      checked={titleRulesAccepted}
                      onCheckedChange={(v) => setTitleRulesAccepted(v === true)}
                      className="mt-0.5"
                  />
                  <span className="text-[12px] text-foreground leading-snug">
                  {t("s4.rules.accept")}
                </span>
                </label>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-accent mb-3">{t("s4.releaseDate")}</p>
          <label
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex items-center gap-4 cursor-pointer hover:bg-white/[0.04] transition-colors relative"
              onClick={(e) => {
                const input = e.currentTarget.querySelector("input[type=date]") as HTMLInputElement | null;
                if (input && typeof input.showPicker === "function") {
                  try { input.showPicker(); } catch { /* noop */ }
                }
              }}
          >
            <div className="h-11 w-11 rounded-full glass flex items-center justify-center shrink-0">
              <CalendarDays className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <input
                  type="date"
                  min={minDate}
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="bg-transparent text-base font-medium focus:outline-none w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t("s4.earliest")} {formatPrettyDate(minDate, lang)}
              </p>
            </div>
          </label>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full glass flex items-center justify-center shrink-0">
              <Music2 className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="font-medium mb-1">{t("s4.allPlatforms.title")}</p>
              <p className="text-sm text-muted-foreground">
                {t("s4.allPlatforms.desc")}
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}

// ───────────────── Step 5 ─────────────────

function Step5(props: {
  t: (key: string) => string;
  lang: Lang;
  track: Track | null;
  voiceFile: File | null;
  voiceDuration: number;
  insertAt: number;
  trackLen: number;
  gradient: string | null;
  platforms: string[];
  releaseDate: string;
  trackTitle: string;
}) {
  const { t, lang, track, voiceFile, voiceDuration, insertAt, gradient, platforms, releaseDate, trackTitle } = props;

  const platformNames = PLATFORMS.filter((p) => platforms.includes(p.id)).map((p) => p.name).join(", ");
  const total = 49;
  const displayTitle = trackTitle.trim() || track?.trackName || "—";

  return (
      <div className="animate-fade-up">
        <h2 className="text-2xl font-semibold tracking-tight mb-2">{t("s5.title")}</h2>
        <p className="text-muted-foreground mb-8">
          {t("s5.subtitle")}
        </p>

        <div className="grid md:grid-cols-[200px_1fr] gap-6 mb-8">
          <div
              className="aspect-square rounded-2xl border border-white/10 overflow-hidden relative"
              style={gradient ? { background: gradient } : { background: "var(--gradient-brand)" }}
          >
            <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 via-transparent">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">{track?.genre}</p>
              <p className="text-base font-semibold text-white tracking-tight leading-tight">{displayTitle}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <SummaryRow label={t("s5.releaseTitle")} value={displayTitle} />
            <SummaryRow label={t("s5.instrumental")} value={track ? `${track.trackName} · ${track.genre} · ${track.duration}` : "—"} />
            <SummaryRow
                label={t("s5.voiceMessage")}
                value={voiceFile ? `${formatTime(voiceDuration)} · ${t("s5.insertedAt")} ${formatTime(insertAt)}` : t("s5.notIncluded")}
            />
            <SummaryRow label={t("s5.coverArtwork")} value={gradient ? t("s5.aiGenerated") : t("s5.defaultCover")} />
            <SummaryRow label={t("s5.streamingPlatforms")} value={platformNames || "—"} />
            <SummaryRow label={t("s5.releaseDate")} value={formatPrettyDate(releaseDate, lang)} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent mb-1">{t("s5.total")}</p>
            <p className="text-3xl font-semibold tracking-tight">${total}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("s5.paymentNote")}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium mb-1">{t("s5.thankYou")}</p>
            <p className="text-xs text-muted-foreground max-w-[220px]">
              {t("s5.giftNote")}
            </p>
          </div>
        </div>
      </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
      <div className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-right font-medium">{value}</span>
      </div>
  );
}
