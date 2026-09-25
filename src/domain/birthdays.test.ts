import { describe, it, expect } from 'vitest'
import { nextBirthday, upcomingBirthdays } from './birthdays'

const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 10)

describe('nextBirthday', () => {
  it('finner bursdagen senere i år, med alder', () => {
    expect(nextBirthday(new Date(Date.UTC(1997, 9, 3, 12)), at(2026, 9, 26))).toMatchObject({ inDays: 7, turns: 29 })
  })
  it('er i dag når datoen er i dag', () => {
    expect(nextBirthday(new Date(Date.UTC(1990, 8, 26, 12)), at(2026, 9, 26))).toMatchObject({ inDays: 0, turns: 36 })
  })
  it('går over årsskiftet', () => {
    expect(nextBirthday(new Date(Date.UTC(1990, 0, 2, 12)), at(2026, 12, 30))).toMatchObject({ inDays: 3, turns: 37 })
  })
  it('29. februar feires 28. februar i vanlige år', () => {
    const b = nextBirthday(new Date(Date.UTC(2000, 1, 29, 12)), at(2027, 2, 20))
    expect(b.date.getMonth()).toBe(1)
    expect(b.date.getDate()).toBe(28)
  })
  it('ukjent år gir ingen alder', () => {
    expect(nextBirthday(new Date(Date.UTC(1900, 9, 3, 12)), at(2026, 9, 26)).turns).toBeNull()
  })
})

describe('upcomingBirthdays', () => {
  it('tar med de neste 14 dagene, nærmest først', () => {
    const persons = [
      { id: 'a', name: 'A', birthday: new Date(Date.UTC(1990, 9, 8, 12)) },
      { id: 'b', name: 'B', birthday: new Date(Date.UTC(1990, 8, 28, 12)) },
      { id: 'c', name: 'C', birthday: new Date(Date.UTC(1990, 11, 1, 12)) },
      { id: 'd', name: 'D', birthday: null },
    ]
    expect(upcomingBirthdays(persons, at(2026, 9, 26)).map((b) => b.id)).toEqual(['b', 'a'])
  })
})
