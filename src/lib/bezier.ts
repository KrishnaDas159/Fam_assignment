/**
 * Bézier Curve Mathematics
 * 
 * Cubic Bézier curve formula:
 * B(t) = (1−t)³P₀ + 3(1−t)²tP₁ + 3(1−t)t²P₂ + t³P₃
 * 
 * Derivative (tangent):
 * B'(t) = 3(1−t)²(P₁−P₀) + 6(1−t)t(P₂−P₁) + 3t²(P₃−P₂)
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Calculate a point on a cubic Bézier curve at parameter t
 */
export function bezierPoint(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  t: number
): Point {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
  };
}

/**
 * Calculate the tangent vector at parameter t on a cubic Bézier curve
 * Returns the derivative B'(t)
 */
export function bezierTangent(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  t: number
): Point {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  // B'(t) = 3(1−t)²(P₁−P₀) + 6(1−t)t(P₂−P₁) + 3t²(P₃−P₂)
  return {
    x:
      3 * mt2 * (p1.x - p0.x) +
      6 * mt * t * (p2.x - p1.x) +
      3 * t2 * (p3.x - p2.x),
    y:
      3 * mt2 * (p1.y - p0.y) +
      6 * mt * t * (p2.y - p1.y) +
      3 * t2 * (p3.y - p2.y),
  };
}

/**
 * Normalize a vector to unit length
 */
export function normalize(v: Point): Point {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

/**
 * Get the magnitude of a vector
 */
export function magnitude(v: Point): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

/**
 * Sample points along the Bézier curve
 */
export function sampleBezierCurve(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  steps: number = 100
): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push(bezierPoint(p0, p1, p2, p3, t));
  }
  return points;
}

/**
 * Sample tangent points along the curve for visualization
 */
export interface TangentData {
  point: Point;
  tangent: Point;
  normalizedTangent: Point;
}

export function sampleTangents(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  count: number = 10
): TangentData[] {
  const tangents: TangentData[] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const point = bezierPoint(p0, p1, p2, p3, t);
    const tangent = bezierTangent(p0, p1, p2, p3, t);
    const normalizedTangent = normalize(tangent);
    tangents.push({ point, tangent, normalizedTangent });
  }
  return tangents;
}
