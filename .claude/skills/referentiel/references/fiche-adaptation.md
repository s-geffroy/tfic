# Gabarit : docs/referentiel.md

Le referentiel demande, pour adapter le profil a un depot, de renseigner pour
chaque controle : les modules concernes, le seuil et son unite, l'outil ou le
protocole, la commande reproductible, le resultat attendu et le responsable.

```markdown
# Referentiel de code -- <application>

Version du referentiel : v2.0.0 (inspire de NASA/JPL, sans certification).
Derniere mise a jour : AAAA-MM-JJ, commit <sha>.

## Classification des modules

| Module | Classe | Raison |
|---|---|---|
| src/api/upload.py | C1 | frontiere de confiance : fichier televerse depuis Internet |
| src/worker/sync.py | C1 | tache de fond, reprises, ecriture en base |
| src/templates/ | C3 | gabarits sans logique |

## Controles

| Controle | Modules | Seuil (unite) | Outil / protocole | Commande | Resultat attendu | Responsable |
|---|---|---|---|---|---|---|
| GEN-01 | worker/sync | 5 reprises, 30 s max | test pytest | `sudo appctl run tools pytest tests/test_sync.py` | 0 echec | <nom> |
| GEN-02 | api/upload | 10 Mo, 3 niveaux JSON | pydantic + tests limites | ... | ... | ... |
| GEN-03 | ... | ... | ... | ... | ... | ... |
| GEN-04 | tout C1/C2 | 0 diagnostic | ruff, mypy | `sudo appctl run tools ruff check .` | sortie 0 | ... |
| GEN-05 | tout C1 | 1 test par exigence | specs/ -> tests/ | ... | ... | ... |
| GEN-06 | -- | 0 derogation expiree | docs/derogations.md | lecture des echeances | aucune echeance passee | ... |

## Derniers resultats

| Controle | Date | Commit | Statut (CONFORME / ECART / NON EXECUTE) | Preuve |
|---|---|---|---|---|
```

Les commandes passent par `sudo appctl run <service>` (service d'outillage au
profil `cli` du compose.yaml) ou par le conteneur de l'application : rien ne
s'installe sur l'hote.
