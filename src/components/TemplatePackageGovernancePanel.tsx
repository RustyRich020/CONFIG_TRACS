import { Download, Package } from 'lucide-react'
import type {
  BackendRecord,
  CrossIndustryTemplatePackage,
  CrossIndustryTemplatePackageApproval,
  CrossIndustryTemplatePackageApprovalStatus,
  CrossIndustryTemplatePackageDelivery,
} from '../types'

function titleize(value?: string | null) {
  return (value ?? 'unknown')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div className="metadata-card">
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
  icon: typeof Package
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

export function TemplatePackageGovernancePanel({
  approvalRecords,
  deliveryChannel,
  deliveryRecords,
  deliveryRecipients,
  onApprovalRationaleChange,
  onApprovalStatusChange,
  onDeliveryChannelChange,
  onDeliveryRecipientsChange,
  onDownloadLifecycleExport,
  onDownloadPackage,
  onReviewerChange,
  onSaveApproval,
  onSaveDelivery,
  packageApprovalRationale,
  packageApprovalStatus,
  packagePayload,
  packageReviewer,
}: {
  approvalRecords: BackendRecord<CrossIndustryTemplatePackageApproval>[]
  deliveryChannel: CrossIndustryTemplatePackageDelivery['channel']
  deliveryRecords: BackendRecord<CrossIndustryTemplatePackageDelivery>[]
  deliveryRecipients: string
  onApprovalRationaleChange: (value: string) => void
  onApprovalStatusChange: (value: CrossIndustryTemplatePackageApprovalStatus) => void
  onDeliveryChannelChange: (value: CrossIndustryTemplatePackageDelivery['channel']) => void
  onDeliveryRecipientsChange: (value: string) => void
  onDownloadLifecycleExport: () => void
  onDownloadPackage: () => void
  onReviewerChange: (value: string) => void
  onSaveApproval: () => void
  onSaveDelivery: () => void
  packageApprovalRationale: string
  packageApprovalStatus: CrossIndustryTemplatePackageApprovalStatus
  packagePayload: CrossIndustryTemplatePackage
  packageReviewer: string
}) {
  const latestPackageApproval = approvalRecords[0]
  const latestPackageDelivery = deliveryRecords[0]

  return (
    <section className="panel template-package-panel">
      <PanelHeader
        icon={Package}
        title="Cross-Industry Template Package"
        subtitle="Assemble deployable starter evidence from workflow definitions, mappings, connector templates, reports, and active controlled templates."
      />
      <div className="metadata-grid">
        <Metadata label="Industries" value={String(packagePayload.summary.industries)} />
        <Metadata label="Workflows" value={String(packagePayload.summary.workflows)} />
        <Metadata label="Mappings" value={String(packagePayload.summary.mappings)} />
        <Metadata label="Connector templates" value={String(packagePayload.summary.connectorTemplates)} />
        <Metadata label="Report catalog" value={String(packagePayload.summary.reportCatalogItems)} />
        <Metadata label="Active controlled" value={String(packagePayload.summary.activeControlledTemplates)} />
      </div>
      <div className="template-package-actions">
        <p>{packagePayload.evidence}</p>
        <button className="primary-action" onClick={onDownloadPackage} type="button">
          <Download size={15} />
          Download Package
        </button>
      </div>
      <div className="metadata-grid compact">
        <Metadata label="Approvals" value={String(approvalRecords.length)} />
        <Metadata
          label="Latest approval"
          value={latestPackageApproval ? titleize(latestPackageApproval.payload.status) : 'Not reviewed'}
        />
        <Metadata label="Deliveries" value={String(deliveryRecords.length)} />
        <Metadata
          label="Latest delivery"
          value={latestPackageDelivery ? titleize(latestPackageDelivery.payload.channel) : 'Not delivered'}
        />
      </div>
      <div className="form-grid compact-form">
        <label>
          <span>Approval reviewer</span>
          <input value={packageReviewer} onChange={(event) => onReviewerChange(event.target.value)} />
        </label>
        <label>
          <span>Approval status</span>
          <select
            value={packageApprovalStatus}
            onChange={(event) => onApprovalStatusChange(event.target.value as CrossIndustryTemplatePackageApprovalStatus)}
          >
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="approved_with_conditions">Approved with conditions</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
        <label className="wide-field">
          <span>Approval rationale</span>
          <input
            value={packageApprovalRationale}
            onChange={(event) => onApprovalRationaleChange(event.target.value)}
          />
        </label>
        <label>
          <span>Delivery channel</span>
          <select
            value={deliveryChannel}
            onChange={(event) => onDeliveryChannelChange(event.target.value as CrossIndustryTemplatePackageDelivery['channel'])}
          >
            <option value="implementation_handoff">Implementation handoff</option>
            <option value="governance_review">Governance review</option>
            <option value="download">Download</option>
          </select>
        </label>
        <label>
          <span>Delivery recipients</span>
          <input value={deliveryRecipients} onChange={(event) => onDeliveryRecipientsChange(event.target.value)} />
        </label>
      </div>
      <div className="template-package-actions">
        <button className="secondary-action" onClick={onSaveApproval} type="button">
          Save Approval
        </button>
        <button className="secondary-action" onClick={onSaveDelivery} type="button">
          Save Delivery
        </button>
        <button className="secondary-action" onClick={onDownloadLifecycleExport} type="button">
          <Download size={15} />
          Export Lifecycle
        </button>
      </div>
    </section>
  )
}
