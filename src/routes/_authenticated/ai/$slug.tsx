import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Send, Sparkles, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getCopilot, COPILOTS } from "@/lib/copilots";
import { listConversations, getConversation, deleteConversation } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/ai/$slug")({
  head: ({ params }) => {
    const c = getCopilot(params.slug);
    return { meta: [{ title: `${c?.name ?? "AI Copilot"} — Bluechip CareerOS™` }] };
  },
  component: CopilotChat,
});

type Msg = { id: string; role: string; content: string };

function CopilotChat() {
  const { slug } = Route.useParams();
  const copilot = getCopilot(slug);
  if (!copilot) throw notFound();
  const qc = useQueryClient();
  const listFn = useServerFn(listConversations);
  const getFn = useServerFn(getConversation);
  const delFn = useServerFn(deleteConversation);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamBuf, setStreamBuf] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const convQuery = useQuery({
    queryKey: ["ai-conversations", slug],
    queryFn: () => listFn({ data: { copilotSlug: slug } }),
  });

  useEffect(() => {
    if (conversationId) {
      getFn({ data: { conversationId } }).then((m) => setMessages(m as Msg[]));
    } else {
      setMessages([]);
    }
  }, [conversationId, getFn]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamBuf]);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    setStreaming(true);
    setStreamBuf("");
    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", content: text };
    setMessages((m) => [...m, userMsg]);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Not signed in");

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ copilotSlug: slug, conversationId, message: text }),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || `Error ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let assistantText = "";
      let newConvId: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const events = buf.split("\n\n");
        buf = events.pop() || "";
        for (const evt of events) {
          const lines = evt.split("\n");
          let eventName = "message";
          let dataStr = "";
          for (const ln of lines) {
            if (ln.startsWith("event: ")) eventName = ln.slice(7).trim();
            else if (ln.startsWith("data: ")) dataStr += ln.slice(6);
          }
          if (!dataStr) continue;
          try {
            const json = JSON.parse(dataStr);
            if (eventName === "meta" && json.conversationId) {
              newConvId = json.conversationId;
            } else if (eventName === "message" || eventName === "data") {
              if (json.delta) {
                assistantText += json.delta;
                setStreamBuf(assistantText);
              }
            }
          } catch {
            // skip
          }
        }
      }

      if (newConvId && !conversationId) setConversationId(newConvId);
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", content: assistantText }]);
      setStreamBuf("");
      qc.invalidateQueries({ queryKey: ["ai-conversations", slug] });
    } catch (e: any) {
      toast.error(e?.message || "Chat failed");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  };

  const newChat = () => {
    setConversationId(null);
    setMessages([]);
    setStreamBuf("");
  };

  const removeConv = async (id: string) => {
    await delFn({ data: { conversationId: id } });
    if (id === conversationId) newChat();
    qc.invalidateQueries({ queryKey: ["ai-conversations", slug] });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6 h-[calc(100vh-5rem)]">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col gap-3 shrink-0">
        <Link to="/ai" className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
          <ArrowLeft className="size-3" /> AI Hub
        </Link>
        <button onClick={newChat} className="bg-gradient-brand text-white rounded-xl py-3 text-sm font-bold inline-flex items-center justify-center gap-2">
          <Plus className="size-4" /> New conversation
        </button>
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-2">History</div>
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {(convQuery.data ?? []).map((c: any) => (
            <div key={c.id} className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer ${c.id === conversationId ? "bg-electric/10 text-foreground" : "hover:bg-muted/50 text-muted-foreground"}`}
              onClick={() => setConversationId(c.id)}>
              <span className="flex-1 truncate">{c.title}</span>
              <button onClick={(e) => { e.stopPropagation(); removeConv(c.id); }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
          {(convQuery.data ?? []).length === 0 && (
            <div className="text-xs text-muted-foreground italic px-3 py-2">No conversations yet.</div>
          )}
        </div>
      </aside>

      {/* Chat */}
      <section className="flex-1 flex flex-col glass rounded-2xl border overflow-hidden">
        <header className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="size-10 rounded-lg bg-gradient-brand grid place-items-center">
            <Sparkles className="size-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg">{copilot.name}</h1>
            <p className="text-xs text-muted-foreground">{copilot.tagline}</p>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && !streamBuf && (
            <div className="text-center text-muted-foreground mt-20">
              <p className="text-sm">Start the conversation. {copilot.name} is calibrated and ready.</p>
            </div>
          )}
          {messages.map((m) => (
            <MessageBubble key={m.id} role={m.role} content={m.content} />
          ))}
          {streamBuf && <MessageBubble role="assistant" content={streamBuf} streaming />}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="border-t border-border p-4 flex gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={streaming}
            placeholder={`Message ${copilot.name}…`}
            className="flex-1 bg-background/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric/60"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="bg-gradient-brand text-white rounded-xl px-5 font-bold text-sm inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="size-4" /> Send
          </button>
        </form>
      </section>
    </div>
  );
}

function MessageBubble({ role, content, streaming }: { role: string; content: string; streaming?: boolean }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${isUser ? "bg-gradient-brand text-white" : "bg-muted/40 border border-border"}`}>
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none prose-p:my-2 prose-headings:font-display">
            <ReactMarkdown>{content}</ReactMarkdown>
            {streaming && <span className="inline-block size-2 rounded-full bg-electric animate-pulse ml-1" />}
          </div>
        )}
      </div>
    </div>
  );
}

export { COPILOTS };
