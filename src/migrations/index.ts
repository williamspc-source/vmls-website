import * as migration_20260825_130820_fresh_baseline from './20260825_130820_fresh_baseline';

export const migrations = [
  {
    up: migration_20260825_130820_fresh_baseline.up,
    down: migration_20260825_130820_fresh_baseline.down,
    name: '20260825_130820_fresh_baseline'
  },
];
