// Translate a BIM sign frame into English or Bahasa Malaysia using Lovable AI Gateway.
// Uses Gemini 2.5 Flash multimodal vision + structured tool-calling.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { imageDataUrl, targetLanguage } = await req.json();
    if (typeof imageDataUrl !== "string" || imageDataUrl.length < 32) {
      return new Response(
        JSON.stringify({ error: "Invalid image payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const lang = targetLanguage === "ms" ? "ms" : "en";
    const langName = lang === "ms" ? "Bahasa Malaysia" : "English";

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
            { type: "image_url", image_url: { url: imageDataUrl } },
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

    // Retry once with backoff on 429 to smooth over short bursts.
    let res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 1500));
      res = await fetch(GATEWAY_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    }

    if (res.status === 429) {
      // Return 200 so supabase-js doesn't throw; client handles the soft error.
      return new Response(
        JSON.stringify({
          error: "Too many translations in a short time. Wait a few seconds and try again.",
          retry: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (res.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!res.ok) {
      const text = await res.text();
      console.error("Lovable AI error", res.status, text);
      return new Response(
        JSON.stringify({ error: `Translation failed (${res.status})` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const json = await res.json();
    const toolCall = json?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(
        JSON.stringify({ error: "AI did not return a structured translation." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let parsed: { gloss: string; sentence: string; confidence: "low" | "medium" | "high" };
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      return new Response(
        JSON.stringify({ error: "Could not parse AI response." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        gloss: parsed.gloss ?? "",
        sentence: parsed.sentence ?? "",
        confidence: parsed.confidence ?? "low",
        language: lang,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("translate-sign error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
