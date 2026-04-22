import { Heart, MessageCircle } from "lucide-react";

export function MentorshipCard() {
  return (
    <section className="px-5 mt-7">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-warm p-5 shadow-warm">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -right-2 -bottom-8 h-24 w-24 rounded-full bg-primary/30 blur-2xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1 rounded-full bg-white/30 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-warm-foreground uppercase tracking-wider">
              <Heart className="h-3 w-3 fill-current" /> Mentorship
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-warm-foreground leading-tight max-w-[14rem]">
            Connect with a Deaf mentor today
          </h3>
          <p className="mt-1.5 text-sm text-warm-foreground/80 font-medium max-w-[16rem]">
            3 mentors online — chat in BIM, build your future.
          </p>

          {/* Avatar stack */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex -space-x-2">
              {["A", "M", "J"].map((c, i) => (
                <div
                  key={c}
                  className="h-9 w-9 rounded-full border-2 border-warm flex items-center justify-center font-bold text-xs text-warm-foreground"
                  style={{
                    background: `oklch(${0.78 - i * 0.05} 0.16 ${35 + i * 30})`,
                  }}
                >
                  {c}
                </div>
              ))}
              <div className="h-9 w-9 rounded-full border-2 border-warm bg-warm-foreground/90 flex items-center justify-center text-[10px] font-bold text-warm">
                +12
              </div>
            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-warm-foreground px-4 py-2.5 text-warm font-bold text-sm shadow-soft transition-spring hover:scale-105">
              <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
              Connect
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
