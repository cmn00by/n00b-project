// L'argent du joueur : il le gagne (récompense des missions) et le dépense (boutiques, amendes…).
// Expose : economySystem, earn().
// Pourquoi : un seul endroit tient les comptes. Les autres briques ne touchent jamais au portefeuille : elles annoncent un fait (mission:succeeded)
// ou envoient une commande (economy:spend), et cette brique tranche. Les montants sont des euros entiers : le compte est identique sur toutes les machines.

import { SYSTEM_ORDER, TUNING, findCommands, findEntitiesWith, findEntity } from '../../core'
import type { Entity, EntityId, System, Wallet, World } from '../../core'

/** Un montant valable : un nombre entier positif d'euros. */
const isValidAmount = (amount: number): boolean => Number.isInteger(amount) && amount > 0

/** Le portefeuille d'une entité, créé avec l'argent de départ s'il n'existe pas encore. */
function walletOf(entity: Entity): Wallet {
  entity.wallet ??= { money: TUNING.economy.startingMoney }
  return entity.wallet
}

/** Ajoute de l'argent à une entité et l'annonce. Un montant invalide ou une entité disparue ne change rien. */
export function earn(world: World, entityId: EntityId, amount: number, reason: string): void {
  const entity = findEntity(world, entityId)
  if (entity === undefined || !isValidAmount(amount)) return
  const wallet = walletOf(entity)
  wallet.money += amount
  world.events.emit('economy:earned', { entityId, amount, reason, balance: wallet.money })
}

export const economySystem: System = {
  id: 'economy',
  order: SYSTEM_ORDER.rules,
  init(world) {
    // La récompense d'une mission réussie : la brique missions l'annonce, celle-ci la verse.
    world.events.on('mission:succeeded', ({ entityId, missionId, money }) => earn(world, entityId, money, `mission:${missionId}`))
  },
  step(world) {
    // Chaque joueur a un portefeuille dès le début, pour que le HUD l'affiche avant le premier gain.
    for (const player of findEntitiesWith(world, ['position'])) if (player.kind === 'player') walletOf(player)

    for (const { entityId, amount, reason } of findCommands(world.commands, 'economy:spend')) {
      const entity = findEntity(world, entityId)
      if (entity === undefined) continue
      const wallet = walletOf(entity)
      if (!isValidAmount(amount) || amount > wallet.money) {
        world.events.emit('economy:refused', { entityId, amount, reason, balance: wallet.money })
        continue
      }
      wallet.money -= amount
      world.events.emit('economy:spent', { entityId, amount, reason, balance: wallet.money })
    }
  },
}
