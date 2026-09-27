import { describe, expect, it } from 'vitest'
import { QUESTIONS, QUESTION_IDS, questionById, tighterCadence } from './questions'
import { t } from '@/i18n'

describe('spørsmålskortene', () => {
  it('har tekst for hvert spørsmål, og et miljønavn der de gir et miljø', () => {
    for (const id of QUESTION_IDS) {
      expect(t.questions.items[id].question).toBeTruthy()
      if (questionById(id)!.effect.group) expect(t.questions.items[id].group).toBeTruthy()
    }
    expect(QUESTIONS.map((q) => q.id)).toEqual([...QUESTION_IDS])
  })
})

describe('tighterCadence', () => {
  it('gjør bare kontakten tettere, aldri løsere', () => {
    expect(tighterCadence(4, 2)).toBe(2)
    expect(tighterCadence(null, 2)).toBe(2)
    expect(tighterCadence(1, 2)).toBeUndefined()
    expect(tighterCadence(4, undefined)).toBeUndefined()
  })
})
