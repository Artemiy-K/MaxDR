import { useEffect, useState } from "react";

type TabOneMode = "questions" | "crossword" | "address" | "goodbye";

type Props = {
  mode: TabOneMode;
  onQuestionsComplete: () => void;
  onCrosswordComplete: () => void;
  onFinalRestore: () => void;
};

export default function TabOne({
  mode,
  onQuestionsComplete,
  onCrosswordComplete,
  onFinalRestore,
}: Props) {
  const [selected, setSelected] = useState(0);
  const [inputs, setInputs] = useState(["", "", ""]);
  const [state, setState] = useState([
    { answered: false, correct: false },
    { answered: false, correct: false },
    { answered: false, correct: false },
  ]);

  const [crosswordInputs, setCrosswordInputs] = useState(["", "", ""]);
  const [crosswordDone, setCrosswordDone] = useState(false);

  const correctAnswers = ["улица богдана хмельницкого 100", "СССР", "2"];
  const crosswordAnswers = ["макс", "варя", "index rubej"];

  useEffect(() => {
    if (mode !== "questions") {
      return;
    }

    const allCorrect = state.every((q) => q.answered && q.correct);
    if (allCorrect) {
      onQuestionsComplete();
    }
  }, [state, onQuestionsComplete, mode]);

  useEffect(() => {
    if (mode !== "crossword") {
      return;
    }

    if (crosswordDone) {
      onCrosswordComplete();
    }
  }, [crosswordDone, onCrosswordComplete, mode]);

  const submit = (index: number) => {
    const isCorrect =
      inputs[index].trim().toLowerCase() ===
      correctAnswers[index].toLowerCase();

    const newState = [...state];
    newState[index] = { answered: true, correct: isCorrect };
    setState(newState);
  };

  const updateInput = (value: string, index: number) => {
    const arr = [...inputs];
    arr[index] = value;
    setInputs(arr);
  };

  const checkCrossword = () => {
    const ok = crosswordInputs.every(
      (value, index) =>
        value.trim().toLowerCase() === crosswordAnswers[index].toLowerCase(),
    );

    setCrosswordDone(ok);
  };

  if (mode === "address") {
    return (
      <div className="w-full h-full bg-white p-10 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Остались только зацепки</h2>
        <p className="mb-2">Адрес: ул. Богдана Хмельницкого, 100</p>
        <p className="mb-2">Возможная локация: старый серверный узел</p>
        <p className="text-sm text-neutral-600 mt-6">
          На вкладке 1 больше нет заданий, только ориентиры по истории.
        </p>
      </div>
    );
  }

  if (mode === "goodbye") {
    return (
      <div className="w-full h-full bg-white p-10 rounded-xl shadow-xl flex flex-col justify-center items-center text-center gap-5">
        <h2 className="text-3xl font-bold">Прощай</h2>
        <p>Сайт выдал ложный код. Восстановить последние 1%?</p>
        <button
          onClick={onFinalRestore}
          className="px-6 py-2 rounded bg-black text-white"
        >
          Да, восстановить 1%
        </button>
      </div>
    );
  }

  if (mode === "crossword") {
    return (
      <div className="w-full h-full bg-white p-10 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6">Кроссворд после перезапуска</h2>
        <div className="grid gap-3 max-w-xl">
          <input
            value={crosswordInputs[0]}
            onChange={(e) =>
              setCrosswordInputs((prev) => [e.target.value, prev[1], prev[2]])
            }
            className="border p-2"
            placeholder="Имя главного героя"
          />
          <input
            value={crosswordInputs[1]}
            onChange={(e) =>
              setCrosswordInputs((prev) => [prev[0], e.target.value, prev[2]])
            }
            className="border p-2"
            placeholder="Имя девушки"
          />
          <input
            value={crosswordInputs[2]}
            onChange={(e) =>
              setCrosswordInputs((prev) => [prev[0], prev[1], e.target.value])
            }
            className="border p-2"
            placeholder="Фраза финальных букв"
          />
          <button
            onClick={checkCrossword}
            className="px-6 py-2 bg-black text-white rounded"
          >
            Проверить кроссворд
          </button>
          {crosswordDone ? (
            <p className="text-green-600 font-semibold">
              Отлично. Тебе дали лучший интернет, вкладка 3 активна.
            </p>
          ) : (
            <p className="text-neutral-600 text-sm">
              Подсказка: финальная фраза пишется как "index rubej".
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white p-8 rounded-xl shadow-xl overflow-y-auto">
      <div className="mb-8 flex justify-center">
        <iframe
          width="760"
          height="380"
          src="https://www.youtube.com/embed/KyQ7wxDRnHY"
          title="video"
          allowFullScreen
        />
      </div>

      <div className="max-w-4xl mx-auto text-center ">
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2].map((i) => {
            const s = state[i];
            let style = "text-black";

            if (s.answered) {
              style = s.correct
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white";
            }

            if (selected === i) {
              style += " border-black";
            }

            return (
              <div
                key={i}
                onClick={() => setSelected(i)}
                className={`w-12 h-12 flex items-center justify-center cursor-pointer border-2 rounded-md ${style}`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        {selected === 0 && (
          <div>
            <p className="font-semibold mb-4">
              Какой адрес был у так называемого Дворца спорта?
            </p>
            <input
              value={inputs[0]}
              onChange={(e) => updateInput(e.target.value, 0)}
              className="border p-2 mb-4 w-72"
            />
            <br />
            <button
              onClick={() => submit(0)}
              className="px-6 py-2 bg-black text-white rounded"
            >
              Ответить
            </button>
            {state[0].answered && (
              <p
                className={`mt-4 font-bold ${state[0].correct ? "text-green-600" : "text-red-600"}`}
              >
                {state[0].correct ? "Верно" : "Неверно"}
              </p>
            )}
          </div>
        )}

        {selected === 1 && (
          <div>
            <p className="font-semibold mb-4">
              Какая страна выиграла первый женский ЧМ (1952)?
            </p>
            <input
              value={inputs[1]}
              onChange={(e) => updateInput(e.target.value, 1)}
              className="border p-2 mb-4 w-72"
            />
            <br />
            <button
              onClick={() => submit(1)}
              className="px-6 py-2 bg-black text-white rounded"
            >
              Ответить
            </button>
            {state[1].answered && (
              <p
                className={`mt-4 font-bold ${state[1].correct ? "text-green-600" : "text-red-600"}`}
              >
                {state[1].correct ? "Верно" : "Неверно"}
              </p>
            )}
          </div>
        )}

        {selected === 2 && (
          <div>
            <p className="font-semibold mb-4">Реши уравнение:</p>
            <img
              src="/equation.jpg"
              alt="equation"
              className="mx-auto mb-4 w-[700px] h-[300px]"
            />
            <input
              value={inputs[2]}
              onChange={(e) => updateInput(e.target.value, 2)}
              className="border p-2 mb-4 w-72"
            />
            <br />
            <button
              onClick={() => submit(2)}
              className="px-6 py-2 bg-black text-white rounded"
            >
              Ответить
            </button>
            {state[2].answered && (
              <p
                className={`mt-4 font-bold ${state[2].correct ? "text-green-600" : "text-red-600"}`}
              >
                {state[2].correct ? "Верно" : "Неверно"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
