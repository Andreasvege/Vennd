import { describe, it, expect } from 'vitest'
import { cadenceFromOption, cadenceToOption } from './cadence-options'

describe('kadensvalg', () => {
  it('gjør null om til «aldri» og tilbake', () => {
    expect(cadenceToOption(null)).toBe('never')
    expect(cadenceFromOption('never')).toBeNull()
  })

  it('beholder en kadens som finnes i lista', () => {
    expect(cadenceToOption(4)).toBe('4')
    expect(cadenceFromOption('4')).toBe(4)
  })

  it('runder en ukjent kadens til nærmeste valg', () => {
    expect(cadenceToOption(5)).toBe('4')
    expect(cadenceToOption(20)).toBe('26')
  })
})
