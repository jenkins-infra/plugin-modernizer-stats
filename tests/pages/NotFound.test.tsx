import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes, Link } from 'react-router-dom';
import NotFound from '../../src/pages/NotFound';

const DEFAULT_TITLE = 'Plugin Modernizer Stats';
const NOT_FOUND_TITLE = 'Page Not Found | Jenkins Plugin Modernizer Stats';

describe('NotFound', () => {
  beforeEach(() => {
    document.title = DEFAULT_TITLE;
  });

  it('sets document.title on mount and restores the previous title on unmount', () => {
    const { unmount } = render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText('The page you requested could not be found.')).toBeDefined();
    expect(screen.getByAltText('Jenkins page not found')).toBeDefined();
    expect(document.title).toBe(NOT_FOUND_TITLE);

    unmount();

    expect(document.title).toBe(DEFAULT_TITLE);
  });

  it('restores document.title when navigating back to the homepage', () => {
    render(
      <MemoryRouter initialEntries={['/nonexistent']}>
        <Routes>
          <Route path="/" element={<div>Home page</div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    );

    expect(document.title).toBe(NOT_FOUND_TITLE);

    fireEvent.click(screen.getByRole('link', { name: 'Back to homepage' }));

    expect(screen.getByText('Home page')).toBeDefined();
    expect(document.title).toBe(DEFAULT_TITLE);
  });

  it('handles repeated navigation to and from NotFound without losing the original title', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <span>Home page</span>
                <Link to="/missing">Go to missing</Link>
              </div>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    );

    expect(document.title).toBe(DEFAULT_TITLE);

    fireEvent.click(screen.getByRole('link', { name: 'Go to missing' }));
    expect(document.title).toBe(NOT_FOUND_TITLE);

    fireEvent.click(screen.getByRole('link', { name: 'Back to homepage' }));
    expect(document.title).toBe(DEFAULT_TITLE);

    fireEvent.click(screen.getByRole('link', { name: 'Go to missing' }));
    expect(document.title).toBe(NOT_FOUND_TITLE);

    fireEvent.click(screen.getByRole('link', { name: 'Back to homepage' }));
    expect(document.title).toBe(DEFAULT_TITLE);
  });

  it('restores a custom initial document.title on unmount', () => {
    const customTitle = 'Plugins | Plugin Modernizer Stats';
    document.title = customTitle;

    const { unmount } = render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(document.title).toBe(NOT_FOUND_TITLE);

    unmount();

    expect(document.title).toBe(customTitle);
  });

  it('does not overwrite document.title when another page updates it before unmount', () => {
    const nextPageTitle = 'Plugins | Plugin Modernizer Stats';

    const { unmount } = render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(document.title).toBe(NOT_FOUND_TITLE);

    document.title = nextPageTitle;
    unmount();

    expect(document.title).toBe(nextPageTitle);
  });
});
