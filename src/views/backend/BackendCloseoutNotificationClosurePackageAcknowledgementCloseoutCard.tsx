import { ClipboardCheck } from 'lucide-react'
import { Metadata, StatusChip } from '../../components/common'
import type { ClosureSlaResponseFollowUpClosureStatus } from '../../types'

type RuntimeValue = ReturnType<typeof JSON.parse>

type CloseoutNotificationClosurePackageAcknowledgementCloseoutPropKey =
  | 'closeoutNotificationClosurePackageAckClosureActions'
  | 'closeoutNotificationClosurePackageAckClosureNotes'
  | 'closeoutNotificationClosurePackageAckClosureReviewer'
  | 'closeoutNotificationClosurePackageAckClosureStatus'
  | 'closeoutNotificationClosurePackageAckSupersededEvidence'
  | 'closeoutNotificationClosurePackageAcknowledgementClosureRequest'
  | 'closeoutNotificationClosurePackageAcknowledgementClosureStatus'
  | 'closeoutNotificationClosurePackageAcknowledgementMetrics'
  | 'closeoutNotificationClosurePackageAcknowledgementSupersededEvidenceList'
  | 'closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords'
  | 'closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementRecords'
  | 'closureSlaFollowUpClosureLabel'
  | 'closureSlaFollowUpClosureStatusLevel'
  | 'latestCloseoutNotificationClosurePackageAcknowledgementClosure'
  | 'onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosure'
  | 'setCloseoutNotificationClosurePackageAckClosureActions'
  | 'setCloseoutNotificationClosurePackageAckClosureNotes'
  | 'setCloseoutNotificationClosurePackageAckClosureReviewer'
  | 'setCloseoutNotificationClosurePackageAckClosureStatus'
  | 'setCloseoutNotificationClosurePackageAckSupersededEvidence'

type BackendCloseoutNotificationClosurePackageAcknowledgementCloseoutCardProps = {
  closeoutExports: Record<CloseoutNotificationClosurePackageAcknowledgementCloseoutPropKey, RuntimeValue>
}

