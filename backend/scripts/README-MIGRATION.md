# Migration des noms de jaquettes

## Description

Ce script met à jour les noms des jaquettes suivants dans toute la base de données :

- **"Jaquette FFF"** → **"Jaquette Fil à Fil Foncé"**
- **"Jaquette FF Clair"** → **"Jaquette Fil à Fil Clair"**

## Collections affectées

La migration met à jour les collections suivantes :

1. **StockItem** (stock) : champ `reference`
2. **RentalContract** (contrats de location) :
   - `tenueInfo.veste.reference`
   - `items[].reference`
3. **StockMovement** (mouvements de stock) : champ `commentaire`
4. **StockAlert** (alertes de stock) : champ `reference`

## Prérequis

- Node.js et npm installés
- Accès à la base de données MongoDB (variable `MONGODB_URI` configurée dans `.env`)
- Backend arrêté (recommandé mais non obligatoire)

## Exécution

### Depuis le dossier `backend/`

```bash
cd backend
npm run migrate:jaquette-names
```

### Alternative (si vous êtes déjà dans `backend/scripts/`)

```bash
npx ts-node migrate-jaquette-names.ts
```

## Sortie attendue

```
🔌 Connexion à MongoDB...
✅ Connecté à MongoDB

📦 Mise à jour de la collection StockItem...
  ✓ "Jaquette FFF" -> "Jaquette Fil à Fil Foncé": X articles mis à jour
  ✓ "Jaquette FF Clair" -> "Jaquette Fil à Fil Clair": Y articles mis à jour
📊 Total articles de stock mis à jour: X+Y

📄 Mise à jour de la collection RentalContract...
📊 Total contrats mis à jour: Z

📋 Mise à jour de la collection StockMovement...
📊 Total mouvements de stock mis à jour: W

⚠️  Mise à jour de la collection StockAlert...
📊 Total alertes mises à jour: V

✅ Migration terminée avec succès !

📊 Résumé:
  - Articles de stock: X+Y
  - Contrats: Z
  - Mouvements: W
  - Alertes: V

🔌 Déconnecté de MongoDB
```

## Sécurité

- ✅ Le script est **idempotent** : vous pouvez l'exécuter plusieurs fois sans problème
- ✅ Il utilise `updateMany` et `updateOne` pour des mises à jour atomiques
- ✅ Il ne supprime aucune donnée
- ⚠️ **Recommandation** : Effectuez une sauvegarde de votre base de données avant la première exécution

## Sauvegarde (optionnel mais recommandé)

### Avec MongoDB Atlas

Utilisez l'interface web pour créer un snapshot avant la migration.

### Avec MongoDB local

```bash
mongodump --uri="votre_mongodb_uri" --out=backup-avant-migration
```

## En cas de problème

Si la migration échoue ou produit des résultats inattendus :

1. Vérifiez les logs d'erreur
2. Restaurez la sauvegarde si nécessaire
3. Contactez le développeur

## Après la migration

Après avoir exécuté avec succès la migration :

1. ✅ Redémarrez le backend : `npm run dev`
2. ✅ Vérifiez le frontend pour confirmer que les nouveaux noms s'affichent correctement
3. ✅ Testez la création d'un nouveau contrat avec ces jaquettes
4. ✅ Vérifiez que les anciens contrats affichent bien les nouveaux noms
