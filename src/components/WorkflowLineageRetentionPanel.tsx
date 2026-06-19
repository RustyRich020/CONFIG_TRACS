import type { GovernanceWorkflowInstance } from '../governanceWorkflow'
import type {
  BackendRecord,
  TraceabilityExportRetentionClass,
  WorkflowInstanceExportRetention,
} from '../types'

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div className="metadata-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export function WorkflowLineageRetentionPanel({
  instance,
  instanceCount,
  missingParentReferenceCount,
  onExport,
  onRetain,
  retentionClass,
  retentionRecords,
  reviewer,
  setRetentionClass,
  setReviewer,
}: {
  instance?: GovernanceWorkflowInstance
  instanceCount: number
  missingParentReferenceCount: number
  onExport: () => void
  onRetain: () => void
  retentionClass: TraceabilityExportRetentionClass
  retentionRecords: BackendRecord<WorkflowInstanceExportRetention>[]
  reviewer: string
  setRetentionClass: (retentionClass: TraceabilityExportRetentionClass) => void
  setReviewer: (reviewer: string) => void
}) {
  const latestRetention = retentionRecords[0]

  return (
    <div className="workflow-lineage-panel">
      <div className="workflow-lineage-header">
        <div>
          <strong>Workflow Instance Lineage</strong>
          <span>
            {instanceCount} workflow instance(s), {missingParentReferenceCount} missing parent reference(s).
          </span>
        </div>
        <button
          className="secondary-action compact"
          disabled={!instance}
          onClick={onExport}
          type="button"
        >
          Export instance
        </button>
        <button
          className="primary-action compact"
          disabled={!instance}
          onClick={onRetain}
          type="button"
        >
          Retain export
        </button>
      </div>
      {instance ? (
        <>
          <div className="metadata-grid compact">
            <Metadata label="Selected instance" value={instance.workflowLabel} />
            <Metadata label="Owner" value={instance.owner} />
            <Metadata label="Records" value={String(instance.nodes.length)} />
            <Metadata
              label="Missing parents"
              value={instance.missingParentRecordIds.length > 0 ? instance.missingParentRecordIds.join(', ') : 'None'}
            />
            <Metadata label="Retained exports" value={String(retentionRecords.length)} />
            <Metadata
              label="Latest retention"
              value={latestRetention ? new Date(latestRetention.payload.retainedAt).toLocaleString() : 'Not retained'}
            />
          </div>
          <div className="form-grid compact-form">
            <label>
              <span>Retention reviewer</span>
              <input value={reviewer} onChange={(event) => setReviewer(event.target.value)} />
            </label>
            <label>
              <span>Retention class</span>
              <select
                value={retentionClass}
                onChange={(event) => setRetentionClass(event.target.value as TraceabilityExportRetentionClass)}
              >
                <option value="standard_7_year">Standard 7 year</option>
                <option value="project_lifetime">Project lifetime</option>
                <option value="legal_hold">Legal hold</option>
              </select>
            </label>
          </div>
          <div className="workflow-lineage-path">
            {instance.nodes.map((node) => (
              <div className="workflow-lineage-node" key={node.item.record.id}>
                <span>{node.item.stageLabel}</span>
                <strong>{node.item.record.label}</strong>
                <small>
                  {node.parentRecordId ? `Parent ${node.parentRecordId}` : 'Root record'} / {node.childRecordIds.length} child link(s)
                </small>
                {node.missingParent ? <em>Missing parent record</em> : null}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state compact">
          Workflow lineage appears after records with workflow metadata or governance kinds are stored.
        </div>
      )}
    </div>
  )
}
