import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StatCard from '../../../src/components/common/StatCard';

describe('StatCard', () => {
  it('renders value and label', () => {
    render(<StatCard value={431} label="Total Plugins" icon={<span>icon</span>} color="#3b82f6" />);

    expect(screen.getByText('431')).toBeDefined();
    expect(screen.getByText('Total Plugins')).toBeDefined();
    console.log('  StatCard : renders value and label');
  });

  it('renders description when provided', () => {
    render(
      <StatCard
        value="59.22%"
        label="Success Rate"
        description="Overall rate"
        icon={<span>icon</span>}
        color="#10b981"
      />
    );

    expect(screen.getByText('Overall rate')).toBeDefined();
    console.log('  StatCard : renders description');
  });

  it('renders as clickable button when onClick is provided', () => {
    const handleClick = vi.fn();
    render(<StatCard value="5" label="Active" icon={<span>icon</span>} color="#3b82f6" onClick={handleClick} />);

    const button = screen.getByRole('button');
    expect(button).toBeDefined();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
    console.log('  StatCard : clickable and fires onClick');
  });

  it('renders as non-interactive div without aria-pressed when onClick is not provided', () => {
    const { container } = render(<StatCard value="10" label="Count" icon={<span>icon</span>} color="#3b82f6" />);

    expect(screen.queryByRole('button')).toBeNull();
    expect(container.firstElementChild?.getAttribute('aria-pressed')).toBeNull();
    console.log('  StatCard : non-clickable without onClick');
  });

  it('does not set aria-pressed on a clickable button when active is undefined', () => {
    const handleClick = vi.fn();
    render(<StatCard value="5" label="Action" icon={<span>icon</span>} color="#3b82f6" onClick={handleClick} />);

    const button = screen.getByRole('button');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.getAttribute('aria-pressed')).toBeNull();
  });

  it('exposes aria-pressed="false" when inactive and aria-pressed="true" when active', () => {
    const handleClick = vi.fn();
    const { rerender } = render(
      <StatCard
        value="5"
        label="All Passed"
        icon={<span>icon</span>}
        color="#10b981"
        onClick={handleClick}
        active={false}
      />
    );

    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-pressed')).toBe('false');

    rerender(
      <StatCard
        value="5"
        label="All Passed"
        icon={<span>icon</span>}
        color="#10b981"
        onClick={handleClick}
        active={true}
      />
    );
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('supports keyboard focus and toggle state updates on click', () => {
    function StatefulToggleCard() {
      const [active, setActive] = React.useState(false);
      return (
        <StatCard
          value="5"
          label="All Passed"
          icon={<span>icon</span>}
          color="#10b981"
          active={active}
          onClick={() => setActive((prev) => !prev)}
        />
      );
    }

    render(<StatefulToggleCard />);
    const button = screen.getByRole('button');
    button.focus();
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(button);
    expect(button.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(button);
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });
});
