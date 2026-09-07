// Ved myk navigasjon beholder Next.js innholdet i en parallellslot som ikke
// matcher den nye ruta — default.tsx brukes bare ved full lasting. Uten denne
// ble profilmodalen hengende over /person/[id]/edit.
//
// (.)person/[id] er mer spesifikk og vinner over denne, så modalen vises
// fortsatt der den skal.
export default function CatchAll() {
  return null
}
