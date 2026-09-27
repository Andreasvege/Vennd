import { connectionOrder } from './order'
import { relax } from './relax'
import type { Group, Point } from './types'

type TidyPerson = { id: string; name: string; groupId: string | null }

/** Avatar pluss navn: navnene er bredere enn sirklene. */
export const TIDY_GAP = 100
/** «Deg» står i origo; ingen skal legge seg oppå. */
export const TIDY_CENTER_CLEAR = 170
// Omrisset rundt et miljø ligger så langt utenfor medlemmene (se hull i
// useMapModel), og navnet på miljøet står over det.
const HULL_PAD = 56
const LABEL_ROOM = 34
// Luft mellom to øyer, utenpå omrisset.
const ISLAND_GAP = 28

/**
 * «Rydd opp» i Nettverk: hvert miljø blir en rund, tett øy, og øyene pakkes
 * rundt deg som bobler, uten å overlappe. Inni en øy står de som kjenner
 * hverandre, nær hverandre; hver øy vris så de som kjenner folk i andre
 * miljøer, står på siden som vender mot dem. Folk uten miljø samles etter
 * hvem de kjenner. Deterministisk: samme kart gir samme opprydding.
 *
 * Posisjonene er midten av avataren, med deg i origo.
 */
export function tidyNetwork(persons: TidyPerson[], groups: Group[], pairs: [string, string][]): Map<string, Point> {
  if (persons.length === 0) return new Map()
  const ids = new Set(persons.map((p) => p.id))
  const links = pairs.filter(([a, b]) => a !== b && ids.has(a) && ids.has(b))
  const islands = makeIslands(persons, groups, links)

  // 1. Hver øy for seg, rundt sitt eget sentrum.
  const local = islands.map((island) => islandLayout(island.members, links))
  const radius = local.map((l, i) => {
    const r = Math.max(0, ...[...l.values()].map((p) => Math.hypot(p.x, p.y)))
    // Uten omriss (folk uten miljø) trengs verken pute eller navn.
    return r + (islands[i].hull ? HULL_PAD + LABEL_ROOM / 2 : TIDY_GAP / 2)
  })

  // 2. Øyene rundt deg.
  const islandOf = new Map<string, number>()
  islands.forEach((island, i) => island.members.forEach((m) => islandOf.set(m.id, i)))
  const between = new Map<string, number>()
  for (const [a, b] of links) {
    const i = islandOf.get(a)!
    const j = islandOf.get(b)!
    if (i === j) continue
    const key = i < j ? `${i}|${j}` : `${j}|${i}`
    between.set(key, (between.get(key) ?? 0) + 1)
  }
  const centers = packIslands(radius, between)

  // 3. Vri hver øy så forbindelsene ut av den blir korte.
  const out = new Map<string, Point>()
  const place = (i: number, angle: number) => {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    for (const [id, p] of local[i]) {
      out.set(id, { x: centers[i].x + p.x * cos - p.y * sin, y: centers[i].y + p.x * sin + p.y * cos })
    }
  }
  islands.forEach((_, i) => place(i, 0))
  const outward = links.filter(([a, b]) => islandOf.get(a) !== islandOf.get(b))
  // To runder: den andre ser de andre øyene slik de ble vridd i den første.
  for (let round = 0; round < 2; round++) {
    islands.forEach((island, i) => {
      const mine = outward.filter(([a, b]) => islandOf.get(a) === i || islandOf.get(b) === i)
      if (mine.length === 0 || island.members.length < 2) return
      let best = 0
      let bestCost = Infinity
      for (let k = 0; k < 24; k++) {
        const angle = (k / 24) * Math.PI * 2
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        let cost = 0
        for (const [a, b] of mine) {
          const [inside, other] = islandOf.get(a) === i ? [a, b] : [b, a]
          const p = local[i].get(inside)!
          const q = out.get(other)!
          cost += Math.hypot(centers[i].x + p.x * cos - p.y * sin - q.x, centers[i].y + p.x * sin + p.y * cos - q.y)
        }
        if (cost < bestCost - 1e-6) {
          bestCost = cost
          best = angle
        }
      }
      place(i, best)
    })
  }

  // Et siste sikkerhetspass mot overlapp; øyene har allerede luft mellom seg.
  const relaxed = relax(out, TIDY_GAP, 30)
  return new Map(
    persons.map((p) => {
      const q = relaxed.get(p.id)!
      return [p.id, { x: Math.round(q.x), y: Math.round(q.y) }]
    }),
  )
}

type Island = { members: TidyPerson[]; hull: boolean }

/**
 * Miljøene, i samme rekkefølge som taggene. Folk uten miljø deles etter
 * hvem de kjenner: de som henger sammen, blir en egen klynge, og de som
 * står alene, samles til slutt. Ingen av dem får omriss.
 */
