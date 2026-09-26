import { relax } from './relax'
import { sectors } from './sectors'
import { polar, type Group, type Point } from './types'

type TidyPerson = { id: string; name: string; groupId: string | null }

const NODE_GAP = 84
const ROUNDS = 260
// Kreftene: frastøting mellom alle, fjær langs relasjonene, og et drag
// mot sitt eget miljø, så gruppene blir øyer og ikke en suppe.
const REPULSE = 7000
const SPRING = 0.05
const SPRING_LENGTH = 120
const HOME = 0.025
// «Deg» står i midten; ingen skal legge seg oppå.
const CENTER_CLEAR = 170

/**
 * «Rydd opp» i Nettverk: miljøene som øyer rundt deg, i samme rekkefølge
 * som Nærhet, og de som kjenner hverandre trukket sammen, uten overlapp.
 * Deterministisk: samme kart gir samme opprydding.
 */
export function tidyNetwork(persons: TidyPerson[], groups: Group[], pairs: [string, string][]): Map<string, Point> {
  if (persons.length === 0) return new Map()
  const secs = sectors(
    groups,
    persons.map((p) => ({ ...p, freshness: 0 })),
    pairs,
  )
  // Øyene står lenger ut jo flere det er, så de får plass.
  const ring = Math.max(300, 90 * Math.sqrt(persons.length))
  const home = new Map<string, Point>()
  const pos = new Map<string, Point>()
  for (const s of secs) {
    const anchor = polar(s.members.length === persons.length ? 0 : ring, (s.start + s.end) / 2)
    const spread = 46 * Math.sqrt(s.members.length)
    s.members.forEach((id, i) => {
      home.set(id, anchor)
      // Solsikkemønster rundt ankeret, i rekkefølgen der naboer står sammen.
      const r = spread * Math.sqrt((i + 0.5) / s.members.length)
      const a = i * 2.39996
      pos.set(id, { x: anchor.x + r * Math.cos(a), y: anchor.y + r * Math.sin(a) })
    })
  }

  const ids = [...pos.keys()]
  const idx = new Map(ids.map((id, i) => [id, i]))
  const links = pairs.flatMap(([a, b]) => (idx.has(a) && idx.has(b) && a !== b ? [[idx.get(a)!, idx.get(b)!] as const] : []))
  const xs = ids.map((id) => pos.get(id)!.x)
  const ys = ids.map((id) => pos.get(id)!.y)

  for (let round = 0; round < ROUNDS; round++) {
    const heat = 40 * (1 - round / ROUNDS) + 1
    const fx = new Array(ids.length).fill(0)
    const fy = new Array(ids.length).fill(0)
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const dx = xs[i] - xs[j]
        const dy = ys[i] - ys[j]
        const d2 = Math.max(dx * dx + dy * dy, 25)
        const f = REPULSE / d2
        const d = Math.sqrt(d2)
        fx[i] += (dx / d) * f
        fy[i] += (dy / d) * f
        fx[j] -= (dx / d) * f
        fy[j] -= (dy / d) * f
      }
    }
    for (const [i, j] of links) {
      const dx = xs[j] - xs[i]
      const dy = ys[j] - ys[i]
      const d = Math.max(Math.hypot(dx, dy), 1)
      const f = SPRING * (d - SPRING_LENGTH)
      fx[i] += (dx / d) * f
      fy[i] += (dy / d) * f
      fx[j] -= (dx / d) * f
      fy[j] -= (dy / d) * f
    }
    ids.forEach((id, i) => {
      const h = home.get(id)!
      fx[i] += (h.x - xs[i]) * HOME
      fy[i] += (h.y - ys[i]) * HOME
      const f = Math.hypot(fx[i], fy[i])
      const step = f > heat ? heat / f : 1
      xs[i] += fx[i] * step
      ys[i] += fy[i] * step
      const r = Math.hypot(xs[i], ys[i])
      if (r < CENTER_CLEAR) {
        const k = r < 1e-6 ? 1 : CENTER_CLEAR / r
        xs[i] = r < 1e-6 ? CENTER_CLEAR : xs[i] * k
        ys[i] *= k
      }
    })
  }

  const out = new Map(ids.map((id, i) => [id, { x: Math.round(xs[i]), y: Math.round(ys[i]) }]))
  const relaxed = relax(out, NODE_GAP)
  return new Map([...relaxed].map(([id, p]) => [id, { x: Math.round(p.x), y: Math.round(p.y) }]))
}
