import type {
  AppConfig,
  AuditEvent,
  ConnectorDefinition,
  ConnectorTestResult,
  CsvSchemaInference,
  DeploymentState,
  MappingManifest,
  MappingValidationResult,
  ObjectFamily,
  ReadinessCheck,
  StatusLevel,
} from './types'

const domainFamilyMap: Record<string, string[]> = {
  erp: ['commercial', 'product', 'analytics'],
  scm: ['supply_chain', 'product', 'traceability'],
  shop_floor: ['manufacturing', 'traceability'],
  mes: ['manufacturing', 'product', 'quality', 'traceability'],
  pcs: ['manufacturing', 'analytics'],
  quoting_costing: ['commercial', 'product', 'analytics'],
  reporting_bi: ['analytics'],
  engineering: ['product', 'traceability'],
  plm: ['product', 'traceability'],
  app: ['manufacturing', 'product', 'traceability'],
  quality: ['quality', 'product', 'traceability'],
  qms: ['quality', 'traceability'],
  spc_sqc: ['measurement', 'quality', 'analytics'],
  gage_management: ['measurement', 'quality', 'traceability'],
}

export function getDomainFamilies(activeDomains: string[]) {
  return Array.from(
    new Set(activeDomains.flatMap((domain) => domainFamilyMap[domain] ?? [])),
  ).sort()
}

export function getFamilyStatus(
  familyKey: string,
  family: ObjectFamily,
  activeFamilies: string[],
) {
  if (activeFamilies.includes(familyKey)) {
    return {
      status: 'Active',
      detail: `${family.objects.length} canonical objects enabled`,
    }
  }

  return {
    status: 'Available',
    detail: `${family.objects.length} objects defined, not active`,
  }
}

export function evaluateReadiness(
  config: AppConfig,
  deployment: DeploymentState,
): ReadinessCheck[] {
  const activeFamilies = getDomainFamilies(deployment.activeDomains)
  const connectorCount = Object.keys(config.connectors.connectors).length
  const enabledFeatureCount = Object.values(config.environment.features).filter(Boolean).length
  const activeIndustryNames = deployment.activeIndustries
    .map((key) => config.industries[key]?.display_name ?? key)
    .join(', ')
  const activeDomainNames = deployment.activeDomains
    .map((key) => config.solutionDomains[key]?.display_name ?? key)
    .join(', ')

  const checks: ReadinessCheck[] = [
    {
      id: 'profile_config',
      label: 'Industry profile config',
      status: deployment.activeIndustries.length > 0 ? 'pass' : 'blocking',
      evidence:
        deployment.activeIndustries.length > 0
          ? `${deployment.activeIndustries.length} active profile(s): ${activeIndustryNames}`
          : 'No active industry profile selected.',
      remediation: 'Select at least one industry profile before publishing.',
    },
    {
      id: 'domain_activation',
      label: 'Solution domain activation',
      status: deployment.activeDomains.length > 0 ? 'pass' : 'blocking',
      evidence:
        deployment.activeDomains.length > 0
          ? `${deployment.activeDomains.length} active domain(s): ${activeDomainNames}`
          : 'No solution domains are active.',
      remediation: 'Enable at least one solution domain for the deployment.',
    },
    {
      id: 'object_family_coverage',
      label: 'Object family coverage',
      status: activeFamilies.length >= 4 ? 'pass' : 'warning',
      evidence: `${activeFamilies.length} object families active: ${activeFamilies.join(', ')}`,
      remediation: 'Enable additional domains if the deployment needs wider traceability coverage.',
    },
    {
      id: 'connector_manifest',
      label: 'Connector manifest loaded',
      status: connectorCount > 0 ? 'warning' : 'blocking',
      evidence: `${connectorCount} connector definition(s) loaded from YAML.`,
      remediation:
        'Connector tests are scaffolded in this phase. Live authentication checks begin in the Connector Hub phase.',
    },
    {
      id: 'audit_mode',
      label: 'Audit mode',
      status: config.environment.environment.audit_mode === 'enabled' ? 'pass' : 'blocking',
      evidence: `Audit mode is ${config.environment.environment.audit_mode}.`,
      remediation: 'Enable audit mode for QA and production deployments.',
    },
    {
      id: 'feature_flags',
      label: 'Foundation feature flags',
      status: enabledFeatureCount >= 6 ? 'pass' : 'warning',
      evidence: `${enabledFeatureCount} feature flag(s) are enabled.`,
      remediation: 'Review environment feature flags before enabling production workflows.',
    },
  ]

  return checks
}

