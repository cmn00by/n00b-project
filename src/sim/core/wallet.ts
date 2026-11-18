// Le portefeuille : gagner et dépenser de l'argent, toujours en euros entiers, avec l'événement qui l'annonce.
// Expose : walletOf(), earnMoney(), spendMoney().
// Pourquoi : la brique economy tient les comptes (argent de départ, récompenses, commande economy:spend), mais d'autres briques encaissent un achat
// (garage : un véhicule ; plus tard la boutique de vêtements). Comme une brique n'en importe jamais une autre, ces deux gestes vivent dans le noyau :
// un achat est décidé et payé dans le même pas, sans aller-retour.

import { TUNING } from './config'
import type { Entity, Wallet } from './components'
import type { World } from './world'

/** Un montant valable : un nombre entier positif d'euros. */
const isValidAmount = (amount: number): boolean => Number.isInteger(amount) && amount > 0

/** Le portefeuille d'une entité, créé avec l'argent de départ s'il n'existe pas encore. */
export function walletOf(entity: Entity): Wallet {
  entity.wallet ??= { money: TUNING.economy.startingMoney }
  return entity.wallet
}

/** Ajoute de l'argent et annonce economy:earned. Un montant invalide ne change rien. */
export function earnMoney(world: World, entity: Entity, amount: number, reason: string): void {
  if (!isValidAmount(amount)) return
  const wallet = walletOf(entity)
  wallet.money += amount
  world.events.emit('economy:earned', { entityId: entity.id, amount, reason, balance: wallet.money })
}

/** Retire de l'argent s'il y en a assez (economy:spent, renvoie true), sinon ne retire rien (economy:refused, renvoie false). */
export function spendMoney(world: World, entity: Entity, amount: number, reason: string): boolean {
  const wallet = walletOf(entity)
  if (!isValidAmount(amount) || amount > wallet.money) {
    world.events.emit('economy:refused', { entityId: entity.id, amount, reason, balance: wallet.money })
    return false
  }
  wallet.money -= amount
  world.events.emit('economy:spent', { entityId: entity.id, amount, reason, balance: wallet.money })
  return true
}
