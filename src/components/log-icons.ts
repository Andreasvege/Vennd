import { Coffee, MessageCircle, PenLine, Phone, type LucideIcon } from 'lucide-react'
import type { LogEntryType } from '@/types'

export const LOG_ICON: Record<LogEntryType, LucideIcon> = {
  MET: Coffee,
  CALLED: Phone,
  MESSAGE: MessageCircle,
  OTHER: PenLine,
}
