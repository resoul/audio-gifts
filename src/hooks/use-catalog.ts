import { useQuery } from "@tanstack/react-query";
import { fetchGenres, fetchMoods, fetchSongs } from "@/lib/supabase";

const CATALOG_STALE_TIME = 1000 * 60 * 30;
const CATALOG_GC_TIME = 1000 * 60 * 60;

export function useGenres() {
    return useQuery({
        queryKey: ["genres"],
        queryFn: fetchGenres,
        staleTime: CATALOG_STALE_TIME,
        gcTime: CATALOG_GC_TIME,
    });
}

export function useMoods() {
    return useQuery({
        queryKey: ["moods"],
        queryFn: fetchMoods,
        staleTime: CATALOG_STALE_TIME,
        gcTime: CATALOG_GC_TIME,
    });
}

export function useSongs(params: { genreId?: string | null; moodId?: string | null }) {
    return useQuery({
        queryKey: ["songs", params.genreId ?? null, params.moodId ?? null],
        queryFn: () => fetchSongs(params),
        staleTime: 1000 * 60 * 5, // 5 минут
    });
}