function makeIslands(persons: TidyPerson[], groups: Group[], links: [string, string][]): Island[] {
  const known = new Set(groups.map((g) => g.id).filter((id) => id !== null))
  const byGroup = new Map<string, TidyPerson[]>()
  const loose: TidyPerson[] = []
  for (const p of persons) {
    if (p.groupId !== null && known.has(p.groupId)) byGroup.set(p.groupId, [...(byGroup.get(p.groupId) ?? []), p])
    else loose.push(p)
  }
  const islands: Island[] = groups.flatMap((g) => {
    const members = g.id === null ? undefined : byGroup.get(g.id)
    return members?.length ? [{ members, hull: true }] : []
  })

  // Sammenhengende klynger blant dem uten miljø.
  const looseIds = new Set(loose.map((p) => p.id))
  const adj = new Map(loose.map((p) => [p.id, [] as string[]]))
  for (const [a, b] of links) {
    if (looseIds.has(a) && looseIds.has(b)) {
      adj.get(a)!.push(b)
      adj.get(b)!.push(a)
    }
  }
  const seen = new Set<string>()
  const alone: TidyPerson[] = []
  const byId = new Map(loose.map((p) => [p.id, p]))
  for (const p of [...loose].sort((a, b) => a.name.localeCompare(b.name, 'nb'))) {
    if (seen.has(p.id)) continue
    const cluster: TidyPerson[] = []
    const queue = [p.id]
    seen.add(p.id)
    while (queue.length) {
      const id = queue.shift()!
      cluster.push(byId.get(id)!)
      for (const next of adj.get(id)!) {
        if (seen.has(next)) continue
        seen.add(next)
        queue.push(next)
      }
    }
    if (cluster.length > 1) islands.push({ members: cluster, hull: false })
    else alone.push(p)
  }
  if (alone.length) islands.push({ members: alone, hull: false })
  return islands
}

/**
 * Én øy: et solsikkemønster rundt sentrum som utgangspunkt, så trekker
 * relasjonene de som kjenner hverandre sammen mens alle holder avstand.
 * Resultatet er en rund, tett flekk med vennegjengene samlet.
 */
function islandLayout(members: TidyPerson[], links: [string, string][]): Map<string, Point> {
  const order = connectionOrder(members, links)
  const n = order.length
  if (n === 1) return new Map([[order[0], { x: 0, y: 0 }]])
  const idx = new Map(order.map((id, i) => [id, i]))
  // I et solsikkemønster er nærmeste nabo omtrent 1,9 × c unna.
  const c = (TIDY_GAP * 1.08) / 1.9
  const xs = order.map((_, i) => c * Math.sqrt(i + 0.5) * Math.cos(i * 2.39996))
  const ys = order.map((_, i) => c * Math.sqrt(i + 0.5) * Math.sin(i * 2.39996))
  const springs = links.filter(([a, b]) => idx.has(a) && idx.has(b)).map(([a, b]) => [idx.get(a)!, idx.get(b)!] as const)
  // Hvor stor øya får bli: litt større enn det tetteste mønsteret.
  const maxR = c * Math.sqrt(n) * 1.12 + 10

  const ROUNDS = 160
  for (let round = 0; round < ROUNDS; round++) {
    const heat = 12 * (1 - round / ROUNDS) + 0.5
    const fx = new Array(n).fill(0)
    const fy = new Array(n).fill(0)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = xs[i] - xs[j]
        const dy = ys[i] - ys[j]
        const d = Math.max(Math.hypot(dx, dy), 1)
        if (d >= TIDY_GAP * 1.6) continue
        const f = ((TIDY_GAP * 1.6 - d) / (TIDY_GAP * 1.6)) * 6
        fx[i] += (dx / d) * f
        fy[i] += (dy / d) * f
        fx[j] -= (dx / d) * f
        fy[j] -= (dy / d) * f
      }
    }
    for (const [i, j] of springs) {
      const dx = xs[j] - xs[i]
      const dy = ys[j] - ys[i]
      const d = Math.max(Math.hypot(dx, dy), 1)
      const f = Math.min(3, (d - TIDY_GAP) * 0.02)
      if (f <= 0) continue
      fx[i] += (dx / d) * f
      fy[i] += (dy / d) * f
      fx[j] -= (dx / d) * f
      fy[j] -= (dy / d) * f
    }
    for (let i = 0; i < n; i++) {
      // Et svakt drag mot sentrum holder øya rund.
      fx[i] -= xs[i] * 0.01
      fy[i] -= ys[i] * 0.01
      const f = Math.hypot(fx[i], fy[i])
      const step = f > heat ? heat / f : 1
      xs[i] += fx[i] * step
      ys[i] += fy[i] * step
      const r = Math.hypot(xs[i], ys[i])
      if (r > maxR) {
        xs[i] *= maxR / r
        ys[i] *= maxR / r
      }
    }
  }
  const relaxed = relax(new Map(order.map((id, i) => [id, { x: xs[i], y: ys[i] }])), TIDY_GAP)
  // Sentrer øya om sitt eget tyngdepunkt.
  const pts = [...relaxed.values()]
  const mx = pts.reduce((s, p) => s + p.x, 0) / n
  const my = pts.reduce((s, p) => s + p.y, 0) / n
  return new Map([...relaxed].map(([id, p]) => [id, { x: p.x - mx, y: p.y - my }]))
}