export function summarizeReadiness(checks: ReadinessCheck[]) {
  return checks.reduce(
    (summary, check) => {
      summary[check.status] += 1
      return summary
    },
    { pass: 0, warning: 0, blocking: 0 } as Record<StatusLevel, number>,
  )
}

export function createAuditEvent(
  area: string,
  action: string,
  summary: string,
): AuditEvent {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    actor: 'foundation-admin',
    area,
    action,
    summary,
  }
}

export function createIntegrationContract(
  config: AppConfig,
  deployment: DeploymentState,
  checks: ReadinessCheck[],
  auditEvents: AuditEvent[],
  connectorResults: Record<string, ConnectorTestResult> = {},
) {
  const activeFamilies = getDomainFamilies(deployment.activeDomains)

  return {
    generated_at: new Date().toISOString(),
    environment: config.environment.environment,
    warehouse: config.environment.warehouse,
    deployment_profile: {
      industries: deployment.activeIndustries.map((key) => ({
        key,
        display_name: config.industries[key]?.display_name ?? key,
        terminology: config.industries[key]?.terminology ?? {},
      })),
      solution_domains: deployment.activeDomains.map((key) => ({
        key,
        display_name: config.solutionDomains[key]?.display_name ?? key,
        modules: config.solutionDomains[key]?.modules ?? [],
      })),
    },
    canonical_object_families: activeFamilies.map((key) => ({
      key,
      objects: config.objectFamilies[key]?.objects ?? [],
    })),
    connectors: Object.entries(config.connectors.connectors).map(([key, value]) => ({
      key,
      definition: value,
      test_result: connectorResults[key] ?? {
        status: 'warning',
        evidence: 'Connector test has not been run in this browser session.',
      },
    })),
    mappings: Object.entries(config.mappings).map(([key, value]) => ({
      key,
      object: value.object,
      source_connector: value.source_connector,
      source_object: value.source_object,
      mapped_field_count: Object.keys(value.fields).length,
      required_fields: value.required,
    })),
    readiness: checks,
    audit_events: auditEvents.slice(0, 20),
    known_gaps: [
      'Live external authentication is still simulated until credentials and backend adapters are configured.',
      'Persistence is browser-local in this phase; backend storage and multi-user version history are deferred.',
      'Snowflake and SharePoint preview rows require live backend adapters.',
    ],
  }
}

export function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function hasText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0
}

function makeCheck(
  id: string,
  label: string,
  passed: boolean,
  evidence: string,
  remediation: string,
): ReadinessCheck {
  return {
    id,
    label,
    status: passed ? 'pass' : 'blocking',
    evidence,
    remediation,
  }
}

function connectorObjects(connector: ConnectorDefinition) {
  if (connector.objects?.length) return connector.objects
  if (connector.target) return [{ source: connector.display_name, target: connector.target }]
  return []
}

