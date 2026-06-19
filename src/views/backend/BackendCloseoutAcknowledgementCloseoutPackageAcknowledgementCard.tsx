import { ClipboardCheck } from 'lucide-react'
import { Metadata, StatusChip } from '../../components/common'
import type {
ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement,
ClosureSlaDeliveryAcknowledgementStatus,
} from '../../types'

type RuntimeValue = ReturnType<typeof JSON.parse>

type BackendCloseoutAcknowledgementCloseoutPackageAcknowledgementCardKey =
  | 'closeoutNotificationClosurePackageAckClosurePackageAckActions'
  | 'closeoutNotificationClosurePackageAckClosurePackageAckNotes'
  | 'closeoutNotificationClosurePackageAckClosurePackageAckReviewer'
  | 'closeoutNotificationClosurePackageAckClosurePackageAckReviewerRole'
  | 'closeoutNotificationClosurePackageAckClosurePackageAckStatus'
  | 'closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady'
  | 'closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgedDeliveryIds'
  | 'closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementActionList'
  | 'closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementMetrics'
  | 'closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRequest'
  | 'closeoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryRecords'
  | 'closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRecords'
  | 'closureSlaDeliveryAcknowledgementLabel'
  | 'closureSlaDeliveryAcknowledgementStatusLevel'
  | 'latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement'
  | 'latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageDelivery'
  | 'onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageAckActions'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageAckNotes'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageAckReviewer'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageAckReviewerRole'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageAckStatus'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady'
type BackendCloseoutAcknowledgementCloseoutPackageAcknowledgementCardProps = {
  closeoutExports: Record<BackendCloseoutAcknowledgementCloseoutPackageAcknowledgementCardKey, RuntimeValue>
}

export function BackendCloseoutAcknowledgementCloseoutPackageAcknowledgementCard({
  closeoutExports,
}: BackendCloseoutAcknowledgementCloseoutPackageAcknowledgementCardProps) {
  const {
  closeoutNotificationClosurePackageAckClosurePackageAckActions,
  closeoutNotificationClosurePackageAckClosurePackageAckNotes,
  closeoutNotificationClosurePackageAckClosurePackageAckReviewer,
  closeoutNotificationClosurePackageAckClosurePackageAckReviewerRole,
  closeoutNotificationClosurePackageAckClosurePackageAckStatus,
  closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady,
  closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgedDeliveryIds,
  closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementActionList,
  closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementMetrics,
  closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRequest,
  closeoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryRecords,
  closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRecords,
  closureSlaDeliveryAcknowledgementLabel,
  closureSlaDeliveryAcknowledgementStatusLevel,
  latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement,
  latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageDelivery,
  onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement,
  setCloseoutNotificationClosurePackageAckClosurePackageAckActions,
  setCloseoutNotificationClosurePackageAckClosurePackageAckNotes,
  setCloseoutNotificationClosurePackageAckClosurePackageAckReviewer,
  setCloseoutNotificationClosurePackageAckClosurePackageAckReviewerRole,
  setCloseoutNotificationClosurePackageAckClosurePackageAckStatus,
  setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady,
  } = closeoutExports

  return (
                      <div className="retry-aging-list">
                        <div className="dashboard-heading">
                          <h4>Closeout acknowledgement closeout package acknowledgement</h4>
                          <StatusChip
                            status={closureSlaDeliveryAcknowledgementStatusLevel(
                              closeoutNotificationClosurePackageAckClosurePackageAckStatus,
                            )}
                            label={closureSlaDeliveryAcknowledgementLabel(
                              closeoutNotificationClosurePackageAckClosurePackageAckStatus,
                            )}
                          />
                        </div>
                        <div className="trace-review-grid">
                          <label>
                            <span>Reviewer</span>
                            <input
                              value={closeoutNotificationClosurePackageAckClosurePackageAckReviewer}
                              onChange={(event) =>
                                setCloseoutNotificationClosurePackageAckClosurePackageAckReviewer(event.target.value)
                              }
                            />
                          </label>
                          <label>
                            <span>Reviewer role</span>
                            <select
                              value={closeoutNotificationClosurePackageAckClosurePackageAckReviewerRole}
                              onChange={(event) =>
                                setCloseoutNotificationClosurePackageAckClosurePackageAckReviewerRole(
                                  event.target.value as ClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement['reviewerRole'],
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
                              value={closeoutNotificationClosurePackageAckClosurePackageAckStatus}
                              onChange={(event) =>
                                setCloseoutNotificationClosurePackageAckClosurePackageAckStatus(
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
                              checked={closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady}
                              onChange={(event) =>
                                setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady(
                                  event.target.checked,
                                )
                              }
                              type="checkbox"
                            />
                            <span>Final evidence ready</span>
                          </label>
                          <label className="trace-review-rationale">
                            <span>Requested actions</span>
                            <textarea
                              value={closeoutNotificationClosurePackageAckClosurePackageAckActions}
                              onChange={(event) =>
                                setCloseoutNotificationClosurePackageAckClosurePackageAckActions(event.target.value)
                              }
                            />
                          </label>
                          <label className="trace-review-rationale">
                            <span>Response notes</span>
                            <textarea
                              value={closeoutNotificationClosurePackageAckClosurePackageAckNotes}
                              onChange={(event) =>
                                setCloseoutNotificationClosurePackageAckClosurePackageAckNotes(event.target.value)
                              }
                            />
                          </label>
                        </div>
                        <div className="toolbar-actions notification-approval-actions">
                          <button
                            className="primary-action"
                            disabled={!latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageDelivery}
                            onClick={() => {
                              const request =
                                closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRequest(
                                  latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageDelivery,
                                )
                              if (request) {
                                onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement(
                                  request,
                                )
                              }
                            }}
                            type="button"
                          >
                            <ClipboardCheck size={15} />
                            Save Closeout Package Acknowledgement
                          </button>
                        </div>
                        <div className="metadata-grid">
                          <Metadata
                            label="Acknowledgements"
                            value={String(
                              closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRecords.length,
                            )}
                          />
                          <Metadata
                            label="Open deliveries"
                            value={String(
                              closeoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryRecords.filter(
                                (record: RuntimeValue) =>
                                  !closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgedDeliveryIds.has(
                                    record.id,
                                  ),
                              ).length,
                            )}
                          />
                          <Metadata
                            label="Final evidence ready"
                            value={String(
                              closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementMetrics.finalEvidenceReady,
                            )}
                          />
                          <Metadata
                            label="Retained actions"
                            value={String(
                              closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementMetrics.retainedActions,
                            )}
                          />
                          <Metadata
                            label="Requested actions"
                            value={String(
                              closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementActionList()
                                .length,
                            )}
                          />
                        </div>
                        {latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement ? (
                          <div className="connector-run-row">
                            <div>
                              <strong>
                                {
                                  latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement
                                    .payload.reviewer
                                }
                              </strong>
                              <span>
                                v{latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement.version} / {closureSlaDeliveryAcknowledgementLabel(latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement.payload.status)} / {new Date(latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement.createdAt).toLocaleString()}
                              </span>
                              <small>
                                {
                                  latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement
                                    .payload.evidence
                                }
                              </small>
                            </div>
                            <StatusChip
                              status={
                                latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement.status
                              }
                              label={closureSlaDeliveryAcknowledgementLabel(
                                latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement
                                  .payload.status,
                              )}
                            />
                          </div>
                        ) : (
                          <div className="empty-state compact">No closeout acknowledgement closeout package acknowledgement has been retained yet.</div>
                        )}
                      </div>
  )
}
