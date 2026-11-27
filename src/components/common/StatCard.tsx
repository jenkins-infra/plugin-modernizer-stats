import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { colors } from '../../theme';

interface StatCardProps {
  value: string | number;
  label: string;
  description?: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
  active?: boolean;
}

export default function StatCard({ value, label, description, icon, color, onClick, active }: StatCardProps) {
  const isClickable = !!onClick;
  const isToggle = isClickable && active !== undefined;
  return (
    <Box
      component={isClickable ? 'button' : 'div'}
      type={isClickable ? 'button' : undefined}
      aria-pressed={isToggle ? active : undefined}
      onClick={onClick}
      sx={{
        all: isClickable ? 'unset' : undefined,
        width: '100%',
        cursor: isClickable ? 'pointer' : 'default',
        boxSizing: 'border-box',
        bgcolor: colors.bg.paper,
        p: { xs: 1, sm: 2 },
        borderRadius: '12px',
        border: `1px solid ${active ? color : colors.border.default}`,
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1, sm: 1.5 },
        height: '100%',
        transition: 'border-color 0.15s, transform 0.12s',
        '&:hover': {
          borderColor: isClickable ? alpha(color, 0.6) : colors.border.hover,
          transform: isClickable ? 'translateY(-1px)' : 'scale(1.02)',
        },
        '&:focus-visible': isClickable ? { outline: `2px solid ${color}`, outlineOffset: 2 } : undefined,
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          p: 1,
          borderRadius: '8px',
          bgcolor: alpha(color, 0.15),
          border: `1px solid ${alpha(color, 0.25)}`,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
          <Typography
            sx={{
              fontSize: { xs: '1rem', sm: '1.35rem' },
              fontWeight: 600,
              color: colors.text.dark,
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' }, fontWeight: 600, color, lineHeight: 1.2 }}>
            {label}
          </Typography>
        </Box>
        {description && (
          <Typography
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              color: colors.text.muted,
              lineHeight: 1.3,
              mt: 0.25,
              display: { xs: 'none', sm: 'block' },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {description}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
