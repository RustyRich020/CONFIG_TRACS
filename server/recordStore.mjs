import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'

const require = createRequire(import.meta.url)

export const postgresMigrationChecklist = {
  adapter: 'postgres',
  targetUse: 'Production-grade shared persistence for multi-user TRACS deployments.',
  requiredEnvironment: [
    {
      name: 'TRACS_RECORD_STORE',
      value: 'postgres',
      purpose: 'Selects the Postgres record store adapter.',
    },
    {
      name: 'TRACS_POSTGRES_URL',
      value: 'postgres://user:password@host:5432/database?sslmode=require',
      purpose: 'Preferred single connection string for hosted Postgres or Supabase.',
    },
  ],
  optionalEnvironment: [
    {
      name: 'TRACS_POSTGRES_SSL',
      value: 'require | false',
      purpose: 'Defaults to require unless the URL explicitly disables SSL.',
    },
    {
      name: 'TRACS_POSTGRES_POOL_MAX',
      value: '5',
      purpose: 'Caps API connection pool size for small app deployments.',
    },
    {
      name: 'TRACS_POSTGRES_SCHEMA',
      value: 'public',
      purpose: 'Reserved for managed-schema deployments; v1 uses public.',
    },
  ],
  gates: [
    'Create or select a managed Postgres database with automated backups enabled.',
    'Create a least-privilege TRACS application role that can create and maintain the TRACS persistence tables.',
    'Set TRACS_RECORD_STORE=postgres and TRACS_POSTGRES_URL in the backend host secret store, not in frontend config.',
    'Start the API once and confirm GET /api/health returns store.mode=postgres.',
    'Run a POST /api/records smoke test and confirm the record appears through GET /api/records.',
    'Export existing JSON or SQLite records before migration, then import through POST /api/records or a controlled migration script.',
    'Keep JSON or SQLite read-only for one release window as rollback evidence.',
  ],
  rollback: [
    'Unset TRACS_RECORD_STORE or set it to file_json to return to JSON file persistence.',
    'Set TRACS_RECORD_STORE=sqlite to return to local SQLite persistence.',
    'Do not delete the Postgres database until record counts and recent evidence packets are reconciled.',
  ],
}

