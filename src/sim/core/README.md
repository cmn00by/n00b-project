# core : le noyau de la simulation

**À construire dans l'issue #3.** Le plan complet est dans [docs/architecture.md](../../../docs/architecture.md), sections 4 à 8.

Le noyau est le « plateau LEGO » sur lequel toutes les briques s'emboîtent : `World`, entités et composants, contrat `System` et `SYSTEM_ORDER`,
bus d'événements typé, commandes, registres de contenus, `Rng` déterministe, `TUNING` et `step()`.

Règles (vérifiées par `npm run lint`) :

- n'importe **rien** d'autre du projet (ni `systems`, ni `data`, ni `game`) ;
- pas de Phaser, pas de navigateur, pas de `Math.random()` ni de `Date.now()` ;
- les autres modules l'importent **uniquement** par `core/index.ts`.
