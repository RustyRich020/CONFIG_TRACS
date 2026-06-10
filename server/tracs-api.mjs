import { createServer } from 'node:http'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { adapterContracts, runAdapterDryRun } from './adapterContracts.mjs'
import { scanAssetRegistry } from './assetRegistry.mjs'
import {
  buildCanonicalLoadBundle,
  listCanonicalObjects,
  listQualityEvents,
  listReportCatalog,
  listTraceabilityLinks,
} from './canonicalService.mjs'
import {
  discoverSharePointExcelMetadata,
  discoverSnowflakeMetadata,
} from './credentialMetadataAdapters.mjs'
import { discoverCsvMetadata, previewCsvRows } from './csvAdapter.mjs'
import { createFileRecordStore } from './recordStore.mjs'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dataFile = resolve(rootDir, 'data', 'backend-records.json')
const recordStore = createFileRecordStore({ dataFile })
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

async function parseBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

async function listConnectorRuns(connectorId) {
  const records = await recordStore.listByKind('connector_run')
  return records.filter(
    (record) => record.payload?.connectorId === connectorId,
  )
}

async function listMappingRuns(mappingId) {
  const records = await recordStore.listByKind('mapping_validation')
  return records.filter(
    (record) => record.payload?.mappingId === mappingId,
  )
}

async function listIntegrationContracts() {
  return recordStore.listByKind('integration_contract')
}

async function listControlledTemplates() {
  return recordStore.listByKind('controlled_template')
}

async function reportCatalogForRead() {
  const reports = await listReportCatalog()
  const latestRecords = await recordStore.latestByKind('report_catalog_item')
  const overrides = new Map(latestRecords.map((record) => [record.label, record.payload]))
  return reports.map((report) => overrides.get(report.id) ?? report)
}

async function persistedCanonicalObjects() {
  const records = await recordStore.latestByKind('canonical_object')
  return records.map((record) => record.payload)
}

async function persistedTraceabilityLinks() {
  const records = await recordStore.latestByKind('traceability_link')
  return records.map((record) => record.payload)
}

async function canonicalObjectsForRead() {
  const persisted = await persistedCanonicalObjects()
  return persisted.length > 0 ? persisted : listCanonicalObjects()
}

async function traceabilityLinksForRead() {
  const persisted = await persistedTraceabilityLinks()
  return persisted.length > 0 ? persisted : listTraceabilityLinks()
}

async function canonicalObjectForRead(objectId) {
  const objects = await canonicalObjectsForRead()
  return objects.find((object) => object.id === objectId)
}

async function traceabilityResultForRead(objectId) {
  const object = await canonicalObjectForRead(objectId)
  if (!object) return null
  const links = await traceabilityLinksForRead()
  return {
    object,
    links: links.filter(
      (link) => link.sourceObjectId === objectId || link.targetObjectId === objectId,
    ),
  }
}

