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
  metadata_path?: string
  preview_path?: string
  source_object?: string
  key_fields?: string[]
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
  traceability_links?: Array<{
    relationship_type: string
    source_field: string
    target_field: string
    required?: boolean
  }>
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
  | 'external_reference_load_disposition'
  | 'readiness_evidence_packet'
  | 'report_catalog_item'
  | 'extraction_job'
  | 'extraction_run'
  | 'credential_validation'
  | 'notification_delivery'
  | 'notification_live_channel_approval'
  | 'notification_approval_renewal'
  | 'notification_approval_renewal_closure'
  | 'notification_closure_export_package'
  | 'traceability_export_review'
  | 'traceability_delivery_response'
  | 'traceability_response_closure_route'
  | 'postgres_import_reconciliation'
  | 'postgres_cutover_approval'
  | 'postgres_cutover_checklist_package'
  | 'postgres_cutover_acknowledgement'

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
  | 'external_reference_load_disposition'
  | 'readiness_evidence_packet'
  | 'extraction_job'
  | 'extraction_run'
  | 'credential_validation'
  | 'notification_delivery'
  | 'notification_live_channel_approval'
  | 'notification_approval_renewal'
  | 'notification_approval_renewal_closure'
  | 'notification_closure_export_package'
  | 'traceability_export_review'
  | 'traceability_delivery_response'
  | 'traceability_response_closure_route'
  | 'postgres_import_reconciliation'
  | 'postgres_cutover_approval'
  | 'postgres_cutover_checklist_package'
  | 'postgres_cutover_acknowledgement'

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
    databaseFile?: string
    maxRecords?: number
    poolMax?: number
    ssl?: string
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

export type PostgresMigrationChecklist = {
  adapter: string
  targetUse?: string
  requiredEnvironment?: Array<{
    name: string
    value: string
    purpose: string
  }>
  optionalEnvironment?: Array<{
    name: string
    value: string
    purpose: string
  }>
  gates?: string[]
  rollback?: string[]
  status?: string
  evidence?: string
}

export type PostgresImportReconciliation = {
  reconciliationId: string
  generatedAt: string
  source: 'json' | 'sqlite' | string
  sourceFile: string
  mode: 'dry_run' | 'apply'
  status: StatusLevel
  read: number
  valid: number
  invalid: number
  duplicateIds: number
  duplicateVersions: number
  importable: number
  imported: number
  skipped: number
  recordKindCounts: Record<string, number>
  invalidRecords: Array<{
    id: string
    label: string
    missing: string[]
  }>
  evidence: string
}

export type PostgresCutoverApprovalStatus = 'draft' | 'approved' | 'approved_with_conditions' | 'rejected'

export type PostgresCutoverGate = {
  id: string
  label: string
  status: StatusLevel
  evidence: string
}

export type PostgresCutoverApproval = {
  approvalId: string
  signedAt: string
  reviewer: string
  status: PostgresCutoverApprovalStatus
  targetStoreMode: string
  sourceStoreMode: 'json' | 'sqlite' | 'mixed' | 'unknown'
  plannedCutoverAt: string
  rollbackWindow: string
  rationale: string
  conditions: string
  gates: PostgresCutoverGate[]
  latestReconciliation?: PostgresImportReconciliation
  checklistGates: string[]
  rollbackPlan: string[]
  auditHistory: Array<{
    action: 'cutover_gate_review'
    actor: string
    timestamp: string
    status: PostgresCutoverApprovalStatus
    summary: string
  }>
  evidence: string
}

export type PostgresCutoverChecklistPackage = {
  packageId: string
  generatedAt: string
  reviewerAudience: string[]
  status: StatusLevel
  backendHealth: BackendHealth | null
  storageSchema: RecordStoreSchema | null
  migrationChecklist: PostgresMigrationChecklist | null
  gateReview: {
    status: StatusLevel
    gates: PostgresCutoverGate[]
  }
  latestReconciliation?: PostgresImportReconciliation
  latestApproval?: PostgresCutoverApproval
  reconciliationTotals: {
    runs: number
    read: number
    importable: number
    imported: number
    skipped: number
    invalid: number
  }
  recordKindCounts: Record<string, number>
  requiredActions: string[]
  rollbackPlan: string[]
  evidence: string
}

