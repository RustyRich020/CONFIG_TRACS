import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { adapterContracts, runAdapterDryRun } from './adapterContracts.mjs'
import { scanAssetRegistry } from './assetRegistry.mjs'
import { discoverCsvMetadata, previewCsvRows } from './csvAdapter.mjs'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dataFile = resolve(rootDir, 'data', 'backend-records.json')
const port = Number(process.env.TRACS_API_PORT ?? 8787)
const host = process.env.TRACS_API_HOST ?? '127.0.0.1'

function jsonResponse(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
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

async function listConnectorRuns(connectorId) {
  const records = await readRecords()
  return records.filter(
    (record) => record.kind === 'connector_run' && record.payload?.connectorId === connectorId,
  )
}

async function listMappingRuns(mappingId) {
  const records = await readRecords()
  return records.filter(
    (record) => record.kind === 'mapping_validation' && record.payload?.mappingId === mappingId,
  )
}

async function listIntegrationContracts() {
  const records = await readRecords()
  return records.filter((record) => record.kind === 'integration_contract')
}

async function listControlledTemplates() {
  const records = await readRecords()
  return records.filter((record) => record.kind === 'controlled_template')
}

async function getRecord(recordId) {
  const records = await readRecords()
  return records.find((record) => record.id === recordId)
}

function slug(value) {
  return String(value ?? 'template')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72)
}

