'use client'

import { useState, useTransition } from 'react'
import { Checkbox, ToggleButton, ToggleButtonGroup } from 'react-aria-components'
import { Sparkles } from 'lucide-react'
import { Avatar, Button, CheckMark, checkRow, SectionHeading } from '@/components/ui'
import { chipBase } from '@/components/ui/Chip'
import { useToast } from '@/components/toast/ToastProvider'
import { insightPairs } from '@/domain/linkSuggestions'
import { acceptInsight, acceptLinks, dismissInsight, dismissLinks } from '@/server/actions/links'
import { settle } from '@/server/actions/result'
import type { ClusterItem, GroupSuggestions as Data, InsightItem } from '@/server/queries/links'
import type { TagColor } from '@/lib/palette'
import { t } from '@/i18n'

type Person = { id: string; name: string; tint: TagColor; photoUrl: string | null }

type CardProps = {
  title: string
  reason: string
  fromClaude?: boolean
  hub: Person | null
  members: Person[]
  /** Hvor mange nye forbindelser de valgte gir. */
  count: (selected: string[]) => number
  groupName?: string | null
  onAccept: (selected: string[], createGroup: boolean) => Promise<boolean>
  onDismiss: () => Promise<boolean>
}

/**
 * Én påstand om en gruppe, ett svar: «Legg til alle», «Velg hvem» eller
 * «Nei takk». Et besvart kort forsvinner med en gang.
 */
function GroupCard({ title, reason, fromClaude, hub, members, count, groupName, onAccept, onDismiss }: CardProps) {
  const [selected, setSelected] = useState(members.map((m) => m.id))
  const [choosing, setChoosing] = useState(false)
  const [createGroup, setCreateGroup] = useState(Boolean(groupName))
  const [done, setDone] = useState(false)
  const [busy, startTransition] = useTransition()
  const n = count(selected)
  if (done) return null

  const run = (action: () => Promise<boolean>) =>
    startTransition(async () => {
      setDone(true)
      if (!(await action())) setDone(false)
    })

  return (
    <li className="flex flex-col gap-3 rounded-[16px] border border-rule bg-paper-raised p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-[19px] leading-tight text-ink">{title}</h3>
          <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">{reason}</p>
        </div>
        {fromClaude && (
          <span className="flex shrink-0 items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-ink-muted">
            <Sparkles aria-hidden size={12} strokeWidth={1.75} />
            {t.links.fromClaude}
          </span>
        )}
      </div>

      {choosing ? (
        <ToggleButtonGroup
          aria-label={t.links.choose}
          selectionMode="multiple"
          selectedKeys={selected}
          onSelectionChange={(keys) => setSelected([...keys].map(String))}
          className="flex flex-wrap gap-2"
        >
          {members.map((m) => (
            <ToggleButton key={m.id} id={m.id} className={`${chipBase} pl-1.5`}>
              <Avatar name={m.name} tint={m.tint} src={m.photoUrl} size="sm" decorative />
              {m.name}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      ) : (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {hub && (
            <span className="flex items-center gap-1.5 text-[13px] text-ink">
              <Avatar name={hub.name} tint={hub.tint} src={hub.photoUrl} size="sm" decorative />
              {t.links.hubReason(hub.name)}:
            </span>
          )}
          <span className="flex -space-x-2">
            {members.slice(0, 12).map((m) => (
              <Avatar key={m.id} name={m.name} tint={m.tint} src={m.photoUrl} size="sm" decorative />
            ))}
          </span>
          <span className="text-[13px] text-ink-muted">
            {members
              .slice(0, 6)
              .map((m) => m.name.split(' ')[0])
              .join(', ')}
            {members.length > 6 ? ` +${members.length - 6}` : ''}
          </span>
        </div>
      )}

      {groupName && (
        <Checkbox isSelected={createGroup} onChange={setCreateGroup} className={checkRow}>
          <CheckMark />
          {t.links.createGroup(groupName)}
        </Checkbox>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" size="sm" isDisabled={busy || n === 0} onPress={() => run(() => onAccept(selected, createGroup))}>
          {t.links.addAllN(n)}
        </Button>
        {!choosing && members.length > 2 && (
          <Button variant="quiet" size="sm" onPress={() => setChoosing(true)}>
            {t.links.choose}
          </Button>
        )}
        <Button variant="quiet" size="sm" className="ml-auto" isDisabled={busy} onPress={() => run(onDismiss)}>
          {t.links.noThanks}
        </Button>
      </div>
    </li>
  )
}

const RULES_SHOWN = 8

/**
 * Forslagene i grupper, ikke som hundrevis av enkeltpar: Claudes innsikter
 * først, så reglenes grupper rundt personen de har felles.
 */
export function GroupSuggestions({ data }: { data: Data }) {
  const toast = useToast()
  const [shown, setShown] = useState(RULES_SHOWN)

  const report = (res: { ok: boolean; error?: string } & { data?: { created: number } }) => {
    if (!res.ok) {
      toast(t.errors[(res.error as keyof typeof t.errors) ?? 'failed'])
      return false
    }
    if (res.data) toast(t.links.added(res.data.created))
    return true
  }

  const insightCard = (i: InsightItem) => (
    <GroupCard
      key={i.id}
      title={i.title}
      reason={i.reason}
      fromClaude
      hub={i.hub}
      members={i.members}
      count={(sel) => insightPairs(i.kind, i.hub?.id ?? null, sel).length}
      groupName={i.groupName}
      onAccept={async (sel, createGroup) => report(await settle(acceptInsight({ id: i.id, memberIds: sel, createGroup })))}
      onDismiss={async () => report(await settle(dismissInsight(i.id)))}
    />
  )

  const clusterCard = (c: ClusterItem) => (
    <GroupCard
      key={c.key}
      title={t.links.clusterTitle(c.hub.name, c.members.map((m) => m.name))}
      reason={t.links.clusterReason(c.hub.name, c.members.length)}
      hub={null}
      members={c.members}
      count={(sel) => c.pairs.filter(([a, b]) => sel.includes(a) && sel.includes(b)).length}
      onAccept={async (sel) =>
        report(await settle(acceptLinks(c.pairs.filter(([a, b]) => sel.includes(a) && sel.includes(b)))))
      }
      onDismiss={async () => report(await settle(dismissLinks(c.pairs)))}
    />
  )

  if (data.fromClaude.length === 0 && data.fromRules.length === 0) {
    return <p className="text-[15px] text-ink-muted">{t.links.emptyGroups}</p>
  }

  return (
    <div className="flex flex-col gap-8">
      {data.fromClaude.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeading>{t.links.fromClaudeTitle}</SectionHeading>
          <ul className="flex flex-col gap-3">{data.fromClaude.map(insightCard)}</ul>
        </section>
      )}
      {data.fromRules.length > 0 && (
        <section className="flex flex-col gap-3">
          <div>
            <SectionHeading>{t.links.fromRulesTitle}</SectionHeading>
            <p className="-mt-2 text-[14px] text-ink-muted">{t.links.fromRulesLead}</p>
          </div>
          <ul className="flex flex-col gap-3">{data.fromRules.slice(0, shown).map(clusterCard)}</ul>
          {data.fromRules.length > shown && (
            <Button variant="quiet" className="self-start" onPress={() => setShown((s) => s + RULES_SHOWN)}>
              {t.links.moreClusters(data.fromRules.length - shown)}
            </Button>
          )}
        </section>
      )}
    </div>
  )
}
