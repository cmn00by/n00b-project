// Les garde-fous de l'architecture en briques (docs/architecture.md, sections 2, 3 et 11).
// Une PR qui enfreint ces règles ne passe pas la vérification automatique.
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

// La simulation doit rester déterministe et indépendante du navigateur.
const simPurity = {
  'no-restricted-properties': [
    'error',
    { object: 'Math', property: 'random', message: 'Dans src/sim, tout le hasard passe par Rng (core/rng.ts).' },
    { object: 'Date', property: 'now', message: 'Dans src/sim, le temps vient du pas de simulation.' },
    { object: 'performance', property: 'now', message: 'Dans src/sim, le temps vient du pas de simulation.' },
  ],
  'no-restricted-globals': ['error', { name: 'window', message: 'Pas de navigateur dans src/sim.' }, { name: 'document', message: 'Pas de navigateur dans src/sim.' }],
}

const noPhaser = { name: 'phaser', message: 'Pas de Phaser dans src/sim ni src/data : la simulation doit tourner dans Node.' }
const coreDeep = { group: ['**/core/*'], message: "Importer le noyau par sa porte d'entrée : '.../core', jamais un fichier interne." }

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'scripts/art/node_modules', 'public'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  { files: ['scripts/**/*.mjs', '*.config.*'], languageOptions: { globals: { ...globals.node } } },

  // Le noyau n'importe rien d'autre du projet.
  {
    files: ['src/sim/core/**/*.ts'],
    rules: {
      ...simPurity,
      'no-restricted-imports': [
        'error',
        {
          paths: [noPhaser],
          patterns: [{ group: ['**/systems', '**/systems/**', '**/data', '**/data/**', '**/game', '**/game/**', '**/net', '**/net/**'], message: "Le noyau n'importe rien d'autre du projet." }],
        },
      ],
    },
  },

  // Un système n'importe ni un autre système, ni l'intérieur du noyau, ni l'affichage.
  {
    files: ['src/sim/systems/*/**/*.ts'],
    rules: {
      ...simPurity,
      'no-restricted-imports': [
        'error',
        {
          paths: [noPhaser],
          patterns: [
            // '../x' (un module voisin) est interdit ; '../../core' (le noyau) est permis.
            { regex: '^\\.\\./[^.]', message: "Un système n'importe jamais un autre système : passer par les événements." },
            coreDeep,
            { group: ['**/game', '**/game/**', '**/net', '**/net/**'], message: "La simulation n'importe jamais l'affichage." },
          ],
        },
      ],
    },
  },

  // La liste des systèmes importe chaque système par sa porte d'entrée.
  {
    files: ['src/sim/systems/index.ts'],
    rules: {
      ...simPurity,
      'no-restricted-imports': ['error', { paths: [noPhaser], patterns: [{ group: ['./*/*'], message: 'Importer un système par son index.ts.' }, coreDeep] }],
    },
  },

  // Les données n'utilisent que les types du noyau.
  {
    files: ['src/data/**/*.ts'],
    rules: {
      ...simPurity,
      'no-restricted-imports': [
        'error',
        { paths: [noPhaser], patterns: [{ group: ['**/systems', '**/systems/**', '**/game', '**/game/**'], message: "Les données n'importent que les types du noyau." }, coreDeep] },
      ],
    },
  },

  // L'affichage passe par les portes d'entrée des modules.
  {
    files: ['src/game/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [coreDeep, { group: ['**/sim/systems/*/*'], message: 'Importer un système par son index.ts.' }] }],
    },
  },

  // Les tests peuvent lire l'intérieur du module qu'ils testent.
  { files: ['src/**/*.test.ts'], rules: { 'no-restricted-imports': 'off' } },
)
