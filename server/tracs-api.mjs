import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { adapterContracts, runAdapterDryRun } from './adapterContracts.mjs'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dataFile = resolve(rootDir, 'data', 'backend-records.json')
const port = Number(process.env.TRACS_API_PORT ?? 8787)
const host = process.env.TRACS_API_HOST ?? '127.0.0.1'

function jsonResponse(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json;charset=utf-8',
  })
  res.end(JSON.stringify(payload, null, 2))
}

function summarizeStatus(records) {
  if (records.some((record) => record.status === 'blocking')) return 'blocking'
  if (records.some((record) => record.status === 'warning')) return 'warning'
  return 'pass'
}

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
  await writeFile(dataFile, JSON.stringify(records.slice(0, 250), null, 2))
}

function nextVersion(records, kind, label) {
  const matching = records.filter((record) => record.kind === kind && record.label === label)
  return matching.length > 0 ? Math.max(...matching.map((record) => record.version)) + 1 : 1
}

async function parseBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

async function saveRecord({ kind, label, status, summary, payload }) {
  const records = await readRecords()
  const now = new Date().toISOString()
  const record = {
    id: crypto.randomUUID(),
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

function createDeploymentPayload({ config, deployment }) {
  return {
    environment: config.environment.environment,
    warehouse: config.environment.warehouse,
    deployment_profile: deployment,
    active_industries: deployment.activeIndustries.map((key) => ({
      key,
      display_name: config.industries[key]?.display_name ?? key,
    })),
    active_domains: deployment.activeDomains.map((key) => ({
      key,
      display_name: config.solutionDomains[key]?.display_name ?? key,
    })),
  }
}

async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    jsonResponse(res, 204, {})
    return
  }

  try {
    const url = new URL(req.url ?? '/', `http://${host}:${port}`)

    if (req.method === 'GET' && url.pathname === '/api/health') {
      const startedAt = performance.now()
      const records = await readRecords()
      jsonResponse(res, 200, {
        mode: 'api',
        status: summarizeStatus(records),
        checkedAt: new Date().toISOString(),
        endpoint: `http://${host}:${port}`,
        latencyMs: Math.max(1, Math.round(performance.now() - startedAt)),
        records: records.length,
        evidence: `File-backed API persistence is active at ${dataFile}.`,
      })
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/records') {
      jsonResponse(res, 200, await readRecords())
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/adapter-contracts') {
      jsonResponse(res, 200, adapterContracts)
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/records') {
      jsonResponse(res, 201, await saveRecord(await parseBody(req)))
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/deployment-snapshots') {
      const body = await parseBody(req)
      const payload = createDeploymentPayload(body)
      jsonResponse(
        res,
        201,
        await saveRecord({
          kind: 'deployment_profile',
          label: `${body.config.environment.environment.name} deployment profile`,
          status: body.readinessStatus,
          summary: `${body.deployment.activeIndustries.length} profile(s), ${body.deployment.activeDomains.length} domain(s) persisted.`,
          payload,
        }),
      )
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/adapter-dry-runs') {
      const body = await parseBody(req)
      const result = runAdapterDryRun(body.connectorId, body.connector)
      jsonResponse(res, 200, result)
      return
    }

    jsonResponse(res, 404, { error: 'Route not found' })
  } catch (error) {
    jsonResponse(res, 500, {
      error: error instanceof Error ? error.message : 'Unknown API error',
    })
  }
}

createServer(handleRequest).listen(port, host, () => {
  console.log(`TRACS API listening at http://${host}:${port}`)
})
