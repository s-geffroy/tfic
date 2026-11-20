# Carte de traçabilité : site public ↔ corpus de travail

Le site publie une **sélection** des fichiers de travail TFIC-PN. Les dossiers
complets (v0.3, v0.4, v0.5, v0.5.1) vivent hors de ce dépôt public : leur
emplacement canonique déclaré est un espace de stockage privé, et une copie de
travail locale est tenue dans `specs/TFIC_Pere_Noel/` (ignorée par Git).

## Fichiers publiés (`site/data/source/`)

| Fichier publié | Fichier de travail d'origine | Version | Modifié ? |
|---|---|---|---|
| `v05_sources_critiques.csv` | `TFIC_PN_sources_critiques_v0.5.1_2026-11-20.csv` | 0.5.1 | copie exacte |
| `v05_assertions_pilote.csv` | `TFIC_PN_assertions_pilote_v0.5.1_2026-11-20.csv` | 0.5.1 | copie exacte |
| `v05_relations.csv` | `TFIC_PN_relations_v0.5.1_2026-11-20.csv` | 0.5.1 | copie exacte |
| `v05_occurrences.csv` | `TFIC_PN_occurrences_v0.5.1_2026-11-20.csv` | 0.5.1 | copie exacte |
| `v05_personnages.csv` | `TFIC_PN_personnages_v0.5.1_2026-11-20.csv` | 0.5.1 | copie exacte |
| `v05_vocabulaire.csv` | `TFIC_PN_vocabulaire_v0.5.1_2026-11-20.csv` | 0.5.1 | copie exacte |
| `v05_corrections.csv` | `TFIC_PN_corrections_v0.5.1_2026-11-20.csv` | 0.5.1 | copie exacte |
| `v05_correspondance_v04_v05.csv` | `TFIC_PN_correspondance_v04_v05_v0.5.1_2026-11-20.csv` | 0.5.1 | copie exacte |
| `v04_registre_sources.csv` | `TFIC_PN_registre_sources_v0.4.0_2026-11-13.csv` | 0.4.0 | copie exacte (CRLF d'origine) |
| `v04_assertions.csv` | `TFIC_PN_assertions_v0.4.0_2026-11-13.csv` | 0.4.0 | copie exacte |
| `v04_relations.csv` | `TFIC_PN_relations_v0.4.0_2026-11-13.csv` | 0.4.0 | copie exacte |

Les corrections v0.5.1 de la v0.4 (K10–K14 : Jonson 1610, valeurs numériques
dans la colonne `state`, Sand classée « Santa », URL Rudolph) sont appliquées en
**surcouche** dans `site/src/lib/data.ts` ; les fichiers v0.4 publiés restent
identiques aux originaux.

## Fichiers volontairement non publiés

| Fichier | Raison |
|---|---|
| `TFIC_PN_stimuli_manifest_*` | contient `development_label_DO_NOT_SHOW` : publier les cibles compromettrait une passation en aveugle |
| `TFIC_PN_double_annotation_template_*`, `TFIC_PN_reponses_template_*` | gabarits de données de codeurs / participants |
| Documents `.md` v0.3–v0.5, rapport de challenge | documents de travail ; le site en publie une réécriture éditoriale |
| Archives `.zip`, scripts Python de vérification | archives de travail ; les contrôles sont portés en TypeScript (`site/src/lib/validate.ts`) |

## Correspondance des contrôles

| Contrôle du vérificateur `verifier_TFIC_PN_v0.5.1.py` | Règle bloquante du site |
|---|---|
| unicité des identifiants | `ids_uniques` |
| clés étrangères, extrémités de relations, occurrence/source | `references` |
| états, valeurs, localisateurs | `etats` |
| vocabulaire contrôlé (traits, grades, inférences, relations, statuts) | `vocabulaire` |
| S07 = 1878 | `dates` |
| deux occurrences distinctes dans Karl Krinken | `meme_livre_occurrences_distinctes` |
| lignées jamais `SUPPORTED*`, identité compagnon interdite | `identite_et_filiation` |
| annotateur unique déclaré | `annotation_simple_declaree` |
