import { getAPIBaseURL } from "@/lib/config";

export interface AiChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface StreamGenTxtParams {
  messages: AiChatMessage[];
  model?: string;
  onChunk?: (chunk: { content: string }) => void;
  onComplete?: (result: { content: string }) => void;
  onError?: (error: Error) => void;
  /**
   * Fired once if no data has arrived within `slowConnectionMs` — a useful
   * signal to show a "waking up the server..." hint, since Render's free
   * tier can take 30-60s to cold-start after being idle. Not an error by
   * itself; the request keeps waiting up to `timeoutMs`.
   */
  onSlowConnection?: () => void;
  /** Hard ceiling for the whole request before it's aborted. Default 100s —
   * generous enough to cover a Render free-tier cold start plus a full
   * generation, but bounded so a genuinely stuck request fails with a clear
   * error instead of spinning forever. */
  timeoutMs?: number;
  /** How long to wait with no bytes received before firing onSlowConnection. */
  slowConnectionMs?: number;
}

/**
 * Streams a chat completion from CyberShield's own backend
 * (POST {API_BASE_URL}/api/v1/aihub/gentxt), which emits Server-Sent Events
 * shaped as `data: {"content": "..."}`, terminated by `data: [DONE]`.
 *
 * We hit this endpoint directly with `fetch` instead of going through
 * `@metagptx/web-sdk`'s `client.ai.gentxt` — that SDK's browser streaming
 * path hardcodes a same-origin relative URL and ignores any configured
 * baseURL/env var, which breaks as soon as the frontend (Vercel) and
 * backend (Render) live on different domains.
 */
export async function streamGenTxt({
  messages,
  model = "llama-3.3-70b-versatile",
  onChunk,
  onComplete,
  onError,
  onSlowConnection,
  timeoutMs = 100_000,
  slowConnectionMs = 8_000,
}: StreamGenTxtParams): Promise<{ content: string }> {
  const baseUrl = getAPIBaseURL().replace(/\/$/, "");
  let fullContent = "";

  const controller = new AbortController();
  const hardTimeout = setTimeout(() => controller.abort(), timeoutMs);
  const slowTimer = onSlowConnection ? setTimeout(onSlowConnection, slowConnectionMs) : undefined;
  const clearSlowTimer = () => {
    if (slowTimer) clearTimeout(slowTimer);
  };

  try {
    const response = await fetch(`${baseUrl}/api/v1/aihub/gentxt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, model, stream: true }),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      clearSlowTimer();
      // sse_starlette (the backend's SSE library) separates events with
      // "\r\n\r\n" (CRLF+CRLF), not "\n\n" — normalize to LF so the split
      // below matches regardless of which line ending arrives.
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

      // SSE events are separated by a blank line; keep any trailing partial
      // event in the buffer until more bytes arrive.
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const rawEvent of events) {
        for (const line of rawEvent.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (!data || data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (typeof parsed.content === "string") {
              if (parsed.content.startsWith("[ERROR]")) {
                throw new Error(parsed.content);
              }
              fullContent += parsed.content;
              onChunk?.({ content: parsed.content });
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message.startsWith("[ERROR]")) {
              throw parseErr;
            }
            // Ignore malformed/partial JSON chunks
          }
        }
      }
    }

    const result = { content: fullContent };
    onComplete?.(result);
    return result;
  } catch (err) {
    const isAbort = err instanceof DOMException && err.name === "AbortError";
    const error = isAbort
      ? new Error("Request timed out. The server may be slow to respond right now — please try again.")
      : err instanceof Error
        ? err
        : new Error(String(err));
    onError?.(error);
    throw error;
  } finally {
    clearTimeout(hardTimeout);
    clearSlowTimer();

  }
}
