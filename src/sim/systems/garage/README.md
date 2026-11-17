# garage : la concession et le garage

L'aspect matériel du jeu (bloc 19) : **acheter** un véhicule à la concession, le **ranger** au garage, le **ressortir**. Un véhicule volé rangé au garage
devient au joueur. Passe dans la tranche `rules`.

- **Lit** : `world.map` ; `world.commands` (`dealership:buy`, `garage:store`, `garage:take-out`) ; composants `position`, `driver`, `vehicle`, `wallet`
- **Écrit** : composant `vehicleCollection` du joueur ; `vehicle.ownerId` et `vehicle.ownedKey` ; crée et retire des entités `vehicle` ; le portefeuille par `spendMoney` (noyau)
- **Émet** : `garage:bought`, `garage:stored` (avec `wasStolen`), `garage:taken-out`, `garage:refused` (avec la raison, pour le joueur) ; `economy:spent` et `economy:refused` via `spendMoney`
- **Écoute** : rien
- **Réglages** : `TUNING.garage` (places par garage, distance pour ranger un véhicule garé devant)
- **Contenu** : `src/data/dealerships` (`DealershipDef` : lieu, place de livraison, offres et prix), `src/data/garages` (`GarageDef` : lieu, place devant),
  et les modèles (`src/data/vehicles`), reçus par `createGarageSystem({ vehicles, dealerships, garages })`
- **Dépend de** : core uniquement

## Comment ça marche

- **Acheter** : à pied, dans le lieu de la concession. La place de livraison doit être libre (vérifié **avant** de payer), puis l'achat est payé dans le même pas
  (`spendMoney`) : soit la voiture est livrée et payée, soit rien ne se passe.
- **Ranger** : à pied devant le garage ; le véhicule libre le plus proche de la place devant (à moins de `parkingRadiusTiles` cases) disparaît de la ville et passe
  dans la collection, rangé dans ce garage. Jamais le véhicule d'un autre joueur ; un véhicule sans propriétaire (volé) devient au joueur.
- **Sortir** : à pied devant le garage ; le véhicule réapparaît sur la place devant, si elle est libre.
- **La collection** (`vehicleCollection`) : des données simples (numéro, modèle, garage ou entité), sauvegardables et partageables en coop.
  La personnalisation (#54) s'y ajoutera.

## Fichiers

| Fichier                | Rôle                                                   |
| ---------------------- | ------------------------------------------------------ |
| `garageSystem.ts`      | le système : acheter, ranger, sortir                   |
| `places.ts`            | le joueur est-il dans un lieu, un véhicule garé devant |
| `garageSystem.test.ts` | les tests (la brique seule, sans les autres)           |
