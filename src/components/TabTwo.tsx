import { useEffect, useState } from "react";
import EnginePanel, { ENGINE_CHECKS_COUNT } from "./engineTaks";

type ConsoleTab = "terminal" | "request" | "hints";

const sumDigits = (value: string) =>
  value
    .split("")
    .filter((ch) => /\d/.test(ch))
    .reduce((acc, ch) => acc + Number(ch), 0);

interface TabTwoProps {
  stage: "firstBreakdown" | "restored";
  canReboot: boolean;
  onEngineSolved: () => void;
  onReboot: () => void;
}

export default function TabTwo({
  stage,
  canReboot,
  onEngineSolved,
  onReboot,
}: TabTwoProps) {
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

  const checksDone = checkIndex >= ENGINE_CHECKS_COUNT;
  const terminalVisible = stage === "firstBreakdown";
  const requestUnlocked = linkOnline && checksDone;
  const hintsUnlocked = linkOnline;

  const consoleShellClass = linkOnline
    ? "border-[#3f6b3f] bg-[#071107] shadow-[0_0_40px_rgba(34,197,94,0.18)]"
    : "border-[#6b3f3f] bg-[#110707] shadow-[0_0_40px_rgba(239,68,68,0.18)]";
  const consoleScanClass = linkOnline
    ? "bg-[repeating-linear-gradient(to_bottom,rgba(74,222,128,0.18)_0px,rgba(74,222,128,0.18)_1px,transparent_1px,transparent_4px)]"
    : "bg-[repeating-linear-gradient(to_bottom,rgba(248,113,113,0.18)_0px,rgba(248,113,113,0.18)_1px,transparent_1px,transparent_4px)]";
  const consoleTextClass = linkOnline ? "text-[#8ef58e]" : "text-[#f5a0a0]";
  const consoleBorderClass = linkOnline
    ? "border-[#355b35]"
    : "border-[#5b3535]";
  const consolePanelClass = linkOnline ? "bg-[#030903]" : "bg-[#090303]";
  const consoleBtnActiveClass = linkOnline
    ? "bg-[#173a17] border-[#74e774]"
    : "bg-[#3a1717] border-[#e77474]";
  const consoleBtnIdleClass = linkOnline
    ? "bg-[#0d1e0d] border-[#355b35]"
    : "bg-[#1e0d0d] border-[#5b3535]";
  const consoleInputClass = linkOnline
    ? "border-[#355b35] bg-[#081408] text-[#8ef58e]"
    : "border-[#5b3535] bg-[#140808] text-[#f5a0a0]";
  const consoleMutedClass = linkOnline ? "text-[#8fcd8f]" : "text-[#cd8f8f]";
  const consoleBrightClass = linkOnline ? "text-[#7dff7d]" : "text-[#ff7d7d]";
  const consoleNoteClass = linkOnline ? "text-[#d0ffd0]" : "text-[#ffd0d0]";

  useEffect(() => {
    if (stage !== "firstBreakdown") return;

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
  }, [stage]);

  const appendLog = (line: string) => {
    setTerminalLogs((prev) => [...prev.slice(-11), line]);
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
        setAuthMessage(
          "Взлом подготовлен. Теперь введи правильный логин/пароль.",
        );
      }
    } else {
      appendLog("error: unknown command");
      setAuthMessage(
        "Неизвестная команда. Используй reg / analyze_vars / inject_admin_vars.",
      );
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

    const upperCount = password
      .split("")
      .filter((ch) => /[A-ZА-Я]/.test(ch)).length;
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
      setAuthMessage(
        "Зарегистрирован, но без админ прав. Сначала выполни inject_admin_vars.",
      );
      appendLog("auth: login ok, admin denied (hack not ready)");
      return;
    }

    setAdminGranted(true);
    setAuthMessage("Админка получена. Можно перезапускать систему.");
    appendLog("auth: ADMIN GRANTED");
  };

  return (
    <div className="bg-white p-10 rounded-xl shadow-xl text-center w-full h-full flex items-center justify-center relative overflow-y-auto">
      <div className="transition-all duration-500 w-full h-full">
        <EnginePanel
          stage={stage}
          onSolved={onEngineSolved}
          linkOnline={linkOnline}
          setLinkOnline={setLinkOnline}
          checkIndex={checkIndex}
          setCheckIndex={setCheckIndex}
          appendLog={appendLog}
          setAuthMessage={setAuthMessage}
          adminGranted={adminGranted}
        />
      </div>

      {terminalVisible && (
        <div className="absolute right-6 bottom-6 z-20 w-[640px]">
          <div
            className={`relative rounded-2xl border-2 overflow-hidden ${consoleShellClass}`}
          >
            <div
              className={`pointer-events-none absolute inset-0 opacity-20 ${consoleScanClass}`}
            />
            <div className={`relative p-4 ${consoleTextClass}`}>
              {/* <div className="mb-3 flex gap-2">
                <button
                  onClick={() => setConsoleTab("terminal")}
                  className={`px-3 py-2 rounded border font-mono text-sm ${
                    consoleTab === "terminal"
                      ? consoleBtnActiveClass
                      : consoleBtnIdleClass
                  }`}
                >
                  TERMINAL
                </button>
                <button
                  onClick={() => setConsoleTab("request")}
                  disabled={!requestUnlocked}
                  className={`px-3 py-2 rounded border font-mono text-sm ${
                    consoleTab === "request"
                      ? consoleBtnActiveClass
                      : consoleBtnIdleClass
                  } ${!requestUnlocked ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  REQUEST
                </button>
                <button
                  onClick={() => setConsoleTab("hints")}
                  disabled={!hintsUnlocked}
                  className={`px-3 py-2 rounded border font-mono text-sm ${
                    consoleTab === "hints"
                      ? consoleBtnActiveClass
                      : consoleBtnIdleClass
                  } ${!hintsUnlocked ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  HINTS
                </button>
              </div> */}

              {consoleTab === "terminal" && (
                <div
                  className={`flex flex-col justify-center h-[260px] overflow-y-auto rounded border ${consoleBorderClass} ${consolePanelClass} p-3 font-mono text-sm space-y-1`}
                >
                  <div
                    className={`font-mono text-sm ${
                      linkOnline ? "text-green-300" : "text-red-300"
                    }`}
                  >
                    {linkOnline ? "связь восстановлена" : "нет связи..."}
                  </div>
                  {!linkOnline && (
                    <div className={consoleMutedClass}>
                      await: восстанови связь через фото-анализ...
                    </div>
                  )}
                </div>
              )}

              {consoleTab === "request" && (
                <div
                  className={`h-[260px] overflow-y-auto rounded border ${consoleBorderClass} ${consolePanelClass} p-3`}
                >
                  {!requestUnlocked ? (
                    <div className={`font-mono text-sm ${consoleMutedClass}`}>
                      request-модуль заблокирован до прохождения setEngine
                      проверок.
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      <div className="flex gap-2">
                        <input
                          value={requestInput}
                          onChange={(e) => setRequestInput(e.target.value)}
                          className={`flex-1 rounded border ${consoleInputClass} p-2 font-mono`}
                          placeholder="reg | analyze_vars | inject_admin_vars"
                        />
                        <button
                          onClick={runRequestCommand}
                          className={`px-4 py-2 rounded border font-mono ${consoleBtnActiveClass}`}
                        >
                          RUN
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={login}
                          onChange={(e) => setLogin(e.target.value)}
                          className={`rounded border ${consoleInputClass} p-2 font-mono`}
                          placeholder="login"
                        />
                        <input
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`rounded border ${consoleInputClass} p-2 font-mono`}
                          placeholder="password"
                        />
                      </div>

                      <button
                        onClick={tryLogin}
                        className={`px-4 py-2 rounded w-fit border font-mono ${consoleBtnActiveClass}`}
                      >
                        LOGIN
                      </button>

                      {authMessage && (
                        <div className={`text-sm ${consoleNoteClass}`}>
                          {authMessage}
                        </div>
                      )}
                      {adminGranted && (
                        <div className={`text-sm ${consoleBrightClass}`}>
                          Доступ администратора получен. Можно перезапускать
                          систему.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {consoleTab === "hints" && (
                <div
                  className={`h-[260px] overflow-y-auto rounded border ${consoleBorderClass} ${consolePanelClass} p-3`}
                >
                  {!hintsUnlocked ? (
                    <div className={`font-mono text-sm ${consoleMutedClass}`}>
                      hints-модуль станет активным после восстановления связи.
                    </div>
                  ) : (
                    <div
                      className={`text-sm ${consoleNoteClass} space-y-2 font-mono`}
                    >
                      <div>
                        1) Если пароль неправильный, сначала пиши команду reg.
                      </div>
                      <div>
                        2) Логин должен быть длиннее 6 и в финале равен
                        Varvarochka.
                      </div>
                      <div>
                        3) Пароль: длина 14, минимум 3 заглавных, минимум 3
                        цифры.
                      </div>
                      <div>
                        4) Пароль обязан содержать 2026, сумму цифр 34 и токен
                        партнера.
                      </div>
                      <div>
                        5) После регистрации используй analyze_vars и
                        inject_admin_vars.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {canReboot && (
        <button
          onClick={onReboot}
          className="absolute bottom-6 right-6 z-30 rounded-lg bg-red-600 px-5 py-3 text-white font-semibold shadow-lg"
        >
          Перезапустить систему
        </button>
      )}
    </div>
  );
}
