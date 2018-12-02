# source the environment variables file
include .env

prepare-for-cf:
	npm run build

deploy-to-cf:
	npm run build-worker && make upload-worker

cf: prepare-for-cf deploy-to-cf

upload-worker:
	curl -X PUT "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/workers/script" \
	-H "X-Auth-Email:${ACCOUNT_EMAIL}" \
	-H "X-Auth-Key:${ACCOUNT_AUTH_KEY}" \
	-H "Content-Type:application/javascript" \
	--data-binary "@./dist/worker.js"
