"use client";

import Image from "next/image";
import { useDragScrub } from "./useDragScrub";
import FrameCanvas from "./FrameCanvas";

// Same photograph as frame 0, shown instantly and left in place behind the
// canvas so there's never a blank layer while the sequence loads or if it
// fails outright.
const FALLBACK_HERO_SRC = "/images/hero/hero-image.jpg";
const CURSOR_URL = "/images/logo/ossagi-cursor-32.png";

interface DragExploreHeroProps {
  framesRef: React.RefObject<(HTMLImageElement | null)[]>;
  isFrameReady: (index: number) => boolean;
  totalFrames: number;
  firstFrameReady: boolean;
  firstFrameFailed: boolean;
}

export default function DragExploreHero({
  framesRef,
  isFrameReady,
  totalFrames,
  firstFrameReady,
  firstFrameFailed,
}: DragExploreHeroProps) {
  const { frameIndex, hasInteracted, isDragging, handlers } = useDragScrub({
    totalFrames,
  });

  return (
    <section
      className="relative flex h-dvh touch-pan-y select-none overflow-hidden"
      style={{
        cursor: isDragging
          ? "grabbing"
          : `url(${CURSOR_URL}) 16 16, grab`,
      }}
      role="slider"
      aria-label="Drag to experience the OSSAGI boutique"
      aria-valuemin={1}
      aria-valuemax={totalFrames}
      aria-valuenow={frameIndex + 1}
      tabIndex={0}
      {...handlers}
    >
      <Image
        src={FALLBACK_HERO_SRC}
        alt="OSSAGI boutique interior featuring the modest fashion collection"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {!firstFrameFailed && (
        <FrameCanvas
          framesRef={framesRef}
          isFrameReady={isFrameReady}
          totalFrames={totalFrames}
          frameIndex={frameIndex}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-charcoal/20" />

      {!hasInteracted && firstFrameReady && (
        <div className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center transition-opacity duration-500 sm:bottom-14">
          <div className="flex flex-col items-center gap-3 text-ivory/90">
            <span aria-hidden className="text-2xl">
              ↔
            </span>
            <span className="text-xs tracking-[0.4em] uppercase">
              Drag to Experience the Store
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
