/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameCanvasRenderer } from './game/canvasRenderer';
import { soundManager } from './game/audio';
import { buildLevel } from './game/levels';
import {
  createInitialBallState,
  PhysicsInput,
  StepEvents,
  updateBallPhysics,
} from './game/physics';
import {
  DEFAULT_SETTINGS,
  DEFAULT_SAVE_DATA,
  GameSaveData,
  loadSaveData,
  loadSettings,
  recordLevelCompletion,
  saveSaveData,
  saveSettings,
} from './game/storage';
import { GameSettings, LevelDefinition, WorldId } from './types/game';

// UI Components
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { PauseModal } from './components/PauseModal';
import { VictoryModal } from './components/VictoryModal';
import { WorldSelectModal } from './components/WorldSelectModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { SettingsModal } from './components/SettingsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { AndroidExportModal } from './components/AndroidExportModal';

type AppState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'VICTORY';

export default function App() {
  const [appState, setAppState] = useState<AppState>('TITLE');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [currentLevel, setCurrentLevel] = useState<LevelDefinition>(() => buildLevel(1));
  const [saveData, setSaveData] = useState<GameSaveData>(DEFAULT_SAVE_DATA);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [isMuted, setIsMuted] = useState(false);

  // Modals
  const [showWorldSelect, setShowWorldSelect] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [selectedWorldId, setSelectedWorldId] = useState<WorldId>('green_hills');
  const [showSettings, setShowSettings] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showAndroidExport, setShowAndroidExport] = useState(false);

  // Victory Run snapshot stats
  const [victoryStats, setVictoryStats] = useState({
    stars: 1,
    time: 0,
    gems: 0,
    deaths: 0,
    isRecord: false,
  });

  // HUD stats throttled to React state
  const [hudStats, setHudStats] = useState({
    time: 0,
    deaths: 0,
    gems: new Set<number>(),
    hasKey: false,
  });

  // Refs for simulation loop
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<GameCanvasRenderer | null>(null);
  const ballStateRef = useRef(createInitialBallState(64, 128));
  const currentLevelRef = useRef<LevelDefinition>(currentLevel);
  const appStateRef = useRef<AppState>(appState);
  const settingsRef = useRef<GameSettings>(settings);

  // Input states
  const inputRef = useRef<PhysicsInput>({
    left: false,
    right: false,
    jumpHeld: false,
    jumpPressed: false,
  });

  // Level run tracking
  const runTimeRef = useRef<number>(0);
  const deathsCountRef = useRef<number>(0);
  const screenShakeRef = useRef<number>(0);

  // Keep refs synced
  useEffect(() => {
    appStateRef.current = appState;
    if (appState === 'TITLE') document.body.dataset.state = 'title';
    else if (appState === 'PLAYING') document.body.dataset.state = 'playing';
    else if (appState === 'PAUSED') document.body.dataset.state = 'paused';
    else if (appState === 'VICTORY') document.body.dataset.state = 'gameover';
  }, [appState]);

  useEffect(() => {
    currentLevelRef.current = currentLevel;
  }, [currentLevel]);

  useEffect(() => {
    settingsRef.current = settings;
    soundManager.setVolumes(settings.sfxVolume, settings.musicVolume);
  }, [settings]);

  // Load save data & settings on mount
  useEffect(() => {
    const loadedSave = loadSaveData();
    const loadedSettings = loadSettings();
    setSaveData(loadedSave);
    setSettings(loadedSettings);
    setCurrentLevelId(loadedSave.currentLevelId || 1);
    setCurrentLevel(buildLevel(loadedSave.currentLevelId || 1));

    // Handle ?autostart=1 query parameter
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('autostart') === '1') {
        const lvl = parseInt(urlParams.get('level') || '1', 10);
        startPlayingLevel(lvl);
      }
    }
  }, []);

  const startPlayingLevel = useCallback((levelId: number) => {
    const lvl = buildLevel(levelId);
    setCurrentLevelId(levelId);
    setCurrentLevel(lvl);
    currentLevelRef.current = lvl;

    // Reset ball & trackers
    ballStateRef.current = createInitialBallState(lvl.spawnX, lvl.spawnY);
    runTimeRef.current = 0;
    deathsCountRef.current = 0;
    screenShakeRef.current = 0;

    setHudStats({
      time: 0,
      deaths: 0,
      gems: new Set<number>(),
      hasKey: false,
    });

    setAppState('PLAYING');
    soundManager.startWorldBgm(lvl.worldId);
  }, []);

  // Main 60 FPS Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderer = new GameCanvasRenderer(ctx);
    rendererRef.current = renderer;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        renderer.resize(parent.clientWidth, parent.clientHeight);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    let animId: number;
    let lastTime = performance.now();
    let hudThrottleTimer = 0;

    const gameLoop = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05); // Clamp dt

      const currentState = appStateRef.current;
      const level = currentLevelRef.current;
      const ball = ballStateRef.current;

      if (currentState === 'PLAYING') {
        runTimeRef.current += dt;

        // Step physics
        const events: StepEvents = {
          jumped: false,
          landed: false,
          bouncedOnSpring: false,
          died: false,
          hitWall: false,
        };

        updateBallPhysics(ball, inputRef.current, level, dt, events);

        // Reset edge-triggered jumpPressed after physics step
        inputRef.current.jumpPressed = false;

        // Handle Audio & Juice Events
        if (events.jumped) {
          soundManager.playJump();
          renderer.addParticleBurst(ball.x, ball.y + ball.radius, '#ffffff', 4, 60);
        }
        if (events.landed) {
          soundManager.playLand();
          renderer.addParticleBurst(ball.x, ball.y + ball.radius, '#94a3b8', 6, 80);
        }
        if (events.bouncedOnSpring) {
          soundManager.playSpring();
          renderer.addParticleBurst(ball.x, ball.y + ball.radius, '#f87171', 8, 140);
        }
        if (events.died) {
          soundManager.playDie();
          deathsCountRef.current += 1;
          if (settingsRef.current.screenShake) {
            screenShakeRef.current = 1.0;
          }
          renderer.addParticleBurst(ball.x, ball.y, '#ef4444', 18, 180);
        }

        // Entity overlaps: Gems, Keys, Checkpoints, Goal
        for (const entity of level.entities) {
          const overlap =
            ball.x + ball.radius > entity.x &&
            ball.x - ball.radius < entity.x + entity.width &&
            ball.y + ball.radius > entity.y &&
            ball.y - ball.radius < entity.y + entity.height;

          if (overlap) {
            if (entity.type === 'gem' && !entity.collected && !ball.collectedGems.has(entity.gemIndex)) {
              entity.collected = true;
              ball.collectedGems.add(entity.gemIndex);
              soundManager.playGem(entity.gemIndex);
              renderer.addParticleBurst(entity.x + 10, entity.y + 10, '#fbbf24', 12, 110);
            } else if (entity.type === 'key' && !entity.collected && !ball.hasKey) {
              entity.collected = true;
              ball.hasKey = true;
              soundManager.playDoorUnlock();
              renderer.addParticleBurst(entity.x + 10, entity.y + 10, '#facc15', 14, 120);
            } else if (entity.type === 'checkpoint' && !entity.active) {
              entity.active = true;
              ball.lastCheckpointX = entity.x + 12;
              ball.lastCheckpointY = entity.y + entity.height - ball.radius;
              soundManager.playCheckpoint();
              renderer.addParticleBurst(entity.x + 12, entity.y + 16, '#22c55e', 14, 100);
            } else if (entity.type === 'goal') {
              // Level Completed!
              soundManager.playVictory();
              renderer.addParticleBurst(entity.x + 16, entity.y + 24, '#fde047', 28, 220);

              const timeSec = runTimeRef.current;
              const gemsCount = ball.collectedGems.size;
              const deathsCount = deathsCountRef.current;

              const res = recordLevelCompletion(level.id, timeSec, gemsCount, deathsCount);
              setSaveData(loadSaveData());

              setVictoryStats({
                stars: res.stars,
                time: timeSec,
                gems: gemsCount,
                deaths: deathsCount,
                isRecord: res.isNewRecord,
              });

              setAppState('VICTORY');
              break;
            }
          }
        }

        // Update Camera
        renderer.updateCamera(ball, level, canvas.width, canvas.height, dt);

        // Update Particles
        renderer.updateParticles(dt);

        // Decay screen shake
        if (screenShakeRef.current > 0) {
          screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 3.5);
        }

        // Throttle React HUD updates to ~10 Hz
        hudThrottleTimer += dt;
        if (hudThrottleTimer >= 0.1) {
          hudThrottleTimer = 0;
          setHudStats({
            time: runTimeRef.current,
            deaths: deathsCountRef.current,
            gems: new Set(ball.collectedGems),
            hasKey: ball.hasKey,
          });
        }
      }

      // Render world
      renderer.render(ball, level, runTimeRef.current, screenShakeRef.current);

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Keyboard Handlers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        inputRef.current.left = true;
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        inputRef.current.right = true;
      }
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        if (appStateRef.current === 'TITLE') {
          startPlayingLevel(saveData.unlockedLevel || 1);
        } else if (appStateRef.current === 'VICTORY') {
          startPlayingLevel(Math.min(100, currentLevelRef.current.id + 1));
        } else {
          inputRef.current.jumpHeld = true;
          inputRef.current.jumpPressed = true;
        }
      }
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (appStateRef.current === 'PLAYING') {
          setAppState('PAUSED');
        } else if (appStateRef.current === 'PAUSED') {
          setAppState('PLAYING');
        }
      }
      if (e.code === 'KeyR') {
        if (appStateRef.current === 'PLAYING') {
          startPlayingLevel(currentLevelRef.current.id);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        inputRef.current.left = false;
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        inputRef.current.right = false;
      }
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        inputRef.current.jumpHeld = false;
      }
    };

    const onBlur = () => {
      // Clear held keys on blur
      inputRef.current.left = false;
      inputRef.current.right = false;
      inputRef.current.jumpHeld = false;
      inputRef.current.jumpPressed = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [saveData.unlockedLevel, startPlayingLevel]);

  // Touch button callbacks
  const handleTouchLeftStart = () => {
    inputRef.current.left = true;
  };
  const handleTouchLeftEnd = () => {
    inputRef.current.left = false;
  };
  const handleTouchRightStart = () => {
    inputRef.current.right = true;
  };
  const handleTouchRightEnd = () => {
    inputRef.current.right = false;
  };
  const handleTouchJumpStart = () => {
    inputRef.current.jumpHeld = true;
    inputRef.current.jumpPressed = true;
  };
  const handleTouchJumpEnd = () => {
    inputRef.current.jumpHeld = false;
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMute(next);
  };

  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleResetProgress = () => {
    saveSaveData(DEFAULT_SAVE_DATA);
    setSaveData(DEFAULT_SAVE_DATA);
    setCurrentLevelId(1);
    setCurrentLevel(buildLevel(1));
    setShowSettings(false);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none no-touch-callout">
      {/* 2D Game Canvas (Always mounted and isolated from state re-renders) */}
      <div className="absolute inset-0 w-full h-full">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Screen 1: Title Screen */}
      {appState === 'TITLE' && (
        <div className="absolute inset-0 z-40">
          <TitleScreen
            onStartGame={() => startPlayingLevel(saveData.unlockedLevel || 1)}
            onOpenWorlds={() => setShowWorldSelect(true)}
            onOpenSettings={() => setShowSettings(true)}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
            onOpenAndroidExport={() => setShowAndroidExport(true)}
            saveData={saveData}
          />
        </div>
      )}

      {/* Screen 2: Active Gameplay HUD */}
      {(appState === 'PLAYING' || appState === 'PAUSED') && (
        <GameHUD
          level={currentLevel}
          elapsedSeconds={hudStats.time}
          deaths={hudStats.deaths}
          collectedGems={hudStats.gems}
          hasKey={hudStats.hasKey}
          onPause={() => setAppState('PAUSED')}
          onRestart={() => startPlayingLevel(currentLevel.id)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          settings={settings}
          onTouchLeftStart={handleTouchLeftStart}
          onTouchLeftEnd={handleTouchLeftEnd}
          onTouchRightStart={handleTouchRightStart}
          onTouchRightEnd={handleTouchRightEnd}
          onTouchJumpStart={handleTouchJumpStart}
          onTouchJumpEnd={handleTouchJumpEnd}
        />
      )}

      {/* Screen 3: Pause Modal */}
      {appState === 'PAUSED' && (
        <PauseModal
          level={currentLevel}
          onResume={() => setAppState('PLAYING')}
          onRestart={() => startPlayingLevel(currentLevel.id)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenLevelSelect={() => {
            setSelectedWorldId(currentLevel.worldId);
            setShowLevelSelect(true);
          }}
          onReturnToTitle={() => {
            setAppState('TITLE');
            soundManager.stopBgm();
          }}
        />
      )}

      {/* Screen 4: Victory Modal */}
      {appState === 'VICTORY' && (
        <VictoryModal
          level={currentLevel}
          starsEarned={victoryStats.stars}
          timeSeconds={victoryStats.time}
          gemsCount={victoryStats.gems}
          deathsCount={victoryStats.deaths}
          isNewRecord={victoryStats.isRecord}
          onNextLevel={() => {
            const nextLvl = Math.min(100, currentLevel.id + 1);
            startPlayingLevel(nextLvl);
          }}
          onReplay={() => startPlayingLevel(currentLevel.id)}
          onOpenLevelSelect={() => {
            setSelectedWorldId(currentLevel.worldId);
            setShowLevelSelect(true);
          }}
        />
      )}

      {/* Modal: World Select */}
      {showWorldSelect && (
        <WorldSelectModal
          onClose={() => setShowWorldSelect(false)}
          onSelectWorld={(wId) => {
            setSelectedWorldId(wId);
            setShowWorldSelect(false);
            setShowLevelSelect(true);
          }}
          saveData={saveData}
        />
      )}

      {/* Modal: Level Select */}
      {showLevelSelect && (
        <LevelSelectModal
          worldId={selectedWorldId}
          onClose={() => setShowLevelSelect(false)}
          onBackToWorlds={() => {
            setShowLevelSelect(false);
            setShowWorldSelect(true);
          }}
          onPlayLevel={(lvlId) => {
            setShowLevelSelect(false);
            startPlayingLevel(lvlId);
          }}
          saveData={saveData}
        />
      )}

      {/* Modal: Settings */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
          onResetProgress={handleResetProgress}
        />
      )}

      {/* Modal: How to Play */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {/* Modal: Android Export */}
      {showAndroidExport && (
        <AndroidExportModal onClose={() => setShowAndroidExport(false)} />
      )}
    </div>
  );
}