async function persistCanonicalLoad({
  mappingId = 'quality_event',
  sourceConnector = 'manual_csv_quality_events',
  connectorType = 'csv',
  sourceObject = 'quality_events_sample.csv',
  targetObject = 'quality_event',
} = {}) {
  const { objects, links, events, warnings } = await buildCanonicalLoadBundle({
    sourceConnector,
    connectorType,
    sourceObject,
    targetObject,
  })
  const loadedAt = new Date().toISOString()
  const loadId = `canonical_load:${mappingId}:${loadedAt}`

  for (const object of objects) {
    await recordStore.saveRecord({
      kind: 'canonical_object',
      label: object.id,
      status: object.status === 'active' || object.status === 'referenced' ? 'pass' : 'warning',
      summary: `${object.objectType} canonical object loaded from ${object.sourceConnector}.`,
      payload: {
        ...object,
        loadedAt,
        loadId,
      },
    })
  }

  for (const link of links) {
    await recordStore.saveRecord({
      kind: 'traceability_link',
      label: link.id,
      status: link.status,
      summary: `${link.relationshipType} traceability link loaded.`,
      payload: {
        ...link,
        loadedAt,
        loadId,
      },
    })
  }

  const result = {
    loadId,
    loadedAt,
    sourceConnector,
    connectorType,
    sourceObject,
    targetObject,
    mappingId,
    objectCount: objects.length,
    linkCount: links.length,
    qualityEventCount: events.length,
    evidence: `${objects.length} canonical object(s), ${links.length} traceability link(s), and ${events.length} quality event(s) loaded from ${sourceConnector}/${sourceObject}.`,
    warnings,
  }

  const record = await recordStore.saveRecord({
    kind: 'canonical_load',
    label: `${mappingId} canonical load`,
    status: warnings.length > 0 ? 'warning' : 'pass',
    summary: result.evidence,
    payload: result,
  })

  return { ...result, record }
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
      jsonResponse(res, 200, {
        ...(await recordStore.health(startedAt)),
        endpoint: `http://${host}:${port}`,
      })
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/records') {
      jsonResponse(res, 200, await recordStore.readRecords())
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/storage/schema') {
      jsonResponse(res, 200, recordStore.schema)
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

    if (req.method === 'GET' && url.pathname === '/api/objects') {
      jsonResponse(res, 200, await canonicalObjectsForRead())
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/quality-events') {
      const objects = await canonicalObjectsForRead()
      const events = objects.filter((object) => object.objectType === 'quality_event')
      jsonResponse(res, 200, events.length > 0 ? events : await listQualityEvents())
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/traceability-links') {
      jsonResponse(res, 200, await traceabilityLinksForRead())
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/canonical-loads') {
      jsonResponse(res, 201, await persistCanonicalLoad(await parseBody(req)))
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/reports') {
      jsonResponse(res, 200, await reportCatalogForRead())
      return
    }

    const objectTraceabilityMatch = url.pathname.match(/^\/api\/objects\/(.+)\/traceability$/)
    if (req.method === 'GET' && objectTraceabilityMatch) {
      const result = await traceabilityResultForRead(decodeURIComponent(objectTraceabilityMatch[1]))
      if (!result) {
        jsonResponse(res, 404, { error: 'Canonical object not found' })
        return
      }
      jsonResponse(res, 200, result)
      return
    }

    const objectMatch = url.pathname.match(/^\/api\/objects\/(.+)$/)
    if (req.method === 'GET' && objectMatch) {
      const object = await canonicalObjectForRead(decodeURIComponent(objectMatch[1]))
      if (!object) {
        jsonResponse(res, 404, { error: 'Canonical object not found' })
        return
      }
      jsonResponse(res, 200, object)
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
        await recordStore.saveRecord({
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
      const previous = await recordStore.getRecord(decodeURIComponent(templateMatch[1]))
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
        await recordStore.saveRecord({
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
      const connectorType = body.connector?.type
      let metadata
      if (connectorType === 'csv') {
        metadata = await discoverCsvMetadata(connectorId, body.connector)
      } else if (connectorType === 'snowflake') {
        metadata = await discoverSnowflakeMetadata(connectorId, body.connector)
      } else if (connectorType === 'sharepoint_excel') {
        metadata = await discoverSharePointExcelMetadata(connectorId, body.connector)
      } else {
        jsonResponse(res, 422, {
          error: `Live metadata discovery is not implemented for ${connectorType ?? 'unknown'} connectors.`,
        })
        return
      }
      const record = await recordStore.saveRecord({
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
      const record = await recordStore.saveRecord({
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
          await recordStore.saveRecord({
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
          await recordStore.saveRecord({
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
      jsonResponse(res, 201, await recordStore.saveRecord(await parseBody(req)))
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/deployment-snapshots') {
      const body = await parseBody(req)
      const payload = createDeploymentPayload(body)
      jsonResponse(
        res,
        201,
        await recordStore.saveRecord({
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
