# Backend Persistence + Live Adapter Contracts

## Goal

Move TRACS from browser-local saved versions into a backend-backed workflow, while defining live adapter contracts for Snowflake, SharePoint Excel, CSV/manual upload, and future API/database connectors.

## Scope

This phase now adds:

- persisted saved versions
- persisted connector test runs
- persisted mapping validation runs
- persisted integration contract exports
- backend API contract for live connector adapters
- adapter result payloads that match the current frontend record shapes
- a file-backed API skeleton that can be replaced by a database adapter

This phase should not add secrets to the frontend or commit credentials into GitHub.

## Persistence API

### Implemented API Skeleton

```http
GET  /api/health
GET  /api/records
POST /api/records
GET  /api/storage/schema
GET  /api/storage/postgres-migration-checklist
GET  /api/adapter-contracts
GET  /api/assets/registry
GET  /api/templates
POST /api/templates/promote
PUT  /api/templates/{recordId}
GET  /api/objects
GET  /api/objects/{objectId}
GET  /api/objects/{objectId}/traceability
GET  /api/quality-events
GET  /api/traceability-links
POST /api/canonical-loads
GET  /api/reports
POST /api/connectors/{connectorId}/metadata
POST /api/connectors/{connectorId}/preview
GET  /api/connectors/{connectorId}/runs
GET  /api/mappings/{mappingId}/runs
POST /api/mappings/{mappingId}/runs
GET  /api/integration-contracts
POST /api/integration-contracts
POST /api/deployment-snapshots
POST /api/notifications/delivery
POST /api/notifications/delivery-dry-run
POST /api/notifications/live-smoke-fixtures
POST /api/adapter-dry-runs
```

The frontend uses the API when `VITE_TRACS_API_URL` is set. Without that value, or if the API is unreachable, it uses browser-local fallback persistence.

The CSV/manual upload connector reads the configured sample CSV, infers source columns, reports row counts, and returns bounded preview rows. Metadata discovery and row previews are persisted as `connector_run` records.

Snowflake and SharePoint Excel metadata discovery are now credential-aware backend adapters. `POST /api/connectors/{connectorId}/metadata` routes Snowflake manifests through the Snowflake SQL API when `TRACS_SNOWFLAKE_ACCOUNT_URL` or `TRACS_SNOWFLAKE_ACCOUNT` plus `TRACS_SNOWFLAKE_TOKEN` are configured. SharePoint Excel manifests route through Microsoft Graph when `TRACS_GRAPH_TOKEN` is configured. When credentials are missing, the API persists warning `connector_run` evidence with the required environment variables and manifest source objects instead of returning a hard failure or exposing secrets.

External-reference metadata discovery and bounded preview are also credential-aware backend adapters. Metadata uses the connector `metadata_path` or `TRACS_EXTERNAL_API_METADATA_PATH`; preview uses `preview_path` or `TRACS_EXTERNAL_API_PREVIEW_PATH`, with `{limit}` replacement and a maximum of 50 returned preview rows. Both routes require `TRACS_EXTERNAL_API_BASE_URL` and `TRACS_EXTERNAL_API_TOKEN`; when missing, the API persists warning evidence from the connector manifest without exposing endpoint secrets or returning rows.

Credential validation uses `POST /api/connectors/{connectorId}/credential-validation` and persists `credential_validation` records. The route checks required server environment references and token rotation evidence without returning token values. Snowflake rotation evidence reads `TRACS_SNOWFLAKE_TOKEN_ROTATED_AT` with optional `TRACS_SNOWFLAKE_TOKEN_MAX_AGE_DAYS`; Microsoft Graph reads `TRACS_GRAPH_TOKEN_ROTATED_AT` with optional `TRACS_GRAPH_TOKEN_MAX_AGE_DAYS`; external-reference adapters read `TRACS_EXTERNAL_API_BASE_URL`, `TRACS_EXTERNAL_API_TOKEN`, `TRACS_EXTERNAL_API_TOKEN_ROTATED_AT`, and optional `TRACS_EXTERNAL_API_TOKEN_MAX_AGE_DAYS`.

Credential provider configuration templates live in `public/config/templates/credential_provider_*.template.yaml`. They define the backend environment references, rotation evidence fields, validation routes, owner roles, and missing-credential fallback behavior for Snowflake, Microsoft Graph, and external reference adapters. These templates are governance contracts only; token values, API keys, client secrets, and rotated-at values must remain in the backend host environment or deployment secret store.

Source-specific external-reference mapping starters live in `public/config/templates/external_reference_*_mapping.template.yaml`. The CAPA template maps eQMS or corrective-action references into `capa_reference`; the supplier template maps approved supplier, qualification, scorecard, and risk records into `supplier`; the document template maps document-control or PLM records into `document_reference`. These templates include required fields, enum/date transforms, traceability link contracts, readiness checks, and owner roles, but they do not store endpoint secrets or become active runtime mappings until promoted into deployment-specific mapping profiles.

