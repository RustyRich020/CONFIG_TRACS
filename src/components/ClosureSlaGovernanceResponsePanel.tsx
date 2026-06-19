import { ClipboardCheck } from 'lucide-react'
import type {
  BackendRecord,
  ClosureSlaDeliveryAcknowledgement,
  ClosureSlaDeliveryAcknowledgementStatus,
  NotificationDeliveryPayload,
  NotificationDeliveryResult,
  StatusLevel,
} from '../types'

type ClosureSlaDeliveryRecord = BackendRecord<{
  request: NotificationDeliveryPayload
  result: NotificationDeliveryResult
}>

function titleize(value?: string | null) {
  return (value ?? 'unknown')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div className="metadata-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function StatusChip({ status, label }: { status: StatusLevel; label: string }) {
  return <span className={`status-chip ${status}`}>{label}</span>
}

function acknowledgementLabel(status: ClosureSlaDeliveryAcknowledgementStatus) {
  return titleize(status)
}

export function ClosureSlaGovernanceResponsePanel({
  acknowledgedDeliveryIds,
  acknowledgementRecords,
  ackActions,
  ackNotes,
  ackReviewer,
  ackRouteStage,
  ackStatus,
  deliveryRecords,
  latestAcknowledgement,
  latestDelivery,
  onAckActionsChange,
  onAckNotesChange,
  onAckReviewerChange,
  onAckRouteStageChange,
  onAckStatusChange,
  onSaveResponse,
  openDeliveryCount,
}: {
  acknowledgedDeliveryIds: Set<string>
  acknowledgementRecords: BackendRecord<ClosureSlaDeliveryAcknowledgement>[]
  ackActions: string
  ackNotes: string
  ackReviewer: string
  ackRouteStage: ClosureSlaDeliveryAcknowledgement['routeStage']
  ackStatus: ClosureSlaDeliveryAcknowledgementStatus
  deliveryRecords: ClosureSlaDeliveryRecord[]
  latestAcknowledgement?: BackendRecord<ClosureSlaDeliveryAcknowledgement>
  latestDelivery?: ClosureSlaDeliveryRecord
  onAckActionsChange: (value: string) => void
  onAckNotesChange: (value: string) => void
  onAckReviewerChange: (value: string) => void
  onAckRouteStageChange: (value: ClosureSlaDeliveryAcknowledgement['routeStage']) => void
  onAckStatusChange: (value: ClosureSlaDeliveryAcknowledgementStatus) => void
  onSaveResponse: (record: ClosureSlaDeliveryRecord) => void
  openDeliveryCount: number
}) {
  return (
    <>
      <div className="notification-approval-grid renewal-routing-grid">
        <div className="notification-approval-form">
          <div className="trace-review-grid">
            <label>
              <span>Governance response reviewer</span>
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
            <label>
              <span>Route stage</span>
              <select
                value={ackRouteStage}
                onChange={(event) =>
                  onAckRouteStageChange(event.target.value as ClosureSlaDeliveryAcknowledgement['routeStage'])
                }
              >
                <option value="governance_acknowledgement">Governance acknowledgement</option>
                <option value="owner_follow_up">Owner follow-up</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <label className="trace-review-rationale">
              <span>Response notes</span>
              <textarea value={ackNotes} onChange={(event) => onAckNotesChange(event.target.value)} />
            </label>
            <label className="trace-review-rationale">
              <span>Requested actions</span>
              <textarea value={ackActions} onChange={(event) => onAckActionsChange(event.target.value)} />
            </label>
          </div>
          <div className="toolbar-actions notification-approval-actions">
            <button
              className="primary-action"
              disabled={!latestDelivery}
              onClick={() => (latestDelivery ? onSaveResponse(latestDelivery) : undefined)}
              type="button"
            >
              <ClipboardCheck size={15} />
              Save Governance Response
            </button>
          </div>
        </div>
        <div className="notification-approval-summary">
          <div className="metadata-grid">
            <Metadata label="Delivery responses" value={String(acknowledgementRecords.length)} />
            <Metadata label="Open deliveries" value={String(openDeliveryCount)} />
            <Metadata
              label="Latest response"
              value={latestAcknowledgement ? acknowledgementLabel(latestAcknowledgement.payload.status) : 'Not recorded'}
            />
            <Metadata
              label="Latest package"
              value={
                latestAcknowledgement?.payload.packageVersion
                  ? `v${latestAcknowledgement.payload.packageVersion}`
                  : 'Not linked'
              }
            />
          </div>
          {latestAcknowledgement ? (
            <div className="connector-run-history">
              <h4>Latest governance response</h4>
              <div className="connector-run-row">
                <div>
                  <strong>{latestAcknowledgement.payload.reviewer}</strong>
                  <span>
                    v{latestAcknowledgement.version} / {titleize(latestAcknowledgement.payload.routeStage)} / {new Date(latestAcknowledgement.createdAt).toLocaleString()}
                  </span>
                  <small>{latestAcknowledgement.payload.evidence}</small>
                </div>
                <StatusChip
                  status={latestAcknowledgement.status}
                  label={acknowledgementLabel(latestAcknowledgement.payload.status)}
                />
              </div>
              {latestAcknowledgement.payload.requestedActions.length > 0 ? (
                <div className="storage-column-list">
                  {latestAcknowledgement.payload.requestedActions.map((action) => (
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
      {deliveryRecords.length > 0 ? (
        <div className="mapping-run-history">
          <h4>Closure SLA delivery response queue</h4>
          {deliveryRecords.slice(0, 5).map((record) => {
            const responseRecorded = acknowledgedDeliveryIds.has(record.id)
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
                  <button className="secondary-action compact" onClick={() => onSaveResponse(record)} type="button">
                    Record Response
                  </button>
                  <StatusChip status={responseRecorded ? 'pass' : record.status} label={responseRecorded ? 'responded' : record.status} />
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </>
  )
}