export function testConnector(
  connectorId: string,
  connector: ConnectorDefinition,
): ConnectorTestResult {
  const objects = connectorObjects(connector)
  const commonChecks = [
    makeCheck(
      'display_name',
      'Display name',
      hasText(connector.display_name),
      hasText(connector.display_name)
        ? `Display name is "${connector.display_name}".`
        : 'Display name is missing.',
      'Add a connector display_name.',
    ),
    makeCheck(
      'source_targets',
      'Source and target objects',
      objects.length > 0,
      `${objects.length} source-to-target object mapping(s) defined.`,
      'Define connector objects or target canonical object.',
    ),
    makeCheck(
      'refresh_mode',
      'Refresh mode',
      hasText(connector.refresh_mode) || hasText(connector.integration_mode),
      connector.refresh_mode
        ? `Refresh mode is ${connector.refresh_mode}.`
        : `Integration mode is ${connector.integration_mode ?? 'missing'}.`,
      'Set refresh_mode or integration_mode in the connector manifest.',
    ),
  ]

  const typeChecks: ReadinessCheck[] = []

  if (connector.type === 'snowflake') {
    typeChecks.push(
      makeCheck(
        'snowflake_database',
        'Snowflake database',
        hasText(connector.database),
        `Database: ${connector.database ?? 'missing'}.`,
        'Set database for the Snowflake connector.',
      ),
      makeCheck(
        'snowflake_schema',
        'Snowflake schema',
        hasText(connector.schema),
        `Schema: ${connector.schema ?? 'missing'}.`,
        'Set schema for the Snowflake connector.',
      ),
      makeCheck(
        'snowflake_role',
        'Snowflake role',
        hasText(connector.role),
        `Role: ${connector.role ?? 'missing'}.`,
        'Set least-privilege Snowflake role.',
      ),
    )
  } else if (connector.type === 'sharepoint_excel') {
    typeChecks.push(
      makeCheck(
        'sharepoint_site',
        'SharePoint site',
        hasText(connector.site_url),
        `Site URL: ${connector.site_url ?? 'missing'}.`,
        'Set site_url for the SharePoint Excel connector.',
      ),
      makeCheck(
        'sharepoint_workbook',
        'Workbook and sheet',
        hasText(connector.workbook) && hasText(connector.sheet),
        `Workbook: ${connector.workbook ?? 'missing'}, sheet: ${connector.sheet ?? 'missing'}.`,
        'Set workbook and sheet for the SharePoint Excel connector.',
      ),
    )
  } else if (connector.type === 'csv') {
    typeChecks.push(
      makeCheck(
        'csv_target',
        'CSV target',
        hasText(connector.target),
        `Target: ${connector.target ?? 'missing'}.`,
        'Set target canonical object for CSV/manual upload.',
      ),
    )
  } else if (connector.type === 'external_reference') {
    typeChecks.push(
      makeCheck(
        'external_reference_target',
        'External reference target',
        hasText(connector.target),
        `Target: ${connector.target ?? 'missing'}.`,
        'Set target canonical object for external reference connector.',
      ),
    )
  } else {
    typeChecks.push({
      id: 'adapter_support',
      label: 'Adapter support',
      status: 'warning',
      evidence: `Connector type "${connector.type}" is registered but does not have a dedicated test adapter yet.`,
      remediation: 'Add adapter validation for this connector type.',
    })
  }

  const checks = [...commonChecks, ...typeChecks]
  const blocking = checks.some((check) => check.status === 'blocking')
  const warning = checks.some((check) => check.status === 'warning')
  const status: StatusLevel = blocking ? 'blocking' : warning ? 'warning' : 'pass'

  return {
    connectorId,
    status,
    testedAt: new Date().toISOString(),
    checks,
    metadata: {
      sourceType: connector.type,
      displayName: connector.display_name,
      sourceObjects: objects.length,
      targetObjects: Array.from(new Set(objects.map((object) => object.target))).sort(),
      refreshMode: connector.refresh_mode ?? connector.integration_mode ?? 'not_configured',
      connectionMode:
        connector.type === 'external_reference'
          ? 'reference_only'
          : 'manifest_validation_ready_for_live_adapter',
    },
  }
}

export function testAllConnectors(config: AppConfig) {
  return Object.fromEntries(
    Object.entries(config.connectors.connectors).map(([id, connector]) => [
      id,
      testConnector(id, connector),
    ]),
  )
}

