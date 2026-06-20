import { Bell, ClipboardCheck, Download } from 'lucide-react'
import { Metadata, StatusChip } from '../../components/common'
import { BackendCloseoutNotificationClosurePackageAcknowledgementCard } from './BackendCloseoutNotificationClosurePackageAcknowledgementCard'
import { BackendCloseoutNotificationClosurePackageAcknowledgementCloseoutCard } from './BackendCloseoutNotificationClosurePackageAcknowledgementCloseoutCard'
import { BackendCloseoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryCard } from './BackendCloseoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryCard'
import { BackendCloseoutNotificationClosurePackageDeliveryEvidenceCard } from './BackendCloseoutNotificationClosurePackageDeliveryEvidenceCard'

type RuntimeValue = ReturnType<typeof JSON.parse>

type CloseoutNotificationClosurePackageControlsKey =
  | 'buildCloseoutNotificationClosurePackage'
  | 'closeoutNotificationClosurePackageDeliveryRecords'
  | 'closeoutNotificationClosurePackageMetrics'
  | 'closeoutNotificationClosurePackageNotes'
  | 'closeoutNotificationClosurePackageRequiredActions'
  | 'closeoutNotificationClosurePackageReviewers'
  | 'closeoutNotificationClosurePackageStatus'
  | 'closurePackageAcknowledgementCloseoutNotificationClosurePackageRecords'
  | 'closurePackageAcknowledgementCloseoutNotificationClosureRecords'
  | 'latestCloseoutNotificationClosurePackage'
  | 'latestCloseoutNotificationClosurePackageDelivery'
  | 'onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackage'
  | 'onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackage'
  | 'setCloseoutNotificationClosurePackageNotes'
  | 'setCloseoutNotificationClosurePackageReviewers'

type CloseoutNotificationClosurePackageAcknowledgementKey =
  | 'closeoutNotificationClosurePackageAckActions'
  | 'closeoutNotificationClosurePackageAckNotes'
  | 'closeoutNotificationClosurePackageAckReviewer'
  | 'closeoutNotificationClosurePackageAckReviewerRole'
  | 'closeoutNotificationClosurePackageAckStatus'
  | 'closeoutNotificationClosurePackageAcknowledgedDeliveryIds'
  | 'closeoutNotificationClosurePackageAcknowledgementActionList'
  | 'closeoutNotificationClosurePackageAcknowledgementMetrics'
  | 'closeoutNotificationClosurePackageAcknowledgementRequest'
  | 'closeoutNotificationClosurePackageReady'
  | 'closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementRecords'
  | 'closureSlaDeliveryAcknowledgementLabel'
  | 'closureSlaDeliveryAcknowledgementStatusLevel'
  | 'latestCloseoutNotificationClosurePackageAcknowledgement'
  | 'onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement'
  | 'setCloseoutNotificationClosurePackageAckActions'
  | 'setCloseoutNotificationClosurePackageAckNotes'
  | 'setCloseoutNotificationClosurePackageAckReviewer'
  | 'setCloseoutNotificationClosurePackageAckReviewerRole'
  | 'setCloseoutNotificationClosurePackageAckStatus'
  | 'setCloseoutNotificationClosurePackageReady'

type CloseoutNotificationClosurePackageAcknowledgementCloseoutKey =
  | 'closeoutNotificationClosurePackageAckClosureActions'
  | 'closeoutNotificationClosurePackageAckClosureNotes'
  | 'closeoutNotificationClosurePackageAckClosureReviewer'
  | 'closeoutNotificationClosurePackageAckClosureStatus'
  | 'closeoutNotificationClosurePackageAckSupersededEvidence'
  | 'closeoutNotificationClosurePackageAcknowledgementClosureRequest'
  | 'closeoutNotificationClosurePackageAcknowledgementClosureStatus'
  | 'closeoutNotificationClosurePackageAcknowledgementSupersededEvidenceList'
  | 'closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords'
  | 'closureSlaFollowUpClosureLabel'
  | 'closureSlaFollowUpClosureStatusLevel'
  | 'latestCloseoutNotificationClosurePackageAcknowledgementClosure'
  | 'onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosure'
  | 'setCloseoutNotificationClosurePackageAckClosureActions'
  | 'setCloseoutNotificationClosurePackageAckClosureNotes'
  | 'setCloseoutNotificationClosurePackageAckClosureReviewer'
  | 'setCloseoutNotificationClosurePackageAckClosureStatus'
  | 'setCloseoutNotificationClosurePackageAckSupersededEvidence'

