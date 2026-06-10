import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'

const require = createRequire(import.meta.url)

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
    {
      name: 'canonical_objects',
      purpose: 'Typed canonical registry for quality events, products, lots, returns, CAPA references, and future operational objects.',
      columns: [
        { name: 'id', type: 'text', constraints: 'primary key' },
        { name: 'object_type', type: 'text', constraints: 'not null indexed' },
        { name: 'family', type: 'text', constraints: 'not null indexed' },
        { name: 'display_name', type: 'text', constraints: 'not null' },
        { name: 'status', type: 'text', constraints: 'not null indexed' },
        { name: 'source_connector', type: 'text', constraints: 'not null indexed' },
        { name: 'source_id', type: 'text', constraints: 'not null indexed' },
        { name: 'canonical_json', type: 'json', constraints: 'not null' },
        { name: 'raw_json', type: 'json', constraints: 'not null' },
        { name: 'updated_at', type: 'timestamp', constraints: 'not null indexed' },
      ],
    },
    {
      name: 'traceability_links',
      purpose: 'Cross-object relationship registry for event to product, lot/serial, return, CAPA, document, report, and workflow links.',
      columns: [
        { name: 'id', type: 'text', constraints: 'primary key' },
        { name: 'source_object_id', type: 'text', constraints: 'not null indexed' },
        { name: 'target_object_id', type: 'text', constraints: 'not null indexed' },
        { name: 'relationship_type', type: 'text', constraints: 'not null indexed' },
        { name: 'status', type: 'text', constraints: 'not null' },
        { name: 'evidence', type: 'text', constraints: 'not null' },
      ],
    },
    {
      name: 'report_catalog_items',
      purpose: 'Governed reporting and BI launcher metadata linked to canonical object dependencies and freshness evidence.',
      columns: [
        { name: 'id', type: 'text', constraints: 'primary key' },
        { name: 'title', type: 'text', constraints: 'not null indexed' },
        { name: 'platform', type: 'text', constraints: 'not null' },
        { name: 'workspace', type: 'text', constraints: 'not null indexed' },
        { name: 'owner', type: 'text', constraints: 'not null indexed' },
        { name: 'semantic_model', type: 'text', constraints: 'not null' },
        { name: 'refresh_status', type: 'text', constraints: 'not null indexed' },
        { name: 'last_refresh', type: 'timestamp', constraints: 'not null indexed' },
        { name: 'source_dependencies_json', type: 'json', constraints: 'not null' },
      ],
    },
  ],
  indexes: [
    'tracs_records(kind, created_at desc)',
    'tracs_records(kind, label, version desc)',
    'tracs_records(status, created_at desc)',
    'tracs_record_links(source_record_id, relationship_type)',
    'tracs_record_links(target_record_id, relationship_type)',
    'canonical_objects(object_type, status)',
    'canonical_objects(source_connector, source_id)',
    'traceability_links(source_object_id, relationship_type)',
    'traceability_links(target_object_id, relationship_type)',
    'report_catalog_items(refresh_status, last_refresh desc)',
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

function parseRecordRow(row) {
  return {
    id: row.id,
    kind: row.kind,
    version: row.version,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    label: row.label,
    summary: row.summary,
    payload: JSON.parse(row.payload_json),
  }
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

  async function latestByKind(kind) {
    const records = await listByKind(kind)
    const latest = new Map()
    records.forEach((record) => {
      const existing = latest.get(record.label)
      if (!existing || record.version > existing.version) latest.set(record.label, record)
    })
    return Array.from(latest.values())
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
    latestByKind,
    getRecord,
    health,
  }
}

export function createSqliteRecordStore({ databaseFile, maxRecords = 1000 }) {
  const { DatabaseSync } = require('node:sqlite')
  mkdirSync(dirname(databaseFile), { recursive: true })
  const database = new DatabaseSync(databaseFile)
  database.exec(`
    create table if not exists tracs_records (
      id text primary key,
      kind text not null,
      label text not null,
      version integer not null,
      status text not null,
      summary text not null,
      payload_json text not null,
      created_at text not null,
      updated_at text not null
    );
    create index if not exists idx_tracs_records_kind_created_at on tracs_records(kind, created_at desc);
    create index if not exists idx_tracs_records_kind_label_version on tracs_records(kind, label, version desc);
    create index if not exists idx_tracs_records_status_created_at on tracs_records(status, created_at desc);
    create table if not exists tracs_record_links (
      id text primary key,
      source_record_id text not null,
      target_record_id text not null,
      relationship_type text not null,
      created_at text not null
    );
    create index if not exists idx_tracs_record_links_source on tracs_record_links(source_record_id, relationship_type);
    create index if not exists idx_tracs_record_links_target on tracs_record_links(target_record_id, relationship_type);
  `)

  const listStatement = database.prepare(`
    select id, kind, label, version, status, summary, payload_json, created_at, updated_at
    from tracs_records
    order by created_at desc
    limit ?
  `)
  const listByKindStatement = database.prepare(`
    select id, kind, label, version, status, summary, payload_json, created_at, updated_at
    from tracs_records
    where kind = ?
    order by created_at desc
    limit ?
  `)
  const getStatement = database.prepare(`
    select id, kind, label, version, status, summary, payload_json, created_at, updated_at
    from tracs_records
    where id = ?
  `)
  const nextVersionStatement = database.prepare(`
    select coalesce(max(version), 0) + 1 as next_version
    from tracs_records
    where kind = ? and label = ?
  `)
  const insertStatement = database.prepare(`
    insert into tracs_records (
      id, kind, label, version, status, summary, payload_json, created_at, updated_at
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  async function readRecords() {
    return listStatement.all(maxRecords).map(parseRecordRow)
  }

  async function saveRecord({ kind, label, status, summary, payload }) {
    const now = new Date().toISOString()
    const record = {
      id: randomUUID(),
      kind,
      version: nextVersionStatement.get(kind, label).next_version,
      status,
      createdAt: now,
      updatedAt: now,
      label,
      summary,
      payload,
    }
    insertStatement.run(
      record.id,
      record.kind,
      record.label,
      record.version,
      record.status,
      record.summary,
      JSON.stringify(record.payload),
      record.createdAt,
      record.updatedAt,
    )
    return record
  }

  async function listByKind(kind) {
    return listByKindStatement.all(kind, maxRecords).map(parseRecordRow)
  }

  async function latestByKind(kind) {
    const records = await listByKind(kind)
    const latest = new Map()
    records.forEach((record) => {
      const existing = latest.get(record.label)
      if (!existing || record.version > existing.version) latest.set(record.label, record)
    })
    return Array.from(latest.values())
  }

  async function getRecord(recordId) {
    const row = getStatement.get(recordId)
    return row ? parseRecordRow(row) : undefined
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
        mode: 'sqlite',
        schemaVersion: recordStoreSchema.schemaVersion,
        databaseFile,
        maxRecords,
      },
      evidence: `SQLite record store is active at ${databaseFile}.`,
    }
  }

  return {
    databaseFile,
    schema: recordStoreSchema,
    readRecords,
    saveRecord,
    listByKind,
    latestByKind,
    getRecord,
    health,
  }
}
