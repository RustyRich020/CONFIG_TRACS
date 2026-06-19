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
PanelTop,
PlugZap,
Route,
ScrollText,
Search,
ServerCog,
Settings,
ShieldCheck,
SlidersHorizontal,
ToggleLeft,
ToggleRight,
TriangleAlert
} from 'lucide-react'
import { lazy,Suspense,useEffect,useMemo,useState } from 'react'
import './App.css'
import { backendClient } from './backendClient'
import { adapterContracts } from './backendContracts'
import { ConnectorGlyph,Metadata,PanelHeader,StatusChip } from './components/common'
import { loadAppConfig } from './configLoader'
import {
createAuditEvent,
createIntegrationContract,
downloadJson,
evaluateReadiness,
getDomainFamilies,
inferCsvSchema,
summarizeReadiness,
testAllConnectors,
testConnector,
validateMappingAgainstSchema
} from './foundation'
import type { GovernanceWorkflowInstance } from './governanceWorkflow'
import {
createWorkflowInstanceExportPackage
} from './governanceWorkflow'
import { createSavedVersion,loadSavedVersions,persistSavedVersions } from './persistence'
import type {
AdapterDryRunResult,
AppConfig,
AssetRegistry,
AuditEvent,
BackendHealth,
BackendRecord,
CanonicalLoadRequest,
CanonicalLoadResult,
CanonicalObject,
ClosurePackageAcknowledgementCloseoutExportPackage,
ClosurePackageAcknowledgementCloseoutExportPackageAcknowledgement,
ClosurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosure,
ClosurePackageAcknowledgementCloseoutNotificationClosure,
ClosurePackageAcknowledgementCloseoutNotificationClosurePackage,
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement,
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosure,
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement,
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence,
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgement,
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure,
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgement,
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure,
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgement,
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence,
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgement,
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence,
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement,
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure,
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgement,
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence,
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement,
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidence,
ClosureSlaDeliveryAcknowledgement,
ClosureSlaDeliveryAcknowledgementStatus,
ClosureSlaExportPackage,
ClosureSlaFollowUpClosureExportPackage,
ClosureSlaFollowUpClosurePackageAcknowledgement,
ClosureSlaFollowUpClosurePackageAcknowledgementClosure,
ClosureSlaResponseFollowUpClosure,
ClosureSlaResponseFollowUpClosureStatus,
ClosureSlaResponseFollowUpRoute,
ClosureSlaResponseFollowUpStatus,
ConnectorPreviewResult,
ConnectorSourceMetadata,
ConnectorTestResult,
ControlledTemplatePayload,
CredentialValidationResult,
CrossIndustryTemplatePackage,
CrossIndustryTemplatePackageApproval,
CrossIndustryTemplatePackageApprovalStatus,
CrossIndustryTemplatePackageDelivery,
CsvSchemaInference,
DeploymentState,
ExternalReferenceLoadExceptionDisposition,
ExternalReferenceLoadExceptionDispositionStatus,
ExtractionJobPayload,
ExtractionRunPayload,
LocalAsset,
MappingValidationResult,
NotificationApprovalRenewalClosure,
NotificationApprovalRenewalClosureStatus,
NotificationApprovalRenewalRoute,
NotificationClosureExportPackage,
NotificationDeliveryPayload,
NotificationDeliveryResult,
NotificationDeliveryRetryControl,
NotificationDeliveryRetryStatus,
NotificationLiveChannelApproval,
NotificationLiveChannelApprovalStatus,
NotificationRetryQueueAcknowledgement,
NotificationRetryQueueAcknowledgementClosurePackage,
NotificationRetryQueueAcknowledgementClosurePackageAcknowledgement,
NotificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosure,
NotificationRetryQueueAcknowledgementStatus,
NotificationRetryQueueExportPackage,
PostgresCutoverAcknowledgement,
PostgresCutoverAcknowledgementStatus,
PostgresCutoverApproval,
PostgresCutoverApprovalStatus,
PostgresCutoverChecklistPackage,
PostgresCutoverClosurePackage,
PostgresCutoverFinalHandoffAcknowledgement,
PostgresCutoverFinalHandoffAcknowledgementStatus,
PostgresCutoverFinalHandoffClosurePackage,
PostgresCutoverFinalHandoffClosurePackageAcknowledgement,
PostgresCutoverFinalHandoffClosurePackageAcknowledgementClosure,
PostgresCutoverOwnerReminder,
PostgresCutoverOwnerReminderStatus,
PostgresCutoverReminderClosure,
PostgresCutoverReminderClosureStatus,
PostgresImportReconciliation,
PostgresMigrationChecklist,
QualityEvent,
ReadinessCheck,
ReadinessEvidenceApproval,
ReadinessEvidenceApprovalStatus,
ReadinessEvidenceException,
ReadinessEvidenceExceptionDisposition,
ReadinessEvidenceExceptionDispositionStatus,
ReadinessEvidencePacket,
RecordStoreSchema,
ReportCatalogItem,
SavedVersion,
StatusLevel,
TraceabilityDeliveryResponse,
TraceabilityDeliveryResponseStatus,
TraceabilityExportRetentionClass,
TraceabilityExportReview,
TraceabilityExportReviewStatus,
TraceabilityGraphExportPackage,
TraceabilityLink,
TraceabilityResponseClosureRoute,
TraceabilityResponseClosureRouteStage,
TraceabilityResponseClosureRouteStatus,
WorkflowInstanceExportRetention
} from './types'
import { AuditPanel,ObjectFamiliesPanel } from './views/OverviewPanels'

const BackendPersistenceView = lazy(() =>
  import('./views/backend/BackendPersistenceView').then((module) => ({ default: module.BackendPersistenceView })),
)
const ReportCatalogView = lazy(() =>
  import('./views/ReportCatalogView').then((module) => ({ default: module.ReportCatalogView })),
)
const SavedVersionsView = lazy(() =>
  import('./views/SavedVersionsView').then((module) => ({ default: module.SavedVersionsView })),
)
const TemplatesView = lazy(() =>
  import('./views/TemplatesView').then((module) => ({ default: module.TemplatesView })),
)
const TraceabilityView = lazy(() =>
  import('./views/TraceabilityView').then((module) => ({ default: module.TraceabilityView })),
)

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


const statusIcon: Record<StatusLevel, typeof CheckCircle2> = {
  pass: CheckCircle2,
  warning: TriangleAlert,
  blocking: ShieldCheck,
}



