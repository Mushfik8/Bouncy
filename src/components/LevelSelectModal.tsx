/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ArrowLeft, Lock, Star } from 'lucide-react';
import { WORLDS, WorldId } from '../types/game';
import { GameSaveData } from '../game/storage';

interface LevelSelectModalProps {
  worldId: WorldId;
  onClose: () => void;
  onBackToWorlds: () => void;
  onPlayLevel: (levelId: number) => void;
  saveData: GameSaveData;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  worldId,
  onClose,
  onBackToWorlds,
  onPlayLevel,
  saveData,
}) => {
  const world = WORLDS.find((w) => w.id === worldId) || WORLDS[0];
  const levelNumbers: number[] = [];
  for (let i = 0; i < world.levelCount; i++) {
    levelNumbers.push(world.levelOffset + i);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 md:p-6 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToWorlds}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Back to Worlds"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-display text-lg md:text-xl font-bold text-white tracking-wide">
                {world.name}
              </h2>
              <p className="text-xs text-slate-400">{world.mechanicsDescription}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 my-4 overflow-y-auto pr-1">
          {levelNumbers.map((lvl) => {
            const isUnlocked = saveData.unlockedLevel >= lvl;
            const progress = saveData.completedLevels[lvl];
            const stars = progress ? progress.stars : 0;
            const gems = progress ? progress.gemsCollected : 0;

            return (
              <button
                key={lvl}
                disabled={!isUnlocked}
                onClick={() => isUnlocked && onPlayLevel(lvl)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  isUnlocked
                    ? 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 hover:border-emerald-500 cursor-pointer shadow-sm active:scale-95'
                    : 'bg-slate-950/40 border-slate-900/60 opacity-40 cursor-not-allowed'
                }`}
              >
                {isUnlocked ? (
                  <>
                    <span className="font-display text-lg font-bold text-white mb-1">
                      {lvl}
                    </span>
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-1">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= stars
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    {/* Gems / Best Time */}
                    <div className="text-[10px] text-slate-400 font-mono-numbers">
                      {progress ? `${progress.bestTime.toFixed(1)}s` : 'Ready'}
                    </div>
                  </>
                ) : (
                  <div className="py-2 flex flex-col items-center">
                    <Lock className="w-4 h-4 text-slate-600 mb-1" />
                    <span className="text-[11px] text-slate-600 font-bold">{lvl}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
