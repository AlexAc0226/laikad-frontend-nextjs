"use client";

import { useState } from "react";
import { useLaikadAI } from "@/hooks/useLaikadAI";

export default function AiTestButton() {
  const { askAI, loading } = useLaikadAI();
  const [response, setResponse] = useState("");

  async function testAI() {
    const reply = await askAI([
      {
        role: "user",
        content:
          "Escribime un mail corto para pedirle a un publisher más volumen de tráfico en una campaña CPA.",
      },
    ]);

    setResponse(reply);
  }

  return (
    <div style={{ padding: 12, border: "1px solid #2b2b2b", borderRadius: 8, marginBottom: 16 }}>
      <button onClick={testAI} disabled={loading} style={{ padding: 10, border: "1px solid black" }}>
        {loading ? "Pensando..." : "Probar IA"}
      </button>

      {response && (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>
          {response}
        </pre>
      )}
    </div>
  );
}
