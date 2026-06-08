import type { SavedVersion, SavedVersionKind, StatusLevel } from './types'

const savedVersionsKey = 'tracs.savedVersions.v1'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function loadSavedVersions() {
  return readJson<SavedVersion[]>(savedVersionsKey, [])
}

export function persistSavedVersions(records: SavedVersion[]) {
  localStorage.setItem(savedVersionsKey, JSON.stringify(records.slice(0, 100)))
}

export function createSavedVersion({
  kind,
  label,
  status,
  summary,
  payload,
}: {
  kind: SavedVersionKind
  label: string
  status: StatusLevel
  summary: string
  payload: unknown
}): SavedVersion {
  return {
    id: crypto.randomUUID(),
    kind,
    label,
    status,
    createdAt: new Date().toISOString(),
    summary,
    payload,
  }
}
