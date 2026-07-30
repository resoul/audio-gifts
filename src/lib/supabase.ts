import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase =
    supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey)
        : null;

type ContactInsertPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type MoodOption = {
  id: string;
  name: string;
  position: number | null;
};

type GenreOption = {
  id: string;
  name: string;
  position: number | null;
};

type SongOption = {
  id: string;
  trackName: string | null;
  artistName: string | null;
  genre_id: string | null;
  mood_id: string | null;
  duration: number | null;
  sort: number | null;
  start_time: number | null;
  endpoint: string | null;
};

export type OrderInsertPayload = {
  track_id?: number | null;
  track_name?: string | null;
  artist_name?: string | null;
  genre?: string | null;
  mood?: string | null;
  release_title?: string | null;
  voice_file_path?: string | null;
  cover_file_path?: string | null;
  voice_duration?: number | null;
  insert_at?: number | null;
  platforms?: string[] | null;
  release_date?: string | null;
  total_amount?: number | null;
  status?: string | null;
};

export function getAudioUrl(endpoint: string | null | undefined): string | null {
  if (!endpoint || !supabase) return null;
  const { data } = supabase.storage.from("audio").getPublicUrl(endpoint);
  return data?.publicUrl ?? null;
}

export async function createContact(payload: ContactInsertPayload) {
  if (!supabase) {
    throw new Error(
        "Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }

  const { error } = await supabase.from("contacts").insert([payload]);

  if (error) {
    throw error;
  }
}

export async function uploadOrderAsset(file: File, orderId: string, kind: "voice" | "cover") {
  if (!supabase) {
    throw new Error(
        "Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }

  const isVoiceAsset = kind === "voice";
  const normalizedName = isVoiceAsset
      ? (file.name.toLowerCase().endsWith(".mp3")
          ? file.name
          : `${file.name.replace(/\.[^.]+$/, "")}.mp3`)
      : file.name;
  const extension = (normalizedName.split(".").pop() || (isVoiceAsset ? "mp3" : "bin")).replace(/[^a-zA-Z0-9.-]/g, "");
  const fileName = `${orderId}/${kind}-${Date.now()}.${extension}`;
  const uploadFile = isVoiceAsset
      ? new File([file], normalizedName, {
          type: file.type === "audio/webm" ? "audio/mpeg" : file.type || "audio/mpeg",
        })
      : file;
  const { data, error } = await supabase.storage.from("order").upload(fileName, uploadFile, {
    cacheControl: "3600",
    upsert: false,
    contentType: uploadFile.type || (isVoiceAsset ? "audio/mpeg" : "application/octet-stream"),
  });

  if (error) {
    throw error;
  }

  return data?.path ?? fileName;
}

export async function createOrder(payload: OrderInsertPayload) {
  if (!supabase) {
    throw new Error(
        "Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }

  const { data, error } = await supabase.from("order").insert([payload]).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateOrder(id: string | number, payload: Partial<OrderInsertPayload>) {
  if (!supabase) {
    throw new Error(
        "Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }

  const { data, error } = await supabase.from("order").update(payload).eq("id", id).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchMoods(): Promise<MoodOption[]> {
  if (!supabase) {
    throw new Error(
        "Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }

  const { data, error } = await supabase
      .from("moods")
      .select("id, name, position")
      .order("position", { ascending: true })
      .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as MoodOption[];
}

export async function fetchGenres(): Promise<GenreOption[]> {
  if (!supabase) {
    throw new Error(
        "Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }

  const { data, error } = await supabase
      .from("genres")
      .select("id, name, position")
      .order("position", { ascending: true })
      .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as GenreOption[];
}

export async function fetchSongs(params?: { genreId?: string | null; moodId?: string | null }) {
  if (!supabase) {
    throw new Error(
        "Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }

  let query = supabase
      .from("songs")
      .select("id, trackName, artistName, genre_id, mood_id, duration, sort, start_time, endpoint")
      .order("sort", { ascending: true });

  if (params?.genreId) {
    query = query.eq("genre_id", params.genreId);
  }

  if (params?.moodId) {
    query = query.eq("mood_id", params.moodId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as SongOption[];
}
