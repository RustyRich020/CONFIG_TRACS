import type { LucideIcon } from 'lucide-react'
import { Database, FileCog, GitBranch, ScrollText } from 'lucide-react'
import type { ReactNode } from 'react'
import type { StatusLevel } from '../types'

export function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div className="metadata-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export function PanelHeader({
  icon: Icon,
  subtitle,
  title,
}: {
  icon: LucideIcon
  subtitle: string
  title: string
}) {
  return (
    <div className="panel-header">
      <Icon size={18} />
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  )
}

export function StatusChip({ status, label }: { status: StatusLevel; label: string }) {
  return <span className={`status-chip ${status}`}>{label}</span>
}

export function ConnectorGlyph({ type }: { type: string }) {
  if (type === 'snowflake') return <Database className="connector-glyph" size={18} />
  if (type === 'sharepoint_excel') return <FileCog className="connector-glyph" size={18} />
  if (type === 'csv') return <ScrollText className="connector-glyph" size={18} />
  return <GitBranch className="connector-glyph" size={18} />
}

export function HistoryRow({
  children,
  label,
  status,
  subtitle,
  title,
}: {
  children?: ReactNode
  label: string
  status: StatusLevel
  subtitle?: string
  title: string
}) {
  return (
    <div className="mapping-run-row">
      <div>
        <strong>{title}</strong>
        {subtitle ? <span>{subtitle}</span> : null}
        {children ? <small>{children}</small> : null}
      </div>
      <StatusChip status={status} label={label} />
    </div>
  )
}

export function DashboardHeading({
  label,
  status,
  title,
}: {
  label: string
  status: StatusLevel
  title: string
}) {
  return (
    <div className="dashboard-heading">
      <h4>{title}</h4>
      <StatusChip status={status} label={label} />
    </div>
  )
}

export function ConnectorRunRow({
  children,
  label,
  status,
  subtitle,
  title,
}: {
  children?: ReactNode
  label: string
  status: StatusLevel
  subtitle: string
  title: ReactNode
}) {
  return (
    <div className="connector-run-row">
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
        {children ? <small>{children}</small> : null}
      </div>
      <StatusChip status={status} label={label} />
    </div>
  )
}
