import { TodayPanel } from '@/components/today/TodayPanel'

// Panelet viser «I dag» når det ikke viser en profil. Ved myk navigasjon
// beholder Next innholdet i et spor som ikke matcher ruta, så både forsiden,
// resten av rutene og full lasting må si det samme.
export default function Panel() {
  return <TodayPanel />
}
