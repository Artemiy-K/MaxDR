import { useEffect, useMemo, useState } from "react";
import RhythmArrowGame from "./RhythmArrowGame";

const REQUIRED_SCORE = 1500;

type LevelKey = "level1" | "level2" | "level3";

type Props = {
  hasShawarma: boolean;
  contestAccess: boolean;
  respected: boolean;
  onSubmitShawarma: () => void;
  onEarnRespect: () => void;
};

export default function TabFive({
  hasShawarma,
  contestAccess,
  respected,
  onSubmitShawarma,
  onEarnRespect,
}: Props) {
  const [levelScores, setLevelScores] = useState<Record<LevelKey, number>>({
    level1: 0,
    level2: 0,
    level3: 0,
  });

  const allPassed = useMemo(
    () =>
      levelScores.level1 >= REQUIRED_SCORE &&
      levelScores.level2 >= REQUIRED_SCORE &&
      levelScores.level3 >= REQUIRED_SCORE,
    [levelScores],
  );

  useEffect(() => {
    if (allPassed && !respected) {
      onEarnRespect();
    }
  }, [allPassed, onEarnRespect, respected]);

  const handleFinish = (level: LevelKey, score: number) => {
    setLevelScores((prev) => ({
      ...prev,
      [level]: Math.max(prev[level], score),
    }));
  };

  return (
    <div className="h-full w-full overflow-y-auto rounded-xl bg-white p-8 shadow-xl">
      <h2 className="mb-4 text-2xl font-bold">Вкладка 5: Рояль Айрата</h2>

      {!hasShawarma && !contestAccess && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <p className="font-semibold">
            Для участия в конкурсе сначала нужна шаурма от шаурмиста.
          </p>
          <p className="mt-2 text-sm">
            Возвращайся на вкладку 6, возьми шаурму и потом приходи сюда.
          </p>
        </div>
      )}

      {hasShawarma && !contestAccess && (
        <div className="rounded-2xl border border-zinc-200 p-5">
          <p className="text-lg font-semibold">Конкурс уважения открыт.</p>
          <p className="mt-2 text-sm text-zinc-600">
            Отдай шаурму за участие — только после этого рояль откроется.
          </p>
          <button
            onClick={onSubmitShawarma}
            className="mt-5 rounded-2xl bg-zinc-950 px-5 py-3 font-bold text-white transition hover:bg-zinc-800"
          >
            Отдать шаурму за участие
          </button>
        </div>
      )}

      {contestAccess && !respected && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-zinc-200 p-5">
            <p className="text-lg font-semibold">Конкурс уважения открыт.</p>
            <p className="mt-2 text-sm text-zinc-600">
              Нужно пройти все 3 уровня и набрать минимум {REQUIRED_SCORE} на
              каждом.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              {(
                [
                  ["level1", "Уровень 1"],
                  ["level2", "Уровень 2"],
                  ["level3", "Уровень 3"],
                ] as const
              ).map(([key, label]) => (
                <div
                  key={key}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3"
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {label}
                  </div>
                  <div className="mt-2 text-lg font-bold">
                    {levelScores[key as LevelKey]}/{REQUIRED_SCORE}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <RhythmArrowGame onFinish={handleFinish} />
        </div>
      )}

      {respected && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
          <p className="text-lg font-semibold">Айрат тебя уважает.</p>
          <p className="mt-2 text-sm">
            Рояль сыгран как надо. Теперь он уже не будет морозиться и дальше
            можно просить фонарик.
          </p>
        </div>
      )}
    </div>
  );
}
