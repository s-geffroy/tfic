# Controles communs GEN-01 a GEN-06

Regle et critere de recette, tels que le referentiel v2.0.0 les fixe, suivis
de ce qu'il faut chercher dans le code. Appliquer les regles communes au code
propre a l'application ; renforcer les preuves aux frontieres de confiance,
sur les operations irreversibles et sur les chemins qui possedent des
ressources. Les versions des outils et du runtime sont fixees dans le depot.

## GEN-01 -- Flux

**Regle.** Garder les transitions et responsabilites explicites. Pour toute
recursion, reprise ou planification interne, documenter la condition d'arret
et la borne pertinente. Un serveur peut tourner durablement, chaque travail
qu'il accepte doit rester borne.

**Recette.** Cas normal, transitions interdites, annulation et epuisement du
budget.

**A chercher.**
- `while True`, boucles de reprise, recursion sur une donnee externe
  (JSON imbrique, arbre, liens) sans profondeur maximale ;
- reprises sans nombre maximal ni attente croissante ;
- machine a etats implicite (champs `status` modifies partout) : quelles
  transitions sont interdites, et ou est-ce refuse ?
- planificateurs et crons internes : que se passe-t-il si l'execution
  precedente n'est pas finie ?

## GEN-02 -- Entrees

**Regle.** Valider au point d'entree les donnees non fiables, unites,
tailles, profondeur et valeurs numeriques. Traiter les erreurs attendues par
un resultat explicite ou une exception documentee. Reserver les assertions
aux invariants internes.

**Recette.** Cas valides, malformes, limites N-1/N/N+1, erreurs sans donnees
sensibles.

**A chercher.**
- corps de requete, parametres, en-tetes, fichiers televerses, messages de
  file, reponses d'API tierces, variables d'environnement : ou sont-ils
  valides ? Taille maximale ? Nombre d'elements ? Profondeur ?
- nombres : NaN, infini, negatifs, depassement, unites melangees ;
- `assert` utilise pour refuser une entree ;
- messages d'erreur qui renvoient une trace, une requete SQL, un chemin, un
  secret ou une donnee personnelle.

## GEN-03 -- Ressources

**Regle.** Donner un proprietaire aux fichiers, connexions, taches et
verrous. Borner la concurrence, les files, les delais et les reprises.
Distinguer expiration de la reponse et arret effectif de l'operation.

**Recette.** Injecter erreur et annulation. Verifier liberation, saturation,
absence d'ecriture tardive et recuperation.

**A chercher.**
- ouvertures sans `with` / `defer` / `finally` ; pool de connexions sans
  taille maximale ;
- taches lancees et oubliees (`create_task` sans reference, goroutine sans
  fin, promesse non attendue) ;
- files sans taille maximale, `gather` sur une liste non bornee ;
- appel reseau sans delai ;
- delai depasse cote client alors que le travail continue cote serveur et
  ecrit son resultat plus tard (« ecriture tardive ») ;
- verrous pris sans liberation garantie sur erreur.

## GEN-04 -- Lisibilite

**Regle.** Fixer les regles de lint et de typage ou d'analyse disponibles.
Revoir les fonctions complexes selon leur risque. Les seuils locaux
declenchent une revue et se justifient par les besoins du projet.

**Recette.** CI sur installation verrouillee, rapports de diagnostics et
justification des suppressions locales.

**A chercher.**
- configuration de lint et de typage absente ou non lancee ;
- dependances non verrouillees (pas de lockfile, versions flottantes,
  images Docker `latest`) ;
- `# noqa`, `# type: ignore`, `eslint-disable`, `@ts-ignore`, `any` sans
  justification ;
- fonctions C1 longues ou tres ramifiees.

## GEN-05 -- Verification

**Regle.** Lier objectif/risque -> exigence -> module -> cas -> preuve.
Tester erreurs, frontieres et concurrence. Faire relire les changements
sensibles par une autre personne.

**Recette.** Resultat et preuve par cible, avec versions et commit. Une
preuve manquante reste NON EXECUTEE.

**A chercher.**
- `specs/` existe-t-il, et chaque exigence C1 a-t-elle un test nomme ?
- tests qui ne couvrent que le cas nominal ;
- rapport de tests sans commit ni version ;
- « OK » annonce sans commande lancee.

Sur ce VPS, la relecture par une autre personne n'est pas toujours possible
(un seul operateur). Ne pas la simuler : signaler le changement C1 comme a
faire relire, ou le declarer en derogation (GEN-06).

## GEN-06 -- Derogations

**Regle.** Documenter portee, raison, risque, compensation, proprietaire,
approbation, echeance et retest.

**Recette.** Une derogation expiree echoue au controle. Conserver les
resultats d'origine et de retest.

**Gabarit** (`docs/derogations.md`, une section par derogation) :

```
## DER-001 -- <titre court>
- Controle : GEN-0x
- Portee : <module, fichier, fonction>
- Raison :
- Risque accepte :
- Compensation :
- Proprietaire :
- Approbation : <qui, date>
- Echeance : AAAA-MM-JJ
- Retest : <commande> -- resultat d'origine : <...> ; dernier retest : <date, resultat>
```

Une echeance passee est un ECART, quelle que soit la qualite du code.