The CAPA, supplier, and document external-reference mappings are also promoted into active validation profiles under `public/config/mappings/`. Mapping Studio loads these profiles beside `quality_event`, validates their declared source fields against generated profile schemas, and persists each profile's `mapping_validation` records independently. Canonical load execution remains scoped to the sample-backed `quality_event` profile until live external-reference preview and extraction adapters are enabled.

Mapping Studio validation runs are persisted as `mapping_validation` records. The frontend still performs the current schema-to-manifest validation, then sends the reviewed mapping, inferred schema, validation result, and summary to the API for versioned storage.

Integration contracts are persisted as `integration_contract` records. The Contract workspace saves the same generated payload that can be downloaded for governance review, including readiness status, backend evidence, adapter contracts, and recent backend records.

The asset registry route scans the local MYROBOTS root, defaulting to `C:\Users\Allen\MYROBOTS`, and returns a bounded read-only registry of candidate templates, database schemas, manifests, data templates, and reference files. Set `TRACS_ASSET_ROOT` to scan a different local library.

Controlled templates are persisted as `controlled_template` records. Promotion copies the local asset registry metadata into a governed payload with `templateId`, source path, fingerprint, category/domain classification, active industry and solution tags, lifecycle status, and provenance notes. Updates create a new backend record version instead of mutating the original record.

The Template Library editor uses `PUT /api/templates/{recordId}` to save lifecycle, classification, tag, and provenance overrides as new controlled-template versions. The latest template record is selected by `templateId`, so history remains append-only while the UI shows the current controlled state.

The Evidence workspace saves readiness evidence packets through the generic `POST /api/records` record boundary with kind `readiness_evidence_packet`. Packets include canonical load records, report freshness results, open readiness exceptions, approval state, reviewer routing, route due date, reviewer rationale, next-review date, per-exception dispositions, and approval audit history. The same governed payload can be downloaded as JSON for governance review.

Report approval and evidence packet notification exports are JSON handoff contracts generated in the frontend. They include route stage, recipients, due dates, status, evidence summaries, and source dependencies. `POST /api/notifications/delivery` runs guarded email, Teams, and SharePoint folder delivery connectors and persists `notification_delivery` records with per-channel evidence. Delivery remains dry-run unless `TRACS_NOTIFICATION_LIVE_DELIVERY=true` is set in the backend environment. Email live delivery uses Microsoft Graph with `TRACS_GRAPH_TOKEN`, `TRACS_NOTIFICATION_EMAIL_TARGET`, and optional `TRACS_NOTIFICATION_EMAIL_SENDER`; Teams live delivery posts to `TRACS_NOTIFICATION_TEAMS_WEBHOOK_URL`; SharePoint folder live delivery writes a JSON handoff file under `TRACS_NOTIFICATION_SHAREPOINT_FOLDER`. `POST /api/notifications/delivery-dry-run` remains available for forced dry-run validation.

Tenant notification smoke fixtures use `POST /api/notifications/live-smoke-fixtures` to run email and Teams fixture payloads through the same guarded delivery adapter. The route persists `notification_delivery` records for each fixture. Without `TRACS_NOTIFICATION_LIVE_DELIVERY=true`, fixture records stay dry-run; with the live gate enabled, each channel still requires its endpoint and can be disabled independently with `TRACS_NOTIFICATION_EMAIL_LIVE=false` or `TRACS_NOTIFICATION_TEAMS_LIVE=false`. The reviewable fixture contract lives at `public/config/templates/notification_smoke_fixture.template.yaml`.

The API persistence layer now routes through `server/recordStore.mjs`, which supports the default JSON file store, an opt-in SQLite store, and an opt-in Postgres store. Set `TRACS_RECORD_STORE=sqlite` and optionally `TRACS_SQLITE_FILE=data/tracs-records.sqlite` before `npm run api:sqlite` to persist versioned records in SQLite while keeping the same API routes. Set `TRACS_RECORD_STORE=postgres` and `TRACS_POSTGRES_URL` before `npm run api:postgres` to use production-grade shared persistence. `GET /api/storage/schema` returns the `tracs_records` and `tracs_record_links` blueprint that both database adapters implement. `GET /api/storage/postgres-migration-checklist` returns the environment, validation, rollback, and migration gates for promoting JSON or SQLite records into Postgres.

The canonical workflow routes are sample-backed in v1. `server/canonicalService.mjs` maps the quality event CSV into stable canonical object IDs, derives event-to-product, event-to-lot/serial, return, and CAPA traceability links, and exposes a starter BI report catalog. These routes are intentionally typed so future Snowflake, SharePoint, and CSV adapter outputs can replace the sample source without changing the frontend contract.

