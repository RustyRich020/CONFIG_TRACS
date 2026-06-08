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
} from './types'

type RawIndustries = { industries?: Record<string, IndustryProfile> }
type RawSolutions = { solution_domains?: Record<string, SolutionDomain> }
type RawFamilies = { object_families?: Record<string, ObjectFamily> }
type RawRules = { checks?: ReadinessRule[] }

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

export async function loadAppConfig(): Promise<AppConfig> {
  const [environment, industriesRaw, solutionsRaw, familiesRaw, connectors, qualityEventMapping, rulesRaw] =
    await Promise.all([
      loadYaml<EnvironmentConfig>('/config/environments/qa.yaml'),
      loadYaml<RawIndustries>('/config/industries/industries.yaml'),
      loadYaml<RawSolutions>('/config/solutions/solution_domains.yaml'),
      loadYaml<RawFamilies>('/config/mappings/domain_object_families.yaml'),
      loadYaml<ConnectorManifest>('/config/connectors/connectors.yaml'),
      loadYaml<MappingManifest>('/config/mappings/quality_event.yaml'),
      loadYaml<RawRules>('/config/rules/readiness_checks.yaml'),
    ])

  requireKeys('industries', industriesRaw.industries)
  requireKeys('solution_domains', solutionsRaw.solution_domains)
  requireKeys('object_families', familiesRaw.object_families)
  requireKeys('connectors', connectors.connectors)

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
    },
    readinessRules: rulesRaw.checks ?? [],
  }
}
