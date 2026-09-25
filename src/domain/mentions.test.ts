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
  it('ettordsnavn treffes bare med stor forbokstav', () => {
    expect(findMentions('Ringte Mamma', P).sure).toEqual(['mamma'])
    expect(findMentions('ringte mamma', P).sure).toEqual([])
  })
  it('ettordsnavn som også er vanlige ord blir ikke lagt til', () => {
    const people = [{ id: 'vaar', name: 'Vår' }, { id: 'mai', name: 'Mai' }]
    expect(findMentions('vår tur i mai', people)).toEqual({ sure: [], maybe: [] })
  })
  it('to med samme fulle navn legges ikke til, men foreslås', () => {
    const twins = [{ id: 'a', name: 'Ola Nordmann' }, { id: 'b', name: 'Ola Nordmann' }]
    expect(findMentions('Traff Ola Nordmann', twins)).toEqual({
      sure: [],
      maybe: [{ word: 'Ola Nordmann', ids: ['a', 'b'] }],
    })
  })
  it('gir hver person bare én gang, i rekkefølgen de nevnes', () => {
    expect(findMentions('Martin, så Øyvind, så Martin igjen', P).sure).toEqual(['martin', 'oyv'])
  })
})