function titleize(value?: string | null) {
  return (value ?? 'unknown')
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

function templatePackageApprovalStatusLevel(status: CrossIndustryTemplatePackageApprovalStatus): StatusLevel {
  if (status === 'rejected') return 'blocking'
  if (status === 'draft' || status === 'approved_with_conditions') return 'warning'
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

function closureSlaFollowUpClosureStatusLevel(status: ClosureSlaResponseFollowUpClosureStatus): StatusLevel {
  if (status === 'closed') return 'pass'
  if (status === 'rejected') return 'blocking'
  return 'warning'
}

function closureSlaFollowUpClosureLabel(status: ClosureSlaResponseFollowUpClosureStatus) {
  if (status === 'closed_with_actions') return 'Closed with actions'
  return titleize(status)
}

function notificationDeliveryRetryLabel(status: NotificationDeliveryRetryStatus) {
  if (status === 'planned') return 'Planned'
  if (status === 'executed') return 'Executed'
  return 'Blocked'
}

function notificationRetryQueueAcknowledgementStatusLevel(
  status: NotificationRetryQueueAcknowledgementStatus,
): StatusLevel {
  if (status === 'acknowledged') return 'pass'
  if (status === 'rejected') return 'blocking'
  return 'warning'
}

function notificationRetryQueueAcknowledgementLabel(status: NotificationRetryQueueAcknowledgementStatus) {
  if (status === 'acknowledged_with_actions') return 'Acknowledged with actions'
  if (status === 'changes_requested') return 'Changes requested'
  return titleize(status)
}

function addMinutesIso(startAt: string, minutes: number) {
  const startTime = Date.parse(startAt)
  if (!Number.isFinite(startTime)) return ''
  return new Date(startTime + minutes * 60_000).toISOString()
}

function deliverySourceLabel(source: NotificationDeliveryPayload['source']) {
  if (source === 'notification_closure_export_package') return 'Closure package'
  if (source === 'notification_retry_queue_export_package') return 'Retry queue package'
  if (source === 'notification_retry_queue_acknowledgement_closure_package') return 'Retry queue acknowledgement closure package'
  if (source === 'closure_package_acknowledgement_closeout_export_package') return 'Closeout export package'
  if (source === 'closure_package_acknowledgement_closeout_notification_closure_package') return 'Closeout notification closure package'
  if (source === 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package') return 'Closeout acknowledgement closeout package'
  if (source === 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_acknowledgement_final_evidence') return 'Closeout acknowledgement final evidence'
  if (source === 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement') return 'Closeout acknowledgement final evidence acknowledgement'
  if (source === 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure') return 'Closeout acknowledgement final acknowledgement closeout evidence'
  if (source === 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure') return 'Closeout acknowledgement final acknowledgement closure evidence'
  if (source === 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence') return 'Closeout acknowledgement final acknowledgement closure final evidence'
  if (source === 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence') return 'Closeout acknowledgement final acknowledgement closure final closeout evidence'
  if (source === 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure') return 'Closeout acknowledgement final acknowledgement closure final closeout acknowledgement closure evidence'
  if (source === 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence') return 'Closeout acknowledgement final acknowledgement closure final closeout acknowledgement closure closeout evidence'
  if (source === 'closure_sla_export_package') return 'Closure SLA package'
  if (source === 'closure_sla_response_follow_up') return 'Closure SLA follow-up'
  if (source === 'closure_sla_follow_up_closure_export_package') return 'Closure SLA follow-up closure package'
  if (source === 'postgres_cutover_acknowledgement') return 'Cutover acknowledgement'
  if (source === 'postgres_cutover_owner_reminder') return 'Cutover owner reminder'
  if (source === 'postgres_cutover_closure_package') return 'Cutover closure package'
  if (source === 'postgres_cutover_final_handoff_closure_package') return 'Final handoff closure package'
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

function postgresCutoverFinalHandoffAcknowledgementStatusLevel(
  status: PostgresCutoverFinalHandoffAcknowledgementStatus,
): StatusLevel {
  if (status === 'acknowledged') return 'pass'
  if (status === 'rejected') return 'blocking'
  return 'warning'
}

function postgresCutoverFinalHandoffAcknowledgementLabel(
  status: PostgresCutoverFinalHandoffAcknowledgementStatus,
) {
  if (status === 'acknowledged_with_actions') return 'Acknowledged with actions'
  if (status === 'changes_requested') return 'Changes requested'
  return titleize(status)
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

  async function saveTemplatePackageApproval({
    packagePayload,
    rationale,
    reviewer,
    status,
  }: {
    packagePayload: CrossIndustryTemplatePackage
    rationale: string
    reviewer: string
    status: CrossIndustryTemplatePackageApprovalStatus
  }) {
    const reviewedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Template Governance Reviewer'
    const approvalStatus = templatePackageApprovalStatusLevel(status)
    const payload: CrossIndustryTemplatePackageApproval = {
      approvalId: `cross_industry_template_package_approval:${packagePayload.packageId}:${reviewedAt}`,
      packageId: packagePayload.packageId,
      reviewedAt,
      reviewer: reviewerName,
      status,
      rationale: rationale.trim() || 'No approval rationale recorded.',
      package: packagePayload,
      auditHistory: [
        {
          action: 'reviewed_cross_industry_template_package',
          actor: reviewerName,
          timestamp: reviewedAt,
          status,
          summary: `${reviewerName} reviewed ${packagePayload.packageId} as ${titleize(status)}.`,
        },
      ],
      evidence: `${packagePayload.evidence} Reviewed by ${reviewerName} as ${titleize(status)}.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'cross_industry_template_package_approval',
      label: packagePayload.packageId,
      status: approvalStatus,
      summary: payload.evidence,
      payload,
      workflow: {
        metadataVersion: 'workflow_metadata_v1',
        workflowType: 'cross_industry_template_package',
        stage: 'package',
        owner: reviewerName,
      },
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'cross_industry_template_package_approval',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record('template', 'approve_package', `Template package approval saved as backend record v${saved.version}.`)
    return saved
  }

  async function saveTemplatePackageDelivery({
    approvalRecord,
    channel,
    packagePayload,
    recipients,
  }: {
    approvalRecord?: BackendRecord<CrossIndustryTemplatePackageApproval>
    channel: CrossIndustryTemplatePackageDelivery['channel']
    packagePayload: CrossIndustryTemplatePackage
    recipients: string[]
  }) {
    const deliveredAt = new Date().toISOString()
    const normalizedRecipients = recipients.map((recipient) => recipient.trim()).filter(Boolean)
    const payload: CrossIndustryTemplatePackageDelivery = {
      deliveryId: `cross_industry_template_package_delivery:${packagePayload.packageId}:${deliveredAt}`,
      packageId: packagePayload.packageId,
      approvalRecordId: approvalRecord?.id,
      deliveredAt,
      channel,
      recipients: normalizedRecipients.length > 0 ? normalizedRecipients : ['Template Owner'],
      status: approvalRecord?.status === 'blocking' ? 'blocked' : 'delivered',
      package: packagePayload,
      evidence: `${packagePayload.packageId} delivered to ${normalizedRecipients.length || 1} recipient(s) through ${titleize(channel)}${approvalRecord ? ` after approval record ${approvalRecord.id}` : ''}.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'cross_industry_template_package_delivery',
      label: packagePayload.packageId,
      status: payload.status === 'blocked' ? 'blocking' : 'pass',
      summary: payload.evidence,
      payload,
      workflow: {
        metadataVersion: 'workflow_metadata_v1',
        workflowType: 'cross_industry_template_package',
        stage: 'delivery',
        parentRecordId: approvalRecord?.id,
        owner: payload.recipients.join(', '),
      },
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'cross_industry_template_package_delivery',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record('template', 'deliver_package', `Template package delivery saved as backend record v${saved.version}.`)
    return saved
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

  async function saveWorkflowInstanceExportRetention({
    instance,
    retentionClass,
    reviewer,
  }: {
    instance: GovernanceWorkflowInstance
    retentionClass: TraceabilityExportRetentionClass
    reviewer: string
  }) {
    const retainedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const packagePayload = createWorkflowInstanceExportPackage(instance)
    const retainUntil = traceabilityRetentionUntil(retentionClass, retainedAt)
    const retentionLabel = traceabilityRetentionLabel(retentionClass)
    const status: StatusLevel = instance.missingParentRecordIds.length > 0 ? 'warning' : 'pass'
    const payload: WorkflowInstanceExportRetention = {
      retentionId: `workflow_instance_export_retention:${instance.instanceId}:${retainedAt}`,
      packageId: packagePayload.packageId,
      retainedAt,
      reviewer: reviewerName,
      workflowType: instance.workflowType,
      workflowLabel: instance.workflowLabel,
      rootRecordId: instance.rootRecordId,
      status,
      retention: {
        class: retentionClass,
        retainUntil,
        evidence:
          retainUntil === 'indefinite'
            ? `${retentionLabel} retention selected; retain until legal hold is released.`
            : `${retentionLabel} retention selected; retain until ${new Date(retainUntil).toLocaleDateString()}.`,
      },
      coverage: {
        records: instance.nodes.length,
        stages: instance.stages.length,
        missingParentReferences: instance.missingParentRecordIds.length,
      },
      package: packagePayload,
      auditHistory: [
        {
          action: 'retained_workflow_instance_export',
          actor: reviewerName,
          timestamp: retainedAt,
          status,
          summary: `${reviewerName} retained ${instance.workflowLabel} export package ${packagePayload.packageId}.`,
        },
      ],
      evidence: `${packagePayload.evidence} Retained by ${reviewerName}. ${retentionLabel} retention applied.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'workflow_instance_export_retention',
      label: instance.instanceId,
      status,
      summary: payload.evidence,
      payload,
      workflow: {
        metadataVersion: 'workflow_metadata_v1',
        workflowType: instance.workflowType,
        stage: 'final_evidence',
        parentRecordId: instance.rootRecordId,
        owner: reviewerName,
      },
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'workflow_instance_export_retention',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'backend',
      'retain_workflow_instance_export',
      `Workflow instance export retention saved as backend record v${saved.version}.`,
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

  async function saveNotificationRetryQueueAcknowledgement({
    deliveryRecord,
    queueClosureReady,
    requestedActions,
    responseNotes,
    reviewer,
    reviewerRole,
    status,
  }: {
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    queueClosureReady: boolean
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: NotificationRetryQueueAcknowledgement['reviewerRole']
    status: NotificationRetryQueueAcknowledgementStatus
  }) {
    const acknowledgedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Notification Operations Reviewer'
    const deliveryPackage = (deliveryRecord.payload.request.evidence as { package?: NotificationRetryQueueExportPackage })?.package
    const packageRecord = backendRecords.find(
      (record): record is BackendRecord<NotificationRetryQueueExportPackage> => {
        if (record.kind !== 'notification_retry_queue_export_package') return false
        return (record.payload as NotificationRetryQueueExportPackage).packageId === deliveryPackage?.packageId
      },
    )
    const sourceActions = deliveryPackage?.requiredActions ?? []
    const retainedActions = [...sourceActions, ...requestedActions]
      .map((action) => action.trim())
      .filter((action, index, actions) => action.length > 0 && actions.indexOf(action) === index)
    const channelSummary = deliveryRecord.payload.result.channelResults
      .map((result) => `${titleize(result.channel)} ${result.mode}/${result.status}`)
      .join(', ')
    const payload: NotificationRetryQueueAcknowledgement = {
      acknowledgementId: `notification_retry_queue_ack:${deliveryRecord.id}:${acknowledgedAt}`,
      acknowledgedAt,
      deliveryRecordId: deliveryRecord.id,
      deliveryId: deliveryRecord.payload.result.deliveryId,
      deliverySubject: deliveryRecord.payload.request.subject,
      packageRecordId: packageRecord?.id,
      packageId: deliveryPackage?.packageId,
      packageVersion: packageRecord?.version,
      reviewer: reviewerName,
      reviewerRole,
      status,
      responseNotes: responseNotes.trim() || 'No retry queue package response notes recorded.',
      requestedActions: retainedActions,
      channelSummary,
      packageStatus: deliveryPackage?.status,
      sourceMetrics: deliveryPackage?.metrics,
      sourceRequiredActions: sourceActions,
      sourceRetryRowCount: deliveryPackage?.rows.length ?? 0,
      queueClosureReady,
      auditHistory: [
        {
          action: 'retry_queue_package_acknowledged',
          actor: reviewerName,
          timestamp: acknowledgedAt,
          status,
          summary: `${reviewerName} recorded ${notificationRetryQueueAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}.`,
        },
      ],
      evidence: `${reviewerName} recorded ${notificationRetryQueueAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}. ${retainedActions.length} requested action(s) retained.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'notification_retry_queue_acknowledgement',
      label: deliveryRecord.payload.request.subject,
      status: notificationRetryQueueAcknowledgementStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'notification_retry_queue_acknowledgement',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'retry_queue_package_acknowledgement',
      `Notification retry queue package acknowledgement saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveNotificationRetryQueueAcknowledgementClosurePackage({
    download,
    packagePayload,
  }: {
    download: boolean
    packagePayload: NotificationRetryQueueAcknowledgementClosurePackage
  }) {
    const saved = await backendClient.saveRecord({
      kind: 'notification_retry_queue_acknowledgement_closure_package',
      label: 'Notification retry queue acknowledgement closure package',
      status: packagePayload.status,
      summary: packagePayload.evidence,
      payload: packagePayload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'notification_retry_queue_acknowledgement_closure_package',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    if (download) {
      downloadJson('tracs-notification-retry-queue-acknowledgement-closure-package.json', packagePayload)
    }
    record(
      'notification',
      download ? 'retry_queue_acknowledgement_closure_package_download' : 'retry_queue_acknowledgement_closure_package_save',
      `Notification retry queue acknowledgement closure package saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function deliverNotificationRetryQueueAcknowledgementClosurePackage({
    download,
    packagePayload,
  }: {
    download: boolean
    packagePayload: NotificationRetryQueueAcknowledgementClosurePackage
  }) {
    const saved = await saveNotificationRetryQueueAcknowledgementClosurePackage({ download, packagePayload })
    if (!saved) return
    await deliverNotifications(
      notificationToDeliveryPayload(
        'notification_retry_queue_acknowledgement_closure_package',
        'Notification retry queue acknowledgement closure package',
        {
          notificationId: saved.payload.packageId,
          recipients: saved.payload.closureReviewers,
          summary: `${saved.payload.closureReviewers.join(', ')} retry queue acknowledgement closure package includes ${saved.payload.metrics.totalAcknowledgements} acknowledgement record(s), ${saved.payload.metrics.retainedActions} retained action(s), ${saved.payload.deliveryEvidence.length} delivery evidence record(s), and ${saved.payload.requiredActions.length} required action(s).`,
          package: saved.payload,
        },
      ),
    )
  }

  async function saveNotificationRetryQueueAcknowledgementClosurePackageAcknowledgement({
    closureReady,
    deliveryRecord,
    requestedActions,
    responseNotes,
    reviewer,
    reviewerRole,
    status,
  }: {
    closureReady: boolean
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: NotificationRetryQueueAcknowledgementClosurePackageAcknowledgement['reviewerRole']
    status: NotificationRetryQueueAcknowledgementStatus
  }) {
    const acknowledgedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Notification Operations Reviewer'
    const deliveryPackage = (deliveryRecord.payload.request.evidence as {
      package?: NotificationRetryQueueAcknowledgementClosurePackage
    })?.package
    const packageRecord = backendRecords.find(
      (record): record is BackendRecord<NotificationRetryQueueAcknowledgementClosurePackage> => {
        if (record.kind !== 'notification_retry_queue_acknowledgement_closure_package') return false
        return (record.payload as NotificationRetryQueueAcknowledgementClosurePackage).packageId === deliveryPackage?.packageId
      },
    )
    const sourceActions = deliveryPackage?.requiredActions ?? []
    const retainedActions = [...sourceActions, ...requestedActions]
      .map((action) => action.trim())
      .filter((action, index, actions) => action.length > 0 && actions.indexOf(action) === index)
    const channelSummary = deliveryRecord.payload.result.channelResults
      .map((result) => `${titleize(result.channel)} ${result.mode}/${result.status}`)
      .join(', ')
    const payload: NotificationRetryQueueAcknowledgementClosurePackageAcknowledgement = {
      acknowledgementId: `notification_retry_queue_acknowledgement_closure_package_ack:${deliveryRecord.id}:${acknowledgedAt}`,
      acknowledgedAt,
      deliveryRecordId: deliveryRecord.id,
      deliveryId: deliveryRecord.payload.result.deliveryId,
      deliverySubject: deliveryRecord.payload.request.subject,
      packageRecordId: packageRecord?.id,
      packageId: deliveryPackage?.packageId,
      packageVersion: packageRecord?.version,
      reviewer: reviewerName,
      reviewerRole,
      status,
      closureReady,
      responseNotes: responseNotes.trim() || 'No retry queue acknowledgement closure package acknowledgement notes recorded.',
      requestedActions: retainedActions,
      channelSummary,
      packageStatus: deliveryPackage?.status,
      sourceMetrics: deliveryPackage?.metrics,
      sourceRequiredActions: sourceActions,
      sourceAcknowledgementCount: deliveryPackage?.acknowledgementRecords.length ?? 0,
      sourceRetryQueuePackageCount: deliveryPackage?.retryQueuePackages.length ?? 0,
      sourceDeliveryEvidenceCount: deliveryPackage?.deliveryEvidence.length ?? 0,
      auditHistory: [
        {
          action: 'retry_queue_acknowledgement_closure_package_acknowledged',
          actor: reviewerName,
          timestamp: acknowledgedAt,
          status,
          closureReady,
          summary: `${reviewerName} recorded ${notificationRetryQueueAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}.`,
        },
      ],
      evidence: `${reviewerName} recorded ${notificationRetryQueueAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}. ${retainedActions.length} requested action(s) retained.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'notification_retry_queue_acknowledgement_closure_package_acknowledgement',
      label: deliveryRecord.payload.request.subject,
      status: notificationRetryQueueAcknowledgementStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'notification_retry_queue_acknowledgement_closure_package_acknowledgement',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'retry_queue_acknowledgement_closure_package_acknowledgement',
      `Notification retry queue acknowledgement closure package acknowledgement saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveNotificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosure({
    closureNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    status: PostgresCutoverReminderClosureStatus
    supersededEvidence: string[]
  }) {
    const closedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Notification Operations Reviewer'
    const acknowledgementRecords = backendRecords.filter(
      (record): record is BackendRecord<NotificationRetryQueueAcknowledgementClosurePackageAcknowledgement> =>
        record.kind === 'notification_retry_queue_acknowledgement_closure_package_acknowledgement',
    )
    const closurePackages = backendRecords.filter(
      (record): record is BackendRecord<NotificationRetryQueueAcknowledgementClosurePackage> =>
        record.kind === 'notification_retry_queue_acknowledgement_closure_package',
    )
    const deliveryEvidence = backendRecords.filter(
      (record): record is BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }> => {
        if (record.kind !== 'notification_delivery') return false
        const payload = record.payload as { request?: NotificationDeliveryPayload }
        return payload.request?.source === 'notification_retry_queue_acknowledgement_closure_package'
      },
    )
    const metrics = acknowledgementRecords.reduce(
      (summary, record) => {
        summary.totalAcknowledgements += 1
        if (record.payload.status === 'acknowledged') summary.acknowledged += 1
        if (record.payload.status === 'acknowledged_with_actions') summary.acknowledgedWithActions += 1
        if (record.payload.status === 'changes_requested') summary.changesRequested += 1
        if (record.payload.status === 'rejected') summary.rejected += 1
        if (record.payload.closureReady) summary.closureReady += 1
        summary.retainedActions += record.payload.requestedActions.length
        return summary
      },
      {
        totalAcknowledgements: 0,
        acknowledged: 0,
        acknowledgedWithActions: 0,
        changesRequested: 0,
        rejected: 0,
        closureReady: 0,
        retainedActions: 0,
      },
    )
    const sourceActions = acknowledgementRecords.flatMap((record) => record.payload.requestedActions)
    const actions = [...sourceActions, ...retainedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const supersededAcknowledgements = acknowledgementRecords.slice(1).map((record) => ({
      acknowledgementId: record.payload.acknowledgementId,
      reviewer: record.payload.reviewer,
      reviewerRole: record.payload.reviewerRole,
      status: record.payload.status,
      acknowledgedAt: record.payload.acknowledgedAt,
      evidence: record.payload.evidence,
    }))
    const payload: NotificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosure = {
      closureId: `notification_retry_queue_acknowledgement_closure_package_ack_closure:${closedAt}`,
      closedAt,
      reviewer: reviewerName,
      status,
      acknowledgementRecords,
      closurePackages,
      deliveryEvidence,
      metrics,
      retainedActions: actions,
      closureNotes: closureNotes.trim() || 'No retry queue acknowledgement closure package acknowledgement closeout notes recorded.',
      supersededEvidence,
      supersededAcknowledgements,
      sourceRecordCounts: {
        acknowledgementRecords: acknowledgementRecords.length,
        closurePackages: closurePackages.length,
        deliveryRecords: deliveryEvidence.length,
        supersededAcknowledgements: supersededAcknowledgements.length,
      },
      auditHistory: [
        {
          action: 'retry_queue_acknowledgement_closure_package_acknowledgement_closed',
          actor: reviewerName,
          timestamp: closedAt,
          status,
          summary: `${reviewerName} recorded ${postgresCutoverReminderClosureLabel(status)} closeout for retry queue acknowledgement closure package acknowledgements.`,
        },
      ],
      evidence: `${reviewerName} recorded ${postgresCutoverReminderClosureLabel(status)} closeout for ${acknowledgementRecords.length} retry queue acknowledgement closure package acknowledgement record(s) with ${actions.length} retained action(s) and ${supersededEvidence.length} superseded evidence note(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'notification_retry_queue_acknowledgement_closure_package_acknowledgement_closure',
      label: 'Retry queue acknowledgement closure package acknowledgement closeout',
      status: postgresCutoverReminderClosureStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'notification_retry_queue_acknowledgement_closure_package_acknowledgement_closure',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'retry_queue_acknowledgement_closure_package_acknowledgement_closure',
      `Notification retry queue acknowledgement closure package acknowledgement closeout saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveClosurePackageAcknowledgementCloseoutExportPackage({
    download,
    packagePayload,
  }: {
    download: boolean
    packagePayload: ClosurePackageAcknowledgementCloseoutExportPackage
  }) {
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_export_package',
      label: 'Closure package acknowledgement closeout export package',
      status: packagePayload.status,
      summary: packagePayload.evidence,
      payload: packagePayload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_export_package',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    if (download) {
      downloadJson('tracs-closure-package-acknowledgement-closeout-export-package.json', packagePayload)
    }
    record(
      'notification',
      download
        ? 'closure_package_acknowledgement_closeout_export_download'
        : 'closure_package_acknowledgement_closeout_export_save',
      `Closure package acknowledgement closeout export package saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function deliverClosurePackageAcknowledgementCloseoutExportPackage({
    download,
    packagePayload,
  }: {
    download: boolean
    packagePayload: ClosurePackageAcknowledgementCloseoutExportPackage
  }) {
    const saved = await saveClosurePackageAcknowledgementCloseoutExportPackage({ download, packagePayload })
    if (!saved) return
    await deliverNotifications(
      notificationToDeliveryPayload(
        'closure_package_acknowledgement_closeout_export_package',
        'Closure package acknowledgement closeout export package',
        {
          notificationId: saved.payload.packageId,
          recipients: saved.payload.governanceReviewers,
          summary: `${saved.payload.governanceReviewers.join(', ')} closeout export package includes ${saved.payload.metrics.totalCloseouts} closeout record(s), ${saved.payload.metrics.retainedActions} retained action(s), ${saved.payload.metrics.deliveryEvidenceRecords} delivery evidence record(s), and ${saved.payload.requiredActions.length} required action(s).`,
          package: saved.payload,
        },
      ),
    )
  }

  async function saveClosurePackageAcknowledgementCloseoutExportPackageAcknowledgement({
    closeoutReady,
    deliveryRecord,
    requestedActions,
    responseNotes,
    reviewer,
    reviewerRole,
    status,
  }: {
    closeoutReady: boolean
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: ClosurePackageAcknowledgementCloseoutExportPackageAcknowledgement['reviewerRole']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) {
    const acknowledgedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const deliveryPackage = (deliveryRecord.payload.request.evidence as {
      package?: ClosurePackageAcknowledgementCloseoutExportPackage
    })?.package
    const packageRecord = backendRecords.find(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutExportPackage> => {
        if (record.kind !== 'closure_package_acknowledgement_closeout_export_package') return false
        return (record.payload as ClosurePackageAcknowledgementCloseoutExportPackage).packageId === deliveryPackage?.packageId
      },
    )
    const sourceActions = deliveryPackage?.requiredActions ?? []
    const retainedActions = [...sourceActions, ...requestedActions]
      .map((action) => action.trim())
      .filter((action, index, actions) => action.length > 0 && actions.indexOf(action) === index)
    const channelSummary = deliveryRecord.payload.result.channelResults
      .map((result) => `${titleize(result.channel)} ${result.mode}/${result.status}`)
      .join(', ')
    const payload: ClosurePackageAcknowledgementCloseoutExportPackageAcknowledgement = {
      acknowledgementId: `closure_package_acknowledgement_closeout_export_ack:${deliveryRecord.id}:${acknowledgedAt}`,
      acknowledgedAt,
      deliveryRecordId: deliveryRecord.id,
      deliveryId: deliveryRecord.payload.result.deliveryId,
      deliverySubject: deliveryRecord.payload.request.subject,
      packageRecordId: packageRecord?.id,
      packageId: deliveryPackage?.packageId,
      packageVersion: packageRecord?.version,
      reviewer: reviewerName,
      reviewerRole,
      status,
      closeoutReady,
      responseNotes: responseNotes.trim() || 'No closeout export package acknowledgement notes recorded.',
      requestedActions: retainedActions,
      channelSummary,
      packageStatus: deliveryPackage?.status,
      sourceMetrics: deliveryPackage?.metrics,
      sourceRequiredActions: sourceActions,
      sourceCloseoutCount: deliveryPackage?.metrics.totalCloseouts ?? 0,
      sourceDeliveryEvidenceCount: deliveryPackage?.metrics.deliveryEvidenceRecords ?? 0,
      auditHistory: [
        {
          action: 'closure_package_acknowledgement_closeout_export_acknowledged',
          actor: reviewerName,
          timestamp: acknowledgedAt,
          status,
          closeoutReady,
          summary: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}. ${retainedActions.length} requested action(s) retained.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_export_package_acknowledgement',
      label: deliveryRecord.payload.request.subject,
      status: closureSlaDeliveryAcknowledgementStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_export_package_acknowledgement',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_package_acknowledgement_closeout_export_acknowledgement',
      `Closure package acknowledgement closeout export package acknowledgement saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveClosurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosure({
    closureNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) {
    const closedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const acknowledgementRecords = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutExportPackageAcknowledgement> =>
        record.kind === 'closure_package_acknowledgement_closeout_export_package_acknowledgement',
    )
    const exportPackages = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutExportPackage> =>
        record.kind === 'closure_package_acknowledgement_closeout_export_package',
    )
    const deliveryEvidence = backendRecords.filter(
      (record): record is BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }> => {
        if (record.kind !== 'notification_delivery') return false
        const payload = record.payload as { request?: NotificationDeliveryPayload }
        return payload.request?.source === 'closure_package_acknowledgement_closeout_export_package'
      },
    )
    const metrics = acknowledgementRecords.reduce(
      (summary, record) => {
        summary.totalAcknowledgements += 1
        if (record.payload.status === 'acknowledged') summary.acknowledged += 1
        if (record.payload.status === 'approved') summary.approved += 1
        if (record.payload.status === 'changes_requested') summary.changesRequested += 1
        if (record.payload.status === 'rejected') summary.rejected += 1
        if (record.payload.closeoutReady) summary.closeoutReady += 1
        summary.retainedActions += record.payload.requestedActions.length
        return summary
      },
      {
        totalAcknowledgements: 0,
        acknowledged: 0,
        approved: 0,
        changesRequested: 0,
        rejected: 0,
        closeoutReady: 0,
        retainedActions: 0,
      },
    )
    const sourceActions = acknowledgementRecords.flatMap((record) => record.payload.requestedActions)
    const actions = [...sourceActions, ...retainedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const supersededAcknowledgements = acknowledgementRecords.slice(1).map((record) => ({
      acknowledgementId: record.payload.acknowledgementId,
      reviewer: record.payload.reviewer,
      reviewerRole: record.payload.reviewerRole,
      status: record.payload.status,
      acknowledgedAt: record.payload.acknowledgedAt,
      evidence: record.payload.evidence,
    }))
    const payload: ClosurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosure = {
      closureId: `closure_package_acknowledgement_closeout_export_ack_closure:${closedAt}`,
      closedAt,
      reviewer: reviewerName,
      status,
      acknowledgementRecords,
      exportPackages,
      deliveryEvidence,
      metrics,
      retainedActions: actions,
      closureNotes: closureNotes.trim() || 'No closeout export package acknowledgement closure notes recorded.',
      supersededEvidence,
      supersededAcknowledgements,
      sourceRecordCounts: {
        acknowledgementRecords: acknowledgementRecords.length,
        exportPackages: exportPackages.length,
        deliveryRecords: deliveryEvidence.length,
        supersededAcknowledgements: supersededAcknowledgements.length,
      },
      auditHistory: [
        {
          action: 'closure_package_acknowledgement_closeout_export_acknowledgement_closed',
          actor: reviewerName,
          timestamp: closedAt,
          status,
          summary: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} for closeout export package acknowledgements.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} for ${acknowledgementRecords.length} closeout export package acknowledgement record(s) with ${actions.length} retained action(s) and ${supersededEvidence.length} superseded evidence note(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_export_package_acknowledgement_closure',
      label: 'Closeout export package acknowledgement closure',
      status: closureSlaFollowUpClosureStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_export_package_acknowledgement_closure',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_package_acknowledgement_closeout_export_acknowledgement_closure',
      `Closeout export package acknowledgement closure saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosure({
    closureNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) {
    const closedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const exportPackages = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutExportPackage> =>
        record.kind === 'closure_package_acknowledgement_closeout_export_package',
    )
    const deliveryEvidence = backendRecords.filter(
      (record): record is BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }> => {
        if (record.kind !== 'notification_delivery') return false
        const payload = record.payload as { request?: NotificationDeliveryPayload }
        return payload.request?.source === 'closure_package_acknowledgement_closeout_export_package'
      },
    )
    const acknowledgementRecords = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutExportPackageAcknowledgement> =>
        record.kind === 'closure_package_acknowledgement_closeout_export_package_acknowledgement',
    )
    const acknowledgementClosures = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosure> =>
        record.kind === 'closure_package_acknowledgement_closeout_export_package_acknowledgement_closure',
    )
    const retryControls = backendRecords.filter(
      (record): record is BackendRecord<NotificationDeliveryRetryControl> => {
        if (record.kind !== 'notification_delivery_retry') return false
        return (record as BackendRecord<NotificationDeliveryRetryControl>).payload.source ===
          'closure_package_acknowledgement_closeout_export_package'
      },
    )
    const sourceActions = [
      ...exportPackages.flatMap((record) => record.payload.requiredActions),
      ...acknowledgementRecords.flatMap((record) => record.payload.requestedActions),
      ...acknowledgementClosures.flatMap((record) => record.payload.retainedActions),
    ]
    const actions = [...sourceActions, ...retainedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const metrics = {
      exportPackages: exportPackages.length,
      deliveryRecords: deliveryEvidence.length,
      acknowledgementRecords: acknowledgementRecords.length,
      acknowledgementClosures: acknowledgementClosures.length,
      retryControls: retryControls.length,
      retainedActions: actions.length,
      rejectedAcknowledgements: acknowledgementRecords.filter((record) => record.payload.status === 'rejected').length,
      changesRequested: acknowledgementRecords.filter((record) => record.payload.status === 'changes_requested').length,
      readyAcknowledgements: acknowledgementRecords.filter((record) => record.payload.closeoutReady).length,
      closedAcknowledgementClosures: acknowledgementClosures.filter((record) => record.payload.status === 'closed').length,
      closedWithActions: acknowledgementClosures.filter((record) => record.payload.status === 'closed_with_actions').length,
    }
    const payload: ClosurePackageAcknowledgementCloseoutNotificationClosure = {
      closureId: `closure_package_acknowledgement_closeout_notification_closure:${closedAt}`,
      closedAt,
      reviewer: reviewerName,
      status,
      exportPackages,
      deliveryEvidence,
      acknowledgementRecords,
      acknowledgementClosures,
      retryControls,
      metrics,
      retainedActions: actions,
      closureNotes: closureNotes.trim() || 'No closeout package notification closure notes recorded.',
      supersededEvidence,
      sourceRecordCounts: {
        exportPackages: exportPackages.length,
        deliveryRecords: deliveryEvidence.length,
        acknowledgementRecords: acknowledgementRecords.length,
        acknowledgementClosures: acknowledgementClosures.length,
        retryControls: retryControls.length,
      },
      auditHistory: [
        {
          action: 'closure_package_acknowledgement_closeout_notification_closed',
          actor: reviewerName,
          timestamp: closedAt,
          status,
          summary: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} for closeout package notification records.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} for closeout package notification records with ${exportPackages.length} export package(s), ${deliveryEvidence.length} delivery record(s), ${acknowledgementRecords.length} acknowledgement record(s), ${acknowledgementClosures.length} acknowledgement closure(s), and ${actions.length} retained action(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure',
      label: 'Closeout package notification closure',
      status: closureSlaFollowUpClosureStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_package_acknowledgement_closeout_notification_closure',
      `Closeout package notification closure saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosurePackage({
    download,
    packagePayload,
  }: {
    download: boolean
    packagePayload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackage
  }) {
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure_package',
      label: 'Closeout acknowledgement closure package',
      status: packagePayload.status,
      summary: packagePayload.evidence,
      payload: packagePayload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure_package',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    if (download) {
      downloadJson('tracs-closeout-acknowledgement-closure-package.json', packagePayload)
    }
    record(
      'notification',
      download
        ? 'closure_package_acknowledgement_closeout_notification_closure_package_download'
        : 'closure_package_acknowledgement_closeout_notification_closure_package_save',
      `Closeout acknowledgement closure package saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function deliverClosurePackageAcknowledgementCloseoutNotificationClosurePackage({
    download,
    packagePayload,
  }: {
    download: boolean
    packagePayload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackage
  }) {
    const saved = await saveClosurePackageAcknowledgementCloseoutNotificationClosurePackage({ download, packagePayload })
    if (!saved) return
    await deliverNotifications(
      notificationToDeliveryPayload(
        'closure_package_acknowledgement_closeout_notification_closure_package',
        'Closeout acknowledgement closure package',
        {
          notificationId: saved.payload.packageId,
          recipients: saved.payload.closureReviewers,
          summary: `${saved.payload.closureReviewers.join(', ')} closeout acknowledgement closure package includes ${saved.payload.metrics.notificationClosures} notification closure record(s), ${saved.payload.metrics.retainedActions} retained action(s), ${saved.payload.metrics.deliveryRecords} delivery evidence record(s), and ${saved.payload.requiredActions.length} required action(s).`,
          package: saved.payload,
        },
      ),
    )
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement({
    closureReady,
    deliveryRecord,
    requestedActions,
    responseNotes,
    reviewer,
    reviewerRole,
    status,
  }: {
    closureReady: boolean
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement['reviewerRole']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) {
    const acknowledgedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const deliveryPackage = (deliveryRecord.payload.request.evidence as {
      package?: ClosurePackageAcknowledgementCloseoutNotificationClosurePackage
    })?.package
    const packageRecord = backendRecords.find(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackage> => {
        if (record.kind !== 'closure_package_acknowledgement_closeout_notification_closure_package') return false
        return (record.payload as ClosurePackageAcknowledgementCloseoutNotificationClosurePackage).packageId ===
          deliveryPackage?.packageId
      },
    )
    const sourceActions = deliveryPackage?.requiredActions ?? []
    const retainedActions = [...sourceActions, ...requestedActions]
      .map((action) => action.trim())
      .filter((action, index, actions) => action.length > 0 && actions.indexOf(action) === index)
    const channelSummary = deliveryRecord.payload.result.channelResults
      .map((result) => `${titleize(result.channel)} ${result.mode}/${result.status}`)
      .join(', ')
    const payload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement = {
      acknowledgementId: `closure_package_acknowledgement_closeout_notification_closure_package_ack:${deliveryRecord.id}:${acknowledgedAt}`,
      acknowledgedAt,
      deliveryRecordId: deliveryRecord.id,
      deliveryId: deliveryRecord.payload.result.deliveryId,
      deliverySubject: deliveryRecord.payload.request.subject,
      packageRecordId: packageRecord?.id,
      packageId: deliveryPackage?.packageId,
      packageVersion: packageRecord?.version,
      reviewer: reviewerName,
      reviewerRole,
      status,
      closureReady,
      responseNotes:
        responseNotes.trim() || 'No closeout acknowledgement closure package acknowledgement notes recorded.',
      requestedActions: retainedActions,
      channelSummary,
      packageStatus: deliveryPackage?.status,
      sourceMetrics: deliveryPackage?.metrics,
      sourceRequiredActions: sourceActions,
      sourceNotificationClosureCount: deliveryPackage?.notificationClosureRecords.length ?? 0,
      sourceDeliveryEvidenceCount: deliveryPackage?.deliveryEvidence.length ?? 0,
      sourceRetryControlCount: deliveryPackage?.retryControls.length ?? 0,
      auditHistory: [
        {
          action: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledged',
          actor: reviewerName,
          timestamp: acknowledgedAt,
          status,
          closureReady,
          summary: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}. ${retainedActions.length} requested action(s) retained.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement',
      label: deliveryRecord.payload.request.subject,
      status: closureSlaDeliveryAcknowledgementStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement',
      `Closeout acknowledgement closure package acknowledgement saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosure({
    closureNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) {
    const closedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const acknowledgementRecords = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement> =>
        record.kind === 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement',
    )
    const closurePackages = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackage> =>
        record.kind === 'closure_package_acknowledgement_closeout_notification_closure_package',
    )
    const deliveryEvidence = backendRecords.filter(
      (record): record is BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }> => {
        if (record.kind !== 'notification_delivery') return false
        const payload = record.payload as { request?: NotificationDeliveryPayload }
        return payload.request?.source === 'closure_package_acknowledgement_closeout_notification_closure_package'
      },
    )
    const metrics = acknowledgementRecords.reduce(
      (summary, record) => {
        summary.totalAcknowledgements += 1
        if (record.payload.status === 'acknowledged') summary.acknowledged += 1
        if (record.payload.status === 'approved') summary.approved += 1
        if (record.payload.status === 'changes_requested') summary.changesRequested += 1
        if (record.payload.status === 'rejected') summary.rejected += 1
        if (record.payload.closureReady) summary.closureReady += 1
        summary.retainedActions += record.payload.requestedActions.length
        return summary
      },
      {
        totalAcknowledgements: 0,
        acknowledged: 0,
        approved: 0,
        changesRequested: 0,
        rejected: 0,
        closureReady: 0,
        retainedActions: 0,
      },
    )
    const sourceActions = acknowledgementRecords.flatMap((record) => record.payload.requestedActions)
    const actions = [...sourceActions, ...retainedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const supersededAcknowledgements = acknowledgementRecords.slice(1).map((record) => ({
      acknowledgementId: record.payload.acknowledgementId,
      reviewer: record.payload.reviewer,
      reviewerRole: record.payload.reviewerRole,
      status: record.payload.status,
      acknowledgedAt: record.payload.acknowledgedAt,
      evidence: record.payload.evidence,
    }))
    const payload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosure = {
      closureId: `closure_package_acknowledgement_closeout_notification_closure_package_ack_closure:${closedAt}`,
      closedAt,
      reviewer: reviewerName,
      status,
      acknowledgementRecords,
      closurePackages,
      deliveryEvidence,
      metrics,
      retainedActions: actions,
      closureNotes:
        closureNotes.trim() ||
        'No closeout acknowledgement closure package acknowledgement closeout notes recorded.',
      supersededEvidence,
      supersededAcknowledgements,
      sourceRecordCounts: {
        acknowledgementRecords: acknowledgementRecords.length,
        closurePackages: closurePackages.length,
        deliveryRecords: deliveryEvidence.length,
        supersededAcknowledgements: supersededAcknowledgements.length,
      },
      auditHistory: [
        {
          action: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closed',
          actor: reviewerName,
          timestamp: closedAt,
          status,
          summary: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} for closeout acknowledgement closure package acknowledgements.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} for ${acknowledgementRecords.length} closeout acknowledgement closure package acknowledgement record(s) with ${actions.length} retained action(s) and ${supersededEvidence.length} superseded evidence note(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure',
      label: 'Closeout acknowledgement closure package acknowledgement closeout',
      status: closureSlaFollowUpClosureStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure',
      `Closeout acknowledgement closure package acknowledgement closeout saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage({
    download,
    packagePayload,
  }: {
    download: boolean
    packagePayload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage
  }) {
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package',
      label: 'Closeout acknowledgement closeout package',
      status: packagePayload.status,
      summary: packagePayload.evidence,
      payload: packagePayload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    if (download) {
      downloadJson('tracs-closeout-acknowledgement-closeout-package.json', packagePayload)
    }
    record(
      'notification',
      download
        ? 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_download'
        : 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_save',
      `Closeout acknowledgement closeout package saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function deliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage({
    download,
    packagePayload,
  }: {
    download: boolean
    packagePayload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage
  }) {
    const saved =
      await saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage({
        download,
        packagePayload,
      })
    if (!saved) return
    await deliverNotifications(
      notificationToDeliveryPayload(
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package',
        'Closeout acknowledgement closeout package',
        {
          notificationId: saved.payload.packageId,
          recipients: saved.payload.closeoutReviewers,
          summary: `${saved.payload.closeoutReviewers.join(', ')} closeout acknowledgement closeout package includes ${saved.payload.metrics.closeoutRecords} acknowledgement closeout record(s), ${saved.payload.metrics.retainedActions} retained action(s), ${saved.payload.metrics.deliveryRecords} delivery evidence record(s), and ${saved.payload.requiredActions.length} required action(s).`,
          package: saved.payload,
        },
      ),
    )
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement({
    deliveryRecord,
    finalEvidenceReady,
    requestedActions,
    responseNotes,
    reviewer,
    reviewerRole,
    status,
  }: {
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    finalEvidenceReady: boolean
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement['reviewerRole']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) {
    const acknowledgedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const deliveryPackage = (deliveryRecord.payload.request.evidence as {
      package?: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage
    })?.package
    const packageRecord = backendRecords.find(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage> => {
        if (
          record.kind !==
          'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package'
        ) {
          return false
        }
        return (
          (record.payload as ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage)
            .packageId === deliveryPackage?.packageId
        )
      },
    )
    const sourceActions = deliveryPackage?.requiredActions ?? []
    const retainedActions = [...sourceActions, ...requestedActions]
      .map((action) => action.trim())
      .filter((action, index, actions) => action.length > 0 && actions.indexOf(action) === index)
    const channelSummary = deliveryRecord.payload.result.channelResults
      .map((result) => `${titleize(result.channel)} ${result.mode}/${result.status}`)
      .join(', ')
    const payload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement = {
      acknowledgementId: `closure_package_acknowledgement_closeout_notification_closure_package_ack_closure_package_ack:${deliveryRecord.id}:${acknowledgedAt}`,
      acknowledgedAt,
      deliveryRecordId: deliveryRecord.id,
      deliveryId: deliveryRecord.payload.result.deliveryId,
      deliverySubject: deliveryRecord.payload.request.subject,
      packageRecordId: packageRecord?.id,
      packageId: deliveryPackage?.packageId,
      packageVersion: packageRecord?.version,
      reviewer: reviewerName,
      reviewerRole,
      status,
      finalEvidenceReady,
      responseNotes:
        responseNotes.trim() || 'No closeout acknowledgement closeout package acknowledgement notes recorded.',
      requestedActions: retainedActions,
      channelSummary,
      packageStatus: deliveryPackage?.status,
      sourceMetrics: deliveryPackage?.metrics,
      sourceRequiredActions: sourceActions,
      sourceCloseoutRecordCount: deliveryPackage?.acknowledgementCloseoutRecords.length ?? 0,
      sourceDeliveryEvidenceCount: deliveryPackage?.deliveryEvidence.length ?? 0,
      sourceSupersededEvidenceCount: deliveryPackage?.metrics.supersededEvidence ?? 0,
      auditHistory: [
        {
          action:
            'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_acknowledged',
          actor: reviewerName,
          timestamp: acknowledgedAt,
          status,
          finalEvidenceReady,
          summary: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}. ${retainedActions.length} requested action(s) retained.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_acknowledgement',
      label: deliveryRecord.payload.request.subject,
      status: closureSlaDeliveryAcknowledgementStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_acknowledgement',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_acknowledgement',
      `Closeout acknowledgement closeout package acknowledgement saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence({
    download = false,
    finalEvidenceNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    download?: boolean
    finalEvidenceNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) {
    const finalizedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const acknowledgementRecords = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement> =>
        record.kind ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_acknowledgement',
    )
    const closeoutPackages = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage> =>
        record.kind ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package',
    )
    const deliveryEvidence = backendRecords.filter(
      (record): record is BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }> => {
        if (record.kind !== 'notification_delivery') return false
        const payload = record.payload as { request?: NotificationDeliveryPayload }
        return (
          payload.request?.source ===
          'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package'
        )
      },
    )
    const metrics = acknowledgementRecords.reduce(
      (summary, record) => {
        summary.totalAcknowledgements += 1
        if (record.payload.status === 'acknowledged') summary.acknowledged += 1
        if (record.payload.status === 'approved') summary.approved += 1
        if (record.payload.status === 'changes_requested') summary.changesRequested += 1
        if (record.payload.status === 'rejected') summary.rejected += 1
        if (record.payload.finalEvidenceReady) summary.finalEvidenceReady += 1
        summary.retainedActions += record.payload.requestedActions.length
        return summary
      },
      {
        totalAcknowledgements: 0,
        acknowledged: 0,
        approved: 0,
        changesRequested: 0,
        rejected: 0,
        finalEvidenceReady: 0,
        retainedActions: 0,
        packageRecords: closeoutPackages.length,
        deliveryRecords: deliveryEvidence.length,
      },
    )
    const sourceActions = acknowledgementRecords.flatMap((record) => record.payload.requestedActions)
    const actions = [...sourceActions, ...retainedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const supersededAcknowledgements = acknowledgementRecords.slice(1).map((record) => ({
      acknowledgementId: record.payload.acknowledgementId,
      reviewer: record.payload.reviewer,
      reviewerRole: record.payload.reviewerRole,
      status: record.payload.status,
      acknowledgedAt: record.payload.acknowledgedAt,
      evidence: record.payload.evidence,
    }))
    const payload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence = {
      evidenceId: `closure_package_acknowledgement_closeout_notification_closure_package_ack_closure_package_final_evidence:${finalizedAt}`,
      finalizedAt,
      reviewer: reviewerName,
      status,
      acknowledgementRecords,
      closeoutPackages,
      deliveryEvidence,
      metrics,
      retainedActions: actions,
      finalEvidenceNotes:
        finalEvidenceNotes.trim() ||
        'No closeout acknowledgement closeout package final evidence notes recorded.',
      supersededEvidence,
      supersededAcknowledgements,
      sourceRecordCounts: {
        acknowledgementRecords: acknowledgementRecords.length,
        closeoutPackages: closeoutPackages.length,
        deliveryRecords: deliveryEvidence.length,
        supersededAcknowledgements: supersededAcknowledgements.length,
      },
      auditHistory: [
        {
          action:
            'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_acknowledgement_finalized',
          actor: reviewerName,
          timestamp: finalizedAt,
          status,
          summary: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} final evidence for closeout acknowledgement closeout package acknowledgements.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} final evidence for ${acknowledgementRecords.length} closeout acknowledgement closeout package acknowledgement record(s) with ${actions.length} retained action(s) and ${supersededEvidence.length} superseded evidence note(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_acknowledgement_final_evidence',
      label: 'Closeout acknowledgement closeout final evidence',
      status: closureSlaFollowUpClosureStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_acknowledgement_final_evidence',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    if (download) {
      downloadJson('tracs-closeout-acknowledgement-final-evidence.json', payload)
    }
    record(
      'notification',
      download
        ? 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_acknowledgement_final_evidence_download'
        : 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_acknowledgement_final_evidence',
      `Closeout acknowledgement closeout final evidence saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function deliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence({
    download,
    finalEvidenceNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    download: boolean
    finalEvidenceNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) {
    const saved =
      await saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence({
        download,
        finalEvidenceNotes,
        retainedActions,
        reviewer,
        status,
        supersededEvidence,
      })
    if (!saved) return
    const recipients = [
      saved.payload.reviewer,
      ...saved.payload.acknowledgementRecords.map((record) => record.payload.reviewer),
      ...saved.payload.closeoutPackages.flatMap((record) => record.payload.closeoutReviewers),
    ]
      .map((recipient) => recipient.trim())
      .filter((recipient, index, values) => recipient.length > 0 && values.indexOf(recipient) === index)
    await deliverNotifications(
      notificationToDeliveryPayload(
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_acknowledgement_final_evidence',
        'Closeout acknowledgement closeout final evidence',
        {
          notificationId: saved.payload.evidenceId,
          recipients,
          summary: `${saved.payload.reviewer} finalized ${saved.payload.metrics.totalAcknowledgements} closeout acknowledgement closeout package acknowledgement record(s), ${saved.payload.metrics.retainedActions} retained action(s), and ${saved.payload.supersededEvidence.length} superseded evidence note(s).`,
          package: saved.payload,
        },
      ),
    )
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgement({
    closeoutReady,
    deliveryRecord,
    requestedActions,
    responseNotes,
    reviewer,
    reviewerRole,
    status,
  }: {
    closeoutReady: boolean
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgement['reviewerRole']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) {
    const acknowledgedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const deliveryEvidence = (
      deliveryRecord.payload.request.evidence as {
        package?: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence
      }
    )?.package
    const finalEvidenceRecord = backendRecords.find(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence> =>
        record.kind ===
          'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_acknowledgement_final_evidence' &&
        (record.payload as ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence)
          .evidenceId === deliveryEvidence?.evidenceId,
    )
    const sourceActions = deliveryEvidence?.retainedActions ?? []
    const retainedActions = [...sourceActions, ...requestedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const channelSummary = deliveryRecord.payload.result.channelResults
      .map((channel) => `${titleize(channel.channel)} ${channel.mode}/${channel.status}`)
      .join(', ')
    const payload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgement = {
      acknowledgementId: `closure_package_acknowledgement_closeout_notification_closure_package_final_evidence_ack:${deliveryRecord.id}:${acknowledgedAt}`,
      acknowledgedAt,
      deliveryRecordId: deliveryRecord.id,
      deliveryId: deliveryRecord.payload.request.deliveryId,
      deliverySubject: deliveryRecord.payload.request.subject,
      finalEvidenceRecordId: finalEvidenceRecord?.id,
      evidenceId: deliveryEvidence?.evidenceId,
      finalEvidenceVersion: finalEvidenceRecord?.version,
      reviewer: reviewerName,
      reviewerRole,
      status,
      closeoutReady,
      responseNotes:
        responseNotes.trim() ||
        'No closeout acknowledgement final evidence acknowledgement response notes recorded.',
      requestedActions: retainedActions,
      channelSummary,
      finalEvidenceStatus: deliveryEvidence?.status,
      sourceMetrics: deliveryEvidence?.metrics,
      sourceRetainedActions: sourceActions,
      sourceAcknowledgementCount: deliveryEvidence?.acknowledgementRecords.length ?? 0,
      sourcePackageCount: deliveryEvidence?.closeoutPackages.length ?? 0,
      sourceDeliveryEvidenceCount: deliveryEvidence?.deliveryEvidence.length ?? 0,
      sourceSupersededEvidenceCount: deliveryEvidence?.supersededEvidence.length ?? 0,
      auditHistory: [
        {
          action:
            'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledged',
          actor: reviewerName,
          timestamp: acknowledgedAt,
          status,
          closeoutReady,
          summary: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for closeout acknowledgement final evidence delivery.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}. ${retainedActions.length} requested action(s) retained.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement',
      label: 'Closeout acknowledgement final evidence acknowledgement',
      status: closureSlaDeliveryAcknowledgementStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement',
      `Closeout acknowledgement final evidence acknowledgement saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure({
    closeoutNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    closeoutNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) {
    const closedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const acknowledgementRecords = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgement> =>
        record.kind ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement',
    )
    const finalEvidenceRecords = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence> =>
        record.kind ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_acknowledgement_final_evidence',
    )
    const deliveryEvidence = backendRecords.filter(
      (record): record is BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }> => {
        if (record.kind !== 'notification_delivery') return false
        const payload = record.payload as { request?: NotificationDeliveryPayload }
        return (
          payload.request?.source ===
          'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_acknowledgement_final_evidence'
        )
      },
    )
    const metrics = acknowledgementRecords.reduce(
      (summary, record) => {
        summary.totalAcknowledgements += 1
        if (record.payload.status === 'acknowledged') summary.acknowledged += 1
        if (record.payload.status === 'approved') summary.approved += 1
        if (record.payload.status === 'changes_requested') summary.changesRequested += 1
        if (record.payload.status === 'rejected') summary.rejected += 1
        if (record.payload.closeoutReady) summary.closeoutReady += 1
        summary.retainedActions += record.payload.requestedActions.length
        return summary
      },
      {
        totalAcknowledgements: 0,
        acknowledged: 0,
        approved: 0,
        changesRequested: 0,
        rejected: 0,
        closeoutReady: 0,
        retainedActions: 0,
        finalEvidenceRecords: finalEvidenceRecords.length,
        deliveryRecords: deliveryEvidence.length,
      },
    )
    const sourceActions = acknowledgementRecords.flatMap((record) => record.payload.requestedActions)
    const actions = [...sourceActions, ...retainedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const supersededAcknowledgements = acknowledgementRecords.slice(1).map((record) => ({
      acknowledgementId: record.payload.acknowledgementId,
      reviewer: record.payload.reviewer,
      reviewerRole: record.payload.reviewerRole,
      status: record.payload.status,
      acknowledgedAt: record.payload.acknowledgedAt,
      evidence: record.payload.evidence,
    }))
    const payload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure = {
      closeoutId: `closure_package_acknowledgement_closeout_notification_closure_package_final_evidence_ack_closeout:${closedAt}`,
      closedAt,
      reviewer: reviewerName,
      status,
      acknowledgementRecords,
      finalEvidenceRecords,
      deliveryEvidence,
      metrics,
      retainedActions: actions,
      closeoutNotes:
        closeoutNotes.trim() ||
        'No closeout acknowledgement final evidence acknowledgement closeout notes recorded.',
      supersededEvidence,
      supersededAcknowledgements,
      sourceRecordCounts: {
        acknowledgementRecords: acknowledgementRecords.length,
        finalEvidenceRecords: finalEvidenceRecords.length,
        deliveryRecords: deliveryEvidence.length,
        supersededAcknowledgements: supersededAcknowledgements.length,
      },
      auditHistory: [
        {
          action:
            'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closed',
          actor: reviewerName,
          timestamp: closedAt,
          status,
          summary: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} closeout evidence for closeout acknowledgement final evidence acknowledgements.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} closeout evidence for ${acknowledgementRecords.length} closeout acknowledgement final evidence acknowledgement record(s) with ${actions.length} retained action(s) and ${supersededEvidence.length} superseded evidence note(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure',
      label: 'Closeout acknowledgement final acknowledgement closeout evidence',
      status: closureSlaFollowUpClosureStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure',
      `Closeout acknowledgement final acknowledgement closeout evidence saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function deliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure({
    closeoutNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    closeoutNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) {
    const saved =
      await saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure({
        closeoutNotes,
        retainedActions,
        reviewer,
        status,
        supersededEvidence,
      })
    if (!saved) return
    const recipients = [
      saved.payload.reviewer,
      ...saved.payload.acknowledgementRecords.map((record) => record.payload.reviewer),
      ...saved.payload.finalEvidenceRecords.map((record) => record.payload.reviewer),
    ]
      .map((recipient) => recipient.trim())
      .filter((recipient, index, values) => recipient.length > 0 && values.indexOf(recipient) === index)
    await deliverNotifications(
      notificationToDeliveryPayload(
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure',
        'Closeout acknowledgement final acknowledgement closeout evidence',
        {
          notificationId: saved.payload.closeoutId,
          recipients,
          summary: `${saved.payload.reviewer} closed ${saved.payload.metrics.totalAcknowledgements} closeout acknowledgement final evidence acknowledgement record(s), ${saved.payload.metrics.retainedActions} retained action(s), and ${saved.payload.supersededEvidence.length} superseded evidence note(s).`,
          package: saved.payload,
        },
      ),
    )
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgement({
    acknowledgementClosureReady,
    deliveryRecord,
    requestedActions,
    responseNotes,
    reviewer,
    reviewerRole,
    status,
  }: {
    acknowledgementClosureReady: boolean
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgement['reviewerRole']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) {
    const acknowledgedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const deliveryPackage = (
      deliveryRecord.payload.request.evidence as {
        package?: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure
      }
    )?.package
    const closeoutRecord = backendRecords.find(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure> => {
        if (
          record.kind !==
          'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure'
        ) {
          return false
        }
        return (
          (record.payload as ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure)
            .closeoutId === deliveryPackage?.closeoutId
        )
      },
    )
    const sourceActions = deliveryPackage?.retainedActions ?? []
    const retainedActions = [...sourceActions, ...requestedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const channelSummary = deliveryRecord.payload.result.channelResults
      .map((channel) => `${titleize(channel.channel)} ${channel.mode}/${channel.status}`)
      .join(', ')
    const payload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgement = {
      acknowledgementId: `closure_package_acknowledgement_closeout_notification_closure_package_final_ack_closeout_delivery_ack:${deliveryRecord.id}:${acknowledgedAt}`,
      acknowledgedAt,
      deliveryRecordId: deliveryRecord.id,
      deliveryId: deliveryRecord.payload.request.deliveryId,
      deliverySubject: deliveryRecord.payload.request.subject,
      closeoutRecordId: closeoutRecord?.id,
      closeoutId: deliveryPackage?.closeoutId,
      closeoutVersion: closeoutRecord?.version,
      reviewer: reviewerName,
      reviewerRole,
      status,
      acknowledgementClosureReady,
      responseNotes:
        responseNotes.trim() ||
        'No closeout acknowledgement final acknowledgement closeout delivery acknowledgement notes recorded.',
      requestedActions: retainedActions,
      channelSummary,
      closeoutStatus: deliveryPackage?.status,
      sourceMetrics: deliveryPackage?.metrics,
      sourceRetainedActions: sourceActions,
      sourceAcknowledgementCount: deliveryPackage?.acknowledgementRecords.length ?? 0,
      sourceFinalEvidenceCount: deliveryPackage?.finalEvidenceRecords.length ?? 0,
      sourceDeliveryEvidenceCount: deliveryPackage?.deliveryEvidence.length ?? 0,
      sourceSupersededEvidenceCount: deliveryPackage?.supersededEvidence.length ?? 0,
      auditHistory: [
        {
          action:
            'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledged',
          actor: reviewerName,
          timestamp: acknowledgedAt,
          status,
          acknowledgementClosureReady,
          summary: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for final acknowledgement closeout evidence delivery.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}. ${retainedActions.length} requested action(s) retained.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement',
      label: 'Closeout acknowledgement final closeout delivery acknowledgement',
      status: closureSlaDeliveryAcknowledgementStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement',
      `Closeout acknowledgement final closeout delivery acknowledgement saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure({
    closureNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) {
    const closedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const acknowledgementRecords = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgement> =>
        record.kind ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement',
    )
    const closeoutEvidenceRecords = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure> =>
        record.kind ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure',
    )
    const deliveryEvidence = backendRecords.filter(
      (record): record is BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }> => {
        if (record.kind !== 'notification_delivery') return false
        const payload = record.payload as { request?: NotificationDeliveryPayload }
        return (
          payload.request?.source ===
          'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure'
        )
      },
    )
    const metrics = acknowledgementRecords.reduce(
      (summary, record) => {
        summary.totalAcknowledgements += 1
        if (record.payload.status === 'acknowledged') summary.acknowledged += 1
        if (record.payload.status === 'approved') summary.approved += 1
        if (record.payload.status === 'changes_requested') summary.changesRequested += 1
        if (record.payload.status === 'rejected') summary.rejected += 1
        if (record.payload.acknowledgementClosureReady) summary.acknowledgementClosureReady += 1
        summary.retainedActions += record.payload.requestedActions.length
        return summary
      },
      {
        totalAcknowledgements: 0,
        acknowledged: 0,
        approved: 0,
        changesRequested: 0,
        rejected: 0,
        acknowledgementClosureReady: 0,
        retainedActions: 0,
        closeoutEvidenceRecords: closeoutEvidenceRecords.length,
        deliveryRecords: deliveryEvidence.length,
      },
    )
    const sourceActions = acknowledgementRecords.flatMap((record) => record.payload.requestedActions)
    const actions = [...sourceActions, ...retainedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const supersededAcknowledgements = acknowledgementRecords.slice(1).map((record) => ({
      acknowledgementId: record.payload.acknowledgementId,
      reviewer: record.payload.reviewer,
      reviewerRole: record.payload.reviewerRole,
      status: record.payload.status,
      acknowledgedAt: record.payload.acknowledgedAt,
      evidence: record.payload.evidence,
    }))
    const payload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure = {
      closureId: `closure_package_acknowledgement_closeout_notification_closure_package_final_ack_closeout_delivery_ack_closure:${closedAt}`,
      closedAt,
      reviewer: reviewerName,
      status,
      acknowledgementRecords,
      closeoutEvidenceRecords,
      deliveryEvidence,
      metrics,
      retainedActions: actions,
      closureNotes:
        closureNotes.trim() ||
        'No closeout acknowledgement final acknowledgement closeout delivery acknowledgement closure notes recorded.',
      supersededEvidence,
      supersededAcknowledgements,
      sourceRecordCounts: {
        acknowledgementRecords: acknowledgementRecords.length,
        closeoutEvidenceRecords: closeoutEvidenceRecords.length,
        deliveryRecords: deliveryEvidence.length,
        supersededAcknowledgements: supersededAcknowledgements.length,
      },
      auditHistory: [
        {
          action:
            'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closed',
          actor: reviewerName,
          timestamp: closedAt,
          status,
          summary: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} closure evidence for final acknowledgement closeout delivery acknowledgements.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} closure evidence for ${acknowledgementRecords.length} final acknowledgement closeout delivery acknowledgement record(s) with ${actions.length} retained action(s) and ${supersededEvidence.length} superseded evidence note(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure',
      label: 'Closeout acknowledgement final closeout acknowledgement closure evidence',
      status: closureSlaFollowUpClosureStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure',
      `Closeout acknowledgement final closeout acknowledgement closure evidence saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function deliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure({
    closureNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) {
    const saved =
      await saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure({
        closureNotes,
        retainedActions,
        reviewer,
        status,
        supersededEvidence,
      })
    if (!saved) return
    const recipients = [
      saved.payload.reviewer,
      ...saved.payload.acknowledgementRecords.map((record) => record.payload.reviewer),
      ...saved.payload.closeoutEvidenceRecords.map((record) => record.payload.reviewer),
    ]
      .map((recipient) => recipient.trim())
      .filter((recipient, index, values) => recipient.length > 0 && values.indexOf(recipient) === index)
    await deliverNotifications(
      notificationToDeliveryPayload(
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure',
        'Closeout acknowledgement final acknowledgement closure evidence',
        {
          notificationId: saved.payload.closureId,
          recipients,
          summary: `${saved.payload.reviewer} closed ${saved.payload.metrics.totalAcknowledgements} final acknowledgement closeout delivery acknowledgement record(s), ${saved.payload.metrics.retainedActions} retained action(s), and ${saved.payload.supersededEvidence.length} superseded evidence note(s).`,
          package: saved.payload,
        },
      ),
    )
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgement({
    deliveryRecord,
    finalEvidenceReady,
    requestedActions,
    responseNotes,
    reviewer,
    reviewerRole,
    status,
  }: {
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    finalEvidenceReady: boolean
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgement['reviewerRole']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) {
    const acknowledgedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const deliveryPackage = (
      deliveryRecord.payload.request.evidence as {
        package?: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure
      }
    )?.package
    const closureRecord = backendRecords.find(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure> => {
        if (
          record.kind !==
          'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure'
        ) {
          return false
        }
        return (
          (record.payload as ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure)
            .closureId === deliveryPackage?.closureId
        )
      },
    )
    const sourceActions = deliveryPackage?.retainedActions ?? []
    const retainedActions = [...sourceActions, ...requestedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const channelSummary = deliveryRecord.payload.result.channelResults
      .map((channel) => `${titleize(channel.channel)} ${channel.mode}/${channel.status}`)
      .join(', ')
    const payload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgement = {
      acknowledgementId: `closure_package_acknowledgement_closeout_notification_closure_package_final_ack_closure_delivery_ack:${deliveryRecord.id}:${acknowledgedAt}`,
      acknowledgedAt,
      deliveryRecordId: deliveryRecord.id,
      deliveryId: deliveryRecord.payload.request.deliveryId,
      deliverySubject: deliveryRecord.payload.request.subject,
      closureRecordId: closureRecord?.id,
      closureId: deliveryPackage?.closureId,
      closureVersion: closureRecord?.version,
      reviewer: reviewerName,
      reviewerRole,
      status,
      finalEvidenceReady,
      responseNotes:
        responseNotes.trim() ||
        'No closeout acknowledgement final acknowledgement closure delivery acknowledgement notes recorded.',
      requestedActions: retainedActions,
      channelSummary,
      closureStatus: deliveryPackage?.status,
      sourceMetrics: deliveryPackage?.metrics,
      sourceRetainedActions: sourceActions,
      sourceAcknowledgementCount: deliveryPackage?.acknowledgementRecords.length ?? 0,
      sourceCloseoutEvidenceCount: deliveryPackage?.closeoutEvidenceRecords.length ?? 0,
      sourceDeliveryEvidenceCount: deliveryPackage?.deliveryEvidence.length ?? 0,
      sourceSupersededEvidenceCount: deliveryPackage?.supersededEvidence.length ?? 0,
      auditHistory: [
        {
          action:
            'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledged',
          actor: reviewerName,
          timestamp: acknowledgedAt,
          status,
          finalEvidenceReady,
          summary: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for final acknowledgement closure evidence delivery.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}. ${retainedActions.length} requested action(s) retained.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement',
      label: 'Closeout acknowledgement final acknowledgement closure delivery acknowledgement',
      status: closureSlaDeliveryAcknowledgementStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement',
      `Closeout acknowledgement final acknowledgement closure delivery acknowledgement saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence({
    download = false,
    finalEvidenceNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    download?: boolean
    finalEvidenceNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) {
    const finalizedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const acknowledgementRecords = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgement> =>
        record.kind ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement',
    )
    const acknowledgementClosureRecords = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure> =>
        record.kind ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure',
    )
    const deliveryEvidence = backendRecords.filter(
      (
        record,
      ): record is BackendRecord<{
        request: NotificationDeliveryPayload
        result: NotificationDeliveryResult
      }> =>
        record.kind === 'notification_delivery' &&
        (record.payload as { request?: NotificationDeliveryPayload }).request?.source ===
          'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure',
    )
    const metrics = acknowledgementRecords.reduce(
      (summary, record) => {
        summary.totalAcknowledgements += 1
        if (record.payload.status === 'acknowledged') summary.acknowledged += 1
        if (record.payload.status === 'approved') summary.approved += 1
        if (record.payload.status === 'changes_requested') summary.changesRequested += 1
        if (record.payload.status === 'rejected') summary.rejected += 1
        if (record.payload.finalEvidenceReady) summary.finalEvidenceReady += 1
        summary.retainedActions += record.payload.requestedActions.length
        return summary
      },
      {
        totalAcknowledgements: 0,
        acknowledged: 0,
        approved: 0,
        changesRequested: 0,
        rejected: 0,
        finalEvidenceReady: 0,
        retainedActions: 0,
        acknowledgementClosureRecords: acknowledgementClosureRecords.length,
        deliveryRecords: deliveryEvidence.length,
      },
    )
    const sourceActions = acknowledgementRecords.flatMap((record) => record.payload.requestedActions)
    const actions = [...sourceActions, ...retainedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const supersededAcknowledgements = acknowledgementRecords.slice(1).map((record) => ({
      acknowledgementId: record.payload.acknowledgementId,
      reviewer: record.payload.reviewer,
      reviewerRole: record.payload.reviewerRole,
      status: record.payload.status,
      acknowledgedAt: record.payload.acknowledgedAt,
      evidence: record.payload.evidence,
    }))
    const payload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence = {
      evidenceId: `closure_package_acknowledgement_closeout_notification_closure_package_final_ack_closure_final_evidence:${finalizedAt}`,
      finalizedAt,
      reviewer: reviewerName,
      status,
      acknowledgementRecords,
      acknowledgementClosureRecords,
      deliveryEvidence,
      metrics,
      retainedActions: actions,
      finalEvidenceNotes:
        finalEvidenceNotes.trim() ||
        'Final acknowledgement closure final evidence retained without additional reviewer notes.',
      supersededEvidence,
      supersededAcknowledgements,
      sourceRecordCounts: {
        acknowledgementRecords: acknowledgementRecords.length,
        acknowledgementClosureRecords: acknowledgementClosureRecords.length,
        deliveryRecords: deliveryEvidence.length,
        supersededAcknowledgements: supersededAcknowledgements.length,
      },
      auditHistory: [
        {
          action:
            'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_finalized',
          actor: reviewerName,
          timestamp: finalizedAt,
          status,
          summary: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} final evidence for acknowledgement closure delivery acknowledgements.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} final evidence for ${acknowledgementRecords.length} final acknowledgement closure delivery acknowledgement record(s) with ${actions.length} retained action(s) and ${supersededEvidence.length} superseded evidence note(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence',
      label: 'Closeout acknowledgement final acknowledgement closure final evidence',
      status: closureSlaFollowUpClosureStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    if (download) {
      downloadJson('tracs-final-acknowledgement-closure-final-evidence.json', payload)
    }
    record(
      'notification',
      download
        ? 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_download'
        : 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence',
      `Closeout acknowledgement final acknowledgement closure final evidence saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function deliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence({
    finalEvidenceNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    finalEvidenceNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) {
    const saved =
      await saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence({
        finalEvidenceNotes,
        retainedActions,
        reviewer,
        status,
        supersededEvidence,
      })
    if (!saved) return
    const recipients = [
      saved.payload.reviewer,
      ...saved.payload.acknowledgementRecords.map((record) => record.payload.reviewer),
      ...saved.payload.acknowledgementClosureRecords.map((record) => record.payload.reviewer),
      ...saved.payload.deliveryEvidence.flatMap((record) => record.payload.request.recipients),
    ]
      .map((recipient) => recipient.trim())
      .filter((recipient, index, values) => recipient.length > 0 && values.indexOf(recipient) === index)
    await deliverNotifications(
      notificationToDeliveryPayload(
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence',
        'Closeout acknowledgement final acknowledgement closure final evidence',
        {
          notificationId: saved.payload.evidenceId,
          recipients,
          summary: `${saved.payload.reviewer} retained final acknowledgement closure final evidence for ${saved.payload.metrics.totalAcknowledgements} acknowledgement(s), ${saved.payload.metrics.retainedActions} retained action(s), and ${saved.payload.supersededEvidence.length} superseded evidence note(s).`,
          package: saved.payload,
        },
      ),
    )
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgement({
    closeoutReady,
    deliveryRecord,
    requestedActions,
    responseNotes,
    reviewer,
    reviewerRole,
    status,
  }: {
    closeoutReady: boolean
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgement['reviewerRole']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) {
    const acknowledgedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const deliveryPackage = (
      deliveryRecord.payload.request.evidence as {
        package?: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence
      }
    )?.package
    const finalEvidenceRecord = backendRecords.find(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence> => {
        if (
          record.kind !==
          'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence'
        ) {
          return false
        }
        return (
          (record.payload as ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence)
            .evidenceId === deliveryPackage?.evidenceId
        )
      },
    )
    const sourceActions = deliveryPackage?.retainedActions ?? []
    const retainedActions = [...sourceActions, ...requestedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const channelSummary = deliveryRecord.payload.result.channelResults
      .map((channel) => `${titleize(channel.channel)} ${channel.mode}/${channel.status}`)
      .join(', ')
    const payload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgement = {
      acknowledgementId: `closure_package_acknowledgement_closeout_notification_closure_package_final_ack_closure_final_evidence_delivery_ack:${deliveryRecord.id}:${acknowledgedAt}`,
      acknowledgedAt,
      deliveryRecordId: deliveryRecord.id,
      deliveryId: deliveryRecord.payload.request.deliveryId,
      deliverySubject: deliveryRecord.payload.request.subject,
      finalEvidenceRecordId: finalEvidenceRecord?.id,
      evidenceId: deliveryPackage?.evidenceId,
      finalEvidenceVersion: finalEvidenceRecord?.version,
      reviewer: reviewerName,
      reviewerRole,
      status,
      closeoutReady,
      responseNotes:
        responseNotes.trim() ||
        'No final acknowledgement closure final evidence delivery acknowledgement notes recorded.',
      requestedActions: retainedActions,
      channelSummary,
      finalEvidenceStatus: deliveryPackage?.status,
      sourceMetrics: deliveryPackage?.metrics,
      sourceRetainedActions: sourceActions,
      sourceAcknowledgementCount: deliveryPackage?.acknowledgementRecords.length ?? 0,
      sourceAcknowledgementClosureCount: deliveryPackage?.acknowledgementClosureRecords.length ?? 0,
      sourceDeliveryEvidenceCount: deliveryPackage?.deliveryEvidence.length ?? 0,
      sourceSupersededEvidenceCount: deliveryPackage?.supersededEvidence.length ?? 0,
      auditHistory: [
        {
          action:
            'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledged',
          actor: reviewerName,
          timestamp: acknowledgedAt,
          status,
          closeoutReady,
          summary: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for final acknowledgement closure final evidence delivery.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}. ${retainedActions.length} requested action(s) retained.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement',
      label: 'Closeout acknowledgement final acknowledgement closure final evidence delivery acknowledgement',
      status: closureSlaDeliveryAcknowledgementStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement',
      `Closeout acknowledgement final acknowledgement closure final evidence delivery acknowledgement saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence({
    closeoutNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    closeoutNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) {
    const closedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const acknowledgementRecords = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgement> =>
        record.kind ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement',
    )
    const finalEvidenceRecords = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence> =>
        record.kind ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence',
    )
    const deliveryEvidence = backendRecords.filter(
      (
        record,
      ): record is BackendRecord<{
        request: NotificationDeliveryPayload
        result: NotificationDeliveryResult
      }> =>
        record.kind === 'notification_delivery' &&
        (record.payload as { request?: NotificationDeliveryPayload }).request?.source ===
          'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence',
    )
    const metrics = acknowledgementRecords.reduce(
      (summary, record) => {
        summary.totalAcknowledgements += 1
        if (record.payload.status === 'acknowledged') summary.acknowledged += 1
        if (record.payload.status === 'approved') summary.approved += 1
        if (record.payload.status === 'changes_requested') summary.changesRequested += 1
        if (record.payload.status === 'rejected') summary.rejected += 1
        if (record.payload.closeoutReady) summary.closeoutReady += 1
        summary.retainedActions += record.payload.requestedActions.length
        return summary
      },
      {
        totalAcknowledgements: 0,
        acknowledged: 0,
        approved: 0,
        changesRequested: 0,
        rejected: 0,
        closeoutReady: 0,
        retainedActions: 0,
        finalEvidenceRecords: finalEvidenceRecords.length,
        deliveryRecords: deliveryEvidence.length,
      },
    )
    const sourceActions = acknowledgementRecords.flatMap((record) => record.payload.requestedActions)
    const actions = [...sourceActions, ...retainedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const supersededAcknowledgements = acknowledgementRecords.slice(1).map((record) => ({
      acknowledgementId: record.payload.acknowledgementId,
      reviewer: record.payload.reviewer,
      reviewerRole: record.payload.reviewerRole,
      status: record.payload.status,
      acknowledgedAt: record.payload.acknowledgedAt,
      evidence: record.payload.evidence,
    }))
    const payload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence = {
      closeoutId: `closure_package_acknowledgement_closeout_notification_closure_package_final_ack_closure_final_evidence_delivery_ack_closeout:${closedAt}`,
      closedAt,
      reviewer: reviewerName,
      status,
      acknowledgementRecords,
      finalEvidenceRecords,
      deliveryEvidence,
      metrics,
      retainedActions: actions,
      closeoutNotes:
        closeoutNotes.trim() ||
        'No final acknowledgement closure final evidence delivery acknowledgement closeout notes recorded.',
      supersededEvidence,
      supersededAcknowledgements,
      sourceRecordCounts: {
        acknowledgementRecords: acknowledgementRecords.length,
        finalEvidenceRecords: finalEvidenceRecords.length,
        deliveryRecords: deliveryEvidence.length,
        supersededAcknowledgements: supersededAcknowledgements.length,
      },
      auditHistory: [
        {
          action:
            'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closed',
          actor: reviewerName,
          timestamp: closedAt,
          status,
          summary: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} closeout evidence for final evidence delivery acknowledgements.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} closeout evidence for ${acknowledgementRecords.length} final evidence delivery acknowledgement record(s) with ${actions.length} retained action(s) and ${supersededEvidence.length} superseded evidence note(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence',
      label: 'Closeout acknowledgement final acknowledgement closure final closeout evidence',
      status: closureSlaFollowUpClosureStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence',
      `Closeout acknowledgement final acknowledgement closure final closeout evidence saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function deliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence({
    closeoutNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    closeoutNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) {
    const saved =
      await saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence({
        closeoutNotes,
        retainedActions,
        reviewer,
        status,
        supersededEvidence,
      })
    if (!saved) return
    const recipients = [
      saved.payload.reviewer,
      ...saved.payload.acknowledgementRecords.map((record) => record.payload.reviewer),
      ...saved.payload.finalEvidenceRecords.map((record) => record.payload.reviewer),
      ...saved.payload.deliveryEvidence.flatMap((record) => record.payload.request.recipients),
    ]
      .map((recipient) => recipient.trim())
      .filter((recipient, index, values) => recipient.length > 0 && values.indexOf(recipient) === index)
    await deliverNotifications(
      notificationToDeliveryPayload(
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence',
        'Closeout acknowledgement final acknowledgement closure final closeout evidence',
        {
          notificationId: saved.payload.closeoutId,
          recipients,
          summary: `${saved.payload.reviewer} retained final closeout evidence for ${saved.payload.metrics.totalAcknowledgements} acknowledgement(s), ${saved.payload.metrics.retainedActions} retained action(s), and ${saved.payload.supersededEvidence.length} superseded evidence note(s).`,
          package: saved.payload,
        },
      ),
    )
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement({
    acknowledgementClosureReady,
    deliveryRecord,
    requestedActions,
    responseNotes,
    reviewer,
    reviewerRole,
    status,
  }: {
    acknowledgementClosureReady: boolean
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement['reviewerRole']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) {
    const acknowledgedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const deliveryPackage = (
      deliveryRecord.payload.request.evidence as {
        package?: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence
      }
    )?.package
    const closeoutRecord = backendRecords.find(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence> => {
        if (
          record.kind !==
          'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence'
        ) {
          return false
        }
        return (
          (record.payload as ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence)
            .closeoutId === deliveryPackage?.closeoutId
        )
      },
    )
    const sourceActions = deliveryPackage?.retainedActions ?? []
    const retainedActions = [...sourceActions, ...requestedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const channelSummary = deliveryRecord.payload.result.channelResults
      .map((channel) => `${titleize(channel.channel)} ${channel.mode}/${channel.status}`)
      .join(', ')
    const payload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement = {
      acknowledgementId: `closure_package_acknowledgement_closeout_notification_closure_package_final_ack_closure_final_closeout_delivery_ack:${deliveryRecord.id}:${acknowledgedAt}`,
      acknowledgedAt,
      deliveryRecordId: deliveryRecord.id,
      deliveryId: deliveryRecord.payload.request.deliveryId,
      deliverySubject: deliveryRecord.payload.request.subject,
      closeoutRecordId: closeoutRecord?.id,
      closeoutId: deliveryPackage?.closeoutId,
      closeoutVersion: closeoutRecord?.version,
      reviewer: reviewerName,
      reviewerRole,
      status,
      acknowledgementClosureReady,
      responseNotes:
        responseNotes.trim() ||
        'No final acknowledgement closure final closeout evidence delivery acknowledgement notes recorded.',
      requestedActions: retainedActions,
      channelSummary,
      closeoutStatus: deliveryPackage?.status,
      sourceMetrics: deliveryPackage?.metrics,
      sourceRetainedActions: sourceActions,
      sourceAcknowledgementCount: deliveryPackage?.acknowledgementRecords.length ?? 0,
      sourceFinalEvidenceCount: deliveryPackage?.finalEvidenceRecords.length ?? 0,
      sourceDeliveryEvidenceCount: deliveryPackage?.deliveryEvidence.length ?? 0,
      sourceSupersededEvidenceCount: deliveryPackage?.supersededEvidence.length ?? 0,
      auditHistory: [
        {
          action:
            'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledged',
          actor: reviewerName,
          timestamp: acknowledgedAt,
          status,
          acknowledgementClosureReady,
          summary: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for final closeout evidence delivery.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}. ${retainedActions.length} requested action(s) retained.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement',
      label: 'Closeout acknowledgement final acknowledgement closure final closeout delivery acknowledgement',
      status: closureSlaDeliveryAcknowledgementStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement',
      `Closeout acknowledgement final acknowledgement closure final closeout delivery acknowledgement saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure({
    closureNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) {
    const closedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const acknowledgementRecords = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement> =>
        record.kind ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement',
    )
    const closeoutEvidenceRecords = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence> =>
        record.kind ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence',
    )
    const deliveryEvidence = backendRecords.filter(
      (
        record,
      ): record is BackendRecord<{
        request: NotificationDeliveryPayload
        result: NotificationDeliveryResult
      }> =>
        record.kind === 'notification_delivery' &&
        (record.payload as { request?: NotificationDeliveryPayload }).request?.source ===
          'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence',
    )
    const metrics = acknowledgementRecords.reduce(
      (summary, record) => {
        summary.totalAcknowledgements += 1
        if (record.payload.status === 'acknowledged') summary.acknowledged += 1
        if (record.payload.status === 'approved') summary.approved += 1
        if (record.payload.status === 'changes_requested') summary.changesRequested += 1
        if (record.payload.status === 'rejected') summary.rejected += 1
        if (record.payload.acknowledgementClosureReady) summary.acknowledgementClosureReady += 1
        summary.retainedActions += record.payload.requestedActions.length
        return summary
      },
      {
        totalAcknowledgements: 0,
        acknowledged: 0,
        approved: 0,
        changesRequested: 0,
        rejected: 0,
        acknowledgementClosureReady: 0,
        retainedActions: 0,
        closeoutEvidenceRecords: closeoutEvidenceRecords.length,
        deliveryRecords: deliveryEvidence.length,
      },
    )
    const sourceActions = acknowledgementRecords.flatMap((record) => record.payload.requestedActions)
    const actions = [...sourceActions, ...retainedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const supersededAcknowledgements = acknowledgementRecords.slice(1).map((record) => ({
      acknowledgementId: record.payload.acknowledgementId,
      reviewer: record.payload.reviewer,
      reviewerRole: record.payload.reviewerRole,
      status: record.payload.status,
      acknowledgedAt: record.payload.acknowledgedAt,
      evidence: record.payload.evidence,
    }))
    const payload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure = {
      closureId: `closure_package_acknowledgement_closeout_notification_closure_package_final_ack_closure_final_closeout_delivery_ack_closure:${closedAt}`,
      closedAt,
      reviewer: reviewerName,
      status,
      acknowledgementRecords,
      closeoutEvidenceRecords,
      deliveryEvidence,
      metrics,
      retainedActions: actions,
      closureNotes:
        closureNotes.trim() ||
        'No final acknowledgement closure final closeout delivery acknowledgement closure notes recorded.',
      supersededEvidence,
      supersededAcknowledgements,
      sourceRecordCounts: {
        acknowledgementRecords: acknowledgementRecords.length,
        closeoutEvidenceRecords: closeoutEvidenceRecords.length,
        deliveryRecords: deliveryEvidence.length,
        supersededAcknowledgements: supersededAcknowledgements.length,
      },
      auditHistory: [
        {
          action:
            'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closed',
          actor: reviewerName,
          timestamp: closedAt,
          status,
          summary: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} closure evidence for final closeout delivery acknowledgements.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} closure evidence for ${acknowledgementRecords.length} final closeout delivery acknowledgement record(s) with ${actions.length} retained action(s) and ${supersededEvidence.length} superseded evidence note(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure',
      label: 'Closeout acknowledgement final acknowledgement closure final closeout acknowledgement closure evidence',
      status: closureSlaFollowUpClosureStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure',
      `Closeout acknowledgement final acknowledgement closure final closeout acknowledgement closure evidence saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function deliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure({
    closureNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) {
    const saved =
      await saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure({
        closureNotes,
        retainedActions,
        reviewer,
        status,
        supersededEvidence,
      })
    if (!saved) return
    const recipients = [
      saved.payload.reviewer,
      ...saved.payload.acknowledgementRecords.map((record) => record.payload.reviewer),
      ...saved.payload.closeoutEvidenceRecords.map((record) => record.payload.reviewer),
      ...saved.payload.deliveryEvidence.flatMap((record) => record.payload.request.recipients),
    ]
      .map((recipient) => recipient.trim())
      .filter((recipient, index, values) => recipient.length > 0 && values.indexOf(recipient) === index)
    await deliverNotifications(
      notificationToDeliveryPayload(
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure',
        'Closeout acknowledgement final acknowledgement closure final closeout acknowledgement closure evidence',
        {
          notificationId: saved.payload.closureId,
          recipients,
          summary: `${saved.payload.reviewer} retained final closeout acknowledgement closure evidence for ${saved.payload.metrics.totalAcknowledgements} acknowledgement(s), ${saved.payload.metrics.retainedActions} retained action(s), and ${saved.payload.supersededEvidence.length} superseded evidence note(s).`,
          package: saved.payload,
        },
      ),
    )
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgement({
    closeoutReady,
    deliveryRecord,
    requestedActions,
    responseNotes,
    reviewer,
    reviewerRole,
    status,
  }: {
    closeoutReady: boolean
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgement['reviewerRole']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) {
    const acknowledgedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const deliveryPackage = (
      deliveryRecord.payload.request.evidence as {
        package?: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure
      }
    )?.package
    const closureRecord = backendRecords.find(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure> => {
        if (
          record.kind !==
          'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure'
        ) {
          return false
        }
        return (
          (record.payload as ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure)
            .closureId === deliveryPackage?.closureId
        )
      },
    )
    const sourceActions = deliveryPackage?.retainedActions ?? []
    const retainedActions = [...sourceActions, ...requestedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const channelSummary = deliveryRecord.payload.result.channelResults
      .map((channel) => `${titleize(channel.channel)} ${channel.mode}/${channel.status}`)
      .join(', ')
    const payload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgement = {
      acknowledgementId: `closure_package_acknowledgement_closeout_notification_closure_package_final_ack_closure_final_closeout_ack_closure_delivery_ack:${deliveryRecord.id}:${acknowledgedAt}`,
      acknowledgedAt,
      deliveryRecordId: deliveryRecord.id,
      deliveryId: deliveryRecord.payload.request.deliveryId,
      deliverySubject: deliveryRecord.payload.request.subject,
      closureRecordId: closureRecord?.id,
      closureId: deliveryPackage?.closureId,
      closureVersion: closureRecord?.version,
      reviewer: reviewerName,
      reviewerRole,
      status,
      closeoutReady,
      responseNotes:
        responseNotes.trim() ||
        'No final closeout acknowledgement closure delivery acknowledgement notes recorded.',
      requestedActions: retainedActions,
      channelSummary,
      closureStatus: deliveryPackage?.status,
      sourceMetrics: deliveryPackage?.metrics,
      sourceRetainedActions: sourceActions,
      sourceAcknowledgementCount: deliveryPackage?.acknowledgementRecords.length ?? 0,
      sourceCloseoutEvidenceCount: deliveryPackage?.closeoutEvidenceRecords.length ?? 0,
      sourceDeliveryEvidenceCount: deliveryPackage?.deliveryEvidence.length ?? 0,
      sourceSupersededEvidenceCount: deliveryPackage?.supersededEvidence.length ?? 0,
      auditHistory: [
        {
          action:
            'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledged',
          actor: reviewerName,
          timestamp: acknowledgedAt,
          status,
          closeoutReady,
          summary: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for final closeout acknowledgement closure evidence delivery.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}. ${retainedActions.length} requested action(s) retained.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement',
      label: 'Closeout acknowledgement final acknowledgement closure final closeout acknowledgement closure delivery acknowledgement',
      status: closureSlaDeliveryAcknowledgementStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement',
      `Closeout acknowledgement final acknowledgement closure final closeout acknowledgement closure delivery acknowledgement saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence({
    closeoutNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    closeoutNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) {
    const closedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const acknowledgementRecords = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgement> =>
        record.kind ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement',
    )
    const closureEvidenceRecords = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure> =>
        record.kind ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure',
    )
    const deliveryEvidence = backendRecords.filter(
      (
        record,
      ): record is BackendRecord<{
        request: NotificationDeliveryPayload
        result: NotificationDeliveryResult
      }> =>
        record.kind === 'notification_delivery' &&
        (record.payload as { request?: NotificationDeliveryPayload }).request?.source ===
          'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure',
    )
    const metrics = acknowledgementRecords.reduce(
      (summary, record) => {
        summary.totalAcknowledgements += 1
        if (record.payload.status === 'acknowledged') summary.acknowledged += 1
        if (record.payload.status === 'approved') summary.approved += 1
        if (record.payload.status === 'changes_requested') summary.changesRequested += 1
        if (record.payload.status === 'rejected') summary.rejected += 1
        if (record.payload.closeoutReady) summary.closeoutReady += 1
        summary.retainedActions += record.payload.requestedActions.length
        return summary
      },
      {
        totalAcknowledgements: 0,
        acknowledged: 0,
        approved: 0,
        changesRequested: 0,
        rejected: 0,
        closeoutReady: 0,
        retainedActions: 0,
        closureEvidenceRecords: closureEvidenceRecords.length,
        deliveryRecords: deliveryEvidence.length,
      },
    )
    const sourceActions = acknowledgementRecords.flatMap((record) => record.payload.requestedActions)
    const actions = [...sourceActions, ...retainedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const supersededAcknowledgements = acknowledgementRecords.slice(1).map((record) => ({
      acknowledgementId: record.payload.acknowledgementId,
      reviewer: record.payload.reviewer,
      reviewerRole: record.payload.reviewerRole,
      status: record.payload.status,
      acknowledgedAt: record.payload.acknowledgedAt,
      evidence: record.payload.evidence,
    }))
    const payload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence = {
      closeoutId: `closure_package_acknowledgement_closeout_notification_closure_package_final_ack_closure_final_closeout_ack_closure_delivery_ack_closeout:${closedAt}`,
      closedAt,
      reviewer: reviewerName,
      status,
      acknowledgementRecords,
      closureEvidenceRecords,
      deliveryEvidence,
      metrics,
      retainedActions: actions,
      closeoutNotes:
        closeoutNotes.trim() ||
        'No final closeout acknowledgement closure delivery acknowledgement closeout notes recorded.',
      supersededEvidence,
      supersededAcknowledgements,
      sourceRecordCounts: {
        acknowledgementRecords: acknowledgementRecords.length,
        closureEvidenceRecords: closureEvidenceRecords.length,
        deliveryRecords: deliveryEvidence.length,
        supersededAcknowledgements: supersededAcknowledgements.length,
      },
      auditHistory: [
        {
          action:
            'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closed',
          actor: reviewerName,
          timestamp: closedAt,
          status,
          summary: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} closeout evidence for final closeout acknowledgement closure delivery acknowledgements.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} closeout evidence for ${acknowledgementRecords.length} final closeout acknowledgement closure delivery acknowledgement record(s) with ${actions.length} retained action(s) and ${supersededEvidence.length} superseded evidence note(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence',
      label: 'Closeout acknowledgement final acknowledgement closure final closeout acknowledgement closure closeout evidence',
      status: closureSlaFollowUpClosureStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence',
      `Closeout acknowledgement final acknowledgement closure final closeout acknowledgement closure closeout evidence saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function deliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence({
    closeoutNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    closeoutNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) {
    const saved =
      await saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence({
        closeoutNotes,
        retainedActions,
        reviewer,
        status,
        supersededEvidence,
      })
    if (!saved) return
    const recipients = [
      saved.payload.reviewer,
      ...saved.payload.acknowledgementRecords.map((record) => record.payload.reviewer),
      ...saved.payload.closureEvidenceRecords.map((record) => record.payload.reviewer),
      ...saved.payload.deliveryEvidence.flatMap((record) => record.payload.request.recipients),
    ]
      .map((recipient) => recipient.trim())
      .filter((recipient, index, values) => recipient.length > 0 && values.indexOf(recipient) === index)
    await deliverNotifications(
      notificationToDeliveryPayload(
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence',
        'Closeout acknowledgement final acknowledgement closure final closeout acknowledgement closure closeout evidence',
        {
          notificationId: saved.payload.closeoutId,
          recipients,
          summary: `${saved.payload.reviewer} retained final closeout acknowledgement closure closeout evidence for ${saved.payload.metrics.totalAcknowledgements} acknowledgement(s), ${saved.payload.metrics.retainedActions} retained action(s), and ${saved.payload.supersededEvidence.length} superseded evidence note(s).`,
          package: saved.payload,
        },
      ),
    )
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement({
    deliveryRecord,
    finalEvidenceReady,
    requestedActions,
    responseNotes,
    reviewer,
    reviewerRole,
    status,
  }: {
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    finalEvidenceReady: boolean
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement['reviewerRole']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) {
    const acknowledgedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const deliveryPackage = (
      deliveryRecord.payload.request.evidence as {
        package?: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence
      }
    )?.package
    const closeoutEvidenceRecord = backendRecords.find(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence> => {
        if (
          record.kind !==
          'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence'
        ) {
          return false
        }
        return (
          (record.payload as ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence)
            .closeoutId === deliveryPackage?.closeoutId
        )
      },
    )
    const sourceActions = deliveryPackage?.retainedActions ?? []
    const retainedActions = [...sourceActions, ...requestedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const channelSummary = deliveryRecord.payload.result.channelResults
      .map((channel) => `${titleize(channel.channel)} ${channel.mode}/${channel.status}`)
      .join(', ')
    const payload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement = {
      acknowledgementId: `closure_package_acknowledgement_closeout_notification_closure_package_final_ack_closure_final_closeout_ack_closure_closeout_delivery_ack:${deliveryRecord.id}:${acknowledgedAt}`,
      acknowledgedAt,
      deliveryRecordId: deliveryRecord.id,
      deliveryId: deliveryRecord.payload.request.deliveryId,
      deliverySubject: deliveryRecord.payload.request.subject,
      closeoutEvidenceRecordId: closeoutEvidenceRecord?.id,
      closeoutId: deliveryPackage?.closeoutId,
      closeoutVersion: closeoutEvidenceRecord?.version,
      reviewer: reviewerName,
      reviewerRole,
      status,
      finalEvidenceReady,
      responseNotes:
        responseNotes.trim() ||
        'No final closeout acknowledgement closure closeout evidence delivery acknowledgement notes recorded.',
      requestedActions: retainedActions,
      channelSummary,
      closeoutStatus: deliveryPackage?.status,
      sourceMetrics: deliveryPackage?.metrics,
      sourceRetainedActions: sourceActions,
      sourceAcknowledgementCount: deliveryPackage?.acknowledgementRecords.length ?? 0,
      sourceClosureEvidenceCount: deliveryPackage?.closureEvidenceRecords.length ?? 0,
      sourceDeliveryEvidenceCount: deliveryPackage?.deliveryEvidence.length ?? 0,
      sourceSupersededEvidenceCount: deliveryPackage?.supersededEvidence.length ?? 0,
      auditHistory: [
        {
          action:
            'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence_delivery_acknowledged',
          actor: reviewerName,
          timestamp: acknowledgedAt,
          status,
          finalEvidenceReady,
          summary: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for final closeout acknowledgement closure closeout evidence delivery.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}. ${retainedActions.length} requested action(s) retained.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement',
      label: 'Closeout acknowledgement final acknowledgement closure final closeout acknowledgement closure closeout delivery acknowledgement',
      status: closureSlaDeliveryAcknowledgementStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement',
      `Closeout acknowledgement final acknowledgement closure final closeout acknowledgement closure closeout delivery acknowledgement saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidence({
    finalEvidenceNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    finalEvidenceNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) {
    const finalizedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const acknowledgementRecords = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement> =>
        record.kind ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement',
    )
    const closeoutEvidenceRecords = backendRecords.filter(
      (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence> =>
        record.kind ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence',
    )
    const deliveryEvidence = backendRecords.filter(
      (
        record,
      ): record is BackendRecord<{
        request: NotificationDeliveryPayload
        result: NotificationDeliveryResult
      }> =>
        record.kind === 'notification_delivery' &&
        (record.payload as { request?: NotificationDeliveryPayload }).request?.source ===
          'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence',
    )
    const metrics = acknowledgementRecords.reduce(
      (summary, record) => {
        summary.totalAcknowledgements += 1
        if (record.payload.status === 'acknowledged') summary.acknowledged += 1
        if (record.payload.status === 'approved') summary.approved += 1
        if (record.payload.status === 'changes_requested') summary.changesRequested += 1
        if (record.payload.status === 'rejected') summary.rejected += 1
        if (record.payload.finalEvidenceReady) summary.finalEvidenceReady += 1
        summary.retainedActions += record.payload.requestedActions.length
        return summary
      },
      {
        totalAcknowledgements: 0,
        acknowledged: 0,
        approved: 0,
        changesRequested: 0,
        rejected: 0,
        finalEvidenceReady: 0,
        retainedActions: 0,
        closeoutEvidenceRecords: closeoutEvidenceRecords.length,
        deliveryRecords: deliveryEvidence.length,
      },
    )
    const sourceActions = acknowledgementRecords.flatMap((record) => record.payload.requestedActions)
    const actions = [...sourceActions, ...retainedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const supersededAcknowledgements = acknowledgementRecords.slice(1).map((record) => ({
      acknowledgementId: record.payload.acknowledgementId,
      reviewer: record.payload.reviewer,
      reviewerRole: record.payload.reviewerRole,
      status: record.payload.status,
      acknowledgedAt: record.payload.acknowledgedAt,
      evidence: record.payload.evidence,
    }))
    const payload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidence = {
      evidenceId: `closure_package_acknowledgement_closeout_notification_closure_package_final_ack_closure_final_closeout_ack_closure_final_evidence:${finalizedAt}`,
      finalizedAt,
      reviewer: reviewerName,
      status,
      acknowledgementRecords,
      closeoutEvidenceRecords,
      deliveryEvidence,
      metrics,
      retainedActions: actions,
      finalEvidenceNotes:
        finalEvidenceNotes.trim() ||
        'No final closeout acknowledgement closure final evidence notes recorded.',
      supersededEvidence,
      supersededAcknowledgements,
      sourceRecordCounts: {
        acknowledgementRecords: acknowledgementRecords.length,
        closeoutEvidenceRecords: closeoutEvidenceRecords.length,
        deliveryRecords: deliveryEvidence.length,
        supersededAcknowledgements: supersededAcknowledgements.length,
      },
      auditHistory: [
        {
          action:
            'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_finalized',
          actor: reviewerName,
          timestamp: finalizedAt,
          status,
          summary: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} final evidence for final closeout acknowledgement closure closeout delivery acknowledgements.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} final evidence for ${acknowledgementRecords.length} final closeout acknowledgement closure closeout delivery acknowledgement record(s) with ${actions.length} retained action(s) and ${supersededEvidence.length} superseded evidence note(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_final_evidence',
      label: 'Closeout acknowledgement final acknowledgement closure final closeout acknowledgement closure final evidence',
      status: closureSlaFollowUpClosureStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_final_evidence',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_final_evidence',
      `Closeout acknowledgement final acknowledgement closure final closeout acknowledgement closure final evidence saved as backend record v${saved.version}.`,
    )
    return saved
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

  async function savePostgresCutoverFinalHandoffAcknowledgement({
    deliveryRecord,
    finalHandoffReady,
    requestedActions,
    responseNotes,
    reviewer,
    reviewerRole,
    status,
  }: {
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    finalHandoffReady: boolean
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: PostgresCutoverFinalHandoffAcknowledgement['reviewerRole']
    status: PostgresCutoverFinalHandoffAcknowledgementStatus
  }) {
    const acknowledgedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Infrastructure Reviewer'
    const deliveryPackage = (deliveryRecord.payload.request.evidence as { package?: PostgresCutoverClosurePackage })?.package
    const packageRecord = backendRecords.find(
      (record): record is BackendRecord<PostgresCutoverClosurePackage> => {
        if (record.kind !== 'postgres_cutover_closure_package') return false
        return (record.payload as PostgresCutoverClosurePackage).packageId === deliveryPackage?.packageId
      },
    )
    const sourceActions = deliveryPackage?.requiredActions ?? []
    const retainedActions = [...sourceActions, ...requestedActions]
      .map((action) => action.trim())
      .filter((action, index, actions) => action.length > 0 && actions.indexOf(action) === index)
    const channelSummary = deliveryRecord.payload.result.channelResults
      .map((result) => `${titleize(result.channel)} ${result.mode}/${result.status}`)
      .join(', ')
    const payload: PostgresCutoverFinalHandoffAcknowledgement = {
      acknowledgementId: `postgres_cutover_final_handoff_ack:${deliveryRecord.id}:${acknowledgedAt}`,
      acknowledgedAt,
      deliveryRecordId: deliveryRecord.id,
      deliveryId: deliveryRecord.payload.result.deliveryId,
      deliverySubject: deliveryRecord.payload.request.subject,
      packageRecordId: packageRecord?.id,
      packageId: deliveryPackage?.packageId,
      packageVersion: packageRecord?.version,
      reviewer: reviewerName,
      reviewerRole,
      status,
      responseNotes: responseNotes.trim() || 'No final handoff acknowledgement notes recorded.',
      requestedActions: retainedActions,
      channelSummary,
      packageStatus: deliveryPackage?.status,
      sourceRequiredActions: sourceActions,
      sourceClosureEvidenceCount: deliveryPackage?.closureEvidence.length ?? 0,
      finalHandoffReady,
      auditHistory: [
        {
          action: 'final_handoff_acknowledged',
          actor: reviewerName,
          timestamp: acknowledgedAt,
          status,
          summary: `${reviewerName} recorded ${postgresCutoverFinalHandoffAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}.`,
        },
      ],
      evidence: `${reviewerName} recorded ${postgresCutoverFinalHandoffAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}. ${retainedActions.length} requested action(s) retained.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'postgres_cutover_final_handoff_acknowledgement',
      label: deliveryRecord.payload.request.subject,
      status: postgresCutoverFinalHandoffAcknowledgementStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'postgres_cutover_final_handoff_acknowledgement',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'backend',
      'postgres_cutover_final_handoff_acknowledgement',
      `Postgres cutover final handoff acknowledgement saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function savePostgresCutoverFinalHandoffClosurePackage({
    download,
    packagePayload,
  }: {
    download: boolean
    packagePayload: PostgresCutoverFinalHandoffClosurePackage
  }) {
    const saved = await backendClient.saveRecord({
      kind: 'postgres_cutover_final_handoff_closure_package',
      label: 'Production cutover final handoff acknowledgement closure package',
      status: packagePayload.status,
      summary: packagePayload.evidence,
      payload: packagePayload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'postgres_cutover_final_handoff_closure_package',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    if (download) {
      downloadJson('tracs-postgres-final-handoff-acknowledgement-closure-package.json', packagePayload)
    }
    record(
      'backend',
      download ? 'postgres_final_handoff_closure_package_download' : 'postgres_final_handoff_closure_package_save',
      `Postgres cutover final handoff closure package saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function deliverPostgresCutoverFinalHandoffClosurePackage({
    download,
    packagePayload,
  }: {
    download: boolean
    packagePayload: PostgresCutoverFinalHandoffClosurePackage
  }) {
    const saved = await savePostgresCutoverFinalHandoffClosurePackage({ download, packagePayload })
    if (!saved) return
    await deliverNotifications(
      notificationToDeliveryPayload(
        'postgres_cutover_final_handoff_closure_package',
        'Production cutover final handoff acknowledgement closure package',
        {
          notificationId: saved.payload.packageId,
          recipients: saved.payload.closureReviewers,
          summary: `${saved.payload.closureReviewers.join(', ')} final handoff acknowledgement closure package includes ${saved.payload.metrics.totalAcknowledgements} acknowledgement record(s), ${saved.payload.metrics.retainedActions} retained action(s), ${saved.payload.deliveryEvidence.length} delivery evidence record(s), and ${saved.payload.requiredActions.length} required action(s).`,
          package: saved.payload,
        },
      ),
    )
  }

  async function savePostgresCutoverFinalHandoffClosurePackageAcknowledgement({
    closureReady,
    deliveryRecord,
    requestedActions,
    responseNotes,
    reviewer,
    reviewerRole,
    status,
  }: {
    closureReady: boolean
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: PostgresCutoverFinalHandoffClosurePackageAcknowledgement['reviewerRole']
    status: PostgresCutoverFinalHandoffAcknowledgementStatus
  }) {
    const acknowledgedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Infrastructure Reviewer'
    const deliveryPackage = (deliveryRecord.payload.request.evidence as {
      package?: PostgresCutoverFinalHandoffClosurePackage
    })?.package
    const packageRecord = backendRecords.find(
      (record): record is BackendRecord<PostgresCutoverFinalHandoffClosurePackage> => {
        if (record.kind !== 'postgres_cutover_final_handoff_closure_package') return false
        return (record.payload as PostgresCutoverFinalHandoffClosurePackage).packageId === deliveryPackage?.packageId
      },
    )
    const sourceActions = deliveryPackage?.requiredActions ?? []
    const retainedActions = [...sourceActions, ...requestedActions]
      .map((action) => action.trim())
      .filter((action, index, actions) => action.length > 0 && actions.indexOf(action) === index)
    const channelSummary = deliveryRecord.payload.result.channelResults
      .map((result) => `${titleize(result.channel)} ${result.mode}/${result.status}`)
      .join(', ')
    const payload: PostgresCutoverFinalHandoffClosurePackageAcknowledgement = {
      acknowledgementId: `postgres_cutover_final_handoff_closure_package_ack:${deliveryRecord.id}:${acknowledgedAt}`,
      acknowledgedAt,
      deliveryRecordId: deliveryRecord.id,
      deliveryId: deliveryRecord.payload.result.deliveryId,
      deliverySubject: deliveryRecord.payload.request.subject,
      packageRecordId: packageRecord?.id,
      packageId: deliveryPackage?.packageId,
      packageVersion: packageRecord?.version,
      reviewer: reviewerName,
      reviewerRole,
      status,
      closureReady,
      responseNotes: responseNotes.trim() || 'No final handoff closure package acknowledgement notes recorded.',
      requestedActions: retainedActions,
      channelSummary,
      packageStatus: deliveryPackage?.status,
      sourceMetrics: deliveryPackage?.metrics,
      sourceRequiredActions: sourceActions,
      sourceAcknowledgementCount: deliveryPackage?.acknowledgementRecords.length ?? 0,
      sourceDeliveryEvidenceCount: deliveryPackage?.deliveryEvidence.length ?? 0,
      auditHistory: [
        {
          action: 'final_handoff_closure_package_acknowledged',
          actor: reviewerName,
          timestamp: acknowledgedAt,
          status,
          closureReady,
          summary: `${reviewerName} recorded ${postgresCutoverFinalHandoffAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}.`,
        },
      ],
      evidence: `${reviewerName} recorded ${postgresCutoverFinalHandoffAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}. ${retainedActions.length} requested action(s) retained.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'postgres_cutover_final_handoff_closure_package_acknowledgement',
      label: deliveryRecord.payload.request.subject,
      status: postgresCutoverFinalHandoffAcknowledgementStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'postgres_cutover_final_handoff_closure_package_acknowledgement',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'backend',
      'postgres_cutover_final_handoff_closure_package_acknowledgement',
      `Postgres final handoff closure package acknowledgement saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function savePostgresCutoverFinalHandoffClosurePackageAcknowledgementClosure({
    closureNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    status: PostgresCutoverReminderClosureStatus
    supersededEvidence: string[]
  }) {
    const closedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Infrastructure Reviewer'
    const acknowledgementRecords = backendRecords.filter(
      (record): record is BackendRecord<PostgresCutoverFinalHandoffClosurePackageAcknowledgement> =>
        record.kind === 'postgres_cutover_final_handoff_closure_package_acknowledgement',
    )
    const closurePackages = backendRecords.filter(
      (record): record is BackendRecord<PostgresCutoverFinalHandoffClosurePackage> =>
        record.kind === 'postgres_cutover_final_handoff_closure_package',
    )
    const deliveryEvidence = backendRecords.filter(
      (record): record is BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }> => {
        if (record.kind !== 'notification_delivery') return false
        const payload = record.payload as { request?: NotificationDeliveryPayload }
        return payload.request?.source === 'postgres_cutover_final_handoff_closure_package'
      },
    )
    const metrics = acknowledgementRecords.reduce(
      (summary, record) => {
        summary.totalAcknowledgements += 1
        if (record.payload.status === 'acknowledged') summary.acknowledged += 1
        if (record.payload.status === 'acknowledged_with_actions') summary.acknowledgedWithActions += 1
        if (record.payload.status === 'changes_requested') summary.changesRequested += 1
        if (record.payload.status === 'rejected') summary.rejected += 1
        if (record.payload.closureReady) summary.closureReady += 1
        summary.retainedActions += record.payload.requestedActions.length
        return summary
      },
      {
        totalAcknowledgements: 0,
        acknowledged: 0,
        acknowledgedWithActions: 0,
        changesRequested: 0,
        rejected: 0,
        closureReady: 0,
        retainedActions: 0,
      },
    )
    const sourceActions = acknowledgementRecords.flatMap((record) => record.payload.requestedActions)
    const actions = [...sourceActions, ...retainedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const supersededAcknowledgements = acknowledgementRecords.slice(1).map((record) => ({
      acknowledgementId: record.payload.acknowledgementId,
      reviewer: record.payload.reviewer,
      reviewerRole: record.payload.reviewerRole,
      status: record.payload.status,
      acknowledgedAt: record.payload.acknowledgedAt,
      evidence: record.payload.evidence,
    }))
    const payload: PostgresCutoverFinalHandoffClosurePackageAcknowledgementClosure = {
      closureId: `postgres_cutover_final_handoff_closure_package_ack_closure:${closedAt}`,
      closedAt,
      reviewer: reviewerName,
      status,
      acknowledgementRecords,
      closurePackages,
      deliveryEvidence,
      metrics,
      retainedActions: actions,
      closureNotes: closureNotes.trim() || 'No final handoff closure package acknowledgement closeout notes recorded.',
      supersededEvidence,
      supersededAcknowledgements,
      sourceRecordCounts: {
        acknowledgementRecords: acknowledgementRecords.length,
        closurePackages: closurePackages.length,
        deliveryRecords: deliveryEvidence.length,
        supersededAcknowledgements: supersededAcknowledgements.length,
      },
      auditHistory: [
        {
          action: 'final_handoff_closure_package_acknowledgement_closed',
          actor: reviewerName,
          timestamp: closedAt,
          status,
          summary: `${reviewerName} recorded ${postgresCutoverReminderClosureLabel(status)} closeout for final handoff closure package acknowledgements.`,
        },
      ],
      evidence: `${reviewerName} recorded ${postgresCutoverReminderClosureLabel(status)} closeout for ${acknowledgementRecords.length} final handoff closure package acknowledgement record(s) with ${actions.length} retained action(s) and ${supersededEvidence.length} superseded evidence note(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'postgres_cutover_final_handoff_closure_package_acknowledgement_closure',
      label: 'Final handoff closure package acknowledgement closeout',
      status: postgresCutoverReminderClosureStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'postgres_cutover_final_handoff_closure_package_acknowledgement_closure',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'backend',
      'postgres_cutover_final_handoff_closure_package_acknowledgement_closure',
      `Postgres final handoff closure package acknowledgement closeout saved as backend record v${saved.version}.`,
    )
    return saved
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

  async function saveClosureSlaResponseFollowUpClosure({
    closureNotes,
    retainedActions,
    reviewer,
    routeRecord,
    status,
    supersededEvidence,
  }: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    routeRecord?: BackendRecord<ClosureSlaResponseFollowUpRoute>
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) {
    const closedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || routeRecord?.payload.reviewer || 'Governance Reviewer'
    const routeRecords = backendRecords.filter(
      (record): record is BackendRecord<ClosureSlaResponseFollowUpRoute> =>
        record.kind === 'closure_sla_response_follow_up_route',
    )
    const supersededRoutes = routeRecords
      .filter((record) => record.id !== routeRecord?.id)
      .slice(0, 5)
      .map((record) => ({
        routeId: record.payload.routeId,
        routeVersion: record.version,
        routedAt: record.payload.routedAt,
        status: record.payload.status,
        followUpStage: record.payload.followUpStage,
        evidence: record.payload.evidence,
      }))
    const actions = retainedActions.length > 0
      ? retainedActions
      : routeRecord?.payload.requestedActions ?? ['No retained follow-up actions were recorded.']
    const payload: ClosureSlaResponseFollowUpClosure = {
      closureId: `closure_sla_response_follow_up_closure:${routeRecord?.id ?? 'unlinked'}:${closedAt}`,
      closedAt,
      reviewer: reviewerName,
      status,
      routeRecordId: routeRecord?.id,
      routeId: routeRecord?.payload.routeId,
      routeStatus: routeRecord?.payload.status,
      followUpStage: routeRecord?.payload.followUpStage,
      acknowledgementRecordId: routeRecord?.payload.acknowledgementRecordId,
      acknowledgementId: routeRecord?.payload.acknowledgementId,
      deliverySubject: routeRecord?.payload.deliverySubject,
      packageId: routeRecord?.payload.packageId,
      packageVersion: routeRecord?.payload.packageVersion,
      routedOwners: routeRecord?.payload.routedOwners ?? [],
      retainedActions: actions,
      closureNotes: closureNotes.trim() || 'No Closure SLA follow-up closure notes recorded.',
      supersededRoutes,
      supersededEvidence: supersededEvidence.length > 0
        ? supersededEvidence
        : supersededRoutes.map((route) => route.evidence),
      sourceMetrics: routeRecord?.payload.sourceMetrics,
      auditHistory: [
        {
          action: 'closure_sla_follow_up_closed',
          actor: reviewerName,
          timestamp: closedAt,
          status,
          summary: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} for ${routeRecord?.payload.deliverySubject ?? 'Closure SLA follow-up route'}.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} for ${routeRecord?.payload.deliverySubject ?? 'Closure SLA follow-up route'} with ${actions.length} retained action(s) and ${supersededRoutes.length} superseded route record(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_sla_response_follow_up_closure',
      label: routeRecord?.payload.deliverySubject ?? 'Closure SLA follow-up closure',
      status: closureSlaFollowUpClosureStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_sla_response_follow_up_closure',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_sla_follow_up_closure',
      `Closure SLA response follow-up closure saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveClosureSlaFollowUpClosureExportPackage({
    download,
    packagePayload,
  }: {
    download: boolean
    packagePayload: ClosureSlaFollowUpClosureExportPackage
  }) {
    const saved = await backendClient.saveRecord({
      kind: 'closure_sla_follow_up_closure_export_package',
      label: 'Closure SLA follow-up closure export package',
      status: packagePayload.status,
      summary: packagePayload.evidence,
      payload: packagePayload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_sla_follow_up_closure_export_package',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    if (download) {
      downloadJson('tracs-closure-sla-follow-up-closure-export-package.json', packagePayload)
    }
    record(
      'notification',
      download ? 'closure_sla_follow_up_closure_export_package_download' : 'closure_sla_follow_up_closure_export_package_save',
      `Closure SLA follow-up closure export package saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function deliverClosureSlaFollowUpClosureExportPackage({
    download,
    packagePayload,
  }: {
    download: boolean
    packagePayload: ClosureSlaFollowUpClosureExportPackage
  }) {
    const saved = await saveClosureSlaFollowUpClosureExportPackage({ download, packagePayload })
    if (!saved) return
    await deliverNotifications(
      notificationToDeliveryPayload(
        'closure_sla_follow_up_closure_export_package',
        'Closure SLA follow-up closure package',
        {
          notificationId: saved.payload.packageId,
          recipients: saved.payload.governanceReviewers,
          summary: `${saved.payload.governanceReviewers.join(', ')} follow-up closure package includes ${saved.payload.metrics.totalClosures} closure record(s), ${saved.payload.metrics.retainedActions} retained action(s), ${saved.payload.metrics.supersededRoutes} superseded route(s), ${saved.payload.notificationEvidence.length} notification evidence record(s), and ${saved.payload.requiredActions.length} required action(s).`,
          package: saved.payload,
        },
      ),
    )
  }

  async function saveClosureSlaFollowUpClosurePackageAcknowledgement({
    closureReady,
    deliveryRecord,
    requestedActions,
    responseNotes,
    reviewer,
    status,
  }: {
    closureReady: boolean
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) {
    const acknowledgedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const deliveryPackage = (deliveryRecord.payload.request.evidence as { package?: ClosureSlaFollowUpClosureExportPackage })?.package
    const packageRecord = backendRecords.find(
      (record): record is BackendRecord<ClosureSlaFollowUpClosureExportPackage> => {
        if (record.kind !== 'closure_sla_follow_up_closure_export_package') return false
        return (record.payload as ClosureSlaFollowUpClosureExportPackage).packageId === deliveryPackage?.packageId
      },
    )
    const sourceActions = deliveryPackage?.requiredActions ?? []
    const retainedActions = [...sourceActions, ...requestedActions]
      .map((action) => action.trim())
      .filter((action, index, actions) => action.length > 0 && actions.indexOf(action) === index)
    const channelSummary = deliveryRecord.payload.result.channelResults
      .map((result) => `${titleize(result.channel)} ${result.mode}/${result.status}`)
      .join(', ')
    const payload: ClosureSlaFollowUpClosurePackageAcknowledgement = {
      acknowledgementId: `closure_sla_follow_up_closure_package_ack:${deliveryRecord.id}:${acknowledgedAt}`,
      acknowledgedAt,
      deliveryRecordId: deliveryRecord.id,
      deliveryId: deliveryRecord.payload.result.deliveryId,
      deliverySubject: deliveryRecord.payload.request.subject,
      packageId: deliveryPackage?.packageId,
      packageRecordId: packageRecord?.id,
      packageVersion: packageRecord?.version,
      reviewer: reviewerName,
      status,
      closureReady,
      responseNotes: responseNotes.trim() || 'No Closure SLA follow-up closure package acknowledgement notes recorded.',
      requestedActions: retainedActions,
      channelSummary,
      packageStatus: deliveryPackage?.status,
      sourceMetrics: deliveryPackage?.metrics,
      sourceRequiredActions: sourceActions,
      sourceClosureRecordCount: deliveryPackage?.closureRecords.length ?? 0,
      auditHistory: [
        {
          action: 'closure_sla_follow_up_closure_package_acknowledged',
          actor: reviewerName,
          timestamp: acknowledgedAt,
          status,
          closureReady,
          summary: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaDeliveryAcknowledgementLabel(status)} for ${deliveryRecord.payload.request.subject}. ${retainedActions.length} requested action(s) retained.`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_sla_follow_up_closure_package_acknowledgement',
      label: deliveryRecord.payload.request.subject,
      status: closureSlaDeliveryAcknowledgementStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_sla_follow_up_closure_package_acknowledgement',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_sla_follow_up_closure_package_acknowledgement',
      `Closure SLA follow-up closure package acknowledgement saved as backend record v${saved.version}.`,
    )
    return saved
  }

  async function saveClosureSlaFollowUpClosurePackageAcknowledgementClosure({
    closureNotes,
    retainedActions,
    reviewer,
    status,
    supersededEvidence,
  }: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) {
    const closedAt = new Date().toISOString()
    const reviewerName = reviewer.trim() || 'Governance Reviewer'
    const acknowledgementRecords = backendRecords.filter(
      (record): record is BackendRecord<ClosureSlaFollowUpClosurePackageAcknowledgement> =>
        record.kind === 'closure_sla_follow_up_closure_package_acknowledgement',
    )
    const closurePackages = backendRecords.filter(
      (record): record is BackendRecord<ClosureSlaFollowUpClosureExportPackage> =>
        record.kind === 'closure_sla_follow_up_closure_export_package',
    )
    const deliveryEvidence = backendRecords.filter(
      (record): record is BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }> => {
        if (record.kind !== 'notification_delivery') return false
        const payload = record.payload as { request?: NotificationDeliveryPayload }
        return payload.request?.source === 'closure_sla_follow_up_closure_export_package'
      },
    )
    const metrics = acknowledgementRecords.reduce(
      (summary, record) => {
        summary.totalAcknowledgements += 1
        if (record.payload.status === 'acknowledged') summary.acknowledged += 1
        if (record.payload.status === 'approved') summary.approved += 1
        if (record.payload.status === 'changes_requested') summary.changesRequested += 1
        if (record.payload.status === 'rejected') summary.rejected += 1
        if (record.payload.closureReady) summary.closureReady += 1
        summary.retainedActions += record.payload.requestedActions.length
        return summary
      },
      {
        totalAcknowledgements: 0,
        acknowledged: 0,
        approved: 0,
        changesRequested: 0,
        rejected: 0,
        closureReady: 0,
        retainedActions: 0,
      },
    )
    const sourceActions = acknowledgementRecords.flatMap((record) => record.payload.requestedActions)
    const actions = [...sourceActions, ...retainedActions]
      .map((action) => action.trim())
      .filter((action, index, values) => action.length > 0 && values.indexOf(action) === index)
    const supersededAcknowledgements = acknowledgementRecords.slice(1).map((record) => ({
      acknowledgementId: record.payload.acknowledgementId,
      reviewer: record.payload.reviewer,
      status: record.payload.status,
      acknowledgedAt: record.payload.acknowledgedAt,
      evidence: record.payload.evidence,
    }))
    const payload: ClosureSlaFollowUpClosurePackageAcknowledgementClosure = {
      closureId: `closure_sla_follow_up_closure_package_ack_closure:${closedAt}`,
      closedAt,
      reviewer: reviewerName,
      status,
      acknowledgementRecords,
      closurePackages,
      deliveryEvidence,
      metrics,
      retainedActions: actions,
      closureNotes: closureNotes.trim() || 'No Closure SLA follow-up closure package acknowledgement closure notes recorded.',
      supersededEvidence,
      supersededAcknowledgements,
      sourceRecordCounts: {
        acknowledgementRecords: acknowledgementRecords.length,
        closurePackages: closurePackages.length,
        deliveryRecords: deliveryEvidence.length,
        supersededAcknowledgements: supersededAcknowledgements.length,
      },
      auditHistory: [
        {
          action: 'closure_sla_follow_up_closure_package_acknowledgement_closed',
          actor: reviewerName,
          timestamp: closedAt,
          status,
          summary: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} closure for Closure SLA follow-up closure package acknowledgements.`,
        },
      ],
      evidence: `${reviewerName} recorded ${closureSlaFollowUpClosureLabel(status)} closure for ${acknowledgementRecords.length} Closure SLA follow-up closure package acknowledgement record(s) with ${actions.length} retained action(s) and ${supersededEvidence.length} superseded evidence note(s).`,
    }
    const saved = await backendClient.saveRecord({
      kind: 'closure_sla_follow_up_closure_package_acknowledgement_closure',
      label: 'Closure SLA follow-up closure package acknowledgement closure',
      status: closureSlaFollowUpClosureStatusLevel(status),
      summary: payload.evidence,
      payload,
    })
    await refreshBackend()
    saveVersion(
      createSavedVersion({
        kind: 'closure_sla_follow_up_closure_package_acknowledgement_closure',
        label: saved.label,
        status: saved.status,
        summary: saved.summary,
        payload: saved,
      }),
    )
    record(
      'notification',
      'closure_sla_follow_up_closure_package_acknowledgement_closure',
      `Closure SLA follow-up closure package acknowledgement closure saved as backend record v${saved.version}.`,
    )
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

        <Suspense fallback={<div className="empty-state compact">Loading workspace...</div>}>
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
            approvalRecords={backendRecords.filter(
              (record): record is BackendRecord<CrossIndustryTemplatePackageApproval> =>
                record.kind === 'cross_industry_template_package_approval',
            )}
            assetRegistry={assetRegistry}
            config={config}
            deliveryRecords={backendRecords.filter(
              (record): record is BackendRecord<CrossIndustryTemplatePackageDelivery> =>
                record.kind === 'cross_industry_template_package_delivery',
            )}
            onActivateTemplate={activateTemplateRecord}
            onPromoteAsset={promoteTemplateAsset}
            onRefreshAssets={refreshAssetRegistry}
            onSavePackageApproval={saveTemplatePackageApproval}
            onSavePackageDelivery={saveTemplatePackageDelivery}
            onUpdateTemplate={updateTemplateRecord}
            reports={reportCatalog}
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
            backendRecords={backendRecords}
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
            mappings={config.mappings}
            mappingResults={mappingResults}
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
            workflowDefinitions={config.workflowDefinitions}
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
            workflowDefinitions={config.workflowDefinitions}
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
            notificationRetryQueueAcknowledgementRecords={backendRecords.filter(
              (record): record is BackendRecord<NotificationRetryQueueAcknowledgement> =>
                record.kind === 'notification_retry_queue_acknowledgement',
            )}
            notificationRetryQueueAcknowledgementClosurePackageRecords={backendRecords.filter(
              (record): record is BackendRecord<NotificationRetryQueueAcknowledgementClosurePackage> =>
                record.kind === 'notification_retry_queue_acknowledgement_closure_package',
            )}
            notificationRetryQueueAcknowledgementClosurePackageAcknowledgementRecords={backendRecords.filter(
              (record): record is BackendRecord<NotificationRetryQueueAcknowledgementClosurePackageAcknowledgement> =>
                record.kind === 'notification_retry_queue_acknowledgement_closure_package_acknowledgement',
            )}
            notificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosureRecords={backendRecords.filter(
              (record): record is BackendRecord<NotificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosure> =>
                record.kind === 'notification_retry_queue_acknowledgement_closure_package_acknowledgement_closure',
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
            closureSlaResponseFollowUpClosureRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosureSlaResponseFollowUpClosure> =>
                record.kind === 'closure_sla_response_follow_up_closure',
            )}
            closureSlaFollowUpClosureExportPackageRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosureSlaFollowUpClosureExportPackage> =>
                record.kind === 'closure_sla_follow_up_closure_export_package',
            )}
            closureSlaFollowUpClosurePackageAcknowledgementRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosureSlaFollowUpClosurePackageAcknowledgement> =>
                record.kind === 'closure_sla_follow_up_closure_package_acknowledgement',
            )}
            closureSlaFollowUpClosurePackageAcknowledgementClosureRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosureSlaFollowUpClosurePackageAcknowledgementClosure> =>
                record.kind === 'closure_sla_follow_up_closure_package_acknowledgement_closure',
            )}
            closurePackageAcknowledgementCloseoutExportPackageRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutExportPackage> =>
                record.kind === 'closure_package_acknowledgement_closeout_export_package',
            )}
            closurePackageAcknowledgementCloseoutExportPackageAcknowledgementRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutExportPackageAcknowledgement> =>
                record.kind === 'closure_package_acknowledgement_closeout_export_package_acknowledgement',
            )}
            closurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosureRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosure> =>
                record.kind === 'closure_package_acknowledgement_closeout_export_package_acknowledgement_closure',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosureRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosure> =>
                record.kind === 'closure_package_acknowledgement_closeout_notification_closure',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosurePackageRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackage> =>
                record.kind === 'closure_package_acknowledgement_closeout_notification_closure_package',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement> =>
                record.kind === 'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosure> =>
                record.kind ===
                'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage> =>
                record.kind ===
                'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement> =>
                record.kind ===
                'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_acknowledgement',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidenceRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence> =>
                record.kind ===
                'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_acknowledgement_final_evidence',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgement> =>
                record.kind ===
                'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure> =>
                record.kind ===
                'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgement> =>
                record.kind ===
                'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure> =>
                record.kind ===
                'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgement> =>
                record.kind ===
                'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence> =>
                record.kind ===
                'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgement> =>
                record.kind ===
                'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence> =>
                record.kind ===
                'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement> =>
                record.kind ===
                'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure> =>
                record.kind ===
                'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgement> =>
                record.kind ===
                'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence> =>
                record.kind ===
                'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement> =>
                record.kind ===
                'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement',
            )}
            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidenceRecords={backendRecords.filter(
              (record): record is BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidence> =>
                record.kind ===
                'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_final_evidence',
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
            postgresCutoverFinalHandoffAcknowledgementRecords={backendRecords.filter(
              (record): record is BackendRecord<PostgresCutoverFinalHandoffAcknowledgement> =>
                record.kind === 'postgres_cutover_final_handoff_acknowledgement',
            )}
            postgresCutoverFinalHandoffClosurePackageRecords={backendRecords.filter(
              (record): record is BackendRecord<PostgresCutoverFinalHandoffClosurePackage> =>
                record.kind === 'postgres_cutover_final_handoff_closure_package',
            )}
            postgresCutoverFinalHandoffClosurePackageAcknowledgementRecords={backendRecords.filter(
              (record): record is BackendRecord<PostgresCutoverFinalHandoffClosurePackageAcknowledgement> =>
                record.kind === 'postgres_cutover_final_handoff_closure_package_acknowledgement',
            )}
            postgresCutoverFinalHandoffClosurePackageAcknowledgementClosureRecords={backendRecords.filter(
              (record): record is BackendRecord<PostgresCutoverFinalHandoffClosurePackageAcknowledgementClosure> =>
                record.kind === 'postgres_cutover_final_handoff_closure_package_acknowledgement_closure',
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
            onDeliverPostgresCutoverFinalHandoffClosurePackage={deliverPostgresCutoverFinalHandoffClosurePackage}
            onDeliverClosureSlaExportPackage={deliverClosureSlaExportPackage}
            onDeliverClosureSlaFollowUpClosureExportPackage={deliverClosureSlaFollowUpClosureExportPackage}
            onDeliverNotificationRetryQueueExportPackage={deliverNotificationRetryQueueExportPackage}
            onDeliverNotificationRetryQueueAcknowledgementClosurePackage={deliverNotificationRetryQueueAcknowledgementClosurePackage}
            onDeliverClosurePackageAcknowledgementCloseoutExportPackage={
              deliverClosurePackageAcknowledgementCloseoutExportPackage
            }
            onSaveClosureSlaDeliveryAcknowledgement={saveClosureSlaDeliveryAcknowledgement}
            onSaveClosureSlaResponseFollowUpRoute={saveClosureSlaResponseFollowUpRoute}
            onSaveClosureSlaResponseFollowUpClosure={saveClosureSlaResponseFollowUpClosure}
            onSaveClosureSlaFollowUpClosureExportPackage={saveClosureSlaFollowUpClosureExportPackage}
            onSaveClosureSlaFollowUpClosurePackageAcknowledgement={saveClosureSlaFollowUpClosurePackageAcknowledgement}
            onSaveClosureSlaFollowUpClosurePackageAcknowledgementClosure={
              saveClosureSlaFollowUpClosurePackageAcknowledgementClosure
            }
            onSaveClosurePackageAcknowledgementCloseoutExportPackage={
              saveClosurePackageAcknowledgementCloseoutExportPackage
            }
            onSaveClosurePackageAcknowledgementCloseoutExportPackageAcknowledgement={
              saveClosurePackageAcknowledgementCloseoutExportPackageAcknowledgement
            }
            onSaveClosurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosure={
              saveClosurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosure
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosure={
              saveClosurePackageAcknowledgementCloseoutNotificationClosure
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackage={
              saveClosurePackageAcknowledgementCloseoutNotificationClosurePackage
            }
            onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackage={
              deliverClosurePackageAcknowledgementCloseoutNotificationClosurePackage
            }
            onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage={
              deliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage
            }
            onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence={
              deliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence
            }
            onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure={
              deliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure
            }
            onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure={
              deliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure
            }
            onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence={
              deliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence
            }
            onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence={
              deliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence
            }
            onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure={
              deliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure
            }
            onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence={
              deliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement={
              saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosure={
              saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosure
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage={
              saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement={
              saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence={
              saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgement={
              saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgement
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure={
              saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgement={
              saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgement
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure={
              saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgement={
              saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgement
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence={
              saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgement={
              saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgement
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence={
              saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement={
              saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure={
              saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgement={
              saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgement
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence={
              saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement={
              saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement
            }
            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidence={
              saveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidence
            }
            onSaveNotificationDeliveryRetryControl={saveNotificationDeliveryRetryControl}
            onSaveNotificationRetryQueueExportPackage={saveNotificationRetryQueueExportPackage}
            onSaveNotificationRetryQueueAcknowledgement={saveNotificationRetryQueueAcknowledgement}
            onSaveNotificationRetryQueueAcknowledgementClosurePackageAcknowledgement={
              saveNotificationRetryQueueAcknowledgementClosurePackageAcknowledgement
            }
            onSaveNotificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosure={
              saveNotificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosure
            }
            onSaveNotificationRetryQueueAcknowledgementClosurePackage={saveNotificationRetryQueueAcknowledgementClosurePackage}
            onSaveNotificationApprovalRenewalClosure={saveNotificationApprovalRenewalClosure}
            onSaveNotificationClosureExportPackage={saveNotificationClosureExportPackage}
            onSaveClosureSlaExportPackage={saveClosureSlaExportPackage}
            onSaveNotificationApprovalRenewalRoute={saveNotificationApprovalRenewalRoute}
            onSavePostgresCutoverAcknowledgement={savePostgresCutoverAcknowledgement}
            onSavePostgresCutoverOwnerReminder={savePostgresCutoverOwnerReminder}
            onSavePostgresCutoverReminderClosure={savePostgresCutoverReminderClosure}
            onSavePostgresCutoverClosurePackage={savePostgresCutoverClosurePackage}
            onSavePostgresCutoverFinalHandoffAcknowledgement={savePostgresCutoverFinalHandoffAcknowledgement}
            onSavePostgresCutoverFinalHandoffClosurePackageAcknowledgement={
              savePostgresCutoverFinalHandoffClosurePackageAcknowledgement
            }
            onSavePostgresCutoverFinalHandoffClosurePackageAcknowledgementClosure={
              savePostgresCutoverFinalHandoffClosurePackageAcknowledgementClosure
            }
            onSavePostgresCutoverFinalHandoffClosurePackage={savePostgresCutoverFinalHandoffClosurePackage}
            onSavePostgresCutoverApproval={savePostgresCutoverApproval}
            onSavePostgresCutoverChecklistPackage={savePostgresCutoverChecklistPackage}
            onSaveSnapshot={saveBackendSnapshot}
            onSaveNotificationLiveApproval={saveNotificationLiveChannelApproval}
            onSaveWorkflowInstanceExportRetention={saveWorkflowInstanceExportRetention}
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
        </Suspense>
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
  const selectedLoadConnector =
    connectorEntries.find(([connectorId]) =>
      activeMappingId === 'quality_event' ? connectorId === canonicalLoadConnectorId : connectorId === mapping.source_connector,
    )?.[1]
  const canonicalLoadExecutionMode =
    activeMappingId === 'quality_event' ? 'connector_profile' : 'approved_external_reference'
  const latestLoadStatus = latestCanonicalLoad?.status ?? (externalMappingApproved ? 'warning' : 'blocking')
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

      <section className="panel canonical-load-runner-panel">
        <PanelHeader
          icon={Database}
          title="Connector-Backed Canonical Load Runner"
          subtitle="Bounded v1 runner for configured mappings, canonical objects, traceability links, and retained load evidence."
        />
        <div className="metadata-grid">
          <Metadata label="Selected mapping" value={titleize(activeMappingId)} />
          <Metadata label="Source connector" value={selectedLoadConnector?.display_name ?? mapping.source_connector} />
          <Metadata label="Target object" value={mapping.object} />
          <Metadata label="Execution mode" value={titleize(canonicalLoadExecutionMode)} />
          <Metadata label="Object count" value={String(latestCanonicalLoad?.payload.objectCount ?? 0)} />
          <Metadata label="Traceability links" value={String(latestCanonicalLoad?.payload.linkCount ?? 0)} />
          <Metadata label="Warnings" value={String(latestCanonicalLoad?.payload.warnings.length ?? 0)} />
          <Metadata label="Latest load status" value={titleize(latestLoadStatus)} />
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

export default App
