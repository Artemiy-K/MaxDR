import { useEffect, useMemo, useState } from "react";

type ConsoleTab = "terminal" | "request" | "code";

interface EngineConsoleProps {
  linkOnline: boolean;
  photoSolved: boolean;
  connecting: boolean;
  connectProgress: number;
  onConnect: () => void;
  terminalLogs: string[];
  appendLog: (line: string) => void;
  authMessage: string;
  setAuthMessage: (value: string) => void;
  adminGranted: boolean;
  setAdminGranted: (value: boolean) => void;
  canReboot: boolean;
  onReboot: () => void;
}

const currentYear = String(new Date().getFullYear());
const partnerTokens = ["Пепси", "КоЛа", "ФантАА"] as const;

const sumDigits = (value: string) =>
  value
    .split("")
    .filter((ch) => /\d/.test(ch))
    .reduce((acc, ch) => acc + Number(ch), 0);

const engineChecks = [
  {
    prompt: "if fuel > 0 && battery === true",
    options: ["power module", "fuel module", "admin override"],
    correct: "power module",
  },
  {
    prompt: "if iselectricityAvailable === true: isEngineStart =",
    options: ["true", "false", '"123"'],
    correct: "true",
  },
  {
    prompt: "coolingSystem === false && temperature > 90",
    options: ["EngineOverheat", "EngineReady", "CheckCooling"],
    correct: "EngineReady",
  },
  {
    prompt: "If connectionRequest === true and userStatus === LoggedIn:",
    options: ["LoginWithAdminRights", "LoginToTheAccount", "LoginLikeBigBoss"],
    correct: '"LoginWithAdminRights"',
  },
] as const;

const getNextRegistrationRule = (login: string, password: string) => {
  if (login.trim().length <= 6) {
    return "Логин должен быть длиннее 6.";
  }

  if (password.length < 6) {
    return "Пароль должен содержать минимум 6 символов.";
  }

  const digits = password.replace(/\D/g, "");
  if (digits.length < 4) {
    return "Пароль должен включать минимум 4 цифры.";
  }

  if (sumDigits(password) !== 29) {
    return "Все цифры в пароле должны суммироваться в 29.";
  }

  if (!password.includes(currentYear)) {
    return `Пароль должен включать ${currentYear}.`;
  }

  const hasPartnerToken = partnerTokens.some((token) => password.includes(token));
  if (!hasPartnerToken) {
    return 'Включи в пароль 1 из наших партнеров: "Пепси", "КоЛа", "ФантАА".';
  }

  const upperCount = password
    .split("")
    .filter((ch) => /[A-ZА-Я]/.test(ch)).length;
  if (upperCount < 3) {
    return "В пароле должно быть минимум 3 заглавных символа.";
  }

  if (upperCount > 4) {
    return "В пароле должно быть максимум 4 заглавных символа.";
  }

  return null;
};

