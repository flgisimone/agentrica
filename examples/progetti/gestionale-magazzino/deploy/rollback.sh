#!/bin/sh
# Torna alla versione precedente se il deploy va male.
set -eu
ssh deploy@magazzino.ortofrutta-emilia.example \
  "docker service update --image ghcr.io/ortofrutta-emilia/magazzino:previous magazzino_app"
