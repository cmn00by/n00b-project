// Ce que le HUD affiche et comment on le calcule : cœurs de santé, étoiles de recherche, argent.
// Expose : HudState, computeHearts(), computeStars(), formatMoney().
// Pourquoi : ces calculs ne dépendent pas du navigateur, donc ils se testent dans Node. hudView.ts ne fait que les dessiner. Le HUD ne décide de rien :
// il lit un état (HudState) que main.ts lui fournit, d'abord factice, puis tiré de la simulation quand la santé, l'argent et la recherche existeront.

/** L'état affiché par le HUD. */
export interface HudState {
  /** Les points de vie du joueur (un cœur par point). */
  health: number
  maxHealth: number
  /** L'argent du joueur, en euros. */
  money: number
  /** Le niveau de recherche, de 0 (tranquille) à maxWantedLevel. */
  wantedLevel: number
  maxWantedLevel: number
}

/** Ramène une quantité entre 0 et son maximum, en nombre entier (une valeur absurde ne casse pas l'affichage). */
function toCount(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(Math.max(0, Math.floor(max)), Math.max(0, Math.floor(value)))
}

/** Une case par icône, vrai quand elle est pleine : `count` icônes pleines sur `max`. */
function computeFilled(count: number, max: number): boolean[] {
  const total = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : 0
  const filled = toCount(count, total)
  return Array.from({ length: total }, (_, index) => index < filled)
}

/** Les cœurs de santé : vrai pour un cœur plein, faux pour un cœur perdu. */
export function computeHearts(health: number, maxHealth: number): boolean[] {
  return computeFilled(health, maxHealth)
}

/** Les étoiles de recherche : vrai pour une étoile allumée, faux pour une étoile éteinte. */
export function computeStars(wantedLevel: number, maxWantedLevel: number): boolean[] {
  return computeFilled(wantedLevel, maxWantedLevel)
}

/** L'argent en euros, avec une espace entre les milliers : « 1 250 € ». Une valeur invalide s'affiche « 0 € ». */
export function formatMoney(amount: number): string {
  const whole = Number.isFinite(amount) ? Math.trunc(amount) : 0
  const digits = String(Math.abs(whole)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${whole < 0 ? '-' : ''}${digits} €`
}
