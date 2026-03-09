import { useState } from "react";

type Props = {
  opened: boolean;
  onComplete: (foundRecordings: boolean) => void;
};

export default function TabFour({ opened, onComplete }: Props) {
  const [picked, setPicked] = useState<number | null>(null);

  const pickBox = (id: number) => {
    if (picked !== null || opened) return;
    setPicked(id);
    onComplete(id === 2);
  };

  return (
    <div className="w-full h-full bg-white p-8 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold mb-4">Вкладка 4: Три коробки</h2>
      <p className="mb-4">Один шанс открыть коробку. В одной записи Мистера Пиксельмона.</p>

      <div className="flex gap-4">
        {[1, 2, 3].map((id) => (
          <button
            key={id}
            disabled={picked !== null || opened}
            onClick={() => pickBox(id)}
            className="h-36 w-36 rounded-xl border-2 border-black bg-amber-100 hover:bg-amber-200 disabled:opacity-70"
          >
            Коробка {id}
          </button>
        ))}
      </div>

      {picked !== null && (
        <div className="mt-5 p-4 rounded border">
          {picked === 2 ? (
            <p>
              Нашел запись и подсказку к 5 вкладке. Чит-код: <b>RUBEJ-INDEX</b>
            </p>
          ) : (
            <p>
              Пусто. Но шумы из настроек намекают, что есть секретная 5 вкладка.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
