export const PRELOADER_FRAME_COUNT = 240;
export const PRELOADER_FPS = 30;
export const PRELOADER_FRAME_DURATION_MS = 1000 / PRELOADER_FPS;

function getPreloaderFramePath(index: number): string {
  const frameNumber = index + 1;
  const padded = String(frameNumber).padStart(3, "0");
  return `/images/preloader/ezgif-frame-${padded}.jpg`;
}

export function getPreloaderFramePaths(): string[] {
  return Array.from({ length: PRELOADER_FRAME_COUNT }, (_, i) =>
    getPreloaderFramePath(i),
  );
}
