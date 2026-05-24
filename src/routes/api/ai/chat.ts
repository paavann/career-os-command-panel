import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { getCopilot } from "@/lib/copilots";

export const Route = createFileRoute("/api/ai/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = authHeader.slice(7);

        const SUPABASE_URL = process.env.SUPABASE_URL!;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
        const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: userData, error: userErr } = await supabase.auth.getUser(token);
        if (userErr || !userData.user) return new Response("Unauthorized", { status: 401 });
        const userId = userData.user.id;

        let body: { copilotSlug?: string; conversationId?: string; message?: string };
        try {
          body = await request.json();
        } catch {
          return new Response("Bad request", { status: 400 });
        }

        const copilotSlug = String(body.copilotSlug || "");
        const message = String(body.message || "").trim();
        if (!message || message.length > 8000) return new Response("Invalid message", { status: 400 });

        const copilot = getCopilot(copilotSlug);
        if (!copilot) return new Response("Unknown copilot", { status: 404 });

        // Get or create conversation
        let conversationId = body.conversationId;
        if (!conversationId) {
          const { data: conv, error: convErr } = await supabase
            .from("ai_conversations")
            .insert({ user_id: userId, copilot_slug: copilotSlug, title: message.slice(0, 60) })
            .select("id")
            .single();
          if (convErr || !conv) return new Response("Failed to create conversation", { status: 500 });
          conversationId = conv.id;
        }

        // Load prior messages
        const { data: prior } = await supabase
          .from("ai_messages")
          .select("role, content")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true })
          .limit(40);

        // Save user message
        await supabase.from("ai_messages").insert({
          conversation_id: conversationId,
          user_id: userId,
          role: "user",
          content: message,
        });

        const messages = [
          { role: "system", content: copilot.systemPrompt },
          ...(prior || []).map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: message },
        ];

        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
        if (!LOVABLE_API_KEY) return new Response("AI Gateway not configured", { status: 500 });

        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages,
            stream: true,
          }),
        });

        if (aiRes.status === 429) return new Response("Rate limit reached. Try again shortly.", { status: 429 });
        if (aiRes.status === 402) return new Response("AI credits exhausted. Add credits in Lovable settings.", { status: 402 });
        if (!aiRes.ok || !aiRes.body) {
          const errText = await aiRes.text().catch(() => "");
          return new Response(`AI error: ${errText}`, { status: 500 });
        }

        // Pipe SSE through, accumulate assistant text, save on close
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        let assistantText = "";
        let leftover = "";

        const stream = new ReadableStream({
          async start(controller) {
            // First, send the conversation id as a meta event
            controller.enqueue(encoder.encode(`event: meta\ndata: ${JSON.stringify({ conversationId })}\n\n`));

            const reader = aiRes.body!.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = leftover + decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");
                leftover = lines.pop() || "";
                for (const line of lines) {
                  if (!line.startsWith("data: ")) continue;
                  const data = line.slice(6).trim();
                  if (data === "[DONE]") continue;
                  try {
                    const json = JSON.parse(data);
                    const delta = json.choices?.[0]?.delta?.content;
                    if (delta) {
                      assistantText += delta;
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
                    }
                  } catch {
                    // ignore
                  }
                }
              }
              // persist final assistant message
              if (assistantText) {
                await supabase.from("ai_messages").insert({
                  conversation_id: conversationId,
                  user_id: userId,
                  role: "assistant",
                  content: assistantText,
                });
                await supabase
                  .from("ai_conversations")
                  .update({ updated_at: new Date().toISOString() })
                  .eq("id", conversationId);
              }
              controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
            } catch (e) {
              controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: String(e) })}\n\n`));
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
