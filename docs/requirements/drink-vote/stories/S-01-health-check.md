# S-01: Health check for the operator

- **Priority:** P0
- **Covers:** FR-10, NFR-02, NFR-04, NFR-05 · **Decisions:** A-06
- **Depends on stories:** none

## User story
As an operator, I want an address that tells me whether the app and its database are up, so that
the hosting platform can detect when the service is down.

## Acceptance criteria
1. **Healthy service**
   - Given the app is running and its database is reachable
   - When `GET /healthz` is requested
   - Then the response status is `200`
2. **Database unreachable**
   - Given the app is running but its database is unreachable
   - When `GET /healthz` is requested
   - Then the response status is not `200` (for example `503`)
3. **Migrations before start**
   - Given an empty database
   - When the app is started with its start command
   - Then the database migrations are applied before the app accepts requests, and `GET /healthz` returns `200`
4. **Configured by environment variables**
   - Given `DATABASE_URL` and `PORT` are set in the environment
   - When the app starts
   - Then it listens on `PORT` and uses the database at `DATABASE_URL`

## Out of scope
- Any user-facing page (S-02 onwards).
- Using `MIN_PEOPLE` (M2 only).

## Notes
- AC 2 comes from assumption A-06, accepted at GATE 1; the exact status code is the Team Lead's choice.
- NFR-04: the app runs on Railway in `staging` and `production`, each with its own Postgres; DevOps
  checks `/healthz` on staging after deploy.
- NFR-05 variables `APP_TZ` and `DEFAULT_CLOSE_AT` are used by S-06, S-07 and S-11.
