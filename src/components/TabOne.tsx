import { useEffect, useState } from "react";

type Props = {
  onVerified: () => void;
};

export default function TabOne({ onVerified }: Props) {
  const [selected, setSelected] = useState(0);
  const [inputs, setInputs] = useState(["", "", ""]);

  const [state, setState] = useState([
    { answered: false, correct: false },
    { answered: false, correct: false },
    { answered: false, correct: false },
  ]);

  const correctAnswers = ["Улице Богдана Хмельницького 100", "СССР", "2"];

  useEffect(() => {
    const allCorrect = state.every((q) => q.answered && q.correct);
    if (allCorrect) {
      onVerified();
    }
  }, [state, onVerified]);

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

  return (
    <div className="bg-white p-10 rounded-xl shadow-xl text-center">
      {/* выбор вопроса */}
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

      {/* вопрос 1 */}
      {selected === 0 && (
        <div>
          <p className="font-semibold mb-4">
            Какой адрес был у так называемого Дворца спорта?
          </p>

          <input
            value={inputs[0]}
            onChange={(e) => updateInput(e.target.value, 0)}
            className="border p-2 mb-4 w-64"
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
              className={`mt-4 font-bold ${
                state[0].correct ? "text-green-600" : "text-red-600"
              }`}
            >
              {state[0].correct ? "Верно" : "Неверно"}
            </p>
          )}
        </div>
      )}

      {/* вопрос 2 */}
      {selected === 1 && (
        <div>
          <p className="font-semibold mb-4">
            Какая страна выиграла первый женский ЧМ (1952)?
          </p>

          <input
            value={inputs[1]}
            onChange={(e) => updateInput(e.target.value, 1)}
            className="border p-2 mb-4 w-64"
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
              className={`mt-4 font-bold ${
                state[1].correct ? "text-green-600" : "text-red-600"
              }`}
            >
              {state[1].correct ? "Верно" : "Неверно"}
            </p>
          )}
        </div>
      )}

      {/* вопрос 3 */}
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
            className="border p-2 mb-4 w-64"
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
              className={`mt-4 font-bold ${
                state[2].correct ? "text-green-600" : "text-red-600"
              }`}
            >
              {state[2].correct ? "Верно" : "Неверно"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
