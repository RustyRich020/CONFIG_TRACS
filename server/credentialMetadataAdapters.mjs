function missingCredentialMetadata({ connectorId, connector, evidence, requiredEnvironment }) {
  const sourceObjects =
    connector.objects?.map((object) => object.source) ??
    [connector.sheet, connector.workbook, connector.display_name].filter(Boolean)
  const targetObjects =
    connector.objects?.map((object) => object.target) ??
    [connector.target].filter(Boolean)

  return {
    connectorId,
    adapterType: connector.type,
    discoveredAt: new Date().toISOString(),
    credentialMode: 'missing',
    requiredEnvironment,
    sourceObjects,
    targetObjects,
    rowCount: 0,
    columns: [],
    evidence,
  }
}

function snowflakeAccountUrl() {
  const explicitUrl = process.env.TRACS_SNOWFLAKE_ACCOUNT_URL
  if (explicitUrl) return explicitUrl.replace(/\/$/, '')
  const account = process.env.TRACS_SNOWFLAKE_ACCOUNT
  if (!account) return null
  return `https://${account}.snowflakecomputing.com`
}

function envPresent(name) {
  if (name.includes(' or ')) {
    return name
      .split(' or ')
      .some((part) => Boolean(process.env[part.trim()]))
  }
  return Boolean(process.env[name])
}

function ageDaysFromIso(value) {
  const parsed = Date.parse(value)
  if (!Number.isFinite(parsed)) return null
  return Math.max(0, Math.round(((Date.now() - parsed) / 864e5) * 10) / 10)
}

function rotationCheck({ maxAgeDays, rotatedAtEnv, tokenName }) {
  const checkedAt = new Date().toISOString()
  const rotatedAt = process.env[rotatedAtEnv]
  if (!rotatedAt) {
    return {
      checkedAt,
      maxAgeDays,
      status: 'warning',
      evidence: `${rotatedAtEnv} is not configured, so ${tokenName} token age cannot be verified.`,
    }
  }
  const ageDays = ageDaysFromIso(rotatedAt)
  if (ageDays === null) {
    return {
      checkedAt,
      rotatedAt,
      maxAgeDays,
      status: 'blocking',
      evidence: `${rotatedAtEnv} is not a valid ISO date/time.`,
    }
  }
  return {
    checkedAt,
    rotatedAt,
    maxAgeDays,
    ageDays,
    status: ageDays <= maxAgeDays ? 'pass' : 'warning',
    evidence: `${tokenName} token age is ${ageDays} day(s); max rotation age is ${maxAgeDays} day(s).`,
  }
}

function externalRequiredEnvironment() {
  return ['TRACS_EXTERNAL_API_BASE_URL', 'TRACS_EXTERNAL_API_TOKEN']
}

function externalCredentialMissing() {
  return externalRequiredEnvironment().some((name) => !process.env[name])
}

function externalSourceObjects(connector) {
  return [
    connector.source_object,
    connector.metadata_path,
    connector.preview_path,
    connector.display_name,
  ].filter(Boolean)
}

function externalTargetObjects(connector) {
  return [connector.target].filter(Boolean)
}

function externalUrl(path, limit) {
  const baseUrl = process.env.TRACS_EXTERNAL_API_BASE_URL
  if (!baseUrl) return null
  const normalizedPath = String(path || '/metadata').replace('{limit}', String(limit ?? 25))
  return new URL(normalizedPath, `${baseUrl.replace(/\/$/, '')}/`).toString()
}

async function externalJson(path, limit) {
  const url = externalUrl(path, limit)
  const token = process.env.TRACS_EXTERNAL_API_TOKEN
  if (!url || !token) return null
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`External reference API returned ${response.status}.`)
  }
  return response.json()
}

function rowsFromExternalPayload(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.rows)) return payload.rows
  if (Array.isArray(payload?.records)) return payload.records
  if (Array.isArray(payload?.items)) return payload.items
  if (payload && typeof payload === 'object') return [payload]
  return []
}

function columnsFromExternalRows(rows, configuredKeys = []) {
  const names = Array.from(
    new Set([
      ...configuredKeys,
      ...rows.flatMap((row) => Object.keys(row ?? {})),
    ]),
  )
  return names.map((name) => {
    const values = rows.map((row) => row?.[name]).filter((value) => value !== undefined && value !== null)
    return {
      name,
      inferredType:
        values.some((value) => typeof value === 'number')
          ? 'number'
          : values.some((value) => String(value).match(/^\d{4}-\d{2}-\d{2}/))
            ? 'date'
            : 'text',
      nonEmptyCount: values.length,
      sampleValues: Array.from(new Set(values.map((value) => String(value)))).slice(0, 3),
    }
  })
}

