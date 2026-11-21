import type {
  ReportJson,
  SummaryJson,
  PluginRecipesIndex,
  RecipeReport,
  RecipeStats,
  PluginReport,
  PluginData,
  Result,
} from '../types';

const TIMEOUT_MS = 10_000;
const REPORT_URL = `${import.meta.env.BASE_URL}data/report.json`;

let reportPromise: Promise<Result<ReportJson>> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNumber(value: unknown): value is boolean {
  return typeof value === 'number' && Number.isFinite(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isReportJson(value: unknown): value is ReportJson {
  if (!isRecord(value)) return false;

  const overview = value.overview;
  const pullRequests = value.pullRequests;
  const meta = value.meta;

  if (
    !isString(value.schemaVersion) ||
    !isString(value.generatedAt) ||
    !isString(value.dataSource) ||
    !isRecord(meta) ||
    !isString(meta.source_sha256) ||
    !isString(meta.parsed_at) ||
    !isRecord(overview) ||
    !isNumber(overview.totalPlugins) ||
    !isNumber(overview.totalMigrations) ||
    !isNumber(overview.successfulMigrations) ||
    !isNumber(overview.failedMigrations) ||
    !isNumber(overview.successRate) ||
    !isRecord(pullRequests) ||
    !isNumber(pullRequests.totalPRs) ||
    !isNumber(pullRequests.openPRs) ||
    !isNumber(pullRequests.closedPRs) ||
    !isNumber(pullRequests.mergedPRs) ||
    !isNumber(pullRequests.mergeRate) ||
    !Array.isArray(value.failuresByRecipe) ||
    !Array.isArray(value.pluginsWithFailedMigrations) ||
    !Array.isArray(value.timeline) ||
    !Array.isArray(value.tags) ||
    !isRecord(value.recipes) ||
    !isRecord(value.plugins)
  ) {
    return false;
  }

  return (
    value.failuresByRecipe.every((entry) => isRecord(entry) && isString(entry.recipeId) && isNumber(entry.failures)) &&
    value.pluginsWithFailedMigrations.every(isString) &&
    value.timeline.every(
      (entry) =>
        isRecord(entry) &&
        isString(entry.month) &&
        isNumber(entry.success) &&
        isNumber(entry.fail) &&
        isNumber(entry.total)
    ) &&
    value.tags.every((entry) => isRecord(entry) && isString(entry.tag) && isNumber(entry.count)) &&
    Object.values(value.recipes).every(
      (recipe) =>
        isRecord(recipe) &&
        isString(recipe.recipeId) &&
        isNumber(recipe.totalApplications) &&
        isNumber(recipe.successCount) &&
        isNumber(recipe.failureCount) &&
        Array.isArray(recipe.plugins) &&
        recipe.plugins.every(
          (plugin) =>
            isRecord(plugin) && isString(plugin.pluginName) && isString(plugin.status) && isString(plugin.timestamp)
        )
    ) &&
    Object.values(value.plugins).every(
      (plugin) =>
        isRecord(plugin) && Array.isArray(plugin.aggregatedMigrations) && Array.isArray(plugin.failedMigrations)
    )
  );
}

async function fetchReport(url: string): Promise<Result<ReportJson>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }
    const data: unknown = await res.json();
    if (!isReportJson(data)) {
      return {
        ok: false,
        error: 'Metadata report has an unsupported format. It may be updating; please try again shortly.',
      };
    }
    return { ok: true, data };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { ok: false, error: `Request timed out after ${TIMEOUT_MS}ms` };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown fetch error',
    };
  } finally {
    clearTimeout(timer);
  }
}

function getReport(): Promise<Result<ReportJson>> {
  if (!reportPromise) {
    reportPromise = fetchReport(REPORT_URL).then((result) => {
      if (!result.ok) reportPromise = null;
      return result;
    });
  }
  return reportPromise;
}

function buildPluginReport(pluginId: string, pluginData: PluginData): PluginReport {
  const migrations = pluginData.aggregatedMigrations ?? [];
  let successCount = 0;
  let failCount = 0;
  let latestMigration: string | null = null;

  for (const m of migrations) {
    if (m.migrationStatus === 'success') successCount++;
    else if (m.migrationStatus === 'fail') failCount++;
    if (latestMigration === null || m.timestamp > latestMigration) {
      latestMigration = m.timestamp;
    }
  }

  return {
    pluginName: pluginId,
    pluginRepository: pluginData.sourceUrls?.repository ?? '',
    totalMigrations: migrations.length,
    successCount,
    failCount,
    latestMigration,
    migrations,
    sourceUrls: pluginData.sourceUrls,
    rawAggregatedMigrations: pluginData.aggregatedMigrations,
    rawFailedMigrations: pluginData.failedMigrations,
  };
}

