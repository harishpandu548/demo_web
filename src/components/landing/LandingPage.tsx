import Navbar from "./Navbar";
import DragExploreHero from "@/components/explore/DragExploreHero";
import Footer from "./Footer";

interface LandingPageProps {
  hero: {
    framesRef: React.RefObject<(HTMLImageElement | null)[]>;
    isFrameReady: (index: number) => boolean;
    totalFrames: number;
    firstFrameReady: boolean;
    firstFrameFailed: boolean;
  };
}

export default function LandingPage({ hero }: LandingPageProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-ivory">
      <Navbar />
      <main className="flex-1">
        <DragExploreHero {...hero} />
      </main>
      <Footer />
    </div>
  );
}
