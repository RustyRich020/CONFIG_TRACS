# CONFIG_TRACS

TRACS Foundation Shell Prototype

This prototype now includes the first practical build phases for TRACS:

1. Foundation Shell + Profile/Domain Config Loader
2. Connector Hub
3. CSV Adapter Starter + Mapping Studio
4. Persistence + Saved Versions
5. Backend Persistence Boundary + Live Adapter Contracts
6. File-backed API Skeleton
7. Live CSV Adapter Metadata + Preview
8. Connector Run Persistence
9. Mapping Run Persistence
10. Integration Contract Persistence
11. Local Asset Registry + Template Library v1
12. Controlled Template Promotion + Template Records v1
13. Backend Record Store Abstraction + Database Schema Blueprint v1
14. Canonical Workflow Surface v1
15. Live Canonical Load + Connector-Backed Objects v1
16. Report Catalog Config + Freshness Checks
17. Template Detail Editing + Controlled Template Overrides v1
18. Readiness Evidence Packet Export v1
19. Connector-Profiled Canonical Loads v1
20. Credential-Aware Metadata Discovery v1
21. Config-Driven Report Catalog Editing + Publish Gates v1
22. Evidence Packet Approval Workflow + Exception Disposition Tracking v1
23. Connector-Backed Extraction Jobs v1
24. Credential Validation Tests + Token Rotation Checks v1
25. Report Catalog Approval History + Reviewer Sign-Off v1
26. Approval Audit History + Reviewer Routing for Readiness Evidence Packets v1
27. Extraction Job Scheduling Controls + Run Retry Policy v1

## What It Proves

