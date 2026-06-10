import { getAdapterContract } from './backendContracts'
import yaml from 'js-yaml'
import type {
  AdapterDryRunResult,
  AppConfig,
  AssetRegistry,
  BackendHealth,
  BackendRecord,
  BackendRecordKind,
  CanonicalLoadRequest,
  CanonicalLoadResult,
  CanonicalObject,
  ControlledTemplatePayload,
  ControlledTemplateStatus,
  ConnectorPreviewResult,
  ConnectorSourceMetadata,
  CredentialValidationResult,
  CsvSchemaInference,
  DeploymentState,
  MappingManifest,
  MappingValidationResult,
  LocalAsset,
  NotificationDeliveryPayload,
  NotificationDeliveryResult,
  QualityEvent,
  ReportCatalogItem,
  RecordStoreSchema,
  StatusLevel,
  TraceabilityLink,
  TraceabilityResult,
} from './types'

const recordsKey = 'tracs.backend.records.v1'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeRecords(records: BackendRecord[]) {
  localStorage.setItem(recordsKey, JSON.stringify(records.slice(0, 250)))
}

function summarizeStatus(records: BackendRecord[]): StatusLevel {
  if (records.some((record) => record.status === 'blocking')) return 'blocking'
  if (records.some((record) => record.status === 'warning')) return 'warning'
  return 'pass'
}

function nextVersion(records: BackendRecord[], kind: BackendRecordKind, label: string) {
  const matching = records.filter((record) => record.kind === kind && record.label === label)
  return matching.length > 0 ? Math.max(...matching.map((record) => record.version)) + 1 : 1
}

function latestPayloads<TPayload>(records: BackendRecord[]): TPayload[] {
  const latest = new Map<string, BackendRecord>()
  records.forEach((record) => {
    const existing = latest.get(record.label)
    if (!existing || record.version > existing.version) latest.set(record.label, record)
  })
  return Array.from(latest.values()).map((record) => record.payload as TPayload)
}

function titleForKind(kind: LocalAsset['kind']) {
  return kind
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function parseCsvLine(line: string) {
  const values: string[] = []
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

function inferType(values: string[]) {
  const populated = values.filter((value) => value.length > 0)
  if (populated.length === 0) return 'empty'
  if (populated.every((value) => !Number.isNaN(Number(value)))) return 'number'
  if (populated.every((value) => /^\d{4}-\d{2}-\d{2}$/.test(value))) return 'date'
  return 'text'
}

async function loadCsvFixture() {
  const text = await fetch('/samples/quality_events_sample.csv').then((response) => response.text())
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
  const columns = parseCsvLine(lines[0] ?? '')
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    return Object.fromEntries(columns.map((column, index) => [column, values[index] ?? '']))
  })
  return { columns, rows }
}

function reportFreshness(lastRefresh: string, maxAgeHours: number): Pick<ReportCatalogItem, 'refreshStatus' | 'freshnessEvidence'> {
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

async function loadReportCatalogFixture(): Promise<ReportCatalogItem[]> {
  const response = await fetch('/config/reports/report_catalog.yaml')
  if (!response.ok) return []
  const parsed = yaml.load(await response.text()) as {
    reports?: Array<{
      id: string
      title: string
      platform: string
      workspace: string
      owner: string
      semantic_model: string
      last_refresh: string
      max_age_hours: number
      url: string
      source_dependencies: string[]
      domains: string[]
    }>
  }
  return (parsed.reports ?? []).map((report) => {
    const maxAgeHours = Number(report.max_age_hours ?? 48)
    return {
      id: report.id,
      title: report.title,
      platform: report.platform,
      workspace: report.workspace,
      owner: report.owner,
      semanticModel: report.semantic_model,
      lastRefresh: report.last_refresh,
      maxAgeHours,
      ...reportFreshness(report.last_refresh, maxAgeHours),
      url: report.url,
      sourceDependencies: report.source_dependencies ?? [],
      domains: report.domains ?? [],
    }
  })
}

function qualityEventFromRow(row: Record<string, string>): QualityEvent {
  const eventId = row.COMPLAINT_ID
  return {
    id: `quality_event:${eventId}`,
    objectType: 'quality_event',
    family: 'quality',
    displayName: `${eventId} ${row.PRODUCT_NAME}`,
    status: row.CURRENT_STATUS,
    sourceConnector: 'manual_csv_quality_events',
    sourceSystem: row.SOURCE_SYSTEM,
    sourceObject: 'quality_events_sample.csv',
    sourceId: eventId,
    createdAt: row.RECEIVED_DATE,
    updatedAt: new Date().toISOString(),
    canonical: {
      event_id: eventId,
      event_date: row.RECEIVED_DATE,
      event_type: row.COMPLAINT_TYPE,
      source_system: row.SOURCE_SYSTEM,
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
    raw: row,
  }
}

function derivedObjectsForEvent(event: QualityEvent): CanonicalObject[] {
  const objects: CanonicalObject[] = [
    event,
    {
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
    },
    {
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
    },
  ]

  if (event.canonical.event_type === 'return') {
    objects.push({
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
      },
      raw: event.raw,
    })
  }

  if (event.canonical.capa_reference_id) {
    objects.push({
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
      },
      raw: event.raw,
    })
  }

  return objects
}

