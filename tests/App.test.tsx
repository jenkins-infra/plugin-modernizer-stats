import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

vi.mock('../src/pages/Dashboard', () => ({ default: () => <div>dashboard page</div> }));
vi.mock('../src/pages/PluginList', () => ({
  default: () => {
    throw new Error('render failure');
  },
}));

describe('App error boundary', () => {
  it('clears the error screen after navigating to another page', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    window.history.pushState({}, '', `${import.meta.env.BASE_URL}plugins`);

    render(<App />);
    expect(await screen.findByText('Something went wrong')).toBeDefined();

    fireEvent.click(screen.getByText('Dashboard'));
    expect(await screen.findByText('dashboard page')).toBeDefined();
    expect(screen.queryByText('Something went wrong')).toBeNull();
  });
});
