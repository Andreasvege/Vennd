'use client'

import { useState, useTransition } from 'react'
import { Button as AriaButton, Dialog, DialogTrigger, Input, Popover, TextField } from 'react-aria-components'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { TAG_COLORS, tagFill, tagStroke, type TagColor } from '@/lib/palette'
import { deleteTag, recolorTag, renameTag } from '@/server/actions/tag'
import type { TagSummary } from '@/server/queries/tags'
import { t } from '@/i18n'

function TagRow({ tag }: { tag: TagSummary }) {
  const [name, setName] = useState(tag.name)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [, startTransition] = useTransition()

  const commitName = () => {
    const next = name.trim()
    if (!next || next === tag.name) {
      setName(tag.name)
      return
    }
    startTransition(async () => {
      const result = await renameTag(tag.id, next)
      if (!result.ok) {
        setError(result.error === 'invalid' ? t.tags.nameTaken : t.errors[result.error])
        setName(tag.name)
      } else setError('')
    })
  }

  const recolor = (color: TagColor) => startTransition(async () => void (await recolorTag(tag.id, color)))
  const remove = () => startTransition(async () => void (await deleteTag(tag.id)))

  return (
    <li className="flex flex-col gap-1 py-3">
      <div className="flex items-center gap-3">
        <DialogTrigger>
          <AriaButton
            aria-label={t.tags.color(tag.name)}
            className="flex size-11 shrink-0 items-center justify-center rounded-full outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen"
          >
            <span
              className="size-6 rounded-full"
              style={{ background: tagFill(tag.color), boxShadow: `inset 0 0 0 1.5px ${tagStroke(tag.color)}` }}
            />
          </AriaButton>
          <Popover
            offset={6}
            className="rounded-[10px] border border-rule bg-paper-raised p-2 shadow-float outline-none"
          >
            <Dialog aria-label={t.tags.color(tag.name)} className="outline-none">
              {({ close }) => (
                <div className="grid grid-cols-4 gap-1">
                  {TAG_COLORS.map((color) => (
                    <AriaButton
                      key={color}
                      aria-label={t.colors[color]}
                      aria-pressed={color === tag.color}
                      onPress={() => {
                        recolor(color)
                        close()
                      }}
                      className="flex size-11 items-center justify-center rounded-full outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen"
                    >
                      <span
                        className="size-7 rounded-full"
                        style={{
                          background: tagFill(color),
                          boxShadow: `inset 0 0 0 ${color === tag.color ? 2.5 : 1.5}px ${tagStroke(color)}`,
                        }}
                      />
                    </AriaButton>
                  ))}
                </div>
              )}
            </Dialog>
          </Popover>
        </DialogTrigger>

        <TextField
          aria-label={t.tags.rename(tag.name)}
          value={name}
          onChange={setName}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
          }}
          className="min-w-0 flex-1"
        >
          <Input className="w-full rounded-[8px] border border-transparent bg-transparent px-2 py-1.5 text-[16px] text-ink outline-none transition-colors hover:border-rule focus:border-pen focus:bg-paper-raised" />
        </TextField>

        <span className="hidden shrink-0 text-[13px] text-ink-muted sm:inline">{t.tags.count(tag.personCount)}</span>

        {confirming ? (
          <Button variant="danger" size="sm" onPress={remove}>
            {t.common.delete}
          </Button>
        ) : (
          <Button variant="quiet" size="sm" aria-label={`${t.common.delete} ${tag.name}`} onPress={() => setConfirming(true)}>
            <Trash2 aria-hidden size={16} strokeWidth={1.75} />
          </Button>
        )}
      </div>
      {confirming && <p className="pl-14 text-[13px] text-ink-muted">{t.tags.deleteConfirm(tag.personCount)}</p>}
      {error && (
        <p role="alert" className="pl-14 text-[13px] text-redpencil">
          {error}
        </p>
      )}
    </li>
  )
}

export function TagSettings({ tags }: { tags: TagSummary[] }) {
  if (tags.length === 0) return <p className="text-[14px] text-ink-muted">{t.tags.empty}</p>
  return (
    <ul className="flex flex-col divide-y divide-rule">
      {tags.map((tag) => (
        // Nøkkelen tar med navnet, så feltet nullstilles når navnet endres fra serveren.
        <TagRow key={`${tag.id}:${tag.name}`} tag={tag} />
      ))}
    </ul>
  )
}