export type PostgresCutoverAcknowledgementStatus =
  | 'acknowledged'
  | 'acknowledged_with_actions'
  | 'rejected'
  | 'deferred'

export type PostgresCutoverAcknowledgement = {
  acknowledgementId: string
  acknowledgedAt: string
  reviewer: string
  reviewerRole: 'infrastructure_owner' | 'database_administrator' | 'security_reviewer' | 'platform_owner'
  status: PostgresCutoverAcknowledgementStatus
  packageRecordId?: string
  packageId?: string
  packageVersion?: number
  gateStatus: StatusLevel
  requiredActions: string[]
  dueAt: string
  acknowledgementNotes: string
  productionReadiness: 'ready' | 'ready_with_conditions' | 'not_ready'
  rollbackConfirmed: boolean
  backupConfirmed: boolean
  auditHistory: Array<{
    action: 'infrastructure_acknowledgement_recorded'
    actor: string
    timestamp: string
    status: PostgresCutoverAcknowledgementStatus
    summary: string
  }>
  evidence: string
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
  credentialMode?: string
  requiredEnvironment?: string[]
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

export type CredentialValidationResult = {
  connectorId: string
  connectorType: string
  validatedAt: string
  status: StatusLevel
  credentialMode: string
  requiredEnvironment: string[]
  presentEnvironment: string[]
  missingEnvironment: string[]
  rotation: {
    checkedAt: string
    rotatedAt?: string
    maxAgeDays: number
    ageDays?: number
    status: StatusLevel
    evidence: string
  }
  checks: ReadinessCheck[]
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

export type TraceabilityGraphExportPackage = {
  packageId: string
  generatedAt: string
  source: 'traceability_workspace'
  selectedEvent?: QualityEvent
  filters: {
    family: string
    status: StatusLevel | 'all'
    evidencePacket: string
  }
  graph: {
    nodes: Array<{
      id: string
      label: string
      family: string
      type: string
      status: string
    }>
    edges: TraceabilityLink[]
    relationshipSummary: Record<string, number>
  }
  evidencePackets: Array<BackendRecord<ReadinessEvidencePacket>>
  coverage: {
    canonicalObjects: number
    filteredLinks: number
    availableLinks: number
    evidencePackets: number
    selectedEvidencePacket?: string
  }
  evidence: string
}

export type TraceabilityExportReviewStatus =
  | 'draft'
  | 'approved'
  | 'approved_with_conditions'
  | 'rejected'

export type TraceabilityExportRetentionClass =
  | 'standard_7_year'
  | 'project_lifetime'
  | 'legal_hold'

export type TraceabilityExportReview = {
  reviewId: string
  packageId: string
  signedAt: string
  reviewer: string
  status: TraceabilityExportReviewStatus
  rationale: string
  retention: {
    class: TraceabilityExportRetentionClass
    retainUntil: string
    evidence: string
  }
  package: TraceabilityGraphExportPackage
  auditHistory: Array<{
    action: 'signed_export_review'
    actor: string
    timestamp: string
    status: TraceabilityExportReviewStatus
    summary: string
  }>
  evidence: string
}

export type TraceabilityDeliveryResponseStatus =
  | 'acknowledged'
  | 'approved'
  | 'changes_requested'
  | 'rejected'

export type TraceabilityDeliveryResponse = {
  responseId: string
  deliveryRecordId: string
  deliverySubject: string
  packageId?: string
  selectedEventId?: string
  respondedAt: string
  reviewer: string
  status: TraceabilityDeliveryResponseStatus
  routeStage: 'reviewer_acknowledgement' | 'quality_follow_up' | 'closed'
  responseNotes: string
  requestedActions: string[]
  channelSummary: string
  auditHistory: Array<{
    action: 'delivery_response_recorded'
    actor: string
    timestamp: string
    status: TraceabilityDeliveryResponseStatus
    routeStage: string
    summary: string
  }>
  evidence: string
}

export type TraceabilityResponseClosureRouteStage =
  | 'quality_follow_up'
  | 'closure_review'
  | 'closed'
  | 'escalated'

export type TraceabilityResponseClosureRouteStatus =
  | 'follow_up_open'
  | 'closure_ready'
  | 'closed'
  | 'escalated'

export type TraceabilityResponseClosureRoute = {
  routeId: string
  routedAt: string
  responseRecordId: string
  responseId: string
  deliveryRecordId: string
  deliverySubject: string
  packageId?: string
  selectedEventId?: string
  reviewer: string
  status: TraceabilityResponseClosureRouteStatus
  routeStage: TraceabilityResponseClosureRouteStage
  routedReviewers: string[]
  dueAt: string
  closureNotes: string
  requestedActions: string[]
  sourceResponseStatus: TraceabilityDeliveryResponseStatus
  channelSummary: string
  notificationHistory: Array<{
    notificationId: string
    routedAt: string
    channels: Array<'email' | 'teams' | 'sharepoint_folder'>
    recipients: string[]
    summary: string
    evidence: string
  }>
  auditHistory: Array<{
    action: 'closure_route_saved' | 'closure_follow_up_notified'
    actor: string
    timestamp: string
    status: TraceabilityResponseClosureRouteStatus
    routeStage: TraceabilityResponseClosureRouteStage
    summary: string
  }>
  evidence: string
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
  publishStatus?: 'draft' | 'blocked' | 'published'
  publishGateEvidence?: string
  publishedAt?: string
  approvalStatus?: 'pending' | 'approved' | 'approved_with_conditions' | 'rejected'
  approvalReviewer?: string
  approvalRationale?: string
  approvalSignedAt?: string
  reviewerRouteStage?: 'owner_review' | 'quality_review' | 'executive_signoff' | 'published'
  routedReviewers?: string[]
  routeDueAt?: string
  notificationHistory?: Array<{
    notificationId: string
    sentAt: string
    routeStage: 'owner_review' | 'quality_review' | 'executive_signoff' | 'published'
    recipients: string[]
    summary: string
    evidence: string
  }>
  approvalHistory?: Array<{
    status: 'pending' | 'approved' | 'approved_with_conditions' | 'rejected'
    reviewer: string
    rationale: string
    signedAt: string
    publishStatus?: 'draft' | 'blocked' | 'published'
    evidence: string
  }>
}

export type CanonicalLoadResult = {
  loadId: string
  loadedAt: string
  sourceConnector: string
  connectorType: string
  sourceObject: string
  targetObject: string
  mappingId: string
  executionMode?: 'connector_profile' | 'approved_external_reference'
  objectCount: number
  linkCount: number
  qualityEventCount: number
  evidence: string
  warnings: string[]
  record?: BackendRecord
}

export type CanonicalLoadRequest = {
  mappingId?: string
  sourceConnector?: string
  connectorType?: string
  sourceObject?: string
  targetObject?: string
  mappingFields?: Record<string, string>
  primaryKey?: {
    targetField: string
    sourceField: string
  }
  sourceRows?: Array<Record<string, unknown>>
  traceabilityLinks?: MappingManifest['traceability_links']
}

export type ExternalReferenceLoadExceptionDispositionStatus =
  | 'accepted'
  | 'retry_planned'
  | 'replayed'
  | 'waived'
  | 'blocked'

export type ExternalReferenceLoadExceptionDisposition = {
  dispositionId: string
  createdAt: string
  mappingId: string
  sourceConnector: string
  sourceObject: string
  targetObject: string
  latestLoadRecordId?: string
  latestLoadId?: string
  replayedLoadId?: string
  status: ExternalReferenceLoadExceptionDispositionStatus
  owner: string
  dueAt: string
  rationale: string
  exceptionSummary: string
  replayMode: 'manual_replay' | 'hold_until_source_ready' | 'waive_no_replay'
  replayedAt?: string
  warnings: string[]
  auditHistory: Array<{
    action: 'disposition_recorded' | 'replay_requested' | 'replay_completed'
    actor: string
    timestamp: string
    status: ExternalReferenceLoadExceptionDispositionStatus
    summary: string
  }>
  evidence: string
}

export type ExtractionJobPayload = {
  jobId: string
  name: string
  status: 'draft' | 'active' | 'paused'
  scheduleMode: 'manual' | 'scheduled_stub' | 'disabled'
  scheduleCadence: 'on_demand' | 'hourly' | 'daily' | 'weekly'
  nextRunAt: string
  retryPolicy: {
    maxRetries: number
    retryDelayMinutes: number
    retryOnWarnings: boolean
  }
  mappingId: string
  connectorId: string
  connectorType: string
  sourceObject: string
  targetObject: string
  createdAt: string
  updatedAt: string
  evidence: string
}

export type ExtractionRunPayload = {
  runId: string
  jobId: string
  startedAt: string
  finishedAt: string
  status: StatusLevel
  request: CanonicalLoadRequest
  result: CanonicalLoadResult
  attempt: number
  maxRetries: number
  retryDelayMinutes: number
  retryEligible: boolean
  evidence: string
  warnings: string[]
}

export type ReadinessEvidenceException = {
  id: string
  area: string
  status: StatusLevel
  summary: string
  evidence: string
  remediation: string
  source: string
}

export type ReadinessEvidenceApprovalStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'approved_with_exceptions'
  | 'rejected'

export type ReadinessEvidenceExceptionDispositionStatus =
  | 'open'
  | 'accepted_risk'
  | 'remediation_planned'
  | 'resolved'
  | 'deferred'

export type ReadinessEvidenceExceptionDisposition = {
  exceptionId: string
  status: ReadinessEvidenceExceptionDispositionStatus
  owner: string
  dueDate: string
  rationale: string
  updatedAt: string
}

export type ReadinessEvidenceApproval = {
  status: ReadinessEvidenceApprovalStatus
  reviewer: string
  routeStage?: 'quality_review' | 'operations_review' | 'executive_signoff' | 'closed'
  routedReviewers?: string[]
  routeDueAt?: string
  reviewedAt?: string
  nextReviewAt: string
  rationale: string
  dispositions: ReadinessEvidenceExceptionDisposition[]
  auditHistory?: Array<{
    action: 'routed' | 'submitted' | 'approved' | 'approved_with_exceptions' | 'rejected' | 'updated'
    actor: string
    routeStage: string
    status: ReadinessEvidenceApprovalStatus
    timestamp: string
    summary: string
  }>
}

export type ReadinessEvidencePacket = {
  packetId: string
  generatedAt: string
  environment: string
  status: StatusLevel
  summary: {
    readiness: Record<StatusLevel, number>
    canonicalLoads: number
    reportCatalogItems: number
    openExceptions: number
  }
  canonicalLoads: Array<BackendRecord<CanonicalLoadResult>>
  reportFreshness: {
    total: number
    pass: number
    warning: number
    blocking: number
    items: ReportCatalogItem[]
  }
  openExceptions: ReadinessEvidenceException[]
  approval: ReadinessEvidenceApproval
  evidence: string
}

export type NotificationDeliveryPayload = {
  deliveryId: string
  generatedAt: string
  source:
    | 'report_catalog'
    | 'readiness_evidence'
    | 'traceability_export'
    | 'traceability_response_closure'
    | 'notification_approval_renewal'
  channels: Array<'email' | 'teams' | 'sharepoint_folder'>
  recipients: string[]
  subject: string
  summary: string
  evidence: unknown
}

export type NotificationLiveChannelApprovalStatus = 'draft' | 'approved' | 'rejected'

export type NotificationLiveChannelApproval = {
  approvalId: string
  approvedAt: string
  reviewer: string
  status: NotificationLiveChannelApprovalStatus
  approvedChannels: Array<'email' | 'teams' | 'sharepoint_folder'>
  rationale: string
  requiredEvidence: string[]
  expiresAt: string
  auditHistory: Array<{
    action: 'live_channel_signoff'
    actor: string
    timestamp: string
    status: NotificationLiveChannelApprovalStatus
    summary: string
  }>
  evidence: string
}

export type NotificationApprovalRenewalRoute = {
  routeId: string
  routedAt: string
  approvalId?: string
  approvalExpiresAt?: string
  daysUntilExpiry: number | null
  expiryStatus: StatusLevel
  routeStage: 'renewal_review' | 'owner_follow_up' | 'security_review' | 'closed'
  routedReviewers: string[]
  dueAt: string
  reminderAt: string
  channels: Array<'email' | 'teams' | 'sharepoint_folder'>
  rationale: string
  requiredEvidence: string[]
  auditHistory: Array<{
    action: 'renewal_routed' | 'reminder_sent' | 'renewal_closed'
    actor: string
    timestamp: string
    routeStage: string
    summary: string
  }>
  evidence: string
}

export type NotificationApprovalRenewalClosureStatus =
  | 'closed'
  | 'closed_with_conditions'
  | 'rejected'

export type NotificationApprovalRenewalClosure = {
  closureId: string
  closedAt: string
  reviewer: string
  status: NotificationApprovalRenewalClosureStatus
  renewalRouteId?: string
  renewalRouteStage?: NotificationApprovalRenewalRoute['routeStage']
  renewedApprovalId?: string
  renewedApprovalExpiresAt?: string
  supersededApprovalId?: string
  supersededApprovalExpiresAt?: string
  approvedChannels: Array<'email' | 'teams' | 'sharepoint_folder'>
  closureNotes: string
  supersededEvidence: string[]
  requiredEvidence: string[]
  auditHistory: Array<{
    action: 'renewal_closed'
    actor: string
    timestamp: string
    status: NotificationApprovalRenewalClosureStatus
    summary: string
  }>
  evidence: string
}

export type NotificationClosureExportPackage = {
  packageId: string
  generatedAt: string
  messagingOwners: string[]
  status: StatusLevel
  latestClosure?: NotificationApprovalRenewalClosure
  latestRenewalRoute?: NotificationApprovalRenewalRoute
  latestApproval?: NotificationLiveChannelApproval
  supersededApproval?: NotificationLiveChannelApproval
  deliveryEvidence: Array<BackendRecord<{
    request: NotificationDeliveryPayload
    result: NotificationDeliveryResult
  }>>
  channelSummary: Array<{
    channel: 'email' | 'teams' | 'sharepoint_folder'
    mode: 'dry_run' | 'live' | 'skipped'
    status: StatusLevel
    evidence: string
  }>
  requiredActions: string[]
  ownerNotes: string
  evidence: string
}

export type NotificationDeliveryResult = {
  deliveryId: string
  deliveredAt: string
  status: StatusLevel
  channelResults: Array<{
    channel: 'email' | 'teams' | 'sharepoint_folder'
    status: StatusLevel
    mode: 'dry_run' | 'live' | 'skipped'
    target: string
    evidence: string
  }>
  evidence: string
}

export type NotificationSmokeFixtureResult = {
  smokeId: string
  status: StatusLevel
  fixtures: NotificationDeliveryPayload[]
  results: Array<{
    fixture: NotificationDeliveryPayload
    result: NotificationDeliveryResult
  }>
  records?: BackendRecord[]
  evidence: string
}
