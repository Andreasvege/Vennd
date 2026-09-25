/**
 * Om en tastetrykk-snarvei (N, P, /) skal vike: du skriver i et felt, eller
 * en dialog er allerede åpen. ⌘K er unntaket og virker overalt.
 */
export function shouldIgnoreShortcut(e: KeyboardEvent): boolean {
  const target = e.target
  const typing =
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  return typing || document.querySelector('[role="dialog"]') !== null
}
