import { useCallback, useEffect, useState } from "react";
import EnginePanel from "./engineTaks";
import EngineConsole from "./EngineConsole";

interface TabTwoProps {
  stage: "firstBreakdown" | "restored";
  questionSet: "meeting" | "frage";
  consoleMode: "full" | "none";
  canReboot: boolean;
  onEngineSolved: () => void;
  onReboot: () => void;
}

export default function TabTwo({
  stage,
  questionSet,
  consoleMode,
  canReboot,
  onEngineSolved,
  onReboot,
}: TabTwoProps) {
  const [linkOnline, setLinkOnline] = useState(false);
  const [photoSolved, setPhotoSolved] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectProgress, setConnectProgress] = useState(0);
  const [rebootReady, setRebootReady] = useState(false);

  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "boot: engine monitor active",
    "net: status OFFLINE",
  ]);
  const [authMessage, setAuthMessage] = useState("");
  const [adminGranted, setAdminGranted] = useState(false);

  const terminalVisible = stage === "firstBreakdown" && consoleMode === "full";

  useEffect(() => {
    if (stage !== "firstBreakdown") return;

    setLinkOnline(false);
    setPhotoSolved(false);
    setConnecting(false);
    setConnectProgress(0);
    setRebootReady(false);
    setTerminalLogs(["boot: engine monitor active", "net: status OFFLINE"]);
    setAuthMessage("");
    setAdminGranted(false);
  }, [consoleMode, questionSet, stage]);

  const appendLog = useCallback((line: string) => {
    setTerminalLogs((prev) => [...prev.slice(-11), line]);
  }, []);

  useEffect(() => {
    if (!connecting) return;

    setConnectProgress(0);
    appendLog("net: connection attempt started");

    const start = Date.now();
    const durationMs = 2400;
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const next = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setConnectProgress(next);

      if (next >= 100) {
        window.clearInterval(timer);
        setConnecting(false);
        setLinkOnline(true);
        appendLog("net: connection restored");
        appendLog("module: black square restored");
        setAuthMessage("Связь восстановлена. Пройди setEngine-проверки.");
      }
    }, 120);

    return () => window.clearInterval(timer);
  }, [appendLog, connecting]);

  useEffect(() => {
    if (!photoSolved || consoleMode !== "none" || rebootReady) return;

    appendLog(`photo: ${questionSet} route completed`);
    setRebootReady(true);
  }, [appendLog, consoleMode, photoSolved, questionSet, rebootReady]);

  const handleManualReboot = () => {
    if (!rebootReady) return;
    onEngineSolved();
    onReboot();
  };

  const handleConnect = () => {
    if (!photoSolved || linkOnline || connecting) return;
    setConnecting(true);
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-y-auto rounded-xl bg-white p-10 text-center shadow-xl">
      <div className="h-full w-full transition-all duration-500">
        <EnginePanel
          stage={stage}
          questionSet={questionSet}
          onSolved={onEngineSolved}
          linkOnline={linkOnline}
          appendLog={appendLog}
          adminGranted={adminGranted}
          photoSolved={photoSolved}
          onPhotoSolved={() => setPhotoSolved(true)}
          connecting={connecting}
          rebootReady={rebootReady}
          onManualReboot={handleManualReboot}
        />
      </div>

      {terminalVisible && (
        <EngineConsole
          linkOnline={linkOnline}
          photoSolved={photoSolved}
          connecting={connecting}
          connectProgress={connectProgress}
          onConnect={handleConnect}
          terminalLogs={terminalLogs}
          appendLog={appendLog}
          authMessage={authMessage}
          setAuthMessage={setAuthMessage}
          adminGranted={adminGranted}
          setAdminGranted={setAdminGranted}
          canReboot={canReboot}
          onReboot={onReboot}
        />
      )}
    </div>
  );
}


