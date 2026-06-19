import { Bell, ClipboardCheck } from 'lucide-react'
import type {
  BackendRecord,
  StatusLevel,
  TraceabilityDeliveryResponse,
  TraceabilityResponseClosureRoute,
  TraceabilityResponseClosureRouteStage,
  TraceabilityResponseClosureRouteStatus,
} from '../types'

function titleize(value?: string | null) {
  return (value ?? 'unknown')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function StatusChip({ status, label }: { status: StatusLevel; label: string }) {
  return <span className={`status-chip ${status}`}>{label}</span>
}

function PanelHeader({
  icon: Icon,
  subtitle,
  title,
}: {
  icon: typeof ClipboardCheck
  subtitle: string
  title: string
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

function traceabilityClosureRouteLabel(status: TraceabilityResponseClosureRouteStatus) {
  return titleize(status)
}

export function TraceabilityClosureRoutingPanel({
  closureRouteDueAt,
  closureRouteNotes,
  closureRouteReviewer,
  closureRouteReviewers,
  closureRouteStage,
  closureRouteStatus,
  latestDeliveryResponse,
  onClosureRouteDueAtChange,
  onClosureRouteNotesChange,
  onClosureRouteReviewerChange,
  onClosureRouteReviewersChange,
  onClosureRouteStageChange,
  onClosureRouteStatusChange,
  onNotifyClosureRoute,
  onSaveClosureRoute,
  traceabilityClosureRoutes,
}: {
  closureRouteDueAt: string
  closureRouteNotes: string
  closureRouteReviewer: string
  closureRouteReviewers: string
  closureRouteStage: TraceabilityResponseClosureRouteStage
  closureRouteStatus: TraceabilityResponseClosureRouteStatus
  latestDeliveryResponse?: BackendRecord<TraceabilityDeliveryResponse>
  onClosureRouteDueAtChange: (value: string) => void
  onClosureRouteNotesChange: (value: string) => void
  onClosureRouteReviewerChange: (value: string) => void
  onClosureRouteReviewersChange: (value: string) => void
  onClosureRouteStageChange: (value: TraceabilityResponseClosureRouteStage) => void
  onClosureRouteStatusChange: (value: TraceabilityResponseClosureRouteStatus) => void
  onNotifyClosureRoute: () => void
  onSaveClosureRoute: () => void
  traceabilityClosureRoutes: BackendRecord<TraceabilityResponseClosureRoute>[]
}) {
  return (
    <section className="panel trace-review-history-panel">
      <PanelHeader
        icon={ClipboardCheck}
        title="Closure Notifications & Follow-Up Routing"
        subtitle="Route reviewer responses into quality follow-up, closure review, escalation, or closed status."
      />
      <div className="trace-review-grid">
        <label>
          <span>Closure owner</span>
          <input value={closureRouteReviewer} onChange={(event) => onClosureRouteReviewerChange(event.target.value)} />
        </label>
        <label>
          <span>Closure status</span>
          <select
            value={closureRouteStatus}
            onChange={(event) => onClosureRouteStatusChange(event.target.value as TraceabilityResponseClosureRouteStatus)}
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
            onChange={(event) => onClosureRouteStageChange(event.target.value as TraceabilityResponseClosureRouteStage)}
          >
            <option value="quality_follow_up">Quality follow-up</option>
            <option value="closure_review">Closure review</option>
            <option value="closed">Closed</option>
            <option value="escalated">Escalated</option>
          </select>
        </label>
        <label>
          <span>Due date</span>
          <input type="date" value={closureRouteDueAt} onChange={(event) => onClosureRouteDueAtChange(event.target.value)} />
        </label>
        <label className="trace-review-rationale">
          <span>Closure reviewers</span>
          <input value={closureRouteReviewers} onChange={(event) => onClosureRouteReviewersChange(event.target.value)} />
        </label>
        <label className="trace-review-rationale">
          <span>Closure notes</span>
          <textarea value={closureRouteNotes} onChange={(event) => onClosureRouteNotesChange(event.target.value)} />
        </label>
      </div>
      <div className="toolbar-actions notification-approval-actions">
        <button
          className="secondary-action"
          disabled={!latestDeliveryResponse}
          onClick={onSaveClosureRoute}
          type="button"
        >
          <ClipboardCheck size={15} />
          Save Follow-Up Route
        </button>
        <button
          className="primary-action"
          disabled={!latestDeliveryResponse}
          onClick={onNotifyClosureRoute}
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
    </section>
  )
}
