import {
  Activity,
  Bell,
  Boxes,
  CalendarDays,
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
  CanonicalLoadRequest,
  CanonicalObject,
  ClosureSlaDeliveryAcknowledgement,
  ClosureSlaDeliveryAcknowledgementStatus,
  ClosureSlaExportPackage,
  ClosureSlaResponseFollowUpRoute,
  ClosureSlaResponseFollowUpStatus,
  ControlledTemplatePayload,
  ControlledTemplateStatus,
  LocalAsset,
  ConnectorPreviewResult,
  ConnectorSourceMetadata,
  ConnectorTestResult,
  CredentialValidationResult,
  CsvSchemaInference,
  DeploymentState,
  ExternalReferenceLoadExceptionDisposition,
  ExternalReferenceLoadExceptionDispositionStatus,
  ExtractionJobPayload,
  ExtractionRunPayload,
  MappingValidationResult,
  NotificationLiveChannelApproval,
  NotificationApprovalRenewalRoute,
  NotificationApprovalRenewalClosure,
  NotificationApprovalRenewalClosureStatus,
  NotificationClosureExportPackage,
  NotificationDeliveryRetryControl,
  NotificationDeliveryRetryStatus,
  NotificationLiveChannelApprovalStatus,
  NotificationDeliveryPayload,
  NotificationDeliveryResult,
  NotificationRetryQueueExportPackage,
  PostgresCutoverApproval,
  PostgresCutoverApprovalStatus,
  PostgresCutoverAcknowledgement,
  PostgresCutoverAcknowledgementStatus,
  PostgresCutoverChecklistPackage,
  PostgresCutoverClosurePackage,
  PostgresCutoverOwnerReminder,
  PostgresCutoverOwnerReminderStatus,
  PostgresCutoverReminderClosure,
  PostgresCutoverReminderClosureStatus,
  PostgresMigrationChecklist,
  PostgresImportReconciliation,
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
  TraceabilityExportRetentionClass,
  TraceabilityDeliveryResponse,
  TraceabilityDeliveryResponseStatus,
  TraceabilityExportReview,
  TraceabilityExportReviewStatus,
  TraceabilityGraphExportPackage,
  TraceabilityResponseClosureRoute,
  TraceabilityResponseClosureRouteStage,
  TraceabilityResponseClosureRouteStatus,
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

function reportRouteLabel(stage?: ReportCatalogItem['reviewerRouteStage']) {
  return stage ? titleize(stage) : 'Owner Review'
}

function traceabilityReviewStatusLevel(status: TraceabilityExportReviewStatus): StatusLevel {
  if (status === 'approved') return 'pass'
  if (status === 'rejected') return 'blocking'
  return 'warning'
}

function traceabilityResponseStatusLevel(status: TraceabilityDeliveryResponseStatus): StatusLevel {
  if (status === 'approved' || status === 'acknowledged') return 'pass'
  if (status === 'rejected') return 'blocking'
  return 'warning'
}

function traceabilityResponseLabel(status: TraceabilityDeliveryResponseStatus) {
  return status === 'changes_requested' ? 'Changes requested' : titleize(status)
}

function traceabilityClosureRouteStatusLevel(status: TraceabilityResponseClosureRouteStatus): StatusLevel {
  if (status === 'closed') return 'pass'
  if (status === 'escalated') return 'blocking'
  return 'warning'
}

function traceabilityClosureRouteLabel(status: TraceabilityResponseClosureRouteStatus) {
  if (status === 'follow_up_open') return 'Follow-up open'
  if (status === 'closure_ready') return 'Closure ready'
  return titleize(status)
}

function daysUntilDue(dueAt: string, now = new Date()) {
  const dueTime = Date.parse(dueAt)
  if (!Number.isFinite(dueTime)) return null
  return Math.ceil((dueTime - now.getTime()) / 86_400_000)
}

function closureSlaStatus(dueAt: string, closed: boolean, escalated = false): StatusLevel {
  if (closed) return 'pass'
  if (escalated) return 'blocking'
  const days = daysUntilDue(dueAt)
  if (days === null) return 'warning'
  if (days < 0) return 'blocking'
  if (days <= 3) return 'warning'
  return 'pass'
}

function externalReferenceDispositionStatusLevel(
  status: ExternalReferenceLoadExceptionDispositionStatus,
): StatusLevel {
  if (status === 'blocked') return 'blocking'
  if (status === 'retry_planned') return 'warning'
  return 'pass'
}

function externalReferenceDispositionLabel(status: ExternalReferenceLoadExceptionDispositionStatus) {
  if (status === 'retry_planned') return 'Retry planned'
  return titleize(status)
}

function traceabilityRetentionLabel(retentionClass: TraceabilityExportRetentionClass) {
  if (retentionClass === 'standard_7_year') return 'Standard 7 Year'
  if (retentionClass === 'project_lifetime') return 'Project Lifetime'
  return 'Legal Hold'
}

function traceabilityRetentionUntil(
  retentionClass: TraceabilityExportRetentionClass,
  signedAt: string,
) {
  if (retentionClass === 'legal_hold') return 'indefinite'
  const date = new Date(signedAt)
  date.setFullYear(date.getFullYear() + (retentionClass === 'standard_7_year' ? 7 : 15))
  return date.toISOString()
}

function createReportApprovalNotification(report: ReportCatalogItem) {
  const generatedAt = new Date().toISOString()
  const recipients = report.routedReviewers?.length
    ? report.routedReviewers
    : [report.approvalReviewer, report.owner].filter((recipient): recipient is string => Boolean(recipient))
  return {
    notificationId: `report_notice:${report.id}:${generatedAt}`,
    generatedAt,
    type: 'report_catalog_approval',
    reportId: report.id,
    title: report.title,
    owner: report.owner,
    workspace: report.workspace,
    semanticModel: report.semanticModel,
    routeStage: report.reviewerRouteStage ?? 'owner_review',
    recipients,
    dueAt: report.routeDueAt ?? '',
    approvalStatus: report.approvalStatus ?? 'pending',
    publishStatus: report.publishStatus ?? 'draft',
    freshnessStatus: report.refreshStatus,
    summary: `${report.title} is routed for ${reportRouteLabel(report.reviewerRouteStage)} with ${reportApprovalLabel(report.approvalStatus)} approval state.`,
    evidence: [
      report.freshnessEvidence,
      report.publishGateEvidence ?? 'Publish gate has not been run.',
      report.approvalRationale || 'No reviewer rationale recorded.',
    ],
    sourceDependencies: report.sourceDependencies,
  }
}

function createEvidenceApprovalNotification(packet: ReadinessEvidencePacket, approval: ReadinessEvidenceApproval) {
  const generatedAt = new Date().toISOString()
  return {
    notificationId: `evidence_notice:${packet.packetId}:${generatedAt}`,
    generatedAt,
    type: 'readiness_evidence_approval',
    packetId: packet.packetId,
    environment: packet.environment,
    status: packet.status,
    approvalStatus: approval.status,
    routeStage: approval.routeStage ?? 'quality_review',
    recipients: approval.routedReviewers ?? [],
    dueAt: approval.routeDueAt ?? '',
    reviewer: approval.reviewer,
    nextReviewAt: approval.nextReviewAt,
    summary: `${packet.environment.toUpperCase()} evidence packet is routed for ${titleize(approval.routeStage ?? 'quality_review')} with ${evidenceApprovalLabel(approval.status)} state.`,
    evidence: packet.evidence,
    openExceptions: packet.openExceptions.map((exception) => ({
      id: exception.id,
      status: exception.status,
      summary: exception.summary,
      remediation: exception.remediation,
    })),
    dispositions: approval.dispositions,
  }
}

function createTraceabilityExportNotification(
  graphPackage: TraceabilityGraphExportPackage,
  review: {
    reviewer: string
    status: TraceabilityExportReviewStatus
    rationale: string
    retentionClass: TraceabilityExportRetentionClass
  },
) {
  const generatedAt = new Date().toISOString()
  const reviewer = review.reviewer.trim() || 'TRACS traceability reviewer'
  return {
    notificationId: `traceability_export_notice:${graphPackage.packageId}:${generatedAt}`,
    generatedAt,
    type: 'traceability_export_review',
    packageId: graphPackage.packageId,
    selectedEventId: graphPackage.selectedEvent?.canonical.event_id ?? 'all',
    routeStage: 'traceability_review',
    recipients: [reviewer],
    dueAt: '',
    reviewer,
    reviewStatus: review.status,
    retentionClass: review.retentionClass,
    summary: `Traceability export ${graphPackage.selectedEvent?.canonical.event_id ?? 'all'} is ready for reviewer handoff with ${titleize(review.status)} review state.`,
    evidence: [
      graphPackage.evidence,
      `${graphPackage.coverage.filteredLinks} filtered link(s), ${graphPackage.graph.nodes.length} graph node(s), and ${graphPackage.coverage.evidencePackets} evidence packet(s).`,
      review.rationale || 'No reviewer rationale recorded.',
    ],
    coverage: graphPackage.coverage,
    filters: graphPackage.filters,
    relationshipSummary: graphPackage.graph.relationshipSummary,
    graphPackage,
  }
}

function extractionQueueStatus(job: ExtractionJobPayload, runs: BackendRecord<ExtractionRunPayload>[]) {
  const latestRun = runs
    .filter((run) => run.payload.jobId === job.jobId)
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))[0]
  const nextRunMs = Date.parse(job.nextRunAt)
  const isScheduled = job.status === 'active' && job.scheduleMode === 'scheduled_stub' && Number.isFinite(nextRunMs)
  const isDue = isScheduled && nextRunMs <= Date.now()
  if (latestRun?.payload.retryEligible) return 'retry eligible'
  if (isDue) return 'due now'
  if (isScheduled) return 'scheduled'
  if (job.status === 'paused') return 'paused'
  return 'manual'
}

function createExtractionQueueExport(
  jobs: BackendRecord<ExtractionJobPayload>[],
  runs: BackendRecord<ExtractionRunPayload>[],
) {
  const generatedAt = new Date().toISOString()
  return {
    exportId: `extraction_queue:${generatedAt}`,
    generatedAt,
    type: 'extraction_job_queue',
    jobs: jobs.map((job) => {
      const jobRuns = runs.filter((run) => run.payload.jobId === job.payload.jobId)
      const latestRun = jobRuns
        .slice()
        .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))[0]
      return {
        jobId: job.payload.jobId,
        name: job.payload.name,
        connectorId: job.payload.connectorId,
        status: job.payload.status,
        scheduleMode: job.payload.scheduleMode,
        scheduleCadence: job.payload.scheduleCadence,
        nextRunAt: job.payload.nextRunAt,
        queueStatus: extractionQueueStatus(job.payload, runs),
        runCount: jobRuns.length,
        latestRunStatus: latestRun?.payload.status ?? 'not_run',
        retryEligible: latestRun?.payload.retryEligible ?? false,
        evidence: job.payload.evidence,
      }
    }),
  }
}

function notificationToDeliveryPayload(
  source: NotificationDeliveryPayload['source'],
  subject: string,
  notification: {
    notificationId: string
    recipients: string[]
    summary: string
  } & Record<string, unknown>,
): NotificationDeliveryPayload {
  return {
    deliveryId: `notification_delivery:${notification.notificationId}`,
    generatedAt: new Date().toISOString(),
    source,
    channels: ['email', 'teams', 'sharepoint_folder'],
    recipients: notification.recipients,
    subject,
    summary: notification.summary,
    evidence: notification,
  }
}

function notificationDeliveryRetryStatusLevel(status: NotificationDeliveryRetryStatus, retryStatus?: StatusLevel): StatusLevel {
  if (status === 'blocked') return 'blocking'
  if (status === 'executed') return retryStatus ?? 'warning'
  return 'warning'
}

function closureSlaDeliveryAcknowledgementStatusLevel(
  status: ClosureSlaDeliveryAcknowledgementStatus,
): StatusLevel {
  if (status === 'acknowledged' || status === 'approved') return 'pass'
  if (status === 'rejected') return 'blocking'
  return 'warning'
}

function closureSlaDeliveryAcknowledgementLabel(status: ClosureSlaDeliveryAcknowledgementStatus) {
  if (status === 'changes_requested') return 'Changes requested'
  return titleize(status)
}

function closureSlaFollowUpStatusLevel(status: ClosureSlaResponseFollowUpStatus): StatusLevel {
  if (status === 'closed') return 'pass'
  if (status === 'escalated') return 'blocking'
  return 'warning'
}

function closureSlaFollowUpLabel(status: ClosureSlaResponseFollowUpStatus) {
  if (status === 'in_progress') return 'In progress'
  return titleize(status)
}

function notificationDeliveryRetryLabel(status: NotificationDeliveryRetryStatus) {
  if (status === 'planned') return 'Planned'
  if (status === 'executed') return 'Executed'
  return 'Blocked'
}

function minutesBetween(startAt: string, endAt = new Date()) {
  const startTime = Date.parse(startAt)
  if (!Number.isFinite(startTime)) return null
  return Math.floor((endAt.getTime() - startTime) / 60_000)
}

function addMinutesIso(startAt: string, minutes: number) {
  const startTime = Date.parse(startAt)
  if (!Number.isFinite(startTime)) return ''
  return new Date(startTime + minutes * 60_000).toISOString()
}

function retryControlDueAt(control: NotificationDeliveryRetryControl) {
  return control.retryDueAt || addMinutesIso(control.createdAt, control.retryDelayMinutes)
}

function retryDueLabel(dueAt: string, now = new Date()) {
  const dueTime = Date.parse(dueAt)
  if (!Number.isFinite(dueTime)) return 'No due date'
  const minutes = Math.ceil((dueTime - now.getTime()) / 60_000)
  if (minutes < 0) return `${Math.abs(minutes)} min overdue`
  if (minutes === 0) return 'Due now'
  if (minutes < 60) return `Due in ${minutes} min`
  const hours = Math.ceil(minutes / 60)
  return `Due in ${hours} hr`
}

function retryAgeLabel(minutes: number) {
  if (minutes <= 0) return '0 min'
  if (minutes < 60) return `${minutes} min`
  return `${Math.ceil(minutes / 60)} hr`
}

function deliverySourceLabel(source: NotificationDeliveryPayload['source']) {
  if (source === 'notification_closure_export_package') return 'Closure package'
  if (source === 'notification_retry_queue_export_package') return 'Retry queue package'
  if (source === 'closure_sla_export_package') return 'Closure SLA package'
  if (source === 'closure_sla_response_follow_up') return 'Closure SLA follow-up'
  if (source === 'postgres_cutover_acknowledgement') return 'Cutover acknowledgement'
  if (source === 'postgres_cutover_owner_reminder') return 'Cutover owner reminder'
  if (source === 'postgres_cutover_closure_package') return 'Cutover closure package'
  if (source === 'traceability_response_closure') return 'Traceability closure'
  return titleize(source)
}

function notificationApprovalStatusLevel(status: NotificationLiveChannelApprovalStatus): StatusLevel {
  if (status === 'approved') return 'pass'
  if (status === 'rejected') return 'blocking'
  return 'warning'
}

function notificationRenewalClosureStatusLevel(status: NotificationApprovalRenewalClosureStatus): StatusLevel {
  if (status === 'closed') return 'pass'
  if (status === 'rejected') return 'blocking'
  return 'warning'
}

function notificationRenewalClosureLabel(status: NotificationApprovalRenewalClosureStatus) {
  return status === 'closed_with_conditions' ? 'Closed with conditions' : titleize(status)
}

function notificationApprovalExpiryStatus(approval?: BackendRecord<NotificationLiveChannelApproval>) {
  if (!approval?.payload.expiresAt) {
    return {
      status: 'warning' as StatusLevel,
      daysUntilExpiry: null,
      evidence: 'No active notification live-channel approval expiry is available.',
    }
  }
  const expiresAt = Date.parse(approval.payload.expiresAt)
  if (!Number.isFinite(expiresAt)) {
    return {
      status: 'warning' as StatusLevel,
      daysUntilExpiry: null,
      evidence: 'Notification live-channel approval expiry is not a valid date.',
    }
  }
  const daysUntilExpiry = Math.ceil((expiresAt - Date.now()) / 86_400_000)
  if (daysUntilExpiry < 0) {
    return {
      status: 'blocking' as StatusLevel,
      daysUntilExpiry,
      evidence: `Notification live-channel approval expired ${Math.abs(daysUntilExpiry)} day(s) ago.`,
    }
  }
  if (daysUntilExpiry <= 14) {
    return {
      status: 'warning' as StatusLevel,
      daysUntilExpiry,
      evidence: `Notification live-channel approval expires in ${daysUntilExpiry} day(s); renewal routing is due.`,
    }
  }
  return {
    status: 'pass' as StatusLevel,
    daysUntilExpiry,
    evidence: `Notification live-channel approval expires in ${daysUntilExpiry} day(s).`,
  }
}

function notificationApprovalRenewalDueAt(approval?: BackendRecord<NotificationLiveChannelApproval>) {
  if (!approval?.payload.expiresAt || !Number.isFinite(Date.parse(approval.payload.expiresAt))) return ''
  const dueAt = new Date(approval.payload.expiresAt)
  dueAt.setDate(dueAt.getDate() - 7)
  return dueAt.toISOString().slice(0, 10)
}

function createNotificationApprovalRenewalNotification(route: NotificationApprovalRenewalRoute) {
  return {
    notificationId: `notification_approval_renewal_notice:${route.routeId}`,
    generatedAt: new Date().toISOString(),
    type: 'notification_approval_renewal',
    routeId: route.routeId,
    approvalId: route.approvalId,
    routeStage: route.routeStage,
    recipients: route.routedReviewers,
    dueAt: route.dueAt,
    summary: `Notification live-channel approval renewal is routed for ${titleize(route.routeStage)} with ${route.expiryStatus} expiry status.`,
    evidence: [
      route.evidence,
      `Approval expires ${route.approvalExpiresAt || 'without a retained expiry date'}.`,
      route.rationale,
    ],
    route,
  }
}

function postgresCutoverApprovalStatusLevel(status: PostgresCutoverApprovalStatus, gateStatus: StatusLevel): StatusLevel {
  if (status === 'rejected') return 'blocking'
  if (status === 'approved') return gateStatus
  if (status === 'approved_with_conditions') return gateStatus === 'blocking' ? 'blocking' : 'warning'
  return 'warning'
}

function postgresCutoverApprovalLabel(status: PostgresCutoverApprovalStatus) {
  return status === 'approved_with_conditions' ? 'Approved with conditions' : titleize(status)
}

function postgresCutoverAcknowledgementStatusLevel(status: PostgresCutoverAcknowledgementStatus): StatusLevel {
  if (status === 'acknowledged') return 'pass'
  if (status === 'rejected') return 'blocking'
  return 'warning'
}

function postgresCutoverAcknowledgementLabel(status: PostgresCutoverAcknowledgementStatus) {
  if (status === 'acknowledged_with_actions') return 'Acknowledged with actions'
  return titleize(status)
}

function postgresCutoverOwnerReminderStatusLevel(status: PostgresCutoverOwnerReminderStatus): StatusLevel {
  if (status === 'closed' || status === 'sent') return 'pass'
  if (status === 'deferred') return 'blocking'
  return 'warning'
}

function postgresCutoverOwnerReminderLabel(status: PostgresCutoverOwnerReminderStatus) {
  if (status === 'draft') return 'Draft'
  if (status === 'routed') return 'Routed'
  if (status === 'sent') return 'Sent'
  if (status === 'deferred') return 'Deferred'
  return 'Closed'
}

function postgresCutoverReminderClosureStatusLevel(status: PostgresCutoverReminderClosureStatus): StatusLevel {
  if (status === 'closed') return 'pass'
  if (status === 'rejected') return 'blocking'
  return 'warning'
}

function postgresCutoverReminderClosureLabel(status: PostgresCutoverReminderClosureStatus) {
  if (status === 'closed_with_actions') return 'Closed with actions'
  return titleize(status)
}

function postgresCutoverClosurePackageStatus({
  acknowledgement,
  closure,
  requiredActions,
}: {
  acknowledgement?: PostgresCutoverAcknowledgement
  closure?: PostgresCutoverReminderClosure
  requiredActions: string[]
}): StatusLevel {
  if (!closure || closure.status === 'rejected') return 'blocking'
  if (acknowledgement?.productionReadiness === 'not_ready') return 'blocking'
  if (closure.status === 'deferred') return 'warning'
  if (requiredActions.length > 0) return 'warning'
  if (closure.status === 'closed_with_actions') return 'warning'
  if (acknowledgement?.productionReadiness === 'ready_with_conditions') return 'warning'
  return 'pass'
}

function evaluatePostgresCutoverGates({
  backendHealth,
  latestReconciliation,
  postgresMigrationChecklist,
}: {
  backendHealth: BackendHealth | null
  latestReconciliation?: BackendRecord<PostgresImportReconciliation>
  postgresMigrationChecklist: PostgresMigrationChecklist | null
}) {
  const gates = [
    {
      id: 'postgres_store_active',
      label: 'Postgres store active',
      status: backendHealth?.store?.mode === 'postgres' ? 'pass' : 'blocking',
      evidence:
        backendHealth?.store?.mode === 'postgres'
          ? backendHealth.evidence
          : 'Backend health must report store.mode=postgres before production cutover.',
    },
    {
      id: 'schema_blueprint_loaded',
      label: 'Storage schema confirmed',
      status: postgresMigrationChecklist?.adapter === 'postgres' ? 'pass' : 'warning',
      evidence: postgresMigrationChecklist
        ? `${postgresMigrationChecklist.adapter} migration checklist loaded with ${(postgresMigrationChecklist.gates ?? []).length} gate(s).`
        : 'Postgres migration checklist has not been loaded from the backend.',
    },
    {
      id: 'reconciliation_evidence_retained',
      label: 'Import reconciliation retained',
      status: latestReconciliation ? latestReconciliation.status : 'blocking',
      evidence: latestReconciliation
        ? latestReconciliation.payload.evidence
        : 'Run a guarded JSON or SQLite to Postgres import dry run before cutover approval.',
    },
    {
      id: 'applied_import_or_conditions',
      label: 'Applied import or conditional plan',
      status: latestReconciliation?.payload.mode === 'apply' ? 'pass' : 'warning',
      evidence:
        latestReconciliation?.payload.mode === 'apply'
          ? `${latestReconciliation.payload.imported} record(s) imported in the latest applied migration run.`
          : 'Latest reconciliation is dry-run only; approval should remain conditional until apply evidence exists.',
    },
    {
      id: 'rollback_window_documented',
      label: 'Rollback window documented',
      status: (postgresMigrationChecklist?.rollback?.length ?? 0) > 0 ? 'pass' : 'warning',
      evidence:
        (postgresMigrationChecklist?.rollback?.length ?? 0) > 0
          ? `${postgresMigrationChecklist?.rollback?.length} rollback step(s) available from the storage contract.`
          : 'Rollback steps are not available from the storage contract.',
    },
  ] satisfies PostgresCutoverApproval['gates']
  return {
    gates,
    status: mostSevereStatus(gates.map((gate) => gate.status)),
  }
}

