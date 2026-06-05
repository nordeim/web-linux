// ============================================================
// Screen Recorder — Record screen with preview and controls
// ============================================================

import { z } from "zod";
import { safeJsonParse } from "@/utils/safeJsonParse";
import { useState, useRef, useEffect, memo } from "react";
import {
  Monitor, AppWindow, Square, Play, Pause, Video, Download, Trash2, Circle
} from "lucide-react";

// ---- Types ----
type RecordMode = "screen" | "window" | "area";
type RecordQuality = "low" | "medium" | "high";
type RecorderState = "idle" | "countdown" | "recording" | "paused";

interface ScreenRecording {
  id: string;
  name: string;
  duration: number;
  size: string;
  date: number;
  mode: RecordMode;
  blobUrl?: string;
  mimeType?: string;
}

// ---- Helpers ----
const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
};

const RecordingSchema = z.object({
  id: z.string(),
  name: z.string(),
  duration: z.number(),
  size: z.string(),
  date: z.number(),
  mode: z.string(),
  blobUrl: z.string().optional(),
  mimeType: z.string().optional(),
});

// ---- Countdown Overlay ----
const CountdownOverlay = memo(function CountdownOverlay({
  count,
  onComplete,
}: {
  count: number;
  onComplete: () => void;
}) {
  const [current, setCurrent] = useState(count);

  useEffect(() => {
    if (current <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCurrent((c) => c - 1), 800);
    return () => clearTimeout(timer);
  }, [current, count, onComplete]);

  if (current <= 0) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.8)" }}>
      <div style={{ fontSize: "72px", fontWeight: 700, color: "white" }}>{current}</div>
    </div>
  );
});

