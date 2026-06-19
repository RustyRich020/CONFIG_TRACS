import type {
  BackendRecord,
  BackendRecordKind,
  GovernanceWorkflowMetadata,
  GovernanceWorkflowStage,
  StatusLevel,
  WorkflowDefinition,
} from './types'

export type GovernanceWorkflowItem = {
  record: BackendRecord
  workflowType: string
  workflowLabel: string
  stage: GovernanceWorkflowStage
  stageLabel: string
  actionLabel: string
  owner: string
  dueAt?: string
  dueStatus: 'not_scheduled' | 'on_track' | 'due_soon' | 'overdue'
  definition?: WorkflowDefinition
  allowedNextStages: GovernanceWorkflowStage[]
  exportPackageLabel?: string
  ageDays: number
  status: StatusLevel
}

export type GovernanceWorkflowSummary = {
  total: number
  blocking: number
  warning: number
  pass: number
  byStage: Record<GovernanceWorkflowStage, number>
  actionItems: number
  latestUpdatedAt?: string
}

const emptyStageCounts: Record<GovernanceWorkflowStage, number> = {
  acknowledgement: 0,
  closeout: 0,
  closure: 0,
  delivery: 0,
  final_evidence: 0,
  package: 0,
  retry: 0,
  source: 0,
}

export function deriveGovernanceWorkflowQueue(
  records: BackendRecord[],
  workflowDefinitions: Record<string, WorkflowDefinition> = {},
): {
  items: GovernanceWorkflowItem[]
  summary: GovernanceWorkflowSummary
} {
  const items = records
    .filter(isGovernanceRecord)
    .map((record) => toGovernanceWorkflowItem(record, workflowDefinitions))
    .sort((first, second) => {
      const statusDelta = statusRank(second.status) - statusRank(first.status)
      if (statusDelta !== 0) return statusDelta
      return new Date(second.record.updatedAt).getTime() - new Date(first.record.updatedAt).getTime()
    })

  const summary = items.reduce(
    (current, item) => {
      current.total += 1
      current[item.status] += 1
      current.byStage[item.stage] += 1
      if (item.status !== 'pass') current.actionItems += 1
      if (!current.latestUpdatedAt || new Date(item.record.updatedAt) > new Date(current.latestUpdatedAt)) {
        current.latestUpdatedAt = item.record.updatedAt
      }
      return current
    },
    {
      total: 0,
      blocking: 0,
      warning: 0,
      pass: 0,
      byStage: { ...emptyStageCounts },
      actionItems: 0,
      latestUpdatedAt: undefined,
    } as GovernanceWorkflowSummary,
  )

  return { items, summary }
}

export function inferGovernanceWorkflowMetadata({
  kind,
  label,
  payload,
}: {
  kind: BackendRecordKind
  label: string
  payload: unknown
}): GovernanceWorkflowMetadata | undefined {
  const record = {
    kind,
    label,
    payload,
  } as BackendRecord

  if (!isGovernanceRecord(record)) return undefined

  const stage = governanceStage(kind)
  const payloadObject = asObject(payload)
  return {
    metadataVersion: 'workflow_metadata_v1',
    workflowType: workflowTypeFor(record),
    stage,
    parentRecordId: parentRecordIdFor(payloadObject),
    owner: ownerFor(payloadObject, label),
    dueAt: dueAtFor(payloadObject),
  }
}

function isGovernanceRecord(record: BackendRecord) {
  return (
    hasStructuredWorkflowMetadata(record.workflow) ||
    record.kind === 'notification_delivery' ||
    record.kind === 'notification_delivery_retry' ||
    record.kind.includes('acknowledgement') ||
    record.kind.includes('closure') ||
    record.kind.includes('closeout') ||
    record.kind.includes('evidence') ||
    record.kind.includes('cutover')
  )
}

function toGovernanceWorkflowItem(
  record: BackendRecord,
  workflowDefinitions: Record<string, WorkflowDefinition>,
): GovernanceWorkflowItem {
  const explicitWorkflow = hasStructuredWorkflowMetadata(record.workflow) ? record.workflow : undefined
  const stage = explicitWorkflow?.stage ?? governanceStage(record.kind)
  const payload = asObject(record.payload)
  const workflowType = explicitWorkflow?.workflowType ?? workflowTypeFor(record)
  const definition = workflowDefinitions[workflowType]
  const dueAt = explicitWorkflow?.dueAt ?? dueAtFor(payload)
  const dueStatus = dueStatusFor(dueAt)
  const status = governanceStatus(record, stage, dueStatus)

  return {
    record,
    workflowType,
    workflowLabel: definition?.display_name ?? labelize(workflowType),
    stage,
    stageLabel: labelize(stage),
    actionLabel: actionLabelFor(status, stage, definition),
    owner: explicitWorkflow?.owner ?? ownerFor(payload, record.label, definition),
    dueAt,
    dueStatus,
    definition,
    allowedNextStages: definition?.allowed_next_stages?.[stage] ?? [],
    exportPackageLabel: definition?.export_package?.enabled ? definition.export_package.label : undefined,
    ageDays: daysSince(record.updatedAt),
    status,
  }
}

