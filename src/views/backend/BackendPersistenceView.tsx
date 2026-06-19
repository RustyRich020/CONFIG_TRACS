import {
Activity,
Bell,
ClipboardCheck,
Database,
Download,
History,
Package,
PlugZap,
Route,
ServerCog,
ShieldCheck,
} from 'lucide-react'
import { useMemo,useState } from 'react'
import { BackendRetryCloseoutGovernancePanel } from './BackendRetryCloseoutGovernancePanel'
import { ClosureSlaDashboardPanel } from '../../components/ClosureSlaDashboardPanel'
import { ClosureSlaFollowUpClosurePackageAcknowledgementPanel } from '../../components/ClosureSlaFollowUpClosurePackageAcknowledgementPanel'
import { ClosureSlaFollowUpClosurePackagePanel } from '../../components/ClosureSlaFollowUpClosurePackagePanel'
import { ClosureSlaFollowUpClosurePanel } from '../../components/ClosureSlaFollowUpClosurePanel'
import { ClosureSlaFollowUpRoutingPanel } from '../../components/ClosureSlaFollowUpRoutingPanel'
import { ClosureSlaGovernanceResponsePanel } from '../../components/ClosureSlaGovernanceResponsePanel'
import { ClosureSlaHistoryListsPanel } from '../../components/ClosureSlaHistoryListsPanel'
import { ConnectorGlyph,Metadata,PanelHeader,StatusChip } from '../../components/common'
import {
PostgresCutoverAcknowledgementHistoryPanel,
PostgresCutoverClosurePackageHistoryPanel,
PostgresCutoverOwnerReminderHistoryPanel,
PostgresCutoverPackageHistoryPanel,
PostgresCutoverReminderClosureHistoryPanel,
} from '../../components/PostgresCutoverHistoryPanels'
import { PostgresImportReconciliationPanel } from '../../components/PostgresImportReconciliationPanel'
import { RetainedPackageCatalogPanel } from '../../components/RetainedPackageCatalogPanel'
import { WorkflowLineageRetentionPanel } from '../../components/WorkflowLineageRetentionPanel'
import {
downloadJson,
} from '../../foundation'
import type { GovernanceWorkflowInstance } from '../../governanceWorkflow'
import {
createWorkflowInstanceExportPackage,
deriveGovernanceWorkflowLineage,
deriveGovernanceWorkflowQueue,
} from '../../governanceWorkflow'
import type {
AdapterContract,
AdapterDryRunResult,
AppConfig,
BackendHealth,
BackendRecord,
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
RecordStoreSchema,
StatusLevel,
TraceabilityExportRetentionClass,
TraceabilityResponseClosureRoute,
TraceabilityResponseClosureRouteStatus,
WorkflowInstanceExportRetention
} from '../../types'
import {
createWorkflowDefinitionPromotionPackage,
validateWorkflowDefinitionDraft,
} from '../../workflowDefinitionDraft'
function titleize(value?: string | null) {
  return (value ?? 'unknown')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function listFromText(value: string) {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function cloneWorkflowDefinition(definition: AppConfig['workflowDefinitions'][string]) {
  return JSON.parse(JSON.stringify(definition)) as AppConfig['workflowDefinitions'][string]
}

function formatAllowedNextStages(definition: AppConfig['workflowDefinitions'][string]) {
  return Object.entries(definition.allowed_next_stages)
    .map(([stage, nextStages]) => `${stage}: ${(nextStages ?? []).join(', ')}`)
    .join('\n')
}

function parseAllowedNextStages(value: string): AppConfig['workflowDefinitions'][string]['allowed_next_stages'] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<AppConfig['workflowDefinitions'][string]['allowed_next_stages']>((current, line) => {
      const [stage, nextStages = ''] = line.split(':')
      if (!stage?.trim()) return current
      current[stage.trim() as keyof AppConfig['workflowDefinitions'][string]['allowed_next_stages']] =
        listFromText(nextStages) as AppConfig['workflowDefinitions'][string]['stages']
      return current
    }, {})
}

function mostSevereStatus(statuses: StatusLevel[]): StatusLevel {
  if (statuses.includes('blocking')) return 'blocking'
  if (statuses.includes('warning')) return 'warning'
  return 'pass'
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

function postgresCutoverApprovalStatusLevel(status: PostgresCutoverApprovalStatus, gateStatus: StatusLevel): StatusLevel {
  if (status === 'rejected') return 'blocking'
  if (status === 'approved') return gateStatus
  if (status === 'approved_with_conditions') return gateStatus === 'blocking' ? 'blocking' : 'warning'
  return 'warning'
}

function postgresCutoverApprovalLabel(status: PostgresCutoverApprovalStatus) {
  return status === 'approved_with_conditions' ? 'Approved with conditions' : titleize(status)
}

function postgresCutoverAcknowledgementLabel(status: PostgresCutoverAcknowledgementStatus) {
  if (status === 'acknowledged_with_actions') return 'Acknowledged with actions'
  return titleize(status)
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

export function BackendPersistenceView({
  adapterContracts,
  adapterDryRuns,
  backendHealth,
  backendRecords,
  workflowDefinitions,
  closurePackageAcknowledgementCloseoutExportPackageAcknowledgementRecords,
  closurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosureRecords,
  closurePackageAcknowledgementCloseoutNotificationClosureRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidenceRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidenceRecords,
  closurePackageAcknowledgementCloseoutExportPackageRecords,
  closureSlaDeliveryAcknowledgementRecords,
  closureSlaExportPackageRecords,
  closureSlaFollowUpClosurePackageAcknowledgementClosureRecords,
  closureSlaFollowUpClosurePackageAcknowledgementRecords,
  closureSlaFollowUpClosureExportPackageRecords,
  closureSlaResponseFollowUpClosureRecords,
  closureSlaResponseFollowUpRouteRecords,
  connectorEntries,
  notificationApprovalRecords,
  notificationClosureExportPackageRecords,
  notificationDeliveryRetryRecords,
  notificationRetryQueueAcknowledgementRecords,
  notificationRetryQueueAcknowledgementClosurePackageAcknowledgementRecords,
  notificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosureRecords,
  notificationRetryQueueAcknowledgementClosurePackageRecords,
  notificationRetryQueueExportPackageRecords,
  notificationRenewalRecords,
  notificationRenewalClosureRecords,
  traceabilityClosureRouteRecords,
  postgresCutoverApprovalRecords,
  postgresCutoverAcknowledgementRecords,
  postgresCutoverOwnerReminderRecords,
  postgresCutoverReminderClosureRecords,
  postgresCutoverClosurePackageRecords,
  postgresCutoverFinalHandoffAcknowledgementRecords,
  postgresCutoverFinalHandoffClosurePackageAcknowledgementRecords,
  postgresCutoverFinalHandoffClosurePackageAcknowledgementClosureRecords,
  postgresCutoverFinalHandoffClosurePackageRecords,
  postgresCutoverPackageRecords,
  onRefresh,
  onRunAdapterDryRun,
  onRunNotificationSmokeFixtures,
  onDeliverNotificationApprovalRenewalRoute,
  onDeliverNotificationClosureExportPackage,
  onDeliverPostgresCutoverAcknowledgement,
  onDeliverPostgresCutoverOwnerReminder,
  onDeliverPostgresCutoverClosurePackage,
  onDeliverPostgresCutoverFinalHandoffClosurePackage,
  onDeliverClosureSlaExportPackage,
  onDeliverClosureSlaFollowUpClosureExportPackage,
  onDeliverNotificationRetryQueueExportPackage,
  onDeliverNotificationRetryQueueAcknowledgementClosurePackage,
  onDeliverClosurePackageAcknowledgementCloseoutExportPackage,
  onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackage,
  onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
  onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence,
  onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure,
  onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure,
  onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence,
  onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence,
  onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure,
  onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence,
  onSaveClosureSlaDeliveryAcknowledgement,
  onSaveClosureSlaResponseFollowUpClosure,
  onSaveClosureSlaFollowUpClosureExportPackage,
  onSaveClosureSlaFollowUpClosurePackageAcknowledgementClosure,
  onSaveClosurePackageAcknowledgementCloseoutExportPackage,
  onSaveClosurePackageAcknowledgementCloseoutExportPackageAcknowledgement,
  onSaveClosurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosure,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosure,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackage,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosure,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgement,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgement,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgement,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgement,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgement,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidence,
  onSaveClosureSlaFollowUpClosurePackageAcknowledgement,
  onSaveClosureSlaResponseFollowUpRoute,
  onSaveNotificationDeliveryRetryControl,
  onSaveNotificationRetryQueueAcknowledgement,
  onSaveNotificationRetryQueueAcknowledgementClosurePackageAcknowledgement,
  onSaveNotificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosure,
  onSaveNotificationRetryQueueAcknowledgementClosurePackage,
  onSaveNotificationRetryQueueExportPackage,
  onSaveNotificationApprovalRenewalClosure,
  onSaveClosureSlaExportPackage,
  onSaveNotificationClosureExportPackage,
  onSaveNotificationApprovalRenewalRoute,
  onSavePostgresCutoverAcknowledgement,
  onSavePostgresCutoverOwnerReminder,
  onSavePostgresCutoverReminderClosure,
  onSavePostgresCutoverClosurePackage,
  onSavePostgresCutoverFinalHandoffAcknowledgement,
  onSavePostgresCutoverFinalHandoffClosurePackageAcknowledgement,
  onSavePostgresCutoverFinalHandoffClosurePackageAcknowledgementClosure,
  onSavePostgresCutoverFinalHandoffClosurePackage,
  onSavePostgresCutoverApproval,
  onSavePostgresCutoverChecklistPackage,
  onSaveSnapshot,
  onSaveNotificationLiveApproval,
  onSaveWorkflowInstanceExportRetention,
  postgresMigrationChecklist,
  storageSchema,
}: {
  adapterContracts: AdapterContract[]
  adapterDryRuns: Record<string, AdapterDryRunResult>
  backendHealth: BackendHealth | null
  backendRecords: BackendRecord[]
  workflowDefinitions: AppConfig['workflowDefinitions']
  closurePackageAcknowledgementCloseoutExportPackageAcknowledgementRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutExportPackageAcknowledgement>[]
  closurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosureRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosure>[]
  closurePackageAcknowledgementCloseoutNotificationClosureRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosure>[]
  closurePackageAcknowledgementCloseoutNotificationClosurePackageRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackage>[]
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement>[]
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosure>[]
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage>[]
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement>[]
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidenceRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence>[]
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgement>[]
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure>[]
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgement>[]
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure>[]
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgement>[]
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence>[]
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgement>[]
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence>[]
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement>[]
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure>[]
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgement>[]
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence>[]
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement>[]
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidenceRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidence>[]
  closurePackageAcknowledgementCloseoutExportPackageRecords: BackendRecord<ClosurePackageAcknowledgementCloseoutExportPackage>[]
  closureSlaDeliveryAcknowledgementRecords: BackendRecord<ClosureSlaDeliveryAcknowledgement>[]
  closureSlaExportPackageRecords: BackendRecord<ClosureSlaExportPackage>[]
  closureSlaFollowUpClosurePackageAcknowledgementClosureRecords: BackendRecord<ClosureSlaFollowUpClosurePackageAcknowledgementClosure>[]
  closureSlaFollowUpClosurePackageAcknowledgementRecords: BackendRecord<ClosureSlaFollowUpClosurePackageAcknowledgement>[]
  closureSlaFollowUpClosureExportPackageRecords: BackendRecord<ClosureSlaFollowUpClosureExportPackage>[]
  closureSlaResponseFollowUpClosureRecords: BackendRecord<ClosureSlaResponseFollowUpClosure>[]
  closureSlaResponseFollowUpRouteRecords: BackendRecord<ClosureSlaResponseFollowUpRoute>[]
  connectorEntries: [string, AppConfig['connectors']['connectors'][string]][]
  notificationApprovalRecords: BackendRecord<NotificationLiveChannelApproval>[]
  notificationClosureExportPackageRecords: BackendRecord<NotificationClosureExportPackage>[]
  notificationDeliveryRetryRecords: BackendRecord<NotificationDeliveryRetryControl>[]
  notificationRetryQueueAcknowledgementRecords: BackendRecord<NotificationRetryQueueAcknowledgement>[]
  notificationRetryQueueAcknowledgementClosurePackageAcknowledgementRecords: BackendRecord<NotificationRetryQueueAcknowledgementClosurePackageAcknowledgement>[]
  notificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosureRecords: BackendRecord<NotificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosure>[]
  notificationRetryQueueAcknowledgementClosurePackageRecords: BackendRecord<NotificationRetryQueueAcknowledgementClosurePackage>[]
  notificationRetryQueueExportPackageRecords: BackendRecord<NotificationRetryQueueExportPackage>[]
  notificationRenewalRecords: BackendRecord<NotificationApprovalRenewalRoute>[]
  notificationRenewalClosureRecords: BackendRecord<NotificationApprovalRenewalClosure>[]
  traceabilityClosureRouteRecords: BackendRecord<TraceabilityResponseClosureRoute>[]
  postgresCutoverApprovalRecords: BackendRecord<PostgresCutoverApproval>[]
  postgresCutoverAcknowledgementRecords: BackendRecord<PostgresCutoverAcknowledgement>[]
  postgresCutoverOwnerReminderRecords: BackendRecord<PostgresCutoverOwnerReminder>[]
  postgresCutoverReminderClosureRecords: BackendRecord<PostgresCutoverReminderClosure>[]
  postgresCutoverClosurePackageRecords: BackendRecord<PostgresCutoverClosurePackage>[]
  postgresCutoverFinalHandoffAcknowledgementRecords: BackendRecord<PostgresCutoverFinalHandoffAcknowledgement>[]
  postgresCutoverFinalHandoffClosurePackageAcknowledgementRecords: BackendRecord<PostgresCutoverFinalHandoffClosurePackageAcknowledgement>[]
  postgresCutoverFinalHandoffClosurePackageAcknowledgementClosureRecords: BackendRecord<PostgresCutoverFinalHandoffClosurePackageAcknowledgementClosure>[]
  postgresCutoverFinalHandoffClosurePackageRecords: BackendRecord<PostgresCutoverFinalHandoffClosurePackage>[]
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
  onDeliverPostgresCutoverFinalHandoffClosurePackage: (request: {
    download: boolean
    packagePayload: PostgresCutoverFinalHandoffClosurePackage
  }) => void
  onDeliverClosureSlaExportPackage: (request: {
    download: boolean
    packagePayload: ClosureSlaExportPackage
  }) => void
  onDeliverClosureSlaFollowUpClosureExportPackage: (request: {
    download: boolean
    packagePayload: ClosureSlaFollowUpClosureExportPackage
  }) => void
  onDeliverNotificationRetryQueueExportPackage: (request: {
    download: boolean
    packagePayload: NotificationRetryQueueExportPackage
  }) => void
  onDeliverNotificationRetryQueueAcknowledgementClosurePackage: (request: {
    download: boolean
    packagePayload: NotificationRetryQueueAcknowledgementClosurePackage
  }) => void
  onDeliverClosurePackageAcknowledgementCloseoutExportPackage: (request: {
    download: boolean
    packagePayload: ClosurePackageAcknowledgementCloseoutExportPackage
  }) => void
  onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackage: (request: {
    download: boolean
    packagePayload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackage
  }) => void
  onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage: (request: {
    download: boolean
    packagePayload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage
  }) => void
  onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence: (request: {
    download: boolean
    finalEvidenceNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) => void
  onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure: (request: {
    closeoutNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) => void
  onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure: (request: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) => void
  onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence: (request: {
    finalEvidenceNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) => void
  onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence: (request: {
    closeoutNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) => void
  onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure: (request: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) => void
  onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence: (request: {
    closeoutNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
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
  onSaveClosureSlaResponseFollowUpClosure: (request: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    routeRecord?: BackendRecord<ClosureSlaResponseFollowUpRoute>
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) => void
  onSaveClosureSlaFollowUpClosureExportPackage: (request: {
    download: boolean
    packagePayload: ClosureSlaFollowUpClosureExportPackage
  }) => void
  onSaveClosureSlaFollowUpClosurePackageAcknowledgement: (request: {
    closureReady: boolean
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) => void
  onSaveClosureSlaFollowUpClosurePackageAcknowledgementClosure: (request: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutExportPackage: (request: {
    download: boolean
    packagePayload: ClosurePackageAcknowledgementCloseoutExportPackage
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutExportPackageAcknowledgement: (request: {
    closeoutReady: boolean
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: ClosurePackageAcknowledgementCloseoutExportPackageAcknowledgement['reviewerRole']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosure: (request: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosure: (request: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackage: (request: {
    download: boolean
    packagePayload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackage
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement: (request: {
    closureReady: boolean
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement['reviewerRole']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosure: (request: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage: (request: {
    download: boolean
    packagePayload: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement: (request: {
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    finalEvidenceReady: boolean
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement['reviewerRole']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence: (request: {
    download?: boolean
    finalEvidenceNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgement: (request: {
    closeoutReady: boolean
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgement['reviewerRole']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure: (request: {
    closeoutNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgement: (request: {
    acknowledgementClosureReady: boolean
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgement['reviewerRole']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure: (request: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgement: (request: {
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    finalEvidenceReady: boolean
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgement['reviewerRole']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence: (request: {
    download?: boolean
    finalEvidenceNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgement: (request: {
    closeoutReady: boolean
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgement['reviewerRole']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence: (request: {
    closeoutNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement: (request: {
    acknowledgementClosureReady: boolean
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement['reviewerRole']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure: (request: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgement: (request: {
    closeoutReady: boolean
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgement['reviewerRole']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence: (request: {
    closeoutNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement: (request: {
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    finalEvidenceReady: boolean
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement['reviewerRole']
    status: ClosureSlaDeliveryAcknowledgementStatus
  }) => void
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidence: (request: {
    finalEvidenceNotes: string
    retainedActions: string[]
    reviewer: string
    status: ClosureSlaResponseFollowUpClosureStatus
    supersededEvidence: string[]
  }) => void
  onSaveNotificationDeliveryRetryControl: (request: {
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    execute: boolean
    maxRetries: number
    rationale: string
    retryDelayMinutes: number
    retryOnWarnings: boolean
  }) => void
  onSaveNotificationRetryQueueAcknowledgement: (request: {
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    queueClosureReady: boolean
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: NotificationRetryQueueAcknowledgement['reviewerRole']
    status: NotificationRetryQueueAcknowledgementStatus
  }) => void
  onSaveNotificationRetryQueueAcknowledgementClosurePackageAcknowledgement: (request: {
    closureReady: boolean
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: NotificationRetryQueueAcknowledgementClosurePackageAcknowledgement['reviewerRole']
    status: NotificationRetryQueueAcknowledgementStatus
  }) => void
  onSaveNotificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosure: (request: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    status: PostgresCutoverReminderClosureStatus
    supersededEvidence: string[]
  }) => void
  onSaveNotificationRetryQueueAcknowledgementClosurePackage: (request: {
    download: boolean
    packagePayload: NotificationRetryQueueAcknowledgementClosurePackage
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
  onSavePostgresCutoverFinalHandoffAcknowledgement: (request: {
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    finalHandoffReady: boolean
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: PostgresCutoverFinalHandoffAcknowledgement['reviewerRole']
    status: PostgresCutoverFinalHandoffAcknowledgementStatus
  }) => void
  onSavePostgresCutoverFinalHandoffClosurePackageAcknowledgement: (request: {
    closureReady: boolean
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    reviewerRole: PostgresCutoverFinalHandoffClosurePackageAcknowledgement['reviewerRole']
    status: PostgresCutoverFinalHandoffAcknowledgementStatus
  }) => void
  onSavePostgresCutoverFinalHandoffClosurePackageAcknowledgementClosure: (request: {
    closureNotes: string
    retainedActions: string[]
    reviewer: string
    status: PostgresCutoverReminderClosureStatus
    supersededEvidence: string[]
  }) => void
  onSavePostgresCutoverFinalHandoffClosurePackage: (request: {
    download: boolean
    packagePayload: PostgresCutoverFinalHandoffClosurePackage
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
  onSaveWorkflowInstanceExportRetention: (request: {
    instance: GovernanceWorkflowInstance
    retentionClass: TraceabilityExportRetentionClass
    reviewer: string
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
  const [closureSlaFollowUpClosureReviewer, setClosureSlaFollowUpClosureReviewer] = useState(
    'Quality Governance Reviewer',
  )
  const [closureSlaFollowUpClosureStatus, setClosureSlaFollowUpClosureStatus] =
    useState<ClosureSlaResponseFollowUpClosureStatus>('closed_with_actions')
  const [closureSlaFollowUpClosureNotes, setClosureSlaFollowUpClosureNotes] = useState(
    'Closure retained latest owner follow-up route, requested action disposition, and superseded route evidence before governance closeout.',
  )
  const [closureSlaFollowUpSupersededEvidence, setClosureSlaFollowUpSupersededEvidence] = useState(
    'Prior Closure SLA follow-up routes retained as superseded evidence for governance closeout.',
  )
  const [closureSlaClosurePackageReviewers, setClosureSlaClosurePackageReviewers] = useState(
    'Quality Governance Reviewer, Operations Owner',
  )
  const [closureSlaClosurePackageNotes, setClosureSlaClosurePackageNotes] = useState(
    'Package retained Closure SLA follow-up closure records, notification evidence, superseded routes, and retained action disposition for governance review.',
  )
  const [closureSlaClosurePackageAckReviewer, setClosureSlaClosurePackageAckReviewer] = useState(
    'Quality Governance Reviewer',
  )
  const [closureSlaClosurePackageAckStatus, setClosureSlaClosurePackageAckStatus] =
    useState<ClosureSlaDeliveryAcknowledgementStatus>('acknowledged')
  const [closureSlaClosurePackageAckReady, setClosureSlaClosurePackageAckReady] = useState(false)
  const [closureSlaClosurePackageAckNotes, setClosureSlaClosurePackageAckNotes] = useState(
    'Governance reviewer acknowledged the delivered Closure SLA follow-up closure package and retained closeout response evidence.',
  )
  const [closureSlaClosurePackageAckActions, setClosureSlaClosurePackageAckActions] = useState(
    'Disposition retained Closure SLA follow-up closure actions before governance closeout.',
  )
  const [closureSlaClosurePackageAckClosureReviewer, setClosureSlaClosurePackageAckClosureReviewer] = useState(
    'Quality Governance Reviewer',
  )
  const [closureSlaClosurePackageAckClosureStatus, setClosureSlaClosurePackageAckClosureStatus] =
    useState<ClosureSlaResponseFollowUpClosureStatus>('closed_with_actions')
  const [closureSlaClosurePackageAckClosureNotes, setClosureSlaClosurePackageAckClosureNotes] = useState(
    'Closure retained Closure SLA follow-up closure package acknowledgements, delivery evidence, readiness disposition, and retained actions for governance closeout.',
  )
  const [closureSlaClosurePackageAckClosureActions, setClosureSlaClosurePackageAckClosureActions] = useState(
    'Confirm all retained Closure SLA follow-up closure package acknowledgement actions are dispositioned before governance closeout.',
  )
  const [closureSlaClosurePackageAckSupersededEvidence, setClosureSlaClosurePackageAckSupersededEvidence] = useState(
    'Prior Closure SLA follow-up closure package acknowledgements retained as superseded evidence.',
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
  const [postgresFinalHandoffReviewer, setPostgresFinalHandoffReviewer] = useState('Infrastructure Owner')
  const [postgresFinalHandoffReviewerRole, setPostgresFinalHandoffReviewerRole] =
    useState<PostgresCutoverFinalHandoffAcknowledgement['reviewerRole']>('infrastructure_owner')
  const [postgresFinalHandoffStatus, setPostgresFinalHandoffStatus] =
    useState<PostgresCutoverFinalHandoffAcknowledgementStatus>('acknowledged_with_actions')
  const [postgresFinalHandoffReady, setPostgresFinalHandoffReady] = useState(false)
  const [postgresFinalHandoffActions, setPostgresFinalHandoffActions] = useState(
    'Confirm final infrastructure handoff evidence with database, security, and platform owners before production closure.',
  )
  const [postgresFinalHandoffNotes, setPostgresFinalHandoffNotes] = useState(
    'Infrastructure owner reviewed the final handoff delivery and retained response evidence for production cutover closure.',
  )
  const [postgresFinalHandoffClosureReviewers, setPostgresFinalHandoffClosureReviewers] = useState(
    'Infrastructure Owner, Database Administrator, Security Reviewer',
  )
  const [postgresFinalHandoffClosureNotes, setPostgresFinalHandoffClosureNotes] = useState(
    'Closure package retained final handoff acknowledgement responses, delivery evidence, readiness disposition, and retained actions for production cutover closeout.',
  )
  const [postgresFinalHandoffClosurePackageAckReviewer, setPostgresFinalHandoffClosurePackageAckReviewer] =
    useState('Infrastructure Owner')
  const [postgresFinalHandoffClosurePackageAckReviewerRole, setPostgresFinalHandoffClosurePackageAckReviewerRole] =
    useState<PostgresCutoverFinalHandoffClosurePackageAcknowledgement['reviewerRole']>('infrastructure_owner')
  const [postgresFinalHandoffClosurePackageAckStatus, setPostgresFinalHandoffClosurePackageAckStatus] =
    useState<PostgresCutoverFinalHandoffAcknowledgementStatus>('acknowledged_with_actions')
  const [postgresFinalHandoffClosurePackageReady, setPostgresFinalHandoffClosurePackageReady] = useState(false)
  const [postgresFinalHandoffClosurePackageAckActions, setPostgresFinalHandoffClosurePackageAckActions] = useState(
    'Confirm final infrastructure handoff closure evidence with database, security, and platform owners before production closure.',
  )
  const [postgresFinalHandoffClosurePackageAckNotes, setPostgresFinalHandoffClosurePackageAckNotes] = useState(
    'Infrastructure owner acknowledged the final handoff acknowledgement closure package delivery and retained closeout response evidence.',
  )
  const [postgresFinalHandoffClosurePackageAckClosureReviewer, setPostgresFinalHandoffClosurePackageAckClosureReviewer] =
    useState('Infrastructure Owner')
  const [postgresFinalHandoffClosurePackageAckClosureStatus, setPostgresFinalHandoffClosurePackageAckClosureStatus] =
    useState<PostgresCutoverReminderClosureStatus>('closed_with_actions')
  const [postgresFinalHandoffClosurePackageAckClosureActions, setPostgresFinalHandoffClosurePackageAckClosureActions] =
    useState(
      'Confirm final handoff closure package acknowledgement actions are dispositioned before infrastructure closeout.',
    )
  const [postgresFinalHandoffClosurePackageAckClosureNotes, setPostgresFinalHandoffClosurePackageAckClosureNotes] =
    useState(
      'Closeout retained final handoff closure package acknowledgements, delivery evidence, readiness disposition, and retained actions for infrastructure handoff closure.',
    )
  const [postgresFinalHandoffClosurePackageAckSupersededEvidence, setPostgresFinalHandoffClosurePackageAckSupersededEvidence] =
    useState('Prior final handoff closure package acknowledgements retained as superseded evidence.')
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
  const [retryQueueAckReviewer, setRetryQueueAckReviewer] = useState('Notification Operations Owner')
  const [retryQueueAckReviewerRole, setRetryQueueAckReviewerRole] =
    useState<NotificationRetryQueueAcknowledgement['reviewerRole']>('notification_operations')
  const [retryQueueAckStatus, setRetryQueueAckStatus] =
    useState<NotificationRetryQueueAcknowledgementStatus>('acknowledged_with_actions')
  const [retryQueueClosureReady, setRetryQueueClosureReady] = useState(false)
  const [retryQueueAckActions, setRetryQueueAckActions] = useState(
    'Disposition active retry queue items with messaging owners before closing notification operations review.',
  )
  const [retryQueueAckNotes, setRetryQueueAckNotes] = useState(
    'Notification operations reviewer acknowledged the delivered retry queue package and retained reviewer response evidence.',
  )
  const [retryQueueClosurePackageReviewers, setRetryQueueClosurePackageReviewers] = useState(
    'Notification Operations Owner, Messaging Owner',
  )
  const [retryQueueClosurePackageNotes, setRetryQueueClosurePackageNotes] = useState(
    'Closure package retained retry queue acknowledgement responses, delivery evidence, closure readiness, and retained actions for notification operations review.',
  )
  const [retryQueueClosurePackageAckReviewer, setRetryQueueClosurePackageAckReviewer] =
    useState('Notification Operations Owner')
  const [retryQueueClosurePackageAckReviewerRole, setRetryQueueClosurePackageAckReviewerRole] =
    useState<NotificationRetryQueueAcknowledgementClosurePackageAcknowledgement['reviewerRole']>('notification_operations')
  const [retryQueueClosurePackageAckStatus, setRetryQueueClosurePackageAckStatus] =
    useState<NotificationRetryQueueAcknowledgementStatus>('acknowledged_with_actions')
  const [retryQueueClosurePackageReady, setRetryQueueClosurePackageReady] = useState(false)
  const [retryQueueClosurePackageAckActions, setRetryQueueClosurePackageAckActions] = useState(
    'Confirm retry queue acknowledgement closure evidence with messaging owners before closing notification operations review.',
  )
  const [retryQueueClosurePackageAckNotes, setRetryQueueClosurePackageAckNotes] = useState(
    'Notification operations owner acknowledged the retry queue acknowledgement closure package delivery and retained closeout response evidence.',
  )
  const [retryQueueClosurePackageAckClosureReviewer, setRetryQueueClosurePackageAckClosureReviewer] =
    useState('Notification Operations Owner')
  const [retryQueueClosurePackageAckClosureStatus, setRetryQueueClosurePackageAckClosureStatus] =
    useState<PostgresCutoverReminderClosureStatus>('closed_with_actions')
  const [retryQueueClosurePackageAckClosureActions, setRetryQueueClosurePackageAckClosureActions] = useState(
    'Confirm retry queue acknowledgement closure package actions are dispositioned before notification operations closeout.',
  )
  const [retryQueueClosurePackageAckClosureNotes, setRetryQueueClosurePackageAckClosureNotes] = useState(
    'Closeout retained retry queue acknowledgement closure package acknowledgements, delivery evidence, readiness disposition, and retained actions for notification operations review.',
  )
  const [retryQueueClosurePackageAckSupersededEvidence, setRetryQueueClosurePackageAckSupersededEvidence] = useState(
    'Prior retry queue acknowledgement closure package acknowledgements retained as superseded evidence.',
  )
  const [closeoutExportReviewers, setCloseoutExportReviewers] = useState(
    'Governance Reviewer, Notification Operations Owner, Infrastructure Owner',
  )
  const [closeoutExportNotes, setCloseoutExportNotes] = useState(
    'Export package retained all available closure package acknowledgement closeouts across Closure SLA, final handoff, and retry queue workflows for governance review.',
  )
  const [closeoutExportAckReviewer, setCloseoutExportAckReviewer] = useState('Governance Reviewer')
  const [closeoutExportAckReviewerRole, setCloseoutExportAckReviewerRole] =
    useState<ClosurePackageAcknowledgementCloseoutExportPackageAcknowledgement['reviewerRole']>('governance_reviewer')
  const [closeoutExportAckStatus, setCloseoutExportAckStatus] =
    useState<ClosureSlaDeliveryAcknowledgementStatus>('acknowledged')
  const [closeoutExportReady, setCloseoutExportReady] = useState(false)
  const [closeoutExportAckActions, setCloseoutExportAckActions] = useState(
    'Confirm retained closeout export actions are dispositioned before governance closeout.',
  )
  const [closeoutExportAckNotes, setCloseoutExportAckNotes] = useState(
    'Reviewer acknowledged the delivered closeout export package and retained response evidence for governance tracking.',
  )
  const [closeoutExportAckClosureReviewer, setCloseoutExportAckClosureReviewer] = useState('Governance Reviewer')
  const [closeoutExportAckClosureStatus, setCloseoutExportAckClosureStatus] =
    useState<ClosureSlaResponseFollowUpClosureStatus>('closed_with_actions')
  const [closeoutExportAckClosureActions, setCloseoutExportAckClosureActions] = useState(
    'Confirm closeout export acknowledgement actions are dispositioned before governance closure.',
  )
  const [closeoutExportAckClosureNotes, setCloseoutExportAckClosureNotes] = useState(
    'Closure retained closeout export package acknowledgements, delivery evidence, readiness disposition, and retained actions for governance closeout.',
  )
  const [closeoutExportAckSupersededEvidence, setCloseoutExportAckSupersededEvidence] = useState(
    'Prior closeout export package acknowledgements retained as superseded evidence.',
  )
  const [closeoutNotificationClosureReviewer, setCloseoutNotificationClosureReviewer] =
    useState('Governance Reviewer')
  const [closeoutNotificationClosureStatus, setCloseoutNotificationClosureStatus] =
    useState<ClosureSlaResponseFollowUpClosureStatus>('closed_with_actions')
  const [closeoutNotificationClosureActions, setCloseoutNotificationClosureActions] = useState(
    'Confirm closeout package notification actions are dispositioned before closure package notification closeout.',
  )
  const [closeoutNotificationClosureNotes, setCloseoutNotificationClosureNotes] = useState(
    'Notification closure retained closeout export package delivery, acknowledgement, retry, and acknowledgement closure evidence for governance review.',
  )
  const [closeoutNotificationClosureSupersededEvidence, setCloseoutNotificationClosureSupersededEvidence] =
    useState('Prior closeout export package notification closure records retained as superseded evidence.')
  const [closeoutNotificationClosurePackageReviewers, setCloseoutNotificationClosurePackageReviewers] = useState(
    'Governance Reviewer, Infrastructure Owner, Notification Operations Owner',
  )
  const [closeoutNotificationClosurePackageNotes, setCloseoutNotificationClosurePackageNotes] = useState(
    'Closeout acknowledgement closure package retained notification closure records, delivery evidence, retry controls, and retained actions for downstream owner notification.',
  )
  const [closeoutNotificationClosurePackageAckReviewer, setCloseoutNotificationClosurePackageAckReviewer] =
    useState('Governance Reviewer')
  const [closeoutNotificationClosurePackageAckReviewerRole, setCloseoutNotificationClosurePackageAckReviewerRole] =
    useState<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement['reviewerRole']>(
      'governance_reviewer',
    )
  const [closeoutNotificationClosurePackageAckStatus, setCloseoutNotificationClosurePackageAckStatus] =
    useState<ClosureSlaDeliveryAcknowledgementStatus>('acknowledged')
  const [closeoutNotificationClosurePackageReady, setCloseoutNotificationClosurePackageReady] = useState(false)
  const [closeoutNotificationClosurePackageAckActions, setCloseoutNotificationClosurePackageAckActions] = useState(
    'Confirm retained closeout acknowledgement closure package actions are dispositioned before acknowledgement closeout.',
  )
  const [closeoutNotificationClosurePackageAckNotes, setCloseoutNotificationClosurePackageAckNotes] = useState(
    'Reviewer acknowledged the closeout acknowledgement closure package delivery and retained response evidence for governance tracking.',
  )
  const [
    closeoutNotificationClosurePackageAckClosureReviewer,
    setCloseoutNotificationClosurePackageAckClosureReviewer,
  ] = useState('Governance Reviewer')
  const [closeoutNotificationClosurePackageAckClosureStatus, setCloseoutNotificationClosurePackageAckClosureStatus] =
    useState<ClosureSlaResponseFollowUpClosureStatus>('closed_with_actions')
  const [closeoutNotificationClosurePackageAckClosureActions, setCloseoutNotificationClosurePackageAckClosureActions] =
    useState(
      'Confirm closeout acknowledgement closure package acknowledgement actions are dispositioned before governance closeout.',
    )
  const [closeoutNotificationClosurePackageAckClosureNotes, setCloseoutNotificationClosurePackageAckClosureNotes] =
    useState(
      'Closeout retained closeout acknowledgement closure package acknowledgements, delivery evidence, readiness disposition, and retained actions for governance review.',
    )
  const [
    closeoutNotificationClosurePackageAckSupersededEvidence,
    setCloseoutNotificationClosurePackageAckSupersededEvidence,
  ] = useState('Prior closeout acknowledgement closure package acknowledgements retained as superseded evidence.')
  const [
    closeoutNotificationClosurePackageAckClosurePackageReviewers,
    setCloseoutNotificationClosurePackageAckClosurePackageReviewers,
  ] = useState('Governance Reviewer, Infrastructure Owner, Notification Operations Owner')
  const [
    closeoutNotificationClosurePackageAckClosurePackageNotes,
    setCloseoutNotificationClosurePackageAckClosurePackageNotes,
  ] = useState(
    'Closeout acknowledgement closeout package retained acknowledgement closeout records, package delivery evidence, retained actions, and superseded acknowledgement evidence for downstream owner notification.',
  )
  const [
    closeoutNotificationClosurePackageAckClosurePackageAckReviewer,
    setCloseoutNotificationClosurePackageAckClosurePackageAckReviewer,
  ] = useState('Governance Reviewer')
  const [
    closeoutNotificationClosurePackageAckClosurePackageAckReviewerRole,
    setCloseoutNotificationClosurePackageAckClosurePackageAckReviewerRole,
  ] =
    useState<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement['reviewerRole']>(
      'governance_reviewer',
    )
  const [
    closeoutNotificationClosurePackageAckClosurePackageAckStatus,
    setCloseoutNotificationClosurePackageAckClosurePackageAckStatus,
  ] = useState<ClosureSlaDeliveryAcknowledgementStatus>('acknowledged')
  const [
    closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady,
    setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady,
  ] = useState(false)
  const [
    closeoutNotificationClosurePackageAckClosurePackageAckActions,
    setCloseoutNotificationClosurePackageAckClosurePackageAckActions,
  ] = useState(
    'Confirm retained closeout acknowledgement closeout package actions are dispositioned before final evidence.',
  )
  const [
    closeoutNotificationClosurePackageAckClosurePackageAckNotes,
    setCloseoutNotificationClosurePackageAckClosurePackageAckNotes,
  ] = useState(
    'Reviewer acknowledged the closeout acknowledgement closeout package delivery and retained response evidence for final governance tracking.',
  )
  const [
    closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceReviewer,
    setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceReviewer,
  ] = useState('Governance Reviewer')
  const [
    closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceStatus,
    setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceStatus,
  ] = useState<ClosureSlaResponseFollowUpClosureStatus>('closed_with_actions')
  const [
    closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceActions,
    setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceActions,
  ] = useState(
    'Confirm closeout acknowledgement closeout package acknowledgement actions are dispositioned before final notification delivery.',
  )
  const [
    closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceNotes,
    setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceNotes,
  ] = useState(
    'Final evidence retained closeout acknowledgement closeout package acknowledgements, package delivery evidence, readiness disposition, and retained actions for governance review.',
  )
  const [
    closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceSuperseded,
    setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceSuperseded,
  ] = useState('Prior closeout acknowledgement closeout package acknowledgements retained as superseded evidence.')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckReviewer,
    setCloseoutNotificationClosurePackageFinalEvidenceAckReviewer,
  ] = useState('Governance Reviewer')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckReviewerRole,
    setCloseoutNotificationClosurePackageFinalEvidenceAckReviewerRole,
  ] =
    useState<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgement['reviewerRole']>(
      'governance_reviewer',
    )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckStatus,
    setCloseoutNotificationClosurePackageFinalEvidenceAckStatus,
  ] = useState<ClosureSlaDeliveryAcknowledgementStatus>('acknowledged')
  const [
    closeoutNotificationClosurePackageFinalEvidenceCloseoutReady,
    setCloseoutNotificationClosurePackageFinalEvidenceCloseoutReady,
  ] = useState(false)
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckActions,
    setCloseoutNotificationClosurePackageFinalEvidenceAckActions,
  ] = useState(
    'Confirm retained closeout acknowledgement final evidence actions are dispositioned before final acknowledgement closeout.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckNotes,
    setCloseoutNotificationClosurePackageFinalEvidenceAckNotes,
  ] = useState(
    'Reviewer acknowledged the closeout acknowledgement final evidence delivery and retained response evidence for final closeout tracking.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutReviewer,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutReviewer,
  ] = useState('Governance Reviewer')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutStatus,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutStatus,
  ] = useState<ClosureSlaResponseFollowUpClosureStatus>('closed_with_actions')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutActions,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutActions,
  ] = useState(
    'Confirm closeout acknowledgement final evidence acknowledgement actions are dispositioned before notification delivery.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutNotes,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutNotes,
  ] = useState(
    'Closeout evidence retained final evidence acknowledgements, delivery evidence, readiness disposition, and retained actions for governance review.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutSuperseded,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutSuperseded,
  ] = useState('Prior closeout acknowledgement final evidence acknowledgements retained as superseded evidence.')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckReviewer,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckReviewer,
  ] = useState('Governance Reviewer')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckReviewerRole,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckReviewerRole,
  ] =
    useState<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgement['reviewerRole']>(
      'governance_reviewer',
    )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckStatus,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckStatus,
  ] = useState<ClosureSlaDeliveryAcknowledgementStatus>('acknowledged')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckReady,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckReady,
  ] = useState(false)
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckActions,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckActions,
  ] = useState(
    'Confirm final acknowledgement closeout delivery actions are dispositioned before acknowledgement closure evidence.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckNotes,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckNotes,
  ] = useState(
    'Reviewer acknowledged the final acknowledgement closeout evidence delivery and retained response evidence for acknowledgement closure tracking.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureReviewer,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureReviewer,
  ] = useState('Governance Reviewer')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureStatus,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureStatus,
  ] = useState<ClosureSlaResponseFollowUpClosureStatus>('closed_with_actions')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureActions,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureActions,
  ] = useState(
    'Confirm final acknowledgement closeout delivery acknowledgement actions are dispositioned before acknowledgement closure notification delivery.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureNotes,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureNotes,
  ] = useState(
    'Closure evidence retained final acknowledgement closeout delivery acknowledgements, delivery evidence, readiness disposition, and retained actions for governance review.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureSuperseded,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureSuperseded,
  ] = useState('Prior final acknowledgement closeout delivery acknowledgements retained as superseded evidence.')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckReviewer,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckReviewer,
  ] = useState('Governance Reviewer')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckReviewerRole,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckReviewerRole,
  ] =
    useState<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgement['reviewerRole']>(
      'governance_reviewer',
    )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckStatus,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckStatus,
  ] = useState<ClosureSlaDeliveryAcknowledgementStatus>('acknowledged')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceReady,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceReady,
  ] = useState(false)
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckActions,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckActions,
  ] = useState(
    'Confirm acknowledgement closure delivery actions are dispositioned before final evidence generation.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckNotes,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckNotes,
  ] = useState(
    'Reviewer acknowledged the final acknowledgement closure evidence delivery and retained response evidence for final evidence tracking.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceReviewer,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceReviewer,
  ] = useState('Governance Reviewer')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceStatus,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceStatus,
  ] = useState<ClosureSlaResponseFollowUpClosureStatus>('closed_with_actions')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceActions,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceActions,
  ] = useState(
    'Confirm acknowledgement closure delivery acknowledgement actions are dispositioned before final notification delivery.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceNotes,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceNotes,
  ] = useState(
    'Final evidence retained acknowledgement closure delivery acknowledgements, acknowledgement closure evidence, delivery evidence, readiness disposition, and retained actions for governance review.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceSuperseded,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceSuperseded,
  ] = useState('Prior acknowledgement closure delivery acknowledgements retained as superseded evidence.')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckReviewer,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckReviewer,
  ] = useState('Governance Reviewer')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckReviewerRole,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckReviewerRole,
  ] =
    useState<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgement['reviewerRole']>(
      'governance_reviewer',
    )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckStatus,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckStatus,
  ] = useState<ClosureSlaDeliveryAcknowledgementStatus>('acknowledged')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutReady,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutReady,
  ] = useState(false)
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckActions,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckActions,
  ] = useState(
    'Confirm final evidence delivery acknowledgement actions are dispositioned before final closeout evidence.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckNotes,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckNotes,
  ] = useState(
    'Reviewer acknowledged the final acknowledgement closure final evidence delivery and retained response evidence for final closeout tracking.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutReviewer,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutReviewer,
  ] = useState('Governance Reviewer')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutStatus,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutStatus,
  ] = useState<ClosureSlaResponseFollowUpClosureStatus>('closed_with_actions')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutActions,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutActions,
  ] = useState(
    'Confirm final closeout evidence actions are dispositioned before final closeout notification delivery.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutNotes,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutNotes,
  ] = useState(
    'Final closeout evidence retained final evidence delivery acknowledgements, final evidence records, notification delivery evidence, closeout readiness, and retained actions for governance review.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutSuperseded,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutSuperseded,
  ] = useState('Prior final evidence delivery acknowledgements retained as superseded evidence.')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckReviewer,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckReviewer,
  ] = useState('Governance Reviewer')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckReviewerRole,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckReviewerRole,
  ] =
    useState<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement['reviewerRole']>(
      'governance_reviewer',
    )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckStatus,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckStatus,
  ] = useState<ClosureSlaDeliveryAcknowledgementStatus>('acknowledged')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceAckClosureReady,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceAckClosureReady,
  ] = useState(false)
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckActions,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckActions,
  ] = useState(
    'Confirm final closeout delivery acknowledgement actions are dispositioned before acknowledgement closure evidence.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckNotes,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckNotes,
  ] = useState(
    'Reviewer acknowledged the final closeout evidence delivery and retained response evidence for acknowledgement closure tracking.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureReviewer,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureReviewer,
  ] = useState('Governance Reviewer')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureStatus,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureStatus,
  ] = useState<ClosureSlaResponseFollowUpClosureStatus>('closed_with_actions')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureActions,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureActions,
  ] = useState(
    'Confirm final closeout acknowledgement closure actions are dispositioned before acknowledgement closure notification delivery.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureNotes,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureNotes,
  ] = useState(
    'Closure evidence retained final closeout delivery acknowledgements, final closeout evidence records, notification delivery evidence, acknowledgement closure readiness, and retained actions for governance review.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureSuperseded,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureSuperseded,
  ] = useState('Prior final closeout delivery acknowledgements retained as superseded evidence.')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckReviewer,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckReviewer,
  ] = useState('Governance Reviewer')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckReviewerRole,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckReviewerRole,
  ] =
    useState<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgement['reviewerRole']>(
      'governance_reviewer',
    )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckStatus,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckStatus,
  ] = useState<ClosureSlaDeliveryAcknowledgementStatus>('acknowledged')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureCloseoutReady,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureCloseoutReady,
  ] = useState(false)
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckActions,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckActions,
  ] = useState(
    'Confirm final closeout acknowledgement closure delivery acknowledgement actions are dispositioned before closeout evidence.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckNotes,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckNotes,
  ] = useState(
    'Reviewer acknowledged the final closeout acknowledgement closure evidence delivery and retained response evidence for closeout tracking.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutReviewer,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutReviewer,
  ] = useState('Governance Reviewer')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutStatus,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutStatus,
  ] = useState<ClosureSlaResponseFollowUpClosureStatus>('closed_with_actions')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutActions,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutActions,
  ] = useState(
    'Confirm final closeout acknowledgement closure delivery acknowledgement actions are dispositioned before closeout notification delivery.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutNotes,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutNotes,
  ] = useState(
    'Closeout evidence retained final closeout acknowledgement closure delivery acknowledgements, closure evidence records, notification delivery evidence, closeout readiness, and retained actions for governance review.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutSuperseded,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutSuperseded,
  ] = useState('Prior final closeout acknowledgement closure delivery acknowledgements retained as superseded evidence.')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckReviewer,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckReviewer,
  ] = useState('Governance Reviewer')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckReviewerRole,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckReviewerRole,
  ] =
    useState<ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement['reviewerRole']>(
      'governance_reviewer',
    )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckStatus,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckStatus,
  ] = useState<ClosureSlaDeliveryAcknowledgementStatus>('acknowledged')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceReady,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceReady,
  ] = useState(false)
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckActions,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckActions,
  ] = useState(
    'Confirm final closeout acknowledgement closure closeout delivery acknowledgement actions are dispositioned before final evidence generation.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckNotes,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckNotes,
  ] = useState(
    'Reviewer acknowledged the final closeout acknowledgement closure closeout evidence delivery and retained response evidence for final evidence tracking.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceReviewer,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceReviewer,
  ] = useState('Governance Reviewer')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceStatus,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceStatus,
  ] = useState<ClosureSlaResponseFollowUpClosureStatus>('closed_with_actions')
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceActions,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceActions,
  ] = useState(
    'Confirm final closeout acknowledgement closure closeout delivery acknowledgement actions are dispositioned before final notification delivery.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceNotes,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceNotes,
  ] = useState(
    'Final evidence retained final closeout acknowledgement closure closeout delivery acknowledgements, closeout evidence records, notification delivery evidence, final-evidence readiness, and retained actions for governance review.',
  )
  const [
    closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceSuperseded,
    setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceSuperseded,
  ] = useState('Prior final closeout acknowledgement closure closeout delivery acknowledgements retained as superseded evidence.')
  const [retryQueueMeasuredAt] = useState(() => new Date())
  const recordCounts = backendRecords.reduce(
    (summary, record) => {
      summary[record.kind] = (summary[record.kind] ?? 0) + 1
      return summary
    },
    {} as Record<string, number>,
  )
  const governanceWorkflowQueue = useMemo(
    () => deriveGovernanceWorkflowQueue(backendRecords, workflowDefinitions),
    [backendRecords, workflowDefinitions],
  )
  const governanceWorkflowLineage = useMemo(
    () => deriveGovernanceWorkflowLineage(backendRecords, workflowDefinitions),
    [backendRecords, workflowDefinitions],
  )
  const governanceWorkQueueItems = governanceWorkflowQueue.items.slice(0, 8)
  const selectedWorkflowItem = governanceWorkQueueItems[0]
  const selectedWorkflowInstance = governanceWorkflowLineage.instances[0]
  const workflowInstanceRetentionRecords = backendRecords.filter(
    (record): record is BackendRecord<WorkflowInstanceExportRetention> =>
      record.kind === 'workflow_instance_export_retention',
  )
  const [workflowRetentionReviewer, setWorkflowRetentionReviewer] = useState('Governance Reviewer')
  const [workflowRetentionClass, setWorkflowRetentionClass] =
    useState<TraceabilityExportRetentionClass>('standard_7_year')
  const [retainedPackageSearch, setRetainedPackageSearch] = useState('')
  const [retainedPackageStatusFilter, setRetainedPackageStatusFilter] = useState<StatusLevel | 'all'>('all')
  const [retainedPackageWorkflowFilter, setRetainedPackageWorkflowFilter] = useState('all')
  const [retainedPackageRetentionFilter, setRetainedPackageRetentionFilter] =
    useState<TraceabilityExportRetentionClass | 'all'>('all')
  const [selectedRetainedPackageId, setSelectedRetainedPackageId] = useState<string | null>(null)
  const retainedPackageWorkflowTypes = Array.from(
    new Set(workflowInstanceRetentionRecords.map((record) => record.payload.workflowType)),
  ).sort()
  const filteredWorkflowInstanceRetentionRecords = workflowInstanceRetentionRecords.filter((record) => {
    const searchable = [
      record.label,
      record.summary,
      record.payload.workflowLabel,
      record.payload.reviewer,
      record.payload.packageId,
    ].join(' ').toLowerCase()
    const matchesSearch = searchable.includes(retainedPackageSearch.trim().toLowerCase())
    const matchesStatus = retainedPackageStatusFilter === 'all' || record.status === retainedPackageStatusFilter
    const matchesWorkflow =
      retainedPackageWorkflowFilter === 'all' || record.payload.workflowType === retainedPackageWorkflowFilter
    const matchesRetention =
      retainedPackageRetentionFilter === 'all' || record.payload.retention.class === retainedPackageRetentionFilter
    return matchesSearch && matchesStatus && matchesWorkflow && matchesRetention
  })
  const retentionLifecycleSummary = workflowInstanceRetentionRecords.reduce(
    (summary, record) => {
      summary.total += 1
      summary[record.status] += 1
      summary.records += record.payload.coverage.records
      summary.missingParents += record.payload.coverage.missingParentReferences
      return summary
    },
    { total: 0, pass: 0, warning: 0, blocking: 0, records: 0, missingParents: 0 },
  )
  const selectedRetainedPackage =
    filteredWorkflowInstanceRetentionRecords.find((record) => record.id === selectedRetainedPackageId) ??
    filteredWorkflowInstanceRetentionRecords[0]
  const selectedRetainedWorkflowRecords = selectedRetainedPackage
    ? workflowInstanceRetentionRecords
        .filter((record) => record.payload.workflowType === selectedRetainedPackage.payload.workflowType)
        .sort((first, second) => Date.parse(second.payload.retainedAt) - Date.parse(first.payload.retainedAt))
    : []
  const workflowDefinitionEntries = Object.entries(workflowDefinitions)
  const initialWorkflowEditorKey = workflowDefinitionEntries[0]?.[0] ?? ''
  const [workflowEditorKey, setWorkflowEditorKey] = useState(initialWorkflowEditorKey)
  const selectedWorkflowEditorKey = workflowDefinitions[workflowEditorKey] ? workflowEditorKey : initialWorkflowEditorKey
  const [workflowDraft, setWorkflowDraft] = useState<AppConfig['workflowDefinitions'][string] | null>(() =>
    selectedWorkflowEditorKey ? cloneWorkflowDefinition(workflowDefinitions[selectedWorkflowEditorKey]) : null,
  )
  const [workflowValidationResult, setWorkflowValidationResult] =
    useState<ReturnType<typeof validateWorkflowDefinitionDraft> | null>(null)
  const [workflowPromotionPackage, setWorkflowPromotionPackage] =
    useState<ReturnType<typeof createWorkflowDefinitionPromotionPackage> | null>(null)
  const selectedWorkflowDefinition = selectedWorkflowItem?.definition ?? workflowDefinitionEntries[0]?.[1]
  const selectedWorkflowStage = selectedWorkflowItem?.stage ?? selectedWorkflowDefinition?.stages[0]
  const selectedAllowedNextStages =
    selectedWorkflowItem?.allowedNextStages ??
    (selectedWorkflowStage ? selectedWorkflowDefinition?.allowed_next_stages[selectedWorkflowStage] : undefined) ??
    []
  const configuredWorkflowItemCount = governanceWorkflowQueue.items.filter((item) => Boolean(item.definition)).length
  const structuredWorkflowRecordCount = governanceWorkflowQueue.items.filter(
    (item) => item.record.workflow?.metadataVersion === 'workflow_metadata_v1',
  ).length
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
  function exportSelectedWorkflowInstance() {
    if (!selectedWorkflowInstance) return
    const packagePayload = createWorkflowInstanceExportPackage(selectedWorkflowInstance)
    downloadJson('tracs-workflow-instance-export-package.json', packagePayload)
  }
  function retainSelectedWorkflowInstanceExport() {
    if (!selectedWorkflowInstance) return
    onSaveWorkflowInstanceExportRetention({
      instance: selectedWorkflowInstance,
      retentionClass: workflowRetentionClass,
      reviewer: workflowRetentionReviewer,
    })
  }
  function downloadSelectedRetainedPackageEvidence() {
    if (!selectedRetainedPackage) return
    downloadJson('tracs-retained-workflow-package-evidence.json', selectedRetainedPackage)
  }
  function exportSelectedRetainedPackageComparison() {
    if (!selectedRetainedPackage) return
    const exportPayload = {
      exportId: `retained_package_comparison:${selectedRetainedPackage.payload.workflowType}:${new Date().toISOString()}`,
      generatedAt: new Date().toISOString(),
      selectedRecordId: selectedRetainedPackage.id,
      workflowType: selectedRetainedPackage.payload.workflowType,
      workflowLabel: selectedRetainedPackage.payload.workflowLabel,
      records: selectedRetainedWorkflowRecords,
      summary: {
        retainedPackages: selectedRetainedWorkflowRecords.length,
        coveredRecords: selectedRetainedWorkflowRecords.reduce(
          (total, record) => total + record.payload.coverage.records,
          0,
        ),
        missingParentReferences: selectedRetainedWorkflowRecords.reduce(
          (total, record) => total + record.payload.coverage.missingParentReferences,
          0,
        ),
        retentionClasses: Array.from(
          new Set(selectedRetainedWorkflowRecords.map((record) => record.payload.retention.class)),
        ),
      },
      evidence: `${selectedRetainedWorkflowRecords.length} retained package(s) compared for ${selectedRetainedPackage.payload.workflowLabel}.`,
    }
    downloadJson('tracs-retained-workflow-package-comparison.json', exportPayload)
  }
  function selectWorkflowDefinitionDraft(workflowType: string) {
    setWorkflowEditorKey(workflowType)
    setWorkflowDraft(cloneWorkflowDefinition(workflowDefinitions[workflowType]))
    setWorkflowValidationResult(null)
    setWorkflowPromotionPackage(null)
  }
  function updateWorkflowDraft(updates: Partial<AppConfig['workflowDefinitions'][string]>) {
    setWorkflowDraft((current) => current ? { ...current, ...updates } : current)
    setWorkflowValidationResult(null)
    setWorkflowPromotionPackage(null)
  }
  function validateWorkflowDraft() {
    if (!workflowDraft || !selectedWorkflowEditorKey) return
    setWorkflowValidationResult(validateWorkflowDefinitionDraft(selectedWorkflowEditorKey, workflowDraft))
  }
  function promoteWorkflowDraftPreview() {
    if (!workflowDraft || !selectedWorkflowEditorKey) return
    const validation = validateWorkflowDefinitionDraft(selectedWorkflowEditorKey, workflowDraft)
    const promotionPackage = createWorkflowDefinitionPromotionPackage({
      definition: workflowDraft,
      validation,
      workflowType: selectedWorkflowEditorKey,
    })
    setWorkflowValidationResult(validation)
    setWorkflowPromotionPackage(promotionPackage)
  }
  function downloadWorkflowPromotionPackage() {
    if (!workflowPromotionPackage) return
    downloadJson('tracs-workflow-definition-promotion-package.json', workflowPromotionPackage)
  }
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
  const latestPostgresCutoverFinalHandoffAcknowledgement = postgresCutoverFinalHandoffAcknowledgementRecords[0]
  const latestPostgresCutoverFinalHandoffClosurePackage = postgresCutoverFinalHandoffClosurePackageRecords[0]
  const latestPostgresCutoverFinalHandoffClosurePackageAcknowledgement =
    postgresCutoverFinalHandoffClosurePackageAcknowledgementRecords[0]
  const latestPostgresCutoverFinalHandoffClosurePackageAcknowledgementClosure =
    postgresCutoverFinalHandoffClosurePackageAcknowledgementClosureRecords[0]
  const postgresFinalHandoffClosurePackageAcknowledgementClosureMetrics =
    postgresCutoverFinalHandoffClosurePackageAcknowledgementRecords.reduce(
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
  const postgresFinalHandoffClosurePackageAcknowledgementClosureStatus: StatusLevel =
    postgresFinalHandoffClosurePackageAcknowledgementClosureMetrics.rejected > 0
      ? 'blocking'
      : postgresFinalHandoffClosurePackageAcknowledgementClosureMetrics.totalAcknowledgements === 0 ||
          postgresFinalHandoffClosurePackageAcknowledgementClosureMetrics.acknowledgedWithActions > 0 ||
          postgresFinalHandoffClosurePackageAcknowledgementClosureMetrics.changesRequested > 0 ||
          postgresFinalHandoffClosurePackageAcknowledgementClosureMetrics.closureReady <
            postgresFinalHandoffClosurePackageAcknowledgementClosureMetrics.totalAcknowledgements
        ? 'warning'
        : 'pass'
  const postgresFinalHandoffClosureMetrics = postgresCutoverFinalHandoffAcknowledgementRecords.reduce(
    (summary, record) => {
      summary.totalAcknowledgements += 1
      if (record.payload.status === 'acknowledged') summary.acknowledged += 1
      if (record.payload.status === 'acknowledged_with_actions') summary.acknowledgedWithActions += 1
      if (record.payload.status === 'changes_requested') summary.changesRequested += 1
      if (record.payload.status === 'rejected') summary.rejected += 1
      if (record.payload.finalHandoffReady) summary.closureReady += 1
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
  const postgresFinalHandoffClosureStatus: StatusLevel =
    postgresFinalHandoffClosureMetrics.rejected > 0
      ? 'blocking'
      : postgresFinalHandoffClosureMetrics.totalAcknowledgements === 0 ||
          postgresFinalHandoffClosureMetrics.acknowledgedWithActions > 0 ||
          postgresFinalHandoffClosureMetrics.changesRequested > 0 ||
          postgresFinalHandoffClosureMetrics.closureReady < postgresFinalHandoffClosureMetrics.totalAcknowledgements
        ? 'warning'
        : 'pass'
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
    'notification_retry_queue_acknowledgement_closure_package',
    'closure_package_acknowledgement_closeout_export_package',
    'closure_package_acknowledgement_closeout_notification_closure_package',
    'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package',
    'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_acknowledgement_final_evidence',
    'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure',
    'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure',
    'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence',
    'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence',
    'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure',
    'closure_sla_export_package',
    'closure_sla_response_follow_up',
    'closure_sla_follow_up_closure_export_package',
    'postgres_cutover_acknowledgement',
    'postgres_cutover_owner_reminder',
    'postgres_cutover_closure_package',
    'postgres_cutover_final_handoff_closure_package',
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
  const retryQueueAcknowledgementClosurePackageDeliveryRecords = deliveryRecords.filter(
    (record) => record.payload.request.source === 'notification_retry_queue_acknowledgement_closure_package',
  )
  const retryQueueAcknowledgedDeliveryIds = new Set(
    notificationRetryQueueAcknowledgementRecords.map((record) => record.payload.deliveryRecordId),
  )
  const latestRetryQueueAcknowledgement = notificationRetryQueueAcknowledgementRecords[0]
  const latestRetryQueueAcknowledgementClosurePackage = notificationRetryQueueAcknowledgementClosurePackageRecords[0]
  const latestRetryQueueAcknowledgementClosurePackageAcknowledgement =
    notificationRetryQueueAcknowledgementClosurePackageAcknowledgementRecords[0]
  const latestRetryQueueAcknowledgementClosurePackageAcknowledgementClosure =
    notificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosureRecords[0]
  const latestRetryQueueAcknowledgementClosurePackageDelivery = retryQueueAcknowledgementClosurePackageDeliveryRecords[0]
  const retryQueueAcknowledgementClosurePackageAcknowledgedDeliveryIds = new Set(
    notificationRetryQueueAcknowledgementClosurePackageAcknowledgementRecords.map(
      (record) => record.payload.deliveryRecordId,
    ),
  )
  const retryQueueAcknowledgementClosurePackageAcknowledgementClosureMetrics =
    notificationRetryQueueAcknowledgementClosurePackageAcknowledgementRecords.reduce(
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
  const retryQueueAcknowledgementClosurePackageAcknowledgementClosureStatus: StatusLevel =
    retryQueueAcknowledgementClosurePackageAcknowledgementClosureMetrics.rejected > 0
      ? 'blocking'
      : retryQueueAcknowledgementClosurePackageAcknowledgementClosureMetrics.totalAcknowledgements === 0 ||
          retryQueueAcknowledgementClosurePackageAcknowledgementClosureMetrics.acknowledgedWithActions > 0 ||
          retryQueueAcknowledgementClosurePackageAcknowledgementClosureMetrics.changesRequested > 0 ||
          retryQueueAcknowledgementClosurePackageAcknowledgementClosureMetrics.closureReady <
            retryQueueAcknowledgementClosurePackageAcknowledgementClosureMetrics.totalAcknowledgements
        ? 'warning'
        : 'pass'
  const latestRetryQueuePackageDelivery = retryQueuePackageDeliveryRecords[0]
  const openRetryQueuePackageDeliveryCount = retryQueuePackageDeliveryRecords.filter(
    (record) => !retryQueueAcknowledgedDeliveryIds.has(record.id),
  ).length
  const retryQueueAcknowledgementClosureMetrics = notificationRetryQueueAcknowledgementRecords.reduce(
    (summary, record) => {
      summary.totalAcknowledgements += 1
      if (record.payload.status === 'acknowledged') summary.acknowledged += 1
      if (record.payload.status === 'acknowledged_with_actions') summary.acknowledgedWithActions += 1
      if (record.payload.status === 'changes_requested') summary.changesRequested += 1
      if (record.payload.status === 'rejected') summary.rejected += 1
      if (record.payload.queueClosureReady) summary.closureReady += 1
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
  const retryQueueAcknowledgementClosureStatus: StatusLevel =
    retryQueueAcknowledgementClosureMetrics.rejected > 0
      ? 'blocking'
      : retryQueueAcknowledgementClosureMetrics.totalAcknowledgements === 0 ||
          retryQueueAcknowledgementClosureMetrics.acknowledgedWithActions > 0 ||
          retryQueueAcknowledgementClosureMetrics.changesRequested > 0 ||
          retryQueueAcknowledgementClosureMetrics.closureReady < retryQueueAcknowledgementClosureMetrics.totalAcknowledgements
        ? 'warning'
        : 'pass'
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
  const latestClosureSlaResponseFollowUpClosure = closureSlaResponseFollowUpClosureRecords[0]
  const latestClosureSlaFollowUpClosureExportPackage = closureSlaFollowUpClosureExportPackageRecords[0]
  const closureSlaFollowUpNotificationRecords = deliveryRecords.filter(
    (record) => record.payload.request.source === 'closure_sla_response_follow_up',
  )
  const closureSlaFollowUpClosurePackageDeliveryRecords = deliveryRecords.filter(
    (record) => record.payload.request.source === 'closure_sla_follow_up_closure_export_package',
  )
  const latestClosureSlaFollowUpClosurePackageDelivery = closureSlaFollowUpClosurePackageDeliveryRecords[0]
  const closureSlaFollowUpClosurePackageAcknowledgedDeliveryIds = new Set(
    closureSlaFollowUpClosurePackageAcknowledgementRecords.map((record) => record.payload.deliveryRecordId),
  )
  const latestClosureSlaFollowUpClosurePackageAcknowledgement =
    closureSlaFollowUpClosurePackageAcknowledgementRecords[0]
  const latestClosureSlaFollowUpClosurePackageAcknowledgementClosure =
    closureSlaFollowUpClosurePackageAcknowledgementClosureRecords[0]
  const closureSlaFollowUpClosurePackageAcknowledgementClosureMetrics =
    closureSlaFollowUpClosurePackageAcknowledgementRecords.reduce(
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
  const closureSlaFollowUpClosurePackageAcknowledgementClosureStatus: StatusLevel =
    closureSlaFollowUpClosurePackageAcknowledgementClosureMetrics.rejected > 0
      ? 'blocking'
      : closureSlaFollowUpClosurePackageAcknowledgementClosureMetrics.totalAcknowledgements === 0 ||
          closureSlaFollowUpClosurePackageAcknowledgementClosureMetrics.changesRequested > 0 ||
          closureSlaFollowUpClosurePackageAcknowledgementClosureMetrics.closureReady <
            closureSlaFollowUpClosurePackageAcknowledgementClosureMetrics.totalAcknowledgements
        ? 'warning'
        : 'pass'
  const latestCloseoutExportPackage = closurePackageAcknowledgementCloseoutExportPackageRecords[0]
  const closeoutExportDeliveryRecords = deliveryRecords.filter(
    (record) => record.payload.request.source === 'closure_package_acknowledgement_closeout_export_package',
  )
  const latestCloseoutExportDelivery = closeoutExportDeliveryRecords[0]
  const latestCloseoutExportAcknowledgement =
    closurePackageAcknowledgementCloseoutExportPackageAcknowledgementRecords[0]
  const latestCloseoutExportAcknowledgementClosure =
    closurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosureRecords[0]
  const closeoutExportAcknowledgedDeliveryIds = new Set(
    closurePackageAcknowledgementCloseoutExportPackageAcknowledgementRecords.map(
      (record) => record.payload.deliveryRecordId,
    ),
  )
  const closeoutExportAcknowledgementMetrics =
    closurePackageAcknowledgementCloseoutExportPackageAcknowledgementRecords.reduce(
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
  const closeoutExportAcknowledgementClosureStatus: StatusLevel =
    closeoutExportAcknowledgementMetrics.rejected > 0
      ? 'blocking'
      : closeoutExportAcknowledgementMetrics.totalAcknowledgements === 0 ||
          closeoutExportAcknowledgementMetrics.changesRequested > 0 ||
          closeoutExportAcknowledgementMetrics.closeoutReady <
            closeoutExportAcknowledgementMetrics.totalAcknowledgements
        ? 'warning'
        : 'pass'
  const latestCloseoutNotificationClosure = closurePackageAcknowledgementCloseoutNotificationClosureRecords[0]
  const closeoutNotificationClosureMetrics = {
    exportPackages: closurePackageAcknowledgementCloseoutExportPackageRecords.length,
    deliveryRecords: closeoutExportDeliveryRecords.length,
    acknowledgementRecords: closurePackageAcknowledgementCloseoutExportPackageAcknowledgementRecords.length,
    acknowledgementClosures: closurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosureRecords.length,
    retryControls: notificationDeliveryRetryRecords.filter(
      (record) => record.payload.source === 'closure_package_acknowledgement_closeout_export_package',
    ).length,
    retainedActions: [
      ...closurePackageAcknowledgementCloseoutExportPackageRecords.flatMap((record) => record.payload.requiredActions),
      ...closurePackageAcknowledgementCloseoutExportPackageAcknowledgementRecords.flatMap(
        (record) => record.payload.requestedActions,
      ),
      ...closurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosureRecords.flatMap(
        (record) => record.payload.retainedActions,
      ),
    ].length,
    rejectedAcknowledgements: closeoutExportAcknowledgementMetrics.rejected,
    changesRequested: closeoutExportAcknowledgementMetrics.changesRequested,
    readyAcknowledgements: closeoutExportAcknowledgementMetrics.closeoutReady,
    closedAcknowledgementClosures: closurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosureRecords.filter(
      (record) => record.payload.status === 'closed',
    ).length,
    closedWithActions: closurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosureRecords.filter(
      (record) => record.payload.status === 'closed_with_actions',
    ).length,
  }
  const closeoutNotificationClosureStatusLevel: StatusLevel =
    closeoutNotificationClosureMetrics.rejectedAcknowledgements > 0
      ? 'blocking'
      : closeoutNotificationClosureMetrics.exportPackages === 0 ||
          closeoutNotificationClosureMetrics.deliveryRecords === 0 ||
          closeoutNotificationClosureMetrics.acknowledgementRecords === 0 ||
          closeoutNotificationClosureMetrics.acknowledgementClosures === 0 ||
          closeoutNotificationClosureMetrics.changesRequested > 0 ||
          closeoutNotificationClosureMetrics.readyAcknowledgements <
            closeoutNotificationClosureMetrics.acknowledgementRecords ||
          closeoutNotificationClosureMetrics.closedWithActions > 0
        ? 'warning'
        : 'pass'
  const closeoutNotificationClosurePackageDeliveryRecords = deliveryRecords.filter(
    (record) => record.payload.request.source === 'closure_package_acknowledgement_closeout_notification_closure_package',
  )
  const latestCloseoutNotificationClosurePackage =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageRecords[0]
  const latestCloseoutNotificationClosurePackageDelivery = closeoutNotificationClosurePackageDeliveryRecords[0]
  const latestCloseoutNotificationClosurePackageAcknowledgement =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementRecords[0]
  const closeoutNotificationClosurePackageAcknowledgedDeliveryIds = new Set(
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementRecords.map(
      (record) => record.payload.deliveryRecordId,
    ),
  )
  const closeoutNotificationClosurePackageAcknowledgementMetrics =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementRecords.reduce(
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
  const latestCloseoutNotificationClosurePackageAcknowledgementClosure =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords[0]
  const closeoutNotificationClosurePackageAcknowledgementClosureStatus: StatusLevel =
    closeoutNotificationClosurePackageAcknowledgementMetrics.rejected > 0
      ? 'blocking'
      : closeoutNotificationClosurePackageAcknowledgementMetrics.totalAcknowledgements === 0 ||
          closeoutNotificationClosurePackageAcknowledgementMetrics.changesRequested > 0 ||
          closeoutNotificationClosurePackageAcknowledgementMetrics.closureReady <
            closeoutNotificationClosurePackageAcknowledgementMetrics.totalAcknowledgements
        ? 'warning'
        : 'pass'
  const closeoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryRecords = deliveryRecords.filter(
    (record) =>
      record.payload.request.source ===
      'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package',
  )
  const latestCloseoutNotificationClosurePackageAcknowledgementClosurePackage =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageRecords[0]
  const latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageDelivery =
    closeoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryRecords[0]
  const latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRecords[0]
  const closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgedDeliveryIds = new Set(
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRecords.map(
      (record) => record.payload.deliveryRecordId,
    ),
  )
  const closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementMetrics =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRecords.reduce(
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
      },
    )
  const latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidenceRecords[0]
  const closeoutNotificationClosurePackageAcknowledgementClosurePackageFinalEvidenceDeliveryRecords =
    deliveryRecords.filter(
      (record) =>
        record.payload.request.source ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_acknowledgement_final_evidence',
    )
  const latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageFinalEvidenceDelivery =
    closeoutNotificationClosurePackageAcknowledgementClosurePackageFinalEvidenceDeliveryRecords[0]
  const closeoutNotificationClosurePackageAcknowledgementClosurePackageFinalEvidenceStatus: StatusLevel =
    closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementMetrics.rejected > 0
      ? 'blocking'
      : closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementMetrics.totalAcknowledgements ===
            0 ||
          closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementMetrics.changesRequested > 0 ||
          closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementMetrics.finalEvidenceReady <
            closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementMetrics.totalAcknowledgements
        ? 'warning'
        : 'pass'
  const latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgement =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementRecords[0]
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgedDeliveryIds = new Set(
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementRecords.map(
      (record) => record.payload.deliveryRecordId,
    ),
  )
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementMetrics =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementRecords.reduce(
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
  const latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureRecords[0]
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureStatus: StatusLevel =
    closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementMetrics.rejected > 0
      ? 'blocking'
      : closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementMetrics.totalAcknowledgements ===
            0 ||
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementMetrics.changesRequested > 0 ||
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementMetrics.closeoutReady <
            closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementMetrics.totalAcknowledgements
        ? 'warning'
        : 'pass'
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryRecords =
    deliveryRecords.filter(
      (record) =>
        record.payload.request.source ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure',
    )
  const latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDelivery =
    closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryRecords[0]
  const latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgement =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementRecords[0]
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureAcknowledgedDeliveryIds =
    new Set(
      closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementRecords.map(
        (record) => record.payload.deliveryRecordId,
      ),
    )
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementMetrics =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementRecords.reduce(
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
      },
    )
  const latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureRecords[0]
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureStatus: StatusLevel =
    closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementMetrics.rejected >
    0
      ? 'blocking'
      : closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementMetrics.totalAcknowledgements ===
            0 ||
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementMetrics.changesRequested >
            0 ||
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementMetrics.acknowledgementClosureReady <
            closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementMetrics.totalAcknowledgements
        ? 'warning'
        : 'pass'
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryRecords =
    deliveryRecords.filter(
      (record) =>
        record.payload.request.source ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure',
    )
  const latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDelivery =
    closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryRecords[0]
  const latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgement =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementRecords[0]
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureAcknowledgedDeliveryIds =
    new Set(
      closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementRecords.map(
        (record) => record.payload.deliveryRecordId,
      ),
    )
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementMetrics =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementRecords.reduce(
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
      },
    )
  const latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceRecords[0]
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryRecords =
    deliveryRecords.filter(
      (record) =>
        record.payload.request.source ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence',
    )
  const latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDelivery =
    closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryRecords[0]
  const latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgement =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementRecords[0]
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceAcknowledgedDeliveryIds =
    new Set(
      closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementRecords.map(
        (record) => record.payload.deliveryRecordId,
      ),
    )
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementMetrics =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementRecords.reduce(
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
  const latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceRecords[0]
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryRecords =
    deliveryRecords.filter(
      (record) =>
        record.payload.request.source ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence',
    )
  const latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDelivery =
    closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryRecords[0]
  const latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementRecords[0]
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceAcknowledgedDeliveryIds =
    new Set(
      closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementRecords.map(
        (record) => record.payload.deliveryRecordId,
      ),
    )
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementMetrics =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementRecords.reduce(
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
      },
    )
  const latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureRecords[0]
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureStatus: StatusLevel =
    closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementMetrics.rejected >
    0
      ? 'blocking'
      : closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementMetrics.totalAcknowledgements ===
            0 ||
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementMetrics.changesRequested >
            0 ||
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementMetrics.acknowledgementClosureReady <
            closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementMetrics.totalAcknowledgements
        ? 'warning'
        : 'pass'
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryRecords =
    deliveryRecords.filter(
      (record) =>
        record.payload.request.source ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure',
    )
  const latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDelivery =
    closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryRecords[0]
  const latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgement =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementRecords[0]
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureAcknowledgedDeliveryIds =
    new Set(
      closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementRecords.map(
        (record) => record.payload.deliveryRecordId,
      ),
    )
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementMetrics =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementRecords.reduce(
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
  const latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceRecords[0]
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryRecords =
    deliveryRecords.filter(
      (record) =>
        record.payload.request.source ===
        'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence',
    )
  const latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDelivery =
    closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryRecords[0]
  const latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementRecords[0]
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceAcknowledgedDeliveryIds =
    new Set(
      closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementRecords.map(
        (record) => record.payload.deliveryRecordId,
      ),
    )
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementMetrics =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementRecords.reduce(
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
      },
    )
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceStatus: StatusLevel =
    closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementMetrics.rejected >
    0
      ? 'blocking'
      : closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementMetrics.totalAcknowledgements ===
            0 ||
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementMetrics.changesRequested >
            0 ||
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementMetrics.closeoutReady <
            closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementMetrics.totalAcknowledgements
        ? 'warning'
        : 'pass'
  const latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidence =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidenceRecords[0]
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidenceStatus: StatusLevel =
    closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementMetrics.rejected >
    0
      ? 'blocking'
      : closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementMetrics.totalAcknowledgements ===
            0 ||
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementMetrics.changesRequested >
            0 ||
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementMetrics.finalEvidenceReady <
            closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementMetrics.totalAcknowledgements
        ? 'warning'
        : 'pass'
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutStatus: StatusLevel =
    closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementMetrics.rejected >
    0
      ? 'blocking'
      : closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementMetrics.totalAcknowledgements ===
            0 ||
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementMetrics.changesRequested >
            0 ||
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementMetrics.closeoutReady <
            closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementMetrics.totalAcknowledgements
        ? 'warning'
        : 'pass'
  const closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceStatus: StatusLevel =
    closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementMetrics.rejected >
    0
      ? 'blocking'
      : closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementMetrics.totalAcknowledgements ===
            0 ||
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementMetrics.changesRequested >
            0 ||
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementMetrics.finalEvidenceReady <
            closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementMetrics.totalAcknowledgements
        ? 'warning'
        : 'pass'
  const closeoutNotificationClosurePackageAcknowledgementClosurePackageMetrics =
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords.reduce(
      (summary, record) => {
        summary.closeoutRecords += 1
        if (record.payload.status === 'closed') summary.closed += 1
        if (record.payload.status === 'closed_with_actions') summary.closedWithActions += 1
        if (record.payload.status === 'rejected') summary.rejected += 1
        summary.closurePackages += record.payload.closurePackages.length
        summary.acknowledgementRecords += record.payload.acknowledgementRecords.length
        summary.deliveryRecords += record.payload.deliveryEvidence.length
        summary.retainedActions += record.payload.retainedActions.length
        summary.supersededAcknowledgements += record.payload.supersededAcknowledgements.length
        summary.supersededEvidence += record.payload.supersededEvidence.length
        return summary
      },
      {
        closeoutRecords: 0,
        closed: 0,
        closedWithActions: 0,
        rejected: 0,
        closurePackages: 0,
        acknowledgementRecords: 0,
        deliveryRecords: 0,
        retainedActions: 0,
        supersededAcknowledgements: 0,
        supersededEvidence: 0,
      },
    )
  const closeoutNotificationClosurePackageAcknowledgementClosurePackageStatus: StatusLevel =
    closeoutNotificationClosurePackageAcknowledgementClosurePackageMetrics.rejected > 0
      ? 'blocking'
      : closeoutNotificationClosurePackageAcknowledgementClosurePackageMetrics.closeoutRecords === 0 ||
          closeoutNotificationClosurePackageAcknowledgementClosurePackageMetrics.closedWithActions > 0 ||
          closeoutNotificationClosurePackageAcknowledgementClosurePackageMetrics.retainedActions > 0
        ? 'warning'
        : 'pass'
  const closeoutNotificationClosurePackageMetrics = {
    notificationClosures: closurePackageAcknowledgementCloseoutNotificationClosureRecords.length,
    closed: closurePackageAcknowledgementCloseoutNotificationClosureRecords.filter(
      (record) => record.payload.status === 'closed',
    ).length,
    closedWithActions: closurePackageAcknowledgementCloseoutNotificationClosureRecords.filter(
      (record) => record.payload.status === 'closed_with_actions',
    ).length,
    rejected: closurePackageAcknowledgementCloseoutNotificationClosureRecords.filter(
      (record) => record.payload.status === 'rejected',
    ).length,
    exportPackages: closurePackageAcknowledgementCloseoutNotificationClosureRecords.reduce(
      (total, record) => total + record.payload.exportPackages.length,
      0,
    ),
    deliveryRecords: closurePackageAcknowledgementCloseoutNotificationClosureRecords.reduce(
      (total, record) => total + record.payload.deliveryEvidence.length,
      0,
    ),
    acknowledgementRecords: closurePackageAcknowledgementCloseoutNotificationClosureRecords.reduce(
      (total, record) => total + record.payload.acknowledgementRecords.length,
      0,
    ),
    acknowledgementClosures: closurePackageAcknowledgementCloseoutNotificationClosureRecords.reduce(
      (total, record) => total + record.payload.acknowledgementClosures.length,
      0,
    ),
    retryControls: closurePackageAcknowledgementCloseoutNotificationClosureRecords.reduce(
      (total, record) => total + record.payload.retryControls.length,
      0,
    ),
    retainedActions: closurePackageAcknowledgementCloseoutNotificationClosureRecords.reduce(
      (total, record) => total + record.payload.retainedActions.length,
      0,
    ),
    supersededEvidence: closurePackageAcknowledgementCloseoutNotificationClosureRecords.reduce(
      (total, record) => total + record.payload.supersededEvidence.length,
      0,
    ),
  }
  const closeoutNotificationClosurePackageStatus: StatusLevel =
    closeoutNotificationClosurePackageMetrics.rejected > 0
      ? 'blocking'
      : closeoutNotificationClosurePackageMetrics.notificationClosures === 0 ||
          closeoutNotificationClosurePackageMetrics.closedWithActions > 0 ||
          closeoutNotificationClosurePackageMetrics.retainedActions > 0
        ? 'warning'
        : 'pass'
  const closeoutExportStatusRows = [
    ...closureSlaFollowUpClosurePackageAcknowledgementClosureRecords.map((record) => record.payload.status),
    ...postgresCutoverFinalHandoffClosurePackageAcknowledgementClosureRecords.map((record) => record.payload.status),
    ...notificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosureRecords.map(
      (record) => record.payload.status,
    ),
  ]
  const closeoutExportMetrics = {
    totalCloseouts: closeoutExportStatusRows.length,
    closureSlaCloseouts: closureSlaFollowUpClosurePackageAcknowledgementClosureRecords.length,
    finalHandoffCloseouts: postgresCutoverFinalHandoffClosurePackageAcknowledgementClosureRecords.length,
    retryQueueCloseouts: notificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosureRecords.length,
    closed: closeoutExportStatusRows.filter((status) => status === 'closed').length,
    closedWithActions: closeoutExportStatusRows.filter((status) => status === 'closed_with_actions').length,
    rejected: closeoutExportStatusRows.filter((status) => status === 'rejected').length,
    deferred: closeoutExportStatusRows.filter((status) => status === 'deferred').length,
    retainedActions: [
      ...closureSlaFollowUpClosurePackageAcknowledgementClosureRecords,
      ...postgresCutoverFinalHandoffClosurePackageAcknowledgementClosureRecords,
      ...notificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosureRecords,
    ].reduce((total, record) => total + record.payload.retainedActions.length, 0),
    supersededAcknowledgements: [
      ...closureSlaFollowUpClosurePackageAcknowledgementClosureRecords,
      ...postgresCutoverFinalHandoffClosurePackageAcknowledgementClosureRecords,
      ...notificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosureRecords,
    ].reduce((total, record) => total + record.payload.supersededAcknowledgements.length, 0),
    deliveryEvidenceRecords: [
      ...closureSlaFollowUpClosurePackageAcknowledgementClosureRecords,
      ...postgresCutoverFinalHandoffClosurePackageAcknowledgementClosureRecords,
      ...notificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosureRecords,
    ].reduce((total, record) => total + record.payload.deliveryEvidence.length, 0),
  }
  const closeoutExportStatus: StatusLevel = closeoutExportMetrics.rejected > 0
    ? 'blocking'
    : closeoutExportMetrics.totalCloseouts === 0 ||
        closeoutExportMetrics.closedWithActions > 0 ||
        closeoutExportMetrics.deferred > 0
      ? 'warning'
      : 'pass'
  const closureSlaFollowUpClosureMetrics = closureSlaResponseFollowUpClosureRecords.reduce(
    (summary, record) => {
      summary.totalClosures += 1
      if (record.payload.status === 'closed') summary.closed += 1
      if (record.payload.status === 'closed_with_actions') summary.closedWithActions += 1
      if (record.payload.status === 'rejected') summary.rejected += 1
      summary.retainedActions += record.payload.retainedActions.length
      summary.supersededRoutes += record.payload.supersededRoutes.length
      return summary
    },
    {
      totalClosures: 0,
      closed: 0,
      closedWithActions: 0,
      rejected: 0,
      retainedActions: 0,
      supersededRoutes: 0,
    },
  )
  const closureSlaFollowUpClosurePackageStatus: StatusLevel =
    closureSlaFollowUpClosureMetrics.rejected > 0
      ? 'blocking'
      : closureSlaFollowUpClosureMetrics.totalClosures === 0 || closureSlaFollowUpClosureMetrics.closedWithActions > 0
        ? 'warning'
        : 'pass'
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
  const postgresFinalHandoffClosurePackageDeliveryRecords = deliveryRecords.filter(
    (record) => record.payload.request.source === 'postgres_cutover_final_handoff_closure_package',
  )
  const latestPostgresFinalHandoffClosurePackageDelivery = postgresFinalHandoffClosurePackageDeliveryRecords[0]
  const postgresFinalHandoffClosurePackageAcknowledgedDeliveryIds = new Set(
    postgresCutoverFinalHandoffClosurePackageAcknowledgementRecords.map((record) => record.payload.deliveryRecordId),
  )
  const latestPostgresCutoverClosurePackageDelivery = postgresCutoverClosurePackageDeliveryRecords[0]
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
  function closureSlaFollowUpClosureSupersededEvidenceList() {
    return closureSlaFollowUpSupersededEvidence
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }
  function closureSlaFollowUpClosureActionList(route = latestClosureSlaResponseFollowUpRoute) {
    return route?.payload.requestedActions.length
      ? route.payload.requestedActions
      : closureSlaFollowUpActionList()
  }
  function closureSlaClosurePackageAckActionList() {
    return closureSlaClosurePackageAckActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closureSlaClosurePackageAckClosureActionList() {
    return closureSlaClosurePackageAckClosureActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closureSlaClosurePackageAckSupersededEvidenceList() {
    return closureSlaClosurePackageAckSupersededEvidence
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
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
  function closureSlaFollowUpClosurePackageAcknowledgementRequest(
    deliveryRecord = latestClosureSlaFollowUpClosurePackageDelivery,
  ) {
    if (!deliveryRecord) return
    return {
      closureReady: closureSlaClosurePackageAckReady,
      deliveryRecord,
      requestedActions: closureSlaClosurePackageAckActionList(),
      responseNotes: closureSlaClosurePackageAckNotes,
      reviewer: closureSlaClosurePackageAckReviewer,
      status: closureSlaClosurePackageAckStatus,
    }
  }
  function closureSlaFollowUpClosurePackageAcknowledgementClosureRequest() {
    return {
      closureNotes: closureSlaClosurePackageAckClosureNotes,
      retainedActions: closureSlaClosurePackageAckClosureActionList(),
      reviewer: closureSlaClosurePackageAckClosureReviewer,
      status: closureSlaClosurePackageAckClosureStatus,
      supersededEvidence: closureSlaClosurePackageAckSupersededEvidenceList(),
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
  function closureSlaResponseFollowUpClosureRequest(
    routeRecord = latestClosureSlaResponseFollowUpRoute,
  ) {
    return {
      closureNotes: closureSlaFollowUpClosureNotes,
      retainedActions: closureSlaFollowUpClosureActionList(routeRecord),
      reviewer: closureSlaFollowUpClosureReviewer,
      routeRecord,
      status: closureSlaFollowUpClosureStatus,
      supersededEvidence: closureSlaFollowUpClosureSupersededEvidenceList(),
    }
  }
  function closureSlaClosurePackageReviewerList() {
    return closureSlaClosurePackageReviewers
      .split(',')
      .map((reviewer) => reviewer.trim())
      .filter(Boolean)
  }
  function closureSlaFollowUpClosurePackageRequiredActions() {
    const actions = [
      closureSlaResponseFollowUpClosureRecords.length > 0
        ? null
        : 'Retain at least one Closure SLA follow-up closure before exporting closure package evidence.',
      closureSlaFollowUpClosureMetrics.rejected > 0
        ? `Resolve ${closureSlaFollowUpClosureMetrics.rejected} rejected Closure SLA follow-up closure record(s).`
        : null,
      closureSlaFollowUpClosureMetrics.closedWithActions > 0
        ? `Disposition retained actions from ${closureSlaFollowUpClosureMetrics.closedWithActions} Closure SLA follow-up closure record(s).`
        : null,
      closureSlaFollowUpNotificationRecords.length > 0
        ? null
        : 'Retain Closure SLA follow-up notification delivery evidence before external package review.',
    ]
    return actions.filter((action): action is string => Boolean(action))
  }
  function buildClosureSlaFollowUpClosureExportPackage(): ClosureSlaFollowUpClosureExportPackage {
    const generatedAt = new Date().toISOString()
    const reviewers = closureSlaClosurePackageReviewerList()
    const governanceReviewers = reviewers.length > 0 ? reviewers : ['Quality Governance Reviewer']
    const requiredActions = closureSlaFollowUpClosurePackageRequiredActions()
    return {
      packageId: `closure_sla_follow_up_closure_export:${generatedAt}`,
      generatedAt,
      governanceReviewers,
      status: closureSlaFollowUpClosurePackageStatus,
      metrics: closureSlaFollowUpClosureMetrics,
      closureRecords: closureSlaResponseFollowUpClosureRecords,
      notificationEvidence: closureSlaFollowUpNotificationRecords,
      requiredActions,
      reviewerNotes: closureSlaClosurePackageNotes.trim() || 'No Closure SLA follow-up closure package reviewer notes recorded.',
      sourceRecordCounts: {
        closureRecords: closureSlaResponseFollowUpClosureRecords.length,
        followUpRoutes: closureSlaResponseFollowUpRouteRecords.length,
        acknowledgementRecords: closureSlaDeliveryAcknowledgementRecords.length,
        notificationDeliveries: closureSlaFollowUpNotificationRecords.length,
      },
      evidence: `Closure SLA follow-up closure export package generated for ${governanceReviewers.join(', ')} with ${closureSlaFollowUpClosureMetrics.totalClosures} closure record(s), ${closureSlaFollowUpClosureMetrics.retainedActions} retained action(s), and ${requiredActions.length} required action(s).`,
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
  function postgresFinalHandoffActionList() {
    return postgresFinalHandoffActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function postgresFinalHandoffClosurePackageAckActionList() {
    return postgresFinalHandoffClosurePackageAckActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function postgresFinalHandoffClosurePackageAckClosureActionList() {
    return postgresFinalHandoffClosurePackageAckClosureActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function postgresFinalHandoffClosurePackageAckSupersededEvidenceList() {
    return postgresFinalHandoffClosurePackageAckSupersededEvidence
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }
  function postgresFinalHandoffClosureReviewerList() {
    return postgresFinalHandoffClosureReviewers
      .split(',')
      .map((reviewer) => reviewer.trim())
      .filter(Boolean)
  }
  function postgresFinalHandoffClosurePackageRequiredActions() {
    const actions = [
      postgresCutoverFinalHandoffAcknowledgementRecords.length > 0
        ? null
        : 'Retain at least one final handoff acknowledgement before closing production cutover.',
      postgresFinalHandoffClosureMetrics.rejected > 0
        ? `Resolve ${postgresFinalHandoffClosureMetrics.rejected} rejected final handoff acknowledgement record(s).`
        : null,
      postgresFinalHandoffClosureMetrics.changesRequested > 0
        ? `Disposition ${postgresFinalHandoffClosureMetrics.changesRequested} final handoff change request(s).`
        : null,
      postgresFinalHandoffClosureMetrics.acknowledgedWithActions > 0
        ? `Disposition retained actions from ${postgresFinalHandoffClosureMetrics.acknowledgedWithActions} final handoff acknowledgement record(s).`
        : null,
      postgresFinalHandoffClosureMetrics.closureReady < postgresFinalHandoffClosureMetrics.totalAcknowledgements
        ? 'Confirm final handoff ready on all retained acknowledgement records before production cutover closure.'
        : null,
      postgresCutoverClosurePackageDeliveryRecords.length > 0
        ? null
        : 'Deliver the production cutover closure package before retaining final handoff acknowledgement closure evidence.',
    ]
    return actions.filter((action): action is string => Boolean(action))
  }
  function buildPostgresFinalHandoffClosurePackage(): PostgresCutoverFinalHandoffClosurePackage {
    const generatedAt = new Date().toISOString()
    const reviewers = postgresFinalHandoffClosureReviewerList()
    const closureReviewers = reviewers.length > 0 ? reviewers : ['Infrastructure Owner']
    const requiredActions = postgresFinalHandoffClosurePackageRequiredActions()
    return {
      packageId: `postgres_cutover_final_handoff_closure:${generatedAt}`,
      generatedAt,
      closureReviewers,
      status: postgresFinalHandoffClosureStatus,
      acknowledgementRecords: postgresCutoverFinalHandoffAcknowledgementRecords,
      closurePackage: latestPostgresCutoverClosurePackage,
      deliveryEvidence: postgresCutoverClosurePackageDeliveryRecords,
      metrics: postgresFinalHandoffClosureMetrics,
      requiredActions,
      reviewerNotes: postgresFinalHandoffClosureNotes.trim() || 'No final handoff closure package reviewer notes recorded.',
      sourceRecordCounts: {
        closurePackages: postgresCutoverClosurePackageRecords.length,
        acknowledgementRecords: postgresCutoverFinalHandoffAcknowledgementRecords.length,
        deliveryRecords: postgresCutoverClosurePackageDeliveryRecords.length,
      },
      auditHistory: [
        {
          action: 'final_handoff_closure_package_generated',
          actor: closureReviewers.join(', '),
          timestamp: generatedAt,
          status: postgresFinalHandoffClosureStatus,
          summary: `Final handoff acknowledgement closure package generated with ${postgresFinalHandoffClosureMetrics.totalAcknowledgements} acknowledgement record(s).`,
        },
      ],
      evidence: `Final handoff acknowledgement closure package generated for ${closureReviewers.join(', ')} with ${postgresFinalHandoffClosureMetrics.totalAcknowledgements} acknowledgement record(s), ${postgresFinalHandoffClosureMetrics.retainedActions} retained action(s), and ${requiredActions.length} required action(s).`,
    }
  }
  function postgresFinalHandoffAcknowledgementRequest(
    deliveryRecord = latestPostgresCutoverClosurePackageDelivery,
  ) {
    if (!deliveryRecord) return
    return {
      deliveryRecord,
      finalHandoffReady: postgresFinalHandoffReady,
      requestedActions: postgresFinalHandoffActionList(),
      responseNotes: postgresFinalHandoffNotes,
      reviewer: postgresFinalHandoffReviewer,
      reviewerRole: postgresFinalHandoffReviewerRole,
      status: postgresFinalHandoffStatus,
    }
  }
  function postgresFinalHandoffClosurePackageAcknowledgementRequest(
    deliveryRecord = latestPostgresFinalHandoffClosurePackageDelivery,
  ) {
    if (!deliveryRecord) return
    return {
      closureReady: postgresFinalHandoffClosurePackageReady,
      deliveryRecord,
      requestedActions: postgresFinalHandoffClosurePackageAckActionList(),
      responseNotes: postgresFinalHandoffClosurePackageAckNotes,
      reviewer: postgresFinalHandoffClosurePackageAckReviewer,
      reviewerRole: postgresFinalHandoffClosurePackageAckReviewerRole,
      status: postgresFinalHandoffClosurePackageAckStatus,
    }
  }
  function postgresFinalHandoffClosurePackageAcknowledgementClosureRequest() {
    return {
      closureNotes: postgresFinalHandoffClosurePackageAckClosureNotes,
      retainedActions: postgresFinalHandoffClosurePackageAckClosureActionList(),
      reviewer: postgresFinalHandoffClosurePackageAckClosureReviewer,
      status: postgresFinalHandoffClosurePackageAckClosureStatus,
      supersededEvidence: postgresFinalHandoffClosurePackageAckSupersededEvidenceList(),
    }
  }
  function closeoutExportReviewerList() {
    return closeoutExportReviewers
      .split(',')
      .map((reviewer) => reviewer.trim())
      .filter(Boolean)
  }
  function closeoutExportRequiredActions() {
    const actions = [
      closeoutExportMetrics.totalCloseouts > 0
        ? null
        : 'Retain at least one closure package acknowledgement closeout before exporting governance evidence.',
      closeoutExportMetrics.closureSlaCloseouts > 0
        ? null
        : 'Retain Closure SLA follow-up closure package acknowledgement closeout evidence.',
      closeoutExportMetrics.finalHandoffCloseouts > 0
        ? null
        : 'Retain final handoff closure package acknowledgement closeout evidence.',
      closeoutExportMetrics.retryQueueCloseouts > 0
        ? null
        : 'Retain retry queue closure package acknowledgement closeout evidence.',
      closeoutExportMetrics.rejected > 0
        ? `Resolve ${closeoutExportMetrics.rejected} rejected closeout record(s) before governance closure.`
        : null,
      closeoutExportMetrics.deferred > 0
        ? `Disposition ${closeoutExportMetrics.deferred} deferred closeout record(s) before final governance handoff.`
        : null,
      closeoutExportMetrics.closedWithActions > 0
        ? `Confirm retained actions for ${closeoutExportMetrics.closedWithActions} closeout record(s).`
        : null,
    ]
    return actions.filter((action): action is string => Boolean(action))
  }
  function buildCloseoutExportPackage(): ClosurePackageAcknowledgementCloseoutExportPackage {
    const generatedAt = new Date().toISOString()
    const reviewers = closeoutExportReviewerList()
    const governanceReviewers = reviewers.length > 0 ? reviewers : ['Governance Reviewer']
    const requiredActions = closeoutExportRequiredActions()
    return {
      packageId: `closure_package_acknowledgement_closeout_export:${generatedAt}`,
      generatedAt,
      governanceReviewers,
      status: closeoutExportStatus,
      closeoutRecords: {
        closureSla: closureSlaFollowUpClosurePackageAcknowledgementClosureRecords,
        finalHandoff: postgresCutoverFinalHandoffClosurePackageAcknowledgementClosureRecords,
        retryQueue: notificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosureRecords,
      },
      metrics: closeoutExportMetrics,
      requiredActions,
      reviewerNotes: closeoutExportNotes.trim() || 'No closure package acknowledgement closeout export notes recorded.',
      sourceRecordCounts: {
        closureSlaCloseouts: closureSlaFollowUpClosurePackageAcknowledgementClosureRecords.length,
        finalHandoffCloseouts: postgresCutoverFinalHandoffClosurePackageAcknowledgementClosureRecords.length,
        retryQueueCloseouts: notificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosureRecords.length,
      },
      auditHistory: [
        {
          action: 'closure_package_acknowledgement_closeout_export_generated',
          actor: governanceReviewers.join(', '),
          timestamp: generatedAt,
          status: closeoutExportStatus,
          summary: `Closure package acknowledgement closeout export generated with ${closeoutExportMetrics.totalCloseouts} closeout record(s).`,
        },
      ],
      evidence: `Closure package acknowledgement closeout export package generated for ${governanceReviewers.join(', ')} with ${closeoutExportMetrics.totalCloseouts} closeout record(s), ${closeoutExportMetrics.retainedActions} retained action(s), and ${requiredActions.length} required action(s).`,
    }
  }
  function closeoutExportAcknowledgementActionList() {
    return closeoutExportAckActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutExportAcknowledgementRequest(
    deliveryRecord = latestCloseoutExportDelivery,
  ) {
    if (!deliveryRecord) return
    return {
      closeoutReady: closeoutExportReady,
      deliveryRecord,
      requestedActions: closeoutExportAcknowledgementActionList(),
      responseNotes: closeoutExportAckNotes,
      reviewer: closeoutExportAckReviewer,
      reviewerRole: closeoutExportAckReviewerRole,
      status: closeoutExportAckStatus,
    }
  }
  function closeoutExportAcknowledgementClosureActionList() {
    return closeoutExportAckClosureActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutExportAcknowledgementSupersededEvidenceList() {
    return closeoutExportAckSupersededEvidence
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }
  function closeoutExportAcknowledgementClosureRequest() {
    return {
      closureNotes: closeoutExportAckClosureNotes,
      retainedActions: closeoutExportAcknowledgementClosureActionList(),
      reviewer: closeoutExportAckClosureReviewer,
      status: closeoutExportAckClosureStatus,
      supersededEvidence: closeoutExportAcknowledgementSupersededEvidenceList(),
    }
  }
  function closeoutNotificationClosureActionList() {
    return closeoutNotificationClosureActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosureSupersededEvidenceList() {
    return closeoutNotificationClosureSupersededEvidence
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosureRequest() {
    return {
      closureNotes: closeoutNotificationClosureNotes,
      retainedActions: closeoutNotificationClosureActionList(),
      reviewer: closeoutNotificationClosureReviewer,
      status: closeoutNotificationClosureStatus,
      supersededEvidence: closeoutNotificationClosureSupersededEvidenceList(),
    }
  }
  function closeoutNotificationClosurePackageReviewerList() {
    return closeoutNotificationClosurePackageReviewers
      .split(',')
      .map((reviewer) => reviewer.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageRequiredActions() {
    return closurePackageAcknowledgementCloseoutNotificationClosureRecords
      .flatMap((record) => record.payload.retainedActions)
      .map((action) => action.trim())
      .filter((action, index, actions) => action.length > 0 && actions.indexOf(action) === index)
  }
  function buildCloseoutNotificationClosurePackage(): ClosurePackageAcknowledgementCloseoutNotificationClosurePackage {
    const generatedAt = new Date().toISOString()
    const closureReviewers = closeoutNotificationClosurePackageReviewerList()
    const requiredActions = closeoutNotificationClosurePackageRequiredActions()
    const sourceExportPackages = closurePackageAcknowledgementCloseoutNotificationClosureRecords.flatMap(
      (record) => record.payload.exportPackages,
    )
    const sourceDeliveryEvidence = closurePackageAcknowledgementCloseoutNotificationClosureRecords.flatMap(
      (record) => record.payload.deliveryEvidence,
    )
    const sourceAcknowledgements = closurePackageAcknowledgementCloseoutNotificationClosureRecords.flatMap(
      (record) => record.payload.acknowledgementRecords,
    )
    const sourceAcknowledgementClosures = closurePackageAcknowledgementCloseoutNotificationClosureRecords.flatMap(
      (record) => record.payload.acknowledgementClosures,
    )
    const sourceRetryControls = closurePackageAcknowledgementCloseoutNotificationClosureRecords.flatMap(
      (record) => record.payload.retryControls,
    )
    return {
      packageId: `closure_package_acknowledgement_closeout_notification_closure_package:${generatedAt}`,
      generatedAt,
      closureReviewers,
      status: closeoutNotificationClosurePackageStatus,
      notificationClosureRecords: closurePackageAcknowledgementCloseoutNotificationClosureRecords,
      exportPackages: sourceExportPackages,
      deliveryEvidence: sourceDeliveryEvidence,
      acknowledgementRecords: sourceAcknowledgements,
      acknowledgementClosures: sourceAcknowledgementClosures,
      retryControls: sourceRetryControls,
      metrics: closeoutNotificationClosurePackageMetrics,
      requiredActions,
      reviewerNotes:
        closeoutNotificationClosurePackageNotes.trim() ||
        'No closeout acknowledgement closure package notes recorded.',
      sourceRecordCounts: {
        notificationClosures: closurePackageAcknowledgementCloseoutNotificationClosureRecords.length,
        exportPackages: sourceExportPackages.length,
        deliveryRecords: sourceDeliveryEvidence.length,
        acknowledgementRecords: sourceAcknowledgements.length,
        acknowledgementClosures: sourceAcknowledgementClosures.length,
        retryControls: sourceRetryControls.length,
      },
      auditHistory: [
        {
          action: 'closure_package_acknowledgement_closeout_notification_closure_package_generated',
          actor: closureReviewers.join(', ') || 'Governance Reviewer',
          timestamp: generatedAt,
          status: closeoutNotificationClosurePackageStatus,
          summary: `Closeout acknowledgement closure package generated with ${closurePackageAcknowledgementCloseoutNotificationClosureRecords.length} notification closure record(s).`,
        },
      ],
      evidence: `Closeout acknowledgement closure package generated for ${closureReviewers.join(', ')} with ${closurePackageAcknowledgementCloseoutNotificationClosureRecords.length} notification closure record(s), ${sourceDeliveryEvidence.length} delivery evidence record(s), and ${requiredActions.length} required action(s).`,
    }
  }
  function closeoutNotificationClosurePackageAcknowledgementActionList() {
    return closeoutNotificationClosurePackageAckActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementRequest(
    deliveryRecord = latestCloseoutNotificationClosurePackageDelivery,
  ) {
    if (!deliveryRecord) return
    return {
      closureReady: closeoutNotificationClosurePackageReady,
      deliveryRecord,
      requestedActions: closeoutNotificationClosurePackageAcknowledgementActionList(),
      responseNotes: closeoutNotificationClosurePackageAckNotes,
      reviewer: closeoutNotificationClosurePackageAckReviewer,
      reviewerRole: closeoutNotificationClosurePackageAckReviewerRole,
      status: closeoutNotificationClosurePackageAckStatus,
    }
  }
  function closeoutNotificationClosurePackageAcknowledgementClosureActionList() {
    return closeoutNotificationClosurePackageAckClosureActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementSupersededEvidenceList() {
    return closeoutNotificationClosurePackageAckSupersededEvidence
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementClosureRequest() {
    return {
      closureNotes: closeoutNotificationClosurePackageAckClosureNotes,
      retainedActions: closeoutNotificationClosurePackageAcknowledgementClosureActionList(),
      reviewer: closeoutNotificationClosurePackageAckClosureReviewer,
      status: closeoutNotificationClosurePackageAckClosureStatus,
      supersededEvidence: closeoutNotificationClosurePackageAcknowledgementSupersededEvidenceList(),
    }
  }
  function closeoutNotificationClosurePackageAcknowledgementClosurePackageReviewerList() {
    return closeoutNotificationClosurePackageAckClosurePackageReviewers
      .split(',')
      .map((reviewer) => reviewer.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementClosurePackageRequiredActions() {
    return closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords
      .flatMap((record) => record.payload.retainedActions)
      .map((action) => action.trim())
      .filter((action, index, actions) => action.length > 0 && actions.indexOf(action) === index)
  }
  function buildCloseoutNotificationClosurePackageAcknowledgementClosurePackage():
    ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage {
    const generatedAt = new Date().toISOString()
    const closeoutReviewers = closeoutNotificationClosurePackageAcknowledgementClosurePackageReviewerList()
    const requiredActions = closeoutNotificationClosurePackageAcknowledgementClosurePackageRequiredActions()
    const closurePackages = closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords.flatMap(
      (record) => record.payload.closurePackages,
    )
    const acknowledgementRecords = closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords.flatMap(
      (record) => record.payload.acknowledgementRecords,
    )
    const deliveryEvidence = closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords.flatMap(
      (record) => record.payload.deliveryEvidence,
    )
    return {
      packageId: `closure_package_acknowledgement_closeout_notification_closure_package_ack_closure_package:${generatedAt}`,
      generatedAt,
      closeoutReviewers,
      status: closeoutNotificationClosurePackageAcknowledgementClosurePackageStatus,
      acknowledgementCloseoutRecords:
        closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords,
      closurePackages,
      acknowledgementRecords,
      deliveryEvidence,
      metrics: closeoutNotificationClosurePackageAcknowledgementClosurePackageMetrics,
      requiredActions,
      reviewerNotes:
        closeoutNotificationClosurePackageAckClosurePackageNotes.trim() ||
        'No closeout acknowledgement closeout package notes recorded.',
      sourceRecordCounts: {
        closeoutRecords:
          closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords.length,
        closurePackages: closurePackages.length,
        acknowledgementRecords: acknowledgementRecords.length,
        deliveryRecords: deliveryEvidence.length,
      },
      auditHistory: [
        {
          action:
            'closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_generated',
          actor: closeoutReviewers.join(', ') || 'Governance Reviewer',
          timestamp: generatedAt,
          status: closeoutNotificationClosurePackageAcknowledgementClosurePackageStatus,
          summary: `Closeout acknowledgement closeout package generated with ${closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords.length} acknowledgement closeout record(s).`,
        },
      ],
      evidence: `Closeout acknowledgement closeout package generated for ${closeoutReviewers.join(', ')} with ${closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords.length} acknowledgement closeout record(s), ${deliveryEvidence.length} delivery evidence record(s), and ${requiredActions.length} required action(s).`,
    }
  }
  function closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementActionList() {
    return closeoutNotificationClosurePackageAckClosurePackageAckActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRequest(
    deliveryRecord = latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageDelivery,
  ) {
    if (!deliveryRecord) return
    return {
      deliveryRecord,
      finalEvidenceReady: closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady,
      requestedActions: closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementActionList(),
      responseNotes: closeoutNotificationClosurePackageAckClosurePackageAckNotes,
      reviewer: closeoutNotificationClosurePackageAckClosurePackageAckReviewer,
      reviewerRole: closeoutNotificationClosurePackageAckClosurePackageAckReviewerRole,
      status: closeoutNotificationClosurePackageAckClosurePackageAckStatus,
    }
  }
  function closeoutNotificationClosurePackageAcknowledgementClosurePackageFinalEvidenceActionList() {
    return closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementClosurePackageFinalEvidenceSupersededList() {
    return closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceSuperseded
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementClosurePackageFinalEvidenceRequest() {
    return {
      finalEvidenceNotes: closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceNotes,
      retainedActions: closeoutNotificationClosurePackageAcknowledgementClosurePackageFinalEvidenceActionList(),
      reviewer: closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceReviewer,
      status: closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceStatus,
      supersededEvidence: closeoutNotificationClosurePackageAcknowledgementClosurePackageFinalEvidenceSupersededList(),
    }
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementActionList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementRequest(
    deliveryRecord = latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageFinalEvidenceDelivery,
  ) {
    if (!deliveryRecord) return
    return {
      closeoutReady: closeoutNotificationClosurePackageFinalEvidenceCloseoutReady,
      deliveryRecord,
      requestedActions: closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementActionList(),
      responseNotes: closeoutNotificationClosurePackageFinalEvidenceAckNotes,
      reviewer: closeoutNotificationClosurePackageFinalEvidenceAckReviewer,
      reviewerRole: closeoutNotificationClosurePackageFinalEvidenceAckReviewerRole,
      status: closeoutNotificationClosurePackageFinalEvidenceAckStatus,
    }
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureActionList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckCloseoutActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureSupersededList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckCloseoutSuperseded
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureRequest() {
    return {
      closeoutNotes: closeoutNotificationClosurePackageFinalEvidenceAckCloseoutNotes,
      retainedActions: closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureActionList(),
      reviewer: closeoutNotificationClosurePackageFinalEvidenceAckCloseoutReviewer,
      status: closeoutNotificationClosurePackageFinalEvidenceAckCloseoutStatus,
      supersededEvidence:
        closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureSupersededList(),
    }
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementActionList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementRequest(
    deliveryRecord = latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDelivery,
  ) {
    if (!deliveryRecord) return
    return {
      acknowledgementClosureReady: closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckReady,
      deliveryRecord,
      requestedActions:
        closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementActionList(),
      responseNotes: closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckNotes,
      reviewer: closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckReviewer,
      reviewerRole: closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckReviewerRole,
      status: closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckStatus,
    }
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureActionList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureSupersededList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureSuperseded
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureRequest() {
    return {
      closureNotes: closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureNotes,
      retainedActions:
        closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureActionList(),
      reviewer: closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureReviewer,
      status: closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureStatus,
      supersededEvidence:
        closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureSupersededList(),
    }
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementActionList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementRequest(
    deliveryRecord = latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDelivery,
  ) {
    if (!deliveryRecord) return
    return {
      deliveryRecord,
      finalEvidenceReady: closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceReady,
      requestedActions:
        closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementActionList(),
      responseNotes: closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckNotes,
      reviewer: closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckReviewer,
      reviewerRole: closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckReviewerRole,
      status: closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckStatus,
    }
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceActionList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceSupersededList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceSuperseded
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceRequest() {
    return {
      finalEvidenceNotes:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceNotes,
      retainedActions:
        closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceActionList(),
      reviewer: closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceReviewer,
      status: closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceStatus,
      supersededEvidence:
        closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceSupersededList(),
    }
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementActionList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementRequest(
    deliveryRecord = latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDelivery,
  ) {
    if (!deliveryRecord) return
    return {
      closeoutReady:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutReady,
      deliveryRecord,
      requestedActions:
        closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementActionList(),
      responseNotes:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckNotes,
      reviewer:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckReviewer,
      reviewerRole:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckReviewerRole,
      status:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckStatus,
    }
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutActionList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutSupersededList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutSuperseded
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutRequest() {
    return {
      closeoutNotes:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutNotes,
      retainedActions:
        closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutActionList(),
      reviewer:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutReviewer,
      status:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutStatus,
      supersededEvidence:
        closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutSupersededList(),
    }
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementActionList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementRequest(
    deliveryRecord = latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDelivery,
  ) {
    if (!deliveryRecord) return
    return {
      acknowledgementClosureReady:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceAckClosureReady,
      deliveryRecord,
      requestedActions:
        closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementActionList(),
      responseNotes:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckNotes,
      reviewer:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckReviewer,
      reviewerRole:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckReviewerRole,
      status:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckStatus,
    }
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureActionList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureSupersededList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureSuperseded
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureRequest() {
    return {
      closureNotes:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureNotes,
      retainedActions:
        closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureActionList(),
      reviewer:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureReviewer,
      status:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureStatus,
      supersededEvidence:
        closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureSupersededList(),
    }
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementActionList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementRequest(
    deliveryRecord = latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDelivery,
  ) {
    if (!deliveryRecord) return
    return {
      closeoutReady:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureCloseoutReady,
      deliveryRecord,
      requestedActions:
        closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementActionList(),
      responseNotes:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckNotes,
      reviewer:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckReviewer,
      reviewerRole:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckReviewerRole,
      status:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckStatus,
    }
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceActionList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceSupersededList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutSuperseded
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceRequest() {
    return {
      closeoutNotes:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutNotes,
      retainedActions:
        closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceActionList(),
      reviewer:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutReviewer,
      status:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutStatus,
      supersededEvidence:
        closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceSupersededList(),
    }
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementActionList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementRequest(
    deliveryRecord = latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDelivery,
  ) {
    if (!deliveryRecord) return
    return {
      deliveryRecord,
      finalEvidenceReady:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceReady,
      requestedActions:
        closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementActionList(),
      responseNotes:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckNotes,
      reviewer:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckReviewer,
      reviewerRole:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckReviewerRole,
      status:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckStatus,
    }
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidenceActionList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidenceSupersededList() {
    return closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceSuperseded
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }
  function closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidenceRequest() {
    return {
      finalEvidenceNotes:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceNotes,
      retainedActions:
        closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidenceActionList(),
      reviewer:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceReviewer,
      status:
        closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceStatus,
      supersededEvidence:
        closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidenceSupersededList(),
    }
  }
  function retryQueueOperationsReviewerList() {
    return retryQueueOperationsReviewers
      .split(',')
      .map((reviewer) => reviewer.trim())
      .filter(Boolean)
  }
  function retryQueueAcknowledgementActionList() {
    return retryQueueAckActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function retryQueueAcknowledgementClosurePackageAckActionList() {
    return retryQueueClosurePackageAckActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function retryQueueAcknowledgementClosurePackageAckClosureActionList() {
    return retryQueueClosurePackageAckClosureActions
      .split('\n')
      .map((action) => action.trim())
      .filter(Boolean)
  }
  function retryQueueAcknowledgementClosurePackageAckSupersededEvidenceList() {
    return retryQueueClosurePackageAckSupersededEvidence
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }
  function retryQueueClosurePackageReviewerList() {
    return retryQueueClosurePackageReviewers
      .split(',')
      .map((reviewer) => reviewer.trim())
      .filter(Boolean)
  }
  function retryQueueAcknowledgementClosurePackageRequiredActions() {
    const actions = [
      notificationRetryQueueAcknowledgementRecords.length > 0
        ? null
        : 'Retain at least one retry queue acknowledgement before closing notification operations review.',
      retryQueueAcknowledgementClosureMetrics.rejected > 0
        ? `Resolve ${retryQueueAcknowledgementClosureMetrics.rejected} rejected retry queue acknowledgement record(s).`
        : null,
      retryQueueAcknowledgementClosureMetrics.changesRequested > 0
        ? `Disposition ${retryQueueAcknowledgementClosureMetrics.changesRequested} retry queue acknowledgement change request(s).`
        : null,
      retryQueueAcknowledgementClosureMetrics.acknowledgedWithActions > 0
        ? `Disposition retained actions from ${retryQueueAcknowledgementClosureMetrics.acknowledgedWithActions} retry queue acknowledgement record(s).`
        : null,
      retryQueueAcknowledgementClosureMetrics.closureReady < retryQueueAcknowledgementClosureMetrics.totalAcknowledgements
        ? 'Confirm queue closure ready on all retained retry queue acknowledgement records before operations closure.'
        : null,
      retryQueuePackageDeliveryRecords.length > 0
        ? null
        : 'Deliver the retry queue package before retaining acknowledgement closure evidence.',
    ]
    return actions.filter((action): action is string => Boolean(action))
  }
  function buildRetryQueueAcknowledgementClosurePackage(): NotificationRetryQueueAcknowledgementClosurePackage {
    const generatedAt = new Date().toISOString()
    const reviewers = retryQueueClosurePackageReviewerList()
    const closureReviewers = reviewers.length > 0 ? reviewers : ['Notification Operations Owner']
    const requiredActions = retryQueueAcknowledgementClosurePackageRequiredActions()
    return {
      packageId: `notification_retry_queue_acknowledgement_closure:${generatedAt}`,
      generatedAt,
      closureReviewers,
      status: retryQueueAcknowledgementClosureStatus,
      acknowledgementRecords: notificationRetryQueueAcknowledgementRecords,
      retryQueuePackages: notificationRetryQueueExportPackageRecords,
      deliveryEvidence: retryQueuePackageDeliveryRecords,
      metrics: retryQueueAcknowledgementClosureMetrics,
      requiredActions,
      reviewerNotes: retryQueueClosurePackageNotes.trim() || 'No retry queue acknowledgement closure package reviewer notes recorded.',
      sourceRecordCounts: {
        retryQueuePackages: notificationRetryQueueExportPackageRecords.length,
        acknowledgementRecords: notificationRetryQueueAcknowledgementRecords.length,
        deliveryRecords: retryQueuePackageDeliveryRecords.length,
      },
      auditHistory: [
        {
          action: 'retry_queue_acknowledgement_closure_package_generated',
          actor: closureReviewers.join(', '),
          timestamp: generatedAt,
          status: retryQueueAcknowledgementClosureStatus,
          summary: `Retry queue acknowledgement closure package generated with ${retryQueueAcknowledgementClosureMetrics.totalAcknowledgements} acknowledgement record(s).`,
        },
      ],
      evidence: `Retry queue acknowledgement closure package generated for ${closureReviewers.join(', ')} with ${retryQueueAcknowledgementClosureMetrics.totalAcknowledgements} acknowledgement record(s), ${retryQueueAcknowledgementClosureMetrics.retainedActions} retained action(s), and ${requiredActions.length} required action(s).`,
    }
  }
  function retryQueueAcknowledgementClosurePackageAcknowledgementRequest(
    deliveryRecord = latestRetryQueueAcknowledgementClosurePackageDelivery,
  ) {
    if (!deliveryRecord) return
    return {
      closureReady: retryQueueClosurePackageReady,
      deliveryRecord,
      requestedActions: retryQueueAcknowledgementClosurePackageAckActionList(),
      responseNotes: retryQueueClosurePackageAckNotes,
      reviewer: retryQueueClosurePackageAckReviewer,
      reviewerRole: retryQueueClosurePackageAckReviewerRole,
      status: retryQueueClosurePackageAckStatus,
    }
  }
  function retryQueueAcknowledgementClosurePackageAcknowledgementClosureRequest() {
    return {
      closureNotes: retryQueueClosurePackageAckClosureNotes,
      retainedActions: retryQueueAcknowledgementClosurePackageAckClosureActionList(),
      reviewer: retryQueueClosurePackageAckClosureReviewer,
      status: retryQueueClosurePackageAckClosureStatus,
      supersededEvidence: retryQueueAcknowledgementClosurePackageAckSupersededEvidenceList(),
    }
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
  function retryQueueAcknowledgementRequest(
    deliveryRecord = latestRetryQueuePackageDelivery,
  ) {
    if (!deliveryRecord) return
    return {
      deliveryRecord,
      queueClosureReady: retryQueueClosureReady,
      requestedActions: retryQueueAcknowledgementActionList(),
      responseNotes: retryQueueAckNotes,
      reviewer: retryQueueAckReviewer,
      reviewerRole: retryQueueAckReviewerRole,
      status: retryQueueAckStatus,
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

      <section className="panel governance-work-queue-panel">
        <PanelHeader
          icon={ClipboardCheck}
          title="Governance Work Queue"
          subtitle="Normalized workflow view across packages, deliveries, acknowledgements, closures, closeouts, retries, and final evidence."
        />
        <div className="metadata-grid">
          <Metadata label="Governance records" value={String(governanceWorkflowQueue.summary.total)} />
          <Metadata label="Action items" value={String(governanceWorkflowQueue.summary.actionItems)} />
          <Metadata label="Blocking" value={String(governanceWorkflowQueue.summary.blocking)} />
          <Metadata label="Warnings" value={String(governanceWorkflowQueue.summary.warning)} />
          <Metadata label="Retained" value={String(governanceWorkflowQueue.summary.pass)} />
          <Metadata label="Structured metadata" value={String(structuredWorkflowRecordCount)} />
          <Metadata
            label="Latest update"
            value={
              governanceWorkflowQueue.summary.latestUpdatedAt
                ? new Date(governanceWorkflowQueue.summary.latestUpdatedAt).toLocaleString()
                : 'No governance records'
            }
          />
        </div>
        <div className="version-summary backend-summary">
          <span>{governanceWorkflowQueue.summary.byStage.package} packages</span>
          <span>{governanceWorkflowQueue.summary.byStage.delivery} deliveries</span>
          <span>{governanceWorkflowQueue.summary.byStage.acknowledgement} acknowledgements</span>
          <span>{governanceWorkflowQueue.summary.byStage.closure} closures</span>
          <span>{governanceWorkflowQueue.summary.byStage.closeout} closeouts</span>
          <span>{governanceWorkflowQueue.summary.byStage.final_evidence} final evidence</span>
        </div>
        <div className="workflow-definition-grid">
          <article className="workflow-definition-card">
            <div>
              <strong>Workflow Definition Contracts</strong>
              <span>{workflowDefinitionEntries.length} reusable workflow definition(s) loaded from config.</span>
            </div>
            <div className="metadata-grid compact">
              <Metadata label="Config-backed records" value={String(configuredWorkflowItemCount)} />
              <Metadata
                label="Configured workflows"
                value={workflowDefinitionEntries.map(([, definition]) => definition.display_name).join(', ')}
              />
            </div>
          </article>
          <article className="workflow-definition-card">
            {selectedWorkflowDefinition ? (
              <>
                <div>
                  <strong>{selectedWorkflowDefinition.display_name}</strong>
                  <span>{selectedWorkflowDefinition.description}</span>
                </div>
                <div className="workflow-definition-tags">
                  <span className="chip active">{selectedWorkflowDefinition.sla_days} day SLA</span>
                  <span className="chip">
                    {selectedWorkflowItem
                      ? selectedWorkflowItem.dueStatus === 'not_scheduled'
                        ? 'No due date'
                        : titleize(selectedWorkflowItem.dueStatus)
                      : 'Definition preview'}
                  </span>
                  <span className="chip">{selectedWorkflowDefinition.default_owner_role}</span>
                </div>
                <div className="metadata-grid compact">
                  <Metadata
                    label="Allowed next"
                    value={
                      selectedAllowedNextStages.length > 0
                        ? selectedAllowedNextStages.map(titleize).join(', ')
                        : 'Terminal stage'
                    }
                  />
                  <Metadata
                    label="Parent links"
                    value={selectedWorkflowDefinition.parent_link_fields.join(', ')}
                  />
                  <Metadata
                    label="Export package"
                    value={selectedWorkflowItem?.exportPackageLabel ?? selectedWorkflowDefinition.export_package.label}
                  />
                  <Metadata
                    label="Applies to"
                    value={selectedWorkflowDefinition.applicable_domains.map(titleize).join(', ')}
                  />
                </div>
              </>
            ) : (
              <div className="empty-state compact">Workflow definition details appear after a configured queue item is available.</div>
            )}
          </article>
        </div>
        <WorkflowLineageRetentionPanel
          instance={selectedWorkflowInstance}
          instanceCount={governanceWorkflowLineage.instances.length}
          missingParentReferenceCount={governanceWorkflowLineage.orphanedParentIds.length}
          onExport={exportSelectedWorkflowInstance}
          onRetain={retainSelectedWorkflowInstanceExport}
          retentionClass={workflowRetentionClass}
          retentionRecords={workflowInstanceRetentionRecords}
          reviewer={workflowRetentionReviewer}
          setRetentionClass={setWorkflowRetentionClass}
          setReviewer={setWorkflowRetentionReviewer}
        />
        <RetainedPackageCatalogPanel
          filteredRecords={filteredWorkflowInstanceRetentionRecords}
          lifecycleSummary={retentionLifecycleSummary}
          onExportComparison={exportSelectedRetainedPackageComparison}
          onDownloadSelected={downloadSelectedRetainedPackageEvidence}
          onRetentionFilterChange={setRetainedPackageRetentionFilter}
          onSearchChange={setRetainedPackageSearch}
          onSelectRecord={setSelectedRetainedPackageId}
          onStatusFilterChange={setRetainedPackageStatusFilter}
          onWorkflowFilterChange={setRetainedPackageWorkflowFilter}
          records={workflowInstanceRetentionRecords}
          retentionClassFilter={retainedPackageRetentionFilter}
          search={retainedPackageSearch}
          selectedRecord={selectedRetainedPackage}
          selectedWorkflowRecords={selectedRetainedWorkflowRecords}
          statusFilter={retainedPackageStatusFilter}
          workflowFilter={retainedPackageWorkflowFilter}
          workflowTypes={retainedPackageWorkflowTypes}
        />
        <div className="workflow-definition-editor-panel">
          <div className="workflow-lineage-header">
            <div>
              <strong>Workflow Definition Draft Editor</strong>
              <span>Draft, validate, preview promotion, and download tenant-specific workflow definition evidence.</span>
            </div>
            <div className="toolbar-actions">
              <button className="secondary-action compact" onClick={validateWorkflowDraft} type="button">
                Validate
              </button>
              <button className="secondary-action compact" onClick={promoteWorkflowDraftPreview} type="button">
                Promote preview
              </button>
              <button
                className="primary-action compact"
                disabled={!workflowPromotionPackage}
                onClick={downloadWorkflowPromotionPackage}
                type="button"
              >
                Download promoted definition JSON
              </button>
            </div>
          </div>
          {workflowDraft ? (
            <>
              <div className="form-grid compact-form">
                <label>
                  <span>Workflow</span>
                  <select value={selectedWorkflowEditorKey} onChange={(event) => selectWorkflowDefinitionDraft(event.target.value)}>
                    {workflowDefinitionEntries.map(([workflowType, definition]) => (
                      <option key={workflowType} value={workflowType}>
                        {definition.display_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Display name</span>
                  <input
                    value={workflowDraft.display_name}
                    onChange={(event) => updateWorkflowDraft({ display_name: event.target.value })}
                  />
                </label>
                <label>
                  <span>SLA days</span>
                  <input
                    min="0"
                    type="number"
                    value={workflowDraft.sla_days}
                    onChange={(event) => updateWorkflowDraft({ sla_days: Number(event.target.value) })}
                  />
                </label>
                <label>
                  <span>Default owner role</span>
                  <input
                    value={workflowDraft.default_owner_role}
                    onChange={(event) => updateWorkflowDraft({ default_owner_role: event.target.value })}
                  />
                </label>
              </div>
              <div className="form-grid compact-form">
                <label>
                  <span>Applicable domains</span>
                  <input
                    value={workflowDraft.applicable_domains.join(', ')}
                    onChange={(event) => updateWorkflowDraft({ applicable_domains: listFromText(event.target.value) })}
                  />
                </label>
                <label>
                  <span>Stages</span>
                  <input
                    value={workflowDraft.stages.join(', ')}
                    onChange={(event) =>
                      updateWorkflowDraft({ stages: listFromText(event.target.value) as AppConfig['workflowDefinitions'][string]['stages'] })
                    }
                  />
                </label>
                <label>
                  <span>Parent link fields</span>
                  <input
                    value={workflowDraft.parent_link_fields.join(', ')}
                    onChange={(event) => updateWorkflowDraft({ parent_link_fields: listFromText(event.target.value) })}
                  />
                </label>
                <label>
                  <span>Owner resolution</span>
                  <input
                    value={workflowDraft.owner_resolution.join(', ')}
                    onChange={(event) => updateWorkflowDraft({ owner_resolution: listFromText(event.target.value) })}
                  />
                </label>
              </div>
              <div className="form-grid compact-form">
                <label className="wide-field">
                  <span>Description</span>
                  <textarea
                    value={workflowDraft.description}
                    onChange={(event) => updateWorkflowDraft({ description: event.target.value })}
                  />
                </label>
                <label className="wide-field">
                  <span>Allowed next stages</span>
                  <textarea
                    value={formatAllowedNextStages(workflowDraft)}
                    onChange={(event) => updateWorkflowDraft({ allowed_next_stages: parseAllowedNextStages(event.target.value) })}
                  />
                </label>
              </div>
              <div className="form-grid compact-form">
                <label>
                  <span>Export enabled</span>
                  <select
                    value={workflowDraft.export_package.enabled ? 'true' : 'false'}
                    onChange={(event) =>
                      updateWorkflowDraft({
                        export_package: {
                          ...workflowDraft.export_package,
                          enabled: event.target.value === 'true',
                        },
                      })
                    }
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </label>
                <label>
                  <span>Export package label</span>
                  <input
                    value={workflowDraft.export_package.label}
                    onChange={(event) =>
                      updateWorkflowDraft({
                        export_package: {
                          ...workflowDraft.export_package,
                          label: event.target.value,
                        },
                      })
                    }
                  />
                </label>
              </div>
              <div className="metadata-grid compact">
                <Metadata label="Draft status" value={workflowValidationResult ? titleize(workflowValidationResult.status) : 'Draft'} />
                <Metadata label="Validation issues" value={String(workflowValidationResult?.issues.length ?? 0)} />
                <Metadata label="Promotion package" value={workflowPromotionPackage ? workflowPromotionPackage.packageId : 'Not generated'} />
              </div>
              {workflowValidationResult?.issues.length ? (
                <div className="mapping-run-history">
                  {workflowValidationResult.issues.map((issue) => (
                    <div className="mapping-run-row" key={issue.id}>
                      <div>
                        <strong>{issue.field}</strong>
                        <span>{issue.evidence}</span>
                      </div>
                      <StatusChip status={issue.status} label={issue.status} />
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="empty-state compact">Workflow definitions are not loaded.</div>
          )}
        </div>
        {governanceWorkQueueItems.length > 0 ? (
          <div className="backend-record-list governance-work-queue-list">
            {governanceWorkQueueItems.map((item) => (
              <div className="backend-record-row" key={item.record.id}>
                <div>
                  <strong>{item.actionLabel}</strong>
                  <span>
                    {item.workflowLabel} / {item.stageLabel} / v{item.record.version} / {item.ageDays} day(s)
                  </span>
                  {item.dueAt ? <span>Due {new Date(item.dueAt).toLocaleString()}</span> : null}
                  <small>{item.record.summary}</small>
                </div>
                <div className="queue-record-side">
                  <span>{item.owner}</span>
                  <span>
                    {item.record.workflow?.metadataVersion === 'workflow_metadata_v1' ? 'structured' : 'legacy fallback'}
                  </span>
                  <StatusChip status={item.status} label={item.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state compact">Governance records will appear here after packages, deliveries, or acknowledgements are saved.</div>
        )}
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
        <ClosureSlaDashboardPanel
          closureSlaMetrics={closureSlaMetrics}
          closureSlaOverallStatus={closureSlaOverallStatus}
          closureSlaPackageDeliveryRecords={closureSlaPackageDeliveryRecords}
          governanceReviewers={closureSlaGovernanceReviewers}
          latestClosureSlaExportPackage={latestClosureSlaExportPackage}
          onDeliverPackage={() =>
            onDeliverClosureSlaExportPackage({
              download: false,
              packagePayload: buildClosureSlaExportPackage(),
            })
          }
          onGovernanceReviewersChange={setClosureSlaGovernanceReviewers}
          onReviewerNotesChange={setClosureSlaReviewerNotes}
          onSavePackage={() =>
            onSaveClosureSlaExportPackage({
              download: false,
              packagePayload: buildClosureSlaExportPackage(),
            })
          }
          onSavePackageWithDownload={() =>
            onSaveClosureSlaExportPackage({
              download: true,
              packagePayload: buildClosureSlaExportPackage(),
            })
          }
          packageCount={closureSlaExportPackageRecords.length}
          reviewerNotes={closureSlaReviewerNotes}
        />
        <ClosureSlaGovernanceResponsePanel
          acknowledgedDeliveryIds={closureSlaAcknowledgedDeliveryIds}
          acknowledgementRecords={closureSlaDeliveryAcknowledgementRecords}
          ackActions={closureSlaAckActions}
          ackNotes={closureSlaAckNotes}
          ackReviewer={closureSlaAckReviewer}
          ackRouteStage={closureSlaAckRouteStage}
          ackStatus={closureSlaAckStatus}
          deliveryRecords={closureSlaPackageDeliveryRecords}
          latestAcknowledgement={latestClosureSlaDeliveryAcknowledgement}
          latestDelivery={latestClosureSlaPackageDelivery}
          onAckActionsChange={setClosureSlaAckActions}
          onAckNotesChange={setClosureSlaAckNotes}
          onAckReviewerChange={setClosureSlaAckReviewer}
          onAckRouteStageChange={setClosureSlaAckRouteStage}
          onAckStatusChange={setClosureSlaAckStatus}
          onSaveResponse={(record) =>
            onSaveClosureSlaDeliveryAcknowledgement(closureSlaDeliveryAcknowledgementRequest(record))
          }
          openDeliveryCount={openClosureSlaDeliveryCount}
        />
        <ClosureSlaFollowUpRoutingPanel
          dueAt={closureSlaFollowUpDueAt}
          escalationPath={closureSlaFollowUpEscalationPath}
          followUpOwners={closureSlaFollowUpOwners}
          followUpStage={closureSlaFollowUpStage}
          followUpStatus={closureSlaFollowUpStatus}
          latestAcknowledgement={latestClosureSlaDeliveryAcknowledgement}
          latestRoute={latestClosureSlaResponseFollowUpRoute}
          notificationCount={closureSlaFollowUpNotificationRecords.length}
          onDueAtChange={setClosureSlaFollowUpDueAt}
          onEscalationPathChange={setClosureSlaFollowUpEscalationPath}
          onFollowUpOwnersChange={setClosureSlaFollowUpOwners}
          onFollowUpStageChange={setClosureSlaFollowUpStage}
          onFollowUpStatusChange={setClosureSlaFollowUpStatus}
          onNotifyRoute={() => {
            const request = closureSlaResponseFollowUpRequest(latestClosureSlaDeliveryAcknowledgement, true)
            if (request) onSaveClosureSlaResponseFollowUpRoute(request)
          }}
          onRouteNotesChange={setClosureSlaFollowUpNotes}
          onSaveRoute={() => {
            const request = closureSlaResponseFollowUpRequest(latestClosureSlaDeliveryAcknowledgement, false)
            if (request) onSaveClosureSlaResponseFollowUpRoute(request)
          }}
          ownerCount={closureSlaFollowUpOwnerList().length}
          routeNotes={closureSlaFollowUpNotes}
          routeRecords={closureSlaResponseFollowUpRouteRecords}
        />
        <ClosureSlaFollowUpClosurePanel
          closureNotes={closureSlaFollowUpClosureNotes}
          closureRecords={closureSlaResponseFollowUpClosureRecords}
          closureReviewer={closureSlaFollowUpClosureReviewer}
          closureStatus={closureSlaFollowUpClosureStatus}
          latestClosure={latestClosureSlaResponseFollowUpClosure}
          latestRoute={latestClosureSlaResponseFollowUpRoute}
          onClosureNotesChange={setClosureSlaFollowUpClosureNotes}
          onClosureReviewerChange={setClosureSlaFollowUpClosureReviewer}
          onClosureStatusChange={setClosureSlaFollowUpClosureStatus}
          onSaveClosure={() =>
            onSaveClosureSlaResponseFollowUpClosure(
              closureSlaResponseFollowUpClosureRequest(latestClosureSlaResponseFollowUpRoute),
            )
          }
          onSupersededEvidenceChange={setClosureSlaFollowUpSupersededEvidence}
          retainedActionCount={closureSlaFollowUpClosureActionList(latestClosureSlaResponseFollowUpRoute).length}
          routeRecords={closureSlaResponseFollowUpRouteRecords}
          supersededEvidence={closureSlaFollowUpSupersededEvidence}
        />
        <div className="connector-run-history retry-aging-dashboard">
          <ClosureSlaFollowUpClosurePackagePanel
            deliveryRecords={closureSlaFollowUpClosurePackageDeliveryRecords}
            latestPackage={latestClosureSlaFollowUpClosureExportPackage}
            metrics={closureSlaFollowUpClosureMetrics}
            notificationCount={closureSlaFollowUpNotificationRecords.length}
            onDeliverPackage={() =>
              onDeliverClosureSlaFollowUpClosureExportPackage({
                download: false,
                packagePayload: buildClosureSlaFollowUpClosureExportPackage(),
              })
            }
            onNotesChange={setClosureSlaClosurePackageNotes}
            onReviewersChange={setClosureSlaClosurePackageReviewers}
            onSavePackage={() =>
              onSaveClosureSlaFollowUpClosureExportPackage({
                download: false,
                packagePayload: buildClosureSlaFollowUpClosureExportPackage(),
              })
            }
            onSavePackageWithDownload={() =>
              onSaveClosureSlaFollowUpClosureExportPackage({
                download: true,
                packagePayload: buildClosureSlaFollowUpClosureExportPackage(),
              })
            }
            packageCount={closureSlaFollowUpClosureExportPackageRecords.length}
            packageNotes={closureSlaClosurePackageNotes}
            packageStatus={closureSlaFollowUpClosurePackageStatus}
            requiredActionCount={closureSlaFollowUpClosurePackageRequiredActions().length}
            reviewers={closureSlaClosurePackageReviewers}
          />
          <ClosureSlaFollowUpClosurePackageAcknowledgementPanel
            ackActions={closureSlaClosurePackageAckActions}
            ackClosureActions={closureSlaClosurePackageAckClosureActions}
            ackClosureNotes={closureSlaClosurePackageAckClosureNotes}
            ackClosureReviewer={closureSlaClosurePackageAckClosureReviewer}
            ackClosureStatus={closureSlaClosurePackageAckClosureStatus}
            ackNotes={closureSlaClosurePackageAckNotes}
            ackReady={closureSlaClosurePackageAckReady}
            ackReviewer={closureSlaClosurePackageAckReviewer}
            ackStatus={closureSlaClosurePackageAckStatus}
            acknowledgedDeliveryIds={closureSlaFollowUpClosurePackageAcknowledgedDeliveryIds}
            acknowledgementClosureMetrics={closureSlaFollowUpClosurePackageAcknowledgementClosureMetrics}
            acknowledgementClosureRecords={closureSlaFollowUpClosurePackageAcknowledgementClosureRecords}
            acknowledgementRecords={closureSlaFollowUpClosurePackageAcknowledgementRecords}
            closureStatus={closureSlaFollowUpClosurePackageAcknowledgementClosureStatus}
            deliveryRecords={closureSlaFollowUpClosurePackageDeliveryRecords}
            latestAcknowledgement={latestClosureSlaFollowUpClosurePackageAcknowledgement}
            latestAcknowledgementClosure={latestClosureSlaFollowUpClosurePackageAcknowledgementClosure}
            latestDelivery={latestClosureSlaFollowUpClosurePackageDelivery}
            onAckActionsChange={setClosureSlaClosurePackageAckActions}
            onAckClosureActionsChange={setClosureSlaClosurePackageAckClosureActions}
            onAckClosureNotesChange={setClosureSlaClosurePackageAckClosureNotes}
            onAckClosureReviewerChange={setClosureSlaClosurePackageAckClosureReviewer}
            onAckClosureStatusChange={setClosureSlaClosurePackageAckClosureStatus}
            onAckNotesChange={setClosureSlaClosurePackageAckNotes}
            onAckReadyChange={setClosureSlaClosurePackageAckReady}
            onAckReviewerChange={setClosureSlaClosurePackageAckReviewer}
            onAckStatusChange={setClosureSlaClosurePackageAckStatus}
            onSaveAcknowledgement={() => {
              const request = closureSlaFollowUpClosurePackageAcknowledgementRequest(
                latestClosureSlaFollowUpClosurePackageDelivery,
              )
              if (request) onSaveClosureSlaFollowUpClosurePackageAcknowledgement(request)
            }}
            onSaveAcknowledgementClosure={() =>
              onSaveClosureSlaFollowUpClosurePackageAcknowledgementClosure(
                closureSlaFollowUpClosurePackageAcknowledgementClosureRequest(),
              )
            }
            onSupersededEvidenceChange={setClosureSlaClosurePackageAckSupersededEvidence}
            requestedActionCount={closureSlaClosurePackageAckActionList().length}
            supersededEvidence={closureSlaClosurePackageAckSupersededEvidence}
            supersededEvidenceCount={closureSlaClosurePackageAckSupersededEvidenceList().length}
          />
        </div>
        <ClosureSlaHistoryListsPanel
          acknowledgementRecords={closureSlaDeliveryAcknowledgementRecords}
          exportPackageRecords={closureSlaExportPackageRecords}
          rows={closureSlaRows}
        />
      </section>

      <PostgresImportReconciliationPanel
        latestReconciliation={latestReconciliation}
        latestTopKinds={latestTopKinds}
        reconciliationRecords={reconciliationRecords}
        reconciliationTotals={reconciliationTotals}
      />

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
        <PostgresCutoverPackageHistoryPanel records={postgresCutoverPackageRecords} />
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
        <PostgresCutoverAcknowledgementHistoryPanel
          labelStatus={postgresCutoverAcknowledgementLabel}
          records={postgresCutoverAcknowledgementRecords}
        />
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
        <PostgresCutoverOwnerReminderHistoryPanel
          labelStatus={postgresCutoverOwnerReminderLabel}
          records={postgresCutoverOwnerReminderRecords}
        />
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
        <PostgresCutoverReminderClosureHistoryPanel
          labelStatus={postgresCutoverReminderClosureLabel}
          records={postgresCutoverReminderClosureRecords}
        />
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
        <div className="notification-approval-grid renewal-routing-grid">
          <div className="notification-approval-form">
            <div className="dashboard-heading">
              <h4>Final Handoff Delivery Acknowledgement</h4>
              <StatusChip
                status={postgresCutoverFinalHandoffAcknowledgementStatusLevel(postgresFinalHandoffStatus)}
                label={postgresCutoverFinalHandoffAcknowledgementLabel(postgresFinalHandoffStatus)}
              />
            </div>
            <div className="trace-review-grid">
              <label>
                <span>Reviewer</span>
                <input
                  value={postgresFinalHandoffReviewer}
                  onChange={(event) => setPostgresFinalHandoffReviewer(event.target.value)}
                />
              </label>
              <label>
                <span>Reviewer role</span>
                <select
                  value={postgresFinalHandoffReviewerRole}
                  onChange={(event) =>
                    setPostgresFinalHandoffReviewerRole(event.target.value as PostgresCutoverFinalHandoffAcknowledgement['reviewerRole'])
                  }
                >
                  <option value="infrastructure_owner">Infrastructure owner</option>
                  <option value="database_administrator">Database administrator</option>
                  <option value="security_reviewer">Security reviewer</option>
                  <option value="platform_owner">Platform owner</option>
                </select>
              </label>
              <label>
                <span>Response status</span>
                <select
                  value={postgresFinalHandoffStatus}
                  onChange={(event) =>
                    setPostgresFinalHandoffStatus(event.target.value as PostgresCutoverFinalHandoffAcknowledgementStatus)
                  }
                >
                  <option value="acknowledged">Acknowledged</option>
                  <option value="acknowledged_with_actions">Acknowledged with actions</option>
                  <option value="changes_requested">Changes requested</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label className="toggle-row">
                <input
                  checked={postgresFinalHandoffReady}
                  onChange={(event) => setPostgresFinalHandoffReady(event.target.checked)}
                  type="checkbox"
                />
                <span>Final handoff ready</span>
              </label>
              <label className="trace-review-rationale">
                <span>Requested actions</span>
                <textarea
                  value={postgresFinalHandoffActions}
                  onChange={(event) => setPostgresFinalHandoffActions(event.target.value)}
                />
              </label>
              <label className="trace-review-rationale">
                <span>Response notes</span>
                <textarea
                  value={postgresFinalHandoffNotes}
                  onChange={(event) => setPostgresFinalHandoffNotes(event.target.value)}
                />
              </label>
            </div>
            <div className="toolbar-actions notification-approval-actions">
              <button
                className="primary-action"
                disabled={!latestPostgresCutoverClosurePackageDelivery}
                onClick={() => {
                  const request = postgresFinalHandoffAcknowledgementRequest(latestPostgresCutoverClosurePackageDelivery)
                  if (request) onSavePostgresCutoverFinalHandoffAcknowledgement(request)
                }}
                type="button"
              >
                <ClipboardCheck size={15} />
                Save Final Handoff Acknowledgement
              </button>
            </div>
          </div>
          <div className="notification-approval-summary">
            <div className="metadata-grid">
              <Metadata label="Acknowledgements" value={String(postgresCutoverFinalHandoffAcknowledgementRecords.length)} />
              <Metadata
                label="Latest delivery"
                value={
                  latestPostgresCutoverClosurePackageDelivery
                    ? new Date(latestPostgresCutoverClosurePackageDelivery.createdAt).toLocaleString()
                    : 'Not delivered'
                }
              />
              <Metadata
                label="Latest response"
                value={
                  latestPostgresCutoverFinalHandoffAcknowledgement
                    ? postgresCutoverFinalHandoffAcknowledgementLabel(latestPostgresCutoverFinalHandoffAcknowledgement.payload.status)
                    : 'Not recorded'
                }
              />
              <Metadata label="Requested actions" value={String(postgresFinalHandoffActionList().length)} />
            </div>
            {latestPostgresCutoverFinalHandoffAcknowledgement ? (
              <div className="connector-run-history">
                <h4>Latest final handoff acknowledgement</h4>
                <div className="connector-run-row">
                  <div>
                    <strong>{latestPostgresCutoverFinalHandoffAcknowledgement.payload.reviewer}</strong>
                    <span>
                      v{latestPostgresCutoverFinalHandoffAcknowledgement.version} / {postgresCutoverFinalHandoffAcknowledgementLabel(latestPostgresCutoverFinalHandoffAcknowledgement.payload.status)} / {new Date(latestPostgresCutoverFinalHandoffAcknowledgement.createdAt).toLocaleString()}
                    </span>
                    <small>{latestPostgresCutoverFinalHandoffAcknowledgement.payload.evidence}</small>
                  </div>
                  <StatusChip
                    status={latestPostgresCutoverFinalHandoffAcknowledgement.status}
                    label={postgresCutoverFinalHandoffAcknowledgementLabel(latestPostgresCutoverFinalHandoffAcknowledgement.payload.status)}
                  />
                </div>
                {latestPostgresCutoverFinalHandoffAcknowledgement.payload.requestedActions.length > 0 ? (
                  <div className="storage-column-list">
                    {latestPostgresCutoverFinalHandoffAcknowledgement.payload.requestedActions.slice(0, 5).map((action) => (
                      <span key={action}>{action}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="empty-state compact">No final handoff acknowledgement has been retained yet.</div>
            )}
          </div>
        </div>
        <div className="connector-run-history retry-aging-dashboard">
          <div className="dashboard-heading">
            <h4>Final Handoff Acknowledgement Closure Package</h4>
            <StatusChip status={postgresFinalHandoffClosureStatus} label={postgresFinalHandoffClosureStatus} />
          </div>
          <div className="trace-review-grid">
            <label className="trace-review-rationale">
              <span>Closure reviewers</span>
              <textarea
                value={postgresFinalHandoffClosureReviewers}
                onChange={(event) => setPostgresFinalHandoffClosureReviewers(event.target.value)}
              />
            </label>
            <label className="trace-review-rationale">
              <span>Closure package notes</span>
              <textarea
                value={postgresFinalHandoffClosureNotes}
                onChange={(event) => setPostgresFinalHandoffClosureNotes(event.target.value)}
              />
            </label>
          </div>
          <div className="toolbar-actions notification-approval-actions">
            <button
              className="secondary-action"
              onClick={() =>
                onSavePostgresCutoverFinalHandoffClosurePackage({
                  download: false,
                  packagePayload: buildPostgresFinalHandoffClosurePackage(),
                })
              }
              type="button"
            >
              <ClipboardCheck size={15} />
              Save Handoff Closure Package
            </button>
            <button
              className="primary-action"
              onClick={() =>
                onSavePostgresCutoverFinalHandoffClosurePackage({
                  download: true,
                  packagePayload: buildPostgresFinalHandoffClosurePackage(),
                })
              }
              type="button"
            >
              <Download size={15} />
              Save & Download Handoff Closure Package
            </button>
            <button
              className="primary-action"
              onClick={() =>
                onDeliverPostgresCutoverFinalHandoffClosurePackage({
                  download: false,
                  packagePayload: buildPostgresFinalHandoffClosurePackage(),
                })
              }
              type="button"
            >
              <Bell size={15} />
              Save & Notify Closure Reviewers
            </button>
          </div>
          <div className="metadata-grid">
            <Metadata label="Closure packages" value={String(postgresCutoverFinalHandoffClosurePackageRecords.length)} />
            <Metadata label="Acknowledgements" value={String(postgresFinalHandoffClosureMetrics.totalAcknowledgements)} />
            <Metadata label="Closure ready" value={String(postgresFinalHandoffClosureMetrics.closureReady)} />
            <Metadata label="Retained actions" value={String(postgresFinalHandoffClosureMetrics.retainedActions)} />
            <Metadata label="Required actions" value={String(postgresFinalHandoffClosurePackageRequiredActions().length)} />
            <Metadata label="Delivery records" value={String(postgresCutoverClosurePackageDeliveryRecords.length)} />
            <Metadata label="Package deliveries" value={String(postgresFinalHandoffClosurePackageDeliveryRecords.length)} />
          </div>
          {latestPostgresCutoverFinalHandoffClosurePackage ? (
            <div className="retry-aging-list">
              <h4>Latest final handoff closure package</h4>
              <div className="connector-run-row">
                <div>
                  <strong>{latestPostgresCutoverFinalHandoffClosurePackage.payload.closureReviewers.join(', ')}</strong>
                  <span>
                    v{latestPostgresCutoverFinalHandoffClosurePackage.version} / {new Date(latestPostgresCutoverFinalHandoffClosurePackage.createdAt).toLocaleString()} / {latestPostgresCutoverFinalHandoffClosurePackage.payload.acknowledgementRecords.length} acknowledgement record(s)
                  </span>
                  <small>{latestPostgresCutoverFinalHandoffClosurePackage.payload.evidence}</small>
                </div>
                <StatusChip
                  status={latestPostgresCutoverFinalHandoffClosurePackage.status}
                  label={latestPostgresCutoverFinalHandoffClosurePackage.status}
                />
              </div>
              {latestPostgresCutoverFinalHandoffClosurePackage.payload.requiredActions.length > 0 ? (
                <ul className="compact-list">
                  {latestPostgresCutoverFinalHandoffClosurePackage.payload.requiredActions.slice(0, 5).map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <div className="empty-state compact">No final handoff acknowledgement closure package has been retained yet.</div>
          )}
          {postgresFinalHandoffClosurePackageDeliveryRecords.length > 0 ? (
            <div className="retry-aging-list">
              <h4>Final handoff closure package delivery evidence</h4>
              {postgresFinalHandoffClosurePackageDeliveryRecords.slice(0, 3).map((record) => (
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
          <div className="retry-aging-list">
            <div className="dashboard-heading">
              <h4>Final handoff closure package acknowledgement</h4>
              <StatusChip
                status={postgresCutoverFinalHandoffAcknowledgementStatusLevel(
                  postgresFinalHandoffClosurePackageAckStatus,
                )}
                label={postgresCutoverFinalHandoffAcknowledgementLabel(postgresFinalHandoffClosurePackageAckStatus)}
              />
            </div>
            <div className="trace-review-grid">
              <label>
                <span>Reviewer</span>
                <input
                  value={postgresFinalHandoffClosurePackageAckReviewer}
                  onChange={(event) => setPostgresFinalHandoffClosurePackageAckReviewer(event.target.value)}
                />
              </label>
              <label>
                <span>Reviewer role</span>
                <select
                  value={postgresFinalHandoffClosurePackageAckReviewerRole}
                  onChange={(event) =>
                    setPostgresFinalHandoffClosurePackageAckReviewerRole(
                      event.target.value as PostgresCutoverFinalHandoffClosurePackageAcknowledgement['reviewerRole'],
                    )
                  }
                >
                  <option value="infrastructure_owner">Infrastructure owner</option>
                  <option value="database_administrator">Database administrator</option>
                  <option value="security_reviewer">Security reviewer</option>
                  <option value="platform_owner">Platform owner</option>
                </select>
              </label>
              <label>
                <span>Response status</span>
                <select
                  value={postgresFinalHandoffClosurePackageAckStatus}
                  onChange={(event) =>
                    setPostgresFinalHandoffClosurePackageAckStatus(
                      event.target.value as PostgresCutoverFinalHandoffAcknowledgementStatus,
                    )
                  }
                >
                  <option value="acknowledged">Acknowledged</option>
                  <option value="acknowledged_with_actions">Acknowledged with actions</option>
                  <option value="changes_requested">Changes requested</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label className="toggle-row">
                <input
                  checked={postgresFinalHandoffClosurePackageReady}
                  onChange={(event) => setPostgresFinalHandoffClosurePackageReady(event.target.checked)}
                  type="checkbox"
                />
                <span>Closure package ready</span>
              </label>
              <label className="trace-review-rationale">
                <span>Requested actions</span>
                <textarea
                  value={postgresFinalHandoffClosurePackageAckActions}
                  onChange={(event) => setPostgresFinalHandoffClosurePackageAckActions(event.target.value)}
                />
              </label>
              <label className="trace-review-rationale">
                <span>Response notes</span>
                <textarea
                  value={postgresFinalHandoffClosurePackageAckNotes}
                  onChange={(event) => setPostgresFinalHandoffClosurePackageAckNotes(event.target.value)}
                />
              </label>
            </div>
            <div className="toolbar-actions notification-approval-actions">
              <button
                className="primary-action"
                disabled={!latestPostgresFinalHandoffClosurePackageDelivery}
                onClick={() => {
                  const request = postgresFinalHandoffClosurePackageAcknowledgementRequest(
                    latestPostgresFinalHandoffClosurePackageDelivery,
                  )
                  if (request) onSavePostgresCutoverFinalHandoffClosurePackageAcknowledgement(request)
                }}
                type="button"
              >
                <ClipboardCheck size={15} />
                Save Handoff Closure Acknowledgement
              </button>
            </div>
            <div className="metadata-grid">
              <Metadata
                label="Closure acknowledgements"
                value={String(postgresCutoverFinalHandoffClosurePackageAcknowledgementRecords.length)}
              />
              <Metadata
                label="Latest delivery"
                value={
                  latestPostgresFinalHandoffClosurePackageDelivery
                    ? new Date(latestPostgresFinalHandoffClosurePackageDelivery.createdAt).toLocaleString()
                    : 'Not delivered'
                }
              />
              <Metadata
                label="Open deliveries"
                value={String(
                  postgresFinalHandoffClosurePackageDeliveryRecords.filter(
                    (record) => !postgresFinalHandoffClosurePackageAcknowledgedDeliveryIds.has(record.id),
                  ).length,
                )}
              />
              <Metadata
                label="Requested actions"
                value={String(postgresFinalHandoffClosurePackageAckActionList().length)}
              />
            </div>
            {latestPostgresCutoverFinalHandoffClosurePackageAcknowledgement ? (
              <div className="connector-run-row">
                <div>
                  <strong>{latestPostgresCutoverFinalHandoffClosurePackageAcknowledgement.payload.reviewer}</strong>
                  <span>
                    v{latestPostgresCutoverFinalHandoffClosurePackageAcknowledgement.version} / {postgresCutoverFinalHandoffAcknowledgementLabel(latestPostgresCutoverFinalHandoffClosurePackageAcknowledgement.payload.status)} / {new Date(latestPostgresCutoverFinalHandoffClosurePackageAcknowledgement.createdAt).toLocaleString()}
                  </span>
                  <small>{latestPostgresCutoverFinalHandoffClosurePackageAcknowledgement.payload.evidence}</small>
                </div>
                <StatusChip
                  status={latestPostgresCutoverFinalHandoffClosurePackageAcknowledgement.status}
                  label={postgresCutoverFinalHandoffAcknowledgementLabel(
                    latestPostgresCutoverFinalHandoffClosurePackageAcknowledgement.payload.status,
                  )}
                />
              </div>
            ) : (
              <div className="empty-state compact">No final handoff closure package acknowledgement has been retained yet.</div>
            )}
          </div>
          <div className="retry-aging-list">
            <div className="dashboard-heading">
              <h4>Final handoff closure acknowledgement closeout</h4>
              <StatusChip
                status={postgresCutoverReminderClosureStatusLevel(postgresFinalHandoffClosurePackageAckClosureStatus)}
                label={postgresCutoverReminderClosureLabel(postgresFinalHandoffClosurePackageAckClosureStatus)}
              />
            </div>
            <div className="trace-review-grid">
              <label>
                <span>Closure reviewer</span>
                <input
                  value={postgresFinalHandoffClosurePackageAckClosureReviewer}
                  onChange={(event) => setPostgresFinalHandoffClosurePackageAckClosureReviewer(event.target.value)}
                />
              </label>
              <label>
                <span>Closure disposition</span>
                <select
                  value={postgresFinalHandoffClosurePackageAckClosureStatus}
                  onChange={(event) =>
                    setPostgresFinalHandoffClosurePackageAckClosureStatus(
                      event.target.value as PostgresCutoverReminderClosureStatus,
                    )
                  }
                >
                  <option value="closed">Closed</option>
                  <option value="closed_with_actions">Closed with actions</option>
                  <option value="rejected">Rejected</option>
                  <option value="deferred">Deferred</option>
                </select>
              </label>
              <label className="trace-review-rationale">
                <span>Retained actions</span>
                <textarea
                  value={postgresFinalHandoffClosurePackageAckClosureActions}
                  onChange={(event) => setPostgresFinalHandoffClosurePackageAckClosureActions(event.target.value)}
                />
              </label>
              <label className="trace-review-rationale">
                <span>Closure notes</span>
                <textarea
                  value={postgresFinalHandoffClosurePackageAckClosureNotes}
                  onChange={(event) => setPostgresFinalHandoffClosurePackageAckClosureNotes(event.target.value)}
                />
              </label>
              <label className="trace-review-rationale">
                <span>Superseded acknowledgement evidence</span>
                <textarea
                  value={postgresFinalHandoffClosurePackageAckSupersededEvidence}
                  onChange={(event) => setPostgresFinalHandoffClosurePackageAckSupersededEvidence(event.target.value)}
                />
              </label>
            </div>
            <div className="toolbar-actions notification-approval-actions">
              <button
                className="primary-action"
                disabled={postgresCutoverFinalHandoffClosurePackageAcknowledgementRecords.length === 0}
                onClick={() =>
                  onSavePostgresCutoverFinalHandoffClosurePackageAcknowledgementClosure(
                    postgresFinalHandoffClosurePackageAcknowledgementClosureRequest(),
                  )
                }
                type="button"
              >
                <ClipboardCheck size={15} />
                Save Handoff Closeout
              </button>
            </div>
            <div className="metadata-grid">
              <Metadata
                label="Closeout records"
                value={String(postgresCutoverFinalHandoffClosurePackageAcknowledgementClosureRecords.length)}
              />
              <Metadata
                label="Acknowledgements"
                value={String(postgresFinalHandoffClosurePackageAcknowledgementClosureMetrics.totalAcknowledgements)}
              />
              <Metadata
                label="Closure ready"
                value={String(postgresFinalHandoffClosurePackageAcknowledgementClosureMetrics.closureReady)}
              />
              <Metadata
                label="Retained actions"
                value={String(postgresFinalHandoffClosurePackageAcknowledgementClosureMetrics.retainedActions)}
              />
              <Metadata
                label="Closeout status"
                value={postgresFinalHandoffClosurePackageAcknowledgementClosureStatus}
              />
              <Metadata
                label="Superseded notes"
                value={String(postgresFinalHandoffClosurePackageAckSupersededEvidenceList().length)}
              />
            </div>
            {latestPostgresCutoverFinalHandoffClosurePackageAcknowledgementClosure ? (
              <div className="connector-run-row">
                <div>
                  <strong>{latestPostgresCutoverFinalHandoffClosurePackageAcknowledgementClosure.payload.reviewer}</strong>
                  <span>
                    v{latestPostgresCutoverFinalHandoffClosurePackageAcknowledgementClosure.version} / {postgresCutoverReminderClosureLabel(latestPostgresCutoverFinalHandoffClosurePackageAcknowledgementClosure.payload.status)} / {new Date(latestPostgresCutoverFinalHandoffClosurePackageAcknowledgementClosure.createdAt).toLocaleString()}
                  </span>
                  <small>{latestPostgresCutoverFinalHandoffClosurePackageAcknowledgementClosure.payload.evidence}</small>
                </div>
                <StatusChip
                  status={latestPostgresCutoverFinalHandoffClosurePackageAcknowledgementClosure.status}
                  label={postgresCutoverReminderClosureLabel(
                    latestPostgresCutoverFinalHandoffClosurePackageAcknowledgementClosure.payload.status,
                  )}
                />
              </div>
            ) : (
              <div className="empty-state compact">No final handoff closure package acknowledgement closeout has been retained yet.</div>
            )}
          </div>
        </div>
        <PostgresCutoverClosurePackageHistoryPanel records={postgresCutoverClosurePackageRecords} />
      </section>

      <BackendRetryCloseoutGovernancePanel
        retryControls={{
          buildRetryQueueAcknowledgementClosurePackage,
          buildRetryQueueExportPackage,
          deliveryRetryDelayMinutes,
          deliveryRetryMaxRetries,
          deliveryRetryOnWarnings,
          deliveryRetryPolicy,
          deliveryRetryRationale,
          deliveryRetrySource,
          notificationDeliveryRetryLabel,
          notificationDeliveryRetryRequest,
          notificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosureRecords,
          notificationRetryQueueAcknowledgementClosurePackageAcknowledgementRecords,
          notificationRetryQueueAcknowledgementClosurePackageRecords,
          notificationRetryQueueAcknowledgementLabel,
          notificationRetryQueueAcknowledgementRecords,
          notificationRetryQueueAcknowledgementStatusLevel,
          notificationRetryQueueExportPackageRecords,
          onDeliverNotificationRetryQueueAcknowledgementClosurePackage,
          onDeliverNotificationRetryQueueExportPackage,
          onSaveNotificationDeliveryRetryControl,
          onSaveNotificationRetryQueueAcknowledgement,
          onSaveNotificationRetryQueueAcknowledgementClosurePackage,
          onSaveNotificationRetryQueueAcknowledgementClosurePackageAcknowledgement,
          onSaveNotificationRetryQueueAcknowledgementClosurePackageAcknowledgementClosure,
          onSaveNotificationRetryQueueExportPackage,
          openRetryQueuePackageDeliveryCount,
          retryAgeLabel,
          retryControlsForSource,
          retryDueLabel,
          retryQueueAckActions,
          retryQueueAckNotes,
          retryQueueAckReviewer,
          retryQueueAckReviewerRole,
          retryQueueAckStatus,
          retryQueueAcknowledgementActionList,
          retryQueueAcknowledgementClosureMetrics,
          retryQueueAcknowledgementClosurePackageAckActionList,
          retryQueueAcknowledgementClosurePackageAckSupersededEvidenceList,
          retryQueueAcknowledgementClosurePackageAcknowledgedDeliveryIds,
          retryQueueAcknowledgementClosurePackageAcknowledgementClosureMetrics,
          retryQueueAcknowledgementClosurePackageAcknowledgementClosureRequest,
          retryQueueAcknowledgementClosurePackageAcknowledgementClosureStatus,
          retryQueueAcknowledgementClosurePackageAcknowledgementRequest,
          retryQueueAcknowledgementClosurePackageDeliveryRecords,
          retryQueueAcknowledgementClosurePackageRequiredActions,
          retryQueueAcknowledgementClosureStatus,
          retryQueueAcknowledgementRequest,
          retryQueueActiveSources,
          retryQueueClosurePackageAckActions,
          retryQueueClosurePackageAckClosureActions,
          retryQueueClosurePackageAckClosureNotes,
          retryQueueClosurePackageAckClosureReviewer,
          retryQueueClosurePackageAckClosureStatus,
          retryQueueClosurePackageAckNotes,
          retryQueueClosurePackageAckReviewer,
          retryQueueClosurePackageAckReviewerRole,
          retryQueueClosurePackageAckStatus,
          retryQueueClosurePackageAckSupersededEvidence,
          retryQueueClosurePackageNotes,
          retryQueueClosurePackageReady,
          retryQueueClosurePackageReviewers,
          retryQueueClosureReady,
          retryQueueMeasuredAt,
          retryQueueMetrics,
          retryQueueOperationsReviewerList,
          retryQueueOperationsReviewers,
          retryQueuePackageDeliveryRecords,
          retryQueueRequiredActions,
          retryQueueReviewerNotes,
          retryQueueRows,
          retryQueueStatus,
          retryableDeliveryRecords,
        }}
        closeoutExports={{
          buildCloseoutExportPackage,
          buildCloseoutNotificationClosurePackage,
          buildCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
          closeoutExportAckActions,
          closeoutExportAckClosureActions,
          closeoutExportAckClosureNotes,
          closeoutExportAckClosureReviewer,
          closeoutExportAckClosureStatus,
          closeoutExportAckNotes,
          closeoutExportAckReviewer,
          closeoutExportAckReviewerRole,
          closeoutExportAckStatus,
          closeoutExportAckSupersededEvidence,
          closeoutExportAcknowledgedDeliveryIds,
          closeoutExportAcknowledgementActionList,
          closeoutExportAcknowledgementClosureRequest,
          closeoutExportAcknowledgementClosureStatus,
          closeoutExportAcknowledgementMetrics,
          closeoutExportAcknowledgementRequest,
          closeoutExportAcknowledgementSupersededEvidenceList,
          closeoutExportDeliveryRecords,
          closeoutExportMetrics,
          closeoutExportNotes,
          closeoutExportReady,
          closeoutExportRequiredActions,
          closeoutExportReviewers,
          closeoutExportStatus,
          closeoutNotificationClosureActionList,
          closeoutNotificationClosureActions,
          closeoutNotificationClosureMetrics,
          closeoutNotificationClosureNotes,
          closeoutNotificationClosurePackageAckActions,
          closeoutNotificationClosurePackageAckClosureActions,
          closeoutNotificationClosurePackageAckClosureNotes,
          closeoutNotificationClosurePackageAckClosurePackageAckActions,
          closeoutNotificationClosurePackageAckClosurePackageAckNotes,
          closeoutNotificationClosurePackageAckClosurePackageAckReviewer,
          closeoutNotificationClosurePackageAckClosurePackageAckReviewerRole,
          closeoutNotificationClosurePackageAckClosurePackageAckStatus,
          closeoutNotificationClosurePackageAckClosurePackageNotes,
          closeoutNotificationClosurePackageAckClosurePackageReviewers,
          closeoutNotificationClosurePackageAckClosureReviewer,
          closeoutNotificationClosurePackageAckClosureStatus,
          closeoutNotificationClosurePackageAckNotes,
          closeoutNotificationClosurePackageAckReviewer,
          closeoutNotificationClosurePackageAckReviewerRole,
          closeoutNotificationClosurePackageAckStatus,
          closeoutNotificationClosurePackageAckSupersededEvidence,
          closeoutNotificationClosurePackageAcknowledgedDeliveryIds,
          closeoutNotificationClosurePackageAcknowledgementActionList,
          closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgedDeliveryIds,
          closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementActionList,
          closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementMetrics,
          closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRequest,
          closeoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryRecords,
          closeoutNotificationClosurePackageAcknowledgementClosurePackageMetrics,
          closeoutNotificationClosurePackageAcknowledgementClosurePackageRequiredActions,
          closeoutNotificationClosurePackageAcknowledgementClosurePackageStatus,
          closeoutNotificationClosurePackageAcknowledgementClosureRequest,
          closeoutNotificationClosurePackageAcknowledgementClosureStatus,
          closeoutNotificationClosurePackageAcknowledgementMetrics,
          closeoutNotificationClosurePackageAcknowledgementRequest,
          closeoutNotificationClosurePackageAcknowledgementSupersededEvidenceList,
          closeoutNotificationClosurePackageDeliveryRecords,
          closeoutNotificationClosurePackageMetrics,
          closeoutNotificationClosurePackageNotes,
          closeoutNotificationClosurePackageReady,
          closeoutNotificationClosurePackageRequiredActions,
          closeoutNotificationClosurePackageReviewers,
          closeoutNotificationClosurePackageStatus,
          closeoutNotificationClosureRequest,
          closeoutNotificationClosureReviewer,
          closeoutNotificationClosureStatus,
          closeoutNotificationClosureStatusLevel,
          closeoutNotificationClosureSupersededEvidence,
          closeoutNotificationClosureSupersededEvidenceList,
          closurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosureRecords,
          closurePackageAcknowledgementCloseoutExportPackageAcknowledgementRecords,
          closurePackageAcknowledgementCloseoutExportPackageRecords,
          closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRecords,
          closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageRecords,
          closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords,
          closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementRecords,
          closurePackageAcknowledgementCloseoutNotificationClosurePackageRecords,
          closurePackageAcknowledgementCloseoutNotificationClosureRecords,
          closureSlaDeliveryAcknowledgementLabel,
          closureSlaDeliveryAcknowledgementStatusLevel,
          closureSlaFollowUpClosureLabel,
          closureSlaFollowUpClosureStatusLevel,
          deliveryRecords,
          deliverySourceLabel,
          latestCloseoutExportAcknowledgement,
          latestCloseoutExportAcknowledgementClosure,
          latestCloseoutExportDelivery,
          latestCloseoutExportPackage,
          latestCloseoutNotificationClosure,
          latestCloseoutNotificationClosurePackage,
          latestCloseoutNotificationClosurePackageAcknowledgement,
          latestCloseoutNotificationClosurePackageAcknowledgementClosure,
          latestCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
          latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement,
          latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageDelivery,
          latestCloseoutNotificationClosurePackageDelivery,
          latestRetryAttemptCount,
          latestRetryEligible,
          latestRetryQueueAcknowledgement,
          latestRetryQueueAcknowledgementClosurePackage,
          latestRetryQueueAcknowledgementClosurePackageAcknowledgement,
          latestRetryQueueAcknowledgementClosurePackageAcknowledgementClosure,
          latestRetryQueueAcknowledgementClosurePackageDelivery,
          latestRetryQueuePackageDelivery,
          latestRetryableDelivery,
          onDeliverClosurePackageAcknowledgementCloseoutExportPackage,
          onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackage,
          onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
          onSaveClosurePackageAcknowledgementCloseoutExportPackage,
          onSaveClosurePackageAcknowledgementCloseoutExportPackageAcknowledgement,
          onSaveClosurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosure,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosure,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackage,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosure,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement,
          postgresCutoverReminderClosureLabel,
          postgresCutoverReminderClosureStatusLevel,
          setCloseoutExportAckActions,
          setCloseoutExportAckClosureActions,
          setCloseoutExportAckClosureNotes,
          setCloseoutExportAckClosureReviewer,
          setCloseoutExportAckClosureStatus,
          setCloseoutExportAckNotes,
          setCloseoutExportAckReviewer,
          setCloseoutExportAckReviewerRole,
          setCloseoutExportAckStatus,
          setCloseoutExportAckSupersededEvidence,
          setCloseoutExportNotes,
          setCloseoutExportReady,
          setCloseoutExportReviewers,
          setCloseoutNotificationClosureActions,
          setCloseoutNotificationClosureNotes,
          setCloseoutNotificationClosurePackageAckActions,
          setCloseoutNotificationClosurePackageAckClosureActions,
          setCloseoutNotificationClosurePackageAckClosureNotes,
          setCloseoutNotificationClosurePackageAckClosurePackageAckActions,
          setCloseoutNotificationClosurePackageAckClosurePackageAckNotes,
          setCloseoutNotificationClosurePackageAckClosurePackageAckReviewer,
          setCloseoutNotificationClosurePackageAckClosurePackageAckReviewerRole,
          setCloseoutNotificationClosurePackageAckClosurePackageAckStatus,
          setCloseoutNotificationClosurePackageAckClosurePackageNotes,
          setCloseoutNotificationClosurePackageAckClosurePackageReviewers,
          setCloseoutNotificationClosurePackageAckClosureReviewer,
          setCloseoutNotificationClosurePackageAckClosureStatus,
          setCloseoutNotificationClosurePackageAckNotes,
          setCloseoutNotificationClosurePackageAckReviewer,
          setCloseoutNotificationClosurePackageAckReviewerRole,
          setCloseoutNotificationClosurePackageAckStatus,
          setCloseoutNotificationClosurePackageAckSupersededEvidence,
          setCloseoutNotificationClosurePackageNotes,
          setCloseoutNotificationClosurePackageReady,
          setCloseoutNotificationClosurePackageReviewers,
          setCloseoutNotificationClosureReviewer,
          setCloseoutNotificationClosureStatus,
          setCloseoutNotificationClosureSupersededEvidence,
          setDeliveryRetryDelayMinutes,
          setDeliveryRetryMaxRetries,
          setDeliveryRetryOnWarnings,
          setDeliveryRetryRationale,
          setDeliveryRetrySource,
          setRetryQueueAckActions,
          setRetryQueueAckNotes,
          setRetryQueueAckReviewer,
          setRetryQueueAckReviewerRole,
          setRetryQueueAckStatus,
          setRetryQueueClosurePackageAckActions,
          setRetryQueueClosurePackageAckClosureActions,
          setRetryQueueClosurePackageAckClosureNotes,
          setRetryQueueClosurePackageAckClosureReviewer,
          setRetryQueueClosurePackageAckClosureStatus,
          setRetryQueueClosurePackageAckNotes,
          setRetryQueueClosurePackageAckReviewer,
          setRetryQueueClosurePackageAckReviewerRole,
          setRetryQueueClosurePackageAckStatus,
          setRetryQueueClosurePackageAckSupersededEvidence,
          setRetryQueueClosurePackageNotes,
          setRetryQueueClosurePackageReady,
          setRetryQueueClosurePackageReviewers,
          setRetryQueueClosureReady,
          setRetryQueueOperationsReviewers,
          setRetryQueueReviewerNotes,
        }}
        finalEvidence={{
          closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceActions,
          closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceNotes,
          closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady,
          closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceReviewer,
          closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceStatus,
          closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceSuperseded,
          closeoutNotificationClosurePackageAcknowledgementClosurePackageFinalEvidenceDeliveryRecords,
          closeoutNotificationClosurePackageAcknowledgementClosurePackageFinalEvidenceRequest,
          closeoutNotificationClosurePackageAcknowledgementClosurePackageFinalEvidenceStatus,
          closeoutNotificationClosurePackageAcknowledgementClosurePackageFinalEvidenceSupersededList,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgedDeliveryIds,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureAcknowledgedDeliveryIds,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureAcknowledgedDeliveryIds,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceAcknowledgedDeliveryIds,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceAcknowledgedDeliveryIds,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureAcknowledgedDeliveryIds,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceAcknowledgedDeliveryIds,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidenceRequest,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidenceStatus,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidenceSupersededList,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementMetrics,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementRequest,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryRecords,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceRequest,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceStatus,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceSupersededList,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementMetrics,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementRequest,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryRecords,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureRequest,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureStatus,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureSupersededList,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementMetrics,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementRequest,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryRecords,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutRequest,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutStatus,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutSupersededList,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementMetrics,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementRequest,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryRecords,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceRequest,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceStatus,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceSupersededList,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementMetrics,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementRequest,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryRecords,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureRequest,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureStatus,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureSupersededList,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementMetrics,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementRequest,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryRecords,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureRequest,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureStatus,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureSupersededList,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementMetrics,
          closeoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementRequest,
          closeoutNotificationClosurePackageFinalEvidenceAckActions,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutActions,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckActions,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureActions,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckActions,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckNotes,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckReviewer,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckReviewerRole,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckStatus,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceAckClosureReady,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceActions,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutActions,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckActions,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureActions,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureCloseoutReady,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckActions,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutActions,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckActions,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckNotes,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckReviewer,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckReviewerRole,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckStatus,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceActions,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceNotes,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceReady,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceReviewer,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceStatus,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceSuperseded,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutNotes,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutReviewer,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutStatus,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutSuperseded,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckNotes,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckReviewer,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckReviewerRole,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckStatus,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureNotes,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureReviewer,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureStatus,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureSuperseded,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckNotes,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckReviewer,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckReviewerRole,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckStatus,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutNotes,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutReady,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutReviewer,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutStatus,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutSuperseded,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckActions,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckNotes,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckReviewer,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckReviewerRole,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckStatus,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceNotes,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceReady,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceReviewer,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceStatus,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceSuperseded,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureNotes,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureReviewer,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureStatus,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureSuperseded,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckNotes,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckReady,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckReviewer,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckReviewerRole,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckStatus,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutNotes,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutReviewer,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutStatus,
          closeoutNotificationClosurePackageFinalEvidenceAckCloseoutSuperseded,
          closeoutNotificationClosurePackageFinalEvidenceAckNotes,
          closeoutNotificationClosurePackageFinalEvidenceAckReviewer,
          closeoutNotificationClosurePackageFinalEvidenceAckReviewerRole,
          closeoutNotificationClosurePackageFinalEvidenceAckStatus,
          closeoutNotificationClosurePackageFinalEvidenceCloseoutReady,
          closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidenceRecords,
          closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidenceRecords,
          closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementRecords,
          closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceRecords,
          closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementRecords,
          closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureRecords,
          closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementRecords,
          closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceRecords,
          closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementRecords,
          closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceRecords,
          closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementRecords,
          closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureRecords,
          closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementRecords,
          closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureRecords,
          closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementRecords,
          latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence,
          latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageFinalEvidenceDelivery,
          latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgement,
          latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure,
          latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDelivery,
          latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgement,
          latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure,
          latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDelivery,
          latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgement,
          latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence,
          latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDelivery,
          latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgement,
          latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence,
          latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDelivery,
          latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement,
          latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure,
          latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDelivery,
          latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgement,
          latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence,
          latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDelivery,
          latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement,
          latestCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidence,
          onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence,
          onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure,
          onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure,
          onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence,
          onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence,
          onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure,
          onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementFinalEvidence,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgement,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosure,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgement,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosure,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgement,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidence,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgement,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidence,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosure,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgement,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidence,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgement,
          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementFinalEvidenceAcknowledgementClosureDeliveryAcknowledgementClosureDeliveryAcknowledgementFinalEvidenceDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementClosureDeliveryAcknowledgementCloseoutEvidenceDeliveryAcknowledgementFinalEvidence,
          setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceActions,
          setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceNotes,
          setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady,
          setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceReviewer,
          setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceStatus,
          setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceSuperseded,
          setCloseoutNotificationClosurePackageFinalEvidenceAckActions,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutActions,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckActions,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureActions,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckActions,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckNotes,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckReviewer,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckReviewerRole,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureDeliveryAckStatus,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceAckClosureReady,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceActions,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutActions,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckActions,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureActions,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureCloseoutReady,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckActions,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutActions,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckActions,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckNotes,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckReviewer,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckReviewerRole,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutDeliveryAckStatus,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceActions,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceNotes,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceReady,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceReviewer,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceStatus,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutFinalEvidenceSuperseded,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutNotes,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutReviewer,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutStatus,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckCloseoutSuperseded,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckNotes,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckReviewer,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckReviewerRole,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureDeliveryAckStatus,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureNotes,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureReviewer,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureStatus,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckClosureSuperseded,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckNotes,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckReviewer,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckReviewerRole,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutDeliveryAckStatus,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutNotes,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutReady,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutReviewer,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutStatus,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceCloseoutSuperseded,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckActions,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckNotes,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckReviewer,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckReviewerRole,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceDeliveryAckStatus,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceNotes,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceReady,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceReviewer,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceStatus,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureFinalEvidenceSuperseded,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureNotes,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureReviewer,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureStatus,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckClosureSuperseded,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckNotes,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckReady,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckReviewer,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckReviewerRole,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutDeliveryAckStatus,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutNotes,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutReviewer,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutStatus,
          setCloseoutNotificationClosurePackageFinalEvidenceAckCloseoutSuperseded,
          setCloseoutNotificationClosurePackageFinalEvidenceAckNotes,
          setCloseoutNotificationClosurePackageFinalEvidenceAckReviewer,
          setCloseoutNotificationClosurePackageFinalEvidenceAckReviewerRole,
          setCloseoutNotificationClosurePackageFinalEvidenceAckStatus,
          setCloseoutNotificationClosurePackageFinalEvidenceCloseoutReady,
        }}
      />

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

