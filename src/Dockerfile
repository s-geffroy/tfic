# Worker validateur TFIC-PN.
# Etape 1 : installe les dependances verrouillees, puis lance tests, typecheck
# et build complet. Si un test echoue, l'image ne se construit pas et
# 'appctl rebuild' echoue : rien de faux n'est mis en service.
FROM node:22.23.5-alpine AS build
WORKDIR /app/site
COPY site/package.json site/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY site/ ./
ENV ASTRO_TELEMETRY_DISABLED=1
RUN npm test && npm run check && npm run build

# Etape 2 : image d'execution. Python porte la boucle (src/worker.py) ; node
# rejoue validation et build a chaque cycle.
FROM node:22.23.5-alpine
RUN apk add --no-cache python3
ENV ASTRO_TELEMETRY_DISABLED=1 \
    WORKER_SITE=/app/site
# Utilisateur non-root : rien n'oblige ce conteneur a tourner en root.
# /state est cree ICI, et possede par 'app' : Docker initialise un volume nomme
# vide avec le proprietaire et les droits du repertoire de l'image. Sans ca, le
# volume arriverait en root:root et le worker ne pourrait pas y ecrire.
# --chown a la copie : un chown -R sur node_modules coute plusieurs minutes.
RUN adduser -D -u 10001 app && mkdir -p /state /app && chown app:app /state /app
WORKDIR /app
COPY --from=build --chown=app:app /app/site /app/site
COPY --chown=app:app src/worker.py /app/worker.py
USER app

# Aucun EXPOSE : ce conteneur n'ouvre rien.
# -u : sortie non bufferisee, sinon les logs n'apparaissent que par blocs.
CMD ["python3", "-u", "/app/worker.py"]
