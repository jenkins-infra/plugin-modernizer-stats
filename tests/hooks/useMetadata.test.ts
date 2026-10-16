import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { PluginRecipesIndex, PluginReport, RecipeReport, SummaryJson } from '../../src/types';

vi.mock('../../src/lib/dataClient', () => ({
  dataClient: {
    getIndex: vi.fn(),
    getPluginReport: vi.fn(),
    getPluginFailedMigrations: vi.fn(),
    getRecipe: vi.fn(),
    getAllPlugins: vi.fn(),
    getAllRecipes: vi.fn(),
    getSummary: vi.fn(),
  },
}));

import { dataClient } from '../../src/lib/dataClient';
import {
  useIndex,
  usePluginData,
  useFailedMigrations,
  useRecipeData,
  useAllPlugins,
  useAllRecipes,
  useSummary,
  useAppData,
} from '../../src/hooks/useMetadata';

const mockClient = vi.mocked(dataClient);

const mockIndex: PluginRecipesIndex = {
  schemaVersion: '1.0.0',
  generatedAt: '2025-09-03T10:00:00Z',
  plugins: ['BlazeMeterJenkinsPlugin', 'TestFairy'],
  recipes: ['io.jenkins.tools.pluginmodernizer.SetupJenkinsfile'],
};

const mockPlugin: PluginReport = {
  pluginName: 'TestFairy',
  pluginRepository: 'https://github.com/jenkinsci/testfairy-plugin.git',
  totalMigrations: 5,
  successCount: 2,
  failCount: 3,
  latestMigration: '2025-09-03T08-13-07',
  migrations: [],
};

const mockRecipe: RecipeReport = {
  recipeId: 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile',
  totalApplications: 3,
  successCount: 2,
  failureCount: 1,
  plugins: [
    { pluginName: 'BlazeMeterJenkinsPlugin', status: 'success', timestamp: '2025-09-03T08-05-48' },
    { pluginName: 'CustomHistory', status: 'fail', timestamp: '2025-09-03T08-08-19' },
    { pluginName: 'TestFairy', status: 'success', timestamp: '2025-07-28T18-02-28' },
  ],
};

