import { angleWithin, sectors } from './sectors'
import { polar, type Group, type LayoutPerson, type Point } from './types'

const ANCHOR = 0.35
const SAME_GROUP = 0.7
const fmt = (n: number) => Math.round(n * 10) / 10

/**
 * Kretser: alle på én sirkel, gruppert etter hovedtagg. Hver gruppe har et
 * anker innenfor sirkelen; kanter mellom to grupper går via begge
 * ankrene, så relasjonene mellom de samme miljøene samles i én «kabel»
 * (hierarkisk kantbunting med to nivåer).
 */
export function circles(persons: LayoutPerson[], groups: Group[], { r } = { r: 420 }) {
  const positions = new Map<string, Point>()
  const anchors = new Map<string | null, Point>()
  const inner = new Map<string | null, Point>()
  const arcs: { groupId: string | null; start: number; end: number }[] = []
  const groupOf = new Map<string, string | null>()

  for (const s of sectors(groups, persons)) {
    const mid = (s.start + s.end) / 2
    anchors.set(s.groupId, polar(r * ANCHOR, mid))
    inner.set(s.groupId, polar(r * SAME_GROUP, mid))
    arcs.push({ groupId: s.groupId, start: s.start, end: s.end })
    s.members.forEach((id, i) => {
      positions.set(id, polar(r, angleWithin(s, i)))
      groupOf.set(id, s.groupId)
    })
  }

  /** Banen for en kant mellom to personer, eller null hvis en av dem ikke er med. */
  const edgePath = (from: string, to: string): string | null => {
    const a = positions.get(from)
    const b = positions.get(to)
    if (!a || !b) return null
    const ga = groupOf.get(from) ?? null
    const gb = groupOf.get(to) ?? null
    if (ga === gb) return sameGroupPath(a, b, inner.get(ga)!)
    return bundlePath(a, b, anchors.get(ga)!, anchors.get(gb)!)
  }

  return { positions, anchors, arcs, edgePath }
}

/** Mellom to grupper: via begge gruppenes ankre. */
export function bundlePath(from: Point, to: Point, fromAnchor: Point, toAnchor: Point): string {
  return `M ${fmt(from.x)} ${fmt(from.y)} C ${fmt(fromAnchor.x)} ${fmt(fromAnchor.y)} ${fmt(toAnchor.x)} ${fmt(toAnchor.y)} ${fmt(to.x)} ${fmt(to.y)}`
}

/** Innen én gruppe: en grunn bue innover. */
export function sameGroupPath(from: Point, to: Point, control: Point): string {
  return `M ${fmt(from.x)} ${fmt(from.y)} Q ${fmt(control.x)} ${fmt(control.y)} ${fmt(to.x)} ${fmt(to.y)}`
}

/** SVG-bue for en gruppe utenfor sirkelen, til gruppenavnet. */
export function arcPath(radius: number, start: number, end: number): string {
  const a = polar(radius, start)
  const b = polar(radius, end)
  const large = end - start > Math.PI ? 1 : 0
  return `M ${fmt(a.x)} ${fmt(a.y)} A ${radius} ${radius} 0 ${large} 1 ${fmt(b.x)} ${fmt(b.y)}`
}
