/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ArrowRight, ShieldAlert, Sparkles, Key, CheckCircle2 } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 md:p-6 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="font-display text-lg font-bold text-white tracking-wide">HOW TO PLAY</h2>
            <p className="text-xs text-slate-400">Master the physics of Bouncy</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex flex-col gap-3 my-4 overflow-y-auto pr-1 text-xs text-slate-300">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <span className="text-base font-black">●</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-0.5">Momentum & Rolling</h3>
              <p className="text-slate-400 leading-relaxed">
                Use <strong>A / D</strong> or the on-screen left/right buttons. Bouncy has realistic acceleration and friction. Watch for ice surfaces in World 3 which have reduced friction!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ArrowRight className="w-4 h-4 -rotate-45" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-0.5">Dynamic Jumping</h3>
              <p className="text-slate-400 leading-relaxed">
                Tap <strong>Space</strong> or the JUMP button for a short hop, or hold it down for maximum height. Built-in <em>coyote time</em> and <em>jump buffering</em> ensure jumps are snappy and forgiving even if timed slightly early or off an edge.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-0.5">Springs & Gems</h3>
              <p className="text-slate-400 leading-relaxed">
                Bounce onto red spring pads to launch high into secret areas! Each level contains 3 collectible golden gems. Finding all 3 rewards bonus stars.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-0.5">Hazards & Checkpoints</h3>
              <p className="text-slate-400 leading-relaxed">
                Avoid sharp red spikes and patrol hazards. Passing flagposts activates checkpoints so you instantly respawn right there if you take a tumble.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-0.5">Keys & The Golden Portal</h3>
              <p className="text-slate-400 leading-relaxed">
                Some levels feature locked barriers that require a key. Touch the glowing golden portal gate at the end of each stage to complete the level and unlock the next challenge!
              </p>
            </div>
          </div>
        </div>

        {/* Got it CTA */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-wide transition-colors cursor-pointer shrink-0"
        >
          LET'S BOUNCE!
        </button>
      </div>
    </div>
  );
};
