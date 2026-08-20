import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { RecipeReport } from '../../src/types';

vi.mock('../../src/lib/dataClient', () => ({
  dataClient: {
    getRecipe: vi.fn(),
  },
}));

vi.mock('echarts-for-react', () => ({
  default: () => <div data-testid="echarts-mock" />,
}));

import { dataClient } from '../../src/lib/dataClient';
import RecipeDetail from '../../src/pages/RecipeDetail';

const mockClient = vi.mocked(dataClient);

const mockRecipe: RecipeReport = {
  recipeId: 'io.jenkins.tools.pluginmodernizer.AddCodeOwner',
  totalApplications: 13,
  successCount: 11,
  failureCount: 1,
  plugins: [
    { pluginName: 'build-blocker-plugin', status: 'success', timestamp: '2026-01-12T17-19-54' },
    { pluginName: 'jcaptcha-plugin', status: 'success', timestamp: '2026-01-11T08-30-29' },
    { pluginName: 'probely-security', status: 'success', timestamp: '2025-09-02T15-43-31' },
    { pluginName: 'ec2-fleet', status: 'success', timestamp: '2025-07-29T16-31-26' },
    { pluginName: 'syslog-logger', status: 'fail', timestamp: '2025-07-07T08-14-40' },
    { pluginName: 'pipeline-keep-running-step', status: '', timestamp: '2025-06-24T07-19-20' },
  ],
};

const encodedId = encodeURIComponent(mockRecipe.recipeId);

