import yaml from 'js-yaml'
import type {
  AppConfig,
  ConnectorManifest,
  EnvironmentConfig,
  IndustryProfile,
  ObjectFamily,
  ReadinessRule,
  SolutionDomain,
  MappingManifest,
  WorkflowDefinition,
  GovernanceWorkflowStage,
} from './types'

type RawIndustries = { industries?: Record<string, IndustryProfile> }
type RawSolutions = { solution_domains?: Record<string, SolutionDomain> }
type RawFamilies = { object_families?: Record<string, ObjectFamily> }
type RawRules = { checks?: ReadinessRule[] }
type RawWorkflowDefinitions = { workflow_definitions?: Record<string, WorkflowDefinition> }

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

async function loadYaml<T>(path: string): Promise<T> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Could not load ${path}: ${response.status}`)
  }

  return yaml.load(await response.text()) as T
}

function requireKeys(name: string, value: Record<string, unknown> | undefined) {
  if (!value || Object.keys(value).length === 0) {
    throw new Error(`${name} is missing or empty`)
  }
}

function validateWorkflowDefinitions(workflowDefinitions: Record<string, WorkflowDefinition> | undefined) {
  requireKeys('workflow_definitions', workflowDefinitions)

  for (const [workflowType, definition] of Object.entries(workflowDefinitions ?? {})) {
    if (!definition.display_name) {
      throw new Error(`workflow_definitions.${workflowType}.display_name is missing`)
    }

    if (!definition.stages?.length) {
      throw new Error(`workflow_definitions.${workflowType}.stages is missing`)
    }

    for (const stage of definition.stages) {
      if (!validWorkflowStages.includes(stage)) {
        throw new Error(`workflow_definitions.${workflowType}.stages contains invalid stage ${stage}`)
      }
    }

    for (const [stage, nextStages] of Object.entries(definition.allowed_next_stages ?? {})) {
      if (!validWorkflowStages.includes(stage as GovernanceWorkflowStage)) {
        throw new Error(`workflow_definitions.${workflowType}.allowed_next_stages contains invalid stage ${stage}`)
      }

      for (const nextStage of nextStages ?? []) {
        if (!validWorkflowStages.includes(nextStage)) {
          throw new Error(
            `workflow_definitions.${workflowType}.allowed_next_stages.${stage} contains invalid stage ${nextStage}`,
          )
        }
      }
    }
  }
}

export async function loadAppConfig(): Promise<AppConfig> {
  const [
    environment,
    industriesRaw,
    solutionsRaw,
    familiesRaw,
    connectors,
    qualityEventMapping,
    capaReferenceMapping,
    supplierMapping,
    documentReferenceMapping,
    workflowDefinitionsRaw,
    rulesRaw,
  ] =
    await Promise.all([
      loadYaml<EnvironmentConfig>('/config/environments/qa.yaml'),
      loadYaml<RawIndustries>('/config/industries/industries.yaml'),
      loadYaml<RawSolutions>('/config/solutions/solution_domains.yaml'),
      loadYaml<RawFamilies>('/config/mappings/domain_object_families.yaml'),
      loadYaml<ConnectorManifest>('/config/connectors/connectors.yaml'),
      loadYaml<MappingManifest>('/config/mappings/quality_event.yaml'),
      loadYaml<MappingManifest>('/config/mappings/capa_reference.yaml'),
      loadYaml<MappingManifest>('/config/mappings/supplier.yaml'),
      loadYaml<MappingManifest>('/config/mappings/document_reference.yaml'),
      loadYaml<RawWorkflowDefinitions>('/config/workflows/workflow_definitions.yaml'),
      loadYaml<RawRules>('/config/rules/readiness_checks.yaml'),
    ])

  requireKeys('industries', industriesRaw.industries)
  requireKeys('solution_domains', solutionsRaw.solution_domains)
  requireKeys('object_families', familiesRaw.object_families)
  requireKeys('connectors', connectors.connectors)
  validateWorkflowDefinitions(workflowDefinitionsRaw.workflow_definitions)

  if (!environment.deployment_profile?.industries?.length) {
    throw new Error('environment deployment_profile.industries is missing')
  }

  if (!environment.deployment_profile?.solution_domains?.length) {
    throw new Error('environment deployment_profile.solution_domains is missing')
  }

  return {
    environment,
    industries: industriesRaw.industries ?? {},
    solutionDomains: solutionsRaw.solution_domains ?? {},
    objectFamilies: familiesRaw.object_families ?? {},
    connectors,
    mappings: {
      quality_event: qualityEventMapping,
      capa_reference: capaReferenceMapping,
      supplier: supplierMapping,
      document_reference: documentReferenceMapping,
    },
    workflowDefinitions: workflowDefinitionsRaw.workflow_definitions ?? {},
    readinessRules: rulesRaw.checks ?? [],
  }
}
