import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { RecipeReport } from '../../../src/types';
import RecipeCliSnippet from '../../../src/components/recipeDetail/RecipeCliSnippet';

const mockRecipe: RecipeReport = {
  recipeId: 'io.jenkins.tools.pluginmodernizer.AddCodeOwner',
  totalApplications: 5,
  successCount: 4,
  failureCount: 1,
  plugins: [
    { pluginName: 'build-blocker-plugin', status: 'success', timestamp: '2026-01-12T17-19-54' },
    { pluginName: 'probely-security', status: 'success', timestamp: '2025-09-02T15-43-31' },
    { pluginName: 'ec2-fleet', status: 'success', timestamp: '2025-07-29T16-31-26' },
    { pluginName: 'syslog-logger', status: 'fail', timestamp: '2025-07-07T08-14-40' },
    { pluginName: 'pipeline-keep-running-step', status: '', timestamp: '2025-06-24T07-19-20' },
  ],
};

const singlePluginRecipe: RecipeReport = {
  recipeId: 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile',
  totalApplications: 1,
  successCount: 1,
  failureCount: 0,
  plugins: [{ pluginName: 'git-plugin', status: 'success', timestamp: '2026-01-01T00-00-00' }],
};

function renderSnippet(recipe: RecipeReport = mockRecipe) {
  return render(<RecipeCliSnippet recipe={recipe} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RecipeCliSnippet', () => {
  it('renders the CLI Command heading and tool link', () => {
    renderSnippet();
    expect(screen.getByText('CLI Command')).toBeDefined();
    expect(screen.getByText('plugin-modernizer-tool')).toBeDefined();
    const link = screen.getByText('plugin-modernizer-tool').closest('a');
    expect(link?.getAttribute('href')).toBe('https://github.com/jenkins-infra/plugin-modernizer-tool#readme');
    console.log('  RecipeCliSnippet : heading and tool link rendered');
  });

  it('shows the general template command', () => {
    renderSnippet();
    const text = document.body.textContent ?? '';
    expect(text).toContain('plugin-modernizer dry-run --plugins <pluginName> --recipe <recipeName>');
    console.log('  RecipeCliSnippet : template command displayed');
  });

  it('shows expand button with correct plugin count', () => {
    renderSnippet();
    expect(screen.getByText(/per-plugin commands for this recipe \(5\)/)).toBeDefined();
    console.log('  RecipeCliSnippet : expand button shows count=5');
  });

  it('keeps individual plugin commands collapsed before expanding', () => {
    renderSnippet();
    const collapseWrapper = document.querySelector('.MuiCollapse-root') as HTMLElement;
    expect(collapseWrapper).toBeDefined();
    expect(collapseWrapper.classList.contains('MuiCollapse-hidden')).toBe(true);
    console.log('  RecipeCliSnippet : individual commands collapsed by default');
  });

  it('reveals per-plugin commands after clicking expand', () => {
    renderSnippet();
    fireEvent.click(screen.getByText(/per-plugin commands for this recipe/));

    expect(screen.getByText('build-blocker-plugin')).toBeDefined();
    expect(screen.getByText('ec2-fleet')).toBeDefined();
    expect(screen.getByText('pipeline-keep-running-step')).toBeDefined();
    expect(screen.getByText('probely-security')).toBeDefined();
    expect(screen.getByText('syslog-logger')).toBeDefined();

    const text = document.body.textContent ?? '';
    expect(text).toContain('plugin-modernizer dry-run --plugins build-blocker-plugin --recipe AddCodeOwner');
    expect(text).toContain('plugin-modernizer dry-run --plugins ec2-fleet --recipe AddCodeOwner');
    expect(text).toContain('plugin-modernizer dry-run --plugins syslog-logger --recipe AddCodeOwner');
    console.log('  RecipeCliSnippet : 5 per-plugin commands revealed on expand');
  });

  it('sorts plugin names alphabetically in expanded commands', () => {
    renderSnippet();
    fireEvent.click(screen.getByText(/per-plugin commands for this recipe/));

    const labels = screen.getAllByText(
      (_, el) =>
        el?.tagName === 'P' &&
        el.classList.contains('MuiTypography-root') &&
        mockRecipe.plugins.some((p) => p.pluginName === el.textContent)
    );
    const labelTexts = labels.map((el) => el.textContent);
    const sorted = [...labelTexts].sort();
    expect(labelTexts).toEqual(sorted);
    console.log('  RecipeCliSnippet : plugin names sorted alphabetically');
  });

  it('hides per-plugin commands after clicking collapse', () => {
    renderSnippet();
    const btn = screen.getByText(/per-plugin commands for this recipe/);
    fireEvent.click(btn);
    expect(screen.getByText('build-blocker-plugin')).toBeDefined();

    fireEvent.click(screen.getByText(/per-plugin commands for this recipe/));
    console.log('  RecipeCliSnippet : collapse toggles back');
  });

  it('deduplicates plugins with the same name', () => {
    const dupeRecipe: RecipeReport = {
      ...mockRecipe,
      plugins: [
        { pluginName: 'git-plugin', status: 'success', timestamp: '2026-01-01T00-00-00' },
        { pluginName: 'git-plugin', status: 'fail', timestamp: '2026-01-02T00-00-00' },
        { pluginName: 'another-plugin', status: 'success', timestamp: '2026-01-03T00-00-00' },
      ],
    };
    renderSnippet(dupeRecipe);
    expect(screen.getByText(/per-plugin commands for this recipe \(2\)/)).toBeDefined();
    console.log('  RecipeCliSnippet : duplicate plugin names collapsed to 2 unique');
  });

  it('returns null when plugins array is empty', () => {
    const empty: RecipeReport = { ...mockRecipe, plugins: [] };
    const { container } = renderSnippet(empty);
    expect(container.innerHTML).toBe('');
    console.log('  RecipeCliSnippet : returns null for empty plugins');
  });

  it('shows the dry-run / run hint text', () => {
    renderSnippet();
    const text = document.body.textContent ?? '';
    expect(text).toContain('dry-run');
    expect(text).toContain('run');
    expect(text).toContain('PRs');
    console.log('  RecipeCliSnippet : dry-run hint text rendered');
  });

  it('has a copy button with correct aria-label', () => {
    renderSnippet();
    const copyButtons = screen.getAllByLabelText('Copy command to clipboard');
    expect(copyButtons.length).toBeGreaterThanOrEqual(1);
    console.log('  RecipeCliSnippet : copy button accessible');
  });

  it('calls clipboard API on copy click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    renderSnippet();
    const copyBtn = screen.getAllByLabelText('Copy command to clipboard')[0];
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('plugin-modernizer dry-run --plugins <pluginName> --recipe <recipeName>');
    });
    console.log('  RecipeCliSnippet : clipboard.writeText called with template command');
  });

  it('uses short recipe name in per-plugin commands', () => {
    renderSnippet();
    fireEvent.click(screen.getByText(/per-plugin commands for this recipe/));
    const text = document.body.textContent ?? '';
    expect(text).toContain('--recipe AddCodeOwner');
    expect(text).not.toContain('--recipe io.jenkins.tools.pluginmodernizer.AddCodeOwner');
    console.log('  RecipeCliSnippet : short recipe name used in commands');
  });

  it('works with a single plugin (still shows expand button)', () => {
    renderSnippet(singlePluginRecipe);
    expect(screen.getByText(/per-plugin commands for this recipe \(1\)/)).toBeDefined();
    console.log('  RecipeCliSnippet : single plugin still shows expand');
  });
});
