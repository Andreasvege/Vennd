import { describe, it, expect } from 'vitest'
import { parseVCards } from './vcard'

// iPhone/iCloud-eksport: item-gruppe på e-post, brettet NOTE, bursdag uten år.
const IPHONE = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'N:Aas;Ingrid;;;',
  'FN:Ingrid Aas',
  'item1.EMAIL;type=INTERNET;type=HOME;type=pref:ingrid@example.com',
  'item1.X-ABLabel:_$!<Home>!$_',
  'TEL;type=CELL;type=VOICE;type=pref:+47 123 45 678',
  'BDAY:--08-14',
  'NOTE:Møtte henne på fjelltur.\\nHar to ',
  ' katter.',
  'END:VCARD',
].join('\r\n')

// Google Contacts-eksport: full BDAY med år, N uten FN.
const GOOGLE_WITH_FN = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'N:Nilsen;Martin;;;',
  'FN:Martin Nilsen',
  'EMAIL;type=INTERNET:martin.nilsen@gmail.com',
  'TEL;type=CELL:98765432',
  'BDAY:1990-03-05',
  'END:VCARD',
].join('\n')

const NO_FN_ONLY_N = ['BEGIN:VCARD', 'VERSION:3.0', 'N:Berg;Sofie;;;', 'BDAY:19850712', 'END:VCARD'].join('\n')

const COMPANY_ONLY = ['BEGIN:VCARD', 'VERSION:3.0', 'ORG:Acme AS;', 'X-ABShowAs:COMPANY', 'END:VCARD'].join('\n')

const ORG_WITHOUT_NAME = ['BEGIN:VCARD', 'VERSION:3.0', 'ORG:Acme AS;', 'END:VCARD'].join('\n')

const NO_NAME_AT_ALL = ['BEGIN:VCARD', 'VERSION:3.0', 'TEL:12345678', 'END:VCARD'].join('\n')

describe('parseVCards', () => {
  it('leser navn, e-post (uten item-gruppeprefiks), telefon, bursdag uten år, og brettet notat', () => {
    const [c] = parseVCards(IPHONE)
    expect(c).toEqual({
      key: 'c0',
      name: 'Ingrid Aas',
      birthday: '1900-08-14',
      phone: '+47 123 45 678',
      email: 'ingrid@example.com',
      note: 'Møtte henne på fjelltur.\nHar to katter.',
    })
  })

  it('leser full bursdag med år (Google-format)', () => {
    const [c] = parseVCards(GOOGLE_WITH_FN)
    expect(c).toMatchObject({ name: 'Martin Nilsen', birthday: '1990-03-05', email: 'martin.nilsen@gmail.com', phone: '98765432' })
  })

  it('setter sammen navn fra N når FN mangler', () => {
    const [c] = parseVCards(NO_FN_ONLY_N)
    expect(c).toMatchObject({ name: 'Sofie Berg', birthday: '1985-07-12' })
  })

  it('hopper over kontakter som bare er en organisasjon (X-ABShowAs:COMPANY)', () => {
    expect(parseVCards(COMPANY_ONLY)).toEqual([])
  })

  it('hopper over ORG uten FN/N', () => {
    expect(parseVCards(ORG_WITHOUT_NAME)).toEqual([])
  })

  it('hopper over kontakter uten navn i det hele tatt', () => {
    expect(parseVCards(NO_NAME_AT_ALL)).toEqual([])
  })

  it('gir stabile index-baserte nøkler, og hopper over ugyldige uten å forstyrre nummereringen', () => {
    const text = [COMPANY_ONLY, IPHONE, GOOGLE_WITH_FN].join('\n')
    const contacts = parseVCards(text)
    expect(contacts.map((c) => c.key)).toEqual(['c0', 'c1'])
    expect(contacts.map((c) => c.name)).toEqual(['Ingrid Aas', 'Martin Nilsen'])
  })

  it('tar med flere kort i samme fil', () => {
    const text = [IPHONE, GOOGLE_WITH_FN].join('\n')
    expect(parseVCards(text)).toHaveLength(2)
  })

  it('tar første TEL og EMAIL når det er flere', () => {
    const text = [
      'BEGIN:VCARD',
      'FN:To Numre',
      'TEL:111',
      'TEL:222',
      'EMAIL:a@a.no',
      'EMAIL:b@b.no',
      'END:VCARD',
    ].join('\n')
    const [c] = parseVCards(text)
    expect(c.phone).toBe('111')
    expect(c.email).toBe('a@a.no')
  })

  it('lower-caser e-post og fjerner mailto:', () => {
    const text = ['BEGIN:VCARD', 'FN:Test', 'EMAIL:mailto:Test@Example.COM', 'END:VCARD'].join('\n')
    expect(parseVCards(text)[0].email).toBe('test@example.com')
  })

  it('tomt NOTE blir null', () => {
    const text = ['BEGIN:VCARD', 'FN:Test', 'NOTE:   ', 'END:VCARD'].join('\n')
    expect(parseVCards(text)[0].note).toBeNull()
  })

  it('gir null for ugyldig BDAY', () => {
    const text = ['BEGIN:VCARD', 'FN:Test', 'BDAY:ikke-en-dato', 'END:VCARD'].join('\n')
    expect(parseVCards(text)[0].birthday).toBeNull()
  })

  it('YYYYMMDD-format uten skilletegn', () => {
    const text = ['BEGIN:VCARD', 'FN:Test', 'BDAY:20001231', 'END:VCARD'].join('\n')
    expect(parseVCards(text)[0].birthday).toBe('2000-12-31')
  })

  it('--MMDD uten bindestrek mellom måned og dag', () => {
    const text = ['BEGIN:VCARD', 'FN:Test', 'BDAY:--0814', 'END:VCARD'].join('\n')
    expect(parseVCards(text)[0].birthday).toBe('1900-08-14')
  })

  it('ISO-bursdag med klokkeslett tar bare datodelen', () => {
    const text = ['BEGIN:VCARD', 'FN:Test', 'BDAY:1990-03-05T00:00:00Z', 'END:VCARD'].join('\n')
    expect(parseVCards(text)[0].birthday).toBe('1990-03-05')
  })

  it('ignorerer tekst utenfor BEGIN/END-blokker', () => {
    const text = 'FN:Utenfor\n' + ['BEGIN:VCARD', 'FN:Inni', 'END:VCARD'].join('\n')
    const contacts = parseVCards(text)
    expect(contacts).toHaveLength(1)
    expect(contacts[0].name).toBe('Inni')
  })

  it('tom fil gir tom liste', () => {
    expect(parseVCards('')).toEqual([])
  })
})
