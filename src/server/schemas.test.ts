import { describe, it, expect } from 'vitest'
import { tagName, tagInput, logInput, personInput, relationshipInput, phaseInput, factInput, relationshipPatch, mapViewInput, planInput } from './schemas'

describe('tagName', () => {
  it('trimmer og avviser tomme', () => {
    expect(tagName.parse('  Klatring ')).toBe('Klatring')
    expect(tagName.safeParse('   ').success).toBe(false)
  })
  it('avviser over 40 tegn', () => {
    expect(tagName.safeParse('x'.repeat(41)).success).toBe(false)
  })
})

describe('tagInput', () => {
  it('godtar bare farger fra paletten', () => {
    expect(tagInput.safeParse({ name: 'Jobb', color: 'teal' }).success).toBe(true)
    expect(tagInput.safeParse({ name: 'Jobb', color: '#ff0000' }).success).toBe(false)
  })
})

describe('logInput', () => {
  it('krever minst én deltaker', () => {
    expect(logInput.safeParse({ personIds: [], date: '2026-09-25' }).success).toBe(false)
  })
  it('godtar logg uten type og uten tekst', () => {
    expect(logInput.safeParse({ personIds: ['a'], date: '2026-09-25' }).success).toBe(true)
  })
  it('avviser ugyldig dato', () => {
    expect(logInput.safeParse({ personIds: ['a'], date: '25.09.2026' }).success).toBe(false)
    expect(logInput.safeParse({ personIds: ['a'], date: '2026-02-31' }).success).toBe(false)
  })
})

describe('personInput', () => {
  it('trimmer navn og tillater kadens null («aldri»)', () => {
    const p = personInput.parse({ name: ' Ingrid ', type: 'FRIEND', cadenceWeeks: null })
    expect(p.name).toBe('Ingrid')
    expect(p.cadenceWeeks).toBeNull()
  })
  it('avviser tomt navn og kadens utenfor 1–52', () => {
    expect(personInput.safeParse({ name: '  ', type: 'FRIEND' }).success).toBe(false)
    expect(personInput.safeParse({ name: 'A', type: 'FRIEND', cadenceWeeks: 0 }).success).toBe(false)
  })
})

describe('relationshipInput', () => {
  it('avviser relasjon til seg selv', () => {
    expect(relationshipInput.safeParse({ fromPersonId: 'a', toPersonId: 'a', type: 'FRIEND' }).success).toBe(false)
  })
  it('avviser slutt før start', () => {
    expect(
      relationshipInput.safeParse({
        fromPersonId: 'a', toPersonId: 'b', type: 'ROMANTIC', since: '2025-05-01', until: '2024-01-01',
      }).success,
    ).toBe(false)
  })
})

describe('phaseInput', () => {
  it('godtar kjente faser med gyldig dato', () => {
    expect(phaseInput.safeParse({ personId: 'a', phase: 'SEEING', at: '2026-09-02' }).success).toBe(true)
    expect(phaseInput.safeParse({ personId: 'a', phase: 'MARRIED', at: '2026-09-02' }).success).toBe(false)
  })
})

describe('logInput med tråder', () => {
  const base = { personIds: ['ingrid', 'martin'], date: '2026-09-25' }

  it('godtar tråder som lukkes med og uten utfall', () => {
    expect(
      logInput.safeParse({ ...base, closeThreads: [{ id: 't1', resolution: 'Fikk jobben' }, { id: 't2' }] }).success,
    ).toBe(true)
  })

  it('godtar nye tråder for personer som er med i loggen', () => {
    expect(
      logInput.safeParse({ ...base, newThreads: [{ title: 'Første uke i ny jobb', personIds: ['ingrid'] }] }).success,
    ).toBe(true)
  })

  it('avviser en ny tråd for noen som ikke er med i loggen', () => {
    expect(
      logInput.safeParse({ ...base, newThreads: [{ title: 'Fjellturen', personIds: ['ola'] }] }).success,
    ).toBe(false)
  })

  it('avviser en ny tråd uten tittel eller uten personer', () => {
    expect(logInput.safeParse({ ...base, newThreads: [{ title: '  ', personIds: ['ingrid'] }] }).success).toBe(false)
    expect(logInput.safeParse({ ...base, newThreads: [{ title: 'X', personIds: [] }] }).success).toBe(false)
  })
})

describe('factInput', () => {
  it('trimmer og krever både etikett og verdi', () => {
    expect(factInput.parse({ label: ' Jobb ', value: ' Statkraft ' })).toEqual({ label: 'Jobb', value: 'Statkraft' })
    expect(factInput.safeParse({ label: 'Jobb', value: '  ' }).success).toBe(false)
  })
})

describe('relationshipPatch', () => {
  it('godtar å avslutte med bare until', () => {
    expect(relationshipPatch.safeParse({ until: '2026-09-25' }).success).toBe(true)
  })
  it('avviser slutt før start', () => {
    expect(relationshipPatch.safeParse({ since: '2026-01-01', until: '2025-01-01' }).success).toBe(false)
  })
})

describe('mapViewInput', () => {
  const filter = { hiddenTags: [], showUntagged: true, hideRomanticEdges: true, showHistorical: true, showDerived: false }
  it('godtar et kjent syn med fullt filter', () => {
    expect(mapViewInput.safeParse({ name: 'Vis til andre', mode: 'nearness', filter }).success).toBe(true)
  })
  it('avviser ukjent syn, tomt navn og ufullstendig filter', () => {
    expect(mapViewInput.safeParse({ name: 'X', mode: 'globe', filter }).success).toBe(false)
    expect(mapViewInput.safeParse({ name: ' ', mode: 'network', filter }).success).toBe(false)
    expect(mapViewInput.safeParse({ name: 'X', mode: 'network', filter: {} }).success).toBe(false)
  })
})

describe('planInput', () => {
  it('godtar plan med og uten klokkeslett', () => {
    expect(planInput.safeParse({ title: 'Middag', personIds: ['a'], date: '2026-10-03' }).success).toBe(true)
    expect(
      planInput.safeParse({ title: 'Date', personIds: ['a'], date: '2026-10-01', at: '2026-10-01T17:30:00.000Z', type: 'DATE' }).success,
    ).toBe(true)
  })
  it('krever tittel og minst én person', () => {
    expect(planInput.safeParse({ title: ' ', personIds: ['a'], date: '2026-10-03' }).success).toBe(false)
    expect(planInput.safeParse({ title: 'X', personIds: [], date: '2026-10-03' }).success).toBe(false)
  })
})
