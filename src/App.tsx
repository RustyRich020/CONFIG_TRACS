import {
  Activity,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Download,
  ExternalLink,
  Factory,
  FileCog,
  Gauge,
  GitBranch,
  History,
  Layers3,
  Package,
  PanelTop,
  PlugZap,
  Route,
  Search,
  ScrollText,
  ServerCog,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  TriangleAlert,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { adapterContracts } from './backendContracts'
import { backendClient } from './backendClient'
import { loadAppConfig } from './configLoader'
import {
  createAuditEvent,
  createIntegrationContract,
  downloadJson,
  evaluateReadiness,
  getDomainFamilies,
  getFamilyStatus,
  inferCsvSchema,
  validateMappingAgainstSchema,
  summarizeReadiness,
  testAllConnectors,
  testConnector,
} from './foundation'
import { createSavedVersion, loadSavedVersions, persistSavedVersions } from './persistence'
import type {
  AppConfig,
  AdapterDryRunResult,
  AdapterContract,
  AssetRegistry,
  AuditEvent,
  BackendHealth,
  BackendRecord,
  CanonicalLoadResult,
  CanonicalObject,
  ControlledTemplatePayload,
  ControlledTemplateStatus,
  LocalAsset,
  ConnectorPreviewResult,
  ConnectorSourceMetadata,
  ConnectorTestResult,
  CredentialValidationResult,
  CsvSchemaInference,
  DeploymentState,
  ExtractionJobPayload,
  ExtractionRunPayload,
  MappingValidationResult,
  QualityEvent,
  ReportCatalogItem,
  ReadinessCheck,
  ReadinessEvidenceApproval,
  ReadinessEvidenceApprovalStatus,
  ReadinessEvidenceException,
  ReadinessEvidenceExceptionDisposition,
  ReadinessEvidenceExceptionDispositionStatus,
  ReadinessEvidencePacket,
  RecordStoreSchema,
  SavedVersion,
  StatusLevel,
  TraceabilityLink,
} from './types'

const navItems = [
  { label: 'Overview', icon: Activity },
  { label: 'Profiles', icon: Factory },
  { label: 'Domains', icon: Layers3 },
  { label: 'Connectors', icon: Database },
  { label: 'Templates', icon: PanelTop },
  { label: 'Mapping', icon: GitBranch },
  { label: 'Quality Events', icon: ShieldCheck },
  { label: 'Object Explorer', icon: Boxes },
  { label: 'Traceability', icon: Route },
  { label: 'Reports', icon: Gauge },
  { label: 'Evidence', icon: ClipboardCheck },
  { label: 'Versions', icon: History },
  { label: 'Backend', icon: ServerCog },
  { label: 'Readiness', icon: SlidersHorizontal },
  { label: 'Audit', icon: ScrollText },
  { label: 'Contract', icon: FileCog },
]

const preferredDomainOrder = [
  'erp',
  'scm',
  'mes',
  'quality',
  'qms',
  'reporting_bi',
  'traceability',
  'shop_floor',
  'pcs',
  'engineering',
  'plm',
  'app',
  'spc_sqc',
  'gage_management',
  'quoting_costing',
]

const domainDisplayNames: Record<string, string> = {
  erp: 'ERP',
  scm: 'SCM',
  mes: 'MES',
  qms: 'QMS',
  reporting_bi: 'Reporting & BI',
  shop_floor: 'Shop Floor',
  pcs: 'PCS',
  plm: 'PLM',
  app: 'APP',
  spc_sqc: 'SPC / SQC',
}

const templateCatalog = [
  {
    name: 'Deployment Profile',
    file: 'deployment_profile.template.yaml',
    type: 'Profile',
    purpose: 'Start a customer/site profile with industries, domains, terminology, and approvals.',
  },
  {
    name: 'Snowflake Connector',
    file: 'snowflake_connector.template.yaml',
    type: 'Connector',
    purpose: 'Register warehouse database, schema, role, refresh cadence, and source objects.',
  },
  {
    name: 'SharePoint Excel Connector',
    file: 'sharepoint_excel_connector.template.yaml',
    type: 'Connector',
    purpose: 'Register site, library, workbook, sheet, target object, and refresh mode.',
  },
  {
    name: 'CSV Connector',
    file: 'csv_connector.template.yaml',
    type: 'Connector',
    purpose: 'Create a manual upload path with target object and schema inference defaults.',
  },
  {
    name: 'Mapping Manifest',
    file: 'mapping_manifest.template.yaml',
    type: 'Mapping',
    purpose: 'Map source fields into canonical objects with required fields and transforms.',
  },
  {
    name: 'Readiness Check',
    file: 'readiness_check.template.yaml',
    type: 'Readiness',
    purpose: 'Define blocking or warning checks with expected evidence and remediation.',
  },
  {
    name: 'Integration Contract',
    file: 'integration_contract.template.md',
    type: 'Governance',
    purpose: 'Document deployment profile, sources, mappings, readiness evidence, gaps, and approvals.',
  },
  {
    name: 'Adapter Implementation',
    file: 'adapter_implementation.template.md',
    type: 'Adapter',
    purpose: 'Guide live connector adapter methods, evidence capture, and failure handling.',
  },
]

const statusIcon: Record<StatusLevel, typeof CheckCircle2> = {
  pass: CheckCircle2,
  warning: TriangleAlert,
  blocking: ShieldCheck,
}

function titleize(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function severityStatus(severity: string): StatusLevel {
  if (severity === 'critical') return 'blocking'
  if (severity === 'high' || severity === 'medium') return 'warning'
  return 'pass'
}

function mostSevereStatus(statuses: StatusLevel[]): StatusLevel {
  if (statuses.includes('blocking')) return 'blocking'
  if (statuses.includes('warning')) return 'warning'
  return 'pass'
}

function readinessException(check: ReadinessCheck): ReadinessEvidenceException | null {
  if (check.status === 'pass') return null
  return {
    id: check.id,
    area: 'readiness',
    status: check.status,
    summary: check.label,
    evidence: check.evidence,
    remediation: check.remediation,
    source: 'readiness_checks',
  }
}

function reportFreshnessException(report: ReportCatalogItem): ReadinessEvidenceException | null {
  if (report.refreshStatus === 'pass') return null
  return {
    id: `report:${report.id}:freshness`,
    area: 'report_freshness',
    status: report.refreshStatus,
    summary: `${report.title} freshness is ${report.refreshStatus}.`,
    evidence: report.freshnessEvidence,
    remediation: `Refresh ${report.semanticModel} or update the catalog SLA if the report is intentionally paused.`,
    source: report.id,
  }
}

function reportFreshnessStatus(lastRefresh: string, maxAgeHours: number) {
  const ageHours = (Date.now() - Date.parse(lastRefresh)) / 36e5
  if (!Number.isFinite(ageHours)) {
    return {
      refreshStatus: 'blocking' as StatusLevel,
      freshnessEvidence: 'Last refresh timestamp is missing or invalid.',
    }
  }
  const roundedAge = Math.max(0, Math.round(ageHours * 10) / 10)
  return {
    refreshStatus: ageHours <= maxAgeHours ? 'pass' as StatusLevel : 'warning' as StatusLevel,
    freshnessEvidence: `Last refreshed ${roundedAge} hour(s) ago; threshold is ${maxAgeHours} hour(s).`,
  }
}

function evaluateReportPublishGate(report: ReportCatalogItem, canonicalObjects: CanonicalObject[]) {
  const availableObjectTypes = new Set(canonicalObjects.map((object) => object.objectType))
  const missingDependencies = report.sourceDependencies.filter(
    (dependency) => !availableObjectTypes.has(dependency),
  )
  const blockers = [
    report.refreshStatus === 'pass' ? null : `freshness status is ${report.refreshStatus}`,
    missingDependencies.length > 0 ? `missing canonical dependencies: ${missingDependencies.join(', ')}` : null,
  ].filter((item): item is string => Boolean(item))
  return {
    status: blockers.length > 0 ? 'blocking' as StatusLevel : 'pass' as StatusLevel,
    evidence:
      blockers.length > 0
        ? `Publish blocked because ${blockers.join('; ')}.`
        : `Publish gate passed with ${report.sourceDependencies.length} canonical dependency check(s) and fresh report data.`,
  }
}

type ReportCatalogSaveAction = 'draft' | 'publish' | 'signoff'

function reportApprovalStatusLevel(status: NonNullable<ReportCatalogItem['approvalStatus']>): StatusLevel {
  if (status === 'approved') return 'pass'
  if (status === 'rejected') return 'blocking'
  return 'warning'
}

function reportApprovalLabel(status?: ReportCatalogItem['approvalStatus']) {
  return status ? titleize(status) : 'Not signed'
}

function defaultEvidenceApproval(): ReadinessEvidenceApproval {
  return {
    status: 'draft',
    reviewer: '',
    routeStage: 'quality_review',
    routedReviewers: [],
    routeDueAt: '',
    nextReviewAt: '',
    rationale: '',
    dispositions: [],
    auditHistory: [],
  }
}

function evidenceApprovalStatusLevel(status: ReadinessEvidenceApprovalStatus): StatusLevel {
  if (status === 'approved') return 'pass'
  if (status === 'rejected') return 'blocking'
  return 'warning'
}

function evidenceApprovalLabel(status: ReadinessEvidenceApprovalStatus) {
  return titleize(status)
}

function evidenceApprovalAuditAction(status: ReadinessEvidenceApprovalStatus) {
  if (status === 'submitted') return 'submitted'
  if (status === 'approved') return 'approved'
  if (status === 'approved_with_exceptions') return 'approved_with_exceptions'
  if (status === 'rejected') return 'rejected'
  return 'updated'
}

function createReadinessEvidencePacket({
  approval,
  backendRecords,
  environment,
  readinessChecks,
  readinessSummary,
  reports,
}: {
  approval?: ReadinessEvidenceApproval
  backendRecords: BackendRecord[]
  environment: string
  readinessChecks: ReadinessCheck[]
  readinessSummary: Record<StatusLevel, number>
  reports: ReportCatalogItem[]
}): ReadinessEvidencePacket {
  const canonicalLoads = backendRecords.filter(
    (record): record is BackendRecord<CanonicalLoadResult> => record.kind === 'canonical_load',
  )
  const openExceptions = [
    ...readinessChecks.map(readinessException),
    ...reports.map(reportFreshnessException),
  ].filter((item): item is ReadinessEvidenceException => Boolean(item))
  const reportFreshness = {
    total: reports.length,
    pass: reports.filter((report) => report.refreshStatus === 'pass').length,
    warning: reports.filter((report) => report.refreshStatus === 'warning').length,
    blocking: reports.filter((report) => report.refreshStatus === 'blocking').length,
    items: reports,
  }
  const status = mostSevereStatus([
    ...readinessChecks.map((check) => check.status),
    ...reports.map((report) => report.refreshStatus),
    canonicalLoads.length > 0 ? 'pass' : 'warning',
  ])
  const generatedAt = new Date().toISOString()

  return {
    packetId: `readiness_evidence:${environment}:${generatedAt}`,
    generatedAt,
    environment,
    status,
    summary: {
      readiness: readinessSummary,
      canonicalLoads: canonicalLoads.length,
      reportCatalogItems: reports.length,
      openExceptions: openExceptions.length,
    },
    canonicalLoads,
    reportFreshness,
    openExceptions,
    approval: approval ?? defaultEvidenceApproval(),
    evidence: `${canonicalLoads.length} canonical load record(s), ${reports.length} report freshness item(s), and ${openExceptions.length} open exception(s) packaged for readiness review.`,
  }
}

function canonicalLoadProfileForConnector(
  connectorId: string,
  connector: AppConfig['connectors']['connectors'][string],
  mapping: AppConfig['mappings'][string],
) {
  const mappedObject = connector.objects?.find((object) => object.target === mapping.object)
  const firstObject = connector.objects?.[0]
  return {
    mappingId: mapping.object,
    sourceConnector: connectorId,
    connectorType: connector.type,
    sourceObject:
      mappedObject?.source ??
      firstObject?.source ??
      connector.sheet ??
      connector.workbook ??
      mapping.source_object,
    targetObject: mappedObject?.target ?? firstObject?.target ?? connector.target ?? mapping.object,
  }
}

function App() {
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState('Overview')
  const [deployment, setDeployment] = useState<DeploymentState>({
    activeIndustries: [],
    activeDomains: [],
  })
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([])
  const [connectorResults, setConnectorResults] = useState<Record<string, ConnectorTestResult>>({})
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null)
  const [csvText, setCsvText] = useState('')
  const [csvSchema, setCsvSchema] = useState<CsvSchemaInference | null>(null)
  const [mappingResult, setMappingResult] = useState<MappingValidationResult | null>(null)
  const [savedVersions, setSavedVersions] = useState<SavedVersion[]>(() => loadSavedVersions())
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null)
  const [backendRecords, setBackendRecords] = useState<BackendRecord[]>([])
  const [storageSchema, setStorageSchema] = useState<RecordStoreSchema | null>(null)
  const [adapterDryRuns, setAdapterDryRuns] = useState<Record<string, AdapterDryRunResult>>({})
  const [sourceMetadata, setSourceMetadata] = useState<Record<string, ConnectorSourceMetadata>>({})
  const [sourcePreviews, setSourcePreviews] = useState<Record<string, ConnectorPreviewResult>>({})
  const [connectorRuns, setConnectorRuns] = useState<Record<string, BackendRecord[]>>({})
  const [credentialValidations, setCredentialValidations] = useState<Record<string, CredentialValidationResult>>({})
  const [mappingRuns, setMappingRuns] = useState<Record<string, BackendRecord[]>>({})
  const [canonicalLoadConnectorId, setCanonicalLoadConnectorId] = useState<string>('complaints_snowflake')
  const [contractRecords, setContractRecords] = useState<BackendRecord[]>([])
  const [templateRecords, setTemplateRecords] = useState<BackendRecord<ControlledTemplatePayload>[]>([])
  const [assetRegistry, setAssetRegistry] = useState<AssetRegistry | null>(null)
  const [qualityEvents, setQualityEvents] = useState<QualityEvent[]>([])
  const [canonicalObjects, setCanonicalObjects] = useState<CanonicalObject[]>([])
  const [traceabilityLinks, setTraceabilityLinks] = useState<TraceabilityLink[]>([])
  const [reportCatalog, setReportCatalog] = useState<ReportCatalogItem[]>([])
  const [selectedQualityEventId, setSelectedQualityEventId] = useState<string | null>(null)

  useEffect(() => {
    loadAppConfig()
      .then((loaded) => {
        setConfig(loaded)
        setDeployment({
          activeIndustries: loaded.environment.deployment_profile.industries,
          activeDomains: loaded.environment.deployment_profile.solution_domains,
        })
        setAuditEvents([
          createAuditEvent(
            'config',
            'load',
            'Loaded QA environment, industry profiles, solution domains, object families, connectors, and readiness rules.',
          ),
        ])
        setSelectedConnectorId(Object.keys(loaded.connectors.connectors)[0] ?? null)
        setCanonicalLoadConnectorId(loaded.mappings.quality_event.source_connector)
        fetch('/samples/quality_events_sample.csv')
          .then((response) => response.text())
          .then((sample) => {
            setCsvText(sample)
            const schema = inferCsvSchema(sample)
            setCsvSchema(schema)
            setMappingResult(validateMappingAgainstSchema(loaded.mappings.quality_event, schema))
        })
        refreshBackend()
        refreshAssetRegistry()
        refreshWorkflowSurface()
      })
      .catch((loadError: Error) => setError(loadError.message))
  }, [])

  const readinessChecks = useMemo(() => {
    if (!config) return []
    return evaluateReadiness(config, deployment)
  }, [config, deployment])

  const readinessSummary = useMemo(() => summarizeReadiness(readinessChecks), [readinessChecks])
  const activeFamilies = useMemo(
    () => getDomainFamilies(deployment.activeDomains),
    [deployment.activeDomains],
  )

  function record(area: string, action: string, summary: string) {
    setAuditEvents((events) => [createAuditEvent(area, action, summary), ...events].slice(0, 20))
  }

  function saveVersion(record: SavedVersion) {
    setSavedVersions((versions) => {
      const next = [record, ...versions].slice(0, 100)
      persistSavedVersions(next)
      return next
    })
  }

  async function refreshBackend() {
    const [health, records, contracts, templates, schema] = await Promise.all([
      backendClient.health(),
      backendClient.listRecords(),
      backendClient.listIntegrationContracts(),
      backendClient.listControlledTemplates(),
      backendClient.loadStorageSchema(),
    ])
    setBackendHealth(health)
    setBackendRecords(records)
    setContractRecords(contracts)
    setTemplateRecords(templates)
    setStorageSchema(schema)
  }

  async function refreshAssetRegistry() {
    const registry = await backendClient.loadAssetRegistry()
    setAssetRegistry(registry)
  }

  async function refreshWorkflowSurface() {
    const [events, objects, links, reports] = await Promise.all([
      backendClient.listQualityEvents(),
      backendClient.listCanonicalObjects(),
      backendClient.listTraceabilityLinks(),
      backendClient.listReports(),
    ])
    setQualityEvents(events)
    setCanonicalObjects(objects)
    setTraceabilityLinks(links)
    setReportCatalog(reports)
    setSelectedQualityEventId((current) => current ?? events[0]?.id ?? null)
  }

  async function promoteTemplateAsset(asset: LocalAsset) {
    const solutions = Array.from(new Set([...deployment.activeDomains, asset.domain])).filter(
      Boolean,
    )
    const saved = await backendClient.promoteAssetToTemplate({
      asset,
      industries: deployment.activeIndustries,
      solutions,
      status: 'draft',
    })
    const templates = await backendClient.listControlledTemplates()
    setTemplateRecords(templates)
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'controlled_template',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'template',
      'promote',
      `${asset.name} promoted to controlled template record v${saved.version}.`,
    )
  }

  async function activateTemplateRecord(templateRecord: BackendRecord<ControlledTemplatePayload>) {
    const saved = await backendClient.updateControlledTemplate(templateRecord, { status: 'active' })
    const templates = await backendClient.listControlledTemplates()
    setTemplateRecords(templates)
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'controlled_template',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'template',
      'activate',
      `${templateRecord.payload.templateId} activated as controlled template v${saved.version}.`,
    )
  }

  async function updateTemplateRecord(
    templateRecord: BackendRecord<ControlledTemplatePayload>,
    updates: Partial<ControlledTemplatePayload>,
  ) {
    const saved = await backendClient.updateControlledTemplate(templateRecord, updates)
    const templates = await backendClient.listControlledTemplates()
    setTemplateRecords(templates)
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'controlled_template',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'template',
      'update',
      `${templateRecord.payload.templateId} updated as controlled template v${saved.version}.`,
    )
  }

  function deploymentReadinessStatus(): StatusLevel {
    if (readinessSummary.blocking > 0) return 'blocking'
    if (readinessSummary.warning > 0) return 'warning'
    return 'pass'
  }

  function toggleIndustry(key: string) {
    const enabled = deployment.activeIndustries.includes(key)
    const next = enabled
      ? deployment.activeIndustries.filter((item) => item !== key)
      : [...deployment.activeIndustries, key]
    setDeployment((current) => ({ ...current, activeIndustries: next }))
    record('profile', enabled ? 'disable' : 'enable', `${titleize(key)} profile ${enabled ? 'disabled' : 'enabled'}.`)
  }

  function toggleDomain(key: string) {
    const enabled = deployment.activeDomains.includes(key)
    const next = enabled
      ? deployment.activeDomains.filter((item) => item !== key)
      : [...deployment.activeDomains, key]
    setDeployment((current) => ({ ...current, activeDomains: next }))
    record('domain', enabled ? 'disable' : 'enable', `${titleize(key)} domain ${enabled ? 'disabled' : 'enabled'}.`)
  }

  function contractStatus(): StatusLevel {
    if (readinessSummary.blocking > 0) return 'blocking'
    if (readinessSummary.warning > 0) return 'warning'
    return 'pass'
  }

  function contractSummary() {
    return `${readinessSummary.pass} pass, ${readinessSummary.warning} warning, ${readinessSummary.blocking} blocking readiness checks.`
  }

  function createContractPayload() {
    if (!config) return
    const contract = createIntegrationContract(
      config,
      deployment,
      readinessChecks,
      auditEvents,
      connectorResults,
    )
    return {
      ...contract,
      backend_persistence: {
        health: backendHealth,
        saved_records: backendRecords.slice(0, 20),
        adapter_contracts: adapterContracts,
        adapter_dry_runs: Object.values(adapterDryRuns),
      },
    }
  }

  async function persistIntegrationContract({ download }: { download: boolean }) {
    const contractWithBackend = createContractPayload()
    if (!contractWithBackend) return
    const saved = await backendClient.saveIntegrationContract({
      contract: contractWithBackend,
      status: contractStatus(),
      summary: contractSummary(),
    })
    const contracts = await backendClient.listIntegrationContracts()
    setContractRecords(contracts)
    await refreshBackend()
    if (download) {
      downloadJson('tracs-integration-contract-connector-hub.json', contractWithBackend)
    }
    saveVersion(
      createSavedVersion({
        kind: 'integration_contract',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'contract',
      download ? 'save_export' : 'save',
      `Integration contract saved as backend record v${saved.version}.`,
    )
  }

  function exportContract() {
    void persistIntegrationContract({ download: true })
  }

  async function saveBackendSnapshot() {
    if (!config) return
    const saved = await backendClient.saveDeploymentSnapshot({
      config,
      deployment,
      readinessStatus: deploymentReadinessStatus(),
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'backend_snapshot',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record('backend', 'save_snapshot', `${saved.label} saved as backend record v${saved.version}.`)
  }

  async function runAdapterDryRun(connectorId: string) {
    if (!config) return
    const connector = config.connectors.connectors[connectorId]
    const result = await backendClient.runAdapterDryRun(connectorId, connector)
    setAdapterDryRuns((current) => ({ ...current, [connectorId]: result }))
    const saved = await backendClient.saveRecord({
      kind: 'adapter_contract',
      label: `${connector.display_name} adapter dry run`,
      status: result.status,
      summary: `${result.operations.length} adapter operation(s) checked for ${connector.type}.`,
      payload: result,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'adapter_dry_run',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    setSelectedConnectorId(connectorId)
    record('adapter', 'dry_run', `${connector.display_name} adapter contract dry run completed.`)
  }

  async function discoverConnectorSource(connectorId: string) {
    if (!config) return
    const connector = config.connectors.connectors[connectorId]
    const [metadata, preview] = await Promise.all([
      backendClient.discoverConnectorMetadata(connectorId, connector),
      backendClient.previewConnectorRows(connectorId, connector, 5),
    ])
    if (!metadata.record) {
      await backendClient.saveRecord({
        kind: 'connector_run',
        label: `${connector.display_name} metadata discovery`,
        status: metadata.columns.length > 0 ? 'pass' : 'warning',
        summary: metadata.evidence,
        payload: {
          connectorId,
          runType: 'metadata',
          result: metadata,
        },
      })
    }
    if (!preview.record) {
      await backendClient.saveRecord({
        kind: 'connector_run',
        label: `${connector.display_name} row preview`,
        status: preview.returnedRows > 0 ? 'pass' : 'warning',
        summary: preview.evidence,
        payload: {
          connectorId,
          runType: 'preview',
          result: preview,
        },
      })
    }
    const runs = await backendClient.listConnectorRuns(connectorId)
    setSourceMetadata((current) => ({ ...current, [connectorId]: metadata }))
    setSourcePreviews((current) => ({ ...current, [connectorId]: preview }))
    setConnectorRuns((current) => ({ ...current, [connectorId]: runs }))
    setSelectedConnectorId(connectorId)
    await refreshBackend()
    record(
      'connector',
      'discover_source',
      `${connector.display_name} source discovery returned ${metadata.columns.length} column(s) and ${preview.returnedRows} preview row(s).`,
    )
  }

  async function validateConnectorCredentials(connectorId: string) {
    if (!config) return
    const connector = config.connectors.connectors[connectorId]
    const result = await backendClient.validateConnectorCredentials(connectorId, connector)
    setCredentialValidations((current) => ({ ...current, [connectorId]: result }))
    const runs = await backendClient.listConnectorRuns(connectorId)
    setConnectorRuns((current) => ({ ...current, [connectorId]: runs }))
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'credential_validation',
        label: `${connector.display_name} credential validation`,
        status: result.status,
        summary: result.evidence,
        payload: result.record ?? result,
      }),
    )
    setSelectedConnectorId(connectorId)
    record(
      'credential',
      'validate',
      `${connector.display_name} credential validation completed with ${result.status} status.`,
    )
  }

  function runConnectorTest(connectorId: string) {
    if (!config) return
    const connector = config.connectors.connectors[connectorId]
    const result = testConnector(connectorId, connector)
    setConnectorResults((current) => ({ ...current, [connectorId]: result }))
    saveVersion(
      createSavedVersion({
        kind: 'connector_test',
        label: connector.display_name,
        status: result.status,
        summary: `${result.checks.length} connector readiness checks captured for ${connector.type}.`,
        payload: result,
      }),
    )
    setSelectedConnectorId(connectorId)
    record(
      'connector',
      'test',
      `${connector.display_name} manifest test completed with ${result.status} status.`,
    )
  }

  function runAllConnectorTests() {
    if (!config) return
    const results = testAllConnectors(config)
    setConnectorResults(results)
    Object.entries(results).forEach(([connectorId, result]) => {
      saveVersion(
        createSavedVersion({
          kind: 'connector_test',
          label: config.connectors.connectors[connectorId].display_name,
          status: result.status,
          summary: `${result.checks.length} connector readiness checks captured for ${result.metadata.sourceType}.`,
          payload: result,
        }),
      )
    })
    record(
      'connector',
      'test_all',
      `${Object.keys(results).length} connector manifest tests completed.`,
    )
  }

  async function runMappingValidation() {
    if (!config) return
    const mappingId = 'quality_event'
    const schema = inferCsvSchema(csvText)
    const mapping = config.mappings.quality_event
    const result = validateMappingAgainstSchema(mapping, schema)
    const summary = `${result.mappedFields.filter((field) => field.present).length}/${result.mappedFields.length} mapped fields present.`
    setCsvSchema(schema)
    setMappingResult(result)
    const savedRun = await backendClient.saveMappingRun({
      mappingId,
      mapping,
      schema,
      result,
      summary,
    })
    const runs = await backendClient.listMappingRuns(mappingId)
    setMappingRuns((current) => ({ ...current, [mappingId]: runs }))
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'mapping_validation',
        label: savedRun.label,
        status: savedRun.status,
        summary: savedRun.summary,
        payload: savedRun,
      }),
    )
    saveVersion(
      createSavedVersion({
        kind: 'mapping_version',
        label: 'quality_event mapping manifest',
        status: result.status,
        summary: `${Object.keys(mapping.fields).length} mapped fields versioned from active manifest.`,
        payload: mapping,
      }),
    )
    record(
      'mapping',
      'validate',
      `quality_event mapping validation completed with ${result.status} status.`,
    )
  }

  async function loadCanonicalFromMapping() {
    if (!config) return
    const mapping = config.mappings.quality_event
    const connector =
      config.connectors.connectors[canonicalLoadConnectorId] ??
      config.connectors.connectors[mapping.source_connector]
    const connectorId = config.connectors.connectors[canonicalLoadConnectorId]
      ? canonicalLoadConnectorId
      : mapping.source_connector
    const savedLoad = await backendClient.loadCanonicalFromMapping(
      canonicalLoadProfileForConnector(connectorId, connector, mapping),
    )
    await Promise.all([refreshBackend(), refreshWorkflowSurface()])
    saveVersion(
      createSavedVersion({
        kind: 'canonical_load',
        label: 'quality_event canonical load',
        status: savedLoad.record?.status ?? (savedLoad.warnings.length > 0 ? 'warning' : 'pass'),
        summary: savedLoad.evidence,
        payload: savedLoad,
      }),
    )
    record(
      'canonical',
      'load',
      `${savedLoad.objectCount} canonical object(s) and ${savedLoad.linkCount} traceability link(s) loaded.`,
    )
  }

  async function saveExtractionJob(policy?: {
    status: ExtractionJobPayload['status']
    scheduleMode: ExtractionJobPayload['scheduleMode']
    scheduleCadence: ExtractionJobPayload['scheduleCadence']
    nextRunAt: string
    maxRetries: number
    retryDelayMinutes: number
    retryOnWarnings: boolean
  }) {
    if (!config) return
    const mapping = config.mappings.quality_event
    const connector =
      config.connectors.connectors[canonicalLoadConnectorId] ??
      config.connectors.connectors[mapping.source_connector]
    const connectorId = config.connectors.connectors[canonicalLoadConnectorId]
      ? canonicalLoadConnectorId
      : mapping.source_connector
    const profile = canonicalLoadProfileForConnector(connectorId, connector, mapping)
    const now = new Date().toISOString()
    const payload: ExtractionJobPayload = {
      jobId: `extraction_job:${profile.sourceConnector}:${profile.targetObject}`,
      name: `${connector.display_name} ${profile.targetObject} extraction`,
      status: policy?.status ?? 'active',
      scheduleMode: policy?.scheduleMode ?? 'manual',
      scheduleCadence: policy?.scheduleCadence ?? 'on_demand',
      nextRunAt: policy?.nextRunAt ?? '',
      retryPolicy: {
        maxRetries: policy?.maxRetries ?? 1,
        retryDelayMinutes: policy?.retryDelayMinutes ?? 15,
        retryOnWarnings: policy?.retryOnWarnings ?? true,
      },
      mappingId: profile.mappingId,
      connectorId: profile.sourceConnector,
      connectorType: profile.connectorType,
      sourceObject: profile.sourceObject,
      targetObject: profile.targetObject,
      createdAt: now,
      updatedAt: now,
      evidence: `${connector.display_name} extraction job routes ${profile.sourceObject} into ${profile.targetObject} with ${policy?.scheduleCadence ?? 'on_demand'} cadence and ${policy?.maxRetries ?? 1} retry attempt(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'extraction_job',
      label: payload.jobId,
      status: 'pass',
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'extraction_job',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record('extraction', 'save_job', `${payload.name} saved as extraction job v${saved.version}.`)
  }

  async function runExtractionJob(job: BackendRecord<ExtractionJobPayload>) {
    const previousRuns = backendRecords.filter(
      (record): record is BackendRecord<ExtractionRunPayload> => {
        const payload = record.payload as { jobId?: string }
        return record.kind === 'extraction_run' && payload.jobId === job.payload.jobId
      },
    )
    const attempt = previousRuns.length + 1
    const request = {
      mappingId: job.payload.mappingId,
      sourceConnector: job.payload.connectorId,
      connectorType: job.payload.connectorType,
      sourceObject: job.payload.sourceObject,
      targetObject: job.payload.targetObject,
    }
    const startedAt = new Date().toISOString()
    const result = await backendClient.loadCanonicalFromMapping(request)
    const finishedAt = new Date().toISOString()
    const status: StatusLevel = result.record?.status ?? (result.warnings.length > 0 ? 'warning' : 'pass')
    const retryEligible =
      attempt <= job.payload.retryPolicy.maxRetries &&
      (status === 'blocking' || (status === 'warning' && job.payload.retryPolicy.retryOnWarnings))
    const payload: ExtractionRunPayload = {
      runId: `extraction_run:${job.payload.jobId}:${finishedAt}`,
      jobId: job.payload.jobId,
      startedAt,
      finishedAt,
      status,
      request,
      result,
      attempt,
      maxRetries: job.payload.retryPolicy.maxRetries,
      retryDelayMinutes: job.payload.retryPolicy.retryDelayMinutes,
      retryEligible,
      evidence: `${job.payload.name} attempt ${attempt} completed. ${result.evidence}${retryEligible ? ` Retry is eligible after ${job.payload.retryPolicy.retryDelayMinutes} minute(s).` : ''}`,
      warnings: result.warnings,
    }
    const saved = await backendClient.saveRecord({
      kind: 'extraction_run',
      label: job.payload.jobId,
      status,
      summary: payload.evidence,
      payload,
    })
    await Promise.all([refreshBackend(), refreshWorkflowSurface()])
    saveVersion(
      createSavedVersion({
        kind: 'extraction_run',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record('extraction', 'run_job', `${job.payload.name} extraction job run saved as v${saved.version}.`)
  }

  async function persistReadinessEvidencePacket({
    approval,
    download,
  }: {
    approval: ReadinessEvidenceApproval
    download: boolean
  }) {
    if (!config) return
    const packet = createReadinessEvidencePacket({
      approval,
      backendRecords,
      environment: config.environment.environment.name,
      readinessChecks,
      readinessSummary,
      reports: reportCatalog,
    })
    const saved = await backendClient.saveRecord({
      kind: 'readiness_evidence_packet',
      label: `${config.environment.environment.name} readiness evidence packet`,
      status: mostSevereStatus([packet.status, evidenceApprovalStatusLevel(approval.status)]),
      summary: `${packet.evidence} Approval state: ${evidenceApprovalLabel(approval.status)}.`,
      payload: packet,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'readiness_evidence_packet',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    if (download) {
      downloadJson('tracs-readiness-evidence-packet.json', packet)
    }
    record(
      'evidence',
      download ? 'save_export' : 'save',
      `Readiness evidence packet saved as backend record v${saved.version} with ${evidenceApprovalLabel(approval.status)} approval state.`,
    )
  }

  async function saveReportCatalogItem(report: ReportCatalogItem, action: ReportCatalogSaveAction) {
    const freshness = reportFreshnessStatus(report.lastRefresh, report.maxAgeHours)
    const normalizedReport: ReportCatalogItem = {
      ...report,
      ...freshness,
    }
    const gate = evaluateReportPublishGate(normalizedReport, canonicalObjects)
    const signedAt = new Date().toISOString()
    const approvalStatus = normalizedReport.approvalStatus ?? 'pending'
    const approvalEvidence = `${reportApprovalLabel(approvalStatus)} by ${normalizedReport.approvalReviewer || 'unassigned reviewer'}.`
    const payload: ReportCatalogItem = {
      ...normalizedReport,
      publishStatus:
        action === 'publish' ? (gate.status === 'pass' ? 'published' : 'blocked') : normalizedReport.publishStatus ?? 'draft',
      publishGateEvidence:
        action === 'publish' ? gate.evidence : normalizedReport.publishGateEvidence ?? 'Draft saved; publish gate has not been applied.',
      publishedAt: action === 'publish' && gate.status === 'pass' ? signedAt : normalizedReport.publishedAt,
      approvalStatus,
      approvalSignedAt: action === 'signoff' ? signedAt : normalizedReport.approvalSignedAt,
      approvalHistory:
        action === 'signoff'
          ? [
              ...(normalizedReport.approvalHistory ?? []),
              {
                status: approvalStatus,
                reviewer: normalizedReport.approvalReviewer ?? '',
                rationale: normalizedReport.approvalRationale ?? '',
                signedAt,
                publishStatus: normalizedReport.publishStatus,
                evidence: `${approvalEvidence} ${gate.evidence}`,
              },
            ]
          : normalizedReport.approvalHistory,
    }
    const saveStatus =
      action === 'signoff'
        ? mostSevereStatus([gate.status, reportApprovalStatusLevel(approvalStatus)])
        : action === 'publish'
          ? gate.status
          : payload.refreshStatus
    const summary =
      action === 'signoff'
        ? `${payload.title} report sign-off recorded. ${approvalEvidence}`
        : action === 'publish'
          ? gate.evidence
          : `${payload.title} report catalog draft saved.`
    const saved = await backendClient.saveRecord({
      kind: 'report_catalog_item',
      label: payload.id,
      status: saveStatus,
      summary,
      payload,
    })
    await Promise.all([refreshBackend(), refreshWorkflowSurface()])
    saveVersion(
      createSavedVersion({
        kind: 'report_catalog_item',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'report',
      action === 'signoff' ? 'sign_off' : action === 'publish' ? 'publish_gate' : 'save_draft',
      `${payload.title} saved as report catalog record v${saved.version}.`,
    )
  }

  if (error) {
    return (
      <main className="error-shell">
        <div>
          <TriangleAlert size={28} />
          <h1>Config load failed</h1>
          <p>{error}</p>
        </div>
      </main>
    )
  }

  if (!config) {
    return (
      <main className="error-shell">
        <div>
          <Gauge className="spin" size={28} />
          <h1>Loading TRACS foundation</h1>
          <p>Reading environment, profile, domain, object-family, and readiness YAML.</p>
        </div>
      </main>
    )
  }

  const industryEntries = Object.entries(config.industries)
  const domainEntries = preferredDomainOrder
    .filter((key) => config.solutionDomains[key])
    .map((key) => [key, config.solutionDomains[key]] as const)
  const connectorEntries = Object.entries(config.connectors.connectors)
  const selectedConnector = selectedConnectorId
    ? config.connectors.connectors[selectedConnectorId]
    : undefined
  const selectedConnectorResult = selectedConnectorId
    ? connectorResults[selectedConnectorId]
    : undefined
  const selectedSourceMetadata = selectedConnectorId
    ? sourceMetadata[selectedConnectorId]
    : undefined
  const selectedSourcePreview = selectedConnectorId
    ? sourcePreviews[selectedConnectorId]
    : undefined
  const selectedConnectorRuns = selectedConnectorId
    ? connectorRuns[selectedConnectorId] ?? []
    : []
  const selectedCredentialValidation = selectedConnectorId
    ? credentialValidations[selectedConnectorId] ??
      (backendRecords.find(
        (record): record is BackendRecord<{ connectorId: string; result: CredentialValidationResult }> => {
          const payload = record.payload as { connectorId?: string }
          return record.kind === 'credential_validation' && payload.connectorId === selectedConnectorId
        },
      )?.payload.result)
    : undefined
  const selectedCredentialValidationRecords = selectedConnectorId
    ? backendRecords.filter(
        (record): record is BackendRecord<{ connectorId: string; result: CredentialValidationResult }> => {
          const payload = record.payload as { connectorId?: string }
          return record.kind === 'credential_validation' && payload.connectorId === selectedConnectorId
        },
      )
    : []

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">T</div>
          <div>
            <strong>TRACS</strong>
            <span>Foundation Shell</span>
          </div>
        </div>
        <nav aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                className={activeView === item.label ? 'nav-item active' : 'nav-item'}
                key={item.label}
                onClick={() => setActiveView(item.label)}
                type="button"
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="sidebar-footer">
          <Settings size={16} />
          <span>{config.environment.environment.display_name}</span>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <h1>
              {activeView === 'Connectors'
                ? 'Connector Hub'
                : activeView === 'Templates'
                  ? 'Template Library'
                  : activeView === 'Mapping'
                    ? 'Mapping Studio'
                    : activeView === 'Quality Events'
                      ? 'Quality Events'
                      : activeView === 'Object Explorer'
                        ? 'Object Explorer'
                        : activeView === 'Traceability'
                          ? 'Traceability'
                          : activeView === 'Reports'
                            ? 'Report Catalog'
                            : activeView === 'Evidence'
                              ? 'Evidence Packet'
                            : activeView === 'Versions'
                              ? 'Saved Versions'
                              : activeView === 'Backend'
                                ? 'Backend Persistence'
                                : activeView === 'Contract'
                                  ? 'Integration Contract'
                                  : 'Foundation Shell'}
            </h1>
            <p>
              {activeView === 'Connectors'
                ? 'Register connector manifests, run adapter readiness tests, preview metadata, and capture evidence.'
                : activeView === 'Templates'
                  ? 'Promote local assets into controlled TRACS template records with provenance, tags, and version history.'
                  : activeView === 'Mapping'
                    ? 'Infer source schema from CSV samples and validate source-to-canonical field mappings.'
                    : activeView === 'Quality Events'
                      ? 'Search and inspect mapped quality-event records from the canonical TRACS model.'
                      : activeView === 'Object Explorer'
                        ? 'Review canonical objects across quality, product, traceability, and reporting families.'
                        : activeView === 'Traceability'
                          ? 'Inspect event-to-product, lot/serial, return, and CAPA relationships.'
                          : activeView === 'Reports'
                            ? 'Launch governed BI reports with owner, freshness, semantic model, and source dependencies.'
                            : activeView === 'Evidence'
                              ? 'Package canonical loads, report freshness, and open exceptions into a versioned readiness evidence file.'
                            : activeView === 'Versions'
                              ? 'Review saved connector, mapping, and contract versions persisted in this browser.'
                              : activeView === 'Backend'
                                ? 'Persist deployment snapshots, verify adapter contracts, and prepare the API boundary for live systems.'
                                : activeView === 'Contract'
                                  ? 'Save, export, and review versioned integration contracts for the active deployment.'
                                  : 'Configure industries, activate domains, validate setup, and export the deployment contract.'}
            </p>
          </div>
          <div className="topbar-actions">
            <div className="status-strip" aria-label="Foundation status">
              <span>
                <i className="dot healthy" />
                Services
              </span>
              <span>
                <i className="dot healthy" />
                Config loaded
              </span>
              <span>
                <i className="dot warning" />
                {readinessSummary.warning} warning
              </span>
            </div>
            <div className="env-select">
              <span>Environment</span>
              <strong>{config.environment.environment.name.toUpperCase()}</strong>
            </div>
            <button className="primary-action" onClick={exportContract} type="button">
              <Download size={16} />
              Export Contract
            </button>
          </div>
        </header>

        <section className="metrics-grid" aria-label="Deployment metrics">
          <Metric label="Active profiles" value={deployment.activeIndustries.length} icon={Factory} />
          <Metric label="Enabled domains" value={deployment.activeDomains.length} icon={Layers3} />
          <Metric label="Quality events" value={qualityEvents.length} icon={ShieldCheck} />
          <Metric label="Trace links" value={traceabilityLinks.length} icon={Route} />
          <Metric label="Reports" value={reportCatalog.length} icon={Gauge} />
        </section>

        {activeView === 'Connectors' ? (
          <ConnectorHub
            connectorEntries={connectorEntries}
            connectorResults={connectorResults}
            onRunAll={runAllConnectorTests}
            onRunOne={runConnectorTest}
            onDiscoverSource={discoverConnectorSource}
            onValidateCredentials={validateConnectorCredentials}
            onSelect={setSelectedConnectorId}
            selectedConnector={selectedConnector}
            selectedConnectorId={selectedConnectorId}
            selectedConnectorResult={selectedConnectorResult}
            selectedConnectorRuns={selectedConnectorRuns}
            selectedCredentialValidation={selectedCredentialValidation}
            selectedCredentialValidationRecords={selectedCredentialValidationRecords}
            selectedSourceMetadata={selectedSourceMetadata}
            selectedSourcePreview={selectedSourcePreview}
          />
        ) : activeView === 'Templates' ? (
          <TemplatesView
            assetRegistry={assetRegistry}
            onActivateTemplate={activateTemplateRecord}
            onPromoteAsset={promoteTemplateAsset}
            onRefreshAssets={refreshAssetRegistry}
            onUpdateTemplate={updateTemplateRecord}
            templateRecords={templateRecords}
          />
        ) : activeView === 'Mapping' ? (
          <MappingStudio
            canonicalLoadConnectorId={canonicalLoadConnectorId}
            connectorEntries={connectorEntries}
            csvSchema={csvSchema}
            csvText={csvText}
            extractionJobs={backendRecords.filter(
              (record): record is BackendRecord<ExtractionJobPayload> => record.kind === 'extraction_job',
            )}
            extractionRuns={backendRecords.filter(
              (record): record is BackendRecord<ExtractionRunPayload> => record.kind === 'extraction_run',
            )}
            latestCanonicalLoad={backendRecords.find(
              (record): record is BackendRecord<CanonicalLoadResult> =>
                record.kind === 'canonical_load',
            )}
            mapping={config.mappings.quality_event}
            mappingResult={mappingResult}
            mappingRuns={mappingRuns.quality_event ?? []}
            onCsvTextChange={setCsvText}
            onCreateExtractionJob={saveExtractionJob}
            onLoadConnectorChange={setCanonicalLoadConnectorId}
            onLoadCanonical={loadCanonicalFromMapping}
            onRunExtractionJob={runExtractionJob}
            onValidate={runMappingValidation}
          />
        ) : activeView === 'Quality Events' ? (
          <QualityEventsView
            events={qualityEvents}
            onSelect={setSelectedQualityEventId}
            selectedEventId={selectedQualityEventId}
            traceabilityLinks={traceabilityLinks}
          />
        ) : activeView === 'Object Explorer' ? (
          <ObjectExplorerView objects={canonicalObjects} />
        ) : activeView === 'Traceability' ? (
          <TraceabilityView
            events={qualityEvents}
            links={traceabilityLinks}
            onSelectEvent={setSelectedQualityEventId}
            selectedEventId={selectedQualityEventId}
          />
        ) : activeView === 'Reports' ? (
          <ReportCatalogView
            canonicalObjects={canonicalObjects}
            onSaveReport={saveReportCatalogItem}
            reports={reportCatalog}
          />
        ) : activeView === 'Evidence' ? (
          <EvidencePacketWorkspace
            backendRecords={backendRecords}
            evidenceRecords={backendRecords.filter(
              (record) => record.kind === 'readiness_evidence_packet',
            )}
            environment={config.environment.environment.name}
            onDownloadPacket={(approval) => persistReadinessEvidencePacket({ approval, download: true })}
            onSavePacket={(approval) => persistReadinessEvidencePacket({ approval, download: false })}
            readinessChecks={readinessChecks}
            readinessSummary={readinessSummary}
            reports={reportCatalog}
          />
        ) : activeView === 'Versions' ? (
          <SavedVersionsView savedVersions={savedVersions} />
        ) : activeView === 'Backend' ? (
          <BackendPersistenceView
            adapterContracts={adapterContracts}
            adapterDryRuns={adapterDryRuns}
            backendHealth={backendHealth}
            backendRecords={backendRecords}
            connectorEntries={connectorEntries}
            onRefresh={refreshBackend}
            onRunAdapterDryRun={runAdapterDryRun}
            onSaveSnapshot={saveBackendSnapshot}
            storageSchema={storageSchema}
          />
        ) : activeView === 'Contract' ? (
          <ContractWorkspace
            backendHealth={backendHealth}
            backendRecords={backendRecords}
            contractRecords={contractRecords}
            onDownloadContract={() => persistIntegrationContract({ download: true })}
            onSaveContract={() => persistIntegrationContract({ download: false })}
            readinessSummary={readinessSummary}
          />
        ) : (
          <OverviewShell
            activeFamilies={activeFamilies}
            auditEvents={auditEvents}
            config={config}
            domainEntries={domainEntries}
            industryEntries={industryEntries}
            readinessChecks={readinessChecks}
            readinessSummary={readinessSummary}
            deployment={deployment}
            toggleDomain={toggleDomain}
            toggleIndustry={toggleIndustry}
          />
        )}
      </main>
    </div>
  )
}

function EvidencePacketWorkspace({
  backendRecords,
  environment,
  evidenceRecords,
  onDownloadPacket,
  onSavePacket,
  readinessChecks,
  readinessSummary,
  reports,
}: {
  backendRecords: BackendRecord[]
  environment: string
  evidenceRecords: BackendRecord[]
  onDownloadPacket: (approval: ReadinessEvidenceApproval) => void
  onSavePacket: (approval: ReadinessEvidenceApproval) => void
  readinessChecks: ReadinessCheck[]
  readinessSummary: Record<StatusLevel, number>
  reports: ReportCatalogItem[]
}) {
  const latestPacket = evidenceRecords[0] as BackendRecord<ReadinessEvidencePacket> | undefined
  const latestApproval = latestPacket?.payload.approval
  const [approvalStatus, setApprovalStatus] = useState<ReadinessEvidenceApprovalStatus>(
    latestApproval?.status ?? 'draft',
  )
  const [reviewer, setReviewer] = useState(latestApproval?.reviewer ?? '')
  const [routeStage, setRouteStage] = useState<NonNullable<ReadinessEvidenceApproval['routeStage']>>(
    latestApproval?.routeStage ?? 'quality_review',
  )
  const [routedReviewers, setRoutedReviewers] = useState(
    latestApproval?.routedReviewers?.join(', ') ?? '',
  )
  const [routeDueAt, setRouteDueAt] = useState(latestApproval?.routeDueAt ?? '')
  const [nextReviewAt, setNextReviewAt] = useState(latestApproval?.nextReviewAt ?? '')
  const [approvalRationale, setApprovalRationale] = useState(latestApproval?.rationale ?? '')
  const [approvalAuditHistory] = useState(
    latestApproval?.auditHistory ?? [],
  )
  const [dispositions, setDispositions] = useState<Record<string, ReadinessEvidenceExceptionDisposition>>(
    () =>
      Object.fromEntries(
        latestApproval?.dispositions.map((disposition) => [disposition.exceptionId, disposition]) ?? [],
      ),
  )
  const packet = createReadinessEvidencePacket({
    backendRecords,
    environment,
    readinessChecks,
    readinessSummary,
    reports,
  })
  const canonicalLoads = packet.canonicalLoads
  const latestCanonicalLoad = canonicalLoads[0]
  const approvalDispositions = packet.openExceptions.map((exception) => ({
    exception,
    disposition:
      dispositions[exception.id] ?? {
        exceptionId: exception.id,
        status: 'open' as ReadinessEvidenceExceptionDispositionStatus,
        owner: '',
        dueDate: '',
        rationale: '',
        updatedAt: new Date().toISOString(),
      },
  }))
  const approval: ReadinessEvidenceApproval = {
    status: approvalStatus,
    reviewer,
    routeStage,
    routedReviewers: routedReviewers
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    routeDueAt,
    reviewedAt: approvalStatus === 'draft' ? latestApproval?.reviewedAt : new Date().toISOString(),
    nextReviewAt,
    rationale: approvalRationale,
    dispositions: approvalDispositions.map(({ disposition }) => disposition),
    auditHistory: approvalAuditHistory,
  }

  function approvalForSave(): ReadinessEvidenceApproval {
    const timestamp = new Date().toISOString()
    const routed = routedReviewers
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    const auditAction = evidenceApprovalAuditAction(approvalStatus)
    return {
      ...approval,
      reviewedAt: approvalStatus === 'draft' ? latestApproval?.reviewedAt : timestamp,
      routedReviewers: routed,
      auditHistory: [
        ...(approval.auditHistory ?? []),
        {
          action: routed.length > 0 && approvalStatus === 'draft' ? 'routed' : auditAction,
          actor: reviewer || 'unassigned reviewer',
          routeStage,
          status: approvalStatus,
          timestamp,
          summary:
            routed.length > 0
              ? `${evidenceApprovalLabel(approvalStatus)} packet routed to ${routed.join(', ')}.`
              : `${evidenceApprovalLabel(approvalStatus)} packet updated by ${reviewer || 'unassigned reviewer'}.`,
        },
      ],
    }
  }

  function updateDisposition(
    exceptionId: string,
    patch: Partial<Omit<ReadinessEvidenceExceptionDisposition, 'exceptionId' | 'updatedAt'>>,
  ) {
    setDispositions((current) => {
      const existing = current[exceptionId] ?? {
        exceptionId,
        status: 'open' as ReadinessEvidenceExceptionDispositionStatus,
        owner: '',
        dueDate: '',
        rationale: '',
        updatedAt: new Date().toISOString(),
      }
      return {
        ...current,
        [exceptionId]: {
          ...existing,
          ...patch,
          updatedAt: new Date().toISOString(),
        },
      }
    })
  }

  return (
    <>
      <section className="connector-toolbar panel">
        <div>
          <h2>Readiness Evidence Packet</h2>
          <p>
            Package canonical-load records, report freshness, and readiness exceptions into a versioned evidence artifact.
          </p>
        </div>
        <div className="toolbar-actions">
          <button className="secondary-action" onClick={() => onSavePacket(approvalForSave())} type="button">
            <ServerCog size={15} />
            Save Packet
          </button>
          <button className="primary-action" onClick={() => onDownloadPacket(approvalForSave())} type="button">
            <Download size={16} />
            Save & Export
          </button>
        </div>
      </section>

      <section className="evidence-grid">
        <section className="panel evidence-status-panel">
          <PanelHeader
            icon={ClipboardCheck}
            title="Packet Status"
            subtitle="Current evidence score before saving a new packet version."
          />
          <div className="latest-contract">
            <StatusChip status={packet.status} label={packet.status} />
            <h3>{environment.toUpperCase()} readiness packet</h3>
            <p>{packet.evidence}</p>
            <div className="metadata-grid">
              <Metadata label="Canonical loads" value={String(packet.summary.canonicalLoads)} />
              <Metadata label="Report items" value={String(packet.summary.reportCatalogItems)} />
              <Metadata label="Open exceptions" value={String(packet.summary.openExceptions)} />
              <Metadata label="Approval state" value={evidenceApprovalLabel(approval.status)} />
              <Metadata label="Generated" value={new Date(packet.generatedAt).toLocaleString()} />
            </div>
          </div>
        </section>

        <section className="panel evidence-status-panel">
          <PanelHeader
            icon={Gauge}
            title="Report Freshness"
            subtitle="BI/report catalog freshness evidence included in the packet."
          />
          <div className="metadata-grid">
            <Metadata label="Fresh" value={String(packet.reportFreshness.pass)} />
            <Metadata label="Warning" value={String(packet.reportFreshness.warning)} />
            <Metadata label="Blocking" value={String(packet.reportFreshness.blocking)} />
            <Metadata label="Total" value={String(packet.reportFreshness.total)} />
          </div>
          <div className="evidence-list">
            {reports.slice(0, 4).map((report) => (
              <div className="evidence-list-item" key={report.id}>
                <StatusChip status={report.refreshStatus} label={report.refreshStatus} />
                <div>
                  <strong>{report.title}</strong>
                  <span>{report.freshnessEvidence}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="panel evidence-approval-panel">
        <PanelHeader
          icon={CheckCircle2}
          title="Approval Workflow"
          subtitle="Capture reviewer decision, exception dispositions, owners, and follow-up dates before saving packet evidence."
        />
        <div className="evidence-approval-grid">
          <div className="template-editor-form evidence-approval-form">
            <label>
              <span>Approval state</span>
              <select
                value={approvalStatus}
                onChange={(event) => setApprovalStatus(event.target.value as ReadinessEvidenceApprovalStatus)}
              >
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="approved_with_exceptions">Approved with exceptions</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
            <label>
              <span>Reviewer</span>
              <input value={reviewer} onChange={(event) => setReviewer(event.target.value)} />
            </label>
            <label>
              <span>Route stage</span>
              <select
                value={routeStage}
                onChange={(event) =>
                  setRouteStage(event.target.value as NonNullable<ReadinessEvidenceApproval['routeStage']>)
                }
              >
                <option value="quality_review">Quality review</option>
                <option value="operations_review">Operations review</option>
                <option value="executive_signoff">Executive signoff</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <label>
              <span>Route due date</span>
              <input type="date" value={routeDueAt} onChange={(event) => setRouteDueAt(event.target.value)} />
            </label>
            <label>
              <span>Next review date</span>
              <input type="date" value={nextReviewAt} onChange={(event) => setNextReviewAt(event.target.value)} />
            </label>
            <label className="template-editor-notes">
              <span>Routed reviewers</span>
              <input value={routedReviewers} onChange={(event) => setRoutedReviewers(event.target.value)} />
            </label>
            <label className="template-editor-notes">
              <span>Approval rationale</span>
              <textarea value={approvalRationale} onChange={(event) => setApprovalRationale(event.target.value)} />
            </label>
          </div>
          <div className="latest-contract">
            <StatusChip status={evidenceApprovalStatusLevel(approval.status)} label={evidenceApprovalLabel(approval.status)} />
            <h3>{reviewer || 'Reviewer not assigned'}</h3>
            <p>{approvalRationale || 'No approval rationale has been recorded yet.'}</p>
            <div className="metadata-grid">
              <Metadata label="Disposition rows" value={String(approval.dispositions.length)} />
              <Metadata label="Route stage" value={titleize(routeStage)} />
              <Metadata label="Routed reviewers" value={approval.routedReviewers?.join(', ') || 'Not routed'} />
              <Metadata label="Route due" value={routeDueAt || 'No due date'} />
              <Metadata label="Next review" value={nextReviewAt || 'Not scheduled'} />
              <Metadata label="Saved packets" value={String(evidenceRecords.length)} />
              <Metadata label="Packet record status" value={mostSevereStatus([packet.status, evidenceApprovalStatusLevel(approval.status)])} />
            </div>
          </div>
        </div>
      </section>

      <section className="evidence-grid">
        <section className="panel">
          <PanelHeader
            icon={Database}
            title="Canonical Load Evidence"
            subtitle="Persisted canonical-load records prove source-to-canonical movement."
          />
          {latestCanonicalLoad ? (
            <div className="latest-contract">
              <StatusChip status={latestCanonicalLoad.status} label={`v${latestCanonicalLoad.version}`} />
              <h3>{latestCanonicalLoad.label}</h3>
              <p>{latestCanonicalLoad.summary}</p>
              <div className="metadata-grid">
                <Metadata label="Loaded" value={new Date(latestCanonicalLoad.createdAt).toLocaleString()} />
                <Metadata label="Objects" value={String(latestCanonicalLoad.payload.objectCount)} />
                <Metadata label="Trace links" value={String(latestCanonicalLoad.payload.linkCount)} />
                <Metadata label="Quality events" value={String(latestCanonicalLoad.payload.qualityEventCount)} />
              </div>
            </div>
          ) : (
            <div className="empty-state">Run Mapping Studio Load Canonical to create canonical-load evidence.</div>
          )}
        </section>

        <section className="panel">
          <PanelHeader
            icon={TriangleAlert}
            title="Exception Dispositions"
            subtitle="Warnings and blocking items that need remediation, acceptance, deferral, or closure."
          />
          {approvalDispositions.length > 0 ? (
            <div className="evidence-list">
              {approvalDispositions.slice(0, 8).map(({ disposition, exception }) => (
                <div className="evidence-list-item disposition-list-item" key={exception.id}>
                  <StatusChip status={exception.status} label={exception.status} />
                  <div>
                    <strong>{exception.summary}</strong>
                    <span>{exception.evidence}</span>
                    <small>{exception.remediation}</small>
                    <div className="disposition-controls">
                      <select
                        value={disposition.status}
                        onChange={(event) =>
                          updateDisposition(exception.id, {
                            status: event.target.value as ReadinessEvidenceExceptionDispositionStatus,
                          })
                        }
                      >
                        <option value="open">Open</option>
                        <option value="accepted_risk">Accepted risk</option>
                        <option value="remediation_planned">Remediation planned</option>
                        <option value="resolved">Resolved</option>
                        <option value="deferred">Deferred</option>
                      </select>
                      <input
                        placeholder="Owner"
                        value={disposition.owner}
                        onChange={(event) => updateDisposition(exception.id, { owner: event.target.value })}
                      />
                      <input
                        type="date"
                        value={disposition.dueDate}
                        onChange={(event) => updateDisposition(exception.id, { dueDate: event.target.value })}
                      />
                    </div>
                    <textarea
                      className="disposition-rationale"
                      placeholder="Disposition rationale"
                      value={disposition.rationale}
                      onChange={(event) => updateDisposition(exception.id, { rationale: event.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No open readiness or report freshness exceptions require disposition.</div>
          )}
        </section>
      </section>

      <section className="panel">
        <PanelHeader
          icon={History}
          title="Saved Evidence Packets"
          subtitle="Backend records created from this readiness evidence export."
        />
        {latestPacket ? (
          <div className="latest-contract">
            <StatusChip status={latestPacket.status} label={`v${latestPacket.version}`} />
            <h3>{latestPacket.label}</h3>
            <p>{latestPacket.summary}</p>
            <div className="metadata-grid">
              <Metadata label="Saved" value={new Date(latestPacket.createdAt).toLocaleString()} />
              <Metadata label="Packet status" value={latestPacket.payload.status} />
              <Metadata label="Approval" value={evidenceApprovalLabel(latestPacket.payload.approval?.status ?? 'draft')} />
              <Metadata label="Reviewer" value={latestPacket.payload.approval?.reviewer || 'Not assigned'} />
              <Metadata label="Route stage" value={titleize(latestPacket.payload.approval?.routeStage ?? 'quality_review')} />
              <Metadata
                label="Routed reviewers"
                value={latestPacket.payload.approval?.routedReviewers?.join(', ') || 'Not routed'}
              />
              <Metadata label="Open exceptions" value={String(latestPacket.payload.summary.openExceptions)} />
              <Metadata label="Canonical loads" value={String(latestPacket.payload.summary.canonicalLoads)} />
            </div>
            {latestPacket.payload.approval?.auditHistory?.length ? (
              <div className="evidence-approval-history">
                <h4>Approval Audit History</h4>
                {latestPacket.payload.approval.auditHistory.slice(-5).reverse().map((entry) => (
                  <div className="connector-run-row" key={`${entry.timestamp}-${entry.action}`}>
                    <div>
                      <strong>{titleize(entry.action)}</strong>
                      <span>
                        {entry.actor} / {titleize(entry.routeStage)} / {new Date(entry.timestamp).toLocaleString()}
                      </span>
                      <small>{entry.summary}</small>
                    </div>
                    <StatusChip status={evidenceApprovalStatusLevel(entry.status)} label={entry.status} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="empty-state">No readiness evidence packet has been saved yet.</div>
        )}
      </section>
    </>
  )
}

function ContractWorkspace({
  backendHealth,
  backendRecords,
  contractRecords,
  onDownloadContract,
  onSaveContract,
  readinessSummary,
}: {
  backendHealth: BackendHealth | null
  backendRecords: BackendRecord[]
  contractRecords: BackendRecord[]
  onDownloadContract: () => void
  onSaveContract: () => void
  readinessSummary: Record<StatusLevel, number>
}) {
  const latestContract = contractRecords[0]
  const currentStatus: StatusLevel =
    readinessSummary.blocking > 0 ? 'blocking' : readinessSummary.warning > 0 ? 'warning' : 'pass'

  return (
    <>
      <section className="connector-toolbar panel">
        <div>
          <h2>Integration Contract Workspace</h2>
          <p>
            Persist the current deployment contract as a backend record and download the same payload for governance review.
          </p>
        </div>
        <div className="toolbar-actions">
          <button className="secondary-action" onClick={onSaveContract} type="button">
            <ServerCog size={15} />
            Save Contract
          </button>
          <button className="primary-action" onClick={onDownloadContract} type="button">
            <Download size={16} />
            Save & Export
          </button>
        </div>
      </section>

      <section className="contract-grid">
        <section className="panel contract-status-panel">
          <PanelHeader
            icon={FileCog}
            title="Current Contract Readiness"
            subtitle="Readiness summary used to status the persisted integration contract."
          />
          <div className="readiness-score">
            <div className="score pass">
              <strong>{readinessSummary.pass}</strong>
              <span>Pass</span>
            </div>
            <div className="score warning">
              <strong>{readinessSummary.warning}</strong>
              <span>Warning</span>
            </div>
            <div className="score blocking">
              <strong>{readinessSummary.blocking}</strong>
              <span>Blocking</span>
            </div>
          </div>
          <div className="contract-metadata-grid">
            <Metadata label="Contract status" value={currentStatus} />
            <Metadata label="Backend mode" value={backendHealth?.mode ?? 'not checked'} />
            <Metadata label="Backend records" value={String(backendRecords.length)} />
            <Metadata label="Saved contracts" value={String(contractRecords.length)} />
          </div>
        </section>

        <section className="panel contract-latest-panel">
          <PanelHeader
            icon={History}
            title="Latest Saved Contract"
            subtitle="Most recent persisted contract record."
          />
          {latestContract ? (
            <div className="latest-contract">
              <StatusChip status={latestContract.status} label={latestContract.status} />
              <h3>{latestContract.label}</h3>
              <p>{latestContract.summary}</p>
              <div className="metadata-grid">
                <Metadata label="Version" value={`v${latestContract.version}`} />
                <Metadata label="Saved" value={new Date(latestContract.createdAt).toLocaleString()} />
              </div>
            </div>
          ) : (
            <div className="empty-state compact">Save a contract to create backend history.</div>
          )}
        </section>
      </section>

      <section className="panel contract-history-panel">
        <PanelHeader
          icon={ScrollText}
          title="Contract History"
          subtitle="Versioned integration contract records saved through the backend boundary."
        />
        {contractRecords.length > 0 ? (
          <div className="versions-table">
            <div className="version-row version-head">
              <span>Label</span>
              <span>Status</span>
              <span>Version</span>
              <span>Saved</span>
              <span>Summary</span>
            </div>
            {contractRecords.map((contract) => (
              <div className="version-row contract-version-row" key={contract.id}>
                <strong>{contract.label}</strong>
                <StatusChip status={contract.status} label={contract.status} />
                <span>v{contract.version}</span>
                <span>{new Date(contract.createdAt).toLocaleString()}</span>
                <span>{contract.summary}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No integration contracts have been saved yet.</div>
        )}
      </section>
    </>
  )
}

function BackendPersistenceView({
  adapterContracts,
  adapterDryRuns,
  backendHealth,
  backendRecords,
  connectorEntries,
  onRefresh,
  onRunAdapterDryRun,
  onSaveSnapshot,
  storageSchema,
}: {
  adapterContracts: AdapterContract[]
  adapterDryRuns: Record<string, AdapterDryRunResult>
  backendHealth: BackendHealth | null
  backendRecords: BackendRecord[]
  connectorEntries: [string, AppConfig['connectors']['connectors'][string]][]
  onRefresh: () => void
  onRunAdapterDryRun: (connectorId: string) => void
  onSaveSnapshot: () => void
  storageSchema: RecordStoreSchema | null
}) {
  const recordCounts = backendRecords.reduce(
    (summary, record) => {
      summary[record.kind] = (summary[record.kind] ?? 0) + 1
      return summary
    },
    {} as Record<string, number>,
  )

  return (
    <>
      <section className="connector-toolbar panel">
        <div>
          <h2>Backend Persistence Boundary</h2>
          <p>
            Browser-local storage now behaves like a backend adapter with versioned records, health checks, and live adapter contract dry runs.
          </p>
        </div>
        <div className="toolbar-actions">
          <button className="secondary-action" onClick={onRefresh} type="button">
            <Activity size={15} />
            Refresh
          </button>
          <button className="primary-action" onClick={onSaveSnapshot} type="button">
            <ServerCog size={16} />
            Save Snapshot
          </button>
        </div>
      </section>

      <section className="backend-grid">
        <section className="panel backend-health-panel">
          <PanelHeader
            icon={ServerCog}
            title="Backend Health"
            subtitle="Current persistence adapter status before replacing local storage with an API."
          />
          {backendHealth ? (
            <>
              <div className="backend-health-card">
                <StatusChip status={backendHealth.status} label={backendHealth.status} />
                <strong>{backendHealth.mode}</strong>
                <span>{backendHealth.endpoint}</span>
              </div>
              <div className="metadata-grid">
                <Metadata label="Records" value={String(backendHealth.records)} />
                <Metadata label="Store" value={backendHealth.store?.mode ?? backendHealth.mode} />
                <Metadata label="Latency" value={`${backendHealth.latencyMs} ms`} />
                <Metadata label="Checked" value={new Date(backendHealth.checkedAt).toLocaleTimeString()} />
                <Metadata label="Evidence" value={backendHealth.evidence} />
              </div>
            </>
          ) : (
            <div className="empty-state compact">Refresh backend health to capture evidence.</div>
          )}
        </section>

        <section className="panel backend-record-panel">
          <PanelHeader
            icon={History}
            title="Persisted Records"
            subtitle={`${backendRecords.length} versioned backend record(s) stored by the local adapter.`}
          />
          <div className="version-summary backend-summary">
            <span>{recordCounts.deployment_profile ?? 0} profiles</span>
            <span>{recordCounts.adapter_contract ?? 0} adapters</span>
            <span>{recordCounts.integration_contract ?? 0} contracts</span>
          </div>
          {backendRecords.length > 0 ? (
            <div className="backend-record-list">
              {backendRecords.slice(0, 8).map((record) => (
                <div className="backend-record-row" key={record.id}>
                  <div>
                    <strong>{record.label}</strong>
                    <span>
                      {titleize(record.kind)} / v{record.version} / {new Date(record.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <StatusChip status={record.status} label={record.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state compact">Save a deployment snapshot or run an adapter dry run.</div>
          )}
        </section>
      </section>

      <section className="backend-grid lower">
        <section className="panel adapter-contract-panel">
          <PanelHeader
            icon={PlugZap}
            title="Live Adapter Contracts"
            subtitle={`${adapterContracts.length} adapter interfaces ready for backend implementation.`}
          />
          <div className="adapter-contract-list">
            {adapterContracts.map((contract) => (
              <article className="adapter-contract-card" key={contract.id}>
                <div>
                  <strong>{contract.displayName}</strong>
                  <span>{contract.connectorType}</span>
                </div>
                <div className="operation-list">
                  {contract.operations.map((operation) => (
                    <span className="chip active" key={operation}>
                      {titleize(operation)}
                    </span>
                  ))}
                </div>
                <p>{contract.evidenceRequired.slice(0, 3).join(', ')}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel adapter-dry-run-panel">
          <PanelHeader
            icon={ClipboardCheck}
            title="Adapter Dry Runs"
            subtitle="Execute contract-level checks against configured connector manifests."
          />
          <div className="connector-list dry-run-list">
            {connectorEntries.map(([id, connector]) => {
              const result = adapterDryRuns[id]
              return (
                <button
                  className="connector-row"
                  key={id}
                  onClick={() => onRunAdapterDryRun(id)}
                  type="button"
                >
                  <ConnectorGlyph type={connector.type} />
                  <div>
                    <strong>{connector.display_name}</strong>
                    <span>
                      {result
                        ? `${result.operations.length} operation(s), ${result.sampleResponse.previewRows} preview row target`
                        : 'Run backend adapter dry run'}
                    </span>
                  </div>
                  <StatusChip status={result?.status ?? 'warning'} label={result ? result.status : 'Not run'} />
                </button>
              )
            })}
          </div>
        </section>
      </section>

      <section className="panel storage-schema-panel">
        <PanelHeader
          icon={Database}
          title="Record Store Schema Blueprint"
          subtitle={storageSchema ? `${storageSchema.schemaVersion} with ${storageSchema.tables.length} table definition(s).` : 'Storage schema has not loaded yet.'}
        />
        {storageSchema ? (
          <div className="storage-schema-grid">
            {storageSchema.tables.map((table) => (
              <article className="storage-table-card" key={table.name}>
                <div>
                  <strong>{table.name}</strong>
                  <span>{table.purpose}</span>
                </div>
                <div className="storage-column-list">
                  {table.columns.slice(0, 9).map((column) => (
                    <span key={column.name}>
                      {column.name} <em>{column.type}</em>
                    </span>
                  ))}
                </div>
              </article>
            ))}
            <article className="storage-table-card">
              <div>
                <strong>Indexes</strong>
                <span>Initial query paths required for version history, status rollups, and relationship lookup.</span>
              </div>
              <div className="storage-column-list">
                {storageSchema.indexes.map((index) => (
                  <span key={index}>{index}</span>
                ))}
              </div>
            </article>
          </div>
        ) : (
          <div className="empty-state compact">Refresh backend health to load the storage schema blueprint.</div>
        )}
      </section>
    </>
  )
}

function ExtractionJobForm({
  activeConnectorName,
  extractionJobs,
  onCreateExtractionJob,
  onRunExtractionJob,
  onSelectJob,
  selectedJob,
}: {
  activeConnectorName: string
  extractionJobs: BackendRecord<ExtractionJobPayload>[]
  onCreateExtractionJob: (policy: {
    status: ExtractionJobPayload['status']
    scheduleMode: ExtractionJobPayload['scheduleMode']
    scheduleCadence: ExtractionJobPayload['scheduleCadence']
    nextRunAt: string
    maxRetries: number
    retryDelayMinutes: number
    retryOnWarnings: boolean
  }) => void
  onRunExtractionJob: (job: BackendRecord<ExtractionJobPayload>) => void
  onSelectJob: (jobId: string) => void
  selectedJob?: BackendRecord<ExtractionJobPayload>
}) {
  const [jobStatus, setJobStatus] = useState<ExtractionJobPayload['status']>(selectedJob?.payload.status ?? 'active')
  const [scheduleMode, setScheduleMode] = useState<ExtractionJobPayload['scheduleMode']>(
    selectedJob?.payload.scheduleMode ?? 'manual',
  )
  const [scheduleCadence, setScheduleCadence] = useState<ExtractionJobPayload['scheduleCadence']>(
    selectedJob?.payload.scheduleCadence ?? 'on_demand',
  )
  const [nextRunAt, setNextRunAt] = useState(selectedJob?.payload.nextRunAt ?? '')
  const [maxRetries, setMaxRetries] = useState(String(selectedJob?.payload.retryPolicy?.maxRetries ?? 1))
  const [retryDelayMinutes, setRetryDelayMinutes] = useState(
    String(selectedJob?.payload.retryPolicy?.retryDelayMinutes ?? 15),
  )
  const [retryOnWarnings, setRetryOnWarnings] = useState(
    selectedJob?.payload.retryPolicy?.retryOnWarnings ?? true,
  )

  return (
    <div className="template-editor-form extraction-job-form">
      <label>
        <span>Saved job</span>
        <select
          value={selectedJob?.id ?? ''}
          onChange={(event) => onSelectJob(event.target.value)}
        >
          {extractionJobs.length > 0 ? (
            extractionJobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.payload.name}
              </option>
            ))
          ) : (
            <option value="">No saved extraction jobs</option>
          )}
        </select>
      </label>
      <label>
        <span>Active connector profile</span>
        <input readOnly value={activeConnectorName} />
      </label>
      <label>
        <span>Job status</span>
        <select value={jobStatus} onChange={(event) => setJobStatus(event.target.value as ExtractionJobPayload['status'])}>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="draft">Draft</option>
        </select>
      </label>
      <label>
        <span>Schedule mode</span>
        <select
          value={scheduleMode}
          onChange={(event) => setScheduleMode(event.target.value as ExtractionJobPayload['scheduleMode'])}
        >
          <option value="manual">Manual</option>
          <option value="scheduled_stub">Scheduled stub</option>
          <option value="disabled">Disabled</option>
        </select>
      </label>
      <label>
        <span>Cadence</span>
        <select
          value={scheduleCadence}
          onChange={(event) => setScheduleCadence(event.target.value as ExtractionJobPayload['scheduleCadence'])}
        >
          <option value="on_demand">On demand</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </label>
      <label>
        <span>Next run</span>
        <input value={nextRunAt} onChange={(event) => setNextRunAt(event.target.value)} />
      </label>
      <label>
        <span>Max retries</span>
        <input value={maxRetries} onChange={(event) => setMaxRetries(event.target.value)} />
      </label>
      <label>
        <span>Retry delay minutes</span>
        <input value={retryDelayMinutes} onChange={(event) => setRetryDelayMinutes(event.target.value)} />
      </label>
      <label className="extraction-retry-toggle">
        <span>Retry warnings</span>
        <input
          checked={retryOnWarnings}
          onChange={(event) => setRetryOnWarnings(event.target.checked)}
          type="checkbox"
        />
      </label>
      <div className="extraction-job-actions">
        <button
          className="secondary-action"
          onClick={() =>
            onCreateExtractionJob({
              status: jobStatus,
              scheduleMode,
              scheduleCadence,
              nextRunAt,
              maxRetries: Number(maxRetries) || 0,
              retryDelayMinutes: Number(retryDelayMinutes) || 0,
              retryOnWarnings,
            })
          }
          type="button"
        >
          <ServerCog size={15} />
          Save Extraction Job
        </button>
        <button
          className="primary-action"
          disabled={!selectedJob}
          onClick={() => selectedJob && onRunExtractionJob(selectedJob)}
          type="button"
        >
          <Database size={16} />
          Run Job
        </button>
      </div>
    </div>
  )
}

function QualityEventsView({
  events,
  onSelect,
  selectedEventId,
  traceabilityLinks,
}: {
  events: QualityEvent[]
  onSelect: (eventId: string) => void
  selectedEventId: string | null
  traceabilityLinks: TraceabilityLink[]
}) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? events[0]
  const statuses = useMemo(
    () => ['All', ...Array.from(new Set(events.map((event) => event.canonical.status))).sort()],
    [events],
  )
  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return events.filter((event) => {
      const matchesStatus = statusFilter === 'All' || event.canonical.status === statusFilter
      const haystack = [
        event.canonical.event_id,
        event.canonical.product_code,
        event.canonical.product_name,
        event.canonical.owner,
        event.canonical.narrative,
      ]
        .join(' ')
        .toLowerCase()
      return matchesStatus && (normalizedQuery.length === 0 || haystack.includes(normalizedQuery))
    })
  }, [events, query, statusFilter])
  const selectedLinks = selectedEvent
    ? traceabilityLinks.filter((link) => link.sourceObjectId === selectedEvent.id)
    : []

  return (
    <>
      <section className="connector-toolbar panel">
        <div>
          <h2>Quality Event Worklist</h2>
          <p>
            Canonical quality events are mapped from the source sample and ready for search, inspection, and traceability review.
          </p>
        </div>
        <div className="workflow-toolbar">
          <label>
            <Search size={15} />
            <input
              aria-label="Search quality events"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search event, product, owner"
              value={query}
            />
          </label>
          <select
            aria-label="Filter by status"
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {titleize(status)}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="workflow-grid">
        <section className="panel workflow-list-panel">
          <PanelHeader
            icon={ShieldCheck}
            title="Canonical Quality Events"
            subtitle={`${filteredEvents.length}/${events.length} event(s) visible.`}
          />
          <div className="workflow-list">
            {filteredEvents.map((event) => (
              <button
                className={selectedEvent?.id === event.id ? 'workflow-row selected' : 'workflow-row'}
                key={event.id}
                onClick={() => onSelect(event.id)}
                type="button"
              >
                <div>
                  <strong>{event.canonical.event_id}</strong>
                  <span>{event.canonical.product_name}</span>
                </div>
                <span>{event.canonical.owner}</span>
                <StatusChip status={severityStatus(event.canonical.severity)} label={event.canonical.severity} />
              </button>
            ))}
          </div>
        </section>

        <section className="panel workflow-detail-panel">
          <PanelHeader
            icon={ScrollText}
            title="Event Detail"
            subtitle={selectedEvent ? selectedEvent.displayName : 'Select a quality event.'}
          />
          {selectedEvent ? (
            <div className="workflow-detail">
              <div className="detail-heading">
                <div>
                  <h3>{selectedEvent.canonical.event_id}</h3>
                  <p>{selectedEvent.canonical.narrative}</p>
                </div>
                <StatusChip status={severityStatus(selectedEvent.canonical.severity)} label={selectedEvent.canonical.severity} />
              </div>
              <div className="metadata-grid">
                <Metadata label="Status" value={titleize(selectedEvent.canonical.status)} />
                <Metadata label="Event type" value={titleize(selectedEvent.canonical.event_type)} />
                <Metadata label="Product" value={`${selectedEvent.canonical.product_code} / ${selectedEvent.canonical.product_name}`} />
                <Metadata label="Lot / Serial" value={`${selectedEvent.canonical.lot_number} / ${selectedEvent.canonical.serial_number}`} />
                <Metadata label="Owner" value={selectedEvent.canonical.owner || 'Unassigned'} />
                <Metadata label="CAPA reference" value={selectedEvent.canonical.capa_reference_id || 'No CAPA reference'} />
                <Metadata label="Source connector" value={selectedEvent.sourceConnector} />
                <Metadata label="Source object" value={selectedEvent.sourceObject} />
              </div>
              <div className="relationship-list">
                <h4>Traceability Links</h4>
                {selectedLinks.map((link) => (
                  <div className="relationship-row" key={link.id}>
                    <Route size={15} />
                    <div>
                      <strong>{titleize(link.relationshipType)}</strong>
                      <span>{link.targetLabel} / {link.evidence}</span>
                    </div>
                    <StatusChip status={link.status} label={link.status} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">No quality events are loaded.</div>
          )}
        </section>
      </section>
    </>
  )
}

function ObjectExplorerView({ objects }: { objects: CanonicalObject[] }) {
  const familyCounts = objects.reduce(
    (summary, object) => {
      summary[object.family] = (summary[object.family] ?? 0) + 1
      return summary
    },
    {} as Record<string, number>,
  )

  return (
    <>
      <section className="connector-toolbar panel">
        <div>
          <h2>Canonical Object Registry</h2>
          <p>
            Objects are normalized into stable TRACS identities across quality, product, and traceability families.
          </p>
        </div>
        <div className="version-summary">
          {Object.entries(familyCounts).map(([family, count]) => (
            <span key={family}>{count} {titleize(family)}</span>
          ))}
        </div>
      </section>

      <section className="panel object-explorer-panel">
        <PanelHeader
          icon={Boxes}
          title="Canonical Objects"
          subtitle={`${objects.length} object(s) loaded from the current canonical sample.`}
        />
        <div className="object-registry-table">
          <div className="object-registry-row object-registry-head">
            <span>Object</span>
            <span>Family</span>
            <span>Status</span>
            <span>Source</span>
            <span>Canonical ID</span>
          </div>
          {objects.map((object) => (
            <div className="object-registry-row" key={object.id}>
              <div>
                <strong>{object.displayName}</strong>
                <span>{titleize(object.objectType)}</span>
              </div>
              <span className="chip active">{titleize(object.family)}</span>
              <span>{titleize(object.status)}</span>
              <span>{object.sourceConnector}</span>
              <span>{object.id}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function TraceabilityView({
  events,
  links,
  onSelectEvent,
  selectedEventId,
}: {
  events: QualityEvent[]
  links: TraceabilityLink[]
  onSelectEvent: (eventId: string) => void
  selectedEventId: string | null
}) {
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? events[0]
  const selectedLinks = selectedEvent
    ? links.filter((link) => link.sourceObjectId === selectedEvent.id)
    : []

  return (
    <>
      <section className="connector-toolbar panel">
        <div>
          <h2>Traceability Matrix</h2>
          <p>
            Follow quality-event relationships into product, lot/serial, return, and external CAPA references.
          </p>
        </div>
        <select
          aria-label="Select traceability event"
          className="workflow-select"
          onChange={(event) => onSelectEvent(event.target.value)}
          value={selectedEvent?.id ?? ''}
        >
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.canonical.event_id} / {event.canonical.product_code}
            </option>
          ))}
        </select>
      </section>

      <section className="traceability-grid">
        <section className="panel trace-source-panel">
          <PanelHeader
            icon={ShieldCheck}
            title="Source Event"
            subtitle={selectedEvent ? selectedEvent.displayName : 'No source event selected.'}
          />
          {selectedEvent ? (
            <div className="workflow-detail">
              <div className="trace-node source">
                <strong>{selectedEvent.canonical.event_id}</strong>
                <span>{selectedEvent.canonical.narrative}</span>
              </div>
              <div className="metadata-grid">
                <Metadata label="Product" value={selectedEvent.canonical.product_code} />
                <Metadata label="Lot" value={selectedEvent.canonical.lot_number} />
                <Metadata label="Serial" value={selectedEvent.canonical.serial_number} />
                <Metadata label="Status" value={titleize(selectedEvent.canonical.status)} />
              </div>
            </div>
          ) : (
            <div className="empty-state compact">No event selected.</div>
          )}
        </section>

        <section className="panel trace-links-panel">
          <PanelHeader
            icon={Route}
            title="Linked Objects"
            subtitle={`${selectedLinks.length} relationship(s) derived from canonical fields.`}
          />
          <div className="trace-node-list">
            {selectedLinks.map((link) => (
              <div className="trace-link-card" key={link.id}>
                <div className="trace-line" />
                <div className="trace-node">
                  <strong>{link.targetLabel}</strong>
                  <span>{titleize(link.targetObjectType)} / {titleize(link.relationshipType)}</span>
                </div>
                <p>{link.evidence}</p>
                <StatusChip status={link.status} label={link.status} />
              </div>
            ))}
          </div>
        </section>
      </section>
    </>
  )
}

function ReportCatalogView({
  canonicalObjects,
  onSaveReport,
  reports,
}: {
  canonicalObjects: CanonicalObject[]
  onSaveReport: (report: ReportCatalogItem, action: ReportCatalogSaveAction) => void
  reports: ReportCatalogItem[]
}) {
  const staleCount = reports.filter((report) => report.refreshStatus !== 'pass').length
  const [selectedReportId, setSelectedReportId] = useState(reports[0]?.id ?? '')
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0]

  return (
    <>
      <section className="connector-toolbar panel">
        <div>
          <h2>Report Catalog</h2>
          <p>
            Governed BI launch points show owner, workspace, semantic model, freshness, and canonical dependencies.
          </p>
        </div>
        <div className="version-summary">
          <span>{reports.length} reports</span>
          <span>{staleCount} need review</span>
        </div>
      </section>

      <section className="report-grid">
        {reports.map((report) => (
          <article className="panel report-card" key={report.id}>
            <div className="report-card-header">
              <div>
                <strong>{report.title}</strong>
                <span>{report.workspace} / {report.semanticModel}</span>
              </div>
              <StatusChip status={report.refreshStatus} label={report.refreshStatus} />
            </div>
            <div className="metadata-grid">
              <Metadata label="Platform" value={report.platform} />
              <Metadata label="Owner" value={report.owner} />
              <Metadata label="Last refresh" value={new Date(report.lastRefresh).toLocaleString()} />
              <Metadata label="Freshness SLA" value={`${report.maxAgeHours} hours`} />
              <Metadata label="Domains" value={report.domains.map(titleize).join(', ')} />
              <Metadata label="Freshness evidence" value={report.freshnessEvidence} />
              <Metadata label="Approval" value={reportApprovalLabel(report.approvalStatus)} />
              <Metadata label="Reviewer" value={report.approvalReviewer || 'Not assigned'} />
            </div>
            <div className="source-column-list report-dependencies">
              {report.sourceDependencies.map((dependency) => (
                <span className="chip active" key={dependency}>{dependency}</span>
              ))}
            </div>
            <div className="report-card-actions">
              <button className="secondary-action compact" onClick={() => setSelectedReportId(report.id)} type="button">
                <FileCog size={14} />
                Edit
              </button>
              <a className="secondary-link" href={report.url} target="_blank">
                <ExternalLink size={15} />
                Open Report
              </a>
            </div>
          </article>
        ))}
      </section>

      {selectedReport ? (
        <ReportCatalogEditor
          canonicalObjects={canonicalObjects}
          key={selectedReport.id}
          onSave={onSaveReport}
          report={selectedReport}
        />
      ) : null}
    </>
  )
}

function ReportCatalogEditor({
  canonicalObjects,
  onSave,
  report,
}: {
  canonicalObjects: CanonicalObject[]
  onSave: (report: ReportCatalogItem, action: ReportCatalogSaveAction) => void
  report: ReportCatalogItem
}) {
  const [title, setTitle] = useState(report.title)
  const [owner, setOwner] = useState(report.owner)
  const [workspace, setWorkspace] = useState(report.workspace)
  const [semanticModel, setSemanticModel] = useState(report.semanticModel)
  const [lastRefresh, setLastRefresh] = useState(report.lastRefresh)
  const [maxAgeHours, setMaxAgeHours] = useState(String(report.maxAgeHours))
  const [url, setUrl] = useState(report.url)
  const [dependencies, setDependencies] = useState(report.sourceDependencies.join(', '))
  const [domains, setDomains] = useState(report.domains.join(', '))
  const [approvalStatus, setApprovalStatus] = useState<NonNullable<ReportCatalogItem['approvalStatus']>>(
    report.approvalStatus ?? 'pending',
  )
  const [approvalReviewer, setApprovalReviewer] = useState(report.approvalReviewer ?? '')
  const [approvalRationale, setApprovalRationale] = useState(report.approvalRationale ?? '')

  function splitCsv(value: string) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  function draftReport(): ReportCatalogItem {
    const freshness = reportFreshnessStatus(lastRefresh, Number(maxAgeHours) || report.maxAgeHours)
    return {
      ...report,
      title,
      owner,
      workspace,
      semanticModel,
      lastRefresh,
      maxAgeHours: Number(maxAgeHours) || report.maxAgeHours,
      url,
      sourceDependencies: splitCsv(dependencies),
      domains: splitCsv(domains),
      approvalStatus,
      approvalReviewer,
      approvalRationale,
      ...freshness,
    }
  }

  const previewReport = draftReport()
  const gate = evaluateReportPublishGate(previewReport, canonicalObjects)

  return (
    <section className="panel report-editor-panel">
      <PanelHeader
        icon={FileCog}
        title="Report Catalog Editor"
        subtitle="Edit governed report metadata and run publish gates before release."
      />
      <div className="report-editor-grid">
        <div className="template-editor-form">
          <label>
            <span>Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            <span>Owner</span>
            <input value={owner} onChange={(event) => setOwner(event.target.value)} />
          </label>
          <label>
            <span>Workspace</span>
            <input value={workspace} onChange={(event) => setWorkspace(event.target.value)} />
          </label>
          <label>
            <span>Semantic model</span>
            <input value={semanticModel} onChange={(event) => setSemanticModel(event.target.value)} />
          </label>
          <label>
            <span>Last refresh</span>
            <input value={lastRefresh} onChange={(event) => setLastRefresh(event.target.value)} />
          </label>
          <label>
            <span>Freshness SLA hours</span>
            <input value={maxAgeHours} onChange={(event) => setMaxAgeHours(event.target.value)} />
          </label>
          <label className="template-editor-notes">
            <span>URL</span>
            <input value={url} onChange={(event) => setUrl(event.target.value)} />
          </label>
          <label className="template-editor-notes">
            <span>Source dependencies</span>
            <input value={dependencies} onChange={(event) => setDependencies(event.target.value)} />
          </label>
          <label className="template-editor-notes">
            <span>Domains</span>
            <input value={domains} onChange={(event) => setDomains(event.target.value)} />
          </label>
          <label>
            <span>Approval status</span>
            <select
              value={approvalStatus}
              onChange={(event) =>
                setApprovalStatus(event.target.value as NonNullable<ReportCatalogItem['approvalStatus']>)
              }
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="approved_with_conditions">Approved with conditions</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          <label>
            <span>Reviewer</span>
            <input value={approvalReviewer} onChange={(event) => setApprovalReviewer(event.target.value)} />
          </label>
          <label className="template-editor-notes">
            <span>Sign-off rationale</span>
            <textarea value={approvalRationale} onChange={(event) => setApprovalRationale(event.target.value)} />
          </label>
          <div className="report-editor-actions">
            <button className="secondary-action" onClick={() => onSave(draftReport(), 'draft')} type="button">
              <ServerCog size={15} />
              Save Draft
            </button>
            <button className="secondary-action" onClick={() => onSave(draftReport(), 'signoff')} type="button">
              <ShieldCheck size={15} />
              Save Sign-Off
            </button>
            <button className="primary-action" onClick={() => onSave(draftReport(), 'publish')} type="button">
              <CheckCircle2 size={16} />
              Run Publish Gate
            </button>
          </div>
        </div>
        <div className="template-editor-summary">
          <div className="latest-contract">
            <StatusChip status={gate.status} label={previewReport.publishStatus ?? gate.status} />
            <h3>{previewReport.title}</h3>
            <p>{gate.evidence}</p>
            <div className="metadata-grid">
              <Metadata label="Freshness" value={previewReport.refreshStatus} />
              <Metadata label="Freshness evidence" value={previewReport.freshnessEvidence} />
              <Metadata label="Dependencies" value={previewReport.sourceDependencies.join(', ')} />
              <Metadata label="Publish state" value={previewReport.publishStatus ?? 'unsaved draft'} />
              <Metadata label="Approval" value={reportApprovalLabel(previewReport.approvalStatus)} />
              <Metadata label="Reviewer" value={previewReport.approvalReviewer || 'Not assigned'} />
            </div>
          </div>
          {previewReport.approvalHistory?.length ? (
            <div className="report-approval-history">
              <h4>Approval History</h4>
              {previewReport.approvalHistory.slice(-4).reverse().map((entry) => (
                <div className="connector-run-row" key={`${entry.signedAt}-${entry.status}`}>
                  <div>
                    <strong>{reportApprovalLabel(entry.status)}</strong>
                    <span>
                      {entry.reviewer || 'Unassigned reviewer'} / {new Date(entry.signedAt).toLocaleString()}
                    </span>
                    <small>{entry.rationale || entry.evidence}</small>
                  </div>
                  <StatusChip status={reportApprovalStatusLevel(entry.status)} label={entry.status} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function SavedVersionsView({ savedVersions }: { savedVersions: SavedVersion[] }) {
  const counts = savedVersions.reduce(
    (summary, version) => {
      summary[version.kind] = (summary[version.kind] ?? 0) + 1
      return summary
    },
    {} as Record<string, number>,
  )

  function downloadVersion(version: SavedVersion) {
    downloadJson(`tracs-${version.kind}-${version.createdAt.slice(0, 10)}.json`, version)
  }

  return (
    <>
      <section className="connector-toolbar panel">
        <div>
          <h2>Saved Version Registry</h2>
          <p>
            Browser-persisted records for connector test runs, mapping validations, mapping manifest versions, and exported contracts.
          </p>
        </div>
        <div className="version-summary">
          <span>{savedVersions.length} saved</span>
          <span>{counts.connector_test ?? 0} connector</span>
          <span>{counts.mapping_validation ?? 0} mapping</span>
          <span>{counts.integration_contract ?? 0} contract</span>
        </div>
      </section>

      <section className="panel versions-panel">
        <PanelHeader
          icon={History}
          title="Version History"
          subtitle="Records are stored locally for this prototype and can be exported individually."
        />
        {savedVersions.length > 0 ? (
          <div className="versions-table">
            <div className="version-row version-head">
              <span>Type</span>
              <span>Label</span>
              <span>Status</span>
              <span>Saved</span>
              <span>Summary</span>
              <span>Export</span>
            </div>
            {savedVersions.map((version) => (
              <div className="version-row" key={version.id}>
                <strong>{titleize(version.kind)}</strong>
                <span>{version.label}</span>
                <StatusChip status={version.status} label={version.status} />
                <span>{new Date(version.createdAt).toLocaleString()}</span>
                <span>{version.summary}</span>
                <button className="icon-action" onClick={() => downloadVersion(version)} type="button">
                  <Download size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            Run connector tests, validate a mapping, or export a contract to create saved versions.
          </div>
        )}
      </section>
    </>
  )
}

function MappingStudio({
  canonicalLoadConnectorId,
  connectorEntries,
  csvSchema,
  csvText,
  extractionJobs,
  extractionRuns,
  latestCanonicalLoad,
  mapping,
  mappingResult,
  mappingRuns,
  onCsvTextChange,
  onCreateExtractionJob,
  onLoadConnectorChange,
  onLoadCanonical,
  onRunExtractionJob,
  onValidate,
}: {
  canonicalLoadConnectorId: string
  connectorEntries: Array<[string, AppConfig['connectors']['connectors'][string]]>
  csvSchema: CsvSchemaInference | null
  csvText: string
  extractionJobs: BackendRecord<ExtractionJobPayload>[]
  extractionRuns: BackendRecord<ExtractionRunPayload>[]
  latestCanonicalLoad?: BackendRecord<CanonicalLoadResult>
  mapping: AppConfig['mappings'][string]
  mappingResult: MappingValidationResult | null
  mappingRuns: BackendRecord[]
  onCsvTextChange: (value: string) => void
  onCreateExtractionJob: (policy: {
    status: ExtractionJobPayload['status']
    scheduleMode: ExtractionJobPayload['scheduleMode']
    scheduleCadence: ExtractionJobPayload['scheduleCadence']
    nextRunAt: string
    maxRetries: number
    retryDelayMinutes: number
    retryOnWarnings: boolean
  }) => void
  onLoadConnectorChange: (value: string) => void
  onLoadCanonical: () => void
  onRunExtractionJob: (job: BackendRecord<ExtractionJobPayload>) => void
  onValidate: () => void
}) {
  const summary = mappingResult
    ? summarizeReadiness(mappingResult.checks)
    : ({ pass: 0, warning: 0, blocking: 0 } as Record<StatusLevel, number>)
  const [selectedJobId, setSelectedJobId] = useState(extractionJobs[0]?.id ?? '')
  const selectedJob =
    extractionJobs.find((job) => job.id === selectedJobId) ??
    extractionJobs.find((job) => job.payload.connectorId === canonicalLoadConnectorId) ??
    extractionJobs[0]
  const selectedJobRuns = selectedJob
    ? extractionRuns.filter((run) => run.payload.jobId === selectedJob.payload.jobId)
    : []

  return (
    <>
      <section className="connector-toolbar panel">
        <div>
          <h2>Mapping Studio</h2>
          <p>
            Validate the configured quality_event manifest and load canonical records from configured connector profiles.
          </p>
        </div>
        <div className="toolbar-actions">
          <label className="load-source-control">
            <span>Load source</span>
            <select
              value={canonicalLoadConnectorId}
              onChange={(event) => onLoadConnectorChange(event.target.value)}
            >
              {connectorEntries
                .filter(([, connector]) =>
                  ['snowflake', 'sharepoint_excel', 'csv'].includes(connector.type),
                )
                .map(([connectorId, connector]) => (
                  <option key={connectorId} value={connectorId}>
                    {connector.display_name}
                  </option>
                ))}
            </select>
          </label>
          <button className="secondary-action" onClick={onLoadCanonical} type="button">
            <Database size={15} />
            Load Canonical
          </button>
          <button className="primary-action" onClick={onValidate} type="button">
            <ClipboardCheck size={16} />
            Validate Mapping
          </button>
        </div>
      </section>

      <section className="mapping-grid">
        <section className="panel mapping-source-panel">
          <PanelHeader
            icon={ScrollText}
            title="CSV Schema Inference"
            subtitle="Manual upload adapter starter using the included quality event sample."
          />
          <div className="mapping-editor">
            <textarea
              aria-label="CSV sample"
              value={csvText}
              onChange={(event) => onCsvTextChange(event.target.value)}
              spellCheck={false}
            />
          </div>
          {csvSchema ? (
            <div className="schema-summary">
              <strong>{csvSchema.rowCount}</strong>
              <span>sample rows</span>
              <strong>{csvSchema.columns.length}</strong>
              <span>columns inferred</span>
            </div>
          ) : null}
        </section>

        <section className="panel mapping-fields-panel">
          <PanelHeader
            icon={GitBranch}
            title="Source-to-Canonical Mapping"
            subtitle={`${Object.keys(mapping.fields).length} mapped fields for ${mapping.object}.`}
          />
          <div className="mapping-table">
            <div className="mapping-row mapping-head">
              <span>Target</span>
              <span>Source</span>
              <span>Required</span>
              <span>Status</span>
            </div>
            {(mappingResult?.mappedFields ??
              Object.entries(mapping.fields).map(([targetField, sourceField]) => ({
                targetField,
                sourceField,
                present: false,
                required: mapping.required.includes(targetField),
              }))).map((field) => (
              <div className="mapping-row" key={field.targetField}>
                <strong>{field.targetField}</strong>
                <span>{field.sourceField}</span>
                <span>{field.required ? 'Yes' : 'No'}</span>
                <StatusChip
                  label={field.present ? 'Present' : 'Missing'}
                  status={field.present ? 'pass' : field.required ? 'blocking' : 'warning'}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="panel mapping-evidence-panel">
          <PanelHeader
            icon={ClipboardCheck}
            title="Mapping Evidence"
            subtitle="Readiness checks produced by the mapping validator."
          />
          <div className="readiness-score">
            <div className="score pass">
              <strong>{summary.pass}</strong>
              <span>Pass</span>
            </div>
            <div className="score warning">
              <strong>{summary.warning}</strong>
              <span>Warning</span>
            </div>
            <div className="score blocking">
              <strong>{summary.blocking}</strong>
              <span>Blocking</span>
            </div>
          </div>
          {mappingResult ? (
            <div className="check-list">
              {mappingResult.checks.map((check) => {
                const Icon = statusIcon[check.status]
                return (
                  <div className={`check-row ${check.status}`} key={check.id}>
                    <Icon size={17} />
                    <div>
                      <strong>{check.label}</strong>
                      <span>{check.evidence}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty-state compact">Validate the mapping to capture evidence.</div>
          )}
          {mappingRuns.length > 0 ? (
            <div className="mapping-run-history">
              <h4>Persisted Mapping Runs</h4>
              {mappingRuns.slice(0, 4).map((run) => (
                <div className="mapping-run-row" key={run.id}>
                  <div>
                    <strong>{run.label}</strong>
                    <span>
                      v{run.version} / {new Date(run.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <StatusChip status={run.status} label={run.status} />
                </div>
              ))}
            </div>
          ) : null}
          {latestCanonicalLoad ? (
            <div className="mapping-run-history">
              <h4>Latest Canonical Load</h4>
              <div className="mapping-run-row">
                <div>
                  <strong>{latestCanonicalLoad.label}</strong>
                  <span>
                    v{latestCanonicalLoad.version} / {new Date(latestCanonicalLoad.createdAt).toLocaleString()} / {latestCanonicalLoad.summary}
                  </span>
                  {latestCanonicalLoad.payload.warnings.length > 0 ? (
                    <small>{latestCanonicalLoad.payload.warnings.join(' ')}</small>
                  ) : null}
                </div>
                <StatusChip status={latestCanonicalLoad.status} label={latestCanonicalLoad.status} />
              </div>
            </div>
          ) : null}
        </section>
      </section>

      <section className="panel extraction-job-panel">
        <PanelHeader
          icon={ServerCog}
          title="Connector Extraction Jobs"
          subtitle="Save reusable connector-backed jobs, then run them into canonical load and traceability records."
        />
        <div className="extraction-job-grid">
          <ExtractionJobForm
            activeConnectorName={
              connectorEntries.find(([connectorId]) => connectorId === canonicalLoadConnectorId)?.[1]
                .display_name ?? canonicalLoadConnectorId
            }
            extractionJobs={extractionJobs}
            key={selectedJob?.id ?? canonicalLoadConnectorId}
            onCreateExtractionJob={onCreateExtractionJob}
            onRunExtractionJob={onRunExtractionJob}
            onSelectJob={setSelectedJobId}
            selectedJob={selectedJob}
          />
          <div className="latest-contract">
            {selectedJob ? (
              <>
                <StatusChip status={selectedJob.status} label={selectedJob.payload.status} />
                <h3>{selectedJob.payload.name}</h3>
                <p>{selectedJob.payload.evidence}</p>
                <div className="metadata-grid">
                  <Metadata label="Connector" value={selectedJob.payload.connectorId} />
                  <Metadata label="Source object" value={selectedJob.payload.sourceObject} />
                  <Metadata label="Target object" value={selectedJob.payload.targetObject} />
                  <Metadata label="Cadence" value={titleize(selectedJob.payload.scheduleCadence)} />
                  <Metadata label="Next run" value={selectedJob.payload.nextRunAt || 'Manual only'} />
                  <Metadata label="Retry policy" value={`${selectedJob.payload.retryPolicy.maxRetries} retries / ${selectedJob.payload.retryPolicy.retryDelayMinutes} min`} />
                  <Metadata label="Runs" value={String(selectedJobRuns.length)} />
                </div>
              </>
            ) : (
              <div className="empty-state compact">Save the active connector profile as an extraction job.</div>
            )}
          </div>
        </div>
        {selectedJobRuns.length > 0 ? (
          <div className="mapping-run-history extraction-run-history">
            <h4>Extraction Run History</h4>
            {selectedJobRuns.slice(0, 4).map((run) => (
              <div className="mapping-run-row" key={run.id}>
                <div>
                  <strong>{run.payload.jobId}</strong>
                  <span>
                    v{run.version} / attempt {run.payload.attempt} of {run.payload.maxRetries + 1} / {new Date(run.createdAt).toLocaleString()} / {run.payload.result.objectCount} object(s), {run.payload.result.linkCount} link(s)
                  </span>
                  <small>
                    {run.payload.retryEligible
                      ? `Retry eligible after ${run.payload.retryDelayMinutes} minute(s).`
                      : 'Retry not required or policy exhausted.'}
                  </small>
                  {run.payload.warnings.length > 0 ? <small>{run.payload.warnings.join(' ')}</small> : null}
                </div>
                <StatusChip status={run.status} label={run.status} />
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {csvSchema ? (
        <section className="panel schema-panel">
          <PanelHeader
            icon={Search}
            title="Inferred Source Columns"
            subtitle="Previewed schema from the CSV/manual upload adapter starter."
          />
          <div className="schema-table">
            <div className="schema-row schema-head">
              <span>Column</span>
              <span>Type</span>
              <span>Non-empty</span>
              <span>Samples</span>
            </div>
            {csvSchema.columns.map((column) => (
              <div className="schema-row" key={column.name}>
                <strong>{column.name}</strong>
                <span className="chip active">{column.inferredType}</span>
                <span>{column.nonEmptyCount}</span>
                <span>{column.sampleValues.join(', ') || 'No values'}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}

function TemplatesView({
  assetRegistry,
  onActivateTemplate,
  onPromoteAsset,
  onRefreshAssets,
  onUpdateTemplate,
  templateRecords,
}: {
  assetRegistry: AssetRegistry | null
  onActivateTemplate: (templateRecord: BackendRecord<ControlledTemplatePayload>) => void
  onPromoteAsset: (asset: LocalAsset) => void
  onRefreshAssets: () => void
  onUpdateTemplate: (
    templateRecord: BackendRecord<ControlledTemplatePayload>,
    updates: Partial<ControlledTemplatePayload>,
  ) => void
  templateRecords: BackendRecord<ControlledTemplatePayload>[]
}) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const categories = useMemo(
    () => ['All', ...Object.keys(assetRegistry?.summary.byCategory ?? {}).sort()],
    [assetRegistry],
  )
  const filteredAssets = useMemo(() => {
    const assets = assetRegistry?.assets ?? []
    return activeCategory === 'All'
      ? assets
      : assets.filter((asset) => asset.category === activeCategory)
  }, [activeCategory, assetRegistry])
  const topAssets = filteredAssets.slice(0, 60)
  const latestTemplateRecords = useMemo(() => {
    const byTemplateId = new Map<string, BackendRecord<ControlledTemplatePayload>>()
    templateRecords
      .slice()
      .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
      .forEach((record) => {
        if (!byTemplateId.has(record.payload.templateId)) {
          byTemplateId.set(record.payload.templateId, record)
        }
      })
    return Array.from(byTemplateId.values())
  }, [templateRecords])
  const controlledByAssetId = useMemo(() => {
    return new Map(latestTemplateRecords.map((record) => [record.payload.source.id, record]))
  }, [latestTemplateRecords])
  const assetById = useMemo(() => {
    return new Map((assetRegistry?.assets ?? []).map((asset) => [asset.id, asset]))
  }, [assetRegistry])
  const activeTemplates = latestTemplateRecords.filter(
    (record) => record.payload.status === 'active',
  ).length
  const selectedTemplate =
    latestTemplateRecords.find((record) => record.id === selectedTemplateId) ??
    latestTemplateRecords[0]

  return (
    <>
      <section className="connector-toolbar panel">
        <div>
          <h2>Template Library</h2>
          <p>
            Use controlled TRACS starters and local MYROBOTS assets as the source library for deployment templates, QMS procedures, schemas, and reference packages.
          </p>
        </div>
        <div className="toolbar-actions">
          <button className="secondary-action" onClick={onRefreshAssets} type="button">
            <Search size={15} />
            Rescan Assets
          </button>
          <a className="secondary-link" href="/config/templates/integration_contract.template.md" target="_blank">
            <ExternalLink size={15} />
            Open Contract Template
          </a>
        </div>
      </section>

      <section className="template-grid">
        {templateCatalog.map((template) => (
          <article className="panel template-card" key={template.file}>
            <div className="template-card-header">
              <PanelTop size={18} />
              <span>{template.type}</span>
            </div>
            <h2>{template.name}</h2>
            <p>{template.purpose}</p>
            <div className="template-file">{template.file}</div>
            <a href={`/config/templates/${template.file}`} target="_blank">
              View template
              <ExternalLink size={14} />
            </a>
          </article>
        ))}
      </section>

      <section className="asset-library-grid">
        <section className="panel asset-summary-panel">
          <PanelHeader
            icon={PanelTop}
            title="MYROBOTS Asset Registry"
            subtitle={assetRegistry ? `${assetRegistry.assets.length} scanned assets from ${assetRegistry.root}.` : 'Asset registry has not loaded yet.'}
          />
          {assetRegistry ? (
            <>
              <div className="asset-summary-grid">
                <Metadata label="Total assets" value={String(assetRegistry.summary.total)} />
                <Metadata label="Templates" value={String(assetRegistry.summary.byKind.template ?? 0)} />
                <Metadata label="Schemas" value={String(assetRegistry.summary.byKind.database_schema ?? 0)} />
                <Metadata label="Controlled" value={String(latestTemplateRecords.length)} />
                <Metadata label="Active" value={String(activeTemplates)} />
                <Metadata label="Scanned" value={new Date(assetRegistry.scannedAt).toLocaleString()} />
              </div>
              <div className="asset-category-list">
                {categories.map((category) => (
                  <button
                    className={activeCategory === category ? 'asset-filter active' : 'asset-filter'}
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    type="button"
                  >
                    <span>{category}</span>
                    <strong>
                      {category === 'All'
                        ? assetRegistry.summary.total
                        : assetRegistry.summary.byCategory[category] ?? 0}
                    </strong>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state compact">Start the TRACS API to scan local MYROBOTS assets.</div>
          )}
        </section>

        <section className="panel asset-list-panel">
          <PanelHeader
            icon={ScrollText}
            title="Local Asset Candidates"
            subtitle={`${topAssets.length}/${filteredAssets.length} asset(s) shown for ${activeCategory}.`}
          />
          {topAssets.length > 0 ? (
            <div className="asset-list">
              {topAssets.map((asset) => (
                <AssetRow
                  asset={asset}
                  controlledRecord={controlledByAssetId.get(asset.id)}
                  key={asset.id}
                  onPromote={onPromoteAsset}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state compact">No local assets found for this filter.</div>
          )}
        </section>
      </section>

      <section className="panel controlled-template-panel">
        <PanelHeader
          icon={ShieldCheck}
          title="Controlled Template Records"
          subtitle="Promoted assets become governed TRACS templates with source provenance, version history, and deployment tags."
        />
        {latestTemplateRecords.length > 0 ? (
          <div className="controlled-template-table">
            <div className="controlled-template-row controlled-template-head">
              <span>Template</span>
              <span>Status</span>
              <span>Classification</span>
              <span>Tags</span>
              <span>Source</span>
              <span>Action</span>
            </div>
            {latestTemplateRecords.map((record) => (
              <TemplateRecordRow
                currentAsset={assetById.get(record.payload.source.id)}
                key={record.id}
                onActivate={onActivateTemplate}
                onEdit={setSelectedTemplateId}
                templateRecord={record}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">Promote a local asset to create the first controlled template record.</div>
        )}
      </section>

      {selectedTemplate ? (
        <TemplateRecordEditor
          currentAsset={assetById.get(selectedTemplate.payload.source.id)}
          key={selectedTemplate.id}
          onSave={onUpdateTemplate}
          templateRecord={selectedTemplate}
        />
      ) : null}
    </>
  )
}

function AssetRow({
  asset,
  controlledRecord,
  onPromote,
}: {
  asset: LocalAsset
  controlledRecord?: BackendRecord<ControlledTemplatePayload>
  onPromote: (asset: LocalAsset) => void
}) {
  return (
    <div className="asset-row">
      <div>
        <strong>{asset.name}</strong>
        <span>{asset.relativePath}</span>
      </div>
      <span className="chip active">{asset.category}</span>
      <span className="asset-source">{asset.sourceFamily}</span>
      <span className="asset-kind">{titleize(asset.kind)}</span>
      {controlledRecord ? (
        <span className="controlled-state">{controlledRecord.payload.status}</span>
      ) : (
        <button className="secondary-action compact" onClick={() => onPromote(asset)} type="button">
          <ShieldCheck size={14} />
          Promote
        </button>
      )}
    </div>
  )
}

function TemplateRecordRow({
  currentAsset,
  onActivate,
  onEdit,
  templateRecord,
}: {
  currentAsset?: LocalAsset
  onActivate: (templateRecord: BackendRecord<ControlledTemplatePayload>) => void
  onEdit: (recordId: string) => void
  templateRecord: BackendRecord<ControlledTemplatePayload>
}) {
  const template = templateRecord.payload
  const sourceChanged =
    Boolean(currentAsset?.fingerprint) && currentAsset?.fingerprint !== template.source.fingerprint

  return (
    <div className="controlled-template-row">
      <div>
        <strong>{templateRecord.label}</strong>
        <span>{template.templateId}</span>
      </div>
      <StatusChip
        status={template.status === 'active' ? 'pass' : 'warning'}
        label={template.status}
      />
      <div>
        <strong>{template.classification.category}</strong>
        <span>{titleize(template.classification.domain)} / {titleize(template.classification.kind)}</span>
      </div>
      <div>
        <strong>{template.tags.industries.length || 0} profile(s)</strong>
        <span>{template.tags.solutions.slice(0, 3).map(titleize).join(', ') || 'No solution tags'}</span>
      </div>
      <div>
        <strong>{sourceChanged ? 'Source changed' : template.source.sourceFamily}</strong>
        <span>{template.source.relativePath}</span>
      </div>
      <div className="row-actions">
        <button className="secondary-action compact" onClick={() => onEdit(templateRecord.id)} type="button">
          <FileCog size={14} />
          Edit
        </button>
        {template.status === 'active' ? (
          <span className="controlled-state">Active</span>
        ) : (
          <button className="secondary-action compact" onClick={() => onActivate(templateRecord)} type="button">
            <CheckCircle2 size={14} />
            Activate
          </button>
        )}
      </div>
    </div>
  )
}

function TemplateRecordEditor({
  currentAsset,
  onSave,
  templateRecord,
}: {
  currentAsset?: LocalAsset
  onSave: (
    templateRecord: BackendRecord<ControlledTemplatePayload>,
    updates: Partial<ControlledTemplatePayload>,
  ) => void
  templateRecord: BackendRecord<ControlledTemplatePayload>
}) {
  const template = templateRecord.payload
  const [status, setStatus] = useState<ControlledTemplateStatus>(template.status)
  const [category, setCategory] = useState(template.classification.category)
  const [domain, setDomain] = useState(template.classification.domain)
  const [kind, setKind] = useState<LocalAsset['kind']>(template.classification.kind)
  const [industries, setIndustries] = useState(template.tags.industries.join(', '))
  const [solutions, setSolutions] = useState(template.tags.solutions.join(', '))
  const [provenanceNotes, setProvenanceNotes] = useState(template.provenanceNotes)
  const sourceChanged =
    Boolean(currentAsset?.fingerprint) && currentAsset?.fingerprint !== template.source.fingerprint

  function splitTags(value: string) {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  }

  function saveOverrides() {
    onSave(templateRecord, {
      status,
      versionLabel: `v${templateRecord.version + 1}`,
      classification: {
        category,
        domain,
        kind,
        sourceFamily: template.classification.sourceFamily,
      },
      tags: {
        industries: splitTags(industries),
        solutions: splitTags(solutions),
      },
      provenanceNotes,
    })
  }

  return (
    <section className="panel template-editor-panel">
      <PanelHeader
        icon={FileCog}
        title="Template Detail Editor"
        subtitle="Override lifecycle, classification, tags, and provenance for the selected controlled template."
      />
      <div className="template-editor-grid">
        <div className="template-editor-form">
          <label>
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as ControlledTemplateStatus)}>
              {(['candidate', 'draft', 'active', 'retired'] as ControlledTemplateStatus[]).map((option) => (
                <option key={option} value={option}>
                  {titleize(option)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Category</span>
            <input value={category} onChange={(event) => setCategory(event.target.value)} />
          </label>
          <label>
            <span>Domain</span>
            <input value={domain} onChange={(event) => setDomain(event.target.value)} />
          </label>
          <label>
            <span>Kind</span>
            <select value={kind} onChange={(event) => setKind(event.target.value as LocalAsset['kind'])}>
              {(['template', 'database_schema', 'data_template', 'manifest', 'reference'] as LocalAsset['kind'][]).map((option) => (
                <option key={option} value={option}>
                  {titleize(option)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Industry tags</span>
            <input value={industries} onChange={(event) => setIndustries(event.target.value)} />
          </label>
          <label>
            <span>Solution tags</span>
            <input value={solutions} onChange={(event) => setSolutions(event.target.value)} />
          </label>
          <label className="template-editor-notes">
            <span>Provenance notes</span>
            <textarea value={provenanceNotes} onChange={(event) => setProvenanceNotes(event.target.value)} />
          </label>
          <button className="primary-action" onClick={saveOverrides} type="button">
            <CheckCircle2 size={16} />
            Save Template Version
          </button>
        </div>
        <div className="template-editor-summary">
          <div className="latest-contract">
            <StatusChip status={status === 'active' ? 'pass' : 'warning'} label={status} />
            <h3>{templateRecord.label}</h3>
            <p>{template.templateId}</p>
            <div className="metadata-grid">
              <Metadata label="Current version" value={`v${templateRecord.version}`} />
              <Metadata label="Next version label" value={`v${templateRecord.version + 1}`} />
              <Metadata label="Source family" value={template.source.sourceFamily} />
              <Metadata label="Source changed" value={sourceChanged ? 'Yes' : 'No'} />
              <Metadata label="Source path" value={template.source.relativePath} />
              <Metadata label="Fingerprint" value={template.source.fingerprint} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function OverviewShell({
  activeFamilies,
  auditEvents,
  config,
  deployment,
  domainEntries,
  industryEntries,
  readinessChecks,
  readinessSummary,
  toggleDomain,
  toggleIndustry,
}: {
  activeFamilies: string[]
  auditEvents: AuditEvent[]
  config: AppConfig
  deployment: DeploymentState
  domainEntries: readonly (readonly [string, AppConfig['solutionDomains'][string]])[]
  industryEntries: [string, AppConfig['industries'][string]][]
  readinessChecks: ReturnType<typeof evaluateReadiness>
  readinessSummary: Record<StatusLevel, number>
  toggleDomain: (key: string) => void
  toggleIndustry: (key: string) => void
}) {
  return (
    <>
      <section className="main-grid">
        <section className="panel profile-panel">
          <PanelHeader
            icon={Factory}
            title="Deployment Profile"
            subtitle="Industry selection drives language, modules, and readiness context."
          />
          <div className="profile-list">
            {industryEntries.map(([key, profile]) => {
              const enabled = deployment.activeIndustries.includes(key)
              return (
                <button
                  className={enabled ? 'profile-row selected' : 'profile-row'}
                  key={key}
                  onClick={() => toggleIndustry(key)}
                  type="button"
                >
                  <div>
                    <strong>{profile.display_name}</strong>
                    <span>{profile.enabled_domains.length} default domains</span>
                  </div>
                  {enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              )
            })}
          </div>
        </section>

        <section className="panel domains-panel">
          <PanelHeader
            icon={SlidersHorizontal}
            title="Solution Domains"
            subtitle="Turn on the first operating surface for this deployment."
          />
          <div className="domain-grid">
            {domainEntries.map(([key, domain]) => {
              const enabled = deployment.activeDomains.includes(key)
              return (
                <button
                  className={enabled ? 'domain-tile selected' : 'domain-tile'}
                  key={key}
                  onClick={() => toggleDomain(key)}
                  type="button"
                >
                  <span>{domainDisplayNames[key] ?? domain.display_name}</span>
                  <small>{domain.modules.length} modules</small>
                  {enabled ? <ToggleRight size={25} /> : <ToggleLeft size={25} />}
                </button>
              )
            })}
          </div>
        </section>

        <section className="panel readiness-panel">
          <PanelHeader
            icon={ClipboardCheck}
            title="Readiness Summary"
            subtitle="Skeleton checks for profile, domain, config, audit, and manifest health."
          />
          <ReadinessBlock checks={readinessChecks} summary={readinessSummary} />
        </section>
      </section>

      <section className="lower-grid">
        <ObjectFamiliesPanel activeFamilies={activeFamilies} config={config} />
        <AuditPanel auditEvents={auditEvents} />
      </section>
    </>
  )
}

function ConnectorHub({
  connectorEntries,
  connectorResults,
  onDiscoverSource,
  onRunAll,
  onRunOne,
  onValidateCredentials,
  onSelect,
  selectedConnector,
  selectedConnectorId,
  selectedConnectorResult,
  selectedConnectorRuns,
  selectedCredentialValidation,
  selectedCredentialValidationRecords,
  selectedSourceMetadata,
  selectedSourcePreview,
}: {
  connectorEntries: [string, AppConfig['connectors']['connectors'][string]][]
  connectorResults: Record<string, ConnectorTestResult>
  onDiscoverSource: (connectorId: string) => void
  onRunAll: () => void
  onRunOne: (connectorId: string) => void
  onValidateCredentials: (connectorId: string) => void
  onSelect: (connectorId: string) => void
  selectedConnector?: AppConfig['connectors']['connectors'][string]
  selectedConnectorId: string | null
  selectedConnectorResult?: ConnectorTestResult
  selectedConnectorRuns: BackendRecord[]
  selectedCredentialValidation?: CredentialValidationResult
  selectedCredentialValidationRecords: BackendRecord<{ connectorId: string; result: CredentialValidationResult }>[]
  selectedSourceMetadata?: ConnectorSourceMetadata
  selectedSourcePreview?: ConnectorPreviewResult
}) {
  const testedCount = Object.keys(connectorResults).length
  const passCount = Object.values(connectorResults).filter((result) => result.status === 'pass').length
  const warningCount = Object.values(connectorResults).filter(
    (result) => result.status === 'warning',
  ).length
  const blockingCount = Object.values(connectorResults).filter(
    (result) => result.status === 'blocking',
  ).length

  return (
    <>
      <section className="connector-toolbar panel">
        <div>
          <h2>Connector Registry</h2>
          <p>
            Manifest-level testing validates structure, required source metadata, target coverage, and adapter readiness before live credentials are introduced.
          </p>
        </div>
        <button className="primary-action" onClick={onRunAll} type="button">
          <ClipboardCheck size={16} />
          Test All Connectors
        </button>
      </section>

      <section className="connector-grid">
        <section className="panel connector-list-panel">
          <PanelHeader
            icon={Database}
            title="Connector Manifests"
            subtitle={`${connectorEntries.length} configured paths across warehouse, SharePoint, external references, and manual upload.`}
          />
          <div className="connector-list">
            {connectorEntries.map(([id, connector]) => {
              const result = connectorResults[id]
              const active = selectedConnectorId === id
              return (
                <button
                  className={active ? 'connector-row selected' : 'connector-row'}
                  key={id}
                  onClick={() => onSelect(id)}
                  type="button"
                >
                  <ConnectorGlyph type={connector.type} />
                  <div>
                    <strong>{connector.display_name}</strong>
                    <span>
                      {connector.type} / {connector.refresh_mode ?? connector.integration_mode ?? 'not configured'}
                    </span>
                  </div>
                  <StatusChip status={result?.status ?? 'warning'} label={result ? result.status : 'Not run'} />
                </button>
              )
            })}
          </div>
        </section>

        <section className="panel connector-detail-panel">
          <PanelHeader
            icon={Search}
            title="Metadata Preview"
            subtitle="Adapter output shape before live discovery is connected."
          />
          {selectedConnector && selectedConnectorId ? (
            <div className="connector-detail">
              <div className="detail-heading">
                <div>
                  <h3>{selectedConnector.display_name}</h3>
                  <p>{selectedConnectorId}</p>
                </div>
                <div className="detail-actions">
                  <button
                    className="secondary-action"
                    onClick={() => onDiscoverSource(selectedConnectorId)}
                    type="button"
                  >
                    <Search size={15} />
                    Discover Source
                  </button>
                  <button
                    className="secondary-action"
                    onClick={() => onValidateCredentials(selectedConnectorId)}
                    type="button"
                  >
                    <ShieldCheck size={15} />
                    Validate Credentials
                  </button>
                  <button
                    className="secondary-action"
                    onClick={() => onRunOne(selectedConnectorId)}
                    type="button"
                  >
                    <ClipboardCheck size={15} />
                    Run Test
                  </button>
                </div>
              </div>
              <div className="metadata-grid">
                <Metadata label="Type" value={selectedConnector.type} />
                <Metadata
                  label="Refresh"
                  value={selectedConnector.refresh_mode ?? selectedConnector.integration_mode ?? 'not configured'}
                />
                <Metadata
                  label="Source"
                  value={
                    selectedConnector.database ??
                    selectedConnector.site_url ??
                    selectedConnector.workbook ??
                    'external reference'
                  }
                />
                <Metadata
                  label="Target"
                  value={
                    selectedConnector.objects?.map((object) => object.target).join(', ') ??
                    selectedConnector.target ??
                    'not mapped'
                  }
                />
              </div>
              <div className="source-object-list">
                <h4>Source Objects</h4>
                {(selectedConnector.objects ?? [
                  {
                    source: selectedConnector.workbook ?? selectedConnector.display_name,
                    target: selectedConnector.target ?? 'not mapped',
                  },
                ]).map((object) => (
                  <div className="source-object-row" key={`${object.source}-${object.target}`}>
                    <span>{object.source}</span>
                    <ExternalLink size={14} />
                    <strong>{object.target}</strong>
                  </div>
                ))}
              </div>
              {selectedSourceMetadata ? (
                <div className="source-discovery">
                  <div className="source-discovery-summary">
                    <Metadata label="Rows" value={String(selectedSourceMetadata.rowCount)} />
                    <Metadata label="Columns" value={String(selectedSourceMetadata.columns.length)} />
                    <Metadata
                      label="Credential mode"
                      value={selectedSourceMetadata.credentialMode ?? 'not required'}
                    />
                  </div>
                  <p>{selectedSourceMetadata.evidence}</p>
                  {selectedSourceMetadata.requiredEnvironment?.length ? (
                    <div className="credential-requirements">
                      <strong>Required server environment</strong>
                      <div>
                        {selectedSourceMetadata.requiredEnvironment.map((name) => (
                          <span className="chip" key={name}>{name}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="source-column-list">
                    {selectedSourceMetadata.columns.slice(0, 8).map((column) => (
                      <span className="chip active" key={column.name}>
                        {column.name} / {column.inferredType}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-state compact">Discover source metadata to preview live adapter output.</div>
              )}
              {selectedSourcePreview && selectedSourcePreview.rows.length > 0 ? (
                <div className="preview-table">
                  <h4>Preview Rows</h4>
                  <div className="preview-scroll">
                    <table>
                      <thead>
                        <tr>
                          {selectedSourcePreview.columns.slice(0, 5).map((column) => (
                            <th key={column}>{column}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSourcePreview.rows.map((row, index) => (
                          <tr key={`${selectedSourcePreview.connectorId}-${index}`}>
                            {selectedSourcePreview.columns.slice(0, 5).map((column) => (
                              <td key={column}>{row[column] ?? ''}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
              {selectedConnectorRuns.length > 0 ? (
                <div className="connector-run-history">
                  <h4>Persisted Connector Runs</h4>
                  {selectedConnectorRuns.slice(0, 4).map((run) => (
                    <div className="connector-run-row" key={run.id}>
                      <div>
                        <strong>{run.label}</strong>
                        <span>
                          v{run.version} / {new Date(run.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <StatusChip status={run.status} label={run.status} />
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="credential-validation-panel">
                <h4>Credential Validation</h4>
                {selectedCredentialValidation ? (
                  <>
                    <div className="latest-contract credential-validation-summary">
                      <StatusChip
                        status={selectedCredentialValidation.status}
                        label={selectedCredentialValidation.status}
                      />
                      <h3>{selectedCredentialValidation.credentialMode}</h3>
                      <p>{selectedCredentialValidation.evidence}</p>
                      <div className="metadata-grid">
                        <Metadata
                          label="Required env"
                          value={
                            selectedCredentialValidation.requiredEnvironment.join(', ') ||
                            'No server token required'
                          }
                        />
                        <Metadata
                          label="Missing env"
                          value={selectedCredentialValidation.missingEnvironment.join(', ') || 'None'}
                        />
                        <Metadata label="Rotation" value={selectedCredentialValidation.rotation.status} />
                        <Metadata
                          label="Token age"
                          value={
                            selectedCredentialValidation.rotation.ageDays === undefined
                              ? 'Unknown'
                              : `${selectedCredentialValidation.rotation.ageDays} days`
                          }
                        />
                      </div>
                    </div>
                    <div className="check-list credential-check-list">
                      {selectedCredentialValidation.checks.map((check) => {
                        const Icon = statusIcon[check.status]
                        return (
                          <div className={`check-row ${check.status}`} key={check.id}>
                            <Icon size={17} />
                            <div>
                              <strong>{check.label}</strong>
                              <span>{check.evidence}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <div className="empty-state compact">
                    Validate credentials to check server token presence and rotation evidence.
                  </div>
                )}
                {selectedCredentialValidationRecords.length > 0 ? (
                  <div className="connector-run-history credential-history">
                    <h4>Credential Validation History</h4>
                    {selectedCredentialValidationRecords.slice(0, 3).map((run) => (
                      <div className="connector-run-row" key={run.id}>
                        <div>
                          <strong>{run.label}</strong>
                          <span>
                            v{run.version} / {new Date(run.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <StatusChip status={run.status} label={run.status} />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="empty-state">Select a connector to inspect metadata.</div>
          )}
        </section>

        <section className="panel connector-evidence-panel">
          <PanelHeader
            icon={ClipboardCheck}
            title="Connector Evidence"
            subtitle="Readiness evidence captured from the latest manifest test."
          />
          <div className="readiness-score">
            <div className="score pass">
              <strong>{passCount}</strong>
              <span>Pass</span>
            </div>
            <div className="score warning">
              <strong>{warningCount}</strong>
              <span>Warning</span>
            </div>
            <div className="score blocking">
              <strong>{blockingCount}</strong>
              <span>Blocking</span>
            </div>
          </div>
          <div className="tested-count">{testedCount} connector(s) tested this session</div>
          {selectedConnectorResult ? (
            <div className="check-list">
              {selectedConnectorResult.checks.map((check) => {
                const Icon = statusIcon[check.status]
                return (
                  <div className={`check-row ${check.status}`} key={check.id}>
                    <Icon size={17} />
                    <div>
                      <strong>{check.label}</strong>
                      <span>{check.evidence}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty-state compact">Run a connector test to capture evidence.</div>
          )}
        </section>
      </section>
    </>
  )
}

function ReadinessBlock({
  checks,
  summary,
}: {
  checks: ReturnType<typeof evaluateReadiness>
  summary: Record<StatusLevel, number>
}) {
  return (
    <>
      <div className="readiness-score">
        <div className="score pass">
          <strong>{summary.pass}</strong>
          <span>Pass</span>
        </div>
        <div className="score warning">
          <strong>{summary.warning}</strong>
          <span>Warning</span>
        </div>
        <div className="score blocking">
          <strong>{summary.blocking}</strong>
          <span>Blocking</span>
        </div>
      </div>
      <div className="check-list">
        {checks.map((check) => {
          const Icon = statusIcon[check.status]
          return (
            <div className={`check-row ${check.status}`} key={check.id}>
              <Icon size={17} />
              <div>
                <strong>{check.label}</strong>
                <span>{check.evidence}</span>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function ObjectFamiliesPanel({
  activeFamilies,
  config,
}: {
  activeFamilies: string[]
  config: AppConfig
}) {
  return (
    <section className="panel object-panel">
      <PanelHeader
        icon={Route}
        title="Object Families"
        subtitle="Canonical coverage derived from active solution domains."
      />
      <div className="object-table" role="table" aria-label="Object families">
        <div className="table-row table-head" role="row">
          <span>Family</span>
          <span>Objects</span>
          <span>Status</span>
          <span>Coverage</span>
        </div>
        {Object.entries(config.objectFamilies).map(([key, family]) => {
          const familyStatus = getFamilyStatus(key, family, activeFamilies)
          return (
            <div className="table-row" role="row" key={key}>
              <strong>{titleize(key)}</strong>
              <span>{family.objects.slice(0, 3).join(', ')}</span>
              <span className={familyStatus.status === 'Active' ? 'chip active' : 'chip'}>
                {familyStatus.status}
              </span>
              <span>{familyStatus.detail}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function AuditPanel({ auditEvents }: { auditEvents: AuditEvent[] }) {
  return (
    <section className="panel audit-panel">
      <PanelHeader
        icon={ScrollText}
        title="Audit Skeleton"
        subtitle="Local event stream for config actions in this phase."
      />
      <div className="audit-list">
        {auditEvents.map((event) => (
          <div className="audit-row" key={event.id}>
            <Package size={15} />
            <div>
              <strong>{event.summary}</strong>
              <span>
                {event.area} / {event.action} / {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: typeof Activity
}) {
  return (
    <div className="metric">
      <Icon size={18} />
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  )
}

function ConnectorGlyph({ type }: { type: string }) {
  if (type === 'snowflake') return <Database className="connector-glyph" size={18} />
  if (type === 'sharepoint_excel') return <FileCog className="connector-glyph" size={18} />
  if (type === 'csv') return <ScrollText className="connector-glyph" size={18} />
  return <GitBranch className="connector-glyph" size={18} />
}

function StatusChip({ status, label }: { status: StatusLevel; label: string }) {
  return <span className={`status-chip ${status}`}>{label}</span>
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div className="metadata-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function PanelHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Activity
  title: string
  subtitle: string
}) {
  return (
    <div className="panel-header">
      <Icon size={18} />
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  )
}

export default App
