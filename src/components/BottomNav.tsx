import { Home, History, Sparkles, User, Camera } from "lucide-react";
import { Link } from "@tanstack/react-router";

const items = [
  { icon: Home, label: "Home", active: true },
  { icon: History, label: "Sessions", active: false },
  { icon: Sparkles, label: "Learn", active: false },
  { icon: User, label: "Profile", active: false },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto max-w-md px-4 pb-3">
        <div className="relative rounded-[1.75rem] bg-card/90 backdrop-blur-xl shadow-glow border border-border/50">
          <div className="grid grid-cols-5 items-center px-3 py-2.5">
            {items.slice(0, 2).map((it) => (
              <NavItem key={it.label} {...it} />
            ))}
            <div className="flex justify-center">
              <Link
                to="/translate"
                aria-label="Open camera translator"
                className="-mt-8 h-16 w-16 rounded-2xl bg-gradient-primary shadow-glow flex items-center justify-center text-primary-foreground transition-spring hover:scale-110 hover:rotate-3 active:scale-95"
              >
                <Camera className="h-6 w-6" strokeWidth={2.5} />
              </Link>
            </div>
            {items.slice(2).map((it) => (
              <NavItem key={it.label} {...it} />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
}: {
  icon: typeof Home;
  label: string;
  active: boolean;
}) {
  return (
    <button
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className="flex flex-col items-center gap-0.5 py-1.5 transition-smooth"
    >
      <Icon
        className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`}
        strokeWidth={active ? 2.5 : 2}
      />
      <span
        className={`text-[10px] font-bold ${active ? "text-primary" : "text-muted-foreground"}`}
      >
        {label}
      </span>
    </button>
  );
}