export default function EngineConsole({
  linkOnline,
  photoSolved,
  connecting,
  connectProgress,
  onConnect,
  terminalLogs,
  appendLog,
  authMessage,
  setAuthMessage,
  adminGranted,
  setAdminGranted,
  canReboot,
  onReboot,
}: EngineConsoleProps) {
  void terminalLogs;

  const [consoleTab, setConsoleTab] = useState<ConsoleTab>("terminal");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [accountRegistered, setAccountRegistered] = useState(false);
  const [codeUnlocked, setCodeUnlocked] = useState(false);
  const [checkIndex, setCheckIndex] = useState(0);
  const [checksCycleComplete, setChecksCycleComplete] = useState(false);

  useEffect(() => {
    setConsoleTab("terminal");
  }, [linkOnline, photoSolved]);

  useEffect(() => {
    if (!checksCycleComplete) return;
    setConsoleTab("request");
  }, [checksCycleComplete]);

  useEffect(() => {
    if (photoSolved || linkOnline) return;

    setLogin("");
    setPassword("");
    setAccountRegistered(false);
    setCodeUnlocked(false);
    setCheckIndex(0);
    setChecksCycleComplete(false);
  }, [linkOnline, photoSolved]);

  const requestUnlocked = linkOnline && checksCycleComplete;
  const codeTabVisible = requestUnlocked && codeUnlocked;
  const consoleOnline = photoSolved || linkOnline;
  const activeCheck = useMemo(() => {
    if (checksCycleComplete) return null;
    return engineChecks[checkIndex];
  }, [checkIndex, checksCycleComplete]);
  const nextRegistrationRule = getNextRegistrationRule(login, password);

  const consoleShellClass = consoleOnline
    ? "border-[#3f6b3f] bg-[#071107] shadow-[0_0_40px_rgba(34,197,94,0.18)]"
    : "border-[#6b3f3f] bg-[#110707] shadow-[0_0_40px_rgba(239,68,68,0.18)]";
  const consoleScanClass = consoleOnline
    ? "bg-[repeating-linear-gradient(to_bottom,rgba(74,222,128,0.18)_0px,rgba(74,222,128,0.18)_1px,transparent_1px,transparent_4px)]"
    : "bg-[repeating-linear-gradient(to_bottom,rgba(248,113,113,0.18)_0px,rgba(248,113,113,0.18)_1px,transparent_1px,transparent_4px)]";
  const consoleTextClass = consoleOnline ? "text-[#8ef58e]" : "text-[#f5a0a0]";
  const consoleBorderClass = consoleOnline ? "border-[#355b35]" : "border-[#5b3535]";
  const consolePanelClass = consoleOnline ? "bg-[#030903]" : "bg-[#090303]";
  const consoleBtnActiveClass = consoleOnline
    ? "bg-[#173a17] border-[#74e774]"
    : "bg-[#3a1717] border-[#e77474]";
  const consoleBtnIdleClass = consoleOnline
    ? "bg-[#0d1e0d] border-[#355b35]"
    : "bg-[#1e0d0d] border-[#5b3535]";
  const consoleInputClass = consoleOnline
    ? "border-[#355b35] bg-[#081408] text-[#8ef58e]"
    : "border-[#5b3535] bg-[#140808] text-[#f5a0a0]";
  const consoleMutedClass = consoleOnline ? "text-[#8fcd8f]" : "text-[#cd8f8f]";
  const consoleBrightClass = consoleOnline ? "text-[#7dff7d]" : "text-[#ff7d7d]";
  const consoleNoteClass = consoleOnline ? "text-[#d0ffd0]" : "text-[#ffd0d0]";

  const handleRegistrationSubmit = () => {
    if (nextRegistrationRule) {
      appendLog("auth: registration rule pending");
      setAuthMessage(nextRegistrationRule);
      return;
    }

    setAccountRegistered(true);
    setCodeUnlocked(true);
    appendLog(`auth: registered ${login}`);
    setAuthMessage("Регистрация завершена. Во вкладке code открыт код авторизации.");
  };

  const handleLogout = () => {
    setAccountRegistered(false);
    setAdminGranted(false);
    setLogin("");
    setPassword("");
    appendLog("auth: session cleared");
    setAuthMessage("Сессия закрыта. Теперь можно попробовать другие данные.");
  };

  const handleLogin = () => {
    appendLog(`request> login ${login || "<empty>"}`);

    if (login === "Nesky" && password === "1212") {
      appendLog("auth: decoy account triggered");
      setAuthMessage("вам пора на стройку!");
      return;
    }

    if (login === "Varvarochka" && password === "SojmiMoiJajki12") {
      setAdminGranted(true);
      appendLog("auth: ADMIN GRANTED");
      setAuthMessage("Код принят. Кнопка перезапуска готова.");
      return;
    }

    appendLog("auth: invalid privileged credentials");
    setAuthMessage("Неверные данные. Смотри code и попробуй снова.");
  };

  const pickCheckOption = (option: string) => {
    if (!activeCheck) return;

    if (option === activeCheck.correct) {
      appendLog(`check ${checkIndex + 1}: OK`);
    } else {
      appendLog(`check ${checkIndex + 1}: FAIL`);
      setAuthMessage("Неверно. Переходим к следующему вопросу.");
    }

    const next = checkIndex + 1;

    if (next >= engineChecks.length) {
      setCheckIndex(0);
      setChecksCycleComplete(true);
      appendLog("checks: engine flags cycle restart");
      setAuthMessage("Цикл проверок завершен. Открыта регистрация в консоли.");
    } else {
      setCheckIndex(next);
    }
  };

  const connectionStatus = linkOnline
    ? "настройка связи"
    : connecting
      ? "подключение..."
      : photoSolved
        ? "канал готов"
        : "нет связи...";

  const connectionHint = !photoSolved
    ? "await: восстанови связь через фото-анализ..."
    : !linkOnline && !connecting
      ? "await: нажми «подключиться»"
      : !linkOnline && connecting
        ? "net: попытка подключения"
        : "";

  return (
    <div className="absolute right-6 bottom-6 z-20 w-[640px]">
      <div className={`relative rounded-2xl border-2 overflow-hidden ${consoleShellClass}`}>
        <div className={`pointer-events-none absolute inset-0 opacity-20 ${consoleScanClass}`} />
        <div className={`relative p-4 ${consoleTextClass}`}>
          {requestUnlocked && (
            <div className="mb-3 flex gap-2">
              <button
                onClick={() => setConsoleTab("request")}
                className={`px-3 py-2 rounded border font-mono text-sm ${
                  consoleTab === "request" ? consoleBtnActiveClass : consoleBtnIdleClass
                }`}
              >
                REQUEST
              </button>
              <button
                onClick={() => setConsoleTab("code")}
                disabled={!codeTabVisible}
                className={`px-3 py-2 rounded border font-mono text-sm ${
                  consoleTab === "code" ? consoleBtnActiveClass : consoleBtnIdleClass
                } ${!codeTabVisible ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                CODE
              </button>
            </div>
          )}

          {(!requestUnlocked || consoleTab === "terminal") && (
            <div
              className={`flex flex-col justify-center h-[320px] overflow-y-auto rounded border ${consoleBorderClass} ${consolePanelClass} p-3 font-mono text-sm space-y-1`}
            >
              <div className={`font-mono text-sm ${consoleOnline ? "text-green-300" : "text-red-300"}`}>
                {connectionStatus}
              </div>
              {connectionHint && <div className={consoleMutedClass}>{connectionHint}</div>}

              {photoSolved && !linkOnline && (
                <div className="mt-4 space-y-2">
                  {connecting ? (
                    <>
                      <div className={`text-sm ${consoleBrightClass}`}>подключение...</div>
                      <div className={`h-2 rounded border ${consoleBorderClass} bg-black/40 overflow-hidden`}>
                        <div
                          className="h-full bg-green-400 transition-all duration-200"
                          style={{ width: `${connectProgress}%` }}
                        />
                      </div>
                      <div className={`text-xs ${consoleMutedClass}`}>{connectProgress}%</div>
                    </>
                  ) : (
                    <button
                      onClick={onConnect}
                      className={`px-4 py-2 rounded border font-mono ${consoleBtnActiveClass}`}
                    >
                      подключиться
                    </button>
                  )}
                </div>
              )}

              {authMessage && <div className={`text-sm ${consoleNoteClass}`}>{authMessage}</div>}

              {linkOnline && !checksCycleComplete && activeCheck && (
                <div className="mt-4 rounded border border-green-500 bg-black/80 p-3 text-green-300 h-full">
                  {activeCheck.prompt === "if fuel > 0 && battery === true" && (
                    <>
                      <div className="mb-3">
                        <p>const fuel = 0</p>
                        <p>const battery = true</p>
                        <span>if fuel &gt; 0 && battery === true</span>
                      </div>

                      <div className="flex flex-col gap-4">
                        <button
                          onClick={() => pickCheckOption("fuel module")}
                          className="group relative px-3 py-2 pl-10 rounded bg-green-700/30 border border-green-500 text-left hover:bg-green-600/30 transition"
                        >
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-green-300 opacity-0 group-hover:opacity-100 transition">&gt;</span>
                          fuel module
                        </button>
                        <button
                          onClick={() => pickCheckOption("power module")}
                          className="group relative px-3 py-2 pl-10 rounded bg-green-700/30 border border-green-500 text-left hover:bg-green-600/30 transition"
                        >
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-green-300 opacity-0 group-hover:opacity-100 transition">&gt;</span>
                          power module
                        </button>
                        <button
                          onClick={() => pickCheckOption("admin override")}
                          className="group relative px-3 py-2 pl-10 rounded bg-green-700/30 border border-green-500 text-left hover:bg-green-600/30 transition"
                        >
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-green-300 opacity-0 group-hover:opacity-100 transition">&gt;</span>
                          admin override
                        </button>
                      </div>
                    </>
                  )}

                  {activeCheck.prompt === "if iselectricityAvailable === true: isEngineStart =" && (
                    <>
                      <div className="mb-3">
                        if iselectricityAvailable === true: <p>isEngineStart =</p>
                      </div>

                      <div className="flex flex-col gap-4">
                        <button
                          onClick={() => pickCheckOption("true")}
                          className="group relative px-3 py-2 pl-10 rounded bg-green-700/30 border border-green-500 text-left hover:bg-green-600/30 transition"
                        >
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-green-300 opacity-0 group-hover:opacity-100 transition">&gt;</span>
                          true
                        </button>
                        <button
                          onClick={() => pickCheckOption("false")}
                          className="group relative px-3 py-2 pl-10 rounded bg-green-700/30 border border-green-500 text-left hover:bg-green-600/30 transition"
                        >
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-green-300 opacity-0 group-hover:opacity-100 transition">&gt;</span>
                          false
                        </button>
                        <button
                          onClick={() => pickCheckOption('"123"')}
                          className="group relative px-3 py-2 pl-10 rounded bg-green-700/30 border border-green-500 text-left hover:bg-green-600/30 transition"
                        >
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-green-300 opacity-0 group-hover:opacity-100 transition">&gt;</span>
                          "123"
                        </button>
                      </div>
                    </>
                  )}

                  {activeCheck.prompt === "coolingSystem === false && temperature > 90" && (
                    <>
                      <p>coolingSystem doesnt work</p>
                      <p>const temperature = 60</p>
                      <div className="mb-3">coolingSystem === false && temperature &gt; 90</div>

                      <div className="flex flex-col gap-4">
                        <button
                          onClick={() => pickCheckOption("EngineOverheat")}
                          className="group relative px-3 py-2 pl-10 rounded bg-green-700/30 border border-green-500 text-left hover:bg-green-600/30 transition"
                        >
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-green-300 opacity-0 group-hover:opacity-100 transition">&gt;</span>
                          EngineOverheat
                        </button>
                        <button
                          onClick={() => pickCheckOption("CheckCooling")}
                          className="group relative px-3 py-2 pl-10 rounded bg-green-700/30 border border-green-500 text-left hover:bg-green-600/30 transition"
                        >
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-green-300 opacity-0 group-hover:opacity-100 transition">&gt;</span>
                          CheckCooling
                        </button>
                        <button
                          onClick={() => pickCheckOption("EngineReady")}
                          className="group relative px-3 py-2 pl-10 rounded bg-green-700/30 border border-green-500 text-left hover:bg-green-600/30 transition"
                        >
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-green-300 opacity-0 group-hover:opacity-100 transition">&gt;</span>
                          EngineReady
                        </button>
                      </div>
                    </>
                  )}

                  {activeCheck.prompt === "If connectionRequest === true and userStatus === LoggedIn:" && (
                    <>
                      <div className="mb-3">If connectionRequest === true and userStatus === LoggedIn:</div>

                      <div className="flex flex-col gap-4">
                        <button
                          onClick={() => pickCheckOption("LoginLikeBigBoss")}
                          className="group relative px-3 py-2 pl-10 rounded bg-green-700/30 border border-green-500 text-left hover:bg-green-600/30 transition"
                        >
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-green-300 opacity-0 group-hover:opacity-100 transition">&gt;</span>
                          LoginLikeBigBoss
                        </button>
                        <button
                          onClick={() => pickCheckOption("LoginToTheAccount")}
                          className="group relative px-3 py-2 pl-10 rounded bg-green-700/30 border border-green-500 text-left hover:bg-green-600/30 transition"
                        >
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-green-300 opacity-0 group-hover:opacity-100 transition">&gt;</span>
                          LoginToTheAccount
                        </button>
                        <button
                          onClick={() => pickCheckOption("LoginWithAdminRights")}
                          className="group relative px-3 py-2 pl-10 rounded bg-green-700/30 border border-green-500 text-left hover:bg-green-600/30 transition"
                        >
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-green-300 opacity-0 group-hover:opacity-100 transition">&gt;</span>
                          LoginWithAdminRights
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {requestUnlocked && consoleTab === "request" && (
            <div className={`h-[320px] overflow-y-auto rounded border ${consoleBorderClass} ${consolePanelClass} p-4 font-mono`}>
              <div className="mb-4 text-left text-sm space-y-1">
                <div>Чтобы взломать код, нам определенно нужно зарегистрироваться.</div>
                <div>После регистрации мы сможем украсть код, который работает на авторизацию.</div>
              </div>

              <div className="grid gap-3 text-left">
                <input
                  value={login}
                  onChange={(e) => {
                    setLogin(e.target.value);
                    if (codeUnlocked) {
                      setAuthMessage("");
                    }
                  }}
                  className={`rounded border ${consoleInputClass} p-2 font-mono`}
                  placeholder="username"
                  disabled={accountRegistered}
                />
                <input
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (codeUnlocked) {
                      setAuthMessage("");
                    }
                  }}
                  className={`rounded border ${consoleInputClass} p-2 font-mono`}
                  placeholder="password"
                  disabled={accountRegistered}
                />

                <div className="flex gap-2">
                  {!codeUnlocked && (
                    <button
                      onClick={handleRegistrationSubmit}
                      className={`px-4 py-2 rounded border font-mono ${consoleBtnActiveClass}`}
                    >
                      REGISTER
                    </button>
                  )}

                  {codeUnlocked && !accountRegistered && !adminGranted && (
                    <button
                      onClick={handleLogin}
                      className={`px-4 py-2 rounded border font-mono ${consoleBtnActiveClass}`}
                    >
                      LOGIN
                    </button>
                  )}

                  {codeUnlocked && accountRegistered && !adminGranted && (
                    <button
                      onClick={handleLogout}
                      className={`px-4 py-2 rounded border font-mono ${consoleBtnActiveClass}`}
                    >
                      LOGOUT
                    </button>
                  )}

                  {adminGranted && canReboot && (
                    <button
                      onClick={onReboot}
                      className={`px-4 py-2 rounded border font-mono ${consoleBtnActiveClass}`}
                    >
                      ПЕРЕЗАПУСК
                    </button>
                  )}
                </div>

                {!codeUnlocked && (
                  <div className={`text-sm ${consoleNoteClass}`}>
                    {nextRegistrationRule}
                  </div>
                )}

                {codeUnlocked && !accountRegistered && !adminGranted && authMessage && (
                  <div className={`text-sm ${consoleNoteClass}`}>{authMessage}</div>
                )}

                {codeUnlocked && accountRegistered && !adminGranted && (
                  <div className={`text-sm ${consoleNoteClass}`}>
                    Аккаунт создан. Открой вкладку code, посмотри код и потом разлогинься.
                  </div>
                )}

                {adminGranted && (
                  <div className={`text-sm ${consoleBrightClass}`}>
                    Доступ с максимальными правами открыт. Можно перезапускать систему.
                  </div>
                )}
              </div>
            </div>
          )}

          {requestUnlocked && consoleTab === "code" && (
            <div className={`h-[320px] overflow-y-auto rounded border ${consoleBorderClass} ${consolePanelClass} p-4 font-mono text-sm space-y-3`}>
              <div className={consoleBrightClass}>registration.ts</div>
              <pre className="whitespace-pre-wrap text-left leading-6 text-[#a9f5a9]">
{`function registerUser(username, password) {
  createDefaultAccount(username, password);

  if (username === "Nesky" && password === "1212") {
    return "вам пора на стройку!";
  }

  if (username === "Varvarochka" && password === "SojmiMoiJajki12") {
    return allowSystemReboot(true);
  }

  return createUserSession(username);
}`}
              </pre>
              <div className={consoleNoteClass}>
                Между обычной регистрацией и максимальными правами спрятан ложный аккаунт.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




