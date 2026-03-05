const test = require("node:test");
const assert = require("node:assert/strict");
const { buildClipPlan, parseExtractionOptions, LIMITS } = require("../src/clip-utils");

test("parseExtractionOptions aplica defaults", () => {
  assert.deepEqual(parseExtractionOptions({}), {
    clipCount: LIMITS.defaultClipCount,
    clipLength: LIMITS.defaultClipLength
  });
});

test("parseExtractionOptions limita valores fuera de rango", () => {
  assert.deepEqual(parseExtractionOptions({ clipCount: 99, clipLength: 999 }), {
    clipCount: LIMITS.maxClipCount,
    clipLength: LIMITS.maxClipLength
  });

  assert.deepEqual(parseExtractionOptions({ clipCount: -1, clipLength: 1 }), {
    clipCount: LIMITS.minClipCount,
    clipLength: LIMITS.minClipLength
  });
});

test("buildClipPlan devuelve vacío con duración inválida", () => {
  assert.deepEqual(buildClipPlan(0, 3, 15), []);
  assert.deepEqual(buildClipPlan(Number.NaN, 3, 15), []);
});

test("buildClipPlan genera clips espaciados uniformemente", () => {
  const plan = buildClipPlan(60, 3, 15);
  assert.equal(plan.length, 3);
  assert.equal(plan[0].start, 0);
  assert.equal(plan[1].start, 22.5);
  assert.equal(plan[2].start, 45);
  assert.equal(plan[0].duration, 15);
});

test("buildClipPlan reduce a un clip cuando corresponde", () => {
  const planShort = buildClipPlan(10, 3, 15);
  assert.deepEqual(planShort, [{ start: 0, duration: 10 }]);

  const planSingle = buildClipPlan(100, 1, 15);
  assert.deepEqual(planSingle, [{ start: 0, duration: 15 }]);
});
