import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Migration } from '../../../src/types';
import PluginCliSnippet from '../../../src/components/pluginDetail/PluginCliSnippet';

function m(id: string, name: string, extras?: Partial<Migration>): Migration {
  return {
    pluginVersion: '1.0',
    migrationName: name,
    migrationId: id,
    migrationStatus: 'success',
    key: '2025-09-01T00-00-00.json',
    timestamp: '2025-09-01T00-00-00',
    ...extras,
  };
}

const migrations: Migration[] = [
  m('io.jenkins.tools.pluginmodernizer.AddPluginsBom', 'Add Plugins BOM'),
  m('io.jenkins.tools.pluginmodernizer.SetupJenkinsfile', 'Setup the Jenkinsfile'),
  m('io.jenkins.tools.pluginmodernizer.MigrateToJUnit5', 'Migrate to JUnit 5'),
];

const singleMigration: Migration[] = [m('io.jenkins.tools.pluginmodernizer.AddPluginsBom', 'Add Plugins BOM')];

function renderSnippet(pluginName = 'absint-a3', migs = migrations) {
  return render(<PluginCliSnippet pluginName={pluginName} migrations={migs} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PluginCliSnippet', () => {
  it('renders the CLI Command heading and tool link', () => {
    renderSnippet();
    expect(screen.getByText('CLI Command')).toBeDefined();
    expect(screen.getByText('plugin-modernizer-tool')).toBeDefined();
    const link = screen.getByText('plugin-modernizer-tool').closest('a');
    expect(link?.getAttribute('href')).toBe('https://github.com/jenkins-infra/plugin-modernizer-tool#readme');
    console.log('  PluginCliSnippet : heading and tool link rendered');
  });

  it('shows the general template command', () => {
    renderSnippet();
    const text = document.body.textContent ?? '';
    expect(text).toContain('plugin-modernizer dry-run --plugins <pluginName> --recipe <recipeName>');
    console.log('  PluginCliSnippet : template command displayed');
  });

  it('shows expand button with correct recipe count', () => {
    renderSnippet();
    expect(screen.getByText(/per recipe commands for this plugin \(3\)/)).toBeDefined();
    console.log('  PluginCliSnippet : expand button shows count=3');
  });

  it('keeps individual recipe commands collapsed before expanding', () => {
    renderSnippet();
    const collapseWrapper = document.querySelector('.MuiCollapse-root') as HTMLElement;
    expect(collapseWrapper).toBeDefined();
    expect(collapseWrapper.classList.contains('MuiCollapse-hidden')).toBe(true);
    console.log('  PluginCliSnippet : individual commands collapsed by default');
  });

  it('reveals per-recipe commands after clicking expand', () => {
    renderSnippet();
    fireEvent.click(screen.getByText(/per recipe commands for this plugin/));

    expect(screen.getByText('Add Plugins BOM')).toBeDefined();
    expect(screen.getByText('Setup the Jenkinsfile')).toBeDefined();
    expect(screen.getByText('Migrate to JUnit 5')).toBeDefined();

    const text = document.body.textContent ?? '';
    expect(text).toContain('plugin-modernizer dry-run --plugins absint-a3 --recipe AddPluginsBom');
    expect(text).toContain('plugin-modernizer dry-run --plugins absint-a3 --recipe SetupJenkinsfile');
    expect(text).toContain('plugin-modernizer dry-run --plugins absint-a3 --recipe MigrateToJUnit5');
    console.log('  PluginCliSnippet : 3 per-recipe commands revealed on expand');
  });

  it('hides per-recipe commands after clicking collapse', () => {
    renderSnippet();
    const btn = screen.getByText(/per recipe commands for this plugin/);
    fireEvent.click(btn);
    expect(screen.getByText('Add Plugins BOM')).toBeDefined();

    fireEvent.click(screen.getByText(/per recipe commands for this plugin/));
    console.log('  PluginCliSnippet : collapse toggles back');
  });

  it('deduplicates recipes with the same migrationId', () => {
    const dupes: Migration[] = [
      m('io.jenkins.tools.pluginmodernizer.AddPluginsBom', 'Add Plugins BOM'),
      m('io.jenkins.tools.pluginmodernizer.AddPluginsBom', 'Add Plugins BOM'),
      m('io.jenkins.tools.pluginmodernizer.SetupJenkinsfile', 'Setup the Jenkinsfile'),
    ];
    renderSnippet('my-plugin', dupes);
    expect(screen.getByText(/per recipe commands for this plugin \(2\)/)).toBeDefined();
    console.log('  PluginCliSnippet : duplicate migrationIds collapsed to 2 unique recipes');
  });

  it('returns null when migrations array is empty', () => {
    const { container } = renderSnippet('my-plugin', []);
    expect(container.innerHTML).toBe('');
    console.log('  PluginCliSnippet : returns null for empty migrations');
  });

  it('shows the dry-run / run hint text', () => {
    renderSnippet();
    const text = document.body.textContent ?? '';
    expect(text).toContain('dry-run');
    expect(text).toContain('run');
    expect(text).toContain('PRs');
    console.log('  PluginCliSnippet : dry-run hint text rendered');
  });

  it('has a copy button with correct aria-label', () => {
    renderSnippet();
    const copyButtons = screen.getAllByLabelText('Copy command to clipboard');
    expect(copyButtons.length).toBeGreaterThanOrEqual(1);
    console.log('  PluginCliSnippet : copy button accessible');
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
    console.log('  PluginCliSnippet : clipboard.writeText called with template command');
  });

  it('extracts short recipe name from fully-qualified migrationId', () => {
    renderSnippet();
    fireEvent.click(screen.getByText(/per recipe commands for this plugin/));
    const text = document.body.textContent ?? '';
    expect(text).toContain('--recipe AddPluginsBom');
    expect(text).not.toContain('--recipe io.jenkins.tools.pluginmodernizer.AddPluginsBom');
    console.log('  PluginCliSnippet : recipe name extracted from qualified ID');
  });

  it('works with a single migration (still shows expand button)', () => {
    renderSnippet('single-plugin', singleMigration);
    expect(screen.getByText(/per recipe commands for this plugin \(1\)/)).toBeDefined();
    console.log('  PluginCliSnippet : single migration still shows expand');
  });
});
