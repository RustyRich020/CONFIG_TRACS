import { readdir, stat } from 'node:fs/promises'
import { extname, relative, resolve } from 'node:path'

const defaultAssetRoot = 'C:\\Users\\Allen\\MYROBOTS'
const usefulExtensions = new Set([
  '.md',
  '.docx',
  '.pdf',
  '.sql',
  '.db',
  '.sqlite',
  '.sqlite3',
  '.xlsx',
  '.json',
  '.yaml',
  '.yml',
  '.csv',
])
const ignoredDirectories = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'bin',
  'obj',
  'vendor',
  'tmp',
  'cache',
  'blobs',
])

const categoryRules = [
  { category: 'CAPA', domain: 'qms', keywords: ['capa', 'corrective', 'preventive'] },
  { category: 'Risk Management', domain: 'risk_management', keywords: ['risk', '14971', 'fmea', 'hazard'] },
  { category: 'Design Controls', domain: 'design_controls', keywords: ['design', 'dhf', 'requirements', 'user-needs'] },
  { category: 'Document Control', domain: 'document_control', keywords: ['document', 'record-control', 'change-request'] },
  { category: 'Internal Audit', domain: 'audit', keywords: ['audit'] },
  { category: 'Management Review', domain: 'management_review', keywords: ['management-review'] },
  { category: 'Post-Market Surveillance', domain: 'post_market', keywords: ['post-market', 'surveillance', 'pms', 'pmcf'] },
  { category: 'Clinical Evaluation', domain: 'clinical', keywords: ['clinical', 'literature'] },
  { category: 'Complaints', domain: 'quality', keywords: ['complaint', 'feedback'] },
  { category: 'Vigilance', domain: 'vigilance', keywords: ['vigilance', 'incident', 'field-safety'] },
  { category: 'Supplier Quality', domain: 'supplier_quality', keywords: ['supplier', 'purchasing'] },
  { category: 'Training', domain: 'training', keywords: ['training', 'human-resources', 'onboarding'] },
  { category: 'Database Schema', domain: 'data_model', keywords: ['database', 'schema', '.sql', '.db', 'sqlite'] },
]

function classifyAsset(relativePath, extension) {
  const haystack = `${relativePath} ${extension}`.toLowerCase()
  return (
    categoryRules.find((rule) => rule.keywords.some((keyword) => haystack.includes(keyword))) ?? {
      category: 'Reference',
      domain: 'reference',
    }
  )
}

function sourceFamily(relativePath) {
  const lower = relativePath.toLowerCase()
  if (lower.includes('openregulatory') || lower.includes('[openreg]')) return 'OpenRegulatory'
  if (lower.includes('gstt') || lower.includes('[gstt]')) return 'GSTT'
  if (lower.includes('evolunis') || lower.includes('[evolunis]')) return 'evolunis'
  if (lower.includes('innolitics') || lower.includes('rdm') || lower.includes('[rdm]')) return 'RDM'
  if (lower.includes('database-schemas')) return 'Database Schemas'
  if (lower.includes('mdsap')) return 'MDSAP'
  return 'MYROBOTS'
}

function assetKind(extension) {
  if (['.md', '.docx', '.pdf'].includes(extension)) return 'template'
  if (['.sql', '.db', '.sqlite', '.sqlite3'].includes(extension)) return 'database_schema'
  if (['.xlsx', '.csv'].includes(extension)) return 'data_template'
  if (['.json', '.yaml', '.yml'].includes(extension)) return 'manifest'
  return 'reference'
}

async function walk(root, current, assets, options) {
  if (assets.length >= options.limit) return
  const entries = await readdir(current, { withFileTypes: true })

  for (const entry of entries) {
    if (assets.length >= options.limit) return
    const fullPath = resolve(current, entry.name)

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name.toLowerCase())) {
        await walk(root, fullPath, assets, options)
      }
      continue
    }

    if (!entry.isFile()) continue

    const extension = extname(entry.name).toLowerCase()
    if (!usefulExtensions.has(extension)) continue

    const relativePath = relative(root, fullPath)
    const metadata = await stat(fullPath)
    const classification = classifyAsset(relativePath, extension)

    assets.push({
      id: Buffer.from(relativePath).toString('base64url'),
      name: entry.name,
      kind: assetKind(extension),
      category: classification.category,
      domain: classification.domain,
      sourceFamily: sourceFamily(relativePath),
      extension: extension || 'none',
      relativePath,
      absolutePath: fullPath,
      sizeBytes: metadata.size,
      lastModified: metadata.mtime.toISOString(),
    })
  }
}

export async function scanAssetRegistry({
  root = process.env.TRACS_ASSET_ROOT ?? defaultAssetRoot,
  limit = 500,
} = {}) {
  const resolvedRoot = resolve(root)
  const assets = []
  await walk(resolvedRoot, resolvedRoot, assets, { limit })

  const summary = assets.reduce(
    (accumulator, asset) => {
      accumulator.total += 1
      accumulator.byKind[asset.kind] = (accumulator.byKind[asset.kind] ?? 0) + 1
      accumulator.byCategory[asset.category] = (accumulator.byCategory[asset.category] ?? 0) + 1
      accumulator.bySourceFamily[asset.sourceFamily] =
        (accumulator.bySourceFamily[asset.sourceFamily] ?? 0) + 1
      return accumulator
    },
    { total: 0, byKind: {}, byCategory: {}, bySourceFamily: {} },
  )

  return {
    root: resolvedRoot,
    scannedAt: new Date().toISOString(),
    limit,
    assets,
    summary,
  }
}
