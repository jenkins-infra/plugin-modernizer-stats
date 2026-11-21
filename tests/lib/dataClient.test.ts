import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReportJson } from '../../src/types';

/**
 * Sample plugins used as a mock objects from
 * https://jenkins-infra.github.io/metadata-plugin-modernizer/report.json
 *
 * - TestFairy           : mixed (2 success + 3 fail)
 * - BlazeMeterJenkinsPlugin : all success (2 success)
 * - CustomHistory       : all fail (2 fail)
 */
function makeReport(overrides: Partial<ReportJson> = {}): ReportJson {
  return {
    schemaVersion: '1.0.0',
    generatedAt: '2025-09-03T10:00:00Z',
    dataSource: 'https://jenkins-infra.github.io/metadata-plugin-modernizer/report.json',
    meta: { source_sha256: 'abc', parsed_at: '2025-09-03T10:00:00Z' },
    overview: {
      totalPlugins: 3,
      totalMigrations: 9,
      successfulMigrations: 4,
      failedMigrations: 5,
      successRate: 44.44,
    },
    pullRequests: { totalPRs: 3, openPRs: 3, closedPRs: 0, mergedPRs: 0, mergeRate: 0 },
    failuresByRecipe: [],
    pluginsWithFailedMigrations: ['TestFairy', 'CustomHistory'],
    timeline: [{ month: '2025-07', success: 2, fail: 3, total: 5 }],
    tags: [{ tag: 'chore', count: 5 }],
    recipes: {
      'io.jenkins.tools.pluginmodernizer.AddCodeOwner': {
        recipeId: 'io.jenkins.tools.pluginmodernizer.AddCodeOwner',
        totalApplications: 3,
        successCount: 1,
        failureCount: 1,
        plugins: [
          { pluginName: 'BlazeMeterJenkinsPlugin', status: 'success', timestamp: '2025-09-03T08-05-48' },
          { pluginName: 'TestFairy', status: 'fail', timestamp: '2025-09-03T08-13-07' },
          { pluginName: 'CustomHistory', status: '', timestamp: '2025-07-24T08-42-24' },
        ],
      },
      'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile': {
        recipeId: 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile',
        totalApplications: 3,
        successCount: 2,
        failureCount: 1,
        plugins: [
          { pluginName: 'BlazeMeterJenkinsPlugin', status: 'success', timestamp: '2025-09-03T08-05-48' },
          { pluginName: 'TestFairy', status: 'fail', timestamp: '2025-09-03T08-13-07' },
          { pluginName: 'CustomHistory', status: 'success', timestamp: '2025-07-23T07-55-02' },
        ],
      },
    },
    plugins: {
      // Real data from report.json — mixed plugin (2 success, 3 fail)
      TestFairy: {
        sourceUrls: {
          repository: 'https://github.com/jenkinsci/testfairy-plugin.git',
          upstreamMetadata: 'https://github.com/jenkins-infra/metadata-plugin-modernizer/tree/main/TestFairy',
        },
        aggregatedMigrations: [
          {
            pluginVersion: '6-325.vf39d32b268fe',
            jenkinsBaseline: '',
            targetBaseline: '1.596',
            effectiveBaseline: '1.596',
            jenkinsVersion: '1.596',
            migrationName: 'Setup the Jenkinsfile',
            migrationDescription: 'Add a missing Jenkinsfile to the Jenkins plugin.',
            tags: ['skip-verification', 'chore'],
            migrationId: 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile',
            migrationStatus: 'fail',
            pullRequestUrl: '',
            pullRequestStatus: '',
            dryRun: false,
            additions: 0,
            deletions: 0,
            changedFiles: 0,
            key: '2025-09-03T08-13-07.json',
            path: 'metadata-plugin-modernizer/TestFairy/modernization-metadata',
            timestamp: '2025-09-03T08-13-07',
          },
          {
            pluginVersion: '6-325.vf39d32b268fe',
            jenkinsBaseline: '',
            targetBaseline: '2.492',
            effectiveBaseline: '1.596',
            jenkinsVersion: '1.596',
            migrationName: 'Upgrade to the next major parent version (5.X) requiring Jenkins 2.492 and Java 17',
            migrationDescription: 'Upgrade to the next major parent version (5.X) requiring Jenkins 2.492 and Java 17.',
            tags: ['dependencies'],
            migrationId: 'io.jenkins.tools.pluginmodernizer.UpgradeNextMajorParentVersion',
            migrationStatus: 'success',
            pullRequestUrl: 'https://github.com/jenkinsci/testfairy-plugin/pull/40',
            pullRequestStatus: 'open',
            dryRun: false,
            additions: 8,
            deletions: 18,
            changedFiles: 2,
            key: '2025-07-28T18-02-28.json',
            path: 'metadata-plugin-modernizer/TestFairy/modernization-metadata',
            checkRuns: {},
            checkRunsSummary: 'success',
            defaultBranch: 'master',
            defaultBranchLatestCommitSha: 'f39d32b268fe7a04b0d9d47bba7f469c4f6d8ef6',
            timestamp: '2025-07-28T18-02-28',
          },
          {
            pluginVersion: '6-325.vf39d32b268fe',
            jenkinsBaseline: '',
            targetBaseline: '1.596',
            effectiveBaseline: '1.596',
            jenkinsVersion: '1.596',
            migrationName: 'Setup the Jenkinsfile',
            migrationDescription: 'Add a missing Jenkinsfile to the Jenkins plugin.',
            tags: ['skip-verification', 'chore'],
            migrationId: 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile',
            migrationStatus: 'fail',
            pullRequestUrl: '',
            pullRequestStatus: '',
            dryRun: false,
            additions: 0,
            deletions: 0,
            changedFiles: 0,
            key: '2025-07-24T08-53-05.json',
            path: 'metadata-plugin-modernizer/TestFairy/modernization-metadata',
            timestamp: '2025-07-24T08-53-05',
          },
          {
            pluginVersion: '6-325.vf39d32b268fe',
            jenkinsBaseline: '',
            targetBaseline: '1.596',
            effectiveBaseline: '1.596',
            jenkinsVersion: '1.596',
            migrationName: 'Setup the Jenkinsfile',
            migrationDescription: 'Add a missing Jenkinsfile to the Jenkins plugin.',
            tags: ['skip-verification', 'chore'],
            migrationId: 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile',
            migrationStatus: 'fail',
            pullRequestUrl: '',
            pullRequestStatus: '',
            dryRun: false,
            additions: 0,
            deletions: 0,
            changedFiles: 0,
            key: '2025-07-24T08-42-24.json',
            path: 'metadata-plugin-modernizer/TestFairy/modernization-metadata',
            timestamp: '2025-07-24T08-42-24',
          },
          {
            pluginVersion: '6-325.vf39d32b268fe',
            jenkinsBaseline: '',
            targetBaseline: '2.346',
            effectiveBaseline: '1.596',
            jenkinsVersion: '1.596',
            migrationName: 'Upgrade to latest LTS core version supporting Java 8',
            migrationDescription: 'Upgrade to latest LTS core version supporting Java 8.',
            tags: ['developer'],
            migrationId: 'io.jenkins.tools.pluginmodernizer.UpgradeToLatestJava8CoreVersion',
            migrationStatus: 'success',
            pullRequestUrl: 'https://github.com/jenkinsci/testfairy-plugin/pull/39',
            pullRequestStatus: 'open',
            dryRun: false,
            additions: 5,
            deletions: 22,
            changedFiles: 3,
            key: '2025-07-24T08-33-27.json',
            path: 'metadata-plugin-modernizer/TestFairy/modernization-metadata',
            checkRuns: {},
            checkRunsSummary: 'success',
            defaultBranch: 'master',
            defaultBranchLatestCommitSha: 'f39d32b268fe7a04b0d9d47bba7f469c4f6d8ef6',
            timestamp: '2025-07-24T08-33-27',
          },
        ],
        failedMigrations: [
          { migrationId: 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile', migrationStatus: 'fail' },
          { migrationId: 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile', migrationStatus: 'fail' },
          { migrationId: 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile', migrationStatus: 'fail' },
        ],
        modernizationMetadata: [],
      },
      // Real data from report.json — all success plugin (2 success)
      BlazeMeterJenkinsPlugin: {
        sourceUrls: {
          repository: 'https://github.com/jenkinsci/blazemeter-plugin.git',
          upstreamMetadata:
            'https://github.com/jenkins-infra/metadata-plugin-modernizer/tree/main/BlazeMeterJenkinsPlugin',
        },
        aggregatedMigrations: [
          {
            pluginVersion: '4.26',
            jenkinsBaseline: '',
            targetBaseline: '2.361',
            effectiveBaseline: '2.361',
            jenkinsVersion: '2.361',
            migrationName: 'Setup the Jenkinsfile',
            migrationDescription: 'Add a missing Jenkinsfile to the Jenkins plugin.',
            tags: ['skip-verification', 'chore'],
            migrationId: 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile',
            migrationStatus: 'success',
            pullRequestUrl: 'https://github.com/jenkinsci/blazemeter-plugin/pull/10',
            pullRequestStatus: 'open',
            dryRun: false,
            additions: 12,
            deletions: 0,
            changedFiles: 1,
            key: '2025-09-03T08-05-48.json',
            path: 'metadata-plugin-modernizer/BlazeMeterJenkinsPlugin/modernization-metadata',
            checkRuns: {},
            checkRunsSummary: 'success',
            defaultBranch: 'master',
            defaultBranchLatestCommitSha: '8482b3874ecf9d8868129f43fe5f4cc9bcdba442',
            timestamp: '2025-09-03T08-05-48',
          },
          {
            pluginVersion: '4.26',
            jenkinsBaseline: '',
            targetBaseline: '2.361',
            effectiveBaseline: '2.361',
            jenkinsVersion: '2.361',
            migrationName: 'Setup the Jenkinsfile',
            migrationDescription: 'Add a missing Jenkinsfile to the Jenkins plugin.',
            tags: ['skip-verification', 'chore'],
            migrationId: 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile',
            migrationStatus: 'success',
            pullRequestUrl: 'https://github.com/jenkinsci/blazemeter-plugin/pull/10',
            pullRequestStatus: 'open',
            dryRun: false,
            additions: 12,
            deletions: 0,
            changedFiles: 1,
            key: '2025-07-23T07-51-56.json',
            path: 'metadata-plugin-modernizer/BlazeMeterJenkinsPlugin/modernization-metadata',
            checkRuns: {},
            checkRunsSummary: 'success',
            defaultBranch: 'master',
            defaultBranchLatestCommitSha: '8482b3874ecf9d8868129f43fe5f4cc9bcdba442',
            timestamp: '2025-07-23T07-51-56',
          },
        ],
        failedMigrations: [],
        modernizationMetadata: [],
      },
      // Real data from report.json — all fail plugin (2 fail)
      CustomHistory: {
        sourceUrls: {
          repository: 'https://github.com/jenkinsci/custom-history-plugin.git',
          upstreamMetadata: 'https://github.com/jenkins-infra/metadata-plugin-modernizer/tree/main/CustomHistory',
        },
        aggregatedMigrations: [
          {
            pluginVersion: '1.6',
            jenkinsBaseline: '',
            targetBaseline: '1.625',
            effectiveBaseline: '1.625',
            jenkinsVersion: '1.625.3',
            migrationName: 'Setup the Jenkinsfile',
            migrationDescription: 'Add a missing Jenkinsfile to the Jenkins plugin.',
            tags: ['skip-verification', 'chore'],
            migrationId: 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile',
            migrationStatus: 'fail',
            pullRequestUrl: '',
            pullRequestStatus: '',
            dryRun: false,
            additions: 0,
            deletions: 0,
            changedFiles: 0,
            key: '2025-09-03T08-08-19.json',
            path: 'metadata-plugin-modernizer/CustomHistory/modernization-metadata',
            timestamp: '2025-09-03T08-08-19',
          },
          {
            pluginVersion: '1.6',
            jenkinsBaseline: '',
            targetBaseline: '1.625',
            effectiveBaseline: '1.625',
            jenkinsVersion: '1.625.3',
            migrationName: 'Setup the Jenkinsfile',
            migrationDescription: 'Add a missing Jenkinsfile to the Jenkins plugin.',
            tags: ['skip-verification', 'chore'],
            migrationId: 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile',
            migrationStatus: 'fail',
            pullRequestUrl: '',
            pullRequestStatus: '',
            dryRun: false,
            additions: 0,
            deletions: 0,
            changedFiles: 0,
            key: '2025-07-23T07-55-02.json',
            path: 'metadata-plugin-modernizer/CustomHistory/modernization-metadata',
            timestamp: '2025-07-23T07-55-02',
          },
        ],
        failedMigrations: [
          { migrationId: 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile', migrationStatus: 'fail' },
          { migrationId: 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile', migrationStatus: 'fail' },
        ],
        modernizationMetadata: [],
      },
    },
    ...overrides,
  };
}

function mockFetchSuccess(report: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(report),
    })
  );
}

function mockFetchFailure(status: number, statusText: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      status,
      statusText,
    })
  );
}

