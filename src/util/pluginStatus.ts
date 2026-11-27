import type { Migration, PluginStatusColor } from '../types';

/**
 * Derive a color representing the overall status of a plugin for status badge.
 *
 * - 'green'  : every migration succeeded
 * - 'red'    : every migration failed
 * - 'blue'   : mixed results, but fail < 50%
 * - 'yellow' : mixed results, but fail >= 50%
 * - 'white'  : no migrations or any migration has missing migrationStatus key
 */
export function deriveStatus(migrations: Migration[]): PluginStatusColor {
  if (migrations.length === 0) return 'white';

  let successCount = 0;
  let failCount = 0;
  for (const m of migrations) {
    if (m.migrationStatus === 'success') successCount++;
    else if (m.migrationStatus === 'fail') failCount++;
    else return 'white';
  }

  if (failCount === 0) return 'green';
  if (successCount === 0) return 'red';

  const failPercent = (failCount / (successCount + failCount)) * 100;
  return failPercent < 50 ? 'blue' : 'yellow';
}
