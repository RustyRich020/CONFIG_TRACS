# Connector Adapter Implementation Template

## Adapter

- Connector type:
- Owner:
- Supported auth:
- Supported source objects:

## Required Methods

```ts
type ConnectorAdapter = {
  testConnection(): Promise<ConnectorTestResult>
  discoverMetadata(): Promise<ConnectorMetadata>
  previewRows(sourceObject: string, limit: number): Promise<Record<string, unknown>[]>
  runExtract(sourceObject: string): Promise<ExtractResult>
}
```

## Readiness Evidence

- Authentication result
- Permission result
- Metadata discovery result
- Source object count
- Target object coverage
- Last successful test timestamp

## Failure Modes

| Failure | Severity | Remediation |
|---|---|---|
| Authentication failed | blocking | Verify credentials and least-privilege role. |
| Metadata unavailable | blocking | Verify source object names and permissions. |
| No target mapping | blocking | Add source-to-canonical mapping. |
| Stale refresh | warning | Review refresh schedule. |

