"use client";

import { Button } from "@upkick/ui/components/button";
import { useState } from "react";

import { consumeAiCredits } from "./ai-credits";

export function AiCreditDemo() {
  const [message, setMessage] = useState<string | null>(null);

  async function handleUse() {
    try {
      const result = await consumeAiCredits({
        amount: 10,
      });

      setMessage(`10 credits used. Remaining: ${result.remaining}`);
    } catch (error) {
      if (error instanceof Error && error.message === "INSUFFICIENT_AI_CREDITS") {
        setMessage("You do not have enough AI credits.");

        return;
      }

      setMessage("Unable to consume AI credits.");
    }
  }

  return (
    <div className="space-y-3">
      <Button type="button" onClick={handleUse}>
        Use 10 AI Credits
      </Button>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
