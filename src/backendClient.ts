import { getAdapterContract } from './backendContracts'
import type {
  AdapterDryRunResult,
  AppConfig,
  BackendHealth,
  BackendRecord,
  BackendRecordKind,
  DeploymentState,
  StatusLevel,
} from './types'

const recordsKey = 'tracs.backend.records.v1'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeRecords(records: BackendRecord[]) {
  localStorage.setItem(recordsKey, JSON.stringify(records.slice(0, 250)))
}

function summarizeStatus(records: BackendRecord[]): StatusLevel {
  if (records.some((record) => record.status === 'blocking')) return 'blocking'
  if (records.some((record) => record.status === 'warning')) return 'warning'
  return 'pass'
}

function nextVersion(records: BackendRecord[], kind: BackendRecordKind, label: string) {
  const matching = records.filter((record) => record.kind === kind && record.label === label)
  return matching.length > 0 ? Math.max(...matching.map((record) => record.version)) + 1 : 1
}

export class LocalBackendClient {
  private endpoint = 'localStorage://tracs.backend.records.v1'

  async health(): Promise<BackendHealth> {
    const startedAt = performance.now()
    const records = readJson<BackendRecord[]>(recordsKey, [])
    return {
      mode: 'browser_local',
      status: summarizeStatus(records),
      checkedAt: new Date().toISOString(),
      endpoint: this.endpoint,
      latencyMs: Math.max(1, Math.round(performance.now() - startedAt)),
      records: records.length,
      evidence: 'Browser-local backend adapter is active and ready for API replacement.',
    }
  }

  async listRecords(): Promise<BackendRecord[]> {
    return readJson<BackendRecord[]>(recordsKey, [])
  }

  async saveRecord<TPayload>({
    kind,
    label,
    status,
    summary,
    payload,
  }: {
    kind: BackendRecordKind
    label: string
    status: StatusLevel
    summary: string
    payload: TPayload
  }): Promise<BackendRecord<TPayload>> {
    const records = readJson<BackendRecord[]>(recordsKey, [])
    const now = new Date().toISOString()
    const record: BackendRecord<TPayload> = {
      id: crypto.randomUUID(),
      kind,
      version: nextVersion(records, kind, label),
      status,
      createdAt: now,
      updatedAt: now,
      label,
      summary,
      payload,
    }
    writeRecords([record, ...records])
    return record
  }

  async saveDeploymentSnapshot({
    config,
    deployment,
    readinessStatus,
  }: {
    config: AppConfig
    deployment: DeploymentState
    readinessStatus: StatusLevel
  }) {
    const payload = {
      environment: config.environment.environment,
      warehouse: config.environment.warehouse,
      deployment_profile: deployment,
      active_industries: deployment.activeIndustries.map((key) => ({
        key,
        display_name: config.industries[key]?.display_name ?? key,
      })),
      active_domains: deployment.activeDomains.map((key) => ({
        key,
        display_name: config.solutionDomains[key]?.display_name ?? key,
      })),
    }

    return this.saveRecord({
      kind: 'deployment_profile',
      label: `${config.environment.environment.name} deployment profile`,
      status: readinessStatus,
      summary: `${deployment.activeIndustries.length} profile(s), ${deployment.activeDomains.length} domain(s) persisted.`,
      payload,
    })
  }

  async runAdapterDryRun(
    connectorId: string,
    connector: AppConfig['connectors']['connectors'][string],
  ): Promise<AdapterDryRunResult> {
    const contract = getAdapterContract(connector.type)
    const fallbackObjects = [connector.workbook, connector.sheet, connector.display_name].filter(
      (value): value is string => Boolean(value),
    )
    const objects =
      connector.objects?.map((object) => object.source) ??
      fallbackObjects
    const targetObjects =
      connector.objects?.map((object) => object.target) ??
      [connector.target].filter((target): target is string => Boolean(target))
    const warnings = contract ? [] : [`No adapter contract registered for ${connector.type}.`]

    return {
      adapterId: contract?.id ?? `${connector.type}_adapter_missing`,
      connectorId,
      status: contract ? 'pass' : 'blocking',
      executedAt: new Date().toISOString(),
      operations: (contract?.operations ?? ['health_check']).map((operation) => ({
        operation,
        status: contract ? 'pass' : 'blocking',
        evidence: contract
          ? `${contract.displayName} can satisfy ${operation} for ${connector.display_name}.`
          : `Missing contract prevents ${operation} execution.`,
      })),
      sampleResponse: {
        sourceObjects: objects.length > 0 ? objects : [connector.display_name],
        targetObjects: targetObjects.length > 0 ? targetObjects : ['not mapped'],
        previewRows: connector.type === 'external_reference' ? 0 : 25,
        warnings,
      },
    }
  }
}

class ApiBackendClient {
  private baseUrl: string
  private localFallback = new LocalBackendClient()

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<TPayload>(path: string, options?: RequestInit): Promise<TPayload> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`TRACS API ${path} returned ${response.status}`)
    }

    return (await response.json()) as TPayload
  }

  async health(): Promise<BackendHealth> {
    try {
      return await this.request<BackendHealth>('/api/health')
    } catch (error) {
      const fallback = await this.localFallback.health()
      return {
        ...fallback,
        evidence: `API unavailable at ${this.baseUrl}; using browser-local fallback. ${
          error instanceof Error ? error.message : 'Unknown API error'
        }`,
      }
    }
  }

  async listRecords(): Promise<BackendRecord[]> {
    try {
      return await this.request<BackendRecord[]>('/api/records')
    } catch {
      return this.localFallback.listRecords()
    }
  }

  async saveRecord<TPayload>({
    kind,
    label,
    status,
    summary,
    payload,
  }: {
    kind: BackendRecordKind
    label: string
    status: StatusLevel
    summary: string
    payload: TPayload
  }): Promise<BackendRecord<TPayload>> {
    try {
      return await this.request<BackendRecord<TPayload>>('/api/records', {
        method: 'POST',
        body: JSON.stringify({ kind, label, status, summary, payload }),
      })
    } catch {
      return this.localFallback.saveRecord({ kind, label, status, summary, payload })
    }
  }

  async saveDeploymentSnapshot({
    config,
    deployment,
    readinessStatus,
  }: {
    config: AppConfig
    deployment: DeploymentState
    readinessStatus: StatusLevel
  }) {
    try {
      return await this.request<BackendRecord>('/api/deployment-snapshots', {
        method: 'POST',
        body: JSON.stringify({ config, deployment, readinessStatus }),
      })
    } catch {
      return this.localFallback.saveDeploymentSnapshot({ config, deployment, readinessStatus })
    }
  }

  async runAdapterDryRun(
    connectorId: string,
    connector: AppConfig['connectors']['connectors'][string],
  ): Promise<AdapterDryRunResult> {
    try {
      return await this.request<AdapterDryRunResult>('/api/adapter-dry-runs', {
        method: 'POST',
        body: JSON.stringify({ connectorId, connector }),
      })
    } catch {
      return this.localFallback.runAdapterDryRun(connectorId, connector)
    }
  }
}

const apiBaseUrl = import.meta.env.VITE_TRACS_API_URL?.replace(/\/$/, '')

export const backendClient = apiBaseUrl
  ? new ApiBackendClient(apiBaseUrl)
  : new LocalBackendClient()
