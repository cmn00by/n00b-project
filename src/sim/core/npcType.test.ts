import { describe, expect, it } from 'vitest'
import { validateNpcTypeDef } from './npcType'
import type { NpcTypeDef } from './npcType'

const VALID: NpcTypeDef = {
  id: 'passant',
  name: 'Passant',
  spriteKey: 'pedestrian-passant',
  walkSpeed: 40,
  fleeSpeed: 90,
  courage: { min: 0.2, max: 0.8 },
  patience: { min: 0.1, max: 0.9 },
  pauseSeconds: { min: 1, max: 4 },
}

describe('validateNpcTypeDef', () => {
  it('ne trouve rien à redire à une fiche valide', () => {
    expect(validateNpcTypeDef(VALID)).toEqual([])
  })

  it('accepte une plage réduite à une seule valeur', () => {
    expect(validateNpcTypeDef({ ...VALID, courage: { min: 0.5, max: 0.5 } })).toEqual([])
  })

  it('refuse un nom ou une clé d’affichage vides', () => {
    expect(validateNpcTypeDef({ ...VALID, name: '  ' })).toEqual(['name ne doit pas être vide'])
    expect(validateNpcTypeDef({ ...VALID, spriteKey: '' })).toEqual(['spriteKey ne doit pas être vide'])
  })

  it('refuse des vitesses nulles, négatives ou qui ne sont pas des nombres', () => {
    expect(validateNpcTypeDef({ ...VALID, walkSpeed: 0 })).toContain('walkSpeed doit être un nombre positif')
    expect(validateNpcTypeDef({ ...VALID, fleeSpeed: Number.NaN })).toContain('fleeSpeed doit être un nombre positif')
  })

  it('refuse qu’un piéton fuie plus lentement qu’il ne marche', () => {
    expect(validateNpcTypeDef({ ...VALID, fleeSpeed: 30 })).toEqual(['fleeSpeed ne doit pas être plus lente que walkSpeed'])
  })

  it('refuse une plage à l’envers', () => {
    expect(validateNpcTypeDef({ ...VALID, pauseSeconds: { min: 5, max: 2 } })).toEqual(['pauseSeconds : min (5) dépasse max (2)'])
  })

  it('refuse un courage ou une patience hors de 0 à 1', () => {
    expect(validateNpcTypeDef({ ...VALID, courage: { min: -0.1, max: 0.5 } })).toEqual(['courage : doit rester entre 0 et 1'])
    expect(validateNpcTypeDef({ ...VALID, patience: { min: 0.5, max: 1.5 } })).toEqual(['patience : doit rester entre 0 et 1'])
  })

  it('refuse une durée de pause négative', () => {
    expect(validateNpcTypeDef({ ...VALID, pauseSeconds: { min: -1, max: 2 } })).toEqual(['pauseSeconds : ne doit pas être inférieur à 0'])
  })

  it('refuse une plage dont les bornes ne sont pas des nombres', () => {
    expect(validateNpcTypeDef({ ...VALID, courage: { min: Number.NaN, max: 1 } })).toEqual(['courage : min et max doivent être des nombres'])
  })

  it('ne dépend d’aucune fonction : la fiche survit à un aller-retour JSON (futur panneau admin)', () => {
    expect(validateNpcTypeDef(JSON.parse(JSON.stringify(VALID)) as NpcTypeDef)).toEqual([])
  })
})