function hasStructuredWorkflowMetadata(workflow: BackendRecord['workflow']) {
  return (
    workflow?.metadataVersion === 'workflow_metadata_v1' &&
    typeof workflow.workflowType === 'string' &&
    typeof workflow.stage === 'string'
  )
}

function governanceStage(kind: BackendRecordKind): GovernanceWorkflowStage {
  if (kind === 'notification_delivery_retry' || kind.includes('retry_queue')) return 'retry'
  if (kind === 'notification_delivery' || kind.endsWith('_delivery')) return 'delivery'
  if (kind.endsWith('_delivery_acknowledgement') || kind.endsWith('_acknowledgement')) return 'acknowledgement'
  if (kind.includes('final_evidence')) return 'final_evidence'
  if (kind.includes('closeout_evidence') || kind.includes('closeout')) return 'closeout'
  if (kind.includes('follow_up_route')) return 'closure'
  if (kind.endsWith('_closure') || kind.includes('_closure_')) return 'closure'
  if (kind.includes('package')) return 'package'
  return 'source'
}

function workflowTypeFor(record: BackendRecord) {
  const payload = asObject(record.payload)
  const request = asObject(payload.request)
  const source = typeof request.source === 'string' ? request.source : undefined
  if (source) return source

  if (record.kind.includes('postgres_cutover')) return 'production_cutover'
  if (record.kind.includes('retry_queue')) return 'notification_retry_queue'
  if (record.kind.includes('closure_sla')) return 'closure_sla'
  if (record.kind.includes('traceability')) return 'traceability'
  if (record.kind.includes('notification')) return 'notification_governance'
  if (record.kind.includes('closure_package')) return 'closure_package_governance'
  return record.kind
}

function governanceStatus(
  record: BackendRecord,
  stage: GovernanceWorkflowStage,
  dueStatus: GovernanceWorkflowItem['dueStatus'],
): StatusLevel {
  const payload = asObject(record.payload)
  const payloadStatus = typeof payload.status === 'string' ? payload.status : ''

  if (dueStatus === 'overdue') return 'blocking'
  if (record.status === 'blocking' || /rejected|failed|blocked|overdue/.test(payloadStatus)) return 'blocking'
  if (record.status === 'warning') return 'warning'
  if (dueStatus === 'due_soon') return 'warning'
  if (
    /pending|draft|queued|active|changes_requested|with_actions/.test(payloadStatus) ||
    stage === 'delivery' ||
    stage === 'retry'
  ) {
    return 'warning'
  }
  return 'pass'
}

function ownerFor(payload: Record<string, unknown>, fallback: string, definition?: WorkflowDefinition) {
  const ownerFields =
    definition?.owner_resolution?.map((field) => fieldValueFor(payload, field)) ?? [
      payload.owner,
      payload.actor,
      payload.reviewer,
      firstText(payload.reviewers),
      firstText(payload.recipients),
      firstText(payload.routedReviewers),
      firstText(payload.infrastructureOwners),
      firstText(payload.messagingOwners),
    ]
  return ownerFields.find((value): value is string => typeof value === 'string' && value.trim().length > 0) ?? fallback
}

function parentRecordIdFor(payload: Record<string, unknown>) {
  const nestedDelivery = asObject(payload.deliveryRecord)
  const nestedPackage = asObject(payload.packageRecord)
  const candidates = [
    payload.parentRecordId,
    payload.deliveryRecordId,
    payload.originalDeliveryRecordId,
    payload.responseRecordId,
    payload.packageRecordId,
    payload.closureRecordId,
    payload.recordId,
    nestedDelivery.id,
    nestedPackage.id,
  ]
  return candidates.find((value): value is string => typeof value === 'string' && value.trim().length > 0)
}

function dueAtFor(payload: Record<string, unknown>) {
  const candidates = [payload.dueAt, payload.retryDueAt, payload.reminderAt, payload.nextReviewAt, payload.routeDueAt]
  return candidates.find((value): value is string => typeof value === 'string' && value.trim().length > 0)
}

function actionLabelFor(status: StatusLevel, stage: GovernanceWorkflowStage, definition?: WorkflowDefinition) {
  const workflow = definition?.display_name
  if (status === 'blocking') return `Escalate ${labelize(stage)}`
  if (status === 'warning') return workflow ? `Review ${workflow}` : `Review ${labelize(stage)}`
  return workflow ? `Retain ${workflow}` : `Retain ${labelize(stage)}`
}

function daysSince(value: string) {
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return 0
  return Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000))
}

function statusRank(status: StatusLevel) {
  if (status === 'blocking') return 3
  if (status === 'warning') return 2
  return 1
}

function dueStatusFor(value: string | undefined): GovernanceWorkflowItem['dueStatus'] {
  if (!value) return 'not_scheduled'
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return 'not_scheduled'
  const remainingMs = timestamp - Date.now()
  if (remainingMs < 0) return 'overdue'
  if (remainingMs <= 3 * 86_400_000) return 'due_soon'
  return 'on_track'
}

function labelize(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function firstText(value: unknown) {
  if (Array.isArray(value)) {
    return value.find((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
  }
  return undefined
}

function fieldValueFor(payload: Record<string, unknown>, field: string) {
  return Array.isArray(payload[field]) ? firstText(payload[field]) : payload[field]
}
