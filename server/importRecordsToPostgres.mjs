import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { createPostgresRecordStore } from './recordStore.mjs'

const require = createRequire(import.meta.url)

const args = new Map()
for (let index = 2; index < process.argv.length; index += 1) {
  const arg = process.argv[index]
  if (arg.startsWith('--')) {
    const [key, inlineValue] = arg.slice(2).split('=')
    const nextValue = process.argv[index + 1]
    if (inlineValue !== undefined) {
      args.set(key, inlineValue)
    } else if (nextValue && !nextValue.startsWith('--')) {
      args.set(key, nextValue)
      index += 1
    } else {
      args.set(key, true)
    }
  }
}

const source = args.get('source') ?? 'json'
const apply = args.get('apply') === true || args.get('apply') === 'true'
const sourceFile = resolve(
  String(
    args.get('file') ??
      (source === 'sqlite' ? process.env.TRACS_SQLITE_FILE ?? 'data/tracs-records.sqlite' : 'data/backend-records.json'),
  ),
)

function requirePostgresUrl() {
  const value = process.env.TRACS_POSTGRES_URL ?? process.env.DATABASE_URL
  if (!value) {
    throw new Error('Set TRACS_POSTGRES_URL or DATABASE_URL before running the import utility.')
  }
  return value
}

function normalizeRecord(record) {
  return {
    id: String(record.id ?? ''),
    kind: String(record.kind ?? ''),
    label: String(record.label ?? ''),
    version: Number(record.version ?? 0),
    status: String(record.status ?? ''),
    summary: String(record.summary ?? ''),
    payload: record.payload,
    createdAt: String(record.createdAt ?? record.created_at ?? ''),
    updatedAt: String(record.updatedAt ?? record.updated_at ?? record.createdAt ?? record.created_at ?? ''),
  }
}

function validateRecord(record) {
  const missing = []
  for (const field of ['id', 'kind', 'label', 'version', 'status', 'summary', 'createdAt', 'updatedAt']) {
    if (!record[field]) missing.push(field)
  }
  if (!record.payload || typeof record.payload !== 'object') missing.push('payload')
  if (!Number.isInteger(record.version) || record.version < 1) missing.push('version_integer')
  return missing
}

async function readJsonRecords(file) {
  const raw = await readFile(file, 'utf8')
  const records = JSON.parse(raw)
  if (!Array.isArray(records)) throw new Error(`${file} does not contain a JSON array of backend records.`)
  return records.map(normalizeRecord)
}

async function readSqliteRecords(file) {
  const { DatabaseSync } = require('node:sqlite')
  const database = new DatabaseSync(file, { readOnly: true })
  try {
    return database
      .prepare(
        `
          select id, kind, label, version, status, summary, payload_json, created_at, updated_at
          from tracs_records
          order by created_at asc
        `,
      )
      .all()
      .map((row) =>
        normalizeRecord({
          ...row,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          payload: typeof row.payload_json === 'string' ? JSON.parse(row.payload_json) : row.payload_json,
        }),
      )
  } finally {
    database.close()
  }
}

async function ensurePostgresReady() {
  const store = createPostgresRecordStore()
  await store.health(performance.now())
}

async function loadExisting(pool, records) {
  if (records.length === 0) return { ids: new Set(), versions: new Set() }
  const ids = records.map((record) => record.id)
  const existingIds = await pool.query('select id from tracs_records where id = any($1)', [ids])
  const existingVersions = await pool.query('select kind, label, version from tracs_records')
  return {
    ids: new Set(existingIds.rows.map((row) => row.id)),
    versions: new Set(existingVersions.rows.map((row) => `${row.kind}::${row.label}::${row.version}`)),
  }
}

