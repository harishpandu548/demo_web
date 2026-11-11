"use client";

import { useEffect, useRef, useState } from "react";

interface UseImageSequenceOptions {
  framePaths: string[];
  concurrency?: number;
}

interface UseImageSequenceResult {
  framesRef: React.RefObject<(HTMLImageElement | null)[]>;
  isFrameReady: (index: number) => boolean;
  firstFrameReady: boolean;
  firstFrameFailed: boolean;
  /** Reactive, rAF-throttled count of frames loaded so far — drives a progress UI. */
  loadedCount: number;
  totalCount: number;
}

/**
 * Loads a sequence of images for canvas playback without ever mounting them
 * in the DOM. Frame 0 is fetched and decoded first so the UI can paint
 * immediately; the rest load progressively behind a small worker pool so the
 * browser isn't asked to fetch hundreds of files at once.
 */
export function useImageSequence({
  framePaths,
  concurrency = 6,
}: UseImageSequenceOptions): UseImageSequenceResult {
  const framesRef = useRef<(HTMLImageElement | null)[]>(
    new Array(framePaths.length).fill(null),
  );
  const readyRef = useRef<boolean[]>(new Array(framePaths.length).fill(false));
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [firstFrameFailed, setFirstFrameFailed] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const inFlight: HTMLImageElement[] = [];

    framesRef.current = new Array(framePaths.length).fill(null);
    readyRef.current = new Array(framePaths.length).fill(false);

    // Loads finish in rapid bursts; batch them into one state update per
    // animation frame instead of re-rendering on every single completion.
    let completedSinceFlush = 0;
    let flushScheduled = false;
    function scheduleFlush() {
      if (flushScheduled) return;
      flushScheduled = true;
      requestAnimationFrame(() => {
        flushScheduled = false;
        if (cancelled) return;
        setLoadedCount((count) => count + completedSinceFlush);
        completedSinceFlush = 0;
      });
    }

    function loadOne(index: number): Promise<void> {
      return new Promise((resolve) => {
        if (index >= framePaths.length) return resolve();
        const img = new Image();
        inFlight.push(img);
        img.decoding = "async";

        img.onload = async () => {
          if (cancelled) return resolve();
          try {
            if (img.decode) await img.decode();
          } catch {
            // Decode can reject on some browsers even though the image is
            // paintable; fall through and use it anyway.
          }
          if (cancelled) return resolve();
          framesRef.current[index] = img;
          readyRef.current[index] = true;
          if (index === 0) setFirstFrameReady(true);
          completedSinceFlush += 1;
          scheduleFlush();
          resolve();
        };

        img.onerror = () => {
          if (index === 0) setFirstFrameFailed(true);
          completedSinceFlush += 1;
          scheduleFlush();
          resolve();
        };

        img.src = framePaths[index];
      });
    }

    async function run() {
      await loadOne(0);
      if (cancelled) return;

      let next = 1;
      const workerCount = Math.min(
        concurrency,
        Math.max(framePaths.length - 1, 0),
      );
      const workers = Array.from({ length: workerCount }, async () => {
        while (!cancelled) {
          const index = next++;
          if (index >= framePaths.length) break;
          await loadOne(index);
        }
      });
      await Promise.all(workers);
    }

    run();

    return () => {
      cancelled = true;
      for (const img of inFlight) {
        img.onload = null;
        img.onerror = null;
        img.src = "";
      }
    };
  }, [framePaths, concurrency]);

  function isFrameReady(index: number) {
    return readyRef.current[index] === true;
  }

  return {
    framesRef,
    isFrameReady,
    firstFrameReady,
    firstFrameFailed,
    loadedCount,
    totalCount: framePaths.length,
  };
}
