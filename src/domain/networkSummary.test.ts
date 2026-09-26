import { it, expect } from 'vitest'
import { summarizeNetwork } from './networkSummary'

const typeName = (t: string) => ({ FRIEND: 'venn', FAMILY: 'familie' })[t] ?? t

it('beskriver en tett gruppe med én linje, og tar med det som sier noe mer', () => {
  const persons = ['a', 'b', 'c', 'd'].map((id) => ({ id, name: id.toUpperCase(), groupId: 'radio', mine: null }))
  const relations = [
    ['a', 'b'],
    ['a', 'c'],
    ['a', 'd'],
    ['b', 'c'],
    ['b', 'd'],
    ['c', 'd'],
  ].map(([from, to]) => ({ from, to, type: 'FRIEND', label: from === 'a' && to === 'b' ? 'kjærester' : null }))
  const text = summarizeNetwork(persons, relations, [{ id: 'radio', name: 'Radio Nova' }], typeName)
  expect(text).toContain('## Radio Nova (4)')
  expect(text).toContain('Alle i dette miljøet kjenner hverandre.')
  expect(text).toContain('A – B: venn («kjærester», A om B)')
  expect(text.match(/–/g)).toHaveLength(1)
})

it('lister relasjoner i spredte grupper og på tvers, og hva folk er for brukeren', () => {
  const persons = [
    { id: 'n', name: 'Nora Hjorthaug', groupId: null, mine: 'kusine' },
    { id: 'h', name: 'Håvard Vege', groupId: null, mine: null },
    { id: 'm', name: 'Mari', groupId: 'radio', mine: null },
  ]
  const relations = [
    { from: 'n', to: 'h', type: 'FAMILY', label: 'kusine' },
    { from: 'h', to: 'm', type: 'FRIEND', label: null },
  ]
  const text = summarizeNetwork(persons, relations, [{ id: 'radio', name: 'Radio Nova' }], typeName)
  expect(text).toContain('Nora Hjorthaug [brukerens kusine]')
  expect(text).toContain('Nora Hjorthaug – Håvard Vege: familie («kusine», Nora Hjorthaug om Håvard Vege)')
  expect(text).toContain('## På tvers av miljøer\nHåvard Vege – Mari: venn')
})
