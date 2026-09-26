import type { Prisma } from '@prisma/client'

/**
 * Hvem som vises hvor. Usorterte (importert, uten plass ennå) står i
 * Venter-bunken, ikke på kartet. Arkiverte («ikke i kartet») er borte
 * overalt, men importen kjenner dem fortsatt igjen.
 */
export const onMap = { sortedAt: { not: null }, archivedAt: null } satisfies Prisma.PersonWhereInput
export const notArchived = { archivedAt: null } satisfies Prisma.PersonWhereInput
