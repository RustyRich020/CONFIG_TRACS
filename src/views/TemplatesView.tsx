import {
CheckCircle2,
ExternalLink,
FileCog,
PanelTop,
ScrollText,
Search,
ShieldCheck
} from 'lucide-react'
import { useMemo,useState } from 'react'
import { Metadata,PanelHeader,StatusChip } from '../components/common'
import { titleize } from '../components/formatters'
import { TemplatePackageGovernancePanel } from '../components/TemplatePackageGovernancePanel'
import {
downloadJson
} from '../foundation'
import type {
AppConfig,
AssetRegistry,
BackendRecord,
ControlledTemplatePayload,
ControlledTemplateStatus,
CrossIndustryTemplatePackage,
CrossIndustryTemplatePackageApproval,
CrossIndustryTemplatePackageApprovalStatus,
CrossIndustryTemplatePackageDelivery,
CrossIndustryTemplatePackageLifecycleExport,
LocalAsset,
ReportCatalogItem
} from '../types'
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
    name: 'Snowflake Credential Provider',
    file: 'credential_provider_snowflake.template.yaml',
    type: 'Credential',
    purpose: 'Declare server-only Snowflake SQL API environment references, rotation evidence, and validation checks.',
  },
  {
    name: 'Microsoft Graph Credential Provider',
    file: 'credential_provider_microsoft_graph.template.yaml',
    type: 'Credential',
    purpose: 'Declare server-only Graph token references for SharePoint Excel discovery and rotation validation.',
  },
  {
    name: 'External Reference Credential Provider',
    file: 'credential_provider_external_reference.template.yaml',
    type: 'Credential',
    purpose: 'Start a no-secret provider contract for vendor APIs and future REST-backed connectors.',
  },
  {
    name: 'Mapping Manifest',
    file: 'mapping_manifest.template.yaml',
    type: 'Mapping',
    purpose: 'Map source fields into canonical objects with required fields and transforms.',
  },
  {
    name: 'CAPA External Reference Mapping',
    file: 'external_reference_capa_mapping.template.yaml',
    type: 'Mapping',
    purpose: 'Map eQMS or CAPA API records into reference-only CAPA traceability objects.',
  },
  {
    name: 'Supplier External Reference Mapping',
    file: 'external_reference_supplier_mapping.template.yaml',
    type: 'Mapping',
    purpose: 'Map supplier master, qualification, scorecard, and risk evidence into canonical supplier records.',
  },
  {
    name: 'Document External Reference Mapping',
    file: 'external_reference_document_mapping.template.yaml',
    type: 'Mapping',
    purpose: 'Map document control or PLM document records into governed document references.',
  },
  {
    name: 'Readiness Check',
    file: 'readiness_check.template.yaml',
    type: 'Readiness',
    purpose: 'Define blocking or warning checks with expected evidence and remediation.',
  },
  {
    name: 'Notification Smoke Fixture',
    file: 'notification_smoke_fixture.template.yaml',
    type: 'Notification',
    purpose: 'Review tenant approval gates for guarded email and Teams delivery smoke checks.',
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

function createCrossIndustryTemplatePackage({
  config,
  controlledTemplates,
  reports,
}: {
  config: AppConfig
  controlledTemplates: BackendRecord<ControlledTemplatePayload>[]
  reports: ReportCatalogItem[]
}): CrossIndustryTemplatePackage {
  const generatedAt = new Date().toISOString()
  const activeControlledTemplates = controlledTemplates.filter((record) => record.payload.status === 'active')
  const mappings = Object.entries(config.mappings).map(([mappingId, mapping]) => ({
    mappingId,
    object: mapping.object,
    sourceConnector: mapping.source_connector,
    sourceObject: mapping.source_object,
    requiredFields: mapping.required,
    traceabilityLinks: mapping.traceability_links?.length ?? 0,
  }))
  const industries = config.environment.deployment_profile.industries.map((industryId) => ({
    id: industryId,
    displayName: config.industries[industryId]?.display_name ?? industryId,
    domains: config.industries[industryId]?.enabled_domains ?? [],
  }))
  const connectorTemplates = templateCatalog.filter((template) =>
    ['Connector', 'Credential', 'Adapter'].includes(template.type),
  )

  return {
    packageId: `cross_industry_template_package:${config.environment.environment.name}:${generatedAt}`,
    generatedAt,
    industries,
    workflowDefinitions: config.workflowDefinitions,
    mappings,
    connectorTemplates,
    reportCatalog: reports,
    controlledTemplates: activeControlledTemplates,
    summary: {
      industries: industries.length,
      workflows: Object.keys(config.workflowDefinitions).length,
      mappings: mappings.length,
      connectorTemplates: connectorTemplates.length,
      reportCatalogItems: reports.length,
      activeControlledTemplates: activeControlledTemplates.length,
    },
    evidence: `Cross-industry package assembled for ${industries.length} industry profile(s), ${Object.keys(config.workflowDefinitions).length} workflow definition(s), ${mappings.length} mapping profile(s), ${connectorTemplates.length} connector template(s), ${reports.length} report catalog item(s), and ${activeControlledTemplates.length} active controlled template(s).`,
  }
}

function createTemplatePackageLifecycleExport({
  approvals,
  deliveries,
  packagePayload,
}: {
  approvals: BackendRecord<CrossIndustryTemplatePackageApproval>[]
  deliveries: BackendRecord<CrossIndustryTemplatePackageDelivery>[]
  packagePayload: CrossIndustryTemplatePackage
}): CrossIndustryTemplatePackageLifecycleExport {
  const generatedAt = new Date().toISOString()
  return {
    exportId: `cross_industry_template_package_lifecycle:${packagePayload.packageId}:${generatedAt}`,
    generatedAt,
    package: packagePayload,
    approvals,
    deliveries,
    summary: {
      approvals: approvals.length,
      deliveries: deliveries.length,
      latestApprovalStatus: approvals[0]?.payload.status,
      latestDeliveryStatus: deliveries[0]?.payload.status,
    },
    evidence: `${packagePayload.packageId} lifecycle export includes ${approvals.length} approval record(s), ${deliveries.length} delivery record(s), and package coverage for ${packagePayload.summary.industries} industry profile(s).`,
  }
}

function listFromText(value: string) {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}


export function TemplatesView({
  approvalRecords,
  assetRegistry,
  config,
  deliveryRecords,
  onActivateTemplate,
  onPromoteAsset,
  onRefreshAssets,
  onSavePackageApproval,
  onSavePackageDelivery,
  onUpdateTemplate,
  reports,
  templateRecords,
}: {
  approvalRecords: BackendRecord<CrossIndustryTemplatePackageApproval>[]
  assetRegistry: AssetRegistry | null
  config: AppConfig
  deliveryRecords: BackendRecord<CrossIndustryTemplatePackageDelivery>[]
  onActivateTemplate: (templateRecord: BackendRecord<ControlledTemplatePayload>) => void
  onPromoteAsset: (asset: LocalAsset) => void
  onRefreshAssets: () => void
  onSavePackageApproval: (request: {
    packagePayload: CrossIndustryTemplatePackage
    rationale: string
    reviewer: string
    status: CrossIndustryTemplatePackageApprovalStatus
  }) => void
  onSavePackageDelivery: (request: {
    approvalRecord?: BackendRecord<CrossIndustryTemplatePackageApproval>
    channel: CrossIndustryTemplatePackageDelivery['channel']
    packagePayload: CrossIndustryTemplatePackage
    recipients: string[]
  }) => void
  onUpdateTemplate: (
    templateRecord: BackendRecord<ControlledTemplatePayload>,
    updates: Partial<ControlledTemplatePayload>,
  ) => void
  reports: ReportCatalogItem[]
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
  const latestPackageApproval = approvalRecords[0]
  const [packageReviewer, setPackageReviewer] = useState('Template Governance Reviewer')
  const [packageApprovalStatus, setPackageApprovalStatus] =
    useState<CrossIndustryTemplatePackageApprovalStatus>('approved')
  const [packageApprovalRationale, setPackageApprovalRationale] = useState(
    'Reviewed package coverage and approved for implementation handoff.',
  )
  const [packageDeliveryRecipients, setPackageDeliveryRecipients] = useState(
    'Implementation Owner, Governance Reviewer',
  )
  const [packageDeliveryChannel, setPackageDeliveryChannel] =
    useState<CrossIndustryTemplatePackageDelivery['channel']>('implementation_handoff')
  const crossIndustryPackage = useMemo(
    () =>
      createCrossIndustryTemplatePackage({
        config,
        controlledTemplates: latestTemplateRecords,
        reports,
      }),
    [config, latestTemplateRecords, reports],
  )

  function downloadCrossIndustryPackage() {
    downloadJson('tracs-cross-industry-template-package.json', crossIndustryPackage)
  }

  function downloadPackageLifecycleExport() {
    downloadJson(
      'tracs-cross-industry-template-package-lifecycle.json',
      createTemplatePackageLifecycleExport({
        approvals: approvalRecords,
        deliveries: deliveryRecords,
        packagePayload: crossIndustryPackage,
      }),
    )
  }

  function savePackageApproval() {
    onSavePackageApproval({
      packagePayload: crossIndustryPackage,
      rationale: packageApprovalRationale,
      reviewer: packageReviewer,
      status: packageApprovalStatus,
    })
  }

  function savePackageDelivery() {
    onSavePackageDelivery({
      approvalRecord: latestPackageApproval,
      channel: packageDeliveryChannel,
      packagePayload: crossIndustryPackage,
      recipients: listFromText(packageDeliveryRecipients),
    })
  }

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

      <TemplatePackageGovernancePanel
        approvalRecords={approvalRecords}
        deliveryChannel={packageDeliveryChannel}
        deliveryRecords={deliveryRecords}
        deliveryRecipients={packageDeliveryRecipients}
        onApprovalRationaleChange={setPackageApprovalRationale}
        onApprovalStatusChange={setPackageApprovalStatus}
        onDeliveryChannelChange={setPackageDeliveryChannel}
        onDeliveryRecipientsChange={setPackageDeliveryRecipients}
        onDownloadPackage={downloadCrossIndustryPackage}
        onDownloadLifecycleExport={downloadPackageLifecycleExport}
        onReviewerChange={setPackageReviewer}
        onSaveApproval={savePackageApproval}
        onSaveDelivery={savePackageDelivery}
        packageApprovalRationale={packageApprovalRationale}
        packageApprovalStatus={packageApprovalStatus}
        packagePayload={crossIndustryPackage}
        packageReviewer={packageReviewer}
      />

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


