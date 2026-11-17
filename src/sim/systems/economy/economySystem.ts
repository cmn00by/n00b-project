// L'argent du joueur : il le gagne (récompense des missions) et le dépense (commande economy:spend).
// Expose : economySystem.
// Pourquoi : cette brique tient les comptes : l'argent de départ, ce qui rapporte (elle écoute les faits, comme mission:succeeded) et les dépenses demandées
// par commande. Les gestes eux-mêmes (walletOf, earnMoney, spendMoney) sont dans le noyau, pour qu'une boutique puisse encaisser un achat dans le même pas.
// Les montants sont des euros entiers : le compte est identique sur toutes les machines.

import { SYSTEM_ORDER, earnMoney, findCommands, findEntitiesWith, findEntity, spendMoney, walletOf } from '../../core'
import type { System } from '../../core'

export const economySystem: System = {
  id: 'economy',
  order: SYSTEM_ORDER.rules,
  init(world) {
    // La récompense d'une mission réussie : la brique missions l'annonce, celle-ci la verse.
    world.events.on('mission:succeeded', ({ entityId, missionId, money }) => {
      const entity = findEntity(world, entityId)
      if (entity !== undefined) earnMoney(world, entity, money, `mission:${missionId}`)
    })
  },
  step(world) {
    // Chaque joueur a un portefeuille dès le début, pour que le HUD l'affiche avant le premier gain.
    for (const player of findEntitiesWith(world, ['position'])) if (player.kind === 'player') walletOf(player)

    for (const { entityId, amount, reason } of findCommands(world.commands, 'economy:spend')) {
      const entity = findEntity(world, entityId)
      if (entity !== undefined) spendMoney(world, entity, amount, reason)
    }
  },
}
