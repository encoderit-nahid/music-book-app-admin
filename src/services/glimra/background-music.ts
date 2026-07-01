import { api } from "@/axios";
import type { BackgroundMusic, Single } from "@/types/glimra";

export interface BackgroundMusicPayload {
  name: string;
  volume?: number;
  chapter_ids?: string[];
  file?: File | null;
}

/** Build FormData so the audio file can ride along with the fields. */
function toFormData(data: Partial<BackgroundMusicPayload>, method?: "PUT") {
  const fd = new FormData();
  if (method) fd.append("_method", method);
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      if (value.length === 0) fd.append(`${key}[]`, "");
      else value.forEach((v) => fd.append(`${key}[]`, String(v)));
    } else if (value instanceof File) fd.append(key, value);
    else fd.append(key, String(value));
  });
  return fd;
}

export const backgroundMusicService = {
  /** Tracks used within a specific book (chapter_ids scoped to that book). */
  listByBook: async (bookId: string) => {
    const res = await api.get<{ data: BackgroundMusic[] }>(`/admin/books/${bookId}/background-musics`);
    return res.data;
  },
  /** The full shared library, for picking an existing track. */
  library: async () => {
    const res = await api.get<{ data: BackgroundMusic[] }>(`/admin/background-musics`);
    return res.data;
  },
  /** Upload a new track and assign it to the book's chapters. */
  create: async (bookId: string, data: Partial<BackgroundMusicPayload>) => {
    const res = await api.post<Single<BackgroundMusic>>(`/admin/books/${bookId}/background-musics`, toFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  /** Update a track and/or (re)assign it within the book's chapters. */
  update: async (bookId: string, id: string, data: Partial<BackgroundMusicPayload>) => {
    const res = await api.post<Single<BackgroundMusic>>(`/admin/books/${bookId}/background-musics/${id}`, toFormData(data, "PUT"), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  /** Remove a track from this book (keeps it in the library). */
  remove: async (bookId: string, id: string) => {
    await api.delete(`/admin/books/${bookId}/background-musics/${id}`);
  },

  /** Upload a new track straight into the shared library. */
  libraryCreate: async (data: Partial<BackgroundMusicPayload>) => {
    const res = await api.post<Single<BackgroundMusic>>(`/admin/background-musics`, toFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  /** Update a library track's details (no chapter assignment). */
  libraryUpdate: async (id: string, data: Partial<BackgroundMusicPayload>) => {
    const res = await api.post<Single<BackgroundMusic>>(`/admin/background-musics/${id}`, toFormData(data, "PUT"), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  /** Delete a track from the library entirely (releases all chapters). */
  libraryRemove: async (id: string) => {
    await api.delete(`/admin/background-musics/${id}`);
  },
};
