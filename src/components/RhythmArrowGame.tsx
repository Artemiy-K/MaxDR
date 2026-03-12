import { useEffect, useMemo, useRef, useState } from "react";

const LANES = [
  { key: "ArrowLeft", label: "←" },
  { key: "ArrowDown", label: "↓" },
  { key: "ArrowUp", label: "↑" },
  { key: "ArrowRight", label: "→" },
] as const;

const LEVELS = {
  level1: {
    label: "Уровень 1",
    duration: 20,
    speed: 220,
    spawnMs: 700,
    hitWindow: 70,
    track: "/music1.mp3",
  },
  level2: {
    label: "Уровень 2",
    duration: 25,
    speed: 290,
    spawnMs: 500,
    hitWindow: 60,
    track: "/music2.mp3",
  },
  level3: {
    label: "Уровень 3",
    duration: 30,
    speed: 380,
    spawnMs: 360,
    hitWindow: 52,
    track: "/music3.mp3",
  },
} as const;

type LevelKey = keyof typeof LEVELS;

type Note = {
  id: string;
  lane: number;
  time: number;
  hit: boolean;
  missed: boolean;
};

type Props = {
  onFinish: (level: LevelKey, score: number) => void;
};

const GAME_HEIGHT = 520;
const RECEPTOR_Y = 440;
const NOTE_SIZE = 64;
const HIT_LINE_TOLERANCE = 14;

function makeChart(levelKey: LevelKey) {
  const level = LEVELS[levelKey];
  const notes: Omit<Note, "hit" | "missed">[] = [];
  const totalMs = level.duration * 1000;
  let t = 900;
  let i = 0;

  while (t < totalMs - 500) {
    const lane = (i * 3 + Math.floor(i / 2)) % 4;
    notes.push({
      id: `${levelKey}-${i}`,
      lane,
      time: t,
    });

    if (levelKey !== "level1" && i % 6 === 3) {
      notes.push({
        id: `${levelKey}-${i}-alt`,
        lane: (lane + 1) % 4,
        time: t + 120,
      });
    }

    if (levelKey === "level3" && i % 8 === 5) {
      notes.push({
        id: `${levelKey}-${i}-tri`,
        lane: (lane + 2) % 4,
        time: t + 180,
      });
    }

    const jitter = ((i * 97) % 5) * 18;
    t += level.spawnMs + jitter;
    i += 1;
  }

  return notes.sort((a, b) => a.time - b.time);
}

function gradeOffset(offset: number, hitWindow: number) {
  const abs = Math.abs(offset);
  if (abs <= 18) return { label: "PERFECT", score: 300, comboBoost: 1 };
  if (abs <= 36) return { label: "GREAT", score: 180, comboBoost: 1 };
  if (abs <= hitWindow) return { label: "GOOD", score: 90, comboBoost: 1 };
  return null;
}

function formatTime(ms: number) {
  const sec = Math.max(0, Math.ceil(ms / 1000));
  return `${sec}s`;
}

