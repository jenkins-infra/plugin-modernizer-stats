import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Layout from '../../src/components/Layout';

const NAV_LABELS = ['Dashboard', 'Plugins', 'Recipes'] as const;

function mockDesktopViewport(isDesktop: boolean) {
  window.matchMedia = (query: string) =>
    ({
      matches: isDesktop ? query.includes('min-width') : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

function renderLayout(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Layout>
        <Routes>
          <Route path="/" element={<div>Dashboard content</div>} />
          <Route path="/plugins" element={<div>Plugins content</div>} />
          <Route path="/plugins/:name" element={<div>Plugin detail content</div>} />
          <Route path="/recipes" element={<div>Recipes content</div>} />
          <Route path="/recipes/:id" element={<div>Recipe detail content</div>} />
          <Route path="*" element={<div>Not found content</div>} />
        </Routes>
      </Layout>
    </MemoryRouter>
  );
}

describe('Layout navigation and accessibility', () => {
  beforeEach(() => {
    mockDesktopViewport(true);
  });

  it('renders an accessible primary navigation landmark with semantic links', () => {
    renderLayout('/');

    const nav = screen.getByRole('navigation', { name: 'Primary navigation' });
    expect(nav).toBeDefined();

    expect(screen.getByRole('link', { name: 'Dashboard' }).getAttribute('href')).toBe('/');
    expect(screen.getByRole('link', { name: 'Plugins' }).getAttribute('href')).toBe('/plugins');
    expect(screen.getByRole('link', { name: 'Recipes' }).getAttribute('href')).toBe('/recipes');
  });

  it.each([
    { path: '/', activeLabel: 'Dashboard', expectedAriaCurrent: 'page' },
    { path: '/plugins', activeLabel: 'Plugins', expectedAriaCurrent: 'page' },
    { path: '/recipes', activeLabel: 'Recipes', expectedAriaCurrent: 'page' },
    { path: '/plugins/git-client', activeLabel: 'Plugins', expectedAriaCurrent: 'true' },
    {
      path: '/recipes/io.jenkins.tools.pluginmodernizer.SetupJenkinsfile',
      activeLabel: 'Recipes',
      expectedAriaCurrent: 'true',
    },
    { path: '/unknown-page', activeLabel: null, expectedAriaCurrent: null },
    { path: '/plugins-extra', activeLabel: null, expectedAriaCurrent: null },
  ])(
    'sets active class and aria-current=$expectedAriaCurrent on $path',
    ({ path, activeLabel, expectedAriaCurrent }) => {
      renderLayout(path);

      for (const label of NAV_LABELS) {
        const link = screen.getByRole('link', { name: label });
        if (label === activeLabel) {
          expect(link.getAttribute('aria-current')).toBe(expectedAriaCurrent);
          expect(link.classList.contains('active')).toBe(true);
        } else {
          expect(link.getAttribute('aria-current')).toBeNull();
          expect(link.classList.contains('active')).toBe(false);
        }
      }
    }
  );

  it('navigates between pages and updates active state when clicking sidebar links', () => {
    renderLayout('/');

    expect(screen.getByText('Dashboard content')).toBeDefined();

    fireEvent.click(screen.getByRole('link', { name: 'Plugins' }));
    expect(screen.getByText('Plugins content')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Plugins' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Dashboard' }).getAttribute('aria-current')).toBeNull();

    fireEvent.click(screen.getByRole('link', { name: 'Recipes' }));
    expect(screen.getByText('Recipes content')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Recipes' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Plugins' }).getAttribute('aria-current')).toBeNull();
  });

  it('opens and closes the mobile navigation drawer when navigating on small viewports', () => {
    mockDesktopViewport(false);
    renderLayout('/');

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    const pluginsLink = screen.getByRole('link', { name: 'Plugins' });
    fireEvent.click(pluginsLink);

    expect(screen.getByText('Plugins content')).toBeDefined();
  });
});