export const dataClient = {
  async getSummary(): Promise<Result<SummaryJson>> {
    const result = await getReport();
    if (!result.ok) return result as { ok: false; error: string };
    const report = result.data;

    const recipes: RecipeStats[] = Object.entries(report.recipes).map(([recipeId, r]) => ({
      recipeId,
      total: r.totalApplications,
      success: r.successCount,
      fail: r.failureCount,
    }));

    return {
      ok: true,
      data: {
        schemaVersion: report.schemaVersion,
        generatedAt: report.generatedAt,
        dataSource: report.dataSource,
        meta: report.meta,
        overview: report.overview,
        pullRequests: report.pullRequests,
        timeline: report.timeline,
        tags: report.tags,
        failuresByRecipe: report.failuresByRecipe,
        pluginsWithFailedMigrations: report.pluginsWithFailedMigrations,
        recipes,
      },
    };
  },

  async getIndex(): Promise<Result<PluginRecipesIndex>> {
    const result = await getReport();
    if (!result.ok) return result as { ok: false; error: string };
    const report = result.data;

    return {
      ok: true,
      data: {
        schemaVersion: report.schemaVersion,
        generatedAt: report.generatedAt,
        plugins: Object.keys(report.plugins).sort(),
        recipes: Object.keys(report.recipes).sort(),
      },
    };
  },

  async getRecipe(recipeId: string): Promise<Result<RecipeReport>> {
    const result = await getReport();
    if (!result.ok) return result as { ok: false; error: string };
    const report = result.data;

    const recipe = report.recipes[recipeId];
    if (!recipe) {
      return { ok: false, error: `Recipe '${recipeId}' not found` };
    }

    return { ok: true, data: recipe };
  },

  async getPluginReport(pluginId: string): Promise<Result<PluginReport>> {
    const result = await getReport();
    if (!result.ok) return result as { ok: false; error: string };
    const report = result.data;

    const pluginData = report.plugins[pluginId];
    if (!pluginData) {
      return { ok: false, error: `Plugin '${pluginId}' not found` };
    }

    return { ok: true, data: buildPluginReport(pluginId, pluginData) };
  },

  async getPluginFailedMigrations(pluginId: string): Promise<Result<string>> {
    const result = await getReport();
    if (!result.ok) return result as { ok: false; error: string };
    const report = result.data;

    const pluginData = report.plugins[pluginId];
    if (!pluginData) {
      return { ok: false, error: `Plugin '${pluginId}' not found` };
    }

    const migrations = pluginData.aggregatedMigrations ?? [];
    const failed = migrations.filter((m) => m.migrationStatus === 'fail');

    const headers = ['migrationId', 'migrationName', 'migrationStatus', 'pluginVersion', 'timestamp', 'pullRequestUrl'];

    const escapeCsv = (value: string): string => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const rows = failed.map((m) =>
      [m.migrationId, m.migrationName, m.migrationStatus ?? '', m.pluginVersion, m.timestamp, m.pullRequestUrl ?? '']
        .map(escapeCsv)
        .join(',')
    );

    return { ok: true, data: [headers.join(','), ...rows].join('\n') };
  },

  async getAllPlugins(): Promise<Result<PluginReport[]>> {
    const result = await getReport();
    if (!result.ok) return result as { ok: false; error: string };
    const report = result.data;

    const plugins: PluginReport[] = Object.entries(report.plugins)
      .filter(([, pd]) => pd.aggregatedMigrations.length > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, pd]) => buildPluginReport(id, pd));

    return { ok: true, data: plugins };
  },

  async getAllRecipes(): Promise<Result<RecipeReport[]>> {
    const result = await getReport();
    if (!result.ok) return result as { ok: false; error: string };
    const report = result.data;

    const recipes = Object.values(report.recipes).sort((a, b) => a.recipeId.localeCompare(b.recipeId));
    return { ok: true, data: recipes };
  },
};
