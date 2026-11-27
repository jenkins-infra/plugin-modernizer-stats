import { useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import { alpha } from '@mui/material/styles';
import { useFailedMigrations } from '../../hooks/useMetadata';
import { colors } from '../../theme';

interface FailedMigrationsExportProps {
  pluginName: string;
  failCount: number;
}

export default function FailedMigrationsExport({ pluginName, failCount }: FailedMigrationsExportProps) {
  const { data: csvData, error, loading } = useFailedMigrations(pluginName);

  const handleDownload = useCallback(() => {
    if (!csvData) return;
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pluginName}-failed-migrations.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }, [csvData, pluginName]);

  if (failCount === 0) return null;

  return (
    <Box
      sx={{
        bgcolor: colors.bg.paper,
        p: { xs: 2, sm: 3 },
        borderRadius: '12px',
        border: `1px solid ${colors.border.default}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
      }}
    >
      <Box>
        <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: colors.text.dark }}>
          Failed Migrations Export
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', color: colors.text.muted, mt: 0.25 }}>
          {failCount} failed migration{failCount !== 1 ? 's' : ''} available for download
        </Typography>
        {error && (
          <Typography role="alert" sx={{ fontSize: '0.85rem', color: colors.text.dark, mt: 0.5 }}>
            Unable to prepare CSV export: {error}
          </Typography>
        )}
      </Box>
      <Button
        variant="outlined"
        size="small"
        startIcon={loading ? <CircularProgress size={16} /> : <FileDownloadOutlined />}
        disabled={loading || !!error || !csvData}
        onClick={handleDownload}
        sx={{
          color: colors.error.light,
          borderColor: colors.error.light,
          '&:hover': {
            bgcolor: alpha(colors.error.light, 0.1),
            borderColor: colors.error.light,
          },
        }}
      >
        Download CSV
      </Button>
    </Box>
  );
}
