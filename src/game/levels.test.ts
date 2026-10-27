/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLevel, validateLevel } from './levels';

test('Level 1 to 15 (World 1 Green Hills) pass strict level validation', () => {
  for (let i = 1; i <= 15; i++) {
    const level = buildLevel(i);
    const result = validateLevel(level);
    assert.ok(result.valid, `Level ${i} (${level.name}) failed validation: ${result.errors.join(', ')}`);
    assert.equal(level.entities.some((e) => e.type === 'goal'), true, `Level ${i} must have a goal`);
    assert.ok(level.entities.filter((e) => e.type === 'gem').length >= 3, `Level ${i} must have at least 3 gems`);
  }
});

test('Sample levels across all 6 worlds validate without softlock or out of bounds', () => {
  const sampleLevelIds = [1, 15, 16, 30, 31, 45, 46, 60, 61, 75, 76, 100];
  for (const id of sampleLevelIds) {
    const level = buildLevel(id);
    const result = validateLevel(level);
    assert.ok(result.valid, `World level ${id} (${level.name}) failed validation: ${result.errors.join(', ')}`);
  }
});
