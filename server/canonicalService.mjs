import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import yaml from 'js-yaml'

const qualityEventSamplePath = resolve('public', 'samples', 'quality_events_sample.csv')
const reportCatalogPath = resolve('public', 'config', 'reports', 'report_catalog.yaml')

function freshnessStatus(lastRefresh, maxAgeHours) {
  const ageHours = (Date.now() - Date.parse(lastRefresh)) / 36e5
  if (!Number.isFinite(ageHours)) {
    return {
      refreshStatus: 'blocking',
      freshnessEvidence: 'Last refresh timestamp is missing or invalid.',
    }
  }
  const roundedAge = Math.max(0, Math.round(ageHours * 10) / 10)
  return {
    refreshStatus: ageHours <= maxAgeHours ? 'pass' : 'warning',
    freshnessEvidence: `Last refreshed ${roundedAge} hour(s) ago; threshold is ${maxAgeHours} hour(s).`,
  }
}

async function loadReportCatalogConfig() {
  const raw = yaml.load(await readFile(reportCatalogPath, 'utf8'))
  return raw?.reports ?? []
}

function normalizeReport(report) {
  const maxAgeHours = Number(report.max_age_hours ?? 48)
  const freshness = freshnessStatus(report.last_refresh, maxAgeHours)
  return {
    id: report.id,
    title: report.title,
    platform: report.platform,
    workspace: report.workspace,
    owner: report.owner,
    semanticModel: report.semantic_model,
    refreshStatus: freshness.refreshStatus,
    lastRefresh: report.last_refresh,
    maxAgeHours,
    freshnessEvidence: freshness.freshnessEvidence,
    url: report.url,
    sourceDependencies: report.source_dependencies ?? [],
    domains: report.domains ?? [],
  }
}

function parseCsvLine(line) {
  const values = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"' && next === '"') {
      current += '"'
      index += 1
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }

  values.push(current)
  return values.map((value) => value.trim())
}

async function loadQualityEventRows() {
  const text = await readFile(qualityEventSamplePath, 'utf8')
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
  const columns = parseCsvLine(lines[0] ?? '')
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    return Object.fromEntries(columns.map((column, index) => [column, values[index] ?? '']))
  })
}

function qualityEventFromRow(row, loadProfile = {}) {
  const eventId = row.COMPLAINT_ID
  const sourceConnector = loadProfile.sourceConnector ?? 'manual_csv_quality_events'
  const sourceObject = loadProfile.sourceObject ?? 'quality_events_sample.csv'
  const sourceSystem = loadProfile.sourceSystem ?? row.SOURCE_SYSTEM
  return {
    id: `quality_event:${eventId}`,
    objectType: 'quality_event',
    family: 'quality',
    displayName: `${eventId} ${row.PRODUCT_NAME}`,
    status: row.CURRENT_STATUS,
    sourceConnector,
    sourceSystem,
    sourceObject,
    sourceId: eventId,
    createdAt: row.RECEIVED_DATE,
    updatedAt: new Date().toISOString(),
    canonical: {
      event_id: eventId,
      event_date: row.RECEIVED_DATE,
      event_type: row.COMPLAINT_TYPE,
      source_system: sourceSystem,
      product_code: row.ITEM_NUMBER,
      product_name: row.PRODUCT_NAME,
      lot_number: row.LOT,
      serial_number: row.SERIAL,
      severity: row.SEVERITY_CLASS,
      narrative: row.CUSTOMER_DESCRIPTION,
      status: row.CURRENT_STATUS,
      owner: row.OWNER_NAME,
      capa_reference_id: row.CAPA_ID,
    },
    raw: {
      ...row,
      TRACS_LOAD_SOURCE_CONNECTOR: sourceConnector,
      TRACS_LOAD_SOURCE_OBJECT: sourceObject,
    },
  }
}

