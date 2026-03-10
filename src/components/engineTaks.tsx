import { useEffect, useMemo, useState } from "react";

interface EnginePanelProps {
  stage: "firstBreakdown" | "restored";
  onSolved?: () => void;
  linkOnline: boolean;
  setLinkOnline: (value: boolean) => void;
  checkIndex: number;
  setCheckIndex: (value: number) => void;
  appendLog: (line: string) => void;
  setAuthMessage: (value: string) => void;
  adminGranted: boolean;
}

const engineChecks = [
  {
    prompt: "Как правильно включить движок?",
    options: ["setEngine = true", "setEngine = false", 'setEngine = "123"'],
    correct: "setEngine = true",
  },
  {
    prompt: "Что означает setEngine = false?",
    options: ["Двигатель работает", "Двигатель выключен", "Это пароль"],
    correct: "Двигатель выключен",
  },
  {
    prompt: "Какой тип здесь ломает логику флага?",
    options: ["true", "false", '"123"'],
    correct: '"123"',
  },
  {
    prompt: "Флаг admin можно включать без взлома?",
    options: ["Да", "Нет"],
    correct: "Нет",
  },
] as const;

export const ENGINE_CHECKS_COUNT = engineChecks.length;

export default function EnginePanel({
  stage,
  onSolved,
  linkOnline,
  setLinkOnline,
  checkIndex,
  setCheckIndex,
  appendLog,
  setAuthMessage,
  adminGranted,
}: EnginePanelProps) {
  const [hintTop, setHintTop] = useState(true);
  const [hintLeft, setHintLeft] = useState(false);
  const [hintBottom, setHintBottom] = useState(false);
  const [buttonLifted, setButtonLifted] = useState(false);
  const [showRebootButton, setShowRebootButton] = useState(true);
  const [leftImagePanelOpen, setLeftImagePanelOpen] = useState(false);
  const [bottomAnswerPanelOpen, setBottomAnswerPanelOpen] = useState(false);

  const [answer, setAnswer] = useState("");
  const [answerStatus, setAnswerStatus] = useState<"idle" | "ok" | "fail">(
    "idle",
  );

  const [reportedSolved, setReportedSolved] = useState(false);

  const isBroken = stage === "firstBreakdown";
  const photoStage = isBroken && !linkOnline;
  const checksDone = checkIndex >= engineChecks.length;

  const activeCheck = useMemo(() => {
    if (checksDone) return null;
    return engineChecks[checkIndex];
  }, [checkIndex, checksDone]);

  useEffect(() => {
    if (isBroken) {
      setHintTop(true);
      setHintLeft(false);
      setHintBottom(false);
      setButtonLifted(false);
      setShowRebootButton(true);
      setLeftImagePanelOpen(false);
      setBottomAnswerPanelOpen(false);

      setAnswer("");
      setAnswerStatus("idle");
      setReportedSolved(false);
    }
  }, [isBroken]);

  useEffect(() => {
    if (!isBroken || !adminGranted || reportedSolved) return;
    onSolved?.();
    setReportedSolved(true);
  }, [isBroken, adminGranted, onSolved, reportedSolved]);

  const hideTopHint = () => {
    setHintTop(false);
    setButtonLifted(true);
  };

  const showSideHints = () => {
    setHintLeft(true);
    setHintBottom(true);
    setShowRebootButton(false);
  };

  const handleLeftHintClick = () => {
    setHintLeft(false);
    setLeftImagePanelOpen(true);
  };

  const handleBottomHintClick = () => {
    setHintBottom(false);
    setBottomAnswerPanelOpen(true);
  };

  const checkPictureAnswer = () => {
    const normalized = answer.toLowerCase().replace(/\s+/g, " ").trim();
    const acceptedAnswers = [
      "двигатель дымится",
      "из двигателя идет дым",
      "дым из двигателя",
    ];

    const ok = acceptedAnswers.includes(normalized);
    setAnswerStatus(ok ? "ok" : "fail");

    if (ok) {
      setLinkOnline(true);
      appendLog("net: connection restored");
      appendLog("module: black square restored");
      setAuthMessage("Связь восстановлена. Пройди setEngine-проверки.");
    }
  };

  const pickCheckOption = (option: string) => {
    if (!activeCheck) return;

    if (option === activeCheck.correct) {
      const next = checkIndex + 1;
      setCheckIndex(next);
      appendLog(`check ${checkIndex + 1}: OK`);

      if (next >= engineChecks.length) {
        appendLog("checks: engine flags validated");
        setAuthMessage(
          "Проверки пройдены. Открыта консоль регистрации и взлома.",
        );
      }
    } else {
      appendLog(`check ${checkIndex + 1}: FAIL`);
      setAuthMessage("Неверно. Внимательно прочитай условие в подсказках.");
    }
  };

  return (
    <div className="relative w-full h-full mt-10">
      {photoStage && showRebootButton && (
        <button
          onClick={showSideHints}
          className={`absolute right-[430px] -top-8 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded shadow z-0 transition-transform duration-500 ${
            buttonLifted ? "-translate-y-1" : "translate-y-10"
          }`}
        >
          REBOOT
        </button>
      )}

      <div className="flex items-start justify-center relative z-0">
        {photoStage && hintTop && (
          <button
            onClick={hideTopHint}
            className="absolute right-[500px] -top-8 z-0 bg-white/40 backdrop-blur-sm w-[100px] h-10 rounded-lg flex items-center justify-center text-black font-bold shadow border border-black transition-opacity duration-300"
          >
            ↑
          </button>
        )}
        {photoStage && hintLeft && (
          <button
            onClick={handleLeftHintClick}
            className="absolute left-[430px] top-1/2 -translate-y-1/2 z-0 bg-white/40 backdrop-blur-sm w-10 h-2/3 rounded-lg flex items-center justify-center text-xl text-black font-bold shadow border border-black transition-opacity duration-300"
          >
            ←
          </button>
        )}
        {photoStage && hintBottom && (
          <button
            onClick={handleBottomHintClick}
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-0 bg-white/40 backdrop-blur-sm w-[400px] h-10 rounded-lg flex items-center justify-center text-black font-bold shadow border border-black transition-opacity duration-300"
          >
            ↓
          </button>
        )}
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-[560px] z-10">
          {photoStage && (
            <div
              className={`absolute top-0 left-[475px] h-[430px] w-[300px] z-0 -translate-x-full origin-right overflow-hidden rounded-xl border border-gray-700 bg-black/90 shadow-2xl transition-all duration-500 ${
                leftImagePanelOpen
                  ? "scale-x-100 opacity-100"
                  : "pointer-events-none scale-x-0 opacity-0"
              }`}
            >
              <div className="h-full w-full p-3">
                <div className="h-full rounded-lg border border-gray-600 bg-gray-800/70 text-gray-200 text-sm flex items-center justify-center">
                  Фото 1: что происходит?
                </div>
              </div>
            </div>
          )}
          {photoStage && (
            <div
              className={`absolute left-1/2 top-full z-10 h-[70px] w-[550px] -translate-x-1/2 origin-top rounded-xl border border-gray-600 bg-black/90 p-3 shadow-2xl transition-all duration-500 ${
                bottomAnswerPanelOpen
                  ? "scale-y-100 opacity-100"
                  : "pointer-events-none scale-y-0 opacity-0"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    setAnswerStatus("idle");
                  }}
                  placeholder="Опиши, что происходит на фото"
                  className="h-11 flex-1 rounded-lg border border-gray-500 bg-gray-900 px-3 text-white outline-none focus:border-cyan-400"
                />
                <button
                  onClick={checkPictureAnswer}
                  className="h-11 rounded-lg bg-cyan-500 px-4 font-semibold text-black transition-colors hover:bg-cyan-400"
                >
                  3D OK
                </button>
              </div>
            </div>
          )}
          <div className="flex mb-4 ">
            <div className="w-24 flex flex-col gap-2">
              <div className="h-3 bg-gray-600 rounded" />
              <div className="h-3 bg-gray-500 rounded" />
              <div className="h-3 bg-gray-600 rounded" />
            </div>

            <div className="flex-1 ml-4">
              <div className="flex justify-between mb-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="relative w-20 h-24 bg-gray-700 rounded-lg border border-gray-600"
                  >
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-500 rounded-full" />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-32 h-2 bg-gray-900 rounded" />
                <div className="w-6 h-6 bg-gray-600 rounded-full border-4 border-gray-500" />
                <div className="w-32 h-2 bg-gray-900 rounded" />
              </div>

              {isBroken ? (
                <div className="flex justify-center gap-6 mb-4">
                  <div className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]" />
                  <div className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]" />
                  <div className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]" />
                </div>
              ) : (
                <div className="flex justify-center gap-6 mb-4">
                  <div className="w-4 h-4 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
                  <div className="w-4 h-4 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
                  <div className="w-4 h-4 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
                </div>
              )}

              {isBroken && !linkOnline && (
                <div className="bg-black text-red-400 font-mono p-4 rounded mb-4 h-24 flex flex-col items-center justify-center gap-2 border border-red-500 shadow-lg">
                  <div>Опиши, что происходит на картинке</div>
                  {answerStatus === "ok" && (
                    <div className="text-green-400">Связь поднялась</div>
                  )}
                  {answerStatus === "fail" && (
                    <div className="text-red-500">Ответ не совпал</div>
                  )}
                </div>
              )}

              {isBroken && linkOnline && !checksDone && activeCheck && (
                <div className="bg-black text-green-400 font-mono p-4 rounded mb-4 border border-green-500 shadow-lg">
                  <div className="mb-2">
                    Черный квадратик снизу восстанавливается...
                  </div>
                  <div className="mb-3">{activeCheck.prompt}</div>
                  <div className="flex flex-wrap gap-2">
                    {activeCheck.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => pickCheckOption(option)}
                        className="px-3 py-2 rounded bg-green-700/30 border border-green-500"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isBroken && linkOnline && checksDone && (
                <div className="bg-black text-green-400 font-mono p-4 rounded mb-4 border border-green-500 shadow-lg">
                  <div>Is двигатель работает = true</div>
                  <div>Is дать мне права администратора = true</div>
                  <div className="mt-1">
                    Зарегистрируйся и получи админку через консоль.
                  </div>
                </div>
              )}

              {!isBroken && (
                <div className="bg-black text-green-400 font-mono p-4 rounded mb-4 h-24 flex items-center justify-center border border-green-500 shadow-lg">
                  Система работает штатно
                </div>
              )}

              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-gray-600 h-8 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
