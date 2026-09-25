import 'server-only'
import { del } from '@vercel/blob'

const BLOB_HOST = '.public.blob.vercel-storage.com'

/** Bilder er på bare når Vercel Blob er koblet til. Uten den brukes initialene. */
export function isPhotosEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

/**
 * Sletter et bilde vi selv har lastet opp. Andre adresser (f.eks. et
 * Google-bilde) røres ikke. En feil her skal aldri stoppe det brukeren
 * gjorde; filen blir i verste fall liggende.
 */
export async function removeBlob(url: string | null | undefined): Promise<void> {
  if (!url || !isPhotosEnabled()) return
  try {
    if (new URL(url).hostname.endsWith(BLOB_HOST)) await del(url)
  } catch (e) {
    console.error('[blob] kunne ikke slette', e)
  }
}
