export type StatusLevel = 'pass' | 'warning' | 'blocking'

export type EnvironmentConfig = {
  environment: {
    name: string
    display_name: string
    auth_provider: string
    audit_mode: string
    default_timezone: string
  }
  deployment_profile: {
    industries: string[]
    solution_domains: string[]
  }
  warehouse: {
    preferred_platform: string
    canonical_database: string
    canonical_schema: string
  }
  features: Record<string, boolean>
}

export type IndustryProfile = {
  display_name: string
  enabled_domains: string[]
  terminology: Record<string, string>
}

export type SolutionDomain = {
  display_name: string
  modules: string[]
}

export type ObjectFamily = {
  objects: string[]
}

export type ConnectorObject = {
  source: string
  target: string
}

export type ConnectorDefinition = {
  type: string
  display_name: string
  refresh_mode?: string
  refresh_cron?: string
  database?: string
  schema?: string
  role?: string
  site_url?: string
  library?: string
  workbook?: string
  sheet?: string
  target?: string
  integration_mode?: string
  objects?: ConnectorObject[]
}

export type ConnectorManifest = {
  connectors: Record<string, ConnectorDefinition>
}

export type ReadinessRule = {
  id: string
  severity: StatusLevel
  description: string
  threshold?: number
  max_age_hours?: number
}

export type AppConfig = {
  environment: EnvironmentConfig
  industries: Record<string, IndustryProfile>
  solutionDomains: Record<string, SolutionDomain>
  objectFamilies: Record<string, ObjectFamily>
  connectors: ConnectorManifest
  mappings: Record<string, MappingManifest>
  readinessRules: ReadinessRule[]
}

export type DeploymentState = {
  activeIndustries: string[]
  activeDomains: string[]
}

export type ReadinessCheck = {
  id: string
  label: string
  status: StatusLevel
  evidence: string
  remediation: string
}

export type AuditEvent = {
  id: string
  timestamp: string
  actor: string
  area: string
  action: string
  summary: string
}

export type ConnectorTestResult = {
  connectorId: string
  status: StatusLevel
  testedAt: string
  checks: ReadinessCheck[]
  metadata: {
    sourceType: string
    displayName: string
    sourceObjects: number
    targetObjects: string[]
    refreshMode: string
    connectionMode: string
  }
}

export type MappingManifest = {
  object: string
  source_connector: string
  source_object: string
  primary_key: {
    target_field: string
    source_field: string
  }
  fields: Record<string, string>
  required: string[]
  transforms?: Record<string, unknown>
}

export type CsvColumnProfile = {
  name: string
  nonEmptyCount: number
  sampleValues: string[]
  inferredType: 'date' | 'number' | 'text' | 'empty'
}

export type CsvSchemaInference = {
  rowCount: number
  columns: CsvColumnProfile[]
}

export type MappingValidationResult = {
  status: StatusLevel
  checks: ReadinessCheck[]
  mappedFields: Array<{
    targetField: string
    sourceField: string
    present: boolean
    required: boolean
  }>
}

export type SavedVersionKind =
  | 'connector_test'
  | 'mapping_validation'
  | 'mapping_version'
  | 'integration_contract'
  | 'backend_snapshot'
  | 'adapter_dry_run'
  | 'controlled_template'
  | 'canonical_object'
  | 'canonical_load'

export type SavedVersion = {
  id: string
  kind: SavedVersionKind
  label: string
  status: StatusLevel
  createdAt: string
  summary: string
  payload: unknown
}

export type BackendRecordKind =
  | 'deployment_profile'
  | 'connector_run'
  | 'connector_result'
  | 'mapping_validation'
  | 'integration_contract'
  | 'adapter_contract'
  | 'controlled_template'
  | 'canonical_object'
  | 'traceability_link'
  | 'report_catalog_item'
  | 'canonical_load'

export type BackendRecord<TPayload = unknown> = {
  id: string
  kind: BackendRecordKind
  version: number
  status: StatusLevel
  createdAt: string
  updatedAt: string
  label: string
  summary: string
  payload: TPayload
}

export type BackendHealth = {
  mode: 'browser_local' | 'api'
  status: StatusLevel
  checkedAt: string
  endpoint: string
  latencyMs: number
  records: number
  evidence: string
  store?: {
    mode: string
    schemaVersion: string
    dataFile?: string
    maxRecords?: number
  }
}

