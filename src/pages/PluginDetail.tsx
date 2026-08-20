import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import { usePluginData } from '../hooks/useMetadata';
import { colors } from '../theme';
import { SkeletonDetail } from '../components/common/Skeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import {
  PluginHeader,
  MigrationTimeline,
  PluginCliSnippet,
  RecipeBreakdown,
  PRHistory,
  FailedMigrationsTable,
  MigrationTable,
  RawDataSection,
} from '../components/pluginDetail';

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function PluginDetail() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const pluginName = safeDecode(name ?? '');
  const { data: plugin, error, loading } = usePluginData(pluginName);

  const backButton = (
    <Button
      startIcon={<ArrowBackOutlined />}
      onClick={() => navigate('/plugins')}
      sx={{
        color: colors.text.muted,
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.9rem',
        pl: 0.5,
        '&:hover': { color: colors.text.dark, bgcolor: 'transparent' },
      }}
    >
      Back to Plugins
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
        <ErrorBanner title="Unable to load plugin data" message={error} onRetry={() => window.location.reload()} />
      </Box>
    );
  }

  if (!plugin) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {backButton}
        <ErrorBanner title="Plugin not found" message="The plugin you are searching for does not exist." />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5 } }}>
      {backButton}
      <PluginHeader plugin={plugin} />
      <MigrationTimeline migrations={plugin.migrations} />
      <PluginCliSnippet pluginName={plugin.pluginName} migrations={plugin.migrations} />
      <RecipeBreakdown migrations={plugin.migrations} />
      <PRHistory migrations={plugin.migrations} />
      <FailedMigrationsTable migrations={plugin.migrations} />
      <MigrationTable migrations={plugin.migrations} />
      <RawDataSection plugin={plugin} />
    </Box>
  );
}
