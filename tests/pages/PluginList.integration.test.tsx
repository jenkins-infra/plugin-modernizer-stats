import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PluginStatusColor } from '../../src/types';
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

/**
 * Expected values derived independently from tests/fixtures/report.ts:
 * - 8 plugins with migrations (empty-plugin has 0 migrations and is excluded)
 * - green (3): BlazeMeterJenkinsPlugin (2/2), active-directory (1/1), git-client (2/2)
 * - red   (2): CustomHistory (0/2), google-analytics-usage-reporter (0/1)
 * - blue  (1): absint-a3 (3/4)
 * - yellow(1): testfairy (1/3)
 * - white (1): omega-unknown (0/1, missing migrationStatus; listed without a status card)
 */
const EXPECTED_PLUGIN_NAMES = [
  'BlazeMeterJenkinsPlugin',
  'CustomHistory',
  'absint-a3',
  'active-directory',
  'git-client',
  'google-analytics-usage-reporter',
  'omega-unknown',
  'testfairy',
];

const EXPECTED_STATUS_COUNTS: Record<Exclude<PluginStatusColor, 'white'>, { label: string; count: number }> = {
  green: { label: 'All Passed', count: 3 },
  red: { label: 'All Failed', count: 2 },
  blue: { label: 'Mostly Passed', count: 1 },
  yellow: { label: 'Mostly Failed', count: 1 },
};

describe('PluginList integration (deterministic report fixture)', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.restoreAllMocks();

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
      expect(screen.getByText(`${EXPECTED_PLUGIN_NAMES.length} total`)).toBeDefined();
    });
    expect(screen.getAllByTestId('virtual-list')).toHaveLength(1);
  }

  it('renders the correct total plugin count from fixture data without external network calls', async () => {
    await renderAndWait();

    expect(screen.getByText('Plugins')).toBeDefined();
    expect(screen.getByText('8 total')).toBeDefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('data/report.json'),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('status card counts match independent fixture status counts', async () => {
    await renderAndWait();

    const virtualList = screen.getByTestId('virtual-list');
    expect(virtualList.children.length).toBe(EXPECTED_PLUGIN_NAMES.length);

    for (const { count } of Object.values(EXPECTED_STATUS_COUNTS)) {
      const countElements = screen.getAllByText(String(count));
      const found = countElements.some((el) => el.closest('button') !== null);
      expect(found).toBe(true);
    }
  });

  it('all plugin names with migrations appear in the rendered list and empty ones are excluded', async () => {
    await renderAndWait();

    for (const name of EXPECTED_PLUGIN_NAMES) {
      expect(screen.getByText(name)).toBeDefined();
    }
    expect(screen.queryByText('empty-plugin')).toBeNull();
  });

  it('search filters plugin names correctly (case-insensitive)', async () => {
    await renderAndWait();

    const searchInput = screen.getByPlaceholderText('Search a plugin…');
    fireEvent.change(searchInput, { target: { value: 'GOOGLE' } });

    expect(screen.getByText('google-analytics-usage-reporter')).toBeDefined();
    expect(screen.queryByText('BlazeMeterJenkinsPlugin')).toBeNull();
    expect(screen.getByText(/^1 result/)).toBeDefined();
  });

  it('status filter shows only plugins of that status', async () => {
    await renderAndWait();

    const { label, count } = EXPECTED_STATUS_COUNTS.green;
    const filterButton = screen.getAllByText(label).find((el) => el.closest('button'));
    expect(filterButton).toBeDefined();
    fireEvent.click(filterButton!);

    const virtualList = screen.getByTestId('virtual-list');
    expect(virtualList.children.length).toBe(count);
    expect(screen.getByText(new RegExp(`^${count} result`))).toBeDefined();
  });

  it('combining search + status filter narrows results', async () => {
    await renderAndWait();

    const filterButton = screen.getAllByText(EXPECTED_STATUS_COUNTS.green.label).find((el) => el.closest('button'));
    expect(filterButton).toBeDefined();
    fireEvent.click(filterButton!);

    const searchInput = screen.getByPlaceholderText('Search a plugin…');
    fireEvent.change(searchInput, { target: { value: 'activ' } });

    const virtualList = screen.getByTestId('virtual-list');
    expect(virtualList.children.length).toBe(1);
    expect(screen.getByText('active-directory')).toBeDefined();
  });

  it('clearing status filter restores all plugins', async () => {
    await renderAndWait();

    const { label, count } = EXPECTED_STATUS_COUNTS.red;
    const filterButton = screen.getAllByText(label).find((el) => el.closest('button'));
    expect(filterButton).toBeDefined();
    fireEvent.click(filterButton!);

    const virtualList = screen.getByTestId('virtual-list');
    expect(virtualList.children.length).toBe(count);

    const dismissChip = screen.getByText('✕');
    fireEvent.click(dismissChip);

    expect(virtualList.children.length).toBe(EXPECTED_PLUGIN_NAMES.length);
  });

  it('migration counts in rendered rows match independent fixture counts', async () => {
    await renderAndWait();

    const expectedSamples: Array<{ name: string; success: number; total: number }> = [
      { name: 'absint-a3', success: 3, total: 4 },
      { name: 'active-directory', success: 1, total: 1 },
      { name: 'BlazeMeterJenkinsPlugin', success: 2, total: 2 },
      { name: 'testfairy', success: 1, total: 3 },
    ];

    for (const sample of expectedSamples) {
      const nameEl = screen.getByText(sample.name);
      const row = nameEl.parentElement;
      expect(row).not.toBeNull();

      const rowText = row!.textContent ?? '';
      expect(rowText).toContain(String(sample.success));
      expect(rowText).toContain(`/${sample.total}`);
    }
  });
});
