import { Bell, ClipboardCheck, Download } from 'lucide-react'
import type {
  BackendRecord,
  ClosureSlaFollowUpClosureExportPackage,
  NotificationDeliveryPayload,
  NotificationDeliveryResult,
  StatusLevel,
} from '../types'
import { Metadata, StatusChip } from './common'

type DeliveryRecord = BackendRecord<{
  request: NotificationDeliveryPayload
  result: NotificationDeliveryResult
}>

export function ClosureSlaFollowUpClosurePackagePanel({
  deliveryRecords,
  latestPackage,
  metrics,
  notificationCount,
  onDeliverPackage,
  onNotesChange,
  onReviewersChange,
  onSavePackage,
  onSavePackageWithDownload,
  packageCount,
  packageNotes,
  packageStatus,
  requiredActionCount,
  reviewers,
}: {
  deliveryRecords: DeliveryRecord[]
  latestPackage?: BackendRecord<ClosureSlaFollowUpClosureExportPackage>
  metrics: ClosureSlaFollowUpClosureExportPackage['metrics']
  notificationCount: number
  onDeliverPackage: () => void
  onNotesChange: (value: string) => void
  onReviewersChange: (value: string) => void
  onSavePackage: () => void
  onSavePackageWithDownload: () => void
  packageCount: number
  packageNotes: string
  packageStatus: StatusLevel
  requiredActionCount: number
  reviewers: string
}) {
  return (
    <div className="connector-run-history retry-aging-dashboard">
      <div className="dashboard-heading">
        <h4>Follow-Up Closure Export Package</h4>
        <StatusChip status={packageStatus} label={packageStatus} />
      </div>
      <div className="trace-review-grid">
        <label className="trace-review-rationale">
          <span>Governance reviewers</span>
          <textarea value={reviewers} onChange={(event) => onReviewersChange(event.target.value)} />
        </label>
        <label className="trace-review-rationale">
          <span>Package notes</span>
          <textarea value={packageNotes} onChange={(event) => onNotesChange(event.target.value)} />
        </label>
      </div>
      <div className="toolbar-actions notification-approval-actions">
        <button className="secondary-action" onClick={onSavePackage} type="button">
          <ClipboardCheck size={15} />
          Save Closure Export Package
        </button>
        <button className="primary-action" onClick={onSavePackageWithDownload} type="button">
          <Download size={15} />
          Save & Download Closure Package
        </button>
        <button className="primary-action" onClick={onDeliverPackage} type="button">
          <Bell size={15} />
          Save & Notify Closure Reviewers
        </button>
      </div>
      <div className="metadata-grid">
        <Metadata label="Closure packages" value={String(packageCount)} />
        <Metadata label="Closure records" value={String(metrics.totalClosures)} />
        <Metadata label="Retained actions" value={String(metrics.retainedActions)} />
        <Metadata label="Superseded routes" value={String(metrics.supersededRoutes)} />
        <Metadata label="Required actions" value={String(requiredActionCount)} />
        <Metadata label="Notification evidence" value={String(notificationCount)} />
        <Metadata label="Package deliveries" value={String(deliveryRecords.length)} />
      </div>
      {latestPackage ? (
        <div className="retry-aging-list">
          <h4>Latest follow-up closure package</h4>
          <div className="connector-run-row">
            <div>
              <strong>{latestPackage.payload.governanceReviewers.join(', ')}</strong>
              <span>
                v{latestPackage.version} / {new Date(latestPackage.createdAt).toLocaleString()} / {latestPackage.payload.closureRecords.length} closure record(s)
              </span>
              <small>{latestPackage.payload.evidence}</small>
            </div>
            <StatusChip status={latestPackage.status} label={latestPackage.status} />
          </div>
          {latestPackage.payload.requiredActions.length > 0 ? (
            <ul className="compact-list">
              {latestPackage.payload.requiredActions.slice(0, 5).map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <div className="empty-state compact">No Closure SLA follow-up closure export package has been retained yet.</div>
      )}
      {deliveryRecords.length > 0 ? (
        <div className="retry-aging-list">
          <h4>Follow-up closure package delivery evidence</h4>
          {deliveryRecords.slice(0, 3).map((record) => (
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
  )
}
