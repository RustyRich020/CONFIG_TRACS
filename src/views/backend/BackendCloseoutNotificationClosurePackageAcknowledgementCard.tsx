import { ClipboardCheck } from 'lucide-react'
import { Metadata, StatusChip } from '../../components/common'
import type {
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement,
ClosureSlaDeliveryAcknowledgementStatus,
} from '../../types'

type RuntimeValue = ReturnType<typeof JSON.parse>

type BackendCloseoutNotificationClosurePackageAcknowledgementCardKey =
  | 'closeoutNotificationClosurePackageAckActions'
  | 'closeoutNotificationClosurePackageAckNotes'
  | 'closeoutNotificationClosurePackageAckReviewer'
  | 'closeoutNotificationClosurePackageAckReviewerRole'
  | 'closeoutNotificationClosurePackageAckStatus'
  | 'closeoutNotificationClosurePackageAcknowledgedDeliveryIds'
  | 'closeoutNotificationClosurePackageAcknowledgementActionList'
  | 'closeoutNotificationClosurePackageAcknowledgementMetrics'
  | 'closeoutNotificationClosurePackageAcknowledgementRequest'
  | 'closeoutNotificationClosurePackageDeliveryRecords'
  | 'closeoutNotificationClosurePackageReady'
  | 'closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementRecords'
  | 'closureSlaDeliveryAcknowledgementLabel'
  | 'closureSlaDeliveryAcknowledgementStatusLevel'
  | 'latestCloseoutNotificationClosurePackageAcknowledgement'
  | 'latestCloseoutNotificationClosurePackageDelivery'
  | 'onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement'
  | 'setCloseoutNotificationClosurePackageAckActions'
  | 'setCloseoutNotificationClosurePackageAckNotes'
  | 'setCloseoutNotificationClosurePackageAckReviewer'
  | 'setCloseoutNotificationClosurePackageAckReviewerRole'
  | 'setCloseoutNotificationClosurePackageAckStatus'
  | 'setCloseoutNotificationClosurePackageReady'
type BackendCloseoutNotificationClosurePackageAcknowledgementCardProps = {
  closeoutExports: Record<BackendCloseoutNotificationClosurePackageAcknowledgementCardKey, RuntimeValue>
}

