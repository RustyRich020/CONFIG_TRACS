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
GET  /api/adapter-contracts
POST /api/connectors/{connectorId}/metadata
POST /api/connectors/{connectorId}/preview
GET  /api/connectors/{connectorId}/runs
POST /api/deployment-snapshots
POST /api/adapter-dry-runs
```

The frontend uses the API when `VITE_TRACS_API_URL` is set. Without that value, or if the API is unreachable, it uses browser-local fallback persistence.

The CSV/manual upload connector is the first implemented live adapter. It reads the configured sample CSV, infers source columns, reports row counts, and returns bounded preview rows. Metadata discovery and row previews are persisted as `connector_run` records. Snowflake, SharePoint Excel, and external reference connectors still return contract/dry-run evidence until credential-backed adapters are added.

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

