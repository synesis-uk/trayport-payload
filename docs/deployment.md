# First production deployment contract

This contract deliberately favors a predictable first release over zero-downtime
rollouts. Until Next.js uses a shared cache handler and Payload revalidation tags
are coordinated between processes, production runs exactly one combined
Next.js/Payload web process.

## Locked topology

- Run one web container with one Node.js process (`replicas: 1`).
- Use a replacement/stop-first strategy (`Recreate` in Kubernetes). Stop the old
  web container before applying migrations or starting the replacement.
- Do not use rolling, blue/green, canary, overlapping, or horizontally scaled web
  replicas in this first release.
- Run schema migrations in the dedicated `migrator` image before the replacement
  web container starts. The web process never applies schema changes.

This constraint can be revisited only after a durable shared Next.js cache handler
and cross-process tag invalidation have integration and deployment-failure tests.

## Build both images

Build both targets from the same immutable source revision, Dockerfile, and
`pnpm-lock.yaml`. Give both images the same revision tag. BuildKit receives the
licensed Font Awesome token only as an install-step secret.

```bash
export FONTAWESOME_NPM_TOKEN='<licensed-kit-token>'
export RELEASE_REVISION='<immutable-git-sha>'

docker build \
  --target migrator \
  --secret id=FONTAWESOME_NPM_TOKEN,env=FONTAWESOME_NPM_TOKEN \
  --build-arg NEXT_PUBLIC_SERVER_URL=https://www.example.com \
  --tag "trayport-web-migrator:${RELEASE_REVISION}" .

docker build \
  --target runner \
  --secret id=FONTAWESOME_NPM_TOKEN,env=FONTAWESOME_NPM_TOKEN \
  --build-arg NEXT_PUBLIC_SERVER_URL=https://www.example.com \
  --tag "trayport-web:${RELEASE_REVISION}" .

unset FONTAWESOME_NPM_TOKEN
```

The `migrator` target is derived from the same successful application build as
the web image and contains the exact locked dependencies and committed migration
files for that revision.

Whenever a Payload migration is added to `src/database/migrations/index.ts`,
append the same name to `scripts/deployment-schema.json`. The deployment contract
test rejects missing, reordered, or unexpected manifest entries.

## Replacement release sequence

1. Take and verify the database and object-storage backups required by the
   content architecture rollback policy.
2. Stop the existing web container. Confirm that no old or new web replica is
   serving before continuing.
3. Run the dedicated migration image with the same production configuration and
   secrets as the web image:

   ```bash
   docker run --rm \
     --env-file /run/secrets/trayport-web-production.env \
     "trayport-web-migrator:${RELEASE_REVISION}"
   ```

   The fixed `deploy:migrate` command runs only committed forward migrations and
   then verifies that `payload_migrations` exactly matches the revision's schema
   manifest. A non-zero result aborts the release; do not start the web image.
   The same guarded command can be invoked from a controlled source checkout as
   `corepack pnpm deploy:migrate`; the dedicated image is the production release
   path.
4. Start exactly one `runner` container for the same revision.
5. Wait for `/api/health/ready/` to return HTTP 200, then restore traffic and run
   the route/content smoke checks.

`DATABASE_URL`, the real `PAYLOAD_SECRET`, `PAYLOAD_DB_PUSH=false`, public-origin,
media-storage, SMTP, preview, and cron configuration must be supplied to the
migrator/web containers as applicable. Neither health endpoint returns config,
database identifiers, migration names, or errors.

## Home connections-map activation

The release may run safely without Mapbox: omit either value below and the Home route keeps its
deterministic managed-media/SVG fallback and makes no provider requests.

```dotenv
MAPBOX_PUBLIC_TOKEN=pk.<origin-restricted-public-token>
MAPBOX_STYLE_URL=mapbox://styles/<approved-owner>/<approved-style>
```

These are runtime web-container values, not Docker build arguments. The token is intentionally
browser-visible and must be a least-privilege public (`pk`) token restricted to the deployed site
origins; never supply a secret (`sk`) token. Before enabling both values, record approval for
Mapbox licensing and attribution and either approved use of the reference Synesis style or the
identity of a Trayport-owned clone. The runtime keeps the Mapbox logo and attribution control
enabled. The configured style applies only to the reference dark Home `mapOnly` presentation; a
light CMS selection retains its server-rendered light fallback rather than silently using the dark
provider style.

Release smoke evidence must show that Home renders 33 Power and 22 Natural Gas accessible marker
entries, activates only as the map approaches the viewport, and reaches its ready state after the
post-fit idle event. A non-Home route such as `/venue/eex/` must make zero Mapbox requests. If the
provider errors before readiness, the fallback must remain visible.

## Health probes

The image-level Docker healthcheck calls `GET /api/health/live/` with a two-second
client timeout. It proves that the Node.js HTTP process can respond and does not
depend on PostgreSQL.

Orchestrators must use separate probes:

```yaml
spec:
  replicas: 1
  strategy:
    type: Recreate
  template:
    spec:
      containers:
        - name: web
          livenessProbe:
            httpGet:
              path: /api/health/live/
              port: 3000
            initialDelaySeconds: 20
            periodSeconds: 30
            timeoutSeconds: 3
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /api/health/ready/
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 3
```

`/api/health/live/` returns 200 while the process is responsive.
`/api/health/ready/` returns 200 only when PostgreSQL responds within the bounded
probe timeout and the applied Payload migrations exactly match the application
revision; otherwise it returns 503 with generic check states. Both responses are
`Cache-Control: no-store` and must bypass CDN caching.

Readiness failure removes the process from traffic. Liveness failure permits an
orchestrator restart. Do not use the database-dependent readiness endpoint as the
liveness/restart condition.
