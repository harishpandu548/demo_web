"use client";

import { useCallback, useMemo, useRef, useState } from "react";

interface UseDragScrubOptions {
  totalFrames: number;
  /** Horizontal pixels of drag distance per frame advanced. */
  pixelsPerFrame?: number;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  startIndex: number;
  /** null until enough movement has happened to tell drag from a tap/scroll. */
  axisLocked: boolean | null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const AXIS_LOCK_THRESHOLD_PX = 6;

/**
 * Maps horizontal pointer drag distance directly onto a frame index — drag
 * left and the sequence advances the same way the content would slide under
 * your finger (matches a standard carousel/map-drag), drag right and it runs
 * back. Vertical gestures are handed back to the browser untouched so page
 * scroll on touch devices keeps working.
 */
export function useDragScrub({
  totalFrames,
  pixelsPerFrame = 8,
}: UseDragScrubOptions) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<DragState | null>(null);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startIndex: frameIndex,
        axisLocked: null,
      };
    },
    [frameIndex],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;

      if (drag.axisLocked == null) {
        if (
          Math.abs(deltaX) < AXIS_LOCK_THRESHOLD_PX &&
          Math.abs(deltaY) < AXIS_LOCK_THRESHOLD_PX
        ) {
          return;
        }
        drag.axisLocked = Math.abs(deltaX) > Math.abs(deltaY);
        if (!drag.axisLocked) {
          // Vertical intent — let the browser scroll the page instead.
          dragRef.current = null;
          return;
        }
        setHasInteracted(true);
        setIsDragging(true);
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }

      event.preventDefault();
      const frameDelta = Math.round(-deltaX / pixelsPerFrame);
      setFrameIndex(clamp(drag.startIndex + frameDelta, 0, totalFrames - 1));
    },
    [pixelsPerFrame, totalFrames],
  );

  const endDrag = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      setIsDragging(false);
    }
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      const step = event.shiftKey ? 10 : 1;
      let next: number | null = null;
      if (event.key === "ArrowLeft") next = frameIndex - step;
      else if (event.key === "ArrowRight") next = frameIndex + step;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = totalFrames - 1;
      if (next == null) return;

      event.preventDefault();
      setHasInteracted(true);
      setFrameIndex(clamp(next, 0, totalFrames - 1));
    },
    [frameIndex, totalFrames],
  );

  const handlers = useMemo(
    () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onKeyDown,
    }),
    [onPointerDown, onPointerMove, endDrag, onKeyDown],
  );

  return { frameIndex, hasInteracted, isDragging, handlers };
}
