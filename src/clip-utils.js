const LIMITS = {
  minClipCount: 1,
  maxClipCount: 6,
  minClipLength: 5,
  maxClipLength: 60,
  defaultClipCount: 3,
  defaultClipLength: 15
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function parseExtractionOptions(input = {}) {
  const parsedCount = Number.parseInt(input.clipCount, 10);
  const parsedLength = Number.parseFloat(input.clipLength);

  const clipCount = Number.isFinite(parsedCount)
    ? clamp(parsedCount, LIMITS.minClipCount, LIMITS.maxClipCount)
    : LIMITS.defaultClipCount;

  const clipLength = Number.isFinite(parsedLength)
    ? clamp(parsedLength, LIMITS.minClipLength, LIMITS.maxClipLength)
    : LIMITS.defaultClipLength;

  return { clipCount, clipLength };
}

function buildClipPlan(durationSeconds, clipCount, clipLengthSeconds) {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return [];
  }

  const normalizedCount = clamp(
    Number.isFinite(clipCount) ? Math.floor(clipCount) : LIMITS.defaultClipCount,
    LIMITS.minClipCount,
    LIMITS.maxClipCount
  );

  const normalizedLength = clamp(
    Number.isFinite(clipLengthSeconds) ? clipLengthSeconds : LIMITS.defaultClipLength,
    LIMITS.minClipLength,
    LIMITS.maxClipLength
  );

  const actualClipLength = Math.min(normalizedLength, durationSeconds);

  if (durationSeconds <= actualClipLength || normalizedCount === 1) {
    return [{ start: 0, duration: actualClipLength }];
  }

  const maxStart = Math.max(durationSeconds - actualClipLength, 0);
  const step = maxStart / (normalizedCount - 1);

  return Array.from({ length: normalizedCount }, (_, index) => ({
    start: Math.min(step * index, maxStart),
    duration: actualClipLength
  }));
}

module.exports = {
  LIMITS,
  parseExtractionOptions,
  buildClipPlan
};
