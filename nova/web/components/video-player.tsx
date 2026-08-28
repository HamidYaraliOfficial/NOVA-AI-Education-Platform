"use client";

import { useRef, useState } from "react";
import { Bookmark, Gauge, Pause, PictureInPicture2, Play, StickyNote, Subtitles } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { formatCountdown } from "@/lib/utils";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

interface Note {
  id: string;
  timestampSeconds: number;
  text: string;
}

export function VideoPlayer({ src, poster, resumeSeconds = 0 }: { src: string; poster?: string; resumeSeconds?: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [current, setCurrent] = useState(resumeSeconds);
  const [duration, setDuration] = useState(0);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteDraft, setNoteDraft] = useState("");

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }

  function changeSpeed(s: number) {
    setSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
  }

  function addBookmark() {
    setNotes((prev) => [...prev, { id: crypto.randomUUID(), timestampSeconds: current, text: "Bookmark" }]);
  }

  function addNote() {
    if (!noteDraft.trim()) return;
    setNotes((prev) => [...prev, { id: crypto.randomUUID(), timestampSeconds: current, text: noteDraft }]);
    setNoteDraft("");
  }

  async function togglePip() {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await v.requestPictureInPicture();
      }
    } catch {
      /* PiP unsupported in this environment */
    }
  }

  function seekTo(seconds: number) {
    if (videoRef.current) videoRef.current.currentTime = seconds;
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative bg-black">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="aspect-video w-full"
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration);
            e.currentTarget.currentTime = resumeSeconds;
          }}
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          {captionsOn && <track kind="subtitles" srcLang="en" label="English" default />}
        </video>
      </div>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="secondary" onClick={togglePlay}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={current}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="h-1.5 flex-1 accent-[hsl(var(--primary))]"
          />
          <span className="w-24 text-end font-mono text-xs tabular-nums text-muted-foreground">
            {formatCountdown(current * 1000).slice(3)} / {formatCountdown((duration || 0) * 1000).slice(3)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-md bg-muted p-1">
            <Gauge className="ms-1 h-3.5 w-3.5 text-muted-foreground" />
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => changeSpeed(s)}
                className={`rounded px-2 py-0.5 text-xs ${speed === s ? "bg-surface font-semibold shadow-fluent" : "text-muted-foreground"}`}
              >
                {s}x
              </button>
            ))}
          </div>
          <Button size="sm" variant="ghost" onClick={() => setCaptionsOn((v) => !v)}>
            <Subtitles className="h-3.5 w-3.5" /> {captionsOn ? "CC on" : "CC off"}
          </Button>
          <Button size="sm" variant="ghost" onClick={togglePip}>
            <PictureInPicture2 className="h-3.5 w-3.5" /> PiP
          </Button>
          <Button size="sm" variant="ghost" onClick={addBookmark}>
            <Bookmark className="h-3.5 w-3.5" /> Bookmark
          </Button>
        </div>

        <div className="flex gap-2">
          <input
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Add a timestamped note…"
            className="flex-1 rounded-md border border-input bg-surface px-3 py-2 text-sm outline-none"
          />
          <Button size="sm" onClick={addNote}>
            <StickyNote className="h-3.5 w-3.5" /> Note
          </Button>
        </div>

        {notes.length > 0 && (
          <ul className="space-y-1.5">
            {notes
              .slice()
              .sort((a, b) => a.timestampSeconds - b.timestampSeconds)
              .map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => seekTo(n.timestampSeconds)}
                    className="flex w-full items-center gap-2 rounded-md p-1.5 text-start text-sm hover:bg-muted"
                  >
                    <span className="font-mono text-xs text-primary">{formatCountdown(n.timestampSeconds * 1000).slice(3)}</span>
                    <span className="text-muted-foreground">{n.text}</span>
                  </button>
                </li>
              ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
