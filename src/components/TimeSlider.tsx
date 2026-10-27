import React, { useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock, Droplets } from 'lucide-react';

interface TimeSliderProps {
  currentTimeHours: number;
  maxTimeHours: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSetTime: (hour: number) => void;
  playbackSpeed: number;
  onSetSpeed: (speed: number) => void;
  totalSystemDemand: number;
  flowUnits: string;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({
  currentTimeHours,
  maxTimeHours,
  isPlaying,
  onTogglePlay,
  onSetTime,
  playbackSpeed,
  onSetSpeed,
  totalSystemDemand,
  flowUnits
}) => {
  // Extended period animation timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(250, 1000 / playbackSpeed);
    const timer = setInterval(() => {
      onSetTime((currentTimeHours + 1) % (maxTimeHours + 1));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, currentTimeHours, maxTimeHours, playbackSpeed, onSetTime]);

  const formatHourString = (hours: number) => {
    const h = Math.floor(hours) % 24;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(h)}:00 (${displayH}:00 ${ampm})`;
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-2.5 shadow-2xl flex items-center space-x-4 w-[600px] max-w-[90vw]">
        {/* Playback Transport Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onSetTime(Math.max(0, currentTimeHours - 1))}
            title="Step Back 1 Hour"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause Simulation' : 'Play 24-hr Simulation'}
            className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-950/50 transition-all hover:scale-105"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={() => onSetTime((currentTimeHours + 1) % (maxTimeHours + 1))}
            title="Step Forward 1 Hour"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Time Scrubber Slider */}
        <div className="flex-1 flex flex-col space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-cyan-300 font-semibold font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{formatHourString(currentTimeHours)}</span>
            </div>

            <div className="flex items-center space-x-1 text-slate-400 text-[11px] font-mono">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span>Total Demand:</span>
              <span className="text-slate-200 font-medium">{totalSystemDemand.toFixed(1)} {flowUnits}</span>
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={maxTimeHours}
            step={1}
            value={currentTimeHours}
            onChange={(e) => onSetTime(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />

          <div className="flex justify-between text-[9px] text-slate-500 font-mono px-0.5">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </div>

        {/* Speed Selector */}
        <button
          onClick={() => {
            const nextSpeed = playbackSpeed === 1 ? 2 : playbackSpeed === 2 ? 4 : 1;
            onSetSpeed(nextSpeed);
          }}
          title="Playback Speed"
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold border border-slate-700 transition-colors"
        >
          {playbackSpeed}x
        </button>
      </div>
    </div>
  );
};
