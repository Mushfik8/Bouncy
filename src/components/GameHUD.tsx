/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Pause, RotateCcw, Volume2, VolumeX, Key } from 'lucide-react';
import { GameSettings, LevelDefinition } from '../types/game';

interface GameHUDProps {
  level: LevelDefinition;
  elapsedSeconds: number;
  deaths: number;
  collectedGems: Set<number>;
  hasKey: boolean;
  onPause: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  settings: GameSettings;
  // Touch button callbacks
  onTouchLeftStart: () => void;
  onTouchLeftEnd: () => void;
  onTouchRightStart: () => void;
  onTouchRightEnd: () => void;
  onTouchJumpStart: () => void;
  onTouchJumpEnd: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  level,
  elapsedSeconds,
  deaths,
  collectedGems,
  hasKey,
  onPause,
  onRestart,
  isMuted,
  onToggleMute,
  settings,
  onTouchLeftStart,
  onTouchLeftEnd,
  onTouchRightStart,
  onTouchRightEnd,
  onTouchJumpStart,
  onTouchJumpEnd,
}) => {
  const isLarge = settings.touchControlSize === 'large';
  const isLeftHanded = settings.leftHandedControls;

  const btnDpadClass = isLarge
    ? 'w-18 h-18 text-2xl'
    : 'w-14 h-14 text-xl';

  const btnJumpClass = isLarge
    ? 'w-24 h-24 text-xl'
    : 'w-20 h-20 text-lg';

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-30 flex flex-col justify-between p-3 md:p-5">
      {/* Top Status Bar: Level info, Gems, Time, Utilities */}
      <div className="flex items-center justify-between w-full">
        {/* Left: Level Label */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-slate-900/85 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-md">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-display">
              {level.worldId.replace(/_/g, ' ')}
            </span>
            <span className="font-display font-bold text-xs md:text-sm text-white">
              Lvl {level.id} · {level.name}
            </span>
          </div>
        </div>

        {/* Center: 3 Collectible Gem Sockets & Key */}
        <div className="flex items-center gap-2 bg-slate-900/85 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-md pointer-events-auto">
          {[0, 1, 2].map((idx) => {
            const collected = collectedGems.has(idx);
            return (
              <svg
                key={idx}
                className={`w-5 h-5 transition-transform duration-200 ${
                  collected ? 'text-amber-400 scale-110 drop-shadow-md' : 'text-slate-600'
                }`}
                viewBox="0 0 24 24"
                fill={collected ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="12 2 22 12 12 22 2 12" />
              </svg>
            );
          })}

          {hasKey && (
            <div className="flex items-center ml-1 pl-2 border-l border-slate-700 text-yellow-400 animate-pulse">
              <Key className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Right: Timer, Deaths, Pause & Mute */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Timer & Deaths */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/85 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-mono-numbers text-slate-200 shadow-md">
            <span>⏱ {elapsedSeconds.toFixed(1)}s</span>
            {deaths > 0 && <span className="text-red-400">💀 {deaths}</span>}
          </div>

          {/* Quick Restart */}
          <button
            onClick={onRestart}
            title="Restart Level"
            tabIndex={-1}
            className="p-2 rounded-xl bg-slate-900/85 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-md active:scale-90"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Mute Toggle */}
          <button
            onClick={onToggleMute}
            title="Toggle Mute"
            tabIndex={-1}
            className="p-2 rounded-xl bg-slate-900/85 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-md active:scale-90"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Pause */}
          <button
            onClick={onPause}
            title="Pause (Esc / P)"
            tabIndex={-1}
            className="p-2 rounded-xl bg-slate-900/85 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-md active:scale-90"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Virtual Touch Gamepad Controls */}
      <div
        className={`w-full flex items-end justify-between pb-2 md:pb-4 pointer-events-none no-touch-callout ${
          isLeftHanded ? 'flex-row-reverse' : ''
        }`}
      >
        {/* D-Pad: Left & Right Movement */}
        <div className="pointer-events-auto flex items-center gap-3">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onTouchLeftStart();
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              onTouchLeftEnd();
            }}
            onPointerCancel={onTouchLeftEnd}
            onPointerLeave={onTouchLeftEnd}
            className={`${btnDpadClass} rounded-2xl bg-slate-900/80 active:bg-emerald-600/90 border-2 border-slate-700/90 active:border-emerald-400 text-white font-black flex items-center justify-center shadow-lg active:scale-95 transition-transform no-touch-callout`}
            aria-label="Move Left"
          >
            ◀
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onTouchRightStart();
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              onTouchRightEnd();
            }}
            onPointerCancel={onTouchRightEnd}
            onPointerLeave={onTouchRightEnd}
            className={`${btnDpadClass} rounded-2xl bg-slate-900/80 active:bg-emerald-600/90 border-2 border-slate-700/90 active:border-emerald-400 text-white font-black flex items-center justify-center shadow-lg active:scale-95 transition-transform no-touch-callout`}
            aria-label="Move Right"
          >
            ▶
          </button>
        </div>

        {/* Jump Button: Large tactile button */}
        <div className="pointer-events-auto">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onTouchJumpStart();
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              onTouchJumpEnd();
            }}
            onPointerCancel={onTouchJumpEnd}
            onPointerLeave={onTouchJumpEnd}
            className={`${btnJumpClass} rounded-full bg-gradient-to-tr from-red-600/90 to-rose-500/90 active:from-red-500 active:to-rose-400 border-3 border-rose-300/80 active:border-white text-white font-display font-black tracking-wider flex items-center justify-center shadow-xl active:scale-95 transition-transform no-touch-callout`}
            aria-label="Jump"
          >
            JUMP
          </button>
        </div>
      </div>
    </div>
  );
};
