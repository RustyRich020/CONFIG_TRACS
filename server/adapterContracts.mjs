export const adapterContracts = [
  {
    id: 'snowflake_live_adapter_v1',
    connectorType: 'snowflake',
    displayName: 'Snowflake Live Adapter',
    operations: ['health_check', 'discover_metadata', 'preview_rows', 'validate_mapping'],
    authMode: 'server_secret_or_oauth',
    evidenceRequired: [
      'Authenticated principal or service identity',
      'Database/schema/role resolved',
      'Object metadata discovered',
      'Bounded preview rows returned',
    ],
  },
  {
    id: 'sharepoint_excel_live_adapter_v1',
    connectorType: 'sharepoint_excel',
    displayName: 'SharePoint Excel Live Adapter',
    operations: ['health_check', 'discover_metadata', 'preview_rows', 'validate_mapping'],
    authMode: 'microsoft_graph_delegated_or_app',
    evidenceRequired: [
      'Graph identity resolved',
      'Site and library located',
      'Workbook and sheet located',
      'Header row and bounded sample rows returned',
    ],
  },
  {
    id: 'csv_manual_upload_adapter_v1',
    connectorType: 'csv',
    displayName: 'CSV Manual Upload Adapter',
    operations: ['health_check', 'discover_metadata', 'preview_rows', 'validate_mapping'],
    authMode: 'signed_upload_session',
    evidenceRequired: [
      'File accepted by upload policy',
      'Headers parsed',
      'Column types inferred',
      'Mapping validation completed',
    ],
  },
  {
    id: 'external_reference_adapter_v1',
    connectorType: 'external_reference',
    displayName: 'External Reference Adapter',
    operations: ['health_check', 'discover_metadata', 'preview_rows', 'validate_mapping'],
    authMode: 'api_key_or_oauth',
    evidenceRequired: [
      'Endpoint reachable',
      'Reference entity discovered',
      'Bounded reference preview returned',
      'Rate-limit policy captured',
      'Mapping keys validated',
    ],
  },
]

export function getAdapterContract(connectorType) {
  return adapterContracts.find((contract) => contract.connectorType === connectorType)
}

export function runAdapterDryRun(connectorId, connector) {
  const contract = getAdapterContract(connector.type)
  const fallbackObjects = [connector.workbook, connector.sheet, connector.display_name].filter(Boolean)
  const sourceObjects = connector.objects?.map((object) => object.source) ?? fallbackObjects
  const targetObjects =
    connector.objects?.map((object) => object.target) ?? [connector.target].filter(Boolean)
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
      sourceObjects: sourceObjects.length > 0 ? sourceObjects : [connector.display_name],
      targetObjects: targetObjects.length > 0 ? targetObjects : ['not mapped'],
      previewRows: connector.type === 'external_reference' ? 0 : 25,
      warnings,
    },
  }
}
