import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReportJson, PluginReport, PluginStatusColor } from '../../src/types';
import { deriveStatus } from '../../src/util/pluginStatus';

const REPORT_URL = 'https://jenkins-infra.github.io/metadata-plugin-modernizer/report.json';

vi.mock('react-window', () => ({
  List: ({
    rowComponent: Row,
    rowCount,
    rowProps,
  }: {
    rowComponent: React.ComponentType<{ index: number; style: React.CSSProperties } & Record<string, unknown>>;
    rowCount: number;
    rowHeight: number;
    rowProps: Record<string, unknown>;
    style?: React.CSSProperties;
  }) => (
    <div data-testid="virtual-list">
      {Array.from({ length: rowCount }, (_, i) => (
        <Row key={i} index={i} style={{}} {...rowProps} />
      ))}
    </div>
  ),
}));

function buildPluginReport(pluginId: string, pd: ReportJson['plugins'][string]): PluginReport {
  const migrations = pd.aggregatedMigrations ?? [];
  let successCount = 0;
  let failCount = 0;
  let latestMigration: string | null = null;

  for (const m of migrations) {
    if (m.migrationStatus === 'success') successCount++;
    else if (m.migrationStatus === 'fail') failCount++;
    if (latestMigration === null || m.timestamp > latestMigration) latestMigration = m.timestamp;
  }

  return {
    pluginName: pluginId,
    pluginRepository: pd.sourceUrls?.repository ?? '',
    totalMigrations: migrations.length,
    successCount,
    failCount,
    latestMigration,
    migrations,
    sourceUrls: pd.sourceUrls,
  };
}

function countByStatus(plugins: PluginReport[]): Record<PluginStatusColor, number> {
  const counts = { green: 0, red: 0, blue: 0, yellow: 0, white: 0 };
  for (const p of plugins) counts[deriveStatus(p.migrations)]++;
  return counts;
}

