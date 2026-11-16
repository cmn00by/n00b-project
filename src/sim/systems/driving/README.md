# driving : monter, conduire, déraper

Fait monter le joueur dans un véhicule proche et l'en fait descendre, puis fait rouler les véhicules avec une **physique arcade** :
accélérer, freiner, marche arrière, volant (qui ne tourne pas à l'arrêt et s'inverse en marche arrière), dérapage, frein à main.

**Le dérapage** : la vitesse garde un moment sa direction quand le nez tourne ; l'adhérence (`grip` du modèle) la ramène peu à peu dans l'axe.
Le frein à main remplace `grip` par `handbrakeGrip`, plus bas : la voiture glisse.

**Monter / descendre** : en montant, le corps du joueur est mis de côté (`driver.storedBody`) : il ne gêne pas la voiture et ne peut pas être percuté.
En descendant, il est posé à gauche, sinon à droite, devant, derrière, sur la première place libre (`isSpaceClear`) ; si tout est bouché, il reste au volant.

- **Lit** : commandes `player:interact`, `vehicle:drive` ; composants `position`, `velocity`, `body`, `vehicle`, `driver` ; modèles de `src/data/vehicles`
- **Écrit** : composants `position`, `velocity`, `body` (taille selon le cap), `vehicle`, `driver` ; position du conducteur
- **Émet** : `vehicle:entered`, `vehicle:exited`
- **Écoute** : rien
- **Réglages** : `TUNING.driving` (distance pour monter, espace à la descente, seuil de braquage, ralentissements) ; chaque modèle a ses propres valeurs dans `src/data/vehicles`
- **Dépend de** : core, `src/data/vehicles`

**Collisions** : ce module ne s'en occupe pas. La brique `collision` passe après lui, arrête le véhicule contre un mur ou une autre voiture et coupe sa vitesse sur l'axe bloqué.
Seule exception : le volant n'est pas tourné si la voiture tournée ne tient pas à sa place (sinon on se coincerait dans un mur en braquant).

**Le cap est un vecteur** (`headingX`, `headingY`), pas un angle : la rotation n'utilise que `+ − × ÷` et `Math.sqrt`, identiques sur toutes les machines. `position.angle` n'est pas utilisé pour les véhicules ; l'affichage calcule l'angle à partir du cap.

Pour faire apparaître un véhicule : `spawnVehicle(world, modelId, x, y, facing)` (exporté par `index.ts`).
