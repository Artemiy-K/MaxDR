import { useState } from "react";

type Props = {
  opened: boolean;
  onComplete: (selectedBox: number) => void;
  onBoxThreeHoverChange?: (hovered: boolean) => void;
};

export default function TabFour({ opened, onComplete, onBoxThreeHoverChange }: Props) {
  const [picked, setPicked] = useState<number | null>(null);

  const pickBox = (id: number) => {
    if (picked !== null || opened) return;
    setPicked(id);
    onComplete(id);
  };

  return (
    <div className="flex h-full w-full flex-col rounded-xl bg-white p-8 shadow-xl">
      <h2 className="mb-4 text-center text-2xl font-bold">Вкладка 4: Три коробки</h2>
      <p className="mb-8 text-center text-zinc-600">Один шанс открыть коробку.</p>

      <div className="flex flex-1 items-center justify-center gap-8">
        {[1, 2, 3].map((id) => (
          <button
            key={id}
            onClick={() => pickBox(id)}
            onMouseEnter={() => id === 3 && onBoxThreeHoverChange?.(true)}
            onMouseLeave={() => id === 3 && onBoxThreeHoverChange?.(false)}
            onFocus={() => id === 3 && onBoxThreeHoverChange?.(true)}
            onBlur={() => id === 3 && onBoxThreeHoverChange?.(false)}
            aria-disabled={picked !== null || opened}
            className="group flex flex-col items-center gap-4"
          >
            <img
              src="/korobka.jpg"
              alt={`Коробка ${id}`}
              className="h-72 w-56 rounded-3xl border-2 border-zinc-900 object-cover shadow-xl transition group-hover:scale-[1.02]"
            />
            <span className="text-lg font-bold text-zinc-800">Коробка {id}</span>
          </button>
        ))}
      </div>

      {picked !== null && (
        <div className="mt-8 rounded-2xl border p-5 text-center">
          {picked === 2 && <p>Нашел запись и подсказку к 5 вкладке. Чит-код: <b>RUBEJ-INDEX</b></p>}
          {picked === 3 && <p>Музыка оборвалась. Из коробки выпало радио.</p>}
          {picked === 1 && <p>Пусто. Но шумы из настроек намекают, что дальше все равно важна вкладка 5.</p>}
        </div>
      )}
    </div>
  );
}
