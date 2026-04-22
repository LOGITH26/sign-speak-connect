import { Clock, Users, ChevronRight, GraduationCap, Coffee, Presentation } from "lucide-react";

const sessions = [
  {
    icon: GraduationCap,
    title: "Biology Class",
    teacher: "Cikgu Rashid",
    duration: "42 min",
    when: "Today",
    accuracy: 94,
    color: "bg-primary",
  },
  {
    icon: Presentation,
    title: "Group Project",
    teacher: "with 4 peers",
    duration: "1h 12m",
    when: "Yesterday",
    accuracy: 89,
    color: "bg-accent",
  },
  {
    icon: Coffee,
    title: "Lunch Chat",
    teacher: "Recess hall",
    duration: "18 min",
    when: "Mon",
    accuracy: 91,
    color: "bg-warm",
  },
];

export function SessionHistory() {
  return (
    <section className="px-5 mt-7">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-foreground">Recent Sessions</h3>
          <p className="text-xs text-muted-foreground">Your classroom history</p>
        </div>
        <button className="text-xs font-semibold text-primary flex items-center gap-1">
          View all <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-2.5">
        {sessions.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.title}
              className="w-full flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-card transition-smooth hover:translate-x-1 text-left"
            >
              <span
                className={`shrink-0 h-12 w-12 rounded-xl ${s.color} flex items-center justify-center text-white shadow-soft`}
              >
                <Icon className="h-5 w-5" strokeWidth={2.4} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-foreground text-sm truncate">{s.title}</h4>
                  <span className="text-[10px] font-semibold text-muted-foreground">{s.when}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{s.teacher}</p>
                <div className="mt-1.5 flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-muted-foreground font-medium">
                    <Clock className="h-3 w-3" /> {s.duration}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    {s.accuracy}% accurate
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export { Users };
