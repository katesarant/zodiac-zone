/**
 * Local-only library storage (charts, folders, notes).
 *
 * Everything lives in the browser under a single versioned localStorage key.
 * Nothing is sent to the server. All reads are SSR-safe and never throw.
 *
 * IMPORTANT: never call these during render — call them inside useEffect
 * (or an event handler) and hold the result in state, otherwise SSR and the
 * first client render disagree and React reports a hydration mismatch.
 */

export const LIBRARY_KEY = "astroxartes:library:v1";
export const LIBRARY_VERSION = 1;

export type SavedChart = {
  id: string;
  label: string;
  isFavorite: boolean;
  folderId: string | null;
  birthDate: string; // yyyy-mm-dd
  birthTime: string; // HH:mm
  birthPlace: string;
  lat: number;
  lon: number;
  tz: string;
  chartJson: unknown;
  createdAt: string;
  updatedAt: string;
};

export type Folder = { id: string; name: string; color?: string };

export type Note = {
  id: string;
  chartId: string | null; // null = standalone note
  title?: string;
  body: string;
  updatedAt: string;
};

export type Library = {
  version: number;
  charts: SavedChart[];
  folders: Folder[];
  notes: Note[];
};

export type NewChart = Omit<SavedChart, "id" | "createdAt" | "updatedAt" | "isFavorite" | "folderId"> &
  Partial<Pick<SavedChart, "id" | "isFavorite" | "folderId" | "createdAt" | "updatedAt">>;

export type NewNote = Omit<Note, "id" | "updatedAt"> & Partial<Pick<Note, "id" | "updatedAt">>;