export type RecordStoreSchema = {
  schemaVersion: string
  tables: Array<{
    name: string
    purpose: string
    columns: Array<{
      name: string
      type: string
      constraints: string
    }>
  }>
  indexes: string[]
}

export type AdapterOperation = 'health_check' | 'discover_metadata' | 'preview_rows' | 'validate_mapping'

export type AdapterContract = {
  id: string
  connectorType: string
  displayName: string
  operations: AdapterOperation[]
  authMode: string
  requestShape: Record<string, string>
  responseShape: Record<string, string>
  evidenceRequired: string[]
}

export type AdapterDryRunResult = {
  adapterId: string
  connectorId: string
  status: StatusLevel
  executedAt: string
  operations: Array<{
    operation: AdapterOperation
    status: StatusLevel
    evidence: string
  }>
  sampleResponse: {
    sourceObjects: string[]
    targetObjects: string[]
    previewRows: number
    warnings: string[]
  }
}

export type ConnectorSourceMetadata = {
  connectorId: string
  adapterType: string
  discoveredAt: string
  sourcePath?: string
  sourceObjects: string[]
  targetObjects: string[]
  rowCount: number
  columns: CsvColumnProfile[]
  evidence: string
  record?: BackendRecord
}

export type ConnectorPreviewResult = {
  connectorId: string
  adapterType: string
  previewedAt: string
  sourcePath?: string
  columns: string[]
  rowCount: number
  returnedRows: number
  rows: Record<string, string>[]
  evidence: string
  record?: BackendRecord
}

export type LocalAsset = {
  id: string
  name: string
  kind: 'template' | 'database_schema' | 'data_template' | 'manifest' | 'reference'
  category: string
  domain: string
  sourceFamily: string
  extension: string
  relativePath: string
  absolutePath: string
  sizeBytes: number
  lastModified: string
  fingerprint: string
}

export type AssetRegistry = {
  root: string
  scannedAt: string
  limit: number
  assets: LocalAsset[]
  summary: {
    total: number
    byKind: Record<string, number>
    byCategory: Record<string, number>
    bySourceFamily: Record<string, number>
  }
}

export type ControlledTemplateStatus = 'candidate' | 'draft' | 'active' | 'retired'

export type ControlledTemplatePayload = {
  templateId: string
  status: ControlledTemplateStatus
  versionLabel: string
  promotedAt: string
  source: LocalAsset
  classification: {
    category: string
    domain: string
    kind: LocalAsset['kind']
    sourceFamily: string
  }
  tags: {
    industries: string[]
    solutions: string[]
  }
  provenanceNotes: string
}

export type CanonicalObject = {
  id: string
  objectType: string
  family: string
  displayName: string
  status: string
  sourceConnector: string
  sourceSystem: string
  sourceObject: string
  sourceId: string
  createdAt: string
  updatedAt: string
  canonical: Record<string, string>
  raw: Record<string, string>
}

export type QualityEvent = CanonicalObject & {
  objectType: 'quality_event'
  canonical: {
    event_id: string
    event_date: string
    event_type: string
    source_system: string
    product_code: string
    product_name: string
    lot_number: string
    serial_number: string
    severity: string
    narrative: string
    status: string
    owner: string
    capa_reference_id: string
  }
}

export type TraceabilityLink = {
  id: string
  sourceObjectId: string
  sourceObjectType: string
  targetObjectId: string
  targetObjectType: string
  targetLabel: string
  relationshipType: string
  status: StatusLevel
  evidence: string
}

export type TraceabilityResult = {
  object: CanonicalObject
  links: TraceabilityLink[]
}

export type ReportCatalogItem = {
  id: string
  title: string
  platform: string
  workspace: string
  owner: string
  semanticModel: string
  refreshStatus: StatusLevel
  lastRefresh: string
  maxAgeHours: number
  freshnessEvidence: string
  url: string
  sourceDependencies: string[]
  domains: string[]
}

export type CanonicalLoadResult = {
  loadId: string
  loadedAt: string
  sourceConnector: string
  sourceObject: string
  mappingId: string
  objectCount: number
  linkCount: number
  qualityEventCount: number
  evidence: string
  record?: BackendRecord
}
