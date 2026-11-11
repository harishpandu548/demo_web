"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const CURSOR_SRC = "/images/logo/ossagi-cursor-32.png";
// Lower = more trailing lag ("buttery"), higher = tighter tracking.
const EASE = 0.16;

const FINE_POINTER_QUERY = "(pointer: fine)";

function subscribeFinePointer(callback: () => void) {
  const mediaQuery = window.matchMedia(FINE_POINTER_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getFinePointerSnapshot() {
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}

function getFinePointerServerSnapshot() {
  return false;
}

/**
 * A custom cursor that trails the real pointer with eased (lerped) motion
 * instead of snapping to it every frame like the native OS cursor does.
 * Position is driven by a persistent requestAnimationFrame loop so the
 * easing stays smooth independent of how often pointermove actually fires.
 *
 * Position (outer element) and the press-scale feedback (inner element) are
 * kept on separate nodes: the outer transform is rewritten every frame by
 * the rAF loop, so a CSS transition on it would never get a chance to run —
 * the inner element's transform only changes on press/release, where its
 * own CSS transition can animate cleanly.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [pressed, setPressed] = useState(false);
  const isFinePointer = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getFinePointerServerSnapshot,
  );

  useEffect(() => {
    if (!isFinePointer) return;

    document.documentElement.classList.add("custom-cursor-active");

    const el = dotRef.current;
    if (!el) return;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const target = { ...pos };
    let hasTarget = false;
    let rafId = 0;

    function handleMove(event: PointerEvent) {
      target.x = event.clientX;
      target.y = event.clientY;
      if (!hasTarget) {
        hasTarget = true;
        pos.x = target.x;
        pos.y = target.y;
        el!.style.opacity = "1";
      }
    }

    function handleDown() {
      setPressed(true);
    }

    function handleUp() {
      setPressed(false);
    }

    function handleLeaveWindow() {
      el!.style.opacity = "0";
    }

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);
    document.documentElement.addEventListener("mouseleave", handleLeaveWindow);

    function tick() {
      pos.x += (target.x - pos.x) * EASE;
      pos.y += (target.y - pos.y) * EASE;
      el!.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      document.documentElement.removeEventListener(
        "mouseleave",
        handleLeaveWindow,
      );
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [isFinePointer]);

  if (!isFinePointer) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-9999 h-8 w-8 opacity-0 transition-opacity duration-200 will-change-transform"
    >
      <div
        className={`h-full w-full transition-transform duration-150 ease-out ${
          pressed ? "scale-75" : "scale-100"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CURSOR_SRC}
          alt=""
          draggable={false}
          className="h-full w-full [filter:drop-shadow(0_0_2px_rgba(255,255,255,0.9))_drop-shadow(0_1px_3px_rgba(0,0,0,0.55))]"
        />
      </div>
    </div>
  );
}