async function insertRecords(pool, records) {
  const client = await pool.connect()
  try {
    await client.query('begin')
    for (const record of records) {
      await client.query(
        `
          insert into tracs_records (
            id, kind, label, version, status, summary, payload_json, created_at, updated_at
          ) values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)
        `,
        [
          record.id,
          record.kind,
          record.label,
          record.version,
          record.status,
          record.summary,
          JSON.stringify(record.payload),
          record.createdAt,
          record.updatedAt,
        ],
      )
    }
    await client.query('commit')
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

function recordKindCounts(records) {
  return records.reduce((summary, record) => {
    summary[record.kind] = (summary[record.kind] ?? 0) + 1
    return summary
  }, {})
}

function reconciliationStatus({ apply, invalidRecords, duplicateIds, duplicateVersions }) {
  if (invalidRecords.length > 0) return 'blocking'
  if (!apply || duplicateIds.length > 0 || duplicateVersions.length > 0) return 'warning'
  return 'pass'
}

async function saveReconciliationRecord(pool, summary) {
  const client = await pool.connect()
  const label = `${summary.source} to postgres import`
  try {
    await client.query('begin')
    await client.query('select pg_advisory_xact_lock(hashtext($1)::bigint)', [
      `postgres_import_reconciliation:${label}`,
    ])
    const versionResult = await client.query(
      `
        select coalesce(max(version), 0) + 1 as next_version
        from tracs_records
        where kind = $1 and label = $2
      `,
      ['postgres_import_reconciliation', label],
    )
    const now = new Date().toISOString()
    await client.query(
      `
        insert into tracs_records (
          id, kind, label, version, status, summary, payload_json, created_at, updated_at
        ) values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)
      `,
      [
        randomUUID(),
        'postgres_import_reconciliation',
        label,
        versionResult.rows[0].next_version,
        summary.status,
        summary.evidence,
        JSON.stringify(summary),
        now,
        now,
      ],
    )
    await client.query('commit')
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

async function main() {
  requirePostgresUrl()
  const records = source === 'sqlite' ? await readSqliteRecords(sourceFile) : await readJsonRecords(sourceFile)
  const invalidRecords = records
    .map((record) => ({ record, missing: validateRecord(record) }))
    .filter((entry) => entry.missing.length > 0)

  await ensurePostgresReady()
  const { Pool } = require('pg')
  const pool = new Pool({
    connectionString: process.env.TRACS_POSTGRES_URL ?? process.env.DATABASE_URL,
    max: Number(process.env.TRACS_POSTGRES_POOL_MAX ?? 5),
    ssl: process.env.TRACS_POSTGRES_SSL === 'false' ? false : { rejectUnauthorized: false },
  })

  try {
    const validRecords = records.filter((record) => validateRecord(record).length === 0)
    const existing = await loadExisting(pool, validRecords)
    const duplicateIds = validRecords.filter((record) => existing.ids.has(record.id))
    const duplicateVersions = validRecords.filter((record) =>
      existing.versions.has(`${record.kind}::${record.label}::${record.version}`),
    )
    const importableRecords = validRecords.filter((record) => {
      if (existing.ids.has(record.id)) return false
      if (existing.versions.has(`${record.kind}::${record.label}::${record.version}`)) return false
      return true
    })

    if (apply && importableRecords.length > 0) {
      await insertRecords(pool, importableRecords)
    }

    const generatedAt = new Date().toISOString()
    const summary = {
      reconciliationId: `postgres_import_reconciliation:${source}:${generatedAt}`,
      generatedAt,
      source,
      sourceFile,
      mode: apply ? 'apply' : 'dry_run',
      status: reconciliationStatus({ apply, invalidRecords, duplicateIds, duplicateVersions }),
      read: records.length,
      valid: validRecords.length,
      invalid: invalidRecords.length,
      duplicateIds: duplicateIds.length,
      duplicateVersions: duplicateVersions.length,
      importable: importableRecords.length,
      imported: apply ? importableRecords.length : 0,
      skipped: records.length - importableRecords.length,
      recordKindCounts: recordKindCounts(validRecords),
      evidence: apply
        ? `${importableRecords.length} backend record(s) imported into Postgres from ${sourceFile}.`
        : `${importableRecords.length} backend record(s) ready for Postgres import from ${sourceFile}; rerun with --apply to write.`,
      invalidRecords: invalidRecords.slice(0, 10).map((entry) => ({
        id: entry.record.id,
        label: entry.record.label,
        missing: entry.missing,
      })),
    }
    await saveReconciliationRecord(pool, summary)
    console.log(JSON.stringify(summary, null, 2))
  } finally {
    await pool.end()
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ status: 'blocking', error: error.message }, null, 2))
  process.exitCode = 1
})
