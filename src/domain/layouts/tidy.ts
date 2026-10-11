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
// Hvor mye større en øy får bli i finpussen enn den tetteste formen.
const ROOM = 1.1

/**
 * «Rydd opp» i Nettverk: hvert miljø blir en rund, tett øy, og øyene pakkes
 * rundt deg som bobler, uten å overlappe. Øyer med mange felles kjente
 * blir naboer. Inni en øy står de som kjenner hverandre, nær hverandre, og
 * de som kjenner folk i andre miljøer, står på kanten som vender mot dem
 * (som i CiSE og «group-in-a-box»). Folk uten miljø står ved dem de
 * kjenner; de uten noen forbindelser samles i en alfabetisk blokk.
 * Deterministisk: samme kart gir samme opprydding.
 *
 * Posisjonene er midten av avataren, med deg i origo.
 */
export function tidyNetwork(persons: TidyPerson[], groups: Group[], pairs: [string, string][]): Map<string, Point> {
  if (persons.length === 0) return new Map()
  const ids = new Set(persons.map((p) => p.id))
  const links = pairs.filter(([a, b]) => a !== b && ids.has(a) && ids.has(b))
  const islands = makeIslands(persons, groups, links)

  // 1. Hver øy for seg, rundt sitt eget sentrum.
  const local = islands.map((island) => (island.pile ? pileLayout(island.members) : islandLayout(island.members, links)))
  const radius = local.map((l, i) => {
    // Litt luft, så finpussen (steg 4) har plass til å flytte folk ut mot
    // kanten som vender mot dem de kjenner.
    const r = Math.max(0, ...[...l.values()].map((p) => Math.hypot(p.x, p.y))) * ROOM
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

  // 4. Finpuss inni hver øy: den som kjenner folk utenfor, flytter seg mot
  // kanten som vender mot dem. Øya blir ikke større enn den var, så
  // pakkingen holder.
  islands.forEach((island, i) => {
    if (island.members.length < 2) return
    const rel = new Map(island.members.map((m) => [m.id, { x: out.get(m.id)!.x - centers[i].x, y: out.get(m.id)!.y - centers[i].y }]))
    const sums = new Map<string, { x: number; y: number; n: number }>()
    for (const [a, b] of outward) {
      for (const [inside, other] of [
        [a, b],
        [b, a],
      ]) {
        if (islandOf.get(inside) !== i) continue
        const s = sums.get(inside) ?? { x: 0, y: 0, n: 0 }
        const q = out.get(other)!
        sums.set(inside, { x: s.x + q.x - centers[i].x, y: s.y + q.y - centers[i].y, n: s.n + 1 })
      }
    }
    if (sums.size === 0) return
    const toward = new Map([...sums].map(([id, s]) => [id, { x: s.x / s.n, y: s.y / s.n }]))
    const maxR = radius[i] - (island.hull ? HULL_PAD + LABEL_ROOM / 2 : TIDY_GAP / 2)
    // En tett øy har ikke plass til å flytte alle ut mot kanten. Prøv med
    // stadig svakere drag, og behold øya som den var om ingenting passer.
    let refined = rel
    for (const strength of [2.5, 1.2, 0.5]) {
      const tried = relax(settle(rel, links, maxR, toward, 120, 6, strength), TIDY_GAP)
      if ([...tried.values()].every((p) => Math.hypot(p.x, p.y) <= maxR + 1)) {
        refined = tried
        break
      }
    }
    for (const [id, p] of refined) out.set(id, { x: centers[i].x + p.x, y: centers[i].y + p.y })
  })

  // Et siste sikkerhetspass mot overlapp; øyene har allerede luft mellom seg.
  const relaxed = relax(out, TIDY_GAP, 30)
  return new Map(
    persons.map((p) => {
      const q = relaxed.get(p.id)!
      return [p.id, { x: Math.round(q.x), y: Math.round(q.y) }]
    }),
  )
}

// `pile`: de uten forbindelser, satt opp som en ryddig blokk.
type Island = { members: TidyPerson[]; hull: boolean; pile?: boolean }

/**
 * Miljøene, i samme rekkefølge som taggene. Folk uten miljø deles etter
 * hvem de kjenner: de som henger sammen, blir en egen klynge, en som bare
 * kjenner folk i miljøer, står for seg, og de uten forbindelser samles til
 * slutt. Ingen av dem får omriss.
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
  const linked = new Set(links.flat())
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
    // Én som kjenner noen på kartet, blir en liten øy for seg, så hen kan
    // stå ved dem hen kjenner. Bare de uten noen forbindelser samles.
    if (cluster.length > 1 || linked.has(p.id)) islands.push({ members: cluster, hull: false })
    else alone.push(p)
  }
  if (alone.length) islands.push({ members: alone, hull: false, pile: true })
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
  // I et solsikkemønster er nærmeste nabo omtrent 1,9 × c unna.
  const c = (TIDY_GAP * 1.08) / 1.9
  const start = new Map(
    order.map((id, i) => [id, { x: c * Math.sqrt(i + 0.5) * Math.cos(i * 2.39996), y: c * Math.sqrt(i + 0.5) * Math.sin(i * 2.39996) }]),
  )
  // Hvor stor øya får bli: litt større enn det tetteste mønsteret.
  const relaxed = relax(settle(start, links, c * Math.sqrt(n) * 1.12 + 10, new Map(), 160), TIDY_GAP)
  // Sentrer øya om sitt eget tyngdepunkt.
  const pts = [...relaxed.values()]
  const mx = pts.reduce((s, p) => s + p.x, 0) / n
  const my = pts.reduce((s, p) => s + p.y, 0) / n
  return new Map([...relaxed].map(([id, p]) => [id, { x: p.x - mx, y: p.y - my }]))
}

/**
 * De uten forbindelser: ingen krefter å regne på, så de står i et tett
 * bikubemønster, alfabetisk i leserekkefølge, så det ser ordnet ut og er
 * lett å finne noen.
 */
function pileLayout(members: TidyPerson[]): Map<string, Point> {
  const step = TIDY_GAP * 1.08
  const rowH = step * (Math.sqrt(3) / 2)
  // Nok bikubepunkter rundt sentrum, de nærmeste først, så blokken blir rund.
  const span = Math.ceil(Math.sqrt(members.length)) + 1
  const cells: Point[] = []
  for (let row = -span; row <= span; row++)
    for (let col = -span; col <= span; col++) cells.push({ x: (col + (row & 1 ? 0.5 : 0)) * step, y: row * rowH })
  const picked = cells
    .sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y) || a.y - b.y || a.x - b.x)
    .slice(0, members.length)
    .sort((a, b) => a.y - b.y || a.x - b.x)
  const names = [...members].sort((a, b) => a.name.localeCompare(b.name, 'nb'))
  const mx = picked.reduce((s, p) => s + p.x, 0) / picked.length
  const my = picked.reduce((s, p) => s + p.y, 0) / picked.length
  return new Map(names.map((m, i) => [m.id, { x: picked[i].x - mx, y: picked[i].y - my }]))
}

