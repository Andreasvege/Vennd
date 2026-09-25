import { describe, it, expect } from 'vitest'
import { findMentions } from './mentions'

const P = [
  { id: 'ingrid', name: 'Ingrid Aas' },
  { id: 'martin', name: 'Martin Nilsen' },
  { id: 'mai', name: 'Mai Berg' },
  { id: 'ingrid2', name: 'Ingrid Lie' },
  { id: 'oyv', name: 'Øyvind Moe' },
  { id: 'mamma', name: 'Mamma' },
]

describe('findMentions', () => {
  it('finner fullt navn uten hensyn til store og små bokstaver', () => {
    expect(findMentions('middag med ingrid aas', P).sure).toEqual(['ingrid'])
  })
  it('entydig fornavn med stor forbokstav er sikkert', () => {
    expect(findMentions('Middag med Martin', P).sure).toEqual(['martin'])
  })
  it('tåler genitiv', () => {
    expect(findMentions('Martins nye jobb', P).sure).toEqual(['martin'])
    expect(findMentions("Martin's nye jobb", P).sure).toEqual(['martin'])
  })
  it('vanlige ord med liten forbokstav er ikke navn', () => {
    expect(findMentions('tur i mai', P)).toEqual({ sure: [], maybe: [] })
  })
  it('tvetydig fornavn blir et spørsmål, ikke et valg', () => {
    expect(findMentions('Kaffe med Ingrid', P)).toEqual({
      sure: [],
      maybe: [{ word: 'Ingrid', ids: ['ingrid', 'ingrid2'] }],
    })
  })
  it('fullt navn løser tvetydigheten', () => {
    expect(findMentions('Kaffe med Ingrid Lie', P)).toEqual({ sure: ['ingrid2'], maybe: [] })
  })
  it('treffer ikke inni andre ord', () => {
    expect(findMentions('Martinsen kom også', P).sure).toEqual([])
  })
  it('håndterer norske bokstaver', () => {
    expect(findMentions('Ringte Øyvind', P).sure).toEqual(['oyv'])
  })
  it('ettordsnavn som «Mamma» treffes med stor eller liten forbokstav', () => {
    expect(findMentions('ringte mamma', P).sure).toEqual(['mamma'])
  })
  it('gir hver person bare én gang, i rekkefølgen de nevnes', () => {
    expect(findMentions('Martin, så Øyvind, så Martin igjen', P).sure).toEqual(['martin', 'oyv'])
  })
})