const mockSummary: SummaryJson = {
  schemaVersion: '1.0.0',
  generatedAt: '2025-09-03T10:00:00Z',
  dataSource: 'test',
  meta: { source_sha256: 'abc', parsed_at: '2025-09-03T10:00:00Z' },
  overview: { totalPlugins: 2, totalMigrations: 5, successfulMigrations: 2, failedMigrations: 3, successRate: 40 },
  pullRequests: { totalPRs: 1, openPRs: 1, closedPRs: 0, mergedPRs: 0, mergeRate: 0 },
  failuresByRecipe: [],
  pluginsWithFailedMigrations: ['TestFairy'],
  timeline: [],
  tags: [],
  recipes: [{ recipeId: 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile', total: 2, success: 1, fail: 1 }],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useIndex', () => {
  it('returns index data on success', async () => {
    mockClient.getIndex.mockResolvedValue({ ok: true, data: mockIndex });

    const { result } = renderHook(() => useIndex());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(mockIndex);
    expect(result.current.error).toBeNull();
    console.log(`  mock data : ${mockIndex.plugins.length} plugins, ${mockIndex.recipes.length} recipes`);
    console.log(
      `  useIndex  : ${result.current.data?.plugins.length} plugins, ${result.current.data?.recipes.length} recipes`
    );
  });

  it('returns error on failure', async () => {
    mockClient.getIndex.mockResolvedValue({ ok: false, error: 'HTTP 500: Internal Server Error' });

    const { result } = renderHook(() => useIndex());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('HTTP 500: Internal Server Error');
    console.log(`  mock data   : fetch returns error`);
    console.log(`  useIndex    : error="${result.current.error}"`);
  });
});

describe('usePluginData', () => {
  it('returns plugin report on success', async () => {
    mockClient.getPluginReport.mockResolvedValue({ ok: true, data: mockPlugin });

    const { result } = renderHook(() => usePluginData('TestFairy'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(mockPlugin);
    expect(result.current.error).toBeNull();
    console.log(
      `  mock data    : TestFairy -> ${mockPlugin.totalMigrations} migrations (${mockPlugin.successCount}s/${mockPlugin.failCount}f)`
    );
    console.log(
      `  usePluginData: ${result.current.data?.pluginName} -> ${result.current.data?.totalMigrations} migrations`
    );
  });

  it('returns error for unknown plugin', async () => {
    mockClient.getPluginReport.mockResolvedValue({ ok: false, error: "Plugin 'unknown' not found" });

    const { result } = renderHook(() => usePluginData('unknown'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toContain('unknown');
    console.log(`  mock data    : plugin "unknown" does not exist`);
    console.log(`  usePluginData: error="${result.current.error}"`);
  });
});

describe('useFailedMigrations', () => {
  it('returns CSV string on success', async () => {
    const csv = 'migrationId,migrationName\nid1,name1';
    mockClient.getPluginFailedMigrations.mockResolvedValue({ ok: true, data: csv });

    const { result } = renderHook(() => useFailedMigrations('TestFairy'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBe(csv);
    expect(result.current.error).toBeNull();
    console.log(`  mock data          : CSV with ${csv.split('\n').length - 1} data rows`);
    console.log(`  useFailedMigrations: received ${result.current.data?.split('\n').length} lines`);
  });
});

describe('useRecipeData', () => {
  it('returns recipe report on success', async () => {
    mockClient.getRecipe.mockResolvedValue({ ok: true, data: mockRecipe });

    const { result } = renderHook(() => useRecipeData('io.jenkins.tools.pluginmodernizer.SetupJenkinsfile'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(mockRecipe);
    expect(result.current.error).toBeNull();
    console.log(
      `  mock data    : SetupJenkinsfile -> ${mockRecipe.totalApplications} applications (${mockRecipe.successCount}s/${mockRecipe.failureCount}f)`
    );
    console.log(
      `  useRecipeData: ${result.current.data?.recipeId} -> ${result.current.data?.totalApplications} applications`
    );
  });

  it('returns error for unknown recipe', async () => {
    mockClient.getRecipe.mockResolvedValue({ ok: false, error: "Recipe 'unknown.recipe' not found" });

    const { result } = renderHook(() => useRecipeData('unknown.recipe'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toContain('unknown.recipe');
    console.log(`  mock data    : recipe "unknown.recipe" does not exist`);
    console.log(`  useRecipeData: error="${result.current.error}"`);
  });
});

describe('useAllPlugins', () => {
  it('returns plugin list on success', async () => {
    mockClient.getAllPlugins.mockResolvedValue({ ok: true, data: [mockPlugin] });

    const { result } = renderHook(() => useAllPlugins());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].pluginName).toBe('TestFairy');
    console.log(`  mock data    : 1 plugin`);
    console.log(`  useAllPlugins: ${result.current.data?.length} plugins`);
  });
});

describe('useAllRecipes', () => {
  it('returns recipe list on success', async () => {
    mockClient.getAllRecipes.mockResolvedValue({ ok: true, data: [mockRecipe] });

    const { result } = renderHook(() => useAllRecipes());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].recipeId).toContain('SetupJenkinsfile');
    console.log(`  mock data    : 1 recipe`);
    console.log(`  useAllRecipes: ${result.current.data?.length} recipes`);
  });
});

describe('useSummary', () => {
  it('returns summary data on success', async () => {
    mockClient.getSummary.mockResolvedValue({ ok: true, data: mockSummary });

    const { result } = renderHook(() => useSummary());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(mockSummary);
    expect(result.current.error).toBeNull();
    console.log(`  useSummary : ${result.current.data?.overview.totalMigrations} migrations`);
  });

  it('returns error on failure', async () => {
    mockClient.getSummary.mockResolvedValue({ ok: false, error: 'Request timed out after 10000ms' });

    const { result } = renderHook(() => useSummary());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Request timed out after 10000ms');
    console.log(`  useSummary : error="${result.current.error}"`);
  });
});

describe('useAppData', () => {
  it('returns combined app data on success', async () => {
    mockClient.getSummary.mockResolvedValue({ ok: true, data: mockSummary });
    mockClient.getAllPlugins.mockResolvedValue({ ok: true, data: [mockPlugin] });
    mockClient.getAllRecipes.mockResolvedValue({ ok: true, data: [mockRecipe] });

    const { result } = renderHook(() => useAppData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).not.toBeNull();
    expect(result.current.data?.summary.overview.totalPlugins).toBe(2);
    expect(result.current.data?.plugins).toHaveLength(1);
    expect(result.current.data?.recipes).toHaveLength(1);
    expect(result.current.error).toBeNull();
    console.log(
      `  mock data : summary(${mockSummary.overview.totalPlugins} plugins), 1 plugin report, 1 recipe report`
    );
    console.log(
      `  useAppData: summary(${result.current.data?.summary.overview.totalPlugins} plugins), ${result.current.data?.plugins.length} plugins, ${result.current.data?.recipes.length} recipes`
    );
  });

  it('returns error if any sub-fetch fails', async () => {
    mockClient.getSummary.mockResolvedValue({ ok: true, data: mockSummary });
    mockClient.getAllPlugins.mockResolvedValue({ ok: false, error: 'Network error' });
    mockClient.getAllRecipes.mockResolvedValue({ ok: true, data: [mockRecipe] });

    const { result } = renderHook(() => useAppData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Network error');
    console.log(`  mock data : summary=ok, plugins=error, recipes=ok`);
    console.log(`  useAppData: error="${result.current.error}"`);
  });
});
