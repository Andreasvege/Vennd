import { describe, it, expect } from 'vitest'
import { relativeDay, initialsOf, todayISO } from './format'

// 25. sep 2026 kl. 00:30 lokal tid — rett etter midnatt, der UTC-baserte
// beregninger feilaktig sier at gårsdagens logg var «i dag».
const NOW = new Date(2026, 8, 25, 0, 30)

describe('relativeDay', () => {
  it('sier «i dag» for tidligere samme lokale døgn', () => {
    expect(relativeDay(new Date(2026, 8, 25, 0, 5), NOW)).toBe('i dag')
  })
  it('sier «i går» for sent i går kveld', () => {
    expect(relativeDay(new Date(2026, 8, 24, 23, 50), NOW)).toBe('i går')
  })
  it('teller dager innen en uke', () => {
    expect(relativeDay(new Date(2026, 8, 21, 12), NOW)).toBe('4 dager siden')
  })
  it('viser dag og måned for eldre datoer i år', () => {
    expect(relativeDay(new Date(2026, 5, 3), NOW)).toMatch(/^3\. juni$/)
  })
  it('tar med år for tidligere år', () => {
    expect(relativeDay(new Date(2025, 11, 24), NOW)).toMatch(/^24\. des\.? 2025$/)
  })
  it('behandler framtidige datoer som dato, ikke negative dager', () => {
    expect(relativeDay(new Date(2026, 9, 1), NOW)).toMatch(/^1\. oktober$/)
  })
})

describe('initialsOf', () => {
  it('tar første bokstav i to første ord', () => {
    expect(initialsOf('Ingrid Aas')).toBe('IA')
  })
  it('behandler bindestrek som ett ord og kutter til to', () => {
    expect(initialsOf('Kristine Margrethe Aas-Johansen')).toBe('KM')
  })
  it('tåler ett navn og ekstra mellomrom', () => {
    expect(initialsOf('  mamma ')).toBe('M')
  })
  it('gir tom streng for tomt navn', () => {
    expect(initialsOf('   ')).toBe('')
  })
})

describe('todayISO', () => {
  it('gir lokal dato rett etter midnatt, ikke UTC-gårsdagen', () => {
    expect(todayISO(NOW)).toBe('2026-09-25')
  })
})
