"use client";

import { useEffect, useRef } from "react";

interface ImageSequenceCanvasProps {
  framesRef: React.RefObject<(HTMLImageElement | null)[]>;
  isFrameReady: (index: number) => boolean;
  totalFrames: number;
  fps: number;
  firstFrameReady: boolean;
  reducedMotion: boolean;
  onSequenceComplete: () => void;
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

export default function ImageSequenceCanvas({
  framesRef,
  isFrameReady,
  totalFrames,
  fps,
  firstFrameReady,
  reducedMotion,
  onSequenceComplete,
}: ImageSequenceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastDrawnIndexRef = useRef(-1);

  // Keep the canvas sized to the viewport and redraw whatever frame is
  // currently on screen so resizing never restarts or stalls playback.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
      const width = window.innerWidth;
      const height = window.innerHeight;
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

  // Playback loop: advances by elapsed wall-clock time (not by rAF tick
  // count) so the sequence tracks real 30fps timing regardless of the
  // device's actual refresh rate, and holds the last good frame instead of
  // flashing blank/black when a later frame hasn't finished loading yet.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !firstFrameReady) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let cancelled = false;

    if (reducedMotion) {
      const img = framesRef.current[0];
      if (img) {
        drawCover(ctx, img, canvas.width, canvas.height);
        lastDrawnIndexRef.current = 0;
      }
      const timeout = window.setTimeout(() => {
        if (!cancelled) onSequenceComplete();
      }, 500);
      return () => {
        cancelled = true;
        window.clearTimeout(timeout);
      };
    }

    const frameDuration = 1000 / fps;
    let startTime: number | null = null;
    let lastDrawnIndex = -1;

    function tick(now: number) {
      if (cancelled) return;
      if (startTime == null) startTime = now;

      const elapsed = now - startTime;
      const targetIndex = Math.min(
        totalFrames - 1,
        Math.floor(elapsed / frameDuration),
      );

      if (targetIndex !== lastDrawnIndex && isFrameReady(targetIndex)) {
        const img = framesRef.current[targetIndex];
        if (img) {
          drawCover(ctx as CanvasRenderingContext2D, img, canvas!.width, canvas!.height);
          lastDrawnIndex = targetIndex;
          lastDrawnIndexRef.current = targetIndex;
        }
      }

      if (targetIndex === totalFrames - 1 && lastDrawnIndex === totalFrames - 1) {
        onSequenceComplete();
        return;
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [
    firstFrameReady,
    reducedMotion,
    fps,
    totalFrames,
    isFrameReady,
    framesRef,
    onSequenceComplete,
  ]);

  return <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />;
}
