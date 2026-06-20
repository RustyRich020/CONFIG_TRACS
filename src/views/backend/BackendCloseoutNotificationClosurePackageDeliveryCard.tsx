import { Bell, ClipboardCheck, Download } from 'lucide-react'
import { Metadata, StatusChip } from '../../components/common'
import { BackendCloseoutNotificationClosurePackageAcknowledgementCard } from './BackendCloseoutNotificationClosurePackageAcknowledgementCard'
import { BackendCloseoutNotificationClosurePackageAcknowledgementCloseoutCard } from './BackendCloseoutNotificationClosurePackageAcknowledgementCloseoutCard'
import { BackendCloseoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryCard } from './BackendCloseoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryCard'
import { BackendCloseoutNotificationClosurePackageDeliveryEvidenceCard } from './BackendCloseoutNotificationClosurePackageDeliveryEvidenceCard'

type RuntimeValue = ReturnType<typeof JSON.parse>

type CloseoutNotificationClosurePackageDeliveryPropKey =
  | 'buildCloseoutNotificationClosurePackage'
  | 'buildCloseoutNotificationClosurePackageAcknowledgementClosurePackage'
  | 'closeoutNotificationClosurePackageAckActions'
  | 'closeoutNotificationClosurePackageAckClosureActions'
  | 'closeoutNotificationClosurePackageAckClosureNotes'
  | 'closeoutNotificationClosurePackageAckClosurePackageAckActions'
  | 'closeoutNotificationClosurePackageAckClosurePackageAckNotes'
  | 'closeoutNotificationClosurePackageAckClosurePackageAckReviewer'
  | 'closeoutNotificationClosurePackageAckClosurePackageAckReviewerRole'
  | 'closeoutNotificationClosurePackageAckClosurePackageAckStatus'
  | 'closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady'
  | 'closeoutNotificationClosurePackageAckClosurePackageNotes'
  | 'closeoutNotificationClosurePackageAckClosurePackageReviewers'
  | 'closeoutNotificationClosurePackageAckClosureReviewer'
  | 'closeoutNotificationClosurePackageAckClosureStatus'
  | 'closeoutNotificationClosurePackageAckNotes'
  | 'closeoutNotificationClosurePackageAckReviewer'
  | 'closeoutNotificationClosurePackageAckReviewerRole'
  | 'closeoutNotificationClosurePackageAckStatus'
  | 'closeoutNotificationClosurePackageAckSupersededEvidence'
  | 'closeoutNotificationClosurePackageAcknowledgedDeliveryIds'
  | 'closeoutNotificationClosurePackageAcknowledgementActionList'
  | 'closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgedDeliveryIds'
  | 'closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementActionList'
  | 'closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementMetrics'
  | 'closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRequest'
  | 'closeoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryRecords'
  | 'closeoutNotificationClosurePackageAcknowledgementClosurePackageMetrics'
  | 'closeoutNotificationClosurePackageAcknowledgementClosurePackageRequiredActions'
  | 'closeoutNotificationClosurePackageAcknowledgementClosurePackageStatus'
  | 'closeoutNotificationClosurePackageAcknowledgementClosureRequest'
  | 'closeoutNotificationClosurePackageAcknowledgementClosureStatus'
  | 'closeoutNotificationClosurePackageAcknowledgementMetrics'
  | 'closeoutNotificationClosurePackageAcknowledgementRequest'
  | 'closeoutNotificationClosurePackageAcknowledgementSupersededEvidenceList'
  | 'closeoutNotificationClosurePackageDeliveryRecords'
  | 'closeoutNotificationClosurePackageMetrics'
  | 'closeoutNotificationClosurePackageNotes'
  | 'closeoutNotificationClosurePackageReady'
  | 'closeoutNotificationClosurePackageRequiredActions'
  | 'closeoutNotificationClosurePackageReviewers'
  | 'closeoutNotificationClosurePackageStatus'
  | 'closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRecords'
  | 'closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageRecords'
  | 'closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords'
  | 'closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementRecords'
  | 'closurePackageAcknowledgementCloseoutNotificationClosurePackageRecords'
  | 'closurePackageAcknowledgementCloseoutNotificationClosureRecords'
  | 'closureSlaDeliveryAcknowledgementLabel'
  | 'closureSlaDeliveryAcknowledgementStatusLevel'
  | 'closureSlaFollowUpClosureLabel'
  | 'closureSlaFollowUpClosureStatusLevel'
  | 'latestCloseoutNotificationClosurePackage'
  | 'latestCloseoutNotificationClosurePackageAcknowledgement'
  | 'latestCloseoutNotificationClosurePackageAcknowledgementClosure'
  | 'latestCloseoutNotificationClosurePackageAcknowledgementClosurePackage'
  | 'latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement'
  | 'latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageDelivery'
  | 'latestCloseoutNotificationClosurePackageDelivery'
  | 'onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackage'
  | 'onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage'
  | 'onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackage'
  | 'onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement'
  | 'onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosure'
  | 'onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage'
  | 'onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement'
  | 'setCloseoutNotificationClosurePackageAckActions'
  | 'setCloseoutNotificationClosurePackageAckClosureActions'
  | 'setCloseoutNotificationClosurePackageAckClosureNotes'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageAckActions'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageAckNotes'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageAckReviewer'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageAckReviewerRole'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageAckStatus'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageNotes'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageReviewers'
  | 'setCloseoutNotificationClosurePackageAckClosureReviewer'
  | 'setCloseoutNotificationClosurePackageAckClosureStatus'
  | 'setCloseoutNotificationClosurePackageAckNotes'
  | 'setCloseoutNotificationClosurePackageAckReviewer'
  | 'setCloseoutNotificationClosurePackageAckReviewerRole'
  | 'setCloseoutNotificationClosurePackageAckStatus'
  | 'setCloseoutNotificationClosurePackageAckSupersededEvidence'
  | 'setCloseoutNotificationClosurePackageNotes'
  | 'setCloseoutNotificationClosurePackageReady'
  | 'setCloseoutNotificationClosurePackageReviewers'

