import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { StatusCounts } from '../../../src/types';
import PluginStatusCards from '../../../src/components/pluginList/PluginStatusCards';

const statusCounts: StatusCounts = {
  green: 12,
  red: 4,
  blue: 7,
  yellow: 3,
  white: 2,
};

describe('PluginStatusCards', () => {
  it('renders all four status cards with aria-pressed="false" when filter is "all"', () => {
    render(<PluginStatusCards statusCounts={statusCounts} activeFilter="all" onFilterChange={() => {}} />);

    for (const label of ['All Passed', 'All Failed', 'Mostly Passed', 'Mostly Failed']) {
      const btn = screen.getByText(label).closest('button');
      expect(btn).not.toBeNull();
      expect(btn?.getAttribute('aria-pressed')).toBe('false');
    }
  });

  it('exposes aria-pressed="true" only on the active status card', () => {
    render(<PluginStatusCards statusCounts={statusCounts} activeFilter="green" onFilterChange={() => {}} />);

    expect(screen.getByText('All Passed').closest('button')?.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('All Failed').closest('button')?.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByText('Mostly Passed').closest('button')?.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByText('Mostly Failed').closest('button')?.getAttribute('aria-pressed')).toBe('false');
  });

  it('calls onFilterChange with the status key when clicking an inactive card and resets to "all" when active', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <PluginStatusCards statusCounts={statusCounts} activeFilter="all" onFilterChange={onChange} />
    );

    fireEvent.click(screen.getByText('All Failed').closest('button')!);
    expect(onChange).toHaveBeenCalledWith('red');

    rerender(<PluginStatusCards statusCounts={statusCounts} activeFilter="red" onFilterChange={onChange} />);
    fireEvent.click(screen.getByText('All Failed').closest('button')!);
    expect(onChange).toHaveBeenCalledWith('all');
  });
});
