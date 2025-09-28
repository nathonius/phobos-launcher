export function relativeAngle(
  a: { x: number; y: number },
  b: { x: number; y: number }
) {
  const x = a.x - b.x;
  const y = a.y - b.y;
  const angle = (Math.atan2(y, x) * 180) / Math.PI;
  return angle < 0 ? angle + 360 : angle;
}

export function relativeDeltaAngle(
  origin: { x: number; y: number },
  delta: { x: number; y: number }
) {
  return relativeAngle(origin, {
    x: origin.x + delta.x,
    y: origin.y + delta.y,
  });
}

export function distance(
  a: { x: number; y: number },
  b: { x: number; y: number }
) {
  const x = a.x - b.x;
  const y = a.y - b.y;
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}