function productObject(event) {
  return {
    id: `product:${event.canonical.product_code}`,
    objectType: 'product',
    family: 'product',
    displayName: event.canonical.product_name,
    status: 'active',
    sourceConnector: event.sourceConnector,
    sourceSystem: event.sourceSystem,
    sourceObject: event.sourceObject,
    sourceId: event.canonical.product_code,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    canonical: {
      product_code: event.canonical.product_code,
      product_name: event.canonical.product_name,
    },
    raw: event.raw,
  }
}

function lotSerialObject(event) {
  return {
    id: `lot_serial:${event.canonical.lot_number}:${event.canonical.serial_number}`,
    objectType: 'lot_serial',
    family: 'traceability',
    displayName: `${event.canonical.lot_number} / ${event.canonical.serial_number}`,
    status: 'active',
    sourceConnector: event.sourceConnector,
    sourceSystem: event.sourceSystem,
    sourceObject: event.sourceObject,
    sourceId: `${event.canonical.lot_number}:${event.canonical.serial_number}`,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    canonical: {
      lot_number: event.canonical.lot_number,
      serial_number: event.canonical.serial_number,
      product_code: event.canonical.product_code,
    },
    raw: event.raw,
  }
}

function returnObject(event) {
  if (event.canonical.event_type !== 'return') return null
  return {
    id: `return_case:${event.canonical.event_id}`,
    objectType: 'return_case',
    family: 'quality',
    displayName: `Return ${event.canonical.event_id}`,
    status: event.canonical.status,
    sourceConnector: event.sourceConnector,
    sourceSystem: event.sourceSystem,
    sourceObject: event.sourceObject,
    sourceId: event.canonical.event_id,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    canonical: {
      return_id: event.canonical.event_id,
      product_code: event.canonical.product_code,
      lot_number: event.canonical.lot_number,
      serial_number: event.canonical.serial_number,
      disposition_status: event.canonical.status,
    },
    raw: event.raw,
  }
}

function capaObject(event) {
  if (!event.canonical.capa_reference_id) return null
  return {
    id: `capa_reference:${event.canonical.capa_reference_id}`,
    objectType: 'capa_reference',
    family: 'quality',
    displayName: event.canonical.capa_reference_id,
    status: 'referenced',
    sourceConnector: event.sourceConnector,
    sourceSystem: event.sourceSystem,
    sourceObject: event.sourceObject,
    sourceId: event.canonical.capa_reference_id,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    canonical: {
      capa_reference_id: event.canonical.capa_reference_id,
      owner: event.canonical.owner,
      linked_event_id: event.canonical.event_id,
    },
    raw: event.raw,
  }
}

function linksForEvent(event) {
  const links = [
    {
      id: `link:${event.id}:product`,
      sourceObjectId: event.id,
      sourceObjectType: event.objectType,
      targetObjectId: `product:${event.canonical.product_code}`,
      targetObjectType: 'product',
      targetLabel: event.canonical.product_name,
      relationshipType: 'event_to_product',
      status: 'pass',
      evidence: `${event.canonical.event_id} maps to product ${event.canonical.product_code}.`,
    },
    {
      id: `link:${event.id}:lot_serial`,
      sourceObjectId: event.id,
      sourceObjectType: event.objectType,
      targetObjectId: `lot_serial:${event.canonical.lot_number}:${event.canonical.serial_number}`,
      targetObjectType: 'lot_serial',
      targetLabel: `${event.canonical.lot_number} / ${event.canonical.serial_number}`,
      relationshipType: 'event_to_lot_serial',
      status: 'pass',
      evidence: `${event.canonical.event_id} carries lot and serial traceability fields.`,
    },
  ]

  if (event.canonical.event_type === 'return') {
    links.push({
      id: `link:${event.id}:return_case`,
      sourceObjectId: event.id,
      sourceObjectType: event.objectType,
      targetObjectId: `return_case:${event.canonical.event_id}`,
      targetObjectType: 'return_case',
      targetLabel: `Return ${event.canonical.event_id}`,
      relationshipType: 'event_to_return_case',
      status: 'pass',
      evidence: `${event.canonical.event_id} is typed as a return event.`,
    })
  }

  if (event.canonical.capa_reference_id) {
    links.push({
      id: `link:${event.id}:capa`,
      sourceObjectId: event.id,
      sourceObjectType: event.objectType,
      targetObjectId: `capa_reference:${event.canonical.capa_reference_id}`,
      targetObjectType: 'capa_reference',
      targetLabel: event.canonical.capa_reference_id,
      relationshipType: 'event_to_capa_reference',
      status: 'warning',
      evidence: `${event.canonical.event_id} has an external CAPA reference but no live eQMS status yet.`,
    })
  }

  return links
}

