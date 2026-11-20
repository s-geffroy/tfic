---
# Skill du socle /opt/infra -- source socle (claude-skills.sh). Redigee a la main
# d'apres le « Referentiel generique inspire de NASA/JPL » v2.0.0 (2026-11-10).
name: referentiel
description: Appliquer a une application le referentiel de code inspire de NASA/JPL (controles GEN-01 a GEN-06 -- flux borne, validation des entrees, propriete des ressources, lint et typage, verification par preuves, derogations datees) avec ses profils Python, Web/React, Node/TypeScript et Go. A utiliser pour "appliquer le referentiel", "evaluer le code contre GEN-01..06", "classer les modules par criticite", "fiche d'adaptation", "registre des derogations", durcir un endpoint, un worker ou une tache de fond, ou pour le domaine Robustesse de /revue. Ne revendique aucune certification NASA/JPL.
license: interne
metadata:
  category: qualite
---

# Referentiel de code inspire de NASA/JPL (v2.0.0)

Ce referentiel adapte au logiciel courant les principes de Holzmann (*Power
of 10*), du standard JPL D-60411 et des directives NASA NPR 7150.2D et
NASA-STD-8739.8B. Il **ne revendique aucune certification** : c'est une grille
de discipline, pas une conformite.

Il se resume a une idee : **chaque travail est borne, chaque entree est
validee a la frontiere, chaque ressource a un proprietaire, chaque exigence
a une preuve -- et une preuve absente se dit.**

## Regle de proportionnalite -- toujours en premier

Le referentiel le demande lui-meme : **classer les modules selon les
consequences d'une defaillance**, puis renforcer les preuves la ou ca compte.

| Classe | Ce qui la declenche | Exigence |
|---|---|---|
| C1 -- critique | frontiere de confiance (entree Internet, webhook, upload, authentification), operation irreversible (suppression, paiement, envoi, ecriture en base), code qui possede des ressources (taches de fond, connexions, verrous, fichiers) | les six controles, avec tests limites N-1/N/N+1, injection d'erreur et d'annulation |
| C2 -- ordinaire | logique metier interne, rendu, calculs sans effet externe | GEN-02, GEN-04, GEN-05 ; le reste si le module l'appelle |
| C3 -- sans enjeu | contenu statique, gabarits, pages, documents | GEN-04 si un outil existe ; rien d'autre |

Un site statique, un blog, un document LaTeX sont C3 presque en entier : ne
pas leur imposer le referentiel. Dis-le en une phrase et arrete-toi la.

## Les six controles (resume)

Le detail, avec les criteres de recette, est dans
[references/controles-gen.md](references/controles-gen.md) : ouvre-le avant
toute evaluation.

- **GEN-01 Flux** -- transitions explicites ; toute boucle, recursion, reprise
  ou planification a une condition d'arret et une borne documentees. Un
  serveur tourne longtemps, chaque travail qu'il accepte reste borne.
- **GEN-02 Entrees** -- valider au point d'entree (types, unites, tailles,
  profondeur, numeriques). Erreur attendue = resultat explicite ou exception
  documentee ; les assertions pour les seuls invariants internes.
- **GEN-03 Ressources** -- un proprietaire pour chaque fichier, connexion,
  tache, verrou ; concurrence, files, delais et reprises bornes ; distinguer
  « le delai a expire » de « l'operation s'est arretee ».
- **GEN-04 Lisibilite** -- lint et typage fixes dans le depot, versions
  verrouillees ; toute suppression locale de diagnostic justifiee.
- **GEN-05 Verification** -- objectif/risque -> exigence -> module -> cas ->
  preuve. Une preuve manquante reste **NON EXECUTEE**, jamais « OK ».
- **GEN-06 Derogations** -- portee, raison, risque, compensation,
  proprietaire, approbation, echeance, retest. Une derogation expiree echoue.

## Profils par pile

Ouvre seulement celui de la pile concernee :

- Python (FastAPI, workers, scripts) : [references/python.md](references/python.md)
- Web, React, Vite : [references/web-react.md](references/web-react.md)
- Node et TypeScript (correspondance locale, proposee par le socle) :
  [references/node-ts.md](references/node-ts.md)
- Go, Julia : [references/autres-piles.md](references/autres-piles.md)

Les profils Python, Go et Julia n'ont ete evalues sur aucun depot, et le
profil Node est une proposition du socle : ce sont des points de depart.
Sources et limites documentaires : [references/sources.md](references/sources.md).

## Trois facons de s'en servir

### 1. Evaluer (revue, ou domaine « Robustesse » de /revue)

1. Lis le code et classe chaque module C1/C2/C3, avec une ligne de raison.
2. Pour chaque module C1 puis C2, passe les controles applicables avec
   [references/controles-gen.md](references/controles-gen.md) et le profil de
   la pile.
3. Chaque constat porte : controle (GEN-0x), fichier:ligne, ecart, scenario
   de defaillance concret, correction proposee, gravite (bloquant / important
   / mineur), et le **statut de preuve** :
   - `CONFORME` -- tu as vu la preuve (test qui passe, commande lancee) ;
   - `ECART` -- le code montre le defaut ;
   - `NON EXECUTE` -- tu n'as pas pu lancer la preuve ; dis pourquoi.
   Ne marque jamais `CONFORME` sur la seule lecture du code d'un test.
4. Ne modifie rien pendant une evaluation.

### 2. Adapter (poser le referentiel dans l'application)

Produis `docs/referentiel.md` d'apres le gabarit de
[references/fiche-adaptation.md](references/fiche-adaptation.md) : la
classification des modules, puis pour chaque controle les modules concernes,
le seuil et son unite, l'outil, **la commande reproductible**, le resultat
attendu et le responsable. Ajoute `docs/derogations.md` seulement s'il y a
une derogation a declarer. Montre la fiche avant de l'ecrire.

### 3. Ecrire du code C1

Quand tu ajoutes un endpoint, un consommateur de file, une tache de fond ou
une operation irreversible, applique GEN-01 a GEN-03 en l'ecrivant et livre
les tests qui vont avec : cas valide, malforme, limites N-1/N/N+1, annulation
ou delai, et verification qu'aucune ecriture n'arrive apres l'annulation.

## Sur ce VPS

- Rien ne tourne sur l'hote : lint, typage et tests passent par un service
  d'outillage du `compose.yaml` (profil `cli`) lance par
  `sudo appctl run <service> <arguments>`, ou par le conteneur de
  l'application. Une commande qui n'a pas pu tourner = `NON EXECUTE`.
- Les messages d'erreur et les journaux ne contiennent ni secret ni donnee
  personnelle (GEN-02) : c'est deja la regle « Secrets » du `CLAUDE.md`.
- La relecture « par une autre personne » (GEN-05, NASA-STD-8739.8B) ne se
  remplace pas par un sous-agent. Un changement C1 se signale a l'humain
  comme **a faire relire** ; une revue par agent s'appelle une revue par
  agent, pas une revue independante.
