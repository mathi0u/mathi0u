# Form Builder POC

React + [JSON Forms](https://jsonforms.io) : construire des écrans de formulaire par glisser-déposer, puis s'en servir pour créer, afficher et éditer des données. Tout est stocké dans `localStorage` (clés `fb.forms` et `fb.records`).

```bash
npm install
npm run dev
```

## Fonctionnement

- **Builder** (`Builder.tsx`) : palette de champs → canevas (drag & drop natif HTML5, réordonnable), panneau de propriétés (libellé, clé, obligatoire, description, options) et aperçu en direct.
- **Génération** (`schema.ts`) : la liste de champs est convertie en JSON Schema + UI Schema.
- **Rendu** (`DynamicForm.tsx`) : `JsonForms` avec les renderers vanilla, utilisé à la fois pour l'aperçu et la saisie.
- **Données** (`Records.tsx`) : tableau des entrées, création, édition (validation JSON Schema) et suppression.

## Pistes ensuite

Layouts (groupes, colonnes), règles conditionnelles, validations (min/max, pattern), persistance API, traduction des messages d'erreur.
