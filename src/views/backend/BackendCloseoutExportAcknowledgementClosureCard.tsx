import { ClipboardCheck } from 'lucide-react'
import { Metadata, StatusChip } from '../../components/common'
import type { ClosureSlaResponseFollowUpClosureStatus } from '../../types'

type RuntimeValue = ReturnType<typeof JSON.parse>

type CloseoutExportAcknowledgementClosurePropKey =
  | 'closeoutExportAckClosureActions'
  | 'closeoutExportAckClosureNotes'
  | 'closeoutExportAckClosureReviewer'
  | 'closeoutExportAckClosureStatus'
  | 'closeoutExportAckSupersededEvidence'
  | 'closeoutExportAcknowledgementClosureRequest'
  | 'closeoutExportAcknowledgementClosureStatus'
  | 'closeoutExportAcknowledgementMetrics'
  | 'closeoutExportAcknowledgementSupersededEvidenceList'
  | 'closurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosureRecords'
  | 'closurePackageAcknowledgementCloseoutExportPackageAcknowledgementRecords'
  | 'closureSlaFollowUpClosureLabel'
  | 'closureSlaFollowUpClosureStatusLevel'
  | 'latestCloseoutExportAcknowledgementClosure'
  | 'onSaveClosurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosure'
  | 'setCloseoutExportAckClosureActions'
  | 'setCloseoutExportAckClosureNotes'
  | 'setCloseoutExportAckClosureReviewer'
  | 'setCloseoutExportAckClosureStatus'
  | 'setCloseoutExportAckSupersededEvidence'

type BackendCloseoutExportAcknowledgementClosureCardProps = {
  closeoutExports: Record<CloseoutExportAcknowledgementClosurePropKey, RuntimeValue>
}

export function BackendCloseoutExportAcknowledgementClosureCard({
  closeoutExports,
}: BackendCloseoutExportAcknowledgementClosureCardProps) {
  const {
    closeoutExportAckClosureActions,
    closeoutExportAckClosureNotes,
    closeoutExportAckClosureReviewer,
    closeoutExportAckClosureStatus,
    closeoutExportAckSupersededEvidence,
    closeoutExportAcknowledgementClosureRequest,
    closeoutExportAcknowledgementClosureStatus,
    closeoutExportAcknowledgementMetrics,
    closeoutExportAcknowledgementSupersededEvidenceList,
    closurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosureRecords,
    closurePackageAcknowledgementCloseoutExportPackageAcknowledgementRecords,
    closureSlaFollowUpClosureLabel,
    closureSlaFollowUpClosureStatusLevel,
    latestCloseoutExportAcknowledgementClosure,
    onSaveClosurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosure,
    setCloseoutExportAckClosureActions,
    setCloseoutExportAckClosureNotes,
    setCloseoutExportAckClosureReviewer,
    setCloseoutExportAckClosureStatus,
    setCloseoutExportAckSupersededEvidence,
  } = closeoutExports

  return (
                  <div className="retry-aging-list">
                    <div className="dashboard-heading">
                      <h4>Closeout export acknowledgement closure</h4>
                      <StatusChip
                        status={closureSlaFollowUpClosureStatusLevel(closeoutExportAckClosureStatus)}
                        label={closureSlaFollowUpClosureLabel(closeoutExportAckClosureStatus)}
                      />
                    </div>
                    <div className="trace-review-grid">
                      <label>
                        <span>Closure reviewer</span>
                        <input
                          value={closeoutExportAckClosureReviewer}
                          onChange={(event) => setCloseoutExportAckClosureReviewer(event.target.value)}
                        />
                      </label>
                      <label>
                        <span>Closure disposition</span>
                        <select
                          value={closeoutExportAckClosureStatus}
                          onChange={(event) =>
                            setCloseoutExportAckClosureStatus(
                              event.target.value as ClosureSlaResponseFollowUpClosureStatus,
                            )
                          }
                        >
                          <option value="closed">Closed</option>
                          <option value="closed_with_actions">Closed with actions</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </label>
                      <label className="trace-review-rationale">
                        <span>Retained closure actions</span>
                        <textarea
                          value={closeoutExportAckClosureActions}
                          onChange={(event) => setCloseoutExportAckClosureActions(event.target.value)}
                        />
                      </label>
                      <label className="trace-review-rationale">
                        <span>Closure notes</span>
                        <textarea
                          value={closeoutExportAckClosureNotes}
                          onChange={(event) => setCloseoutExportAckClosureNotes(event.target.value)}
                        />
                      </label>
                      <label className="trace-review-rationale">
                        <span>Superseded acknowledgement evidence</span>
                        <textarea
                          value={closeoutExportAckSupersededEvidence}
                          onChange={(event) => setCloseoutExportAckSupersededEvidence(event.target.value)}
                        />
                      </label>
                    </div>
                    <div className="toolbar-actions notification-approval-actions">
                      <button
                        className="primary-action"
                        disabled={closurePackageAcknowledgementCloseoutExportPackageAcknowledgementRecords.length === 0}
                        onClick={() =>
                          onSaveClosurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosure(
                            closeoutExportAcknowledgementClosureRequest(),
                          )
                        }
                        type="button"
                      >
                        <ClipboardCheck size={15} />
                        Save Closeout Ack Closure
                      </button>
                    </div>
                    <div className="metadata-grid">
                      <Metadata
                        label="Closure records"
                        value={String(closurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosureRecords.length)}
                      />
                      <Metadata
                        label="Acknowledgements"
                        value={String(closeoutExportAcknowledgementMetrics.totalAcknowledgements)}
                      />
                      <Metadata
                        label="Closeout ready"
                        value={String(closeoutExportAcknowledgementMetrics.closeoutReady)}
                      />
                      <Metadata
                        label="Retained actions"
                        value={String(closeoutExportAcknowledgementMetrics.retainedActions)}
                      />
                      <Metadata
                        label="Closure status"
                        value={closeoutExportAcknowledgementClosureStatus}
                      />
                      <Metadata
                        label="Superseded notes"
                        value={String(closeoutExportAcknowledgementSupersededEvidenceList().length)}
                      />
                    </div>
                    {latestCloseoutExportAcknowledgementClosure ? (
                      <div className="connector-run-row">
                        <div>
                          <strong>{latestCloseoutExportAcknowledgementClosure.payload.reviewer}</strong>
                          <span>
                            v{latestCloseoutExportAcknowledgementClosure.version} / {closureSlaFollowUpClosureLabel(latestCloseoutExportAcknowledgementClosure.payload.status)} / {new Date(latestCloseoutExportAcknowledgementClosure.createdAt).toLocaleString()}
                          </span>
                          <small>{latestCloseoutExportAcknowledgementClosure.payload.evidence}</small>
                        </div>
                        <StatusChip
                          status={latestCloseoutExportAcknowledgementClosure.status}
                          label={closureSlaFollowUpClosureLabel(latestCloseoutExportAcknowledgementClosure.payload.status)}
                        />
                      </div>
                    ) : (
                      <div className="empty-state compact">No closeout export package acknowledgement closure has been retained yet.</div>
                    )}
                  </div>
  )
}
