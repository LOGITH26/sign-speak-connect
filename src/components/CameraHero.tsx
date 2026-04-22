import { Camera, Sparkles, Zap } from "lucide-react";
import heroImg from "@/assets/hero-signing.jpg";

export function CameraHero() {
  return (
    <section className="px-5">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-camera shadow-glow">
        {/* Background image with overlay */}
        <div className="absolute inset-0 opacity-40">
          <img
            src={heroImg}
            alt="Two friends communicating in sign language"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.18_0.04_260/0.95)] via-[oklch(0.2_0.05_260/0.6)] to-transparent" />

        {/* Floating badges */}
        <div className="absolute top-5 left-5 flex items-center gap-1.5 rounded-full bg-card/90 backdrop-blur-md px-3 py-1.5 shadow-card">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[11px] font-semibold text-foreground">BIM Ready</span>
        </div>
        <div className="absolute top-5 right-5 flex items-center gap-1.5 rounded-full bg-primary/95 backdrop-blur-md px-3 py-1.5 shadow-glow">
          <Sparkles className="h-3 w-3 text-primary-foreground" strokeWidth={2.5} />
          <span className="text-[11px] font-semibold text-primary-foreground">Gemini AI</span>
        </div>

        {/* Content */}
        <div className="relative pt-32 pb-6 px-6">
          <h1 className="text-[28px] font-extrabold text-white leading-[1.1] tracking-tight">
            Your voice,
            <br />
            <span className="bg-gradient-warm bg-clip-text text-transparent">in every sign.</span>
          </h1>
          <p className="mt-2 text-sm text-white/75 font-medium max-w-[18rem]">
            Real-time BIM translation powered by on-device AI.
          </p>

          <button
            aria-label="Start translating now"
            className="mt-6 group flex items-center gap-3 rounded-2xl bg-white pl-2 pr-5 py-2 shadow-glow transition-spring hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
              <Camera className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="font-bold text-foreground">Start Translating</span>
            <Zap className="h-4 w-4 text-accent fill-accent" />
          </button>
        </div>
      </div>
    </section>
  );
}
