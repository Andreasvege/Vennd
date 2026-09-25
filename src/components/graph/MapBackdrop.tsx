'use client'

import { ViewportPortal } from '@xyflow/react'
import { tagFill, tagStroke } from '@/lib/palette'
import type { Backdrop } from './useMapModel'

/**
 * Det som ligger bak personene og følger panorering og zoom: ringene i
 * Nærhet, blyantomrissene i Nettverk og gruppebuene i Kretser. Bare
 * pynt for øyet — informasjonen finnes også i forklaringen.
 */
export function MapBackdrop({ backdrop }: { backdrop: Backdrop }) {
  return (
    <ViewportPortal>
      <svg
        aria-hidden
        width={1}
        height={1}
        className="pointer-events-none absolute left-0 top-0 overflow-visible"
        style={{ zIndex: -1 }}
      >
        {backdrop.kind === 'rings' &&
          backdrop.rings.map((ring) => (
            <g key={ring.r}>
              <circle r={ring.r} fill="none" stroke="var(--rule)" strokeWidth={1.25} strokeDasharray="2 6" />
              <text
                y={-ring.r - 10}
                textAnchor="middle"
                className="font-display"
                style={{ fontSize: 15, fontStyle: 'italic', fill: 'var(--ink-muted)' }}
              >
                {ring.label}
              </text>
            </g>
          ))}

        {backdrop.kind === 'hulls' &&
          backdrop.hulls.map((h) => (
            <g key={h.id}>
              <path
                d={h.path}
                fill={tagFill(h.color)}
                fillOpacity={0.35}
                stroke={tagStroke(h.color)}
                strokeWidth={1.25}
                strokeDasharray="3 6"
                strokeLinecap="round"
              />
              <text
                x={h.labelAt.x}
                y={h.labelAt.y}
                textAnchor="middle"
                className="font-display"
                style={{ fontSize: 16, fontStyle: 'italic', fill: tagStroke(h.color) }}
              >
                {h.label}
              </text>
            </g>
          ))}

        {backdrop.kind === 'arcs' &&
          backdrop.arcs.map((arc) => {
            const color = arc.color ? tagStroke(arc.color) : 'var(--ink-muted)'
            return (
              <g key={arc.id}>
                <path d={arc.path} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
                <path id={`arc-label-${arc.id}`} d={arc.labelPath} fill="none" />
                <text className="font-display" style={{ fontSize: 15, fontStyle: 'italic', fill: color }}>
                  <textPath href={`#arc-label-${arc.id}`} startOffset="50%" textAnchor="middle">
                    {arc.label}
                  </textPath>
                </text>
              </g>
            )
          })}
      </svg>
    </ViewportPortal>
  )
}
