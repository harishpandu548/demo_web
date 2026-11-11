"use client";

import { useMemo, useState } from "react";
import { getSequenceFramePaths } from "@/lib/image-sequence";
import { useImageSequence } from "@/hooks/useImageSequence";
import LoadingScreen from "@/components/loading/LoadingScreen";
import LandingPage from "@/components/landing/LandingPage";

export default function HomeExperience() {
  const framePaths = useMemo(() => getSequenceFramePaths(), []);
  const {
    framesRef,
    isFrameReady,
    firstFrameReady,
    firstFrameFailed,
    loadedCount,
    totalCount,
  } = useImageSequence({ framePaths });

  const [loadingDone, setLoadingDone] = useState(false);

  return (
    <>
      <LandingPage
        hero={{
          framesRef,
          isFrameReady,
          totalFrames: totalCount,
          firstFrameReady,
          firstFrameFailed,
        }}
      />
      {!loadingDone && (
        <LoadingScreen
          loadedCount={loadedCount}
          totalCount={totalCount}
          firstFrameFailed={firstFrameFailed}
          onDone={() => setLoadingDone(true)}
        />
      )}
    </>
  );
}
