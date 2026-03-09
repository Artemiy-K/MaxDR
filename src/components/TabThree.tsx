import { useState } from "react";

type Props = {
  nightMode: boolean;
  canSleep: boolean;
  casinoRuns: number;
  policeNearby: boolean;
  reasonSolved: boolean;
  onLearnGerman: () => void;
  onToggleNight: () => void;
  onPlayCasino: () => void;
  onSolveReason: () => void;
};

export default function TabThree({
  nightMode,
  canSleep,
  casinoRuns,
  policeNearby,
  reasonSolved,
  onLearnGerman,
  onToggleNight,
  onPlayCasino,
  onSolveReason,
}: Props) {
  const [reasonInput, setReasonInput] = useState("");

  const submitReason = () => {
    const normalized = reasonInput.toLowerCase().trim();
    if (normalized.includes("долг") || normalized.includes("давление")) {
      onSolveReason();
    }
  };

  return (
    <div className="w-full h-full bg-white p-8 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold mb-4">Вкладка 3: Казино</h2>
      <p className="mb-3">Казино работает только ночью.</p>

      <div className="flex flex-wrap gap-3 mb-5">
        <button onClick={onLearnGerman} className="px-4 py-2 rounded bg-black text-white">
          Изучить немецкие слова
        </button>
        <button
          onClick={onToggleNight}
          disabled={!canSleep}
          className={`px-4 py-2 rounded ${
            canSleep ? "bg-indigo-600 text-white" : "bg-neutral-200 text-neutral-500"
          }`}
        >
          {nightMode ? "Проснуться (день)" : "Спать (ночь)"}
        </button>
      </div>

      <div className="rounded-lg border p-4 mb-5">
        <p className="mb-2">Состояние: {nightMode ? "Ночь" : "День"}</p>
        <p className="mb-2">Полиция рядом: {policeNearby ? "Да" : "Нет"}</p>
        <p>Сыграно в казино: {casinoRuns}/3</p>
        <button
          onClick={onPlayCasino}
          disabled={!nightMode || policeNearby || casinoRuns >= 3}
          className={`mt-3 px-4 py-2 rounded ${
            !nightMode || policeNearby || casinoRuns >= 3
              ? "bg-neutral-200 text-neutral-500"
              : "bg-emerald-600 text-white"
          }`}
        >
          Играть в казино
        </button>
      </div>

      <div className="rounded-lg border p-4">
        <p className="mb-2">Ночью произошла трагедия. Почему тип выпилился?</p>
        <div className="flex gap-2">
          <input
            value={reasonInput}
            onChange={(e) => setReasonInput(e.target.value)}
            className="border p-2 flex-1"
            placeholder="Например: долги, сильное давление"
          />
          <button onClick={submitReason} className="px-4 py-2 rounded bg-black text-white">
            Ответить
          </button>
        </div>
        {reasonSolved && <p className="text-green-600 mt-2">Принято.</p>}
      </div>
    </div>
  );
}