The canonical load route persists mapped canonical objects and traceability links as latest-version backend records. `POST /api/canonical-loads` now accepts `mappingId`, `sourceConnector`, `connectorType`, `sourceObject`, and `targetObject`, allowing Snowflake, SharePoint Excel, and CSV connector profiles to produce distinct load evidence. Snowflake and SharePoint profile loads are still sample-backed until credential-backed extraction is enabled, so their canonical load records include warning evidence. After a canonical load, object and traceability routes prefer persisted records and only fall back to sample derivation when no canonical load has been run.

The Traceability workspace derives filterable graph views from canonical objects, traceability links, and saved readiness evidence packets. Filters include target object family, link status, and evidence packet coverage. Evidence packet links are inferred from saved `readiness_evidence_packet` records whose canonical-load records include traceability link counts.

Traceability graph export packages are generated from the active Traceability workspace filters. Each package includes the selected quality event, graph nodes, filtered traceability links, relationship summary, selected readiness evidence packet records, coverage counts, and export provenance. Per-packet exports bind a graph package to a saved `readiness_evidence_packet`, while the toolbar export captures the full active graph filter state for offline review.

Signed traceability export reviews are persisted as `traceability_export_review` records through the generic `POST /api/records` boundary. Each retained record binds reviewer, review status, rationale, retention class, retain-until evidence, audit history, and the exact traceability graph export package that was downloaded for governance review.

Connector-backed extraction jobs are persisted as `extraction_job` records and executed into `extraction_run` records. The v1 job runner reuses the canonical load contract so each run produces canonical objects, traceability links, a `canonical_load` record, and a governed extraction-run wrapper that captures request profile, warnings, status, and load result evidence. Job records also carry schedule mode, cadence, next-run target, max retries, retry delay, and retry-on-warning policy. Run records capture attempt number and whether the current status is retry eligible. Mapping Studio now derives a frontend run queue and schedule calendar from those persisted job/run records; it does not create an always-on scheduler process yet.

Report catalog records now use YAML config as seed data and `report_catalog_item` backend records as governed overrides. The Reports workspace can save draft catalog edits, run publish gates, record reviewer sign-off, route reports to reviewer stages, export notification payloads, and persist notification history on sign-off. Publish gates block release when freshness is stale or declared source dependencies are not present in the canonical object registry. Sign-off history is append-only inside each versioned report catalog payload and captures reviewer, status, rationale, signed timestamp, and publish state.

The report catalog route reads `public/config/reports/report_catalog.yaml` and computes `refreshStatus` from each report's `last_refresh` and `max_age_hours` values. The frontend browser-local fallback reads the same YAML file so report readiness behavior stays consistent with or without the API.

### Planned Saved Versions

```http
GET    /api/saved-versions
POST   /api/saved-versions
GET    /api/saved-versions/{versionId}
DELETE /api/saved-versions/{versionId}
```

Saved version payload:

```ts
type SavedVersion = {
  id: string
  kind:
    | 'connector_test'
    | 'mapping_validation'
    | 'mapping_version'
    | 'integration_contract'
    | 'backend_snapshot'
    | 'adapter_dry_run'
  label: string
  status: 'pass' | 'warning' | 'blocking'
  createdAt: string
  createdBy: string
  summary: string
  payload: unknown
}
```

### Connector Runs

```http
POST /api/connectors/{connectorId}/test
GET  /api/connectors/{connectorId}/runs
GET  /api/connectors/{connectorId}/metadata
GET  /api/connectors/{connectorId}/preview?sourceObject=...&limit=50
```

Connector test result:

```ts
type ConnectorTestResult = {
  connectorId: string
  status: 'pass' | 'warning' | 'blocking'
  testedAt: string
  testedBy: string
  checks: ReadinessCheck[]
  metadata: {
    sourceType: string
    displayName: string
    sourceObjects: number
    targetObjects: string[]
    refreshMode: string
    connectionMode: string
  }
}
```

### Mapping Runs

```http
POST /api/mappings/{mappingId}/validate
GET  /api/mappings/{mappingId}/runs
POST /api/mappings/{mappingId}/versions
GET  /api/mappings/{mappingId}/versions
```

Mapping validation result:

```ts
type MappingValidationResult = {
  status: 'pass' | 'warning' | 'blocking'
  checks: ReadinessCheck[]
  mappedFields: Array<{
    targetField: string
    sourceField: string
    present: boolean
    required: boolean
  }>
}
```

## Adapter Interface

```ts
type ConnectorAdapter = {
  testConnection(): Promise<ConnectorTestResult>
  discoverMetadata(): Promise<ConnectorMetadata>
  previewRows(sourceObject: string, limit: number): Promise<Record<string, unknown>[]>
  runExtract(sourceObject: string): Promise<ExtractResult>
}
```

