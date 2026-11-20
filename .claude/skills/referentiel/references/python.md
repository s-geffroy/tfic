# Profil Python

Proposition du referentiel v2.0.0, non evaluee sur un depot. Pour FastAPI,
workers et scripts.

| Sujet | Application | Reference |
|---|---|---|
| Types et frontieres | Annoter les API et executer un verificateur statique choisi par le projet. Les annotations ne valident pas les objets recus a l'execution. Decoder explicitement fichiers, messages et parametres externes. | https://docs.python.org/3/library/typing.html |
| Assertions | Utiliser une exception explicite pour une entree invalide ou un controle de production. Tester le meme refus sous `python -O`, qui peut supprimer les assertions. | https://docs.python.org/3/reference/simple_stmts.html#the-assert-statement |
| Ressources et taches | `with` ou `async with` et, pour asyncio, `TaskGroup` et `timeout` selon la version ciblee. Propager l'annulation apres nettoyage. Borner les files et ne pas supposer qu'une operation bloquante dans un thread s'arrete a l'expiration du delai. | https://docs.python.org/3/library/contextlib.html · https://docs.python.org/3/library/asyncio-task.html |
| Controles et tests | Exemple de CI : `ruff check` et `python -m unittest discover` (ou pytest). Injecter erreur d'ouverture, interruption et charge excessive. Ajouter le verificateur de types separement si necessaire. | https://docs.astral.sh/ruff/ · https://docs.python.org/3/library/unittest.html |

## Points concrets pour les applications du VPS

- **FastAPI / pydantic** : un modele pydantic valide bien a l'execution, mais
  seulement ce qu'il declare. Verifier `max_length`, `ge`/`le`,
  `max_items`/`max_length` sur les listes, et la taille du corps (Traefik ou
  l'application) ; un `dict` ou `Any` libre est une entree non validee.
- **`except Exception: pass`** et `except: ...` qui avalent l'annulation
  (`asyncio.CancelledError`) : ECART GEN-03.
- **`asyncio.wait_for` / `timeout` autour d'un `run_in_executor`** : le
  thread continue apres l'expiration ; verifier qu'il n'ecrit rien ensuite.
- **`httpx`/`requests` sans `timeout=`** : ECART GEN-03.
- **SQLAlchemy** : session ouverte par requete et fermee en `finally` ou par
  dependance FastAPI a `yield`.
- **Test sous `python -O`** : le refus d'une entree invalide doit tenir.
