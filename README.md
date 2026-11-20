# tfic — TFIC-PN, identité culturelle du Père Noël

Ce dépôt contient deux choses :

| Élément | Où | Rôle |
|---|---|---|
| **Site scientifique statique** | `site/` (Astro 7, TypeScript strict) | Publié sur GitHub Pages : <https://s-geffroy.github.io/tfic/> |
| **Worker validateur** | `src/worker.py`, `compose.yaml` | Conteneur sur le VPS, sans surface HTTP : rejoue la chaîne de publication à chaque cycle et journalise PASS/FAIL |

Statut scientifique : **v0.5.1 — DRAFT**, non approuvé, non préenregistré.
Aucun résultat de reconnaissance humaine n'existe ; le site n'en affiche aucun.

## Site (`site/`)

```text
site/
├── data/source/        CSV publiés (sélection explicite, cf. docs/scientific-source-map.md)
├── scripts/            validate-content.ts (règles bloquantes), verify-publication.ts (revue de dist/)
├── src/lib/            parseur CSV, adaptateurs v0.4/v0.5 + surcouches, validation, graphe, similarité
├── src/pages/          accueil, théorie, corpus, personnages, réseau, laboratoire, méthodologie…
└── tests/              vitest, dont tests négatifs (filiation promue, identité compagnon, UNKNOWN≠ABSENT…)
```

`npm run build` = validation scientifique → `astro build` → revue de publication.
La moindre violation (filiation promue, `same_character` Krampus/Nicolas non
rejeté, trait hors vocabulaire, lien interne sans base `/tfic/`, image
d'archive, gabarit participant, statut `APPROVED`…) fait échouer la build et
donc le déploiement.

### Commandes (dans Docker, jamais sur l'hôte)

Le service `dev` (profil `cli`) monte `site/` dans un conteneur Node jetable :

```bash
sudo appctl run dev npm ci
sudo appctl run dev npm test
sudo appctl run dev npm run check      # astro check, preset strictest
sudo appctl run dev npm run build      # validate + build + verify-publication
```

Vérificateur Python du corpus de travail (service `verify`, sans réseau,
`specs/` en lecture seule) :

```bash
sudo appctl run verify python3 -I verifier_TFIC_PN_v0.5.1.py
```

### Publication

`.github/workflows/deploy.yml` : à chaque push sur `main`, tests, typecheck et
build complet, puis publication de `site/dist` sur GitHub Pages. Actions
épinglées par SHA. Prérequis (une fois) : *Settings → Pages → Build and
deployment → Source : GitHub Actions*.

`.github/workflows/ci.yml` : la même validation sur chaque PR.

Domaine personnalisé : définir `SITE_URL` et `BASE_PATH=/` à la build (voir
`site/astro.config.mjs`), ajouter `site/public/CNAME`.

## Worker validateur

| élément | rôle |
|---|---|
| boucle | rappelle `cycle()` toutes les `WORKER_INTERVAL` secondes (900) |
| `cycle()` | `validate` → `build` → `verify`, une ligne de log par cycle, détail de l'erreur en cas d'échec |
| `/state/last_run.json` | avancement écrit étape par étape (reprenable) ; `/state/cycles` compteur |
| battement | `/tmp/heartbeat`, seuil du healthcheck 2000 s (> 2 × intervalle) |
| arrêt propre | SIGTERM honoré, sommeil fractionné, fin du cycle en cours |

L'image se construit en lançant `npm test`, `npm run check` et `npm run build` :
si l'un échoue, `appctl rebuild` échoue et rien n'est mis en service.

```bash
tests/test_smoke.sh      # charpente : cycles, échec journalisé, état, battement, arrêt
sudo appctl validate
sudo appctl rebuild
sudo appctl status       # le conteneur doit passer 'healthy'
sudo appctl logs         # « cycle N PASS en … s (validate=ok build=ok verify=ok) »
```

| variable | défaut | rôle |
|---|---|---|
| `WORKER_INTERVAL` | `900` | secondes entre deux cycles |
| `WORKER_STATE` | `/state` | répertoire d'état (volume `tfic_state`) |
| `WORKER_SITE` | `/app/site` | site à valider |
| `WORKER_STEP_TIMEOUT` | `600` | délai maximal par étape |

## Documents de travail

`specs/` est **hors Git** (dépôt public). Le rapport de challenge, les
corrections v0.5.1 et le vérificateur durci y vivent ; le site n'en publie
qu'une sélection (`docs/scientific-source-map.md`).

## Licences

Code : MIT (`LICENSE`). Textes et données dérivées : CC BY-SA 4.0
(`LICENSE-PUBLICATION.md`). Les sources citées restent sous les droits de
leurs institutions.
