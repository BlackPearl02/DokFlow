/**
 * NO FILE STORAGE — data only in memory, cleared after export or TTL.
 * No logs of file contents. Uploaded file data is never written to disk or DB.
 *
 * Store is attached to globalThis so it survives Next.js dev recompiles
 * (otherwise in-memory Map would be lost when /map or /api/session are compiled).
 */

const TTL_MS = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export interface SessionData {
  rawRows: string[][];
  headerRowIndex: number;
  fileName: string;
  createdAt: number;
}

const GLOBAL_KEY = "__dokflow_session_store";

declare global {
  var __dokflow_session_store: Map<string, SessionData> | undefined;
}

const store = ((): Map<string, SessionData> => {
  if (typeof globalThis === "undefined") return new Map();
  const g = globalThis as unknown as Record<string, Map<string, SessionData> | undefined>;
  if (g[GLOBAL_KEY]) return g[GLOBAL_KEY]!;
  const m = new Map<string, SessionData>();
  g[GLOBAL_KEY] = m;
  return m;
})();

export function set(sessionId: string, data: SessionData): void {
  store.set(sessionId, data);
}

export function get(sessionId: string): SessionData | undefined {
  return store.get(sessionId);
}

export function remove(sessionId: string): boolean {
  return store.delete(sessionId);
}

export function update(sessionId: string, updates: Partial<SessionData>): boolean {
  const session = store.get(sessionId);
  if (!session) return false;
  store.set(sessionId, { ...session, ...updates });
  return true;
}

function cleanup(): void {
  const now = Date.now();
  Array.from(store.entries()).forEach(([id, data]) => {
    if (now - data.createdAt > TTL_MS) store.delete(id);
  });
}

if (typeof setInterval !== "undefined") {
  setInterval(cleanup, CLEANUP_INTERVAL_MS);
}
