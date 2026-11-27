import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FailedMigrationsExport from '../../../src/components/pluginDetail/FailedMigrationsExport';

vi.mock('../../../src/hooks/useMetadata', () => ({
  useFailedMigrations: vi.fn(),
}));

import { useFailedMigrations } from '../../../src/hooks/useMetadata';

const mockUseFailedMigrations = vi.mocked(useFailedMigrations);

describe('FailedMigrationsExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when failCount is 0', () => {
    mockUseFailedMigrations.mockReturnValue({ data: null, error: null, loading: false });

    const { container } = render(<FailedMigrationsExport pluginName="git-client" failCount={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows a loading spinner and disables download while loading', () => {
    mockUseFailedMigrations.mockReturnValue({ data: null, error: null, loading: true });

    render(<FailedMigrationsExport pluginName="testfairy" failCount={3} />);

    expect(screen.getByText('Failed Migrations Export')).toBeDefined();
    expect(screen.getByText('3 failed migrations available for download')).toBeDefined();
    expect(screen.getByRole('progressbar')).toBeDefined();
    const button = screen.getByRole('button', { name: 'Download CSV' });
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('uses singular label when failCount is 1 and triggers CSV download on click', () => {
    const csv = 'migrationId,migrationName\nio.jenkins.SetupJenkinsfile,SetupJenkinsfile';
    mockUseFailedMigrations.mockReturnValue({ data: csv, error: null, loading: false });

    const createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<FailedMigrationsExport pluginName="absint-a3" failCount={1} />);

    expect(screen.getByText('1 failed migration available for download')).toBeDefined();
    const button = screen.getByRole('button', { name: 'Download CSV' });
    expect(button.hasAttribute('disabled')).toBe(false);

    fireEvent.click(button);

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it('keeps download button disabled when CSV data is empty without an error', () => {
    mockUseFailedMigrations.mockReturnValue({ data: '', error: null, loading: false });

    render(<FailedMigrationsExport pluginName="testfairy" failCount={2} />);

    const button = screen.getByRole('button', { name: 'Download CSV' });
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('displays an accessible error alert and disables download when useFailedMigrations fails', () => {
    mockUseFailedMigrations.mockReturnValue({
      data: null,
      error: 'HTTP 500: Internal Server Error',
      loading: false,
    });

    render(<FailedMigrationsExport pluginName="testfairy" failCount={3} />);

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Unable to prepare CSV export');
    expect(alert.textContent).toContain('HTTP 500: Internal Server Error');

    const button = screen.getByRole('button', { name: 'Download CSV' });
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('clears the error alert and enables download after recovering to valid CSV data', () => {
    mockUseFailedMigrations.mockReturnValue({
      data: null,
      error: 'Network timeout',
      loading: false,
    });

    const { rerender } = render(<FailedMigrationsExport pluginName="testfairy" failCount={2} />);
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Download CSV' }).hasAttribute('disabled')).toBe(true);

    mockUseFailedMigrations.mockReturnValue({
      data: 'migrationId\nSetupJenkinsfile',
      error: null,
      loading: false,
    });
    rerender(<FailedMigrationsExport pluginName="testfairy" failCount={2} />);

    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('button', { name: 'Download CSV' }).hasAttribute('disabled')).toBe(false);
  });
});