export const recordStoreSchema = {
  schemaVersion: 'record_store_v1',
  tables: [
    {
      name: 'tracs_records',
      purpose: 'Canonical versioned record table for deployment profiles, connector runs, mapping runs, contracts, adapter checks, controlled templates, signed traceability export reviews, notification live-channel approvals, notification approval renewal routes, Postgres import reconciliation summaries, and Postgres cutover approvals.',
      columns: [
        { name: 'id', type: 'text', constraints: 'primary key' },
        { name: 'kind', type: 'text', constraints: 'not null indexed' },
        { name: 'label', type: 'text', constraints: 'not null indexed' },
        { name: 'version', type: 'integer', constraints: 'not null' },
        { name: 'status', type: 'text', constraints: 'not null' },
        { name: 'summary', type: 'text', constraints: 'not null' },
        { name: 'workflow_json', type: 'json', constraints: 'nullable' },
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

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function firstText(value) {
  return Array.isArray(value) ? value.find((entry) => typeof entry === 'string' && entry.trim()) : undefined
}

function isGovernanceRecordKind(kind) {
  return (
    kind === 'notification_delivery' ||
    kind === 'notification_delivery_retry' ||
    kind.includes('acknowledgement') ||
    kind.includes('closure') ||
    kind.includes('closeout') ||
    kind.includes('evidence') ||
    kind.includes('cutover')
  )
}

function governanceStage(kind) {
  if (kind === 'notification_delivery_retry' || kind.includes('retry_queue')) return 'retry'
  if (kind === 'notification_delivery' || kind.endsWith('_delivery')) return 'delivery'
  if (kind.endsWith('_delivery_acknowledgement') || kind.endsWith('_acknowledgement')) return 'acknowledgement'
  if (kind.includes('final_evidence')) return 'final_evidence'
  if (kind.includes('closeout_evidence') || kind.includes('closeout')) return 'closeout'
  if (kind.includes('follow_up_route')) return 'closure'
  if (kind.endsWith('_closure') || kind.includes('_closure_')) return 'closure'
  if (kind.includes('package')) return 'package'
  return 'source'
}

function workflowTypeFor(kind, payload) {
  const request = asObject(payload.request)
  if (typeof request.source === 'string' && request.source.trim()) return request.source
  if (kind.includes('postgres_cutover')) return 'production_cutover'
  if (kind.includes('retry_queue')) return 'notification_retry_queue'
  if (kind.includes('closure_sla')) return 'closure_sla'
  if (kind.includes('traceability')) return 'traceability'
  if (kind.includes('notification')) return 'notification_governance'
  if (kind.includes('closure_package')) return 'closure_package_governance'
  return kind
}

function ownerFor(payload, fallback) {
  const ownerFields = [
    payload.owner,
    payload.actor,
    payload.reviewer,
    firstText(payload.reviewers),
    firstText(payload.recipients),
    firstText(payload.routedReviewers),
    firstText(payload.infrastructureOwners),
    firstText(payload.messagingOwners),
  ]
  return ownerFields.find((value) => typeof value === 'string' && value.trim()) ?? fallback
}

function parentRecordIdFor(payload) {
  const nestedDelivery = asObject(payload.deliveryRecord)
  const nestedPackage = asObject(payload.packageRecord)
  const candidates = [
    payload.parentRecordId,
    payload.deliveryRecordId,
    payload.originalDeliveryRecordId,
    payload.responseRecordId,
    payload.packageRecordId,
    payload.closureRecordId,
    payload.recordId,
    nestedDelivery.id,
    nestedPackage.id,
  ]
  return candidates.find((value) => typeof value === 'string' && value.trim())
}

function dueAtFor(payload) {
  return [payload.dueAt, payload.retryDueAt, payload.reminderAt, payload.nextReviewAt, payload.routeDueAt].find(
    (value) => typeof value === 'string' && value.trim(),
  )
}

function inferWorkflowMetadata({ kind, label, payload }) {
  if (!isGovernanceRecordKind(kind)) return undefined
  const payloadObject = asObject(payload)
  return {
    metadataVersion: 'workflow_metadata_v1',
    workflowType: workflowTypeFor(kind, payloadObject),
    stage: governanceStage(kind),
    parentRecordId: parentRecordIdFor(payloadObject),
    owner: ownerFor(payloadObject, label),
    dueAt: dueAtFor(payloadObject),
  }
}

function parseRecordRow(row) {
  const payload = typeof row.payload_json === 'string' ? JSON.parse(row.payload_json) : row.payload_json
  const workflow = typeof row.workflow_json === 'string' ? JSON.parse(row.workflow_json) : row.workflow_json
  const createdAt = row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at
  const updatedAt = row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at
  return {
    id: row.id,
    kind: row.kind,
    version: row.version,
    status: row.status,
    createdAt,
    updatedAt,
    label: row.label,
    summary: row.summary,
    ...(workflow ? { workflow } : {}),
    payload,
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

  async function saveRecord({ kind, label, status, summary, payload, workflow }) {
    const records = await readRecords()
    const now = new Date().toISOString()
    const workflowMetadata = workflow ?? inferWorkflowMetadata({ kind, label, payload })
    const record = {
      id: randomUUID(),
      kind,
      version: nextVersion(records, kind, label),
      status,
      createdAt: now,
      updatedAt: now,
      label,
      summary,
      ...(workflowMetadata ? { workflow: workflowMetadata } : {}),
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
      workflow_json text,
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
  try {
    database.exec('alter table tracs_records add column workflow_json text;')
  } catch {
    // Existing SQLite stores may already have the workflow metadata column.
  }

  const listStatement = database.prepare(`
    select id, kind, label, version, status, summary, workflow_json, payload_json, created_at, updated_at
    from tracs_records
    order by created_at desc
    limit ?
  `)
  const listByKindStatement = database.prepare(`
    select id, kind, label, version, status, summary, workflow_json, payload_json, created_at, updated_at
    from tracs_records
    where kind = ?
    order by created_at desc
    limit ?
  `)
  const getStatement = database.prepare(`
    select id, kind, label, version, status, summary, workflow_json, payload_json, created_at, updated_at
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
      id, kind, label, version, status, summary, workflow_json, payload_json, created_at, updated_at
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  async function readRecords() {
    return listStatement.all(maxRecords).map(parseRecordRow)
  }

  async function saveRecord({ kind, label, status, summary, payload, workflow }) {
    const now = new Date().toISOString()
    const workflowMetadata = workflow ?? inferWorkflowMetadata({ kind, label, payload })
    const record = {
      id: randomUUID(),
      kind,
      version: nextVersionStatement.get(kind, label).next_version,
      status,
      createdAt: now,
      updatedAt: now,
      label,
      summary,
      ...(workflowMetadata ? { workflow: workflowMetadata } : {}),
      payload,
    }
    insertStatement.run(
      record.id,
      record.kind,
      record.label,
      record.version,
      record.status,
      record.summary,
      workflowMetadata ? JSON.stringify(workflowMetadata) : null,
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

export function createPostgresRecordStore({
  connectionString = process.env.TRACS_POSTGRES_URL ?? process.env.DATABASE_URL,
  maxRecords = Number(process.env.TRACS_POSTGRES_MAX_RECORDS ?? 5000),
  poolMax = Number(process.env.TRACS_POSTGRES_POOL_MAX ?? 5),
  ssl = process.env.TRACS_POSTGRES_SSL === 'false' ? false : { rejectUnauthorized: false },
} = {}) {
  const { Pool } = require('pg')
  const pool = new Pool({
    connectionString,
    max: poolMax,
    ssl,
  })

  let initialized

  async function initialize() {
    if (!initialized) {
      initialized = pool.query(`
        create table if not exists tracs_records (
          id text primary key,
          kind text not null,
          label text not null,
          version integer not null,
          status text not null,
          summary text not null,
          workflow_json jsonb,
          payload_json jsonb not null,
          created_at timestamptz not null,
          updated_at timestamptz not null
        );
        create unique index if not exists idx_tracs_records_kind_label_version_unique
          on tracs_records(kind, label, version);
        create index if not exists idx_tracs_records_kind_created_at
          on tracs_records(kind, created_at desc);
        create index if not exists idx_tracs_records_kind_label_version
          on tracs_records(kind, label, version desc);
        create index if not exists idx_tracs_records_status_created_at
          on tracs_records(status, created_at desc);
        alter table tracs_records add column if not exists workflow_json jsonb;
        create table if not exists tracs_record_links (
          id text primary key,
          source_record_id text not null,
          target_record_id text not null,
          relationship_type text not null,
          created_at timestamptz not null
        );
        create index if not exists idx_tracs_record_links_source
          on tracs_record_links(source_record_id, relationship_type);
        create index if not exists idx_tracs_record_links_target
          on tracs_record_links(target_record_id, relationship_type);
      `)
    }
    return initialized
  }

  async function readRecords() {
    await initialize()
    const result = await pool.query(
      `
        select id, kind, label, version, status, summary, workflow_json, payload_json, created_at, updated_at
        from tracs_records
        order by created_at desc
        limit $1
      `,
      [maxRecords],
    )
    return result.rows.map(parseRecordRow)
  }

  async function saveRecord({ kind, label, status, summary, payload, workflow }) {
    await initialize()
    const client = await pool.connect()
    try {
      await client.query('begin')
      await client.query('select pg_advisory_xact_lock(hashtext($1)::bigint)', [`${kind}:${label}`])
      const versionResult = await client.query(
        `
          select coalesce(max(version), 0) + 1 as next_version
          from tracs_records
          where kind = $1 and label = $2
        `,
        [kind, label],
      )
      const now = new Date().toISOString()
      const workflowMetadata = workflow ?? inferWorkflowMetadata({ kind, label, payload })
      const insertResult = await client.query(
        `
          insert into tracs_records (
            id, kind, label, version, status, summary, workflow_json, payload_json, created_at, updated_at
          ) values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, $10)
          returning id, kind, label, version, status, summary, workflow_json, payload_json, created_at, updated_at
        `,
        [
          randomUUID(),
          kind,
          label,
          versionResult.rows[0].next_version,
          status,
          summary,
          workflowMetadata ? JSON.stringify(workflowMetadata) : null,
          JSON.stringify(payload),
          now,
          now,
        ],
      )
      await client.query('commit')
      return parseRecordRow(insertResult.rows[0])
    } catch (error) {
      await client.query('rollback')
      throw error
    } finally {
      client.release()
    }
  }

  async function listByKind(kind) {
    await initialize()
    const result = await pool.query(
      `
        select id, kind, label, version, status, summary, workflow_json, payload_json, created_at, updated_at
        from tracs_records
        where kind = $1
        order by created_at desc
        limit $2
      `,
      [kind, maxRecords],
    )
    return result.rows.map(parseRecordRow)
  }

  async function latestByKind(kind) {
    await initialize()
    const result = await pool.query(
      `
        select distinct on (label)
          id, kind, label, version, status, summary, workflow_json, payload_json, created_at, updated_at
        from tracs_records
        where kind = $1
        order by label, version desc, created_at desc
        limit $2
      `,
      [kind, maxRecords],
    )
    return result.rows.map(parseRecordRow)
  }

  async function getRecord(recordId) {
    await initialize()
    const result = await pool.query(
      `
        select id, kind, label, version, status, summary, workflow_json, payload_json, created_at, updated_at
        from tracs_records
        where id = $1
      `,
      [recordId],
    )
    return result.rows[0] ? parseRecordRow(result.rows[0]) : undefined
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
        mode: 'postgres',
        schemaVersion: recordStoreSchema.schemaVersion,
        maxRecords,
        poolMax,
        ssl: ssl ? 'enabled' : 'disabled',
      },
      evidence: 'Postgres record store is active through the configured TRACS_POSTGRES_URL or DATABASE_URL.',
    }
  }

  return {
    schema: recordStoreSchema,
    migrationChecklist: postgresMigrationChecklist,
    readRecords,
    saveRecord,
    listByKind,
    latestByKind,
    getRecord,
    health,
  }
}
