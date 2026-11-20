# Profil Node et TypeScript -- correspondance locale

Le referentiel v2.0.0 n'a pas de profil Node serveur. Il demande, pour une
pile supplementaire, de « fournir la correspondance locale des memes
controles ». Celle-ci est une **proposition du socle** (2026-11-10), non
evaluee sur un depot : a ajuster a chaque application.

| Sujet | Application | Reference |
|---|---|---|
| Types et frontieres | `tsc --noEmit` en `strict`. Les types TypeScript disparaissent a l'execution : decoder explicitement corps de requete, messages et fichiers (zod, valibot, JSON Schema). Limiter la taille du corps (`express.json({ limit })` ou equivalent). | https://www.typescriptlang.org/tsconfig#strict |
| Erreurs | Pas de promesse flottante (`@typescript-eslint/no-floating-promises`) ; un gestionnaire d'erreur par route ; `unhandledRejection` journalise puis arrete le processus plutot que de continuer dans un etat inconnu. | https://nodejs.org/api/process.html#event-unhandledrejection |
| Delais et annulation | `AbortController` / `AbortSignal.timeout()` sur chaque `fetch` et operation longue ; propager le signal. Distinguer la reponse expiree du travail arrete. | https://nodejs.org/api/globals.html#class-abortcontroller |
| Ressources et concurrence | Pools de connexions bornes ; `Promise.all` sur une liste non bornee remplace par une concurrence limitee ; fermeture propre sur `SIGTERM` (le conteneur recoit `docker stop`). | https://nodejs.org/api/process.html#signal-events |
| Controles et tests | ESLint (avec typescript-eslint), `tsc --noEmit`, `node --test` ou le lanceur du projet ; installation par `npm ci` sur lockfile. | https://nodejs.org/api/test.html |

## A chercher

- `any`, `as unknown as`, `@ts-ignore`, `eslint-disable` non justifies ;
- `JSON.parse` sur une entree externe sans schema ni taille maximale ;
- `fetch` sans signal ; `setInterval` sans arret ;
- `catch {}` vide ; erreurs renvoyees au client avec la pile.
