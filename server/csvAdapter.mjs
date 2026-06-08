import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const defaultSamplePath = resolve('public', 'samples', 'quality_events_sample.csv')

function parseCsvLine(line) {
  const values = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"' && next === '"') {
      current += '"'
      index += 1
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }

  values.push(current)
  return values.map((value) => value.trim())
}

function inferType(values) {
  const populated = values.filter((value) => value.length > 0)
  if (populated.length === 0) return 'empty'
  if (populated.every((value) => !Number.isNaN(Number(value)))) return 'number'
  if (populated.every((value) => /^\d{4}-\d{2}-\d{2}$/.test(value))) return 'date'
  return 'text'
}

function parseCsv(text) {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
  const headers = parseCsvLine(lines[0] ?? '')
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
  })

  return { headers, rows }
}

async function loadConnectorCsv(connector) {
  const sourcePath = connector.fixture_path
    ? resolve(connector.fixture_path)
    : defaultSamplePath
  const text = await readFile(sourcePath, 'utf8')
  return { sourcePath, ...parseCsv(text) }
}

export async function discoverCsvMetadata(connectorId, connector) {
  const { headers, rows, sourcePath } = await loadConnectorCsv(connector)
  const columns = headers.map((name) => {
    const values = rows.map((row) => row[name] ?? '')
    return {
      name,
      inferredType: inferType(values),
      nonEmptyCount: values.filter((value) => value.length > 0).length,
      sampleValues: Array.from(new Set(values.filter(Boolean))).slice(0, 3),
    }
  })

  return {
    connectorId,
    adapterType: 'csv',
    discoveredAt: new Date().toISOString(),
    sourcePath,
    sourceObjects: [connector.source_object ?? connector.display_name],
    targetObjects: connector.target ? [connector.target] : [],
    rowCount: rows.length,
    columns,
    evidence: `${headers.length} column(s) and ${rows.length} row(s) discovered from CSV source.`,
  }
}

export async function previewCsvRows(connectorId, connector, limit = 25) {
  const { headers, rows, sourcePath } = await loadConnectorCsv(connector)
  const boundedLimit = Math.min(Math.max(Number(limit) || 25, 1), 100)
  return {
    connectorId,
    adapterType: 'csv',
    previewedAt: new Date().toISOString(),
    sourcePath,
    columns: headers,
    rowCount: rows.length,
    returnedRows: Math.min(rows.length, boundedLimit),
    rows: rows.slice(0, boundedLimit),
    evidence: `${Math.min(rows.length, boundedLimit)} preview row(s) returned from CSV source.`,
  }
}
