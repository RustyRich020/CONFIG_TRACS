import { History } from 'lucide-react'
import type { BackendRecord, StatusLevel, TraceabilityExportReview } from '../types'

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
  icon: typeof History
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

export function TraceabilitySignedExportHistoryPanel({
  reviewRecords,
}: {
  reviewRecords: BackendRecord<TraceabilityExportReview>[]
}) {
  return (
    <section className="panel trace-review-history-panel">
      <PanelHeader
        icon={History}
        title="Signed Export Retention Records"
        subtitle="Versioned traceability graph export reviews with reviewer signature and retention evidence."
      />
      {reviewRecords.length > 0 ? (
        <div className="mapping-run-history">
          {reviewRecords.slice(0, 6).map((record) => (
            <div className="mapping-run-row" key={record.id}>
              <div>
                <strong>{record.payload.package.selectedEvent?.canonical.event_id ?? 'All traceability'}</strong>
                <span>
                  v{record.version} / {record.payload.reviewer} / {new Date(record.payload.signedAt).toLocaleString()}
                </span>
                <small>
                  {record.payload.package.coverage.filteredLinks} link(s), {record.payload.package.coverage.evidencePackets} packet(s) / retain until {record.payload.retention.retainUntil === 'indefinite'
                    ? 'legal hold release'
                    : new Date(record.payload.retention.retainUntil).toLocaleDateString()}
                </small>
              </div>
              <StatusChip status={record.status} label={titleize(record.payload.status)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">No signed traceability export reviews have been retained yet.</div>
      )}
    </section>
  )
}
