import { useState } from "react";

type Props = {
  verified: boolean;
  onEngineSolved: () => void;
};

export default function TabTwo({ verified, onEngineSolved }: Props) {
  const [stage, setStage] = useState(0);
  const [input, setInput] = useState("");
  const [admin, setAdmin] = useState(false);
  const [answers, setAnswers] = useState(["", "", "", ""]);

  const lightsGreen = !verified;

  const images = ["/img1.jpg", "/img2.jpg", "/img3.jpg"];

  const correct = ["кот", "машина", "дерево", "природа"];

  const checkAnswer = (i: number) => {
    if (answers[i].toLowerCase() === correct[i]) {
      if (i === 3) {
        onEngineSolved();
      }
    }
  };

  return (
    <div className="bg-white p-10 rounded-xl shadow-xl text-center w-[600px]">
      {/* двигатель */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-[300px] h-[200px] bg-neutral-800 rounded-xl flex flex-col items-center justify-center gap-4">
          {/* лампочки */}
          <div className="flex gap-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-full ${
                  lightsGreen ? "bg-green-500" : "bg-red-500"
                }`}
              />
            ))}
          </div>

          {/* экран */}
          <div className="bg-black text-green-400 w-[200px] h-[60px] flex items-center justify-center text-sm font-mono">
            ENGINE CORE
          </div>
        </div>
      </div>

      {/* кнопка перезагрузки */}
      {stage === 0 && !lightsGreen && (
        <button
          onClick={() => setStage(1)}
          className="px-6 py-2 bg-black text-white rounded"
        >
          Перезагрузить двигатель
        </button>
      )}

      {/* консоль */}
      {stage === 1 && (
        <div className="bg-black text-green-400 font-mono p-6 text-left rounded-lg">
          <p className="mb-4">root@engine:~$ override_security()</p>

          <p className="mb-2">setPassword = ?</p>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setStage(2)}
              className="text-left hover:text-green-200"
            >
              setPassword = wrong
            </button>

            <button
              onClick={() => setStage(2)}
              className="text-left hover:text-green-200"
            >
              setPassword = 123
            </button>

            <button
              onClick={() => {
                setAdmin(true);
                setStage(2);
              }}
              className="text-left hover:text-green-200"
            >
              setPassword = true
            </button>
          </div>
        </div>
      )}

      {/* админ доступ */}
      {stage === 2 && admin && (
        <div className="mt-6">
          <p className="mb-4 font-semibold">admin privileges granted</p>

          <button
            onClick={() => setStage(3)}
            className="px-6 py-2 bg-black text-white rounded"
          >
            Перезапустить систему
          </button>
        </div>
      )}

      {/* картинки */}
      {stage === 3 && (
        <div className="flex flex-col items-center gap-4">
          <img src={images[0]} className="w-48" />

          <input
            value={answers[0]}
            onChange={(e) => {
              const a = [...answers];
              a[0] = e.target.value;
              setAnswers(a);
            }}
            className="border p-2"
            placeholder="Что на картинке?"
          />

          <button
            onClick={() => {
              checkAnswer(0);
              setStage(4);
            }}
            className="bg-black text-white px-4 py-2"
          >
            Ответить
          </button>
        </div>
      )}

      {stage === 4 && (
        <div className="flex flex-col items-center gap-4">
          <img src={images[1]} className="w-48" />

          <input
            value={answers[1]}
            onChange={(e) => {
              const a = [...answers];
              a[1] = e.target.value;
              setAnswers(a);
            }}
            className="border p-2"
          />

          <button
            onClick={() => {
              checkAnswer(1);
              setStage(5);
            }}
            className="bg-black text-white px-4 py-2"
          >
            Ответить
          </button>
        </div>
      )}

      {stage === 5 && (
        <div className="flex flex-col items-center gap-4">
          <img src={images[2]} className="w-48" />

          <input
            value={answers[2]}
            onChange={(e) => {
              const a = [...answers];
              a[2] = e.target.value;
              setAnswers(a);
            }}
            className="border p-2"
          />

          <button
            onClick={() => {
              checkAnswer(2);
              setStage(6);
            }}
            className="bg-black text-white px-4 py-2"
          >
            Ответить
          </button>
        </div>
      )}

      {/* общий вопрос */}
      {stage === 6 && (
        <div className="flex flex-col items-center gap-4">
          <p>Что объединяет все картинки?</p>

          <input
            value={answers[3]}
            onChange={(e) => {
              const a = [...answers];
              a[3] = e.target.value;
              setAnswers(a);
            }}
            className="border p-2"
          />

          <button
            onClick={() => checkAnswer(3)}
            className="bg-black text-white px-4 py-2"
          >
            Ответить
          </button>
        </div>
      )}
    </div>
  );
}
