import { useEffect, useMemo, useState } from "react";

interface EnginePanelProps {
  stage: "firstBreakdown" | "restored";
  onSolved?: () => void;
}

type ConsoleTab = "terminal" | "request" | "hints";

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

const sumDigits = (value: string) =>
  value
    .split("")
    .filter((ch) => /\d/.test(ch))
    .reduce((acc, ch) => acc + Number(ch), 0);

export default function EnginePanel({ stage, onSolved }: EnginePanelProps) {
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

  const [linkOnline, setLinkOnline] = useState(false);
  const [checkIndex, setCheckIndex] = useState(0);

  const [consoleTab, setConsoleTab] = useState<ConsoleTab>("terminal");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "boot: engine monitor active",
    "net: status OFFLINE",
  ]);

  const [requestInput, setRequestInput] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  const [registered, setRegistered] = useState(false);
  const [hackReady, setHackReady] = useState(false);
  const [adminGranted, setAdminGranted] = useState(false);
  const [reportedSolved, setReportedSolved] = useState(false);

  const isBroken = stage === "firstBreakdown";
  const photoStage = isBroken && !linkOnline;
  const checksDone = checkIndex >= engineChecks.length;
  const terminalVisible = isBroken;
  const requestUnlocked = linkOnline && checksDone;
  const hintsUnlocked = linkOnline;

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
      setLinkOnline(false);
      setCheckIndex(0);
      setConsoleTab("terminal");
      setTerminalLogs(["boot: engine monitor active", "net: status OFFLINE"]);
      setRequestInput("");
      setLogin("");
      setPassword("");
      setAuthMessage("");
      setRegistered(false);
      setHackReady(false);
      setAdminGranted(false);
      setReportedSolved(false);
    }
  }, [isBroken]);

  useEffect(() => {
    if (!isBroken || !adminGranted || reportedSolved) return;
    onSolved?.();
    setReportedSolved(true);
  }, [isBroken, adminGranted, onSolved, reportedSolved]);

  const appendLog = (line: string) => {
    setTerminalLogs((prev) => [...prev.slice(-11), line]);
  };

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
        setAuthMessage("Проверки пройдены. Открыта консоль регистрации и взлома.");
      }
    } else {
      appendLog(`check ${checkIndex + 1}: FAIL`);
      setAuthMessage("Неверно. Внимательно прочитай условие в подсказках.");
    }
  };

  const runRequestCommand = () => {
    const cmd = requestInput.trim();
    const low = cmd.toLowerCase();

    if (!cmd) return;

    appendLog(`request> ${cmd}`);

    if (low === "reg") {
      setRegistered(true);
      appendLog("auth: account registered without admin rights");
      setAuthMessage("Зарегался, но без админки.");
    } else if (low === "analyze_vars") {
      appendLog("hint: login must be Varvarochka");
      appendLog("hint: password must include year 2026 and partner token");
      setAuthMessage("Анализ переменных выполнен. Смотри вкладку Подсказки.");
    } else if (low === "inject_admin_vars") {
      if (!registered) {
        appendLog("error: execute reg first");
        setAuthMessage("Сначала введи reg.");
      } else {
        setHackReady(true);
        appendLog("exploit: admin variable chain injected");
        setAuthMessage("Взлом подготовлен. Теперь введи правильный логин/пароль.");
      }
    } else {
      appendLog("error: unknown command");
      setAuthMessage("Неизвестная команда. Используй reg / analyze_vars / inject_admin_vars.");
    }

    setRequestInput("");
  };

  const tryLogin = () => {
    if (!registered) {
      setAuthMessage("Нету переменной пароль. Сначала напиши reg.");
      appendLog("auth: missing password variable (reg required)");
      return;
    }

    if (login.length <= 6) {
      setAuthMessage("Логин всегда длиннее 6 символов.");
      return;
    }

    if (!password.includes("2026")) {
      setAuthMessage("Пароль должен включать текущий год: 2026.");
      return;
    }

    const digits = password.replace(/\D/g, "");
    if (digits.length < 3) {
      setAuthMessage("В пароле минимум 3 цифры.");
      return;
    }

    if (sumDigits(password) !== 34) {
      setAuthMessage("Сумма цифр пароля должна быть 34.");
      return;
    }

    if (password.length !== 14) {
      setAuthMessage("Длина пароля должна быть ровно 14 символов.");
      return;
    }

    const upperCount = password.split("").filter((ch) => /[A-ZА-Я]/.test(ch)).length;
    if (upperCount < 3) {
      setAuthMessage("Нужно минимум 3 заглавных символа.");
      return;
    }

    const partnerTokens = ["PIXELMON", "RUBEJ", "PARTNER"];
    const hasPartnerToken = partnerTokens.some((token) =>
      password.toUpperCase().includes(token),
    );

    if (!hasPartnerToken) {
      setAuthMessage("В пароле должен быть токен одного из партнеров.");
      return;
    }

    if (login !== "Varvarochka") {
      setAuthMessage("Логин должен быть Varvarochka.");
      return;
    }

    if (!hackReady) {
      setAuthMessage("Зарегистрирован, но без админ прав. Сначала выполни inject_admin_vars.");
      appendLog("auth: login ok, admin denied (hack not ready)");
      return;
    }

    setAdminGranted(true);
    setAuthMessage("Админка получена. Можно перезапускать систему.");
    appendLog("auth: ADMIN GRANTED");
  };

  return (
    <div className={`relative ${terminalVisible ? "pb-[460px]" : "pb-32"}`}>
      {photoStage && hintTop && (
        <button
          onClick={hideTopHint}
          className="absolute right-4 -top-8 z-0 bg-white/40 backdrop-blur-sm w-[100px] h-10 rounded-lg flex items-center justify-center text-black font-bold shadow border border-black transition-opacity duration-300"
        >
          ↑
        </button>
      )}

      {photoStage && hintLeft && (
        <button
          onClick={handleLeftHintClick}
          className="absolute -left-7 top-1/2 -translate-y-1/2 z-0 bg-white/40 backdrop-blur-sm w-10 h-full rounded-lg flex items-center justify-center text-xl text-black font-bold shadow border border-black transition-opacity duration-300"
        >
          ←
        </button>
      )}

      {photoStage && hintBottom && (
        <button
          onClick={handleBottomHintClick}
          className="absolute -bottom-7 left-1/2 -translate-x-1/2 z-0 bg-white/40 backdrop-blur-sm w-full h-10 rounded-lg flex items-center justify-center text-black font-bold shadow border border-black transition-opacity duration-300"
        >
          ↓
        </button>
      )}

      {photoStage && showRebootButton && (
        <button
          onClick={showSideHints}
          className={`absolute -right-10 -top-8 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded shadow z-0 transition-transform duration-500 ${
            buttonLifted ? "-translate-y-1" : "translate-y-10"
          }`}
        >
          REBOOT
        </button>
      )}

      {photoStage && (
        <div
          className={`absolute left-0 top-0 h-[430px] w-[300px] -translate-x-full origin-right overflow-hidden rounded-xl border border-gray-700 bg-black/90 shadow-2xl transition-all duration-500 ${
            leftImagePanelOpen
              ? "scale-x-100 opacity-100"
              : "pointer-events-none scale-x-0 opacity-0"
          }`}
        >
          <div className="h-full w-full p-3">
            <div className="grid h-full grid-rows-3 gap-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-lg border border-gray-600 bg-gray-800/70 text-gray-200 text-sm flex items-center justify-center"
                >
                  Фото {n}: что происходит?
                </div>
              ))}
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

      <div className="flex items-start justify-center relative z-0">
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-[560px]">
          <div className="flex mb-4">
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
                  {answerStatus === "ok" && <div className="text-green-400">Связь поднялась</div>}
                  {answerStatus === "fail" && <div className="text-red-500">Ответ не совпал</div>}
                </div>
              )}

              {isBroken && linkOnline && !checksDone && activeCheck && (
                <div className="bg-black text-green-400 font-mono p-4 rounded mb-4 border border-green-500 shadow-lg">
                  <div className="mb-2">Черный квадратик снизу восстанавливается...</div>
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
                  <div className="mt-1">Зарегистрируйся и получи админку через консоль.</div>
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

      {terminalVisible && (
        <div className="absolute right-0 bottom-0 z-20 w-[640px]">
          <div
            className={`mb-3 ml-auto h-24 w-56 rounded-xl border-2 p-3 flex flex-col justify-center transition-colors ${
              linkOnline
                ? "border-green-500 bg-[#0f2b0f]"
                : "border-red-500 bg-[#2b0f0f]"
            }`}
          >
            <div
              className={`font-mono text-sm ${
                linkOnline ? "text-green-300" : "text-red-300"
              }`}
            >
              {linkOnline ? "связь восстановлена" : "нет связи..."}
            </div>
            <div className="text-xs text-neutral-300 mt-1">канал terminal://engine</div>
          </div>

          <div className="relative rounded-2xl border-2 border-[#3f6b3f] bg-[#071107] shadow-[0_0_40px_rgba(34,197,94,0.18)] overflow-hidden">
            <div className="pointer-events-none absolute inset-0 opacity-20 bg-[repeating-linear-gradient(to_bottom,rgba(74,222,128,0.18)_0px,rgba(74,222,128,0.18)_1px,transparent_1px,transparent_4px)]" />
            <div className="relative p-4 text-[#8ef58e]">
              <div className="mb-3 flex gap-2">
                <button
                  onClick={() => setConsoleTab("terminal")}
                  className={`px-3 py-2 rounded border font-mono text-sm ${
                    consoleTab === "terminal"
                      ? "bg-[#173a17] border-[#74e774]"
                      : "bg-[#0d1e0d] border-[#355b35]"
                  }`}
                >
                  TERMINAL
                </button>
                <button
                  onClick={() => setConsoleTab("request")}
                  disabled={!requestUnlocked}
                  className={`px-3 py-2 rounded border font-mono text-sm ${
                    consoleTab === "request"
                      ? "bg-[#173a17] border-[#74e774]"
                      : "bg-[#0d1e0d] border-[#355b35]"
                  } ${!requestUnlocked ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  REQUEST
                </button>
                <button
                  onClick={() => setConsoleTab("hints")}
                  disabled={!hintsUnlocked}
                  className={`px-3 py-2 rounded border font-mono text-sm ${
                    consoleTab === "hints"
                      ? "bg-[#173a17] border-[#74e774]"
                      : "bg-[#0d1e0d] border-[#355b35]"
                  } ${!hintsUnlocked ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  HINTS
                </button>
              </div>

              {consoleTab === "terminal" && (
                <div className="h-[260px] overflow-y-auto rounded border border-[#355b35] bg-[#030903] p-3 font-mono text-sm space-y-1">
                  {terminalLogs.map((line, index) => (
                    <div key={`${line}-${index}`} className="text-[#7dff7d]">
                      {line}
                    </div>
                  ))}
                  {!linkOnline && (
                    <div className="text-[#8fcd8f]">await: восстанови связь через фото-анализ...</div>
                  )}
                </div>
              )}

              {consoleTab === "request" && (
                <div className="h-[260px] overflow-y-auto rounded border border-[#355b35] bg-[#030903] p-3">
                  {!requestUnlocked ? (
                    <div className="font-mono text-sm text-[#8fcd8f]">
                      request-модуль заблокирован до прохождения setEngine проверок.
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      <div className="flex gap-2">
                        <input
                          value={requestInput}
                          onChange={(e) => setRequestInput(e.target.value)}
                          className="flex-1 rounded border border-[#355b35] bg-[#081408] p-2 font-mono text-[#8ef58e]"
                          placeholder="reg | analyze_vars | inject_admin_vars"
                        />
                        <button
                          onClick={runRequestCommand}
                          className="px-4 py-2 bg-[#173a17] border border-[#74e774] rounded font-mono"
                        >
                          RUN
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={login}
                          onChange={(e) => setLogin(e.target.value)}
                          className="rounded border border-[#355b35] bg-[#081408] p-2 font-mono text-[#8ef58e]"
                          placeholder="login"
                        />
                        <input
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="rounded border border-[#355b35] bg-[#081408] p-2 font-mono text-[#8ef58e]"
                          placeholder="password"
                        />
                      </div>

                      <button
                        onClick={tryLogin}
                        className="px-4 py-2 bg-[#173a17] border border-[#74e774] rounded w-fit font-mono"
                      >
                        LOGIN
                      </button>

                      {authMessage && <div className="text-sm text-[#d0ffd0]">{authMessage}</div>}
                      {adminGranted && (
                        <div className="text-sm text-[#7dff7d]">
                          Доступ администратора получен. Можно перезапускать систему.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {consoleTab === "hints" && (
                <div className="h-[260px] overflow-y-auto rounded border border-[#355b35] bg-[#030903] p-3">
                  {!hintsUnlocked ? (
                    <div className="font-mono text-sm text-[#8fcd8f]">
                      hints-модуль станет активным после восстановления связи.
                    </div>
                  ) : (
                    <div className="text-sm text-[#d0ffd0] space-y-2 font-mono">
                      <div>1) Если пароль неправильный, сначала пиши команду reg.</div>
                      <div>2) Логин должен быть длиннее 6 и в финале равен Varvarochka.</div>
                      <div>3) Пароль: длина 14, минимум 3 заглавных, минимум 3 цифры.</div>
                      <div>4) Пароль обязан содержать 2026, сумму цифр 34 и токен партнера.</div>
                      <div>5) После регистрации используй analyze_vars и inject_admin_vars.</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