function createControlledTemplatePayload(body) {
  const asset = body.asset
  if (!asset?.id || !asset?.name || !asset?.relativePath) {
    throw new Error('Template promotion requires an asset with id, name, and relativePath.')
  }

  const now = new Date().toISOString()
  const category = body.category ?? asset.category ?? 'Reference'
  const domain = body.domain ?? asset.domain ?? 'reference'
  const status = body.status ?? 'draft'
  return {
    templateId: body.templateId ?? `tpl-${slug(asset.name)}-${asset.id.slice(0, 8)}`,
    status,
    versionLabel: body.versionLabel ?? 'v1',
    promotedAt: body.promotedAt ?? now,
    source: asset,
    classification: {
      category,
      domain,
      kind: body.kind ?? asset.kind,
      sourceFamily: asset.sourceFamily ?? 'MYROBOTS',
    },
    tags: {
      industries: body.industries ?? [],
      solutions: body.solutions ?? [],
    },
    provenanceNotes:
      body.provenanceNotes ??
      `Promoted from local asset registry path ${asset.relativePath} for controlled TRACS template review.`,
  }
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

    if (req.method === 'GET' && url.pathname === '/api/assets/registry') {
      jsonResponse(
        res,
        200,
        await scanAssetRegistry({
          root: url.searchParams.get('root') ?? undefined,
          limit: Number(url.searchParams.get('limit') ?? 500),
        }),
      )
      return
    }

    if (url.pathname === '/api/templates') {
      if (req.method === 'GET') {
        jsonResponse(res, 200, await listControlledTemplates())
        return
      }
    }

    if (req.method === 'POST' && url.pathname === '/api/templates/promote') {
      const payload = createControlledTemplatePayload(await parseBody(req))
      jsonResponse(
        res,
        201,
        await saveRecord({
          kind: 'controlled_template',
          label: payload.source.name,
          status: payload.status === 'active' ? 'pass' : 'warning',
          summary: `${payload.classification.category} ${payload.classification.kind} promoted from ${payload.source.sourceFamily}.`,
          payload,
        }),
      )
      return
    }

    const templateMatch = url.pathname.match(/^\/api\/templates\/([^/]+)$/)
    if (req.method === 'PUT' && templateMatch) {
      const previous = await getRecord(decodeURIComponent(templateMatch[1]))
      if (!previous || previous.kind !== 'controlled_template') {
        jsonResponse(res, 404, { error: 'Template record not found' })
        return
      }

      const body = await parseBody(req)
      const payload = {
        ...previous.payload,
        ...body,
        classification: {
          ...previous.payload.classification,
          ...(body.classification ?? {}),
        },
        tags: {
          ...previous.payload.tags,
          ...(body.tags ?? {}),
        },
      }
      jsonResponse(
        res,
        200,
        await saveRecord({
          kind: 'controlled_template',
          label: previous.label,
          status: payload.status === 'active' ? 'pass' : 'warning',
          summary:
            body.summary ??
            `${payload.classification.category} template updated to ${payload.status}.`,
          payload,
        }),
      )
      return
    }

    const metadataMatch = url.pathname.match(/^\/api\/connectors\/([^/]+)\/metadata$/)
    if (req.method === 'POST' && metadataMatch) {
      const connectorId = decodeURIComponent(metadataMatch[1])
      const body = await parseBody(req)
      if (body.connector?.type !== 'csv') {
        jsonResponse(res, 422, {
          error: 'Live metadata discovery is implemented for csv connectors in this phase.',
        })
        return
      }
      const metadata = await discoverCsvMetadata(connectorId, body.connector)
      const record = await saveRecord({
        kind: 'connector_run',
        label: `${body.connector.display_name} metadata discovery`,
        status: metadata.columns.length > 0 ? 'pass' : 'warning',
        summary: metadata.evidence,
        payload: {
          connectorId,
          runType: 'metadata',
          result: metadata,
        },
      })
      jsonResponse(res, 200, { ...metadata, record })
      return
    }

    const previewMatch = url.pathname.match(/^\/api\/connectors\/([^/]+)\/preview$/)
    if (req.method === 'POST' && previewMatch) {
      const connectorId = decodeURIComponent(previewMatch[1])
      const body = await parseBody(req)
      if (body.connector?.type !== 'csv') {
        jsonResponse(res, 422, {
          error: 'Live row preview is implemented for csv connectors in this phase.',
        })
        return
      }
      const preview = await previewCsvRows(
        connectorId,
        body.connector,
        body.limit ?? url.searchParams.get('limit'),
      )
      const record = await saveRecord({
        kind: 'connector_run',
        label: `${body.connector.display_name} row preview`,
        status: preview.returnedRows > 0 ? 'pass' : 'warning',
        summary: preview.evidence,
        payload: {
          connectorId,
          runType: 'preview',
          result: preview,
        },
      })
      jsonResponse(res, 200, { ...preview, record })
      return
    }

    const runsMatch = url.pathname.match(/^\/api\/connectors\/([^/]+)\/runs$/)
    if (req.method === 'GET' && runsMatch) {
      jsonResponse(res, 200, await listConnectorRuns(decodeURIComponent(runsMatch[1])))
      return
    }

    const mappingRunsMatch = url.pathname.match(/^\/api\/mappings\/([^/]+)\/runs$/)
    if (mappingRunsMatch) {
      const mappingId = decodeURIComponent(mappingRunsMatch[1])

      if (req.method === 'GET') {
        jsonResponse(res, 200, await listMappingRuns(mappingId))
        return
      }

      if (req.method === 'POST') {
        const body = await parseBody(req)
        jsonResponse(
          res,
          201,
          await saveRecord({
            kind: 'mapping_validation',
            label: `${mappingId} validation`,
            status: body.result?.status ?? 'warning',
            summary:
              body.summary ??
              `${body.result?.mappedFields?.filter?.((field) => field.present).length ?? 0}/${body.result?.mappedFields?.length ?? 0} mapped fields present.`,
            payload: {
              mappingId,
              mapping: body.mapping,
              schema: body.schema,
              result: body.result,
            },
          }),
        )
        return
      }
    }

    if (url.pathname === '/api/integration-contracts') {
      if (req.method === 'GET') {
        jsonResponse(res, 200, await listIntegrationContracts())
        return
      }

      if (req.method === 'POST') {
        const body = await parseBody(req)
        jsonResponse(
          res,
          201,
          await saveRecord({
            kind: 'integration_contract',
            label: body.label ?? 'Integration Contract',
            status: body.status ?? 'warning',
            summary: body.summary ?? 'Integration contract persisted.',
            payload: body.contract,
          }),
        )
        return
      }
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
