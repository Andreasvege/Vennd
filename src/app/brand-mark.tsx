import { TOKENS } from '@/styles/tokens'

// Kartets signatur som ikon: deg i midten og tre mennesker rundt, i blekk på
// papir. Tegnet i SVG så ImageResponse kan lage alle størrelsene fra én kilde.
const { paper, ink } = TOKENS.light
const TINTS = ['#EBD9AE', '#CCD7E0', '#EDCFCB'] // oker, skifer, rose (lyse fyll fra paletten)

export function BrandMark({ size, padding = 0.14 }: { size: number; padding?: number }) {
  const inset = size * padding
  const s = size - inset * 2
  const c = s / 2
  const r = s * 0.13
  const orbit = s * 0.34
  const angles = [-90, 30, 150].map((a) => (a * Math.PI) / 180)
  const points = angles.map((a) => [c + orbit * Math.cos(a), c + orbit * Math.sin(a)])

  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', background: paper }}>
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        {points.map(([x, y], i) => (
          <line key={`l${i}`} x1={c} y1={c} x2={x} y2={y} stroke={ink} strokeWidth={s * 0.022} strokeLinecap="round" />
        ))}
        {points.map(([x, y], i) => (
          <circle key={`c${i}`} cx={x} cy={y} r={r} fill={TINTS[i]} stroke={ink} strokeWidth={s * 0.022} />
        ))}
        <circle cx={c} cy={c} r={r * 1.35} fill={ink} />
      </svg>
    </div>
  )
}
