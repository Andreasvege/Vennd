// Tema lagres lokalt i nettleseren: det er en visningsinnstilling for denne
// enheten, ikke noe som hører hjemme i databasen.
export const THEME_KEY = 'theme'
export type ThemeChoice = 'system' | 'light' | 'dark'

// Kjøres i <head> før første maling, så siden aldri blinker i feil tema.
// Må være selvstendig (ingen imports) — den settes inn som ren tekst.
export const themeScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}})()`

export function readTheme(): ThemeChoice {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    return stored === 'light' || stored === 'dark' ? stored : 'system'
  } catch {
    return 'system'
  }
}

export function applyTheme(choice: ThemeChoice): void {
  const root = document.documentElement
  try {
    if (choice === 'system') localStorage.removeItem(THEME_KEY)
    else localStorage.setItem(THEME_KEY, choice)
  } catch {
    // Privat modus eller blokkert lagring: temaet gjelder bare denne visningen.
  }
  if (choice === 'system') delete root.dataset.theme
  else root.dataset.theme = choice
}
