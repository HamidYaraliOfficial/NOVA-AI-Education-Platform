"use client";

import { useRef, useState } from "react";
import { Bot, Lightbulb, ListChecks, Send, Sparkles, User } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";
import { aiTutorApi } from "@/lib/api-client";

const QUICK_ACTIONS = [
  { key: "explain", label: "Explain", icon: Lightbulb },
  { key: "example", label: "Give example", icon: Sparkles },
  { key: "quiz", label: "Quiz me", icon: ListChecks }
];

export function AiTutorChat({ courseId, lessonId }: { courseId: string; lessonId: string | null }) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your NOVA AI Tutor. Ask me anything about this lesson — I can explain, give examples, quiz you, or review your work.",
      createdAt: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const { answer } = await aiTutorApi.ask(courseId, lessonId, text);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: answer, createdAt: new Date().toISOString() }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "I couldn't reach the NOVA AI service right now. Once the backend and RAG index are running, I'll answer using this course's actual material.",
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
      queueMicrotask(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }));
    }
  }

  return (
    <Card className="flex h-[560px] flex-col">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="h-4.5 w-4.5" />
        </div>
        <div>
          <div className="text-sm font-semibold">NOVA AI Tutor</div>
          <div className="text-[11px] text-muted-foreground">Context-aware · Socratic mode available</div>
        </div>
      </div>

      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex gap-2.5", m.role === "user" && "flex-row-reverse")}>
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                m.role === "user" ? "bg-muted" : "bg-primary/10 text-primary"
              )}
            >
              {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-3.5 py-2.5 text-sm",
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-muted-foreground ps-9">NOVA is thinking…</div>}
      </div>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.key}
              onClick={() => send(qa.label)}
              className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs hover:bg-muted"
            >
              <qa.icon className="h-3 w-3" />
              {qa.label}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("aiTutor.placeholder")}
            className="flex-1 rounded-md border border-input bg-surface px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" size="icon" disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
