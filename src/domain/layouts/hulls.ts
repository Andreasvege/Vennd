import type { Point } from './types'

const cross = (o: Point, a: Point, b: Point) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)

/** Andrews monotone kjede: det konvekse skallet, mot klokka. */
function convexHull(points: Point[]): Point[] {
  const pts = [...points].sort((a, b) => a.x - b.x || a.y - b.y)
  if (pts.length < 3) return pts
  const lower: Point[] = []
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower.at(-2)!, lower.at(-1)!, p) <= 0) lower.pop()
    lower.push(p)
  }
  const upper: Point[] = []
  for (const p of [...pts].reverse()) {
    while (upper.length >= 2 && cross(upper.at(-2)!, upper.at(-1)!, p) <= 0) upper.pop()
    upper.push(p)
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)]
}

const fmt = (n: number) => Math.round(n * 10) / 10

/**
 * Et blyantomriss rundt en gruppe: det konvekse skallet av en sirkel med
 * radius `pad` rundt hvert medlem, glattet til myke buer (Catmull–Rom).
 * To personer gir en kapsel; én gir ingenting (en gruppe trenger to).
 */
export function hull(points: Point[], pad = 40): string | null {
  if (points.length < 2) return null
  const ring: Point[] = []
  for (const p of points) {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      ring.push({ x: p.x + pad * Math.cos(a), y: p.y + pad * Math.sin(a) })
    }
  }
  const h = convexHull(ring)
  if (h.length < 3) return null

  const n = h.length
  let d = `M ${fmt(h[0].x)} ${fmt(h[0].y)}`
  for (let i = 0; i < n; i++) {
    const p0 = h[(i - 1 + n) % n]
    const p1 = h[i]
    const p2 = h[(i + 1) % n]
    const p3 = h[(i + 2) % n]
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
    d += ` C ${fmt(c1.x)} ${fmt(c1.y)} ${fmt(c2.x)} ${fmt(c2.y)} ${fmt(p2.x)} ${fmt(p2.y)}`
  }
  return `${d} Z`
}