- Loads TRACS YAML config from `public/config`.
- Activates industry profiles from config.
- Activates solution domains from config.
- Derives canonical object-family coverage from active domains.
- Runs readiness skeleton checks.
- Records local audit events for profile/domain/contract actions.
- Loads connector manifests from YAML.
- Runs manifest-level connector tests for Snowflake, SharePoint Excel, CSV/manual upload, and external reference connectors.
- Displays connector metadata previews and source-to-target object mappings.
- Captures connector readiness evidence for export.
- Provides controlled templates for deployment profiles, connectors, mappings, readiness checks, integration contracts, and adapter implementation.
- Infers CSV/manual upload schema from a sample source file.
- Validates the `quality_event` mapping manifest against inferred source columns.
- Captures mapping readiness evidence for primary key, required fields, optional fields, and sample rows.
- Saves connector tests, mapping validations, mapping manifest snapshots, and exported contracts into browser-local version history.
- Persists deployment snapshots and adapter dry-run records through either browser-local storage or the TRACS API.
- Provides live adapter contracts for Snowflake, SharePoint Excel, CSV/manual upload, and external reference connectors.
- Runs a dependency-light Node API with file-backed records for backend integration testing.
- Discovers CSV source metadata and returns bounded preview rows through API-backed or local adapter mode.
- Saves CSV metadata discovery and preview evidence as versioned connector run records.
- Shows persisted connector run history in the Connector Hub.
- Saves Mapping Studio validation evidence as versioned backend records.
- Shows persisted mapping validation history in Mapping Studio.
- Saves integration contracts as versioned backend records.
- Provides a Contract workspace for saving, exporting, and reviewing contract history.
- Scans `C:\Users\Allen\MYROBOTS` for local QMS templates, schemas, manifests, and reference assets.
- Extends the Templates view into a filterable Template Library backed by the local asset registry.
- Promotes selected local assets into controlled TRACS template records with source provenance, tags, status, and version history.
- Flags controlled template records against the latest local asset fingerprint when the registry is available.
- Moves API persistence behind a record store abstraction with a SQL-ready schema blueprint.
- Exposes the record store schema in the Backend workspace for database implementation planning.
- Exposes sample-backed canonical objects, quality events, traceability links, and report catalog items through typed API routes.
- Adds Quality Events, Object Explorer, Traceability, and Report Catalog workspaces to the shell.
- Loads mapped CSV quality-event rows into persisted canonical object and traceability-link records.
- Updates workflow screens to prefer persisted canonical records while keeping sample fallback before first load.
- Loads BI/report catalog metadata from YAML config and computes freshness status from refresh SLA thresholds.
- Edits controlled template lifecycle status, classification, tags, and provenance as new versioned template records.
- Packages canonical load records, report freshness, and open exceptions into versioned readiness evidence packet records.
- Loads canonical records through selectable Snowflake, SharePoint Excel, and CSV connector profiles with source-object evidence.
- Discovers Snowflake and SharePoint Excel metadata through server-side credential-aware adapters, with safe missing-credential evidence when tokens are not configured.
- Edits report catalog records from the UI and gates publish status on freshness plus canonical dependency availability.
- Captures readiness evidence approval state, reviewer rationale, next-review date, and exception dispositions before packet save/export.
- Saves reusable connector-backed extraction jobs and records executable job runs that feed canonical load evidence.
- Validates deployed adapter credential presence and token-rotation evidence without exposing secret values to the frontend.
- Captures report catalog reviewer sign-off, rationale, status, and approval history as versioned report records.
- Routes readiness evidence packets to reviewer stages and appends approval audit history to saved packet records.
- Adds extraction job scheduling controls, cadence metadata, retry policy, and run retry eligibility evidence.
- Adds credential provider configuration templates for Snowflake, Microsoft Graph, and external reference adapters without storing secret values.
- Routes report catalog items with reviewer stages, due dates, routed reviewers, notification exports, and notification history.
- Exports readiness evidence approval notification packets for reviewer handoff.
- Adds extraction job run queue and schedule calendar views with queue export.
- Validates external-reference connector credentials with backend environment and token rotation checks.
- Adds a traceability path explorer that shows event-to-object relationship paths and coverage.
- Adds guarded notification delivery connectors for email, Teams, and SharePoint export folders with persisted delivery evidence.
- Adds tenant notification smoke fixtures for guarded email and Teams endpoint validation.
- Requires reviewer sign-off records before tenant live notification channels can execute.
- Routes notification approval expiry reminders before tenant live-channel sign-off records lapse.
- Closes notification approval renewals with superseded approval evidence.
- Adds source-specific external-reference mapping templates for CAPA, supplier, and document systems.
- Promotes CAPA, supplier, and document external-reference mappings into active validation profiles.
- Connects active CAPA, supplier, and document mapping profiles to credential-aware external-reference metadata and preview adapters.
- Executes canonical loads for approved external-reference mapping profiles with retained object and traceability evidence.
- Records external-reference load exception dispositions and manual replay evidence for approved mapping profiles.
- Exports traceability graph packages from active filters and saved readiness evidence packet coverage.
- Captures signed traceability graph export reviews with reviewer rationale and retention evidence.
- Delivers traceability graph export packages to reviewer notification channels with persisted delivery evidence.
- Tracks reviewer acknowledgement and response records for delivered traceability export packages.
- Routes traceability response closures and sends reviewer follow-up notifications with retained evidence.
- Exports notification closure packages for messaging owners with closure, delivery, and approval evidence.
- Delivers notification closure packages to messaging-owner review channels.
- Shows closure SLA dashboard metrics for traceability response and notification follow-up queues.
- Exports closure SLA packages for governance review with ordered route queues and required actions.
- Discovers external-reference metadata and bounded preview rows through a credential-aware backend adapter.
- Filters traceability graphs by object family, status, and saved evidence packet coverage.
- Adds a selectable SQLite record store adapter behind the existing API persistence contract.
- Adds an optional Postgres record store adapter and migration checklist for shared production persistence.
- Adds Postgres import reconciliation summaries and Backend dashboard views for guarded migration runs.
- Captures applied Postgres cutover approval gates with reviewer sign-off, reconciliation evidence, and rollback conditions.
- Exports production Postgres cutover checklist packages for infrastructure reviewer handoff.
- Captures infrastructure reviewer acknowledgement records for production Postgres cutover packages.
- Delivers infrastructure acknowledgement notifications to Postgres cutover reviewer channels.
- Routes production cutover owner renewal reminders with package, acknowledgement, action, and delivery evidence.
- Adds delivery retry controls for closure and cutover notifications with retained retry policy and attempt evidence.
- Delivers closure SLA governance export packages to reviewer notification channels with retained delivery evidence.
- Captures Closure SLA governance delivery acknowledgements and reviewer response history.
- Routes Closure SLA governance response follow-ups to owners with due dates, escalation paths, and optional notification delivery.
- Closes production cutover owner reminders with retained actions and superseded package evidence.
- Shows retry queue aging and retry due-date dashboard metrics for governed delivery retries.
- Exports production cutover closure packages for final infrastructure handoff.
- Exports retry queue packages for notification operations review with aging metrics, due windows, delivery evidence, and required actions.
- Exports an integration contract JSON file from the active deployment state.

