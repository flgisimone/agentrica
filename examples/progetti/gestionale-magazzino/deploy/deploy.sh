#!/bin/sh
# Aggiorna lo stack in produzione all'ultima immagine.
set -eu
KEY_FILE=$(mktemp)
trap 'rm -f "$KEY_FILE"' EXIT
printf '%s\n' "$DEPLOY_SSH_KEY" > "$KEY_FILE"
chmod 600 "$KEY_FILE"
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=yes deploy@magazzino.ortofrutta-emilia.example \
  "docker stack deploy --with-registry-auth -c /srv/magazzino/docker-compose.prod.yml magazzino"
