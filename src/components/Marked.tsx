import type { Segment } from '@/domain/search'

/** Tekst med søketreffene uthevet, som med markeringstusj. */
export function Marked({ parts }: { parts: Segment[] }) {
  return parts.map((p, i) =>
    p.match ? (
      <mark key={i} className="rounded-[2px] bg-pen-wash text-ink">
        {p.text}
      </mark>
    ) : (
      <span key={i}>{p.text}</span>
    ),
  )
}
