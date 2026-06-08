import type { AdapterContract } from './types'

export const adapterContracts: AdapterContract[] = [
  {
    id: 'snowflake_live_adapter_v1',
    connectorType: 'snowflake',
    displayName: 'Snowflake Live Adapter',
    operations: ['health_check', 'discover_metadata', 'preview_rows', 'validate_mapping'],
    authMode: 'server_secret_or_oauth',
    requestShape: {
      connectorId: 'Configured connector manifest key.',
      warehouse: 'Database, schema, role, and optional warehouse context.',
      objectSelector: 'Source table or view selector with row preview limit.',
    },
    responseShape: {
      health: 'Connection status, latency, role, and warehouse evidence.',
      metadata: 'Tables, views, columns, row counts, and freshness markers.',
      preview: 'Bounded sample rows with inferred source schema.',
    },
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
    requestShape: {
      connectorId: 'Configured connector manifest key.',
      workbook: 'Site, library, workbook, and sheet selector.',
      range: 'Optional worksheet range and header row settings.',
    },
    responseShape: {
      health: 'Graph access status, site/library resolution, and workbook evidence.',
      metadata: 'Worksheet names, table names, columns, and modified timestamps.',
      preview: 'Bounded worksheet rows normalized into canonical source rows.',
    },
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
    requestShape: {
      connectorId: 'Configured connector manifest key.',
      uploadSession: 'Signed upload session and file metadata.',
      parsing: 'Delimiter, header row, encoding, and row limit settings.',
    },
    responseShape: {
      health: 'Upload parser readiness and file acceptance evidence.',
      metadata: 'Inferred columns, types, row count, and parse warnings.',
      preview: 'Bounded parsed rows held for mapping validation.',
    },
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
    operations: ['health_check', 'discover_metadata', 'validate_mapping'],
    authMode: 'api_key_or_oauth',
    requestShape: {
      connectorId: 'Configured connector manifest key.',
      endpoint: 'External system endpoint and resource selector.',
      cadence: 'Refresh cadence and incremental token settings.',
    },
    responseShape: {
      health: 'Endpoint status, identity, and rate-limit evidence.',
      metadata: 'Reference entity types, keys, and freshness markers.',
      preview: 'Optional bounded reference records when allowed by source policy.',
    },
    evidenceRequired: [
      'Endpoint reachable',
      'Reference entity discovered',
      'Rate-limit policy captured',
      'Mapping keys validated',
    ],
  },
]

export function getAdapterContract(connectorType: string) {
  return adapterContracts.find((contract) => contract.connectorType === connectorType)
}