export default function RhythmArrowGame({ onFinish }: Props) {
  const [levelKey, setLevelKey] = useState<LevelKey>("level1");
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(LEVELS.level1.duration * 1000);
  const [notes, setNotes] = useState<Note[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [feedback, setFeedback] = useState("Нажми Start");
  const [pressedLane, setPressedLane] = useState<number | null>(null);

  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const noteMapRef = useRef<Note[]>([]);
  const scoreRef = useRef(0);
  const feedbackTimeoutRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const level = LEVELS[levelKey];

  const accuracy = useMemo(() => {
    const total = hits + misses;
    if (!total) return 100;
    return Math.max(0, Math.round((hits / total) * 100));
  }, [hits, misses]);

  const stopAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  const resetGame = (newLevelKey: LevelKey = levelKey) => {
    const freshChart = makeChart(newLevelKey).map((n) => ({
      ...n,
      hit: false,
      missed: false,
    }));
    noteMapRef.current = freshChart;
    setNotes(freshChart);
    setStarted(false);
    setGameOver(false);
    setTimeLeft(LEVELS[newLevelKey].duration * 1000);
    setScore(0);
    scoreRef.current = 0;
    setCombo(0);
    setMaxCombo(0);
    setHits(0);
    setMisses(0);
    setFeedback("Нажми Start");
    setPressedLane(null);
    startRef.current = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    stopAudio();
  };

  useEffect(() => {
    resetGame(levelKey);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      stopAudio();
    };
  }, [levelKey]);

  const setTempFeedback = (text: string) => {
    setFeedback(text);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setFeedback(started ? "Держи ритм" : "Нажми Start");
    }, 450);
  };

  const endGame = () => {
    setStarted(false);
    setGameOver(true);
    setFeedback("Финиш!");
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    stopAudio();
    onFinish(levelKey, scoreRef.current);
  };

  const gameLoop = () => {
    const now = performance.now();
    const elapsed = now - startRef.current;
    const remaining = level.duration * 1000 - elapsed;

    setTimeLeft(Math.max(0, remaining));

    let missedNow = 0;
    const updated = noteMapRef.current.map((note) => {
      if (note.hit || note.missed) return note;
      if (elapsed - note.time > level.hitWindow + HIT_LINE_TOLERANCE) {
        missedNow += 1;
        return { ...note, missed: true };
      }
      return note;
    });

    if (missedNow > 0) {
      noteMapRef.current = updated;
      setNotes(updated);
      setMisses((m) => m + missedNow);
      setCombo(0);
      setTempFeedback("MISS");
    }

    if (remaining <= 0) {
      endGame();
      return;
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  };

  const startGame = () => {
    resetGame(levelKey);
    const freshChart = makeChart(levelKey).map((n) => ({
      ...n,
      hit: false,
      missed: false,
    }));
    noteMapRef.current = freshChart;
    setNotes(freshChart);
    setStarted(true);
    setGameOver(false);
    setFeedback("Поехали!");
    startRef.current = performance.now();

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    audioRef.current.src = LEVELS[levelKey].track;
    audioRef.current.volume = 0.5;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => undefined);

    rafRef.current = requestAnimationFrame(gameLoop);
  };

  const handleHit = (laneIndex: number) => {
    if (!started) return;

    const elapsed = performance.now() - startRef.current;
    const laneNotes = noteMapRef.current.filter(
      (note) => note.lane === laneIndex && !note.hit && !note.missed,
    );

    if (!laneNotes.length) {
      setMisses((m) => m + 1);
      setCombo(0);
      setTempFeedback("MISS");
      return;
    }

    const candidate = laneNotes.reduce<
      { note: Note; offset: number } | null
    >((best, note) => {
      const currentOffset = Math.abs(elapsed - note.time);
      if (!best) return { note, offset: currentOffset };
      return currentOffset < best.offset ? { note, offset: currentOffset } : best;
    }, null);

    if (!candidate) return;

    const judgement = gradeOffset(elapsed - candidate.note.time, level.hitWindow);

    if (!judgement) {
      setMisses((m) => m + 1);
      setCombo(0);
      setTempFeedback("MISS");
      return;
    }

    const updated = noteMapRef.current.map((note) =>
      note.id === candidate.note.id ? { ...note, hit: true } : note,
    );
    noteMapRef.current = updated;
    setNotes(updated);
    setScore((s) => {
      const nextScore = s + judgement.score;
      scoreRef.current = nextScore;
      return nextScore;
    });
    setHits((h) => h + 1);
    setCombo((c) => {
      const next = c + judgement.comboBoost;
      setMaxCombo((prev) => Math.max(prev, next));
      return next;
    });
    setTempFeedback(judgement.label);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const laneIndex = LANES.findIndex((lane) => lane.key === e.key);
      if (laneIndex === -1) return;
      e.preventDefault();
      setPressedLane(laneIndex);
      handleHit(laneIndex);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const laneIndex = LANES.findIndex((lane) => lane.key === e.key);
      if (laneIndex === -1) return;
      setPressedLane((current) => (current === laneIndex ? null : current));
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  });

  const visibleNotes = notes.filter((note) => !note.hit && !note.missed);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f2a68,_#0b1022_45%,_#05070f_100%)] p-4 text-white md:p-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-2xl">
          <h2 className="text-2xl font-black tracking-wide">Piano Respect</h2>
          <p className="mt-2 text-sm text-white/70">
            Жми стрелки, когда ноты доходят до линии, и докажи Айрату, что ты не случайный человек.
          </p>

          <div className="mt-6 space-y-3">
            {Object.entries(LEVELS).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setLevelKey(key as LevelKey)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  levelKey === key
                    ? "border-cyan-300 bg-cyan-400/20 shadow-lg shadow-cyan-500/20"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{value.label}</span>
                  <span className="text-sm text-white/70">{value.duration} сек</span>
                </div>
                <div className="mt-1 text-xs text-white/60">
                  Трек: {value.track.replace("/", "")} • Скорость: {value.speed}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-white/60">Счет</div>
              <div className="text-2xl font-black">{score}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-white/60">Комбо</div>
              <div className="text-2xl font-black">x{combo}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-white/60">Точность</div>
              <div className="text-2xl font-black">{accuracy}%</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-white/60">Макс. комбо</div>
              <div className="text-2xl font-black">{maxCombo}</div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-fuchsia-300/30 bg-fuchsia-400/10 p-4 text-center shadow-lg shadow-fuchsia-500/10">
            <div className="text-xs uppercase tracking-[0.3em] text-fuchsia-200/70">Статус</div>
            <div className="mt-2 text-2xl font-black">{feedback}</div>
            <div className="mt-2 text-sm text-white/70">Осталось: {formatTime(timeLeft)}</div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={startGame}
              className="flex-1 rounded-2xl bg-cyan-400 px-4 py-3 font-black text-slate-950 transition hover:scale-[1.02]"
            >
              Start
            </button>
            <button
              onClick={() => resetGame(levelKey)}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold transition hover:bg-white/10"
            >
              Reset
            </button>
          </div>

          <div className="mt-6 text-sm text-white/70">
            Управление: <span className="font-bold text-white">← ↓ ↑ →</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 p-4 backdrop-blur-xl shadow-2xl md:p-6">
          <div className="relative mx-auto max-w-3xl rounded-[2rem] border border-cyan-300/20 bg-[linear-gradient(180deg,_rgba(255,255,255,0.05),_rgba(255,255,255,0.02))] p-4 shadow-[inset_0_0_80px_rgba(255,255,255,0.03)]">
            <div
              className="relative mx-auto grid grid-cols-4 gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/90 p-3"
              style={{ height: GAME_HEIGHT }}
            >
              {LANES.map((lane, laneIndex) => (
                <div
                  key={lane.key}
                  className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(34,211,238,0.06),_rgba(15,23,42,0.35))]"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.03))]" />

                  {visibleNotes
                    .filter((note) => note.lane === laneIndex)
                    .map((note) => {
                      const elapsed = started ? performance.now() - startRef.current : 0;
                      const y =
                        RECEPTOR_Y + ((elapsed - note.time) / 1000) * level.speed;
                      if (y < -NOTE_SIZE - 40 || y > GAME_HEIGHT + 40) return null;
                      return (
                        <div
                          key={note.id}
                          className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center rounded-2xl border border-white/20 bg-cyan-300/90 font-black text-slate-950 shadow-[0_0_30px_rgba(103,232,249,0.55)]"
                          style={{
                            top: y,
                            width: NOTE_SIZE,
                            height: NOTE_SIZE,
                          }}
                        >
                          {lane.label}
                        </div>
                      );
                    })}

                  <div
                    className={`absolute left-2 right-2 flex items-center justify-center rounded-2xl border-2 text-4xl font-black transition ${
                      pressedLane === laneIndex
                        ? "scale-95 border-fuchsia-300 bg-fuchsia-300/80 text-slate-950 shadow-[0_0_35px_rgba(232,121,249,0.7)]"
                        : "border-cyan-200/80 bg-cyan-300/20 text-cyan-100 shadow-[0_0_25px_rgba(103,232,249,0.25)]"
                    }`}
                    style={{
                      top: RECEPTOR_Y,
                      height: NOTE_SIZE,
                    }}
                  >
                    {lane.label}
                  </div>
                </div>
              ))}

              <div
                className="pointer-events-none absolute left-3 right-3 border-t-2 border-dashed border-fuchsia-300/60"
                style={{ top: RECEPTOR_Y + NOTE_SIZE / 2 }}
              />
            </div>
          </div>

          {gameOver && (
            <div className="mt-5 rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-5 text-center">
              <div className="text-sm uppercase tracking-[0.3em] text-emerald-200/70">Результат</div>
              <div className="mt-2 text-3xl font-black">{score} очков</div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm text-white/75">
                <span>Попадания: {hits}</span>
                <span>Промахи: {misses}</span>
                <span>Точность: {accuracy}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

