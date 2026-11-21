import { useMemo, useState } from 'react';
import { Box, Typography, FormControl, Select, MenuItem } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useAllRecipes } from '../hooks/useMetadata';
import { computeSuccessRate, getRateTier, shortRecipeName } from '../util/recipeStatus';
import type { RateTier } from '../util/recipeStatus';
import type { RecipeReport } from '../types';
import { colors } from '../theme';
import { SkeletonList } from '../components/common/Skeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import RecipeRateCards from '../components/recipeList/RecipeRateCards';
import RecipeSearchBar from '../components/recipeList/RecipeSearchBar';
import RecipeVirtualList from '../components/recipeList/RecipeVirtualList';

type TierFilter = 'all' | RateTier;
type SortKey = 'name' | 'rate-desc' | 'rate-asc' | 'total-desc';

function countByTier(recipes: RecipeReport[]): Record<RateTier, number> {
  const counts: Record<RateTier, number> = { high: 0, medium: 0, low: 0 };
  for (const r of recipes) {
    counts[getRateTier(computeSuccessRate(r))]++;
  }
  return counts;
}

const SORT_COMPARATORS: Record<SortKey, (a: RecipeReport, b: RecipeReport) => number> = {
  name: (a, b) => shortRecipeName(a.recipeId).localeCompare(shortRecipeName(b.recipeId)),
  'rate-desc': (a, b) => computeSuccessRate(b) - computeSuccessRate(a),
  'rate-asc': (a, b) => computeSuccessRate(a) - computeSuccessRate(b),
  'total-desc': (a, b) => b.totalApplications - a.totalApplications,
};

export default function RecipeList() {
  const { data: recipes, error, loading } = useAllRecipes();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [sort, setSort] = useState<SortKey>('name');

  const filtered = useMemo(() => {
    if (!recipes) return [];
    const needle = search.toLowerCase();
    return recipes
      .filter((r) => {
        if (needle && !shortRecipeName(r.recipeId).toLowerCase().includes(needle)) return false;
        if (tierFilter !== 'all' && getRateTier(computeSuccessRate(r)) !== tierFilter) return false;
        return true;
      })
      .sort(SORT_COMPARATORS[sort]);
  }, [recipes, search, tierFilter, sort]);

  const tierCounts = useMemo(() => (recipes ? countByTier(recipes) : null), [recipes]);

  const clearAll = () => {
    setSearch('');
    setTierFilter('all');
  };

  if (loading) return <SkeletonList />;
  if (error)
    return <ErrorBanner title="Unable to fetch data" message={error} onRetry={() => window.location.reload()} />;

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: { xs: 1.5, sm: 2.5 }, overflow: 'hidden' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: colors.text.dark, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Recipes
        </Typography>
        {recipes && (
          <Typography
            component="span"
            sx={{ color: colors.text.muted, fontSize: { xs: '0.85rem', sm: '1rem' }, fontWeight: 500 }}
          >
            {recipes.length} total
          </Typography>
        )}
      </Box>

      {tierCounts && (
        <RecipeRateCards tierCounts={tierCounts} activeFilter={tierFilter} onFilterChange={setTierFilter} />
      )}

      <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <RecipeSearchBar
            search={search}
            onSearchChange={setSearch}
            tierFilter={tierFilter}
            onClearFilter={() => setTierFilter('all')}
            resultCount={filtered.length}
          />
        </Box>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={sort}
            onChange={(e: SelectChangeEvent) => setSort(e.target.value as SortKey)}
            sx={{
              color: colors.text.dark,
              bgcolor: colors.bg.paper,
              borderRadius: '10px',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border.default },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.border.hover },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary.dark },
            }}
          >
            <MenuItem value="name">Name A–Z</MenuItem>
            <MenuItem value="rate-desc">Rate: High → Low</MenuItem>
            <MenuItem value="rate-asc">Rate: Low → High</MenuItem>
            <MenuItem value="total-desc">Most Applied</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <RecipeVirtualList recipes={filtered} onClearFilters={clearAll} />
    </Box>
  );
}