function emptyLibrary(): Library {
  return { version: LIBRARY_VERSION, charts: [], folders: [], notes: [] };
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function newId(): string {
  try {
    if (isBrowser() && typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/** Read the whole library. Returns an empty library on server, parse error or unknown version. */
export function getLibrary(): Library {
  if (!isBrowser()) return emptyLibrary();
  try {
    const raw = window.localStorage.getItem(LIBRARY_KEY);
    if (!raw) return emptyLibrary();
    const parsed = JSON.parse(raw) as Partial<Library> | null;
    if (!parsed || typeof parsed !== "object") return emptyLibrary();
    if (parsed.version !== LIBRARY_VERSION) return emptyLibrary();
    return {
      version: LIBRARY_VERSION,
      charts: asArray<SavedChart>(parsed.charts),
      folders: asArray<Folder>(parsed.folders),
      notes: asArray<Note>(parsed.notes),
    };
  } catch {
    return emptyLibrary();
  }
}

/** Overwrite the whole library. Returns false when storage is unavailable or full. */
export function replaceLibrary(next: Library): boolean {
  if (!isBrowser()) return false;
  try {
    const safe: Library = {
      version: LIBRARY_VERSION,
      charts: asArray<SavedChart>(next.charts),
      folders: asArray<Folder>(next.folders),
      notes: asArray<Note>(next.notes),
    };
    window.localStorage.setItem(LIBRARY_KEY, JSON.stringify(safe));
    return true;
  } catch {
    return false;
  }
}

/** Validates an unknown parsed JSON payload as a library backup. */
export function parseLibraryBackup(
  raw: unknown,
): { ok: true; library: Library } | { ok: false; reason: "shape" | "version" } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, reason: "shape" };
  const obj = raw as Partial<Library>;
  if (typeof obj.version !== "number") return { ok: false, reason: "shape" };
  if (!Array.isArray(obj.charts) || !Array.isArray(obj.notes) || !Array.isArray(obj.folders)) {
    return { ok: false, reason: "shape" };
  }
  if (obj.version !== LIBRARY_VERSION) return { ok: false, reason: "version" };
  return {
    ok: true,
    library: {
      version: LIBRARY_VERSION,
      charts: asArray<SavedChart>(obj.charts),
      folders: asArray<Folder>(obj.folders),
      notes: asArray<Note>(obj.notes),
    },
  };
}

/** Merges an imported library into the current one. Existing ids win; no duplicates. */
export function mergeLibrary(incoming: Library): Library {
  return mutate((lib) => {
    const chartIds = new Set(lib.charts.map((c) => c.id));
    for (const c of incoming.charts) if (c?.id && !chartIds.has(c.id)) lib.charts.push(c);

    const folderIds = new Set(lib.folders.map((f) => f.id));
    for (const f of incoming.folders) if (f?.id && !folderIds.has(f.id)) lib.folders.push(f);

    const noteIds = new Set(lib.notes.map((n) => n.id));
    for (const n of incoming.notes) if (n?.id && !noteIds.has(n.id)) lib.notes.push(n);
  });
}

function mutate(fn: (lib: Library) => void): Library {
  const lib = getLibrary();
  try {
    fn(lib);
  } catch {
    return lib;
  }
  replaceLibrary(lib);
  return lib;
}

/* ---------------------------------- charts --------------------------------- */

export function listCharts(): SavedChart[] {
  return getLibrary().charts;
}

export function getChart(id: string): SavedChart | null {
  return getLibrary().charts.find((c) => c.id === id) ?? null;
}

export function saveChart(input: NewChart): SavedChart {
  const stamp = now();
  const chart: SavedChart = {
    id: input.id ?? newId(),
    label: input.label,
    isFavorite: input.isFavorite ?? false,
    folderId: input.folderId ?? null,
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    birthPlace: input.birthPlace,
    lat: input.lat,
    lon: input.lon,
    tz: input.tz,
    chartJson: input.chartJson,
    createdAt: input.createdAt ?? stamp,
    updatedAt: stamp,
  };
  mutate((lib) => {
    const index = lib.charts.findIndex((c) => c.id === chart.id);
    if (index >= 0) lib.charts[index] = chart;
    else lib.charts.unshift(chart);
  });
  return chart;
}

export function updateChart(id: string, patch: Partial<Omit<SavedChart, "id" | "createdAt">>): SavedChart | null {
  let updated: SavedChart | null = null;
  mutate((lib) => {
    const index = lib.charts.findIndex((c) => c.id === id);
    if (index < 0) return;
    const merged: SavedChart = { ...lib.charts[index]!, ...patch, id, updatedAt: now() };
    lib.charts[index] = merged;
    updated = merged;
  });
  return updated;
}

export function deleteChart(id: string): void {
  mutate((lib) => {
    lib.charts = lib.charts.filter((c) => c.id !== id);
    lib.notes = lib.notes.filter((n) => n.chartId !== id);
  });
}

export function toggleFavorite(id: string): boolean {
  const current = getChart(id);
  if (!current) return false;
  const next = !current.isFavorite;
  updateChart(id, { isFavorite: next });
  return next;
}

/* --------------------------------- folders --------------------------------- */

export function listFolders(): Folder[] {
  return getLibrary().folders;
}

export function createFolder(name: string, color?: string): Folder {
  const folder: Folder = color === undefined ? { id: newId(), name } : { id: newId(), name, color };
  mutate((lib) => {
    lib.folders.push(folder);
  });
  return folder;
}

export function renameFolder(id: string, name: string, color?: string): Folder | null {
  let updated: Folder | null = null;
  mutate((lib) => {
    const index = lib.folders.findIndex((f) => f.id === id);
    if (index < 0) return;
    const merged: Folder = { ...lib.folders[index]!, name, ...(color === undefined ? {} : { color }) };
    lib.folders[index] = merged;
    updated = merged;
  });
  return updated;
}

/** Deletes the folder; its charts become unfiled (folderId = null). */
export function deleteFolder(id: string): void {
  mutate((lib) => {
    lib.folders = lib.folders.filter((f) => f.id !== id);
    lib.charts = lib.charts.map((c) => (c.folderId === id ? { ...c, folderId: null, updatedAt: now() } : c));
  });
}

/* ---------------------------------- notes ---------------------------------- */

export function listNotes(chartId?: string | null): Note[] {
  const notes = getLibrary().notes;
  if (chartId === undefined) return notes;
  return notes.filter((n) => n.chartId === chartId);
}

export function saveNote(input: NewNote): Note {
  const note: Note = {
    id: input.id ?? newId(),
    chartId: input.chartId ?? null,
    ...(input.title === undefined ? {} : { title: input.title }),
    body: input.body,
    updatedAt: now(),
  };
  mutate((lib) => {
    const index = lib.notes.findIndex((n) => n.id === note.id);
    if (index >= 0) lib.notes[index] = note;
    else lib.notes.unshift(note);
  });
  return note;
}

export function deleteNote(id: string): void {
  mutate((lib) => {
    lib.notes = lib.notes.filter((n) => n.id !== id);
  });
}
