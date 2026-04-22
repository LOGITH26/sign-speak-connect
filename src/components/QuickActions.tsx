import { Mic, Volume2, Languages, BookOpen } from "lucide-react";
import { Link } from "@tanstack/react-router";

const actions = [
  {
    icon: Mic,
    label: "Listen",
    sub: "Speech → Text",
    bg: "bg-primary/10",
    fg: "text-primary",
    to: "/listen" as const,
  },
  {
    icon: Volume2,
    label: "Speak",
    sub: "Sign → Voice",
    bg: "bg-accent/15",
    fg: "text-accent-foreground",
    iconColor: "text-accent",
    to: "/translate" as const,
  },
  {
    icon: Languages,
    label: "Translate",
    sub: "BM ↔ EN",
    bg: "bg-warm/20",
    fg: "text-warm-foreground",
    iconColor: "text-[oklch(0.55_0.15_60)]",
    to: "/translate" as const,
  },
  {
    icon: BookOpen,
    label: "Learn",
    sub: "BIM Lessons",
    bg: "bg-success/15",
    fg: "text-success",
    to: "/" as const,
  },
] as const;

export function QuickActions() {
  return (
    <section className="px-5 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-foreground">Quick Actions</h3>
        <button className="text-xs font-semibold text-primary">See all</button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.label}
              to={a.to}
              aria-label={`${a.label} — ${a.sub}`}
              className="group flex flex-col items-center gap-2 rounded-2xl bg-card p-3 shadow-card transition-spring hover:-translate-y-1 hover:shadow-soft"
            >
              <span
                className={`h-12 w-12 rounded-xl ${a.bg} flex items-center justify-center transition-smooth group-hover:scale-110`}
              >
                <Icon
                  className={`h-5 w-5 ${"iconColor" in a ? a.iconColor : a.fg}`}
                  strokeWidth={2.4}
                />
              </span>
              <span className="text-[11px] font-bold text-foreground leading-tight">{a.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