export function BackendCloseoutNotificationClosurePackageAcknowledgementCloseoutCard({
  closeoutExports,
}: BackendCloseoutNotificationClosurePackageAcknowledgementCloseoutCardProps) {
  const {
    closeoutNotificationClosurePackageAckClosureActions,
    closeoutNotificationClosurePackageAckClosureNotes,
    closeoutNotificationClosurePackageAckClosureReviewer,
    closeoutNotificationClosurePackageAckClosureStatus,
    closeoutNotificationClosurePackageAckSupersededEvidence,
    closeoutNotificationClosurePackageAcknowledgementClosureRequest,
    closeoutNotificationClosurePackageAcknowledgementClosureStatus,
    closeoutNotificationClosurePackageAcknowledgementMetrics,
    closeoutNotificationClosurePackageAcknowledgementSupersededEvidenceList,
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords,
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementRecords,
    closureSlaFollowUpClosureLabel,
    closureSlaFollowUpClosureStatusLevel,
    latestCloseoutNotificationClosurePackageAcknowledgementClosure,
    onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosure,
    setCloseoutNotificationClosurePackageAckClosureActions,
    setCloseoutNotificationClosurePackageAckClosureNotes,
    setCloseoutNotificationClosurePackageAckClosureReviewer,
    setCloseoutNotificationClosurePackageAckClosureStatus,
    setCloseoutNotificationClosurePackageAckSupersededEvidence,
  } = closeoutExports

  return (
                    <div className="retry-aging-list">
                      <div className="dashboard-heading">
                        <h4>Closeout acknowledgement closure package acknowledgement closeout</h4>
                        <StatusChip
                          status={closureSlaFollowUpClosureStatusLevel(
                            closeoutNotificationClosurePackageAckClosureStatus,
                          )}
                          label={closureSlaFollowUpClosureLabel(closeoutNotificationClosurePackageAckClosureStatus)}
                        />
                      </div>
                      <div className="trace-review-grid">
                        <label>
                          <span>Closeout reviewer</span>
                          <input
                            value={closeoutNotificationClosurePackageAckClosureReviewer}
                            onChange={(event) =>
                              setCloseoutNotificationClosurePackageAckClosureReviewer(event.target.value)
                            }
                          />
                        </label>
                        <label>
                          <span>Closeout disposition</span>
                          <select
                            value={closeoutNotificationClosurePackageAckClosureStatus}
                            onChange={(event) =>
                              setCloseoutNotificationClosurePackageAckClosureStatus(
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
                          <span>Retained closeout actions</span>
                          <textarea
                            value={closeoutNotificationClosurePackageAckClosureActions}
                            onChange={(event) =>
                              setCloseoutNotificationClosurePackageAckClosureActions(event.target.value)
                            }
                          />
                        </label>
                        <label className="trace-review-rationale">
                          <span>Closeout notes</span>
                          <textarea
                            value={closeoutNotificationClosurePackageAckClosureNotes}
                            onChange={(event) =>
                              setCloseoutNotificationClosurePackageAckClosureNotes(event.target.value)
                            }
                          />
                        </label>
                        <label className="trace-review-rationale">
                          <span>Superseded acknowledgement evidence</span>
                          <textarea
                            value={closeoutNotificationClosurePackageAckSupersededEvidence}
                            onChange={(event) =>
                              setCloseoutNotificationClosurePackageAckSupersededEvidence(event.target.value)
                            }
                          />
                        </label>
                      </div>
                      <div className="toolbar-actions notification-approval-actions">
                        <button
                          className="primary-action"
                          disabled={
                            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementRecords.length ===
                            0
                          }
                          onClick={() =>
                            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosure(
                              closeoutNotificationClosurePackageAcknowledgementClosureRequest(),
                            )
                          }
                          type="button"
                        >
                          <ClipboardCheck size={15} />
                          Save Acknowledgement Closeout
                        </button>
                      </div>
                      <div className="metadata-grid">
                        <Metadata
                          label="Closeout records"
                          value={String(
                            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords.length,
                          )}
                        />
                        <Metadata
                          label="Acknowledgements"
                          value={String(
                            closeoutNotificationClosurePackageAcknowledgementMetrics.totalAcknowledgements,
                          )}
                        />
                        <Metadata
                          label="Closure ready"
                          value={String(closeoutNotificationClosurePackageAcknowledgementMetrics.closureReady)}
                        />
                        <Metadata
                          label="Retained actions"
                          value={String(closeoutNotificationClosurePackageAcknowledgementMetrics.retainedActions)}
                        />
                        <Metadata
                          label="Closeout status"
                          value={closeoutNotificationClosurePackageAcknowledgementClosureStatus}
                        />
                        <Metadata
                          label="Superseded notes"
                          value={String(
                            closeoutNotificationClosurePackageAcknowledgementSupersededEvidenceList().length,
                          )}
                        />
                      </div>
                      {latestCloseoutNotificationClosurePackageAcknowledgementClosure ? (
                        <div className="connector-run-row">
                          <div>
                            <strong>
                              {latestCloseoutNotificationClosurePackageAcknowledgementClosure.payload.reviewer}
                            </strong>
                            <span>
                              v{latestCloseoutNotificationClosurePackageAcknowledgementClosure.version} / {closureSlaFollowUpClosureLabel(latestCloseoutNotificationClosurePackageAcknowledgementClosure.payload.status)} / {new Date(latestCloseoutNotificationClosurePackageAcknowledgementClosure.createdAt).toLocaleString()}
                            </span>
                            <small>{latestCloseoutNotificationClosurePackageAcknowledgementClosure.payload.evidence}</small>
                          </div>
                          <StatusChip
                            status={latestCloseoutNotificationClosurePackageAcknowledgementClosure.status}
                            label={closureSlaFollowUpClosureLabel(
                              latestCloseoutNotificationClosurePackageAcknowledgementClosure.payload.status,
                            )}
                          />
                        </div>
                      ) : (
                        <div className="empty-state compact">No closeout acknowledgement closure package acknowledgement closeout has been retained yet.</div>
                      )}
                    </div>
  )
}
