import { Bell, Settings } from "lucide-react";

export function AppHeader({ name = "Aisyah" }: { name?: string }) {
  return (
    <header className="flex items-center justify-between px-5 pt-6 pb-4">
      <div className="flex items-center gap-3">
        <div className="relative h-11 w-11 rounded-2xl bg-gradient-warm shadow-warm flex items-center justify-center text-warm-foreground font-bold text-lg">
          {name.charAt(0)}
          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-success ring-2 ring-background" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Selamat pagi 👋</p>
          <h2 className="text-base font-bold text-foreground leading-tight">{name}</h2>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label="Notifications"
          className="relative h-11 w-11 rounded-2xl bg-card shadow-card flex items-center justify-center text-foreground transition-smooth hover:bg-secondary"
        >
          <Bell className="h-5 w-5" strokeWidth={2.2} />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-accent" />
        </button>
        <button
          aria-label="Settings"
          className="h-11 w-11 rounded-2xl bg-card shadow-card flex items-center justify-center text-foreground transition-smooth hover:bg-secondary"
        >
          <Settings className="h-5 w-5" strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );
}
