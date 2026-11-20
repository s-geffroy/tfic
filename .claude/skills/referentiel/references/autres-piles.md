# Profils Go et Julia

Propositions du referentiel v2.0.0, non evaluees sur un depot.

## Go

| Sujet | Application | Reference |
|---|---|---|
| Flux et erreurs | Traiter les valeurs `error`, enrichir le contexte quand utile, reserver `panic` aux cas exceptionnels ou le contrat le justifie. Propriete claire des donnees ; liberation par `defer` apres acquisition reussie. | https://go.dev/doc/effective_go |
| Delais et goroutines | Propager `context.Context` sur les operations qui cooperent avec l'annulation. Appeler la fonction `cancel` rendue par les constructeurs. Donner une fin observable a chaque goroutine ; borner canaux et files. | https://pkg.go.dev/context |
| Analyse et tests | `go vet ./...`, `go test ./...`, `go test -race ./...` sur une cible prise en charge. Le detecteur ne couvre que les chemins exerces. Test de saturation et d'annulation avec verification de la fin des goroutines. | https://pkg.go.dev/cmd/vet · https://go.dev/doc/articles/race_detector |
| Entrees hostiles | Fuzzer parseurs et decodeurs avec un budget d'execution ; conserver les entrees qui reproduisent un echec et les rejouer comme regressions. | https://go.dev/doc/security/fuzz/ |

## Julia

| Sujet | Application | Reference |
|---|---|---|
| Frontieres et performances | Isoler lecture et validation d'entrees des noyaux de calcul. Verifier types, dimensions, unites et finitude selon le domaine. Barrieres de fonction ; mesurer allocations et stabilite des types. | https://docs.julialang.org/en/v1/manual/performance-tips/ |
| Ressources et concurrence | `open(f, ...)` ou bloc `do`. Synchroniser l'etat partage ou en donner la propriete a une tache ; encadrer et attendre les taches avec une strategie de fin et de propagation d'erreur. | https://docs.julialang.org/en/v1/manual/multi-threading/ |
| Verification | `Test`, `@testset`, `@test_throws`, `Pkg.test()`. Tailles limites, NaN/Inf, convergence ; tolerances justifiees ; tests multithread si le code l'utilise. | https://docs.julialang.org/en/v1/stdlib/Test/ |
| Optimisations a risque | Garder les verifications de bornes par defaut. Tout `@inbounds` cible documente son invariant d'indices, exerce sur des entrees limites ; gain mesure et revue consignes. | https://docs.julialang.org/en/v1/manual/performance-tips/ |