type CloseoutNotificationClosurePackageNestedDeliveryKey =
  | 'buildCloseoutNotificationClosurePackageAcknowledgementClosurePackage'
  | 'closeoutNotificationClosurePackageAckClosurePackageNotes'
  | 'closeoutNotificationClosurePackageAckClosurePackageReviewers'
  | 'closeoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryRecords'
  | 'closeoutNotificationClosurePackageAcknowledgementClosurePackageMetrics'
  | 'closeoutNotificationClosurePackageAcknowledgementClosurePackageRequiredActions'
  | 'closeoutNotificationClosurePackageAcknowledgementClosurePackageStatus'
  | 'closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageRecords'
  | 'latestCloseoutNotificationClosurePackageAcknowledgementClosurePackage'
  | 'latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageDelivery'
  | 'onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage'
  | 'onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageNotes'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageReviewers'
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
  | 'closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRecords'
  | 'latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement'
  | 'onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageAckActions'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageAckNotes'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageAckReviewer'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageAckReviewerRole'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageAckStatus'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady'

type BackendCloseoutNotificationClosurePackageDeliveryCardProps = {
  packageControls: Record<CloseoutNotificationClosurePackageControlsKey, RuntimeValue>
  acknowledgement: Record<CloseoutNotificationClosurePackageAcknowledgementKey, RuntimeValue>
  acknowledgementCloseout: Record<CloseoutNotificationClosurePackageAcknowledgementCloseoutKey, RuntimeValue>
  nestedDelivery: Record<CloseoutNotificationClosurePackageNestedDeliveryKey, RuntimeValue>
  nestedDeliveryFinalEvidence: Record<string, RuntimeValue>
}

