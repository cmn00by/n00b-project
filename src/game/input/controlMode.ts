// Le mode de commandes : clavier ou tactile, choisi tout seul selon l'appareil et la dernière entrée utilisée.
// Expose : ControlMode, parseControlsOverride(), chooseStartMode(), switchMode().
// Pourquoi : on ne devine jamais le modèle de l'appareil (un iPad se présente parfois comme un Mac). On regarde le type d'entrée disponible,
// puis on suit la dernière entrée utilisée (un toucher → tactile, une touche → clavier), ce qui gère aussi les appareils qui ont les deux.
// Un réglage dans l'adresse (?controls=touch ou ?controls=keyboard) force le mode, pour tester sur PC. Sans Phaser, donc testé dans Node.

export type ControlMode = 'keyboard' | 'touch'

/** Le mode forcé par l'adresse de la page (ex. '?controls=touch'), ou undefined si rien n'est forcé ou si la valeur est inconnue. */
export function parseControlsOverride(search: string): ControlMode | undefined {
  const value = new URLSearchParams(search).get('controls')
  return value === 'touch' || value === 'keyboard' ? value : undefined
}

/** Le mode au lancement : le mode forcé s'il y en a un, sinon tactile si l'appareil n'a qu'un écran tactile comme pointeur principal. */
export function chooseStartMode(override: ControlMode | undefined, hasCoarsePointer: boolean): ControlMode {
  if (override !== undefined) return override
  return hasCoarsePointer ? 'touch' : 'keyboard'
}

/** Le mode après une entrée du joueur : il suit la dernière entrée utilisée, sauf si le mode est forcé. */
export function switchMode(lastInput: ControlMode, override: ControlMode | undefined): ControlMode {
  return override ?? lastInput
}
