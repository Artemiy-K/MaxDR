import { useEffect, useState } from "react";

type Props = {
  onComplete: () => void;
};

type FloatMessage = {
  id: number;
  top: number;
  left: number;
  text: string;
};

const phrases = [
  "сервер перегружен",
  "требуется перезапуск",
  "ядро нестабильно",
  "ошибка канала",
  "память переполнена",
  "аварийный сброс",
  "система не отвечает",
  "восстановление прервано",
];

export default function ServerCrashSequence({ onComplete }: Props) {
  const [messages, setMessages] = useState<FloatMessage[]>([]);
  const [showReboot, setShowReboot] = useState(false);

  useEffect(() => {
    let id = 0;
    const spawnTimer = window.setInterval(() => {
      const nextId = id + 1;
      id = nextId;
      const nextMessage = {
        id: nextId,
        top: 8 + Math.random() * 78,
        left: 6 + Math.random() * 82,
        text: phrases[Math.floor(Math.random() * phrases.length)],
      };
      setMessages((current) => [...current.slice(-18), nextMessage]);
    }, 140);

    const rebootTimer = window.setTimeout(() => setShowReboot(true), 1800);
    const finishTimer = window.setTimeout(onComplete, 4300);

    return () => {
      window.clearInterval(spawnTimer);
      window.clearTimeout(rebootTimer);
      window.clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.18),transparent_45%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.12),transparent_40%)]" />

      {messages.map((message) => (
        <div
          key={message.id}
          className="absolute rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-red-200 shadow-[0_0_24px_rgba(239,68,68,0.18)]"
          style={{ top: `${message.top}%`, left: `${message.left}%` }}
        >
          {message.text}
        </div>
      ))}

      <div className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-zinc-800 bg-zinc-950/85 p-8 text-center shadow-2xl">
        <div className="text-sm uppercase tracking-[0.35em] text-red-300">Критический сбой</div>
        <h1 className="mt-4 text-4xl font-black uppercase tracking-[0.08em] md:text-5xl">Система рушится</h1>
        <p className="mt-4 text-zinc-400">Ядра перегреты. Сайт экстренно закрывает интерфейс и пытается запуститься заново.</p>

        {showReboot && (
          <div className="mt-8 rounded-[1.5rem] border border-zinc-800 bg-black/40 p-5">
            <div className="mb-3 text-sm uppercase tracking-[0.28em] text-zinc-500">Перезапуск сайта</div>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full animate-[rebootFill_2.2s_linear_forwards] rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-cyan-300" />
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes rebootFill { from { width: 0%; } to { width: 100%; } }`}</style>
    </div>
  );
}
