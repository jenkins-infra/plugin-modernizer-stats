import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import { useRecipeData } from '../hooks/useMetadata';
import { computeSuccessRate, getRateTier, shortRecipeName } from '../util/recipeStatus';
import { colors, rateTierColorMap } from '../theme';
import { SkeletonDetail } from '../components/common/Skeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import SuccessRateBadge from '../components/common/SuccessRateBadge';
import {
  RecipeStatusChart,
  RecipeTimeline,
  RecipePluginsTable,
  RecipeFailuresBreakdown,
  RecipeCliSnippet,
} from '../components/recipeDetail';
import type { RecipeReport } from '../types';

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function RecipeHeader({ recipe }: { recipe: RecipeReport }) {
  const rate = computeSuccessRate(recipe);
  const tier = getRateTier(rate);
  const tierColor = rateTierColorMap[tier];

  return (
    <Box
      sx={{
        bgcolor: colors.bg.paper,
        p: { xs: 2, sm: 3 },
        borderRadius: '12px',
        border: `1px solid ${colors.border.default}`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: colors.text.dark, fontSize: { xs: '1.5rem', sm: '1.85rem' } }}
            >
              {shortRecipeName(recipe.recipeId)}
            </Typography>
            <SuccessRateBadge rate={rate} />
          </Box>

          <Typography
            sx={{
              fontSize: '0.85rem',
              color: colors.text.muted,
              fontFamily: 'monospace',
              mb: 1,
              wordBreak: 'break-all',
            }}
          >
            {recipe.recipeId}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          <Box
            data-testid="stat-total"
            sx={{
              bgcolor: alpha(colors.primary.dark, 0.12),
              border: `1px solid ${alpha(colors.primary.dark, 0.3)}`,
              borderRadius: '10px',
              px: 2,
              py: 1,
              textAlign: 'center',
              minWidth: 72,
            }}
          >
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: colors.primary.light, lineHeight: 1.2 }}>
              {recipe.totalApplications}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: colors.primary.light, fontWeight: 500 }}>Total</Typography>
          </Box>
          <Box
            data-testid="stat-success"
            sx={{
              bgcolor: alpha(colors.success.light, 0.12),
              border: `1px solid ${alpha(colors.success.light, 0.3)}`,
              borderRadius: '10px',
              px: 2,
              py: 1,
              textAlign: 'center',
              minWidth: 72,
            }}
          >
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: colors.success.light, lineHeight: 1.2 }}>
              {recipe.successCount}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: colors.success.light, fontWeight: 500 }}>Success</Typography>
          </Box>
          <Box
            data-testid="stat-failed"
            sx={{
              bgcolor: alpha(colors.error.light, 0.12),
              border: `1px solid ${alpha(colors.error.light, 0.3)}`,
              borderRadius: '10px',
              px: 2,
              py: 1,
              textAlign: 'center',
              minWidth: 72,
            }}
          >
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: colors.error.light, lineHeight: 1.2 }}>
              {recipe.failureCount}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: colors.error.light, fontWeight: 500 }}>Failed</Typography>
          </Box>
          <Box
            data-testid="stat-rate"
            sx={{
              bgcolor: alpha(tierColor, 0.12),
              border: `1px solid ${alpha(tierColor, 0.3)}`,
              borderRadius: '10px',
              px: 2,
              py: 1,
              textAlign: 'center',
              minWidth: 72,
            }}
          >
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: tierColor, lineHeight: 1.2 }}>
              {rate.toFixed(1)}%
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: tierColor, fontWeight: 500 }}>Rate</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const recipeId = safeDecode(id ?? '');
  const { data: recipe, error, loading } = useRecipeData(recipeId);

  const backButton = (
    <Button
      startIcon={<ArrowBackOutlined />}
      onClick={() => navigate('/recipes')}
      sx={{
        color: colors.text.muted,
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.9rem',
        pl: 0.5,
        '&:hover': { color: colors.text.dark, bgcolor: 'transparent' },
      }}
    >
      Back to Recipes
    </Button>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {backButton}
        <SkeletonDetail />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {backButton}
        <ErrorBanner title="Unable to load recipe data" message={error} onRetry={() => window.location.reload()} />
      </Box>
    );
  }

  if (!recipe) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {backButton}
        <ErrorBanner title="Recipe not found" message="The recipe you are searching for does not exist." />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5 } }}>
      {backButton}
      <RecipeHeader recipe={recipe} />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ flex: '1 1 340px', minWidth: 0 }}>
          <RecipeStatusChart recipe={recipe} />
        </Box>
        <Box sx={{ flex: '1 1 340px', minWidth: 0 }}>
          <RecipeTimeline recipe={recipe} />
        </Box>
      </Box>
      <RecipeCliSnippet recipe={recipe} />
      <RecipePluginsTable recipe={recipe} />
      <RecipeFailuresBreakdown recipe={recipe} />
    </Box>
  );
}
