import { it, expect } from 'vitest'
import { uniqueById } from './uniqueById'

it('beholder første forekomst av hver id, i rekkefølge', () => {
  expect(uniqueById([{ id: 'a', n: 1 }, { id: 'b', n: 2 }, { id: 'a', n: 3 }])).toEqual([
    { id: 'a', n: 1 },
    { id: 'b', n: 2 },
  ])
})
