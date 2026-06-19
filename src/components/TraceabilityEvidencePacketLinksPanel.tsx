import { Bell, ClipboardCheck, Download } from 'lucide-react'
import type { BackendRecord, ReadinessEvidencePacket, StatusLevel } from '../types'

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

export function TraceabilityEvidencePacketLinksPanel({
  evidencePackets,
  onDeliverGraph,
  onExportGraph,
}: {
  evidencePackets: BackendRecord<ReadinessEvidencePacket>[]
  onDeliverGraph: (record: BackendRecord<ReadinessEvidencePacket>) => void
  onExportGraph: (record: BackendRecord<ReadinessEvidencePacket>) => void
}) {
  return (
    <section className="panel trace-evidence-panel">
      <PanelHeader
        icon={ClipboardCheck}
        title="Persisted Evidence Packet Links"
        subtitle="Saved readiness packets that include canonical-load evidence with traceability links."
      />
      {evidencePackets.length > 0 ? (
        <div className="mapping-run-history">
          {evidencePackets.slice(0, 5).map((record) => (
            <div className="mapping-run-row" key={record.id}>
              <div>
                <strong>{record.label}</strong>
                <span>
                  v{record.version} / {new Date(record.createdAt).toLocaleString()} / {record.payload.summary.canonicalLoads} canonical load(s)
                </span>
                <small>
                  {record.payload.canonicalLoads
                    .map((load) => `${load.payload.sourceConnector}: ${load.payload.linkCount} link(s)`)
                    .join(' / ')}
                </small>
              </div>
              <div className="toolbar-actions">
                <button className="secondary-action compact" onClick={() => onExportGraph(record)} type="button">
                  <Download size={14} />
                  Export
                </button>
                <button className="secondary-action compact" onClick={() => onDeliverGraph(record)} type="button">
                  <Bell size={14} />
                  Deliver
                </button>
                <StatusChip status={record.status} label={record.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">No saved evidence packets include traceability-link evidence yet.</div>
      )}
    </section>
  )
}
