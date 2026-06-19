import { useMemo,useState } from 'react'
import { titleize } from '../components/formatters'
import { TraceabilityClosureRoutingPanel } from '../components/TraceabilityClosureRoutingPanel'
import { TraceabilityDeliveryResponsePanel } from '../components/TraceabilityDeliveryResponsePanel'
import { TraceabilityEvidencePacketLinksPanel } from '../components/TraceabilityEvidencePacketLinksPanel'
import { TraceabilityExportControlsPanel } from '../components/TraceabilityExportControlsPanel'
import { TraceabilityGraphPathPanel } from '../components/TraceabilityGraphPathPanel'
import { TraceabilitySignedExportHistoryPanel } from '../components/TraceabilitySignedExportHistoryPanel'
import { TraceabilitySourceLinksPanel } from '../components/TraceabilitySourceLinksPanel'
import {
downloadJson
} from '../foundation'
import {
deriveGovernanceWorkflowLineage
} from '../governanceWorkflow'
import type {
AppConfig,
BackendRecord,
CanonicalLoadResult,
CanonicalObject,
MappingValidationResult,
NotificationDeliveryPayload,
NotificationDeliveryResult,
QualityEvent,
ReadinessEvidencePacket,
StatusLevel,
TraceabilityDeliveryResponse,
TraceabilityDeliveryResponseStatus,
TraceabilityExportRetentionClass,
TraceabilityExportReview,
TraceabilityExportReviewStatus,
TraceabilityGraphExportPackage,
TraceabilityLink,
TraceabilityResponseClosureRoute,
TraceabilityResponseClosureRouteStage,
TraceabilityResponseClosureRouteStatus
} from '../types'
function createTraceabilityExportNotification(
  graphPackage: TraceabilityGraphExportPackage,
  review: {
    reviewer: string
    status: TraceabilityExportReviewStatus
    rationale: string
    retentionClass: TraceabilityExportRetentionClass
  },
) {
  const generatedAt = new Date().toISOString()
  const reviewer = review.reviewer.trim() || 'TRACS traceability reviewer'
  return {
    notificationId: `traceability_export_notice:${graphPackage.packageId}:${generatedAt}`,
    generatedAt,
    type: 'traceability_export_review',
    packageId: graphPackage.packageId,
    selectedEventId: graphPackage.selectedEvent?.canonical.event_id ?? 'all',
    routeStage: 'traceability_review',
    recipients: [reviewer],
    dueAt: '',
    reviewer,
    reviewStatus: review.status,
    retentionClass: review.retentionClass,
    summary: `Traceability export ${graphPackage.selectedEvent?.canonical.event_id ?? 'all'} is ready for reviewer handoff with ${titleize(review.status)} review state.`,
    evidence: [
      graphPackage.evidence,
      `${graphPackage.coverage.filteredLinks} filtered link(s), ${graphPackage.graph.nodes.length} graph node(s), and ${graphPackage.coverage.evidencePackets} evidence packet(s).`,
      review.rationale || 'No reviewer rationale recorded.',
    ],
    coverage: graphPackage.coverage,
    filters: graphPackage.filters,
    relationshipSummary: graphPackage.graph.relationshipSummary,
    graphPackage,
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


function traceabilityRetentionLabel(retentionClass: TraceabilityExportRetentionClass) {
  if (retentionClass === 'standard_7_year') return 'Standard 7 Year'
  if (retentionClass === 'project_lifetime') return 'Project Lifetime'
  return 'Legal Hold'
}


export function TraceabilityView({
  backendRecords,
  canonicalObjects,
  closureRouteRecords,
  deliveryRecords,
  evidenceRecords,
  events,
  links,
  mappings,
  mappingResults,
  onDeliverNotifications,
  onSaveDeliveryResponse,
  onSaveResponseClosureRoute,
  onSelectEvent,
  onSaveExportReview,
  responseRecords,
  reviewRecords,
  selectedEventId,
  workflowDefinitions,
}: {
  backendRecords: BackendRecord[]
  canonicalObjects: CanonicalObject[]
  closureRouteRecords: BackendRecord<TraceabilityResponseClosureRoute>[]
  deliveryRecords: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>[]
  evidenceRecords: BackendRecord<ReadinessEvidencePacket>[]
  events: QualityEvent[]
  links: TraceabilityLink[]
  mappings: AppConfig['mappings']
  mappingResults: Record<string, MappingValidationResult>
  onDeliverNotifications: (payload: NotificationDeliveryPayload) => void
  onSaveDeliveryResponse: (request: {
    deliveryRecord: BackendRecord<{ request: NotificationDeliveryPayload; result: NotificationDeliveryResult }>
    requestedActions: string[]
    responseNotes: string
    reviewer: string
    routeStage: TraceabilityDeliveryResponse['routeStage']
    status: TraceabilityDeliveryResponseStatus
  }) => void
  onSaveResponseClosureRoute: (request: {
    closureNotes: string
    dueAt: string
    notify?: boolean
    requestedActions: string[]
    responseRecord: BackendRecord<TraceabilityDeliveryResponse>
    routeStage: TraceabilityResponseClosureRouteStage
    routedReviewers: string[]
    reviewer: string
    status: TraceabilityResponseClosureRouteStatus
  }) => void
  onSelectEvent: (eventId: string) => void
  onSaveExportReview: (request: {
    graphPackage: TraceabilityGraphExportPackage
    reviewer: string
    status: TraceabilityExportReviewStatus
    rationale: string
    retentionClass: TraceabilityExportRetentionClass
  }) => Promise<BackendRecord<TraceabilityExportReview>>
  responseRecords: BackendRecord<TraceabilityDeliveryResponse>[]
  reviewRecords: BackendRecord<TraceabilityExportReview>[]
  selectedEventId: string | null
  workflowDefinitions: AppConfig['workflowDefinitions']
}) {
  const [familyFilter, setFamilyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<StatusLevel | 'all'>('all')
  const [packetFilter, setPacketFilter] = useState('all')
  const [reviewer, setReviewer] = useState('TRACS Quality Reviewer')
  const [reviewStatus, setReviewStatus] = useState<TraceabilityExportReviewStatus>('approved')
  const [retentionClass, setRetentionClass] =
    useState<TraceabilityExportRetentionClass>('standard_7_year')
  const [reviewRationale, setReviewRationale] = useState(
    'Traceability export reviewed for active filters, evidence packet coverage, and retained governance handoff.',
  )
  const [traceabilityRecipients, setTraceabilityRecipients] = useState('TRACS Quality Reviewer')
  const [deliveryResponseReviewer, setDeliveryResponseReviewer] = useState('TRACS Quality Reviewer')
  const [deliveryResponseStatus, setDeliveryResponseStatus] =
    useState<TraceabilityDeliveryResponseStatus>('acknowledged')
  const [deliveryResponseRouteStage, setDeliveryResponseRouteStage] =
    useState<TraceabilityDeliveryResponse['routeStage']>('reviewer_acknowledgement')
  const [deliveryResponseNotes, setDeliveryResponseNotes] = useState(
    'Reviewer acknowledged receipt of the traceability export package and delivery evidence.',
  )
  const [deliveryResponseActions, setDeliveryResponseActions] = useState('')
  const [closureRouteReviewer, setClosureRouteReviewer] = useState('TRACS Quality Owner')
  const [closureRouteStatus, setClosureRouteStatus] =
    useState<TraceabilityResponseClosureRouteStatus>('follow_up_open')
  const [closureRouteStage, setClosureRouteStage] =
    useState<TraceabilityResponseClosureRouteStage>('quality_follow_up')
  const [closureRouteDueAt, setClosureRouteDueAt] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toISOString().slice(0, 10)
  })
  const [closureRouteReviewers, setClosureRouteReviewers] = useState('TRACS Quality Owner')
  const [closureRouteNotes, setClosureRouteNotes] = useState(
    'Route reviewer response closure, confirm requested actions, and retain closure notification evidence.',
  )
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? events[0]
  const canonicalById = useMemo(
    () => new Map(canonicalObjects.map((object) => [object.id, object])),
    [canonicalObjects],
  )
  const selectedLinks = selectedEvent
    ? links.filter((link) => link.sourceObjectId === selectedEvent.id)
    : []
  const traceEvidencePackets = evidenceRecords.filter((record) =>
    record.payload.canonicalLoads.some((load) => load.payload.linkCount > 0),
  )
  const familyOptions = Array.from(
    new Set(
      selectedLinks.map((link) => canonicalById.get(link.targetObjectId)?.family ?? link.targetObjectType),
    ),
  ).sort()
  const filteredLinks = selectedLinks.filter((link) => {
    const family = canonicalById.get(link.targetObjectId)?.family ?? link.targetObjectType
    const familyMatches = familyFilter === 'all' || family === familyFilter
    const statusMatches = statusFilter === 'all' || link.status === statusFilter
    const packetMatches =
      packetFilter === 'all' ||
      traceEvidencePackets.some(
        (record) =>
          record.id === packetFilter &&
          record.payload.canonicalLoads.some((load) => load.payload.linkCount > 0),
      )
    return familyMatches && statusMatches && packetMatches
  })
  const relationshipSummary = filteredLinks.reduce<Record<string, number>>((summary, link) => {
    const family = canonicalById.get(link.targetObjectId)?.family ?? link.targetObjectType
    summary[family] = (summary[family] ?? 0) + 1
    return summary
  }, {})
  const graphNodes = selectedEvent
    ? [
        {
          id: selectedEvent.id,
          label: selectedEvent.canonical.event_id,
          family: selectedEvent.family,
          type: selectedEvent.objectType,
          status: selectedEvent.status,
        },
        ...filteredLinks.map((link) => {
          const object = canonicalById.get(link.targetObjectId)
          return {
            id: link.targetObjectId,
            label: link.targetLabel,
            family: object?.family ?? link.targetObjectType,
            type: link.targetObjectType,
            status: object?.status ?? link.status,
          }
        }),
      ]
    : []
  const canonicalLoadRecords = backendRecords.filter(
    (record): record is BackendRecord<CanonicalLoadResult> => record.kind === 'canonical_load',
  )
  const latestCanonicalLoad = canonicalLoadRecords[0]
  const workflowLineage = useMemo(
    () => deriveGovernanceWorkflowLineage(backendRecords, workflowDefinitions),
    [backendRecords, workflowDefinitions],
  )
  const sourceMappings = Object.entries(mappings).map(([mappingId, mapping]) => ({
    mappingId,
    sourceConnector: mapping.source_connector,
    sourceObject: mapping.source_object,
    targetObject: mapping.object,
  }))
  const validationGaps = Object.entries(mappingResults).flatMap(([mappingId, result]) =>
    result.checks
      .filter((check) => check.status !== 'pass')
      .map((check) => ({
        id: `${mappingId}:${check.id}`,
        status: check.status,
        evidence: `${titleize(mappingId)}: ${check.evidence}`,
      })),
  )
  function createGraphExportPackage(
    evidencePacket?: BackendRecord<ReadinessEvidencePacket>,
  ): TraceabilityGraphExportPackage {
    const selectedEvidencePackets = evidencePacket
      ? [evidencePacket]
      : packetFilter === 'all'
        ? traceEvidencePackets
        : traceEvidencePackets.filter((record) => record.id === packetFilter)
    const generatedAt = new Date().toISOString()
    const packageId = `traceability_graph:${selectedEvent?.canonical.event_id ?? 'all'}:${generatedAt}`
    return {
      packageId,
      generatedAt,
      source: 'traceability_workspace',
      selectedEvent,
      filters: {
        family: familyFilter,
        status: statusFilter,
        evidencePacket: evidencePacket?.id ?? packetFilter,
      },
      graph: {
        nodes: graphNodes,
        edges: filteredLinks,
        relationshipSummary,
      },
      evidencePackets: selectedEvidencePackets,
      sourceMappings,
      validationGaps,
      latestCanonicalLoad,
      workflowLineage: {
        instances: workflowLineage.instances.length,
        missingParentReferences: workflowLineage.orphanedParentIds.length,
        latestInstanceId: workflowLineage.instances[0]?.instanceId,
      },
      coverage: {
        canonicalObjects: canonicalObjects.length,
        filteredLinks: filteredLinks.length,
        availableLinks: selectedLinks.length,
        evidencePackets: selectedEvidencePackets.length,
        selectedEvidencePacket: evidencePacket?.id,
      },
      evidence: `${filteredLinks.length} filtered traceability link(s), ${graphNodes.length} graph node(s), and ${selectedEvidencePackets.length} evidence packet(s) exported for ${selectedEvent?.canonical.event_id ?? 'the active traceability selection'}.`,
    }
  }
  async function exportGraphPackage(evidencePacket?: BackendRecord<ReadinessEvidencePacket>) {
    const packagePayload = createGraphExportPackage(evidencePacket)
    await onSaveExportReview({
      graphPackage: packagePayload,
      reviewer,
      status: reviewStatus,
      rationale: reviewRationale,
      retentionClass,
    })
    const packetSuffix = evidencePacket ? `-${evidencePacket.id.slice(0, 8)}` : ''
    downloadJson(`tracs-traceability-graph-package${packetSuffix}.json`, packagePayload)
  }
  function deliveryPayloadForGraph(graphPackage: TraceabilityGraphExportPackage) {
    const notification = createTraceabilityExportNotification(graphPackage, {
      reviewer,
      status: reviewStatus,
      rationale: reviewRationale,
      retentionClass,
    })
    const recipients = traceabilityRecipients
      .split(',')
      .map((recipient) => recipient.trim())
      .filter(Boolean)
    return notificationToDeliveryPayload(
      'traceability_export',
      `Traceability export package ${graphPackage.selectedEvent?.canonical.event_id ?? 'all'}`,
      {
        ...notification,
        recipients: recipients.length > 0 ? recipients : notification.recipients,
      },
    )
  }
  async function deliverGraphPackage(evidencePacket?: BackendRecord<ReadinessEvidencePacket>) {
    const packagePayload = createGraphExportPackage(evidencePacket)
    await onSaveExportReview({
      graphPackage: packagePayload,
      reviewer,
      status: reviewStatus,
      rationale: reviewRationale,
      retentionClass,
    })
    onDeliverNotifications(deliveryPayloadForGraph(packagePayload))
  }
  const traceabilityDeliveryRecords = deliveryRecords.filter(
    (record) => record.payload.request.source === 'traceability_export',
  )
  const latestTraceabilityDelivery = traceabilityDeliveryRecords[0]
  const latestDeliveryResponse = responseRecords[0]
  const traceabilityClosureRoutes = closureRouteRecords.filter((record) =>
    responseRecords.some((response) => response.id === record.payload.responseRecordId),
  )
  const latestClosureRoute = traceabilityClosureRoutes[0]
  const acknowledgedDeliveryIds = new Set(responseRecords.map((record) => record.payload.deliveryRecordId))
  const openDeliveryCount = traceabilityDeliveryRecords.filter((record) => !acknowledgedDeliveryIds.has(record.id)).length
  const openClosureRouteCount = traceabilityClosureRoutes.filter((record) => record.payload.status !== 'closed').length
  function saveDeliveryResponse(deliveryRecord = latestTraceabilityDelivery) {
    if (!deliveryRecord) return
    onSaveDeliveryResponse({
      deliveryRecord,
      requestedActions: deliveryResponseActions
        .split('\n')
        .map((action) => action.trim())
        .filter(Boolean),
      responseNotes: deliveryResponseNotes,
      reviewer: deliveryResponseReviewer,
      routeStage: deliveryResponseRouteStage,
      status: deliveryResponseStatus,
    })
  }
  function closureRouteRequest(responseRecord = latestDeliveryResponse, notify = false) {
    if (!responseRecord) return
    const reviewers = closureRouteReviewers
      .split(',')
      .map((routeReviewer) => routeReviewer.trim())
      .filter(Boolean)
    const requestedActions = [
      ...responseRecord.payload.requestedActions,
      ...deliveryResponseActions
        .split('\n')
        .map((action) => action.trim())
        .filter(Boolean),
    ].filter((action, index, actions) => actions.indexOf(action) === index)
    onSaveResponseClosureRoute({
      closureNotes: closureRouteNotes,
      dueAt: closureRouteDueAt,
      notify,
      requestedActions,
      responseRecord,
      routeStage: closureRouteStage,
      routedReviewers: reviewers,
      reviewer: closureRouteReviewer,
      status: closureRouteStatus,
    })
  }

  return (
    <>
      <section className="connector-toolbar panel">
        <div>
          <h2>Traceability Matrix</h2>
          <p>
            Follow quality-event relationships into product, lot/serial, return, and external CAPA references.
          </p>
        </div>
        <div className="toolbar-actions">
          <select
            aria-label="Select traceability event"
            className="workflow-select"
            onChange={(event) => onSelectEvent(event.target.value)}
            value={selectedEvent?.id ?? ''}
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.canonical.event_id} / {event.canonical.product_code}
              </option>
            ))}
          </select>
        </div>
      </section>

      <TraceabilityExportControlsPanel
        deliveryCount={traceabilityDeliveryRecords.length}
        evidencePackets={traceEvidencePackets}
        familyFilter={familyFilter}
        familyOptions={familyOptions}
        onDeliverGraph={() => deliverGraphPackage()}
        onExportGraph={() => exportGraphPackage()}
        onFamilyFilterChange={setFamilyFilter}
        onPacketFilterChange={setPacketFilter}
        onRecipientsChange={setTraceabilityRecipients}
        onRetentionClassChange={setRetentionClass}
        onReviewRationaleChange={setReviewRationale}
        onReviewStatusChange={setReviewStatus}
        onReviewerChange={setReviewer}
        onStatusFilterChange={setStatusFilter}
        openDeliveryCount={openDeliveryCount}
        packetFilter={packetFilter}
        recipients={traceabilityRecipients}
        retentionClass={retentionClass}
        retentionLabel={traceabilityRetentionLabel(retentionClass)}
        reviewRationale={reviewRationale}
        reviewer={reviewer}
        reviewRecords={reviewRecords}
        reviewStatus={reviewStatus}
        statusFilter={statusFilter}
      />

      <TraceabilitySourceLinksPanel
        filteredLinks={filteredLinks}
        selectedEvent={selectedEvent}
        selectedLinkCount={selectedLinks.length}
      />

      <TraceabilityGraphPathPanel
        canonicalById={canonicalById}
        evidencePacketCount={traceEvidencePackets.length}
        filteredLinks={filteredLinks}
        graphNodeCount={graphNodes.length}
        latestCanonicalLoad={latestCanonicalLoad}
        relationshipSummary={relationshipSummary}
        selectedEvent={selectedEvent}
        validationGapCount={validationGaps.length}
        workflowLineageCount={workflowLineage.instances.length}
      />

      <TraceabilityEvidencePacketLinksPanel
        evidencePackets={traceEvidencePackets}
        onDeliverGraph={deliverGraphPackage}
        onExportGraph={exportGraphPackage}
      />

      <TraceabilitySignedExportHistoryPanel reviewRecords={reviewRecords} />

      <TraceabilityDeliveryResponsePanel
        acknowledgedDeliveryIds={acknowledgedDeliveryIds}
        deliveryResponseActions={deliveryResponseActions}
        deliveryResponseNotes={deliveryResponseNotes}
        deliveryResponseReviewer={deliveryResponseReviewer}
        deliveryResponseRouteStage={deliveryResponseRouteStage}
        deliveryResponseStatus={deliveryResponseStatus}
        latestClosureRoute={latestClosureRoute}
        latestDeliveryResponse={latestDeliveryResponse}
        latestTraceabilityDelivery={latestTraceabilityDelivery}
        onDeliveryResponseActionsChange={setDeliveryResponseActions}
        onDeliveryResponseNotesChange={setDeliveryResponseNotes}
        onDeliveryResponseReviewerChange={setDeliveryResponseReviewer}
        onDeliveryResponseRouteStageChange={setDeliveryResponseRouteStage}
        onDeliveryResponseStatusChange={setDeliveryResponseStatus}
        onSaveDeliveryResponse={saveDeliveryResponse}
        openClosureRouteCount={openClosureRouteCount}
        openDeliveryCount={openDeliveryCount}
        responseRecords={responseRecords}
        traceabilityDeliveryRecords={traceabilityDeliveryRecords}
      />

      <TraceabilityClosureRoutingPanel
        closureRouteDueAt={closureRouteDueAt}
        closureRouteNotes={closureRouteNotes}
        closureRouteReviewer={closureRouteReviewer}
        closureRouteReviewers={closureRouteReviewers}
        closureRouteStage={closureRouteStage}
        closureRouteStatus={closureRouteStatus}
        latestDeliveryResponse={latestDeliveryResponse}
        onClosureRouteDueAtChange={setClosureRouteDueAt}
        onClosureRouteNotesChange={setClosureRouteNotes}
        onClosureRouteReviewerChange={setClosureRouteReviewer}
        onClosureRouteReviewersChange={setClosureRouteReviewers}
        onClosureRouteStageChange={setClosureRouteStage}
        onClosureRouteStatusChange={setClosureRouteStatus}
        onNotifyClosureRoute={() => closureRouteRequest(latestDeliveryResponse, true)}
        onSaveClosureRoute={() => closureRouteRequest()}
        traceabilityClosureRoutes={traceabilityClosureRoutes}
      />
    </>
  )
}



