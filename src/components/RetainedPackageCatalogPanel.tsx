import { Download } from 'lucide-react'
import type { BackendRecord, StatusLevel, TraceabilityExportRetentionClass, WorkflowInstanceExportRetention } from '../types'

type RetentionLifecycleSummary = {
  total: number
  pass: number
  warning: number
  blocking: number
  records: number
  missingParents: number
}

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

export function RetainedPackageCatalogPanel({
  filteredRecords,
  lifecycleSummary,
  onDownloadSelected,
  onExportComparison,
  onSearchChange,
  onSelectRecord,
  onStatusFilterChange,
  onRetentionFilterChange,
  onWorkflowFilterChange,
  retentionClassFilter,
  records,
  search,
  selectedRecord,
  selectedWorkflowRecords,
  statusFilter,
  workflowFilter,
  workflowTypes,
}: {
  filteredRecords: BackendRecord<WorkflowInstanceExportRetention>[]
  lifecycleSummary: RetentionLifecycleSummary
  onDownloadSelected: () => void
  onExportComparison: () => void
  onSearchChange: (value: string) => void
  onSelectRecord: (recordId: string) => void
  onStatusFilterChange: (status: StatusLevel | 'all') => void
  onRetentionFilterChange: (retentionClass: TraceabilityExportRetentionClass | 'all') => void
  onWorkflowFilterChange: (workflowType: string) => void
  retentionClassFilter: TraceabilityExportRetentionClass | 'all'
  records: BackendRecord<WorkflowInstanceExportRetention>[]
  search: string
  selectedRecord?: BackendRecord<WorkflowInstanceExportRetention>
  selectedWorkflowRecords: BackendRecord<WorkflowInstanceExportRetention>[]
  statusFilter: StatusLevel | 'all'
  workflowFilter: string
  workflowTypes: string[]
}) {
  return (
    <div className="workflow-lineage-panel">
      <div className="workflow-lineage-header">
        <div>
          <strong>Retained Package Catalog</strong>
          <span>Search retained workflow exports and review lifecycle coverage before approval or handoff.</span>
        </div>
        <div className="toolbar-actions">
          <input
            aria-label="Search retained packages"
            placeholder="Search reviewer, workflow, package"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <select
            aria-label="Filter retained package workflow"
            value={workflowFilter}
            onChange={(event) => onWorkflowFilterChange(event.target.value)}
          >
            <option value="all">All workflows</option>
            {workflowTypes.map((workflowType) => (
              <option key={workflowType} value={workflowType}>
                {titleize(workflowType)}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter retained package status"
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value as StatusLevel | 'all')}
          >
            <option value="all">All statuses</option>
            <option value="pass">Pass</option>
            <option value="warning">Warning</option>
            <option value="blocking">Blocking</option>
          </select>
          <select
            aria-label="Filter retained package retention class"
            value={retentionClassFilter}
            onChange={(event) => onRetentionFilterChange(event.target.value as TraceabilityExportRetentionClass | 'all')}
          >
            <option value="all">All retention</option>
            <option value="standard_7_year">Standard 7 year</option>
            <option value="project_lifetime">Project lifetime</option>
            <option value="legal_hold">Legal hold</option>
          </select>
        </div>
      </div>
      <div className="metadata-grid compact">
        <Metadata label="Retained packages" value={String(lifecycleSummary.total)} />
        <Metadata label="Pass" value={String(lifecycleSummary.pass)} />
        <Metadata label="Warning" value={String(lifecycleSummary.warning)} />
        <Metadata label="Blocking" value={String(lifecycleSummary.blocking)} />
        <Metadata label="Covered records" value={String(lifecycleSummary.records)} />
        <Metadata label="Missing parents" value={String(lifecycleSummary.missingParents)} />
      </div>
      {filteredRecords.length > 0 ? (
        <div className="backend-record-list">
          {filteredRecords.slice(0, 8).map((record) => (
            <button
              className={
                selectedRecord?.id === record.id
                  ? 'backend-record-row retained-package-row active'
                  : 'backend-record-row retained-package-row'
              }
              key={record.id}
              onClick={() => onSelectRecord(record.id)}
              type="button"
            >
              <div>
                <strong>{record.payload.workflowLabel}</strong>
                <span>
                  {record.payload.reviewer} / {record.payload.coverage.records} retained record(s) / {record.payload.retention.evidence}
                </span>
              </div>
              <div className="queue-record-side">
                <StatusChip status={record.status} label={titleize(record.status)} />
                <span>{new Date(record.payload.retainedAt).toLocaleString()}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state compact">No retained workflow export packages match the current filters.</div>
      )}
      {selectedRecord ? (
        <div className="workflow-retention-detail">
          <div className="metadata-grid compact">
            <Metadata label="Package ID" value={selectedRecord.payload.packageId} />
            <Metadata label="Reviewer" value={selectedRecord.payload.reviewer} />
            <Metadata label="Retention" value={titleize(selectedRecord.payload.retention.class)} />
            <Metadata
              label="Retain until"
              value={
                selectedRecord.payload.retention.retainUntil === 'indefinite'
                  ? 'Indefinite'
                  : new Date(selectedRecord.payload.retention.retainUntil).toLocaleDateString()
              }
            />
            <Metadata label="Lineage stages" value={String(selectedRecord.payload.coverage.stages)} />
            <Metadata label="Audit events" value={String(selectedRecord.payload.auditHistory.length)} />
            <Metadata label="Workflow retained" value={String(selectedWorkflowRecords.length)} />
            <Metadata
              label="Comparable records"
              value={String(selectedWorkflowRecords.reduce((total, record) => total + record.payload.coverage.records, 0))}
            />
          </div>
          <div className="backend-record-row">
            <div>
              <strong>Retention evidence</strong>
              <span>{selectedRecord.payload.evidence}</span>
              <small>{selectedRecord.payload.auditHistory[0]?.summary ?? 'No audit summary recorded.'}</small>
            </div>
            <button
              className="secondary-action compact"
              disabled={records.length === 0}
              onClick={onDownloadSelected}
              type="button"
            >
              <Download size={14} />
              Download Evidence
            </button>
            <button
              className="secondary-action compact"
              disabled={selectedWorkflowRecords.length < 2}
              onClick={onExportComparison}
              type="button"
            >
              <Download size={14} />
              Export Comparison
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
