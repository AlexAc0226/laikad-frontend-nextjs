import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function useLaikadAI() {
  const [loading, setLoading] = useState(false);

  async function askAI(messages: Message[]) {
    setLoading(true);

    const token = localStorage.getItem("accessToken");

    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ messages }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      throw new Error(data?.error || "Request failed");
    }

    return data.text as string;
  }

  return { askAI, loading };
}
