import {
Package,
Route,
ScrollText
} from 'lucide-react'
import { PanelHeader } from '../components/common'
import { titleize } from '../components/formatters'
import {
getFamilyStatus
} from '../foundation'
import type {
AppConfig,
AuditEvent
} from '../types'
export function ObjectFamiliesPanel({
  activeFamilies,
  config,
}: {
  activeFamilies: string[]
  config: AppConfig
}) {
  return (
    <section className="panel object-panel">
      <PanelHeader
        icon={Route}
        title="Object Families"
        subtitle="Canonical coverage derived from active solution domains."
      />
      <div className="object-table" role="table" aria-label="Object families">
        <div className="table-row table-head" role="row">
          <span>Family</span>
          <span>Objects</span>
          <span>Status</span>
          <span>Coverage</span>
        </div>
        {Object.entries(config.objectFamilies).map(([key, family]) => {
          const familyStatus = getFamilyStatus(key, family, activeFamilies)
          return (
            <div className="table-row" role="row" key={key}>
              <strong>{titleize(key)}</strong>
              <span>{family.objects.slice(0, 3).join(', ')}</span>
              <span className={familyStatus.status === 'Active' ? 'chip active' : 'chip'}>
                {familyStatus.status}
              </span>
              <span>{familyStatus.detail}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function AuditPanel({ auditEvents }: { auditEvents: AuditEvent[] }) {
  return (
    <section className="panel audit-panel">
      <PanelHeader
        icon={ScrollText}
        title="Audit Skeleton"
        subtitle="Local event stream for config actions in this phase."
      />
      <div className="audit-list">
        {auditEvents.map((event) => (
          <div className="audit-row" key={event.id}>
            <Package size={15} />
            <div>
              <strong>{event.summary}</strong>
              <span>
                {event.area} / {event.action} / {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

