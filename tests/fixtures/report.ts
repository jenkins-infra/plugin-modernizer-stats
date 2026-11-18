import type { Migration, ReportJson } from '../../src/types';

function makeMigration(
  migrationId: string,
  migrationName: string,
  timestamp: string,
  migrationStatus?: Migration['migrationStatus']
): Migration {
  return {
    pluginVersion: '1.0.0',
    migrationName,
    migrationId,
    ...(migrationStatus !== undefined ? { migrationStatus } : {}),
    key: `${timestamp}.json`,
    timestamp,
  };
}

const SETUP_JENKINSFILE = 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile';
const ADD_CODE_OWNER = 'io.jenkins.tools.pluginmodernizer.AddCodeOwner';
const UPGRADE_JAVA_17 = 'io.jenkins.tools.pluginmodernizer.UpgradeNextMajorParentVersion';

/**
 * Deterministic report.json fixture covering all plugin statuses (green, red, blue,
 * yellow, white), empty migrations, and consistent overview/recipe totals.
 */
export const mockReport: ReportJson = {
  schemaVersion: '1.0.0',
  generatedAt: '2025-09-03T10:00:00Z',
  dataSource: 'https://jenkins-infra.github.io/metadata-plugin-modernizer/report.json',
  meta: {
    source_sha256: 'fixture-sha256',
    parsed_at: '2025-09-03T10:00:00Z',
  },
  overview: {
    totalPlugins: 9,
    totalMigrations: 16,
    successfulMigrations: 9,
    failedMigrations: 6,
    successRate: 56.25,
  },
  pullRequests: {
    totalPRs: 9,
    openPRs: 6,
    closedPRs: 1,
    mergedPRs: 2,
    mergeRate: 22.22,
  },
  failuresByRecipe: [
    { recipeId: SETUP_JENKINSFILE, failures: 4 },
    { recipeId: ADD_CODE_OWNER, failures: 2 },
  ],
  pluginsWithFailedMigrations: ['testfairy', 'CustomHistory', 'absint-a3', 'google-analytics-usage-reporter'],
  timeline: [
    { month: '2025-07', success: 4, fail: 3, total: 7 },
    { month: '2025-09', success: 5, fail: 3, total: 8 },
  ],
  tags: [
    { tag: 'chore', count: 10 },
    { tag: 'dependencies', count: 6 },
  ],
  recipes: {
    [ADD_CODE_OWNER]: {
      recipeId: ADD_CODE_OWNER,
      totalApplications: 4,
      successCount: 2,
      failureCount: 2,
      plugins: [
        { pluginName: 'BlazeMeterJenkinsPlugin', status: 'success', timestamp: '2025-09-03T08-05-48' },
        { pluginName: 'absint-a3', status: 'success', timestamp: '2025-09-02T14-22-13' },
        { pluginName: 'testfairy', status: 'fail', timestamp: '2025-09-03T08-13-07' },
        { pluginName: 'google-analytics-usage-reporter', status: 'fail', timestamp: '2025-09-01T10-00-00' },
      ],
    },
    [SETUP_JENKINSFILE]: {
      recipeId: SETUP_JENKINSFILE,
      totalApplications: 5,
      successCount: 3,
      failureCount: 2,
      plugins: [
        { pluginName: 'active-directory', status: 'success', timestamp: '2025-09-03T09-00-00' },
        { pluginName: 'git-client', status: 'success', timestamp: '2025-09-03T09-15-00' },
        { pluginName: 'absint-a3', status: 'success', timestamp: '2025-09-02T14-17-29' },
        { pluginName: 'CustomHistory', status: 'fail', timestamp: '2025-09-03T08-08-19' },
        { pluginName: 'testfairy', status: 'fail', timestamp: '2025-07-24T08-53-05' },
      ],
    },
  },
  plugins: {
    // Deliberately unsorted keys to verify alphabetical sorting by plugin ID
    testfairy: {
      sourceUrls: {
        repository: 'https://github.com/jenkinsci/testfairy-plugin.git',
        upstreamMetadata: 'https://github.com/jenkins-infra/metadata-plugin-modernizer/tree/main/testfairy',
      },
      aggregatedMigrations: [
        makeMigration(ADD_CODE_OWNER, 'Add Code Owner', '2025-09-03T08-13-07', 'fail'),
        makeMigration(UPGRADE_JAVA_17, 'Upgrade to Java 17', '2025-07-28T18-02-28', 'success'),
        makeMigration(SETUP_JENKINSFILE, 'Setup the Jenkinsfile', '2025-07-24T08-53-05', 'fail'),
      ],
      failedMigrations: [
        { migrationId: ADD_CODE_OWNER, migrationStatus: 'fail' },
        { migrationId: SETUP_JENKINSFILE, migrationStatus: 'fail' },
      ],
      modernizationMetadata: [],
    },
    BlazeMeterJenkinsPlugin: {
      sourceUrls: {
        repository: 'https://github.com/jenkinsci/blazemeter-plugin.git',
        upstreamMetadata:
          'https://github.com/jenkins-infra/metadata-plugin-modernizer/tree/main/BlazeMeterJenkinsPlugin',
      },
      aggregatedMigrations: [
        makeMigration(ADD_CODE_OWNER, 'Add Code Owner', '2025-09-03T08-05-48', 'success'),
        makeMigration(SETUP_JENKINSFILE, 'Setup the Jenkinsfile', '2025-07-23T07-51-56', 'success'),
      ],
      failedMigrations: [],
      modernizationMetadata: [],
    },
    CustomHistory: {
      sourceUrls: {
        repository: 'https://github.com/jenkinsci/custom-history-plugin.git',
        upstreamMetadata: 'https://github.com/jenkins-infra/metadata-plugin-modernizer/tree/main/CustomHistory',
      },
      aggregatedMigrations: [
        makeMigration(SETUP_JENKINSFILE, 'Setup the Jenkinsfile', '2025-09-03T08-08-19', 'fail'),
        makeMigration(SETUP_JENKINSFILE, 'Setup the Jenkinsfile', '2025-07-23T07-55-02', 'fail'),
      ],
      failedMigrations: [
        { migrationId: SETUP_JENKINSFILE, migrationStatus: 'fail' },
        { migrationId: SETUP_JENKINSFILE, migrationStatus: 'fail' },
      ],
      modernizationMetadata: [],
    },
    'absint-a3': {
      sourceUrls: {
        repository: 'https://github.com/jenkinsci/absint-a3-plugin.git',
        upstreamMetadata: 'https://github.com/jenkins-infra/metadata-plugin-modernizer/tree/main/absint-a3',
      },
      aggregatedMigrations: [
        makeMigration(UPGRADE_JAVA_17, 'Upgrade to Java 17', '2025-09-03T07-37-22', 'success'),
        makeMigration(ADD_CODE_OWNER, 'Add Code Owner', '2025-09-02T14-22-13', 'success'),
        makeMigration(SETUP_JENKINSFILE, 'Setup the Jenkinsfile', '2025-09-02T14-17-29', 'success'),
        makeMigration(SETUP_JENKINSFILE, 'Setup the Jenkinsfile', '2025-09-02T14-04-22', 'fail'),
      ],
      failedMigrations: [{ migrationId: SETUP_JENKINSFILE, migrationStatus: 'fail' }],
      modernizationMetadata: [],
    },
    'active-directory': {
      sourceUrls: {
        repository: 'https://github.com/jenkinsci/active-directory-plugin.git',
        upstreamMetadata: 'https://github.com/jenkins-infra/metadata-plugin-modernizer/tree/main/active-directory',
      },
      aggregatedMigrations: [
        makeMigration(SETUP_JENKINSFILE, 'Setup the Jenkinsfile', '2025-09-03T09-00-00', 'success'),
      ],
      failedMigrations: [],
      modernizationMetadata: [],
    },
    'git-client': {
      sourceUrls: {
        repository: 'https://github.com/jenkinsci/git-client-plugin.git',
        upstreamMetadata: 'https://github.com/jenkins-infra/metadata-plugin-modernizer/tree/main/git-client',
      },
      aggregatedMigrations: [
        makeMigration(SETUP_JENKINSFILE, 'Setup the Jenkinsfile', '2025-09-03T09-15-00', 'success'),
        makeMigration(UPGRADE_JAVA_17, 'Upgrade to Java 17', '2025-08-15T12-00-00', 'success'),
      ],
      failedMigrations: [],
      modernizationMetadata: [],
    },
    'google-analytics-usage-reporter': {
      sourceUrls: {
        repository: 'https://github.com/jenkinsci/google-analytics-usage-reporter-plugin.git',
        upstreamMetadata:
          'https://github.com/jenkins-infra/metadata-plugin-modernizer/tree/main/google-analytics-usage-reporter',
      },
      aggregatedMigrations: [makeMigration(ADD_CODE_OWNER, 'Add Code Owner', '2025-09-01T10-00-00', 'fail')],
      failedMigrations: [{ migrationId: ADD_CODE_OWNER, migrationStatus: 'fail' }],
      modernizationMetadata: [],
    },
    'omega-unknown': {
      sourceUrls: {
        repository: 'https://github.com/jenkinsci/omega-unknown-plugin.git',
        upstreamMetadata: 'https://github.com/jenkins-infra/metadata-plugin-modernizer/tree/main/omega-unknown',
      },
      aggregatedMigrations: [makeMigration(SETUP_JENKINSFILE, 'Setup the Jenkinsfile', '2025-08-01T00-00-00')],
      failedMigrations: [],
      modernizationMetadata: [],
    },
    'empty-plugin': {
      sourceUrls: {
        repository: 'https://github.com/jenkinsci/empty-plugin.git',
        upstreamMetadata: 'https://github.com/jenkins-infra/metadata-plugin-modernizer/tree/main/empty-plugin',
      },
      aggregatedMigrations: [],
      failedMigrations: [],
      modernizationMetadata: [],
    },
  },
};
