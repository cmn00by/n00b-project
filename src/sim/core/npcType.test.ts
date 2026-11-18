import { describe, expect, it } from 'vitest'
import { validateNpcTypeDef } from './npcType'
import type { NpcTypeDef } from './npcType'

const VALID: NpcTypeDef = {
  id: 'passant',
  name: 'Passant',
  look: {
    skinTones: ['#e8b08a', '#6a4128'],
    hairColors: ['#2b1e3a'],
    topColors: ['#e5383b', '#3a86ff'],
    bottomColors: ['#3e4152'],
    accessories: ['cap', 'cane'],
    accessoryChance: 0.5,
    heightScale: { min: 0.9, max: 1.1 },
  },
  walkSpeed: 40,
  fleeSpeed: 90,
  courage: { min: 0.2, max: 0.8 },
  patience: { min: 0.1, max: 0.9 },
  pauseSeconds: { min: 1, max: 4 },
  reactionWeights: { stare: 1, curious: 1, filming: 1, angry: 1 },
}

describe('validateNpcTypeDef', () => {
  it('ne trouve rien à redire à une fiche valide', () => {
    expect(validateNpcTypeDef(VALID)).toEqual([])
  })

  it('accepte une plage réduite à une seule valeur', () => {
    expect(validateNpcTypeDef({ ...VALID, courage: { min: 0.5, max: 0.5 } })).toEqual([])
  })

  it('refuse un nom vide', () => {
    expect(validateNpcTypeDef({ ...VALID, name: '  ' })).toEqual(['name ne doit pas être vide'])
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

  describe('apparence (look)', () => {
    it('refuse une liste de couleurs vide', () => {
      expect(validateNpcTypeDef({ ...VALID, look: { ...VALID.look, topColors: [] } })).toEqual(['look.topColors ne doit pas être vide'])
    })

    it('refuse une couleur qui n’est pas au format #rrggbb', () => {
      expect(validateNpcTypeDef({ ...VALID, look: { ...VALID.look, skinTones: ['#e8b08a', 'rouge', '#fff'] } })).toEqual([
        "look.skinTones : « rouge » n'est pas une couleur au format #rrggbb",
        "look.skinTones : « #fff » n'est pas une couleur au format #rrggbb",
      ])
    })

    it('accepte les majuscules dans une couleur', () => {
      expect(validateNpcTypeDef({ ...VALID, look: { ...VALID.look, hairColors: ['#F6D3B8'] } })).toEqual([])
    })

    it('refuse un accessoire que l’affichage ne sait pas assembler', () => {
      const look = { ...VALID.look, accessories: ['cap', 'jetpack'] as unknown as NpcTypeDef['look']['accessories'] }
      expect(validateNpcTypeDef({ ...VALID, look })).toEqual(["look.accessories : « jetpack » n'est pas un accessoire connu (cap, hat, glasses, backpack, cane)"])
    })

    it('refuse une probabilité d’accessoire hors de 0 à 1', () => {
      expect(validateNpcTypeDef({ ...VALID, look: { ...VALID.look, accessoryChance: 1.5 } })).toEqual(['look.accessoryChance : doit rester entre 0 et 1'])
    })

    it('refuse une chance d’accessoire sans aucun accessoire possible, mais accepte « aucun accessoire »', () => {
      expect(validateNpcTypeDef({ ...VALID, look: { ...VALID.look, accessories: [] } })).toEqual(['look.accessories ne doit pas être vide quand accessoryChance dépasse 0'])
      expect(validateNpcTypeDef({ ...VALID, look: { ...VALID.look, accessories: [], accessoryChance: 0 } })).toEqual([])
    })

    it('refuse une taille démesurée ou à l’envers', () => {
      expect(validateNpcTypeDef({ ...VALID, look: { ...VALID.look, heightScale: { min: 0.2, max: 1 } } })).toEqual(['look.heightScale : doit rester entre 0.5 et 1.5'])
      expect(validateNpcTypeDef({ ...VALID, look: { ...VALID.look, heightScale: { min: 1.2, max: 0.9 } } })).toEqual(['look.heightScale : min (1.2) dépasse max (0.9)'])
    })
  })

  it('refuse des poids de réaction négatifs ou qui ne sont pas des nombres', () => {
    expect(validateNpcTypeDef({ ...VALID, reactionWeights: { stare: -1, curious: 1, filming: 1, angry: 1 } })).toEqual(['reactionWeights : chaque poids doit être un nombre supérieur ou égal à 0'])
    expect(validateNpcTypeDef({ ...VALID, reactionWeights: { stare: Number.NaN, curious: 1, filming: 1, angry: 1 } })).toHaveLength(1)
  })

  it('refuse des poids de réaction tous à 0 : le PNJ ne saurait pas quoi faire', () => {
    expect(validateNpcTypeDef({ ...VALID, reactionWeights: { stare: 0, curious: 0, filming: 0, angry: 0 } })).toEqual(['reactionWeights : au moins un poids doit dépasser 0'])
  })

  it('accepte une seule réaction possible', () => {
    expect(validateNpcTypeDef({ ...VALID, reactionWeights: { stare: 0, curious: 0, filming: 2, angry: 0 } })).toEqual([])
  })
})