function notificationApprovalExpiresAt(approvedAt: string) {
  const date = new Date(approvedAt)
  date.setDate(date.getDate() + 90)
  return date.toISOString()
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

function schemaForMappingProfile(mappingId: string, mapping: AppConfig['mappings'][string], csvText: string) {
  if (mappingId === 'quality_event') return inferCsvSchema(csvText)
  const sourceFields = Array.from(new Set(Object.values(mapping.fields)))
  return {
    rowCount: 1,
    columns: sourceFields.map((field) => ({
      name: field,
      nonEmptyCount: 1,
      sampleValues: [`${field}_sample`],
      inferredType:
        field.endsWith('_at') || field.includes('date') || field.includes('due')
          ? 'date'
          : field.includes('count') || field.includes('rate') || field.endsWith('_ppm')
            ? 'number'
            : 'text',
    })),
  } satisfies CsvSchemaInference
}

function schemaFromExternalPreview(
  mappingId: string,
  mapping: AppConfig['mappings'][string],
  metadata?: ConnectorSourceMetadata,
  preview?: ConnectorPreviewResult,
) {
  const metadataColumns = metadata?.columns ?? []
  const hasLiveRows = (metadata?.rowCount ?? 0) > 0 || (preview?.returnedRows ?? 0) > 0
  const hasCompleteMetadata = metadataColumns.length >= Object.keys(mapping.fields).length
  if (metadataColumns.length > 0 && (hasLiveRows || hasCompleteMetadata)) {
    return {
      rowCount: metadata?.rowCount ?? 0,
      columns: metadataColumns,
    } satisfies CsvSchemaInference
  }

  const hasCompletePreview = (preview?.columns.length ?? 0) >= Object.keys(mapping.fields).length
  if (preview?.columns.length && ((preview?.returnedRows ?? 0) > 0 || hasCompletePreview)) {
    return {
      rowCount: preview.rowCount,
      columns: preview.columns.map((column) => {
        const values = preview.rows.map((row) => row[column] ?? '').filter(Boolean)
        return {
          name: column,
          nonEmptyCount: values.length,
          sampleValues: Array.from(new Set(values)).slice(0, 3),
          inferredType:
            values.some((value) => !Number.isNaN(Number(value)))
              ? 'number'
              : values.some((value) => /^\d{4}-\d{2}-\d{2}/.test(value))
                ? 'date'
                : 'text',
        }
      }),
    } satisfies CsvSchemaInference
  }

  return schemaForMappingProfile(mappingId, mapping, '')
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
  const [activeMappingId, setActiveMappingId] = useState('quality_event')
  const [mappingResults, setMappingResults] = useState<Record<string, MappingValidationResult>>({})
  const [savedVersions, setSavedVersions] = useState<SavedVersion[]>(() => loadSavedVersions())
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null)
  const [backendRecords, setBackendRecords] = useState<BackendRecord[]>([])
  const [storageSchema, setStorageSchema] = useState<RecordStoreSchema | null>(null)
  const [postgresMigrationChecklist, setPostgresMigrationChecklist] =
    useState<PostgresMigrationChecklist | null>(null)
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
            setMappingResults({
              quality_event: validateMappingAgainstSchema(loaded.mappings.quality_event, schema),
            })
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
    const [health, records, contracts, templates, schema, postgresChecklist] = await Promise.all([
      backendClient.health(),
      backendClient.listRecords(),
      backendClient.listIntegrationContracts(),
      backendClient.listControlledTemplates(),
      backendClient.loadStorageSchema(),
      backendClient.loadPostgresMigrationChecklist(),
    ])
    setBackendHealth(health)
    setBackendRecords(records)
    setContractRecords(contracts)
    setTemplateRecords(templates)
    setStorageSchema(schema)
    setPostgresMigrationChecklist(postgresChecklist)
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

  async function loadMappingProfileSource(mappingId: string, mapping: AppConfig['mappings'][string]) {
    if (!config || mappingId === 'quality_event') {
      return schemaForMappingProfile(mappingId, mapping, csvText)
    }

    const connectorId = mapping.source_connector
    const connector = config.connectors.connectors[connectorId]
    if (!connector || !['external_reference', 'rest_api'].includes(connector.type)) {
      return schemaForMappingProfile(mappingId, mapping, csvText)
    }

    const [metadata, preview] = await Promise.all([
      backendClient.discoverConnectorMetadata(connectorId, connector),
      backendClient.previewConnectorRows(connectorId, connector, 5),
    ])
    const runs = await backendClient.listConnectorRuns(connectorId)
    setSourceMetadata((current) => ({ ...current, [connectorId]: metadata }))
    setSourcePreviews((current) => ({ ...current, [connectorId]: preview }))
    setConnectorRuns((current) => ({ ...current, [connectorId]: runs }))
    setSelectedConnectorId(connectorId)
    return schemaFromExternalPreview(mappingId, mapping, metadata, preview)
  }

  async function runMappingValidation() {
    if (!config) return
    const mappingId = activeMappingId
    const mapping = config.mappings[mappingId]
    if (!mapping) return
    const schema = await loadMappingProfileSource(mappingId, mapping)
    const result = validateMappingAgainstSchema(mapping, schema)
    const summary = `${result.mappedFields.filter((field) => field.present).length}/${result.mappedFields.length} mapped fields present.`
    setCsvSchema(schema)
    setMappingResults((current) => ({ ...current, [mappingId]: result }))
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
        label: `${mappingId} mapping manifest`,
        status: result.status,
        summary: `${Object.keys(mapping.fields).length} mapped fields versioned from active manifest.`,
        payload: mapping,
      }),
    )
    record(
      'mapping',
      'validate',
      `${mappingId} mapping validation completed with ${result.status} status.`,
    )
  }

  async function selectMappingProfile(mappingId: string) {
    setActiveMappingId(mappingId)
    if (!config) return
    const mapping = config.mappings[mappingId]
    if (!mapping) return
    const schema = await loadMappingProfileSource(mappingId, mapping)
    setCsvSchema(schema)
    setMappingResults((current) => ({
      ...current,
      [mappingId]: validateMappingAgainstSchema(mapping, schema),
    }))
    const runs = await backendClient.listMappingRuns(mappingId)
    setMappingRuns((current) => ({ ...current, [mappingId]: runs }))
  }

  async function loadCanonicalFromMapping() {
    if (!config) return
    const mappingId = activeMappingId
    const mapping = config.mappings[mappingId]
    if (!mapping) return
    const connectorId =
      mappingId === 'quality_event' && config.connectors.connectors[canonicalLoadConnectorId]
        ? canonicalLoadConnectorId
        : mapping.source_connector
    const connector = config.connectors.connectors[connectorId]
    if (!connector) return
    const isExternalReference = ['external_reference', 'rest_api'].includes(connector.type)
    const latestMappingRun = mappingRuns[mappingId]?.[0]
    if (isExternalReference && latestMappingRun?.status !== 'pass') {
      record(
        'canonical',
        'load_blocked',
        `${mappingId} canonical load blocked until a passing mapping validation run is retained.`,
      )
      return
    }
    let profile: CanonicalLoadRequest = canonicalLoadProfileForConnector(connectorId, connector, mapping)
    if (isExternalReference) {
      const preview = sourcePreviews[connectorId] ?? await backendClient.previewConnectorRows(connectorId, connector, 25)
      setSourcePreviews((current) => ({ ...current, [connectorId]: preview }))
      profile = {
        ...profile,
        mappingId,
        targetObject: mapping.object,
        mappingFields: mapping.fields,
        primaryKey: {
          targetField: mapping.primary_key.target_field,
          sourceField: mapping.primary_key.source_field,
        },
        sourceRows: preview.rows,
        traceabilityLinks: mapping.traceability_links,
      }
    }
    const savedLoad = await backendClient.loadCanonicalFromMapping(profile)
    await Promise.all([refreshBackend(), refreshWorkflowSurface()])
    saveVersion(
      createSavedVersion({
        kind: 'canonical_load',
        label: `${mappingId} canonical load`,
        status: savedLoad.record?.status ?? (savedLoad.warnings.length > 0 ? 'warning' : 'pass'),
        summary: savedLoad.evidence,
        payload: savedLoad,
      }),
    )
    record(
      'canonical',
      'load',
      `${savedLoad.objectCount} canonical object(s) and ${savedLoad.linkCount} traceability link(s) loaded from ${mappingId}.`,
    )
    return savedLoad
  }

  async function saveExternalReferenceLoadDisposition({
    dueAt,
    owner,
    rationale,
    replay,
    status,
  }: {
    dueAt: string
    owner: string
    rationale: string
    replay?: boolean
    status: ExternalReferenceLoadExceptionDispositionStatus
  }) {
    if (!config) return
    const mappingId = activeMappingId
    const mapping = config.mappings[mappingId]
    if (!mapping || mappingId === 'quality_event') return
    const latestLoad = backendRecords.find(
      (record): record is BackendRecord<CanonicalLoadResult> =>
        record.kind === 'canonical_load' &&
        (record.payload as CanonicalLoadResult).mappingId === mappingId,
    )
    let replayedLoad: CanonicalLoadResult | undefined
    if (replay) {
      replayedLoad = await loadCanonicalFromMapping()
    }
    const createdAt = new Date().toISOString()
    const actor = owner.trim() || 'TRACS Mapping Owner'
    const finalStatus: ExternalReferenceLoadExceptionDispositionStatus = replay
      ? replayedLoad
        ? 'replayed'
        : 'retry_planned'
      : status
    const warnings = replayedLoad?.warnings ?? latestLoad?.payload.warnings ?? []
    const exceptionSummary =
      warnings.length > 0
        ? warnings.join(' ')
        : latestLoad
          ? `${latestLoad.payload.objectCount} object(s) and ${latestLoad.payload.linkCount} traceability link(s) loaded without warnings.`
          : 'No canonical load evidence exists yet for this external-reference mapping.'
    const payload: ExternalReferenceLoadExceptionDisposition = {
      dispositionId: `external_reference_disposition:${mappingId}:${createdAt}`,
      createdAt,
      mappingId,
      sourceConnector: mapping.source_connector,
      sourceObject: mapping.source_object,
      targetObject: mapping.object,
      latestLoadRecordId: replayedLoad?.record?.id ?? latestLoad?.id,
      latestLoadId: latestLoad?.payload.loadId,
      replayedLoadId: replayedLoad?.loadId,
      status: finalStatus,
      owner: actor,
      dueAt,
      rationale: rationale.trim() || 'Disposition recorded without additional rationale.',
      exceptionSummary,
      replayMode: replay ? 'manual_replay' : finalStatus === 'waived' ? 'waive_no_replay' : 'hold_until_source_ready',
      replayedAt: replayedLoad ? createdAt : undefined,
      warnings,
      auditHistory: [
        {
          action: replay ? 'replay_requested' : 'disposition_recorded',
          actor,
          timestamp: createdAt,
          status: finalStatus,
          summary: replay
            ? `${actor} requested replay for ${mappingId}.`
            : `${actor} recorded ${externalReferenceDispositionLabel(finalStatus)} for ${mappingId}.`,
        },
        ...(replayedLoad
          ? [{
              action: 'replay_completed' as const,
              actor,
              timestamp: createdAt,
              status: finalStatus,
              summary: `Replay completed with ${replayedLoad.objectCount} object(s), ${replayedLoad.linkCount} link(s), and ${warnings.length} warning(s).`,
            }]
          : []),
      ],
      evidence: replayedLoad
        ? `${mappingId} replay completed by ${actor}. ${replayedLoad.evidence}`
        : `${mappingId} load exception disposition recorded by ${actor}: ${externalReferenceDispositionLabel(finalStatus)}.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'external_reference_load_disposition',
      label: `${mappingId} load disposition`,
      status: externalReferenceDispositionStatusLevel(finalStatus),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'external_reference_load_disposition',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'mapping',
      replay ? 'replay_load' : 'save_disposition',
      `${mappingId} external-reference load disposition saved as backend record v${saved.version}.`,
    )
    return saved
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

  async function saveTraceabilityExportReview({
    graphPackage,
    reviewer,
    status,
    rationale,
    retentionClass,
  }: {
    graphPackage: TraceabilityGraphExportPackage
    reviewer: string
    status: TraceabilityExportReviewStatus
    rationale: string
    retentionClass: TraceabilityExportRetentionClass
  }) {
    const signedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Unassigned reviewer'
    const retainUntil = traceabilityRetentionUntil(retentionClass, signedAt)
    const retentionLabel = traceabilityRetentionLabel(retentionClass)
    const payload: TraceabilityExportReview = {
      reviewId: `traceability_export_review:${graphPackage.packageId}:${signedAt}`,
      packageId: graphPackage.packageId,
      signedAt,
      reviewer: reviewerName,
      status,
      rationale: rationale.trim() || 'No reviewer rationale recorded.',
      retention: {
        class: retentionClass,
        retainUntil,
        evidence:
          retainUntil === 'indefinite'
            ? `${retentionLabel} retention selected; retain until legal hold is released.`
            : `${retentionLabel} retention selected; retain until ${new Date(retainUntil).toLocaleDateString()}.`,
      },
      package: graphPackage,
      auditHistory: [
        {
          action: 'signed_export_review',
          actor: reviewerName,
          timestamp: signedAt,
          status,
          summary: `${reviewerName} signed traceability export ${graphPackage.packageId} as ${titleize(status)}.`,
        },
      ],
      evidence: `${graphPackage.evidence} Signed by ${reviewerName} as ${titleize(status)}. ${retentionLabel} retention applied.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'traceability_export_review',
      label: graphPackage.packageId,
      status: traceabilityReviewStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'traceability_export_review',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'traceability',
      'sign_export_review',
      `Traceability export review saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveTraceabilityDeliveryResponse({
    deliveryRecord,
    requestedActions,
    responseNotes,
    reviewer,
    routeStage,
    status,
  }: {
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    routeStage: TraceabilityDeliveryResponse['routeStage']
    status: TraceabilityDeliveryResponseStatus
  }) {
    const respondedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Unassigned reviewer'
    const graphPackage = (deliveryRecord.payload.request.evidence as { graphPackage?: TraceabilityGraphExportPackage })?.graphPackage
    const channelSummary = deliveryRecord.payload.result.channelResults
      .map((result) => `${titleize(result.channel)} ${result.mode}/${result.status}`)
      .join(', ')
    const payload: TraceabilityDeliveryResponse = {
      responseId: `traceability_delivery_response:${deliveryRecord.id}:${respondedAt}`,
      deliveryRecordId: deliveryRecord.id,
      deliverySubject: deliveryRecord.payload.request.subject,
      packageId: graphPackage?.packageId,
      selectedEventId: graphPackage?.selectedEvent?.canonical.event_id,
      respondedAt,
      reviewer: reviewerName,
      status,
      routeStage,
      responseNotes: responseNotes.trim() || 'No reviewer response notes recorded.',
      requestedActions,
      channelSummary,
      auditHistory: [
        {
          action: 'delivery_response_recorded',
          actor: reviewerName,
          timestamp: respondedAt,
          status,
          routeStage,
          summary: `${reviewerName} recorded ${traceabilityResponseLabel(status)} for ${deliveryRecord.payload.request.subject}.`,
        },
      ],
      evidence: `${reviewerName} recorded ${traceabilityResponseLabel(status)} for ${deliveryRecord.payload.request.subject}. ${requestedActions.length} requested action(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'traceability_delivery_response',
      label: deliveryRecord.payload.request.subject,
      status: traceabilityResponseStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'traceability_delivery_response',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'traceability',
      'delivery_response',
      `Traceability delivery response saved as backend record v${saved.version}.`,
    )
  }

  async function saveTraceabilityResponseClosureRoute({
    closureNotes,
    dueAt,
    notify,
    requestedActions,
    responseRecord,
    routeStage,
    routedReviewers,
    reviewer,
    status,
  }: {
    closureNotes: string
    dueAt: string
    notify?: boolean
    requestedActions: string[]
    responseRecord: BackendRecord<TraceabilityDeliveryResponse>
    routeStage: TraceabilityResponseClosureRouteStage
    routedReviewers: string[]
    reviewer: string
    status: TraceabilityResponseClosureRouteStatus
  }) {
    const routedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'TRACS Quality Reviewer'
    const recipients = routedReviewers.length > 0 ? routedReviewers : [reviewerName]
    const notificationId = `traceability_response_closure:${responseRecord.id}:${routedAt}`
    const notificationSummary =
      `${traceabilityClosureRouteLabel(status)} for ${responseRecord.payload.deliverySubject}. ${requestedActions.length} requested action(s) routed.`
    const notificationHistory = notify
      ? [{
          notificationId,
          routedAt,
          channels: ['email', 'teams', 'sharepoint_folder'] as Array<'email' | 'teams' | 'sharepoint_folder'>,
          recipients,
          summary: notificationSummary,
          evidence: `Closure follow-up notification prepared for ${recipients.join(', ')}.`,
        }]
      : []
    const payload: TraceabilityResponseClosureRoute = {
      routeId: `traceability_response_closure_route:${responseRecord.id}:${routedAt}`,
      routedAt,
      responseRecordId: responseRecord.id,
      responseId: responseRecord.payload.responseId,
      deliveryRecordId: responseRecord.payload.deliveryRecordId,
      deliverySubject: responseRecord.payload.deliverySubject,
      packageId: responseRecord.payload.packageId,
      selectedEventId: responseRecord.payload.selectedEventId,
      reviewer: reviewerName,
      status,
      routeStage,
      routedReviewers: recipients,
      dueAt,
      closureNotes: closureNotes.trim() || 'No closure follow-up notes recorded.',
      requestedActions,
      sourceResponseStatus: responseRecord.payload.status,
      channelSummary: responseRecord.payload.channelSummary,
      notificationHistory,
      auditHistory: [
        {
          action: notify ? 'closure_follow_up_notified' : 'closure_route_saved',
          actor: reviewerName,
          timestamp: routedAt,
          status,
          routeStage,
          summary: notificationSummary,
        },
      ],
      evidence: `${notificationSummary} Due ${dueAt || 'not scheduled'}.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'traceability_response_closure_route',
      label: responseRecord.payload.deliverySubject,
      status: traceabilityClosureRouteStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'traceability_response_closure_route',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'traceability',
      notify ? 'notify_response_closure' : 'save_response_closure_route',
      `Traceability response closure route saved as backend record v${saved.version}.`,
    )
    if (notify) {
      await deliverNotifications(
        notificationToDeliveryPayload(
          'traceability_response_closure',
          `Traceability response closure ${responseRecord.payload.deliverySubject}`,
          {
            notificationId,
            recipients,
            summary: notificationSummary,
            route: payload,
          },
        ),
      )
    }
    return saved
  }

  async function deliverNotifications(payload: NotificationDeliveryPayload) {
    const result = await backendClient.deliverNotification(payload)
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'notification_delivery',
        label: payload.subject,
        status: result.status,
        summary: result.evidence,
        payload: result,
      }),
    )
    record(
      'notification',
      'delivery',
      `${payload.subject} delivery completed with ${result.status} status.`,
    )
    return result
  }

  async function saveNotificationDeliveryRetryControl({
    deliveryRecord,
    execute,
    maxRetries,
    rationale,
    retryDelayMinutes,
    retryOnWarnings,
  }: {
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    execute: boolean
    maxRetries: number
    rationale: string
    retryDelayMinutes: number
    retryOnWarnings: boolean
  }) {
    const createdAt = new Date().toISOString()
    const existingRetryRecords = backendRecords.filter(
      (record): record is BackendRecord<NotificationDeliveryRetryControl> => {
        if (record.kind !== 'notification_delivery_retry') return false
        return (record.payload as NotificationDeliveryRetryControl).originalDeliveryRecordId === deliveryRecord.id
      },
    )
    const attempt = existingRetryRecords.length + 1
    const statusEligible =
      deliveryRecord.status === 'blocking' || (deliveryRecord.status === 'warning' && retryOnWarnings)
    const retryEligible = statusEligible && attempt <= maxRetries
    const retryDeliveryId = `${deliveryRecord.payload.request.deliveryId}:retry:${attempt}:${createdAt}`
    let retryResult: NotificationDeliveryResult | undefined

    if (execute && retryEligible) {
      retryResult = await deliverNotifications({
        ...deliveryRecord.payload.request,
        deliveryId: retryDeliveryId,
        generatedAt: createdAt,
        evidence: {
          originalDeliveryRecordId: deliveryRecord.id,
          originalDeliveryId: deliveryRecord.payload.result.deliveryId,
          retryAttempt: attempt,
          retryRationale: rationale.trim() || 'Retry executed from Backend delivery retry controls.',
          originalEvidence: deliveryRecord.payload.request.evidence,
        },
      })
    }

    const retryStatus: NotificationDeliveryRetryStatus = execute
      ? retryEligible
        ? 'executed'
        : 'blocked'
      : retryEligible
        ? 'planned'
        : 'blocked'
    const controlPayload: NotificationDeliveryRetryControl = {
      retryId: `notification_delivery_retry:${deliveryRecord.id}:${createdAt}`,
      createdAt,
      originalDeliveryRecordId: deliveryRecord.id,
      originalDeliveryId: deliveryRecord.payload.result.deliveryId,
      retryDeliveryId: retryResult ? retryDeliveryId : undefined,
      source: deliveryRecord.payload.request.source,
      subject: deliveryRecord.payload.request.subject,
      recipients: deliveryRecord.payload.request.recipients,
      channels: deliveryRecord.payload.request.channels,
      attempt,
      maxRetries,
      retryDelayMinutes,
      retryDueAt: addMinutesIso(createdAt, retryDelayMinutes),
      retryOnWarnings,
      retryEligible,
      status: retryStatus,
      originalStatus: deliveryRecord.status,
      retryStatus: retryResult?.status,
      rationale: rationale.trim() || 'Retry reviewed from Backend delivery retry controls.',
      originalResult: deliveryRecord.payload.result,
      retryResult,
      auditHistory: [
        {
          action: retryStatus === 'executed' ? 'retry_executed' : retryStatus === 'planned' ? 'retry_planned' : 'retry_blocked',
          actor: 'TRACS Backend',
          timestamp: createdAt,
          status: retryStatus,
          summary: `${deliverySourceLabel(deliveryRecord.payload.request.source)} retry ${notificationDeliveryRetryLabel(retryStatus).toLowerCase()} for attempt ${attempt} of ${maxRetries}.`,
        },
      ],
      evidence: retryEligible
        ? `${deliverySourceLabel(deliveryRecord.payload.request.source)} delivery retry ${notificationDeliveryRetryLabel(retryStatus).toLowerCase()} for attempt ${attempt} of ${maxRetries}.`
        : `${deliverySourceLabel(deliveryRecord.payload.request.source)} delivery retry blocked for attempt ${attempt} of ${maxRetries}; original status ${deliveryRecord.status} is not eligible under the active retry policy.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'notification_delivery_retry',
      label: `${deliverySourceLabel(deliveryRecord.payload.request.source)} delivery retry control`,
      status: notificationDeliveryRetryStatusLevel(retryStatus, retryResult?.status),
      summary: controlPayload.evidence,
      payload: controlPayload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'notification_delivery_retry',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      execute ? 'delivery_retry_execute' : 'delivery_retry_plan',
      `Notification delivery retry control saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveNotificationRetryQueueExportPackage({
    download,
    packagePayload,
  }: {
    download: boolean
    packagePayload: NotificationRetryQueueExportPackage
  }) {
    const saved = await backendClient.saveRecord({
      kind: 'notification_retry_queue_export_package',
      label: 'notification retry queue export package',
      status: packagePayload.status,
      summary: packagePayload.evidence,
      payload: packagePayload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'notification_retry_queue_export_package',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    if (download) {
      downloadJson('tracs-notification-retry-queue-export-package.json', packagePayload)
    }
    record(
      'notification',
      download ? 'retry_queue_export_package_download' : 'retry_queue_export_package_save',
      `Notification retry queue export package saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function deliverNotificationRetryQueueExportPackage({
    download,
    packagePayload,
  }: {
    download: boolean
    packagePayload: NotificationRetryQueueExportPackage
  }) {
    const saved = await saveNotificationRetryQueueExportPackage({ download, packagePayload })
    if (!saved) return
    await deliverNotifications(
      notificationToDeliveryPayload(
        'notification_retry_queue_export_package',
        'Notification retry queue operations review package',
        {
          notificationId: saved.payload.packageId,
          recipients: saved.payload.operationsReviewers,
          summary: `${saved.payload.operationsReviewers.join(', ')} retry queue package includes ${saved.payload.metrics.active} active retry item(s), ${saved.payload.metrics.overdue} overdue item(s), ${saved.payload.metrics.dueSoon} due-soon item(s), ${saved.payload.deliveryEvidence.length} delivery evidence record(s), and ${saved.payload.requiredActions.length} required action(s).`,
          package: saved.payload,
        },
      ),
    )
  }

  async function runNotificationSmokeFixtures() {
    const result = await backendClient.runNotificationSmokeFixtures()
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'notification_delivery',
        label: 'tenant notification smoke fixtures',
        status: result.status,
        summary: result.evidence,
        payload: result,
      }),
    )
    record(
      'notification',
      'smoke_fixtures',
      `Tenant notification smoke fixtures completed with ${result.status} status.`,
    )
  }

  async function savePostgresCutoverApproval({
    conditions,
    plannedCutoverAt,
    rationale,
    reviewer,
    rollbackWindow,
    status,
  }: {
    conditions: string
    plannedCutoverAt: string
    rationale: string
    reviewer: string
    rollbackWindow: string
    status: PostgresCutoverApprovalStatus
  }) {
    const signedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Unassigned reviewer'
    const reconciliationRecords = backendRecords.filter(
      (record): record is BackendRecord<PostgresImportReconciliation> =>
        record.kind === 'postgres_import_reconciliation',
    )
    const latestReconciliation = reconciliationRecords[0]
    const gateReview = evaluatePostgresCutoverGates({
      backendHealth,
      latestReconciliation,
      postgresMigrationChecklist,
    })
    const approvalStatus = postgresCutoverApprovalStatusLevel(status, gateReview.status)
    const payload: PostgresCutoverApproval = {
      approvalId: `postgres_cutover_approval:${signedAt}`,
      signedAt,
      reviewer: reviewerName,
      status,
      targetStoreMode: backendHealth?.store?.mode ?? 'unknown',
      sourceStoreMode: latestReconciliation?.payload.source === 'sqlite'
        ? 'sqlite'
        : latestReconciliation?.payload.source === 'json'
          ? 'json'
          : latestReconciliation?.payload.source
            ? 'mixed'
            : 'unknown',
      plannedCutoverAt,
      rollbackWindow: rollbackWindow.trim() || 'One release window with JSON or SQLite storage retained read-only.',
      rationale: rationale.trim() || 'No reviewer rationale recorded.',
      conditions: conditions.trim(),
      gates: gateReview.gates,
      latestReconciliation: latestReconciliation?.payload,
      checklistGates: postgresMigrationChecklist?.gates ?? [],
      rollbackPlan: postgresMigrationChecklist?.rollback ?? [],
      auditHistory: [
        {
          action: 'cutover_gate_review',
          actor: reviewerName,
          timestamp: signedAt,
          status,
          summary: `${reviewerName} recorded ${postgresCutoverApprovalLabel(status)} Postgres cutover approval with ${gateReview.status} gate status.`,
        },
      ],
      evidence: `${reviewerName} recorded ${postgresCutoverApprovalLabel(status)} Postgres cutover approval. Gate status: ${gateReview.status}.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'postgres_cutover_approval',
      label: 'production Postgres cutover approval',
      status: approvalStatus,
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'postgres_cutover_approval',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'backend',
      'postgres_cutover_approval',
      `Postgres cutover approval saved as backend record v${saved.version}.`,
    )
  }

  async function savePostgresCutoverChecklistPackage({
    download,
    reviewerAudience,
  }: {
    download: boolean
    reviewerAudience: string[]
  }) {
    const generatedAt = new Date().toISOString()
    const reconciliationRecords = backendRecords.filter(
      (record): record is BackendRecord<PostgresImportReconciliation> =>
        record.kind === 'postgres_import_reconciliation',
    )
    const latestReconciliation = reconciliationRecords[0]
    const latestApproval = backendRecords.find(
      (record): record is BackendRecord<PostgresCutoverApproval> =>
        record.kind === 'postgres_cutover_approval',
    )
    const gateReview = evaluatePostgresCutoverGates({
      backendHealth,
      latestReconciliation,
      postgresMigrationChecklist,
    })
    const reconciliationTotals = reconciliationRecords.reduce(
      (summary, record) => ({
        runs: summary.runs + 1,
        read: summary.read + record.payload.read,
        importable: summary.importable + record.payload.importable,
        imported: summary.imported + record.payload.imported,
        skipped: summary.skipped + record.payload.skipped,
        invalid: summary.invalid + record.payload.invalid,
      }),
      { runs: 0, read: 0, importable: 0, imported: 0, skipped: 0, invalid: 0 },
    )
    const recordKindCounts = backendRecords.reduce(
      (summary, record) => {
        summary[record.kind] = (summary[record.kind] ?? 0) + 1
        return summary
      },
      {} as Record<string, number>,
    )
    const requiredActions = gateReview.gates
      .filter((gate) => gate.status !== 'pass')
      .map((gate) => `${gate.label}: ${gate.evidence}`)
    const packagePayload: PostgresCutoverChecklistPackage = {
      packageId: `postgres_cutover_checklist:${generatedAt}`,
      generatedAt,
      reviewerAudience,
      status: gateReview.status,
      backendHealth,
      storageSchema,
      migrationChecklist: postgresMigrationChecklist,
      gateReview,
      latestReconciliation: latestReconciliation?.payload,
      latestApproval: latestApproval?.payload,
      reconciliationTotals,
      recordKindCounts,
      requiredActions,
      rollbackPlan: postgresMigrationChecklist?.rollback ?? latestApproval?.payload.rollbackPlan ?? [],
      evidence: `Postgres cutover checklist package generated with ${gateReview.status} gate status, ${reconciliationTotals.runs} reconciliation run(s), and ${reviewerAudience.length} reviewer audience entry(ies).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'postgres_cutover_checklist_package',
      label: 'production Postgres cutover checklist package',
      status: packagePayload.status,
      summary: packagePayload.evidence,
      payload: packagePayload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'postgres_cutover_checklist_package',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    if (download) {
      downloadJson('tracs-postgres-cutover-checklist-package.json', packagePayload)
    }
    record(
      'backend',
      download ? 'cutover_checklist_package_export' : 'cutover_checklist_package_save',
      `Postgres cutover checklist package saved as backend record v${saved.version}.`,
    )
  }

  async function savePostgresCutoverAcknowledgement({
    acknowledgementNotes,
    backupConfirmed,
    dueAt,
    productionReadiness,
    requiredActions,
    reviewer,
    reviewerRole,
    rollbackConfirmed,
    status,
  }: {
    acknowledgementNotes: string
    backupConfirmed: boolean
    dueAt: string
    productionReadiness: PostgresCutoverAcknowledgement['productionReadiness']
    requiredActions: string[]
    reviewer: string
    reviewerRole: PostgresCutoverAcknowledgement['reviewerRole']
    rollbackConfirmed: boolean
    status: PostgresCutoverAcknowledgementStatus
  }) {
    const acknowledgedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Infrastructure Reviewer'
    const latestPackage = backendRecords.find(
      (record): record is BackendRecord<PostgresCutoverChecklistPackage> =>
        record.kind === 'postgres_cutover_checklist_package',
    )
    const packageRequiredActions = latestPackage?.payload.requiredActions ?? []
    const retainedActions = [...packageRequiredActions, ...requiredActions]
      .map((action) => action.trim())
      .filter((action, index, actions) => action.length > 0 && actions.indexOf(action) === index)
    const payload: PostgresCutoverAcknowledgement = {
      acknowledgementId: `postgres_cutover_acknowledgement:${acknowledgedAt}`,
      acknowledgedAt,
      reviewer: reviewerName,
      reviewerRole,
      status,
      packageRecordId: latestPackage?.id,
      packageId: latestPackage?.payload.packageId,
      packageVersion: latestPackage?.version,
      gateStatus: latestPackage?.payload.gateReview.status ?? 'warning',
      requiredActions: retainedActions,
      dueAt,
      acknowledgementNotes: acknowledgementNotes.trim() || 'No infrastructure acknowledgement notes recorded.',
      productionReadiness,
      rollbackConfirmed,
      backupConfirmed,
      auditHistory: [
        {
          action: 'infrastructure_acknowledgement_recorded',
          actor: reviewerName,
          timestamp: acknowledgedAt,
          status,
          summary: `${reviewerName} recorded ${postgresCutoverAcknowledgementLabel(status)} for ${latestPackage?.payload.packageId ?? 'the latest Postgres cutover package'}.`,
        },
      ],
      evidence: `${reviewerName} recorded ${postgresCutoverAcknowledgementLabel(status)} for Postgres cutover package ${latestPackage?.payload.packageId ?? 'not generated'}. ${retainedActions.length} required action(s) retained.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'postgres_cutover_acknowledgement',
      label: 'production Postgres cutover infrastructure acknowledgement',
      status: postgresCutoverAcknowledgementStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'postgres_cutover_acknowledgement',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'backend',
      'postgres_cutover_acknowledgement',
      `Postgres cutover acknowledgement saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function deliverPostgresCutoverAcknowledgement(request: {
    acknowledgementNotes: string
    backupConfirmed: boolean
    dueAt: string
    productionReadiness: PostgresCutoverAcknowledgement['productionReadiness']
    requiredActions: string[]
    reviewer: string
    reviewerRole: PostgresCutoverAcknowledgement['reviewerRole']
    rollbackConfirmed: boolean
    status: PostgresCutoverAcknowledgementStatus
  }) {
    const saved = await savePostgresCutoverAcknowledgement(request)
    if (!saved) return
    const latestPackage = backendRecords.find(
      (record): record is BackendRecord<PostgresCutoverChecklistPackage> =>
        record.kind === 'postgres_cutover_checklist_package',
    )
    const recipients = latestPackage?.payload.reviewerAudience.length
      ? latestPackage.payload.reviewerAudience
      : [saved.payload.reviewer]
    await deliverNotifications(
      notificationToDeliveryPayload(
        'postgres_cutover_acknowledgement',
        'Postgres cutover infrastructure acknowledgement',
        {
          notificationId: saved.payload.acknowledgementId,
          recipients,
          summary: `${saved.payload.reviewer} recorded ${postgresCutoverAcknowledgementLabel(saved.payload.status)} for Postgres cutover package ${saved.payload.packageId ?? 'not linked'}.`,
          acknowledgement: saved.payload,
          package: latestPackage?.payload,
        },
      ),
    )
  }

  async function savePostgresCutoverOwnerReminder({
    dueAt,
    escalationPath,
    owners,
    reminderAt,
    renewalNotes,
    status,
  }: {
    dueAt: string
    escalationPath: string
    owners: string[]
    reminderAt: string
    renewalNotes: string
    status: PostgresCutoverOwnerReminderStatus
  }) {
    const routedAt = new Date().toISOString()
    const latestPackage = backendRecords.find(
      (record): record is BackendRecord<PostgresCutoverChecklistPackage> =>
        record.kind === 'postgres_cutover_checklist_package',
    )
    const latestAcknowledgement = backendRecords.find(
      (record): record is BackendRecord<PostgresCutoverAcknowledgement> =>
        record.kind === 'postgres_cutover_acknowledgement',
    )
    const reconciliationRecords = backendRecords.filter(
      (record): record is BackendRecord<PostgresImportReconciliation> =>
        record.kind === 'postgres_import_reconciliation',
    )
    const latestReconciliation = reconciliationRecords[0]
    const gateReview = evaluatePostgresCutoverGates({
      backendHealth,
      latestReconciliation,
      postgresMigrationChecklist,
    })
    const reminderOwners = owners.length > 0
      ? owners
      : latestPackage?.payload.reviewerAudience.length
        ? latestPackage.payload.reviewerAudience
        : ['Production Cutover Owner']
    const requiredActions = [
      ...(latestPackage?.payload.requiredActions ?? []),
      ...(latestAcknowledgement?.payload.requiredActions ?? []),
      latestAcknowledgement ? null : 'Retain infrastructure acknowledgement before production cutover owner renewal closure.',
      latestAcknowledgement?.payload.backupConfirmed
        ? null
        : 'Confirm managed Postgres backup retention before production cutover.',
      latestAcknowledgement?.payload.rollbackConfirmed
        ? null
        : 'Confirm rollback owner and rollback window before production cutover.',
    ]
      .filter((action): action is string => Boolean(action))
      .filter((action, index, actions) => actions.indexOf(action) === index)
    const reminderStatus = postgresCutoverOwnerReminderStatusLevel(status)
    const payload: PostgresCutoverOwnerReminder = {
      reminderId: `postgres_cutover_owner_reminder:${routedAt}`,
      routedAt,
      reminderAt,
      dueAt,
      owners: reminderOwners,
      status,
      packageRecordId: latestPackage?.id,
      packageId: latestPackage?.payload.packageId,
      packageVersion: latestPackage?.version,
      acknowledgementId: latestAcknowledgement?.payload.acknowledgementId,
      acknowledgementStatus: latestAcknowledgement?.payload.status,
      gateStatus: latestPackage?.payload.gateReview.status ?? gateReview.status,
      productionReadiness: latestAcknowledgement?.payload.productionReadiness,
      requiredActions,
      escalationPath: escalationPath.trim() || 'Escalate to TRACS Platform Owner if renewal is not acknowledged by the due date.',
      renewalNotes: renewalNotes.trim() || 'No production cutover owner renewal notes recorded.',
      auditHistory: [
        {
          action: status === 'sent' ? 'cutover_owner_reminder_sent' : 'cutover_owner_reminder_routed',
          actor: 'TRACS Backend',
          timestamp: routedAt,
          status,
          summary: `Production cutover owner reminder ${postgresCutoverOwnerReminderLabel(status).toLowerCase()} for ${reminderOwners.join(', ')}.`,
        },
      ],
      evidence: `Production cutover owner reminder ${postgresCutoverOwnerReminderLabel(status).toLowerCase()} for ${reminderOwners.join(', ')} with ${requiredActions.length} required action(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'postgres_cutover_owner_reminder',
      label: 'production cutover owner renewal reminder',
      status: reminderStatus,
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'postgres_cutover_owner_reminder',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'backend',
      'postgres_cutover_owner_reminder',
      `Postgres cutover owner reminder saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function deliverPostgresCutoverOwnerReminder(request: {
    dueAt: string
    escalationPath: string
    owners: string[]
    reminderAt: string
    renewalNotes: string
    status: PostgresCutoverOwnerReminderStatus
  }) {
    const saved = await savePostgresCutoverOwnerReminder({
      ...request,
      status: request.status === 'closed' ? request.status : 'sent',
    })
    if (!saved) return
    await deliverNotifications(
      notificationToDeliveryPayload(
        'postgres_cutover_owner_reminder',
        'Production cutover owner renewal reminder',
        {
          notificationId: saved.payload.reminderId,
          recipients: saved.payload.owners,
          summary: `${saved.payload.owners.join(', ')} production cutover reminder has ${saved.payload.requiredActions.length} required action(s) due by ${saved.payload.dueAt || 'unscheduled due date'}.`,
          reminder: saved.payload,
        },
      ),
    )
  }

  async function savePostgresCutoverReminderClosure({
    closureNotes,
    reviewer,
    status,
    supersededEvidence,
  }: {
    closureNotes: string
    reviewer: string
    status: PostgresCutoverReminderClosureStatus
    supersededEvidence: string[]
  }) {
    const closedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'TRACS Platform Owner'
    const latestReminder = backendRecords.find(
      (record): record is BackendRecord<PostgresCutoverOwnerReminder> =>
        record.kind === 'postgres_cutover_owner_reminder',
    )
    const packageRecords = backendRecords.filter(
      (record): record is BackendRecord<PostgresCutoverChecklistPackage> =>
        record.kind === 'postgres_cutover_checklist_package',
    )
    const latestPackage = packageRecords[0]
    const supersededPackages = packageRecords.slice(1, 5).map((record) => ({
      packageId: record.payload.packageId,
      packageVersion: record.version,
      generatedAt: record.payload.generatedAt,
      status: record.status,
      evidence: record.payload.evidence,
    }))
    const latestAcknowledgement = backendRecords.find(
      (record): record is BackendRecord<PostgresCutoverAcknowledgement> =>
        record.kind === 'postgres_cutover_acknowledgement',
    )
    const retainedActions = [
      ...(latestPackage?.payload.requiredActions ?? []),
      ...(latestReminder?.payload.requiredActions ?? []),
      ...(latestAcknowledgement?.payload.requiredActions ?? []),
    ]
      .map((action) => action.trim())
      .filter((action, index, actions) => action.length > 0 && actions.indexOf(action) === index)
    const retainedSupersededEvidence = [
      ...supersededEvidence,
      ...(supersededPackages.length > 0
        ? supersededPackages.map(
            (entry) => `Superseded package ${entry.packageId} v${entry.packageVersion} generated ${entry.generatedAt} retained with ${entry.status} status.`,
          )
        : ['No prior Postgres cutover package was available as superseded evidence.']),
    ]
      .map((entry) => entry.trim())
      .filter(Boolean)
    const payload: PostgresCutoverReminderClosure = {
      closureId: `postgres_cutover_reminder_closure:${closedAt}`,
      closedAt,
      reviewer: reviewerName,
      status,
      reminderRecordId: latestReminder?.id,
      reminderId: latestReminder?.payload.reminderId,
      reminderStatus: latestReminder?.payload.status,
      packageRecordId: latestPackage?.id,
      packageId: latestPackage?.payload.packageId,
      packageVersion: latestPackage?.version,
      acknowledgementId: latestAcknowledgement?.payload.acknowledgementId,
      acknowledgementStatus: latestAcknowledgement?.payload.status,
      productionReadiness: latestAcknowledgement?.payload.productionReadiness,
      supersededPackages,
      retainedActions,
      closureNotes: closureNotes.trim() || 'No production cutover reminder closure notes recorded.',
      supersededEvidence: retainedSupersededEvidence,
      auditHistory: [
        {
          action: 'cutover_reminder_closed',
          actor: reviewerName,
          timestamp: closedAt,
          status,
          summary: `${reviewerName} recorded ${postgresCutoverReminderClosureLabel(status)} for production cutover reminder closure.`,
        },
      ],
      evidence: `${reviewerName} recorded ${postgresCutoverReminderClosureLabel(status)} for production cutover reminder ${latestReminder?.payload.reminderId ?? 'not linked'} with ${retainedActions.length} retained action(s) and ${supersededPackages.length} superseded package(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'postgres_cutover_reminder_closure',
      label: 'production cutover reminder closure',
      status: postgresCutoverReminderClosureStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'postgres_cutover_reminder_closure',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'backend',
      'postgres_cutover_reminder_closure',
      `Postgres cutover reminder closure saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function savePostgresCutoverClosurePackage({
    download,
    finalHandoffNotes,
    finalHandoffReviewers,
  }: {
    download: boolean
    finalHandoffNotes: string
    finalHandoffReviewers: string[]
  }) {
    const generatedAt = new Date().toISOString()
    const latestPackage = backendRecords.find(
      (record): record is BackendRecord<PostgresCutoverChecklistPackage> =>
        record.kind === 'postgres_cutover_checklist_package',
    )
    const latestApproval = backendRecords.find(
      (record): record is BackendRecord<PostgresCutoverApproval> =>
        record.kind === 'postgres_cutover_approval',
    )
    const latestAcknowledgement = backendRecords.find(
      (record): record is BackendRecord<PostgresCutoverAcknowledgement> =>
        record.kind === 'postgres_cutover_acknowledgement',
    )
    const latestReminder = backendRecords.find(
      (record): record is BackendRecord<PostgresCutoverOwnerReminder> =>
        record.kind === 'postgres_cutover_owner_reminder',
    )
    const latestReminderClosure = backendRecords.find(
      (record): record is BackendRecord<PostgresCutoverReminderClosure> =>
        record.kind === 'postgres_cutover_reminder_closure',
    )
    const deliveryEvidence = backendRecords.filter(
      (record): record is BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }> =>
        record.kind === 'notification_delivery' &&
        ['postgres_cutover_acknowledgement', 'postgres_cutover_owner_reminder'].includes(
          (record.payload as { request?: NotificationDeliveryPayload }).request?.source ?? '',
        ),
    )
    const retryEvidence = backendRecords.filter(
      (record): record is BackendRecord<NotificationDeliveryRetryControl> =>
        record.kind === 'notification_delivery_retry' &&
        ['postgres_cutover_acknowledgement', 'postgres_cutover_owner_reminder'].includes(
          (record.payload as NotificationDeliveryRetryControl).source,
        ),
    )
    const requiredActions = [
      latestPackage ? null : 'Generate a production cutover checklist package before final infrastructure handoff.',
      latestApproval ? null : 'Retain Postgres cutover approval before final infrastructure handoff.',
      latestAcknowledgement ? null : 'Retain infrastructure acknowledgement before final infrastructure handoff.',
      latestReminder ? null : 'Retain production cutover owner reminder before final infrastructure handoff.',
      latestReminderClosure ? null : 'Close production cutover owner reminders before final infrastructure handoff.',
      ...(latestPackage?.payload.requiredActions ?? []),
      ...(latestAcknowledgement?.payload.requiredActions ?? []),
      ...(latestReminder?.payload.requiredActions ?? []),
      ...(latestReminderClosure?.payload.retainedActions ?? []),
    ]
      .filter((action): action is string => Boolean(action))
      .map((action) => action.trim())
      .filter((action, index, actions) => action.length > 0 && actions.indexOf(action) === index)
    const closureEvidence = [
      latestPackage?.payload.evidence,
      latestApproval?.payload.evidence,
      latestAcknowledgement?.payload.evidence,
      latestReminder?.payload.evidence,
      latestReminderClosure?.payload.evidence,
      ...(latestReminderClosure?.payload.supersededEvidence ?? []),
      ...deliveryEvidence.map((record) => record.payload.result.evidence),
      ...retryEvidence.map((record) => record.payload.evidence),
    ].filter((entry): entry is string => Boolean(entry))
    const status = postgresCutoverClosurePackageStatus({
      acknowledgement: latestAcknowledgement?.payload,
      closure: latestReminderClosure?.payload,
      requiredActions,
    })
    const reviewers = finalHandoffReviewers.length > 0
      ? finalHandoffReviewers
      : latestPackage?.payload.reviewerAudience.length
        ? latestPackage.payload.reviewerAudience
        : ['Infrastructure Owner']
    const payload: PostgresCutoverClosurePackage = {
      packageId: `postgres_cutover_closure:${generatedAt}`,
      generatedAt,
      finalHandoffReviewers: reviewers,
      status,
      latestPackage: latestPackage?.payload,
      latestApproval: latestApproval?.payload,
      latestAcknowledgement: latestAcknowledgement?.payload,
      latestReminder: latestReminder?.payload,
      latestReminderClosure: latestReminderClosure?.payload,
      deliveryEvidence,
      retryEvidence,
      closureEvidence,
      requiredActions,
      finalHandoffNotes: finalHandoffNotes.trim() || 'No final infrastructure handoff notes recorded.',
      sourceRecordCounts: {
        approvals: backendRecords.filter((record) => record.kind === 'postgres_cutover_approval').length,
        checklistPackages: backendRecords.filter((record) => record.kind === 'postgres_cutover_checklist_package').length,
        acknowledgements: backendRecords.filter((record) => record.kind === 'postgres_cutover_acknowledgement').length,
        ownerReminders: backendRecords.filter((record) => record.kind === 'postgres_cutover_owner_reminder').length,
        reminderClosures: backendRecords.filter((record) => record.kind === 'postgres_cutover_reminder_closure').length,
        deliveries: deliveryEvidence.length,
        retryControls: retryEvidence.length,
      },
      auditHistory: [
        {
          action: 'cutover_closure_package_generated',
          actor: 'TRACS Backend',
          timestamp: generatedAt,
          status,
          summary: `Production cutover closure package generated for ${reviewers.join(', ')} with ${requiredActions.length} required action(s).`,
        },
      ],
      evidence: `Production cutover closure package generated with ${status} status, ${closureEvidence.length} retained evidence item(s), and ${requiredActions.length} required action(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'postgres_cutover_closure_package',
      label: 'production cutover closure package',
      status,
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'postgres_cutover_closure_package',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    if (download) {
      downloadJson('tracs-postgres-cutover-closure-package.json', payload)
    }
    record(
      'backend',
      download ? 'postgres_cutover_closure_package_export' : 'postgres_cutover_closure_package_save',
      `Postgres cutover closure package saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function deliverPostgresCutoverClosurePackage({
    download,
    finalHandoffNotes,
    finalHandoffReviewers,
  }: {
    download: boolean
    finalHandoffNotes: string
    finalHandoffReviewers: string[]
  }) {
    const saved = await savePostgresCutoverClosurePackage({
      download,
      finalHandoffNotes,
      finalHandoffReviewers,
    })
    if (!saved) return
    await deliverNotifications(
      notificationToDeliveryPayload(
        'postgres_cutover_closure_package',
        'Production cutover closure package final handoff',
        {
          notificationId: saved.payload.packageId,
          recipients: saved.payload.finalHandoffReviewers,
          summary: `${saved.payload.finalHandoffReviewers.join(', ')} final handoff package includes ${saved.payload.closureEvidence.length} retained evidence item(s), ${saved.payload.deliveryEvidence.length} delivery record(s), ${saved.payload.retryEvidence.length} retry control(s), and ${saved.payload.requiredActions.length} required action(s).`,
          package: saved.payload,
        },
      ),
    )
  }

  async function saveNotificationLiveChannelApproval({
    approvedChannels,
    rationale,
    reviewer,
    status,
  }: {
    approvedChannels: NotificationLiveChannelApproval['approvedChannels']
    rationale: string
    reviewer: string
    status: NotificationLiveChannelApprovalStatus
  }) {
    const approvedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Unassigned reviewer'
    const payload: NotificationLiveChannelApproval = {
      approvalId: `notification_live_channel_approval:${approvedAt}`,
      approvedAt,
      reviewer: reviewerName,
      status,
      approvedChannels,
      rationale: rationale.trim() || 'No reviewer rationale recorded.',
      requiredEvidence: [
        'Dry-run notification_delivery evidence reviewed.',
        'Tenant recipients, Teams webhook, or SharePoint folder target approved.',
        'Live delivery environment variables will be enabled one channel at a time.',
      ],
      expiresAt: notificationApprovalExpiresAt(approvedAt),
      auditHistory: [
        {
          action: 'live_channel_signoff',
          actor: reviewerName,
          timestamp: approvedAt,
          status,
          summary: `${reviewerName} recorded ${titleize(status)} sign-off for ${approvedChannels.length} notification channel(s).`,
        },
      ],
      evidence: `${reviewerName} recorded ${titleize(status)} sign-off for ${approvedChannels.map(titleize).join(', ') || 'no live channels'}.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'notification_live_channel_approval',
      label: 'tenant notification live-channel approval',
      status: notificationApprovalStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'notification_live_channel_approval',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'live_channel_signoff',
      `Notification live-channel approval saved as backend record v${saved.version}.`,
    )
  }

  async function saveNotificationApprovalRenewalRoute({
    channels,
    dueAt,
    rationale,
    reminderAt,
    reviewers,
    routeStage,
  }: {
    channels: NotificationApprovalRenewalRoute['channels']
    dueAt: string
    rationale: string
    reminderAt: string
    reviewers: string[]
    routeStage: NotificationApprovalRenewalRoute['routeStage']
  }) {
    const latestApproval = backendRecords.find(
      (record): record is BackendRecord<NotificationLiveChannelApproval> =>
        record.kind === 'notification_live_channel_approval',
    )
    const expiry = notificationApprovalExpiryStatus(latestApproval)
    const routedAt = new Date().toISOString()
    const routedReviewers = reviewers.length > 0 ? reviewers : [latestApproval?.payload.reviewer ?? 'TRACS Tenant Reviewer']
    const payload: NotificationApprovalRenewalRoute = {
      routeId: `notification_approval_renewal:${routedAt}`,
      routedAt,
      approvalId: latestApproval?.payload.approvalId,
      approvalExpiresAt: latestApproval?.payload.expiresAt,
      daysUntilExpiry: expiry.daysUntilExpiry,
      expiryStatus: expiry.status,
      routeStage,
      routedReviewers,
      dueAt,
      reminderAt,
      channels,
      rationale: rationale.trim() || 'No renewal rationale recorded.',
      requiredEvidence: [
        'Review latest notification live-channel approval record.',
        'Confirm tenant recipients, Teams webhook, or SharePoint folder targets remain approved.',
        'Run dry-run smoke fixture evidence before renewing live-channel approval.',
      ],
      auditHistory: [
        {
          action: 'renewal_routed',
          actor: routedReviewers[0],
          timestamp: routedAt,
          routeStage,
          summary: `Notification live-channel approval renewal routed to ${routedReviewers.join(', ')}.`,
        },
      ],
      evidence: `${expiry.evidence} Renewal routed to ${routedReviewers.join(', ')}.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'notification_approval_renewal',
      label: 'notification live-channel approval renewal',
      status: expiry.status,
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'notification_approval_renewal',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'renewal_routed',
      `Notification approval renewal route saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function deliverNotificationApprovalRenewalRoute(request: {
    channels: NotificationApprovalRenewalRoute['channels']
    dueAt: string
    rationale: string
    reminderAt: string
    reviewers: string[]
    routeStage: NotificationApprovalRenewalRoute['routeStage']
  }) {
    const saved = await saveNotificationApprovalRenewalRoute(request)
    const notification = createNotificationApprovalRenewalNotification(saved.payload)
    await deliverNotifications({
      ...notificationToDeliveryPayload(
        'notification_approval_renewal',
        'Notification live-channel approval renewal',
        notification,
      ),
      channels: request.channels,
    })
  }

  async function saveNotificationApprovalRenewalClosure({
    closureNotes,
    reviewer,
    status,
  }: {
    closureNotes: string
    reviewer: string
    status: NotificationApprovalRenewalClosureStatus
  }) {
    const closedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Unassigned reviewer'
    const approvalRecords = backendRecords.filter(
      (record): record is BackendRecord<NotificationLiveChannelApproval> =>
        record.kind === 'notification_live_channel_approval',
    )
    const renewalRecords = backendRecords.filter(
      (record): record is BackendRecord<NotificationApprovalRenewalRoute> =>
        record.kind === 'notification_approval_renewal',
    )
    const renewedApproval = approvalRecords[0]
    const supersededApproval = approvalRecords[1]
    const latestRenewal = renewalRecords[0]
    const supersededEvidence = [
      supersededApproval
        ? `Superseded approval ${supersededApproval.payload.approvalId} expired ${new Date(supersededApproval.payload.expiresAt).toLocaleDateString()} and covered ${supersededApproval.payload.approvedChannels.map(titleize).join(', ')}.`
        : 'No prior approval record was available to supersede.',
      renewedApproval
        ? `Renewed approval ${renewedApproval.payload.approvalId} expires ${new Date(renewedApproval.payload.expiresAt).toLocaleDateString()} and covers ${renewedApproval.payload.approvedChannels.map(titleize).join(', ')}.`
        : 'No renewed approval record was available.',
      latestRenewal
        ? `Renewal route ${latestRenewal.payload.routeId} was retained at ${titleize(latestRenewal.payload.routeStage)}.`
        : 'No renewal route record was available.',
    ]
    const payload: NotificationApprovalRenewalClosure = {
      closureId: `notification_approval_renewal_closure:${closedAt}`,
      closedAt,
      reviewer: reviewerName,
      status,
      renewalRouteId: latestRenewal?.payload.routeId,
      renewalRouteStage: latestRenewal?.payload.routeStage,
      renewedApprovalId: renewedApproval?.payload.approvalId,
      renewedApprovalExpiresAt: renewedApproval?.payload.expiresAt,
      supersededApprovalId: supersededApproval?.payload.approvalId,
      supersededApprovalExpiresAt: supersededApproval?.payload.expiresAt,
      approvedChannels: renewedApproval?.payload.approvedChannels ?? [],
      closureNotes: closureNotes.trim() || 'No renewal closure notes recorded.',
      supersededEvidence,
      requiredEvidence: [
        'Renewed notification_live_channel_approval record retained.',
        'Prior approval identified as superseded or explicitly noted unavailable.',
        'Renewal route record reviewed before closure.',
      ],
      auditHistory: [
        {
          action: 'renewal_closed',
          actor: reviewerName,
          timestamp: closedAt,
          status,
          summary: `${reviewerName} recorded ${notificationRenewalClosureLabel(status)} for notification approval renewal.`,
        },
      ],
      evidence: `${reviewerName} recorded ${notificationRenewalClosureLabel(status)} for notification approval renewal. ${supersededApproval ? 'Superseded approval evidence retained.' : 'No superseded approval was available.'}`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'notification_approval_renewal_closure',
      label: 'notification live-channel approval renewal closure',
      status: notificationRenewalClosureStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'notification_approval_renewal_closure',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'renewal_closed',
      `Notification approval renewal closure saved as backend record v${saved.version}.`,
    )
  }

  async function saveNotificationClosureExportPackage({
    download,
    messagingOwners,
    ownerNotes,
  }: {
    download: boolean
    messagingOwners: string[]
    ownerNotes: string
  }) {
    const generatedAt = new Date().toISOString()
    const approvalRecords = backendRecords.filter(
      (record): record is BackendRecord<NotificationLiveChannelApproval> =>
        record.kind === 'notification_live_channel_approval',
    )
    const renewalRecords = backendRecords.filter(
      (record): record is BackendRecord<NotificationApprovalRenewalRoute> =>
        record.kind === 'notification_approval_renewal',
    )
    const closureRecords = backendRecords.filter(
      (record): record is BackendRecord<NotificationApprovalRenewalClosure> =>
        record.kind === 'notification_approval_renewal_closure',
    )
    const deliveryEvidence = backendRecords.filter(
      (record): record is BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }> =>
        record.kind === 'notification_delivery' &&
        ['notification_approval_renewal', 'traceability_response_closure'].includes(
          (record.payload as { request?: { source?: string } }).request?.source ?? '',
        ),
    )
    const latestClosure = closureRecords[0]
    const latestRenewalRoute = renewalRecords[0]
    const latestApproval = approvalRecords[0]
    const supersededApproval = approvalRecords[1]
    const channelSummary = deliveryEvidence.flatMap((record) =>
      record.payload.result.channelResults.map((channel) => ({
        channel: channel.channel,
        mode: channel.mode,
        status: channel.status,
        evidence: channel.evidence,
      })),
    )
    const requiredActions = [
      latestClosure ? null : 'Retain a notification approval renewal closure before final owner handoff.',
      latestRenewalRoute ? null : 'Retain a notification approval renewal route before final owner handoff.',
      latestApproval ? null : 'Retain a renewed notification live-channel approval before final owner handoff.',
      supersededApproval ? null : 'Identify superseded approval evidence or record that no prior approval exists.',
      deliveryEvidence.length > 0 ? null : 'Retain notification delivery dry-run or live handoff evidence.',
      ...((latestClosure?.payload.requiredEvidence ?? []).map((item) => `Closure evidence: ${item}`)),
    ].filter((action): action is string => Boolean(action))
    const status = latestClosure?.status ?? 'warning'
    const owners = messagingOwners.length > 0 ? messagingOwners : ['Messaging Owner']
    const packagePayload: NotificationClosureExportPackage = {
      packageId: `notification_closure_export:${generatedAt}`,
      generatedAt,
      messagingOwners: owners,
      status,
      latestClosure: latestClosure?.payload,
      latestRenewalRoute: latestRenewalRoute?.payload,
      latestApproval: latestApproval?.payload,
      supersededApproval: supersededApproval?.payload,
      deliveryEvidence,
      channelSummary,
      requiredActions,
      ownerNotes: ownerNotes.trim() || 'No messaging owner handoff notes recorded.',
      evidence: `Notification closure export package generated for ${owners.join(', ')} with ${requiredActions.length} required action(s), ${deliveryEvidence.length} delivery record(s), and ${channelSummary.length} channel evidence item(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'notification_closure_export_package',
      label: 'notification closure export package',
      status: packagePayload.status,
      summary: packagePayload.evidence,
      payload: packagePayload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'notification_closure_export_package',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    if (download) {
      downloadJson('tracs-notification-closure-export-package.json', packagePayload)
    }
    record(
      'notification',
      download ? 'closure_export_package_download' : 'closure_export_package_save',
      `Notification closure export package saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function deliverNotificationClosureExportPackage(request: {
    download: boolean
    messagingOwners: string[]
    ownerNotes: string
  }) {
    const saved = await saveNotificationClosureExportPackage(request)
    if (!saved) return
    await deliverNotifications(
      notificationToDeliveryPayload(
        'notification_closure_export_package',
        'Notification closure export package',
        {
          notificationId: saved.payload.packageId,
          recipients: saved.payload.messagingOwners,
          summary: `${saved.payload.messagingOwners.join(', ')} notification closure package includes ${saved.payload.deliveryEvidence.length} delivery record(s), ${saved.payload.channelSummary.length} channel evidence item(s), and ${saved.payload.requiredActions.length} required action(s).`,
          package: saved.payload,
        },
      ),
    )
  }

  async function saveClosureSlaExportPackage({
    download,
    packagePayload,
  }: {
    download: boolean
    packagePayload: ClosureSlaExportPackage
  }) {
    const saved = await backendClient.saveRecord({
      kind: 'closure_sla_export_package',
      label: 'closure SLA export package',
      status: packagePayload.status,
      summary: packagePayload.evidence,
      payload: packagePayload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_sla_export_package',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    if (download) {
      downloadJson('tracs-closure-sla-export-package.json', packagePayload)
    }
    record(
      'notification',
      download ? 'closure_sla_export_package_download' : 'closure_sla_export_package_save',
      `Closure SLA export package saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function deliverClosureSlaExportPackage({
    download,
    packagePayload,
  }: {
    download: boolean
    packagePayload: ClosureSlaExportPackage
  }) {
    const saved = await saveClosureSlaExportPackage({ download, packagePayload })
    if (!saved) return
    await deliverNotifications(
      notificationToDeliveryPayload(
        'closure_sla_export_package',
        'Closure SLA governance export package',
        {
          notificationId: saved.payload.packageId,
          recipients: saved.payload.governanceReviewers,
          summary: `${saved.payload.governanceReviewers.join(', ')} closure SLA package includes ${saved.payload.metrics.open} open route(s), ${saved.payload.metrics.overdue} overdue route(s), and ${saved.payload.requiredActions.length} required action(s).`,
          package: saved.payload,
        },
      ),
    )
  }

  async function saveClosureSlaDeliveryAcknowledgement({
    deliveryRecord,
    requestedActions,
    responseNotes,
    reviewer,
    routeStage,
    status,
  }: {
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    routeStage: ClosureSlaDeliveryAcknowledgement['routeStage']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) {
    const acknowledgedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const deliveryPackage = (deliveryRecord.payload.request.evidence as { package?: ClosureSlaExportPackage })?.package
    const packageRecord = backendRecords.find(
      (record): record is BackendRecord<ClosureSlaExportPackage> => {
        if (record.kind !== 'closure_sla_export_package') return false
        return (record.payload as ClosureSlaExportPackage).packageId === deliveryPackage?.packageId
      },
    )
    const channelSummary = deliveryRecord.payload.result.channelResults
      .map((result) => `${titleize(result.channel)} ${result.mode}/${result.status}`)
      .join(', ')
    const payload: ClosureSlaDeliveryAcknowledgement = {
      acknowledgementId: `closure_sla_delivery_ack:${deliveryRecord.id}:${acknowledgedAt}`,
      acknowledgedAt,
      deliveryRecordId: deliveryRecord.id,
      deliveryId: deliveryRecord.payload.result.deliveryId,
      deliverySubject: deliveryRecord.payload.request.subject,
      packageId: deliveryPackage?.packageId,
      packageRecordId: packageRecord?.id,
      packageVersion: packageRecord?.version,
      reviewer: reviewerName,
      status,
      routeStage,
      responseNotes: responseNotes.trim() || 'No governance reviewer response notes recorded.',
      requestedActions,
      channelSummary,
      sourceMetrics: deliveryPackage?.metrics,
      sourceRequiredActions: deliveryPackage?.requiredActions ?? [],
      auditHistory: [
        {
          action: 'closure_sla_delivery_acknowledged',
          actor: reviewerName,
          timestamp: acknowledgedAt,
          status,
          routeStage,
          summary: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}. ${requestedActions.length} requested action(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_sla_delivery_acknowledgement',
      label: deliveryRecord.payload.request.subject,
      status: closureSlaDeliveryAcknowledgementStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_sla_delivery_acknowledgement',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_sla_delivery_acknowledgement',
      `Closure SLA delivery acknowledgement saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveClosureSlaResponseFollowUpRoute({
    acknowledgementRecord,
    dueAt,
    escalationPath,
    followUpStage,
    notify,
    requestedActions,
    routeNotes,
    routedOwners,
    reviewer,
    status,
  }: {
    acknowledgementRecord: BackendRecord<ClosureSlaDeliveryAcknowledgement>
    dueAt: string
    escalationPath: string
    followUpStage: ClosureSlaResponseFollowUpRoute['followUpStage']
    notify?: boolean
    requestedActions: string[]
    routeNotes: string
    routedOwners: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpStatus
  }) {
    const routedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || acknowledgementRecord.payload.reviewer || 'Governance Reviewer'
    const recipients = routedOwners.length > 0 ? routedOwners : [reviewerName]
    const notificationId = `closure_sla_response_follow_up:${acknowledgementRecord.id}:${routedAt}`
    const notificationSummary =
      `${closureSlaFollowUpLabel(status)} Closure SLA response follow-up routed for ${acknowledgementRecord.payload.deliverySubject}. ${requestedActions.length} requested action(s).`
    const notificationHistory = notify
      ? [{
          notificationId,
          routedAt,
          channels: ['email', 'teams', 'sharepoint_folder'] as Array<'email' | 'teams' | 'sharepoint_folder'>,
          recipients,
          summary: notificationSummary,
          evidence: `Closure SLA response follow-up notification prepared for ${recipients.join(', ')}.`,
        }]
      : []
    const payload: ClosureSlaResponseFollowUpRoute = {
      routeId: `closure_sla_response_follow_up:${acknowledgementRecord.id}:${routedAt}`,
      routedAt,
      acknowledgementRecordId: acknowledgementRecord.id,
      acknowledgementId: acknowledgementRecord.payload.acknowledgementId,
      deliveryRecordId: acknowledgementRecord.payload.deliveryRecordId,
      deliverySubject: acknowledgementRecord.payload.deliverySubject,
      packageId: acknowledgementRecord.payload.packageId,
      packageVersion: acknowledgementRecord.payload.packageVersion,
      reviewer: reviewerName,
      status,
      followUpStage,
      routedOwners: recipients,
      dueAt,
      escalationPath: escalationPath.trim() || 'Escalate unresolved Closure SLA response actions to the TRACS governance owner.',
      routeNotes: routeNotes.trim() || 'No Closure SLA response follow-up route notes recorded.',
      requestedActions,
      sourceResponseStatus: acknowledgementRecord.payload.status,
      sourceRouteStage: acknowledgementRecord.payload.routeStage,
      sourceMetrics: acknowledgementRecord.payload.sourceMetrics,
      sourceRequiredActions: acknowledgementRecord.payload.sourceRequiredActions,
      notificationHistory,
      auditHistory: [
        {
          action: notify ? 'closure_sla_follow_up_notified' : 'closure_sla_follow_up_routed',
          actor: reviewerName,
          timestamp: routedAt,
          status,
          followUpStage,
          summary: notificationSummary,
        },
      ],
      evidence: `${notificationSummary} Due ${dueAt || 'not scheduled'} for ${recipients.join(', ')}.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_sla_response_follow_up_route',
      label: acknowledgementRecord.payload.deliverySubject,
      status: closureSlaFollowUpStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_sla_response_follow_up_route',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      notify ? 'closure_sla_follow_up_notified' : 'closure_sla_follow_up_routed',
      `Closure SLA response follow-up route saved as backend record v${saved.version}.`,
    )
    if (notify) {
      await deliverNotifications(
        notificationToDeliveryPayload(
          'closure_sla_response_follow_up',
          `Closure SLA response follow-up ${acknowledgementRecord.payload.deliverySubject}`,
          {
            notificationId,
            recipients,
            summary: notificationSummary,
            route: payload,
          },
        ),
      )
    }
    return saved
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
    const notification = createReportApprovalNotification(normalizedReport)
    const payload: ReportCatalogItem = {
      ...normalizedReport,
      publishStatus:
        action === 'publish' ? (gate.status === 'pass' ? 'published' : 'blocked') : normalizedReport.publishStatus ?? 'draft',
      publishGateEvidence:
        action === 'publish' ? gate.evidence : normalizedReport.publishGateEvidence ?? 'Draft saved; publish gate has not been applied.',
      publishedAt: action === 'publish' && gate.status === 'pass' ? signedAt : normalizedReport.publishedAt,
      approvalStatus,
      approvalSignedAt: action === 'signoff' ? signedAt : normalizedReport.approvalSignedAt,
      notificationHistory:
        action === 'signoff'
          ? [
              ...(normalizedReport.notificationHistory ?? []),
              {
                notificationId: notification.notificationId,
                sentAt: signedAt,
                routeStage: normalizedReport.reviewerRouteStage ?? 'owner_review',
                recipients: notification.recipients,
                summary: notification.summary,
                evidence: notification.evidence.join(' '),
              },
            ]
          : normalizedReport.notificationHistory,
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
            externalReferenceDispositions={backendRecords.filter(
              (record): record is BackendRecord<ExternalReferenceLoadExceptionDisposition> =>
                record.kind === 'external_reference_load_disposition' &&
                (record.payload as ExternalReferenceLoadExceptionDisposition).mappingId === activeMappingId,
            )}
            latestCanonicalLoad={backendRecords.find(
              (record): record is BackendRecord<CanonicalLoadResult> =>
                record.kind === 'canonical_load' &&
                (record.payload as CanonicalLoadResult).mappingId === activeMappingId,
            )}
            activeMappingId={activeMappingId}
            mapping={config.mappings[activeMappingId] ?? config.mappings.quality_event}
            mappingIds={Object.keys(config.mappings)}
            mappingResult={mappingResults[activeMappingId] ?? null}
            mappingRuns={mappingRuns[activeMappingId] ?? []}
            profileMetadata={sourceMetadata[config.mappings[activeMappingId]?.source_connector ?? '']}
            profilePreview={sourcePreviews[config.mappings[activeMappingId]?.source_connector ?? '']}
            onCsvTextChange={setCsvText}
            onCreateExtractionJob={saveExtractionJob}
            onLoadConnectorChange={setCanonicalLoadConnectorId}
            onLoadCanonical={loadCanonicalFromMapping}
            onMappingChange={selectMappingProfile}
            onRunExtractionJob={runExtractionJob}
            onSaveLoadDisposition={saveExternalReferenceLoadDisposition}
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
            canonicalObjects={canonicalObjects}
            closureRouteRecords={backendRecords.filter(
              (record): record is BackendRecord<TraceabilityResponseClosureRoute> =>
                record.kind === 'traceability_response_closure_route',
            )}
            deliveryRecords={backendRecords.filter(
              (record): record is BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }> =>
                record.kind === 'notification_delivery',
            )}
            evidenceRecords={backendRecords.filter(
              (record): record is BackendRecord<ReadinessEvidencePacket> =>
                record.kind === 'readiness_evidence_packet',
            )}
            events={qualityEvents}
            links={traceabilityLinks}
            onDeliverNotifications={deliverNotifications}
            onSaveDeliveryResponse={saveTraceabilityDeliveryResponse}
            onSaveResponseClosureRoute={saveTraceabilityResponseClosureRoute}
            onSelectEvent={setSelectedQualityEventId}
            onSaveExportReview={saveTraceabilityExportReview}
            responseRecords={backendRecords.filter(
              (record): record is BackendRecord<TraceabilityDeliveryResponse> =>
                record.kind === 'traceability_delivery_response',
            )}
            reviewRecords={backendRecords.filter(
              (record): record is BackendRecord<TraceabilityExportReview> =>
                record.kind === 'traceability_export_review',
            )}
            selectedEventId={selectedQualityEventId}
          />
        ) : activeView === 'Reports' ? (
          <ReportCatalogView
            canonicalObjects={canonicalObjects}
            deliveryRecords={backendRecords.filter(
              (record): record is BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }> =>
                record.kind === 'notification_delivery',
            )}
            onDeliverNotifications={deliverNotifications}
            onSaveReport={saveReportCatalogItem}
            reports={reportCatalog}
          />
        ) : activeView === 'Evidence' ? (
          <EvidencePacketWorkspace
            backendRecords={backendRecords}
            deliveryRecords={backendRecords.filter(
              (record): record is BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }> =>
                record.kind === 'notification_delivery',
            )}
            evidenceRecords={backendRecords.filter(
              (record) => record.kind === 'readiness_evidence_packet',
            )}
            environment={config.environment.environment.name}
            onDeliverNotifications={deliverNotifications}
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
            notificationApprovalRecords={backendRecords.filter(
              (record): record is BackendRecord<NotificationLiveChannelApproval> =>
                record.kind === 'notification_live_channel_approval',
            )}
            notificationRenewalRecords={backendRecords.filter(
              (record): record is BackendRecord<NotificationApprovalRenewalRoute> =>
                record.kind === 'notification_approval_renewal',
            )}
            notificationRenewalClosureRecords={backendRecords.filter(
              (record): record is BackendRecord<NotificationApprovalRenewalClosure> =>
                record.kind === 'notification_approval_renewal_closure',
            )}
            notificationClosureExportPackageRecords={backendRecords.filter(
              (record): record is BackendRecord<NotificationClosureExportPackage> =>
                record.kind === 'notification_closure_export_package',
            )}
            notificationDeliveryRetryRecords={backendRecords.filter(
              (record): record is BackendRecord<NotificationDeliveryRetryControl> =>
                record.kind === 'notification_delivery_retry',
            )}
            notificationRetryQueueExportPackageRecords={backendRecords.filter(
              (record): record is BackendRecord<NotificationRetryQueueExportPackage> =>
                record.kind === 'notification_retry_queue_export_package',
            )}
            closureSlaExportPackageRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosureSlaExportPackage> =>
                record.kind === 'closure_sla_export_package',
            )}
            closureSlaDeliveryAcknowledgementRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosureSlaDeliveryAcknowledgement> =>
                record.kind === 'closure_sla_delivery_acknowledgement',
            )}
            closureSlaResponseFollowUpRouteRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosureSlaResponseFollowUpRoute> =>
                record.kind === 'closure_sla_response_follow_up_route',
            )}
            traceabilityClosureRouteRecords={backendRecords.filter(
              (record): record is BackendRecord<TraceabilityResponseClosureRoute> =>
                record.kind === 'traceability_response_closure_route',
            )}
            postgresCutoverApprovalRecords={backendRecords.filter(
              (record): record is BackendRecord<PostgresCutoverApproval> =>
                record.kind === 'postgres_cutover_approval',
            )}
            postgresCutoverAcknowledgementRecords={backendRecords.filter(
              (record): record is BackendRecord<PostgresCutoverAcknowledgement> =>
                record.kind === 'postgres_cutover_acknowledgement',
            )}
            postgresCutoverOwnerReminderRecords={backendRecords.filter(
              (record): record is BackendRecord<PostgresCutoverOwnerReminder> =>
                record.kind === 'postgres_cutover_owner_reminder',
            )}
            postgresCutoverReminderClosureRecords={backendRecords.filter(
              (record): record is BackendRecord<PostgresCutoverReminderClosure> =>
                record.kind === 'postgres_cutover_reminder_closure',
            )}
            postgresCutoverClosurePackageRecords={backendRecords.filter(
              (record): record is BackendRecord<PostgresCutoverClosurePackage> =>
                record.kind === 'postgres_cutover_closure_package',
            )}
            postgresCutoverPackageRecords={backendRecords.filter(
              (record): record is BackendRecord<PostgresCutoverChecklistPackage> =>
                record.kind === 'postgres_cutover_checklist_package',
            )}
            onRefresh={refreshBackend}
            onRunAdapterDryRun={runAdapterDryRun}
            onRunNotificationSmokeFixtures={runNotificationSmokeFixtures}
            onDeliverNotificationApprovalRenewalRoute={deliverNotificationApprovalRenewalRoute}
            onDeliverNotificationClosureExportPackage={deliverNotificationClosureExportPackage}
            onDeliverPostgresCutoverAcknowledgement={deliverPostgresCutoverAcknowledgement}
            onDeliverPostgresCutoverOwnerReminder={deliverPostgresCutoverOwnerReminder}
            onDeliverPostgresCutoverClosurePackage={deliverPostgresCutoverClosurePackage}
            onDeliverClosureSlaExportPackage={deliverClosureSlaExportPackage}
            onDeliverNotificationRetryQueueExportPackage={deliverNotificationRetryQueueExportPackage}
            onSaveClosureSlaDeliveryAcknowledgement={saveClosureSlaDeliveryAcknowledgement}
            onSaveClosureSlaResponseFollowUpRoute={saveClosureSlaResponseFollowUpRoute}
            onSaveNotificationDeliveryRetryControl={saveNotificationDeliveryRetryControl}
            onSaveNotificationRetryQueueExportPackage={saveNotificationRetryQueueExportPackage}
            onSaveNotificationApprovalRenewalClosure={saveNotificationApprovalRenewalClosure}
            onSaveNotificationClosureExportPackage={saveNotificationClosureExportPackage}
            onSaveClosureSlaExportPackage={saveClosureSlaExportPackage}
            onSaveNotificationApprovalRenewalRoute={saveNotificationApprovalRenewalRoute}
            onSavePostgresCutoverAcknowledgement={savePostgresCutoverAcknowledgement}
            onSavePostgresCutoverOwnerReminder={savePostgresCutoverOwnerReminder}
            onSavePostgresCutoverReminderClosure={savePostgresCutoverReminderClosure}
            onSavePostgresCutoverClosurePackage={savePostgresCutoverClosurePackage}
            onSavePostgresCutoverApproval={savePostgresCutoverApproval}
            onSavePostgresCutoverChecklistPackage={savePostgresCutoverChecklistPackage}
            onSaveSnapshot={saveBackendSnapshot}
            onSaveNotificationLiveApproval={saveNotificationLiveChannelApproval}
            storageSchema={storageSchema}
            postgresMigrationChecklist={postgresMigrationChecklist}
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
  deliveryRecords,
  environment,
  evidenceRecords,
  onDeliverNotifications,
  onDownloadPacket,
  onSavePacket,
  readinessChecks,
  readinessSummary,
  reports,
}: {
  backendRecords: BackendRecord[]
  deliveryRecords: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>[]
  environment: string
  evidenceRecords: BackendRecord[]
  onDeliverNotifications: (payload: NotificationDeliveryPayload) => void
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
  const evidenceNotification = createEvidenceApprovalNotification(packet, approval)
  const evidenceDeliveryPayload = notificationToDeliveryPayload(
    'readiness_evidence',
    `${environment.toUpperCase()} readiness evidence approval`,
    evidenceNotification,
  )
  const evidenceDeliveryRecords = deliveryRecords.filter(
    (record) => record.payload.request.source === 'readiness_evidence',
  )

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
          <button
            className="secondary-action"
            onClick={() =>
              downloadJson('tracs-evidence-approval-notifications.json', evidenceNotification)
            }
            type="button"
          >
            <Bell size={15} />
            Export Notices
          </button>
          <button
            className="secondary-action"
            onClick={() => onDeliverNotifications(evidenceDeliveryPayload)}
            type="button"
          >
            <PlugZap size={15} />
            Run Delivery
          </button>
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

      <section className="panel">
        <PanelHeader
          icon={Bell}
          title="Notification Delivery Evidence"
          subtitle="Dry-run delivery records for email, Teams, and SharePoint folder handoff."
        />
        {evidenceDeliveryRecords.length > 0 ? (
          <div className="mapping-run-history">
            {evidenceDeliveryRecords.slice(0, 4).map((record) => (
              <div className="mapping-run-row" key={record.id}>
                <div>
                  <strong>{record.label}</strong>
                  <span>
                    v{record.version} / {new Date(record.createdAt).toLocaleString()} / {record.payload.result.evidence}
                  </span>
                  <small>
                    {record.payload.result.channelResults
                      .map((channel) => `${channel.channel}: ${channel.mode} ${channel.status}`)
                      .join(' / ')}
                  </small>
                </div>
                <StatusChip status={record.status} label={record.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No evidence notification delivery has been recorded yet.</div>
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
  closureSlaDeliveryAcknowledgementRecords,
  closureSlaExportPackageRecords,
  closureSlaResponseFollowUpRouteRecords,
  connectorEntries,
  notificationApprovalRecords,
  notificationClosureExportPackageRecords,
  notificationDeliveryRetryRecords,
  notificationRetryQueueExportPackageRecords,
  notificationRenewalRecords,
  notificationRenewalClosureRecords,
  traceabilityClosureRouteRecords,
  postgresCutoverApprovalRecords,
  postgresCutoverAcknowledgementRecords,
  postgresCutoverOwnerReminderRecords,
  postgresCutoverReminderClosureRecords,
  postgresCutoverClosurePackageRecords,
  postgresCutoverPackageRecords,
  onRefresh,
  onRunAdapterDryRun,
  onRunNotificationSmokeFixtures,
  onDeliverNotificationApprovalRenewalRoute,
  onDeliverNotificationClosureExportPackage,
  onDeliverPostgresCutoverAcknowledgement,
  onDeliverPostgresCutoverOwnerReminder,
  onDeliverPostgresCutoverClosurePackage,
  onDeliverClosureSlaExportPackage,
  onDeliverNotificationRetryQueueExportPackage,
  onSaveClosureSlaDeliveryAcknowledgement,
  onSaveClosureSlaResponseFollowUpRoute,
  onSaveNotificationDeliveryRetryControl,
  onSaveNotificationRetryQueueExportPackage,
  onSaveNotificationApprovalRenewalClosure,
  onSaveClosureSlaExportPackage,
  onSaveNotificationClosureExportPackage,
  onSaveNotificationApprovalRenewalRoute,
  onSavePostgresCutoverAcknowledgement,
  onSavePostgresCutoverOwnerReminder,
  onSavePostgresCutoverReminderClosure,
  onSavePostgresCutoverClosurePackage,
  onSavePostgresCutoverApproval,
  onSavePostgresCutoverChecklistPackage,
  onSaveSnapshot,
  onSaveNotificationLiveApproval,
  postgresMigrationChecklist,
  storageSchema,
}: {
  adapterContracts: AdapterContract[]
  adapterDryRuns: Record<string, AdapterDryRunResult>
  backendHealth: BackendHealth | null
  backendRecords: BackendRecord[]
  closureSlaDeliveryAcknowledgementRecords: BackendRecord<ClosureSlaDeliveryAcknowledgement>[]
  closureSlaExportPackageRecords: BackendRecord<ClosureSlaExportPackage>[]
  closureSlaResponseFollowUpRouteRecords: BackendRecord<ClosureSlaResponseFollowUpRoute>[]
  connectorEntries: [string, AppConfig['connectors']['connectors'][string]][]
  notificationApprovalRecords: BackendRecord<NotificationLiveChannelApproval>[]
  notificationClosureExportPackageRecords: BackendRecord<NotificationClosureExportPackage>[]
  notificationDeliveryRetryRecords: BackendRecord<NotificationDeliveryRetryControl>[]
  notificationRetryQueueExportPackageRecords: BackendRecord<NotificationRetryQueueExportPackage>[]
  notificationRenewalRecords: BackendRecord<NotificationApprovalRenewalRoute>[]
  notificationRenewalClosureRecords: BackendRecord<NotificationApprovalRenewalClosure>[]
  traceabilityClosureRouteRecords: BackendRecord<TraceabilityResponseClosureRoute>[]
  postgresCutoverApprovalRecords: BackendRecord<PostgresCutoverApproval>[]
  postgresCutoverAcknowledgementRecords: BackendRecord<PostgresCutoverAcknowledgement>[]
  postgresCutoverOwnerReminderRecords: BackendRecord<PostgresCutoverOwnerReminder>[]
  postgresCutoverReminderClosureRecords: BackendRecord<PostgresCutoverReminderClosure>[]
  postgresCutoverClosurePackageRecords: BackendRecord<PostgresCutoverClosurePackage>[]
  postgresCutoverPackageRecords: BackendRecord<PostgresCutoverChecklistPackage>[]
  onRefresh: () => void
  onRunAdapterDryRun: (connectorId: string) => void
  onRunNotificationSmokeFixtures: () => void
  onDeliverNotificationApprovalRenewalRoute: (request: {
    channels: NotificationApprovalRenewalRoute['channels']
    dueAt: string
    rationale: string
    reminderAt: string
    reviewers: string[]
    routeStage: NotificationApprovalRenewalRoute['routeStage']
  }) => void
  onDeliverNotificationClosureExportPackage: (request: {
    download: boolean
    messagingOwners: string[]
    ownerNotes: string
  }) => void
  onDeliverPostgresCutoverAcknowledgement: (request: {
    acknowledgementNotes: string
    backupConfirmed: boolean
    dueAt: string
    productionReadiness: PostgresCutoverAcknowledgement['productionReadiness']
    requiredActions: string[]
    reviewer: string
    reviewerRole: PostgresCutoverAcknowledgement['reviewerRole']
    rollbackConfirmed: boolean
    status: PostgresCutoverAcknowledgementStatus
  }) => void
  onDeliverPostgresCutoverOwnerReminder: (request: {
    dueAt: string
    escalationPath: string
    owners: string[]
    reminderAt: string
    renewalNotes: string
    status: PostgresCutoverOwnerReminderStatus
  }) => void
  onDeliverPostgresCutoverClosurePackage: (request: {
    download: boolean
    finalHandoffNotes: string
    finalHandoffReviewers: string[]
  }) => void
  onDeliverClosureSlaExportPackage: (request: {
    download: boolean
    packagePayload: ClosureSlaExportPackage
  }) => void
  onDeliverNotificationRetryQueueExportPackage: (request: {
    download: boolean
    packagePayload: NotificationRetryQueueExportPackage
  }) => void
  onSaveClosureSlaDeliveryAcknowledgement: (request: {
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    routeStage: ClosureSlaDeliveryAcknowledgement['routeStage']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) => void
  onSaveClosureSlaResponseFollowUpRoute: (request: {
    acknowledgementRecord: BackendRecord<ClosureSlaDeliveryAcknowledgement>
    dueAt: string
    escalationPath: string
    followUpStage: ClosureSlaResponseFollowUpRoute['followUpStage']
    notify?: boolean
    requestedActions: string[]
    routeNotes: string
    routedOwners: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpStatus
  }) => void
  onSaveNotificationDeliveryRetryControl: (request: {
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    execute: boolean
    maxRetries: number
    rationale: string
    retryDelayMinutes: number
    retryOnWarnings: boolean
  }) => void
  onSaveNotificationRetryQueueExportPackage: (request: {
    download: boolean
    packagePayload: NotificationRetryQueueExportPackage
  }) => void
  onSaveNotificationApprovalRenewalClosure: (request: {
    closureNotes: string
    reviewer: string
    status: NotificationApprovalRenewalClosureStatus
  }) => void
  onSaveClosureSlaExportPackage: (request: {
    download: boolean
    packagePayload: ClosureSlaExportPackage
  }) => void
  onSaveNotificationClosureExportPackage: (request: {
    download: boolean
    messagingOwners: string[]
    ownerNotes: string
  }) => void
  onSaveNotificationApprovalRenewalRoute: (request: {
    channels: NotificationApprovalRenewalRoute['channels']
    dueAt: string
    rationale: string
    reminderAt: string
    reviewers: string[]
    routeStage: NotificationApprovalRenewalRoute['routeStage']
  }) => void
  onSavePostgresCutoverAcknowledgement: (request: {
    acknowledgementNotes: string
    backupConfirmed: boolean
    dueAt: string
    productionReadiness: PostgresCutoverAcknowledgement['productionReadiness']
    requiredActions: string[]
    reviewer: string
    reviewerRole: PostgresCutoverAcknowledgement['reviewerRole']
    rollbackConfirmed: boolean
    status: PostgresCutoverAcknowledgementStatus
  }) => void
  onSavePostgresCutoverOwnerReminder: (request: {
    dueAt: string
    escalationPath: string
    owners: string[]
    reminderAt: string
    renewalNotes: string
    status: PostgresCutoverOwnerReminderStatus
  }) => void
  onSavePostgresCutoverReminderClosure: (request: {
    closureNotes: string
    reviewer: string
    status: PostgresCutoverReminderClosureStatus
    supersededEvidence: string[]
  }) => void
  onSavePostgresCutoverClosurePackage: (request: {
    download: boolean
    finalHandoffNotes: string
    finalHandoffReviewers: string[]
  }) => void
  onSavePostgresCutoverApproval: (request: {
    conditions: string
    plannedCutoverAt: string
    rationale: string
    reviewer: string
    rollbackWindow: string
    status: PostgresCutoverApprovalStatus
  }) => void
  onSavePostgresCutoverChecklistPackage: (request: {
    download: boolean
    reviewerAudience: string[]
  }) => void
  onSaveSnapshot: () => void
  onSaveNotificationLiveApproval: (request: {
    approvedChannels: NotificationLiveChannelApproval['approvedChannels']
    rationale: string
    reviewer: string
    status: NotificationLiveChannelApprovalStatus
  }) => void
  postgresMigrationChecklist: PostgresMigrationChecklist | null
  storageSchema: RecordStoreSchema | null
}) {
  const [notificationReviewer, setNotificationReviewer] = useState('TRACS Tenant Reviewer')
  const [notificationApprovalStatus, setNotificationApprovalStatus] =
    useState<NotificationLiveChannelApprovalStatus>('approved')
  const [notificationApprovalRationale, setNotificationApprovalRationale] = useState(
    'Reviewed dry-run delivery evidence and approved staged tenant live-channel validation.',
  )
  const [notificationChannels, setNotificationChannels] = useState<NotificationLiveChannelApproval['approvedChannels']>([
    'email',
    'teams',
  ])
  const latestNotificationApproval = notificationApprovalRecords[0]
  const notificationExpiry = notificationApprovalExpiryStatus(latestNotificationApproval)
  const [renewalReviewers, setRenewalReviewers] = useState('TRACS Tenant Reviewer')
  const [renewalRouteStage, setRenewalRouteStage] =
    useState<NotificationApprovalRenewalRoute['routeStage']>('renewal_review')
  const [renewalDueAt, setRenewalDueAt] = useState(notificationApprovalRenewalDueAt(latestNotificationApproval))
  const [renewalReminderAt, setRenewalReminderAt] = useState(new Date().toISOString().slice(0, 10))
  const [renewalRationale, setRenewalRationale] = useState(
    'Route renewal before tenant live-channel approval expires; rerun smoke fixture evidence before reapproval.',
  )
  const [renewalClosureReviewer, setRenewalClosureReviewer] = useState('TRACS Tenant Reviewer')
  const [renewalClosureStatus, setRenewalClosureStatus] =
    useState<NotificationApprovalRenewalClosureStatus>('closed')
  const [renewalClosureNotes, setRenewalClosureNotes] = useState(
    'Renewal completed; previous live-channel approval is superseded by the retained renewed approval record.',
  )
  const [notificationClosureOwners, setNotificationClosureOwners] = useState(
    'Messaging Owner, Tenant Communications Owner',
  )
  const [notificationClosureExportNotes, setNotificationClosureExportNotes] = useState(
    'Package retained closure, delivery, superseded approval, and channel evidence for messaging owner handoff.',
  )
  const [closureSlaGovernanceReviewers, setClosureSlaGovernanceReviewers] = useState(
    'Quality Governance Reviewer, Operations Owner',
  )
  const [closureSlaReviewerNotes, setClosureSlaReviewerNotes] = useState(
    'Governance review package retained current closure SLA queue, overdue routes, and owner follow-up evidence.',
  )
  const [closureSlaAckReviewer, setClosureSlaAckReviewer] = useState('Quality Governance Reviewer')
  const [closureSlaAckStatus, setClosureSlaAckStatus] =
    useState<ClosureSlaDeliveryAcknowledgementStatus>('acknowledged')
  const [closureSlaAckRouteStage, setClosureSlaAckRouteStage] =
    useState<ClosureSlaDeliveryAcknowledgement['routeStage']>('governance_acknowledgement')
  const [closureSlaAckNotes, setClosureSlaAckNotes] = useState(
    'Governance reviewer acknowledged the delivered Closure SLA package and retained owner follow-up evidence.',
  )
  const [closureSlaAckActions, setClosureSlaAckActions] = useState(
    'Review overdue closure routes with accountable owners before the next governance review.',
  )
  const [closureSlaFollowUpOwners, setClosureSlaFollowUpOwners] = useState(
    'Operations Owner, Quality Governance Reviewer',
  )
  const [closureSlaFollowUpStatus, setClosureSlaFollowUpStatus] =
    useState<ClosureSlaResponseFollowUpStatus>('routed')
  const [closureSlaFollowUpStage, setClosureSlaFollowUpStage] =
    useState<ClosureSlaResponseFollowUpRoute['followUpStage']>('owner_follow_up')
  const [closureSlaFollowUpDueAt, setClosureSlaFollowUpDueAt] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 5)
    return date.toISOString().slice(0, 10)
  })
  const [closureSlaFollowUpEscalationPath, setClosureSlaFollowUpEscalationPath] = useState(
    'Escalate unresolved Closure SLA response actions to the TRACS governance owner before the next review cycle.',
  )
  const [closureSlaFollowUpNotes, setClosureSlaFollowUpNotes] = useState(
    'Route governance response actions to owners and retain response follow-up evidence before closing the Closure SLA review.',
  )
  const [postgresReviewer, setPostgresReviewer] = useState('TRACS Platform Owner')
  const [postgresApprovalStatus, setPostgresApprovalStatus] =
    useState<PostgresCutoverApprovalStatus>('approved_with_conditions')
  const [postgresCutoverAt, setPostgresCutoverAt] = useState('')
  const [postgresRollbackWindow, setPostgresRollbackWindow] = useState(
    'Keep JSON or SQLite storage read-only for one release window after Postgres cutover.',
  )
  const [postgresCutoverRationale, setPostgresCutoverRationale] = useState(
    'Reviewed Postgres health, migration checklist, import reconciliation evidence, and rollback readiness.',
  )
  const [postgresCutoverConditions, setPostgresCutoverConditions] = useState(
    'Apply-run reconciliation must be retained before production traffic is switched.',
  )
  const [postgresPackageReviewers, setPostgresPackageReviewers] = useState(
    'Infrastructure Owner, Database Administrator, Security Reviewer',
  )
  const [postgresAcknowledgementReviewer, setPostgresAcknowledgementReviewer] = useState('Infrastructure Owner')
  const [postgresAcknowledgementRole, setPostgresAcknowledgementRole] =
    useState<PostgresCutoverAcknowledgement['reviewerRole']>('infrastructure_owner')
  const [postgresAcknowledgementStatus, setPostgresAcknowledgementStatus] =
    useState<PostgresCutoverAcknowledgementStatus>('acknowledged_with_actions')
  const [postgresAcknowledgementDueAt, setPostgresAcknowledgementDueAt] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toISOString().slice(0, 10)
  })
  const [postgresProductionReadiness, setPostgresProductionReadiness] =
    useState<PostgresCutoverAcknowledgement['productionReadiness']>('ready_with_conditions')
  const [postgresRollbackConfirmed, setPostgresRollbackConfirmed] = useState(true)
  const [postgresBackupConfirmed, setPostgresBackupConfirmed] = useState(false)
  const [postgresAcknowledgementActions, setPostgresAcknowledgementActions] = useState(
    'Confirm managed Postgres backup retention and restore drill owner before live cutover.',
  )
  const [postgresAcknowledgementNotes, setPostgresAcknowledgementNotes] = useState(
    'Infrastructure review acknowledges the cutover package and retains required action ownership before production enablement.',
  )
  const [postgresCutoverReminderOwners, setPostgresCutoverReminderOwners] = useState(
    'Infrastructure Owner, Database Administrator, Security Reviewer',
  )
  const [postgresCutoverReminderStatus, setPostgresCutoverReminderStatus] =
    useState<PostgresCutoverOwnerReminderStatus>('routed')
  const [postgresCutoverReminderAt, setPostgresCutoverReminderAt] = useState(new Date().toISOString().slice(0, 10))
  const [postgresCutoverReminderDueAt, setPostgresCutoverReminderDueAt] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 3)
    return date.toISOString().slice(0, 10)
  })
  const [postgresCutoverEscalationPath, setPostgresCutoverEscalationPath] = useState(
    'Escalate unresolved backup, rollback, and production readiness actions to the TRACS Platform Owner before enabling shared persistence.',
  )
  const [postgresCutoverReminderNotes, setPostgresCutoverReminderNotes] = useState(
    'Renewal reminder confirms owner accountability for cutover package actions before production enablement.',
  )
  const [postgresReminderClosureReviewer, setPostgresReminderClosureReviewer] = useState('TRACS Platform Owner')
  const [postgresReminderClosureStatus, setPostgresReminderClosureStatus] =
    useState<PostgresCutoverReminderClosureStatus>('closed_with_actions')
  const [postgresReminderClosureNotes, setPostgresReminderClosureNotes] = useState(
    'Cutover reminder closure retained latest owner response, current package evidence, and superseded package history before production enablement.',
  )
  const [postgresReminderSupersededEvidence, setPostgresReminderSupersededEvidence] = useState(
    'Prior cutover checklist package retained for comparison before closing the current owner reminder route.',
  )
  const [postgresClosurePackageReviewers, setPostgresClosurePackageReviewers] = useState(
    'Infrastructure Owner, Database Administrator, Security Reviewer',
  )
  const [postgresClosurePackageNotes, setPostgresClosurePackageNotes] = useState(
    'Final infrastructure handoff package retains cutover approval, checklist, acknowledgement, owner reminder closure, delivery evidence, and rollback evidence.',
  )
  const [deliveryRetrySource, setDeliveryRetrySource] =
    useState<NotificationDeliveryPayload['source']>('notification_closure_export_package')
  const [deliveryRetryMaxRetries, setDeliveryRetryMaxRetries] = useState('2')
  const [deliveryRetryDelayMinutes, setDeliveryRetryDelayMinutes] = useState('15')
  const [deliveryRetryOnWarnings, setDeliveryRetryOnWarnings] = useState(true)
  const [deliveryRetryRationale, setDeliveryRetryRationale] = useState(
    'Retry retained because closure or cutover notification delivery produced warning or blocking evidence.',
  )
  const [retryQueueOperationsReviewers, setRetryQueueOperationsReviewers] = useState(
    'Notification Operations Owner, Messaging Owner',
  )
  const [retryQueueReviewerNotes, setRetryQueueReviewerNotes] = useState(
    'Operations review package retained current retry queue aging, retry due windows, delivery evidence, and required follow-up actions.',
  )
  const [retryQueueMeasuredAt] = useState(() => new Date())
  const recordCounts = backendRecords.reduce(
    (summary, record) => {
      summary[record.kind] = (summary[record.kind] ?? 0) + 1
      return summary
    },
    {} as Record<string, number>,
  )
  const reconciliationRecords = backendRecords.filter(
    (record): record is BackendRecord<PostgresImportReconciliation> =>
      record.kind === 'postgres_import_reconciliation',
  )
  const latestReconciliation = reconciliationRecords[0]
  const latestKindCounts = latestReconciliation?.payload.recordKindCounts ?? {}
  const latestTopKinds = Object.entries(latestKindCounts)
    .sort((first, second) => second[1] - first[1])
    .slice(0, 5)
  const reconciliationTotals = reconciliationRecords.reduce(
    (summary, record) => ({
      read: summary.read + record.payload.read,
      importable: summary.importable + record.payload.importable,
      imported: summary.imported + record.payload.imported,
      skipped: summary.skipped + record.payload.skipped,
      invalid: summary.invalid + record.payload.invalid,
    }),
    { read: 0, importable: 0, imported: 0, skipped: 0, invalid: 0 },
  )
  const latestNotificationRenewal = notificationRenewalRecords[0]
  const latestNotificationRenewalClosure = notificationRenewalClosureRecords[0]
  const latestNotificationClosureExportPackage = notificationClosureExportPackageRecords[0]
  const latestClosureSlaExportPackage = closureSlaExportPackageRecords[0]
  const closedNotificationRenewalRouteIds = new Set(
    notificationRenewalClosureRecords
      .map((record) => record.payload.renewalRouteId)
      .filter((routeId): routeId is string => Boolean(routeId)),
  )
  const closureSlaRows: ClosureSlaExportPackage['rows'] = [
    ...notificationRenewalRecords.map((record) => {
      const closed =
        record.payload.routeStage === 'closed' ||
        closedNotificationRenewalRouteIds.has(record.payload.routeId)
      const status = closureSlaStatus(record.payload.dueAt, closed)
      return {
        id: record.id,
        source: 'Notification renewal' as const,
        subject: 'Live-channel approval renewal',
        owner: record.payload.routedReviewers.join(', ') || 'Unassigned',
        dueAt: record.payload.dueAt,
        closed,
        daysRemaining: daysUntilDue(record.payload.dueAt),
        stage: closed ? 'Closed' : titleize(record.payload.routeStage),
        status,
        evidence: record.payload.evidence,
      }
    }),
    ...traceabilityClosureRouteRecords.map((record) => {
      const closed = record.payload.status === 'closed' || record.payload.routeStage === 'closed'
      const status = closureSlaStatus(record.payload.dueAt, closed, record.payload.status === 'escalated')
      return {
        id: record.id,
        source: 'Traceability response' as const,
        subject: record.payload.deliverySubject,
        owner: record.payload.routedReviewers.join(', ') || record.payload.reviewer,
        dueAt: record.payload.dueAt,
        closed,
        daysRemaining: daysUntilDue(record.payload.dueAt),
        stage: traceabilityClosureRouteLabel(record.payload.status),
        status,
        evidence: record.payload.evidence,
      }
    }),
  ].sort((first, second) => {
    const severity = { blocking: 0, warning: 1, pass: 2 } satisfies Record<StatusLevel, number>
    const severityDelta = severity[first.status] - severity[second.status]
    if (severityDelta !== 0) return severityDelta
    return (first.daysRemaining ?? Number.MAX_SAFE_INTEGER) - (second.daysRemaining ?? Number.MAX_SAFE_INTEGER)
  })
  const closureSlaMetrics = closureSlaRows.reduce(
    (summary, row) => {
      summary.total += 1
      if (row.closed) summary.closed += 1
      else summary.open += 1
      if (!row.closed && row.status === 'blocking') summary.overdue += 1
      if (!row.closed && row.status === 'warning') summary.dueSoon += 1
      if (!row.closed && row.source === 'Notification renewal') summary.notificationOpen += 1
      if (!row.closed && row.source === 'Traceability response') summary.traceabilityOpen += 1
      return summary
    },
    {
      total: 0,
      open: 0,
      closed: 0,
      overdue: 0,
      dueSoon: 0,
      notificationOpen: 0,
      traceabilityOpen: 0,
    },
  )
  const closureSlaOverallStatus = mostSevereStatus(closureSlaRows.map((row) => row.status))
  const supersededNotificationApproval = notificationApprovalRecords[1]
  const latestPostgresCutoverApproval = postgresCutoverApprovalRecords[0]
  const latestPostgresCutoverPackage = postgresCutoverPackageRecords[0]
  const latestPostgresCutoverAcknowledgement = postgresCutoverAcknowledgementRecords[0]
  const latestPostgresCutoverOwnerReminder = postgresCutoverOwnerReminderRecords[0]
  const latestPostgresCutoverReminderClosure = postgresCutoverReminderClosureRecords[0]
  const latestPostgresCutoverClosurePackage = postgresCutoverClosurePackageRecords[0]
  const postgresCutoverGateReview = evaluatePostgresCutoverGates({
    backendHealth,
    latestReconciliation,
    postgresMigrationChecklist,
  })
  const postgresCutoverStatus = postgresCutoverApprovalStatusLevel(
    postgresApprovalStatus,
    postgresCutoverGateReview.status,
  )
  const deliveryRecords = backendRecords.filter(
    (record): record is BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }> =>
      record.kind === 'notification_delivery',
  )
  const retryControlledSources: NotificationDeliveryPayload['source'][] = [
    'notification_closure_export_package',
    'notification_retry_queue_export_package',
    'closure_sla_export_package',
    'closure_sla_response_follow_up',
    'postgres_cutover_acknowledgement',
    'postgres_cutover_owner_reminder',
    'postgres_cutover_closure_package',
  ]
  const retryableDeliveryRecords = deliveryRecords.filter(
    (record) =>
      retryControlledSources.includes(record.payload.request.source) &&
      record.payload.request.source === deliveryRetrySource,
  )
  const latestRetryableDelivery = retryableDeliveryRecords[0]
  const retryControlsForSource = notificationDeliveryRetryRecords.filter(
    (record) => record.payload.source === deliveryRetrySource,
  )
  const retryControlsByOriginalDelivery = notificationDeliveryRetryRecords.reduce(
    (summary, record) => {
      summary[record.payload.originalDeliveryRecordId] = (summary[record.payload.originalDeliveryRecordId] ?? 0) + 1
      return summary
    },
    {} as Record<string, number>,
  )
  const deliveryRetryPolicy = {
    maxRetries: Math.max(1, Number(deliveryRetryMaxRetries) || 1),
    retryDelayMinutes: Math.max(0, Number(deliveryRetryDelayMinutes) || 0),
    retryOnWarnings: deliveryRetryOnWarnings,
  }
  const latestRetryAttemptCount = latestRetryableDelivery
    ? retryControlsByOriginalDelivery[latestRetryableDelivery.id] ?? 0
    : 0
  const latestRetryEligible = latestRetryableDelivery
    ? latestRetryAttemptCount < deliveryRetryPolicy.maxRetries &&
      (latestRetryableDelivery.status === 'blocking' ||
        (latestRetryableDelivery.status === 'warning' && deliveryRetryPolicy.retryOnWarnings))
    : false
  const retryQueueRows = notificationDeliveryRetryRecords
    .map((record) => {
      const dueAt = retryControlDueAt(record.payload)
      const ageMinutes = Math.max(0, minutesBetween(record.payload.createdAt, retryQueueMeasuredAt) ?? 0)
      const dueTime = Date.parse(dueAt)
      const minutesUntilDue = Number.isFinite(dueTime)
        ? Math.ceil((dueTime - retryQueueMeasuredAt.getTime()) / 60_000)
        : null
      const active = record.payload.status === 'planned'
      const dueStatus: StatusLevel = !active
        ? 'pass'
        : minutesUntilDue === null
          ? 'warning'
          : minutesUntilDue < 0
            ? 'blocking'
            : minutesUntilDue <= 60
              ? 'warning'
              : 'pass'
      return {
        record,
        dueAt,
        ageMinutes,
        active,
        minutesUntilDue,
        status: dueStatus,
      }
    })
    .sort((first, second) => {
      const severity = { blocking: 0, warning: 1, pass: 2 } satisfies Record<StatusLevel, number>
      const severityDelta = severity[first.status] - severity[second.status]
      if (severityDelta !== 0) return severityDelta
      return (first.minutesUntilDue ?? Number.MAX_SAFE_INTEGER) - (second.minutesUntilDue ?? Number.MAX_SAFE_INTEGER)
    })
  const retryQueueMetrics = retryQueueRows.reduce(
    (summary, row) => {
      summary.total += 1
      if (row.active) summary.active += 1
      if (row.record.payload.status === 'executed') summary.executed += 1
      if (row.record.payload.status === 'blocked') summary.blocked += 1
      if (row.active && row.status === 'blocking') summary.overdue += 1
      if (row.active && row.status === 'warning') summary.dueSoon += 1
      summary.oldestAgeMinutes = Math.max(summary.oldestAgeMinutes, row.active ? row.ageMinutes : 0)
      return summary
    },
    {
      total: 0,
      active: 0,
      executed: 0,
      blocked: 0,
      overdue: 0,
      dueSoon: 0,
      oldestAgeMinutes: 0,
    },
  )
  const retryQueueStatus = retryQueueMetrics.overdue > 0
    ? 'blocking'
    : retryQueueMetrics.dueSoon > 0
      ? 'warning'
      : 'pass'
  const retryQueueActiveSources = new Set(notificationDeliveryRetryRecords.map((record) => record.payload.source))
  const retryQueuePackageDeliveryRecords = deliveryRecords.filter(
    (record) => record.payload.request.source === 'notification_retry_queue_export_package',
  )
  const notificationClosurePackageDeliveryRecords = deliveryRecords.filter(
    (record) => record.payload.request.source === 'notification_closure_export_package',
  )
  const closureSlaPackageDeliveryRecords = deliveryRecords.filter(
    (record) => record.payload.request.source === 'closure_sla_export_package',
  )
  const closureSlaAcknowledgedDeliveryIds = new Set(
    closureSlaDeliveryAcknowledgementRecords.map((record) => record.payload.deliveryRecordId),
  )
  const latestClosureSlaDeliveryAcknowledgement = closureSlaDeliveryAcknowledgementRecords[0]
  const latestClosureSlaResponseFollowUpRoute = closureSlaResponseFollowUpRouteRecords[0]
  const closureSlaFollowUpNotificationRecords = deliveryRecords.filter(
    (record) => record.payload.request.source === 'closure_sla_response_follow_up',
  )
  const latestClosureSlaPackageDelivery = closureSlaPackageDeliveryRecords[0]
  const openClosureSlaDeliveryCount = closureSlaPackageDeliveryRecords.filter(
    (record) => !closureSlaAcknowledgedDeliveryIds.has(record.id),
  ).length
  const postgresAcknowledgementDeliveryRecords = deliveryRecords.filter(
    (record) => record.payload.request.source === 'postgres_cutover_acknowledgement',
  )
  const postgresCutoverOwnerReminderDeliveryRecords = deliveryRecords.filter(
    (record) => record.payload.request.source === 'postgres_cutover_owner_reminder',
  )
  const postgresCutoverClosurePackageDeliveryRecords = deliveryRecords.filter(
    (record) => record.payload.request.source === 'postgres_cutover_closure_package',
  )
  const deliveryEvidenceCounts = deliveryRecords.reduce(
    (summary, record) => {
      record.payload.result.channelResults.forEach((result) => {
        summary[result.mode] = (summary[result.mode] ?? 0) + 1
      })
      return summary
    },
    {} as Record<NotificationDeliveryResult['channelResults'][number]['mode'], number>,
  )

  function toggleNotificationChannel(channel: NotificationLiveChannelApproval['approvedChannels'][number]) {
    setNotificationChannels((current) =>
      current.includes(channel)
        ? current.filter((item) => item !== channel)
        : [...current, channel],
    )
  }

  function renewalRouteRequest() {
    return {
      channels: notificationChannels,
      dueAt: renewalDueAt || notificationApprovalRenewalDueAt(latestNotificationApproval),
      rationale: renewalRationale,
      reminderAt: renewalReminderAt,
      reviewers: renewalReviewers
        .split(',')
        .map((reviewer) => reviewer.trim())
        .filter(Boolean),
      routeStage: renewalRouteStage,
    }
  }

  function postgresPackageReviewerList() {
    return postgresPackageReviewers
      .split(',')
      .map((reviewer) => reviewer.trim())
      .filter(Boolean)
  }
  function notificationClosureOwnerList() {
    return notificationClosureOwners
      .split(',')
      .map((owner) => owner.trim())
      .filter(Boolean)
  }
  function closureSlaGovernanceReviewerList() {
    return closureSlaGovernanceReviewers
      .split(',')
      .map((reviewer) => reviewer.trim())
      .filter(Boolean)
  }
  function closureSlaAckActionList() {
    return closureSlaAckActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closureSlaFollowUpOwnerList() {
    return closureSlaFollowUpOwners
      .split(',')
      .map((owner) => owner.trim())
      .filter(Boolean)
  }
  function closureSlaFollowUpActionList(record = latestClosureSlaDeliveryAcknowledgement) {
    const enteredActions = closureSlaAckActionList()
    if (enteredActions.length > 0) return enteredActions
    return record?.payload.requestedActions.length
      ? record.payload.requestedActions
      : ['Review Closure SLA governance response and disposition requested actions.']
  }
  function closureSlaDeliveryAcknowledgementRequest(
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>,
  ) {
    return {
      deliveryRecord,
      requestedActions: closureSlaAckActionList(),
      responseNotes: closureSlaAckNotes,
      reviewer: closureSlaAckReviewer,
      routeStage: closureSlaAckRouteStage,
      status: closureSlaAckStatus,
    }
  }
  function closureSlaResponseFollowUpRequest(
    acknowledgementRecord = latestClosureSlaDeliveryAcknowledgement,
    notify = false,
  ) {
    if (!acknowledgementRecord) return
    return {
      acknowledgementRecord,
      dueAt: closureSlaFollowUpDueAt,
      escalationPath: closureSlaFollowUpEscalationPath,
      followUpStage: closureSlaFollowUpStage,
      notify,
      requestedActions: closureSlaFollowUpActionList(acknowledgementRecord),
      routeNotes: closureSlaFollowUpNotes,
      routedOwners: closureSlaFollowUpOwnerList(),
      reviewer: closureSlaAckReviewer,
      status: closureSlaFollowUpStatus,
    }
  }
  function closureSlaExportRequiredActions() {
    const actions = [
      closureSlaRows.length > 0 ? null : 'Create closure SLA routes before retaining an empty governance package.',
      closureSlaMetrics.overdue > 0
        ? `Disposition ${closureSlaMetrics.overdue} overdue closure SLA route(s) before governance closure.`
        : null,
      closureSlaMetrics.dueSoon > 0
        ? `Review ${closureSlaMetrics.dueSoon} closure SLA route(s) due within three days.`
        : null,
      closureSlaMetrics.notificationOpen > 0
        ? `Confirm messaging-owner follow-up for ${closureSlaMetrics.notificationOpen} open notification renewal route(s).`
        : null,
      closureSlaMetrics.traceabilityOpen > 0
        ? `Confirm reviewer response closure ownership for ${closureSlaMetrics.traceabilityOpen} open traceability route(s).`
        : null,
    ]
    return actions.filter((action): action is string => Boolean(action))
  }
  function buildClosureSlaExportPackage(): ClosureSlaExportPackage {
    const generatedAt = new Date().toISOString()
    const reviewers = closureSlaGovernanceReviewerList()
    const requiredActions = closureSlaExportRequiredActions()
    const governanceReviewers = reviewers.length > 0 ? reviewers : ['Governance Reviewer']
    return {
      packageId: `closure_sla_export:${generatedAt}`,
      generatedAt,
      governanceReviewers,
      status: closureSlaOverallStatus,
      metrics: closureSlaMetrics,
      rows: closureSlaRows,
      requiredActions,
      reviewerNotes: closureSlaReviewerNotes.trim() || 'No governance reviewer notes recorded.',
      sourceRecordCounts: {
        notificationRenewals: notificationRenewalRecords.length,
        notificationRenewalClosures: notificationRenewalClosureRecords.length,
        traceabilityClosureRoutes: traceabilityClosureRouteRecords.length,
      },
      evidence: `Closure SLA export package generated for ${governanceReviewers.join(', ')} with ${closureSlaMetrics.open} open route(s), ${closureSlaMetrics.overdue} overdue route(s), and ${requiredActions.length} required action(s).`,
    }
  }
  function postgresAcknowledgementActionList() {
    return postgresAcknowledgementActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function postgresAcknowledgementRequest() {
    return {
      acknowledgementNotes: postgresAcknowledgementNotes,
      backupConfirmed: postgresBackupConfirmed,
      dueAt: postgresAcknowledgementDueAt,
      productionReadiness: postgresProductionReadiness,
      requiredActions: postgresAcknowledgementActionList(),
      reviewer: postgresAcknowledgementReviewer,
      reviewerRole: postgresAcknowledgementRole,
      rollbackConfirmed: postgresRollbackConfirmed,
      status: postgresAcknowledgementStatus,
    }
  }
  function postgresCutoverReminderOwnerList() {
    return postgresCutoverReminderOwners
      .split(',')
      .map((owner) => owner.trim())
      .filter(Boolean)
  }
  function postgresCutoverOwnerReminderRequest() {
    return {
      dueAt: postgresCutoverReminderDueAt,
      escalationPath: postgresCutoverEscalationPath,
      owners: postgresCutoverReminderOwnerList(),
      reminderAt: postgresCutoverReminderAt,
      renewalNotes: postgresCutoverReminderNotes,
      status: postgresCutoverReminderStatus,
    }
  }
  function postgresReminderSupersededEvidenceList() {
    return postgresReminderSupersededEvidence
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }
  function postgresReminderClosureRequest() {
    return {
      closureNotes: postgresReminderClosureNotes,
      reviewer: postgresReminderClosureReviewer,
      status: postgresReminderClosureStatus,
      supersededEvidence: postgresReminderSupersededEvidenceList(),
    }
  }
  function postgresClosurePackageReviewerList() {
    return postgresClosurePackageReviewers
      .split(',')
      .map((reviewer) => reviewer.trim())
      .filter(Boolean)
  }
  function retryQueueOperationsReviewerList() {
    return retryQueueOperationsReviewers
      .split(',')
      .map((reviewer) => reviewer.trim())
      .filter(Boolean)
  }
  function retryQueueRequiredActions() {
    const actions = [
      retryQueueRows.length > 0 ? null : 'No delivery retry controls are available for operations review.',
      retryQueueMetrics.overdue > 0
        ? `Execute or close ${retryQueueMetrics.overdue} overdue retry queue item(s).`
        : null,
      retryQueueMetrics.dueSoon > 0
        ? `Review ${retryQueueMetrics.dueSoon} retry queue item(s) due within one hour.`
        : null,
      retryQueueMetrics.active > 0
        ? `Disposition ${retryQueueMetrics.active} active retry queue item(s) before closing notification operations review.`
        : null,
      retryQueueMetrics.blocked > 0
        ? `Escalate ${retryQueueMetrics.blocked} blocked retry control(s) to notification channel owners.`
        : null,
    ]
    return actions.filter((action): action is string => Boolean(action))
  }
  function buildRetryQueueExportPackage(): NotificationRetryQueueExportPackage {
    const generatedAt = new Date().toISOString()
    const reviewers = retryQueueOperationsReviewerList()
    const operationsReviewers = reviewers.length > 0 ? reviewers : ['Notification Operations Owner']
    const requiredActions = retryQueueRequiredActions()
    const rows = retryQueueRows.map((row) => ({
      retryRecordId: row.record.id,
      retryId: row.record.payload.retryId,
      source: row.record.payload.source,
      subject: row.record.payload.subject,
      status: row.record.payload.status,
      queueStatus: row.status,
      active: row.active,
      attempt: row.record.payload.attempt,
      maxRetries: row.record.payload.maxRetries,
      retryDueAt: row.dueAt,
      ageMinutes: row.ageMinutes,
      minutesUntilDue: row.minutesUntilDue,
      recipients: row.record.payload.recipients,
      channels: row.record.payload.channels,
      evidence: row.record.payload.evidence,
    }))
    const deliveryEvidence = deliveryRecords.filter((record) =>
      retryQueueActiveSources.has(record.payload.request.source),
    )
    return {
      packageId: `notification_retry_queue_export:${generatedAt}`,
      generatedAt,
      operationsReviewers,
      status: retryQueueStatus,
      sourceFilter: 'all',
      metrics: retryQueueMetrics,
      rows,
      deliveryEvidence,
      requiredActions,
      reviewerNotes: retryQueueReviewerNotes.trim() || 'No notification operations reviewer notes recorded.',
      sourceRecordCounts: {
        retryControls: notificationDeliveryRetryRecords.length,
        deliveries: deliveryEvidence.length,
        activeSources: retryQueueActiveSources.size,
      },
      evidence: `Notification retry queue export package generated for ${operationsReviewers.join(', ')} with ${retryQueueMetrics.active} active retry item(s), ${retryQueueMetrics.overdue} overdue item(s), and ${requiredActions.length} required action(s).`,
    }
  }
  function notificationDeliveryRetryRequest(
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>,
    execute: boolean,
  ) {
    return {
      deliveryRecord,
      execute,
      maxRetries: deliveryRetryPolicy.maxRetries,
      rationale: deliveryRetryRationale,
      retryDelayMinutes: deliveryRetryPolicy.retryDelayMinutes,
      retryOnWarnings: deliveryRetryPolicy.retryOnWarnings,
    }
  }

  return (
    <>
      <section className="connector-toolbar panel">
        <div>
          <h2>Backend Persistence Boundary</h2>
          <p>
            Versioned records, health checks, adapter dry runs, and migration reconciliation run through the selected backend adapter.
          </p>
        </div>
        <div className="toolbar-actions">
          <button className="secondary-action" onClick={onRefresh} type="button">
            <Activity size={15} />
            Refresh
          </button>
          <button className="secondary-action" onClick={onRunNotificationSmokeFixtures} type="button">
            <Bell size={15} />
            Smoke Fixtures
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
            subtitle={`${backendRecords.length} versioned backend record(s) stored by ${backendHealth?.store?.mode ?? backendHealth?.mode ?? 'the active adapter'}.`}
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

      <section className="panel notification-approval-panel">
        <PanelHeader
          icon={Bell}
          title="Notification Live-Channel Sign-Off"
          subtitle="Reviewer approval required before tenant live email, Teams, or SharePoint folder delivery can execute."
        />
        <div className="notification-approval-grid">
          <div className="notification-approval-form">
            <div className="trace-review-grid">
              <label>
                <span>Reviewer</span>
                <input
                  value={notificationReviewer}
                  onChange={(event) => setNotificationReviewer(event.target.value)}
                />
              </label>
              <label>
                <span>Approval status</span>
                <select
                  value={notificationApprovalStatus}
                  onChange={(event) =>
                    setNotificationApprovalStatus(event.target.value as NotificationLiveChannelApprovalStatus)
                  }
                >
                  <option value="approved">Approved</option>
                  <option value="draft">Draft</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label className="trace-review-rationale">
                <span>Rationale</span>
                <textarea
                  value={notificationApprovalRationale}
                  onChange={(event) => setNotificationApprovalRationale(event.target.value)}
                />
              </label>
            </div>
            <div className="notification-channel-toggle">
              {(['email', 'teams', 'sharepoint_folder'] as const).map((channel) => (
                <label key={channel}>
                  <input
                    checked={notificationChannels.includes(channel)}
                    onChange={() => toggleNotificationChannel(channel)}
                    type="checkbox"
                  />
                  <span>{titleize(channel)}</span>
                </label>
              ))}
            </div>
            <div className="toolbar-actions notification-approval-actions">
              <button
                className="secondary-action"
                onClick={onRunNotificationSmokeFixtures}
                type="button"
              >
                <Bell size={15} />
                Run Dry-Run Evidence
              </button>
              <button
                className="primary-action"
                onClick={() =>
                  onSaveNotificationLiveApproval({
                    approvedChannels: notificationChannels,
                    rationale: notificationApprovalRationale,
                    reviewer: notificationReviewer,
                    status: notificationApprovalStatus,
                  })
                }
                type="button"
              >
                <ShieldCheck size={15} />
                Save Sign-Off
              </button>
            </div>
          </div>
          <div className="notification-approval-summary">
            <div className="metadata-grid">
              <Metadata label="Approvals" value={String(notificationApprovalRecords.length)} />
              <Metadata label="Dry-run channels" value={String(deliveryEvidenceCounts.dry_run ?? 0)} />
              <Metadata label="Live channels" value={String(deliveryEvidenceCounts.live ?? 0)} />
              <Metadata label="Skipped channels" value={String(deliveryEvidenceCounts.skipped ?? 0)} />
              <Metadata
                label="Latest status"
                value={latestNotificationApproval ? titleize(latestNotificationApproval.payload.status) : 'Not signed'}
              />
              <Metadata
                label="Expires"
                value={
                  latestNotificationApproval
                    ? new Date(latestNotificationApproval.payload.expiresAt).toLocaleDateString()
                    : 'No active approval'
                }
              />
              <Metadata label="Expiry status" value={notificationExpiry.status} />
              <Metadata
                label="Days left"
                value={notificationExpiry.daysUntilExpiry === null ? 'Unknown' : String(notificationExpiry.daysUntilExpiry)}
              />
            </div>
            {latestNotificationApproval ? (
              <div className="connector-run-history">
                <h4>Latest approval</h4>
                <div className="connector-run-row">
                  <div>
                    <strong>{latestNotificationApproval.payload.reviewer}</strong>
                    <span>
                      {latestNotificationApproval.payload.approvedChannels.map(titleize).join(', ')} / v{latestNotificationApproval.version}
                    </span>
                    <small>{latestNotificationApproval.payload.rationale}</small>
                  </div>
                  <StatusChip status={latestNotificationApproval.status} label={latestNotificationApproval.status} />
                </div>
              </div>
            ) : (
              <div className="empty-state compact">No tenant live-channel approval has been saved yet.</div>
            )}
          </div>
        </div>
        <div className="notification-approval-grid renewal-routing-grid">
          <div className="notification-approval-form">
            <div className="trace-review-grid">
              <label>
                <span>Renewal reviewers</span>
                <input value={renewalReviewers} onChange={(event) => setRenewalReviewers(event.target.value)} />
              </label>
              <label>
                <span>Route stage</span>
                <select
                  value={renewalRouteStage}
                  onChange={(event) =>
                    setRenewalRouteStage(event.target.value as NotificationApprovalRenewalRoute['routeStage'])
                  }
                >
                  <option value="renewal_review">Renewal review</option>
                  <option value="owner_follow_up">Owner follow-up</option>
                  <option value="security_review">Security review</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <label>
                <span>Reminder date</span>
                <input
                  value={renewalReminderAt}
                  onChange={(event) => setRenewalReminderAt(event.target.value)}
                  type="date"
                />
              </label>
              <label>
                <span>Due date</span>
                <input
                  value={renewalDueAt || notificationApprovalRenewalDueAt(latestNotificationApproval)}
                  onChange={(event) => setRenewalDueAt(event.target.value)}
                  type="date"
                />
              </label>
              <label className="trace-review-rationale">
                <span>Renewal rationale</span>
                <textarea value={renewalRationale} onChange={(event) => setRenewalRationale(event.target.value)} />
              </label>
            </div>
            <div className="toolbar-actions notification-approval-actions">
              <button
                className="secondary-action"
                onClick={() => onSaveNotificationApprovalRenewalRoute(renewalRouteRequest())}
                type="button"
              >
                <Route size={15} />
                Save Renewal Route
              </button>
              <button
                className="primary-action"
                onClick={() => onDeliverNotificationApprovalRenewalRoute(renewalRouteRequest())}
                type="button"
              >
                <Bell size={15} />
                Deliver Renewal Reminder
              </button>
            </div>
          </div>
          <div className="notification-approval-summary">
            <div className="metadata-grid">
              <Metadata label="Renewal routes" value={String(notificationRenewalRecords.length)} />
              <Metadata
                label="Latest route"
                value={latestNotificationRenewal ? titleize(latestNotificationRenewal.payload.routeStage) : 'Not routed'}
              />
              <Metadata
                label="Latest due"
                value={
                  latestNotificationRenewal?.payload.dueAt
                    ? new Date(latestNotificationRenewal.payload.dueAt).toLocaleDateString()
                    : 'No due date'
                }
              />
              <Metadata label="Reminder evidence" value={notificationExpiry.evidence} />
            </div>
            {latestNotificationRenewal ? (
              <div className="connector-run-history">
                <h4>Latest renewal route</h4>
                <div className="connector-run-row">
                  <div>
                    <strong>{latestNotificationRenewal.payload.routedReviewers.join(', ')}</strong>
                    <span>
                      v{latestNotificationRenewal.version} / {new Date(latestNotificationRenewal.createdAt).toLocaleString()}
                    </span>
                    <small>{latestNotificationRenewal.payload.evidence}</small>
                  </div>
                  <StatusChip status={latestNotificationRenewal.status} label={latestNotificationRenewal.status} />
                </div>
              </div>
            ) : (
              <div className="empty-state compact">No notification approval renewal route has been saved yet.</div>
            )}
          </div>
        </div>
        {notificationApprovalRecords.length > 1 ? (
          <div className="mapping-run-history">
            <h4>Approval history</h4>
            {notificationApprovalRecords.slice(1, 5).map((record) => (
              <div className="mapping-run-row" key={record.id}>
                <div>
                  <strong>{record.payload.reviewer}</strong>
                  <span>
                    v{record.version} / {new Date(record.createdAt).toLocaleString()} / {record.payload.approvedChannels.map(titleize).join(', ')}
                  </span>
                </div>
                <StatusChip status={record.status} label={record.status} />
              </div>
            ))}
          </div>
        ) : null}
        <div className="notification-approval-grid renewal-routing-grid">
          <div className="notification-approval-form">
            <div className="trace-review-grid">
              <label>
                <span>Closure reviewer</span>
                <input value={renewalClosureReviewer} onChange={(event) => setRenewalClosureReviewer(event.target.value)} />
              </label>
              <label>
                <span>Closure status</span>
                <select
                  value={renewalClosureStatus}
                  onChange={(event) =>
                    setRenewalClosureStatus(event.target.value as NotificationApprovalRenewalClosureStatus)
                  }
                >
                  <option value="closed">Closed</option>
                  <option value="closed_with_conditions">Closed with conditions</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label className="trace-review-rationale">
                <span>Closure notes</span>
                <textarea value={renewalClosureNotes} onChange={(event) => setRenewalClosureNotes(event.target.value)} />
              </label>
            </div>
            <div className="toolbar-actions notification-approval-actions">
              <button
                className="primary-action"
                onClick={() =>
                  onSaveNotificationApprovalRenewalClosure({
                    closureNotes: renewalClosureNotes,
                    reviewer: renewalClosureReviewer,
                    status: renewalClosureStatus,
                  })
                }
                type="button"
              >
                <ShieldCheck size={15} />
                Close Renewal
              </button>
            </div>
          </div>
          <div className="notification-approval-summary">
            <div className="metadata-grid">
              <Metadata label="Closures" value={String(notificationRenewalClosureRecords.length)} />
              <Metadata
                label="Superseded approval"
                value={supersededNotificationApproval ? new Date(supersededNotificationApproval.payload.expiresAt).toLocaleDateString() : 'Not available'}
              />
              <Metadata
                label="Renewed approval"
                value={latestNotificationApproval ? new Date(latestNotificationApproval.payload.expiresAt).toLocaleDateString() : 'Not signed'}
              />
              <Metadata
                label="Latest closure"
                value={
                  latestNotificationRenewalClosure
                    ? notificationRenewalClosureLabel(latestNotificationRenewalClosure.payload.status)
                    : 'Not closed'
                }
              />
            </div>
            {latestNotificationRenewalClosure ? (
              <div className="connector-run-history">
                <h4>Latest renewal closure</h4>
                <div className="connector-run-row">
                  <div>
                    <strong>{latestNotificationRenewalClosure.payload.reviewer}</strong>
                    <span>
                      v{latestNotificationRenewalClosure.version} / {new Date(latestNotificationRenewalClosure.createdAt).toLocaleString()}
                    </span>
                    <small>{latestNotificationRenewalClosure.payload.evidence}</small>
                  </div>
                  <StatusChip status={latestNotificationRenewalClosure.status} label={latestNotificationRenewalClosure.status} />
                </div>
              </div>
            ) : (
            <div className="empty-state compact">No renewal closure has been retained yet.</div>
          )}
        </div>
      </div>
      <div className="notification-approval-grid renewal-routing-grid">
        <div className="notification-approval-form">
          <div className="trace-review-grid">
            <label className="trace-review-rationale">
              <span>Messaging owners</span>
              <textarea
                value={notificationClosureOwners}
                onChange={(event) => setNotificationClosureOwners(event.target.value)}
              />
            </label>
            <label className="trace-review-rationale">
              <span>Owner handoff notes</span>
              <textarea
                value={notificationClosureExportNotes}
                onChange={(event) => setNotificationClosureExportNotes(event.target.value)}
              />
            </label>
          </div>
          <div className="toolbar-actions notification-approval-actions">
            <button
              className="secondary-action"
              onClick={() =>
                onSaveNotificationClosureExportPackage({
                  download: false,
                  messagingOwners: notificationClosureOwnerList(),
                  ownerNotes: notificationClosureExportNotes,
                })
              }
              type="button"
            >
              <ClipboardCheck size={15} />
              Save Closure Package
            </button>
            <button
              className="primary-action"
              onClick={() =>
                onSaveNotificationClosureExportPackage({
                  download: true,
                  messagingOwners: notificationClosureOwnerList(),
                  ownerNotes: notificationClosureExportNotes,
                })
              }
              type="button"
            >
              <Download size={15} />
              Save & Download Package
            </button>
            <button
              className="primary-action"
              onClick={() =>
                onDeliverNotificationClosureExportPackage({
                  download: false,
                  messagingOwners: notificationClosureOwnerList(),
                  ownerNotes: notificationClosureExportNotes,
                })
              }
              type="button"
            >
              <Bell size={15} />
              Save & Notify Owners
            </button>
          </div>
        </div>
        <div className="notification-approval-summary">
          <div className="metadata-grid">
            <Metadata label="Closure packages" value={String(notificationClosureExportPackageRecords.length)} />
            <Metadata label="Package deliveries" value={String(notificationClosurePackageDeliveryRecords.length)} />
            <Metadata label="Messaging owners" value={String(notificationClosureOwnerList().length)} />
            <Metadata
              label="Latest package"
              value={latestNotificationClosureExportPackage ? new Date(latestNotificationClosureExportPackage.createdAt).toLocaleString() : 'Not packaged'}
            />
            <Metadata
              label="Package status"
              value={latestNotificationClosureExportPackage?.status ?? 'not saved'}
            />
          </div>
          {latestNotificationClosureExportPackage ? (
            <div className="connector-run-history">
              <h4>Latest closure export package</h4>
              <div className="connector-run-row">
                <div>
                  <strong>{latestNotificationClosureExportPackage.payload.messagingOwners.join(', ')}</strong>
                  <span>
                    v{latestNotificationClosureExportPackage.version} / {new Date(latestNotificationClosureExportPackage.createdAt).toLocaleString()}
                  </span>
                  <small>{latestNotificationClosureExportPackage.payload.evidence}</small>
                </div>
                <StatusChip
                  status={latestNotificationClosureExportPackage.status}
                  label={latestNotificationClosureExportPackage.status}
                />
              </div>
            </div>
          ) : (
            <div className="empty-state compact">No notification closure export package has been retained yet.</div>
          )}
          {notificationClosurePackageDeliveryRecords.length > 0 ? (
            <div className="connector-run-history">
              <h4>Closure package delivery evidence</h4>
              {notificationClosurePackageDeliveryRecords.slice(0, 3).map((record) => (
                <div className="connector-run-row" key={record.id}>
                  <div>
                    <strong>{record.payload.request.subject}</strong>
                    <span>
                      v{record.version} / {new Date(record.createdAt).toLocaleString()} / {record.payload.request.recipients.join(', ')}
                    </span>
                    <small>{record.payload.result.evidence}</small>
                  </div>
                  <StatusChip status={record.status} label={record.status} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {notificationClosureExportPackageRecords.length > 1 ? (
        <div className="mapping-run-history">
          <h4>Closure package history</h4>
          {notificationClosureExportPackageRecords.slice(1, 5).map((record) => (
            <div className="mapping-run-row" key={record.id}>
              <div>
                <strong>{record.payload.packageId}</strong>
                <span>
                  v{record.version} / {new Date(record.createdAt).toLocaleString()} / {record.payload.messagingOwners.join(', ')}
                </span>
              </div>
              <StatusChip status={record.status} label={record.status} />
            </div>
          ))}
        </div>
      ) : null}
      </section>

      <section className="panel notification-approval-panel">
        <PanelHeader
          icon={Gauge}
          title="Closure SLA Dashboard"
          subtitle="SLA rollup for traceability response closures and notification follow-up routes."
        />
        <div className="approval-form-grid">
          <label>
            Governance reviewers
            <input
              value={closureSlaGovernanceReviewers}
              onChange={(event) => setClosureSlaGovernanceReviewers(event.target.value)}
            />
          </label>
          <label>
            Reviewer notes
            <textarea
              value={closureSlaReviewerNotes}
              onChange={(event) => setClosureSlaReviewerNotes(event.target.value)}
            />
          </label>
        </div>
        <div className="toolbar-actions inline-actions">
          <button
            className="secondary-action"
            onClick={() =>
              onSaveClosureSlaExportPackage({
                download: false,
                packagePayload: buildClosureSlaExportPackage(),
              })
            }
            type="button"
          >
            <ShieldCheck size={15} />
            Save SLA Package
          </button>
          <button
            className="primary-action"
            onClick={() =>
              onSaveClosureSlaExportPackage({
                download: true,
                packagePayload: buildClosureSlaExportPackage(),
              })
            }
            type="button"
          >
            <Download size={15} />
            Save & Download SLA Package
          </button>
          <button
            className="primary-action"
            onClick={() =>
              onDeliverClosureSlaExportPackage({
                download: false,
                packagePayload: buildClosureSlaExportPackage(),
              })
            }
            type="button"
          >
            <Bell size={15} />
            Save & Notify Governance
          </button>
        </div>
        <div className="notification-approval-summary">
          <div className="metadata-grid">
            <Metadata label="Overall SLA" value={closureSlaOverallStatus} />
            <Metadata label="Total routes" value={String(closureSlaMetrics.total)} />
            <Metadata label="Open" value={String(closureSlaMetrics.open)} />
            <Metadata label="Closed" value={String(closureSlaMetrics.closed)} />
            <Metadata label="Overdue" value={String(closureSlaMetrics.overdue)} />
            <Metadata label="Due soon" value={String(closureSlaMetrics.dueSoon)} />
            <Metadata label="Notification open" value={String(closureSlaMetrics.notificationOpen)} />
            <Metadata label="Traceability open" value={String(closureSlaMetrics.traceabilityOpen)} />
            <Metadata label="SLA packages" value={String(closureSlaExportPackageRecords.length)} />
            <Metadata label="SLA deliveries" value={String(closureSlaPackageDeliveryRecords.length)} />
            <Metadata
              label="Latest package"
              value={latestClosureSlaExportPackage ? new Date(latestClosureSlaExportPackage.createdAt).toLocaleString() : 'Not packaged'}
            />
          </div>
        </div>
        {latestClosureSlaExportPackage ? (
          <div className="connector-run-history">
            <h4>Latest SLA governance package</h4>
            <div className="connector-run-row">
              <div>
                <strong>{latestClosureSlaExportPackage.payload.governanceReviewers.join(', ')}</strong>
                <span>
                  v{latestClosureSlaExportPackage.version} / {new Date(latestClosureSlaExportPackage.createdAt).toLocaleString()}
                </span>
                <small>{latestClosureSlaExportPackage.payload.evidence}</small>
              </div>
              <StatusChip status={latestClosureSlaExportPackage.status} label={latestClosureSlaExportPackage.status} />
            </div>
            {latestClosureSlaExportPackage.payload.requiredActions.length > 0 ? (
              <div className="storage-column-list">
                {latestClosureSlaExportPackage.payload.requiredActions.map((action) => (
                  <span key={action}>{action}</span>
                ))}
              </div>
            ) : null}
            {closureSlaPackageDeliveryRecords.length > 0 ? (
              <div className="connector-run-history">
                <h4>SLA package delivery evidence</h4>
                {closureSlaPackageDeliveryRecords.slice(0, 3).map((record) => (
                  <div className="connector-run-row" key={record.id}>
                    <div>
                      <strong>{record.payload.request.subject}</strong>
                      <span>
                        v{record.version} / {new Date(record.createdAt).toLocaleString()} / {record.payload.request.recipients.join(', ')}
                      </span>
                      <small>{record.payload.result.evidence}</small>
                    </div>
                    <StatusChip status={record.status} label={record.status} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="notification-approval-grid renewal-routing-grid">
          <div className="notification-approval-form">
            <div className="trace-review-grid">
              <label>
                <span>Governance response reviewer</span>
                <input value={closureSlaAckReviewer} onChange={(event) => setClosureSlaAckReviewer(event.target.value)} />
              </label>
              <label>
                <span>Response status</span>
                <select
                  value={closureSlaAckStatus}
                  onChange={(event) =>
                    setClosureSlaAckStatus(event.target.value as ClosureSlaDeliveryAcknowledgementStatus)
                  }
                >
                  <option value="acknowledged">Acknowledged</option>
                  <option value="approved">Approved</option>
                  <option value="changes_requested">Changes requested</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label>
                <span>Route stage</span>
                <select
                  value={closureSlaAckRouteStage}
                  onChange={(event) =>
                    setClosureSlaAckRouteStage(event.target.value as ClosureSlaDeliveryAcknowledgement['routeStage'])
                  }
                >
                  <option value="governance_acknowledgement">Governance acknowledgement</option>
                  <option value="owner_follow_up">Owner follow-up</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <label className="trace-review-rationale">
                <span>Response notes</span>
                <textarea value={closureSlaAckNotes} onChange={(event) => setClosureSlaAckNotes(event.target.value)} />
              </label>
              <label className="trace-review-rationale">
                <span>Requested actions</span>
                <textarea value={closureSlaAckActions} onChange={(event) => setClosureSlaAckActions(event.target.value)} />
              </label>
            </div>
            <div className="toolbar-actions notification-approval-actions">
              <button
                className="primary-action"
                disabled={!latestClosureSlaPackageDelivery}
                onClick={() =>
                  latestClosureSlaPackageDelivery
                    ? onSaveClosureSlaDeliveryAcknowledgement(
                        closureSlaDeliveryAcknowledgementRequest(latestClosureSlaPackageDelivery),
                      )
                    : undefined
                }
                type="button"
              >
                <ClipboardCheck size={15} />
                Save Governance Response
              </button>
            </div>
          </div>
          <div className="notification-approval-summary">
            <div className="metadata-grid">
              <Metadata label="Delivery responses" value={String(closureSlaDeliveryAcknowledgementRecords.length)} />
              <Metadata label="Open deliveries" value={String(openClosureSlaDeliveryCount)} />
              <Metadata
                label="Latest response"
                value={
                  latestClosureSlaDeliveryAcknowledgement
                    ? closureSlaDeliveryAcknowledgementLabel(latestClosureSlaDeliveryAcknowledgement.payload.status)
                    : 'Not recorded'
                }
              />
              <Metadata
                label="Latest package"
                value={
                  latestClosureSlaDeliveryAcknowledgement?.payload.packageVersion
                    ? `v${latestClosureSlaDeliveryAcknowledgement.payload.packageVersion}`
                    : 'Not linked'
                }
              />
            </div>
            {latestClosureSlaDeliveryAcknowledgement ? (
              <div className="connector-run-history">
                <h4>Latest governance response</h4>
                <div className="connector-run-row">
                  <div>
                    <strong>{latestClosureSlaDeliveryAcknowledgement.payload.reviewer}</strong>
                    <span>
                      v{latestClosureSlaDeliveryAcknowledgement.version} / {titleize(latestClosureSlaDeliveryAcknowledgement.payload.routeStage)} / {new Date(latestClosureSlaDeliveryAcknowledgement.createdAt).toLocaleString()}
                    </span>
                    <small>{latestClosureSlaDeliveryAcknowledgement.payload.evidence}</small>
                  </div>
                  <StatusChip
                    status={latestClosureSlaDeliveryAcknowledgement.status}
                    label={closureSlaDeliveryAcknowledgementLabel(latestClosureSlaDeliveryAcknowledgement.payload.status)}
                  />
                </div>
                {latestClosureSlaDeliveryAcknowledgement.payload.requestedActions.length > 0 ? (
                  <div className="storage-column-list">
                    {latestClosureSlaDeliveryAcknowledgement.payload.requestedActions.map((action) => (
                      <span key={action}>{action}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="empty-state compact">No Closure SLA governance response has been retained yet.</div>
            )}
          </div>
        </div>
        {closureSlaPackageDeliveryRecords.length > 0 ? (
          <div className="mapping-run-history">
            <h4>Closure SLA delivery response queue</h4>
            {closureSlaPackageDeliveryRecords.slice(0, 5).map((record) => {
              const responseRecorded = closureSlaAcknowledgedDeliveryIds.has(record.id)
              return (
                <div className="mapping-run-row" key={record.id}>
                  <div>
                    <strong>{record.payload.request.subject}</strong>
                    <span>
                      v{record.version} / {new Date(record.createdAt).toLocaleString()} / {record.payload.request.recipients.join(', ')}
                    </span>
                    <small>{record.payload.result.evidence}</small>
                  </div>
                  <div className="row-actions">
                    <button
                      className="secondary-action compact"
                      onClick={() =>
                        onSaveClosureSlaDeliveryAcknowledgement(
                          closureSlaDeliveryAcknowledgementRequest(record),
                        )
                      }
                      type="button"
                    >
                      Record Response
                    </button>
                    <StatusChip status={responseRecorded ? 'pass' : record.status} label={responseRecorded ? 'responded' : record.status} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}
        <div className="notification-approval-grid renewal-routing-grid">
          <div className="notification-approval-form">
            <div className="dashboard-heading">
              <h4>Governance Response Follow-Up Routing</h4>
              <StatusChip status={closureSlaFollowUpStatusLevel(closureSlaFollowUpStatus)} label={closureSlaFollowUpLabel(closureSlaFollowUpStatus)} />
            </div>
            <div className="trace-review-grid">
              <label>
                <span>Follow-up owners</span>
                <input value={closureSlaFollowUpOwners} onChange={(event) => setClosureSlaFollowUpOwners(event.target.value)} />
              </label>
              <label>
                <span>Follow-up status</span>
                <select
                  value={closureSlaFollowUpStatus}
                  onChange={(event) =>
                    setClosureSlaFollowUpStatus(event.target.value as ClosureSlaResponseFollowUpStatus)
                  }
                >
                  <option value="routed">Routed</option>
                  <option value="in_progress">In progress</option>
                  <option value="escalated">Escalated</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <label>
                <span>Follow-up stage</span>
                <select
                  value={closureSlaFollowUpStage}
                  onChange={(event) =>
                    setClosureSlaFollowUpStage(event.target.value as ClosureSlaResponseFollowUpRoute['followUpStage'])
                  }
                >
                  <option value="governance_review">Governance review</option>
                  <option value="owner_follow_up">Owner follow-up</option>
                  <option value="escalation">Escalation</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <label>
                <span>Due date</span>
                <input
                  type="date"
                  value={closureSlaFollowUpDueAt}
                  onChange={(event) => setClosureSlaFollowUpDueAt(event.target.value)}
                />
              </label>
              <label className="trace-review-rationale">
                <span>Escalation path</span>
                <textarea
                  value={closureSlaFollowUpEscalationPath}
                  onChange={(event) => setClosureSlaFollowUpEscalationPath(event.target.value)}
                />
              </label>
              <label className="trace-review-rationale">
                <span>Route notes</span>
                <textarea value={closureSlaFollowUpNotes} onChange={(event) => setClosureSlaFollowUpNotes(event.target.value)} />
              </label>
            </div>
            <div className="toolbar-actions notification-approval-actions">
              <button
                className="secondary-action"
                disabled={!latestClosureSlaDeliveryAcknowledgement}
                onClick={() => {
                  const request = closureSlaResponseFollowUpRequest(latestClosureSlaDeliveryAcknowledgement, false)
                  if (request) onSaveClosureSlaResponseFollowUpRoute(request)
                }}
                type="button"
              >
                <ClipboardCheck size={15} />
                Save Follow-Up Route
              </button>
              <button
                className="primary-action"
                disabled={!latestClosureSlaDeliveryAcknowledgement}
                onClick={() => {
                  const request = closureSlaResponseFollowUpRequest(latestClosureSlaDeliveryAcknowledgement, true)
                  if (request) onSaveClosureSlaResponseFollowUpRoute(request)
                }}
                type="button"
              >
                <Bell size={15} />
                Save & Notify Owners
              </button>
            </div>
          </div>
          <div className="notification-approval-summary">
            <div className="metadata-grid">
              <Metadata label="Follow-up routes" value={String(closureSlaResponseFollowUpRouteRecords.length)} />
              <Metadata label="Open routes" value={String(closureSlaResponseFollowUpRouteRecords.filter((record) => record.payload.status !== 'closed').length)} />
              <Metadata label="Owner count" value={String(closureSlaFollowUpOwnerList().length)} />
              <Metadata label="Notifications" value={String(closureSlaFollowUpNotificationRecords.length)} />
            </div>
            {latestClosureSlaResponseFollowUpRoute ? (
              <div className="connector-run-history">
                <h4>Latest follow-up route</h4>
                <div className="connector-run-row">
                  <div>
                    <strong>{latestClosureSlaResponseFollowUpRoute.payload.deliverySubject}</strong>
                    <span>
                      v{latestClosureSlaResponseFollowUpRoute.version} / {titleize(latestClosureSlaResponseFollowUpRoute.payload.followUpStage)} / due {latestClosureSlaResponseFollowUpRoute.payload.dueAt || 'not scheduled'}
                    </span>
                    <small>{latestClosureSlaResponseFollowUpRoute.payload.evidence}</small>
                  </div>
                  <StatusChip
                    status={latestClosureSlaResponseFollowUpRoute.status}
                    label={closureSlaFollowUpLabel(latestClosureSlaResponseFollowUpRoute.payload.status)}
                  />
                </div>
                {latestClosureSlaResponseFollowUpRoute.payload.requestedActions.length > 0 ? (
                  <div className="storage-column-list">
                    {latestClosureSlaResponseFollowUpRoute.payload.requestedActions.map((action) => (
                      <span key={action}>{action}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="empty-state compact">No Closure SLA response follow-up route has been retained yet.</div>
            )}
          </div>
        </div>
        {closureSlaDeliveryAcknowledgementRecords.length > 1 ? (
          <div className="mapping-run-history">
            <h4>Governance response history</h4>
            {closureSlaDeliveryAcknowledgementRecords.slice(1, 5).map((record) => (
              <div className="mapping-run-row" key={record.id}>
                <div>
                  <strong>{record.payload.reviewer}</strong>
                  <span>
                    v{record.version} / {closureSlaDeliveryAcknowledgementLabel(record.payload.status)} / {titleize(record.payload.routeStage)}
                  </span>
                  <small>{record.payload.responseNotes}</small>
                </div>
                <StatusChip status={record.status} label={closureSlaDeliveryAcknowledgementLabel(record.payload.status)} />
              </div>
            ))}
          </div>
        ) : null}
        {closureSlaRows.length > 0 ? (
          <div className="mapping-run-history">
            <h4>Closure SLA queue</h4>
            {closureSlaRows.slice(0, 8).map((row) => (
              <div className="mapping-run-row" key={row.id}>
                <div>
                  <strong>{row.subject}</strong>
                  <span>
                    {row.source} / {row.stage} / {row.owner}
                  </span>
                  <small>
                    Due {row.dueAt || 'not scheduled'} / {row.daysRemaining === null
                      ? 'no due date'
                      : row.daysRemaining < 0
                        ? `${Math.abs(row.daysRemaining)} day(s) overdue`
                        : `${row.daysRemaining} day(s) remaining`} / {row.evidence}
                  </small>
                </div>
                <StatusChip status={row.status} label={row.closed ? 'closed' : row.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state compact">No closure SLA routes are available yet.</div>
        )}
        {closureSlaExportPackageRecords.length > 1 ? (
          <div className="mapping-run-history">
            <h4>SLA package history</h4>
            {closureSlaExportPackageRecords.slice(1, 5).map((record) => (
              <div className="mapping-run-row" key={record.id}>
                <div>
                  <strong>{record.payload.packageId}</strong>
                  <span>
                    v{record.version} / {new Date(record.createdAt).toLocaleString()} / {record.payload.governanceReviewers.join(', ')}
                  </span>
                  <small>{record.payload.evidence}</small>
                </div>
                <StatusChip status={record.status} label={record.status} />
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="panel import-reconciliation-panel">
        <PanelHeader
          icon={Database}
          title="Postgres Import Reconciliation"
          subtitle="Review guarded JSON or SQLite import runs before retiring legacy storage."
        />
        {latestReconciliation ? (
          <>
            <div className="import-reconciliation-grid">
              <article className="import-reconciliation-card primary">
                <div>
                  <strong>{titleize(latestReconciliation.payload.mode)}</strong>
                  <span>{latestReconciliation.payload.sourceFile}</span>
                </div>
                <StatusChip status={latestReconciliation.status} label={latestReconciliation.status} />
                <p>{latestReconciliation.payload.evidence}</p>
              </article>
              <article className="import-reconciliation-card">
                <strong>{latestReconciliation.payload.read}</strong>
                <span>Records read</span>
              </article>
              <article className="import-reconciliation-card">
                <strong>{latestReconciliation.payload.importable}</strong>
                <span>Importable</span>
              </article>
              <article className="import-reconciliation-card">
                <strong>{latestReconciliation.payload.imported}</strong>
                <span>Imported</span>
              </article>
              <article className="import-reconciliation-card">
                <strong>{latestReconciliation.payload.skipped}</strong>
                <span>Skipped</span>
              </article>
              <article className="import-reconciliation-card">
                <strong>{latestReconciliation.payload.invalid}</strong>
                <span>Invalid</span>
              </article>
            </div>
            <div className="import-reconciliation-detail">
              <div>
                <h4>Latest record mix</h4>
                <div className="storage-column-list">
                  {latestTopKinds.map(([kind, count]) => (
                    <span key={kind}>
                      {titleize(kind)} <em>{count}</em>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4>Aggregate run totals</h4>
                <div className="metadata-grid">
                  <Metadata label="Runs" value={String(reconciliationRecords.length)} />
                  <Metadata label="Read" value={String(reconciliationTotals.read)} />
                  <Metadata label="Importable" value={String(reconciliationTotals.importable)} />
                  <Metadata label="Imported" value={String(reconciliationTotals.imported)} />
                  <Metadata label="Skipped" value={String(reconciliationTotals.skipped)} />
                  <Metadata label="Invalid" value={String(reconciliationTotals.invalid)} />
                </div>
              </div>
            </div>
            {latestReconciliation.payload.invalidRecords.length > 0 ? (
              <div className="import-reconciliation-errors">
                <h4>Invalid record samples</h4>
                {latestReconciliation.payload.invalidRecords.map((entry) => (
                  <div className="backend-record-row" key={`${entry.id}:${entry.label}`}>
                    <div>
                      <strong>{entry.label || entry.id || 'Unnamed record'}</strong>
                      <span>{entry.missing.join(', ')}</span>
                    </div>
                    <StatusChip status="blocking" label="Invalid" />
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="empty-state compact">Run `npm run records:import:postgres` to persist reconciliation evidence.</div>
        )}
      </section>

      <section className="panel import-reconciliation-panel">
        <PanelHeader
          icon={History}
          title="Import Reconciliation History"
          subtitle="Recent dry-run and applied migration summaries retained in Postgres."
        />
        {reconciliationRecords.length > 0 ? (
          <div className="backend-record-list">
            {reconciliationRecords.slice(0, 8).map((record) => (
              <div className="backend-record-row" key={record.id}>
                <div>
                  <strong>{titleize(record.payload.source)} import / {titleize(record.payload.mode)}</strong>
                  <span>
                    v{record.version} / {new Date(record.createdAt).toLocaleString()} / read {record.payload.read}, importable {record.payload.importable}, skipped {record.payload.skipped}
                  </span>
                </div>
                <StatusChip status={record.status} label={record.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state compact">No import reconciliation runs have been retained yet.</div>
        )}
      </section>

      <section className="panel notification-approval-panel">
        <PanelHeader
          icon={ShieldCheck}
          title="Postgres Cutover Approval Gates"
          subtitle="Reviewer sign-off before JSON or SQLite storage is retired for production Postgres persistence."
        />
        <div className="notification-approval-grid">
          <div className="notification-approval-form">
            <div className="trace-review-grid">
              <label>
                <span>Reviewer</span>
                <input value={postgresReviewer} onChange={(event) => setPostgresReviewer(event.target.value)} />
              </label>
              <label>
                <span>Approval status</span>
                <select
                  value={postgresApprovalStatus}
                  onChange={(event) =>
                    setPostgresApprovalStatus(event.target.value as PostgresCutoverApprovalStatus)
                  }
                >
                  <option value="approved_with_conditions">Approved with conditions</option>
                  <option value="approved">Approved</option>
                  <option value="draft">Draft</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label>
                <span>Planned cutover</span>
                <input
                  value={postgresCutoverAt}
                  onChange={(event) => setPostgresCutoverAt(event.target.value)}
                  placeholder="2026-06-15 18:00 ET"
                />
              </label>
              <label>
                <span>Rollback window</span>
                <input
                  value={postgresRollbackWindow}
                  onChange={(event) => setPostgresRollbackWindow(event.target.value)}
                />
              </label>
              <label className="trace-review-rationale">
                <span>Rationale</span>
                <textarea
                  value={postgresCutoverRationale}
                  onChange={(event) => setPostgresCutoverRationale(event.target.value)}
                />
              </label>
              <label className="trace-review-rationale">
                <span>Conditions</span>
                <textarea
                  value={postgresCutoverConditions}
                  onChange={(event) => setPostgresCutoverConditions(event.target.value)}
                />
              </label>
            </div>
            <div className="toolbar-actions notification-approval-actions">
              <button
                className="primary-action"
                onClick={() =>
                  onSavePostgresCutoverApproval({
                    conditions: postgresCutoverConditions,
                    plannedCutoverAt: postgresCutoverAt,
                    rationale: postgresCutoverRationale,
                    reviewer: postgresReviewer,
                    rollbackWindow: postgresRollbackWindow,
                    status: postgresApprovalStatus,
                  })
                }
                type="button"
              >
                <ShieldCheck size={15} />
                Save Cutover Approval
              </button>
            </div>
          </div>
          <div className="notification-approval-summary">
            <div className="metadata-grid">
              <Metadata label="Gate status" value={postgresCutoverGateReview.status} />
              <Metadata label="Record status" value={postgresCutoverStatus} />
              <Metadata label="Approvals" value={String(postgresCutoverApprovalRecords.length)} />
              <Metadata label="Store" value={backendHealth?.store?.mode ?? 'unknown'} />
              <Metadata label="Latest import" value={latestReconciliation ? titleize(latestReconciliation.payload.mode) : 'Not run'} />
              <Metadata label="Latest approval" value={latestPostgresCutoverApproval ? postgresCutoverApprovalLabel(latestPostgresCutoverApproval.payload.status) : 'Not signed'} />
            </div>
            <div className="connector-run-history">
              <h4>Gate evidence</h4>
              {postgresCutoverGateReview.gates.map((gate) => (
                <div className="connector-run-row" key={gate.id}>
                  <div>
                    <strong>{gate.label}</strong>
                    <small>{gate.evidence}</small>
                  </div>
                  <StatusChip status={gate.status} label={gate.status} />
                </div>
              ))}
            </div>
            {latestPostgresCutoverApproval ? (
              <div className="connector-run-history">
                <h4>Latest cutover approval</h4>
                <div className="connector-run-row">
                  <div>
                    <strong>{latestPostgresCutoverApproval.payload.reviewer}</strong>
                    <span>
                      v{latestPostgresCutoverApproval.version} / {new Date(latestPostgresCutoverApproval.createdAt).toLocaleString()}
                    </span>
                    <small>{latestPostgresCutoverApproval.payload.evidence}</small>
                  </div>
                  <StatusChip status={latestPostgresCutoverApproval.status} label={latestPostgresCutoverApproval.status} />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="panel notification-approval-panel">
        <PanelHeader
          icon={Download}
          title="Production Cutover Checklist Package"
          subtitle="Package Postgres health, schema, migration, reconciliation, approval, and rollback evidence for infrastructure reviewers."
        />
        <div className="notification-approval-grid">
          <div className="notification-approval-form">
            <div className="trace-review-grid">
              <label className="trace-review-rationale">
                <span>Reviewer audience</span>
                <textarea
                  value={postgresPackageReviewers}
                  onChange={(event) => setPostgresPackageReviewers(event.target.value)}
                />
              </label>
            </div>
            <div className="toolbar-actions notification-approval-actions">
              <button
                className="secondary-action"
                onClick={() =>
                  onSavePostgresCutoverChecklistPackage({
                    download: false,
                    reviewerAudience: postgresPackageReviewerList(),
                  })
                }
                type="button"
              >
                <ClipboardCheck size={15} />
                Save Package
              </button>
              <button
                className="primary-action"
                onClick={() =>
                  onSavePostgresCutoverChecklistPackage({
                    download: true,
                    reviewerAudience: postgresPackageReviewerList(),
                  })
                }
                type="button"
              >
                <Download size={15} />
                Save & Download
              </button>
            </div>
          </div>
          <div className="notification-approval-summary">
            <div className="metadata-grid">
              <Metadata label="Packages" value={String(postgresCutoverPackageRecords.length)} />
              <Metadata label="Reviewer audience" value={String(postgresPackageReviewerList().length)} />
              <Metadata label="Gate status" value={postgresCutoverGateReview.status} />
              <Metadata label="Latest approval" value={latestPostgresCutoverApproval ? postgresCutoverApprovalLabel(latestPostgresCutoverApproval.payload.status) : 'Not signed'} />
              <Metadata label="Latest package" value={latestPostgresCutoverPackage ? new Date(latestPostgresCutoverPackage.createdAt).toLocaleString() : 'Not generated'} />
              <Metadata label="Required actions" value={String(postgresCutoverGateReview.gates.filter((gate) => gate.status !== 'pass').length)} />
            </div>
            {latestPostgresCutoverPackage ? (
              <div className="connector-run-history">
                <h4>Latest package</h4>
                <div className="connector-run-row">
                  <div>
                    <strong>{latestPostgresCutoverPackage.label}</strong>
                    <span>
                      v{latestPostgresCutoverPackage.version} / {new Date(latestPostgresCutoverPackage.createdAt).toLocaleString()}
                    </span>
                    <small>{latestPostgresCutoverPackage.payload.evidence}</small>
                  </div>
                  <StatusChip status={latestPostgresCutoverPackage.status} label={latestPostgresCutoverPackage.status} />
                </div>
              </div>
            ) : (
              <div className="empty-state compact">No infrastructure checklist package has been generated yet.</div>
            )}
          </div>
        </div>
        {postgresCutoverPackageRecords.length > 1 ? (
          <div className="mapping-run-history">
            <h4>Package history</h4>
            {postgresCutoverPackageRecords.slice(1, 5).map((record) => (
              <div className="mapping-run-row" key={record.id}>
                <div>
                  <strong>{record.payload.packageId}</strong>
                  <span>
                    v{record.version} / {new Date(record.createdAt).toLocaleString()} / {record.payload.reviewerAudience.join(', ')}
                  </span>
                </div>
                <StatusChip status={record.status} label={record.status} />
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="panel notification-approval-panel">
        <PanelHeader
          icon={ClipboardCheck}
          title="Infrastructure Cutover Acknowledgements"
          subtitle="Retain reviewer acknowledgement records for production Postgres cutover checklist packages."
        />
        <div className="notification-approval-grid">
          <div className="notification-approval-form">
            <div className="trace-review-grid">
              <label>
                <span>Reviewer</span>
                <input
                  value={postgresAcknowledgementReviewer}
                  onChange={(event) => setPostgresAcknowledgementReviewer(event.target.value)}
                />
              </label>
              <label>
                <span>Reviewer role</span>
                <select
                  value={postgresAcknowledgementRole}
                  onChange={(event) =>
                    setPostgresAcknowledgementRole(event.target.value as PostgresCutoverAcknowledgement['reviewerRole'])
                  }
                >
                  <option value="infrastructure_owner">Infrastructure owner</option>
                  <option value="database_administrator">Database administrator</option>
                  <option value="security_reviewer">Security reviewer</option>
                  <option value="platform_owner">Platform owner</option>
                </select>
              </label>
              <label>
                <span>Acknowledgement</span>
                <select
                  value={postgresAcknowledgementStatus}
                  onChange={(event) =>
                    setPostgresAcknowledgementStatus(event.target.value as PostgresCutoverAcknowledgementStatus)
                  }
                >
                  <option value="acknowledged">Acknowledged</option>
                  <option value="acknowledged_with_actions">Acknowledged with actions</option>
                  <option value="deferred">Deferred</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label>
                <span>Due date</span>
                <input
                  type="date"
                  value={postgresAcknowledgementDueAt}
                  onChange={(event) => setPostgresAcknowledgementDueAt(event.target.value)}
                />
              </label>
              <label>
                <span>Production readiness</span>
                <select
                  value={postgresProductionReadiness}
                  onChange={(event) =>
                    setPostgresProductionReadiness(event.target.value as PostgresCutoverAcknowledgement['productionReadiness'])
                  }
                >
                  <option value="ready">Ready</option>
                  <option value="ready_with_conditions">Ready with conditions</option>
                  <option value="not_ready">Not ready</option>
                </select>
              </label>
              <label className="toggle-row">
                <input
                  checked={postgresRollbackConfirmed}
                  onChange={(event) => setPostgresRollbackConfirmed(event.target.checked)}
                  type="checkbox"
                />
                <span>Rollback confirmed</span>
              </label>
              <label className="toggle-row">
                <input
                  checked={postgresBackupConfirmed}
                  onChange={(event) => setPostgresBackupConfirmed(event.target.checked)}
                  type="checkbox"
                />
                <span>Backup confirmed</span>
              </label>
              <label className="trace-review-rationale">
                <span>Required actions</span>
                <textarea
                  value={postgresAcknowledgementActions}
                  onChange={(event) => setPostgresAcknowledgementActions(event.target.value)}
                />
              </label>
              <label className="trace-review-rationale">
                <span>Acknowledgement notes</span>
                <textarea
                  value={postgresAcknowledgementNotes}
                  onChange={(event) => setPostgresAcknowledgementNotes(event.target.value)}
                />
              </label>
            </div>
            <div className="toolbar-actions notification-approval-actions">
              <button
                className="secondary-action"
                disabled={!latestPostgresCutoverPackage}
                onClick={() => onSavePostgresCutoverAcknowledgement(postgresAcknowledgementRequest())}
                type="button"
              >
                <ClipboardCheck size={15} />
                Save Acknowledgement
              </button>
              <button
                className="primary-action"
                disabled={!latestPostgresCutoverPackage}
                onClick={() => onDeliverPostgresCutoverAcknowledgement(postgresAcknowledgementRequest())}
                type="button"
              >
                <Bell size={15} />
                Save & Notify Reviewers
              </button>
            </div>
          </div>
          <div className="notification-approval-summary">
            <div className="metadata-grid">
              <Metadata label="Acknowledgements" value={String(postgresCutoverAcknowledgementRecords.length)} />
              <Metadata label="Deliveries" value={String(postgresAcknowledgementDeliveryRecords.length)} />
              <Metadata
                label="Latest status"
                value={latestPostgresCutoverAcknowledgement ? postgresCutoverAcknowledgementLabel(latestPostgresCutoverAcknowledgement.payload.status) : 'Not acknowledged'}
              />
              <Metadata
                label="Package version"
                value={latestPostgresCutoverAcknowledgement?.payload.packageVersion ? `v${latestPostgresCutoverAcknowledgement.payload.packageVersion}` : 'Not linked'}
              />
              <Metadata label="Action count" value={String(postgresAcknowledgementActionList().length)} />
              <Metadata label="Rollback" value={postgresRollbackConfirmed ? 'Confirmed' : 'Open'} />
              <Metadata label="Backup" value={postgresBackupConfirmed ? 'Confirmed' : 'Open'} />
            </div>
            {latestPostgresCutoverAcknowledgement ? (
              <div className="connector-run-history">
                <h4>Latest acknowledgement</h4>
                <div className="connector-run-row">
                  <div>
                    <strong>{latestPostgresCutoverAcknowledgement.payload.reviewer}</strong>
                    <span>
                      v{latestPostgresCutoverAcknowledgement.version} / {new Date(latestPostgresCutoverAcknowledgement.createdAt).toLocaleString()}
                    </span>
                    <small>{latestPostgresCutoverAcknowledgement.payload.evidence}</small>
                  </div>
                  <StatusChip
                    status={latestPostgresCutoverAcknowledgement.status}
                    label={postgresCutoverAcknowledgementLabel(latestPostgresCutoverAcknowledgement.payload.status)}
                  />
                </div>
              </div>
            ) : (
              <div className="empty-state compact">No infrastructure acknowledgement has been retained yet.</div>
            )}
            {postgresAcknowledgementDeliveryRecords.length > 0 ? (
              <div className="connector-run-history">
                <h4>Acknowledgement delivery evidence</h4>
                {postgresAcknowledgementDeliveryRecords.slice(0, 3).map((record) => (
                  <div className="connector-run-row" key={record.id}>
                    <div>
                      <strong>{record.payload.request.subject}</strong>
                      <span>
                        v{record.version} / {new Date(record.createdAt).toLocaleString()} / {record.payload.request.recipients.join(', ')}
                      </span>
                      <small>{record.payload.result.evidence}</small>
                    </div>
                    <StatusChip status={record.status} label={record.status} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        {postgresCutoverAcknowledgementRecords.length > 1 ? (
          <div className="mapping-run-history">
            <h4>Acknowledgement history</h4>
            {postgresCutoverAcknowledgementRecords.slice(1, 5).map((record) => (
              <div className="mapping-run-row" key={record.id}>
                <div>
                  <strong>{record.payload.reviewer}</strong>
                  <span>
                    v{record.version} / {titleize(record.payload.reviewerRole)} / due {record.payload.dueAt || 'not scheduled'}
                  </span>
                  <small>{record.payload.acknowledgementNotes}</small>
                </div>
                <StatusChip status={record.status} label={postgresCutoverAcknowledgementLabel(record.payload.status)} />
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="panel notification-approval-panel">
        <PanelHeader
          icon={Bell}
          title="Production Cutover Owner Renewal Reminders"
          subtitle="Route renewal reminders to cutover owners when package actions, backup readiness, or rollback evidence require follow-up."
        />
        <div className="notification-approval-grid">
          <div className="notification-approval-form">
            <div className="trace-review-grid">
              <label className="trace-review-rationale">
                <span>Cutover owners</span>
                <textarea
                  value={postgresCutoverReminderOwners}
                  onChange={(event) => setPostgresCutoverReminderOwners(event.target.value)}
                />
              </label>
              <label>
                <span>Reminder status</span>
                <select
                  value={postgresCutoverReminderStatus}
                  onChange={(event) =>
                    setPostgresCutoverReminderStatus(event.target.value as PostgresCutoverOwnerReminderStatus)
                  }
                >
                  <option value="routed">Routed</option>
                  <option value="sent">Sent</option>
                  <option value="draft">Draft</option>
                  <option value="deferred">Deferred</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <label>
                <span>Reminder date</span>
                <input
                  type="date"
                  value={postgresCutoverReminderAt}
                  onChange={(event) => setPostgresCutoverReminderAt(event.target.value)}
                />
              </label>
              <label>
                <span>Due date</span>
                <input
                  type="date"
                  value={postgresCutoverReminderDueAt}
                  onChange={(event) => setPostgresCutoverReminderDueAt(event.target.value)}
                />
              </label>
              <label className="trace-review-rationale">
                <span>Escalation path</span>
                <textarea
                  value={postgresCutoverEscalationPath}
                  onChange={(event) => setPostgresCutoverEscalationPath(event.target.value)}
                />
              </label>
              <label className="trace-review-rationale">
                <span>Renewal notes</span>
                <textarea
                  value={postgresCutoverReminderNotes}
                  onChange={(event) => setPostgresCutoverReminderNotes(event.target.value)}
                />
              </label>
            </div>
            <div className="toolbar-actions notification-approval-actions">
              <button
                className="secondary-action"
                onClick={() => onSavePostgresCutoverOwnerReminder(postgresCutoverOwnerReminderRequest())}
                type="button"
              >
                <ClipboardCheck size={15} />
                Save Reminder
              </button>
              <button
                className="primary-action"
                onClick={() => onDeliverPostgresCutoverOwnerReminder(postgresCutoverOwnerReminderRequest())}
                type="button"
              >
                <Bell size={15} />
                Save & Notify Owners
              </button>
            </div>
          </div>
          <div className="notification-approval-summary">
            <div className="metadata-grid">
              <Metadata label="Reminders" value={String(postgresCutoverOwnerReminderRecords.length)} />
              <Metadata label="Deliveries" value={String(postgresCutoverOwnerReminderDeliveryRecords.length)} />
              <Metadata label="Owners" value={String(postgresCutoverReminderOwnerList().length)} />
              <Metadata
                label="Latest reminder"
                value={latestPostgresCutoverOwnerReminder ? postgresCutoverOwnerReminderLabel(latestPostgresCutoverOwnerReminder.payload.status) : 'Not routed'}
              />
              <Metadata
                label="Linked package"
                value={latestPostgresCutoverOwnerReminder?.payload.packageVersion ? `v${latestPostgresCutoverOwnerReminder.payload.packageVersion}` : 'Not linked'}
              />
              <Metadata
                label="Acknowledgement"
                value={latestPostgresCutoverOwnerReminder?.payload.acknowledgementStatus ? postgresCutoverAcknowledgementLabel(latestPostgresCutoverOwnerReminder.payload.acknowledgementStatus) : 'Not linked'}
              />
            </div>
            {latestPostgresCutoverOwnerReminder ? (
              <div className="connector-run-history">
                <h4>Latest owner reminder</h4>
                <div className="connector-run-row">
                  <div>
                    <strong>{latestPostgresCutoverOwnerReminder.payload.owners.join(', ')}</strong>
                    <span>
                      v{latestPostgresCutoverOwnerReminder.version} / due {latestPostgresCutoverOwnerReminder.payload.dueAt || 'not scheduled'}
                    </span>
                    <small>{latestPostgresCutoverOwnerReminder.payload.evidence}</small>
                  </div>
                  <StatusChip
                    status={latestPostgresCutoverOwnerReminder.status}
                    label={postgresCutoverOwnerReminderLabel(latestPostgresCutoverOwnerReminder.payload.status)}
                  />
                </div>
                {latestPostgresCutoverOwnerReminder.payload.requiredActions.length > 0 ? (
                  <div className="storage-column-list">
                    {latestPostgresCutoverOwnerReminder.payload.requiredActions.map((action) => (
                      <span key={action}>{action}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="empty-state compact">No production cutover owner reminders have been retained yet.</div>
            )}
            {postgresCutoverOwnerReminderDeliveryRecords.length > 0 ? (
              <div className="connector-run-history">
                <h4>Owner reminder delivery evidence</h4>
                {postgresCutoverOwnerReminderDeliveryRecords.slice(0, 3).map((record) => (
                  <div className="connector-run-row" key={record.id}>
                    <div>
                      <strong>{record.payload.request.subject}</strong>
                      <span>
                        v{record.version} / {new Date(record.createdAt).toLocaleString()} / {record.payload.request.recipients.join(', ')}
                      </span>
                      <small>{record.payload.result.evidence}</small>
                    </div>
                    <StatusChip status={record.status} label={record.status} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        {postgresCutoverOwnerReminderRecords.length > 1 ? (
          <div className="mapping-run-history">
            <h4>Owner reminder history</h4>
            {postgresCutoverOwnerReminderRecords.slice(1, 5).map((record) => (
              <div className="mapping-run-row" key={record.id}>
                <div>
                  <strong>{record.payload.owners.join(', ')}</strong>
                  <span>
                    v{record.version} / {postgresCutoverOwnerReminderLabel(record.payload.status)} / due {record.payload.dueAt || 'not scheduled'}
                  </span>
                  <small>{record.payload.renewalNotes}</small>
                </div>
                <StatusChip status={record.status} label={postgresCutoverOwnerReminderLabel(record.payload.status)} />
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="panel notification-approval-panel">
        <PanelHeader
          icon={ShieldCheck}
          title="Production Cutover Reminder Closure"
          subtitle="Close owner reminder routes with current package context, acknowledgement status, and superseded package evidence."
        />
        <div className="notification-approval-grid">
          <div className="notification-approval-form">
            <div className="trace-review-grid">
              <label>
                <span>Closure reviewer</span>
                <input
                  value={postgresReminderClosureReviewer}
                  onChange={(event) => setPostgresReminderClosureReviewer(event.target.value)}
                />
              </label>
              <label>
                <span>Closure status</span>
                <select
                  value={postgresReminderClosureStatus}
                  onChange={(event) =>
                    setPostgresReminderClosureStatus(event.target.value as PostgresCutoverReminderClosureStatus)
                  }
                >
                  <option value="closed">Closed</option>
                  <option value="closed_with_actions">Closed with actions</option>
                  <option value="deferred">Deferred</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label className="trace-review-rationale">
                <span>Closure notes</span>
                <textarea
                  value={postgresReminderClosureNotes}
                  onChange={(event) => setPostgresReminderClosureNotes(event.target.value)}
                />
              </label>
              <label className="trace-review-rationale">
                <span>Superseded package evidence</span>
                <textarea
                  value={postgresReminderSupersededEvidence}
                  onChange={(event) => setPostgresReminderSupersededEvidence(event.target.value)}
                />
              </label>
            </div>
            <div className="toolbar-actions notification-approval-actions">
              <button
                className="primary-action"
                disabled={!latestPostgresCutoverOwnerReminder}
                onClick={() => onSavePostgresCutoverReminderClosure(postgresReminderClosureRequest())}
                type="button"
              >
                <ShieldCheck size={15} />
                Save Reminder Closure
              </button>
            </div>
          </div>
          <div className="notification-approval-summary">
            <div className="metadata-grid">
              <Metadata label="Closures" value={String(postgresCutoverReminderClosureRecords.length)} />
              <Metadata
                label="Latest closure"
                value={latestPostgresCutoverReminderClosure ? postgresCutoverReminderClosureLabel(latestPostgresCutoverReminderClosure.payload.status) : 'Not closed'}
              />
              <Metadata
                label="Reminder"
                value={latestPostgresCutoverReminderClosure?.payload.reminderStatus ? postgresCutoverOwnerReminderLabel(latestPostgresCutoverReminderClosure.payload.reminderStatus) : 'Not linked'}
              />
              <Metadata
                label="Package version"
                value={latestPostgresCutoverReminderClosure?.payload.packageVersion ? `v${latestPostgresCutoverReminderClosure.payload.packageVersion}` : 'Not linked'}
              />
              <Metadata
                label="Superseded packages"
                value={String(latestPostgresCutoverReminderClosure?.payload.supersededPackages.length ?? 0)}
              />
              <Metadata
                label="Retained actions"
                value={String(latestPostgresCutoverReminderClosure?.payload.retainedActions.length ?? 0)}
              />
            </div>
            {latestPostgresCutoverReminderClosure ? (
              <div className="connector-run-history">
                <h4>Latest reminder closure</h4>
                <div className="connector-run-row">
                  <div>
                    <strong>{latestPostgresCutoverReminderClosure.payload.reviewer}</strong>
                    <span>
                      v{latestPostgresCutoverReminderClosure.version} / {new Date(latestPostgresCutoverReminderClosure.createdAt).toLocaleString()}
                    </span>
                    <small>{latestPostgresCutoverReminderClosure.payload.evidence}</small>
                  </div>
                  <StatusChip
                    status={latestPostgresCutoverReminderClosure.status}
                    label={postgresCutoverReminderClosureLabel(latestPostgresCutoverReminderClosure.payload.status)}
                  />
                </div>
                {latestPostgresCutoverReminderClosure.payload.supersededEvidence.length > 0 ? (
                  <div className="storage-column-list">
                    {latestPostgresCutoverReminderClosure.payload.supersededEvidence.map((entry) => (
                      <span key={entry}>{entry}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="empty-state compact">No production cutover reminder closure has been retained yet.</div>
            )}
          </div>
        </div>
        {postgresCutoverReminderClosureRecords.length > 1 ? (
          <div className="mapping-run-history">
            <h4>Reminder closure history</h4>
            {postgresCutoverReminderClosureRecords.slice(1, 5).map((record) => (
              <div className="mapping-run-row" key={record.id}>
                <div>
                  <strong>{record.payload.reviewer}</strong>
                  <span>
                    v{record.version} / {postgresCutoverReminderClosureLabel(record.payload.status)} / package {record.payload.packageVersion ? `v${record.payload.packageVersion}` : 'not linked'}
                  </span>
                  <small>{record.payload.closureNotes}</small>
                </div>
                <StatusChip status={record.status} label={postgresCutoverReminderClosureLabel(record.payload.status)} />
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="panel notification-approval-panel">
        <PanelHeader
          icon={Package}
          title="Production Cutover Closure Package"
          subtitle="Export final infrastructure handoff evidence after cutover approval, acknowledgement, owner reminder, and reminder closure are retained."
        />
        <div className="notification-approval-grid">
          <div className="notification-approval-form">
            <div className="trace-review-grid">
              <label className="trace-review-rationale">
                <span>Final handoff reviewers</span>
                <textarea
                  value={postgresClosurePackageReviewers}
                  onChange={(event) => setPostgresClosurePackageReviewers(event.target.value)}
                />
              </label>
              <label className="trace-review-rationale">
                <span>Final handoff notes</span>
                <textarea
                  value={postgresClosurePackageNotes}
                  onChange={(event) => setPostgresClosurePackageNotes(event.target.value)}
                />
              </label>
            </div>
            <div className="toolbar-actions notification-approval-actions">
              <button
                className="secondary-action"
                onClick={() =>
                  onSavePostgresCutoverClosurePackage({
                    download: false,
                    finalHandoffNotes: postgresClosurePackageNotes,
                    finalHandoffReviewers: postgresClosurePackageReviewerList(),
                  })
                }
                type="button"
              >
                <ClipboardCheck size={15} />
                Save Closure Package
              </button>
              <button
                className="primary-action"
                onClick={() =>
                  onSavePostgresCutoverClosurePackage({
                    download: true,
                    finalHandoffNotes: postgresClosurePackageNotes,
                    finalHandoffReviewers: postgresClosurePackageReviewerList(),
                  })
                }
                type="button"
              >
                <Download size={15} />
                Save & Download Closure Package
              </button>
              <button
                className="primary-action"
                onClick={() =>
                  onDeliverPostgresCutoverClosurePackage({
                    download: false,
                    finalHandoffNotes: postgresClosurePackageNotes,
                    finalHandoffReviewers: postgresClosurePackageReviewerList(),
                  })
                }
                type="button"
              >
                <Bell size={15} />
                Save & Deliver to Infrastructure Owners
              </button>
            </div>
          </div>
          <div className="notification-approval-summary">
            <div className="metadata-grid">
              <Metadata label="Closure packages" value={String(postgresCutoverClosurePackageRecords.length)} />
              <Metadata label="Final handoff deliveries" value={String(postgresCutoverClosurePackageDeliveryRecords.length)} />
              <Metadata label="Handoff reviewers" value={String(postgresClosurePackageReviewerList().length)} />
              <Metadata
                label="Latest package"
                value={latestPostgresCutoverClosurePackage ? new Date(latestPostgresCutoverClosurePackage.createdAt).toLocaleString() : 'Not packaged'}
              />
              <Metadata label="Checklist package" value={latestPostgresCutoverPackage ? `v${latestPostgresCutoverPackage.version}` : 'Missing'} />
              <Metadata label="Acknowledgement" value={latestPostgresCutoverAcknowledgement ? postgresCutoverAcknowledgementLabel(latestPostgresCutoverAcknowledgement.payload.status) : 'Missing'} />
              <Metadata label="Reminder closure" value={latestPostgresCutoverReminderClosure ? postgresCutoverReminderClosureLabel(latestPostgresCutoverReminderClosure.payload.status) : 'Missing'} />
              <Metadata label="Delivery evidence" value={String(postgresAcknowledgementDeliveryRecords.length + postgresCutoverOwnerReminderDeliveryRecords.length + postgresCutoverClosurePackageDeliveryRecords.length)} />
            </div>
            {latestPostgresCutoverClosurePackage ? (
              <div className="connector-run-history">
                <h4>Latest final handoff package</h4>
                <div className="connector-run-row">
                  <div>
                    <strong>{latestPostgresCutoverClosurePackage.payload.finalHandoffReviewers.join(', ')}</strong>
                    <span>
                      v{latestPostgresCutoverClosurePackage.version} / {new Date(latestPostgresCutoverClosurePackage.createdAt).toLocaleString()}
                    </span>
                    <small>{latestPostgresCutoverClosurePackage.payload.evidence}</small>
                  </div>
                  <StatusChip status={latestPostgresCutoverClosurePackage.status} label={latestPostgresCutoverClosurePackage.status} />
                </div>
                {latestPostgresCutoverClosurePackage.payload.requiredActions.length > 0 ? (
                  <div className="storage-column-list">
                    {latestPostgresCutoverClosurePackage.payload.requiredActions.slice(0, 6).map((action) => (
                      <span key={action}>{action}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="empty-state compact">No final production cutover closure package has been retained yet.</div>
            )}
          </div>
        </div>
        {postgresCutoverClosurePackageDeliveryRecords.length > 0 ? (
          <div className="mapping-run-history">
            <h4>Final handoff delivery evidence</h4>
            {postgresCutoverClosurePackageDeliveryRecords.slice(0, 5).map((record) => (
              <div className="mapping-run-row" key={record.id}>
                <div>
                  <strong>{record.payload.request.subject}</strong>
                  <span>
                    v{record.version} / {new Date(record.createdAt).toLocaleString()} / {record.payload.request.recipients.join(', ')}
                  </span>
                  <small>{record.payload.result.evidence}</small>
                </div>
                <StatusChip status={record.status} label={record.status} />
              </div>
            ))}
          </div>
        ) : null}
        {postgresCutoverClosurePackageRecords.length > 1 ? (
          <div className="mapping-run-history">
            <h4>Final handoff package history</h4>
            {postgresCutoverClosurePackageRecords.slice(1, 5).map((record) => (
              <div className="mapping-run-row" key={record.id}>
                <div>
                  <strong>{record.payload.packageId}</strong>
                  <span>
                    v{record.version} / {new Date(record.createdAt).toLocaleString()} / {record.payload.finalHandoffReviewers.join(', ')}
                  </span>
                  <small>{record.payload.evidence}</small>
                </div>
                <StatusChip status={record.status} label={record.status} />
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="panel notification-approval-panel">
        <PanelHeader
          icon={Activity}
          title="Delivery Retry Controls"
          subtitle="Plan and execute governed retries for closure, SLA follow-up, cutover acknowledgement, owner reminder, and final handoff notifications."
        />
        <div className="notification-approval-grid">
          <div className="notification-approval-form">
            <div className="trace-review-grid">
              <label>
                <span>Delivery source</span>
                <select
                  value={deliveryRetrySource}
                  onChange={(event) =>
                    setDeliveryRetrySource(event.target.value as NotificationDeliveryPayload['source'])
                  }
                >
                  <option value="notification_closure_export_package">Closure package</option>
                  <option value="notification_retry_queue_export_package">Retry queue package</option>
                  <option value="closure_sla_export_package">Closure SLA package</option>
                  <option value="closure_sla_response_follow_up">Closure SLA follow-up</option>
                  <option value="postgres_cutover_acknowledgement">Cutover acknowledgement</option>
                  <option value="postgres_cutover_owner_reminder">Cutover owner reminder</option>
                  <option value="postgres_cutover_closure_package">Cutover closure package</option>
                </select>
              </label>
              <label>
                <span>Max retries</span>
                <input
                  value={deliveryRetryMaxRetries}
                  onChange={(event) => setDeliveryRetryMaxRetries(event.target.value)}
                />
              </label>
              <label>
                <span>Retry delay minutes</span>
                <input
                  value={deliveryRetryDelayMinutes}
                  onChange={(event) => setDeliveryRetryDelayMinutes(event.target.value)}
                />
              </label>
              <label className="toggle-row">
                <input
                  checked={deliveryRetryOnWarnings}
                  onChange={(event) => setDeliveryRetryOnWarnings(event.target.checked)}
                  type="checkbox"
                />
                <span>Retry warning deliveries</span>
              </label>
              <label className="trace-review-rationale">
                <span>Retry rationale</span>
                <textarea
                  value={deliveryRetryRationale}
                  onChange={(event) => setDeliveryRetryRationale(event.target.value)}
                />
              </label>
            </div>
            <div className="toolbar-actions notification-approval-actions">
              <button
                className="secondary-action"
                disabled={!latestRetryableDelivery}
                onClick={() =>
                  latestRetryableDelivery
                    ? onSaveNotificationDeliveryRetryControl(
                        notificationDeliveryRetryRequest(latestRetryableDelivery, false),
                      )
                    : undefined
                }
                type="button"
              >
                <ClipboardCheck size={15} />
                Plan Retry
              </button>
              <button
                className="primary-action"
                disabled={!latestRetryableDelivery || !latestRetryEligible}
                onClick={() =>
                  latestRetryableDelivery
                    ? onSaveNotificationDeliveryRetryControl(
                        notificationDeliveryRetryRequest(latestRetryableDelivery, true),
                      )
                    : undefined
                }
                type="button"
              >
                <Activity size={15} />
                Execute Retry
              </button>
            </div>
          </div>
          <div className="notification-approval-summary">
            <div className="metadata-grid">
              <Metadata label="Source" value={deliverySourceLabel(deliveryRetrySource)} />
              <Metadata label="Deliveries" value={String(retryableDeliveryRecords.length)} />
              <Metadata label="Retry controls" value={String(retryControlsForSource.length)} />
              <Metadata label="Latest status" value={latestRetryableDelivery?.status ?? 'none'} />
              <Metadata label="Attempt count" value={String(latestRetryAttemptCount)} />
              <Metadata label="Eligible" value={latestRetryEligible ? 'Yes' : 'No'} />
              <Metadata label="Policy" value={`${deliveryRetryPolicy.maxRetries} retries / ${deliveryRetryPolicy.retryDelayMinutes} min`} />
            </div>
            {latestRetryableDelivery ? (
              <div className="connector-run-history">
                <h4>Latest retry candidate</h4>
                <div className="connector-run-row">
                  <div>
                    <strong>{latestRetryableDelivery.payload.request.subject}</strong>
                    <span>
                      v{latestRetryableDelivery.version} / {new Date(latestRetryableDelivery.createdAt).toLocaleString()} / {latestRetryableDelivery.payload.request.recipients.join(', ')}
                    </span>
                    <small>{latestRetryableDelivery.payload.result.evidence}</small>
                  </div>
                  <StatusChip status={latestRetryableDelivery.status} label={latestRetryableDelivery.status} />
                </div>
              </div>
            ) : (
              <div className="empty-state compact">No delivery records are available for the selected retry source.</div>
            )}
            <div className="connector-run-history retry-aging-dashboard">
              <div className="dashboard-heading">
                <h4>Retry Queue Aging</h4>
                <StatusChip status={retryQueueStatus} label={retryQueueStatus} />
              </div>
              <div className="metadata-grid">
                <Metadata label="Active queue" value={String(retryQueueMetrics.active)} />
                <Metadata label="Overdue" value={String(retryQueueMetrics.overdue)} />
                <Metadata label="Due soon" value={String(retryQueueMetrics.dueSoon)} />
                <Metadata label="Executed" value={String(retryQueueMetrics.executed)} />
                <Metadata label="Blocked" value={String(retryQueueMetrics.blocked)} />
                <Metadata
                  label="Oldest active age"
                  value={
                    retryQueueMetrics.oldestAgeMinutes > 0
                      ? retryAgeLabel(retryQueueMetrics.oldestAgeMinutes)
                      : 'none'
                  }
                />
              </div>
              {retryQueueRows.length > 0 ? (
                <div className="retry-aging-list">
                  {retryQueueRows.slice(0, 4).map((row) => (
                    <div className="connector-run-row" key={row.record.id}>
                      <div>
                        <strong>{row.record.payload.subject}</strong>
                        <span>
                          {deliverySourceLabel(row.record.payload.source)} / attempt {row.record.payload.attempt} of {row.record.payload.maxRetries} / {row.active ? retryDueLabel(row.dueAt, retryQueueMeasuredAt) : notificationDeliveryRetryLabel(row.record.payload.status)}
                        </span>
                        <small>
                          {notificationDeliveryRetryLabel(row.record.payload.status)} for {retryAgeLabel(row.ageMinutes)}; due {row.dueAt ? new Date(row.dueAt).toLocaleString() : 'not scheduled'}.
                        </small>
                      </div>
                      <StatusChip status={row.status} label={row.active ? row.status : row.record.payload.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state compact">No retry controls have been planned or executed yet.</div>
              )}
            </div>
            <div className="connector-run-history retry-aging-dashboard">
              <div className="dashboard-heading">
                <h4>Retry Queue Export Package</h4>
                <StatusChip status={retryQueueStatus} label={retryQueueStatus} />
              </div>
              <div className="trace-review-grid">
                <label className="trace-review-rationale">
                  <span>Operations reviewers</span>
                  <textarea
                    value={retryQueueOperationsReviewers}
                    onChange={(event) => setRetryQueueOperationsReviewers(event.target.value)}
                  />
                </label>
                <label className="trace-review-rationale">
                  <span>Reviewer notes</span>
                  <textarea
                    value={retryQueueReviewerNotes}
                    onChange={(event) => setRetryQueueReviewerNotes(event.target.value)}
                  />
                </label>
              </div>
              <div className="toolbar-actions notification-approval-actions">
                <button
                  className="secondary-action"
                  onClick={() =>
                    onSaveNotificationRetryQueueExportPackage({
                      download: false,
                      packagePayload: buildRetryQueueExportPackage(),
                    })
                  }
                  type="button"
                >
                  <ClipboardCheck size={15} />
                  Save Retry Queue Package
                </button>
                <button
                  className="primary-action"
                  onClick={() =>
                    onSaveNotificationRetryQueueExportPackage({
                      download: true,
                      packagePayload: buildRetryQueueExportPackage(),
                    })
                  }
                  type="button"
                >
                  <Download size={15} />
                  Save & Download Retry Queue Package
                </button>
                <button
                  className="primary-action"
                  onClick={() =>
                    onDeliverNotificationRetryQueueExportPackage({
                      download: false,
                      packagePayload: buildRetryQueueExportPackage(),
                    })
                  }
                  type="button"
                >
                  <Bell size={15} />
                  Save & Deliver to Operations Reviewers
                </button>
              </div>
              <div className="metadata-grid">
                <Metadata label="Queue packages" value={String(notificationRetryQueueExportPackageRecords.length)} />
                <Metadata label="Package deliveries" value={String(retryQueuePackageDeliveryRecords.length)} />
                <Metadata label="Operations reviewers" value={String(retryQueueOperationsReviewerList().length)} />
                <Metadata label="Required actions" value={String(retryQueueRequiredActions().length)} />
                <Metadata
                  label="Evidence deliveries"
                  value={String(deliveryRecords.filter((record) => retryQueueActiveSources.has(record.payload.request.source)).length)}
                />
              </div>
              {notificationRetryQueueExportPackageRecords.length > 0 ? (
                <div className="retry-aging-list">
                  {notificationRetryQueueExportPackageRecords.slice(0, 3).map((record) => (
                    <div className="connector-run-row" key={record.id}>
                      <div>
                        <strong>{record.payload.operationsReviewers.join(', ')}</strong>
                        <span>
                          v{record.version} / {new Date(record.createdAt).toLocaleString()} / {record.payload.rows.length} retry row(s)
                        </span>
                        <small>{record.payload.evidence}</small>
                      </div>
                      <StatusChip status={record.status} label={record.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state compact">No retry queue export packages have been retained yet.</div>
              )}
              {retryQueuePackageDeliveryRecords.length > 0 ? (
                <div className="retry-aging-list">
                  <h4>Retry queue package delivery evidence</h4>
                  {retryQueuePackageDeliveryRecords.slice(0, 3).map((record) => (
                    <div className="connector-run-row" key={record.id}>
                      <div>
                        <strong>{record.payload.request.subject}</strong>
                        <span>
                          v{record.version} / {new Date(record.createdAt).toLocaleString()} / {record.payload.request.recipients.join(', ')}
                        </span>
                        <small>{record.payload.result.evidence}</small>
                      </div>
                      <StatusChip status={record.status} label={record.status} />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            {retryControlsForSource.length > 0 ? (
              <div className="connector-run-history">
                <h4>Retry control evidence</h4>
                {retryControlsForSource.slice(0, 3).map((record) => (
                  <div className="connector-run-row" key={record.id}>
                    <div>
                      <strong>{notificationDeliveryRetryLabel(record.payload.status)}</strong>
                      <span>
                        v{record.version} / attempt {record.payload.attempt} of {record.payload.maxRetries} / {new Date(record.createdAt).toLocaleString()}
                      </span>
                      <small>{record.payload.evidence}</small>
                    </div>
                    <StatusChip status={record.status} label={record.status} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
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

      <section className="panel storage-schema-panel">
        <PanelHeader
          icon={Database}
          title="Postgres Migration Checklist"
          subtitle={
            postgresMigrationChecklist?.targetUse ??
            'Production persistence checklist loads from the backend storage contract.'
          }
        />
        {postgresMigrationChecklist ? (
          <div className="storage-schema-grid">
            <article className="storage-table-card">
              <div>
                <strong>Required Environment</strong>
                <span>Backend-only settings for activating shared persistence.</span>
              </div>
              <div className="storage-column-list">
                {(postgresMigrationChecklist.requiredEnvironment ?? []).map((entry) => (
                  <span key={entry.name}>
                    {entry.name} <em>{entry.value}</em>
                  </span>
                ))}
              </div>
            </article>
            <article className="storage-table-card">
              <div>
                <strong>Promotion Gates</strong>
                <span>Checks before JSON or SQLite records are migrated into Postgres.</span>
              </div>
              <div className="storage-column-list">
                {(postgresMigrationChecklist.gates ?? []).slice(0, 6).map((gate) => (
                  <span key={gate}>{gate}</span>
                ))}
              </div>
            </article>
            <article className="storage-table-card">
              <div>
                <strong>Rollback</strong>
                <span>Fallback path if shared persistence needs to be disabled.</span>
              </div>
              <div className="storage-column-list">
                {(postgresMigrationChecklist.rollback ?? []).map((step) => (
                  <span key={step}>{step}</span>
                ))}
              </div>
            </article>
          </div>
        ) : (
          <div className="empty-state compact">Refresh backend health to load the Postgres migration checklist.</div>
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
  canonicalObjects,
  closureRouteRecords,
  deliveryRecords,
  evidenceRecords,
  events,
  links,
  onDeliverNotifications,
  onSaveDeliveryResponse,
  onSaveResponseClosureRoute,
  onSelectEvent,
  onSaveExportReview,
  responseRecords,
  reviewRecords,
  selectedEventId,
}: {
  canonicalObjects: CanonicalObject[]
  closureRouteRecords: BackendRecord<TraceabilityResponseClosureRoute>[]
  deliveryRecords: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>[]
  evidenceRecords: BackendRecord<ReadinessEvidencePacket>[]
  events: QualityEvent[]
  links: TraceabilityLink[]
  onDeliverNotifications: (payload: NotificationDeliveryPayload) => void
  onSaveDeliveryResponse: (request: {
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    routeStage: TraceabilityDeliveryResponse['routeStage']
    status: TraceabilityDeliveryResponseStatus
  }) => void
  onSaveResponseClosureRoute: (request: {
    closureNotes: string
    dueAt: string
    notify?: boolean
    requestedActions: string[]
    responseRecord: BackendRecord<TraceabilityDeliveryResponse>
    routeStage: TraceabilityResponseClosureRouteStage
    routedReviewers: string[]
    reviewer: string
    status: TraceabilityResponseClosureRouteStatus
  }) => void
  onSelectEvent: (eventId: string) => void
  onSaveExportReview: (request: {
    graphPackage: TraceabilityGraphExportPackage
    reviewer: string
    status: TraceabilityExportReviewStatus
    rationale: string
    retentionClass: TraceabilityExportRetentionClass
  }) => Promise<BackendRecord<TraceabilityExportReview>>
  responseRecords: BackendRecord<TraceabilityDeliveryResponse>[]
  reviewRecords: BackendRecord<TraceabilityExportReview>[]
  selectedEventId: string | null
}) {
  const [familyFilter, setFamilyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<StatusLevel | 'all'>('all')
  const [packetFilter, setPacketFilter] = useState('all')
  const [reviewer, setReviewer] = useState('TRACS Quality Reviewer')
  const [reviewStatus, setReviewStatus] = useState<TraceabilityExportReviewStatus>('approved')
  const [retentionClass, setRetentionClass] =
    useState<TraceabilityExportRetentionClass>('standard_7_year')
  const [reviewRationale, setReviewRationale] = useState(
    'Traceability export reviewed for active filters, evidence packet coverage, and retained governance handoff.',
  )
  const [traceabilityRecipients, setTraceabilityRecipients] = useState('TRACS Quality Reviewer')
  const [deliveryResponseReviewer, setDeliveryResponseReviewer] = useState('TRACS Quality Reviewer')
  const [deliveryResponseStatus, setDeliveryResponseStatus] =
    useState<TraceabilityDeliveryResponseStatus>('acknowledged')
  const [deliveryResponseRouteStage, setDeliveryResponseRouteStage] =
    useState<TraceabilityDeliveryResponse['routeStage']>('reviewer_acknowledgement')
  const [deliveryResponseNotes, setDeliveryResponseNotes] = useState(
    'Reviewer acknowledged receipt of the traceability export package and delivery evidence.',
  )
  const [deliveryResponseActions, setDeliveryResponseActions] = useState('')
  const [closureRouteReviewer, setClosureRouteReviewer] = useState('TRACS Quality Owner')
  const [closureRouteStatus, setClosureRouteStatus] =
    useState<TraceabilityResponseClosureRouteStatus>('follow_up_open')
  const [closureRouteStage, setClosureRouteStage] =
    useState<TraceabilityResponseClosureRouteStage>('quality_follow_up')
  const [closureRouteDueAt, setClosureRouteDueAt] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toISOString().slice(0, 10)
  })
  const [closureRouteReviewers, setClosureRouteReviewers] = useState('TRACS Quality Owner')
  const [closureRouteNotes, setClosureRouteNotes] = useState(
    'Route reviewer response closure, confirm requested actions, and retain closure notification evidence.',
  )
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? events[0]
  const canonicalById = useMemo(
    () => new Map(canonicalObjects.map((object) => [object.id, object])),
    [canonicalObjects],
  )
  const selectedLinks = selectedEvent
    ? links.filter((link) => link.sourceObjectId === selectedEvent.id)
    : []
  const traceEvidencePackets = evidenceRecords.filter((record) =>
    record.payload.canonicalLoads.some((load) => load.payload.linkCount > 0),
  )
  const familyOptions = Array.from(
    new Set(
      selectedLinks.map((link) => canonicalById.get(link.targetObjectId)?.family ?? link.targetObjectType),
    ),
  ).sort()
  const filteredLinks = selectedLinks.filter((link) => {
    const family = canonicalById.get(link.targetObjectId)?.family ?? link.targetObjectType
    const familyMatches = familyFilter === 'all' || family === familyFilter
    const statusMatches = statusFilter === 'all' || link.status === statusFilter
    const packetMatches =
      packetFilter === 'all' ||
      traceEvidencePackets.some(
        (record) =>
          record.id === packetFilter &&
          record.payload.canonicalLoads.some((load) => load.payload.linkCount > 0),
      )
    return familyMatches && statusMatches && packetMatches
  })
  const relationshipSummary = filteredLinks.reduce<Record<string, number>>((summary, link) => {
    const family = canonicalById.get(link.targetObjectId)?.family ?? link.targetObjectType
    summary[family] = (summary[family] ?? 0) + 1
    return summary
  }, {})
  const graphNodes = selectedEvent
    ? [
        {
          id: selectedEvent.id,
          label: selectedEvent.canonical.event_id,
          family: selectedEvent.family,
          type: selectedEvent.objectType,
          status: selectedEvent.status,
        },
        ...filteredLinks.map((link) => {
          const object = canonicalById.get(link.targetObjectId)
          return {
            id: link.targetObjectId,
            label: link.targetLabel,
            family: object?.family ?? link.targetObjectType,
            type: link.targetObjectType,
            status: object?.status ?? link.status,
          }
        }),
      ]
    : []
  function createGraphExportPackage(
    evidencePacket?: BackendRecord<ReadinessEvidencePacket>,
  ): TraceabilityGraphExportPackage {
    const selectedEvidencePackets = evidencePacket
      ? [evidencePacket]
      : packetFilter === 'all'
        ? traceEvidencePackets
        : traceEvidencePackets.filter((record) => record.id === packetFilter)
    const generatedAt = new Date().toISOString()
    const packageId = `traceability_graph:${selectedEvent?.canonical.event_id ?? 'all'}:${generatedAt}`
    return {
      packageId,
      generatedAt,
      source: 'traceability_workspace',
      selectedEvent,
      filters: {
        family: familyFilter,
        status: statusFilter,
        evidencePacket: evidencePacket?.id ?? packetFilter,
      },
      graph: {
        nodes: graphNodes,
        edges: filteredLinks,
        relationshipSummary,
      },
      evidencePackets: selectedEvidencePackets,
      coverage: {
        canonicalObjects: canonicalObjects.length,
        filteredLinks: filteredLinks.length,
        availableLinks: selectedLinks.length,
        evidencePackets: selectedEvidencePackets.length,
        selectedEvidencePacket: evidencePacket?.id,
      },
      evidence: `${filteredLinks.length} filtered traceability link(s), ${graphNodes.length} graph node(s), and ${selectedEvidencePackets.length} evidence packet(s) exported for ${selectedEvent?.canonical.event_id ?? 'the active traceability selection'}.`,
    }
  }
  async function exportGraphPackage(evidencePacket?: BackendRecord<ReadinessEvidencePacket>) {
    const packagePayload = createGraphExportPackage(evidencePacket)
    await onSaveExportReview({
      graphPackage: packagePayload,
      reviewer,
      status: reviewStatus,
      rationale: reviewRationale,
      retentionClass,
    })
    const packetSuffix = evidencePacket ? `-${evidencePacket.id.slice(0, 8)}` : ''
    downloadJson(`tracs-traceability-graph-package${packetSuffix}.json`, packagePayload)
  }
  function deliveryPayloadForGraph(graphPackage: TraceabilityGraphExportPackage) {
    const notification = createTraceabilityExportNotification(graphPackage, {
      reviewer,
      status: reviewStatus,
      rationale: reviewRationale,
      retentionClass,
    })
    const recipients = traceabilityRecipients
      .split(',')
      .map((recipient) => recipient.trim())
      .filter(Boolean)
    return notificationToDeliveryPayload(
      'traceability_export',
      `Traceability export package ${graphPackage.selectedEvent?.canonical.event_id ?? 'all'}`,
      {
        ...notification,
        recipients: recipients.length > 0 ? recipients : notification.recipients,
      },
    )
  }
  async function deliverGraphPackage(evidencePacket?: BackendRecord<ReadinessEvidencePacket>) {
    const packagePayload = createGraphExportPackage(evidencePacket)
    await onSaveExportReview({
      graphPackage: packagePayload,
      reviewer,
      status: reviewStatus,
      rationale: reviewRationale,
      retentionClass,
    })
    onDeliverNotifications(deliveryPayloadForGraph(packagePayload))
  }
  const traceabilityDeliveryRecords = deliveryRecords.filter(
    (record) => record.payload.request.source === 'traceability_export',
  )
  const latestTraceabilityDelivery = traceabilityDeliveryRecords[0]
  const latestDeliveryResponse = responseRecords[0]
  const traceabilityClosureRoutes = closureRouteRecords.filter((record) =>
    responseRecords.some((response) => response.id === record.payload.responseRecordId),
  )
  const latestClosureRoute = traceabilityClosureRoutes[0]
  const acknowledgedDeliveryIds = new Set(responseRecords.map((record) => record.payload.deliveryRecordId))
  const openDeliveryCount = traceabilityDeliveryRecords.filter((record) => !acknowledgedDeliveryIds.has(record.id)).length
  const openClosureRouteCount = traceabilityClosureRoutes.filter((record) => record.payload.status !== 'closed').length
  function saveDeliveryResponse(deliveryRecord = latestTraceabilityDelivery) {
    if (!deliveryRecord) return
    onSaveDeliveryResponse({
      deliveryRecord,
      requestedActions: deliveryResponseActions
        .split('\n')
        .map((action) => action.trim())
        .filter(Boolean),
      responseNotes: deliveryResponseNotes,
      reviewer: deliveryResponseReviewer,
      routeStage: deliveryResponseRouteStage,
      status: deliveryResponseStatus,
    })
  }
  function closureRouteRequest(responseRecord = latestDeliveryResponse, notify = false) {
    if (!responseRecord) return
    const reviewers = closureRouteReviewers
      .split(',')
      .map((routeReviewer) => routeReviewer.trim())
      .filter(Boolean)
    const requestedActions = [
      ...responseRecord.payload.requestedActions,
      ...deliveryResponseActions
        .split('\n')
        .map((action) => action.trim())
        .filter(Boolean),
    ].filter((action, index, actions) => actions.indexOf(action) === index)
    onSaveResponseClosureRoute({
      closureNotes: closureRouteNotes,
      dueAt: closureRouteDueAt,
      notify,
      requestedActions,
      responseRecord,
      routeStage: closureRouteStage,
      routedReviewers: reviewers,
      reviewer: closureRouteReviewer,
      status: closureRouteStatus,
    })
  }

  return (
    <>
      <section className="connector-toolbar panel">
        <div>
          <h2>Traceability Matrix</h2>
          <p>
            Follow quality-event relationships into product, lot/serial, return, and external CAPA references.
          </p>
        </div>
        <div className="toolbar-actions">
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
          <button className="secondary-action" onClick={() => exportGraphPackage()} type="button">
            <Download size={15} />
            Export Graph Package
          </button>
          <button className="primary-action" onClick={() => deliverGraphPackage()} type="button">
            <Bell size={15} />
            Deliver to Reviewers
          </button>
        </div>
      </section>

      <section className="panel trace-filter-panel">
        <PanelHeader
          icon={Search}
          title="Traceability Filters"
          subtitle="Filter paths and graph nodes by object family, link status, and saved evidence packet coverage."
        />
        <div className="trace-filter-grid">
          <label>
            <span>Object family</span>
            <select value={familyFilter} onChange={(event) => setFamilyFilter(event.target.value)}>
              <option value="all">All families</option>
              {familyOptions.map((family) => (
                <option key={family} value={family}>
                  {titleize(family)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Link status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusLevel | 'all')}
            >
              <option value="all">All statuses</option>
              <option value="pass">Pass</option>
              <option value="warning">Warning</option>
              <option value="blocking">Blocking</option>
            </select>
          </label>
          <label>
            <span>Evidence packet</span>
            <select value={packetFilter} onChange={(event) => setPacketFilter(event.target.value)}>
              <option value="all">All packets</option>
              {traceEvidencePackets.map((record) => (
                <option key={record.id} value={record.id}>
                  v{record.version} / {new Date(record.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="panel trace-review-panel">
        <PanelHeader
          icon={ClipboardCheck}
          title="Export Review & Retention"
          subtitle="Sign traceability graph exports and retain reviewer evidence as versioned backend records."
        />
        <div className="trace-review-grid">
          <label>
            <span>Reviewer</span>
            <input value={reviewer} onChange={(event) => setReviewer(event.target.value)} />
          </label>
          <label>
            <span>Review status</span>
            <select
              value={reviewStatus}
              onChange={(event) => setReviewStatus(event.target.value as TraceabilityExportReviewStatus)}
            >
              <option value="approved">Approved</option>
              <option value="approved_with_conditions">Approved with conditions</option>
              <option value="draft">Draft</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          <label>
            <span>Retention</span>
            <select
              value={retentionClass}
              onChange={(event) => setRetentionClass(event.target.value as TraceabilityExportRetentionClass)}
            >
              <option value="standard_7_year">Standard 7 year</option>
              <option value="project_lifetime">Project lifetime</option>
              <option value="legal_hold">Legal hold</option>
            </select>
          </label>
          <label className="trace-review-rationale">
            <span>Rationale</span>
            <textarea value={reviewRationale} onChange={(event) => setReviewRationale(event.target.value)} />
          </label>
          <label className="trace-review-rationale">
            <span>Reviewer recipients</span>
            <input value={traceabilityRecipients} onChange={(event) => setTraceabilityRecipients(event.target.value)} />
          </label>
        </div>
        <div className="trace-path-summary">
          <Metadata label="Review records" value={String(reviewRecords.length)} />
          <Metadata label="Current status" value={titleize(reviewStatus)} />
          <Metadata
            label="Retention rule"
            value={traceabilityRetentionLabel(retentionClass)}
          />
          <Metadata label="Deliveries" value={String(traceabilityDeliveryRecords.length)} />
          <Metadata label="Open responses" value={String(openDeliveryCount)} />
        </div>
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
            subtitle={`${filteredLinks.length} of ${selectedLinks.length} relationship(s) shown after filters.`}
          />
          <div className="trace-node-list">
            {filteredLinks.map((link) => (
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
            {filteredLinks.length === 0 ? (
              <div className="empty-state compact">No linked objects match the active filters.</div>
            ) : null}
          </div>
        </section>
      </section>

      <section className="panel trace-graph-panel">
        <PanelHeader
          icon={GitBranch}
          title="Filtered Traceability Graph"
          subtitle="Graph-style node and edge inventory derived from the selected event and active filters."
        />
        <div className="trace-graph-canvas">
          <div className="trace-graph-node source">
            <strong>{selectedEvent?.canonical.event_id ?? 'No event'}</strong>
            <span>quality_event / quality</span>
          </div>
          <div className="trace-graph-edges">
            {filteredLinks.map((link) => {
              const object = canonicalById.get(link.targetObjectId)
              return (
                <div className="trace-graph-edge" key={link.id}>
                  <span>{titleize(link.relationshipType)}</span>
                  <div className="trace-line" />
                  <div className="trace-graph-node">
                    <strong>{link.targetLabel}</strong>
                    <span>{titleize(object?.family ?? link.targetObjectType)} / {titleize(link.targetObjectType)}</span>
                  </div>
                </div>
              )
            })}
            {filteredLinks.length === 0 ? (
              <div className="empty-state compact">No graph edges match the active filters.</div>
            ) : null}
          </div>
        </div>
        <div className="trace-path-summary">
          <Metadata label="Graph nodes" value={String(graphNodes.length)} />
          <Metadata label="Graph edges" value={String(filteredLinks.length)} />
          <Metadata label="Evidence packets" value={String(traceEvidencePackets.length)} />
        </div>
      </section>

      <section className="panel trace-path-panel">
        <PanelHeader
          icon={Route}
          title="Path Explorer"
          subtitle="Readable event-to-object paths for audit, impact analysis, and cross-system evidence review."
        />
        <div className="trace-path-summary">
          <Metadata label="Paths" value={String(filteredLinks.length)} />
          <Metadata label="Target types" value={String(Object.keys(relationshipSummary).length)} />
          <Metadata
            label="Coverage"
            value={
              Object.entries(relationshipSummary)
                .map(([type, count]) => `${titleize(type)} ${count}`)
                .join(', ') || 'No links'
            }
          />
        </div>
        <div className="trace-path-list">
          {filteredLinks.map((link, index) => (
            <div className="trace-path-row" key={link.id}>
              <div className="trace-step source">
                <strong>{selectedEvent?.canonical.event_id}</strong>
                <span>quality_event</span>
              </div>
              <Route size={16} />
              <div className="trace-step">
                <strong>{titleize(link.relationshipType)}</strong>
                <span>Path {index + 1}</span>
              </div>
              <Route size={16} />
              <div className="trace-step target">
                <strong>{link.targetLabel}</strong>
                <span>{titleize(link.targetObjectType)}</span>
              </div>
              <StatusChip status={link.status} label={link.status} />
              <p>{link.evidence}</p>
            </div>
          ))}
          {filteredLinks.length === 0 ? (
            <div className="empty-state compact">No traceability paths are available for this event.</div>
          ) : null}
        </div>
      </section>

      <section className="panel trace-evidence-panel">
        <PanelHeader
          icon={ClipboardCheck}
          title="Persisted Evidence Packet Links"
          subtitle="Saved readiness packets that include canonical-load evidence with traceability links."
        />
        {traceEvidencePackets.length > 0 ? (
          <div className="mapping-run-history">
            {traceEvidencePackets.slice(0, 5).map((record) => (
              <div className="mapping-run-row" key={record.id}>
                <div>
                  <strong>{record.label}</strong>
                  <span>
                    v{record.version} / {new Date(record.createdAt).toLocaleString()} / {record.payload.summary.canonicalLoads} canonical load(s)
                  </span>
                  <small>
                    {record.payload.canonicalLoads
                      .map((load) => `${load.payload.sourceConnector}: ${load.payload.linkCount} link(s)`)
                      .join(' / ')}
                  </small>
                </div>
                <div className="toolbar-actions">
                  <button className="secondary-action compact" onClick={() => exportGraphPackage(record)} type="button">
                    <Download size={14} />
                    Export
                  </button>
                  <button className="secondary-action compact" onClick={() => deliverGraphPackage(record)} type="button">
                    <Bell size={14} />
                    Deliver
                  </button>
                  <StatusChip status={record.status} label={record.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No saved evidence packets include traceability-link evidence yet.</div>
        )}
      </section>

      <section className="panel trace-review-history-panel">
        <PanelHeader
          icon={History}
          title="Signed Export Retention Records"
          subtitle="Versioned traceability graph export reviews with reviewer signature and retention evidence."
        />
        {reviewRecords.length > 0 ? (
          <div className="mapping-run-history">
            {reviewRecords.slice(0, 6).map((record) => (
              <div className="mapping-run-row" key={record.id}>
                <div>
                  <strong>{record.payload.package.selectedEvent?.canonical.event_id ?? 'All traceability'}</strong>
                  <span>
                    v{record.version} / {record.payload.reviewer} / {new Date(record.payload.signedAt).toLocaleString()}
                  </span>
                  <small>
                    {record.payload.package.coverage.filteredLinks} link(s), {record.payload.package.coverage.evidencePackets} packet(s) / retain until {record.payload.retention.retainUntil === 'indefinite'
                      ? 'legal hold release'
                      : new Date(record.payload.retention.retainUntil).toLocaleDateString()}
                  </small>
                </div>
                <StatusChip status={record.status} label={titleize(record.payload.status)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No signed traceability export reviews have been retained yet.</div>
        )}
      </section>

      <section className="panel trace-review-history-panel">
        <PanelHeader
          icon={Bell}
          title="Traceability Delivery Evidence"
          subtitle="Reviewer notification records for delivered traceability graph export packages."
        />
        {traceabilityDeliveryRecords.length > 0 ? (
          <div className="mapping-run-history">
            {traceabilityDeliveryRecords.slice(0, 6).map((record) => (
              <div className="mapping-run-row" key={record.id}>
                <div>
                  <strong>{record.payload.request.subject}</strong>
                  <span>
                    v{record.version} / {new Date(record.createdAt).toLocaleString()} / {record.payload.request.recipients.join(', ') || 'No recipients'}
                  </span>
                  <small>{record.payload.result.evidence}</small>
                </div>
                <div className="toolbar-actions">
                  <button className="secondary-action compact" onClick={() => saveDeliveryResponse(record)} type="button">
                    <ClipboardCheck size={14} />
                    Respond
                  </button>
                  <StatusChip
                    status={acknowledgedDeliveryIds.has(record.id) ? 'pass' : record.status}
                    label={acknowledgedDeliveryIds.has(record.id) ? 'responded' : record.status}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No traceability export delivery has been recorded yet.</div>
        )}
      </section>

      <section className="panel trace-review-history-panel">
        <PanelHeader
          icon={ClipboardCheck}
          title="Reviewer Response Tracking"
          subtitle="Capture acknowledgement, approval, or requested changes for delivered traceability export packages."
        />
        <div className="trace-review-grid">
          <label>
            <span>Response reviewer</span>
            <input value={deliveryResponseReviewer} onChange={(event) => setDeliveryResponseReviewer(event.target.value)} />
          </label>
          <label>
            <span>Response status</span>
            <select
              value={deliveryResponseStatus}
              onChange={(event) => setDeliveryResponseStatus(event.target.value as TraceabilityDeliveryResponseStatus)}
            >
              <option value="acknowledged">Acknowledged</option>
              <option value="approved">Approved</option>
              <option value="changes_requested">Changes requested</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          <label>
            <span>Route stage</span>
            <select
              value={deliveryResponseRouteStage}
              onChange={(event) =>
                setDeliveryResponseRouteStage(event.target.value as TraceabilityDeliveryResponse['routeStage'])
              }
            >
              <option value="reviewer_acknowledgement">Reviewer acknowledgement</option>
              <option value="quality_follow_up">Quality follow-up</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          <label className="trace-review-rationale">
            <span>Response notes</span>
            <textarea value={deliveryResponseNotes} onChange={(event) => setDeliveryResponseNotes(event.target.value)} />
          </label>
          <label className="trace-review-rationale">
            <span>Requested actions</span>
            <textarea
              value={deliveryResponseActions}
              onChange={(event) => setDeliveryResponseActions(event.target.value)}
              placeholder="One requested action per line"
            />
          </label>
        </div>
        <div className="toolbar-actions notification-approval-actions">
          <button
            className="primary-action"
            disabled={!latestTraceabilityDelivery}
            onClick={() => saveDeliveryResponse()}
            type="button"
          >
            <ClipboardCheck size={15} />
            Save Latest Response
          </button>
        </div>
        <div className="trace-path-summary">
          <Metadata label="Responses" value={String(responseRecords.length)} />
          <Metadata label="Open deliveries" value={String(openDeliveryCount)} />
          <Metadata label="Open closure routes" value={String(openClosureRouteCount)} />
          <Metadata
            label="Latest response"
            value={latestDeliveryResponse ? traceabilityResponseLabel(latestDeliveryResponse.payload.status) : 'Not recorded'}
          />
          <Metadata
            label="Latest closure route"
            value={latestClosureRoute ? traceabilityClosureRouteLabel(latestClosureRoute.payload.status) : 'Not routed'}
          />
        </div>
        <div className="mapping-run-history">
          <h4>Closure Notifications & Follow-Up Routing</h4>
          <div className="trace-review-grid">
            <label>
              <span>Closure owner</span>
              <input value={closureRouteReviewer} onChange={(event) => setClosureRouteReviewer(event.target.value)} />
            </label>
            <label>
              <span>Closure status</span>
              <select
                value={closureRouteStatus}
                onChange={(event) => setClosureRouteStatus(event.target.value as TraceabilityResponseClosureRouteStatus)}
              >
                <option value="follow_up_open">Follow-up open</option>
                <option value="closure_ready">Closure ready</option>
                <option value="closed">Closed</option>
                <option value="escalated">Escalated</option>
              </select>
            </label>
            <label>
              <span>Route stage</span>
              <select
                value={closureRouteStage}
                onChange={(event) => setClosureRouteStage(event.target.value as TraceabilityResponseClosureRouteStage)}
              >
                <option value="quality_follow_up">Quality follow-up</option>
                <option value="closure_review">Closure review</option>
                <option value="closed">Closed</option>
                <option value="escalated">Escalated</option>
              </select>
            </label>
            <label>
              <span>Due date</span>
              <input type="date" value={closureRouteDueAt} onChange={(event) => setClosureRouteDueAt(event.target.value)} />
            </label>
            <label className="trace-review-rationale">
              <span>Closure reviewers</span>
              <input value={closureRouteReviewers} onChange={(event) => setClosureRouteReviewers(event.target.value)} />
            </label>
            <label className="trace-review-rationale">
              <span>Closure notes</span>
              <textarea value={closureRouteNotes} onChange={(event) => setClosureRouteNotes(event.target.value)} />
            </label>
          </div>
          <div className="toolbar-actions notification-approval-actions">
            <button
              className="secondary-action"
              disabled={!latestDeliveryResponse}
              onClick={() => closureRouteRequest()}
              type="button"
            >
              <ClipboardCheck size={15} />
              Save Follow-Up Route
            </button>
            <button
              className="primary-action"
              disabled={!latestDeliveryResponse}
              onClick={() => closureRouteRequest(latestDeliveryResponse, true)}
              type="button"
            >
              <Bell size={15} />
              Notify Closure Reviewers
            </button>
          </div>
          {traceabilityClosureRoutes.length > 0 ? (
            <div className="mapping-run-history">
              {traceabilityClosureRoutes.slice(0, 5).map((record) => (
                <div className="mapping-run-row" key={record.id}>
                  <div>
                    <strong>{record.payload.deliverySubject}</strong>
                    <span>
                      v{record.version} / {record.payload.reviewer} / due {record.payload.dueAt || 'not scheduled'}
                    </span>
                    <small>{record.payload.evidence}</small>
                  </div>
                  <StatusChip status={record.status} label={traceabilityClosureRouteLabel(record.payload.status)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state compact">No traceability response closure routes have been retained yet.</div>
          )}
        </div>
        {responseRecords.length > 0 ? (
          <div className="mapping-run-history">
            {responseRecords.slice(0, 6).map((record) => (
              <div className="mapping-run-row" key={record.id}>
                <div>
                  <strong>{record.payload.deliverySubject}</strong>
                  <span>
                    v{record.version} / {record.payload.reviewer} / {new Date(record.payload.respondedAt).toLocaleString()}
                  </span>
                  <small>{record.payload.evidence}</small>
                </div>
                <StatusChip status={record.status} label={traceabilityResponseLabel(record.payload.status)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No reviewer responses have been retained yet.</div>
        )}
      </section>
    </>
  )
}

function ReportCatalogView({
  canonicalObjects,
  deliveryRecords,
  onDeliverNotifications,
  onSaveReport,
  reports,
}: {
  canonicalObjects: CanonicalObject[]
  deliveryRecords: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>[]
  onDeliverNotifications: (payload: NotificationDeliveryPayload) => void
  onSaveReport: (report: ReportCatalogItem, action: ReportCatalogSaveAction) => void
  reports: ReportCatalogItem[]
}) {
  const staleCount = reports.filter((report) => report.refreshStatus !== 'pass').length
  const [selectedReportId, setSelectedReportId] = useState(reports[0]?.id ?? '')
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0]
  const reportDeliveryRecords = deliveryRecords.filter(
    (record) => record.payload.request.source === 'report_catalog',
  )

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
        <div className="toolbar-actions">
          <button
            className="secondary-action"
            onClick={() =>
              downloadJson(
                'tracs-report-approval-notifications.json',
                reports.map(createReportApprovalNotification),
              )
            }
            type="button"
          >
            <Bell size={15} />
            Export Notices
          </button>
          <button
            className="secondary-action"
            onClick={() =>
              onDeliverNotifications(
                notificationToDeliveryPayload(
                  'report_catalog',
                  'TRACS report catalog approval notices',
                  {
                    notificationId: `report_catalog_batch:${new Date().toISOString()}`,
                    generatedAt: new Date().toISOString(),
                    type: 'report_catalog_approval',
                    reportId: 'batch',
                    title: 'Report catalog batch',
                    owner: 'TRACS',
                    workspace: 'Report Catalog',
                    semanticModel: 'Multiple',
                    routeStage: 'quality_review',
                    recipients: Array.from(
                      new Set(
                        reports.flatMap((report) =>
                          report.routedReviewers?.length
                            ? report.routedReviewers
                            : [report.approvalReviewer, report.owner].filter(
                                (recipient): recipient is string => Boolean(recipient),
                              ),
                        ),
                      ),
                    ),
                    dueAt: '',
                    approvalStatus: 'pending',
                    publishStatus: 'draft',
                    freshnessStatus: staleCount > 0 ? 'warning' : 'pass',
                    summary: `${reports.length} report catalog approval notice(s) prepared for delivery.`,
                    evidence: reports.map((report) => report.freshnessEvidence),
                    sourceDependencies: Array.from(new Set(reports.flatMap((report) => report.sourceDependencies))),
                  },
                ),
              )
            }
            type="button"
          >
            <PlugZap size={15} />
            Run Delivery
          </button>
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
              <Metadata label="Route stage" value={reportRouteLabel(report.reviewerRouteStage)} />
              <Metadata label="Route due" value={report.routeDueAt || 'Not scheduled'} />
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
          deliveryRecords={reportDeliveryRecords}
          key={selectedReport.id}
          onDeliverNotifications={onDeliverNotifications}
          onSave={onSaveReport}
          report={selectedReport}
        />
      ) : null}

      <section className="panel report-editor-panel">
        <PanelHeader
          icon={Bell}
          title="Report Notification Delivery Evidence"
          subtitle="Recent records for email, Teams, and SharePoint folder delivery contracts."
        />
        {reportDeliveryRecords.length > 0 ? (
          <div className="mapping-run-history">
            {reportDeliveryRecords.slice(0, 5).map((record) => (
              <div className="mapping-run-row" key={record.id}>
                <div>
                  <strong>{record.label}</strong>
                  <span>
                    v{record.version} / {new Date(record.createdAt).toLocaleString()} / {record.payload.result.evidence}
                  </span>
                  <small>
                    {record.payload.result.channelResults
                      .map((channel) => `${channel.channel}: ${channel.mode} ${channel.status}`)
                      .join(' / ')}
                  </small>
                </div>
                <StatusChip status={record.status} label={record.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No report notification delivery has been recorded yet.</div>
        )}
      </section>
    </>
  )
}

function ReportCatalogEditor({
  canonicalObjects,
  deliveryRecords,
  onDeliverNotifications,
  onSave,
  report,
}: {
  canonicalObjects: CanonicalObject[]
  deliveryRecords: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>[]
  onDeliverNotifications: (payload: NotificationDeliveryPayload) => void
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
  const [reviewerRouteStage, setReviewerRouteStage] = useState<
    NonNullable<ReportCatalogItem['reviewerRouteStage']>
  >(report.reviewerRouteStage ?? 'owner_review')
  const [routedReviewers, setRoutedReviewers] = useState(report.routedReviewers?.join(', ') ?? '')
  const [routeDueAt, setRouteDueAt] = useState(report.routeDueAt ?? '')

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
      reviewerRouteStage,
      routedReviewers: splitCsv(routedReviewers),
      routeDueAt,
      ...freshness,
    }
  }

  const previewReport = draftReport()
  const gate = evaluateReportPublishGate(previewReport, canonicalObjects)
  const previewNotification = createReportApprovalNotification(previewReport)

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
          <label>
            <span>Route stage</span>
            <select
              value={reviewerRouteStage}
              onChange={(event) =>
                setReviewerRouteStage(event.target.value as NonNullable<ReportCatalogItem['reviewerRouteStage']>)
              }
            >
              <option value="owner_review">Owner review</option>
              <option value="quality_review">Quality review</option>
              <option value="executive_signoff">Executive signoff</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label>
            <span>Route due date</span>
            <input type="date" value={routeDueAt} onChange={(event) => setRouteDueAt(event.target.value)} />
          </label>
          <label className="template-editor-notes">
            <span>Routed reviewers</span>
            <input value={routedReviewers} onChange={(event) => setRoutedReviewers(event.target.value)} />
          </label>
          <label className="template-editor-notes">
            <span>Sign-off rationale</span>
            <textarea value={approvalRationale} onChange={(event) => setApprovalRationale(event.target.value)} />
          </label>
          <div className="report-editor-actions">
            <button
              className="secondary-action"
              onClick={() =>
                downloadJson('tracs-report-approval-notification.json', previewNotification)
              }
              type="button"
            >
              <Bell size={15} />
              Export Notice
            </button>
            <button
              className="secondary-action"
              onClick={() =>
                onDeliverNotifications(
                  notificationToDeliveryPayload(
                    'report_catalog',
                    `${previewReport.title} approval notice`,
                    previewNotification,
                  ),
                )
              }
            type="button"
          >
            <PlugZap size={15} />
              Run Delivery
            </button>
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
              <Metadata label="Route stage" value={reportRouteLabel(previewReport.reviewerRouteStage)} />
              <Metadata label="Route due" value={previewReport.routeDueAt || 'Not scheduled'} />
              <Metadata label="Routed reviewers" value={previewReport.routedReviewers?.join(', ') || 'Not routed'} />
            </div>
          </div>
          {previewReport.notificationHistory?.length ? (
            <div className="report-approval-history">
              <h4>Notification History</h4>
              {previewReport.notificationHistory.slice(-4).reverse().map((entry) => (
                <div className="connector-run-row" key={entry.notificationId}>
                  <div>
                    <strong>{reportRouteLabel(entry.routeStage)}</strong>
                    <span>
                      {entry.recipients.join(', ') || 'No recipients'} / {new Date(entry.sentAt).toLocaleString()}
                    </span>
                    <small>{entry.summary}</small>
                  </div>
                  <StatusChip status="pass" label="notice" />
                </div>
              ))}
            </div>
          ) : null}
          {deliveryRecords.length > 0 ? (
            <div className="report-approval-history">
              <h4>Delivery Records</h4>
              {deliveryRecords.slice(0, 3).map((record) => (
                <div className="connector-run-row" key={record.id}>
                  <div>
                    <strong>{record.payload.request.subject}</strong>
                    <span>{new Date(record.createdAt).toLocaleString()}</span>
                    <small>{record.payload.result.evidence}</small>
                  </div>
                  <StatusChip status={record.status} label={record.status} />
                </div>
              ))}
            </div>
          ) : null}
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
  activeMappingId,
  canonicalLoadConnectorId,
  connectorEntries,
  csvSchema,
  csvText,
  extractionJobs,
  extractionRuns,
  externalReferenceDispositions,
  latestCanonicalLoad,
  mapping,
  mappingIds,
  mappingResult,
  mappingRuns,
  profileMetadata,
  profilePreview,
  onCsvTextChange,
  onCreateExtractionJob,
  onLoadConnectorChange,
  onLoadCanonical,
  onMappingChange,
  onRunExtractionJob,
  onSaveLoadDisposition,
  onValidate,
}: {
  activeMappingId: string
  canonicalLoadConnectorId: string
  connectorEntries: Array<[string, AppConfig['connectors']['connectors'][string]]>
  csvSchema: CsvSchemaInference | null
  csvText: string
  extractionJobs: BackendRecord<ExtractionJobPayload>[]
  extractionRuns: BackendRecord<ExtractionRunPayload>[]
  externalReferenceDispositions: BackendRecord<ExternalReferenceLoadExceptionDisposition>[]
  latestCanonicalLoad?: BackendRecord<CanonicalLoadResult>
  mapping: AppConfig['mappings'][string]
  mappingIds: string[]
  mappingResult: MappingValidationResult | null
  mappingRuns: BackendRecord[]
  profileMetadata?: ConnectorSourceMetadata
  profilePreview?: ConnectorPreviewResult
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
  onLoadCanonical: () => Promise<CanonicalLoadResult | undefined> | void
  onMappingChange: (value: string) => void
  onRunExtractionJob: (job: BackendRecord<ExtractionJobPayload>) => void
  onSaveLoadDisposition: (request: {
    dueAt: string
    owner: string
    rationale: string
    replay?: boolean
    status: ExternalReferenceLoadExceptionDispositionStatus
  }) => void
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
  const queuedJobs = extractionJobs
    .slice()
    .sort((first, second) => {
      const firstTime = Date.parse(first.payload.nextRunAt)
      const secondTime = Date.parse(second.payload.nextRunAt)
      return (Number.isFinite(firstTime) ? firstTime : Number.MAX_SAFE_INTEGER) -
        (Number.isFinite(secondTime) ? secondTime : Number.MAX_SAFE_INTEGER)
    })
  const retryEligibleRuns = extractionRuns.filter((run) => run.payload.retryEligible)
  const latestMappingRun = mappingRuns[0]
  const externalMappingApproved = activeMappingId === 'quality_event' || latestMappingRun?.status === 'pass'
  const [loadDispositionOwner, setLoadDispositionOwner] = useState('TRACS Mapping Owner')
  const [loadDispositionStatus, setLoadDispositionStatus] =
    useState<ExternalReferenceLoadExceptionDispositionStatus>('retry_planned')
  const [loadDispositionDueAt, setLoadDispositionDueAt] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toISOString().slice(0, 10)
  })
  const [loadDispositionRationale, setLoadDispositionRationale] = useState(
    'Review source readiness and replay after upstream credentials or preview rows are corrected.',
  )
  const latestLoadWarningSummary =
    latestCanonicalLoad?.payload.warnings.length
      ? latestCanonicalLoad.payload.warnings.join(' ')
      : latestCanonicalLoad
        ? 'Latest load completed without warning evidence.'
        : 'No canonical load has been retained for this mapping yet.'
  const loadDispositionRequest = () => ({
    dueAt: loadDispositionDueAt,
    owner: loadDispositionOwner,
    rationale: loadDispositionRationale,
    status: loadDispositionStatus,
  })

  return (
    <>
      <section className="connector-toolbar panel">
        <div>
          <h2>Mapping Studio</h2>
          <p>
            Validate active source-to-canonical mapping profiles and load quality-event canonical records from configured connector profiles.
          </p>
        </div>
        <div className="toolbar-actions">
          <label className="load-source-control">
            <span>Mapping profile</span>
            <select value={activeMappingId} onChange={(event) => onMappingChange(event.target.value)}>
              {mappingIds.map((mappingId) => (
                <option key={mappingId} value={mappingId}>
                  {titleize(mappingId)}
                </option>
              ))}
            </select>
          </label>
          <label className="load-source-control">
            <span>Load source</span>
            <select
              disabled={activeMappingId !== 'quality_event'}
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
          <button
            className="secondary-action"
            disabled={!externalMappingApproved}
            onClick={onLoadCanonical}
            type="button"
          >
            <Database size={15} />
            {activeMappingId === 'quality_event' ? 'Load Canonical' : 'Load Approved Canonical'}
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
            title={activeMappingId === 'quality_event' ? 'CSV Schema Inference' : 'Profile Source Schema'}
            subtitle={
              activeMappingId === 'quality_event'
                ? 'Manual upload adapter starter using the included quality event sample.'
                : 'External-reference profiles validate against credential-aware metadata and bounded preview rows.'
            }
          />
          {activeMappingId === 'quality_event' ? (
            <div className="mapping-editor">
              <textarea
                aria-label="CSV sample"
                value={csvText}
                onChange={(event) => onCsvTextChange(event.target.value)}
                spellCheck={false}
              />
            </div>
          ) : (
            <div className="mapping-run-history">
              <div className="mapping-run-row">
                <div>
                  <strong>{mapping.source_connector}</strong>
                  <span>{mapping.source_object} / {mapping.object}</span>
                  <small>{Object.keys(mapping.fields).length} declared source field mapping(s)</small>
                </div>
                <StatusChip status={profileMetadata?.columns.length || profilePreview?.columns.length ? 'pass' : 'warning'} label="adapter" />
              </div>
              {profileMetadata ? (
                <div className="mapping-run-row">
                  <div>
                    <strong>Metadata discovery</strong>
                    <span>{profileMetadata.sourcePath ?? mapping.source_object}</span>
                    <small>{profileMetadata.evidence}</small>
                  </div>
                  <StatusChip status={profileMetadata.columns.length > 0 ? 'pass' : 'warning'} label={`${profileMetadata.columns.length} fields`} />
                </div>
              ) : null}
              {profilePreview ? (
                <div className="mapping-run-row">
                  <div>
                    <strong>Bounded preview</strong>
                    <span>{profilePreview.sourcePath ?? mapping.source_object}</span>
                    <small>{profilePreview.evidence}</small>
                  </div>
                  <StatusChip status={profilePreview.returnedRows > 0 ? 'pass' : 'warning'} label={`${profilePreview.returnedRows} rows`} />
                </div>
              ) : null}
              {profilePreview?.rows.length ? (
                <div className="preview-table compact">
                  <h4>Preview Rows</h4>
                  <div className="preview-scroll">
                    <table>
                      <thead>
                        <tr>
                          {profilePreview.columns.slice(0, 5).map((column) => (
                            <th key={column}>{column}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {profilePreview.rows.slice(0, 3).map((row, index) => (
                          <tr key={`${profilePreview.connectorId}-${index}`}>
                            {profilePreview.columns.slice(0, 5).map((column) => (
                              <td key={column}>{row[column] ?? ''}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>
          )}
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
          {activeMappingId !== 'quality_event' ? (
            <div className="mapping-run-history">
              <h4>External-Reference Load Gate</h4>
              <div className="mapping-run-row">
                <div>
                  <strong>{externalMappingApproved ? 'Approved for canonical load' : 'Validation approval required'}</strong>
                  <span>{mapping.source_connector} / {mapping.source_object}</span>
                  <small>
                    {externalMappingApproved
                      ? `Latest retained mapping validation is ${latestMappingRun?.status}.`
                      : 'Run and retain a passing mapping validation before loading external-reference records.'}
                  </small>
                </div>
                <StatusChip status={externalMappingApproved ? 'pass' : 'warning'} label={externalMappingApproved ? 'approved' : 'pending'} />
              </div>
            </div>
          ) : null}
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
          {activeMappingId !== 'quality_event' ? (
            <div className="mapping-run-history">
              <h4>External-Reference Load Exceptions & Replay</h4>
              <div className="mapping-run-row">
                <div>
                  <strong>Exception summary</strong>
                  <span>{latestLoadWarningSummary}</span>
                  <small>
                    {latestCanonicalLoad
                      ? `${latestCanonicalLoad.payload.objectCount} object(s), ${latestCanonicalLoad.payload.linkCount} traceability link(s), ${latestCanonicalLoad.payload.warnings.length} warning(s).`
                      : 'Save a disposition now or replay after the mapping validation gate passes.'}
                  </small>
                </div>
                <StatusChip
                  status={latestCanonicalLoad?.status ?? 'warning'}
                  label={latestCanonicalLoad ? latestCanonicalLoad.status : 'no load'}
                />
              </div>
              <div className="form-grid compact-form">
                <label>
                  <span>Owner</span>
                  <input value={loadDispositionOwner} onChange={(event) => setLoadDispositionOwner(event.target.value)} />
                </label>
                <label>
                  <span>Status</span>
                  <select
                    value={loadDispositionStatus}
                    onChange={(event) =>
                      setLoadDispositionStatus(event.target.value as ExternalReferenceLoadExceptionDispositionStatus)
                    }
                  >
                    <option value="retry_planned">Retry planned</option>
                    <option value="accepted">Accepted</option>
                    <option value="waived">Waived</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </label>
                <label>
                  <span>Due date</span>
                  <input
                    type="date"
                    value={loadDispositionDueAt}
                    onChange={(event) => setLoadDispositionDueAt(event.target.value)}
                  />
                </label>
              </div>
              <textarea
                aria-label="Load exception disposition rationale"
                className="compact-textarea"
                value={loadDispositionRationale}
                onChange={(event) => setLoadDispositionRationale(event.target.value)}
              />
              <div className="toolbar-actions">
                <button
                  className="secondary-action compact"
                  onClick={() => onSaveLoadDisposition(loadDispositionRequest())}
                  type="button"
                >
                  <ClipboardCheck size={14} />
                  Save Disposition
                </button>
                <button
                  className="primary-action compact"
                  disabled={!externalMappingApproved}
                  onClick={() => onSaveLoadDisposition({ ...loadDispositionRequest(), replay: true })}
                  type="button"
                >
                  <Database size={14} />
                  Replay Load
                </button>
              </div>
              {externalReferenceDispositions.length > 0 ? (
                <div className="mapping-run-history">
                  <h4>Disposition History</h4>
                  {externalReferenceDispositions.slice(0, 4).map((record) => (
                    <div className="mapping-run-row" key={record.id}>
                      <div>
                        <strong>{externalReferenceDispositionLabel(record.payload.status)}</strong>
                        <span>
                          {record.payload.owner} / due {record.payload.dueAt || 'not set'} / v{record.version}
                        </span>
                        <small>{record.payload.evidence}</small>
                      </div>
                      <StatusChip status={record.status} label={record.status} />
                    </div>
                  ))}
                </div>
              ) : null}
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
        <div className="extraction-ops-grid">
          <div className="latest-contract">
            <div className="report-card-header">
              <div>
                <strong>Run Queue</strong>
                <span>{queuedJobs.length} job(s), {retryEligibleRuns.length} retry eligible run(s)</span>
              </div>
              <button
                className="secondary-action compact"
                onClick={() =>
                  downloadJson('tracs-extraction-run-queue.json', createExtractionQueueExport(extractionJobs, extractionRuns))
                }
                type="button"
              >
                <Download size={14} />
                Export Queue
              </button>
            </div>
            <div className="queue-list">
              {queuedJobs.slice(0, 5).map((job) => {
                const queueState = extractionQueueStatus(job.payload, extractionRuns)
                return (
                  <button
                    className="queue-row"
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    type="button"
                  >
                    <div>
                      <strong>{job.payload.name}</strong>
                      <span>{job.payload.connectorId} / {titleize(job.payload.scheduleCadence)}</span>
                    </div>
                    <StatusChip
                      status={queueState === 'due now' || queueState === 'retry eligible' ? 'warning' : job.status}
                      label={queueState}
                    />
                  </button>
                )
              })}
              {queuedJobs.length === 0 ? (
                <div className="empty-state compact">No extraction jobs have been saved yet.</div>
              ) : null}
            </div>
          </div>
          <div className="latest-contract">
            <div className="report-card-header">
              <div>
                <strong>Schedule Calendar</strong>
                <span>Next-run dates and retry windows for operational planning.</span>
              </div>
              <CalendarDays size={18} />
            </div>
            <div className="calendar-list">
              {queuedJobs.slice(0, 5).map((job) => (
                <div className="calendar-row" key={job.id}>
                  <div className="calendar-date">
                    <strong>
                      {job.payload.nextRunAt ? new Date(job.payload.nextRunAt).toLocaleDateString() : 'Manual'}
                    </strong>
                    <span>
                      {job.payload.nextRunAt ? new Date(job.payload.nextRunAt).toLocaleTimeString() : 'On demand'}
                    </span>
                  </div>
                  <div>
                    <strong>{job.payload.targetObject}</strong>
                    <span>{job.payload.sourceObject}</span>
                  </div>
                </div>
              ))}
              {queuedJobs.length === 0 ? (
                <div className="empty-state compact">Save scheduled jobs to populate the calendar.</div>
              ) : null}
            </div>
          </div>
        </div>
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
              {selectedSourcePreview ? (
                <div className="preview-table">
                  <h4>Preview Rows</h4>
                  <div className="source-discovery-summary">
                    <Metadata label="Returned" value={String(selectedSourcePreview.returnedRows)} />
                    <Metadata label="Available rows" value={String(selectedSourcePreview.rowCount)} />
                    <Metadata label="Columns" value={String(selectedSourcePreview.columns.length)} />
                  </div>
                  <p>{selectedSourcePreview.evidence}</p>
                  {selectedSourcePreview.rows.length > 0 ? (
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
                  ) : (
                    <div className="source-column-list">
                      {selectedSourcePreview.columns.slice(0, 8).map((column) => (
                        <span className="chip" key={column}>{column}</span>
                      ))}
                    </div>
                  )}
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
