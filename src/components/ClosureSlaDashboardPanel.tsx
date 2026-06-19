import { Bell, Download, Gauge, ShieldCheck } from 'lucide-react'
import type {
  BackendRecord,
  ClosureSlaExportPackage,
  NotificationDeliveryPayload,
  NotificationDeliveryResult,
  StatusLevel,
} from '../types'
import { Metadata, PanelHeader, StatusChip } from './common'

type ClosureSlaDeliveryRecord = BackendRecord<{
  request: NotificationDeliveryPayload
  result: NotificationDeliveryResult
}>

export function ClosureSlaDashboardPanel({
  closureSlaMetrics,
  closureSlaOverallStatus,
  closureSlaPackageDeliveryRecords,
  governanceReviewers,
  latestClosureSlaExportPackage,
  onDeliverPackage,
  onGovernanceReviewersChange,
  onReviewerNotesChange,
  onSavePackage,
  onSavePackageWithDownload,
  packageCount,
  reviewerNotes,
}: {
  closureSlaMetrics: ClosureSlaExportPackage['metrics']
  closureSlaOverallStatus: StatusLevel
  closureSlaPackageDeliveryRecords: ClosureSlaDeliveryRecord[]
  governanceReviewers: string
  latestClosureSlaExportPackage?: BackendRecord<ClosureSlaExportPackage>
  onDeliverPackage: () => void
  onGovernanceReviewersChange: (value: string) => void
  onReviewerNotesChange: (value: string) => void
  onSavePackage: () => void
  onSavePackageWithDownload: () => void
  packageCount: number
  reviewerNotes: string
}) {
  return (
    <>
      <PanelHeader
        icon={Gauge}
        title="Closure SLA Dashboard"
        subtitle="SLA rollup for traceability response closures and notification follow-up routes."
      />
      <div className="approval-form-grid">
        <label>
          Governance reviewers
          <input
            value={governanceReviewers}
            onChange={(event) => onGovernanceReviewersChange(event.target.value)}
          />
        </label>
        <label>
          Reviewer notes
          <textarea
            value={reviewerNotes}
            onChange={(event) => onReviewerNotesChange(event.target.value)}
          />
        </label>
      </div>
      <div className="toolbar-actions inline-actions">
        <button className="secondary-action" onClick={onSavePackage} type="button">
          <ShieldCheck size={15} />
          Save SLA Package
        </button>
        <button className="primary-action" onClick={onSavePackageWithDownload} type="button">
          <Download size={15} />
          Save & Download SLA Package
        </button>
        <button className="primary-action" onClick={onDeliverPackage} type="button">
          <Bell size={15} />
          Save & Notify Governance
        </button>
      </div>
      <div className="notification-approval-summary">
        <div className="metadata-grid">
          <Metadata label="Overall SLA" value={closureSlaOverallStatus} />
          <Metadata label="Total routes" value={String(closureSlaMetrics.total)} />
          <Metadata label="Open" value={String(closureSlaMetrics.open)} />
          <Metadata label="Closed" value={String(closureSlaMetrics.closed)} />
          <Metadata label="Overdue" value={String(closureSlaMetrics.overdue)} />
          <Metadata label="Due soon" value={String(closureSlaMetrics.dueSoon)} />
          <Metadata label="Notification open" value={String(closureSlaMetrics.notificationOpen)} />
          <Metadata label="Traceability open" value={String(closureSlaMetrics.traceabilityOpen)} />
          <Metadata label="SLA packages" value={String(packageCount)} />
          <Metadata label="SLA deliveries" value={String(closureSlaPackageDeliveryRecords.length)} />
          <Metadata
            label="Latest package"
            value={latestClosureSlaExportPackage ? new Date(latestClosureSlaExportPackage.createdAt).toLocaleString() : 'Not packaged'}
          />
        </div>
      </div>
      {latestClosureSlaExportPackage ? (
        <div className="connector-run-history">
          <h4>Latest SLA governance package</h4>
          <div className="connector-run-row">
            <div>
              <strong>{latestClosureSlaExportPackage.payload.governanceReviewers.join(', ')}</strong>
              <span>
                v{latestClosureSlaExportPackage.version} / {new Date(latestClosureSlaExportPackage.createdAt).toLocaleString()}
              </span>
              <small>{latestClosureSlaExportPackage.payload.evidence}</small>
            </div>
            <StatusChip status={latestClosureSlaExportPackage.status} label={latestClosureSlaExportPackage.status} />
          </div>
          {latestClosureSlaExportPackage.payload.requiredActions.length > 0 ? (
            <div className="storage-column-list">
              {latestClosureSlaExportPackage.payload.requiredActions.map((action) => (
                <span key={action}>{action}</span>
              ))}
            </div>
          ) : null}
          {closureSlaPackageDeliveryRecords.length > 0 ? (
            <div className="connector-run-history">
              <h4>SLA package delivery evidence</h4>
              {closureSlaPackageDeliveryRecords.slice(0, 3).map((record) => (
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
      ) : null}
    </>
  )
}
