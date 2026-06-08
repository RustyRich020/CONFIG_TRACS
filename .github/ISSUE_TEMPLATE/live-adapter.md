---
name: Live Adapter
about: Implement or extend a TRACS connector adapter.
title: "Live adapter: "
labels: adapter,integration
assignees: ""
---

## Connector Type

- [ ] Snowflake
- [ ] SharePoint Excel
- [ ] CSV / Manual Upload
- [ ] SQL Database
- [ ] REST API
- [ ] Other:

## Required Capabilities

- [ ] Test connection
- [ ] Discover metadata
- [ ] Preview rows
- [ ] Run extract
- [ ] Emit readiness evidence

## Acceptance Criteria

- [ ] Adapter uses secret references, not plaintext credentials.
- [ ] Adapter returns the shared `ConnectorTestResult` shape.
- [ ] Metadata discovery lists source objects.
- [ ] Preview returns a bounded row sample.
- [ ] Failures include remediation text.

