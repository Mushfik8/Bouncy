/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import { WORLDS, WorldId } from '../types/game';
import { GameSaveData } from '../game/storage';

interface WorldSelectModalProps {
  onClose: () => void;
  onSelectWorld: (worldId: WorldId) => void;
  saveData: GameSaveData;
}

export const WorldSelectModal: React.FC<WorldSelectModalProps> = ({
  onClose,
  onSelectWorld,
  saveData,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 md:p-6 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="font-display text-xl font-bold text-white tracking-wide">WORLDS OF BOUNCY</h2>
            <p className="text-xs text-slate-400">Select a region to choose levels</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Worlds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-4 overflow-y-auto pr-1">
          {WORLDS.map((world, idx) => {
            const isUnlocked = saveData.unlockedLevel >= world.levelOffset;
            const completedCount = Object.keys(saveData.completedLevels).filter((idStr) => {
              const id = parseInt(idStr, 10);
              return id >= world.levelOffset && id < world.levelOffset + world.levelCount;
            }).length;
            const percent = Math.round((completedCount / world.levelCount) * 100);

            return (
              <div
                key={world.id}
                onClick={() => {
                  if (isUnlocked) onSelectWorld(world.id);
                }}
                className={`relative flex flex-col p-4 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-slate-500 cursor-pointer shadow-sm active:scale-[0.99]'
                    : 'bg-slate-950/60 border-slate-900 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: world.themeColor }}
                    />
                    <h3 className="font-display font-bold text-sm text-white">
                      {idx + 1}. {world.name.replace(/^World \d+: /, '')}
                    </h3>
                  </div>

                  {isUnlocked ? (
                    percent === 100 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )
                  ) : (
                    <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-1 mb-3">{world.subtitle}</p>

                {/* Progress Bar & Level Count */}
                <div className="mt-auto">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono-numbers">
                    <span>
                      Levels {world.levelOffset}–{world.levelOffset + world.levelCount - 1}
                    </span>
                    <span>{percent}% Completed</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: world.themeColor,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
