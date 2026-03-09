import { useState } from "react";

type Props = {
  unlocked: boolean;
  onUnlock: () => void;
  onComplete: () => void;
};

export default function TabFive({ unlocked, onUnlock, onComplete }: Props) {
  const [code, setCode] = useState("");
  const [redirects, setRedirects] = useState(0);
  const [spiderRuns, setSpiderRuns] = useState(0);

  const tryUnlock = () => {
    if (code.trim().toUpperCase() === "RUBEJ-INDEX") {
      onUnlock();
    }
  };

  const canFinish = redirects >= 3 && spiderRuns >= 3;

  return (
    <div className="w-full h-full bg-white p-8 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold mb-4">Вкладка 5</h2>

      {!unlocked && (
        <div className="rounded border p-4 mb-5">
          <p className="mb-2">Введи чит-код, чтобы раскрыть вкладку.</p>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="border p-2 flex-1"
              placeholder="RUBEJ-INDEX"
            />
            <button onClick={tryUnlock} className="px-4 py-2 rounded bg-black text-white">
              Открыть
            </button>
          </div>
        </div>
      )}

      {unlocked && (
        <div className="rounded border p-4">
          <p className="mb-2">Перенаправить водопроводчика: {redirects}/3</p>
          <button
            onClick={() => setRedirects((v) => Math.min(3, v + 1))}
            className="px-4 py-2 rounded bg-cyan-600 text-white mb-4"
          >
            Перенаправить
          </button>

          <p className="mb-2">Мини-игра паука: {spiderRuns}/3</p>
          <button
            onClick={() => setSpiderRuns((v) => Math.min(3, v + 1))}
            className="px-4 py-2 rounded bg-fuchsia-600 text-white"
          >
            Пройти мини-игру
          </button>

          <div className="mt-5">
            <button
              onClick={onComplete}
              disabled={!canFinish}
              className={`px-5 py-2 rounded ${
                canFinish ? "bg-black text-white" : "bg-neutral-200 text-neutral-500"
              }`}
            >
              Завершить сюжет
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
