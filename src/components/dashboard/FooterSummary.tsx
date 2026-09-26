import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import type { ReportJson } from '../../types';
import { colors } from '../../theme';

interface FooterSummaryProps {
  successRate: string;
  recipesCount: number;
  pullRequests?: ReportJson['pullRequests'];
}

const Divider = () => (
  <Box component="span" sx={{ color: colors.text.disabled, display: { xs: 'none', sm: 'inline' } }}>
    |
  </Box>
);

const Stat = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <Typography sx={{ color: colors.text.muted, fontSize: '0.875rem' }}>
    {label}:{' '}
    <Box component="span" sx={{ color, fontWeight: 700 }}>
      {value}
    </Box>
  </Typography>
);

export default function FooterSummary({ successRate, recipesCount, pullRequests }: FooterSummaryProps) {
  return (
    <Box
      sx={{
        background: `linear-gradient(to right, ${colors.border.default}80, ${colors.bg.default}80)`,
        p: 2,
        borderRadius: '12px',
        border: `1px solid ${colors.border.default}`,
        display: { xs: 'grid', sm: 'flex' },
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: { xs: 1.5, sm: 3 },
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Typography
        sx={{
          color: colors.text.muted,
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
        }}
      >
        <TrendingUpOutlined sx={{ fontSize: 14 }} />
        Success :{' '}
        <Box component="span" sx={{ color: colors.text.dark, fontWeight: 700 }}>
          {successRate}%
        </Box>
      </Typography>
      <Divider />
      <Stat label="Recipes" value={recipesCount} color={colors.pink.dark} />
      {pullRequests && (
        <>
          <Divider />
          <Stat label="Pull requests" value={pullRequests.totalPRs} color={colors.primary.dark} />
          <Divider />
          <Stat label="Open" value={pullRequests.openPRs} color={colors.warning.dark} />
          <Divider />
          <Stat label="Merged" value={pullRequests.mergedPRs} color={colors.success.dark} />
          <Divider />
          <Stat label="Closed" value={pullRequests.closedPRs} color={colors.error.dark} />
        </>
      )}
    </Box>
  );
}