export default function ScreenRecorder() {
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [recordings, setRecordings] = useState<ScreenRecording[]>(() => {
    const saved = localStorage.getItem("ubuntuos_screenrecordings");
    return safeJsonParse(saved, z.array(RecordingSchema), []);
  });
  const [recordMode, setRecordMode] = useState<RecordMode>("screen");
  const [quality, setQuality] = useState<RecordQuality>("high");
  const [fps, setFps] = useState(30);
  const [recordAudio, setRecordAudio] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [countdownEnabled, setCountdownEnabled] = useState(true);
  const [countdownSeconds, setCountdownSeconds] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Persist recordings
  useEffect(() => {
    localStorage.setItem("ubuntuos_screenrecordings", JSON.stringify(recordings));
  }, [recordings]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = () => {
    if (countdownEnabled) {
      setShowCountdown(true);
      setRecorderState("countdown");
    } else {
      beginRecording();
    }
  };

  const beginRecording = async () => {
    setShowCountdown(false);
    try {
      const displayMediaOptions: DisplayMediaStreamOptions = {
        video: {
          frameRate: fps,
          cursor: showCursor ? "always" : "never",
        } as MediaTrackConstraints,
        audio: recordAudio,
      };

      const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      streamRef.current = stream;

      // Handle user stopping sharing via browser UI
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        stopRecording();
      });

      const mimeType = "video/webm; codecs=vp9";
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);

        setRecordings((prev) => [
          {
            id: generateId(),
            name: `Screen Recording ${prev.length + 1}`,
            duration: elapsed,
            size: formatFileSize(blob.size),
            date: Date.now(),
            mode: recordMode,
            blobUrl: url,
            mimeType,
          },
          ...prev,
        ]);
        setElapsed(0);
      };

      mediaRecorder.start(1000); // Collect data every second
      setRecorderState("recording");

      // Start timer
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start screen recording:", err);
      setRecorderState("idle");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecorderState("idle");
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setRecorderState("paused");
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setRecorderState("recording");
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
  };

  const deleteRecording = (id: string) => {
    setRecordings((prev) => {
      const recording = prev.find((r) => r.id === id);
      if (recording?.blobUrl) {
        URL.revokeObjectURL(recording.blobUrl);
      }
      return prev.filter((r) => r.id !== id);
    });
  };

  const downloadRecording = (recording: ScreenRecording) => {
    if (!recording.blobUrl) {
      // Fallback for legacy simulated recordings
      const blob = new Blob(
        [
          `Simulated screen recording: ${recording.name}
Duration: ${formatTime(recording.duration)}
Mode: ${recording.mode}
Quality: ${quality}`,
        ],
        { type: "text/plain" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${recording.name}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const a = document.createElement("a");
    a.href = recording.blobUrl;
    a.download = `${recording.name}.webm`;
    a.click();
  };

  const modeDescriptions: Record<RecordMode, string> = {
    screen: "Will record your entire screen",
    window: "Will record a specific application window",
    area: "Will record a selected area of the screen",
  };

  return (
    <div className="flex flex-col h-full custom-scrollbar overflow-y-auto" style={{ background: "var(--bg-window)" }}>
      {showCountdown && (
        <CountdownOverlay count={countdownSeconds} onComplete={beginRecording} />
      )}

      {/* Mode Selection */}
      <div className="px-4 pt-4 pb-3">
        <h3
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--text-primary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "8px",
          }}
        >
          Recording Mode
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setRecordMode("screen")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              recordMode === "screen" ? "ring-2 ring-[var(--accent-primary)]" : ""
            }`}
            style={{
              background: recordMode === "screen" ? "var(--accent-primary)" : "var(--bg-titlebar)",
            }}
          >
            <Monitor size={18} />
            <span style={{ fontSize: "12px" }}>Full Screen</span>
          </button>
          <button
            onClick={() => setRecordMode("window")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              recordMode === "window" ? "ring-2 ring-[var(--accent-primary)]" : ""
            }`}
            style={{
              background: recordMode === "window" ? "var(--accent-primary)" : "var(--bg-titlebar)",
            }}
          >
            <AppWindow size={18} />
            <span style={{ fontSize: "12px" }}>Window</span>
          </button>
          <button
            onClick={() => setRecordMode("area")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              recordMode === "area" ? "ring-2 ring-[var(--accent-primary)]" : ""
            }`}
            style={{
              background: recordMode === "area" ? "var(--accent-primary)" : "var(--bg-titlebar)",
            }}
          >
            <Square size={18} />
            <span style={{ fontSize: "12px" }}>Area</span>
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="px-4 py-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <h3
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--text-primary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "10px",
          }}
        >
          Settings
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Quality */}
          <div>
            <label
              style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: 4 }}
            >
              Quality
            </label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as RecordQuality)}
              className="w-full px-2 py-1.5 rounded-md outline-none"
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
                fontSize: "12px",
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          {/* FPS */}
          <div>
            <label
              style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: 4 }}
            >
              FPS
            </label>
            <select
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="w-full px-2 py-1.5 rounded-md outline-none"
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
                fontSize: "12px",
              }}
            >
              <option value={15}>15 fps</option>
              <option value={30}>30 fps</option>
              <option value={60}>60 fps</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={recordAudio}
              onChange={(e) => setRecordAudio(e.target.checked)}
              className="rounded"
            />
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Record Audio</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCursor}
              onChange={(e) => setShowCursor(e.target.checked)}
              className="rounded"
            />
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Show Cursor</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={countdownEnabled}
              onChange={(e) => setCountdownEnabled(e.target.checked)}
              className="rounded"
            />
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Countdown</span>
          </label>
          {countdownEnabled && (
            <input
              type="range"
              min={1}
              max={10}
              value={countdownSeconds}
              onChange={(e) => setCountdownSeconds(Number(e.target.value))}
              className="ml-5"
              style={{ accentColor: "var(--accent-primary)", width: 120 }}
            />
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="px-4 py-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-lg"
          style={{
            height: 160,
            background: "var(--bg-titlebar)",
            border: "2px dashed var(--border-default)",
          }}
        >
          {recorderState === "recording" ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 600 }}>
                  Recording
                </span>
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 300,
                  color: "var(--text-primary)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatTime(elapsed)}
              </div>
            </div>
          ) : (
            <>
              <Monitor size={36} style={{ color: "var(--text-disabled)" }} />
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                {modeDescriptions[recordMode]}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Record Button */}
      <div className="px-4 py-3">
        {recorderState === "idle" ? (
          <button
            onClick={startRecording}
            className="w-full flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{
              height: 48,
              borderRadius: "var(--radius-md)",
              background: "var(--accent-error)",
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            <Circle size={18} fill="white" /> Start Recording
          </button>
        ) : recorderState === "recording" ? (
          <div className="flex gap-2">
            <button
              onClick={pauseRecording}
              className="flex-1 flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{
                height: 48,
                borderRadius: "var(--radius-md)",
                background: "var(--bg-hover)",
                color: "var(--text-primary)",
                fontSize: "14px",
                fontWeight: 600,
                border: "1px solid var(--border-default)",
              }}
            >
              <Pause size={18} /> Pause
            </button>
            <button
              onClick={stopRecording}
              className="flex-[2] flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{
                height: 48,
                borderRadius: "var(--radius-md)",
                background: "var(--accent-error)",
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              <Square size={18} fill="white" /> Stop Recording
            </button>
          </div>
        ) : recorderState === "paused" ? (
          <div className="flex gap-2">
            <button
              onClick={resumeRecording}
              className="flex-1 flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{
                height: 48,
                borderRadius: "var(--radius-md)",
                background: "var(--accent-primary)",
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              <Play size={18} className="ml-0.5" /> Resume
            </button>
            <button
              onClick={stopRecording}
              className="flex-1 flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{
                height: 48,
                borderRadius: "var(--radius-md)",
                background: "var(--accent-error)",
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              <Square size={18} fill="white" /> Stop
            </button>
          </div>
        ) : null}
      </div>

      {/* Recordings List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <h3
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--text-primary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            padding: "12px 0 8px",
          }}
        >
          Recent Recordings ({recordings.length})
        </h3>
        {recordings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Video size={28} style={{ color: "var(--text-disabled)" }} />
            <span style={{ fontSize: "12px", color: "var(--text-disabled)" }}>No recordings yet</span>
          </div>
        ) : (
          recordings.map((recording) => (
            <div
              key={recording.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all"
              style={{ background: "var(--bg-titlebar)", border: "1px solid var(--border-subtle)" }}
            >
              <div
                className="flex items-center justify-center rounded-lg shrink-0"
                style={{ width: 40, height: 28, background: "var(--bg-hover)" }}
              >
                <Video size={14} style={{ color: "var(--accent-primary)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate" style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                  {recording.name}
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                    {formatTime(recording.duration)}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-disabled)" }}>{recording.size}</span>
                  <span style={{ fontSize: "10px", color: "var(--text-disabled)", textTransform: "capitalize" }}>
                    {recording.mode}
                  </span>
                </div>
              </div>
              <button
                onClick={() => downloadRecording(recording)}
                className="flex items-center justify-center rounded hover:bg-[var(--bg-hover)] shrink-0"
                style={{ width: 28, height: 28 }}
                aria-label="Download recording"
              >
                <Download size={14} style={{ color: "var(--text-secondary)" }} />
              </button>
              <button
                onClick={() => deleteRecording(recording.id)}
                className="flex items-center justify-center rounded hover:bg-[var(--bg-hover)] shrink-0"
                style={{ width: 28, height: 28 }}
                aria-label="Delete recording"
              >
                <Trash2 size={14} style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
