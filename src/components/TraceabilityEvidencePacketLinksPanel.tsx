import { Bell, ClipboardCheck, Download } from 'lucide-react'
import type { BackendRecord, ReadinessEvidencePacket } from '../types'
import { PanelHeader, StatusChip } from './common'

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
