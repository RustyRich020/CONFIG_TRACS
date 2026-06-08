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
- Exports an integration contract JSON file from the active deployment state.

## Current Scope

This phase intentionally does not authenticate against live external systems yet. The CSV/manual upload adapter now performs real metadata discovery and bounded row preview from the included sample file. Live Snowflake, SharePoint, and external API authentication require credential-backed adapters in the next implementation slice.

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
- `server/tracs-api.mjs`: file-backed API service for deployment snapshots, backend records, and adapter dry runs.
- `server/adapterContracts.mjs`: backend adapter dry-run contract implementation.
- `server/csvAdapter.mjs`: CSV/manual upload adapter for metadata discovery and bounded source preview rows.
- `public/config/industries/industries.yaml`: industry profile definitions.
- `public/config/solutions/solution_domains.yaml`: solution domain definitions.
- `public/config/mappings/domain_object_families.yaml`: canonical object family definitions.
- `public/config/templates/`: reusable starter templates for the next build phases.
- `public/samples/quality_events_sample.csv`: CSV/manual upload fixture for Mapping Studio.

## Next Phase

Build credential-backed live connector adapters:

1. Snowflake authentication and metadata discovery.
2. SharePoint Excel authentication and workbook/sheet discovery.
3. API-backed connector run persistence for non-CSV adapters.
4. Database-backed record storage behind the existing API routes.
5. Source preview rows for Snowflake and SharePoint adapters.
