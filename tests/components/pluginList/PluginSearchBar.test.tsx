import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PluginSearchBar from '../../../src/components/pluginList/PluginSearchBar';

describe('PluginSearchBar', () => {
  it('renders search input with placeholder', () => {
    render(
      <PluginSearchBar
        search=""
        onSearchChange={() => {}}
        statusFilter="all"
        onClearFilter={() => {}}
        resultCount={42}
      />
    );
    expect(screen.getByPlaceholderText('Search a plugin…')).toBeDefined();
    console.log(`  PluginSearchBar : search input with placeholder rendered`);
  });

  it('displays result count correctly', () => {
    render(
      <PluginSearchBar
        search=""
        onSearchChange={() => {}}
        statusFilter="all"
        onClearFilter={() => {}}
        resultCount={42}
      />
    );
    expect(screen.getByText('42 results')).toBeDefined();
    console.log(`  PluginSearchBar : "42 results" displayed`);
  });

  it('displays singular "result" when count is 1', () => {
    render(
      <PluginSearchBar
        search=""
        onSearchChange={() => {}}
        statusFilter="all"
        onClearFilter={() => {}}
        resultCount={1}
      />
    );
    expect(screen.getByText('1 result')).toBeDefined();
    console.log(`  PluginSearchBar : "1 result" (singular) displayed`);
  });

  it('calls onSearchChange when typing in search input', () => {
    const onChange = vi.fn();
    render(
      <PluginSearchBar
        search=""
        onSearchChange={onChange}
        statusFilter="all"
        onClearFilter={() => {}}
        resultCount={0}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('Search a plugin…'), {
      target: { value: 'git' },
    });
    expect(onChange).toHaveBeenCalledWith('git');
    console.log(`  PluginSearchBar : typing "git" triggers onSearchChange`);
  });

  it('shows status filter chip when statusFilter is not "all"', () => {
    render(
      <PluginSearchBar
        search=""
        onSearchChange={() => {}}
        statusFilter="green"
        onClearFilter={() => {}}
        resultCount={10}
      />
    );
    expect(screen.getByText('All Passed')).toBeDefined();
    expect(screen.getByText('✕')).toBeDefined();
    console.log(`  PluginSearchBar : "All Passed" status chip rendered`);
  });

  it('calls onClearFilter when status filter chip dismiss is clicked', () => {
    const onClear = vi.fn();
    render(
      <PluginSearchBar search="" onSearchChange={() => {}} statusFilter="red" onClearFilter={onClear} resultCount={5} />
    );
    fireEvent.click(screen.getByText('✕').closest('button')!);
    expect(onClear).toHaveBeenCalled();
    console.log(`  PluginSearchBar : clicking status filter dismiss calls onClearFilter`);
  });

  it('renders search clear button when search is non-empty and triggers onSearchChange("") when clicked', () => {
    const onSearchChange = vi.fn();
    render(
      <PluginSearchBar
        search="git"
        onSearchChange={onSearchChange}
        statusFilter="all"
        onClearFilter={() => {}}
        resultCount={5}
      />
    );

    const clearButton = screen.getByRole('button', { name: 'Clear search input' });
    expect(clearButton).toBeDefined();

    fireEvent.click(clearButton);
    expect(onSearchChange).toHaveBeenCalledWith('');
    console.log(`  PluginSearchBar : clicking clear input button triggers onSearchChange("")`);
  });
});
