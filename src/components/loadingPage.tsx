import { useEffect, useRef, useState } from "react";

const letters = "アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

type Loader = {
  id: number;
  x: number;
  y: number;
};

type GlitchPhase = "idle" | "fade" | "flash" | "end";

interface MatrixConsole {
  setStageFVW: () => void;
}

export default function MatrixConsole({ setStageFVW }: MatrixConsole) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [loaders, setLoaders] = useState<Loader[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [recovered, setRecovered] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [glitchPhase, setGlitchPhase] = useState<GlitchPhase>("idle");

  /* ================= MATRIX RAIN ================= */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle =
        glitchPhase === "fade" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00ff66";
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35);
    return () => clearInterval(interval);
  }, [glitchPhase]);

  /* ================= CHAOS PHASE ================= */

  useEffect(() => {
    if (recovered) return;

    const loaderInterval = setInterval(() => {
      const newLoader: Loader = {
        id: Date.now(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      };

      setLoaders((prev) => [...prev, newLoader]);

      setTimeout(() => {
        setLoaders((prev) => prev.filter((l) => l.id !== newLoader.id));
      }, 3000);
    }, 2000);

    const messages = [
      "booting kernel...",
      "loading drivers...",
      "establishing secure channel...",
      "allocating memory...",
      "decoding packets...",
      "overclocking cpu...",
    ];

    const logInterval = setInterval(() => {
      setLogs((prev) => [
        ...prev.slice(-8),
        messages[Math.floor(Math.random() * messages.length)],
      ]);
    }, 900);

    return () => {
      clearInterval(loaderInterval);
      clearInterval(logInterval);
    };
  }, [recovered]);

  /* ================= RECOVERY ================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setRecovered(true);
      setLoaders([]);
      setLogs((prev) => [...prev, "system stabilized..."]);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  /* ================= DOWNLOAD ================= */

  const handleDownload = () => {
    setDownloading(true);
    setLogs((prev) => [...prev, "downloading data..."]);

    setTimeout(() => {
      setDownloading(false);
      setDownloadComplete(true);
      setLogs((prev) => [...prev, "data successfully restored."]);

      // Запуск финального глюка
      setTimeout(() => {
        setGlitchPhase("fade");

        setTimeout(() => {
          setGlitchPhase("flash");

          setTimeout(() => {
            setGlitchPhase("end");
          }, 600);
        }, 800);
      }, 1000);
    }, 4000);
  };

  useEffect(() => {
    if (glitchPhase === "end") {
      setStageFVW();
    }
  }, [glitchPhase, setStageFVW]);

  /* ================= RENDER ================= */

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-mono text-green-400">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* RANDOM LOADERS */}
      {!recovered &&
        loaders.map((loader) => (
          <div
            key={loader.id}
            className="absolute animate-pulse"
            style={{ left: loader.x, top: loader.y }}
          >
            <MiniLoader />
          </div>
        ))}

      {/* TERMINAL LOGS */}
      <div className="absolute bottom-4 left-4 text-xs space-y-1">
        {logs.map((log, i) => (
          <div key={i}>{"> " + log}</div>
        ))}
      </div>

      {/* RECOVERY UI */}
      {recovered && glitchPhase !== "end" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-6">
          <div className="animate-pulse">
            <h1 className="text-4xl tracking-widest">⚠ WARNING</h1>
            <p className="mt-4 text-lg text-green-500">
              Вебсайт частично восстановлен
            </p>
          </div>

          {!downloadComplete && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-6 py-3 border border-green-500 hover:bg-green-500 hover:text-black transition duration-300 disabled:opacity-50"
            >
              {downloading ? "Загрузка..." : "Загрузить данные"}
            </button>
          )}

          {downloadComplete && (
            <p className="text-green-300 animate-pulse">
              Данные успешно загружены
            </p>
          )}
        </div>
      )}

      {/* GLITCH OVERLAY */}
      {glitchPhase !== "idle" && (
        <div
          className={`
            absolute inset-0 pointer-events-none transition-all duration-700
            ${glitchPhase === "fade" ? "bg-black opacity-90" : ""}
            ${glitchPhase === "flash" ? "animate-flash" : ""}
            ${glitchPhase === "end" ? "bg-black opacity-0" : ""}
          `}
        />
      )}
    </div>
  );
}

function MiniLoader() {
  return (
    <div className="w-32">
      <div className="w-full h-2 bg-green-900">
        <div className="h-2 bg-green-400 animate-pulse w-2/3" />
      </div>
    </div>
  );
}