function familyForTargetObject(targetObject) {
  if (targetObject === 'supplier') return 'supply_chain'
  if (targetObject === 'document_reference') return 'traceability'
  if (targetObject === 'capa_reference') return 'quality'
  if (targetObject === 'quality_event') return 'quality'
  return 'reference'
}

function statusForReference(canonical) {
  return (
    canonical.status ??
    canonical.lifecycle_status ??
    canonical.qualification_status ??
    canonical.effectiveness_status ??
    'referenced'
  )
}

function displayNameForReference(targetObject, canonical, primaryValue) {
  return (
    canonical.title ??
    canonical.supplier_name ??
    canonical.document_number ??
    canonical.capa_number ??
    canonical.name ??
    primaryValue ??
    targetObject
  )
}

function canonicalReferenceObject({
  row,
  rowIndex = 0,
  mappingFields = {},
  primaryKey = {},
  sourceConnector,
  sourceObject,
  targetObject,
  connectorType,
}) {
  const canonical = Object.fromEntries(
    Object.entries(mappingFields).map(([targetField, sourceField]) => [targetField, row[sourceField] ?? '']),
  )
  const primaryTarget = primaryKey.targetField ?? Object.keys(mappingFields)[0] ?? 'id'
  const primarySource = primaryKey.sourceField ?? mappingFields[primaryTarget] ?? primaryTarget
  const primaryValue = row[primarySource] ?? canonical[primaryTarget]
  const sourceId = String(primaryValue || `${targetObject}-${rowIndex + 1}`)
  return {
    id: `${targetObject}:${sourceId}`,
    objectType: targetObject,
    family: familyForTargetObject(targetObject),
    displayName: String(displayNameForReference(targetObject, canonical, sourceId)),
    status: String(statusForReference(canonical)),
    sourceConnector,
    sourceSystem: canonical.source_system ?? connectorType,
    sourceObject,
    sourceId,
    createdAt: canonical.opened_at ?? canonical.effective_at ?? canonical.last_audit_at ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    canonical,
    raw: {
      ...row,
      TRACS_LOAD_SOURCE_CONNECTOR: sourceConnector,
      TRACS_LOAD_SOURCE_OBJECT: sourceObject,
    },
  }
}

function targetObjectIdForTraceability(link, value) {
  if (!value) return ''
  const discriminator = `${link.relationship_type} ${link.target_field} ${link.source_field}`
  if (discriminator.includes('quality_event') || discriminator.includes('complaint')) return `quality_event:${value}`
  if (discriminator.includes('product')) return `product:${value}`
  if (discriminator.includes('supplier')) return `supplier:${value}`
  if (discriminator.includes('capa')) return `capa_reference:${value}`
  if (discriminator.includes('document')) return `document_reference:${value}`
  return String(value)
}

function linksForReferenceObject(object, traceabilityLinks = []) {
  return traceabilityLinks
    .map((link) => {
      const sourceValue = object.raw[link.source_field] ?? object.canonical[link.source_field]
      const targetValue = object.raw[link.target_field] ?? object.canonical[link.target_field]
      const relationshipValue = targetValue || sourceValue
      const targetObjectId = targetObjectIdForTraceability(link, relationshipValue)
      if (!targetObjectId) return null
      return {
        id: `link:${object.id}:${link.relationship_type}:${relationshipValue}`,
        sourceObjectId: object.id,
        sourceObjectType: object.objectType,
        targetObjectId,
        targetObjectType: targetObjectId.split(':')[0],
        targetLabel: String(relationshipValue),
        relationshipType: link.relationship_type,
        status: link.required && !relationshipValue ? 'warning' : 'pass',
        evidence: `${object.id} maps through ${link.relationship_type} using ${link.source_field}.`,
      }
    })
    .filter(Boolean)
}

