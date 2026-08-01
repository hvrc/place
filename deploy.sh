#!/usr/bin/env bash
# Deploy the hvrc.place site to Cloud Run (static SPA, no env/secrets).
#   PROJECT_ID=hvrc-web REGION=us-east1 ./deploy.sh
set -euo pipefail
PROJECT_ID="${PROJECT_ID:-hvrc-web}"; REGION="${REGION:-us-east1}"; SERVICE="${SERVICE:-place}"
gcloud config set project "${PROJECT_ID}" >/dev/null
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project "${PROJECT_ID}" --quiet >/dev/null
gcloud run deploy "${SERVICE}" --source . --region "${REGION}" --allow-unauthenticated \
  --min-instances 0 --max-instances 2 --cpu 1 --memory 512Mi --port 8080 --quiet
URL="$(gcloud run services describe "${SERVICE}" --region "${REGION}" --format='value(status.url)')"
echo "Deployed ${SERVICE}: ${URL}"
[ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "${URL}")" = "200" ] && echo "OK 200" || echo "WARN not 200"
