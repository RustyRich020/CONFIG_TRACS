import type {
  BackendRecord,
  ClosureSlaDeliveryAcknowledgement,
  ClosureSlaExportPackage,
  ClosureSlaExportRow,
} from '../types'
import { HistoryRow } from './common'
import { titleize } from './formatters'

function acknowledgementLabel(status: ClosureSlaDeliveryAcknowledgement['status']) {
  return titleize(status)
}

function dueLabel(row: ClosureSlaExportRow) {
  if (row.daysRemaining === null) return 'no due date'
  if (row.daysRemaining < 0) return `${Math.abs(row.daysRemaining)} day(s) overdue`
  return `${row.daysRemaining} day(s) remaining`
}

export function ClosureSlaHistoryListsPanel({
  acknowledgementRecords,
  exportPackageRecords,
  rows,
}: {
  acknowledgementRecords: BackendRecord<ClosureSlaDeliveryAcknowledgement>[]
  exportPackageRecords: BackendRecord<ClosureSlaExportPackage>[]
  rows: ClosureSlaExportRow[]
}) {
  return (
    <>
      {acknowledgementRecords.length > 1 ? (
        <div className="mapping-run-history">
          <h4>Governance response history</h4>
          {acknowledgementRecords.slice(1, 5).map((record) => (
            <HistoryRow
              key={record.id}
              label={acknowledgementLabel(record.payload.status)}
              status={record.status}
              subtitle={`v${record.version} / ${acknowledgementLabel(record.payload.status)} / ${titleize(record.payload.routeStage)}`}
              title={record.payload.reviewer}
            >
              {record.payload.responseNotes}
            </HistoryRow>
          ))}
        </div>
      ) : null}

      {rows.length > 0 ? (
        <div className="mapping-run-history">
          <h4>Closure SLA queue</h4>
          {rows.slice(0, 8).map((row) => (
            <HistoryRow
              key={row.id}
              label={row.closed ? 'closed' : row.status}
              status={row.status}
              subtitle={`${row.source} / ${row.stage} / ${row.owner}`}
              title={row.subject}
            >
              Due {row.dueAt || 'not scheduled'} / {dueLabel(row)} / {row.evidence}
            </HistoryRow>
          ))}
        </div>
      ) : (
        <div className="empty-state compact">No closure SLA routes are available yet.</div>
      )}

      {exportPackageRecords.length > 1 ? (
        <div className="mapping-run-history">
          <h4>SLA package history</h4>
          {exportPackageRecords.slice(1, 5).map((record) => (
            <HistoryRow
              key={record.id}
              label={record.status}
              status={record.status}
              subtitle={`v${record.version} / ${new Date(record.createdAt).toLocaleString()} / ${record.payload.governanceReviewers.join(', ')}`}
              title={record.payload.packageId}
            >
              {record.payload.evidence}
            </HistoryRow>
          ))}
        </div>
      ) : null}
    </>
  )
}
