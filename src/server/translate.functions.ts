import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const TranslateInput = z.object({
  // base64 data URL of a JPEG/PNG frame from the camera
  imageDataUrl: z.string().min(32).max(8_000_000),
  targetLanguage: z.enum(["en", "ms"]).default("en"),
});

export type TranslateResult = {
  gloss: string;
  sentence: string;
  confidence: "low" | "medium" | "high";
  language: "en" | "ms";
};

export const translateSignFrame = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TranslateInput.parse(input))
  .handler(async ({ data }): Promise<TranslateResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const langName = data.targetLanguage === "ms" ? "Bahasa Malaysia" : "English";

    const systemPrompt = `You are an expert interpreter for Bahasa Isyarat Malaysia (BIM, Malaysian Sign Language).
You analyze a single video frame from a webcam showing a signer.
1) Identify the signed gloss(es) you can detect (hand shape, location, motion cues).
2) Convert the raw glosses into a natural, grammatically correct ${langName} sentence.
3) Estimate confidence based on clarity and visibility.
If no clear sign is visible, return gloss "" and a friendly prompt sentence asking the user to sign clearly within frame.`;

    const body = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Translate this BIM sign frame into ${langName}. Reply via the tool.`,
            },
            { type: "image_url", image_url: { url: data.imageDataUrl } },
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "return_translation",
            description: "Return the BIM gloss and the natural sentence translation.",
            parameters: {
              type: "object",
              properties: {
                gloss: {
                  type: "string",
                  description: "Raw BIM gloss(es) detected, uppercase tokens joined by space.",
                },
                sentence: {
                  type: "string",
                  description: `Natural ${langName} sentence.`,
                },
                confidence: { type: "string", enum: ["low", "medium", "high"] },
              },
              required: ["gloss", "sentence", "confidence"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "return_translation" } },
    };

    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.status === 429) {
      throw new Error("Rate limit reached. Please slow down and try again in a moment.");
    }
    if (res.status === 402) {
      throw new Error("AI credits exhausted. Add funds in Settings → Workspace → Usage.");
    }
    if (!res.ok) {
      const text = await res.text();
      console.error("Lovable AI error", res.status, text);
      throw new Error(`Translation failed (${res.status})`);
    }

    const json = await res.json();
    const toolCall = json?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return a structured translation.");
    }

    let parsed: { gloss: string; sentence: string; confidence: "low" | "medium" | "high" };
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      throw new Error("Could not parse AI response.");
    }

    return {
      gloss: parsed.gloss ?? "",
      sentence: parsed.sentence ?? "",
      confidence: parsed.confidence ?? "low",
      language: data.targetLanguage,
    };
  });
