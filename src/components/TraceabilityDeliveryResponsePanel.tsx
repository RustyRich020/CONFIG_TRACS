import { Bell, ClipboardCheck } from 'lucide-react'
import type {
  BackendRecord,
  NotificationDeliveryPayload,
  NotificationDeliveryResult,
  StatusLevel,
  TraceabilityDeliveryResponse,
  TraceabilityDeliveryResponseStatus,
  TraceabilityResponseClosureRoute,
} from '../types'

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

function PanelHeader({
  icon: Icon,
  subtitle,
  title,
}: {
  icon: typeof Bell
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

function traceabilityResponseLabel(status: TraceabilityDeliveryResponseStatus) {
  return titleize(status)
}

function traceabilityClosureRouteLabel(status: TraceabilityResponseClosureRoute['status']) {
  return titleize(status)
}

type TraceabilityDeliveryRecord = BackendRecord<{
  request: NotificationDeliveryPayload
  result: NotificationDeliveryResult
}>

export function TraceabilityDeliveryResponsePanel({
  acknowledgedDeliveryIds,
  deliveryResponseActions,
  deliveryResponseNotes,
  deliveryResponseReviewer,
  deliveryResponseRouteStage,
  deliveryResponseStatus,
  latestClosureRoute,
  latestDeliveryResponse,
  latestTraceabilityDelivery,
  onDeliveryResponseActionsChange,
  onDeliveryResponseNotesChange,
  onDeliveryResponseReviewerChange,
  onDeliveryResponseRouteStageChange,
  onDeliveryResponseStatusChange,
  onSaveDeliveryResponse,
  openClosureRouteCount,
  openDeliveryCount,
  responseRecords,
  traceabilityDeliveryRecords,
}: {
  acknowledgedDeliveryIds: Set<string>
  deliveryResponseActions: string
  deliveryResponseNotes: string
  deliveryResponseReviewer: string
  deliveryResponseRouteStage: TraceabilityDeliveryResponse['routeStage']
  deliveryResponseStatus: TraceabilityDeliveryResponseStatus
  latestClosureRoute?: BackendRecord<TraceabilityResponseClosureRoute>
  latestDeliveryResponse?: BackendRecord<TraceabilityDeliveryResponse>
  latestTraceabilityDelivery?: TraceabilityDeliveryRecord
  onDeliveryResponseActionsChange: (value: string) => void
  onDeliveryResponseNotesChange: (value: string) => void
  onDeliveryResponseReviewerChange: (value: string) => void
  onDeliveryResponseRouteStageChange: (value: TraceabilityDeliveryResponse['routeStage']) => void
  onDeliveryResponseStatusChange: (value: TraceabilityDeliveryResponseStatus) => void
  onSaveDeliveryResponse: (deliveryRecord?: TraceabilityDeliveryRecord) => void
  openClosureRouteCount: number
  openDeliveryCount: number
  responseRecords: BackendRecord<TraceabilityDeliveryResponse>[]
  traceabilityDeliveryRecords: TraceabilityDeliveryRecord[]
}) {
  return (
    <>
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
                  <button className="secondary-action compact" onClick={() => onSaveDeliveryResponse(record)} type="button">
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
            <input value={deliveryResponseReviewer} onChange={(event) => onDeliveryResponseReviewerChange(event.target.value)} />
          </label>
          <label>
            <span>Response status</span>
            <select
              value={deliveryResponseStatus}
              onChange={(event) => onDeliveryResponseStatusChange(event.target.value as TraceabilityDeliveryResponseStatus)}
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
                onDeliveryResponseRouteStageChange(event.target.value as TraceabilityDeliveryResponse['routeStage'])
              }
            >
              <option value="reviewer_acknowledgement">Reviewer acknowledgement</option>
              <option value="quality_follow_up">Quality follow-up</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          <label className="trace-review-rationale">
            <span>Response notes</span>
            <textarea value={deliveryResponseNotes} onChange={(event) => onDeliveryResponseNotesChange(event.target.value)} />
          </label>
          <label className="trace-review-rationale">
            <span>Requested actions</span>
            <textarea
              value={deliveryResponseActions}
              onChange={(event) => onDeliveryResponseActionsChange(event.target.value)}
              placeholder="One requested action per line"
            />
          </label>
        </div>
        <div className="toolbar-actions notification-approval-actions">
          <button
            className="primary-action"
            disabled={!latestTraceabilityDelivery}
            onClick={() => onSaveDeliveryResponse()}
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
