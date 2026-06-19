import { StatusChip } from '../../components/common'

type RuntimeValue = ReturnType<typeof JSON.parse>

type BackendCloseoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryEvidenceCardProps = {
  closeoutExports: {
    closeoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryRecords: RuntimeValue[]
  }
}

export function BackendCloseoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryEvidenceCard({
  closeoutExports,
}: BackendCloseoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryEvidenceCardProps) {
  const { closeoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryRecords } = closeoutExports

  return (
    <>
                      {closeoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryRecords.length > 0 ? (
                        <div className="retry-aging-list">
                          <h4>Closeout acknowledgement closeout package delivery evidence</h4>
                          {closeoutNotificationClosurePackageAcknowledgementClosurePackageDeliveryRecords
                            .slice(0, 3)
                            .map((record: RuntimeValue) => (
                              <div className="connector-run-row" key={record.id}>
                                <div>
                                  <strong>{record.payload.request.subject}</strong>
                                  <span>
                                    v{record.version} / {new Date(record.createdAt).toLocaleString()} / {record.payload.request.recipients.join(', ')}
                                  </span>
                                  <small>{record.payload.result.evidence}</small>
                                </div>
                                <StatusChip status={record.status} label={record.status} />
                              </div>
                            ))}
                        </div>
                      ) : null}
    </>
  )
}
