"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  PRELOADER_FPS,
  getPreloaderFramePaths,
} from "@/lib/image-sequence";
import { useImageSequence } from "./useImageSequence";
import ImageSequenceCanvas from "./ImageSequenceCanvas";

interface CinematicPreloaderProps {
  onComplete: () => void;
}

// If the very first frame hasn't loaded by this point (e.g. the network is
// down), stop blocking the visitor and reveal the landing page instead.
const FIRST_FRAME_TIMEOUT_MS = 8000;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export default function CinematicPreloader({ onComplete }: CinematicPreloaderProps) {
  const framePaths = useMemo(() => getPreloaderFramePaths(), []);
  const { framesRef, isFrameReady, firstFrameReady, firstFrameFailed } =
    useImageSequence({ framePaths });

  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const [exiting, setExiting] = useState(false);
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setExiting(true);
  }, []);

  useEffect(() => {
    if (firstFrameFailed) {
      const timeout = window.setTimeout(finish, 0);
      return () => window.clearTimeout(timeout);
    }
    if (firstFrameReady) return;
    const timeout = window.setTimeout(finish, FIRST_FRAME_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [firstFrameReady, firstFrameFailed, finish]);

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (exiting) onComplete();
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black ease-[cubic-bezier(0.4,0,0.2,1)] ${
        reducedMotion ? "duration-300" : "duration-[900ms]"
      } transition-opacity ${exiting ? "pointer-events-none opacity-0" : "opacity-100"}`}
      onTransitionEnd={handleTransitionEnd}
      aria-hidden="true"
    >
      <ImageSequenceCanvas
        framesRef={framesRef}
        isFrameReady={isFrameReady}
        totalFrames={framePaths.length}
        fps={PRELOADER_FPS}
        firstFrameReady={firstFrameReady}
        reducedMotion={reducedMotion}
        onSequenceComplete={finish}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center sm:bottom-14">
        <span className="font-serif text-xs tracking-[0.5em] text-[#f3ead9]/80 uppercase sm:text-sm">
          Ossagi
        </span>
      </div>
    </div>
  );
}
