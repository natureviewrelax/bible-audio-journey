// Cliente da API própria (Node + SQLite). Expõe uma interface parecida com a do
// supabase-js para os serviços existentes continuarem simples.
const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const TOKEN_KEY = "bible_api_token";

export interface ApiUser {
  id: string;
  email: string;
  created_at?: string;
}
export interface ApiSession {
  access_token: string;
  user: ApiUser;
}
type ApiError = { message: string } | null;
type Result<T> = { data: T; error: ApiError };
type Listener = (event: string, session: ApiSession | null) => void;

const listeners = new Set<Listener>();
const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
const setToken = (t: string | null) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
};
const emit = (event: string, session: ApiSession | null) => listeners.forEach((l) => l(event, session));

async function request(path: string, init: RequestInit = {}) {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

type Filter = [string, string, unknown];

class QueryBuilder implements PromiseLike<Result<any>> {
  private op = "select";
  private filters: Filter[] = [];
  private values: unknown;
  private orderBy: [string, boolean][] = [];
  private mode: "many" | "single" | "maybe" = "many";

  constructor(private table: string) {}

  select(_cols?: string) { return this; }
  insert(values: unknown) { this.op = "insert"; this.values = values; return this; }
  upsert(values: unknown) { this.op = "upsert"; this.values = values; return this; }
  update(values: unknown) { this.op = "update"; this.values = values; return this; }
  delete() { this.op = "delete"; return this; }
  eq(col: string, val: unknown) { this.filters.push([col, "eq", val]); return this; }
  neq(col: string, val: unknown) { this.filters.push([col, "neq", val]); return this; }
  order(col: string, opts?: { ascending?: boolean }) { this.orderBy.push([col, opts?.ascending !== false]); return this; }
  single() { this.mode = "single"; return this; }
  maybeSingle() { this.mode = "maybe"; return this; }

  private async run(): Promise<Result<any>> {
    try {
      const { ok, body } = await request(`/api/db/${this.table}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: this.op, filters: this.filters, values: this.values, order: this.orderBy }),
      });
      if (!ok) return { data: null, error: body?.error ?? { message: "Erro na API" } };
      const rows: any[] = body.data ?? [];
      if (this.mode === "many") return { data: rows, error: null };
      if (this.mode === "maybe") return { data: rows[0] ?? null, error: null };
      return rows.length === 1
        ? { data: rows[0], error: null }
        : { data: null, error: { message: `Esperada 1 linha, recebidas ${rows.length}` } };
    } catch (e) {
      return { data: null, error: { message: (e as Error).message } };
    }
  }

  then<R1 = Result<any>, R2 = never>(
    onfulfilled?: ((value: Result<any>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ) {
    return this.run().then(onfulfilled, onrejected);
  }
}

const auth = {
  async getSession(): Promise<{ data: { session: ApiSession | null } }> {
    const token = getToken();
    if (!token) return { data: { session: null } };
    const { ok, body } = await request("/api/auth/me");
    if (!ok) { setToken(null); return { data: { session: null } }; }
    return { data: { session: { access_token: token, user: body.user } } };
  },
  async getUser(): Promise<{ data: { user: ApiUser | null } }> {
    const { data } = await auth.getSession();
    return { data: { user: data.session?.user ?? null } };
  },
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    return auth.credentials("/api/auth/login", "SIGNED_IN", email, password);
  },
  async signUp({ email, password }: { email: string; password: string }) {
    return auth.credentials("/api/auth/signup", "SIGNED_IN", email, password);
  },
  async credentials(path: string, event: string, email: string, password: string) {
    const { ok, body } = await request(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!ok) return { error: (body?.error ?? { message: "Erro de autenticação" }) as ApiError };
    setToken(body.token);
    emit(event, { access_token: body.token, user: body.user });
    return { error: null as ApiError };
  },
  async signOut() {
    setToken(null);
    emit("SIGNED_OUT", null);
  },
  onAuthStateChange(cb: Listener) {
    listeners.add(cb);
    return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } };
  },
};

const storage = {
  from(_bucket: string) {
    return {
      async upload(path: string, file: File) {
        const form = new FormData();
        form.append("path", path);
        form.append("file", file);
        const { ok, body } = await request("/api/storage/upload", { method: "POST", body: form });
        return ok
          ? { data: { path: body.path as string }, error: null }
          : { data: null, error: (body?.error ?? { message: "Falha no upload" }) as ApiError };
      },
      getPublicUrl(path: string) {
        return { data: { publicUrl: `${API_URL}/uploads/${encodeURIComponent(path)}` } };
      },
    };
  },
};

export const api = {
  from: (table: string) => new QueryBuilder(table),
  auth,
  storage,
};
