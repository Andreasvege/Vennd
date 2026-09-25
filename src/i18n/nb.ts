// All synlig tekst. Nøklene er gruppert etter skjerm, og tekst med
// variabler er funksjoner. Et nytt språk er en fil med samme form (Messages).
//
// Skrivestil: vanlige verb, stor forbokstav bare først i setningen, og
// knapper som sier nøyaktig hva som skjer («Lagre», ikke «Send inn»).
// Feilmeldinger forklarer hva som gikk galt og hva du kan gjøre.

export const nb = {
  app: {
    name: 'Vennekart',
    description: 'En dagbok over menneskene dine',
  },

  nav: {
    map: 'Kart',
    settings: 'Innstillinger',
    signIn: 'Logg inn med Google',
    signOut: 'Logg ut',
    account: 'Konto',
  },

  landing: {
    lead: 'En dagbok over menneskene dine: hva dere snakket om, og hva du bør spørre om neste gang.',
  },

  common: {
    save: 'Lagre',
    saving: 'Lagrer …',
    cancel: 'Avbryt',
    close: 'Lukk',
    edit: 'Rediger',
    delete: 'Slett',
    optional: 'Valgfritt',
    loading: 'Laster …',
    back: 'Tilbake',
    you: 'Deg',
    choosePerson: 'Velg person',
  },

  relationType: {
    FRIEND: 'Venn',
    FAMILY: 'Familie',
    COLLEAGUE: 'Kollega',
    PARTNER: 'Partner',
    ACQUAINTANCE: 'Bekjent',
    OTHER: 'Annet',
  },

  logType: {
    MET: 'Møttes',
    CALLED: 'Ringte',
    MESSAGE: 'Melding',
    OTHER: 'Annet',
  },

  cadence: {
    label: 'Minn meg på å ta kontakt',
    every: (weeks: number) => (weeks === 1 ? 'Hver uke' : `Hver ${weeks}. uke`),
    never: 'Aldri',
    hint: 'Foreslått fra relasjonstypen. Velg «Aldri» for folk du bare vil ha på kartet.',
    summary: (weeks: number | null) =>
      weeks === null
        ? 'ingen påminnelser'
        : weeks === 1
          ? 'påminnelse hver uke'
          : `påminnelse hver ${weeks}. uke`,
  },

  map: {
    newPerson: 'Ny person',
    newRelationship: 'Relasjon',
    logContact: 'Logg',
    viewProfile: 'Profil',
    emptyTitle: 'Kartet ditt er tomt',
    emptyBody: 'Legg til en du har truffet i det siste.',
    legend: 'Forklaring',
  },

  person: {
    profile: 'Profil',
    relationship: 'Relasjon',
    name: 'Navn',
    namePlaceholder: 'Ingrid Aas',
    birthday: 'Bursdag',
    birthdayLabel: (date: string) => `Bursdag ${date}`,
    notes: 'Notat',
    notesPlaceholder: 'Vurderer å flytte til Bergen …',
    added: (date: string) => `Lagt til ${date}`,
    reminders: 'Påminnelser',
    log: 'Kontaktlogg',
    noLog: 'Ingen logget kontakt ennå.',
    backToMap: 'Tilbake til kartet',
    backToProfile: (name: string) => `Tilbake til ${name}`,
    editTitle: (name: string) => `Rediger ${name}`,
    addTitle: 'Ny person',
    add: 'Legg til',
    adding: 'Legger til …',
    deleteForGood: 'Slett for godt',
    deleteWarning: (name: string) =>
      `Sletter også all logg, påminnelser og relasjoner for ${name}. Dette kan ikke angres.`,
    saveFailed: 'Endringene ble ikke lagret. Sjekk nettforbindelsen og prøv igjen.',
    addFailed: 'Personen ble ikke lagt til. Sjekk nettforbindelsen og prøv igjen.',
    deleteFailed: 'Personen ble ikke slettet. Prøv igjen.',
  },

  log: {
    title: 'Logg kontakt',
    action: 'Logg kontakt',
    what: (name: string) => `Hva skjedde med ${name}?`,
    type: 'Type',
    date: 'Dato',
    note: 'Notat',
    notePlaceholder: 'Tur rundt Ekebergsletta …',
    person: 'Person',
    save: 'Lagre',
    failed: 'Loggen ble ikke lagret. Sjekk nettforbindelsen og prøv igjen.',
    loadPersonsFailed: 'Klarte ikke hente personene dine. Last siden på nytt.',
    empty: 'Ingen kontakter logget ennå',
    more: (n: number) => `${n} til`,
    recent: 'Sist logget',
  },

  relationship: {
    title: 'Ny relasjon',
    from: 'Fra',
    to: 'Til',
    type: 'Relasjonstype',
    add: 'Legg til relasjon',
    samePerson: 'Velg to forskjellige personer.',
    failed: 'Relasjonen ble ikke lagt til. Prøv igjen.',
  },

  reminders: {
    title: 'Bør ta kontakt',
    open: 'Vis påminnelser',
    empty: 'Ingen du bør ta kontakt med akkurat nå.',
    snooze: 'Utsett en uke',
    dismiss: 'Avvis',
    neverContacted: 'Ingen kontakt logget ennå',
    weeksSince: (weeks: number) => `${weeks === 1 ? 'En uke' : `${weeks} uker`} siden sist`,
  },

  settings: {
    title: 'Innstillinger',
    account: 'Konto',
    appearance: 'Utseende',
    theme: 'Tema',
    themeSystem: 'Som systemet',
    themeLight: 'Lys',
    themeDark: 'Mørk',
    relationTypes: 'Relasjonstyper',
    relationTypesHint: 'Fargen på en person på kartet kommer fra relasjonstypen.',
  },
} as const

export type Messages = typeof nb
