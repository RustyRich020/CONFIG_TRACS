import type {
  BackendRecord,
  PostgresCutoverAcknowledgement,
  PostgresCutoverAcknowledgementStatus,
  PostgresCutoverChecklistPackage,
  PostgresCutoverClosurePackage,
  PostgresCutoverOwnerReminder,
  PostgresCutoverOwnerReminderStatus,
  PostgresCutoverReminderClosure,
  PostgresCutoverReminderClosureStatus,
} from '../types'
import { HistoryRow } from './common'
import { titleize } from './formatters'

export function PostgresCutoverPackageHistoryPanel({
  records,
}: {
  records: BackendRecord<PostgresCutoverChecklistPackage>[]
}) {
  if (records.length <= 1) return null

  return (
    <div className="mapping-run-history">
      <h4>Package history</h4>
      {records.slice(1, 5).map((record) => (
        <HistoryRow
          key={record.id}
          label={record.status}
          status={record.status}
          subtitle={`v${record.version} / ${new Date(record.createdAt).toLocaleString()} / ${record.payload.reviewerAudience.join(', ')}`}
          title={record.payload.packageId}
        />
      ))}
    </div>
  )
}

export function PostgresCutoverAcknowledgementHistoryPanel({
  labelStatus,
  records,
}: {
  labelStatus: (status: PostgresCutoverAcknowledgementStatus) => string
  records: BackendRecord<PostgresCutoverAcknowledgement>[]
}) {
  if (records.length <= 1) return null

  return (
    <div className="mapping-run-history">
      <h4>Acknowledgement history</h4>
      {records.slice(1, 5).map((record) => (
        <HistoryRow
          key={record.id}
          label={labelStatus(record.payload.status)}
          status={record.status}
          subtitle={`v${record.version} / ${titleize(record.payload.reviewerRole)} / due ${record.payload.dueAt || 'not scheduled'}`}
          title={record.payload.reviewer}
        >
          {record.payload.acknowledgementNotes}
        </HistoryRow>
      ))}
    </div>
  )
}

export function PostgresCutoverOwnerReminderHistoryPanel({
  labelStatus,
  records,
}: {
  labelStatus: (status: PostgresCutoverOwnerReminderStatus) => string
  records: BackendRecord<PostgresCutoverOwnerReminder>[]
}) {
  if (records.length <= 1) return null

  return (
    <div className="mapping-run-history">
      <h4>Owner reminder history</h4>
      {records.slice(1, 5).map((record) => (
        <HistoryRow
          key={record.id}
          label={labelStatus(record.payload.status)}
          status={record.status}
          subtitle={`v${record.version} / ${labelStatus(record.payload.status)} / due ${record.payload.dueAt || 'not scheduled'}`}
          title={record.payload.owners.join(', ')}
        >
          {record.payload.renewalNotes}
        </HistoryRow>
      ))}
    </div>
  )
}

export function PostgresCutoverReminderClosureHistoryPanel({
  labelStatus,
  records,
}: {
  labelStatus: (status: PostgresCutoverReminderClosureStatus) => string
  records: BackendRecord<PostgresCutoverReminderClosure>[]
}) {
  if (records.length <= 1) return null

  return (
    <div className="mapping-run-history">
      <h4>Reminder closure history</h4>
      {records.slice(1, 5).map((record) => (
        <HistoryRow
          key={record.id}
          label={labelStatus(record.payload.status)}
          status={record.status}
          subtitle={`v${record.version} / ${labelStatus(record.payload.status)} / package ${
            record.payload.packageVersion ? `v${record.payload.packageVersion}` : 'not linked'
          }`}
          title={record.payload.reviewer}
        >
          {record.payload.closureNotes}
        </HistoryRow>
      ))}
    </div>
  )
}

export function PostgresCutoverClosurePackageHistoryPanel({
  records,
}: {
  records: BackendRecord<PostgresCutoverClosurePackage>[]
}) {
  if (records.length <= 1) return null

  return (
    <div className="mapping-run-history">
      <h4>Final handoff package history</h4>
      {records.slice(1, 5).map((record) => (
        <HistoryRow
          key={record.id}
          label={record.status}
          status={record.status}
          subtitle={`v${record.version} / ${new Date(record.createdAt).toLocaleString()} / ${record.payload.finalHandoffReviewers.join(', ')}`}
          title={record.payload.packageId}
        >
          {record.payload.evidence}
        </HistoryRow>
      ))}
    </div>
  )
}