function renderRecipeDetail(recipeId = encodedId) {
  return render(
    <MemoryRouter initialEntries={[`/recipes/${recipeId}`]}>
      <Routes>
        <Route path="/recipes/:id" element={<RecipeDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RecipeDetail', () => {
  it('shows skeleton while loading', () => {
    mockClient.getRecipe.mockReturnValue(new Promise(() => {}));

    renderRecipeDetail();

    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.getByText('Back to Recipes')).toBeDefined();
    console.log('  RecipeDetail : skeleton + "Back to Recipes" rendered while loading');
  });

  it('renders recipe header on successful data load', async () => {
    mockClient.getRecipe.mockResolvedValue({ ok: true, data: mockRecipe });

    renderRecipeDetail();

    await waitFor(() => {
      expect(screen.getByText('AddCodeOwner')).toBeDefined();
    });

    expect(screen.getByText('Back to Recipes')).toBeDefined();
    console.log('  RecipeDetail : short name "AddCodeOwner" and back button rendered');
  });

  it('shows full recipe ID in header', async () => {
    mockClient.getRecipe.mockResolvedValue({ ok: true, data: mockRecipe });

    renderRecipeDetail();

    await waitFor(() => {
      expect(screen.getByText('io.jenkins.tools.pluginmodernizer.AddCodeOwner')).toBeDefined();
    });
    console.log('  RecipeDetail : full recipe ID displayed');
  });

  it('shows data-load failure banner on fetch error', async () => {
    mockClient.getRecipe.mockResolvedValue({ ok: false, error: 'Network error' });

    renderRecipeDetail();

    await waitFor(() => {
      expect(screen.getByText('Unable to load recipe data')).toBeDefined();
    });

    expect(screen.getByText('Network error')).toBeDefined();
    expect(screen.getByText('Retry')).toBeDefined();
    console.log('  RecipeDetail : data-load failure banner with "Unable to load recipe data" and Retry button');
  });

  it('shows not-found message when recipe does not exist', async () => {
    mockClient.getRecipe.mockResolvedValue({ ok: true, data: null as unknown as RecipeReport });

    renderRecipeDetail(encodeURIComponent('io.jenkins.tools.pluginmodernizer.NonExistent'));

    await waitFor(() => {
      expect(screen.getByText('Recipe not found')).toBeDefined();
    });
    expect(screen.getByText('The recipe you are searching for does not exist.')).toBeDefined();
    expect(screen.queryByText('Retry')).toBeNull();
    console.log('  RecipeDetail : not-found error message displayed without Retry');
  });

  it('displays stat boxes with real AddCodeOwner values', async () => {
    mockClient.getRecipe.mockResolvedValue({ ok: true, data: mockRecipe });

    renderRecipeDetail();

    await waitFor(() => {
      expect(screen.getByText('AddCodeOwner')).toBeDefined();
    });

    const totalBox = screen.getByTestId('stat-total');
    expect(totalBox.textContent).toContain('13');
    expect(totalBox.textContent).toContain('Total');

    const successBox = screen.getByTestId('stat-success');
    expect(successBox.textContent).toContain('11');
    expect(successBox.textContent).toContain('Success');

    const failedBox = screen.getByTestId('stat-failed');
    expect(failedBox.textContent).toContain('1');
    expect(failedBox.textContent).toContain('Failed');

    const rateBox = screen.getByTestId('stat-rate');
    expect(rateBox.textContent).toContain('84.6%');
    expect(rateBox.textContent).toContain('Rate');

    console.log('  RecipeDetail : stat boxes show total=13, success=11, failed=1, rate=84.6%');
  });

  it('renders SuccessRateBadge with correct tier', async () => {
    mockClient.getRecipe.mockResolvedValue({ ok: true, data: mockRecipe });

    renderRecipeDetail();

    await waitFor(() => {
      expect(screen.getByText('High (84.6%)')).toBeDefined();
    });
    console.log('  RecipeDetail : SuccessRateBadge shows "High (84.6%)"');
  });

  it('renders charts section', async () => {
    mockClient.getRecipe.mockResolvedValue({ ok: true, data: mockRecipe });

    renderRecipeDetail();

    await waitFor(() => {
      expect(screen.getByText('AddCodeOwner')).toBeDefined();
    });

    const charts = screen.getAllByTestId('echarts-mock');
    expect(charts.length).toBeGreaterThanOrEqual(1);
    console.log('  RecipeDetail : ECharts components rendered');
  });

  it('renders Affected Plugins table', async () => {
    mockClient.getRecipe.mockResolvedValue({ ok: true, data: mockRecipe });

    renderRecipeDetail();

    await waitFor(() => {
      expect(screen.getByText(/Affected Plugins/)).toBeDefined();
    });

    expect(screen.getAllByText('build-blocker-plugin').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('syslog-logger').length).toBeGreaterThanOrEqual(1);
    console.log('  RecipeDetail : Affected Plugins table with real plugin names');
  });

  it('renders Failed Plugins breakdown when failures exist', async () => {
    mockClient.getRecipe.mockResolvedValue({ ok: true, data: mockRecipe });

    renderRecipeDetail();

    await waitFor(() => {
      expect(screen.getByText(/Failed Plugins/)).toBeDefined();
    });
    console.log('  RecipeDetail : Failed Plugins breakdown rendered');
  });

  it('hides Failed Plugins breakdown when no failures', async () => {
    const noFailRecipe: RecipeReport = {
      ...mockRecipe,
      failureCount: 0,
      plugins: mockRecipe.plugins.filter((p) => p.status !== 'fail'),
    };
    mockClient.getRecipe.mockResolvedValue({ ok: true, data: noFailRecipe });

    renderRecipeDetail();

    await waitFor(() => {
      expect(screen.getByText('AddCodeOwner')).toBeDefined();
    });

    expect(screen.queryByText(/Failed Plugins/)).toBeNull();
    console.log('  RecipeDetail : Failed Plugins breakdown hidden when no failures');
  });

  it('calls getRecipe with the decoded recipe ID', async () => {
    mockClient.getRecipe.mockResolvedValue({ ok: true, data: mockRecipe });

    renderRecipeDetail();

    await waitFor(() => {
      expect(screen.getByText('AddCodeOwner')).toBeDefined();
    });

    expect(mockClient.getRecipe).toHaveBeenCalledWith(mockRecipe.recipeId);
    console.log('  RecipeDetail : getRecipe called with decoded recipe ID');
  });

  it('decodes URL-encoded characters in the route param before calling getRecipe', async () => {
    const encodedRecipe: RecipeReport = {
      ...mockRecipe,
      recipeId: 'io.jenkins.tools.pluginmodernizer.Upgrade Parent Version',
    };
    mockClient.getRecipe.mockResolvedValue({ ok: true, data: encodedRecipe });

    const doubleEncoded = encodeURIComponent(encodeURIComponent(encodedRecipe.recipeId));
    renderRecipeDetail(doubleEncoded);

    await waitFor(() => {
      expect(mockClient.getRecipe).toHaveBeenCalled();
    });

    expect(mockClient.getRecipe).toHaveBeenCalledWith('io.jenkins.tools.pluginmodernizer.Upgrade Parent Version');
    console.log('  RecipeDetail : double-encoded route param decoded via safeDecode before calling getRecipe');
  });
});
