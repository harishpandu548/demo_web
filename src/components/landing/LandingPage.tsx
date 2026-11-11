import Navbar from "./Navbar";
import DragExploreHero from "@/components/explore/DragExploreHero";

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
    <div className="relative h-dvh overflow-hidden bg-ivory">
      <Navbar />
      <DragExploreHero {...hero} />
    </div>
  );
}
