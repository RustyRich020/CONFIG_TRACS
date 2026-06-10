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
POST /api/adapter-dry-runs
```

The frontend uses the API when `VITE_TRACS_API_URL` is set. Without that value, or if the API is unreachable, it uses browser-local fallback persistence.

The CSV/manual upload connector reads the configured sample CSV, infers source columns, reports row counts, and returns bounded preview rows. Metadata discovery and row previews are persisted as `connector_run` records. External reference connectors still return contract/dry-run evidence until credential-backed adapters are added.

Snowflake and SharePoint Excel metadata discovery are now credential-aware backend adapters. `POST /api/connectors/{connectorId}/metadata` routes Snowflake manifests through the Snowflake SQL API when `TRACS_SNOWFLAKE_ACCOUNT_URL` or `TRACS_SNOWFLAKE_ACCOUNT` plus `TRACS_SNOWFLAKE_TOKEN` are configured. SharePoint Excel manifests route through Microsoft Graph when `TRACS_GRAPH_TOKEN` is configured. When credentials are missing, the API persists warning `connector_run` evidence with the required environment variables and manifest source objects instead of returning a hard failure or exposing secrets.

Mapping Studio validation runs are persisted as `mapping_validation` records. The frontend still performs the current schema-to-manifest validation, then sends the reviewed mapping, inferred schema, validation result, and summary to the API for versioned storage.

Integration contracts are persisted as `integration_contract` records. The Contract workspace saves the same generated payload that can be downloaded for governance review, including readiness status, backend evidence, adapter contracts, and recent backend records.

The asset registry route scans the local MYROBOTS root, defaulting to `C:\Users\Allen\MYROBOTS`, and returns a bounded read-only registry of candidate templates, database schemas, manifests, data templates, and reference files. Set `TRACS_ASSET_ROOT` to scan a different local library.

Controlled templates are persisted as `controlled_template` records. Promotion copies the local asset registry metadata into a governed payload with `templateId`, source path, fingerprint, category/domain classification, active industry and solution tags, lifecycle status, and provenance notes. Updates create a new backend record version instead of mutating the original record.

The Template Library editor uses `PUT /api/templates/{recordId}` to save lifecycle, classification, tag, and provenance overrides as new controlled-template versions. The latest template record is selected by `templateId`, so history remains append-only while the UI shows the current controlled state.

The Evidence workspace saves readiness evidence packets through the generic `POST /api/records` record boundary with kind `readiness_evidence_packet`. Packets include canonical load records, report freshness results, and open readiness exceptions, and the same payload can be downloaded as JSON for governance review.

The API persistence layer now routes through `server/recordStore.mjs`, which keeps the current file-backed behavior but exposes a database-ready schema contract. `GET /api/storage/schema` returns the `tracs_records` and `tracs_record_links` blueprint that future SQLite or Postgres adapters should implement.

The canonical workflow routes are sample-backed in v1. `server/canonicalService.mjs` maps the quality event CSV into stable canonical object IDs, derives event-to-product, event-to-lot/serial, return, and CAPA traceability links, and exposes a starter BI report catalog. These routes are intentionally typed so future Snowflake, SharePoint, and CSV adapter outputs can replace the sample source without changing the frontend contract.

The canonical load route persists mapped canonical objects and traceability links as latest-version backend records. `POST /api/canonical-loads` now accepts `mappingId`, `sourceConnector`, `connectorType`, `sourceObject`, and `targetObject`, allowing Snowflake, SharePoint Excel, and CSV connector profiles to produce distinct load evidence. Snowflake and SharePoint profile loads are still sample-backed until credential-backed extraction is enabled, so their canonical load records include warning evidence. After a canonical load, object and traceability routes prefer persisted records and only fall back to sample derivation when no canonical load has been run.

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

Current development storage is `data/backend-records.json`.

Recommended database tables:

```sql
SAVED_VERSION (
  ID varchar primary key,
  KIND varchar not null,
  LABEL varchar not null,
  STATUS varchar not null,
  CREATED_AT timestamp not null,
  CREATED_BY varchar not null,
  SUMMARY varchar,
  PAYLOAD variant not null
);

CONNECTOR_RUN (
  ID varchar primary key,
  CONNECTOR_ID varchar not null,
  RUN_TYPE varchar not null,
  STATUS varchar not null,
  TESTED_AT timestamp not null,
  TESTED_BY varchar not null,
  RESULT_PAYLOAD variant not null
);

MAPPING_RUN (
  ID varchar primary key,
  MAPPING_ID varchar not null,
  STATUS varchar not null,
  VALIDATED_AT timestamp not null,
  VALIDATED_BY varchar not null,
  RESULT_PAYLOAD variant not null
);
```

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