function externalWarningMetadata(connectorId, connector, evidence) {
  return {
    connectorId,
    adapterType: connector.type,
    discoveredAt: new Date().toISOString(),
    credentialMode: 'external_reference_token',
    requiredEnvironment: externalRequiredEnvironment(),
    sourcePath: connector.metadata_path ?? connector.source_object ?? connector.display_name,
    sourceObjects: externalSourceObjects(connector),
    targetObjects: externalTargetObjects(connector),
    rowCount: 0,
    columns: columnsFromExternalRows([], connector.key_fields ?? []),
    evidence,
  }
}

function credentialValidationProfile(connector) {
  if (connector.type === 'snowflake') {
    return {
      credentialMode: 'snowflake_sql_api_token',
      requiredEnvironment: [
        'TRACS_SNOWFLAKE_ACCOUNT_URL or TRACS_SNOWFLAKE_ACCOUNT',
        'TRACS_SNOWFLAKE_TOKEN',
      ],
      rotation: {
        rotatedAtEnv: 'TRACS_SNOWFLAKE_TOKEN_ROTATED_AT',
        maxAgeDays: Number(process.env.TRACS_SNOWFLAKE_TOKEN_MAX_AGE_DAYS ?? 90),
        tokenName: 'Snowflake SQL API',
      },
    }
  }
  if (connector.type === 'sharepoint_excel') {
    return {
      credentialMode: 'microsoft_graph_token',
      requiredEnvironment: ['TRACS_GRAPH_TOKEN'],
      rotation: {
        rotatedAtEnv: 'TRACS_GRAPH_TOKEN_ROTATED_AT',
        maxAgeDays: Number(process.env.TRACS_GRAPH_TOKEN_MAX_AGE_DAYS ?? 90),
        tokenName: 'Microsoft Graph',
      },
    }
  }
  if (connector.type === 'external_reference' || connector.type === 'rest_api') {
    return {
      credentialMode: 'external_reference_token',
      requiredEnvironment: ['TRACS_EXTERNAL_API_BASE_URL', 'TRACS_EXTERNAL_API_TOKEN'],
      rotation: {
        rotatedAtEnv: 'TRACS_EXTERNAL_API_TOKEN_ROTATED_AT',
        maxAgeDays: Number(process.env.TRACS_EXTERNAL_API_TOKEN_MAX_AGE_DAYS ?? 90),
        tokenName: 'External reference API',
      },
    }
  }
  return {
    credentialMode: 'not_required',
    requiredEnvironment: [],
    rotation: {
      rotatedAtEnv: '',
      maxAgeDays: 0,
      tokenName: connector.type,
    },
  }
}

export function validateConnectorCredentials(connectorId, connector) {
  const profile = credentialValidationProfile(connector)
  const presentEnvironment = profile.requiredEnvironment.filter(envPresent)
  const missingEnvironment = profile.requiredEnvironment.filter((name) => !envPresent(name))
  const rotation =
    profile.requiredEnvironment.length > 0
      ? rotationCheck(profile.rotation)
      : {
          checkedAt: new Date().toISOString(),
          maxAgeDays: 0,
          status: 'pass',
          evidence: `${connector.type} connector does not require server token rotation evidence.`,
        }
  const credentialStatus =
    missingEnvironment.length > 0 ? 'blocking' : profile.requiredEnvironment.length > 0 ? 'pass' : 'pass'
  const status =
    credentialStatus === 'blocking' || rotation.status === 'blocking'
      ? 'blocking'
      : rotation.status === 'warning'
        ? 'warning'
        : 'pass'
  const checks = [
    {
      id: `${connectorId}:credential_presence`,
      label: 'Credential presence',
      status: credentialStatus,
      severity: credentialStatus === 'blocking' ? 'critical' : 'low',
      evidence:
        missingEnvironment.length > 0
          ? `Missing server environment: ${missingEnvironment.join(', ')}.`
          : profile.requiredEnvironment.length > 0
            ? `Required credential references are configured for ${connector.display_name}.`
            : `${connector.display_name} does not require server credentials.`,
      remediation:
        missingEnvironment.length > 0
          ? 'Configure the required server environment variables outside the frontend and rerun validation.'
          : 'No credential presence remediation required.',
    },
    {
      id: `${connectorId}:token_rotation`,
      label: 'Token rotation evidence',
      status: rotation.status,
      severity: rotation.status === 'blocking' ? 'critical' : rotation.status === 'warning' ? 'medium' : 'low',
      evidence: rotation.evidence,
      remediation:
        rotation.status === 'pass'
          ? 'No rotation remediation required.'
          : 'Set or update the token rotated-at environment variable using an ISO date/time after rotating the token.',
    },
  ]

  return {
    connectorId,
    connectorType: connector.type,
    validatedAt: new Date().toISOString(),
    status,
    credentialMode: profile.credentialMode,
    requiredEnvironment: profile.requiredEnvironment,
    presentEnvironment,
    missingEnvironment,
    rotation,
    checks,
    evidence:
      missingEnvironment.length > 0
        ? `${connector.display_name} credential validation blocked by missing server environment.`
        : `${connector.display_name} credential validation completed with ${status} status.`,
  }
}

