#!/usr/bin/env python3
"""
Worker validateur TFIC-PN : une boucle, un battement de coeur, un arret propre.

A chaque cycle, il rejoue la chaine de publication du site statique :
validation scientifique des donnees, build Astro, revue de publication de
dist/. Il journalise PASS/FAIL par etape et ecrit l'avancement dans /state au
fur et a mesure (reprenable). Le site est publie par GitHub Actions ; ce
conteneur ne sert rien et n'ouvre aucun port.
"""
import json
import os
import signal
import subprocess
import time
from pathlib import Path

INTERVAL = int(os.environ.get("WORKER_INTERVAL", "900"))
HEARTBEAT = Path(os.environ.get("WORKER_HEARTBEAT", "/tmp/heartbeat"))
STATE = Path(os.environ.get("WORKER_STATE", "/state"))
SITE = Path(os.environ.get("WORKER_SITE", "/app/site"))
STEP_TIMEOUT = int(os.environ.get("WORKER_STEP_TIMEOUT", "600"))

# Etapes de la chaine, dans l'ordre. Une etape en echec arrete le cycle.
STEPS = [
    ("validate", ["node", "scripts/validate-content.ts"]),
    ("build", ["node", "node_modules/astro/bin/astro.mjs", "build", "--silent"]),
    ("verify", ["node", "scripts/verify-publication.ts"]),
]

stopping = False


def log(msg):
    # flush : sans lui, la sortie est bufferisee des qu'elle n'est pas un
    # terminal, et `appctl logs` ne montre rien pendant des minutes.
    print(f"{time.strftime('%Y-%m-%dT%H:%M:%S%z')} {msg}", flush=True)


def on_stop(signum, _frame):
    global stopping
    stopping = True
    log(f"signal {signum} recu : arret a la fin du cycle en cours")


def write_state(path, data):
    """Ecriture atomique : un arret brutal ne laisse jamais un JSON tronque."""
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2))
    tmp.replace(path)


def last_line(text):
    lines = [ln for ln in (text or "").strip().splitlines() if ln.strip()]
    return lines[-1][:300] if lines else ""


def cycle():
    """Rejoue validation, build et revue de publication ; trace chaque etape."""
    counter = STATE / "cycles"
    n = int(counter.read_text()) + 1 if counter.exists() else 1
    counter.write_text(str(n))
    run_file = STATE / "last_run.json"
    run = {"cycle": n, "started": time.strftime("%Y-%m-%dT%H:%M:%S%z"), "steps": {}, "status": "RUNNING"}
    write_state(run_file, run)
    t0 = time.monotonic()

    for name, cmd in STEPS:
        if stopping:
            run["status"] = "INTERRUPTED"
            break
        started = time.monotonic()
        try:
            proc = subprocess.run(cmd, cwd=SITE, capture_output=True, text=True, timeout=STEP_TIMEOUT)
            ok = proc.returncode == 0
            detail = last_line(proc.stdout) if ok else last_line(proc.stderr) or last_line(proc.stdout)
        except (OSError, subprocess.TimeoutExpired) as exc:
            ok, detail = False, repr(exc)
        run["steps"][name] = {"ok": ok, "seconds": round(time.monotonic() - started, 1), "detail": detail}
        write_state(run_file, run)
        if not ok:
            # Le message d'erreur ne doit jamais etre avale.
            log(f"cycle {n} etape {name} FAIL : {detail}")
            run["status"] = "FAIL"
            break
    else:
        run["status"] = "PASS"

    run["seconds"] = round(time.monotonic() - t0, 1)
    write_state(run_file, run)
    summary = " ".join(f"{k}={'ok' if v['ok'] else 'FAIL'}" for k, v in run["steps"].items())
    log(f"cycle {n} {run['status']} en {run['seconds']} s ({summary})")


def main():
    signal.signal(signal.SIGTERM, on_stop)
    signal.signal(signal.SIGINT, on_stop)
    STATE.mkdir(parents=True, exist_ok=True)
    log(f"demarrage (intervalle {INTERVAL} s, etat dans {STATE}, site dans {SITE})")

    while not stopping:
        try:
            cycle()
        except Exception as exc:
            # Un cycle qui echoue ne tue pas le worker : il rate son tour et
            # reessaie au suivant. Ce qui ne doit jamais etre avale, c'est le
            # message d'erreur.
            log(f"echec du cycle : {exc!r}")
        HEARTBEAT.touch()

        # Sommeil fractionne : un SIGTERM ne doit pas attendre l'intervalle
        # entier pour etre pris en compte.
        for _ in range(INTERVAL):
            if stopping:
                break
            time.sleep(1)

    log("arrete")


main()