type BackendCloseoutNotificationClosurePackageDeliveryCardProps = {
  closeoutExports: Record<CloseoutNotificationClosurePackageDeliveryPropKey, RuntimeValue>
  nestedDeliveryFinalEvidence: Record<string, RuntimeValue>
}

export function BackendCloseoutNotificationClosurePackageDeliveryCard({
  closeoutExports,
  nestedDeliveryFinalEvidence,
}: BackendCloseoutNotificationClosurePackageDeliveryCardProps) {
  const {
    buildCloseoutNotificationClosurePackage,
    buildCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
    closeoutNotificationClosurePackageAckActions,
    closeoutNotificationClosurePackageAckClosureActions,
    closeoutNotificationClosurePackageAckClosureNotes,
    closeoutNotificationClosurePackageAckClosurePackageAckActions,
    closeoutNotificationClosurePackageAckClosurePackageAckNotes,
    closeoutNotificationClosurePackageAckClosurePackageAckReviewer,
    closeoutNotificationClosurePackageAckClosurePackageAckReviewerRole,
    closeoutNotificationClosurePackageAckClosurePackageAckStatus,
    closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady,
    closeoutNotificationClosurePackageAckClosurePackageNotes,
    closeoutNotificationClosurePackageAckClosurePackageReviewers,
    closeoutNotificationClosurePackageAckClosureReviewer,
    closeoutNotificationClosurePackageAckClosureStatus,
    closeoutNotificationClosurePackageAckNotes,
    closeoutNotificationClosurePackageAckReviewer,
    closeoutNotificationClosurePackageAckReviewerRole,
    closeoutNotificationClosurePackageAckStatus,
    closeoutNotificationClosurePackageAckSupersededEvidence,
    closeoutNotificationClosurePackageAcknowledgedDeliveryIds,
    closeoutNotificationClosurePackageAcknowledgementActionList,
    closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgedDeliveryIds,
    closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementActionList,
    closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementMetrics,
    closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRequest,
    closeoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryRecords,
    closeoutNotificationClosurePackageAcknowledgementClosurePackageMetrics,
    closeoutNotificationClosurePackageAcknowledgementClosurePackageRequiredActions,
    closeoutNotificationClosurePackageAcknowledgementClosurePackageStatus,
    closeoutNotificationClosurePackageAcknowledgementClosureRequest,
    closeoutNotificationClosurePackageAcknowledgementClosureStatus,
    closeoutNotificationClosurePackageAcknowledgementMetrics,
    closeoutNotificationClosurePackageAcknowledgementRequest,
    closeoutNotificationClosurePackageAcknowledgementSupersededEvidenceList,
    closeoutNotificationClosurePackageDeliveryRecords,
    closeoutNotificationClosurePackageMetrics,
    closeoutNotificationClosurePackageNotes,
    closeoutNotificationClosurePackageReady,
    closeoutNotificationClosurePackageRequiredActions,
    closeoutNotificationClosurePackageReviewers,
    closeoutNotificationClosurePackageStatus,
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRecords,
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageRecords,
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosureRecords,
    closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementRecords,
    closurePackageAcknowledgementCloseoutNotificationClosurePackageRecords,
    closurePackageAcknowledgementCloseoutNotificationClosureRecords,
    closureSlaDeliveryAcknowledgementLabel,
    closureSlaDeliveryAcknowledgementStatusLevel,
    closureSlaFollowUpClosureLabel,
    closureSlaFollowUpClosureStatusLevel,
    latestCloseoutNotificationClosurePackage,
    latestCloseoutNotificationClosurePackageAcknowledgement,
    latestCloseoutNotificationClosurePackageAcknowledgementClosure,
    latestCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
    latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement,
    latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageDelivery,
    latestCloseoutNotificationClosurePackageDelivery,
    onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackage,
    onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
    onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackage,
    onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgement,
    onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosure,
    onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
    onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement,
    setCloseoutNotificationClosurePackageAckActions,
    setCloseoutNotificationClosurePackageAckClosureActions,
    setCloseoutNotificationClosurePackageAckClosureNotes,
    setCloseoutNotificationClosurePackageAckClosurePackageAckActions,
    setCloseoutNotificationClosurePackageAckClosurePackageAckNotes,
    setCloseoutNotificationClosurePackageAckClosurePackageAckReviewer,
    setCloseoutNotificationClosurePackageAckClosurePackageAckReviewerRole,
    setCloseoutNotificationClosurePackageAckClosurePackageAckStatus,
    setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady,
    setCloseoutNotificationClosurePackageAckClosurePackageNotes,
    setCloseoutNotificationClosurePackageAckClosurePackageReviewers,
    setCloseoutNotificationClosurePackageAckClosureReviewer,
    setCloseoutNotificationClosurePackageAckClosureStatus,
    setCloseoutNotificationClosurePackageAckNotes,
    setCloseoutNotificationClosurePackageAckReviewer,
    setCloseoutNotificationClosurePackageAckReviewerRole,
    setCloseoutNotificationClosurePackageAckStatus,
    setCloseoutNotificationClosurePackageAckSupersededEvidence,
    setCloseoutNotificationClosurePackageNotes,
    setCloseoutNotificationClosurePackageReady,
    setCloseoutNotificationClosurePackageReviewers,
  } = closeoutExports

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
                      closeoutExports={{
                        buildCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
                        closeoutNotificationClosurePackageAckClosurePackageAckActions,
                        closeoutNotificationClosurePackageAckClosurePackageAckNotes,
                        closeoutNotificationClosurePackageAckClosurePackageAckReviewer,
                        closeoutNotificationClosurePackageAckClosurePackageAckReviewerRole,
                        closeoutNotificationClosurePackageAckClosurePackageAckStatus,
                        closeoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady,
                        closeoutNotificationClosurePackageAckClosurePackageNotes,
                        closeoutNotificationClosurePackageAckClosurePackageReviewers,
                        closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgedDeliveryIds,
                        closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementActionList,
                        closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementMetrics,
                        closeoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRequest,
                        closeoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryRecords,
                        closeoutNotificationClosurePackageAcknowledgementClosurePackageMetrics,
                        closeoutNotificationClosurePackageAcknowledgementClosurePackageRequiredActions,
                        closeoutNotificationClosurePackageAcknowledgementClosurePackageStatus,
                        closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementRecords,
                        closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageRecords,
                        closureSlaDeliveryAcknowledgementLabel,
                        closureSlaDeliveryAcknowledgementStatusLevel,
                        latestCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
                        latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement,
                        latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageDelivery,
                        onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
                        onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage,
                        onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement,
                        setCloseoutNotificationClosurePackageAckClosurePackageAckActions,
                        setCloseoutNotificationClosurePackageAckClosurePackageAckNotes,
                        setCloseoutNotificationClosurePackageAckClosurePackageAckReviewer,
                        setCloseoutNotificationClosurePackageAckClosurePackageAckReviewerRole,
                        setCloseoutNotificationClosurePackageAckClosurePackageAckStatus,
                        setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady,
                        setCloseoutNotificationClosurePackageAckClosurePackageNotes,
                        setCloseoutNotificationClosurePackageAckClosurePackageReviewers,
                      }}
                      finalEvidence={nestedDeliveryFinalEvidence}
                    />
                  </div>
  )
}
