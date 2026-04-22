import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Mic, MicOff, Sparkles, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/listen")({
  head: () => ({
    meta: [
      { title: "Listen · VoiceLink BIM" },
      {
        name: "description",
        content:
          "Real-time speech-to-caption mode for DHH students. See teachers and peers in large, easy-to-read bubbles.",
      },
    ],
  }),
  component: ListenPage,
});

// Browser SpeechRecognition typings shim
type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: { transcript: string };
};
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

function ListenPage() {
  const navigate = useNavigate();
  const recognitionRef = useRef<{ stop: () => void; start: () => void } | null>(null);
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [bubbles, setBubbles] = useState<{ id: number; text: string; ts: number }[]>([]);
  const [language, setLanguage] = useState<"en-US" | "ms-MY">("en-US");
  const [error, setError] = useState<string | null>(null);
  const myNameRef = useRef<string>(
    (typeof window !== "undefined" && localStorage.getItem("voicelink:name")) || "",
  );
  const [myName, setMyName] = useState<string>(myNameRef.current);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR =
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
    }
  }, []);

  const start = useCallback(() => {
    if (typeof window === "undefined") return;
    const SR =
      (window as unknown as { SpeechRecognition?: new () => unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown })
        .webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rec: any = new (SR as new () => unknown)();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = language;
      rec.onresult = (e: SpeechRecognitionEventLike) => {
        let finalText = "";
        let interimText = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          const transcript = r[0].transcript;
          if (r.isFinal) finalText += transcript;
          else interimText += transcript;
        }
        if (finalText) {
          const text = finalText.trim();
          if (text) {
            setBubbles((prev) =>
              [{ id: Date.now() + Math.random(), text, ts: Date.now() }, ...prev].slice(0, 12),
            );
            // Haptic feedback if user's name is mentioned
            if (
              myName &&
              text.toLowerCase().includes(myName.toLowerCase()) &&
              "vibrate" in navigator
            ) {
              navigator.vibrate?.([80, 40, 80]);
            }
          }
          setInterim("");
        } else {
          setInterim(interimText);
        }
      };
      rec.onerror = (ev: { error?: string }) => {
        console.warn("SR error", ev?.error);
        if (ev?.error === "not-allowed" || ev?.error === "service-not-allowed") {
          setError("Microphone permission denied. Enable it in your browser to use Listen mode.");
          setListening(false);
        }
      };
      rec.onend = () => {
        // auto-restart if user still wants to listen
        if (recognitionRef.current && listening) {
          try {
            rec.start();
          } catch {
            /* ignore */
          }
        }
      };
      rec.start();
      recognitionRef.current = rec;
      setListening(true);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Could not start speech recognition.");
    }
  }, [language, listening, myName]);

  const stop = useCallback(() => {
    setListening(false);
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setInterim("");
  }, []);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen pb-8">
        <header className="flex items-center justify-between px-5 pt-4 pb-3">
          <button
            onClick={() => navigate({ to: "/" })}
            aria-label="Back to home"
            className="h-10 w-10 rounded-xl bg-card shadow-card flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-bold text-accent-foreground">Listen Mode</span>
          </div>
          <button
            onClick={() => setLanguage((l) => (l === "en-US" ? "ms-MY" : "en-US"))}
            aria-label="Toggle input language"
            className="h-10 px-3 rounded-xl bg-card shadow-card flex items-center"
          >
            <span className="text-xs font-bold text-foreground uppercase">
              {language === "en-US" ? "EN" : "MS"}
            </span>
          </button>
        </header>

        <section className="px-5">
          <div className="rounded-2xl bg-card p-4 shadow-card">
            <label
              htmlFor="myname"
              className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              My name (for haptic alerts)
            </label>
            <input
              id="myname"
              type="text"
              value={myName}
              onChange={(e) => {
                setMyName(e.target.value);
                if (typeof window !== "undefined")
                  localStorage.setItem("voicelink:name", e.target.value);
              }}
              placeholder="e.g. Aisha"
              className="mt-1 w-full bg-transparent text-base font-bold text-foreground outline-none border-b-2 border-border focus:border-primary py-1 transition-colors"
            />
          </div>
        </section>

        {!supported && (
          <section className="px-5 mt-4">
            <div className="rounded-2xl bg-warm/30 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warm-foreground shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-warm-foreground">
                Speech recognition is not supported in this browser. Try Chrome or Edge on
                Android/desktop.
              </p>
            </div>
          </section>
        )}

        {error && (
          <section className="px-5 mt-4">
            <div className="rounded-2xl bg-destructive/10 p-4">
              <p className="text-sm font-semibold text-destructive">{error}</p>
            </div>
          </section>
        )}

        {/* Captions feed */}
        <section className="px-5 mt-5 space-y-3">
          {interim && (
            <div className="rounded-3xl bg-primary/10 border-2 border-dashed border-primary/40 p-4">
              <p className="text-xl font-bold text-primary leading-tight">{interim}…</p>
            </div>
          )}
          {bubbles.length === 0 && !interim && (
            <div className="rounded-3xl bg-card p-6 shadow-card text-center">
              <Mic className="h-10 w-10 text-muted-foreground mx-auto" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-semibold text-muted-foreground">
                {listening
                  ? "Listening… speak naturally."
                  : "Tap the mic to start live captions."}
              </p>
            </div>
          )}
          {bubbles.map((b, idx) => {
            const isHighlight = !!myName && b.text.toLowerCase().includes(myName.toLowerCase());
            return (
              <div
                key={b.id}
                className={`rounded-3xl p-5 shadow-card transition-spring ${
                  isHighlight
                    ? "bg-gradient-warm shadow-warm"
                    : idx === 0
                      ? "bg-card"
                      : "bg-card/70"
                }`}
              >
                {isHighlight && (
                  <p className="text-[10px] font-bold uppercase tracking-wider text-warm-foreground mb-1">
                    Your name was called
                  </p>
                )}
                <p
                  className={`font-extrabold leading-tight ${
                    isHighlight ? "text-warm-foreground text-2xl" : "text-foreground text-xl"
                  }`}
                >
                  {b.text}
                </p>
              </div>
            );
          })}
        </section>

        {/* Mic toggle */}
        <div className="fixed bottom-6 inset-x-0 px-5 pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto max-w-md">
            <button
              onClick={listening ? stop : start}
              disabled={!supported}
              aria-label={listening ? "Stop listening" : "Start listening"}
              className={`w-full flex items-center justify-center gap-3 rounded-2xl py-4 font-bold shadow-glow transition-spring hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 ${
                listening
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-gradient-primary text-primary-foreground"
              }`}
            >
              {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              {listening ? "Stop Listening" : "Start Listening"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
