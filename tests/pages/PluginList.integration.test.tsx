import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PluginReport, PluginStatusColor } from '../../src/types';
import { buildPluginReport } from '../../src/lib/dataClient';
import { countByStatus, deriveStatus } from '../../src/util/pluginStatus';
import PluginList from '../../src/pages/PluginList';
import { mockReport } from '../fixtures/report';

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

const STATUS_LABEL_MAP: Record<Exclude<PluginStatusColor, 'white'>, string> = {
  green: 'All Passed',
  red: 'All Failed',
  blue: 'Mostly Passed',
  yellow: 'Mostly Failed',
};

describe('PluginList integration (deterministic report fixture)', () => {
  let expectedPlugins: PluginReport[];
  let expectedCounts: Record<PluginStatusColor, number>;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.restoreAllMocks();

    expectedPlugins = Object.entries(mockReport.plugins)
      .filter(([, pd]) => pd.aggregatedMigrations.length > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, pd]) => buildPluginReport(id, pd));

    expectedCounts = countByStatus(expectedPlugins);

    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockReport),
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function renderAndWait() {
    render(
      <MemoryRouter>
        <PluginList />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(`${expectedPlugins.length} total`)).toBeDefined();
    });
    expect(screen.getAllByTestId('virtual-list')).toHaveLength(1);
  }

  it('renders the correct total plugin count from fixture data without external network calls', async () => {
    await renderAndWait();

    expect(screen.getByText('Plugins')).toBeDefined();
    expect(screen.getByText(`${expectedPlugins.length} total`)).toBeDefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('data/report.json'),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('status card counts match deriveStatus computation over fixture data', async () => {
    await renderAndWait();

    const virtualList = screen.getByTestId('virtual-list');
    expect(virtualList.children.length).toBe(expectedPlugins.length);

    const cardStatuses: Exclude<PluginStatusColor, 'white'>[] = ['green', 'red', 'blue', 'yellow'];
    for (const status of cardStatuses) {
      const count = expectedCounts[status];
      expect(count).toBeGreaterThan(0);
      const countElements = screen.getAllByText(String(count));
      const found = countElements.some((el) => el.closest('button') !== null);
      expect(found).toBe(true);
    }

    const total = Object.values(expectedCounts).reduce((a, b) => a + b, 0);
    expect(total).toBe(expectedPlugins.length);
  });

  it('all plugin names with migrations appear in the rendered list and empty ones are excluded', async () => {
    await renderAndWait();

    for (const plugin of expectedPlugins) {
      expect(screen.getByText(plugin.pluginName)).toBeDefined();
    }
    expect(screen.queryByText('empty-plugin')).toBeNull();
  });

  it('search filters plugin names correctly (case-insensitive)', async () => {
    await renderAndWait();

    const targetPlugin = expectedPlugins.find((p) => p.pluginName === 'google-analytics-usage-reporter')!;
    const searchTerm = targetPlugin.pluginName.slice(0, 6).toUpperCase();

    const searchInput = screen.getByPlaceholderText('Search a plugin…');
    fireEvent.change(searchInput, { target: { value: searchTerm } });

    const needle = searchTerm.toLowerCase();
    const matchingPlugins = expectedPlugins.filter((p) => p.pluginName.toLowerCase().includes(needle));

    expect(screen.getByText(targetPlugin.pluginName)).toBeDefined();
    expect(screen.getByText(new RegExp(`^${matchingPlugins.length} result`))).toBeDefined();
  });

  it('status filter shows only plugins of that status', async () => {
    await renderAndWait();

    const targetStatus: Exclude<PluginStatusColor, 'white'> = 'green';
    const targetCount = expectedCounts[targetStatus];

    const filterButton = screen.getAllByText(STATUS_LABEL_MAP[targetStatus]).find((el) => el.closest('button'));
    expect(filterButton).toBeDefined();
    fireEvent.click(filterButton!);

    const virtualList = screen.getByTestId('virtual-list');
    expect(virtualList.children.length).toBe(targetCount);
    expect(screen.getByText(new RegExp(`^${targetCount} result`))).toBeDefined();
  });

  it('combining search + status filter narrows results', async () => {
    await renderAndWait();

    const targetStatus: Exclude<PluginStatusColor, 'white'> = 'green';
    const pluginsOfStatus = expectedPlugins.filter((p) => deriveStatus(p.migrations) === targetStatus);
    expect(pluginsOfStatus.length).toBeGreaterThan(2);

    const filterButton = screen.getAllByText(STATUS_LABEL_MAP[targetStatus]).find((el) => el.closest('button'));
    expect(filterButton).toBeDefined();
    fireEvent.click(filterButton!);

    const searchTerm = 'activ';
    const searchInput = screen.getByPlaceholderText('Search a plugin…');
    fireEvent.change(searchInput, { target: { value: searchTerm } });

    const expected = pluginsOfStatus.filter((p) => p.pluginName.toLowerCase().includes(searchTerm));
    const virtualList = screen.getByTestId('virtual-list');
    expect(virtualList.children.length).toBe(expected.length);
    expect(screen.getByText('active-directory')).toBeDefined();
  });

  it('clearing status filter restores all plugins', async () => {
    await renderAndWait();

    const targetStatus: Exclude<PluginStatusColor, 'white'> = 'red';
    const targetCount = expectedCounts[targetStatus];

    const filterButton = screen.getAllByText(STATUS_LABEL_MAP[targetStatus]).find((el) => el.closest('button'));
    expect(filterButton).toBeDefined();
    fireEvent.click(filterButton!);

    const virtualList = screen.getByTestId('virtual-list');
    expect(virtualList.children.length).toBe(targetCount);

    const dismissChip = screen.getByText('✕');
    fireEvent.click(dismissChip);

    expect(virtualList.children.length).toBe(expectedPlugins.length);
  });

  it('migration counts in rendered rows match fixture data', async () => {
    await renderAndWait();

    for (const plugin of expectedPlugins.slice(0, 3)) {
      const nameEl = screen.getByText(plugin.pluginName);
      const row = nameEl.parentElement;
      expect(row).not.toBeNull();

      const rowText = row!.textContent ?? '';
      expect(rowText).toContain(String(plugin.successCount));
      expect(rowText).toContain(`/${plugin.totalMigrations}`);
    }
  });
});
