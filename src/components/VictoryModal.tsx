/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, Play, RotateCcw, Grid } from 'lucide-react';
import { LevelDefinition } from '../types/game';

interface VictoryModalProps {
  level: LevelDefinition;
  starsEarned: number;
  timeSeconds: number;
  gemsCount: number;
  deathsCount: number;
  isNewRecord: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenLevelSelect: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  starsEarned,
  timeSeconds,
  gemsCount,
  deathsCount,
  isNewRecord,
  onNextLevel,
  onReplay,
  onOpenLevelSelect,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        <h2 className="font-display text-2xl md:text-3xl font-black text-amber-400 tracking-wider mb-1">
          STAGE CLEAR!
        </h2>
        <p className="text-xs text-slate-400 font-display mb-4">
          Level {level.id} · {level.name}
        </p>

        {/* 3 Golden Stars */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {[1, 2, 3].map((starIdx) => {
            const hasStar = starIdx <= starsEarned;
            return (
              <div
                key={starIdx}
                className={`p-2 rounded-xl border transition-transform duration-300 ${
                  hasStar
                    ? 'bg-amber-500/20 border-amber-400/60 scale-110 shadow-lg shadow-amber-950/40'
                    : 'bg-slate-800/40 border-slate-800 scale-95 opacity-50'
                }`}
              >
                <Star
                  className={`w-7 h-7 ${
                    hasStar ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/60 border border-slate-800 rounded-xl p-3 mb-5 font-mono-numbers">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-sans">Clear Time</span>
            <span className="text-sm font-bold text-white">{timeSeconds.toFixed(1)}s</span>
            {isNewRecord && (
              <span className="text-[9px] text-emerald-400 font-semibold uppercase">Record!</span>
            )}
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-sans">Gems</span>
            <span className="text-sm font-bold text-amber-400">{gemsCount} / 3</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-sans">Deaths</span>
            <span className={`text-sm font-bold ${deathsCount === 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
              {deathsCount}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            data-start="true"
            onClick={onNextLevel}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-display font-bold text-sm tracking-wide shadow-lg shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>NEXT STAGE</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReplay}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-display font-semibold text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>REPLAY</span>
            </button>

            <button
              onClick={onOpenLevelSelect}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-display font-semibold text-xs transition-colors cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5 text-indigo-400" />
              <span>LEVELS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
