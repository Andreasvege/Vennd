// Nye personer plasseres på en ring rundt deg (origo i Nettverk), på
// første ledige plass. Før landet de på tilfeldige koordinater og kunne
// havne rett oppå noen andre.

type Point = { x: number; y: number }

/** Minste avstand mellom to personer, i kartets koordinater. */
export const MIN_GAP = 110
const RING_STEP = 120
const SLOTS_PER_RING = 24
const MAX_RINGS = 50

export function placeNewPerson(existing: Point[], rng: () => number = Math.random): Point {
  const cx = 0
  const cy = 0
  // Tilfeldig startvinkel, så nye personer ikke alltid havner i samme retning.
  const offset = rng() * Math.PI * 2

  // Fra andre ring: i midten står «Deg», og første ring er for tett på.
  for (let ring = 2; ring <= MAX_RINGS; ring++) {
    const r = ring * RING_STEP
    for (let i = 0; i < SLOTS_PER_RING; i++) {
      const a = offset + (i / SLOTS_PER_RING) * Math.PI * 2
      const p = { x: Math.round(cx + r * Math.cos(a)), y: Math.round(cy + r * Math.sin(a)) }
      if (existing.every((e) => Math.hypot(e.x - p.x, e.y - p.y) >= MIN_GAP)) return p
    }
  }

  // Uoppnåelig i praksis (50 ringer er 6000 px ut); ytterst på siste ring.
  return { x: Math.round(cx + MAX_RINGS * RING_STEP), y: Math.round(cy) }
}