## Current Scope

The CSV/manual upload adapter performs real metadata discovery and bounded row preview from the included sample file. Snowflake, SharePoint Excel, and external-reference metadata discovery are credential-aware on the backend. Without server-side tokens they return warning evidence and required environment variables instead of failing or exposing secrets.

Credential environment variables:

- Snowflake SQL API: `TRACS_SNOWFLAKE_ACCOUNT_URL` or `TRACS_SNOWFLAKE_ACCOUNT`, plus `TRACS_SNOWFLAKE_TOKEN`
- Microsoft Graph SharePoint Excel: `TRACS_GRAPH_TOKEN`
- External reference API: `TRACS_EXTERNAL_API_BASE_URL`, plus `TRACS_EXTERNAL_API_TOKEN`

Credential provider templates are available in `public/config/templates/` for Snowflake, Microsoft Graph, and external reference adapters. These templates define required backend environment references, rotation evidence variables, validation routes, owner roles, and missing-credential behavior. They intentionally do not store tokens, API keys, passwords, or rotated-at values in committed configuration.

Notification delivery uses backend environment references only and stays in dry-run mode unless `TRACS_NOTIFICATION_LIVE_DELIVERY=true`:

- Email handoff: `TRACS_NOTIFICATION_EMAIL_TARGET`
- Teams handoff: `TRACS_NOTIFICATION_TEAMS_WEBHOOK_URL`
- SharePoint folder handoff: `TRACS_NOTIFICATION_SHAREPOINT_FOLDER`

Live delivery controls:

- Global live gate: `TRACS_NOTIFICATION_LIVE_DELIVERY=true`
- Reviewer live-channel sign-off: save an approved `notification_live_channel_approval` record in Backend before enabling tenant live delivery
- Email live send: `TRACS_GRAPH_TOKEN`, optional `TRACS_NOTIFICATION_EMAIL_SENDER`
- Disable a channel while global live delivery is enabled: `TRACS_NOTIFICATION_EMAIL_LIVE=false`, `TRACS_NOTIFICATION_TEAMS_LIVE=false`, or `TRACS_NOTIFICATION_SHAREPOINT_FOLDER_LIVE=false`

## Run Locally

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Open:

```text
http://127.0.0.1:5173
```

## Run With API Persistence

Terminal 1:

```bash
npm run api
```

Terminal 2:

```bash
$env:VITE_TRACS_API_URL='http://127.0.0.1:8787'
npm run dev -- --host 127.0.0.1 --port 5173
```

API records are written to `data/backend-records.json`, which is intentionally ignored by Git.

To run the API with SQLite persistence instead of JSON file persistence:

```bash
$env:TRACS_RECORD_STORE='sqlite'
$env:TRACS_SQLITE_FILE='data/tracs-records.sqlite'
npm run api:sqlite
```

SQLite records are written to `data/*.sqlite`, which is intentionally ignored by Git. The API route contracts remain the same for JSON and SQLite stores.

To run the API with Postgres persistence for shared or production environments:

```bash
$env:TRACS_RECORD_STORE='postgres'
$env:TRACS_POSTGRES_URL='postgres://user:password@host:5432/database?sslmode=require'
npm run api:postgres
```

For a local Docker-backed Postgres smoke test:

