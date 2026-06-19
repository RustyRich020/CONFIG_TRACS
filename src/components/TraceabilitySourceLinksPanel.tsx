import { Route, ShieldCheck } from 'lucide-react'
import type { QualityEvent, StatusLevel, TraceabilityLink } from '../types'

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
  icon: typeof ShieldCheck
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

export function TraceabilitySourceLinksPanel({
  filteredLinks,
  selectedEvent,
  selectedLinkCount,
}: {
  filteredLinks: TraceabilityLink[]
  selectedEvent?: QualityEvent
  selectedLinkCount: number
}) {
  return (
    <section className="traceability-grid">
      <section className="panel trace-source-panel">
        <PanelHeader
          icon={ShieldCheck}
          title="Source Event"
          subtitle={selectedEvent ? selectedEvent.displayName : 'No source event selected.'}
        />
        {selectedEvent ? (
          <div className="workflow-detail">
            <div className="trace-node source">
              <strong>{selectedEvent.canonical.event_id}</strong>
              <span>{selectedEvent.canonical.narrative}</span>
            </div>
            <div className="metadata-grid">
              <Metadata label="Product" value={selectedEvent.canonical.product_code} />
              <Metadata label="Lot" value={selectedEvent.canonical.lot_number} />
              <Metadata label="Serial" value={selectedEvent.canonical.serial_number} />
              <Metadata label="Status" value={titleize(selectedEvent.canonical.status)} />
            </div>
          </div>
        ) : (
          <div className="empty-state compact">No event selected.</div>
        )}
      </section>

      <section className="panel trace-links-panel">
        <PanelHeader
          icon={Route}
          title="Linked Objects"
          subtitle={`${filteredLinks.length} of ${selectedLinkCount} relationship(s) shown after filters.`}
        />
        <div className="trace-node-list">
          {filteredLinks.map((link) => (
            <div className="trace-link-card" key={link.id}>
              <div className="trace-line" />
              <div className="trace-node">
                <strong>{link.targetLabel}</strong>
                <span>{titleize(link.targetObjectType)} / {titleize(link.relationshipType)}</span>
              </div>
              <p>{link.evidence}</p>
              <StatusChip status={link.status} label={link.status} />
            </div>
          ))}
          {filteredLinks.length === 0 ? (
            <div className="empty-state compact">No linked objects match the active filters.</div>
          ) : null}
        </div>
      </section>
    </section>
  )
}
