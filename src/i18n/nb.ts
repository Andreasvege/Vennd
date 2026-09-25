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
    today: 'I dag',
    log: 'Logg',
    tabs: 'Faner',
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

  composer: {
    title: 'Ny logg',
    open: 'Skriv',
    openHint: 'Skriv (N)',
    prompt: 'Hva skjedde, og med hvem?',
    text: 'Hva skjedde?',
    today: 'I dag',
    yesterday: 'I går',
    otherDay: 'Annen dag',
    when: 'Når',
    type: 'Type',
    with: 'Med',
    addPerson: 'Legg til person',
    newPerson: (name: string) => `Legg til «${name}» som ny person`,
    removePerson: (name: string) => `Fjern ${name}`,
    didYouMean: (word: string) => `Hvilken ${word}?`,
    openThreads: 'Åpne tråder med dem',
    followedUp: (title: string) => `Fulgt opp: ${title}`,
    howItWent: 'Hvordan gikk det?',
    howItWentPlaceholder: 'Fikk jobben',
    followUp: 'Noe å følge opp?',
    followUpPlaceholder: 'Første uka i ny jobb',
    followUpAbout: 'Gjelder',
    removeFollowUp: 'Fjern linjen',
    save: 'Lagre',
    saveHint: '⌘ Enter',
    draftRestored: 'Fortsetter der du slapp.',
    discardDraft: 'Forkast kladd',
    needPerson: 'Velg minst én person loggen gjelder.',
    saved: (closed: number, opened: number) =>
      ['Lagret.', closed > 0 && `${closed === 1 ? '1 tråd' : `${closed} tråder`} fulgt opp.`, opened > 0 && `${opened === 1 ? '1 ny tråd' : `${opened} nye tråder`}.`]
        .filter(Boolean)
        .join(' '),
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

  facts: {
    add: 'Legg til',
    label: 'Hva',
    value: 'Svar',
    labelPlaceholder: 'Jobb',
    valuePlaceholder: 'Statkraft, fra november',
    editLabel: (label: string) => `Navn på opplysningen ${label}`,
    editValue: (label: string) => `${label}`,
    remove: (label: string) => `Fjern ${label}`,
    empty: 'Noe du vil huske om dem? Jobb, partner, hva de liker.',
    suggestions: ['Jobb', 'Partner', 'Barn', 'Bor', 'Liker', 'Obs'],
  },

  phaseControl: {
    start: 'Start: Første date',
    next: (label: string) => `Neste: ${label}`,
    end: 'Avslutt',
    confirmEnd: 'Avslutte? Det blir stående i historikken.',
  },

  relations: {
    title: 'Relasjoner',
    add: 'Legg til relasjon',
    person: 'Hvem',
    type: 'Hvordan',
    label: 'Beskrivelse',
    labelPlaceholder: 'klatrer sammen',
    since: 'Siden',
    until: 'Til',
    end: 'Avslutt',
    edit: (name: string) => `Endre relasjonen til ${name}`,
    remove: 'Fjern',
    ended: (date: string) => `til ${date}`,
    since_: (date: string) => `siden ${date}`,
    empty: 'Ingen registrerte relasjoner til andre.',
  },

  smallWorld: {
    title: 'Verden er liten',
    steps: (n: number) => (n === 2 ? 'to steg' : n === 3 ? 'tre steg' : `${n} steg`),
    notice: (a: string, b: string, steps: string) => `Verden er liten: ${a} og ${b} er ${steps} fra hverandre.`,
    showPath: 'Se stien',
    showOnMap: 'Vis i kartet',
    hidePath: 'Skjul stien',
    pathLabel: (names: string) => `Sti: ${names}`,
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
    history: 'Historikk',
    closedByHand: 'Fulgt opp',
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

  today: {
    title: 'I dag',
    upcoming: 'Kommende',
    reach: 'Bør ta kontakt',
    recent: 'Sist logget',
    seeAll: 'Se alle logger',
    logWith: (name: string) => `Logg med ${name.split(' ')[0]}`,
    emptyTitle: 'Kartet ditt er tomt',
    emptyBody: 'Skriv om noen du har truffet i det siste. Du kan legge dem til mens du skriver.',
    emptyAction: 'Skriv første logg',
    quiet: 'Ingen du bør ta kontakt med akkurat nå.',
    showMore: (n: number) => `Vis ${n} til`,
  },

  logPage: {
    title: 'Logg',
    older: 'Vis eldre',
    empty: 'Ingen logger ennå.',
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