describe('dataClient', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  async function loadClient() {
    const mod = await import('../../src/lib/dataClient');
    return mod.dataClient;
  }

  describe('getSummary', () => {
    it('returns overview, pullRequests, timeline, tags and recipe stats', async () => {
      const report = makeReport();
      mockFetchSuccess(report);
      const client = await loadClient();

      const result = await client.getSummary();

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.data.schemaVersion).toBe('1.0.0');
      expect(result.data.overview.totalPlugins).toBe(3);
      expect(result.data.overview.totalMigrations).toBe(9);
      expect(result.data.recipes).toHaveLength(2);
      expect(result.data.recipes[0]).toEqual({
        recipeId: 'io.jenkins.tools.pluginmodernizer.AddCodeOwner',
        total: 3,
        success: 1,
        fail: 1,
      });
      console.log(
        `  mock data : totalPlugins=${report.overview.totalPlugins}, totalMigrations=${report.overview.totalMigrations}, recipes=${Object.keys(report.recipes).length}`
      );
      console.log(
        `  dataClient: totalPlugins=${result.data.overview.totalPlugins}, totalMigrations=${result.data.overview.totalMigrations}, recipes=${result.data.recipes.length}`
      );
    });

    it('returns error on fetch failure', async () => {
      mockFetchFailure(500, 'Internal Server Error');
      const client = await loadClient();

      const result = await client.getSummary();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('500');
        console.log(`  mock data : fetch returns 500 Internal Server Error`);
        console.log(`  dataClient: error="${result.error}"`);
      }
    });

    it('returns a recoverable error when the metadata schema is invalid', async () => {
      const invalidReport = { ...makeReport(), overview: undefined };
      mockFetchSuccess(invalidReport);
      const client = await loadClient();

      const result = await client.getSummary();

      expect(result).toEqual({
        ok: false,
        error: 'Metadata report has an unsupported format. It may be updating; please try again shortly.',
      });
    });
  });

  describe('getIndex', () => {
    it('returns sorted plugin and recipe IDs', async () => {
      const report = makeReport();
      mockFetchSuccess(report);
      const client = await loadClient();

      const result = await client.getIndex();

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.data.plugins).toEqual(['BlazeMeterJenkinsPlugin', 'CustomHistory', 'TestFairy']);
      expect(result.data.recipes).toEqual([
        'io.jenkins.tools.pluginmodernizer.AddCodeOwner',
        'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile',
      ]);
      console.log(`  mock data : plugins=[${Object.keys(report.plugins).sort().join(', ')}]`);
      console.log(`  dataClient: plugins=[${result.data.plugins.join(', ')}]`);
      console.log(`  mock data : recipes=[${Object.keys(report.recipes).sort().join(', ')}]`);
      console.log(`  dataClient: recipes=[${result.data.recipes.join(', ')}]`);
    });
  });

  describe('getRecipe', () => {
    it('returns recipe details with correct counts', async () => {
      const report = makeReport();
      mockFetchSuccess(report);
      const client = await loadClient();

      const result = await client.getRecipe('io.jenkins.tools.pluginmodernizer.AddCodeOwner');

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.data.recipeId).toBe('io.jenkins.tools.pluginmodernizer.AddCodeOwner');
      expect(result.data.totalApplications).toBe(3);
      expect(result.data.successCount).toBe(1);
      expect(result.data.failureCount).toBe(1);
      console.log(`  mock data : recipeId=AddCodeOwner, totalApplications=3, successCount=1, failureCount=1`);
      console.log(`  dataClient: recipeId=${result.data.recipeId}, totalApplications=${result.data.totalApplications}`);
    });

    it('returns error for unknown recipe', async () => {
      mockFetchSuccess(makeReport());
      const client = await loadClient();

      const result = await client.getRecipe('nonexistent');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('nonexistent');
        console.log(`  mock data : recipe "nonexistent" does not exist`);
        console.log(`  dataClient: error="${result.error}"`);
      }
    });
  });

  describe('getPluginReport', () => {
    it('TestFairy: 5 migrations, 2 success, 3 fail (mixed)', async () => {
      mockFetchSuccess(makeReport());
      const client = await loadClient();

      const result = await client.getPluginReport('TestFairy');

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.data.pluginName).toBe('TestFairy');
      expect(result.data.pluginRepository).toBe('https://github.com/jenkinsci/testfairy-plugin.git');
      expect(result.data.totalMigrations).toBe(5);
      expect(result.data.successCount).toBe(2);
      expect(result.data.failCount).toBe(3);
      expect(result.data.latestMigration).toBe('2025-09-03T08-13-07');
      console.log(`  mock data : TestFairy -> 5 migrations (2s/3f), repo=testfairy-plugin.git`);
      console.log(
        `  dataClient: ${result.data.pluginName} -> ${result.data.totalMigrations} migrations (${result.data.successCount}s/${result.data.failCount}f), latest=${result.data.latestMigration}`
      );
    });

    it('BlazeMeterJenkinsPlugin: 2 migrations, 2 success, 0 fail (all success)', async () => {
      mockFetchSuccess(makeReport());
      const client = await loadClient();

      const result = await client.getPluginReport('BlazeMeterJenkinsPlugin');

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.data.pluginRepository).toBe('https://github.com/jenkinsci/blazemeter-plugin.git');
      expect(result.data.totalMigrations).toBe(2);
      expect(result.data.successCount).toBe(2);
      expect(result.data.failCount).toBe(0);
      console.log(`  mock data : BlazeMeterJenkinsPlugin -> 2 migrations (2s/0f), repo=blazemeter-plugin.git`);
      console.log(
        `  dataClient: ${result.data.pluginName} -> ${result.data.totalMigrations} migrations (${result.data.successCount}s/${result.data.failCount}f)`
      );
    });

    it('CustomHistory: 2 migrations, 0 success, 2 fail (all fail)', async () => {
      mockFetchSuccess(makeReport());
      const client = await loadClient();

      const result = await client.getPluginReport('CustomHistory');

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.data.pluginRepository).toBe('https://github.com/jenkinsci/custom-history-plugin.git');
      expect(result.data.totalMigrations).toBe(2);
      expect(result.data.successCount).toBe(0);
      expect(result.data.failCount).toBe(2);
      console.log(`  mock data : CustomHistory -> 2 migrations (0s/2f), repo=custom-history-plugin.git`);
      console.log(
        `  dataClient: ${result.data.pluginName} -> ${result.data.totalMigrations} migrations (${result.data.successCount}s/${result.data.failCount}f)`
      );
    });

    it('returns error for unknown plugin', async () => {
      mockFetchSuccess(makeReport());
      const client = await loadClient();

      const result = await client.getPluginReport('nonexistent');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('nonexistent');
        console.log(`  mock data : plugin "nonexistent" does not exist`);
        console.log(`  dataClient: error="${result.error}"`);
      }
    });
  });

  describe('getPluginFailedMigrations', () => {
    it('TestFairy: CSV has 3 failed rows', async () => {
      mockFetchSuccess(makeReport());
      const client = await loadClient();

      const result = await client.getPluginFailedMigrations('TestFairy');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const lines = result.data.split('\n');
      expect(lines[0]).toBe('migrationId,migrationName,migrationStatus,pluginVersion,timestamp,pullRequestUrl');
      expect(lines).toHaveLength(4);
      for (const row of lines.slice(1)) {
        expect(row).toContain('fail');
      }
      console.log(`  mock data : TestFairy has 3 failed migrations`);
      console.log(`  dataClient: CSV has ${lines.length - 1} data rows (+ 1 header)`);
    });

    it('BlazeMeterJenkinsPlugin: header-only CSV (no failures)', async () => {
      mockFetchSuccess(makeReport());
      const client = await loadClient();

      const result = await client.getPluginFailedMigrations('BlazeMeterJenkinsPlugin');

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const lines = result.data.split('\n');
      expect(lines).toHaveLength(1);
      console.log(`  mock data : BlazeMeterJenkinsPlugin has 0 failed migrations`);
      console.log(`  dataClient: CSV has ${lines.length - 1} data rows (+ 1 header)`);
    });
  });

  describe('getAllPlugins', () => {
    it('returns all 3 plugins with non-zero total migrations', async () => {
      mockFetchSuccess(makeReport());
      const client = await loadClient();

      const result = await client.getAllPlugins();

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.data).toHaveLength(3);

      const totalMigrations = result.data.reduce((sum, p) => sum + p.totalMigrations, 0);
      expect(totalMigrations).toBe(9);
      console.log(`  mock data : 3 plugins, 9 total migrations`);
      console.log(`  dataClient: ${result.data.length} plugins, ${totalMigrations} total migrations`);
    });

    it('returns plugins sorted alphabetically by ID', async () => {
      mockFetchSuccess(makeReport());
      const client = await loadClient();

      const result = await client.getAllPlugins();

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const names = result.data.map((p) => p.pluginName);
      expect(names).toEqual(['BlazeMeterJenkinsPlugin', 'CustomHistory', 'TestFairy']);
      console.log(`  mock data : plugins in JSON order: [${Object.keys(makeReport().plugins).join(', ')}]`);
      console.log(`  dataClient: plugins sorted: [${names.join(', ')}]`);
    });
  });

  describe('getAllRecipes', () => {
    it('returns recipes sorted by recipeId', async () => {
      mockFetchSuccess(makeReport());
      const client = await loadClient();

      const result = await client.getAllRecipes();

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const ids = result.data.map((r) => r.recipeId);
      expect(ids).toEqual([...ids].sort());
      console.log(`  mock data : recipes in JSON order: [${Object.keys(makeReport().recipes).join(', ')}]`);
      console.log(`  dataClient: recipes sorted: [${ids.join(', ')}]`);
    });

    it('each recipe has plugins array and counts are non-negative', async () => {
      mockFetchSuccess(makeReport());
      const client = await loadClient();

      const result = await client.getAllRecipes();

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      for (const recipe of result.data) {
        expect(Array.isArray(recipe.plugins)).toBe(true);
        expect(recipe.totalApplications).toBeGreaterThanOrEqual(0);
        expect(recipe.successCount).toBeGreaterThanOrEqual(0);
        expect(recipe.failureCount).toBeGreaterThanOrEqual(0);
        expect(recipe.successCount + recipe.failureCount).toBeLessThanOrEqual(recipe.totalApplications);
      }
      console.log(`  validated ${result.data.length} recipes: all have valid counts and plugins arrays`);
    });
  });

  describe('getRecipe (cross-validation)', () => {
    it('AddCodeOwner: plugin entries match declared counts', async () => {
      mockFetchSuccess(makeReport());
      const client = await loadClient();

      const result = await client.getRecipe('io.jenkins.tools.pluginmodernizer.AddCodeOwner');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.data.plugins).toHaveLength(3);
      const successPlugins = result.data.plugins.filter((p) => p.status === 'success');
      const failPlugins = result.data.plugins.filter((p) => p.status === 'fail');
      expect(successPlugins).toHaveLength(result.data.successCount);
      expect(failPlugins).toHaveLength(result.data.failureCount);
      console.log(
        `  AddCodeOwner: ${result.data.plugins.length} plugin entries, ${successPlugins.length}s/${failPlugins.length}f matches counts`
      );
    });

    it('SetupJenkinsfile: counts are returned correctly', async () => {
      mockFetchSuccess(makeReport());
      const client = await loadClient();

      const result = await client.getRecipe('io.jenkins.tools.pluginmodernizer.SetupJenkinsfile');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.data.successCount).toBe(2);
      expect(result.data.failureCount).toBe(1);
      expect(result.data.totalApplications).toBe(3);
      console.log(
        `  SetupJenkinsfile: ${result.data.successCount}s/${result.data.failureCount}f of ${result.data.totalApplications} total`
      );
    });

    it('each plugin entry has non-empty pluginName and timestamp', async () => {
      mockFetchSuccess(makeReport());
      const client = await loadClient();

      const result = await client.getRecipe('io.jenkins.tools.pluginmodernizer.AddCodeOwner');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      for (const plugin of result.data.plugins) {
        expect(plugin.pluginName).toBeTruthy();
        expect(plugin.timestamp).toBeTruthy();
        expect(typeof plugin.status).toBe('string');
      }
      console.log(
        `  validated ${result.data.plugins.length} plugin entries: all have name, timestamp, and string status`
      );
    });
  });

  describe('cache behaviour', () => {
    it('retries fetch after a failure (cache is cleared on error)', async () => {
      mockFetchFailure(503, 'Service Unavailable');
      const client = await loadClient();

      const fail = await client.getSummary();
      expect(fail.ok).toBe(false);

      mockFetchSuccess(makeReport());
      const success = await client.getSummary();
      expect(success.ok).toBe(true);
      console.log(`  1st call  : fetch 503 -> ok=false (cache cleared)`);
      console.log(`  2nd call  : fetch 200 -> ok=true (retried successfully)`);
    });
  });
});
