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
  AuditEvent,
  BackendHealth,
  BackendRecord,
  ConnectorPreviewResult,
  ConnectorSourceMetadata,
  ConnectorTestResult,
  CsvSchemaInference,
  DeploymentState,
  MappingValidationResult,
  SavedVersion,
  StatusLevel,
} from './types'

const navItems = [
  { label: 'Overview', icon: Activity },
  { label: 'Profiles', icon: Factory },
  { label: 'Domains', icon: Layers3 },
  { label: 'Connectors', icon: Database },
  { label: 'Templates', icon: PanelTop },
  { label: 'Mapping', icon: GitBranch },
  { label: 'Versions', icon: History },
  { label: 'Backend', icon: ServerCog },
  { label: 'Readiness', icon: ClipboardCheck },
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
  const [adapterDryRuns, setAdapterDryRuns] = useState<Record<string, AdapterDryRunResult>>({})
  const [sourceMetadata, setSourceMetadata] = useState<Record<string, ConnectorSourceMetadata>>({})
  const [sourcePreviews, setSourcePreviews] = useState<Record<string, ConnectorPreviewResult>>({})
  const [connectorRuns, setConnectorRuns] = useState<Record<string, BackendRecord[]>>({})
  const [mappingRuns, setMappingRuns] = useState<Record<string, BackendRecord[]>>({})
  const [contractRecords, setContractRecords] = useState<BackendRecord[]>([])

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
        fetch('/samples/quality_events_sample.csv')
          .then((response) => response.text())
          .then((sample) => {
            setCsvText(sample)
            const schema = inferCsvSchema(sample)
            setCsvSchema(schema)
            setMappingResult(validateMappingAgainstSchema(loaded.mappings.quality_event, schema))
          })
        refreshBackend()
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
    const [health, records, contracts] = await Promise.all([
      backendClient.health(),
      backendClient.listRecords(),
      backendClient.listIntegrationContracts(),
    ])
    setBackendHealth(health)
    setBackendRecords(records)
    setContractRecords(contracts)
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
  const connectorCount = Object.keys(config.connectors.connectors).length
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
                  ? 'Templates'
                  : activeView === 'Mapping'
                    ? 'Mapping Studio'
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
                  ? 'Use reusable templates for profiles, connectors, mappings, readiness checks, and contracts.'
                  : activeView === 'Mapping'
                    ? 'Infer source schema from CSV samples and validate source-to-canonical field mappings.'
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
          <Metric label="Object families" value={activeFamilies.length} icon={Boxes} />
          <Metric label="Connector manifests" value={connectorCount} icon={Database} />
          <Metric label="Backend records" value={backendRecords.length} icon={ServerCog} />
        </section>

        {activeView === 'Connectors' ? (
          <ConnectorHub
            connectorEntries={connectorEntries}
            connectorResults={connectorResults}
            onRunAll={runAllConnectorTests}
            onRunOne={runConnectorTest}
            onDiscoverSource={discoverConnectorSource}
            onSelect={setSelectedConnectorId}
            selectedConnector={selectedConnector}
            selectedConnectorId={selectedConnectorId}
            selectedConnectorResult={selectedConnectorResult}
            selectedConnectorRuns={selectedConnectorRuns}
            selectedSourceMetadata={selectedSourceMetadata}
            selectedSourcePreview={selectedSourcePreview}
          />
        ) : activeView === 'Templates' ? (
          <TemplatesView />
        ) : activeView === 'Mapping' ? (
          <MappingStudio
            csvSchema={csvSchema}
            csvText={csvText}
            mapping={config.mappings.quality_event}
            mappingResult={mappingResult}
            mappingRuns={mappingRuns.quality_event ?? []}
            onCsvTextChange={setCsvText}
            onValidate={runMappingValidation}
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
}: {
  adapterContracts: AdapterContract[]
  adapterDryRuns: Record<string, AdapterDryRunResult>
  backendHealth: BackendHealth | null
  backendRecords: BackendRecord[]
  connectorEntries: [string, AppConfig['connectors']['connectors'][string]][]
  onRefresh: () => void
  onRunAdapterDryRun: (connectorId: string) => void
  onSaveSnapshot: () => void
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
    </>
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
  csvSchema,
  csvText,
  mapping,
  mappingResult,
  mappingRuns,
  onCsvTextChange,
  onValidate,
}: {
  csvSchema: CsvSchemaInference | null
  csvText: string
  mapping: AppConfig['mappings'][string]
  mappingResult: MappingValidationResult | null
  mappingRuns: BackendRecord[]
  onCsvTextChange: (value: string) => void
  onValidate: () => void
}) {
  const summary = mappingResult
    ? summarizeReadiness(mappingResult.checks)
    : ({ pass: 0, warning: 0, blocking: 0 } as Record<StatusLevel, number>)

  return (
    <>
      <section className="connector-toolbar panel">
        <div>
          <h2>Mapping Studio</h2>
          <p>
            Validate the configured quality_event manifest against inferred CSV schema before building live source adapters.
          </p>
        </div>
        <button className="primary-action" onClick={onValidate} type="button">
          <ClipboardCheck size={16} />
          Validate Mapping
        </button>
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
        </section>
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

function TemplatesView() {
  return (
    <>
      <section className="connector-toolbar panel">
        <div>
          <h2>Template Catalog</h2>
          <p>
            Use these templates as the controlled starting point for new deployments, connectors, mappings, checks, and governance exports.
          </p>
        </div>
        <a className="secondary-link" href="/config/templates/integration_contract.template.md" target="_blank">
          <ExternalLink size={15} />
          Open Contract Template
        </a>
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
    </>
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
  onSelect,
  selectedConnector,
  selectedConnectorId,
  selectedConnectorResult,
  selectedConnectorRuns,
  selectedSourceMetadata,
  selectedSourcePreview,
}: {
  connectorEntries: [string, AppConfig['connectors']['connectors'][string]][]
  connectorResults: Record<string, ConnectorTestResult>
  onDiscoverSource: (connectorId: string) => void
  onRunAll: () => void
  onRunOne: (connectorId: string) => void
  onSelect: (connectorId: string) => void
  selectedConnector?: AppConfig['connectors']['connectors'][string]
  selectedConnectorId: string | null
  selectedConnectorResult?: ConnectorTestResult
  selectedConnectorRuns: BackendRecord[]
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
                  </div>
                  <p>{selectedSourceMetadata.evidence}</p>
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
