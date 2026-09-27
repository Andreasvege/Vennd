'use client'

import { useState } from 'react'
import { Label, Radio, RadioGroup, ToggleButton, ToggleButtonGroup } from 'react-aria-components'
import { TextField } from '@/components/ui'
import { chipBase } from '@/components/ui/Chip'
import { fieldLabel } from '@/components/ui/TextField'
import { CADENCE_CHOICES, CARD_TYPES, defaultCadence, type CadenceChoice } from '@/domain/sorting'
import { nearestCadence } from '@/domain/cadence'
import type { RelationshipType, RomanticPhase } from '@/types'
import { t } from '@/i18n'

export type Who = {
  type: RelationshipType
  relationLabel: string | null
  phase: RomanticPhase | null
  cadenceWeeks: CadenceChoice
}

const PHASES: RomanticPhase[] = ['FIRST_DATE', 'SEEING', 'EXCLUSIVE', 'PARTNER', 'ENDED']

// Oppfølgingen (etikett eller fase) er underordnet typen: mindre brikker,
// og en tynn linje som binder dem til valget over.
const sub = 'ml-2 flex flex-wrap items-center gap-2 border-l border-rule pl-3'
const subChip = `${chipBase} text-[12px] desk:min-h-8`

const radio =
  'flex min-h-11 cursor-pointer items-center rounded-full border border-rule px-3.5 text-[13px] outline-none transition-colors data-[hovered]:border-ink-muted data-[selected]:border-ink data-[selected]:bg-ink data-[selected]:text-paper data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-paper-raised desk:min-h-9'

/**
 * «Hvem er de for deg?» og «Hvor ofte?» som to spørsmål, ikke ett. Typen,
 * dine egne ord for den (eller fasen, for romantiske), og en påminnelse som
 * følger typen til du velger noe selv.
 */
export function WhoFields({ value, onChange }: { value: Who; onChange: (next: Who) => void }) {
  // Har du valgt «hvor ofte» selv, følger det ikke lenger typen.
  const [cadenceTouched, setCadenceTouched] = useState(false)
  const suggestions = t.sort.labelSuggestions[value.type] ?? []
  const own = value.relationLabel !== null && !suggestions.includes(value.relationLabel)

  const setType = (type: RelationshipType) => {
    const phase = type === 'ROMANTIC' ? value.phase : null
    onChange({
      type,
      phase,
      // Etiketten hører til typen; en «fetter» er ikke en kollega.
      relationLabel: type === value.type ? value.relationLabel : null,
      cadenceWeeks: cadenceTouched ? value.cadenceWeeks : defaultCadence(type, phase),
    })
  }
  const setPhase = (phase: RomanticPhase | null) =>
    onChange({ ...value, phase, cadenceWeeks: cadenceTouched ? value.cadenceWeeks : defaultCadence(value.type, phase) })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <RadioGroup value={value.type} onChange={(v) => setType(v as RelationshipType)} orientation="horizontal" className="flex flex-col gap-2">
          <Label className={fieldLabel}>{t.sort.who}</Label>
          <div className="flex flex-wrap gap-2">
            {CARD_TYPES.map((type) => (
              <Radio key={type} value={type} className={radio}>
                {t.relationType[type]}
              </Radio>
            ))}
          </div>
        </RadioGroup>

        {value.type === 'ROMANTIC' ? (
          <ToggleButtonGroup
            aria-label={t.sort.phaseQuestion}
            selectionMode="single"
            selectedKeys={value.phase ? [value.phase] : []}
            onSelectionChange={(keys) => setPhase(([...keys][0] as RomanticPhase | undefined) ?? null)}
            className={sub}
          >
            {PHASES.map((phase) => (
              <ToggleButton key={phase} id={phase} className={subChip}>
                {phase === 'ENDED' ? t.sort.phaseEx : t.phase[phase]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        ) : (
          <div className={sub}>
            {suggestions.length > 0 && (
              <ToggleButtonGroup
                aria-label={t.sort.who}
                selectionMode="single"
                selectedKeys={value.relationLabel && !own ? [value.relationLabel] : []}
                onSelectionChange={(keys) => onChange({ ...value, relationLabel: ([...keys][0] as string | undefined) ?? null })}
                className="contents"
              >
                {suggestions.map((label) => (
                  <ToggleButton key={label} id={label} className={subChip}>
                    {label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            )}
            <TextField
              label={t.sort.labelOwn}
              hideLabel
              placeholder={t.sort.labelOwn}
              value={own ? (value.relationLabel ?? '') : ''}
              onChange={(v) => onChange({ ...value, relationLabel: v.trim() ? v : null })}
              className="w-40"
            />
          </div>
        )}
      </div>

      <RadioGroup
        value={value.cadenceWeeks === null ? 'never' : String(nearestCadence(value.cadenceWeeks))}
        onChange={(v) => {
          setCadenceTouched(true)
          onChange({ ...value, cadenceWeeks: v === 'never' ? null : (Number(v) as CadenceChoice) })
        }}
        orientation="horizontal"
        className="flex flex-col gap-2"
      >
        <Label className={fieldLabel}>{t.sort.howOften}</Label>
        <div className="flex flex-wrap gap-2">
          {CADENCE_CHOICES.map((c) => (
            <Radio key={String(c)} value={c === null ? 'never' : String(c)} className={radio}>
              {c === null ? t.cadence.never : t.cadence.every(c)}
            </Radio>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}
