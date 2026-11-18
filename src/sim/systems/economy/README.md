# economy : l'argent du joueur

Tient les comptes : chaque joueur a un **portefeuille** (euros entiers), qu'il remplit en réussissant des missions et vide en achetant.
C'est la seule brique qui touche au portefeuille. Passe dans la tranche `rules`.

- **Lit** : `world.commands` (`economy:spend`) ; composant `wallet`
- **Écrit** : composant `wallet` (créé avec `TUNING.economy.startingMoney` pour chaque joueur)
- **Émet** : `economy:earned`, `economy:spent`, `economy:refused` (avec le montant, la raison et le nouveau solde)
- **Écoute** : `mission:succeeded` (verse la récompense)
- **Réglages** : `TUNING.economy` (argent de départ)
- **Dépend de** : core uniquement

## Comment s'en servir depuis une autre brique

- **Donner de l'argent** : annoncer un fait que cette brique écoute (comme `mission:succeeded`), puis ajouter l'écoute ici. Une autre brique n'importe jamais `earn`.
- **Prendre de l'argent** : une brique qui vend quelque chose (garage, boutique) encaisse elle-même avec `spendMoney` du noyau, dans le même pas que l'achat ;
  le joueur, lui, peut envoyer la commande `economy:spend` avec une **raison**. Dans les deux cas : `economy:spent` (fait) ou `economy:refused` (pas assez d'argent).
- **Montants** : toujours des euros **entiers** et positifs ; un montant invalide est refusé.

## Fichiers

| Fichier                 | Rôle                                              |
| ----------------------- | ------------------------------------------------- |
| `economySystem.ts`      | le système : portefeuilles, récompenses, dépenses |
| `economySystem.test.ts` | les tests (la brique seule, sans les autres)      |
