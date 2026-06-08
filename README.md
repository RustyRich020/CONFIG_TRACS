# CONFIG_TRACS

TRACS Foundation Shell Prototype

This prototype now includes the first two practical build phases for TRACS:

1. Foundation Shell + Profile/Domain Config Loader
2. Connector Hub
3. CSV Adapter Starter + Mapping Studio
4. Persistence + Saved Versions

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
- Exports an integration contract JSON file from the active deployment state.

## Current Scope

This phase intentionally does not authenticate against live external systems yet. Connector tests validate manifest structure, required metadata, target coverage, and adapter readiness. Live Snowflake/SharePoint/API authentication requires backend adapters and credentials in the next implementation slice.

## Run Locally

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Open:

```text
http://127.0.0.1:5173
```

## Build

```bash
npm run build
```

## Important Files

- `src/configLoader.ts`: YAML config loading and structural validation.
- `src/foundation.ts`: readiness checks, connector manifest tests, CSV schema inference, mapping validation, object-family derivation, audit events, contract export.
- `src/persistence.ts`: browser-local saved version registry.
- `src/App.tsx`: admin shell UI and interactions.
- `public/config/industries/industries.yaml`: industry profile definitions.
- `public/config/solutions/solution_domains.yaml`: solution domain definitions.
- `public/config/mappings/domain_object_families.yaml`: canonical object family definitions.
- `public/config/templates/`: reusable starter templates for the next build phases.
- `public/samples/quality_events_sample.csv`: CSV/manual upload fixture for Mapping Studio.

## Next Phase

Build live connector adapters and backend persistence:

1. Snowflake authentication and metadata discovery.
2. SharePoint Excel authentication and workbook/sheet discovery.
3. Persist connector and mapping readiness evidence through a backend service.
4. Promote browser-local saved versions to multi-user backend records.
5. Add source preview rows for Snowflake and SharePoint adapters.
