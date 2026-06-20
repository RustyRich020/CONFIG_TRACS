import { ConnectorRunRow } from '../../components/common'

type RuntimeValue = ReturnType<typeof JSON.parse>

type BackendCloseoutNotificationClosurePackageDeliveryEvidenceCardProps = {
  closeoutExports: {
    closeoutNotificationClosurePackageDeliveryRecords: RuntimeValue[]
  }
}

export function BackendCloseoutNotificationClosurePackageDeliveryEvidenceCard({
  closeoutExports,
}: BackendCloseoutNotificationClosurePackageDeliveryEvidenceCardProps) {
  const { closeoutNotificationClosurePackageDeliveryRecords } = closeoutExports

  return (
    <>
                    {closeoutNotificationClosurePackageDeliveryRecords.length > 0 ? (
                      <div className="retry-aging-list">
                        <h4>Closeout acknowledgement closure package delivery evidence</h4>
                        {closeoutNotificationClosurePackageDeliveryRecords.slice(0, 3).map((record: RuntimeValue) => (
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
