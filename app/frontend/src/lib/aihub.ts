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
}: StreamGenTxtParams): Promise<{ content: string }> {
  const baseUrl = getAPIBaseURL().replace(/\/$/, "");
  let fullContent = "";

  try {
    const response = await fetch(`${baseUrl}/api/v1/aihub/gentxt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, model, stream: true }),
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
      buffer += decoder.decode(value, { stream: true });

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
    const error = err instanceof Error ? err : new Error(String(err));
    onError?.(error);
    throw error;
  }
}