export async function discoverExternalReferenceMetadata(connectorId, connector) {
  if (externalCredentialMissing()) {
    return externalWarningMetadata(
      connectorId,
      connector,
      'External reference metadata discovery is credential-aware but no external API base URL or token is configured. Manifest keys were returned as pending discovery evidence.',
    )
  }

  const payload = await externalJson(
    connector.metadata_path ?? process.env.TRACS_EXTERNAL_API_METADATA_PATH ?? '/metadata',
  )
  const rows = rowsFromExternalPayload(payload)
  const columns = Array.isArray(payload?.columns)
    ? payload.columns.map((column) => ({
        name: column.name ?? column,
        inferredType: column.type ?? 'text',
        nonEmptyCount: column.nonEmptyCount ?? rows.length,
        sampleValues: column.sampleValues ?? [],
      }))
    : columnsFromExternalRows(rows, connector.key_fields ?? [])

  return {
    connectorId,
    adapterType: connector.type,
    discoveredAt: new Date().toISOString(),
    credentialMode: 'external_reference_token',
    sourcePath: connector.metadata_path ?? connector.source_object ?? connector.display_name,
    sourceObjects: externalSourceObjects(connector),
    targetObjects: externalTargetObjects(connector),
    rowCount: Number(payload?.rowCount ?? payload?.total ?? rows.length),
    columns,
    evidence: `${columns.length} external reference field(s) discovered from ${connector.metadata_path ?? 'metadata endpoint'}.`,
  }
}

export async function previewExternalReferenceRows(connectorId, connector, limit = 5) {
  const boundedLimit = Math.min(Math.max(Number(limit) || 5, 1), 50)
  if (externalCredentialMissing()) {
    return {
      connectorId,
      adapterType: connector.type,
      previewedAt: new Date().toISOString(),
      sourcePath: connector.preview_path ?? connector.source_object ?? connector.display_name,
      columns: connector.key_fields ?? [],
      rowCount: 0,
      returnedRows: 0,
      rows: [],
      evidence:
        'External reference row preview is credential-aware but no external API base URL or token is configured. Configure server environment references and rerun preview.',
    }
  }

  const payload = await externalJson(
    connector.preview_path ?? process.env.TRACS_EXTERNAL_API_PREVIEW_PATH ?? '/records',
    boundedLimit,
  )
  const rows = rowsFromExternalPayload(payload)
    .slice(0, boundedLimit)
    .map((row) =>
      Object.fromEntries(
        Object.entries(row ?? {}).map(([key, value]) => [key, value === null || value === undefined ? '' : String(value)]),
      ),
    )
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))

  return {
    connectorId,
    adapterType: connector.type,
    previewedAt: new Date().toISOString(),
    sourcePath: connector.preview_path ?? connector.source_object ?? connector.display_name,
    columns,
    rowCount: Number(payload?.rowCount ?? payload?.total ?? rows.length),
    returnedRows: rows.length,
    rows,
    evidence: `${rows.length} bounded external reference preview row(s) returned from ${connector.preview_path ?? 'preview endpoint'}.`,
  }
}

async function executeSnowflakeMetadataQuery({ connector, statement }) {
  const accountUrl = snowflakeAccountUrl()
  const token = process.env.TRACS_SNOWFLAKE_TOKEN
  if (!accountUrl || !token) return null

  const response = await fetch(`${accountUrl}/api/v2/statements`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      statement,
      database: connector.database,
      schema: connector.schema,
      role: connector.role,
      timeout: 30,
    }),
  })

  if (!response.ok) {
    throw new Error(`Snowflake SQL API returned ${response.status}.`)
  }

  return response.json()
}

