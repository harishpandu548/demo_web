"use client";

import { useEffect, useRef } from "react";

interface FrameCanvasProps {
  framesRef: React.RefObject<(HTMLImageElement | null)[]>;
  isFrameReady: (index: number) => boolean;
  totalFrames: number;
  frameIndex: number;
}

const MAX_DEVICE_PIXEL_RATIO = 2;

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let sx: number;
  let sy: number;
  let sWidth: number;
  let sHeight: number;

  if (imgRatio > canvasRatio) {
    sHeight = img.naturalHeight;
    sWidth = sHeight * canvasRatio;
    sx = (img.naturalWidth - sWidth) / 2;
    sy = 0;
  } else {
    sWidth = img.naturalWidth;
    sHeight = sWidth / canvasRatio;
    sx = 0;
    sy = (img.naturalHeight - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);
}

// The visitor can drag faster than frames finish decoding, especially on a
// slow connection. Rather than show a blank frame, fall back to the nearest
// frame that has already loaded until the real one catches up.
function findNearestReadyIndex(
  desired: number,
  totalFrames: number,
  isFrameReady: (index: number) => boolean,
  fallback: number,
) {
  if (isFrameReady(desired)) return desired;
  for (let offset = 1; offset < totalFrames; offset++) {
    const lo = desired - offset;
    const hi = desired + offset;
    if (lo >= 0 && isFrameReady(lo)) return lo;
    if (hi < totalFrames && isFrameReady(hi)) return hi;
  }
  return fallback;
}

/** Controlled canvas renderer: always paints whichever frame it's told to. */
export default function FrameCanvas({
  framesRef,
  isFrameReady,
  totalFrames,
  frameIndex,
}: FrameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastDrawnIndexRef = useRef(-1);

  // Keep the canvas sized to its container and redraw whatever frame is
  // currently on screen so resizing never leaves a stretched/stale frame.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      const width = parent?.clientWidth ?? window.innerWidth;
      const height = parent?.clientHeight ?? window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const idx = lastDrawnIndexRef.current;
      if (ctx && idx >= 0) {
        const img = framesRef.current[idx];
        if (img) drawCover(ctx, img, canvas.width, canvas.height);
      }
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
  }, [framesRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resolvedIndex = findNearestReadyIndex(
      frameIndex,
      totalFrames,
      isFrameReady,
      lastDrawnIndexRef.current,
    );
    if (resolvedIndex < 0) return;

    const img = framesRef.current[resolvedIndex];
    if (!img) return;

    drawCover(ctx, img, canvas.width, canvas.height);
    lastDrawnIndexRef.current = resolvedIndex;
  }, [frameIndex, totalFrames, isFrameReady, framesRef]);

  return <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />;
}
