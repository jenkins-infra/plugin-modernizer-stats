import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RecipeSearchBar from '../../../src/components/recipeList/RecipeSearchBar';

describe('RecipeSearchBar', () => {
  it('renders search input with placeholder', () => {
    render(
      <RecipeSearchBar search="" onSearchChange={() => {}} tierFilter="all" onClearFilter={() => {}} resultCount={20} />
    );
    expect(screen.getByPlaceholderText('Search a recipe…')).toBeDefined();
    console.log(`  RecipeSearchBar : search input with placeholder rendered`);
  });

  it('displays result count', () => {
    render(
      <RecipeSearchBar search="" onSearchChange={() => {}} tierFilter="all" onClearFilter={() => {}} resultCount={15} />
    );
    expect(screen.getByText('15 results')).toBeDefined();
    console.log(`  RecipeSearchBar : "15 results" displayed`);
  });

  it('displays singular "result" when count is 1', () => {
    render(
      <RecipeSearchBar search="" onSearchChange={() => {}} tierFilter="all" onClearFilter={() => {}} resultCount={1} />
    );
    expect(screen.getByText('1 result')).toBeDefined();
    console.log(`  RecipeSearchBar : "1 result" (singular) displayed`);
  });

  it('calls onSearchChange when typing', () => {
    const onChange = vi.fn();
    render(
      <RecipeSearchBar search="" onSearchChange={onChange} tierFilter="all" onClearFilter={() => {}} resultCount={0} />
    );
    fireEvent.change(screen.getByPlaceholderText('Search a recipe…'), {
      target: { value: 'Setup' },
    });
    expect(onChange).toHaveBeenCalledWith('Setup');
    console.log(`  RecipeSearchBar : typing "Setup" triggers onSearchChange`);
  });

  it('shows tier filter chip when tierFilter is not "all"', () => {
    render(
      <RecipeSearchBar
        search=""
        onSearchChange={() => {}}
        tierFilter="high"
        onClearFilter={() => {}}
        resultCount={10}
      />
    );
    expect(screen.getByText('High Rate')).toBeDefined();
    expect(screen.getByText('✕')).toBeDefined();
    console.log(`  RecipeSearchBar : "High Rate" chip with dismiss rendered`);
  });

  it('hides tier filter chip when tierFilter is "all"', () => {
    render(
      <RecipeSearchBar search="" onSearchChange={() => {}} tierFilter="all" onClearFilter={() => {}} resultCount={10} />
    );
    expect(screen.queryByText('High Rate')).toBeNull();
    console.log(`  RecipeSearchBar : no filter chip when tierFilter="all"`);
  });

  it('calls onClearFilter when chip dismiss is clicked', () => {
    const onClear = vi.fn();
    render(
      <RecipeSearchBar
        search=""
        onSearchChange={() => {}}
        tierFilter="medium"
        onClearFilter={onClear}
        resultCount={5}
      />
    );
    fireEvent.click(screen.getByText('✕').closest('button')!);
    expect(onClear).toHaveBeenCalled();
    console.log(`  RecipeSearchBar : clicking dismiss calls onClearFilter`);
  });

  it('renders search clear button when search is non-empty and triggers onSearchChange("") when clicked', () => {
    const onSearchChange = vi.fn();
    render(
      <RecipeSearchBar
        search="Setup"
        onSearchChange={onSearchChange}
        tierFilter="all"
        onClearFilter={() => {}}
        resultCount={5}
      />
    );

    const clearButton = screen.getByRole('button', { name: 'Clear search input' });
    expect(clearButton).toBeDefined();

    fireEvent.click(clearButton);
    expect(onSearchChange).toHaveBeenCalledWith('');
    console.log(`  RecipeSearchBar : clicking clear input button triggers onSearchChange("")`);
  });
});
