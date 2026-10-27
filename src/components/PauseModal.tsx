/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Settings, Grid, Home } from 'lucide-react';
import { LevelDefinition } from '../types/game';

interface PauseModalProps {
  level: LevelDefinition;
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onOpenLevelSelect: () => void;
  onReturnToTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  level,
  onResume,
  onRestart,
  onOpenSettings,
  onOpenLevelSelect,
  onReturnToTitle,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-center">
        <h2 className="font-display text-2xl font-black text-white tracking-wider mb-1">PAUSED</h2>
        <p className="text-xs text-slate-400 mb-6 font-display">
          Level {level.id} · {level.name}
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-sm tracking-wide shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-display font-semibold text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>RESTART LEVEL</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-display font-semibold text-xs transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>SETTINGS</span>
          </button>

          <button
            onClick={onOpenLevelSelect}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-display font-semibold text-xs transition-colors cursor-pointer"
          >
            <Grid className="w-4 h-4 text-indigo-400" />
            <span>SELECT LEVEL</span>
          </button>

          <button
            onClick={onReturnToTitle}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 font-display font-semibold text-xs transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
