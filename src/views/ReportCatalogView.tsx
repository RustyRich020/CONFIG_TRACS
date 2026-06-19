import {
Bell,
CheckCircle2,
ExternalLink,
FileCog,
PlugZap,
ServerCog,
ShieldCheck
} from 'lucide-react'
import { useState } from 'react'
import { Metadata,PanelHeader,StatusChip } from '../components/common'
import { titleize } from '../components/formatters'
import {
downloadJson
} from '../foundation'
import type {
BackendRecord,
CanonicalObject,
NotificationDeliveryPayload,
NotificationDeliveryResult,
ReportCatalogItem,

StatusLevel
} from '../types'
type ReportCatalogSaveAction = 'draft' | 'publish' | 'signoff'


function reportFreshnessStatus(lastRefresh: string, maxAgeHours: number) {
  const ageHours = (Date.now() - Date.parse(lastRefresh)) / 36e5
  if (!Number.isFinite(ageHours)) {
    return {
      refreshStatus: 'blocking' as StatusLevel,
      freshnessEvidence: 'Last refresh timestamp is missing or invalid.',
    }
  }
  const roundedAge = Math.max(0, Math.round(ageHours * 10) / 10)
  return {
    refreshStatus: ageHours <= maxAgeHours ? 'pass' as StatusLevel : 'warning' as StatusLevel,
    freshnessEvidence: `Last refreshed ${roundedAge} hour(s) ago; threshold is ${maxAgeHours} hour(s).`,
  }
}


function evaluateReportPublishGate(report: ReportCatalogItem, canonicalObjects: CanonicalObject[]) {
  const availableObjectTypes = new Set(canonicalObjects.map((object) => object.objectType))
  const missingDependencies = report.sourceDependencies.filter(
    (dependency) => !availableObjectTypes.has(dependency),
  )
  const blockers = [
    report.refreshStatus === 'pass' ? null : `freshness status is ${report.refreshStatus}`,
    missingDependencies.length > 0 ? `missing canonical dependencies: ${missingDependencies.join(', ')}` : null,
  ].filter((item): item is string => Boolean(item))
  return {
    status: blockers.length > 0 ? 'blocking' as StatusLevel : 'pass' as StatusLevel,
    evidence:
      blockers.length > 0
        ? `Publish blocked because ${blockers.join('; ')}.`
        : `Publish gate passed with ${report.sourceDependencies.length} canonical dependency check(s) and fresh report data.`,
  }
}


function createReportApprovalNotification(report: ReportCatalogItem) {
  const generatedAt = new Date().toISOString()
  const recipients = report.routedReviewers?.length
    ? report.routedReviewers
    : [report.approvalReviewer, report.owner].filter((recipient): recipient is string => Boolean(recipient))
  return {
    notificationId: `report_notice:${report.id}:${generatedAt}`,
    generatedAt,
    type: 'report_catalog_approval',
    reportId: report.id,
    title: report.title,
    owner: report.owner,
    workspace: report.workspace,
    semanticModel: report.semanticModel,
    routeStage: report.reviewerRouteStage ?? 'owner_review',
    recipients,
    dueAt: report.routeDueAt ?? '',
    approvalStatus: report.approvalStatus ?? 'pending',
    publishStatus: report.publishStatus ?? 'draft',
    freshnessStatus: report.refreshStatus,
    summary: `${report.title} is routed for ${reportRouteLabel(report.reviewerRouteStage)} with ${reportApprovalLabel(report.approvalStatus)} approval state.`,
    evidence: [
      report.freshnessEvidence,
      report.publishGateEvidence ?? 'Publish gate has not been run.',
      report.approvalRationale || 'No reviewer rationale recorded.',
    ],
    sourceDependencies: report.sourceDependencies,
  }
}


function notificationToDeliveryPayload(
  source: NotificationDeliveryPayload['source'],
  subject: string,
  notification: {
    notificationId: string
    recipients: string[]
    summary: string
  } & Record<string, unknown>,
): NotificationDeliveryPayload {
  return {
    deliveryId: `notification_delivery:${notification.notificationId}`,
    generatedAt: new Date().toISOString(),
    source,
    channels: ['email', 'teams', 'sharepoint_folder'],
    recipients: notification.recipients,
    subject,
    summary: notification.summary,
    evidence: notification,
  }
}

