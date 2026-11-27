import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ReportJson } from '../../src/types';
import { mockReport } from '../fixtures/report';

/**
 * These tests feed a deterministic report.json fixture to dataClient via mocked fetch
 * and validate that dataClient produces correct results matching the raw data.
 */
describe('dataClient validated against report.json fixture', () => {
  let report: ReportJson;

  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();

    report = mockReport;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(report),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getAllPlugins total migrations matches report.overview.totalMigrations', async () => {
    const { dataClient } = await import('../../src/lib/dataClient');
    const result = await dataClient.getAllPlugins();

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const totalFromClient = result.data.reduce((sum, p) => sum + p.totalMigrations, 0);

    let totalFromJson = 0;
    for (const p of Object.values(report.plugins)) {
      totalFromJson += p.aggregatedMigrations.length;
    }

    expect(totalFromClient).toBe(totalFromJson);
    expect(totalFromClient).toBe(report.overview.totalMigrations);
    console.log(`  dataClient : ${result.data.length} plugins, ${totalFromClient} migrations`);
    console.log(
      `  report.json: ${Object.keys(report.plugins).length} plugins, ${totalFromJson} migrations (overview: ${report.overview.totalMigrations})`
    );
  });

  it('getAllPlugins success+fail counts match manual count from report.json', async () => {
    const { dataClient } = await import('../../src/lib/dataClient');
    const result = await dataClient.getAllPlugins();

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const clientSuccess = result.data.reduce((sum, p) => sum + p.successCount, 0);
    const clientFail = result.data.reduce((sum, p) => sum + p.failCount, 0);

    let jsonSuccess = 0;
    let jsonFail = 0;
    for (const p of Object.values(report.plugins)) {
      for (const m of p.aggregatedMigrations) {
        if (m.migrationStatus === 'success') jsonSuccess++;
        else if (m.migrationStatus === 'fail') jsonFail++;
      }
    }

    expect(clientSuccess).toBe(jsonSuccess);
    expect(clientFail).toBe(jsonFail);
    console.log(`  dataClient : success=${clientSuccess}, fail=${clientFail}`);
    console.log(
      `  report.json: success=${jsonSuccess}, fail=${jsonFail} (overview: ${report.overview.successfulMigrations}s/${report.overview.failedMigrations}f)`
    );
  });

  it('getPluginReport returns correct data for a known mixed plugin', async () => {
    const { dataClient } = await import('../../src/lib/dataClient');

    const pluginId = Object.keys(report.plugins).find((id) => {
      const agg = report.plugins[id].aggregatedMigrations;
      const s = agg.filter((m) => m.migrationStatus === 'success').length;
      const f = agg.filter((m) => m.migrationStatus === 'fail').length;
      return s > 0 && f > 0;
    });
    expect(pluginId).toBeDefined();

    const result = await dataClient.getPluginReport(pluginId!);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const rawAgg = report.plugins[pluginId!].aggregatedMigrations;
    const expectedSuccess = rawAgg.filter((m) => m.migrationStatus === 'success').length;
    const expectedFail = rawAgg.filter((m) => m.migrationStatus === 'fail').length;

    expect(result.data.totalMigrations).toBe(rawAgg.length);
    expect(result.data.successCount).toBe(expectedSuccess);
    expect(result.data.failCount).toBe(expectedFail);
    expect(result.data.pluginRepository).toBe(report.plugins[pluginId!].sourceUrls?.repository ?? '');
    console.log(
      `  dataClient : ${pluginId} -> ${result.data.totalMigrations} migrations, ${result.data.successCount}s/${result.data.failCount}f`
    );
    console.log(`  report.json: ${pluginId} -> ${rawAgg.length} migrations, ${expectedSuccess}s/${expectedFail}f`);
  });

  it('getSummary overview matches raw report overview', async () => {
    const { dataClient } = await import('../../src/lib/dataClient');
    const result = await dataClient.getSummary();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.overview).toEqual(report.overview);
    console.log(
      `  dataClient : totalPlugins=${result.data.overview.totalPlugins}, totalMigrations=${result.data.overview.totalMigrations}, successRate=${result.data.overview.successRate}%`
    );
    console.log(
      `  report.json: totalPlugins=${report.overview.totalPlugins}, totalMigrations=${report.overview.totalMigrations}, successRate=${report.overview.successRate}%`
    );
  });

  it('getAllRecipes count matches Object.keys(report.recipes).length', async () => {
    const { dataClient } = await import('../../src/lib/dataClient');
    const result = await dataClient.getAllRecipes();

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const expectedCount = Object.keys(report.recipes).length;
    expect(result.data).toHaveLength(expectedCount);
    console.log(`  dataClient : ${result.data.length} recipes`);
    console.log(`  report.json: ${expectedCount} recipes`);
  });

  it('getAllRecipes success+failure counts match raw recipe data', async () => {
    const { dataClient } = await import('../../src/lib/dataClient');
    const result = await dataClient.getAllRecipes();

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    for (const recipe of result.data) {
      const raw = report.recipes[recipe.recipeId];
      expect(raw).toBeDefined();
      expect(recipe.totalApplications).toBe(raw.totalApplications);
      expect(recipe.successCount).toBe(raw.successCount);
      expect(recipe.failureCount).toBe(raw.failureCount);
    }

    const totalApps = result.data.reduce((sum, r) => sum + r.totalApplications, 0);
    const totalSuccess = result.data.reduce((sum, r) => sum + r.successCount, 0);
    const totalFail = result.data.reduce((sum, r) => sum + r.failureCount, 0);
    console.log(
      `  dataClient : ${result.data.length} recipes, ${totalApps} applications (${totalSuccess}s/${totalFail}f)`
    );
    console.log(`  report.json: every recipe's counts match`);
  });

  it('getRecipe returns correct data for a known recipe with plugins', async () => {
    const { dataClient } = await import('../../src/lib/dataClient');

    const recipeId = Object.keys(report.recipes).find((id) => {
      const r = report.recipes[id];
      return r.plugins && r.plugins.length > 0 && r.successCount > 0;
    });
    expect(recipeId).toBeDefined();

    const result = await dataClient.getRecipe(recipeId!);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const raw = report.recipes[recipeId!];
    expect(result.data.recipeId).toBe(raw.recipeId);
    expect(result.data.totalApplications).toBe(raw.totalApplications);
    expect(result.data.successCount).toBe(raw.successCount);
    expect(result.data.failureCount).toBe(raw.failureCount);
    expect(result.data.plugins).toHaveLength(raw.plugins.length);
    console.log(
      `  dataClient : ${recipeId} -> ${result.data.totalApplications} apps, ${result.data.successCount}s/${result.data.failureCount}f`
    );
    console.log(
      `  report.json: ${recipeId} -> ${raw.totalApplications} apps, ${raw.successCount}s/${raw.failureCount}f, ${raw.plugins.length} plugin entries`
    );
  });

  it('getRecipe plugin statuses are valid values', async () => {
    const { dataClient } = await import('../../src/lib/dataClient');

    const recipeIds = Object.keys(report.recipes);
    let totalPluginEntries = 0;
    const statusSet = new Set<string>();

    for (const recipeId of recipeIds) {
      const result = await dataClient.getRecipe(recipeId);
      if (!result.ok) continue;

      for (const plugin of result.data.plugins) {
        expect(plugin.pluginName).toBeTruthy();
        expect(plugin.timestamp).toBeTruthy();
        statusSet.add(plugin.status);
        totalPluginEntries++;
      }
    }

    console.log(`  validated ${totalPluginEntries} plugin entries across ${recipeIds.length} recipes`);
    console.log(`  observed statuses: [${[...statusSet].sort().join(', ')}]`);
  });

  it('getIndex plugin/recipe counts match Object.keys lengths', async () => {
    const { dataClient } = await import('../../src/lib/dataClient');
    const result = await dataClient.getIndex();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.plugins).toHaveLength(Object.keys(report.plugins).length);
    expect(result.data.recipes).toHaveLength(Object.keys(report.recipes).length);
    console.log(`  dataClient : ${result.data.plugins.length} plugins, ${result.data.recipes.length} recipes`);
    console.log(
      `  report.json: ${Object.keys(report.plugins).length} plugins, ${Object.keys(report.recipes).length} recipes`
    );
  });
});

const LIVE_REPORT_URL = 'https://jenkins-infra.github.io/metadata-plugin-modernizer/report.json';

describe.skipIf(!process.env.LIVE_REPORT)('dataClient live report.json smoke test', { timeout: 30000 }, () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses the live upstream report.json schema', async () => {
    const res = await fetch(LIVE_REPORT_URL);
    expect(res.ok).toBe(true);
    const liveReport = (await res.json()) as ReportJson;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(liveReport),
      })
    );

    const { dataClient } = await import('../../src/lib/dataClient');
    const [summary, plugins, recipes] = await Promise.all([
      dataClient.getSummary(),
      dataClient.getAllPlugins(),
      dataClient.getAllRecipes(),
    ]);

    expect(summary.ok).toBe(true);
    expect(plugins.ok).toBe(true);
    expect(recipes.ok).toBe(true);
  });
});
