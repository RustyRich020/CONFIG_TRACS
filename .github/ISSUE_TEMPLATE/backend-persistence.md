---
name: Backend Persistence
about: Persist TRACS saved versions, connector runs, mapping runs, and contract exports.
title: "Backend persistence: "
labels: backend,persistence
assignees: ""
---

## Objective

Persist browser-local TRACS records through a backend API.

## Scope

- [ ] Saved versions API
- [ ] Connector run persistence
- [ ] Mapping run persistence
- [ ] Integration contract snapshot persistence
- [ ] Frontend API-backed persistence adapter
- [ ] LocalStorage fallback for dev/offline mode

## Acceptance Criteria

- [ ] Saved versions survive browser reload and different browser sessions.
- [ ] Connector test runs are persisted with evidence payloads.
- [ ] Mapping validation runs are persisted with evidence payloads.
- [ ] Contract exports are persisted as version records.
- [ ] No credentials or secrets are stored in frontend config.

