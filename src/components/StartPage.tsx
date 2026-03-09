import { useState, useEffect } from "react";

type StartPageProps = {
  setStageLoading: () => void;
};

function StartPage({ setStageLoading }: StartPageProps) {
  const [stage, setStage] = useState<
    "error" | "loading" | "failed" | "recovered" | "dangerous" | "form"
  >("error");
  const [progress, setProgress] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (stage === "loading") {
      let value = 0;

      const interval = setInterval(() => {
        if (value < 87) {
          value += Math.random() * 5;
        } else if (value < 99) {
          value += 0.3; // замедление
        } else {
          clearInterval(interval);

          // драматичная пауза
          setTimeout(() => {
            setDisplayProgress(1);
            setProgress(1);
            setStage("failed");
          }, 800);

          return;
        }

        setDisplayProgress(Math.floor(value));
        setProgress(value);
      }, 120);

      return () => clearInterval(interval);
    }
  }, [stage]);

  const [showGlitchBox, setShowGlitchBox] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    if (stage !== "dangerous") return;

    const glitchTimer = setTimeout(() => {
      setShowGlitchBox(true);
    }, 1200);

    const buttonTimer = setTimeout(() => {
      setShowButtons(true);
    }, 2600);

    return () => {
      clearTimeout(glitchTimer);
      clearTimeout(buttonTimer);
    };
  }, [stage]);

  const [form, setForm] = useState({
    address: "",
    name: "",
    surname: "",
    year: "",
    phone: "",
  });

  const [networkError, setNetworkError] = useState(false);
  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 });
  const [audioPlayed, setAudioPlayed] = useState(false); // false

  const isFormValid = Object.values(form).every((v) => v.trim() !== "");

  const moveButton = () => {
    setBtnPos({
      x: Math.random() * 1600,
      y: Math.random() * 620,
    });
  };

  const handleSubmit = () => {
    if (!networkError) {
      setNetworkError(true);
    }

    if (!audioPlayed) {
      const audio = new Audio("/public/prosba.mp3");
      audio.play().catch(() => {});
      setAudioPlayed(true);

      audio.onended = () => {
        setStage("dangerous"); // или другой этап
        setNetworkError(false);
        setBtnPos({ x: 0, y: 0 });
      };
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#36454F] text-white text-center">
      {stage === "error" && (
        <>
          <h1 className="text-3xl font-bold mb-4">Сайт не найден</h1>
          <p className="text-gray-300">Возможно владелец удалил его</p>
          <button
            onClick={() => setStage("loading")}
            className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg transition"
          >
            Попробовать восстановить
          </button>
        </>
      )}

      {stage === "loading" && (
        <>
          <h1 className="text-2xl font-semibold mb-4">
            Восстановление данных...
          </h1>

          <div className="w-80 h-6 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-3 text-gray-400">{displayProgress}%</p>
        </>
      )}

      {stage === "failed" && (
        <>
          <h1 className="text-2xl font-semibold mb-4 text-red-500">
            Ошибка восстановления
          </h1>

          <div className="w-80 h-6 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 transition-all duration-500"
              style={{ width: "1%" }}
            />
          </div>

          <p className="mt-3 text-red-400">Удалось восстановить только 1%</p>

          <button
            onClick={() => setStage("recovered")}
            className="mt-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
          >
            Посмотреть информацию, которую удалось восстановить
          </button>
        </>
      )}

      {stage === "recovered" && (
        <div className="max-w-lg items-center flex w-full h-full flex-col mt-[100px] ">
          <h1 className="text-2xl font-bold mb-4">Восстановленный фрагмент</h1>

          <div className="">
            <iframe
              width="760"
              height="380"
              src="https://www.youtube.com/embed/KyQ7wxDRnHY"
              title="video"
              allowFullScreen
            />
          </div>
        </div>
      )}
      {stage === "dangerous" && (
        <div className="relative flex flex-col items-center justify-center h-screen bg-red-950 text-white text-center w-full overflow-hidden">
          <h1 className="text-4xl font-bold text-red-500 mb-4 flicker">
            Опасное соединение
          </h1>

          <p className="text-red-300 mb-2">
            Доступ к восстановленным данным заблокирован
          </p>

          <p className="text-gray-400">
            Система обнаружила подозрительную активность
          </p>

          {/* Глючный блок */}
          {showGlitchBox && (
            <div
              className={`glitch absolute bottom-6 right-6 bg-black/90 p-4  border border-red-700 rounded-xl transition-all duration-700 ease-out ${showGlitchBox ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"}`}
            >
              <div className="glitch-offset">
                <p className="text-sm text-red-400 mb-3 flicker ui-btn">
                  Соединение нестабильно...
                </p>

                {showButtons && (
                  <div className="flex flex-col gap-2">
                    {audioPlayed ? (
                      <button
                        className="px-4 py-2 bg-black rounded transition transform hover:scale-105 ui-span "
                        onClick={() => setStage("form")}
                      >
                        <span data-text="Я отправлю обратно">
                          Я отправлю обратно
                        </span>
                      </button>
                    ) : (
                      <button
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition transform hover:scale-105 ui-btn"
                        onClick={() => setStage("form")}
                      >
                        <span data-text="Я отправлю обратно">
                          Я отправлю обратно
                        </span>
                      </button>
                    )}

                    <button
                      className="px-4 py-2 bg-red-600 hover:bg-red-100 rounded transition transform hover:scale-105 ui-btn"
                      onClick={setStageLoading}
                    >
                      <span
                        data-text="Я просто дейлики в центре кузни решил поделать (оставить
                      себе)"
                      >
                        Я просто дейлики в центре кузни решил поделать (оставить
                        себе)
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {stage === "form" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center  backdrop-blur text-white h-screen bg-red-950">
          <h1 className="text-4xl font-bold text-red-500 mb-[100px] flicker">
            Опасное соединение
          </h1>
          <div className="bg-red-600 p-6 rounded-xl w-[380px] relative">
            <h2 className="text-xl font-bold mb-4 text-center">
              Данные отправки
            </h2>

            <div className="flex flex-col gap-3">
              <input
                className="p-2 rounded bg-red-800 border border-gray-700"
                placeholder="Адрес"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              <input
                className="p-2 rounded bg-red-800 border border-gray-700"
                placeholder="Имя"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="p-2 rounded bg-red-800 border border-gray-700"
                placeholder="Фамилия"
                value={form.surname}
                onChange={(e) => setForm({ ...form, surname: e.target.value })}
              />
              <input
                className="p-2 rounded bg-red-800 border border-gray-700"
                placeholder="Год рождения"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
              <input
                className="p-2 rounded bg-red-800 border border-gray-700"
                placeholder="Телефон"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            {networkError && (
              <p className="text-white text-sm mt-3">
                Ваше соединение нестабильно, попробуйте купить провод и нажать
                ещё раз
              </p>
            )}

            <button
              onMouseEnter={() => {
                if (networkError) moveButton();
              }}
              onClick={() => {
                if (!isFormValid) return;
                handleSubmit();
              }}
              disabled={!isFormValid}
              style={{
                transform: `translate(${btnPos.x}px, ${btnPos.y}px)`,
              }}
              className={`mt-5 px-4 py-2 rounded transition relative ${
                isFormValid
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-700 cursor-not-allowed"
              }`}
            >
              Отправить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StartPage;
