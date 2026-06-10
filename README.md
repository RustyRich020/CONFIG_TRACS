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
- Exports an integration contract JSON file from the active deployment state.

## Current Scope

The CSV/manual upload adapter performs real metadata discovery and bounded row preview from the included sample file. Snowflake and SharePoint Excel metadata discovery is now credential-aware on the backend. Without server-side tokens it returns warning evidence and required environment variables instead of failing or exposing secrets.

Credential environment variables:

- Snowflake SQL API: `TRACS_SNOWFLAKE_ACCOUNT_URL` or `TRACS_SNOWFLAKE_ACCOUNT`, plus `TRACS_SNOWFLAKE_TOKEN`
- Microsoft Graph SharePoint Excel: `TRACS_GRAPH_TOKEN`

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
- `server/recordStore.mjs`: storage boundary for versioned backend records and the database schema blueprint.
- `server/canonicalService.mjs`: sample-backed canonical object, quality event, traceability, and report catalog service.
- `server/adapterContracts.mjs`: backend adapter dry-run contract implementation.
- `server/credentialMetadataAdapters.mjs`: credential-aware Snowflake and Microsoft Graph metadata discovery adapters.
- `server/csvAdapter.mjs`: CSV/manual upload adapter for metadata discovery and bounded source preview rows.
- `server/assetRegistry.mjs`: read-only local scanner for MYROBOTS template and schema assets.
- `public/config/industries/industries.yaml`: industry profile definitions.
- `public/config/solutions/solution_domains.yaml`: solution domain definitions.
- `public/config/mappings/domain_object_families.yaml`: canonical object family definitions.
- `public/config/templates/`: reusable starter templates for the next build phases.
- `public/config/reports/report_catalog.yaml`: governed BI/report catalog with source dependencies and freshness thresholds.
- `public/samples/quality_events_sample.csv`: CSV/manual upload fixture for Mapping Studio.

## Next Phase

Use the canonical load and report config paths to move deeper into live connector-backed records:

1. Add evidence packet approval workflow and exception disposition tracking.
2. Add connector-backed extraction jobs that replace the current sample-backed load profile.
3. Add credential validation tests and token rotation checks for deployed adapters.
4. Add report catalog approval history and reviewer sign-off.
