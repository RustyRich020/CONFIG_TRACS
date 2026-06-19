import { Activity, ClipboardCheck } from 'lucide-react'
import type {
NotificationDeliveryPayload,
} from '../../types'

type RuntimeValue = ReturnType<typeof JSON.parse>

type BackendDeliveryRetryControlsPanelKey =
  | 'deliveryRetryDelayMinutes'
  | 'deliveryRetryMaxRetries'
  | 'deliveryRetryOnWarnings'
  | 'deliveryRetryRationale'
  | 'deliveryRetrySource'
  | 'latestRetryEligible'
  | 'latestRetryableDelivery'
  | 'notificationDeliveryRetryRequest'
  | 'onSaveNotificationDeliveryRetryControl'
  | 'setDeliveryRetryDelayMinutes'
  | 'setDeliveryRetryMaxRetries'
  | 'setDeliveryRetryOnWarnings'
  | 'setDeliveryRetryRationale'
  | 'setDeliveryRetrySource'

type BackendDeliveryRetryControlsPanelProps = {
  retryControls: Record<BackendDeliveryRetryControlsPanelKey, RuntimeValue>
}

export function BackendDeliveryRetryControlsPanel({
  retryControls,
}: BackendDeliveryRetryControlsPanelProps) {
  const {
  deliveryRetryDelayMinutes,
  deliveryRetryMaxRetries,
  deliveryRetryOnWarnings,
  deliveryRetryRationale,
  deliveryRetrySource,
  latestRetryEligible,
  latestRetryableDelivery,
  notificationDeliveryRetryRequest,
  onSaveNotificationDeliveryRetryControl,
  setDeliveryRetryDelayMinutes,
  setDeliveryRetryMaxRetries,
  setDeliveryRetryOnWarnings,
  setDeliveryRetryRationale,
  setDeliveryRetrySource,
  } = retryControls

  return (
          <div className="notification-approval-form">
            <div className="trace-review-grid">
              <label>
                <span>Delivery source</span>
                <select
                  value={deliveryRetrySource}
                  onChange={(event) =>
                    setDeliveryRetrySource(event.target.value as NotificationDeliveryPayload['source'])
                  }
                >
                  <option value="notification_closure_export_package">Closure package</option>
                  <option value="notification_retry_queue_export_package">Retry queue package</option>
                  <option value="notification_retry_queue_acknowledgement_closure_package">Retry queue acknowledgement closure package</option>
                  <option value="closure_package_acknowledgement_closeout_export_package">Closeout export package</option>
                  <option value="closure_package_acknowledgement_closeout_notification_closure_package">Closeout acknowledgement closure package</option>
                  <option value="closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package">Closeout acknowledgement closeout package</option>
                  <option value="closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_closure_package_acknowledgement_final_evidence">Closeout acknowledgement final evidence</option>
                  <option value="closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure">Closeout acknowledgement final acknowledgement closeout evidence</option>
                  <option value="closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure">Closeout acknowledgement final acknowledgement closure evidence</option>
                  <option value="closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence">Closeout acknowledgement final acknowledgement closure final evidence</option>
                  <option value="closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence">Closeout acknowledgement final acknowledgement closure final closeout evidence</option>
                  <option value="closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure">Closeout acknowledgement final acknowledgement closure final closeout acknowledgement closure evidence</option>
                  <option value="closure_package_acknowledgement_closeout_notification_closure_package_acknowledgement_final_evidence_acknowledgement_closure_delivery_acknowledgement_closure_delivery_acknowledgement_final_evidence_delivery_acknowledgement_closeout_evidence_delivery_acknowledgement_closure_delivery_acknowledgement_closeout_evidence">Closeout acknowledgement final acknowledgement closure final closeout acknowledgement closure closeout evidence</option>
                  <option value="closure_sla_export_package">Closure SLA package</option>
                  <option value="closure_sla_response_follow_up">Closure SLA follow-up</option>
                  <option value="closure_sla_follow_up_closure_export_package">Closure SLA follow-up closure package</option>
                  <option value="postgres_cutover_acknowledgement">Cutover acknowledgement</option>
                  <option value="postgres_cutover_owner_reminder">Cutover owner reminder</option>
                  <option value="postgres_cutover_closure_package">Cutover closure package</option>
                  <option value="postgres_cutover_final_handoff_closure_package">Final handoff closure package</option>
                </select>
              </label>
              <label>
                <span>Max retries</span>
                <input
                  value={deliveryRetryMaxRetries}
                  onChange={(event) => setDeliveryRetryMaxRetries(event.target.value)}
                />
              </label>
              <label>
                <span>Retry delay minutes</span>
                <input
                  value={deliveryRetryDelayMinutes}
                  onChange={(event) => setDeliveryRetryDelayMinutes(event.target.value)}
                />
              </label>
              <label className="toggle-row">
                <input
                  checked={deliveryRetryOnWarnings}
                  onChange={(event) => setDeliveryRetryOnWarnings(event.target.checked)}
                  type="checkbox"
                />
                <span>Retry warning deliveries</span>
              </label>
              <label className="trace-review-rationale">
                <span>Retry rationale</span>
                <textarea
                  value={deliveryRetryRationale}
                  onChange={(event) => setDeliveryRetryRationale(event.target.value)}
                />
              </label>
            </div>
            <div className="toolbar-actions notification-approval-actions">
              <button
                className="secondary-action"
                disabled={!latestRetryableDelivery}
                onClick={() =>
                  latestRetryableDelivery
                    ? onSaveNotificationDeliveryRetryControl(
                        notificationDeliveryRetryRequest(latestRetryableDelivery, false),
                      )
                    : undefined
                }
                type="button"
              >
                <ClipboardCheck size={15} />
                Plan Retry
              </button>
              <button
                className="primary-action"
                disabled={!latestRetryableDelivery || !latestRetryEligible}
                onClick={() =>
                  latestRetryableDelivery
                    ? onSaveNotificationDeliveryRetryControl(
                        notificationDeliveryRetryRequest(latestRetryableDelivery, true),
                      )
                    : undefined
                }
                type="button"
              >
                <Activity size={15} />
                Execute Retry
              </button>
            </div>
          </div>
  )
}
