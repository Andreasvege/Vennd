import { ImageResponse } from 'next/og'
import { BrandMark } from './brand-mark'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// iOS legger egne runde hjørner på, så merket får litt mer luft.
export default function AppleIcon() {
  return new ImageResponse(<BrandMark size={180} padding={0.18} />, size)
}
