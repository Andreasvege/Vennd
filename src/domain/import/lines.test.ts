import { describe, it, expect } from 'vitest'
import { parseLines, splitStructured } from './lines'

describe('parseLines', () => {
  it('parser navn, parametre og verdi', () => {
    const lines = parseLines('ATTENDEE;CN=Ingrid Aas:mailto:ingrid@example.com')
    expect(lines).toEqual([
      { name: 'ATTENDEE', params: { CN: 'Ingrid Aas' }, value: 'mailto:ingrid@example.com', raw: 'mailto:ingrid@example.com' },
    ])
  })

  it('bretter fortsettelseslinjer som starter med mellomrom eller tab', () => {
    // Selve mellomrommet/tab-en som markerer fortsettelsen fjernes, resten av
    // linjen limes rett på – det er slik RFC 5545/6350 forventer det.
    const text = 'NOTE:En lang \r\n linje som \r\n\tfortsetter'
    expect(parseLines(text)).toEqual([{ name: 'NOTE', params: {}, value: 'En lang linje som fortsetter', raw: 'En lang linje som fortsetter' }])
  })

  it('håndterer CRLF og LF om hverandre', () => {
    const text = 'FN:Ingrid\nEMAIL:a@b.no\r\n'
    expect(parseLines(text).map((l) => l.name)).toEqual(['FN', 'EMAIL'])
  })

  it('hopper over blanke og ugyldige linjer', () => {
    const text = 'BEGIN:VCARD\n\nFEIL UTEN KOLON\nFN:Test\nEND:VCARD'
    expect(parseLines(text).map((l) => l.name)).toEqual(['BEGIN', 'FN', 'END'])
  })

  it('strider item-gruppeprefiks som item1.TEL', () => {
    const lines = parseLines('item1.TEL;TYPE=CELL:12345678\nitem1.X-ABLabel:_$!<Mobile>!$_')
    expect(lines[0]).toMatchObject({ name: 'TEL', params: { TYPE: 'CELL' }, value: '12345678' })
    expect(lines[1].name).toBe('X-ABLABEL')
  })

  it('unescaper \\n, \\, og \\; i verdien', () => {
    const lines = parseLines('NOTE:Linje 1\\nLinje 2\\, med komma og \\; semikolon')
    expect(lines[0].value).toBe('Linje 1\nLinje 2, med komma og ; semikolon')
  })

  it('unescaper \\N (stor N) som linjeskift', () => {
    expect(parseLines('NOTE:A\\NB')[0].value).toBe('A\nB')
  })

  it('fjerner anførselstegn rundt parameterverdier', () => {
    const lines = parseLines('X-FOO;PARAM="quoted value":verdi')
    expect(lines[0].params.PARAM).toBe('quoted value')
  })

  it('navn og parameternøkler blir store bokstaver', () => {
    expect(parseLines('fn;type=work:Test')[0]).toMatchObject({ name: 'FN', params: { TYPE: 'work' } })
  })
})

describe('splitStructured', () => {
  it('splitter på semikolon som ikke er escapet', () => {
    expect(splitStructured('Aas;Ingrid;;;')).toEqual(['Aas', 'Ingrid', '', '', ''])
  })

  it('lar escapet semikolon være del av verdien', () => {
    expect(splitStructured('Aas\\;Berg;Ingrid')).toEqual(['Aas;Berg', 'Ingrid'])
  })

  it('unescaper hver del', () => {
    expect(splitStructured('A\\,B;C\\nD')).toEqual(['A,B', 'C\nD'])
  })
})
