import { ClipboardCheck } from 'lucide-react'
import type {
  BackendRecord,
  ClosureSlaDeliveryAcknowledgementStatus,
  ClosureSlaFollowUpClosurePackageAcknowledgement,
  ClosureSlaFollowUpClosurePackageAcknowledgementClosure,
  ClosureSlaResponseFollowUpClosureStatus,
  NotificationDeliveryPayload,
  NotificationDeliveryResult,
  StatusLevel,
} from '../types'
import { Metadata, StatusChip } from './common'
import { titleize } from './formatters'

type DeliveryRecord = BackendRecord<{
  request: NotificationDeliveryPayload
  result: NotificationDeliveryResult
}>

type AcknowledgementMetrics = {
  totalAcknowledgements: number
  closureReady: number
  retainedActions: number
}

function acknowledgementStatusLevel(status: ClosureSlaDeliveryAcknowledgementStatus): StatusLevel {
  if (status === 'rejected') return 'blocking'
  if (status === 'changes_requested') return 'warning'
  return 'pass'
}

function closureStatusLevel(status: ClosureSlaResponseFollowUpClosureStatus): StatusLevel {
  if (status === 'rejected') return 'blocking'
  if (status === 'closed_with_actions') return 'warning'
  return 'pass'
}

export function ClosureSlaFollowUpClosurePackageAcknowledgementPanel({
  ackActions,
  ackClosureActions,
  ackClosureNotes,
  ackClosureReviewer,
  ackClosureStatus,
  ackNotes,
  ackReady,
  ackReviewer,
  ackStatus,
  acknowledgedDeliveryIds,
  acknowledgementClosureMetrics,
  acknowledgementClosureRecords,
  acknowledgementRecords,
  closureStatus,
  deliveryRecords,
  latestAcknowledgement,
  latestAcknowledgementClosure,
  latestDelivery,
  onAckActionsChange,
  onAckClosureActionsChange,
  onAckClosureNotesChange,
  onAckClosureReviewerChange,
  onAckClosureStatusChange,
  onAckNotesChange,
  onAckReadyChange,
  onAckReviewerChange,
  onAckStatusChange,
  onSaveAcknowledgement,
  onSaveAcknowledgementClosure,
  onSupersededEvidenceChange,
  requestedActionCount,
  supersededEvidence,
  supersededEvidenceCount,
}: {
  ackActions: string
  ackClosureActions: string
  ackClosureNotes: string
  ackClosureReviewer: string
  ackClosureStatus: ClosureSlaResponseFollowUpClosureStatus
  ackNotes: string
  ackReady: boolean
  ackReviewer: string
  ackStatus: ClosureSlaDeliveryAcknowledgementStatus
  acknowledgedDeliveryIds: Set<string>
  acknowledgementClosureMetrics: AcknowledgementMetrics
  acknowledgementClosureRecords: BackendRecord<ClosureSlaFollowUpClosurePackageAcknowledgementClosure>[]
  acknowledgementRecords: BackendRecord<ClosureSlaFollowUpClosurePackageAcknowledgement>[]
  closureStatus: StatusLevel
  deliveryRecords: DeliveryRecord[]
  latestAcknowledgement?: BackendRecord<ClosureSlaFollowUpClosurePackageAcknowledgement>
  latestAcknowledgementClosure?: BackendRecord<ClosureSlaFollowUpClosurePackageAcknowledgementClosure>
  latestDelivery?: DeliveryRecord
  onAckActionsChange: (value: string) => void
  onAckClosureActionsChange: (value: string) => void
  onAckClosureNotesChange: (value: string) => void
  onAckClosureReviewerChange: (value: string) => void
  onAckClosureStatusChange: (value: ClosureSlaResponseFollowUpClosureStatus) => void
  onAckNotesChange: (value: string) => void
  onAckReadyChange: (value: boolean) => void
  onAckReviewerChange: (value: string) => void
  onAckStatusChange: (value: ClosureSlaDeliveryAcknowledgementStatus) => void
  onSaveAcknowledgement: () => void
  onSaveAcknowledgementClosure: () => void
  onSupersededEvidenceChange: (value: string) => void
  requestedActionCount: number
  supersededEvidence: string
  supersededEvidenceCount: number
}) {
  const openDeliveryCount = deliveryRecords.filter((record) => !acknowledgedDeliveryIds.has(record.id)).length

  return (
    <>
      <div className="retry-aging-list">
        <div className="dashboard-heading">
          <h4>Follow-up closure package acknowledgement</h4>
          <StatusChip status={acknowledgementStatusLevel(ackStatus)} label={titleize(ackStatus)} />
        </div>
        <div className="trace-review-grid">
          <label>
            <span>Reviewer</span>
            <input value={ackReviewer} onChange={(event) => onAckReviewerChange(event.target.value)} />
          </label>
          <label>
            <span>Response status</span>
            <select
              value={ackStatus}
              onChange={(event) => onAckStatusChange(event.target.value as ClosureSlaDeliveryAcknowledgementStatus)}
            >
              <option value="acknowledged">Acknowledged</option>
              <option value="approved">Approved</option>
              <option value="changes_requested">Changes requested</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          <label className="toggle-row">
            <input checked={ackReady} onChange={(event) => onAckReadyChange(event.target.checked)} type="checkbox" />
            <span>Closure package ready</span>
          </label>
          <label className="trace-review-rationale">
            <span>Requested actions</span>
            <textarea value={ackActions} onChange={(event) => onAckActionsChange(event.target.value)} />
          </label>
          <label className="trace-review-rationale">
            <span>Response notes</span>
            <textarea value={ackNotes} onChange={(event) => onAckNotesChange(event.target.value)} />
          </label>
        </div>
        <div className="toolbar-actions notification-approval-actions">
          <button className="primary-action" disabled={!latestDelivery} onClick={onSaveAcknowledgement} type="button">
            <ClipboardCheck size={15} />
            Save Closure Package Acknowledgement
          </button>
        </div>
        <div className="metadata-grid">
          <Metadata label="Acknowledgements" value={String(acknowledgementRecords.length)} />
          <Metadata
            label="Latest delivery"
            value={latestDelivery ? new Date(latestDelivery.createdAt).toLocaleString() : 'Not delivered'}
          />
          <Metadata label="Open deliveries" value={String(openDeliveryCount)} />
          <Metadata label="Requested actions" value={String(requestedActionCount)} />
        </div>
        {latestAcknowledgement ? (
          <div className="connector-run-row">
            <div>
              <strong>{latestAcknowledgement.payload.reviewer}</strong>
              <span>
                v{latestAcknowledgement.version} / {titleize(latestAcknowledgement.payload.status)} / {new Date(latestAcknowledgement.createdAt).toLocaleString()}
              </span>
              <small>{latestAcknowledgement.payload.evidence}</small>
            </div>
            <StatusChip status={latestAcknowledgement.status} label={titleize(latestAcknowledgement.payload.status)} />
          </div>
        ) : (
          <div className="empty-state compact">No follow-up closure package acknowledgement has been retained yet.</div>
        )}
      </div>
      <div className="retry-aging-list">
        <div className="dashboard-heading">
          <h4>Follow-up closure acknowledgement closeout</h4>
          <StatusChip status={closureStatusLevel(ackClosureStatus)} label={titleize(ackClosureStatus)} />
        </div>
        <div className="trace-review-grid">
          <label>
            <span>Closure reviewer</span>
            <input value={ackClosureReviewer} onChange={(event) => onAckClosureReviewerChange(event.target.value)} />
          </label>
          <label>
            <span>Closure disposition</span>
            <select
              value={ackClosureStatus}
              onChange={(event) => onAckClosureStatusChange(event.target.value as ClosureSlaResponseFollowUpClosureStatus)}
            >
              <option value="closed">Closed</option>
              <option value="closed_with_actions">Closed with actions</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          <label className="trace-review-rationale">
            <span>Retained actions</span>
            <textarea value={ackClosureActions} onChange={(event) => onAckClosureActionsChange(event.target.value)} />
          </label>
          <label className="trace-review-rationale">
            <span>Closure notes</span>
            <textarea value={ackClosureNotes} onChange={(event) => onAckClosureNotesChange(event.target.value)} />
          </label>
          <label className="trace-review-rationale">
            <span>Superseded acknowledgement evidence</span>
            <textarea value={supersededEvidence} onChange={(event) => onSupersededEvidenceChange(event.target.value)} />
          </label>
        </div>
        <div className="toolbar-actions notification-approval-actions">
          <button
            className="primary-action"
            disabled={acknowledgementRecords.length === 0}
            onClick={onSaveAcknowledgementClosure}
            type="button"
          >
            <ClipboardCheck size={15} />
            Save Acknowledgement Closure
          </button>
        </div>
        <div className="metadata-grid">
          <Metadata label="Closure records" value={String(acknowledgementClosureRecords.length)} />
          <Metadata label="Acknowledgements" value={String(acknowledgementClosureMetrics.totalAcknowledgements)} />
          <Metadata label="Closure ready" value={String(acknowledgementClosureMetrics.closureReady)} />
          <Metadata label="Retained actions" value={String(acknowledgementClosureMetrics.retainedActions)} />
          <Metadata label="Closure status" value={closureStatus} />
          <Metadata label="Superseded notes" value={String(supersededEvidenceCount)} />
        </div>
        {latestAcknowledgementClosure ? (
          <div className="connector-run-row">
            <div>
              <strong>{latestAcknowledgementClosure.payload.reviewer}</strong>
              <span>
                v{latestAcknowledgementClosure.version} / {titleize(latestAcknowledgementClosure.payload.status)} / {new Date(latestAcknowledgementClosure.createdAt).toLocaleString()}
              </span>
              <small>{latestAcknowledgementClosure.payload.evidence}</small>
            </div>
            <StatusChip status={latestAcknowledgementClosure.status} label={titleize(latestAcknowledgementClosure.payload.status)} />
          </div>
        ) : (
          <div className="empty-state compact">No Closure SLA follow-up closure package acknowledgement closure has been retained yet.</div>
        )}
      </div>
    </>
  )
}
