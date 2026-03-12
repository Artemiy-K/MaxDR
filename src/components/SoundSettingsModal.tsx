import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  open: boolean;
  solved: boolean;
  onClose: () => void;
  onSolved: () => void;
  secretInputEnabled?: boolean;
  secretUnlocked?: boolean;
  onSecretUnlock?: () => void;
};

type DragPoint = { x: number; y: number };

const TARGETS = { shot: 65, tilt: 39, pi: 75, pump: 70 } as const;
const PI_DIGITS = "3.1415926535897932384626433832795";
const SECRET_CODE = "y78XZOVput";
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const isNear = (value: number, target: number, tolerance = 3) => Math.abs(value - target) <= tolerance;

export default function SoundSettingsModal({ open, solved, onClose, onSolved, secretInputEnabled = false, secretUnlocked = false, onSecretUnlock }: Props) {
  const [shotValue, setShotValue] = useState(0);
  const [shotHolding, setShotHolding] = useState(false);
  const [shotSolved, setShotSolved] = useState(solved);
  const [tiltVolume, setTiltVolume] = useState(50);
  const [tiltAngle, setTiltAngle] = useState(0);
  const [tiltSolved, setTiltSolved] = useState(solved);
  const [tiltDragging, setTiltDragging] = useState(false);
  const [piValue, setPiValue] = useState("3.");
  const [piSolved, setPiSolved] = useState(solved);
  const [pumpValue, setPumpValue] = useState(0);
  const [pumpSolved, setPumpSolved] = useState(solved);
  const [pumpDragging, setPumpDragging] = useState(false);
  const [pumpOffset, setPumpOffset] = useState(0);
  const [backdoorActive, setBackdoorActive] = useState(false);
  const [backdoorValue, setBackdoorValue] = useState("");

  const shotStartRef = useRef<number | null>(null);
  const shotFrameRef = useRef<number | null>(null);
  const tiltStartRef = useRef<DragPoint | null>(null);
  const pumpStartYRef = useRef<number | null>(null);
  const pumpWentDownRef = useRef(false);
  const pumpDecayRef = useRef<number | null>(null);
  const backdoorInputRef = useRef<HTMLInputElement | null>(null);

  const piStats = useMemo(() => {
    const normalized = piValue.replace(",", ".").replace(/[^0-9.]/g, "");
    let matchedLength = 0;
    for (let index = 0; index < normalized.length; index += 1) {
      if (normalized[index] !== PI_DIGITS[index]) break;
      matchedLength += 1;
    }
    const hasCorrectPrefix = normalized.startsWith("3.");
    const correctDigitsAfterDot = hasCorrectPrefix ? Math.max(matchedLength - 2, 0) : 0;
    return {
      volume: Math.min(correctDigitsAfterDot * 5, 100),
      correctDigitsAfterDot,
      isBroken: normalized.length > matchedLength,
      nextExpected: PI_DIGITS[matchedLength] ?? "-",
    };
  }, [piValue]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    setShotSolved(solved);
    setTiltSolved(solved);
    setPiSolved(solved);
    setPumpSolved(solved);
  }, [solved]);

  useEffect(() => {
    if (!open) {
      setBackdoorActive(false);
      setBackdoorValue("");
    }
  }, [open]);

  useEffect(() => {
    if (piStats.volume === TARGETS.pi && !piStats.isBroken) setPiSolved(true);
  }, [piStats]);

  useEffect(() => {
    if (shotSolved && tiltSolved && piSolved && pumpSolved && !solved) onSolved();
  }, [onSolved, piSolved, pumpSolved, shotSolved, solved, tiltSolved]);

  useEffect(() => () => {
    if (shotFrameRef.current) cancelAnimationFrame(shotFrameRef.current);
    if (pumpDecayRef.current) window.clearInterval(pumpDecayRef.current);
  }, []);

  useEffect(() => {
    if (!tiltDragging) return;
    const handleMove = (clientX: number, clientY: number) => {
      if (!tiltStartRef.current) return;
      const deltaX = clientX - tiltStartRef.current.x;
      const deltaY = tiltStartRef.current.y - clientY;
      const nextAngle = clamp((deltaX + deltaY * 0.4) / 3.2, -40, 40);
      const nextVolume = Math.round(((nextAngle + 40) / 80) * 100);
      setTiltAngle(nextAngle);
      setTiltVolume(nextVolume);
      if (isNear(nextVolume, TARGETS.tilt, 1)) setTiltSolved(true);
    };
    const onMouseMove = (event: MouseEvent) => handleMove(event.clientX, event.clientY);
    const onTouchMove = (event: TouchEvent) => { const touch = event.touches[0]; if (touch) handleMove(touch.clientX, touch.clientY); };
    const stopDrag = () => { setTiltDragging(false); tiltStartRef.current = null; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", stopDrag);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stopDrag);
    };
  }, [tiltDragging]);

  useEffect(() => {
    if (pumpDragging) {
      if (pumpDecayRef.current) { window.clearInterval(pumpDecayRef.current); pumpDecayRef.current = null; }
      return;
    }
    pumpDecayRef.current = window.setInterval(() => setPumpValue((current) => current <= 0 ? 0 : Math.max(0, current - 1)), 130);
    return () => {
      if (pumpDecayRef.current) { window.clearInterval(pumpDecayRef.current); pumpDecayRef.current = null; }
    };
  }, [pumpDragging]);

  useEffect(() => {
    if (!pumpDragging) return;
    const updatePumpDrag = (clientY: number) => {
      if (pumpStartYRef.current === null) return;
      const offset = clamp(clientY - pumpStartYRef.current, 0, 120);
      setPumpOffset(offset);
      if (offset > 88) pumpWentDownRef.current = true;
      if (pumpWentDownRef.current && offset < 20) {
        pumpWentDownRef.current = false;
        setPumpValue((current) => {
          const nextValue = clamp(current + 14, 0, 100);
          if (isNear(nextValue, TARGETS.pump)) setPumpSolved(true);
          return nextValue;
        });
      }
    };
    const onMouseMove = (event: MouseEvent) => updatePumpDrag(event.clientY);
    const onTouchMove = (event: TouchEvent) => { const touch = event.touches[0]; if (touch) updatePumpDrag(touch.clientY); };
    const stopPumpDrag = () => {
      setPumpDragging(false);
      pumpStartYRef.current = null;
      pumpWentDownRef.current = false;
      setPumpOffset(0);
      if (isNear(pumpValue, TARGETS.pump)) setPumpSolved(true);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopPumpDrag);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", stopPumpDrag);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopPumpDrag);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stopPumpDrag);
    };
  }, [pumpDragging, pumpValue]);

  if (!open) return null;

  const allSolved = shotSolved && tiltSolved && piSolved && pumpSolved;
  const activateBackdoor = () => {
    if (!secretInputEnabled || secretUnlocked) return onClose();
    setBackdoorActive(true);
    window.setTimeout(() => backdoorInputRef.current?.focus(), 0);
  };
  const updateBackdoorValue = (value: string) => {
    setBackdoorValue(value);
    if (value === SECRET_CODE && !secretUnlocked) {
      onSecretUnlock?.();
      setBackdoorActive(false);
      setBackdoorValue("");
    }
  };
  const startShotHold = () => {
    if (shotFrameRef.current) cancelAnimationFrame(shotFrameRef.current);
    shotStartRef.current = performance.now();
    setShotHolding(true);
    setShotValue(0);
    const tick = () => {
      if (shotStartRef.current === null) return;
      const progress = clamp((performance.now() - shotStartRef.current) / 1800, 0, 1);
      setShotValue(Math.round(progress * 100));
      shotFrameRef.current = requestAnimationFrame(tick);
    };
    shotFrameRef.current = requestAnimationFrame(tick);
  };
  const stopShotHold = () => {
    if (shotStartRef.current === null) return;
    if (shotFrameRef.current) { cancelAnimationFrame(shotFrameRef.current); shotFrameRef.current = null; }
    const finalValue = Math.round(clamp((performance.now() - shotStartRef.current) / 1800, 0, 1) * 100);
    shotStartRef.current = null;
    setShotHolding(false);
    setShotValue(finalValue);
    if (isNear(finalValue, TARGETS.shot)) setShotSolved(true);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 px-6 py-10 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={activateBackdoor} aria-hidden="true" />

      {secretInputEnabled && (
        <div className="pointer-events-none absolute bottom-5 right-5 z-20 flex flex-col items-end gap-2">
          <input
            ref={backdoorInputRef}
            value={backdoorValue}
            onChange={(event) => updateBackdoorValue(event.target.value)}
            className={`pointer-events-auto h-11 w-52 rounded-2xl border px-4 text-sm outline-none transition-all ${backdoorActive ? "border-cyan-400 bg-black/70 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.28)]" : "border-transparent bg-transparent text-transparent caret-transparent"}`}
          />
          {secretUnlocked && <div className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">Вкладка 6 доступна</div>}
        </div>
      )}

      <div className="relative z-10 max-h-full w-full max-w-6xl overflow-y-auto rounded-[2rem] border border-zinc-700 bg-zinc-950 p-6 text-zinc-100 shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-zinc-400">Sound Control</p>
            <h2 className="mt-2 text-3xl font-black">Audio Settings</h2>
            <p className="mt-2 text-sm text-zinc-400">Calibrate all 4 modules to restore the hidden soundtrack.</p>
          </div>
          <button onClick={onClose} className="rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800">Close</button>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/70 p-5">
            <ModuleHeader title="Shot Volume" target={TARGETS.shot} accent="cyan" description="Hold and release exactly on the target value." />
            <div className="rounded-[1.5rem] border border-zinc-800 bg-black/30 p-5">
              <div className="mb-4 flex items-center justify-between text-sm text-zinc-400"><span>Current value</span><span className="text-lg font-bold text-white">{shotValue}%</span></div>
              <div className="relative h-5 overflow-hidden rounded-full bg-zinc-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-300 transition-[width] duration-75" style={{ width: `${shotValue}%` }} /><div className="absolute top-0 h-full w-1 bg-white/90" style={{ left: `${TARGETS.shot}%` }} /></div>
              <div className="mt-5 flex items-center justify-between gap-4"><button onMouseDown={startShotHold} onMouseUp={stopShotHold} onMouseLeave={() => shotHolding && stopShotHold()} onTouchStart={(event) => { event.preventDefault(); startShotHold(); }} onTouchEnd={(event) => { event.preventDefault(); stopShotHold(); }} className="rounded-2xl bg-white px-6 py-3 font-black uppercase tracking-[0.18em] text-black transition hover:bg-zinc-200">Hold</button><StatusBadge ready={shotSolved} label={shotSolved ? "Locked" : "Catch 65%"} /></div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/70 p-5">
            <ModuleHeader title="Tilt Module" target={TARGETS.tilt} accent="fuchsia" description="Drag and rotate the panel until it lands on the exact value." />
            <div className="rounded-[1.5rem] border border-zinc-800 bg-black/30 p-5">
              <div onMouseDown={(event) => { tiltStartRef.current = { x: event.clientX, y: event.clientY }; setTiltDragging(true); }} onTouchStart={(event) => { const touch = event.touches[0]; if (!touch) return; tiltStartRef.current = { x: touch.clientX, y: touch.clientY }; setTiltDragging(true); }} className={`mx-auto flex h-44 w-full max-w-md cursor-grab items-center justify-center rounded-[2rem] border bg-gradient-to-br from-zinc-800 via-zinc-900 to-black shadow-2xl transition ${tiltDragging ? "border-fuchsia-300/60" : "border-zinc-700"}`} style={{ transform: `rotate(${tiltAngle}deg)`, transition: tiltDragging ? "none" : "transform 180ms ease" }}><div className="w-48 rounded-full bg-zinc-950/90 px-4 py-3 text-center text-lg font-black uppercase tracking-[0.18em] text-white shadow-inner">{tiltVolume}%</div></div>
              <div className="mt-5 flex items-center justify-between gap-4"><div className="text-sm text-zinc-400">Angle: {Math.round(tiltAngle)} deg</div><StatusBadge ready={tiltSolved} label={tiltSolved ? "Set" : "Set 39%"} /></div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/70 p-5">
            <ModuleHeader title="Pi Digits" target={TARGETS.pi} accent="amber" description="Each correct digit after the decimal adds 5% volume." />
            <div className="rounded-[1.5rem] border border-zinc-800 bg-black/30 p-5">
              <input value={piValue} onChange={(event) => setPiValue(event.target.value)} inputMode="decimal" spellCheck={false} placeholder="Type 3.14159" className="h-14 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 text-lg outline-none transition focus:border-amber-400" />
              <div className="mt-4 rounded-full bg-zinc-800"><div className="h-4 rounded-full bg-gradient-to-r from-amber-300 via-yellow-300 to-lime-300 transition-all duration-200" style={{ width: `${piStats.volume}%` }} /></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3"><DataCard label="Volume" value={`${piStats.volume}%`} /><DataCard label="Correct digits" value={`${piStats.correctDigitsAfterDot}`} /><DataCard label="Next char" value={piStats.nextExpected} /></div>
              <div className={`mt-4 rounded-2xl border p-4 text-sm ${piStats.isBroken ? "border-red-500/40 bg-red-500/10 text-red-200" : piSolved ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : "border-zinc-800 bg-zinc-950 text-zinc-400"}`}>{piStats.isBroken ? "The sequence broke. Volume only counts while the digits stay correct in order." : piSolved ? "Exact match. This module is calibrated." : "To reach 75%, enter 15 correct digits after the decimal point."}</div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/70 p-5">
            <ModuleHeader title="Pump Module" target={TARGETS.pump} accent="emerald" description="Pump the handle and release on the target before the gauge drops." />
            <div className="rounded-[1.5rem] border border-zinc-800 bg-black/30 p-5">
              <div className="flex flex-col items-center"><div onMouseDown={(event) => { pumpStartYRef.current = event.clientY; pumpWentDownRef.current = false; setPumpDragging(true); }} onTouchStart={(event) => { const touch = event.touches[0]; if (!touch) return; pumpStartYRef.current = touch.clientY; pumpWentDownRef.current = false; setPumpDragging(true); }} className="mb-2 h-5 w-44 cursor-grab rounded-sm bg-zinc-500 shadow-[0_4px_10px_rgba(0,0,0,0.25)] active:cursor-grabbing" /><div className="relative flex flex-col items-center"><div className="w-3 bg-zinc-500" style={{ height: `${84 + pumpOffset}px` }} /><div className="relative -mt-1 flex h-64 w-24 flex-col justify-end rounded-sm border-[10px] border-zinc-500 bg-zinc-300 p-2 shadow-[inset_0_0_10px_rgba(0,0,0,0.12)]"><div className="absolute left-1/2 top-3 -translate-x-1/2 text-2xl font-bold tracking-tight text-zinc-700">{pumpValue}</div><div className="w-full rounded-[2px] bg-emerald-500 transition-[height] duration-75" style={{ height: `${pumpValue}%` }} /></div></div></div>
              <div className="mt-5 flex items-center justify-between gap-4"><p className="text-sm text-zinc-400">Current: {pumpValue}% · each full pump adds 14%</p><StatusBadge ready={pumpSolved} label={pumpSolved ? "Locked" : "Catch 70%"} /></div>
            </div>
          </section>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-zinc-800 bg-black/30 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">System State</div>
              <div className="mt-2 text-2xl font-black">{allSolved ? "Music is ready" : "Not all channels are calibrated yet"}</div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-bold uppercase tracking-[0.18em]">
              {[{ label: "Shot", ready: shotSolved }, { label: "Tilt", ready: tiltSolved }, { label: "Pi", ready: piSolved }, { label: "Pump", ready: pumpSolved }].map(({ label, ready }) => <StatusBadge key={label} ready={ready} label={label} compact />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleHeader({ title, target, accent, description }: { title: string; target: number; accent: "cyan" | "fuchsia" | "amber" | "emerald" | string; description: string }) {
  const styles: Record<string, string> = {
    cyan: "border-cyan-500/40 bg-cyan-500/10 text-cyan-200 text-cyan-200/70",
    fuchsia: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-200 text-fuchsia-200/70",
    amber: "border-amber-500/40 bg-amber-500/10 text-amber-200 text-amber-200/70",
    emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-emerald-200/70",
  };
  const [borderClass, backgroundClass, valueClass, labelClass] = styles[accent].split(" ");
  return <div className="mb-4 flex items-center justify-between gap-4"><div><h3 className="text-xl font-bold">{title}</h3><p className="mt-1 text-sm text-zinc-400">{description}</p></div><div className={`rounded-2xl border px-4 py-3 text-right ${borderClass} ${backgroundClass}`}><div className={`text-xs uppercase tracking-[0.28em] ${labelClass}`}>Target</div><div className={`text-2xl font-black ${valueClass}`}>{target}%</div></div></div>;
}
function StatusBadge({ ready, label, compact = false }: { ready: boolean; label: string; compact?: boolean }) { return <div className={`rounded-2xl border px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] ${ready ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-200" : "border-zinc-700 bg-zinc-900 text-zinc-300"} ${compact ? "py-2" : ""}`}>{label}</div>; }
function DataCard({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"><div className="text-xs uppercase tracking-[0.22em] text-zinc-500">{label}</div><div className="mt-2 text-2xl font-black">{value}</div></div>; }
