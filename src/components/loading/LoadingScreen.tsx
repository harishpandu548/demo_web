"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface LoadingScreenProps {
  loadedCount: number;
  totalCount: number;
  firstFrameFailed: boolean;
  onDone: () => void;
}

// Don't block the visitor forever if the connection stalls partway through.
const MAX_WAIT_MS = 15000;
// Keep the brand moment on screen briefly even when loading finishes instantly.
const MIN_DISPLAY_MS = 900;

export default function LoadingScreen({
  loadedCount,
  totalCount,
  firstFrameFailed,
  onDone,
}: LoadingScreenProps) {
  const [mountedAt] = useState(() => Date.now());
  const doneRef = useRef(false);

  const percent =
    totalCount > 0 ? Math.round((loadedCount / totalCount) * 100) : 0;
  const complete = firstFrameFailed || loadedCount >= totalCount;

  useEffect(() => {
    if (doneRef.current) return;

    if (complete) {
      const elapsed = Date.now() - mountedAt;
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
      const timeout = window.setTimeout(() => {
        doneRef.current = true;
        onDone();
      }, remaining);
      return () => window.clearTimeout(timeout);
    }

    const timeout = window.setTimeout(() => {
      doneRef.current = true;
      onDone();
    }, MAX_WAIT_MS);
    return () => window.clearTimeout(timeout);
  }, [complete, onDone, mountedAt]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 bg-charcoal transition-opacity duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        complete ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && complete) onDone();
      }}
      aria-hidden="true"
    >
      <div className="relative h-28 w-28 sm:h-36 sm:w-36">
        <Image
          src="/images/logo/ossagi-ring-full.png"
          alt=""
          fill
          priority
          sizes="144px"
          className="animate-[ossagi-spin_6s_linear_infinite] object-contain"
        />
      </div>

      <div className="flex flex-col items-center gap-4">
        <span className="font-serif text-lg tracking-[0.5em] text-ivory uppercase sm:text-xl">
          Ossagi
        </span>

        <div className="h-px w-40 overflow-hidden bg-ivory/15 sm:w-56">
          <div
            className="h-full bg-gold transition-[width] duration-200 ease-out"
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>

        <span className="text-[0.65rem] tracking-[0.3em] text-ivory/50 tabular-nums uppercase">
          {Math.min(100, percent)}%
        </span>
      </div>
    </div>
  );
}