function parseCsvLine(line: string) {
  const values: string[] = []
  let current = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]
    if (char === '"' && quoted && next === '"') {
      current += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  values.push(current.trim())
  return values
}

function inferType(values: string[]): CsvSchemaInference['columns'][number]['inferredType'] {
  const nonEmpty = values.filter((value) => value.length > 0)
  if (nonEmpty.length === 0) return 'empty'

  const dateLike = nonEmpty.filter((value) =>
    /^(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})$/.test(value),
  ).length
  const numberLike = nonEmpty.filter((value) => /^-?\d+(\.\d+)?$/.test(value)).length

  if (dateLike === nonEmpty.length) return 'date'
  if (numberLike === nonEmpty.length) return 'number'
  return 'text'
}

export function inferCsvSchema(csvText: string): CsvSchemaInference {
  const rows = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseCsvLine)

  const [headers = [], ...dataRows] = rows

  const columns = headers.map((header, columnIndex) => {
    const values = dataRows.map((row) => row[columnIndex] ?? '')
    const sampleValues = Array.from(new Set(values.filter(Boolean))).slice(0, 3)
    return {
      name: header,
      nonEmptyCount: values.filter((value) => value.length > 0).length,
      sampleValues,
      inferredType: inferType(values),
    }
  })

  return {
    rowCount: dataRows.length,
    columns,
  }
}

export function validateMappingAgainstSchema(
  mapping: MappingManifest,
  schema: CsvSchemaInference,
): MappingValidationResult {
  const sourceColumns = new Set(schema.columns.map((column) => column.name))
  const mappedFields = Object.entries(mapping.fields).map(([targetField, sourceField]) => ({
    targetField,
    sourceField,
    present: sourceColumns.has(sourceField),
    required: mapping.required.includes(targetField),
  }))
  const missingRequired = mappedFields.filter((field) => field.required && !field.present)
  const missingOptional = mappedFields.filter((field) => !field.required && !field.present)
  const primaryKeyPresent = sourceColumns.has(mapping.primary_key.source_field)

  const checks: ReadinessCheck[] = [
    {
      id: 'mapping_primary_key',
      label: 'Primary key source field',
      status: primaryKeyPresent ? 'pass' : 'blocking',
      evidence: primaryKeyPresent
        ? `${mapping.primary_key.source_field} is present in the inferred schema.`
        : `${mapping.primary_key.source_field} is missing from the inferred schema.`,
      remediation: 'Update primary_key.source_field or add the missing source column.',
    },
    {
      id: 'mapping_required_fields',
      label: 'Required source fields',
      status: missingRequired.length === 0 ? 'pass' : 'blocking',
      evidence:
        missingRequired.length === 0
          ? `${mapping.required.length} required fields are mapped and present.`
          : `${missingRequired.length} required fields are missing: ${missingRequired
              .map((field) => field.sourceField)
              .join(', ')}.`,
      remediation: 'Map all required target fields to present source columns.',
    },
    {
      id: 'mapping_optional_fields',
      label: 'Optional source fields',
      status: missingOptional.length === 0 ? 'pass' : 'warning',
      evidence:
        missingOptional.length === 0
          ? 'All optional mapped source fields are present.'
          : `${missingOptional.length} optional mapped fields are missing.`,
      remediation: 'Review optional field mappings and source availability.',
    },
    {
      id: 'mapping_schema_rows',
      label: 'Schema preview rows',
      status: schema.rowCount > 0 ? 'pass' : 'blocking',
      evidence: `${schema.rowCount} sample row(s) available for schema inference.`,
      remediation: 'Provide a CSV with at least one data row.',
    },
  ]

  const status: StatusLevel = checks.some((check) => check.status === 'blocking')
    ? 'blocking'
    : checks.some((check) => check.status === 'warning')
      ? 'warning'
      : 'pass'

  return {
    status,
    checks,
    mappedFields,
  }
}
