import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Layout from '../../src/components/Layout';

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

  it('marks only Dashboard as active on the root route', () => {
    renderLayout('/');

    const dashboard = screen.getByRole('link', { name: 'Dashboard' });
    const plugins = screen.getByRole('link', { name: 'Plugins' });
    const recipes = screen.getByRole('link', { name: 'Recipes' });

    expect(dashboard.getAttribute('aria-current')).toBe('page');
    expect(dashboard.className).toContain('Mui-selected');
    expect(plugins.getAttribute('aria-current')).toBeNull();
    expect(plugins.className).not.toContain('Mui-selected');
    expect(recipes.getAttribute('aria-current')).toBeNull();
    expect(recipes.className).not.toContain('Mui-selected');
  });

  it('marks only Plugins as active on /plugins', () => {
    renderLayout('/plugins');

    const dashboard = screen.getByRole('link', { name: 'Dashboard' });
    const plugins = screen.getByRole('link', { name: 'Plugins' });
    const recipes = screen.getByRole('link', { name: 'Recipes' });

    expect(plugins.getAttribute('aria-current')).toBe('page');
    expect(plugins.className).toContain('Mui-selected');
    expect(dashboard.getAttribute('aria-current')).toBeNull();
    expect(recipes.getAttribute('aria-current')).toBeNull();
  });

  it('marks only Recipes as active on /recipes', () => {
    renderLayout('/recipes');

    const dashboard = screen.getByRole('link', { name: 'Dashboard' });
    const plugins = screen.getByRole('link', { name: 'Plugins' });
    const recipes = screen.getByRole('link', { name: 'Recipes' });

    expect(recipes.getAttribute('aria-current')).toBe('page');
    expect(recipes.className).toContain('Mui-selected');
    expect(dashboard.getAttribute('aria-current')).toBeNull();
    expect(plugins.getAttribute('aria-current')).toBeNull();
  });

  it('highlights Plugins and sets aria-current="page" on nested plugin detail routes', () => {
    renderLayout('/plugins/git-client');

    const dashboard = screen.getByRole('link', { name: 'Dashboard' });
    const plugins = screen.getByRole('link', { name: 'Plugins' });
    const recipes = screen.getByRole('link', { name: 'Recipes' });

    expect(plugins.getAttribute('aria-current')).toBe('page');
    expect(plugins.className).toContain('Mui-selected');
    expect(dashboard.getAttribute('aria-current')).toBeNull();
    expect(dashboard.className).not.toContain('Mui-selected');
    expect(recipes.getAttribute('aria-current')).toBeNull();
    expect(recipes.className).not.toContain('Mui-selected');
  });

  it('highlights Recipes and sets aria-current="page" on nested recipe detail routes', () => {
    renderLayout('/recipes/io.jenkins.tools.pluginmodernizer.SetupJenkinsfile');

    const dashboard = screen.getByRole('link', { name: 'Dashboard' });
    const plugins = screen.getByRole('link', { name: 'Plugins' });
    const recipes = screen.getByRole('link', { name: 'Recipes' });

    expect(recipes.getAttribute('aria-current')).toBe('page');
    expect(recipes.className).toContain('Mui-selected');
    expect(dashboard.getAttribute('aria-current')).toBeNull();
    expect(plugins.getAttribute('aria-current')).toBeNull();
  });

  it('does not activate any navigation item on unknown or prefix-colliding routes', () => {
    const { unmount } = renderLayout('/unknown-page');

    for (const label of ['Dashboard', 'Plugins', 'Recipes']) {
      const link = screen.getByRole('link', { name: label });
      expect(link.getAttribute('aria-current')).toBeNull();
      expect(link.className).not.toContain('Mui-selected');
    }

    unmount();

    renderLayout('/plugins-extra');
    for (const label of ['Dashboard', 'Plugins', 'Recipes']) {
      const link = screen.getByRole('link', { name: label });
      expect(link.getAttribute('aria-current')).toBeNull();
      expect(link.className).not.toContain('Mui-selected');
    }
  });

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
