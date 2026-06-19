import { Bell, ClipboardCheck, Download, Search } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type {
  BackendRecord,
  ReadinessEvidencePacket,
  StatusLevel,
  TraceabilityExportRetentionClass,
  TraceabilityExportReview,
  TraceabilityExportReviewStatus,
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

function PanelHeader({
  icon: Icon,
  subtitle,
  title,
}: {
  icon: LucideIcon
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

export function TraceabilityExportControlsPanel({
  deliveryCount,
  evidencePackets,
  familyFilter,
  familyOptions,
  onDeliverGraph,
  onExportGraph,
  onFamilyFilterChange,
  onPacketFilterChange,
  onRecipientsChange,
  onRetentionClassChange,
  onReviewRationaleChange,
  onReviewStatusChange,
  onReviewerChange,
  onStatusFilterChange,
  openDeliveryCount,
  packetFilter,
  recipients,
  retentionClass,
  retentionLabel,
  reviewRationale,
  reviewer,
  reviewRecords,
  reviewStatus,
  statusFilter,
}: {
  deliveryCount: number
  evidencePackets: BackendRecord<ReadinessEvidencePacket>[]
  familyFilter: string
  familyOptions: string[]
  onDeliverGraph: () => void
  onExportGraph: () => void
  onFamilyFilterChange: (value: string) => void
  onPacketFilterChange: (value: string) => void
  onRecipientsChange: (value: string) => void
  onRetentionClassChange: (value: TraceabilityExportRetentionClass) => void
  onReviewRationaleChange: (value: string) => void
  onReviewStatusChange: (value: TraceabilityExportReviewStatus) => void
  onReviewerChange: (value: string) => void
  onStatusFilterChange: (value: StatusLevel | 'all') => void
  openDeliveryCount: number
  packetFilter: string
  recipients: string
  retentionClass: TraceabilityExportRetentionClass
  retentionLabel: string
  reviewRationale: string
  reviewer: string
  reviewRecords: BackendRecord<TraceabilityExportReview>[]
  reviewStatus: TraceabilityExportReviewStatus
  statusFilter: StatusLevel | 'all'
}) {
  return (
    <>
      <section className="panel trace-filter-panel">
        <PanelHeader
          icon={Search}
          title="Traceability Filters"
          subtitle="Filter paths and graph nodes by object family, link status, and saved evidence packet coverage."
        />
        <div className="trace-filter-grid">
          <label>
            <span>Object family</span>
            <select value={familyFilter} onChange={(event) => onFamilyFilterChange(event.target.value)}>
              <option value="all">All families</option>
              {familyOptions.map((family) => (
                <option key={family} value={family}>
                  {titleize(family)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Link status</span>
            <select
              value={statusFilter}
              onChange={(event) => onStatusFilterChange(event.target.value as StatusLevel | 'all')}
            >
              <option value="all">All statuses</option>
              <option value="pass">Pass</option>
              <option value="warning">Warning</option>
              <option value="blocking">Blocking</option>
            </select>
          </label>
          <label>
            <span>Evidence packet</span>
            <select value={packetFilter} onChange={(event) => onPacketFilterChange(event.target.value)}>
              <option value="all">All packets</option>
              {evidencePackets.map((record) => (
                <option key={record.id} value={record.id}>
                  v{record.version} / {new Date(record.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="panel trace-review-panel">
        <PanelHeader
          icon={ClipboardCheck}
          title="Export Review & Retention"
          subtitle="Sign traceability graph exports and retain reviewer evidence as versioned backend records."
        />
        <div className="trace-review-grid">
          <label>
            <span>Reviewer</span>
            <input value={reviewer} onChange={(event) => onReviewerChange(event.target.value)} />
          </label>
          <label>
            <span>Review status</span>
            <select
              value={reviewStatus}
              onChange={(event) => onReviewStatusChange(event.target.value as TraceabilityExportReviewStatus)}
            >
              <option value="approved">Approved</option>
              <option value="approved_with_conditions">Approved with conditions</option>
              <option value="draft">Draft</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          <label>
            <span>Retention</span>
            <select
              value={retentionClass}
              onChange={(event) => onRetentionClassChange(event.target.value as TraceabilityExportRetentionClass)}
            >
              <option value="standard_7_year">Standard 7 year</option>
              <option value="project_lifetime">Project lifetime</option>
              <option value="legal_hold">Legal hold</option>
            </select>
          </label>
          <label className="trace-review-rationale">
            <span>Rationale</span>
            <textarea value={reviewRationale} onChange={(event) => onReviewRationaleChange(event.target.value)} />
          </label>
          <label className="trace-review-rationale">
            <span>Reviewer recipients</span>
            <input value={recipients} onChange={(event) => onRecipientsChange(event.target.value)} />
          </label>
        </div>
        <div className="trace-path-summary">
          <Metadata label="Review records" value={String(reviewRecords.length)} />
          <Metadata label="Current status" value={titleize(reviewStatus)} />
          <Metadata label="Retention rule" value={retentionLabel} />
          <Metadata label="Deliveries" value={String(deliveryCount)} />
          <Metadata label="Open responses" value={String(openDeliveryCount)} />
        </div>
        <div className="template-package-actions command-row">
          <button className="secondary-action" onClick={onExportGraph} type="button">
            <Download size={15} />
            Export Graph Package
          </button>
          <button className="primary-action" onClick={onDeliverGraph} type="button">
            <Bell size={15} />
            Deliver to Reviewers
          </button>
        </div>
      </section>
    </>
  )
}
