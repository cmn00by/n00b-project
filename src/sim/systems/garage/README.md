# garage : la concession, le garage et l'atelier

L'aspect matériel du jeu (bloc 19) : **acheter** un véhicule à la concession, le **ranger** au garage, le **ressortir**, le **personnaliser** à l'atelier. Un véhicule volé rangé au garage
devient au joueur. Passe dans la tranche `rules`.

- **Lit** : `world.map` ; `world.commands` (`dealership:buy`, `garage:store`, `garage:take-out`, `workshop:install`, `workshop:remove`) ; composants `position`, `driver`, `vehicle`, `wallet`
- **Écrit** : composant `vehicleCollection` du joueur ; `vehicle.ownerId` et `vehicle.ownedKey` ; crée et retire des entités `vehicle` ; le portefeuille par `spendMoney` (noyau)
- **Émet** : `garage:bought`, `garage:stored` (avec `wasStolen`), `garage:taken-out`, `workshop:installed`, `workshop:removed`, `garage:refused` (avec la raison, pour le joueur) ; `economy:spent` et `economy:refused` via `spendMoney`
- **Écoute** : rien
- **Réglages** : `TUNING.garage` (places par garage, distance pour ranger un véhicule garé devant)
- **Contenu** : `src/data/dealerships` (`DealershipDef` : lieu, place de livraison, offres et prix), `src/data/garages` (`GarageDef` : lieu, place devant),
  `src/data/workshops` (`WorkshopDef` : lieu), `src/data/vehicleParts` (`VehiclePartDef` : emplacement, prix, couleur, réglages) et les modèles (`src/data/vehicles`),
  reçus par `createGarageSystem({ vehicles, dealerships, garages, workshops, parts })`
- **Dépend de** : core uniquement

## Comment ça marche

- **Acheter** : à pied, dans le lieu de la concession. La place de livraison doit être libre (vérifié **avant** de payer), puis l'achat est payé dans le même pas
  (`spendMoney`) : soit la voiture est livrée et payée, soit rien ne se passe.
- **Ranger** : à pied devant le garage ; le véhicule libre le plus proche de la place devant (à moins de `parkingRadiusTiles` cases) disparaît de la ville et passe
  dans la collection, rangé dans ce garage. Jamais le véhicule d'un autre joueur ; un véhicule sans propriétaire (volé) devient au joueur.
- **Sortir** : à pied devant le garage ; le véhicule réapparaît sur la place devant, si elle est libre.
- **Personnaliser** : au volant, dans l'atelier. Une pièce par emplacement (9 : peinture, bandes, jantes, aileron, toit, pare-chocs, néons, moteur, pneus), payée
  dans le même pas ; remettre d'origine est gratuit. La recette est sur le composant `vehicle` (`customization`), et part au garage avec le véhicule.
  Les pièces de performance multiplient les réglages du modèle (`applyVehicleParts`, noyau), que la brique `driving` applique en conduisant.
- **La collection** (`vehicleCollection`) : des données simples (numéro, modèle, garage ou entité, pièces), sauvegardables et partageables en coop.

## Fichiers

| Fichier                | Rôle                                                     |
| ---------------------- | -------------------------------------------------------- |
| `garageSystem.ts`      | le système : acheter, ranger, sortir, installer, retirer |
| `places.ts`            | le joueur est-il dans un lieu, un véhicule garé devant   |
| `garageSystem.test.ts` | les tests (la brique seule, sans les autres)             |
