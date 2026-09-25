import type { Insight } from '@/server/queries/insight'
import { t } from '@/i18n'

// Tellestreker: fire loddrette og én på skrå over, slik man teller for hånd.
const TALLY = { col: 25, stroke: 4, height: 20, gap: 8 }
// Over et kvartal blir tellestreker for tett; da er hver logg en prikk.
const DOT = { col: 12, r: 2, step: 5.5 }
const TALLY_MAX_WEEKS = 16
const LABEL_H = 18

// Litt ujevnhet, alltid den samme, så strekene ser håndtegnet ut uten å flimre.
const wobble = (a: number, b: number) => (((a * 37 + b * 17) % 7) - 3) * 0.22

function TallyColumn({ count, x, base }: { count: number; x: number; base: number }) {
  const lines = []
  for (let g = 0; g * 5 < count; g++) {
    const inGroup = Math.min(5, count - g * 5)
    const bottom = base - g * (TALLY.height + TALLY.gap)
    const top = bottom - TALLY.height
    for (let k = 0; k < Math.min(4, inGroup); k++) {
      const lx = x + k * TALLY.stroke
      lines.push(<line key={`${g}-${k}`} x1={lx + wobble(g, k)} y1={bottom} x2={lx - wobble(k, g)} y2={top} />)
    }
    if (inGroup === 5) {
      lines.push(
        <line key={`${g}-x`} x1={x - 2} y1={bottom - 3 + wobble(g, 5)} x2={x + 3 * TALLY.stroke + 2} y2={top + 3} />,
      )
    }
  }
  return <>{lines}</>
}

/**
 * Uke for uke, som tellestreker i margen. Diagrammet er pynt for øyet;
 * det samme står som tekst og i en tabell for skjermlesere.
 */
export function TallyChart({ weeks }: { weeks: Insight['weeks'] }) {
  const tally = weeks.length <= TALLY_MAX_WEEKS
  const col = tally ? TALLY.col : DOT.col
  const max = Math.max(0, ...weeks.map((w) => w.count))
  const plot = tally ? Math.max(1, Math.ceil(max / 5)) * (TALLY.height + TALLY.gap) : Math.max(1, max) * DOT.step + 4
  const width = weeks.length * col
  const height = plot + LABEL_H

  const busiest = weeks.reduce((best, w) => (w.count > best.count ? w : best), weeks[0] ?? { week: 0, count: 0 })
  const avg = weeks.length ? weeks.reduce((s, w) => s + w.count, 0) / weeks.length : 0
  const avgText = avg.toLocaleString('nb-NO', { maximumFractionDigits: 1 })

  return (
    <figure className="flex flex-col gap-3">
      <svg
        aria-hidden
        viewBox={`-6 0 ${width + 6} ${height}`}
        className="h-auto w-full max-w-full overflow-visible"
        style={{ maxWidth: tally ? `${width + 6}px` : undefined }}
      >
        <line x1={-6} x2={width} y1={plot + 2} y2={plot + 2} className="stroke-rule" strokeWidth={1} />
        {weeks.map((w, i) => {
          const x = i * col + (tally ? 4 : col / 2)
          // Månedsnavn under første uke i hver måned.
          const label = i === 0 || weeks[i - 1].start.getUTCMonth() !== w.start.getUTCMonth()
          return (
            <g key={w.start.toISOString()}>
              {tally ? (
                <g className="stroke-ink" strokeWidth={1.4} strokeLinecap="round">
                  <TallyColumn count={w.count} x={x} base={plot - 2} />
                </g>
              ) : (
                Array.from({ length: w.count }, (_, k) => (
                  <circle key={k} cx={x} cy={plot - 3 - k * DOT.step} r={DOT.r} className="fill-ink" />
                ))
              )}
              {label && (
                <text x={i * col} y={height - 3} className="fill-ink-muted" fontSize={10}>
                  {w.start.toLocaleDateString('nb-NO', { month: 'short', timeZone: 'UTC' }).replace('.', '')}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <figcaption className="text-[14px] text-ink-muted">{t.insight.weekSummary(avgText, busiest.week, busiest.count)}</figcaption>
      <table className="sr-only">
        <thead>
          <tr>
            <th scope="col">{t.insight.weekCol}</th>
            <th scope="col">{t.insight.countCol}</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((w) => (
            <tr key={w.start.toISOString()}>
              <td>{w.week}</td>
              <td>{w.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
