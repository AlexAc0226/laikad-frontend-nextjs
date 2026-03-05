"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  TextField,
  Typography,
  CircularProgress,
  Button,
  Divider,
} from "@mui/material";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";

type Role = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function CopilotChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: "assistant",
      content:
        "Hi! I'm Laikad Copilot. Tell me what you need: summaries, insights, or help with campaigns.",
      createdAt: Date.now(),
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  const context = useMemo(() => {
    // MVP context: route only (después le metemos filtros y métricas)
    return {
      route: pathname,
      // podés agregar acá advertiserId, dateRange, etc cuando lo tengas
    };
  }, [pathname]);

  useEffect(() => {
    // autoscroll al final
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const onToggle = () => setOpen((v) => !v);

  const clearChat = () => {
    setMessages([
      {
        id: uid(),
        role: "assistant",
        content:
          "Chat cleared. What do you want to analyze or write?",
        createdAt: Date.now(),
      },
    ]);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // ⚠️ Endpoint: ajustá si tu API es distinta
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map(({ role, content }) => ({ role, content })),
            { role: "user", content: text },
          ],
          context,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || `Request failed (${res.status})`);
      }

      const data = await res.json();

      // Soportamos varias formas de respuesta para no depender del shape exacto:
      // - { reply: "..." }
      // - { message: "..." }
      // - { content: "..." }
      // - { choices: [{ message: { content: "..." } }] } (OpenAI style)
      const reply =
        data?.reply ??
        data?.message ??
        data?.content ??
        data?.choices?.[0]?.message?.content;

      if (!reply || typeof reply !== "string") {
        throw new Error("Invalid AI response shape");
      }

      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: reply,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      console.error(e);
      toast.error("Copilot error. Check API /api/ai/chat");
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content:
            "Sorry — I couldn't generate a response. Please try again or check the API.",
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <Box
        sx={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 2000,
        }}
      >
        <IconButton
          onClick={onToggle}
          sx={{
            width: 56,
            height: 56,
            borderRadius: "999px",
            boxShadow: "0 10px 30px rgba(0,0,0,.25)",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            "&:hover": { bgcolor: "primary.dark" },
          }}
          aria-label="Open Copilot"
        >
          <ChatBubbleLeftRightIcon width={22} height={22} />
        </IconButton>
      </Box>

      {/* Drawer */}
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: { xs: 340, sm: 420 }, height: "100vh", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Laikad Copilot
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Route: {context.route}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button size="small" variant="outlined" onClick={clearChat}>
                Clear
              </Button>
              <IconButton onClick={() => setOpen(false)} aria-label="Close Copilot">
                <XMarkIcon width={18} height={18} />
              </IconButton>
            </Box>
          </Box>

          <Divider />

          {/* Messages */}
          <Box
            ref={listRef}
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 2,
              py: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1.25,
            }}
          >
            {messages.map((m) => (
              <Box
                key={m.id}
                sx={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "88%",
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: m.role === "user" ? "primary.main" : "grey.100",
                  color: m.role === "user" ? "primary.contrastText" : "text.primary",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                <Typography variant="body2">{m.content}</Typography>
              </Box>
            ))}

            {loading && (
              <Box sx={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 1, px: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                  Thinking…
                </Typography>
              </Box>
            )}
          </Box>

          <Divider />

          {/* Quick prompts */}
          <Box sx={{ px: 2, pt: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {[
              "Summarize this dashboard",
              "Spot anomalies",
              "What should we scale?",
              "Write an email to a client",
            ].map((p) => (
              <Button
                key={p}
                size="small"
                variant="outlined"
                onClick={() => setInput(p)}
              >
                {p}
              </Button>
            ))}
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask Copilot…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              multiline
              maxRows={4}
            />
            <Button variant="contained" onClick={sendMessage} disabled={loading || !input.trim()}>
              Send
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}