/**
 * Øyene som bobler rundt deg: de starter på en ring i tagg-rekkefølge, med
 * plass etter størrelse, og trekkes så inn mot midten og mot øyene de har
 * forbindelser til, mens ingen får overlappe hverandre eller deg.
 */
function packIslands(radius: number[], between: Map<string, number>): Point[] {
  const n = radius.length
  const meR = TIDY_CENTER_CLEAR - TIDY_GAP / 2
  if (n === 1) {
    // Én øy: rett under deg, ikke rundt deg, så du står utenfor miljøet.
    return [{ x: 0, y: meR + radius[0] + ISLAND_GAP }]
  }
  // Hvor tett det blir, avhenger av rekkefølgen rundt deg. Prøv tagg-
  // rekkefølgen og en der store og små veksler, fra hver startøy, og behold
  // den mest kompakte (store øyer nær deg, og korte forbindelser).
  const tagOrder = radius.map((_, i) => i)
  const bySize = [...tagOrder].sort((a, b) => radius[b] - radius[a] || a - b)
  const alternating = bySize.map((_, k) => (k % 2 === 0 ? bySize[k / 2] : bySize[n - 1 - (k - 1) / 2]))
  let best: Point[] = []
  let bestScore = Infinity
  for (const base of [tagOrder, alternating]) {
    for (let shift = 0; shift < n; shift++) {
      const order = [...base.slice(shift), ...base.slice(0, shift)]
      const pos = packFrom(order, radius, between, meR)
      const spread = pos.reduce((s, p, i) => s + Math.hypot(p.x, p.y) * radius[i], 0)
      const stretch = [...between].reduce((s, [key, count]) => {
        const [i, j] = key.split('|').map(Number)
        return s + Math.hypot(pos[i].x - pos[j].x, pos[i].y - pos[j].y) * Math.min(count, 4) * 20
      }, 0)
      if (spread + stretch < bestScore - 1e-6) {
        bestScore = spread + stretch
        best = pos
      }
    }
  }
  return best
}

function packFrom(order: number[], radius: number[], between: Map<string, number>, meR: number): Point[] {
  const n = radius.length
  const total = radius.reduce((s, r) => s + r, 0)
  const pos: Point[] = new Array(n)
  let angle = -Math.PI / 2
  for (const i of order) {
    const span = (radius[i] / total) * Math.PI * 2
    const a = angle + span / 2
    angle += span
    const d = meR + ISLAND_GAP + radius[i] * 1.2
    pos[i] = { x: d * Math.cos(a), y: d * Math.sin(a) }
  }
  const pull = [...between].map(([key, count]) => {
    const [i, j] = key.split('|').map(Number)
    return [i, j, Math.min(1, count / 4)] as const
  })

  const ROUNDS = 400
  for (let round = 0; round < ROUNDS; round++) {
    const cool = 1 - round / ROUNDS
    // Mot midten: like sterkt for alle, så de store ikke blir liggende ytterst.
    for (const p of pos) {
      const d = Math.max(Math.hypot(p.x, p.y), 1)
      const step = Math.min(d, 6 * cool + 0.5)
      p.x -= (p.x / d) * step
      p.y -= (p.y / d) * step
    }
    for (const [i, j, w] of pull) {
      const dx = pos[j].x - pos[i].x
      const dy = pos[j].y - pos[i].y
      const d = Math.max(Math.hypot(dx, dy), 1)
      const step = Math.min(d, 3 * w * cool)
      pos[i].x += (dx / d) * step * 0.5
      pos[i].y += (dy / d) * step * 0.5
      pos[j].x -= (dx / d) * step * 0.5
      pos[j].y -= (dy / d) * step * 0.5
    }
    // Ingen overlapp: flere små runder, så det løser seg også i en klynge.
    for (let pass = 0; pass < 4; pass++) {
      for (let i = 0; i < n; i++) {
        const d = Math.max(Math.hypot(pos[i].x, pos[i].y), 1e-6)
        const min = meR + radius[i] + ISLAND_GAP
        if (d < min) {
          const ux = d < 1e-3 ? Math.cos(i) : pos[i].x / d
          const uy = d < 1e-3 ? Math.sin(i) : pos[i].y / d
          pos[i].x = ux * min
          pos[i].y = uy * min
        }
        for (let j = i + 1; j < n; j++) {
          let dx = pos[j].x - pos[i].x
          let dy = pos[j].y - pos[i].y
          let dd = Math.hypot(dx, dy)
          const need = radius[i] + radius[j] + ISLAND_GAP
          if (dd >= need) continue
          if (dd < 1e-6) {
            dx = 1
            dy = 0
            dd = 1
          }
          // Den minste flytter seg mest, så de store ligger stødig.
          const push = need - dd
          const wi = radius[j] / (radius[i] + radius[j])
          pos[i].x -= (dx / dd) * push * wi
          pos[i].y -= (dy / dd) * push * wi
          pos[j].x += (dx / dd) * push * (1 - wi)
          pos[j].y += (dy / dd) * push * (1 - wi)
        }
      }
    }
  }
  return pos
}
