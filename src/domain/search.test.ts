import { describe, it, expect } from 'vitest'
import { fold, interpretQuery, snippet } from './search'

const persons = [
  { id: 'ingrid', name: 'Ingrid Aas' },
  { id: 'ingrid2', name: 'Ingrid Berg' },
  { id: 'martin', name: 'Martin Nilsen' },
  { id: 'soren', name: 'Søren Ødegård' },
]

describe('fold', () => {
  it('ser bort fra store bokstaver og aksenter, men beholder æøå', () => {
    expect(fold('Café ÆØÅ')).toBe('cafe æøå')
  })
})

describe('interpretQuery', () => {
  it('gjør navneprefiks til personfilter og resten til fritekst', () => {
    expect(interpretQuery('martin fjelltur', persons)).toEqual({ people: [['martin']], terms: ['fjelltur'] })
  })

  it('treffer etternavn også', () => {
    expect(interpretQuery('nilsen', persons).people).toEqual([['martin']])
  })

  it('samler alle med samme fornavn i én gruppe', () => {
    expect(interpretQuery('ingrid', persons).people).toEqual([['ingrid', 'ingrid2']])
  })

  it('krever minst tre tegn for å tolke et ord som navn', () => {
    expect(interpretQuery('in tur', persons)).toEqual({ people: [], terms: ['in', 'tur'] })
  })

  it('ignorerer ord under to tegn, men ikke når det bare er ett ord', () => {
    expect(interpretQuery('å tur', persons).terms).toEqual(['tur'])
    expect(interpretQuery('å', persons).terms).toEqual(['å'])
  })

  it('bevarer æøå når navn tolkes', () => {
    expect(interpretQuery('søren', persons).people).toEqual([['soren']])
    expect(interpretQuery('soren', persons).people).toEqual([])
  })

  it('finner navn uten å bry seg om aksenter, men beholder dem i fritekst', () => {
    expect(interpretQuery('Café Martín', persons)).toEqual({ people: [['martin']], terms: ['café'] })
  })

  it('gir tomt resultat for tomt søk', () => {
    expect(interpretQuery('   ', persons)).toEqual({ people: [], terms: [] })
  })
})

describe('snippet', () => {
  it('markerer treffene', () => {
    expect(snippet('Hun fikk jobben i Statkraft', ['jobben'])).toEqual([
      { text: 'Hun fikk ', match: false },
      { text: 'jobben', match: true },
      { text: ' i Statkraft', match: false },
    ])
  })

  it('kutter lang tekst rundt første treff, med ellipse', () => {
    const text = `${'a '.repeat(100)}intervju${' b'.repeat(100)}`
    const parts = snippet(text, ['intervju'], 10)
    expect(parts[0].text.startsWith('…')).toBe(true)
    expect(parts.at(-1)!.text.endsWith('…')).toBe(true)
    expect(parts.find((p) => p.match)?.text).toBe('intervju')
  })

  it('markerer flere ord, uten å bry seg om store bokstaver', () => {
    const parts = snippet('Tur og Kaffe', ['kaffe', 'tur'])
    expect(parts.filter((p) => p.match).map((p) => p.text)).toEqual(['Tur', 'Kaffe'])
  })

  it('gir starten av teksten når ingenting treffer', () => {
    expect(snippet('Kort tekst', ['xyz'])).toEqual([{ text: 'Kort tekst', match: false }])
  })
})
