// Speiler CSS-variablene i globals.css. CSS er sannheten for rendering;
// denne fila finnes for testene og for SVG som trenger faktiske verdier.
// Endrer du en farge, endre den begge steder — kontrasttesten fanger feil.
export type TokenName =
  | 'paper'
  | 'paper-raised'
  | 'ink'
  | 'ink-muted'
  | 'rule'
  | 'pen'
  | 'pen-wash'
  | 'redpencil'

export const TOKENS: Record<'light' | 'dark', Record<TokenName, string>> = {
  light: {
    paper: '#F3EEE4',
    'paper-raised': '#FAF7F1',
    ink: '#27231E',
    'ink-muted': '#6B6257',
    rule: '#DDD3C3',
    pen: '#26386E',
    'pen-wash': '#E4E7F1',
    redpencil: '#B23A2A',
  },
  dark: {
    paper: '#1B1916',
    'paper-raised': '#24211D',
    ink: '#ECE5D8',
    'ink-muted': '#A69D90',
    rule: '#3A352F',
    pen: '#A9B8EE',
    'pen-wash': '#262B3D',
    redpencil: '#EE8A78',
  },
}