```bash
npm run postgres:up
$env:TRACS_RECORD_STORE='postgres'
$env:TRACS_POSTGRES_URL='postgres://tracs_app:tracs_dev_password@127.0.0.1:55432/tracs'
$env:TRACS_POSTGRES_SSL='false'
npm run api:postgres
```

Optional Postgres controls:

- `TRACS_POSTGRES_POOL_MAX`: connection pool cap, default `5`
- `TRACS_POSTGRES_MAX_RECORDS`: maximum records returned by list routes, default `5000`
- `TRACS_POSTGRES_SSL`: set to `false` only for trusted local Postgres targets

Postgres initializes the `tracs_records` and `tracs_record_links` tables on API startup. The connection string belongs in the backend host secret store, not in frontend configuration. `GET /api/storage/postgres-migration-checklist` returns the production migration checklist used by the API.

To dry-run a guarded JSON-to-Postgres import:

```bash
$env:TRACS_POSTGRES_URL='postgres://tracs_app:tracs_dev_password@127.0.0.1:55432/tracs'
$env:TRACS_POSTGRES_SSL='false'
npm run records:import:postgres -- --source json --file data/backend-records.json
```

To apply the import after reviewing the dry-run summary:

```bash
npm run records:import:postgres -- --source json --file data/backend-records.json --apply
```

SQLite imports use the same guardrails and require Node's SQLite runtime:

```bash
npm run records:import:postgres:sqlite -- --file data/tracs-records.sqlite
```

The import utility preserves source record IDs, labels, versions, timestamps, statuses, summaries, and payload evidence. It skips duplicate IDs and, by default, duplicate `kind + label + version` records. Each dry run or applied run also writes a `postgres_import_reconciliation` record into Postgres so the Backend workspace can show importable, skipped, invalid, duplicate, and record-kind counts before legacy storage is retired.

## Build

```bash
npm run build
```

## Important Files

- `src/configLoader.ts`: YAML config loading and structural validation.
- `src/foundation.ts`: readiness checks, connector manifest tests, CSV schema inference, mapping validation, object-family derivation, audit events, contract export.
- `src/persistence.ts`: browser-local saved version registry.
- `src/backendClient.ts`: backend adapter that uses the TRACS API when configured and browser-local fallback otherwise.
- `src/backendContracts.ts`: frontend live adapter contract registry.
- `src/App.tsx`: admin shell UI and interactions.
- `server/tracs-api.mjs`: API service for deployment snapshots, backend records, storage schemas, and adapter dry runs.
- `server/recordStore.mjs`: storage boundary for JSON, SQLite, and Postgres versioned backend records plus the database schema blueprint.
- `server/canonicalService.mjs`: sample-backed canonical object, quality event, traceability, and report catalog service.
- `server/adapterContracts.mjs`: backend adapter dry-run contract implementation.
- `server/credentialMetadataAdapters.mjs`: credential-aware Snowflake, Microsoft Graph, and external-reference metadata discovery adapters.
- `server/csvAdapter.mjs`: CSV/manual upload adapter for metadata discovery and bounded source preview rows.
- `server/assetRegistry.mjs`: read-only local scanner for MYROBOTS template and schema assets.
- `public/config/industries/industries.yaml`: industry profile definitions.
- `public/config/solutions/solution_domains.yaml`: solution domain definitions.
- `public/config/mappings/domain_object_families.yaml`: canonical object family definitions.
- `public/config/mappings/capa_reference.yaml`, `supplier.yaml`, `document_reference.yaml`: active external-reference validation profiles.
- `public/config/templates/`: reusable starter templates for the next build phases.
- `public/config/reports/report_catalog.yaml`: governed BI/report catalog with source dependencies and freshness thresholds.
- `public/samples/quality_events_sample.csv`: CSV/manual upload fixture for Mapping Studio.

## Next Phase

Use the canonical load and report config paths to move deeper into live connector-backed records:

1. Add production cutover closure package notification delivery to infrastructure owners.
2. Add retry queue package notification delivery to notification operations reviewers.
3. Add Closure SLA follow-up closure records with superseded route evidence.
