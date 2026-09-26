import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../../src/pages/Dashboard';

vi.mock('echarts-for-react', () => ({
  default: (props: { option: Record<string, unknown> }) => (
    <div data-testid="echarts-mock" data-option={JSON.stringify(props.option)} />
  ),
}));

const mockReport = {
  schemaVersion: '1.0.0',
  generatedAt: '2026-08-03T04:34:07Z',
  dataSource: 'https://github.com/jenkins-infra/metadata-plugin-modernizer',
  meta: {
    source_sha256: '9c31eaa56c00ebdf32234379e3a0acb7c40e37291588a515fe20d223b890c4d9',
    parsed_at: '2026-08-03T04:34:07Z',
  },
  overview: {
    totalPlugins: 431,
    totalMigrations: 1459,
    successfulMigrations: 864,
    failedMigrations: 595,
    successRate: 59.22,
  },
  pullRequests: { totalPRs: 693, openPRs: 78, closedPRs: 32, mergedPRs: 583, mergeRate: 84.13 },
  failuresByRecipe: [
    { recipeId: 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile', failures: 522 },
    { recipeId: 'io.jenkins.tools.pluginmodernizer.UpgradeNextMajorParentVersion', failures: 32 },
  ],
  pluginsWithFailedMigrations: ['absint-a3', 'syslog-logger'],
  timeline: [
    { month: '2025-06', success: 1, fail: 1, total: 2 },
    { month: '2025-07', success: 164, fail: 377, total: 541 },
    { month: '2025-08', success: 50, fail: 5, total: 55 },
  ],
  tags: [
    { tag: 'skip-verification', count: 794 },
    { tag: 'chore', count: 794 },
    { tag: 'dependencies', count: 467 },
    { tag: 'migration', count: 298 },
  ],
  recipes: {
    'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile': {
      recipeId: 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile',
      totalApplications: 624,
      successCount: 102,
      failureCount: 522,
      plugins: [],
    },
    'io.jenkins.tools.pluginmodernizer.AddCodeOwner': {
      recipeId: 'io.jenkins.tools.pluginmodernizer.AddCodeOwner',
      totalApplications: 13,
      successCount: 11,
      failureCount: 1,
      plugins: [],
    },
  },
  plugins: {},
};

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockReport) }))
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Dashboard', () => {
  it('shows skeleton while loading', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {}))
    );

    renderDashboard();

    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
    console.log(`  Dashboard : ${skeletons.length} skeletons rendered while loading`);
  });

  it('renders stat cards on successful data load', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Total Plugins')).toBeDefined();
    });

    expect(screen.getByText('Total Migrations')).toBeDefined();
    expect(screen.getByText('Successful Migrations')).toBeDefined();
    expect(screen.getByText('Failed Migrations')).toBeDefined();
    console.log('  Dashboard : all stat card labels rendered');
  });

  it('renders pull request stats in the footer summary', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Pull requests/)).toBeDefined();
    });
    expect(screen.getByText(/Open/)).toBeDefined();
    expect(screen.getByText(/Merged/)).toBeDefined();
    expect(screen.getByText(/Closed/)).toBeDefined();

    expect(screen.getByText('693')).toBeDefined();
    expect(screen.getByText('78')).toBeDefined();
    expect(screen.getByText('583')).toBeDefined();
    expect(screen.getByText('32')).toBeDefined();
    console.log('  Dashboard : footer shows 693 pull requests, 78 open, 583 merged, 32 closed');
  });

  it('omits the pull request stats when the report has no pullRequests block', async () => {
    const { pullRequests, ...withoutPRs } = mockReport;
    void pullRequests;
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(withoutPRs) }))
    );

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Total Plugins')).toBeDefined();
    });
    expect(screen.queryByText(/Pull requests/)).toBeNull();
    console.log('  Dashboard : no pull request stats when the report omits pullRequests');
  });

  it('does not repeat plugin and migration totals in the footer summary', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Total Plugins')).toBeDefined();
    });
    expect(screen.queryByText(/^Plugins:/)).toBeNull();
    expect(screen.queryByText(/^Migrations:/)).toBeNull();
    console.log('  Dashboard : footer no longer duplicates the plugin and migration stat cards');
  });

  it('renders data freshness banner', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Data generated/)).toBeDefined();
    });

    expect(screen.getByText('metadata-plugin-modernizer')).toBeDefined();
    console.log('  Dashboard : data freshness banner rendered');
  });

  it('renders ECharts chart components', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Total Plugins')).toBeDefined();
    });

    const charts = screen.getAllByTestId('echarts-mock');
    expect(charts.length).toBeGreaterThanOrEqual(2);
    console.log(`  Dashboard : ${charts.length} ECharts components rendered`);
  });

  it('shows error state on fetch failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: false, status: 500, statusText: 'Internal Server Error' }))
    );

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Unable to fetch data')).toBeDefined();
    });

    expect(screen.getByText('Retry')).toBeDefined();
    console.log('  Dashboard : error state displayed with Retry button');
  });

  it('shows error state on network error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Failed to fetch')))
    );

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Unable to fetch data')).toBeDefined();
    });
    console.log('  Dashboard : network error message displayed');
  });

  it('renders top failing recipes section', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Total Plugins')).toBeDefined();
    });

    expect(screen.getByText(/SetupJenkinsfile/)).toBeDefined();
    console.log('  Dashboard : top failing recipes includes SetupJenkinsfile');
  });
});
