import { Bell, ClipboardCheck } from 'lucide-react'
import type {
  BackendRecord,
  ClosureSlaDeliveryAcknowledgement,
  ClosureSlaResponseFollowUpRoute,
  ClosureSlaResponseFollowUpStatus,
  StatusLevel,
} from '../types'
import { Metadata, StatusChip } from './common'
import { titleize } from './formatters'

function followUpStatusLevel(status: ClosureSlaResponseFollowUpStatus): StatusLevel {
  if (status === 'escalated') return 'blocking'
  if (status === 'in_progress' || status === 'routed') return 'warning'
  return 'pass'
}

function followUpLabel(status: ClosureSlaResponseFollowUpStatus) {
  return titleize(status)
}

export function ClosureSlaFollowUpRoutingPanel({
  dueAt,
  escalationPath,
  followUpOwners,
  followUpStage,
  followUpStatus,
  latestAcknowledgement,
  latestRoute,
  notificationCount,
  onDueAtChange,
  onEscalationPathChange,
  onFollowUpOwnersChange,
  onFollowUpStageChange,
  onFollowUpStatusChange,
  onNotifyRoute,
  onRouteNotesChange,
  onSaveRoute,
  ownerCount,
  routeNotes,
  routeRecords,
}: {
  dueAt: string
  escalationPath: string
  followUpOwners: string
  followUpStage: ClosureSlaResponseFollowUpRoute['followUpStage']
  followUpStatus: ClosureSlaResponseFollowUpStatus
  latestAcknowledgement?: BackendRecord<ClosureSlaDeliveryAcknowledgement>
  latestRoute?: BackendRecord<ClosureSlaResponseFollowUpRoute>
  notificationCount: number
  onDueAtChange: (value: string) => void
  onEscalationPathChange: (value: string) => void
  onFollowUpOwnersChange: (value: string) => void
  onFollowUpStageChange: (value: ClosureSlaResponseFollowUpRoute['followUpStage']) => void
  onFollowUpStatusChange: (value: ClosureSlaResponseFollowUpStatus) => void
  onNotifyRoute: () => void
  onRouteNotesChange: (value: string) => void
  onSaveRoute: () => void
  ownerCount: number
  routeNotes: string
  routeRecords: BackendRecord<ClosureSlaResponseFollowUpRoute>[]
}) {
  const openRouteCount = routeRecords.filter((record) => record.payload.status !== 'closed').length

  return (
    <div className="notification-approval-grid renewal-routing-grid">
      <div className="notification-approval-form">
        <div className="dashboard-heading">
          <h4>Governance Response Follow-Up Routing</h4>
          <StatusChip status={followUpStatusLevel(followUpStatus)} label={followUpLabel(followUpStatus)} />
        </div>
        <div className="trace-review-grid">
          <label>
            <span>Follow-up owners</span>
            <input value={followUpOwners} onChange={(event) => onFollowUpOwnersChange(event.target.value)} />
          </label>
          <label>
            <span>Follow-up status</span>
            <select
              value={followUpStatus}
              onChange={(event) => onFollowUpStatusChange(event.target.value as ClosureSlaResponseFollowUpStatus)}
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
              value={followUpStage}
              onChange={(event) =>
                onFollowUpStageChange(event.target.value as ClosureSlaResponseFollowUpRoute['followUpStage'])
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
            <input type="date" value={dueAt} onChange={(event) => onDueAtChange(event.target.value)} />
          </label>
          <label className="trace-review-rationale">
            <span>Escalation path</span>
            <textarea value={escalationPath} onChange={(event) => onEscalationPathChange(event.target.value)} />
          </label>
          <label className="trace-review-rationale">
            <span>Route notes</span>
            <textarea value={routeNotes} onChange={(event) => onRouteNotesChange(event.target.value)} />
          </label>
        </div>
        <div className="toolbar-actions notification-approval-actions">
          <button
            className="secondary-action"
            disabled={!latestAcknowledgement}
            onClick={onSaveRoute}
            type="button"
          >
            <ClipboardCheck size={15} />
            Save Follow-Up Route
          </button>
          <button
            className="primary-action"
            disabled={!latestAcknowledgement}
            onClick={onNotifyRoute}
            type="button"
          >
            <Bell size={15} />
            Save & Notify Owners
          </button>
        </div>
      </div>
      <div className="notification-approval-summary">
        <div className="metadata-grid">
          <Metadata label="Follow-up routes" value={String(routeRecords.length)} />
          <Metadata label="Open routes" value={String(openRouteCount)} />
          <Metadata label="Owner count" value={String(ownerCount)} />
          <Metadata label="Notifications" value={String(notificationCount)} />
        </div>
        {latestRoute ? (
          <div className="connector-run-history">
            <h4>Latest follow-up route</h4>
            <div className="connector-run-row">
              <div>
                <strong>{latestRoute.payload.deliverySubject}</strong>
                <span>
                  v{latestRoute.version} / {titleize(latestRoute.payload.followUpStage)} / due {latestRoute.payload.dueAt || 'not scheduled'}
                </span>
                <small>{latestRoute.payload.evidence}</small>
              </div>
              <StatusChip status={latestRoute.status} label={followUpLabel(latestRoute.payload.status)} />
            </div>
            {latestRoute.payload.requestedActions.length > 0 ? (
              <div className="storage-column-list">
                {latestRoute.payload.requestedActions.map((action) => (
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
  )
}
