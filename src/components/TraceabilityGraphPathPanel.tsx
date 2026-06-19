import { GitBranch, Route } from 'lucide-react'
import type { CanonicalLoadResult, CanonicalObject, QualityEvent, TraceabilityLink } from '../types'
import { Metadata, PanelHeader, StatusChip } from './common'
import { titleize } from './formatters'

export function TraceabilityGraphPathPanel({
  canonicalById,
  evidencePacketCount,
  filteredLinks,
  graphNodeCount,
  latestCanonicalLoad,
  relationshipSummary,
  selectedEvent,
  validationGapCount,
  workflowLineageCount,
}: {
  canonicalById: Map<string, CanonicalObject>
  evidencePacketCount: number
  filteredLinks: TraceabilityLink[]
  graphNodeCount: number
  latestCanonicalLoad?: { payload: CanonicalLoadResult }
  relationshipSummary: Record<string, number>
  selectedEvent?: QualityEvent
  validationGapCount: number
  workflowLineageCount: number
}) {
  return (
    <>
      <section className="panel trace-graph-panel">
        <PanelHeader
          icon={GitBranch}
          title="Filtered Traceability Graph"
          subtitle="Graph-style node and edge inventory derived from the selected event and active filters."
        />
        <div className="trace-graph-canvas">
          <div className="trace-graph-node source">
            <strong>{selectedEvent?.canonical.event_id ?? 'No event'}</strong>
            <span>quality_event / quality</span>
          </div>
          <div className="trace-graph-edges">
            {filteredLinks.map((link) => {
              const object = canonicalById.get(link.targetObjectId)
              return (
                <div className="trace-graph-edge" key={link.id}>
                  <span>{titleize(link.relationshipType)}</span>
                  <div className="trace-line" />
                  <div className="trace-graph-node">
                    <strong>{link.targetLabel}</strong>
                    <span>{titleize(object?.family ?? link.targetObjectType)} / {titleize(link.targetObjectType)}</span>
                  </div>
                </div>
              )
            })}
            {filteredLinks.length === 0 ? (
              <div className="empty-state compact">No graph edges match the active filters.</div>
            ) : null}
          </div>
        </div>
        <div className="trace-path-summary">
          <Metadata label="Graph nodes" value={String(graphNodeCount)} />
          <Metadata label="Graph edges" value={String(filteredLinks.length)} />
          <Metadata label="Evidence packets" value={String(evidencePacketCount)} />
          <Metadata
            label="Latest load"
            value={latestCanonicalLoad ? `${latestCanonicalLoad.payload.objectCount} objects / ${latestCanonicalLoad.payload.linkCount} links` : 'No load'}
          />
          <Metadata label="Validation gaps" value={String(validationGapCount)} />
          <Metadata label="Workflow lineage" value={`${workflowLineageCount} instance(s)`} />
        </div>
      </section>

      <section className="panel trace-path-panel">
        <PanelHeader
          icon={Route}
          title="Path Explorer"
          subtitle="Readable event-to-object paths for audit, impact analysis, and cross-system evidence review."
        />
        <div className="trace-path-summary">
          <Metadata label="Paths" value={String(filteredLinks.length)} />
          <Metadata label="Target types" value={String(Object.keys(relationshipSummary).length)} />
          <Metadata
            label="Coverage"
            value={
              Object.entries(relationshipSummary)
                .map(([type, count]) => `${titleize(type)} ${count}`)
                .join(', ') || 'No links'
            }
          />
        </div>
        <div className="trace-path-list">
          {filteredLinks.map((link, index) => (
            <div className="trace-path-row" key={link.id}>
              <div className="trace-step source">
                <strong>{selectedEvent?.canonical.event_id}</strong>
                <span>quality_event</span>
              </div>
              <Route size={16} />
              <div className="trace-step">
                <strong>{titleize(link.relationshipType)}</strong>
                <span>Path {index + 1}</span>
              </div>
              <Route size={16} />
              <div className="trace-step target">
                <strong>{link.targetLabel}</strong>
                <span>{titleize(link.targetObjectType)}</span>
              </div>
              <StatusChip status={link.status} label={link.status} />
              <p>{link.evidence}</p>
            </div>
          ))}
          {filteredLinks.length === 0 ? (
            <div className="empty-state compact">No traceability paths are available for this event.</div>
          ) : null}
        </div>
      </section>
    </>
  )
}
