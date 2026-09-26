import { relax } from './relax'
import { sectors } from './sectors'
import { polar, type Group, type Point } from './types'

type TidyPerson = { id: string; name: string; groupId: string | null }

// Avatar pluss navn: navnene er bredere enn sirklene.
const NODE_GAP = 100
const ROUNDS = 300
// Kreftene: frastøting mellom alle, fjær langs relasjonene, og et drag
// mot sitt eget miljø, så gruppene blir øyer og ikke en suppe.
const REPULSE = 9000
const SPRING = 0.05
// Innad i et miljø viser øya allerede at de hører sammen. Der drar
// relasjonene svakt; ellers trekker en gjeng der alle kjenner alle seg
// sammen til et nøste.
const SPRING_SAME = 0.004
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
    const spread = 60 * Math.sqrt(s.members.length)
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
  const groupOf = new Map(persons.map((p) => [p.id, p.groupId]))
  const links = pairs.flatMap(([a, b]) => {
    if (!idx.has(a) || !idx.has(b) || a === b) return []
    const same = groupOf.get(a) !== null && groupOf.get(a) === groupOf.get(b)
    return [[idx.get(a)!, idx.get(b)!, same ? SPRING_SAME : SPRING] as const]
  })
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
    for (const [i, j, k] of links) {
      const dx = xs[j] - xs[i]
      const dy = ys[j] - ys[i]
      const d = Math.max(Math.hypot(dx, dy), 1)
      const f = k * (d - SPRING_LENGTH)
      fx[i] += (dx / d) * f
      fy[i] += (dy / d) * f
      fx[j] -= (dx / d) * f
      fy[j] -= (dy / d) * f
    }
    // «Deg» tegnes i tyngdepunktet av alle, ikke i origo: hold plass der.
    const cx = xs.reduce((s, x) => s + x, 0) / xs.length
    const cy = ys.reduce((s, y) => s + y, 0) / ys.length
    ids.forEach((id, i) => {
      const h = home.get(id)!
      fx[i] += (h.x - xs[i]) * HOME
      fy[i] += (h.y - ys[i]) * HOME
      const f = Math.hypot(fx[i], fy[i])
      const step = f > heat ? heat / f : 1
      xs[i] += fx[i] * step
      ys[i] += fy[i] * step
      const rx = xs[i] - cx
      const ry = ys[i] - cy
      const r = Math.hypot(rx, ry)
      if (r < CENTER_CLEAR) {
        xs[i] = cx + (r < 1e-6 ? CENTER_CLEAR : (rx / r) * CENTER_CLEAR)
        ys[i] = cy + (r < 1e-6 ? 0 : (ry / r) * CENTER_CLEAR)
      }
    })
  }

  // Til slutt: ingen overlapp, «deg» (tyngdepunktet) i origo, og plass rundt
  // deg. Hvert steg kan forstyrre et annet litt, så de veksler noen runder.
  let out = new Map(ids.map((id, i) => [id, { x: xs[i], y: ys[i] }]))
  for (let pass = 0; pass < 4; pass++) {
    out = relax(out, NODE_GAP)
    const pts = [...out.values()]
    const mx = pts.reduce((sum, p) => sum + p.x, 0) / pts.length
    const my = pts.reduce((sum, p) => sum + p.y, 0) / pts.length
    out = new Map(
      [...out].map(([id, p]) => {
        const x = p.x - mx
        const y = p.y - my
        const r = Math.hypot(x, y)
        if (r >= CENTER_CLEAR) return [id, { x, y }]
        return [id, r < 1e-6 ? { x: CENTER_CLEAR, y: 0 } : { x: (x / r) * CENTER_CLEAR, y: (y / r) * CENTER_CLEAR }]
      }),
    )
  }
  const pts = [...out.values()]
  const mx = pts.reduce((sum, p) => sum + p.x, 0) / pts.length
  const my = pts.reduce((sum, p) => sum + p.y, 0) / pts.length
  return new Map([...out].map(([id, p]) => [id, { x: Math.round(p.x - mx), y: Math.round(p.y - my) }]))
}