function reportApprovalLabel(status?: ReportCatalogItem['approvalStatus']) {
  return status ? titleize(status) : 'Not signed'
}


function reportRouteLabel(stage?: ReportCatalogItem['reviewerRouteStage']) {
  return stage ? titleize(stage) : 'Owner Review'
}


function reportApprovalStatusLevel(status: NonNullable<ReportCatalogItem['approvalStatus']>): StatusLevel {
  if (status === 'approved') return 'pass'
  if (status === 'rejected') return 'blocking'
  return 'warning'
}


export function ReportCatalogView({
  canonicalObjects,
  deliveryRecords,
  onDeliverNotifications,
  onSaveReport,
  reports,
}: {
  canonicalObjects: CanonicalObject[]
  deliveryRecords: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>[]
  onDeliverNotifications: (payload: NotificationDeliveryPayload) => void
  onSaveReport: (report: ReportCatalogItem, action: ReportCatalogSaveAction) => void
  reports: ReportCatalogItem[]
}) {
  const staleCount = reports.filter((report) => report.refreshStatus !== 'pass').length
  const [selectedReportId, setSelectedReportId] = useState(reports[0]?.id ?? '')
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0]
  const reportDeliveryRecords = deliveryRecords.filter(
    (record) => record.payload.request.source === 'report_catalog',
  )

  return (
    <>
      <section className="connector-toolbar panel">
        <div>
          <h2>Report Catalog</h2>
          <p>
            Governed BI launch points show owner, workspace, semantic model, freshness, and canonical dependencies.
          </p>
        </div>
        <div className="version-summary">
          <span>{reports.length} reports</span>
          <span>{staleCount} need review</span>
        </div>
        <div className="toolbar-actions">
          <button
            className="secondary-action"
            onClick={() =>
              downloadJson(
                'tracs-report-approval-notifications.json',
                reports.map(createReportApprovalNotification),
              )
            }
            type="button"
          >
            <Bell size={15} />
            Export Notices
          </button>
          <button
            className="secondary-action"
            onClick={() =>
              onDeliverNotifications(
                notificationToDeliveryPayload(
                  'report_catalog',
                  'TRACS report catalog approval notices',
                  {
                    notificationId: `report_catalog_batch:${new Date().toISOString()}`,
                    generatedAt: new Date().toISOString(),
                    type: 'report_catalog_approval',
                    reportId: 'batch',
                    title: 'Report catalog batch',
                    owner: 'TRACS',
                    workspace: 'Report Catalog',
                    semanticModel: 'Multiple',
                    routeStage: 'quality_review',
                    recipients: Array.from(
                      new Set(
                        reports.flatMap((report) =>
                          report.routedReviewers?.length
                            ? report.routedReviewers
                            : [report.approvalReviewer, report.owner].filter(
                                (recipient): recipient is string => Boolean(recipient),
                              ),
                        ),
                      ),
                    ),
                    dueAt: '',
                    approvalStatus: 'pending',
                    publishStatus: 'draft',
                    freshnessStatus: staleCount > 0 ? 'warning' : 'pass',
                    summary: `${reports.length} report catalog approval notice(s) prepared for delivery.`,
                    evidence: reports.map((report) => report.freshnessEvidence),
                    sourceDependencies: Array.from(new Set(reports.flatMap((report) => report.sourceDependencies))),
                  },
                ),
              )
            }
            type="button"
          >
            <PlugZap size={15} />
            Run Delivery
          </button>
        </div>
      </section>

      <section className="report-grid">
        {reports.map((report) => (
          <article className="panel report-card" key={report.id}>
            <div className="report-card-header">
              <div>
                <strong>{report.title}</strong>
                <span>{report.workspace} / {report.semanticModel}</span>
              </div>
              <StatusChip status={report.refreshStatus} label={report.refreshStatus} />
            </div>
            <div className="metadata-grid">
              <Metadata label="Platform" value={report.platform} />
              <Metadata label="Owner" value={report.owner} />
              <Metadata label="Last refresh" value={new Date(report.lastRefresh).toLocaleString()} />
              <Metadata label="Freshness SLA" value={`${report.maxAgeHours} hours`} />
              <Metadata label="Domains" value={report.domains.map(titleize).join(', ')} />
              <Metadata label="Freshness evidence" value={report.freshnessEvidence} />
              <Metadata label="Approval" value={reportApprovalLabel(report.approvalStatus)} />
              <Metadata label="Reviewer" value={report.approvalReviewer || 'Not assigned'} />
              <Metadata label="Route stage" value={reportRouteLabel(report.reviewerRouteStage)} />
              <Metadata label="Route due" value={report.routeDueAt || 'Not scheduled'} />
            </div>
            <div className="source-column-list report-dependencies">
              {report.sourceDependencies.map((dependency) => (
                <span className="chip active" key={dependency}>{dependency}</span>
              ))}
            </div>
            <div className="report-card-actions">
              <button className="secondary-action compact" onClick={() => setSelectedReportId(report.id)} type="button">
                <FileCog size={14} />
                Edit
              </button>
              <a className="secondary-link" href={report.url} target="_blank">
                <ExternalLink size={15} />
                Open Report
              </a>
            </div>
          </article>
        ))}
      </section>

      {selectedReport ? (
        <ReportCatalogEditor
          canonicalObjects={canonicalObjects}
          deliveryRecords={reportDeliveryRecords}
          key={selectedReport.id}
          onDeliverNotifications={onDeliverNotifications}
          onSave={onSaveReport}
          report={selectedReport}
        />
      ) : null}

      <section className="panel report-editor-panel">
        <PanelHeader
          icon={Bell}
          title="Report Notification Delivery Evidence"
          subtitle="Recent records for email, Teams, and SharePoint folder delivery contracts."
        />
        {reportDeliveryRecords.length > 0 ? (
          <div className="mapping-run-history">
            {reportDeliveryRecords.slice(0, 5).map((record) => (
              <div className="mapping-run-row" key={record.id}>
                <div>
                  <strong>{record.label}</strong>
                  <span>
                    v{record.version} / {new Date(record.createdAt).toLocaleString()} / {record.payload.result.evidence}
                  </span>
                  <small>
                    {record.payload.result.channelResults
                      .map((channel) => `${channel.channel}: ${channel.mode} ${channel.status}`)
                      .join(' / ')}
                  </small>
                </div>
                <StatusChip status={record.status} label={record.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No report notification delivery has been recorded yet.</div>
        )}
      </section>
    </>
  )
}

function ReportCatalogEditor({
  canonicalObjects,
  deliveryRecords,
  onDeliverNotifications,
  onSave,
  report,
}: {
  canonicalObjects: CanonicalObject[]
  deliveryRecords: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>[]
  onDeliverNotifications: (payload: NotificationDeliveryPayload) => void
  onSave: (report: ReportCatalogItem, action: ReportCatalogSaveAction) => void
  report: ReportCatalogItem
}) {
  const [title, setTitle] = useState(report.title)
  const [owner, setOwner] = useState(report.owner)
  const [workspace, setWorkspace] = useState(report.workspace)
  const [semanticModel, setSemanticModel] = useState(report.semanticModel)
  const [lastRefresh, setLastRefresh] = useState(report.lastRefresh)
  const [maxAgeHours, setMaxAgeHours] = useState(String(report.maxAgeHours))
  const [url, setUrl] = useState(report.url)
  const [dependencies, setDependencies] = useState(report.sourceDependencies.join(', '))
  const [domains, setDomains] = useState(report.domains.join(', '))
  const [approvalStatus, setApprovalStatus] = useState<NonNullable<ReportCatalogItem['approvalStatus']>>(
    report.approvalStatus ?? 'pending',
  )
  const [approvalReviewer, setApprovalReviewer] = useState(report.approvalReviewer ?? '')
  const [approvalRationale, setApprovalRationale] = useState(report.approvalRationale ?? '')
  const [reviewerRouteStage, setReviewerRouteStage] = useState<
    NonNullable<ReportCatalogItem['reviewerRouteStage']>
  >(report.reviewerRouteStage ?? 'owner_review')
  const [routedReviewers, setRoutedReviewers] = useState(report.routedReviewers?.join(', ') ?? '')
  const [routeDueAt, setRouteDueAt] = useState(report.routeDueAt ?? '')

  function splitCsv(value: string) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  function draftReport(): ReportCatalogItem {
    const freshness = reportFreshnessStatus(lastRefresh, Number(maxAgeHours) || report.maxAgeHours)
    return {
      ...report,
      title,
      owner,
      workspace,
      semanticModel,
      lastRefresh,
      maxAgeHours: Number(maxAgeHours) || report.maxAgeHours,
      url,
      sourceDependencies: splitCsv(dependencies),
      domains: splitCsv(domains),
      approvalStatus,
      approvalReviewer,
      approvalRationale,
      reviewerRouteStage,
      routedReviewers: splitCsv(routedReviewers),
      routeDueAt,
      ...freshness,
    }
  }

  const previewReport = draftReport()
  const gate = evaluateReportPublishGate(previewReport, canonicalObjects)
  const previewNotification = createReportApprovalNotification(previewReport)

  return (
    <section className="panel report-editor-panel">
      <PanelHeader
        icon={FileCog}
        title="Report Catalog Editor"
        subtitle="Edit governed report metadata and run publish gates before release."
      />
      <div className="report-editor-grid">
        <div className="template-editor-form">
          <label>
            <span>Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            <span>Owner</span>
            <input value={owner} onChange={(event) => setOwner(event.target.value)} />
          </label>
          <label>
            <span>Workspace</span>
            <input value={workspace} onChange={(event) => setWorkspace(event.target.value)} />
          </label>
          <label>
            <span>Semantic model</span>
            <input value={semanticModel} onChange={(event) => setSemanticModel(event.target.value)} />
          </label>
          <label>
            <span>Last refresh</span>
            <input value={lastRefresh} onChange={(event) => setLastRefresh(event.target.value)} />
          </label>
          <label>
            <span>Freshness SLA hours</span>
            <input value={maxAgeHours} onChange={(event) => setMaxAgeHours(event.target.value)} />
          </label>
          <label className="template-editor-notes">
            <span>URL</span>
            <input value={url} onChange={(event) => setUrl(event.target.value)} />
          </label>
          <label className="template-editor-notes">
            <span>Source dependencies</span>
            <input value={dependencies} onChange={(event) => setDependencies(event.target.value)} />
          </label>
          <label className="template-editor-notes">
            <span>Domains</span>
            <input value={domains} onChange={(event) => setDomains(event.target.value)} />
          </label>
          <label>
            <span>Approval status</span>
            <select
              value={approvalStatus}
              onChange={(event) =>
                setApprovalStatus(event.target.value as NonNullable<ReportCatalogItem['approvalStatus']>)
              }
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="approved_with_conditions">Approved with conditions</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          <label>
            <span>Reviewer</span>
            <input value={approvalReviewer} onChange={(event) => setApprovalReviewer(event.target.value)} />
          </label>
          <label>
            <span>Route stage</span>
            <select
              value={reviewerRouteStage}
              onChange={(event) =>
                setReviewerRouteStage(event.target.value as NonNullable<ReportCatalogItem['reviewerRouteStage']>)
              }
            >
              <option value="owner_review">Owner review</option>
              <option value="quality_review">Quality review</option>
              <option value="executive_signoff">Executive signoff</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label>
            <span>Route due date</span>
            <input type="date" value={routeDueAt} onChange={(event) => setRouteDueAt(event.target.value)} />
          </label>
          <label className="template-editor-notes">
            <span>Routed reviewers</span>
            <input value={routedReviewers} onChange={(event) => setRoutedReviewers(event.target.value)} />
          </label>
          <label className="template-editor-notes">
            <span>Sign-off rationale</span>
            <textarea value={approvalRationale} onChange={(event) => setApprovalRationale(event.target.value)} />
          </label>
          <div className="report-editor-actions">
            <button
              className="secondary-action"
              onClick={() =>
                downloadJson('tracs-report-approval-notification.json', previewNotification)
              }
              type="button"
            >
              <Bell size={15} />
              Export Notice
            </button>
            <button
              className="secondary-action"
              onClick={() =>
                onDeliverNotifications(
                  notificationToDeliveryPayload(
                    'report_catalog',
                    `${previewReport.title} approval notice`,
                    previewNotification,
                  ),
                )
              }
            type="button"
          >
            <PlugZap size={15} />
              Run Delivery
            </button>
            <button className="secondary-action" onClick={() => onSave(draftReport(), 'draft')} type="button">
              <ServerCog size={15} />
              Save Draft
            </button>
            <button className="secondary-action" onClick={() => onSave(draftReport(), 'signoff')} type="button">
              <ShieldCheck size={15} />
              Save Sign-Off
            </button>
            <button className="primary-action" onClick={() => onSave(draftReport(), 'publish')} type="button">
              <CheckCircle2 size={16} />
              Run Publish Gate
            </button>
          </div>
        </div>
        <div className="template-editor-summary">
          <div className="latest-contract">
            <StatusChip status={gate.status} label={previewReport.publishStatus ?? gate.status} />
            <h3>{previewReport.title}</h3>
            <p>{gate.evidence}</p>
            <div className="metadata-grid">
              <Metadata label="Freshness" value={previewReport.refreshStatus} />
              <Metadata label="Freshness evidence" value={previewReport.freshnessEvidence} />
              <Metadata label="Dependencies" value={previewReport.sourceDependencies.join(', ')} />
              <Metadata label="Publish state" value={previewReport.publishStatus ?? 'unsaved draft'} />
              <Metadata label="Approval" value={reportApprovalLabel(previewReport.approvalStatus)} />
              <Metadata label="Reviewer" value={previewReport.approvalReviewer || 'Not assigned'} />
              <Metadata label="Route stage" value={reportRouteLabel(previewReport.reviewerRouteStage)} />
              <Metadata label="Route due" value={previewReport.routeDueAt || 'Not scheduled'} />
              <Metadata label="Routed reviewers" value={previewReport.routedReviewers?.join(', ') || 'Not routed'} />
            </div>
          </div>
          {previewReport.notificationHistory?.length ? (
            <div className="report-approval-history">
              <h4>Notification History</h4>
              {previewReport.notificationHistory.slice(-4).reverse().map((entry) => (
                <div className="connector-run-row" key={entry.notificationId}>
                  <div>
                    <strong>{reportRouteLabel(entry.routeStage)}</strong>
                    <span>
                      {entry.recipients.join(', ') || 'No recipients'} / {new Date(entry.sentAt).toLocaleString()}
                    </span>
                    <small>{entry.summary}</small>
                  </div>
                  <StatusChip status="pass" label="notice" />
                </div>
              ))}
            </div>
          ) : null}
          {deliveryRecords.length > 0 ? (
            <div className="report-approval-history">
              <h4>Delivery Records</h4>
              {deliveryRecords.slice(0, 3).map((record) => (
                <div className="connector-run-row" key={record.id}>
                  <div>
                    <strong>{record.payload.request.subject}</strong>
                    <span>{new Date(record.createdAt).toLocaleString()}</span>
                    <small>{record.payload.result.evidence}</small>
                  </div>
                  <StatusChip status={record.status} label={record.status} />
                </div>
              ))}
            </div>
          ) : null}
          {previewReport.approvalHistory?.length ? (
            <div className="report-approval-history">
              <h4>Approval History</h4>
              {previewReport.approvalHistory.slice(-4).reverse().map((entry) => (
                <div className="connector-run-row" key={`${entry.signedAt}-${entry.status}`}>
                  <div>
                    <strong>{reportApprovalLabel(entry.status)}</strong>
                    <span>
                      {entry.reviewer || 'Unassigned reviewer'} / {new Date(entry.signedAt).toLocaleString()}
                    </span>
                    <small>{entry.rationale || entry.evidence}</small>
                  </div>
                  <StatusChip status={reportApprovalStatusLevel(entry.status)} label={entry.status} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}



