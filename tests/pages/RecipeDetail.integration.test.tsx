import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ReportJson } from '../../src/types';
import { mockReport } from '../fixtures/report';

/**
 * Integration tests that validate RecipeDetail page data flows
 * correctly through dataClient using a deterministic report.json fixture.
 */
describe('RecipeDetail integration (report.json fixture)', () => {
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

  it('getRecipe returns consistent data for all recipes', async () => {
    const { dataClient } = await import('../../src/lib/dataClient');

    for (const [recipeId, rawRecipe] of Object.entries(report.recipes)) {
      const result = await dataClient.getRecipe(recipeId);
      expect(result.ok).toBe(true);
      if (!result.ok) continue;

      expect(result.data.recipeId).toBe(recipeId);
      expect(result.data.totalApplications).toBe(rawRecipe.totalApplications);
      expect(result.data.successCount).toBe(rawRecipe.successCount);
      expect(result.data.failureCount).toBe(rawRecipe.failureCount);
      expect(result.data.plugins).toHaveLength(rawRecipe.plugins.length);
    }

    console.log(`  RecipeDetail integration : validated ${Object.keys(report.recipes).length} recipes`);
  });

  it('getRecipe returns not-found error for invalid recipe ID', async () => {
    const { dataClient } = await import('../../src/lib/dataClient');

    const result = await dataClient.getRecipe('io.jenkins.tools.pluginmodernizer.NonExistentRecipe');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain('not found');
    console.log('  RecipeDetail integration : non-existent recipe returns error');
  });

  it('success + failure counts are within totalApplications for all recipes', async () => {
    const { dataClient } = await import('../../src/lib/dataClient');

    for (const recipeId of Object.keys(report.recipes)) {
      const result = await dataClient.getRecipe(recipeId);
      expect(result.ok).toBe(true);
      if (!result.ok) continue;

      const { successCount, failureCount, totalApplications } = result.data;
      expect(successCount + failureCount).toBeLessThanOrEqual(totalApplications);
    }

    console.log('  RecipeDetail integration : success + failure <= total for all recipes');
  });

  it('plugin entries have required fields with valid data', async () => {
    const { dataClient } = await import('../../src/lib/dataClient');
    const timestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/;

    const recipeId = Object.keys(report.recipes).find((id) => report.recipes[id].plugins.length > 0);
    expect(recipeId).toBeDefined();

    const result = await dataClient.getRecipe(recipeId!);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    for (const plugin of result.data.plugins) {
      expect(plugin.pluginName).toBeTruthy();
      expect(plugin.timestamp).toMatch(timestampPattern);
    }

    console.log(`  RecipeDetail integration : plugin entries have valid pluginName and timestamp`);
  });
});
