import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Migration } from '../../../src/types';
import MigrationTable from '../../../src/components/pluginDetail/MigrationTable';

function m(status: Migration['migrationStatus'], name: string, ts: string, extras?: Partial<Migration>): Migration {
  return {
    pluginVersion: '1.0',
    migrationName: name,
    migrationId: `io.jenkins.tools.pluginmodernizer.${name}`,
    migrationStatus: status,
    key: `${ts}.json`,
    timestamp: ts,
    ...extras,
  };
}

const migrations: Migration[] = [
  m('success', 'SetupJenkinsfile', '2025-09-03T07-37-22', {
    pullRequestUrl: 'https://github.com/test/pull/1',
    pullRequestStatus: 'merged',
    additions: 10,
    deletions: 2,
    migrationDescription: 'Setup the Jenkinsfile',
    tags: ['chore'],
    defaultBranch: 'master',
  }),
  m('fail', 'MigrateToJUnit5', '2025-09-02T14-34-52', {
    migrationDescription: 'Migrate tests to JUnit5.',
    tags: ['testing'],
  }),
  m('success', 'SetupDependabot', '2025-07-23T08-03-50'),
];

function renderTable(data: Migration[] = migrations) {
  return render(
    <MemoryRouter>
      <MigrationTable migrations={data} />
    </MemoryRouter>
  );
}

describe('MigrationTable (card-based)', () => {
  it('renders all migration cards', () => {
    renderTable();
    expect(screen.getByText('SetupJenkinsfile')).toBeDefined();
    expect(screen.getByText('MigrateToJUnit5')).toBeDefined();
    expect(screen.getByText('SetupDependabot')).toBeDefined();
  });

  it('shows "No migration data available" for empty migrations', () => {
    renderTable([]);
    expect(screen.getByText('No migration data available')).toBeDefined();
  });

  it('renders section title with count', () => {
    renderTable();
    expect(screen.getByText('Migration History (3)')).toBeDefined();
  });

  it('sorts cards by date descending (newest first)', () => {
    const { container } = renderTable();
    const allText = container.textContent ?? '';
    const setupIdx = allText.indexOf('SetupJenkinsfile');
    const migrateIdx = allText.indexOf('MigrateToJUnit5');
    const dependabotIdx = allText.indexOf('SetupDependabot');
    expect(setupIdx).toBeLessThan(migrateIdx);
    expect(migrateIdx).toBeLessThan(dependabotIdx);
  });

  it('renders migration description when present', () => {
    renderTable();
    expect(screen.getByText('Setup the Jenkinsfile')).toBeDefined();
    expect(screen.getByText('Migrate tests to JUnit5.')).toBeDefined();
  });

  it('renders View PR button when pullRequestUrl exists', () => {
    renderTable();
    const viewPrButtons = screen.getAllByText('View PR');
    expect(viewPrButtons.length).toBeGreaterThanOrEqual(1);
    expect(viewPrButtons[0].closest('a')?.getAttribute('href')).toBe('https://github.com/test/pull/1');
  });

  it('shows "No PR created" when no pullRequestUrl', () => {
    renderTable([m('fail', 'NoPR', '2025-01-01T00-00-00')]);
    expect(screen.getByText('No PR created')).toBeDefined();
  });

  it('renders tags as chips in migration cards', () => {
    renderTable();
    expect(screen.getByText('chore')).toBeDefined();
    expect(screen.getByText('testing')).toBeDefined();
  });

  it('shows diff stats when present', () => {
    renderTable();
    expect(screen.getByText('+10 -2 0 files')).toBeDefined();
  });

  it('renders full migration ID', () => {
    renderTable();
    expect(screen.getByText('io.jenkins.tools.pluginmodernizer.SetupJenkinsfile')).toBeDefined();
  });

  it('shows a distinct icon per outcome and does not mark missing status as failed', () => {
    renderTable([
      m('success', 'A', '2025-09-03T07-37-22'),
      m('fail', 'B', '2025-09-02T07-37-22'),
      m(undefined, 'C', '2025-05-01T07-37-22'),
    ]);
    expect(screen.getAllByTestId('CheckCircleOutlinedIcon')).toHaveLength(1);
    expect(screen.getAllByTestId('CancelOutlinedIcon')).toHaveLength(1);
    expect(screen.getAllByTestId('HelpOutlineOutlinedIcon')).toHaveLength(1);
  });
});
