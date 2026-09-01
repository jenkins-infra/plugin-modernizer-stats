import { Box, Typography, TextField, InputAdornment, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { RateTier } from '../../util/recipeStatus';
import { RATE_CARD_DEFS } from '../../util/recipeStatus';
import { colors, rateTierColorMap } from '../../theme';
import { SearchOutlined, Clear as ClearIcon } from '@mui/icons-material';

interface RecipeSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  tierFilter: 'all' | RateTier;
  onClearFilter: () => void;
  resultCount: number;
}

export default function RecipeSearchBar({
  search,
  onSearchChange,
  tierFilter,
  onClearFilter,
  resultCount,
}: RecipeSearchBarProps) {
  return (
    <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap', alignItems: 'center' }}>
      <TextField
        size="small"
        placeholder="Search a recipe…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined sx={{ color: colors.text.muted, fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search input"
                  edge="end"
                  sx={{ color: colors.text.muted, p: 0.5 }}
                >
                  <ClearIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
        sx={{
          flex: 1,
          minWidth: { xs: 0, sm: 200 },
          maxWidth: { xs: '100%', sm: 360 },
          '& .MuiOutlinedInput-root': {
            color: colors.text.dark,
            bgcolor: colors.bg.paper,
            borderRadius: '10px',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            '& fieldset': { borderColor: colors.border.default },
            '&:hover fieldset': { borderColor: colors.border.hover },
            '&.Mui-focused fieldset': { borderColor: colors.primary.dark },
          },
        }}
      />

      {tierFilter !== 'all' && (
        <Box
          component="button"
          type="button"
          onClick={onClearFilter}
          sx={{
            all: 'unset',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.5,
            borderRadius: '8px',
            bgcolor: alpha(rateTierColorMap[tierFilter], 0.12),
            border: `1px solid ${alpha(rateTierColorMap[tierFilter], 0.3)}`,
            transition: 'background-color 0.15s',
            '&:hover': { bgcolor: alpha(rateTierColorMap[tierFilter], 0.2) },
            '&:focus-visible': {
              outline: `2px solid ${rateTierColorMap[tierFilter]}`,
              outlineOffset: 2,
            },
          }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              fontWeight: 600,
              color: rateTierColorMap[tierFilter],
            }}
          >
            {RATE_CARD_DEFS.find((d) => d.key === tierFilter)?.label}
          </Typography>
          <Typography component="span" sx={{ fontSize: '0.85rem', color: colors.text.muted }}>
            ✕
          </Typography>
        </Box>
      )}

      <Typography sx={{ color: colors.text.muted, fontSize: { xs: '0.8rem', sm: '0.9rem' }, ml: 'auto' }}>
        {resultCount} {resultCount === 1 ? 'result' : 'results'}
      </Typography>
    </Box>
  );
}
