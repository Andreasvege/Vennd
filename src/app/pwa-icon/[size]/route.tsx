import { ImageResponse } from 'next/og'
import { BrandMark } from '../../brand-mark'

// Ikonene manifestet peker på. «maskable» får ekstra luft, så Android kan
// beskjære til sirkel eller dråpe uten å kappe merket.
const SIZES: Record<string, { px: number; padding: number }> = {
  '192': { px: 192, padding: 0.14 },
  '512': { px: 512, padding: 0.14 },
  'maskable-512': { px: 512, padding: 0.24 },
}

export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const spec = SIZES[(await params).size]
  if (!spec) return new Response('Not found', { status: 404 })
  return new ImageResponse(<BrandMark size={spec.px} padding={spec.padding} />, {
    width: spec.px,
    height: spec.px,
    headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
  })
}
