import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined';
import { FaCodeBranch } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import type { Migration } from '../../types';
import { colors } from '../../theme';
import { formatTimestamp } from '../../util/format';

const statusColors: Record<string, string> = {
  merged: colors.success.light,
  open: colors.primary.dark,
  closed: colors.error.light,
};

interface MigrationCardProps {
  migration: Migration;
}

export default function MigrationCard({ migration: m }: MigrationCardProps) {
  return (
    <Box
      sx={{
        bgcolor: colors.bg.paper,
        borderRadius: '12px',
        border: `1px solid ${colors.border.default}`,
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* Top row: status icon + name + PR badge + date */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
        {m.migrationStatus === 'success' ? (
          <CheckCircleOutlined sx={{ fontSize: 24, color: colors.success.light, mt: 0.25, flexShrink: 0 }} />
        ) : m.migrationStatus === 'fail' ? (
          <CancelOutlined sx={{ fontSize: 24, color: colors.error.light, mt: 0.25, flexShrink: 0 }} />
        ) : (
          // Records from before June 2025 carry no migrationStatus (see docs/statistics.md)
          <HelpOutlineOutlined sx={{ fontSize: 24, color: colors.text.muted, mt: 0.25, flexShrink: 0 }} />
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, color: colors.text.dark, fontSize: '1rem', lineHeight: 1.3 }}>
            {m.migrationName}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.8rem',
              color: colors.primary.dark,
              fontFamily: 'monospace',
              mt: 0.25,
              wordBreak: 'break-all',
            }}
          >
            {m.migrationId}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          {m.pullRequestStatus && (
            <Chip
              label={m.pullRequestStatus}
              size="small"
              sx={{
                bgcolor: alpha(statusColors[m.pullRequestStatus] ?? colors.text.muted, 0.15),
                color: statusColors[m.pullRequestStatus] ?? colors.text.muted,
                border: `1px solid ${alpha(statusColors[m.pullRequestStatus] ?? colors.text.muted, 0.3)}`,
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: colors.text.muted, fontSize: '0.8rem' }}>
            <CalendarTodayOutlined sx={{ fontSize: 13 }} />
            <Typography component="span" sx={{ fontSize: '0.8rem', color: colors.text.muted }}>
              {formatTimestamp(m.timestamp)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Description */}
      {m.migrationDescription && (
        <Typography sx={{ color: colors.text.body, fontSize: '0.9rem', mb: 1.5, ml: 4.5 }}>
          {m.migrationDescription}
        </Typography>
      )}

      {/* Tags */}
      {m.tags && m.tags.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5, ml: 4.5 }}>
          {m.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                bgcolor: alpha(colors.primary.dark, 0.15),
                color: colors.primary.dark,
                border: `1px solid ${alpha(colors.primary.dark, 0.3)}`,
                fontWeight: 500,
                fontSize: '0.75rem',
                height: 24,
              }}
            />
          ))}
        </Box>
      )}

      {/* Metadata row: Plugin version, baselines, branch */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 2 },
          flexWrap: 'wrap',
          ml: 4.5,
          mb: 1.5,
          fontSize: '0.8rem',
          color: colors.text.light,
        }}
      >
        {m.pluginVersion && <MetaLabel label="Plugin" value={`v${m.pluginVersion}`} />}
        {m.jenkinsBaseline && <MetaLabel label="Jenkins BL" value={m.jenkinsBaseline} highlight />}
        {m.targetBaseline && <MetaLabel label="Target BL" value={m.targetBaseline} highlight />}
        {m.effectiveBaseline && <MetaLabel label="Effective BL" value={m.effectiveBaseline} highlight />}
        {m.jenkinsVersion && <MetaLabel label="Jenkins" value={m.jenkinsVersion} />}
        {m.defaultBranch && (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <FaCodeBranch size={11} />
            <Typography component="span" sx={{ fontSize: '0.8rem', color: colors.text.muted }}>
              {m.defaultBranch}
            </Typography>
            {m.defaultBranchLatestCommitSha && (
              <>
                <Typography component="span" sx={{ fontSize: '0.8rem', color: colors.text.muted }}>
                  &rarr;
                </Typography>
                <Typography
                  component="span"
                  sx={{ fontSize: '0.8rem', color: colors.text.muted, fontFamily: 'monospace' }}
                >
                  {m.defaultBranchLatestCommitSha.slice(0, 7)}
                </Typography>
              </>
            )}
          </Box>
        )}
      </Box>

      {/* CI Check Runs */}
      {m.checkRuns && Object.keys(m.checkRuns).length > 0 && (
        <Box
          sx={{
            bgcolor: alpha(colors.bg.default, 0.6),
            borderRadius: '8px',
            border: `1px solid ${colors.border.default}`,
            p: 1.5,
            ml: 4.5,
            mb: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: colors.text.dark }}>
              CI Check Runs
            </Typography>
            {m.checkRunsSummary && (
              <Chip
                label={m.checkRunsSummary}
                size="small"
                sx={{
                  bgcolor: alpha(
                    m.checkRunsSummary === 'success'
                      ? colors.success.light
                      : m.checkRunsSummary === 'failure'
                        ? colors.error.light
                        : colors.warning.dark,
                    0.15
                  ),
                  color:
                    m.checkRunsSummary === 'success'
                      ? colors.success.light
                      : m.checkRunsSummary === 'failure'
                        ? colors.error.light
                        : colors.warning.dark,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                }}
              />
            )}
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr auto 1fr auto' },
              gap: 0.75,
              fontSize: '0.8rem',
            }}
          >
            {Object.entries(m.checkRuns).map(([name, status]) => (
              <Box key={name} sx={{ display: 'contents' }}>
                <Typography component="span" sx={{ fontSize: '0.8rem', color: colors.text.muted }}>
                  {name}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color:
                      status === 'success'
                        ? colors.success.light
                        : status === 'failure'
                          ? colors.error.light
                          : colors.warning.dark,
                  }}
                >
                  {status ?? 'pending'}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* PR link + diff stats */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 4.5, flexWrap: 'wrap' }}>
        {m.pullRequestUrl ? (
          <Button
            component="a"
            href={m.pullRequestUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            startIcon={<FaCodeBranch size={12} />}
            endIcon={<FiExternalLink size={12} />}
            sx={{
              color: colors.primary.dark,
              bgcolor: alpha(colors.primary.dark, 0.12),
              border: `1px solid ${alpha(colors.primary.dark, 0.3)}`,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8rem',
              '&:hover': { bgcolor: alpha(colors.primary.dark, 0.2) },
            }}
          >
            View PR
          </Button>
        ) : (
          <Typography sx={{ fontSize: '0.85rem', color: colors.text.muted, fontStyle: 'italic' }}>
            No PR created
          </Typography>
        )}
        {(m.additions != null || m.deletions != null) && (
          <Chip
            label={`+${m.additions ?? 0} -${m.deletions ?? 0} ${m.changedFiles ?? 0} files`}
            size="small"
            sx={{
              bgcolor: alpha(colors.text.muted, 0.1),
              color: colors.text.muted,
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              height: 24,
              '& .MuiChip-label': { px: 1 },
            }}
          />
        )}
      </Box>
    </Box>
  );
}

function MetaLabel({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      <Typography component="span" sx={{ fontSize: '0.8rem', color: colors.text.muted }}>
        {label}:
      </Typography>
      {highlight ? (
        <Chip
          label={value}
          size="small"
          sx={{
            height: 20,
            bgcolor: alpha(colors.primary.dark, 0.15),
            color: colors.primary.dark,
            fontWeight: 600,
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            '& .MuiChip-label': { px: 0.75 },
          }}
        />
      ) : (
        <Typography component="span" sx={{ fontSize: '0.8rem', color: colors.text.dark, fontFamily: 'monospace' }}>
          {value}
        </Typography>
      )}
    </Box>
  );
}
