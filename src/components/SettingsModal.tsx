/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Volume2, Smartphone, Eye, RotateCcw } from 'lucide-react';
import { GameSettings } from '../types/game';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onResetProgress,
}) => {
  const update = (partial: Partial<GameSettings>) => {
    onUpdateSettings({ ...settings, ...partial });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 md:p-6 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 shrink-0">
          <h2 className="font-display text-lg font-bold text-white tracking-wide">SETTINGS</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex flex-col gap-4 my-4 overflow-y-auto pr-1 text-sm text-slate-200">
          {/* Audio Section */}
          <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase font-display">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Audio</span>
            </div>

            {/* SFX Volume */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs">Sound Effects</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => update({ sfxVolume: parseFloat(e.target.value) })}
                  className="w-28 accent-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-mono-numbers w-8 text-right">
                  {Math.round(settings.sfxVolume * 100)}%
                </span>
              </div>
            </div>

            {/* Music Volume */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs">Music Atmosphere</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) => update({ musicVolume: parseFloat(e.target.value) })}
                  className="w-28 accent-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-mono-numbers w-8 text-right">
                  {Math.round(settings.musicVolume * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Controls & Accessibility */}
          <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase font-display">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>Controls & Gameplay</span>
            </div>

            {/* Left Handed Controls */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs">Left-Handed Touch Controls</span>
              <input
                type="checkbox"
                checked={settings.leftHandedControls}
                onChange={(e) => update({ leftHandedControls: e.target.checked })}
                className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
              />
            </label>

            {/* Touch Control Size */}
            <div className="flex items-center justify-between">
              <span className="text-xs">Touch Button Size</span>
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => update({ touchControlSize: 'normal' })}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
                    settings.touchControlSize === 'normal'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => update({ touchControlSize: 'large' })}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
                    settings.touchControlSize === 'large'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Large
                </button>
              </div>
            </div>

            {/* Screen Shake */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs">Dynamic Screen Shake</span>
              <input
                type="checkbox"
                checked={settings.screenShake}
                onChange={(e) => update({ screenShake: e.target.checked })}
                className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
              />
            </label>

            {/* Reduced Motion */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs">Reduced Motion</span>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => update({ reducedMotion: e.target.checked })}
                className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Reset Save Data */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (window.confirm('Reset all saved level progress and records?')) {
                  onResetProgress();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-950/80 border border-red-900/60 text-red-300 hover:text-red-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Game Progress</span>
            </button>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold tracking-wide transition-colors cursor-pointer shrink-0"
        >
          DONE
        </button>
      </div>
    </div>
  );
};
