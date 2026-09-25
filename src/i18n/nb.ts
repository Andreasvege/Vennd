// All synlig tekst. Nøklene er gruppert etter skjerm, og tekst med
// variabler er funksjoner. Et nytt språk er en fil med samme form (Messages).
//
// Skrivestil: vanlige verb, stor forbokstav bare først i setningen, og
// knapper som sier nøyaktig hva som skjer («Lagre», ikke «Send inn»).
// Feilmeldinger forklarer hva som gikk galt og hva du kan gjøre.

export const nb = {
  time: {
    today: 'i dag',
    yesterday: 'i går',
    daysAgo: (days: number) => `${days} dager siden`,
  },

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
    main: 'Hovedmeny',
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
    ROMANTIC: 'Romantisk',
    ACQUAINTANCE: 'Bekjent',
    OTHER: 'Annet',
  },

  logType: {
    MET: 'Møttes',
    CALLED: 'Ringte',
    MESSAGE: 'Melding',
    DATE: 'Date',
    OTHER: 'Annet',
  },

  phase: {
    FIRST_DATE: 'Første date',
    SEEING: 'Ser hverandre',
    EXCLUSIVE: 'Eksklusive',
    PARTNER: 'Kjærester',
    ENDED: 'Avsluttet',
    label: 'Fase',
  },

  errors: {
    invalid: 'Noe i skjemaet er ikke fylt ut riktig.',
    'not-found': 'Fant det ikke lenger. Last siden på nytt.',
    taken: 'Du har allerede en tagg med det navnet.',
    failed: 'Det ble ikke lagret. Sjekk nettforbindelsen og prøv igjen.',
  },

  colors: {
    sage: 'Salvie',
    ochre: 'Oker',
    slate: 'Skifer',
    plum: 'Plomme',
    rose: 'Rose',
    teal: 'Blågrønn',
    clay: 'Leire',
    stone: 'Stein',
  },

  tags: {
    label: 'Tagger',
    add: 'Legg til tagg',
    create: (name: string) => `Opprett «${name}»`,
    primary: 'Hovedtagg',
    makePrimary: (name: string) => `Gjør ${name} til hovedtagg`,
    remove: (name: string) => `Fjern ${name}`,
    hint: 'Hovedtaggen gir personen farge på kartet.',
    empty: 'Du har ingen tagger ennå. De lages når du gir en person en tagg.',
    count: (n: number) => (n === 1 ? '1 person' : `${n} personer`),
    rename: (name: string) => `Nytt navn på ${name}`,
    color: (name: string) => `Farge på ${name}`,
    deleteConfirm: (n: number) =>
      n === 0 ? 'Slett taggen?' : `Taggen fjernes fra ${n === 1 ? '1 person' : `${n} personer`}. Slette?`,
    nameTaken: 'Du har allerede en tagg med det navnet.',
  },

  thread: {
    ask: 'Spør om',
    askAbout: (title: string) => `Spør om: ${title}`,
    close: (title: string) => `Marker «${title}» som fulgt opp`,
    since: (date: string) => `fra ${date}`,
    withOthers: (names: string) => `også ${names}`,
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
    loadFailed: 'Kartet ble ikke lastet. Sjekk nettforbindelsen og last siden på nytt.',
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
    facts: 'Å huske',
    with: (names: string) => `med ${names}`,
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
    open: (count: number) =>
      count === 0 ? 'Vis påminnelser' : `Vis påminnelser, ${count} ${count === 1 ? 'person' : 'personer'}`,
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
    tags: 'Tagger',
  },
  appError: {
    title: 'Noe gikk galt',
    body: 'Siden kunne ikke vises. Det du har lagret er trygt.',
    retry: 'Prøv igjen',
  },

  notFound: {
    title: 'Den siden finnes ikke',
    body: 'Kanskje personen er slettet, eller lenken er gammel.',
    back: 'Tilbake til kartet',
  },
} as const

// Formen et språk må ha: samme nøkler, men vilkårlige strenger. Uten
// utvidelsen ville typen krevd nøyaktig de norske tekstene.
type Widen<T> = T extends string
  ? string
  : T extends (...args: infer A) => infer R
    ? (...args: A) => Widen<R>
    : { [K in keyof T]: Widen<T[K]> }

export type Messages = Widen<typeof nb>
