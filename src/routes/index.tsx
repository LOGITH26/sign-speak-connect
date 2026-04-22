import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { CameraHero } from "@/components/CameraHero";
import { QuickActions } from "@/components/QuickActions";
import { SessionHistory } from "@/components/SessionHistory";
import { MentorshipCard } from "@/components/MentorshipCard";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VoiceLink — Real-time BIM Translator for DHH Youth" },
      {
        name: "description",
        content:
          "AI-powered Malaysian Sign Language (BIM) translator. Real-time sign-to-speech and speech-to-text built for Deaf and Hard-of-Hearing students.",
      },
      { property: "og:title", content: "VoiceLink — BIM Translator" },
      {
        property: "og:description",
        content: "Empowering DHH youth with real-time sign language translation.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first frame */}
      <div className="mx-auto max-w-md min-h-screen pb-32">
        <AppHeader />
        <main>
          <h1 className="sr-only">VoiceLink — AI-powered BIM translator dashboard</h1>
          <CameraHero />
          <QuickActions />
          <SessionHistory />
          <MentorshipCard />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