/**
 * Kreftene inni en øy, rundt (0, 0): alle holder avstand, de som kjenner
 * hverandre, trekkes sammen, og ingen går utenfor `maxR`. `toward` gir et
 * ekstra drag for den som kjenner folk utenfor øya: mot dem, så hen står
 * på kanten som vender dit (som i CiSE).
 */
function settle(
  start: Map<string, Point>,
  links: [string, string][],
  maxR: number,
  toward: Map<string, Point>,
  rounds: number,
  hot = 12,
  strength = 2.5,
): Map<string, Point> {
  const order = [...start.keys()]
  const n = order.length
  const idx = new Map(order.map((id, i) => [id, i]))
  const xs = order.map((id) => start.get(id)!.x)
  const ys = order.map((id) => start.get(id)!.y)
  const springs = links.filter(([a, b]) => idx.has(a) && idx.has(b)).map(([a, b]) => [idx.get(a)!, idx.get(b)!] as const)
  const pulls = order.map((id) => toward.get(id) ?? null)

  for (let round = 0; round < rounds; round++) {
    const heat = hot * (1 - round / rounds) + 0.5
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
      const target = pulls[i]
      if (target) {
        const dx = target.x - xs[i]
        const dy = target.y - ys[i]
        const d = Math.max(Math.hypot(dx, dy), 1)
        fx[i] += (dx / d) * strength
        fy[i] += (dy / d) * strength
      }
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
  return new Map(order.map((id, i) => [id, { x: xs[i], y: ys[i] }]))
}

/**
 * Øyene som bobler rundt deg: de starter på en ring, med plass etter
 * størrelse, og trekkes så inn mot midten og mot øyene de har forbindelser
 * til, mens ingen får overlappe hverandre eller deg. Som i CiSE og
 * «group-in-a-box» blir øyer med mange felles kjente naboer: dragningen
 * vokser med antallet forbindelser, så 190 felles kjente teller mer enn 4.
 */
function packIslands(radius: number[], between: Map<string, number>): Point[] {
  const n = radius.length
  const meR = TIDY_CENTER_CLEAR - TIDY_GAP / 2
  if (n === 1) {
    // Én øy: rett under deg, ikke rundt deg, så du står utenfor miljøet.
    return [{ x: 0, y: meR + radius[0] + ISLAND_GAP }]
  }
  const ties = [...between].map(([key, count]) => {
    const [i, j] = key.split('|').map(Number)
    return [i, j, count] as const
  })
  // Hvor tett det blir, avhenger av rekkefølgen rundt deg. Prøv tagg-
  // rekkefølgen, en der store og små veksler, og kjeder der hver øy får
  // naboen den har flest felles kjente med (fra hver av de største). Behold
  // den med kortest streker mellom øyene og store øyer nær deg. Å rotere
  // en rekkefølge gir bare det samme kartet, dreid, så det trengs ikke.
  const tagOrder = radius.map((_, i) => i)
  const bySize = [...tagOrder].sort((a, b) => radius[b] - radius[a] || a - b)
  const alternating = bySize.map((_, k) => (k % 2 === 0 ? bySize[k / 2] : bySize[n - 1 - (k - 1) / 2]))
  const chains = bySize.slice(0, 4).map((first) => chainOrder([first, ...bySize.filter((i) => i !== first)], ties))
  let best: Point[] = []
  let bestScore = Infinity
  for (const order of [tagOrder, alternating, ...chains]) {
    const pos = packFrom(order, radius, ties, meR)
    const spread = pos.reduce((s, p, i) => s + Math.hypot(p.x, p.y) * radius[i], 0) * 0.05
    // Strekene mellom øyene går fra kant til kant, ikke fra sentrum.
    const stretch = ties.reduce(
      (s, [i, j, count]) =>
        s + Math.max(0, Math.hypot(pos[i].x - pos[j].x, pos[i].y - pos[j].y) - radius[i] - radius[j]) * count,
      0,
    )
    if (spread + stretch < bestScore - 1e-6) {
      bestScore = spread + stretch
      best = pos
    }
  }
  return settleIslands(best, radius, ties, meR)
}

/**
 * Kreftene kan bli stående fast: en liten øy kan være sperret ute fra den
 * den kjenner, av en stor øy imellom. Prøv hver øy, minst først, på ledige
 * plasser inntil øyene den har bånd til, og flytt den dit om strekene blir
 * kortere.
 */
function settleIslands(
  start: Point[],
  radius: number[],
  ties: readonly (readonly [number, number, number])[],
  meR: number,
): Point[] {
  const pos = start.map((p) => ({ ...p }))
  const tiesOf = radius.map((_, i) => ties.filter(([a, b]) => a === i || b === i).map(([a, b, c]) => [a === i ? b : a, c] as const))
  const cost = (i: number, p: Point) =>
    tiesOf[i].reduce((s, [j, c]) => s + Math.max(0, Math.hypot(p.x - pos[j].x, p.y - pos[j].y) - radius[i] - radius[j]) * c, 0) +
    Math.hypot(p.x, p.y) * radius[i] * 0.05
  const free = (i: number, p: Point) =>
    Math.hypot(p.x, p.y) >= meR + radius[i] + ISLAND_GAP - 0.5 &&
    pos.every((q, j) => j === i || Math.hypot(p.x - q.x, p.y - q.y) >= radius[i] + radius[j] + ISLAND_GAP - 0.5)
  const bySize = radius.map((_, i) => i).sort((a, b) => radius[a] - radius[b] || a - b)
  for (let round = 0; round < 2; round++) {
    for (const i of bySize) {
      if (tiesOf[i].length === 0) continue
      let best = pos[i]
      let bestCost = cost(i, pos[i])
      for (const [j] of tiesOf[i]) {
        const d = radius[i] + radius[j] + ISLAND_GAP
        for (let k = 0; k < 48; k++) {
          const a = (k / 48) * Math.PI * 2
          const p = { x: pos[j].x + d * Math.cos(a), y: pos[j].y + d * Math.sin(a) }
          const c = cost(i, p)
          if (c < bestCost - 1e-6 && free(i, p)) {
            best = p
            bestCost = c
          }
        }
      }
      pos[i] = best
    }
  }
  return pos
}

/**
 * En rekkefølge rundt ringen der de som henger mest sammen, står side om
 * side: start med den første, og ta hele tiden den som har flest felles
 * kjente med en av endene i kjeden.
 */
function chainOrder(bySize: number[], ties: readonly (readonly [number, number, number])[]): number[] {
  const weight = new Map<string, number>()
  for (const [i, j, count] of ties) weight.set(`${i}|${j}`, count)
  const w = (a: number, b: number) => weight.get(a < b ? `${a}|${b}` : `${b}|${a}`) ?? 0
  const chain = [bySize[0]]
  const left = new Set(bySize.slice(1))
  while (left.size) {
    let pick = -1
    let atEnd = true
    let most = -1
    for (const k of bySize) {
      if (!left.has(k)) continue
      const tail = w(k, chain.at(-1)!)
      const head = w(k, chain[0])
      if (Math.max(tail, head) > most) {
        most = Math.max(tail, head)
        pick = k
        atEnd = tail >= head
      }
    }
    left.delete(pick)
    if (atEnd) chain.push(pick)
    else chain.unshift(pick)
  }
  return chain
}

function packFrom(
  order: number[],
  radius: number[],
  ties: readonly (readonly [number, number, number])[],
  meR: number,
): Point[] {
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
  // Dragningen vokser med roten av antallet: én forbindelse drar svakt,
  // femti eller flere drar så hardt at øyene legger seg kant i kant. Taket
  // hindrer at de sterkeste båndene svinger mot overlapp-passet; poengene
  // i packIslands teller hele antallet.
  const pull = ties.map(([i, j, count]) => [i, j, Math.min(4, 0.5 + Math.sqrt(count) / 2)] as const)

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
      // Bare til de rører hverandre; resten tar overlapp-passet seg av.
      const step = Math.min(Math.max(0, d - radius[i] - radius[j] - ISLAND_GAP), 8 * w * cool + w)
      // Den minste flytter seg mest, så en enslig legger seg inntil en stor øy.
      const wi = radius[j] / (radius[i] + radius[j])
      pos[i].x += (dx / d) * step * wi
      pos[i].y += (dy / d) * step * wi
      pos[j].x -= (dx / d) * step * (1 - wi)
      pos[j].y -= (dy / d) * step * (1 - wi)
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
