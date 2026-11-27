import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { RateTier } from '../../../src/util/recipeStatus';
import RecipeRateCards from '../../../src/components/recipeList/RecipeRateCards';

const tierCounts: Record<RateTier, number> = { high: 10, medium: 5, low: 3 };

describe('RecipeRateCards', () => {
  it('renders three tier cards with correct counts', () => {
    render(<RecipeRateCards tierCounts={tierCounts} activeFilter="all" onFilterChange={() => {}} />);
    expect(screen.getByText('10')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
    console.log(`  RecipeRateCards : three tier counts rendered (10, 5, 3)`);
  });

  it('renders tier labels without No Data', () => {
    render(<RecipeRateCards tierCounts={tierCounts} activeFilter="all" onFilterChange={() => {}} />);
    expect(screen.getByText('High Rate')).toBeDefined();
    expect(screen.getByText('Medium Rate')).toBeDefined();
    expect(screen.getByText('Low Rate')).toBeDefined();
    expect(screen.queryByText('No Data')).toBeNull();
    console.log(`  RecipeRateCards : three tier labels rendered, no "No Data" card`);
  });

  it('calls onFilterChange when a card is clicked', () => {
    const onChange = vi.fn();
    render(<RecipeRateCards tierCounts={tierCounts} activeFilter="all" onFilterChange={onChange} />);
    fireEvent.click(screen.getByText('High Rate'));
    expect(onChange).toHaveBeenCalledWith('high');
    console.log(`  RecipeRateCards : clicking "High Rate" calls onFilterChange("high")`);
  });

  it('toggles filter off when active card is clicked again', () => {
    const onChange = vi.fn();
    render(<RecipeRateCards tierCounts={tierCounts} activeFilter="high" onFilterChange={onChange} />);
    fireEvent.click(screen.getByText('High Rate'));
    expect(onChange).toHaveBeenCalledWith('all');
    console.log(`  RecipeRateCards : clicking active "High Rate" resets to "all"`);
  });

  it('exposes aria-pressed matching the active tier filter', () => {
    render(<RecipeRateCards tierCounts={tierCounts} activeFilter="high" onFilterChange={() => {}} />);

    const highBtn = screen.getByText('High Rate').closest('button');
    const mediumBtn = screen.getByText('Medium Rate').closest('button');
    const lowBtn = screen.getByText('Low Rate').closest('button');

    expect(highBtn?.getAttribute('aria-pressed')).toBe('true');
    expect(mediumBtn?.getAttribute('aria-pressed')).toBe('false');
    expect(lowBtn?.getAttribute('aria-pressed')).toBe('false');
  });
});
