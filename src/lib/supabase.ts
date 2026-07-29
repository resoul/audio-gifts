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
