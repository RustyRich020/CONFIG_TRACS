import { Database, History } from 'lucide-react'
import type { BackendRecord, PostgresImportReconciliation } from '../types'
import { HistoryRow, Metadata, PanelHeader, StatusChip } from './common'
import { titleize } from './formatters'

export function PostgresImportReconciliationPanel({
  latestReconciliation,
  latestTopKinds,
  reconciliationRecords,
  reconciliationTotals,
}: {
  latestReconciliation?: BackendRecord<PostgresImportReconciliation>
  latestTopKinds: Array<[string, number]>
  reconciliationRecords: BackendRecord<PostgresImportReconciliation>[]
  reconciliationTotals: {
    read: number
    importable: number
    imported: number
    skipped: number
    invalid: number
  }
}) {
  return (
    <>
      <section className="panel import-reconciliation-panel">
        <PanelHeader
          icon={Database}
          title="Postgres Import Reconciliation"
          subtitle="Review guarded JSON or SQLite import runs before retiring legacy storage."
        />
        {latestReconciliation ? (
          <>
            <div className="import-reconciliation-grid">
              <article className="import-reconciliation-card primary">
                <div>
                  <strong>{titleize(latestReconciliation.payload.mode)}</strong>
                  <span>{latestReconciliation.payload.sourceFile}</span>
                </div>
                <StatusChip status={latestReconciliation.status} label={latestReconciliation.status} />
                <p>{latestReconciliation.payload.evidence}</p>
              </article>
              <article className="import-reconciliation-card">
                <strong>{latestReconciliation.payload.read}</strong>
                <span>Records read</span>
              </article>
              <article className="import-reconciliation-card">
                <strong>{latestReconciliation.payload.importable}</strong>
                <span>Importable</span>
              </article>
              <article className="import-reconciliation-card">
                <strong>{latestReconciliation.payload.imported}</strong>
                <span>Imported</span>
              </article>
              <article className="import-reconciliation-card">
                <strong>{latestReconciliation.payload.skipped}</strong>
                <span>Skipped</span>
              </article>
              <article className="import-reconciliation-card">
                <strong>{latestReconciliation.payload.invalid}</strong>
                <span>Invalid</span>
              </article>
            </div>
            <div className="import-reconciliation-detail">
              <div>
                <h4>Latest record mix</h4>
                <div className="storage-column-list">
                  {latestTopKinds.map(([kind, count]) => (
                    <span key={kind}>
                      {titleize(kind)} <em>{count}</em>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4>Aggregate run totals</h4>
                <div className="metadata-grid">
                  <Metadata label="Runs" value={String(reconciliationRecords.length)} />
                  <Metadata label="Read" value={String(reconciliationTotals.read)} />
                  <Metadata label="Importable" value={String(reconciliationTotals.importable)} />
                  <Metadata label="Imported" value={String(reconciliationTotals.imported)} />
                  <Metadata label="Skipped" value={String(reconciliationTotals.skipped)} />
                  <Metadata label="Invalid" value={String(reconciliationTotals.invalid)} />
                </div>
              </div>
            </div>
            {latestReconciliation.payload.invalidRecords.length > 0 ? (
              <div className="import-reconciliation-errors">
                <h4>Invalid record samples</h4>
                {latestReconciliation.payload.invalidRecords.map((entry) => (
                  <div className="backend-record-row" key={`${entry.id}:${entry.label}`}>
                    <div>
                      <strong>{entry.label || entry.id || 'Unnamed record'}</strong>
                      <span>{entry.missing.join(', ')}</span>
                    </div>
                    <StatusChip status="blocking" label="Invalid" />
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="empty-state compact">Run `npm run records:import:postgres` to persist reconciliation evidence.</div>
        )}
      </section>

      <section className="panel import-reconciliation-panel">
        <PanelHeader
          icon={History}
          title="Import Reconciliation History"
          subtitle="Recent dry-run and applied migration summaries retained in Postgres."
        />
        {reconciliationRecords.length > 0 ? (
          <div className="backend-record-list">
            {reconciliationRecords.slice(0, 8).map((record) => (
              <HistoryRow
                key={record.id}
                label={record.status}
                status={record.status}
                subtitle={`v${record.version} / ${new Date(record.createdAt).toLocaleString()} / read ${record.payload.read}, importable ${record.payload.importable}, skipped ${record.payload.skipped}`}
                title={`${titleize(record.payload.source)} import / ${titleize(record.payload.mode)}`}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state compact">No import reconciliation runs have been retained yet.</div>
        )}
      </section>
    </>
  )
}
