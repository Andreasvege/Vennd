'use client'

import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components'
import type { KnownPerson } from '@/domain/import/match'
import { ContactImport } from './ContactImport'
import { EventImport } from './EventImport'
import { t } from '@/i18n'

type Props = {
  persons: KnownPerson[]
  tags: { id: string; name: string; color: string }[]
  existing: { logs: { date: Date; personIds: string[] }[]; plans: { at: Date; title: string }[] }
}

const tab =
  'cursor-pointer border-b-2 border-transparent px-1 pb-2 text-[15px] text-ink-muted outline-none transition-colors data-[hovered]:text-ink data-[selected]:border-ink data-[selected]:text-ink data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen rounded-t-sm'

/** Kontakter først: kalenderen trenger folkene for å kjenne dem igjen. */
export function ImportFlow({ persons, tags, existing }: Props) {
  return (
    <Tabs className="flex flex-col gap-6">
      <TabList aria-label={t.import.title} className="flex gap-6 border-b border-rule">
        <Tab id="contacts" className={tab}>
          {t.import.contacts}
        </Tab>
        <Tab id="calendar" className={tab}>
          {t.import.calendar}
        </Tab>
      </TabList>
      <TabPanel id="contacts" className="outline-none">
        <ContactImport persons={persons} tags={tags} />
      </TabPanel>
      <TabPanel id="calendar" className="outline-none">
        <EventImport persons={persons} existing={existing} />
      </TabPanel>
    </Tabs>
  )
}
