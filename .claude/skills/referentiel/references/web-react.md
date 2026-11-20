# Profil Web, React et Vite

Le referentiel v2.0.0 vient d'un projet React/TypeScript/Electron. Le volet
Electron (isolation, sandbox, protocole, fuses, signature) ne concerne
aucune application de ce VPS et n'est pas repris ici.

| Reference | Usage |
|---|---|
| W3C WCAG 2.2 -- https://www.w3.org/TR/WCAG22/ | Criteres A/AA sur les parcours critiques (P0) : contraste, focus visible, taille des cibles. |
| WAI ARIA APG, Modal Dialog -- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ | Clavier, nom accessible, restitution du focus des dialogues. |
| WHATWG HTML, element dialog -- https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element | `showModal()`, fermeture et evenements natifs. |
| React 19 et useEffect -- https://react.dev/reference/react/useEffect | Contrat des refs ; chaque effet a son nettoyage, verifie sous StrictMode (double montage en developpement). |
| Vite, deploiement statique -- https://vite.dev/guide/static-deploy | Build servi a la racine et sous un prefixe (`base`). |
| Playwright -- https://playwright.dev/ | Automatisation des parcours. Sur ce VPS : le navigateur partage (skill navigateur) ou un conteneur de test. |

## Correspondance avec GEN

- **GEN-01** : etats d'interface explicites (chargement, erreur, vide,
  succes) ; pas de requetes en cascade sans fin (effet qui se redeclenche).
- **GEN-02** : valider les reponses d'API cote client avant de les afficher
  (schema zod ou equivalent) ; ne jamais faire confiance a la validation
  client cote serveur.
- **GEN-03** : chaque `useEffect` qui abonne, temporise ou lance une
  requete renvoie un nettoyage (`AbortController`, `clearTimeout`,
  desabonnement) ; pas de `setState` apres demontage ; verifier sous
  StrictMode.
- **GEN-04** : `tsc --noEmit` en mode `strict`, ESLint avec
  `react-hooks/exhaustive-deps` ; versions verrouillees (lockfile).
- **GEN-05** : chaque parcours P0 a un test de bout en bout et un controle
  d'accessibilite (axe ou equivalent), plus clavier seul.

## Sur ce VPS

- Les sites sont servis derriere Traefik ; un build sous un sous-chemin
  exige `base` dans `vite.config` et des liens relatifs coherents.
- Pour verifier visuellement : le navigateur partage (skill `navigateur`).