## Adapter Requirements

### Snowflake

Required inputs:

- account or connection profile
- database
- schema
- role
- warehouse
- secret reference

Required checks:

- credentials available by secret reference
- role is present
- database exists
- schema exists
- configured source objects exist
- row preview can be queried

### SharePoint Excel

Required inputs:

- site URL
- library
- workbook
- sheet
- secret reference or delegated Graph auth

Required checks:

- site resolves
- library resolves
- workbook exists
- sheet exists
- rows can be previewed

### CSV / Manual Upload

Required inputs:

- file upload or fixture path
- target canonical object
- schema inference options

Required checks:

- file has headers
- file has at least one data row
- delimiter can be parsed
- required mapped source fields exist

Implemented outputs:

```ts
type ConnectorSourceMetadata = {
  connectorId: string
  adapterType: string
  discoveredAt: string
  sourcePath?: string
  sourceObjects: string[]
  targetObjects: string[]
  rowCount: number
  columns: CsvColumnProfile[]
  evidence: string
}

type ConnectorPreviewResult = {
  connectorId: string
  adapterType: string
  previewedAt: string
  sourcePath?: string
  columns: string[]
  rowCount: number
  returnedRows: number
  rows: Record<string, string>[]
  evidence: string
}
```

## Backend Storage

Current development storage is `data/backend-records.json`. Local/small deployment storage can use SQLite through `TRACS_RECORD_STORE=sqlite`. Production/shared deployment storage should use Postgres through `TRACS_RECORD_STORE=postgres`.

Implemented database contract:

```sql
create table if not exists tracs_records (
  id text primary key,
  kind text not null,
  label text not null,
  version integer not null,
  status text not null,
  summary text not null,
  payload_json jsonb not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create unique index if not exists idx_tracs_records_kind_label_version_unique
  on tracs_records(kind, label, version);

create index if not exists idx_tracs_records_kind_created_at
  on tracs_records(kind, created_at desc);

create index if not exists idx_tracs_records_kind_label_version
  on tracs_records(kind, label, version desc);

create index if not exists idx_tracs_records_status_created_at
  on tracs_records(status, created_at desc);

create table if not exists tracs_record_links (
  id text primary key,
  source_record_id text not null,
  target_record_id text not null,
  relationship_type text not null,
  created_at timestamptz not null
);

create index if not exists idx_tracs_record_links_source
  on tracs_record_links(source_record_id, relationship_type);

create index if not exists idx_tracs_record_links_target
  on tracs_record_links(target_record_id, relationship_type);
```

Postgres adapter environment:

```bash
TRACS_RECORD_STORE=postgres
TRACS_POSTGRES_URL=postgres://user:password@host:5432/database?sslmode=require
TRACS_POSTGRES_POOL_MAX=5
TRACS_POSTGRES_MAX_RECORDS=5000
TRACS_POSTGRES_SSL=require
```

Migration checklist:

1. Create a managed Postgres database with automated backups.
2. Create a least-privilege TRACS application role and store the connection string in the backend secret store.
3. Start the API with `TRACS_RECORD_STORE=postgres` and confirm `/api/health` returns `store.mode=postgres`.
4. Save a controlled smoke record through `POST /api/records`, then confirm it appears through `GET /api/records`.
5. Export JSON or SQLite records before import; do not move secrets or frontend environment values into the record payloads.
6. Import records through the same `/api/records` boundary or a reviewed migration script that preserves `kind`, `label`, `status`, `summary`, and payload evidence.
7. Keep JSON or SQLite storage read-only for one release window as rollback evidence.
8. Reconcile record counts, recent evidence packets, traceability export reviews, report sign-offs, and extraction-run records before deleting legacy storage.

The guarded import utility is implemented in `server/importRecordsToPostgres.mjs`. It reads JSON or SQLite `tracs_records`, validates required record fields, checks duplicate IDs, checks duplicate `kind + label + version` tuples, and defaults to dry-run mode. `--apply` is required before it inserts records into Postgres. Imported records preserve source IDs, versions, timestamps, status, summary, label, kind, and payload JSON so historical evidence remains traceable.

## GitHub Implementation Plan

1. Create branch: `codex/backend-persistence-adapter-contracts`
2. Add backend service scaffold.
3. Add saved-version API routes.
4. Replace frontend `localStorage` persistence with API-backed persistence.
5. Keep `localStorage` fallback for offline/dev mode.
6. Add connector adapter interfaces.
7. Add CSV adapter implementation first.
8. Add Snowflake and SharePoint adapter stubs with secret-reference requirements.
9. Add CI checks for build and lint.
10. Open PR with backend contract summary and validation evidence.

