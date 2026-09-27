'use client'

import { createContext, useContext } from 'react'

// Loggen hvis forslag vises i skuffen nå. Egen modul, så lista og skuffen
// ikke importerer skriv-arket (og hverandre) i ring.
export const TrayContext = createContext<string | null>(null)

/** Loggen hvis forslag vises i skuffen nå; andre lister hopper over dem. */
export const useTrayLog = () => useContext(TrayContext)
