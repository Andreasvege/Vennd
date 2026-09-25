import type { Point } from './types'

/**
 * Et lite frastøtingspass etter en beregnet layout: to personer som står
 * nærmere enn `gap` skyves fra hverandre langs linjen mellom dem, litt av
 * gangen, til ingen overlapper. Strukturen (sektor og avstand) beholdes;
 * bare det som kolliderer, flytter seg.
 */
export function relax(positions: Map<string, Point>, gap: number, rounds = 60): Map<string, Point> {
  const ids = [...positions.keys()].sort()
  const pos = new Map(ids.map((id) => [id, { ...positions.get(id)! }]))
  for (let round = 0; round < rounds; round++) {
    let moved = false
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = pos.get(ids[i])!
        const b = pos.get(ids[j])!
        let dx = b.x - a.x
        let dy = b.y - a.y
        let d = Math.hypot(dx, dy)
        if (d >= gap) continue
        if (d < 1e-6) {
          // Nøyaktig oppå hverandre: velg en fast retning, så resultatet er stabilt.
          dx = 1
          dy = 0
          d = 1
        }
        const push = (gap - d) / 2 + 0.01
        a.x -= (dx / d) * push
        a.y -= (dy / d) * push
        b.x += (dx / d) * push
        b.y += (dy / d) * push
        moved = true
      }
    }
    if (!moved) break
  }
  return pos
}
