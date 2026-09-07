import { PersonModalShell } from '@/components/person/PersonModalShell'

// Layouten persisterer på tvers av navigasjon mellom barna sine, så modalen
// blir stående mens innholdet bytter mellom profil og redigering. Lå skallet
// i page.tsx ville det blitt avmontert og animert på nytt for hvert bytte.
export default function PersonModalLayout({ children }: { children: React.ReactNode }) {
  return <PersonModalShell>{children}</PersonModalShell>
}