export function BackendCloseoutNotificationClosurePackageDeliveryCard({
  packageControls,
  acknowledgement,
  acknowledgementCloseout,
  nestedDelivery,
  nestedDeliveryFinalEvidence,
}: BackendCloseoutNotificationClosurePackageDeliveryCardProps) {
  const {
    buildCloseoutNotificationClosurePackage,
    closeoutNotificationClosurePackageDeliveryRecords,
    closeoutNotificationClosurePackageMetrics,
    closeoutNotificationClosurePackageNotes,
    closeoutNotificationClosurePackageRequiredActions,
    closeoutNotificationClosurePackageReviewers,
    closeoutNotificationClosurePackageStatus,
    closurePackageAcknowledgementCloseoutNotificationClosurePackageRecords,
    closurePackageAcknowledgementCloseoutNotificationClosureRecords,
    latestCloseoutNotificationClosurePackage,
    latestCloseoutNotificationClosurePackageDelivery,
    onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackage,
    onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackage,
    setCloseoutNotificationClosurePackageNotes,
    setCloseoutNotificationClosurePackageReviewers,
  } = packageControls
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
    closeoutNotificationClosurePackageReady,
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementRecords,
    closureSlaDeliveryAcknowledgementLabel,
    closureSlaDeliveryAcknowledgementStatusLevel,
    latestCloseoutNotificationClosurePackageAcknowledgement,
    onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement,
    setCloseoutNotificationClosurePackageAckActions,
    setCloseoutNotificationClosurePackageAckNotes,
    setCloseoutNotificationClosurePackageAckReviewer,
    setCloseoutNotificationClosurePackageAckReviewerRole,
    setCloseoutNotificationClosurePackageAckStatus,
    setCloseoutNotificationClosurePackageReady,
  } = acknowledgement
  const {
    closeoutNotificationClosurePackageAckClosureActions,
    closeoutNotificationClosurePackageAckClosureNotes,
    closeoutNotificationClosurePackageAckClosureReviewer,
    closeoutNotificationClosurePackageAckClosureStatus,
    closeoutNotificationClosurePackageAckSupersededEvidence,
    closeoutNotificationClosurePackageAcknowledgementClosureRequest,
    closeoutNotificationClosurePackageAcknowledgementClosureStatus,
    closeoutNotificationClosurePackageAcknowledgementSupersededEvidenceList,
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords,
    closureSlaFollowUpClosureLabel,
    closureSlaFollowUpClosureStatusLevel,
    latestCloseoutNotificationClosurePackageAcknowledgementClosure,
    onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosure,
    setCloseoutNotificationClosurePackageAckClosureActions,
    setCloseoutNotificationClosurePackageAckClosureNotes,
    setCloseoutNotificationClosurePackageAckClosureReviewer,
    setCloseoutNotificationClosurePackageAckClosureStatus,
    setCloseoutNotificationClosurePackageAckSupersededEvidence,
  } = acknowledgementCloseout
  const {
    buildCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
    closeoutNotificationClosurePackageAckClosurePackageNotes,
    closeoutNotificationClosurePackageAckClosurePackageReviewers,
    closeoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryRecords,
    closeoutNotificationClosurePackageAcknowledgementClosurePackageMetrics,
    closeoutNotificationClosurePackageAcknowledgementClosurePackageRequiredActions,
    closeoutNotificationClosurePackageAcknowledgementClosurePackageStatus,
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageRecords,
    latestCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
    latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageDelivery,
    onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
    onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
    setCloseoutNotificationClosurePackageAckClosurePackageNotes,
    setCloseoutNotificationClosurePackageAckClosurePackageReviewers,
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
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRecords,
    latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement,
    onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement,
    setCloseoutNotificationClosurePackageAckClosurePackageAckActions,
    setCloseoutNotificationClosurePackageAckClosurePackageAckNotes,
    setCloseoutNotificationClosurePackageAckClosurePackageAckReviewer,
    setCloseoutNotificationClosurePackageAckClosurePackageAckReviewerRole,
    setCloseoutNotificationClosurePackageAckClosurePackageAckStatus,
    setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady,
  } = nestedDelivery

  return (
                  <div className="retry-aging-list">
                    <div className="dashboard-heading">
                      <h4>Closeout acknowledgement closure package delivery</h4>
                      <StatusChip
                        status={closeoutNotificationClosurePackageStatus}
                        label={closeoutNotificationClosurePackageStatus}
                      />
                    </div>
                    <div className="trace-review-grid">
                      <label className="trace-review-rationale">
                        <span>Closure package reviewers</span>
                        <textarea
                          value={closeoutNotificationClosurePackageReviewers}
                          onChange={(event) => setCloseoutNotificationClosurePackageReviewers(event.target.value)}
                        />
                      </label>
                      <label className="trace-review-rationale">
                        <span>Package notes</span>
                        <textarea
                          value={closeoutNotificationClosurePackageNotes}
                          onChange={(event) => setCloseoutNotificationClosurePackageNotes(event.target.value)}
                        />
                      </label>
                    </div>
                    <div className="toolbar-actions notification-approval-actions">
                      <button
                        className="secondary-action"
                        disabled={closurePackageAcknowledgementCloseoutNotificationClosureRecords.length === 0}
                        onClick={() =>
                          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackage({
                            download: false,
                            packagePayload: buildCloseoutNotificationClosurePackage(),
                          })
                        }
                        type="button"
                      >
                        <ClipboardCheck size={15} />
                        Save Closure Package
                      </button>
                      <button
                        className="secondary-action"
                        disabled={closurePackageAcknowledgementCloseoutNotificationClosureRecords.length === 0}
                        onClick={() =>
                          onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackage({
                            download: true,
                            packagePayload: buildCloseoutNotificationClosurePackage(),
                          })
                        }
                        type="button"
                      >
                        <Download size={15} />
                        Save & Download Closure Package
                      </button>
                      <button
                        className="primary-action"
                        disabled={closurePackageAcknowledgementCloseoutNotificationClosureRecords.length === 0}
                        onClick={() =>
                          onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackage({
                            download: false,
                            packagePayload: buildCloseoutNotificationClosurePackage(),
                          })
                        }
                        type="button"
                      >
                        <Bell size={15} />
                        Save & Notify Closure Owners
                      </button>
                    </div>
                    <div className="metadata-grid">
                      <Metadata
                        label="Closure packages"
                        value={String(closurePackageAcknowledgementCloseoutNotificationClosurePackageRecords.length)}
                      />
                      <Metadata
                        label="Notification closures"
                        value={String(closeoutNotificationClosurePackageMetrics.notificationClosures)}
                      />
                      <Metadata label="Closed" value={String(closeoutNotificationClosurePackageMetrics.closed)} />
                      <Metadata
                        label="Closed with actions"
                        value={String(closeoutNotificationClosurePackageMetrics.closedWithActions)}
                      />
                      <Metadata
                        label="Required actions"
                        value={String(closeoutNotificationClosurePackageRequiredActions().length)}
                      />
                      <Metadata
                        label="Package deliveries"
                        value={String(closeoutNotificationClosurePackageDeliveryRecords.length)}
                      />
                      <Metadata
                        label="Latest delivery"
                        value={
                          latestCloseoutNotificationClosurePackageDelivery
                            ? new Date(latestCloseoutNotificationClosurePackageDelivery.createdAt).toLocaleString()
                            : 'Not delivered'
                        }
                      />
                    </div>
                    {latestCloseoutNotificationClosurePackage ? (
                      <div className="connector-run-row">
                        <div>
                          <strong>{latestCloseoutNotificationClosurePackage.payload.closureReviewers.join(', ')}</strong>
                          <span>
                            v{latestCloseoutNotificationClosurePackage.version} / {new Date(latestCloseoutNotificationClosurePackage.createdAt).toLocaleString()} / {latestCloseoutNotificationClosurePackage.payload.metrics.notificationClosures} notification closure record(s)
                          </span>
                          <small>{latestCloseoutNotificationClosurePackage.payload.evidence}</small>
                        </div>
                        <StatusChip
                          status={latestCloseoutNotificationClosurePackage.status}
                          label={latestCloseoutNotificationClosurePackage.status}
                        />
                      </div>
                    ) : (
                      <div className="empty-state compact">No closeout acknowledgement closure package has been retained yet.</div>
                    )}
                    <BackendCloseoutNotificationClosurePackageDeliveryEvidenceCard
                      closeoutExports={{
                        closeoutNotificationClosurePackageDeliveryRecords,
                      }}
                    />
                    <BackendCloseoutNotificationClosurePackageAcknowledgementCard
                      closeoutExports={{
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
                      }}
                    />
                    <BackendCloseoutNotificationClosurePackageAcknowledgementCloseoutCard
                      closeoutExports={{
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
                      }}
                    />
                    <BackendCloseoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryCard
                      packageControls={{
                        buildCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
                        closeoutNotificationClosurePackageAckClosurePackageNotes,
                        closeoutNotificationClosurePackageAckClosurePackageReviewers,
                        closeoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryRecords,
                        closeoutNotificationClosurePackageAcknowledgementClosurePackageMetrics,
                        closeoutNotificationClosurePackageAcknowledgementClosurePackageRequiredActions,
                        closeoutNotificationClosurePackageAcknowledgementClosurePackageStatus,
                        closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageRecords,
                        latestCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
                        latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageDelivery,
                        onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
                        onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
                        setCloseoutNotificationClosurePackageAckClosurePackageNotes,
                        setCloseoutNotificationClosurePackageAckClosurePackageReviewers,
                      }}
                      acknowledgement={{
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
                        closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRecords,
                        closureSlaDeliveryAcknowledgementLabel,
                        closureSlaDeliveryAcknowledgementStatusLevel,
                        latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement,
                        onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement,
                        setCloseoutNotificationClosurePackageAckClosurePackageAckActions,
                        setCloseoutNotificationClosurePackageAckClosurePackageAckNotes,
                        setCloseoutNotificationClosurePackageAckClosurePackageAckReviewer,
                        setCloseoutNotificationClosurePackageAckClosurePackageAckReviewerRole,
                        setCloseoutNotificationClosurePackageAckClosurePackageAckStatus,
                        setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady,
                      }}
                      finalEvidence={nestedDeliveryFinalEvidence}
                    />
                  </div>
  )
}
