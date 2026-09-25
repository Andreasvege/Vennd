import type { MetadataRoute } from 'next'
import { TOKENS } from '@/styles/tokens'
import { t } from '@/i18n'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: t.app.name,
    short_name: t.app.name,
    description: t.app.description,
    lang: 'nb',
    start_url: '/',
    display: 'standalone',
    background_color: TOKENS.light.paper,
    theme_color: TOKENS.light.paper,
    icons: [
      { src: '/pwa-icon/192', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-icon/512', sizes: '512x512', type: 'image/png' },
      { src: '/pwa-icon/maskable-512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
