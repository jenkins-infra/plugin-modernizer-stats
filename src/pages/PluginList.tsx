import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAllPlugins } from '../hooks/useMetadata';
import { deriveStatus } from '../util/pluginStatus';
import { colors } from '../theme';
import type { PluginReport, PluginStatusColor } from '../types';
import { SkeletonList } from '../components/common/Skeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import PluginStatusCards from '../components/pluginList/PluginStatusCards';
import PluginSearchBar from '../components/pluginList/PluginSearchBar';
import PluginVirtualList from '../components/pluginList/PluginVirtualList';

type FilterKey = 'all' | PluginStatusColor;

function countByStatus(plugins: PluginReport[]) {
  const counts = { green: 0, red: 0, blue: 0, yellow: 0, white: 0 };
  for (const p of plugins) {
    counts[deriveStatus(p.migrations)]++;
  }
  return counts;
}

export default function PluginList() {
  const { data: plugins, error, loading } = useAllPlugins();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterKey>('all');

  const filtered = useMemo(() => {
    if (!plugins) return [];
    const needle = search.toLowerCase();
    return plugins.filter((p) => {
      if (needle && !p.pluginName.toLowerCase().includes(needle)) return false;
      if (statusFilter !== 'all' && deriveStatus(p.migrations) !== statusFilter) return false;
      return true;
    });
  }, [plugins, search, statusFilter]);

  const statusCounts = useMemo(() => (plugins ? countByStatus(plugins) : null), [plugins]);

  const clearAll = () => {
    setSearch('');
    setStatusFilter('all');
  };

  if (loading) return <SkeletonList />;
  if (error)
    return (
      <ErrorBanner
        title="Unable to fetch data"
        message="The plugin list could not be loaded."
        onRetry={() => window.location.reload()}
      />
    );

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: { xs: 1.5, sm: 2.5 }, overflow: 'hidden' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: colors.text.dark, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Plugins
        </Typography>
        {plugins && (
          <Typography
            component="span"
            sx={{ color: colors.text.muted, fontSize: { xs: '0.85rem', sm: '1rem' }, fontWeight: 500 }}
          >
            {plugins.length} total
          </Typography>
        )}
      </Box>

      {statusCounts && (
        <PluginStatusCards statusCounts={statusCounts} activeFilter={statusFilter} onFilterChange={setStatusFilter} />
      )}

      <PluginSearchBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onClearFilter={() => setStatusFilter('all')}
        resultCount={filtered.length}
      />

      <PluginVirtualList plugins={filtered} onClearFilters={clearAll} />
    </Box>
  );
}
