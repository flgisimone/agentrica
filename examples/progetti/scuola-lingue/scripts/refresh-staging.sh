#!/bin/sh
# Allinea lo staging alla produzione, così la segreteria prova con dati veri.
set -e
pg_dump "$PROD_DATABASE_URL" --format=custom --file=/tmp/prod.dump
pg_restore --clean --no-owner --dbname="$STAGING_DATABASE_URL" /tmp/prod.dump
rclone sync nimbus:parlasubito-prod nimbus:parlasubito-staging
rm /tmp/prod.dump
