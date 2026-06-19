import { ClipboardCheck } from 'lucide-react'
import type {
  BackendRecord,
  ClosureSlaResponseFollowUpClosure,
  ClosureSlaResponseFollowUpClosureStatus,
  ClosureSlaResponseFollowUpRoute,
} from '../types'
import { Metadata, StatusChip } from './common'
import { titleize } from './formatters'

function closureLabel(status: ClosureSlaResponseFollowUpClosureStatus) {
  return titleize(status)
}

function followUpLabel(status: ClosureSlaResponseFollowUpRoute['status']) {
  return titleize(status)
}

function closureStatusLevel(status: ClosureSlaResponseFollowUpClosureStatus) {
  if (status === 'rejected') return 'blocking'
  if (status === 'closed_with_actions') return 'warning'
  return 'pass'
}

export function ClosureSlaFollowUpClosurePanel({
  closureNotes,
  closureRecords,
  closureReviewer,
  closureStatus,
  latestClosure,
  latestRoute,
  onClosureNotesChange,
  onClosureReviewerChange,
  onClosureStatusChange,
  onSaveClosure,
  onSupersededEvidenceChange,
  retainedActionCount,
  routeRecords,
  supersededEvidence,
}: {
  closureNotes: string
  closureRecords: BackendRecord<ClosureSlaResponseFollowUpClosure>[]
  closureReviewer: string
  closureStatus: ClosureSlaResponseFollowUpClosureStatus
  latestClosure?: BackendRecord<ClosureSlaResponseFollowUpClosure>
  latestRoute?: BackendRecord<ClosureSlaResponseFollowUpRoute>
  onClosureNotesChange: (value: string) => void
  onClosureReviewerChange: (value: string) => void
  onClosureStatusChange: (value: ClosureSlaResponseFollowUpClosureStatus) => void
  onSaveClosure: () => void
  onSupersededEvidenceChange: (value: string) => void
  retainedActionCount: number
  routeRecords: BackendRecord<ClosureSlaResponseFollowUpRoute>[]
  supersededEvidence: string
}) {
  return (
    <div className="notification-approval-grid renewal-routing-grid">
      <div className="notification-approval-form">
        <div className="dashboard-heading">
          <h4>Follow-Up Closure Record</h4>
          <StatusChip status={closureStatusLevel(closureStatus)} label={closureLabel(closureStatus)} />
        </div>
        <div className="trace-review-grid">
          <label>
            <span>Closure reviewer</span>
            <input value={closureReviewer} onChange={(event) => onClosureReviewerChange(event.target.value)} />
          </label>
          <label>
            <span>Closure disposition</span>
            <select
              value={closureStatus}
              onChange={(event) => onClosureStatusChange(event.target.value as ClosureSlaResponseFollowUpClosureStatus)}
            >
              <option value="closed">Closed</option>
              <option value="closed_with_actions">Closed with actions</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          <label className="trace-review-rationale">
            <span>Closure notes</span>
            <textarea value={closureNotes} onChange={(event) => onClosureNotesChange(event.target.value)} />
          </label>
          <label className="trace-review-rationale">
            <span>Superseded route evidence</span>
            <textarea value={supersededEvidence} onChange={(event) => onSupersededEvidenceChange(event.target.value)} />
          </label>
        </div>
        <div className="toolbar-actions notification-approval-actions">
          <button
            className="primary-action"
            disabled={!latestRoute}
            onClick={onSaveClosure}
            type="button"
          >
            <ClipboardCheck size={15} />
            Save Follow-Up Closure
          </button>
        </div>
      </div>
      <div className="notification-approval-summary">
        <div className="metadata-grid">
          <Metadata label="Closure records" value={String(closureRecords.length)} />
          <Metadata label="Latest route" value={latestRoute ? followUpLabel(latestRoute.payload.status) : 'Not routed'} />
          <Metadata label="Superseded routes" value={String(Math.max(routeRecords.length - 1, 0))} />
          <Metadata label="Retained actions" value={String(retainedActionCount)} />
        </div>
        {latestClosure ? (
          <div className="connector-run-history">
            <h4>Latest follow-up closure</h4>
            <div className="connector-run-row">
              <div>
                <strong>{latestClosure.payload.reviewer}</strong>
                <span>
                  v{latestClosure.version} / {closureLabel(latestClosure.payload.status)} / {new Date(latestClosure.createdAt).toLocaleString()}
                </span>
                <small>{latestClosure.payload.evidence}</small>
              </div>
              <StatusChip status={latestClosure.status} label={closureLabel(latestClosure.payload.status)} />
            </div>
            {latestClosure.payload.supersededEvidence.length > 0 ? (
              <div className="storage-column-list">
                {latestClosure.payload.supersededEvidence.slice(0, 4).map((evidence) => (
                  <span key={evidence}>{evidence}</span>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="empty-state compact">No Closure SLA follow-up closure has been retained yet.</div>
        )}
      </div>
    </div>
  )
}
