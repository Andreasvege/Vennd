import { createTag } from '@/server/actions/tag'
import type { TagOption } from './TagField'

/** TagField sin onCreate: opprett (eller finn) taggen, og gi den tilbake. */
export async function createTagOption(name: string): Promise<TagOption | null> {
  const result = await createTag(name)
  return result.ok ? result.data : null
}
