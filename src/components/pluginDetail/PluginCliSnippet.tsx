import { useMemo, useState, useCallback } from 'react';
import {
  ContentCopyOutlined,
  CheckOutlined,
  TerminalOutlined,
  OpenInNewOutlined,
  ExpandMoreOutlined,
  ExpandLessOutlined,
} from '@mui/icons-material';
import { Box, Typography, IconButton, Tooltip, Link, Collapse, Button, alpha } from '@mui/material';
import type { Migration } from '../../types';
import { colors } from '../../theme';

const PLUGIN_MODERNIZER_TOOL_README_URL = 'https://github.com/jenkins-infra/plugin-modernizer-tool#readme';

function extractRecipeName(migrationId: string): string {
  const lastDot = migrationId.lastIndexOf('.');
  return lastDot >= 0 ? migrationId.slice(lastDot + 1) : migrationId;
}

function buildCommand(pluginName: string, recipeNames: string[]): string {
  return `plugin-modernizer dry-run --plugins ${pluginName} --recipe ${recipeNames.join(',')}`;
}

interface CopyableCommandProps {
  command: string;
  label?: string;
}

function CopyableCommand({ command, label }: CopyableCommandProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = command;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [command]);

  return (
    <Box sx={{ mb: label ? 1 : 0 }}>
      {label && (
        <Typography sx={{ fontSize: '0.75rem', color: colors.text.muted, mb: 0.5, fontWeight: 500 }}>
          {label}
        </Typography>
      )}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: alpha(colors.bg.default, 0.6),
          border: `1px solid ${colors.border.default}`,
          borderRadius: '8px',
          px: 1.5,
          py: 0.75,
          '&:hover': { borderColor: colors.border.hover },
        }}
      >
        <Typography
          component="code"
          sx={{
            flex: 1,
            fontSize: '0.78rem',
            fontFamily: 'monospace',
            color: colors.text.body,
            whiteSpace: 'nowrap',
            overflow: 'auto',
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: colors.border.hover, borderRadius: 2 },
          }}
        >
          <Box component="span" sx={{ color: colors.success.dark }}>
            $
          </Box>{' '}
          {command}
        </Typography>
        <Tooltip title={copied ? 'Copied!' : 'Copy command'} arrow placement="top">
          <IconButton
            size="small"
            onClick={handleCopy}
            aria-label={copied ? 'Command copied' : 'Copy command to clipboard'}
            sx={{
              color: copied ? colors.success.dark : colors.text.muted,
              flexShrink: 0,
              p: 0.5,
              '&:hover': { color: colors.text.dark, bgcolor: alpha(colors.text.muted, 0.15) },
            }}
          >
            {copied ? <CheckOutlined sx={{ fontSize: 15 }} /> : <ContentCopyOutlined sx={{ fontSize: 15 }} />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

interface PluginCliSnippetProps {
  pluginName: string;
  migrations: Migration[];
}

export default function PluginCliSnippet({ pluginName, migrations }: PluginCliSnippetProps) {
  const [expanded, setExpanded] = useState(false);

  const recipes = useMemo(() => {
    const seen = new Map<string, string>();
    for (const m of migrations) {
      if (!seen.has(m.migrationId)) {
        seen.set(m.migrationId, m.migrationName);
      }
    }
    return [...seen.entries()].map(([id, name]) => ({
      recipeName: extractRecipeName(id),
      displayName: name,
    }));
  }, [migrations]);

  if (recipes.length === 0) return null;

  const templateCommand = 'plugin-modernizer dry-run --plugins <pluginName> --recipe <recipeName>';

  return (
    <Box
      sx={{
        bgcolor: colors.bg.paper,
        borderRadius: '12px',
        border: `1px solid ${colors.border.default}`,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          <TerminalOutlined sx={{ fontSize: 18, color: colors.text.muted }} />
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: colors.text.dark }}>CLI Command</Typography>
          <Link
            href={PLUGIN_MODERNIZER_TOOL_README_URL}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: colors.text.muted,
              fontSize: '1rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.3,
              ml: 0.5,
              '&:hover': { color: colors.neutral, textDecoration: 'underline' },
            }}
          >
            plugin-modernizer-tool
            <OpenInNewOutlined sx={{ fontSize: 11 }} />
          </Link>
        </Box>

        <CopyableCommand command={templateCommand} />

        <Button
          size="small"
          onClick={() => setExpanded(!expanded)}
          endIcon={expanded ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
          sx={{
            color: colors.warning.dark,
            textTransform: 'none',
            fontSize: '0.85rem',
            mt: 0.5,
            pl: 0,
            '&:hover': { bgcolor: 'transparent', color: colors.warning.light },
          }}
        >
          {expanded ? 'Hide' : 'Show'} per recipe commands for this plugin ({recipes.length})
        </Button>
        <Collapse in={expanded}>
          <Box sx={{ mt: 0.5 }}>
            {recipes.map(({ recipeName, displayName }) => (
              <CopyableCommand key={recipeName} command={buildCommand(pluginName, [recipeName])} label={displayName} />
            ))}
          </Box>
        </Collapse>

        <Typography sx={{ fontSize: '0.85rem', color: colors.text.muted, mt: 0.75 }}>
          Uses <code style={{ color: colors.warning.dark, fontSize: '0.8rem' }}>dry-run</code>, replace with{' '}
          <code style={{ color: colors.warning.dark, fontSize: '0.8rem' }}>run</code> to apply changes and open PRs.
        </Typography>
      </Box>
    </Box>
  );
}
