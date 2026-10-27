/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { Play, Compass, Settings, HelpCircle, Download, Trophy } from 'lucide-react';
import { GameSaveData } from '../game/storage';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenWorlds: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onOpenAndroidExport: () => void;
  saveData: GameSaveData;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenWorlds,
  onOpenSettings,
  onOpenHowToPlay,
  onOpenAndroidExport,
  saveData,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated bouncing hero centerpiece
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;
    let ballY = 60;
    let vy = 0;
    let squashX = 1;
    let squashY = 1;
    const floorY = 135;
    const radius = 24;

    const loop = () => {
      time += 0.016;
      vy += 980 * 0.016;
      ballY += vy * 0.016;

      if (ballY + radius >= floorY) {
        ballY = floorY - radius;
        vy = -450;
        squashX = 1.4;
        squashY = 0.65;
      }

      squashX += (1 - squashX) * 0.2;
      squashY += (1 - squashY) * 0.2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      const shadowW = radius * squashX * (1 - (floorY - ballY) / 200);
      ctx.ellipse(canvas.width / 2, floorY + 4, Math.max(4, shadowW), 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Floor line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 80, floorY + 5);
      ctx.lineTo(canvas.width / 2 + 80, floorY + 5);
      ctx.stroke();

      // Bouncy Ball
      ctx.save();
      ctx.translate(canvas.width / 2, ballY);
      ctx.scale(squashX, squashY);

      const grad = ctx.createRadialGradient(-6, -6, 4, 0, 0, radius);
      grad.addColorStop(0, '#f87171');
      grad.addColorStop(0.6, '#dc2626');
      grad.addColorStop(1, '#991b1b');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(-7, -8, 6, 0, Math.PI * 2);
      ctx.fill();

      // Expressive eyes looking forward
      const eyeLookX = Math.sin(time * 2) * 2;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(eyeLookX - 3, -2, 5, 7, 0, 0, Math.PI * 2);
      ctx.ellipse(eyeLookX + 7, -2, 5, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(eyeLookX - 2, -2, 3, 0, Math.PI * 2);
      ctx.arc(eyeLookX + 8, -2, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeLookX - 3, -4, 1.2, 0, Math.PI * 2);
      ctx.arc(eyeLookX + 7, -4, 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4 md:p-6 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white select-none">
      {/* Background Ambient Circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Bar: Progress & Native Android Export */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-300 font-mono-numbers">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Unlocked: Level {saveData.unlockedLevel} / 100</span>
          <span className="text-slate-600">·</span>
          <span className="text-amber-400">★ {saveData.totalGems} Gems</span>
        </div>

        <button
          onClick={onOpenAndroidExport}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Android Project & APK</span>
        </button>
      </div>

      {/* Center: Title Lockup & Hero Ball */}
      <div className="flex flex-col items-center text-center my-auto z-10 max-w-md">
        {/* Bespoke SVG Title Lockup */}
        <div className="flex items-center justify-center gap-3 mb-1">
          <svg className="w-10 h-10 drop-shadow-md" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" fill="url(#ballGrad)" />
            <circle cx="14" cy="14" r="5" fill="white" fillOpacity="0.75" />
            <ellipse cx="20" cy="21" rx="4" ry="6" fill="white" />
            <circle cx="21" cy="21" r="2.5" fill="#1e1b4b" />
            <defs>
              <radialGradient id="ballGrad" cx="0.3" cy="0.3" r="0.8">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="70%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#991b1b" />
              </radialGradient>
            </defs>
          </svg>
          <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-lg">
            BOUNCY
          </h1>
        </div>

        <p className="font-display text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-amber-400 mb-2">
          Pocket Quest · 2D Platformer
        </p>

        {/* Hero Interactive Animation */}
        <canvas ref={canvasRef} width={260} height={160} className="w-[200px] h-[120px] my-1" />

        {/* Primary CTA */}
        <div className="flex flex-col w-full gap-2.5 mt-2">
          <button
            data-start="true"
            onClick={onStartGame}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-display font-bold text-lg tracking-wide shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>PLAY LEVEL {saveData.unlockedLevel}</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onOpenWorlds}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Worlds</span>
            </button>

            <button
              onClick={onOpenHowToPlay}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>How to Play</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Hint Line */}
      <div className="z-10 text-center text-[11px] md:text-xs text-slate-400 tracking-wide">
        <span>A / D or Arrow Keys: Roll</span>
        <span className="mx-2 text-slate-600">·</span>
        <span>Space / W: Jump</span>
        <span className="mx-2 text-slate-600">·</span>
        <span>Esc: Pause</span>
        <span className="mx-2 text-slate-600">·</span>
        <span className="text-emerald-400">Touch Controls Ready</span>
      </div>
    </div>
  );
};