export function BackendCloseoutNotificationClosurePackageAcknowledgementCard({
  closeoutExports,
}: BackendCloseoutNotificationClosurePackageAcknowledgementCardProps) {
  const {
  closeoutNotificationClosurePackageAckActions,
  closeoutNotificationClosurePackageAckNotes,
  closeoutNotificationClosurePackageAckReviewer,
  closeoutNotificationClosurePackageAckReviewerRole,
  closeoutNotificationClosurePackageAckStatus,
  closeoutNotificationClosurePackageAcknowledgedDeliveryIds,
  closeoutNotificationClosurePackageAcknowledgementActionList,
  closeoutNotificationClosurePackageAcknowledgementMetrics,
  closeoutNotificationClosurePackageAcknowledgementRequest,
  closeoutNotificationClosurePackageDeliveryRecords,
  closeoutNotificationClosurePackageReady,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementRecords,
  closureSlaDeliveryAcknowledgementLabel,
  closureSlaDeliveryAcknowledgementStatusLevel,
  latestCloseoutNotificationClosurePackageAcknowledgement,
  latestCloseoutNotificationClosurePackageDelivery,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement,
  setCloseoutNotificationClosurePackageAckActions,
  setCloseoutNotificationClosurePackageAckNotes,
  setCloseoutNotificationClosurePackageAckReviewer,
  setCloseoutNotificationClosurePackageAckReviewerRole,
  setCloseoutNotificationClosurePackageAckStatus,
  setCloseoutNotificationClosurePackageReady,
  } = closeoutExports

  return (
                    <div className="retry-aging-list">
                      <div className="dashboard-heading">
                        <h4>Closeout acknowledgement closure package acknowledgement</h4>
                        <StatusChip
                          status={closureSlaDeliveryAcknowledgementStatusLevel(
                            closeoutNotificationClosurePackageAckStatus,
                          )}
                          label={closureSlaDeliveryAcknowledgementLabel(closeoutNotificationClosurePackageAckStatus)}
                        />
                      </div>
                      <div className="trace-review-grid">
                        <label>
                          <span>Reviewer</span>
                          <input
                            value={closeoutNotificationClosurePackageAckReviewer}
                            onChange={(event) =>
                              setCloseoutNotificationClosurePackageAckReviewer(event.target.value)
                            }
                          />
                        </label>
                        <label>
                          <span>Reviewer role</span>
                          <select
                            value={closeoutNotificationClosurePackageAckReviewerRole}
                            onChange={(event) =>
                              setCloseoutNotificationClosurePackageAckReviewerRole(
                                event.target.value as ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement['reviewerRole'],
                              )
                            }
                          >
                            <option value="governance_reviewer">Governance reviewer</option>
                            <option value="infrastructure_owner">Infrastructure owner</option>
                            <option value="notification_operations">Notification operations</option>
                            <option value="platform_owner">Platform owner</option>
                          </select>
                        </label>
                        <label>
                          <span>Response status</span>
                          <select
                            value={closeoutNotificationClosurePackageAckStatus}
                            onChange={(event) =>
                              setCloseoutNotificationClosurePackageAckStatus(
                                event.target.value as ClosureSlaDeliveryAcknowledgementStatus,
                              )
                            }
                          >
                            <option value="acknowledged">Acknowledged</option>
                            <option value="approved">Approved</option>
                            <option value="changes_requested">Changes requested</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </label>
                        <label className="toggle-row">
                          <input
                            checked={closeoutNotificationClosurePackageReady}
                            onChange={(event) =>
                              setCloseoutNotificationClosurePackageReady(event.target.checked)
                            }
                            type="checkbox"
                          />
                          <span>Closure package ready</span>
                        </label>
                        <label className="trace-review-rationale">
                          <span>Requested actions</span>
                          <textarea
                            value={closeoutNotificationClosurePackageAckActions}
                            onChange={(event) =>
                              setCloseoutNotificationClosurePackageAckActions(event.target.value)
                            }
                          />
                        </label>
                        <label className="trace-review-rationale">
                          <span>Response notes</span>
                          <textarea
                            value={closeoutNotificationClosurePackageAckNotes}
                            onChange={(event) =>
                              setCloseoutNotificationClosurePackageAckNotes(event.target.value)
                            }
                          />
                        </label>
                      </div>
                      <div className="toolbar-actions notification-approval-actions">
                        <button
                          className="primary-action"
                          disabled={!latestCloseoutNotificationClosurePackageDelivery}
                          onClick={() => {
                            const request = closeoutNotificationClosurePackageAcknowledgementRequest(
                              latestCloseoutNotificationClosurePackageDelivery,
                            )
                            if (request) {
                              onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement(
                                request,
                              )
                            }
                          }}
                          type="button"
                        >
                          <ClipboardCheck size={15} />
                          Save Closure Package Acknowledgement
                        </button>
                      </div>
                      <div className="metadata-grid">
                        <Metadata
                          label="Acknowledgements"
                          value={String(
                            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementRecords.length,
                          )}
                        />
                        <Metadata
                          label="Open deliveries"
                          value={String(
                            closeoutNotificationClosurePackageDeliveryRecords.filter(
                              (record: RuntimeValue) =>
                                !closeoutNotificationClosurePackageAcknowledgedDeliveryIds.has(record.id),
                            ).length,
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
                          label="Requested actions"
                          value={String(closeoutNotificationClosurePackageAcknowledgementActionList().length)}
                        />
                      </div>
                      {latestCloseoutNotificationClosurePackageAcknowledgement ? (
                        <div className="connector-run-row">
                          <div>
                            <strong>{latestCloseoutNotificationClosurePackageAcknowledgement.payload.reviewer}</strong>
                            <span>
                              v{latestCloseoutNotificationClosurePackageAcknowledgement.version} / {closureSlaDeliveryAcknowledgementLabel(latestCloseoutNotificationClosurePackageAcknowledgement.payload.status)} / {new Date(latestCloseoutNotificationClosurePackageAcknowledgement.createdAt).toLocaleString()}
                            </span>
                            <small>{latestCloseoutNotificationClosurePackageAcknowledgement.payload.evidence}</small>
                          </div>
                          <StatusChip
                            status={latestCloseoutNotificationClosurePackageAcknowledgement.status}
                            label={closureSlaDeliveryAcknowledgementLabel(
                              latestCloseoutNotificationClosurePackageAcknowledgement.payload.status,
                            )}
                          />
                        </div>
                      ) : (
                        <div className="empty-state compact">No closeout acknowledgement closure package acknowledgement has been retained yet.</div>
                      )}
                    </div>
  )
}
