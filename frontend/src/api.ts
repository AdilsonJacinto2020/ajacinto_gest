// Ligação ao servidor (que guarda tudo na base de dados).
// O endereço vem da variável VITE_API_URL, definida na Vercel no projecto do frontend.
const configured = ((import.meta as any).env?.VITE_API_URL as string | undefined) || "";
export const API_BASE = (configured || "http://localhost:4000").replace(/\/+$/, "");

export class ApiError extends Error {}

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Chama o servidor e devolve o JSON. Se o servidor não responder ou recusar o pedido,
 * lança um erro com a mensagem a mostrar ao utilizador. Nunca finge que gravou.
 */
export async function api<T = any>(path: string, opts: ApiOptions = {}): Promise<T> {
  const hasBody = opts.body !== undefined;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: opts.method ?? (hasBody ? "POST" : "GET"),
      // Só envia Content-Type quando há corpo (evita pedidos extra de verificação nos GET)
      headers: { ...(hasBody ? { "Content-Type": "application/json" } : {}), ...(opts.headers || {}) },
      body: hasBody ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError("Sem ligação ao servidor. Nada foi guardado.");
  } finally {
    clearTimeout(timer);
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* resposta sem corpo */
  }

  if (!res.ok) {
    const m = data?.message;
    throw new ApiError(Array.isArray(m) ? m.join(" ") : m || `O servidor recusou o pedido (erro ${res.status}).`);
  }
  return data as T;
}
