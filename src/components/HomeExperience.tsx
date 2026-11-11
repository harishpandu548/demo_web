"use client";

import { useCallback, useState } from "react";
import CinematicPreloader from "@/components/preloader/CinematicPreloader";
import LandingPage from "@/components/landing/LandingPage";

export default function HomeExperience() {
  const [introComplete, setIntroComplete] = useState(false);
  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);

  return (
    <>
      <LandingPage />
      {!introComplete && (
        <CinematicPreloader onComplete={handleIntroComplete} />
      )}
    </>
  );
}
