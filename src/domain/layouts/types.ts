export type Point = { x: number; y: number }
export type LayoutPerson = { id: string; name: string; groupId: string | null; freshness: number }
/** Grupper i fast rekkefølge (hovedtagger). null er «uten tagg» og står alltid sist. */
export type Group = { id: string | null; name: string }

/** Vinkel målt fra rett opp, med klokka (skjermkoordinater: y peker ned). */
export const polar = (r: number, angle: number): Point => ({
  x: r * Math.cos(angle - Math.PI / 2),
  y: r * Math.sin(angle - Math.PI / 2),
})
