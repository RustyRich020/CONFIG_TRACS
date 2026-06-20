import { lazy, Suspense } from 'react'
import { Bell, ClipboardCheck, Download } from 'lucide-react'
import { ConnectorRunRow, DashboardHeading, Metadata } from '../../components/common'
import { BackendCloseoutAcknowledgementCloseoutPackageAcknowledgementCard } from './BackendCloseoutAcknowledgementCloseoutPackageAcknowledgementCard'
import { BackendCloseoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryEvidenceCard } from './BackendCloseoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryEvidenceCard'

const BackendFinalEvidenceCloseoutPanel = lazy(() =>
  import('./BackendFinalEvidenceCloseoutPanel').then((module) => ({
    default: module.BackendFinalEvidenceCloseoutPanel,
  })),
)

type RuntimeValue = ReturnType<typeof JSON.parse>

type CloseoutNotificationClosurePackageAcknowledgementClosurePackageControlsKey =
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

type CloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementKey =
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
  | 'closureSlaDeliveryAcknowledgementLabel'
  | 'closureSlaDeliveryAcknowledgementStatusLevel'
  | 'latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement'
  | 'onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgement'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageAckActions'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageAckNotes'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageAckReviewer'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageAckReviewerRole'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageAckStatus'
  | 'setCloseoutNotificationClosurePackageAckClosurePackageFinalEvidenceReady'

type BackendCloseoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryCardProps = {
  packageControls: Record<CloseoutNotificationClosurePackageAcknowledgementClosurePackageControlsKey, RuntimeValue>
  acknowledgement: Record<CloseoutNotificationClosurePackageAcknowledgementClosurePackageAcknowledgementKey, RuntimeValue>
  finalEvidence: Record<string, RuntimeValue>
}

export function BackendCloseoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryCard({
  packageControls,
  acknowledgement,
  finalEvidence,
}: BackendCloseoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryCardProps) {
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
  } = packageControls
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
  } = acknowledgement

  return (
                    <div className="retry-aging-list">
                      <DashboardHeading
                        status={closeoutNotificationClosurePackageAcknowledgementClosurePackageStatus}
                        label={closeoutNotificationClosurePackageAcknowledgementClosurePackageStatus}
                        title="Closeout acknowledgement closeout package delivery"
                      />
                      <div className="trace-review-grid">
                        <label className="trace-review-rationale">
                          <span>Closeout package reviewers</span>
                          <textarea
                            value={closeoutNotificationClosurePackageAckClosurePackageReviewers}
                            onChange={(event) =>
                              setCloseoutNotificationClosurePackageAckClosurePackageReviewers(event.target.value)
                            }
                          />
                        </label>
                        <label className="trace-review-rationale">
                          <span>Package notes</span>
                          <textarea
                            value={closeoutNotificationClosurePackageAckClosurePackageNotes}
                            onChange={(event) =>
                              setCloseoutNotificationClosurePackageAckClosurePackageNotes(event.target.value)
                            }
                          />
                        </label>
                      </div>
                      <div className="toolbar-actions notification-approval-actions">
                        <button
                          className="primary-action"
                          onClick={() =>
                            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage({
                              download: false,
                              packagePayload:
                                buildCloseoutNotificationClosurePackageAcknowledgementClosurePackage(),
                            })
                          }
                          type="button"
                        >
                          <ClipboardCheck size={15} />
                          Save Closeout Package
                        </button>
                        <button
                          className="secondary-action"
                          onClick={() =>
                            onSaveClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage({
                              download: true,
                              packagePayload:
                                buildCloseoutNotificationClosurePackageAcknowledgementClosurePackage(),
                            })
                          }
                          type="button"
                        >
                          <Download size={15} />
                          Save & Download Closeout Package
                        </button>
                        <button
                          className="secondary-action"
                          onClick={() =>
                            onDeliverClosurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackage({
                              download: false,
                              packagePayload:
                                buildCloseoutNotificationClosurePackageAcknowledgementClosurePackage(),
                            })
                          }
                          type="button"
                        >
                          <Bell size={15} />
                          Save & Notify Closeout Owners
                        </button>
                      </div>
                      <div className="metadata-grid">
                        <Metadata
                          label="Closeout packages"
                          value={String(
                            closurePackageAcknowledgementCloseoutNotificationClosurePackageAcknowledgementClosurePackageRecords.length,
                          )}
                        />
                        <Metadata
                          label="Acknowledgement closeouts"
                          value={String(
                            closeoutNotificationClosurePackageAcknowledgementClosurePackageMetrics.closeoutRecords,
                          )}
                        />
                        <Metadata
                          label="Closed"
                          value={String(
                            closeoutNotificationClosurePackageAcknowledgementClosurePackageMetrics.closed,
                          )}
                        />
                        <Metadata
                          label="Closed with actions"
                          value={String(
                            closeoutNotificationClosurePackageAcknowledgementClosurePackageMetrics.closedWithActions,
                          )}
                        />
                        <Metadata
                          label="Required actions"
                          value={String(
                            closeoutNotificationClosurePackageAcknowledgementClosurePackageRequiredActions().length,
                          )}
                        />
                        <Metadata
                          label="Package deliveries"
                          value={String(
                            closeoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryRecords.length,
                          )}
                        />
                        <Metadata
                          label="Latest delivery"
                          value={
                            latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageDelivery
                              ? new Date(
                                  latestCloseoutNotificationClosurePackageAcknowledgementClosurePackageDelivery.createdAt,
                                ).toLocaleString()
                              : 'Not delivered'
                          }
                        />
                      </div>
                      {latestCloseoutNotificationClosurePackageAcknowledgementClosurePackage ? (
                        <ConnectorRunRow
                          status={latestCloseoutNotificationClosurePackageAcknowledgementClosurePackage.status}
                          label={latestCloseoutNotificationClosurePackageAcknowledgementClosurePackage.status}
                          title={latestCloseoutNotificationClosurePackageAcknowledgementClosurePackage.payload.closeoutReviewers.join(
                            ', ',
                          )}
                          subtitle={`v${latestCloseoutNotificationClosurePackageAcknowledgementClosurePackage.version} / ${new Date(
                            latestCloseoutNotificationClosurePackageAcknowledgementClosurePackage.createdAt,
                          ).toLocaleString()} / ${latestCloseoutNotificationClosurePackageAcknowledgementClosurePackage.payload.metrics.closeoutRecords} acknowledgement closeout record(s)`}
                        >
                          {latestCloseoutNotificationClosurePackageAcknowledgementClosurePackage.payload.evidence}
                        </ConnectorRunRow>
                      ) : (
                        <div className="empty-state compact">No closeout acknowledgement closeout package has been retained yet.</div>
                      )}
                      <BackendCloseoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryEvidenceCard
                        closeoutExports={{
                          closeoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryRecords,
                        }}
                      />
                      <BackendCloseoutAcknowledgementCloseoutPackageAcknowledgementCard
                        closeoutExports={{
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
                        }}
                      />
          <Suspense fallback={<div className="empty-state compact">Loading final evidence closeout...</div>}>
            <BackendFinalEvidenceCloseoutPanel finalEvidence={finalEvidence} />
          </Suspense>
                    </div>
  )
}
