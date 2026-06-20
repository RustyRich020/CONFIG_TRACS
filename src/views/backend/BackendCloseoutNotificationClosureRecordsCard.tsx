import { ClipboardCheck } from 'lucide-react'
import { ConnectorRunRow, DashboardHeading, Metadata } from '../../components/common'
import type { ClosureSlaResponseFollowUpClosureStatus } from '../../types'

type RuntimeValue = ReturnType<typeof JSON.parse>

type CloseoutNotificationClosureRecordsPropKey =
  | 'closeoutNotificationClosureActionList'
  | 'closeoutNotificationClosureActions'
  | 'closeoutNotificationClosureMetrics'
  | 'closeoutNotificationClosureNotes'
  | 'closeoutNotificationClosureRequest'
  | 'closeoutNotificationClosureReviewer'
  | 'closeoutNotificationClosureStatus'
  | 'closeoutNotificationClosureStatusLevel'
  | 'closeoutNotificationClosureSupersededEvidence'
  | 'closeoutNotificationClosureSupersededEvidenceList'
  | 'closurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosureRecords'
  | 'closurePackageAcknowledgementCloseoutNotificationClosureRecords'
  | 'closureSlaFollowUpClosureLabel'
  | 'latestCloseoutNotificationClosure'
  | 'onSaveClosurePackageAcknowledgementCloseoutNotificationClosure'
  | 'setCloseoutNotificationClosureActions'
  | 'setCloseoutNotificationClosureNotes'
  | 'setCloseoutNotificationClosureReviewer'
  | 'setCloseoutNotificationClosureStatus'
  | 'setCloseoutNotificationClosureSupersededEvidence'

type BackendCloseoutNotificationClosureRecordsCardProps = {
  closeoutExports: Record<CloseoutNotificationClosureRecordsPropKey, RuntimeValue>
}

export function BackendCloseoutNotificationClosureRecordsCard({
  closeoutExports,
}: BackendCloseoutNotificationClosureRecordsCardProps) {
  const {
    closeoutNotificationClosureActionList,
    closeoutNotificationClosureActions,
    closeoutNotificationClosureMetrics,
    closeoutNotificationClosureNotes,
    closeoutNotificationClosureRequest,
    closeoutNotificationClosureReviewer,
    closeoutNotificationClosureStatus,
    closeoutNotificationClosureStatusLevel,
    closeoutNotificationClosureSupersededEvidence,
    closeoutNotificationClosureSupersededEvidenceList,
    closurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosureRecords,
    closurePackageAcknowledgementCloseoutNotificationClosureRecords,
    closureSlaFollowUpClosureLabel,
    latestCloseoutNotificationClosure,
    onSaveClosurePackageAcknowledgementCloseoutNotificationClosure,
    setCloseoutNotificationClosureActions,
    setCloseoutNotificationClosureNotes,
    setCloseoutNotificationClosureReviewer,
    setCloseoutNotificationClosureStatus,
    setCloseoutNotificationClosureSupersededEvidence,
  } = closeoutExports

  return (
                  <div className="retry-aging-list">
                    <DashboardHeading
                      status={closeoutNotificationClosureStatusLevel}
                      label={closeoutNotificationClosureStatusLevel}
                      title="Notification closure records"
                    />
                    <div className="trace-review-grid">
                      <label>
                        <span>Closure reviewer</span>
                        <input
                          value={closeoutNotificationClosureReviewer}
                          onChange={(event) => setCloseoutNotificationClosureReviewer(event.target.value)}
                        />
                      </label>
                      <label>
                        <span>Closure disposition</span>
                        <select
                          value={closeoutNotificationClosureStatus}
                          onChange={(event) =>
                            setCloseoutNotificationClosureStatus(
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
                        <span>Retained notification actions</span>
                        <textarea
                          value={closeoutNotificationClosureActions}
                          onChange={(event) => setCloseoutNotificationClosureActions(event.target.value)}
                        />
                      </label>
                      <label className="trace-review-rationale">
                        <span>Closure notes</span>
                        <textarea
                          value={closeoutNotificationClosureNotes}
                          onChange={(event) => setCloseoutNotificationClosureNotes(event.target.value)}
                        />
                      </label>
                      <label className="trace-review-rationale">
                        <span>Superseded notification evidence</span>
                        <textarea
                          value={closeoutNotificationClosureSupersededEvidence}
                          onChange={(event) => setCloseoutNotificationClosureSupersededEvidence(event.target.value)}
                        />
                      </label>
                    </div>
                    <div className="toolbar-actions notification-approval-actions">
                      <button
                        className="primary-action"
                        disabled={
                          closurePackageAcknowledgementCloseoutExportPackageAcknowledgementClosureRecords.length === 0
                        }
                        onClick={() =>
                          onSaveClosurePackageAcknowledgementCloseoutNotificationClosure(
                            closeoutNotificationClosureRequest(),
                          )
                        }
                        type="button"
                      >
                        <ClipboardCheck size={15} />
                        Save Notification Closure Record
                      </button>
                    </div>
                    <div className="metadata-grid">
                      <Metadata
                        label="Notification closures"
                        value={String(closurePackageAcknowledgementCloseoutNotificationClosureRecords.length)}
                      />
                      <Metadata
                        label="Export packages"
                        value={String(closeoutNotificationClosureMetrics.exportPackages)}
                      />
                      <Metadata
                        label="Package deliveries"
                        value={String(closeoutNotificationClosureMetrics.deliveryRecords)}
                      />
                      <Metadata
                        label="Acknowledgements"
                        value={String(closeoutNotificationClosureMetrics.acknowledgementRecords)}
                      />
                      <Metadata
                        label="Ack closures"
                        value={String(closeoutNotificationClosureMetrics.acknowledgementClosures)}
                      />
                      <Metadata
                        label="Retry controls"
                        value={String(closeoutNotificationClosureMetrics.retryControls)}
                      />
                      <Metadata
                        label="Ready acknowledgements"
                        value={String(closeoutNotificationClosureMetrics.readyAcknowledgements)}
                      />
                      <Metadata
                        label="Retained actions"
                        value={String(
                          closeoutNotificationClosureMetrics.retainedActions +
                            closeoutNotificationClosureActionList().length,
                        )}
                      />
                      <Metadata
                        label="Closure disposition"
                        value={closureSlaFollowUpClosureLabel(closeoutNotificationClosureStatus)}
                      />
                      <Metadata
                        label="Superseded notes"
                        value={String(closeoutNotificationClosureSupersededEvidenceList().length)}
                      />
                    </div>
                    {latestCloseoutNotificationClosure ? (
                      <ConnectorRunRow
                        status={latestCloseoutNotificationClosure.status}
                        label={closureSlaFollowUpClosureLabel(latestCloseoutNotificationClosure.payload.status)}
                        title={latestCloseoutNotificationClosure.payload.reviewer}
                        subtitle={`v${latestCloseoutNotificationClosure.version} / ${closureSlaFollowUpClosureLabel(latestCloseoutNotificationClosure.payload.status)} / ${new Date(latestCloseoutNotificationClosure.createdAt).toLocaleString()}`}
                      >
                        {latestCloseoutNotificationClosure.payload.evidence}
                      </ConnectorRunRow>
                    ) : (
                      <div className="empty-state compact">No closeout package notification closure has been retained yet.</div>
                    )}
                  </div>
  )
}