function traceabilityLinksForEvent(event: QualityEvent): TraceabilityLink[] {
  const links: TraceabilityLink[] = [
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


export class LocalBackendClient {
  private endpoint = 'localStorage://tracs.backend.records.v1'

  async health(): Promise<BackendHealth> {
    const startedAt = performance.now()
    const records = readJson<BackendRecord[]>(recordsKey, [])
    return {
      mode: 'browser_local',
      status: summarizeStatus(records),
      checkedAt: new Date().toISOString(),
      endpoint: this.endpoint,
      latencyMs: Math.max(1, Math.round(performance.now() - startedAt)),
      records: records.length,
      evidence: 'Browser-local backend adapter is active and ready for API replacement.',
    }
  }

  async listRecords(): Promise<BackendRecord[]> {
    return readJson<BackendRecord[]>(recordsKey, [])
  }

  async listQualityEvents(): Promise<QualityEvent[]> {
    const persisted = await this.listCanonicalObjects()
    const persistedEvents = persisted.filter(
      (object): object is QualityEvent => object.objectType === 'quality_event',
    )
    if (persistedEvents.length > 0) return persistedEvents
    const { rows } = await loadCsvFixture()
    return rows.map(qualityEventFromRow)
  }

  async listCanonicalObjects(): Promise<CanonicalObject[]> {
    const records = await this.listRecords()
    const persisted = latestPayloads<CanonicalObject>(
      records.filter((record) => record.kind === 'canonical_object'),
    )
    if (persisted.length > 0) return persisted
    const { rows } = await loadCsvFixture()
    const events = rows.map(qualityEventFromRow)
    const objects = new Map<string, CanonicalObject>()
    events.flatMap(derivedObjectsForEvent).forEach((object) => objects.set(object.id, object))
    return Array.from(objects.values())
  }

  async listTraceabilityLinks(): Promise<TraceabilityLink[]> {
    const records = await this.listRecords()
    const persisted = latestPayloads<TraceabilityLink>(
      records.filter((record) => record.kind === 'traceability_link'),
    )
    if (persisted.length > 0) return persisted
    const { rows } = await loadCsvFixture()
    const events = rows.map(qualityEventFromRow)
    return events.flatMap(traceabilityLinksForEvent)
  }

  async loadCanonicalFromMapping({
    mappingId = 'quality_event',
    sourceConnector = 'manual_csv_quality_events',
    connectorType = 'csv',
    sourceObject = 'quality_events_sample.csv',
    targetObject = 'quality_event',
  }: CanonicalLoadRequest = {}): Promise<CanonicalLoadResult> {
    const { rows } = await loadCsvFixture()
    const events = rows
      .map((row) =>
        qualityEventFromRow({
          ...row,
          SOURCE_SYSTEM: connectorType === 'csv' ? row.SOURCE_SYSTEM : connectorType,
        }),
      )
      .map((event) => ({
        ...event,
        sourceConnector,
        sourceSystem: connectorType === 'csv' ? event.sourceSystem : connectorType,
        sourceObject,
        raw: {
          ...event.raw,
          TRACS_LOAD_SOURCE_CONNECTOR: sourceConnector,
          TRACS_LOAD_SOURCE_OBJECT: sourceObject,
        },
        canonical: {
          ...event.canonical,
          source_system: connectorType === 'csv' ? event.canonical.source_system : connectorType,
        },
      }))
      .filter((event) => targetObject !== 'return_case' || event.canonical.event_type === 'return')
    const objects = new Map<string, CanonicalObject>()
    events.flatMap(derivedObjectsForEvent).forEach((object) => objects.set(object.id, object))
    const links = events.flatMap(traceabilityLinksForEvent)
    const loadedAt = new Date().toISOString()
    const loadId = `canonical_load:${mappingId}:${loadedAt}`

    for (const object of objects.values()) {
      await this.saveRecord({
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
      await this.saveRecord({
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

    const result: CanonicalLoadResult = {
      loadId,
      loadedAt,
      sourceConnector,
      connectorType,
      sourceObject,
      targetObject,
      mappingId,
      objectCount: objects.size,
      linkCount: links.length,
      qualityEventCount: events.length,
      evidence: `${objects.size} canonical object(s), ${links.length} traceability link(s), and ${events.length} quality event(s) loaded from ${sourceConnector}/${sourceObject}.`,
      warnings:
        connectorType === 'snowflake' || connectorType === 'sharepoint_excel'
          ? ['Credential-backed extraction is not enabled; sample-backed connector profile was used for canonical load contract validation.']
          : [],
    }

    const record = await this.saveRecord({
      kind: 'canonical_load',
      label: `${mappingId} canonical load`,
      status: result.warnings.length > 0 ? 'warning' : 'pass',
      summary: result.evidence,
      payload: result,
    })

    return { ...result, record }
  }

  async getObjectTraceability(objectId: string): Promise<TraceabilityResult | null> {
    const [objects, links] = await Promise.all([
      this.listCanonicalObjects(),
      this.listTraceabilityLinks(),
    ])
    const object = objects.find((item) => item.id === objectId)
    if (!object) return null
    return {
      object,
      links: links.filter(
        (link) => link.sourceObjectId === objectId || link.targetObjectId === objectId,
      ),
    }
  }

  async listReports(): Promise<ReportCatalogItem[]> {
    return loadReportCatalogFixture()
  }

  async loadStorageSchema(): Promise<RecordStoreSchema> {
    return {
      schemaVersion: 'browser_local_v1',
      tables: [
        {
          name: 'local_storage_records',
          purpose: 'Browser-local fallback for versioned TRACS records.',
          columns: [
            { name: 'key', type: 'text', constraints: 'localStorage key' },
            { name: 'records_json', type: 'json', constraints: 'bounded to 250 records' },
          ],
        },
      ],
      indexes: ['not applicable in browser-local fallback'],
    }
  }

  async saveRecord<TPayload>({
    kind,
    label,
    status,
    summary,
    payload,
  }: {
    kind: BackendRecordKind
    label: string
    status: StatusLevel
    summary: string
    payload: TPayload
  }): Promise<BackendRecord<TPayload>> {
    const records = readJson<BackendRecord[]>(recordsKey, [])
    const now = new Date().toISOString()
    const record: BackendRecord<TPayload> = {
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
    writeRecords([record, ...records])
    return record
  }

  async saveDeploymentSnapshot({
    config,
    deployment,
    readinessStatus,
  }: {
    config: AppConfig
    deployment: DeploymentState
    readinessStatus: StatusLevel
  }) {
    const payload = {
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

    return this.saveRecord({
      kind: 'deployment_profile',
      label: `${config.environment.environment.name} deployment profile`,
      status: readinessStatus,
      summary: `${deployment.activeIndustries.length} profile(s), ${deployment.activeDomains.length} domain(s) persisted.`,
      payload,
    })
  }

  async runAdapterDryRun(
    connectorId: string,
    connector: AppConfig['connectors']['connectors'][string],
  ): Promise<AdapterDryRunResult> {
    const contract = getAdapterContract(connector.type)
    const fallbackObjects = [connector.workbook, connector.sheet, connector.display_name].filter(
      (value): value is string => Boolean(value),
    )
    const objects =
      connector.objects?.map((object) => object.source) ??
      fallbackObjects
    const targetObjects =
      connector.objects?.map((object) => object.target) ??
      [connector.target].filter((target): target is string => Boolean(target))
    const warnings = contract ? [] : [`No adapter contract registered for ${connector.type}.`]

    return {
      adapterId: contract?.id ?? `${connector.type}_adapter_missing`,
      connectorId,
      status: contract ? 'pass' : 'blocking',
      executedAt: new Date().toISOString(),
      operations: (contract?.operations ?? ['health_check']).map((operation) => ({
        operation,
        status: contract ? 'pass' : 'blocking',
        evidence: contract
          ? `${contract.displayName} can satisfy ${operation} for ${connector.display_name}.`
          : `Missing contract prevents ${operation} execution.`,
      })),
      sampleResponse: {
        sourceObjects: objects.length > 0 ? objects : [connector.display_name],
        targetObjects: targetObjects.length > 0 ? targetObjects : ['not mapped'],
        previewRows: connector.type === 'external_reference' ? 0 : 25,
        warnings,
      },
    }
  }

  async deliverNotificationDryRun(
    payload: NotificationDeliveryPayload,
  ): Promise<NotificationDeliveryResult & { record?: BackendRecord }> {
    const deliveredAt = new Date().toISOString()
    const channelResults = payload.channels.map((channel) => ({
      channel,
      status: 'warning' as StatusLevel,
      mode: 'dry_run' as const,
      target: 'browser-local fallback',
      evidence: `${channel} delivery dry-run prepared in browser-local mode; API delivery adapter was not reachable.`,
    }))
    const result: NotificationDeliveryResult = {
      deliveryId: payload.deliveryId,
      deliveredAt,
      status: 'warning',
      channelResults,
      evidence: `${payload.channels.length} notification delivery dry-run(s) prepared in browser-local fallback mode.`,
    }
    const record = await this.saveRecord({
      kind: 'notification_delivery',
      label: payload.subject,
      status: result.status,
      summary: result.evidence,
      payload: {
        request: payload,
        result,
      },
    })
    return { ...result, record }
  }

  async discoverConnectorMetadata(
    connectorId: string,
    connector: AppConfig['connectors']['connectors'][string],
  ): Promise<ConnectorSourceMetadata> {
    if (connector.type !== 'csv') {
      return {
        connectorId,
        adapterType: connector.type,
        discoveredAt: new Date().toISOString(),
        sourceObjects: connector.objects?.map((object) => object.source) ?? [connector.display_name],
        targetObjects:
          connector.objects?.map((object) => object.target) ??
          [connector.target].filter((target): target is string => Boolean(target)),
        rowCount: 0,
        columns: [],
        evidence: 'Live metadata discovery requires an API-backed adapter for this connector type.',
      }
    }

    const { columns, rows } = await loadCsvFixture()
    return {
      connectorId,
      adapterType: 'csv',
      discoveredAt: new Date().toISOString(),
      sourcePath: '/samples/quality_events_sample.csv',
      sourceObjects: [connector.display_name],
      targetObjects: [connector.target ?? 'not mapped'],
      rowCount: rows.length,
      columns: columns.map((name) => {
        const values = rows.map((row) => row[name] ?? '')
        return {
          name,
          inferredType: inferType(values),
          nonEmptyCount: values.filter((value) => value.length > 0).length,
          sampleValues: Array.from(new Set(values.filter(Boolean))).slice(0, 3),
        }
      }),
      evidence: `${columns.length} column(s) and ${rows.length} row(s) discovered from local CSV fixture.`,
    }
  }

  async previewConnectorRows(
    connectorId: string,
    connector: AppConfig['connectors']['connectors'][string],
    limit = 5,
  ): Promise<ConnectorPreviewResult> {
    if (connector.type !== 'csv') {
      return {
        connectorId,
        adapterType: connector.type,
        previewedAt: new Date().toISOString(),
        columns: [],
        rowCount: 0,
        returnedRows: 0,
        rows: [],
        evidence: 'Live row preview requires an API-backed adapter for this connector type.',
      }
    }

    const { columns, rows } = await loadCsvFixture()
    const boundedLimit = Math.min(Math.max(limit, 1), 100)
    return {
      connectorId,
      adapterType: 'csv',
      previewedAt: new Date().toISOString(),
      sourcePath: '/samples/quality_events_sample.csv',
      columns,
      rowCount: rows.length,
      returnedRows: Math.min(rows.length, boundedLimit),
      rows: rows.slice(0, boundedLimit),
      evidence: `${Math.min(rows.length, boundedLimit)} preview row(s) returned from local CSV fixture.`,
    }
  }

  async validateConnectorCredentials(
    connectorId: string,
    connector: AppConfig['connectors']['connectors'][string],
  ): Promise<CredentialValidationResult> {
    const requiredEnvironment =
      connector.type === 'snowflake'
        ? ['TRACS_SNOWFLAKE_ACCOUNT_URL or TRACS_SNOWFLAKE_ACCOUNT', 'TRACS_SNOWFLAKE_TOKEN']
        : connector.type === 'sharepoint_excel'
          ? ['TRACS_GRAPH_TOKEN']
          : connector.type === 'external_reference' || connector.type === 'rest_api'
            ? ['TRACS_EXTERNAL_API_BASE_URL', 'TRACS_EXTERNAL_API_TOKEN']
            : []
    const status: StatusLevel = requiredEnvironment.length > 0 ? 'warning' : 'pass'
    const result: CredentialValidationResult = {
      connectorId,
      connectorType: connector.type,
      validatedAt: new Date().toISOString(),
      status,
      credentialMode: requiredEnvironment.length > 0 ? 'server_only' : 'not_required',
      requiredEnvironment,
      presentEnvironment: [],
      missingEnvironment: requiredEnvironment,
      rotation: {
        checkedAt: new Date().toISOString(),
        maxAgeDays: requiredEnvironment.length > 0 ? 90 : 0,
        status,
        evidence:
          requiredEnvironment.length > 0
            ? 'Credential validation requires the TRACS API because browser code cannot inspect server token environment variables.'
            : `${connector.type} connector does not require server token rotation evidence.`,
      },
      checks: [
        {
          id: `${connectorId}:credential_presence`,
          label: 'Credential presence',
          status,
          evidence:
            requiredEnvironment.length > 0
              ? 'Credential presence could not be verified from browser-local mode.'
              : `${connector.display_name} does not require server credentials.`,
          remediation:
            requiredEnvironment.length > 0
              ? 'Run the TRACS API and configure server-side token environment variables.'
              : 'No credential presence remediation required.',
        },
        {
          id: `${connectorId}:token_rotation`,
          label: 'Token rotation evidence',
          status,
          evidence:
            requiredEnvironment.length > 0
              ? 'Token rotation evidence is only available through the TRACS API server.'
              : `${connector.type} connector does not require server token rotation evidence.`,
          remediation:
            requiredEnvironment.length > 0
              ? 'Set rotated-at token evidence variables on the server and rerun validation.'
              : 'No rotation remediation required.',
        },
      ],
      evidence:
        requiredEnvironment.length > 0
          ? `${connector.display_name} credential validation is pending API-backed server checks.`
          : `${connector.display_name} credential validation passed; no server token is required.`,
    }
    const record = await this.saveRecord({
      kind: 'credential_validation',
      label: `${connector.display_name} credential validation`,
      status: result.status,
      summary: result.evidence,
      payload: {
        connectorId,
        result,
      },
    })
    return { ...result, record }
  }

  async listConnectorRuns(connectorId: string): Promise<BackendRecord[]> {
    return this.listRecords().then((records) =>
      records.filter(
        (record) =>
          record.kind === 'connector_run' &&
          typeof record.payload === 'object' &&
          record.payload !== null &&
          'connectorId' in record.payload &&
          record.payload.connectorId === connectorId,
      ),
    )
  }

  async saveMappingRun({
    mappingId,
    mapping,
    schema,
    result,
    summary,
  }: {
    mappingId: string
    mapping: MappingManifest
    schema: CsvSchemaInference
    result: MappingValidationResult
    summary: string
  }): Promise<BackendRecord> {
    return this.saveRecord({
      kind: 'mapping_validation',
      label: `${mappingId} validation`,
      status: result.status,
      summary,
      payload: {
        mappingId,
        mapping,
        schema,
        result,
      },
    })
  }

  async listMappingRuns(mappingId: string): Promise<BackendRecord[]> {
    return this.listRecords().then((records) =>
      records.filter(
        (record) =>
          record.kind === 'mapping_validation' &&
          typeof record.payload === 'object' &&
          record.payload !== null &&
          'mappingId' in record.payload &&
          record.payload.mappingId === mappingId,
      ),
    )
  }

  async saveIntegrationContract({
    contract,
    status,
    summary,
  }: {
    contract: unknown
    status: StatusLevel
    summary: string
  }): Promise<BackendRecord> {
    return this.saveRecord({
      kind: 'integration_contract',
      label: 'Integration Contract',
      status,
      summary,
      payload: contract,
    })
  }

  async listIntegrationContracts(): Promise<BackendRecord[]> {
    return this.listRecords().then((records) =>
      records.filter((record) => record.kind === 'integration_contract'),
    )
  }

  async listControlledTemplates(): Promise<BackendRecord<ControlledTemplatePayload>[]> {
    return this.listRecords().then((records) =>
      records.filter((record) => record.kind === 'controlled_template'),
    ) as Promise<BackendRecord<ControlledTemplatePayload>[]>
  }

  async promoteAssetToTemplate({
    asset,
    industries,
    solutions,
    status = 'draft',
  }: {
    asset: LocalAsset
    industries: string[]
    solutions: string[]
    status?: ControlledTemplateStatus
  }): Promise<BackendRecord<ControlledTemplatePayload>> {
    const payload: ControlledTemplatePayload = {
      templateId: `tpl-${asset.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 72)}-${asset.id.slice(0, 8)}`,
      status,
      versionLabel: 'v1',
      promotedAt: new Date().toISOString(),
      source: asset,
      classification: {
        category: asset.category,
        domain: asset.domain,
        kind: asset.kind,
        sourceFamily: asset.sourceFamily,
      },
      tags: {
        industries,
        solutions,
      },
      provenanceNotes: `Promoted from local asset registry path ${asset.relativePath} for controlled TRACS template review.`,
    }

    return this.saveRecord({
      kind: 'controlled_template',
      label: asset.name,
      status: status === 'active' ? 'pass' : 'warning',
      summary: `${asset.category} ${titleForKind(asset.kind)} promoted from ${asset.sourceFamily}.`,
      payload,
    })
  }

  async updateControlledTemplate(
    record: BackendRecord<ControlledTemplatePayload>,
    updates: Partial<ControlledTemplatePayload>,
  ): Promise<BackendRecord<ControlledTemplatePayload>> {
    const nextStatus = updates.status ?? record.payload.status
    return this.saveRecord({
      kind: 'controlled_template',
      label: record.label,
      status: nextStatus === 'active' ? 'pass' : 'warning',
      summary: `${record.payload.classification.category} template updated to ${nextStatus}.`,
      payload: {
        ...record.payload,
        ...updates,
        classification: {
          ...record.payload.classification,
          ...updates.classification,
        },
        tags: {
          ...record.payload.tags,
          ...updates.tags,
        },
      },
    })
  }

  async loadAssetRegistry(): Promise<AssetRegistry> {
    return {
      root: 'API not configured',
      scannedAt: new Date().toISOString(),
      limit: 0,
      assets: [],
      summary: {
        total: 0,
        byKind: {},
        byCategory: {},
        bySourceFamily: {},
      },
    }
  }
}

class ApiBackendClient {
  private baseUrl: string
  private localFallback = new LocalBackendClient()

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<TPayload>(path: string, options?: RequestInit): Promise<TPayload> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`TRACS API ${path} returned ${response.status}`)
    }

    return (await response.json()) as TPayload
  }

  async health(): Promise<BackendHealth> {
    try {
      return await this.request<BackendHealth>('/api/health')
    } catch (error) {
      const fallback = await this.localFallback.health()
      return {
        ...fallback,
        evidence: `API unavailable at ${this.baseUrl}; using browser-local fallback. ${
          error instanceof Error ? error.message : 'Unknown API error'
        }`,
      }
    }
  }

  async listRecords(): Promise<BackendRecord[]> {
    try {
      return await this.request<BackendRecord[]>('/api/records')
    } catch {
      return this.localFallback.listRecords()
    }
  }

  async listQualityEvents(): Promise<QualityEvent[]> {
    try {
      return await this.request<QualityEvent[]>('/api/quality-events')
    } catch {
      return this.localFallback.listQualityEvents()
    }
  }

  async listCanonicalObjects(): Promise<CanonicalObject[]> {
    try {
      return await this.request<CanonicalObject[]>('/api/objects')
    } catch {
      return this.localFallback.listCanonicalObjects()
    }
  }

  async listTraceabilityLinks(): Promise<TraceabilityLink[]> {
    try {
      return await this.request<TraceabilityLink[]>('/api/traceability-links')
    } catch {
      return this.localFallback.listTraceabilityLinks()
    }
  }

  async getObjectTraceability(objectId: string): Promise<TraceabilityResult | null> {
    try {
      return await this.request<TraceabilityResult>(
        `/api/objects/${encodeURIComponent(objectId)}/traceability`,
      )
    } catch {
      return this.localFallback.getObjectTraceability(objectId)
    }
  }

  async listReports(): Promise<ReportCatalogItem[]> {
    try {
      return await this.request<ReportCatalogItem[]>('/api/reports')
    } catch {
      return this.localFallback.listReports()
    }
  }

  async loadCanonicalFromMapping({
    mappingId = 'quality_event',
    sourceConnector = 'manual_csv_quality_events',
    connectorType = 'csv',
    sourceObject = 'quality_events_sample.csv',
    targetObject = 'quality_event',
  }: CanonicalLoadRequest = {}): Promise<CanonicalLoadResult> {
    try {
      return await this.request<CanonicalLoadResult>('/api/canonical-loads', {
        method: 'POST',
        body: JSON.stringify({ mappingId, sourceConnector, connectorType, sourceObject, targetObject }),
      })
    } catch {
      return this.localFallback.loadCanonicalFromMapping({
        mappingId,
        sourceConnector,
        connectorType,
        sourceObject,
        targetObject,
      })
    }
  }

  async loadStorageSchema(): Promise<RecordStoreSchema> {
    try {
      return await this.request<RecordStoreSchema>('/api/storage/schema')
    } catch {
      return this.localFallback.loadStorageSchema()
    }
  }

  async saveRecord<TPayload>({
    kind,
    label,
    status,
    summary,
    payload,
  }: {
    kind: BackendRecordKind
    label: string
    status: StatusLevel
    summary: string
    payload: TPayload
  }): Promise<BackendRecord<TPayload>> {
    try {
      return await this.request<BackendRecord<TPayload>>('/api/records', {
        method: 'POST',
        body: JSON.stringify({ kind, label, status, summary, payload }),
      })
    } catch {
      return this.localFallback.saveRecord({ kind, label, status, summary, payload })
    }
  }

  async deliverNotificationDryRun(
    payload: NotificationDeliveryPayload,
  ): Promise<NotificationDeliveryResult & { record?: BackendRecord }> {
    try {
      return await this.request<NotificationDeliveryResult & { record?: BackendRecord }>(
        '/api/notifications/delivery-dry-run',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      )
    } catch {
      return this.localFallback.deliverNotificationDryRun(payload)
    }
  }

  async saveDeploymentSnapshot({
    config,
    deployment,
    readinessStatus,
  }: {
    config: AppConfig
    deployment: DeploymentState
    readinessStatus: StatusLevel
  }) {
    try {
      return await this.request<BackendRecord>('/api/deployment-snapshots', {
        method: 'POST',
        body: JSON.stringify({ config, deployment, readinessStatus }),
      })
    } catch {
      return this.localFallback.saveDeploymentSnapshot({ config, deployment, readinessStatus })
    }
  }

  async runAdapterDryRun(
    connectorId: string,
    connector: AppConfig['connectors']['connectors'][string],
  ): Promise<AdapterDryRunResult> {
    try {
      return await this.request<AdapterDryRunResult>('/api/adapter-dry-runs', {
        method: 'POST',
        body: JSON.stringify({ connectorId, connector }),
      })
    } catch {
      return this.localFallback.runAdapterDryRun(connectorId, connector)
    }
  }

  async discoverConnectorMetadata(
    connectorId: string,
    connector: AppConfig['connectors']['connectors'][string],
  ): Promise<ConnectorSourceMetadata> {
    try {
      return await this.request<ConnectorSourceMetadata>(
        `/api/connectors/${encodeURIComponent(connectorId)}/metadata`,
        {
          method: 'POST',
          body: JSON.stringify({ connector }),
        },
      )
    } catch {
      return this.localFallback.discoverConnectorMetadata(connectorId, connector)
    }
  }

  async previewConnectorRows(
    connectorId: string,
    connector: AppConfig['connectors']['connectors'][string],
    limit = 5,
  ): Promise<ConnectorPreviewResult> {
    try {
      return await this.request<ConnectorPreviewResult>(
        `/api/connectors/${encodeURIComponent(connectorId)}/preview`,
        {
          method: 'POST',
          body: JSON.stringify({ connector, limit }),
        },
      )
    } catch {
      return this.localFallback.previewConnectorRows(connectorId, connector, limit)
    }
  }

  async validateConnectorCredentials(
    connectorId: string,
    connector: AppConfig['connectors']['connectors'][string],
  ): Promise<CredentialValidationResult> {
    try {
      return await this.request<CredentialValidationResult>(
        `/api/connectors/${encodeURIComponent(connectorId)}/credential-validation`,
        {
          method: 'POST',
          body: JSON.stringify({ connector }),
        },
      )
    } catch {
      return this.localFallback.validateConnectorCredentials(connectorId, connector)
    }
  }

  async listConnectorRuns(connectorId: string): Promise<BackendRecord[]> {
    try {
      return await this.request<BackendRecord[]>(
        `/api/connectors/${encodeURIComponent(connectorId)}/runs`,
      )
    } catch {
      return this.localFallback.listConnectorRuns(connectorId)
    }
  }

  async saveMappingRun({
    mappingId,
    mapping,
    schema,
    result,
    summary,
  }: {
    mappingId: string
    mapping: MappingManifest
    schema: CsvSchemaInference
    result: MappingValidationResult
    summary: string
  }): Promise<BackendRecord> {
    try {
      return await this.request<BackendRecord>(
        `/api/mappings/${encodeURIComponent(mappingId)}/runs`,
        {
          method: 'POST',
          body: JSON.stringify({ mapping, schema, result, summary }),
        },
      )
    } catch {
      return this.localFallback.saveMappingRun({ mappingId, mapping, schema, result, summary })
    }
  }

  async listMappingRuns(mappingId: string): Promise<BackendRecord[]> {
    try {
      return await this.request<BackendRecord[]>(
        `/api/mappings/${encodeURIComponent(mappingId)}/runs`,
      )
    } catch {
      return this.localFallback.listMappingRuns(mappingId)
    }
  }

  async saveIntegrationContract({
    contract,
    status,
    summary,
  }: {
    contract: unknown
    status: StatusLevel
    summary: string
  }): Promise<BackendRecord> {
    try {
      return await this.request<BackendRecord>('/api/integration-contracts', {
        method: 'POST',
        body: JSON.stringify({
          label: 'Integration Contract',
          status,
          summary,
          contract,
        }),
      })
    } catch {
      return this.localFallback.saveIntegrationContract({ contract, status, summary })
    }
  }

  async listIntegrationContracts(): Promise<BackendRecord[]> {
    try {
      return await this.request<BackendRecord[]>('/api/integration-contracts')
    } catch {
      return this.localFallback.listIntegrationContracts()
    }
  }

  async listControlledTemplates(): Promise<BackendRecord<ControlledTemplatePayload>[]> {
    try {
      return await this.request<BackendRecord<ControlledTemplatePayload>[]>('/api/templates')
    } catch {
      return this.localFallback.listControlledTemplates()
    }
  }

  async promoteAssetToTemplate({
    asset,
    industries,
    solutions,
    status = 'draft',
  }: {
    asset: LocalAsset
    industries: string[]
    solutions: string[]
    status?: ControlledTemplateStatus
  }): Promise<BackendRecord<ControlledTemplatePayload>> {
    try {
      return await this.request<BackendRecord<ControlledTemplatePayload>>('/api/templates/promote', {
        method: 'POST',
        body: JSON.stringify({ asset, industries, solutions, status }),
      })
    } catch {
      return this.localFallback.promoteAssetToTemplate({ asset, industries, solutions, status })
    }
  }

  async updateControlledTemplate(
    record: BackendRecord<ControlledTemplatePayload>,
    updates: Partial<ControlledTemplatePayload>,
  ): Promise<BackendRecord<ControlledTemplatePayload>> {
    try {
      return await this.request<BackendRecord<ControlledTemplatePayload>>(
        `/api/templates/${encodeURIComponent(record.id)}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        },
      )
    } catch {
      return this.localFallback.updateControlledTemplate(record, updates)
    }
  }

  async loadAssetRegistry(): Promise<AssetRegistry> {
    try {
      return await this.request<AssetRegistry>('/api/assets/registry')
    } catch {
      return this.localFallback.loadAssetRegistry()
    }
  }
}

const apiBaseUrl = import.meta.env.VITE_TRACS_API_URL?.replace(/\/$/, '')

export const backendClient = apiBaseUrl
  ? new ApiBackendClient(apiBaseUrl)
  : new LocalBackendClient()
