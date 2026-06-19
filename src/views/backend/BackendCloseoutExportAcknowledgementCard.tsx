import { ClipboardCheck } from 'lucide-react'
import { Metadata, StatusChip } from '../../components/common'
import type {
ClosurePackageAcknowledgementCloseoutExportPackageAcknowledgement,
ClosureSlaDeliveryAcknowledgementStatus,
} from '../../types'

type RuntimeValue = ReturnType<typeof JSON.parse>

type BackendCloseoutExportAcknowledgementCardKey =
  | 'closeoutExportAckActions'
  | 'closeoutExportAckNotes'
  | 'closeoutExportAckReviewer'
  | 'closeoutExportAckReviewerRole'
  | 'closeoutExportAckStatus'
  | 'closeoutExportAcknowledgedDeliveryIds'
  | 'closeoutExportAcknowledgementActionList'
  | 'closeoutExportAcknowledgementMetrics'
  | 'closeoutExportAcknowledgementRequest'
  | 'closeoutExportDeliveryRecords'
  | 'closeoutExportReady'
  | 'closurePackageAcknowledgementCloseoutExportPackageAcknowledgementRecords'
  | 'closureSlaDeliveryAcknowledgementLabel'
  | 'closureSlaDeliveryAcknowledgementStatusLevel'
  | 'latestCloseoutExportAcknowledgement'
  | 'latestCloseoutExportDelivery'
  | 'onSaveClosurePackageAcknowledgementCloseoutExportPackageAcknowledgement'
  | 'setCloseoutExportAckActions'
  | 'setCloseoutExportAckNotes'
  | 'setCloseoutExportAckReviewer'
  | 'setCloseoutExportAckReviewerRole'
  | 'setCloseoutExportAckStatus'
  | 'setCloseoutExportReady'
type BackendCloseoutExportAcknowledgementCardProps = {
  closeoutExports: Record<BackendCloseoutExportAcknowledgementCardKey, RuntimeValue>
}

export function BackendCloseoutExportAcknowledgementCard({
  closeoutExports,
}: BackendCloseoutExportAcknowledgementCardProps) {
  const {
  closeoutExportAckActions,
  closeoutExportAckNotes,
  closeoutExportAckReviewer,
  closeoutExportAckReviewerRole,
  closeoutExportAckStatus,
  closeoutExportAcknowledgedDeliveryIds,
  closeoutExportAcknowledgementActionList,
  closeoutExportAcknowledgementMetrics,
  closeoutExportAcknowledgementRequest,
  closeoutExportDeliveryRecords,
  closeoutExportReady,
  closurePackageAcknowledgementCloseoutExportPackageAcknowledgementRecords,
  closureSlaDeliveryAcknowledgementLabel,
  closureSlaDeliveryAcknowledgementStatusLevel,
  latestCloseoutExportAcknowledgement,
  latestCloseoutExportDelivery,
  onSaveClosurePackageAcknowledgementCloseoutExportPackageAcknowledgement,
  setCloseoutExportAckActions,
  setCloseoutExportAckNotes,
  setCloseoutExportAckReviewer,
  setCloseoutExportAckReviewerRole,
  setCloseoutExportAckStatus,
  setCloseoutExportReady,
  } = closeoutExports

  return (
                  <div className="retry-aging-list">
                    <div className="dashboard-heading">
                      <h4>Closeout export package acknowledgement</h4>
                      <StatusChip
                        status={closureSlaDeliveryAcknowledgementStatusLevel(closeoutExportAckStatus)}
                        label={closureSlaDeliveryAcknowledgementLabel(closeoutExportAckStatus)}
                      />
                    </div>
                    <div className="trace-review-grid">
                      <label>
                        <span>Reviewer</span>
                        <input
                          value={closeoutExportAckReviewer}
                          onChange={(event) => setCloseoutExportAckReviewer(event.target.value)}
                        />
                      </label>
                      <label>
                        <span>Reviewer role</span>
                        <select
                          value={closeoutExportAckReviewerRole}
                          onChange={(event) =>
                            setCloseoutExportAckReviewerRole(
                              event.target.value as ClosurePackageAcknowledgementCloseoutExportPackageAcknowledgement['reviewerRole'],
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
                          value={closeoutExportAckStatus}
                          onChange={(event) =>
                            setCloseoutExportAckStatus(event.target.value as ClosureSlaDeliveryAcknowledgementStatus)
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
                          checked={closeoutExportReady}
                          onChange={(event) => setCloseoutExportReady(event.target.checked)}
                          type="checkbox"
                        />
                        <span>Closeout package ready</span>
                      </label>
                      <label className="trace-review-rationale">
                        <span>Requested actions</span>
                        <textarea
                          value={closeoutExportAckActions}
                          onChange={(event) => setCloseoutExportAckActions(event.target.value)}
                        />
                      </label>
                      <label className="trace-review-rationale">
                        <span>Response notes</span>
                        <textarea
                          value={closeoutExportAckNotes}
                          onChange={(event) => setCloseoutExportAckNotes(event.target.value)}
                        />
                      </label>
                    </div>
                    <div className="toolbar-actions notification-approval-actions">
                      <button
                        className="primary-action"
                        disabled={!latestCloseoutExportDelivery}
                        onClick={() => {
                          const request = closeoutExportAcknowledgementRequest(latestCloseoutExportDelivery)
                          if (request) onSaveClosurePackageAcknowledgementCloseoutExportPackageAcknowledgement(request)
                        }}
                        type="button"
                      >
                        <ClipboardCheck size={15} />
                        Save Closeout Export Acknowledgement
                      </button>
                    </div>
                    <div className="metadata-grid">
                      <Metadata
                        label="Acknowledgements"
                        value={String(closurePackageAcknowledgementCloseoutExportPackageAcknowledgementRecords.length)}
                      />
                      <Metadata
                        label="Open deliveries"
                        value={String(
                          closeoutExportDeliveryRecords.filter(
                            (record: RuntimeValue) => !closeoutExportAcknowledgedDeliveryIds.has(record.id),
                          ).length,
                        )}
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
                        label="Requested actions"
                        value={String(closeoutExportAcknowledgementActionList().length)}
                      />
                    </div>
                    {latestCloseoutExportAcknowledgement ? (
                      <div className="connector-run-row">
                        <div>
                          <strong>{latestCloseoutExportAcknowledgement.payload.reviewer}</strong>
                          <span>
                            v{latestCloseoutExportAcknowledgement.version} / {closureSlaDeliveryAcknowledgementLabel(latestCloseoutExportAcknowledgement.payload.status)} / {new Date(latestCloseoutExportAcknowledgement.createdAt).toLocaleString()}
                          </span>
                          <small>{latestCloseoutExportAcknowledgement.payload.evidence}</small>
                        </div>
                        <StatusChip
                          status={latestCloseoutExportAcknowledgement.status}
                          label={closureSlaDeliveryAcknowledgementLabel(latestCloseoutExportAcknowledgement.payload.status)}
                        />
                      </div>
                    ) : (
                      <div className="empty-state compact">No closeout export package acknowledgement has been retained yet.</div>
                    )}
                  </div>
  )
}
