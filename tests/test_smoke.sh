#!/usr/bin/env bash
# Test minimal de la charpente : le worker fait-il un cycle, pose-t-il son
# battement, ecrit-il son avancement, journalise-t-il un echec d'etape sans
# mourir, et s'arrete-t-il sur SIGTERM ?
#
# Le site pointe volontairement vers un repertoire inexistant : aucune etape
# node ne s'execute sur l'hote. La chaine reelle (validate/build/verify) est
# testee dans l'image (build Docker) et par les logs du conteneur.
set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

WORKER_INTERVAL=1 WORKER_STATE="$tmp/state" WORKER_HEARTBEAT="$tmp/beat" WORKER_SITE="$tmp/absent" \
  timeout --signal=TERM 3 python3 "$here/../src/worker.py" > "$tmp/out" 2>&1 || true

test -f "$tmp/beat"                  || { echo "ECHEC : pas de battement"; exit 1; }
test -f "$tmp/state/cycles"          || { echo "ECHEC : aucun cycle effectue"; exit 1; }
test "$(cat "$tmp/state/cycles")" -ge 2 || { echo "ECHEC : la boucle n'a pas survecu a un cycle en echec"; cat "$tmp/out"; exit 1; }
test -f "$tmp/state/last_run.json"   || { echo "ECHEC : avancement non ecrit dans l'etat"; exit 1; }
grep -q "etape validate FAIL" "$tmp/out" || { echo "ECHEC : erreur d'etape avalee"; cat "$tmp/out"; exit 1; }
grep -q "arrete" "$tmp/out"          || { echo "ECHEC : arret non propre"; cat "$tmp/out"; exit 1; }
echo "OK : cycles effectues malgre l'echec d'etape, erreur journalisee, etat ecrit, battement pose, arret propre"
