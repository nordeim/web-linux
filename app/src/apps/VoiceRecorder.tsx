// ============================================================
// Voice Recorder — Record, playback, waveform visualization & download
// ============================================================

import { useState, useRef, useEffect, memo } from 'react';
import {
  Mic, Play, Pause, Square, Trash2, Download
} from 'lucide-react';
import { z } from 'zod';
import { safeJsonParse } from '@/utils/safeJsonParse';

// ---- Zod Schema for Runtime Validation ----
const RecordingSchema = z.object({
  id: z.string(),
  name: z.string(),
  duration: z.number(),
  date: z.number(),
  waveformData: z.array(z.number()),
  blobUrl: z.string().optional(),
});

// ---- Types ----
interface Recording {
  id: string;
  name: string;
  duration: number;
  date: number;
  waveformData: number[];
  blobUrl?: string;
}

type RecorderState = 'idle' | 'recording' | 'paused' | 'playing';

// ---- Waveform Visualizer ----
const WaveformVisualizer = memo(function WaveformVisualizer({ isActive, isPlaying, waveformData }: { isActive: boolean; isPlaying?: boolean; waveformData?: number[] }) {
  const [bars, setBars] = useState<number[]>(Array(40).fill(4));

  useEffect(() => {
    if (!isActive) {
      if (waveformData && isPlaying) {
        setBars(waveformData);
      } else {
        setBars(Array(40).fill(4));
      }
      return;
    }

    const interval = setInterval(() => {
      setBars(Array.from({ length: 40 }, () => Math.random() * 60 + 8));
    }, 80);
    return () => clearInterval(interval);
  }, [isActive, isPlaying, waveformData]);

  return (
    <div className="flex items-end justify-center gap-1" style={{ height: 80 }}>
      {bars.map((h, i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{
            width: 4,
            height: h,
            background: isPlaying
              ? 'linear-gradient(to top, var(--accent-primary), var(--accent-primary-hover))'
              : 'linear-gradient(to top, #4CAF50, #81C784)',
            opacity: 0.5 + (i / 40) * 0.5,
          }}
        />
      ))}
    </div>
  );
});

// ---- Audio Level Meter ----
const AudioLevelMeter = memo(function AudioLevelMeter({ isRecording }: { isRecording: boolean }) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!isRecording) { setLevel(0); return; }
    const interval = setInterval(() => {
      setLevel(Math.random() * 100);
    }, 50);
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div className="flex items-center gap-0.5" style={{ height: 24 }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{
            width: 3,
            height: Math.min(24, Math.max(4, (level / 100) * 24 * (i / 20))),
            background: level > 80 ? 'var(--accent-error)' : level > 50 ? 'var(--accent-warning)' : 'var(--accent-success)',
          }}
        />
      ))}
    </div>
  );
});

// ---- Helpers ----
const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const generateWaveform = () => Array.from({ length: 40 }, () => Math.random() * 60 + 8);

const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const loadRecordings = (): Recording[] => {
  const saved = localStorage.getItem('ubuntuos_recordings');
  if (!saved) return [];
  return safeJsonParse(saved, z.array(RecordingSchema), []);
};

// ---- Main Voice Recorder ----
export default function VoiceRecorder() {
  const [recorderState, setRecorderState] = useState<RecorderState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>(loadRecordings);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [_playTime, _setPlayTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Persist recordings
  useEffect(() => {
    localStorage.setItem('ubuntuos_recordings', JSON.stringify(recordings));
  }, [recordings]);

  // Timer for recording
  useEffect(() => {
    if (recorderState !== 'recording') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recorderState]);

  // Timer for playback
  useEffect(() => {
    if (!playingId) {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      return;
    }
    playTimerRef.current = setInterval(() => {
      _setPlayTime((prev) => prev + 1);
    }, 1000);
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [playingId]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length === 0) return;
        const blob = new Blob(audioChunksRef.current, { type: 'audio/ogg; codecs=opus' });
        const url = URL.createObjectURL(blob);
        const newRecording: Recording = {
          id: generateId(),
          name: `Recording ${recordings.length + 1}`,
          duration: elapsed,
          date: Date.now(),
          waveformData: generateWaveform(),
          blobUrl: url,
        };
        setRecordings((prev) => [newRecording, ...prev]);
        audioChunksRef.current = [];
      };

      mediaRecorder.start();
      setRecorderState('recording');
      setElapsed(0);
    } catch {
      // Silently ignore permission denied / no mic
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setRecorderState('idle');
  };

  const deleteRecording = (id: string) => {
    setRecordings((prev) => {
      const target = prev.find((r) => r.id === id);
      if (target?.blobUrl) {
        URL.revokeObjectURL(target.blobUrl);
      }
      return prev.filter((r) => r.id !== id);
    });
    if (playingId === id) setPlayingId(null);
  };

  const togglePlay = (recording: Recording) => {
    if (playingId === recording.id) {
      setPlayingId(null);
    } else {
      setPlayingId(recording.id);
      _setPlayTime(0);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4" style={{ color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Voice Recorder</h2>
        <div className="text-xs opacity-50">{recordings.length} recordings</div>
      </div>

      {/* Recording Controls */}
      <div className="flex flex-col items-center gap-3 p-4 rounded-2xl" style={{ background: 'var(--bg-tertiary)' }}>
        <WaveformVisualizer isActive={recorderState === 'recording'} isPlaying={!!playingId} />
        <AudioLevelMeter isRecording={recorderState === 'recording'} />
        <div className="text-2xl font-mono">{formatTime(elapsed)}</div>
        <div className="flex items-center gap-3">
          {recorderState === 'idle' ? (
            <button
              onClick={startRecording}
              aria-label="Start recording"
              className="p-3 rounded-full"
              style={{ background: 'var(--accent-error)' }}
            >
              <Mic size={24} className="text-white" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              aria-label="Stop recording"
              className="p-3 rounded-full"
              style={{ background: 'var(--accent-error)' }}
            >
              <Square size={24} className="text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Recordings List */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {recordings.map((recording) => (
          <div key={recording.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
              <button onClick={() => togglePlay(recording)} className="p-2 rounded-full" style={{ background: 'var(--accent-primary)' }}>
                {playingId === recording.id ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{recording.name}</div>
                <div className="text-xs opacity-50">{formatTime(recording.duration)}</div>
              </div>
              {recording.blobUrl ? (
                <a
                  href={recording.blobUrl}
                  download={`${recording.name}.webm`}
                  aria-label="Download recording"
                  className="p-2 rounded-lg hover:opacity-70 flex items-center justify-center"
                  style={{ color: 'var(--text-secondary)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={16} />
                </a>
              ) : (
                <span
                  aria-label="Download recording"
                  className="p-2 rounded-lg opacity-30 flex items-center justify-center"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Download size={16} />
                </span>
              )}
              <button onClick={() => deleteRecording(recording.id)} className="p-2 rounded-lg hover:opacity-70">
                <Trash2 size={16} className="text-[var(--accent-error)]" />
              </button>
            </div>
        ))}
      </div>
    </div>
  );
}
