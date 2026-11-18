import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ReportJson } from '../../src/types';
import { mockReport } from '../fixtures/report';

/**
 * These tests feed a deterministic report.json fixture to dataClient via mocked fetch
 * and validate that dataClient produces correct results matching the raw data.
 */
describe('dataClient validated against report.json fixture', () => {
  let realReport: ReportJson;

  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();

    realReport = mockReport;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(realReport),
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
    for (const p of Object.values(realReport.plugins)) {
      totalFromJson += p.aggregatedMigrations.length;
    }

    expect(totalFromClient).toBe(totalFromJson);
    expect(totalFromClient).toBe(realReport.overview.totalMigrations);
    console.log(`  dataClient : ${result.data.length} plugins, ${totalFromClient} migrations`);
    console.log(
      `  report.json: ${Object.keys(realReport.plugins).length} plugins, ${totalFromJson} migrations (overview: ${realReport.overview.totalMigrations})`
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
    for (const p of Object.values(realReport.plugins)) {
      for (const m of p.aggregatedMigrations) {
        if (m.migrationStatus === 'success') jsonSuccess++;
        else if (m.migrationStatus === 'fail') jsonFail++;
      }
    }

    expect(clientSuccess).toBe(jsonSuccess);
    expect(clientFail).toBe(jsonFail);
    console.log(`  dataClient : success=${clientSuccess}, fail=${clientFail}`);
    console.log(
      `  report.json: success=${jsonSuccess}, fail=${jsonFail} (overview: ${realReport.overview.successfulMigrations}s/${realReport.overview.failedMigrations}f)`
    );
  });

  it('getPluginReport returns correct data for a known mixed plugin', async () => {
    const { dataClient } = await import('../../src/lib/dataClient');

    const pluginId = Object.keys(realReport.plugins).find((id) => {
      const agg = realReport.plugins[id].aggregatedMigrations;
      const s = agg.filter((m) => m.migrationStatus === 'success').length;
      const f = agg.filter((m) => m.migrationStatus === 'fail').length;
      return s > 0 && f > 0;
    });
    expect(pluginId).toBeDefined();

    const result = await dataClient.getPluginReport(pluginId!);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const rawAgg = realReport.plugins[pluginId!].aggregatedMigrations;
    const expectedSuccess = rawAgg.filter((m) => m.migrationStatus === 'success').length;
    const expectedFail = rawAgg.filter((m) => m.migrationStatus === 'fail').length;

    expect(result.data.totalMigrations).toBe(rawAgg.length);
    expect(result.data.successCount).toBe(expectedSuccess);
    expect(result.data.failCount).toBe(expectedFail);
    expect(result.data.pluginRepository).toBe(realReport.plugins[pluginId!].sourceUrls?.repository ?? '');
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
    expect(result.data.overview).toEqual(realReport.overview);
    console.log(
      `  dataClient : totalPlugins=${result.data.overview.totalPlugins}, totalMigrations=${result.data.overview.totalMigrations}, successRate=${result.data.overview.successRate}%`
    );
    console.log(
      `  report.json: totalPlugins=${realReport.overview.totalPlugins}, totalMigrations=${realReport.overview.totalMigrations}, successRate=${realReport.overview.successRate}%`
    );
  });

  it('getAllRecipes count matches Object.keys(report.recipes).length', async () => {
    const { dataClient } = await import('../../src/lib/dataClient');
    const result = await dataClient.getAllRecipes();

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const expectedCount = Object.keys(realReport.recipes).length;
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
      const raw = realReport.recipes[recipe.recipeId];
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

    const recipeId = Object.keys(realReport.recipes).find((id) => {
      const r = realReport.recipes[id];
      return r.plugins && r.plugins.length > 0 && r.successCount > 0;
    });
    expect(recipeId).toBeDefined();

    const result = await dataClient.getRecipe(recipeId!);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const raw = realReport.recipes[recipeId!];
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

    const recipeIds = Object.keys(realReport.recipes);
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
    expect(result.data.plugins).toHaveLength(Object.keys(realReport.plugins).length);
    expect(result.data.recipes).toHaveLength(Object.keys(realReport.recipes).length);
    console.log(`  dataClient : ${result.data.plugins.length} plugins, ${result.data.recipes.length} recipes`);
    console.log(
      `  report.json: ${Object.keys(realReport.plugins).length} plugins, ${Object.keys(realReport.recipes).length} recipes`
    );
  });
});
