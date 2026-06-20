import { ConnectorRunRow } from '../../components/common'

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
                              <ConnectorRunRow
                                key={record.id}
                                status={record.status}
                                label={record.status}
                                title={record.payload.request.subject}
                                subtitle={`v${record.version} / ${new Date(record.createdAt).toLocaleString()} / ${record.payload.request.recipients.join(', ')}`}
                              >
                                {record.payload.result.evidence}
                              </ConnectorRunRow>
                            ))}
                        </div>
                      ) : null}
    </>
  )
}
