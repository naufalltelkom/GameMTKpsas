import React, { useState, useEffect } from 'react';
import { PlayerStats } from '../game/types';
import { Volume2, VolumeX, Compass, Eye, EyeOff, ShieldAlert, KeyRound, Sparkles } from 'lucide-react';
import { sound } from '../game/audio';

interface HUDProps {
  stats: PlayerStats;
  maze: number[][];
  mazeSize: number;
  playerPos: { x: number; z: number };
  playerYaw: number;
  onOpenMenu: () => void;
  onOpenTerminal: () => void;
  onInteract: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  maze,
  mazeSize,
  playerPos,
  playerYaw,
  onOpenMenu,
  onOpenTerminal,
  onInteract,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [showMinimap, setShowMinimap] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);
  const [fps, setFps] = useState(60);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;
    const calcFps = (now: number) => {
      frameCount++;
      if (now - lastTime >= 700) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(calcFps);
    };
    animId = requestAnimationFrame(calcFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  const toggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const minutes = Math.floor(stats.timeLeft / 60);
  const seconds = stats.timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Heart icons for health
  const hearts = Array.from({ length: stats.maxLives }, (_, i) => i < stats.lives);

  // Dynamic Objective Text
  let objectiveText = 'Cari terminal enkripsi di dalam lorong Backrooms.';
  if (stats.isExitUnlocked) {
    objectiveText = 'AKSES DIBERIKAN! Lari menuju pintu keluar sekarang!';
  } else if (stats.isNearTerminal) {
    objectiveText = 'Terminal ditemukan! Tekan [E] untuk memecahkan sandi Affine.';
  } else if (stats.distanceToTerminal < 16) {
    objectiveText = `Sinyal terminal terdeteksi (${Math.round(stats.distanceToTerminal)}m). Terus telusuri lorong.`;
  }

  // Calculate minimap normalized coordinates
  const cellSize = 4.0;
  const offset = (mazeSize - 1) / 2;
  const playerCol = Math.min(mazeSize - 1, Math.max(0, playerPos.x / cellSize + offset));
  const playerRow = Math.min(mazeSize - 1, Math.max(0, playerPos.z / cellSize + offset));

  const termCol = mazeSize - 3;
  const termRow = mazeSize - 3;
  const exitCol = mazeSize - 2;
  const exitRow = mazeSize - 2;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between overflow-hidden">
      {/* 1. TOP HEADER BAR */}
      <header className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Left: Brand & Menu Button */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => {
              sound.playClick();
              onOpenMenu();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/60 rounded text-xs font-mono tracking-wider transition-colors"
          >
            ← MENU
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-widest text-sm sm:text-base text-white">
                MATH<span className="text-[#6fffea]">CIPHER</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-[#d6c77a]/20 text-[#d6c77a] border border-[#d6c77a]/40">
                {stats.difficulty}
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-950/60 text-emerald-400 border border-emerald-700/40">
                {fps} FPS
              </span>
            </div>
            <p className="text-[9px] font-mono text-neutral-400 tracking-widest hidden sm:block">
              THE LAST EXIT // AFFINE CIPHER
            </p>
          </div>
        </div>

        {/* Center: Objective Banner */}
        <div className="hidden md:flex items-center gap-2.5 px-4 py-2 bg-black/60 border border-neutral-700/60 backdrop-blur-sm rounded shadow-lg max-w-md">
          <span
            className={`w-2 h-2 rounded-full ${
              stats.isExitUnlocked
                ? 'bg-[#42e6bf] shadow-[0_0_8px_#42e6bf]'
                : stats.isNearTerminal
                ? 'bg-[#ffcf33] shadow-[0_0_8px_#ffcf33]'
                : 'bg-[#6fffea] shadow-[0_0_6px_#6fffea]'
            }`}
          />
          <span className="text-xs font-medium text-neutral-200 truncate">
            {objectiveText}
          </span>
        </div>

        {/* Right: Stats Cluster */}
        <div className="flex items-center gap-4 sm:gap-6 pointer-events-auto">
          {/* Audio Mute Toggle */}
          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 bg-neutral-900/70 hover:bg-neutral-800 border border-neutral-700/60 text-neutral-300 hover:text-white rounded transition-colors"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Health */}
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-neutral-400 tracking-wider">
              HEALTH
            </span>
            <div className="flex items-center gap-1">
              {hearts.map((active, idx) => (
                <span
                  key={idx}
                  className={`text-base leading-none transition-colors ${
                    active ? 'text-[#ff5252]' : 'text-neutral-600'
                  }`}
                >
                  ♥
                </span>
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-neutral-400 tracking-wider">
              TIME
            </span>
            <span
              className={`font-mono text-base font-bold tabular-nums ${
                stats.timeLeft < 60
                  ? 'text-[#ff5252] animate-pulse'
                  : 'text-white'
              }`}
            >
              {timeFormatted}
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Objective Line */}
      <div className="md:hidden px-4 py-1.5 mx-3 bg-black/70 border border-neutral-800 rounded text-center text-[11px] text-neutral-300">
        {objectiveText}
      </div>

      {/* 2. CENTER RETICLE / CROSSHAIR */}
      <div className="pointer-events-none self-center justify-self-center my-auto flex flex-col items-center opacity-40">
        <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
      </div>

      {/* 3. INTERACTION PROMPT POPUP */}
      {(stats.isNearTerminal || (stats.isNearExit && stats.isExitUnlocked)) && (
        <div className="pointer-events-auto self-center mb-6 animate-bounce">
          <button
            onClick={() => {
              sound.playClick();
              if (stats.isNearTerminal) onOpenTerminal();
              else onInteract();
            }}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-neutral-900/90 hover:bg-neutral-800 border-2 border-[#6fffea] text-white rounded-lg shadow-[0_0_20px_rgba(111,255,234,0.4)] font-mono text-xs sm:text-sm font-bold tracking-wider cursor-pointer"
          >
            <KeyRound size={18} className="text-[#6fffea]" />
            {stats.isNearTerminal ? (
              <span>
                TEKAN <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-[#d6c77a]">E</kbd> ATAU KLIK UNTUK DEKRIPSI TERMINAL
              </span>
            ) : (
              <span>
                TEKAN <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-[#42e6bf]">E</kbd> UNTUK BUKA PINTU KELUAR!
              </span>
            )}
          </button>
        </div>
      )}

      {/* 4. BOTTOM CLUSTER: RADAR SCANNER & CONTROLS DOCK */}
      <footer className="p-3 sm:p-5 flex items-end justify-between gap-4 pointer-events-none">
        {/* Minimap / Radar HUD (Larger & Clearer) */}
        <div className="pointer-events-auto flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-300 px-1">
            <span className="flex items-center gap-1.5 font-bold">
              <Compass size={14} className="text-[#6fffea]" /> RADAR MAP
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMinimap(!showMinimap)}
                aria-label={showMinimap ? 'Sembunyikan Map' : 'Tampilkan Map'}
                className="hover:text-white text-neutral-400 transition-colors p-0.5"
              >
                {showMinimap ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {showMinimap && (
            <div className="flex flex-col gap-1 bg-[#08100c]/95 border border-[#6fffea]/40 rounded-lg p-1.5 shadow-[0_0_20px_rgba(0,0,0,0.85)] backdrop-blur-md">
              {/* Scaled to exactly 40% of previous size: 70px mobile / 90px desktop */}
              <div className="relative w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] bg-[#040907] rounded overflow-hidden border border-neutral-800">
                {/* Radar Grid Lines */}
                <div className="absolute inset-0 bg-[radial-gradient(#6fffea20_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none" />

                <svg
                  viewBox={`0 0 ${mazeSize} ${mazeSize}`}
                  className="w-full h-full"
                >
                  {/* Maze Corridors & Yellow Walls */}
                  {maze.map((row, r) =>
                    row.map((cell, c) => (
                      <rect
                        key={`${r}-${c}`}
                        x={c}
                        y={r}
                        width={1}
                        height={1}
                        fill={cell === 1 ? '#eed868' : '#08130c'}
                        stroke={cell === 1 ? '#a89538' : '#030805'}
                        strokeWidth={0.06}
                      />
                    ))
                  )}

                  {/* Start Point Marker (1, 1) */}
                  <circle
                    cx={1.5}
                    cy={1.5}
                    r={0.4}
                    fill="#889988"
                    opacity={0.6}
                  />

                  {/* Exit Gate Indicator */}
                  <g>
                    <rect
                      x={exitCol - 0.2}
                      y={exitRow - 0.2}
                      width={1.4}
                      height={1.4}
                      fill={stats.isExitUnlocked ? '#42e6bf' : '#ff4d5e'}
                      stroke={stats.isExitUnlocked ? '#6fffea' : '#ff9999'}
                      strokeWidth={0.12}
                      rx={0.2}
                    />
                    <text
                      x={exitCol + 0.5}
                      y={exitRow - 0.5}
                      fill={stats.isExitUnlocked ? '#42e6bf' : '#ff4d5e'}
                      fontSize={0.9}
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      EXIT
                    </text>
                  </g>

                  {/* Terminal Indicator */}
                  <g>
                    <circle
                      cx={termCol + 0.5}
                      cy={termRow + 0.5}
                      r={0.9}
                      fill="#6fffea"
                      stroke="#ffffff"
                      strokeWidth={0.12}
                    />
                    <text
                      x={termCol + 0.5}
                      y={termRow - 0.5}
                      fill="#6fffea"
                      fontSize={0.9}
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      TERM
                    </text>
                  </g>

                  {/* Player Blip & Heading Cone — UNGU / PURPLE */}
                  <g
                    transform={`translate(${playerCol + 0.5}, ${
                      playerRow + 0.5
                    }) rotate(${(-playerYaw * 180) / Math.PI})`}
                  >
                    {/* Flashlight beam projection (purple glow) */}
                    <polygon
                      points="0,0 -2.4,-5.2 2.4,-5.2"
                      fill="rgba(192, 132, 252, 0.55)"
                    />
                    {/* Forward pointing arrow */}
                    <polygon
                      points="0,-1.4 -0.6,0.6 0.6,0.6"
                      fill="#ffffff"
                    />
                    {/* Player glowing dot in vibrant PURPLE */}
                    <circle
                      cx={0}
                      cy={0}
                      r={0.95}
                      fill="#a855f7"
                      stroke="#ffffff"
                      strokeWidth={0.18}
                    />
                  </g>
                </svg>

                {/* Radar circular boundary styling */}
                <div className="absolute inset-0 rounded border border-[#6fffea]/30 pointer-events-none" />
              </div>

              {/* Tactical Compact Legend & Coordinates */}
              <div className="flex flex-col gap-0.5 text-[8px] sm:text-[9px] font-mono text-neutral-300 px-0.5 pt-0.5 max-w-[90px]">
                <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-sm bg-[#eed868] inline-block border border-[#a89538]" />
                    <span className="text-[7.5px] sm:text-[8px] text-neutral-300">Tembok</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] inline-block border border-white shadow-[0_0_3px_#a855f7]" />
                    <span className="text-[7.5px] sm:text-[8px] text-[#d8b4fe] font-bold">Anda</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6fffea] inline-block" />
                    <span className="text-[7.5px] sm:text-[8px] text-neutral-300">Term</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-sm inline-block ${
                        stats.isExitUnlocked ? 'bg-[#42e6bf]' : 'bg-[#ff4d5e]'
                      }`}
                    />
                    <span className="text-[7.5px] sm:text-[8px] text-neutral-300">{stats.isExitUnlocked ? 'Exit' : 'Kunci'}</span>
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400 pt-0.5 border-t border-neutral-800 text-[7px] sm:text-[7.5px] leading-tight">
                  <span>T:{Math.round(stats.distanceToTerminal)}m</span>
                  <span>E:{Math.round(stats.distanceToExit)}m</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ergonomic Bottom Controls Dock (collapsible) */}
        <div className="pointer-events-auto flex flex-col items-center mx-auto">
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className="text-[10px] font-mono text-neutral-400 hover:text-white px-2.5 py-0.5 bg-black/60 rounded-t border-t border-x border-neutral-800 transition-colors"
          >
            {isZenMode ? '▲ PETUNJUK KONTROL' : '▼ SEMBUNYIKAN (ZEN)'}
          </button>

          {!isZenMode && (
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 px-4 py-2 bg-neutral-950/85 border border-neutral-800/80 rounded-lg shadow-xl backdrop-blur-sm text-[10px] sm:text-xs font-mono text-neutral-300">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200">
                  W A S D
                </kbd>
                /
                <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200">
                  ↑ ↓ ← →
                </kbd>
                GERAK
              </span>
              <span className="text-neutral-600 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200">
                  SHIFT
                </kbd>
                LARI
              </span>
              <span className="text-neutral-600 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200">
                  DRAG MOUSE
                </kbd>
                ROTASI KAMERA
              </span>
              <span className="text-neutral-600 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[#6fffea]">
                  E
                </kbd>
                INTERAKSI
              </span>
            </div>
          )}
        </div>

        {/* Right side: Sprint / Speed status */}
        <div className="pointer-events-auto flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
            <span>PACE:</span>
            <span
              className={`font-bold ${
                stats.isSprinting ? 'text-[#ffde69]' : 'text-neutral-300'
              }`}
            >
              {stats.isSprinting ? 'SPRINT' : 'WALK'}
            </span>
          </div>
          <div className="w-20 sm:w-24 h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
            <div
              className={`h-full transition-all duration-150 ${
                stats.isSprinting ? 'bg-[#ffde69]' : 'bg-[#6fffea]'
              }`}
              style={{
                width: `${Math.min(100, (stats.speed / 6.5) * 100)}%`,
              }}
            />
          </div>
        </div>
      </footer>
    </div>
  );
};
