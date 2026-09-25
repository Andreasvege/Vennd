export const MAP_MODES = ['nearness', 'network', 'circles'] as const
export type MapMode = (typeof MAP_MODES)[number]

export const isMapMode = (v: unknown): v is MapMode => MAP_MODES.includes(v as MapMode)
