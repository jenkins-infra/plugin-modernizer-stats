import { useState, useEffect, useMemo, useCallback, useReducer } from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import type { ReportJson, RecipeReport, RecipeStats } from '../types';
import { colors } from '../theme';
import ErrorBanner from '../components/common/ErrorBanner';
import {
  DataFreshnessBanner,
  StatCards,
  ChartsRow,
  TimelineTags,
  TopFailingRecipes,
  FooterSummary,
} from '../components/dashboard';

export default function Dashboard() {
  const [, retry] = useReducer((x: number) => x + 1, 0);
  const [data, setData] = useState<ReportJson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}data/report.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const json: ReportJson = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const overview = data?.overview ?? null;
  const successRate = overview ? overview.successRate.toFixed(1) : '0';

  const recipesArray: RecipeReport[] = useMemo(() => {
    if (!data?.recipes) return [];
    return Object.values(data.recipes);
  }, [data]);

  const recipesStats: RecipeStats[] = useMemo(() => {
    return recipesArray.map((r) => ({
      recipeId: r.recipeId,
      total: r.totalApplications,
      success: r.successCount,
      fail: r.failureCount,
    }));
  }, [recipesArray]);

  const handleRetry = useCallback(() => {
    retry();
    window.location.reload();
  }, []);

  const migrationStatusOption = useMemo(() => {
    if (!overview) return {};
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: '0%', textStyle: { color: colors.text.body } },
      series: [
        {
          name: 'Status',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: colors.bg.paper, borderWidth: 2 },
          label: { show: false, position: 'center' },
          emphasis: { label: { show: true, fontSize: 18, fontWeight: 'bold' } },
          labelLine: { show: false },
          data: [
            { value: overview.successfulMigrations, name: 'Success', itemStyle: { color: colors.success.light } },
            { value: overview.failedMigrations, name: 'Failed', itemStyle: { color: colors.error.light } },
          ],
        },
      ],
    };
  }, [overview]);

  const topRecipesOption = useMemo(() => {
    if (recipesStats.length === 0) return {};
    const sorted = [...recipesStats].sort((a, b) => b.total - a.total).slice(0, 10);
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', axisLabel: { color: colors.text.muted } },
      yAxis: {
        type: 'category',
        data: sorted.map((r) => r.recipeId.split('.').pop() ?? r.recipeId),
        axisLabel: { color: colors.text.muted, width: 160, overflow: 'truncate' },
      },
      series: [
        {
          name: 'Success',
          type: 'bar',
          stack: 'total',
          data: sorted.map((r) => r.success),
          itemStyle: { color: colors.success.light },
        },
        {
          name: 'Failures',
          type: 'bar',
          stack: 'total',
          data: sorted.map((r) => r.fail),
          itemStyle: { color: colors.error.light },
        },
      ],
    };
  }, [recipesStats]);

  const timelineOption = useMemo(() => {
    if (!data?.timeline || data.timeline.length === 0) return null;
    return {
      tooltip: { trigger: 'axis' },
      legend: { bottom: '0%', textStyle: { color: colors.text.body } },
      grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: data.timeline.map((t) => t.month),
        axisLabel: { color: colors.text.muted, rotate: 45 },
      },
      yAxis: { type: 'value', axisLabel: { color: colors.text.muted } },
      series: [
        {
          name: 'Success',
          type: 'bar',
          stack: 'total',
          data: data.timeline.map((t) => t.success),
          itemStyle: { color: colors.success.light },
        },
        {
          name: 'Failed',
          type: 'bar',
          stack: 'total',
          data: data.timeline.map((t) => t.fail),
          itemStyle: { color: colors.error.light },
        },
      ],
    };
  }, [data]);

  const tagsOption = useMemo(() => {
    if (!data?.tags || data.tags.length === 0) return null;
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: '0%', textStyle: { color: colors.text.body } },
      series: [
        {
          name: 'Tags',
          type: 'pie',
          radius: ['35%', '65%'],
          roseType: 'area',
          itemStyle: { borderRadius: 8, borderColor: colors.bg.paper, borderWidth: 2 },
          label: { show: true, color: colors.text.muted, fontSize: 11 },
          data: data.tags.map((t, i) => ({
            value: t.count,
            name: t.tag,
            itemStyle: { color: colors.chart.tagsPalette[i % colors.chart.tagsPalette.length] },
          })),
        },
      ],
    };
  }, [data]);

  const topFailingRecipes = useMemo(() => {
    if (!data?.failuresByRecipe || !data?.recipes) return [];
    return data.failuresByRecipe.slice(0, 8).map((entry) => {
      const recipe = data.recipes[entry.recipeId];
      return {
        recipeId: entry.recipeId,
        failures: entry.failures,
        successCount: recipe?.successCount ?? 0,
        failureCount: recipe?.failureCount ?? entry.failures,
      };
    });
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Skeleton variant="rounded" height={50} sx={{ bgcolor: colors.bg.paper, borderRadius: '12px' }} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Box key={i} sx={{ flex: '1 1 160px', minWidth: 0 }}>
              <Skeleton variant="rounded" height={90} sx={{ bgcolor: colors.bg.paper, borderRadius: '12px' }} />
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 340px' }}>
            <Skeleton variant="rounded" height={400} sx={{ bgcolor: colors.bg.paper, borderRadius: '12px' }} />
          </Box>
          <Box sx={{ flex: '1 1 340px' }}>
            <Skeleton variant="rounded" height={400} sx={{ bgcolor: colors.bg.paper, borderRadius: '12px' }} />
          </Box>
        </Box>
      </Box>
    );
  }

  if (error || !data || !overview) {
    return (
      <ErrorBanner
        title="Unable to fetch data"
        message="The dashboard data could not be loaded."
        onRetry={handleRetry}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <DataFreshnessBanner generatedAt={data.generatedAt} />
      <StatCards overview={overview} />
      <ChartsRow migrationStatusOption={migrationStatusOption} topRecipesOption={topRecipesOption} />
      <TimelineTags timelineOption={timelineOption} tagsOption={tagsOption} />
      <TopFailingRecipes recipes={topFailingRecipes} />
      <FooterSummary successRate={successRate} recipesCount={recipesArray.length} pullRequests={data.pullRequests} />
    </Box>
  );
}