describe('PluginList integration (real report.json)', () => {
  let realReport: ReportJson;
  let expectedPlugins: PluginReport[];
  let expectedCounts: Record<PluginStatusColor, number>;

  beforeEach(async () => {
    vi.resetModules();
    vi.restoreAllMocks();

    const res = await fetch(REPORT_URL);
    if (!res.ok) throw new Error(`Failed to fetch report.json: ${res.status} ${res.statusText}`);
    realReport = (await res.json()) as ReportJson;

    expectedPlugins = Object.entries(realReport.plugins)
      .filter(([, pd]) => pd.aggregatedMigrations.length > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, pd]) => buildPluginReport(id, pd));

    expectedCounts = countByStatus(expectedPlugins);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(realReport),
      })
    );
  });

  async function renderAndWait() {
    const PluginList = (await import('../../src/pages/PluginList')).default;
    render(
      <MemoryRouter>
        <PluginList />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(`${expectedPlugins.length} total`)).toBeDefined();
    });
  }

  it('renders the correct total plugin count from real data', { timeout: 15000 }, async () => {
    await renderAndWait();

    expect(screen.getByText('Plugins')).toBeDefined();
    expect(screen.getByText(`${expectedPlugins.length} total`)).toBeDefined();
    console.log(`  report.json  : ${Object.keys(realReport.plugins).length} plugin entries`);
    console.log(`  PluginList   : ${expectedPlugins.length} plugins with migrations rendered`);
  });

  it('status card counts match deriveStatus computation over real data', async () => {
    await renderAndWait();

    const virtualList = screen.getByTestId('virtual-list');
    const renderedRows = virtualList.children.length;
    expect(renderedRows).toBe(expectedPlugins.length);

    const cardStatuses: PluginStatusColor[] = ['green', 'red', 'blue', 'yellow'];
    for (const status of cardStatuses) {
      const count = expectedCounts[status];
      if (count > 0) {
        const countElements = screen.getAllByText(String(count));
        const found = countElements.some((el) => el.closest('button') !== null);
        expect(found).toBe(true);
      }
      console.log(`  status=${status} : expected=${count}`);
    }
    console.log(`  status=white : expected=${expectedCounts.white} (no card, plugins still listed)`);

    const total = Object.values(expectedCounts).reduce((a, b) => a + b, 0);
    expect(total).toBe(expectedPlugins.length);
    console.log(`  total        : ${total} (sum of all statuses = plugin count)`);
  });

  it('all plugin names from real data appear in the rendered list', { timeout: 15000 }, async () => {
    await renderAndWait();

    const sample = expectedPlugins.slice(0, 5);
    for (const plugin of sample) {
      expect(screen.getByText(plugin.pluginName)).toBeDefined();
    }

    const lastFive = expectedPlugins.slice(-5);
    for (const plugin of lastFive) {
      expect(screen.getByText(plugin.pluginName)).toBeDefined();
    }

    console.log(`  report.json  : ${expectedPlugins.length} plugins`);
    console.log(`  PluginList   : verified first 5 + last 5 plugin names rendered`);
    console.log(`    first 5    : ${sample.map((p) => p.pluginName).join(', ')}`);
    console.log(`    last 5     : ${lastFive.map((p) => p.pluginName).join(', ')}`);
  });

  it('search filters real plugin names correctly', async () => {
    await renderAndWait();

    const targetPlugin = expectedPlugins[Math.floor(expectedPlugins.length / 2)];
    const searchTerm = targetPlugin.pluginName.slice(0, 6).toUpperCase();

    const searchInput = screen.getByPlaceholderText('Search a plugin…');
    fireEvent.change(searchInput, { target: { value: searchTerm } });

    const needle = searchTerm.toLowerCase();
    const matchingPlugins = expectedPlugins.filter((p) => p.pluginName.toLowerCase().includes(needle));

    expect(screen.getByText(targetPlugin.pluginName)).toBeDefined();

    const resultText = screen.getByText(new RegExp(`^${matchingPlugins.length} result`));
    expect(resultText).toBeDefined();

    console.log(`  search       : "${searchTerm}" (from "${targetPlugin.pluginName}")`);
    console.log(`  expected     : ${matchingPlugins.length} matches`);
    console.log(`  PluginList   : target plugin visible, result count correct`);
  });

  it('status filter shows only plugins of that status from real data', async () => {
    await renderAndWait();

    const statusWithPlugins = (Object.entries(expectedCounts) as [PluginStatusColor, number][]).find(
      ([status, count]) => count > 0 && count < expectedPlugins.length && status !== 'white'
    );

    if (!statusWithPlugins) {
      console.log(`  skipped      : no status with subset of plugins found`);
      return;
    }

    const [targetStatus, targetCount] = statusWithPlugins;

    const labelMap: Record<string, string> = {
      green: 'All Passed',
      red: 'All Failed',
      blue: 'Mostly Passed',
      yellow: 'Mostly Failed',
    };

    const filterButton = screen.getAllByText(labelMap[targetStatus]).find((el) => el.closest('button'));
    expect(filterButton).toBeDefined();
    fireEvent.click(filterButton!);

    const virtualList = screen.getByTestId('virtual-list');
    expect(virtualList.children.length).toBe(targetCount);

    const resultText = screen.getByText(new RegExp(`^${targetCount} result`));
    expect(resultText).toBeDefined();

    console.log(`  filter       : "${labelMap[targetStatus]}" (status=${targetStatus})`);
    console.log(`  expected     : ${targetCount} plugins`);
    console.log(`  PluginList   : ${virtualList.children.length} rows rendered, result count matches`);
  });

  it('combining search + status filter narrows results from real data', async () => {
    await renderAndWait();

    const statusWithPlugins = (Object.entries(expectedCounts) as [PluginStatusColor, number][]).find(
      ([status, count]) => count > 2 && status !== 'white'
    );

    if (!statusWithPlugins) {
      console.log(`  skipped      : no status with >2 plugins found`);
      return;
    }

    const [targetStatus] = statusWithPlugins;
    const pluginsOfStatus = expectedPlugins.filter((p) => deriveStatus(p.migrations) === targetStatus);

    const labelMap: Record<string, string> = {
      green: 'All Passed',
      red: 'All Failed',
      blue: 'Mostly Passed',
      yellow: 'Mostly Failed',
    };

    const filterButton = screen.getAllByText(labelMap[targetStatus]).find((el) => el.closest('button'));
    fireEvent.click(filterButton!);

    const searchTerm = pluginsOfStatus[0].pluginName.slice(0, 5);
    const searchInput = screen.getByPlaceholderText('Search a plugin…');
    fireEvent.change(searchInput, { target: { value: searchTerm } });

    const needle = searchTerm.toLowerCase();
    const expected = pluginsOfStatus.filter((p) => p.pluginName.toLowerCase().includes(needle));

    const virtualList = screen.getByTestId('virtual-list');
    expect(virtualList.children.length).toBe(expected.length);

    console.log(`  filter       : status="${targetStatus}" + search="${searchTerm}"`);
    console.log(`  status pool  : ${pluginsOfStatus.length} plugins`);
    console.log(`  combined     : ${expected.length} plugins match both filters`);
    console.log(`  PluginList   : ${virtualList.children.length} rows rendered`);
  });

  it('clearing status filter restores all plugins', async () => {
    await renderAndWait();

    const statusWithPlugins = (Object.entries(expectedCounts) as [PluginStatusColor, number][]).find(
      ([status, count]) => count > 0 && count < expectedPlugins.length && status !== 'white'
    );

    if (!statusWithPlugins) {
      console.log(`  skipped      : no status with subset found`);
      return;
    }

    const [targetStatus, targetCount] = statusWithPlugins;

    const labelMap: Record<string, string> = {
      green: 'All Passed',
      red: 'All Failed',
      blue: 'Mostly Passed',
      yellow: 'Mostly Failed',
    };

    const filterButton = screen.getAllByText(labelMap[targetStatus]).find((el) => el.closest('button'));
    fireEvent.click(filterButton!);

    const virtualList = screen.getByTestId('virtual-list');
    expect(virtualList.children.length).toBe(targetCount);

    const dismissChip = screen.getByText('✕');
    fireEvent.click(dismissChip);

    expect(virtualList.children.length).toBe(expectedPlugins.length);

    console.log(`  filter       : "${labelMap[targetStatus]}" -> ${targetCount} rows`);
    console.log(`  clear        : ✕ clicked -> ${expectedPlugins.length} rows restored`);
  });

  it('migration counts in rendered rows match real data', async () => {
    await renderAndWait();

    const sample = expectedPlugins.slice(0, 3);
    for (const plugin of sample) {
      const nameEl = screen.getByText(plugin.pluginName);
      const row = nameEl.parentElement;
      expect(row).not.toBeNull();

      const rowText = row!.textContent ?? '';
      expect(rowText).toContain(String(plugin.successCount));
      expect(rowText).toContain(`/${plugin.totalMigrations}`);

      console.log(
        `  ${plugin.pluginName.padEnd(30)} : ${plugin.successCount}/${plugin.totalMigrations} (status=${deriveStatus(plugin.migrations)})`
      );
    }
  });
});
