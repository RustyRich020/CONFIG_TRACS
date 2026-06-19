import {
Download,
History
} from 'lucide-react'
import { PanelHeader,StatusChip } from '../components/common'
import { titleize } from '../components/formatters'
import {
downloadJson
} from '../foundation'
import type {
SavedVersion
} from '../types'
export function SavedVersionsView({ savedVersions }: { savedVersions: SavedVersion[] }) {
  const counts = savedVersions.reduce(
    (summary, version) => {
      summary[version.kind] = (summary[version.kind] ?? 0) + 1
      return summary
    },
    {} as Record<string, number>,
  )

  function downloadVersion(version: SavedVersion) {
    downloadJson(`tracs-${version.kind}-${version.createdAt.slice(0, 10)}.json`, version)
  }

  return (
    <>
      <section className="connector-toolbar panel">
        <div>
          <h2>Saved Version Registry</h2>
          <p>
            Browser-persisted records for connector test runs, mapping validations, mapping manifest versions, and exported contracts.
          </p>
        </div>
        <div className="version-summary">
          <span>{savedVersions.length} saved</span>
          <span>{counts.connector_test ?? 0} connector</span>
          <span>{counts.mapping_validation ?? 0} mapping</span>
          <span>{counts.integration_contract ?? 0} contract</span>
        </div>
      </section>

      <section className="panel versions-panel">
        <PanelHeader
          icon={History}
          title="Version History"
          subtitle="Records are stored locally for this prototype and can be exported individually."
        />
        {savedVersions.length > 0 ? (
          <div className="versions-table">
            <div className="version-row version-head">
              <span>Type</span>
              <span>Label</span>
              <span>Status</span>
              <span>Saved</span>
              <span>Summary</span>
              <span>Export</span>
            </div>
            {savedVersions.map((version) => (
              <div className="version-row" key={version.id}>
                <strong>{titleize(version.kind)}</strong>
                <span>{version.label}</span>
                <StatusChip status={version.status} label={version.status} />
                <span>{new Date(version.createdAt).toLocaleString()}</span>
                <span>{version.summary}</span>
                <button className="icon-action" onClick={() => downloadVersion(version)} type="button">
                  <Download size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            Run connector tests, validate a mapping, or export a contract to create saved versions.
          </div>
        )}
      </section>
    </>
  )
}

