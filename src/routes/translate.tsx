import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Loader2, Sparkles, Volume2, Languages, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type TranslateResult = {
  gloss: string;
  sentence: string;
  confidence: "low" | "medium" | "high";
  language: "en" | "ms";
};

export const Route = createFileRoute("/translate")({
  head: () => ({
    meta: [
      { title: "Translate · VoiceLink BIM" },
      {
        name: "description",
        content:
          "Real-time Malaysian Sign Language (BIM) to speech translator powered by on-device camera and AI.",
      },
    ],
  }),
  component: TranslatePage,
});

function TranslatePage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [language, setLanguage] = useState<"en" | "ms">("en");
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [history, setHistory] = useState<TranslateResult[]>([]);
  const [cooldown, setCooldown] = useState(0);
  const lastCallRef = useRef(0);

  // Cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  // Start camera
  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 960 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraReady(true);
      } catch (e) {
        console.error(e);
        setError(
          "Camera access denied. Please grant permission in your browser settings to translate signs.",
        );
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const speak = useCallback((text: string, lang: "en" | "ms") => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang === "ms" ? "ms-MY" : "en-US";
      utter.rate = 1;
      utter.pitch = 1.05;
      window.speechSynthesis.speak(utter);
      if ("vibrate" in navigator) navigator.vibrate?.(40);
    } catch (e) {
      console.error("TTS error", e);
    }
  }, []);

  const captureAndTranslate = useCallback(async () => {
    if (!videoRef.current || !cameraReady || busy) return;
    // Enforce a 4s minimum gap between calls to avoid Lovable AI rate limits.
    const now = Date.now();
    const sinceLast = now - lastCallRef.current;
    const MIN_GAP = 6000;
    if (sinceLast < MIN_GAP) {
      setCooldown(Math.ceil((MIN_GAP - sinceLast) / 1000));
      return;
    }
    lastCallRef.current = now;
    setBusy(true);
    setError(null);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current ?? document.createElement("canvas");
      canvasRef.current = canvas;
      const w = Math.min(video.videoWidth || 640, 720);
      const h = Math.round((w * (video.videoHeight || 480)) / (video.videoWidth || 640));
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.drawImage(video, 0, 0, w, h);
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.78);

      const { data, error: fnError } = await supabase.functions.invoke("translate-sign", {
        body: { imageDataUrl, targetLanguage: language },
      });
      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      const r = data as TranslateResult;
      setResult(r);
      setHistory((prev) => [r, ...prev].slice(0, 6));
      if (r.sentence) speak(r.sentence, r.language);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      // If the gateway still rate-limited us, force a longer cooldown.
      if (/rate limit|too many/i.test(msg)) setCooldown(8);
    } finally {
      setBusy(false);
    }
  }, [busy, cameraReady, language, speak]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen pb-8">
        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-4 pb-3">
          <button
            onClick={() => navigate({ to: "/" })}
            aria-label="Back to home"
            className="h-10 w-10 rounded-xl bg-card shadow-card flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold text-primary">Live BIM Translator</span>
          </div>
          <button
            onClick={() => setLanguage((l) => (l === "en" ? "ms" : "en"))}
            aria-label="Toggle output language"
            className="h-10 px-3 rounded-xl bg-card shadow-card flex items-center gap-1.5"
          >
            <Languages className="h-4 w-4 text-foreground" />
            <span className="text-xs font-bold text-foreground uppercase">{language}</span>
          </button>
        </header>

        {/* Camera viewport */}
        <section className="px-5">
          <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-gradient-camera shadow-glow">
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 h-full w-full object-cover -scale-x-100"
            />
            {/* Frame guides */}
            <div className="pointer-events-none absolute inset-4 rounded-[1.6rem] border-2 border-white/30" />
            <div className="pointer-events-none absolute top-6 left-6 right-6 flex items-center justify-between">
              <span className="flex items-center gap-1.5 rounded-full bg-card/90 backdrop-blur-md px-3 py-1.5 shadow-card">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${cameraReady ? "bg-success" : "bg-warm"} animate-pulse`}
                />
                <span className="text-[11px] font-semibold text-foreground">
                  {cameraReady ? "Camera Live" : "Starting…"}
                </span>
              </span>
              {result && (
                <span className="rounded-full bg-primary/95 px-3 py-1.5 text-[10px] font-bold text-primary-foreground uppercase">
                  {result.confidence}
                </span>
              )}
            </div>

            {/* Overlay caption bubble */}
            {(result || busy || error) && (
              <div className="absolute inset-x-4 bottom-4">
                <div className="rounded-2xl bg-card/95 backdrop-blur-xl p-4 shadow-glow">
                  {busy && (
                    <div className="flex items-center gap-3 text-foreground">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-sm font-semibold">Reading your signs…</span>
                    </div>
                  )}
                  {!busy && error && (
                    <p className="text-sm font-semibold text-destructive">{error}</p>
                  )}
                  {!busy && !error && result && (
                    <div>
                      {result.gloss && (
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Gloss · {result.gloss}
                        </p>
                      )}
                      <p className="mt-1 text-lg font-extrabold text-foreground leading-tight">
                        {result.sentence || "No clear sign detected. Try again in frame."}
                      </p>
                      {result.sentence && (
                        <button
                          onClick={() => speak(result.sentence, result.language)}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"
                        >
                          <Volume2 className="h-3.5 w-3.5" /> Speak again
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Capture button */}
        <section className="px-5 mt-6">
          <button
            onClick={captureAndTranslate}
            disabled={!cameraReady || busy || cooldown > 0}
            aria-label="Capture sign and translate"
            className="w-full group flex items-center justify-center gap-3 rounded-2xl bg-gradient-primary text-primary-foreground py-4 shadow-glow transition-spring hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Camera className="h-5 w-5" strokeWidth={2.5} />
            )}
            <span className="font-bold">
              {busy ? "Translating…" : cooldown > 0 ? `Wait ${cooldown}s…` : "Capture & Translate"}
            </span>
            <Zap className="h-4 w-4 fill-current text-warm" />
          </button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground font-medium">
            Tip: keep your hands visible inside the frame, signing at natural speed.
          </p>
        </section>

        {/* History */}
        {history.length > 0 && (
          <section className="px-5 mt-6">
            <h2 className="text-sm font-bold text-foreground mb-2">This session</h2>
            <ul className="space-y-2">
              {history.map((h, i) => (
                <li
                  key={i}
                  className="rounded-2xl bg-card p-3 shadow-card flex items-start gap-3"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{h.sentence}</p>
                    {h.gloss && (
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                        {h.gloss} · {h.language.toUpperCase()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => speak(h.sentence, h.language)}
                    aria-label="Play translation"
                    className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="px-5 mt-8 text-center">
          <Link
            to="/listen"
            className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
          >
            Switch to Listen mode (Speech → Captions) →
          </Link>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
