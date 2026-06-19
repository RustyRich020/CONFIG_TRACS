import type {
  GovernanceWorkflowStage,
  StatusLevel,
  WorkflowDefinition,
  WorkflowDefinitionPromotionPackage,
  WorkflowDefinitionValidationIssue,
  WorkflowDefinitionValidationResult,
} from './types'

const validWorkflowStages: GovernanceWorkflowStage[] = [
  'source',
  'package',
  'delivery',
  'acknowledgement',
  'closure',
  'closeout',
  'final_evidence',
  'retry',
]

export function validateWorkflowDefinitionDraft(
  workflowType: string,
  definition: WorkflowDefinition,
): WorkflowDefinitionValidationResult {
  const issues: WorkflowDefinitionValidationIssue[] = []
  const addIssue = (field: string, evidence: string, status: StatusLevel = 'blocking') => {
    issues.push({
      id: `${workflowType}:${field}:${issues.length + 1}`,
      status,
      field,
      evidence,
    })
  }

  if (!definition.display_name.trim()) addIssue('display_name', 'Display name is required.')
  if (!definition.description.trim()) addIssue('description', 'Description is required.')
  if (!definition.default_owner_role.trim()) addIssue('default_owner_role', 'Default owner role is required.')
  if (!Number.isFinite(definition.sla_days) || definition.sla_days < 0) {
    addIssue('sla_days', 'SLA days must be zero or greater.')
  }
  if (definition.stages.length === 0) addIssue('stages', 'At least one workflow stage is required.')
  for (const stage of definition.stages) {
    if (!validWorkflowStages.includes(stage)) addIssue('stages', `${stage} is not a valid workflow stage.`)
  }
  for (const [stage, nextStages] of Object.entries(definition.allowed_next_stages)) {
    if (!definition.stages.includes(stage as GovernanceWorkflowStage)) {
      addIssue('allowed_next_stages', `${stage} is not present in the workflow stage list.`)
    }
    for (const nextStage of nextStages ?? []) {
      if (!definition.stages.includes(nextStage)) {
        addIssue('allowed_next_stages', `${stage} references unknown next stage ${nextStage}.`)
      }
    }
  }
  if (definition.parent_link_fields.length === 0) {
    addIssue('parent_link_fields', 'At least one parent link field is required.')
  }
  if (definition.owner_resolution.length === 0) {
    addIssue('owner_resolution', 'At least one owner resolution field is required.')
  }
  if (definition.export_package.enabled && !definition.export_package.label.trim()) {
    addIssue('export_package.label', 'Export package label is required when export is enabled.')
  }

  return {
    status: mostSevereStatus(issues.map((issue) => issue.status)),
    checkedAt: new Date().toISOString(),
    issues,
  }
}

export function createWorkflowDefinitionPromotionPackage({
  definition,
  validation,
  workflowType,
}: {
  definition: WorkflowDefinition
  validation: WorkflowDefinitionValidationResult
  workflowType: string
}): WorkflowDefinitionPromotionPackage {
  const generatedAt = new Date().toISOString()
  return {
    packageId: `workflow_definition_promotion:${workflowType}:${generatedAt}`,
    generatedAt,
    workflowType,
    definition,
    validation,
    evidence: `${definition.display_name} workflow definition promotion preview generated with ${validation.status} validation status and ${validation.issues.length} issue(s).`,
  }
}

function mostSevereStatus(statuses: StatusLevel[]): StatusLevel {
  if (statuses.includes('blocking')) return 'blocking'
  if (statuses.includes('warning')) return 'warning'
  return 'pass'
}
