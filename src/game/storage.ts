/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameSettings, LevelProgress, WorldId } from '../types/game';

const PROGRESS_KEY = 'bouncy_pocket_quest_progress_v1';
const SETTINGS_KEY = 'bouncy_pocket_quest_settings_v1';

export interface GameSaveData {
  unlockedLevel: number;
  completedLevels: Record<number, LevelProgress>;
  currentWorldId: WorldId;
  currentLevelId: number;
  totalGems: number;
  totalDeaths: number;
  tutorialCompleted: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.5,
  sfxVolume: 0.8,
  vibration: true,
  leftHandedControls: false,
  touchControlSize: 'normal',
  screenShake: true,
  reducedMotion: false,
};

export const DEFAULT_SAVE_DATA: GameSaveData = {
  unlockedLevel: 1,
  completedLevels: {},
  currentWorldId: 'green_hills',
  currentLevelId: 1,
  totalGems: 0,
  totalDeaths: 0,
  tutorialCompleted: false,
};

export function loadSaveData(): GameSaveData {
  if (typeof window === 'undefined') return DEFAULT_SAVE_DATA;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return DEFAULT_SAVE_DATA;
    return { ...DEFAULT_SAVE_DATA, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to load save data:', err);
    return DEFAULT_SAVE_DATA;
  }
}

export function saveSaveData(data: GameSaveData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save data:', err);
  }
}

export function loadSettings(): GameSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to load settings:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function recordLevelCompletion(
  levelId: number,
  timeSec: number,
  gemsCount: number,
  deathsCount: number
): { isNewRecord: boolean; stars: number } {
  const save = loadSaveData();

  // Compute stars:
  // 1 star for completing
  // 2 stars for all 3 gems
  // 3 stars for all 3 gems + under target time or 0 deaths
  let stars = 1;
  if (gemsCount >= 3) stars = 2;
  if (gemsCount >= 3 && deathsCount === 0) stars = 3;

  const prev = save.completedLevels[levelId];
  const prevBestTime = prev ? prev.bestTime : Infinity;
  const isNewRecord = timeSec < prevBestTime;

  save.completedLevels[levelId] = {
    completed: true,
    stars: Math.max(prev ? prev.stars : 0, stars),
    bestTime: Math.min(prevBestTime, timeSec),
    gemsCollected: Math.max(prev ? prev.gemsCollected : 0, gemsCount),
  };

  // Unlock next level
  save.unlockedLevel = Math.max(save.unlockedLevel, levelId + 1);
  save.currentLevelId = Math.min(100, levelId + 1);

  // Recalculate total gems
  save.totalGems = Object.values(save.completedLevels).reduce((acc, curr) => acc + curr.gemsCollected, 0);
  save.totalDeaths += deathsCount;

  saveSaveData(save);

  return { isNewRecord, stars };
}