export async function listQualityEvents() {
  const rows = await loadQualityEventRows()
  return rows.map(qualityEventFromRow)
}

export async function listCanonicalObjects() {
  const events = await listQualityEvents()
  const objects = new Map()

  events.forEach((event) => {
    ;[event, productObject(event), lotSerialObject(event), returnObject(event), capaObject(event)]
      .filter(Boolean)
      .forEach((object) => objects.set(object.id, object))
  })

  return Array.from(objects.values())
}

export async function getCanonicalObject(objectId) {
  const objects = await listCanonicalObjects()
  return objects.find((object) => object.id === objectId)
}

export async function listTraceabilityLinks(objectId) {
  const events = await listQualityEvents()
  const allLinks = events.flatMap(linksForEvent)
  if (!objectId) return allLinks
  return allLinks.filter(
    (link) => link.sourceObjectId === objectId || link.targetObjectId === objectId,
  )
}

export async function getTraceabilityResult(objectId) {
  const object = await getCanonicalObject(objectId)
  if (!object) return null
  const links = await listTraceabilityLinks(objectId)
  return { object, links }
}

export async function listReportCatalog() {
  const reports = await loadReportCatalogConfig()
  return reports.map(normalizeReport)
}

export async function buildCanonicalLoadBundle({
  sourceConnector = 'manual_csv_quality_events',
  connectorType = 'csv',
  sourceObject = 'quality_events_sample.csv',
  targetObject = 'quality_event',
  mappingFields,
  primaryKey,
  sourceRows,
  traceabilityLinks,
} = {}) {
  if ((connectorType === 'external_reference' || connectorType === 'rest_api') && targetObject !== 'quality_event') {
    const rows = Array.isArray(sourceRows) ? sourceRows : []
    const objects = rows.map((row, rowIndex) =>
      canonicalReferenceObject({
        row,
        rowIndex,
        mappingFields,
        primaryKey,
        sourceConnector,
        sourceObject,
        targetObject,
        connectorType,
      }),
    )
    return {
      objects,
      links: objects.flatMap((object) => linksForReferenceObject(object, traceabilityLinks)),
      events: [],
      warnings: rows.length > 0
        ? []
        : ['External-reference canonical load executed without preview rows; no canonical reference objects were created.'],
    }
  }

  const rows = await loadQualityEventRows()
  const sourceSystemByType = {
    csv: 'manual_csv',
    snowflake: 'snowflake',
    sharepoint_excel: 'sharepoint_excel',
    external_reference: 'external_reference',
  }
  const loadProfile = {
    sourceConnector,
    sourceObject,
    sourceSystem: sourceSystemByType[connectorType] ?? connectorType,
  }
  const events = rows
    .map((row) => qualityEventFromRow(row, loadProfile))
    .filter((event) => targetObject !== 'return_case' || event.canonical.event_type === 'return')
  const objects = new Map()

  events.forEach((event) => {
    const candidates =
      targetObject === 'return_case'
        ? [returnObject(event), productObject(event), lotSerialObject(event), event]
        : [event, productObject(event), lotSerialObject(event), returnObject(event), capaObject(event)]
    candidates.filter(Boolean).forEach((object) => objects.set(object.id, object))
  })

  return {
    objects: Array.from(objects.values()),
    links: events.flatMap(linksForEvent),
    events,
    warnings:
      connectorType === 'snowflake' || connectorType === 'sharepoint_excel'
        ? ['Credential-backed extraction is not enabled; sample-backed connector profile was used for canonical load contract validation.']
        : [],
  }
}