function snowflakeColumnsFromResult(result) {
  const rowType = result?.resultSetMetaData?.rowType ?? []
  const data = result?.data ?? []
  const nameIndex = rowType.findIndex((column) => column.name === 'COLUMN_NAME')
  const typeIndex = rowType.findIndex((column) => column.name === 'DATA_TYPE')
  const nullableIndex = rowType.findIndex((column) => column.name === 'IS_NULLABLE')

  return data.map((row) => {
    const name = row[nameIndex >= 0 ? nameIndex : 0] ?? 'unknown_column'
    const dataType = row[typeIndex >= 0 ? typeIndex : 1] ?? 'text'
    const nullable = row[nullableIndex >= 0 ? nullableIndex : 2] ?? 'YES'
    return {
      name,
      inferredType: String(dataType).toLowerCase().includes('date') ? 'date' : 'text',
      nonEmptyCount: nullable === 'NO' ? 1 : 0,
      sampleValues: [String(dataType)],
    }
  })
}

function snowflakeString(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

export async function discoverSnowflakeMetadata(connectorId, connector) {
  const requiredEnvironment = [
    'TRACS_SNOWFLAKE_ACCOUNT_URL or TRACS_SNOWFLAKE_ACCOUNT',
    'TRACS_SNOWFLAKE_TOKEN',
  ]
  if (!snowflakeAccountUrl() || !process.env.TRACS_SNOWFLAKE_TOKEN) {
    return missingCredentialMetadata({
      connectorId,
      connector,
      requiredEnvironment,
      evidence:
        'Snowflake metadata discovery is credential-aware but no Snowflake SQL API token is configured. Manifest objects were returned as pending discovery evidence.',
    })
  }

  const sourceObject = connector.objects?.[0]?.source ?? connector.display_name
  const statement = `
    select column_name, data_type, is_nullable
    from information_schema.columns
    where table_schema = ${snowflakeString(connector.schema)}
      and table_name = ${snowflakeString(sourceObject)}
    order by ordinal_position
  `
  const result = await executeSnowflakeMetadataQuery({ connector, statement })
  const columns = snowflakeColumnsFromResult(result)

  return {
    connectorId,
    adapterType: 'snowflake',
    discoveredAt: new Date().toISOString(),
    credentialMode: 'server_token',
    sourcePath: `${connector.database}.${connector.schema}.${sourceObject}`,
    sourceObjects: connector.objects?.map((object) => object.source) ?? [sourceObject],
    targetObjects: connector.objects?.map((object) => object.target) ?? [],
    rowCount: 0,
    columns,
    evidence: `${columns.length} Snowflake column(s) discovered from ${connector.database}.${connector.schema}.${sourceObject}.`,
  }
}

async function graphJson(path) {
  const token = process.env.TRACS_GRAPH_TOKEN
  if (!token) return null
  const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`Microsoft Graph returned ${response.status}.`)
  }
  return response.json()
}

function sharePointHostAndPath(siteUrl) {
  const url = new URL(siteUrl)
  return {
    host: url.host,
    path: url.pathname,
  }
}

export async function discoverSharePointExcelMetadata(connectorId, connector) {
  const requiredEnvironment = ['TRACS_GRAPH_TOKEN']
  if (!process.env.TRACS_GRAPH_TOKEN) {
    return missingCredentialMetadata({
      connectorId,
      connector,
      requiredEnvironment,
      evidence:
        'SharePoint Excel metadata discovery is credential-aware but no Microsoft Graph token is configured. Workbook and sheet manifest values were returned as pending discovery evidence.',
    })
  }

  const { host, path } = sharePointHostAndPath(connector.site_url)
  const site = await graphJson(`/sites/${host}:${path}`)
  const drive = await graphJson(`/sites/${site.id}/drive`)
  const workbookPath = `/${connector.library}/${connector.workbook}`.replace(/\/+/g, '/')
  const item = await graphJson(`/drives/${drive.id}/root:${encodeURI(workbookPath)}`)
  const rows = await graphJson(
    `/drives/${drive.id}/items/${item.id}/workbook/worksheets/${encodeURIComponent(
      connector.sheet,
    )}/usedRange(valuesOnly=true)`,
  )
  const values = rows?.values ?? []
  const headers = values[0] ?? []
  const rowCount = Math.max(values.length - 1, 0)

  return {
    connectorId,
    adapterType: 'sharepoint_excel',
    discoveredAt: new Date().toISOString(),
    credentialMode: 'microsoft_graph_token',
    sourcePath: `${connector.site_url}/${connector.library}/${connector.workbook}#${connector.sheet}`,
    sourceObjects: [connector.sheet],
    targetObjects: [connector.target].filter(Boolean),
    rowCount,
    columns: headers.map((name) => ({
      name,
      inferredType: 'text',
      nonEmptyCount: rowCount,
      sampleValues: [],
    })),
    evidence: `${headers.length} SharePoint Excel column(s) and ${rowCount} row(s) discovered through Microsoft Graph.`,
  }
}
