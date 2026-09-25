type Point = { x: number; y: number }

/** Mykt inn og mykt ut: overgangen mellom syn føles som én bevegelse. */
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/**
 * Posisjonene et stykke `t` (0–1) på vei fra `from` til `to`. En node som
 * ikke har noe startpunkt (nettopp blitt synlig), står i mål med én gang.
 */
export function interpolate(from: Map<string, Point>, to: Map<string, Point>, t: number): Map<string, Point> {
  const out = new Map<string, Point>()
  for (const [id, end] of to) {
    const start = from.get(id)
    out.set(id, start ? { x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t } : end)
  }
  return out
}
