export const SEQUENCE_FRAME_COUNT = 240;

function getSequenceFramePath(index: number): string {
  const frameNumber = index + 1;
  const padded = String(frameNumber).padStart(3, "0");
  return `/images/preloader/ezgif-frame-${padded}.jpg`;
}

export function getSequenceFramePaths(): string[] {
  return Array.from({ length: SEQUENCE_FRAME_COUNT }, (_, i) =>
    getSequenceFramePath(i),
  );
}
