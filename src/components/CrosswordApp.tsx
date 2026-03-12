import { useEffect, useMemo, useState } from "react";

type Cell = {
  solution: string;
  numbers?: number[];
  acrossClue?: string;
  downClue?: string;
};

type CrosswordAppProps = {
  onSolved: () => void;
};

const words = {
  1: "БАЛКОВОЙ",
  2: "ЯИЧКИ",
  3: "ДВОРИК",
  4: "БАНКА",
  5: "ШЛЕПКИ",
  6: "НИКТО",
} as const;

const clues = {
  across: [
    {
      number: 1,
      clue: "Кто показал джун джурика на уроке физики",
      answer: "БАЛКОВОЙ",
    },
  ],
  down: [
    {
      number: 2,
      clue: "Какое слово больше всего на базаре раздражает Викторию Леонидовну",
      answer: "ЯИЧКИ",
    },
    {
      number: 3,
      clue: "Краткое название дворца спорта",
      answer: "ДВОРИК",
    },
    {
      number: 4,
      clue: "Ответ, который имеет в себе корень «банк» и не был отвечен на экзамене русского языка Артемом",
      answer: "БАНКА",
    },
    {
      number: 5,
      clue: "Что зарыл Коля в песке на волейбольном поле, что принадлежало Артему",
      answer: "ШЛЕПКИ",
    },
    {
      number: 6,
      clue: "Кто выиграл у Стефана",
      answer: "НИКТО",
    },
  ],
} as const;

const size = 9;

const addStartNumber = (current: Cell | null, number: number, isStart: boolean) => {
  if (!isStart) {
    return current?.numbers;
  }

  const numbers = current?.numbers ?? [];
  return numbers.includes(number) ? numbers : [...numbers, number];
};

const createGrid = (): (Cell | null)[][] => {
  const grid: (Cell | null)[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null),
  );

  const placeAcross = (
    row: number,
    col: number,
    answer: string,
    number: number,
    clue: string,
  ) => {
    for (let index = 0; index < answer.length; index++) {
      const current = grid[row][col + index];
      grid[row][col + index] = {
        solution: answer[index],
        numbers: addStartNumber(current, number, index === 0),
        acrossClue: index === 0 ? clue : current?.acrossClue,
        downClue: current?.downClue,
      };
    }
  };

  const placeDown = (
    row: number,
    col: number,
    answer: string,
    number: number,
    clue: string,
  ) => {
    for (let index = 0; index < answer.length; index++) {
      const current = grid[row + index][col];
      grid[row + index][col] = {
        solution: answer[index],
        numbers: addStartNumber(current, number, index === 0),
        acrossClue: current?.acrossClue,
        downClue: index === 0 ? clue : current?.downClue,
      };
    }
  };

  placeAcross(4, 0, words[1], 1, clues.across[0].clue);
  placeDown(1, 3, words[2], 2, clues.down[0].clue);
  placeDown(2, 4, words[3], 3, clues.down[1].clue);
  placeDown(4, 0, words[4], 4, clues.down[2].clue);
  placeDown(3, 2, words[5], 5, clues.down[3].clue);
  placeDown(0, 6, words[6], 6, clues.down[4].clue);

  return grid;
};

export default function CrosswordApp({ onSolved }: CrosswordAppProps) {
  const grid = useMemo(() => createGrid(), []);
  const [values, setValues] = useState<Record<string, string>>({});

  const handleChange = (row: number, col: number, value: string) => {
    const letter = value
      .slice(-1)
      .toUpperCase()
      .replace(/[^А-ЯЁ]/g, "");
    setValues((prev) => ({ ...prev, [`${row}-${col}`]: letter }));
  };

  const solved = useMemo(() => {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const cell = grid[row][col];
        if (!cell) continue;
        const key = `${row}-${col}`;
        if ((values[key] || "").toUpperCase() !== cell.solution.toUpperCase()) {
          return false;
        }
      }
    }
    return true;
  }, [grid, values]);

  useEffect(() => {
    if (solved) {
      onSolved();
    }
  }, [onSolved, solved]);

  return (
    <div className="w-full h-full overflow-y-auto rounded-xl bg-slate-100 p-6 text-slate-900 shadow-xl">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-6 shadow-xl">
        <h2 className="text-3xl font-bold">Кроссворд на 6 слов</h2>
        <p className="mt-2 text-sm text-slate-600">
          Заполни клетки. Все ответы встроены в сетку и пересекаются между
          собой.
        </p>

        <div className="mt-6 grid gap-8 lg:grid-cols-[auto_1fr]">
          <div className="overflow-auto">
            <div
              className="grid gap-1 rounded-2xl bg-slate-300 p-2"
              style={{ gridTemplateColumns: `repeat(${size}, 48px)` }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const key = `${rowIndex}-${colIndex}`;

                  if (!cell) {
                    return (
                      <div
                        key={key}
                        className="h-12 w-12 rounded-md bg-slate-800"
                      />
                    );
                  }

                  const value = values[key] || "";
                  const isCorrect = values[key]?.toUpperCase() === cell.solution;
                  const primaryNumber = cell.numbers?.[0];
                  const secondaryNumber = cell.numbers?.[1];

                  return (
                    <div key={key} className="relative h-12 w-12">
                      {primaryNumber ? (
                        <span className="absolute left-1 top-0 z-10 text-[10px] font-bold text-slate-500">
                          {primaryNumber}
                        </span>
                      ) : null}
                      {secondaryNumber ? (
                        <span className="absolute right-1 top-0 z-10 text-[10px] font-bold text-slate-500">
                          {secondaryNumber}
                        </span>
                      ) : null}
                      <input
                        value={value}
                        onChange={(e) =>
                          handleChange(rowIndex, colIndex, e.target.value)
                        }
                        maxLength={1}
                        className={`h-12 w-12 rounded-md border-2 bg-white text-center text-xl font-bold uppercase outline-none transition ${
                          isCorrect
                            ? "border-emerald-400"
                            : "border-slate-300 focus:border-blue-500"
                        }`}
                      />
                    </div>
                  );
                }),
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-xl font-semibold">По горизонтали</h3>
              <div className="mt-4 space-y-4 text-sm leading-6">
                {clues.across.map((item) => (
                  <div key={item.number}>
                    <div className="font-semibold">
                      {item.number}. {item.clue}
                    </div>
                    <div className="text-slate-500">
                      Ответ: {item.answer.length} букв
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-xl font-semibold">По вертикали</h3>
              <div className="mt-4 space-y-4 text-sm leading-6">
                {clues.down.map((item) => (
                  <div key={item.number}>
                    <div className="font-semibold">
                      {item.number}. {item.clue}
                    </div>
                    <div className="text-slate-500">
                      Ответ: {item.answer.length} букв
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setValues({})}
            className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold transition hover:bg-slate-50"
          >
            Очистить
          </button>
          <div className="flex items-center rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium">
            {solved
              ? "Кроссворд решен верно"
              : "Пока не все заполнено правильно"}
          </div>
        </div>
      </div>
    </div>
  );
}
