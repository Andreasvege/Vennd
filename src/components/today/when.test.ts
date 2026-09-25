import { describe, it, expect } from 'vitest'
import { whenLabel, birthdayLabel } from './when'

const NOW = new Date(2026, 8, 26, 10) // lørdag

describe('whenLabel', () => {
  it('i dag med klokkeslett', () => {
    expect(whenLabel(new Date(2026, 8, 26, 19, 30), true, NOW)).toBe('i dag 19:30')
  })
  it('i morgen uten klokkeslett', () => {
    expect(whenLabel(new Date(2026, 8, 27, 12), false, NOW)).toBe('i morgen')
  })
  it('ukedag innen en uke', () => {
    expect(whenLabel(new Date(2026, 8, 30, 12), false, NOW)).toBe('onsdag')
  })
})

describe('birthdayLabel', () => {
  it('sier i dag, i morgen og om n dager', () => {
    expect(birthdayLabel(0)).toBe('i dag')
    expect(birthdayLabel(1)).toBe('i morgen')
    expect(birthdayLabel(5)).toBe('om 5 dager')
  })
})
