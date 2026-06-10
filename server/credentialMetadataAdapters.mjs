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
