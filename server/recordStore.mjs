import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

export const recordStoreSchema = {
  schemaVersion: 'record_store_v1',
  tables: [
    {
      name: 'tracs_records',
      purpose: 'Canonical versioned record table for deployment profiles, connector runs, mapping runs, contracts, adapter checks, and controlled templates.',
      columns: [
        { name: 'id', type: 'text', constraints: 'primary key' },
        { name: 'kind', type: 'text', constraints: 'not null indexed' },
        { name: 'label', type: 'text', constraints: 'not null indexed' },
        { name: 'version', type: 'integer', constraints: 'not null' },
        { name: 'status', type: 'text', constraints: 'not null' },
        { name: 'summary', type: 'text', constraints: 'not null' },
        { name: 'payload_json', type: 'json', constraints: 'not null' },
        { name: 'created_at', type: 'timestamp', constraints: 'not null indexed' },
        { name: 'updated_at', type: 'timestamp', constraints: 'not null' },
      ],
    },
    {
      name: 'tracs_record_links',
      purpose: 'Optional relationship table for future complaint to CAPA, template to connector, and contract to evidence links.',
      columns: [
        { name: 'id', type: 'text', constraints: 'primary key' },
        { name: 'source_record_id', type: 'text', constraints: 'not null indexed' },
        { name: 'target_record_id', type: 'text', constraints: 'not null indexed' },
        { name: 'relationship_type', type: 'text', constraints: 'not null indexed' },
        { name: 'created_at', type: 'timestamp', constraints: 'not null' },
      ],
    },
  ],
  indexes: [
    'tracs_records(kind, created_at desc)',
    'tracs_records(kind, label, version desc)',
    'tracs_records(status, created_at desc)',
    'tracs_record_links(source_record_id, relationship_type)',
    'tracs_record_links(target_record_id, relationship_type)',
  ],
}

function nextVersion(records, kind, label) {
  const matching = records.filter((record) => record.kind === kind && record.label === label)
  return matching.length > 0 ? Math.max(...matching.map((record) => record.version)) + 1 : 1
}

function summarizeStatus(records) {
  if (records.some((record) => record.status === 'blocking')) return 'blocking'
  if (records.some((record) => record.status === 'warning')) return 'warning'
  return 'pass'
}

export function createFileRecordStore({ dataFile, maxRecords = 250 }) {
  async function readRecords() {
    try {
      const raw = await readFile(dataFile, 'utf8')
      return JSON.parse(raw)
    } catch (error) {
      if (error.code === 'ENOENT') return []
      throw error
    }
  }

  async function writeRecords(records) {
    await mkdir(dirname(dataFile), { recursive: true })
    await writeFile(dataFile, JSON.stringify(records.slice(0, maxRecords), null, 2))
  }

  async function saveRecord({ kind, label, status, summary, payload }) {
    const records = await readRecords()
    const now = new Date().toISOString()
    const record = {
      id: randomUUID(),
      kind,
      version: nextVersion(records, kind, label),
      status,
      createdAt: now,
      updatedAt: now,
      label,
      summary,
      payload,
    }
    await writeRecords([record, ...records])
    return record
  }

  async function listByKind(kind) {
    const records = await readRecords()
    return records.filter((record) => record.kind === kind)
  }

  async function getRecord(recordId) {
    const records = await readRecords()
    return records.find((record) => record.id === recordId)
  }

  async function health(startedAt) {
    const records = await readRecords()
    return {
      mode: 'api',
      status: summarizeStatus(records),
      checkedAt: new Date().toISOString(),
      records: records.length,
      latencyMs: Math.max(1, Math.round(performance.now() - startedAt)),
      store: {
        mode: 'file_json',
        schemaVersion: recordStoreSchema.schemaVersion,
        dataFile,
        maxRecords,
      },
      evidence: `File-backed record store is active at ${dataFile}.`,
    }
  }

  return {
    dataFile,
    schema: recordStoreSchema,
    readRecords,
    saveRecord,
    listByKind,
    getRecord,
    health,
  }
}
