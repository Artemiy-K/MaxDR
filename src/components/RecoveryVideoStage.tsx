import { useEffect, useMemo, useState } from "react";
import YouTube from "react-youtube";

const PRIMARY_VIDEO_URL = "https://youtu.be/UpEUGINuztw";
const SECONDARY_VIDEO_URL = "https://youtu.be/78vzLY99quI";

function getVideoId(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const patterns = [/v=([\w-]{11})/, /youtu\.be\/([\w-]{11})/, /^([\w-]{11})$/];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }
  return "";
}

export default function RecoveryVideoStage() {
  const primaryVideoId = useMemo(() => getVideoId(PRIMARY_VIDEO_URL), []);
  const secondaryVideoId = useMemo(() => getVideoId(SECONDARY_VIDEO_URL), []);
  const [firstEnded, setFirstEnded] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [loadingSecond, setLoadingSecond] = useState(false);
  const [showSecondVideo, setShowSecondVideo] = useState(false);

  useEffect(() => {
    if (!firstEnded) return;
    const timer = window.setTimeout(() => setShowPrompt(true), 15000);
    return () => window.clearTimeout(timer);
  }, [firstEnded]);

  const loadFinalPercent = () => {
    setShowPrompt(false);
    setLoadingSecond(true);
    window.setTimeout(() => {
      setLoadingSecond(false);
      setShowSecondVideo(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#030712] px-4 py-8 text-zinc-100 md:px-8">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-8">
        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/90 p-5 shadow-2xl md:p-8">
          <div className="mb-4 text-xs uppercase tracking-[0.35em] text-cyan-300">Финальная загрузка</div>
          <div className="overflow-hidden rounded-[1.75rem] border border-zinc-800 bg-black">
            {primaryVideoId ? (
              <YouTube
                videoId={primaryVideoId}
                className="aspect-video w-full"
                iframeClassName="h-full w-full"
                opts={{ width: "100%", height: "100%", playerVars: { autoplay: 0, rel: 0 } }}
                onEnd={() => setFirstEnded(true)}
              />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_38%),#020617] px-6 text-center text-zinc-400">
                Вставь ссылку на первый YouTube-ролик в `PRIMARY_VIDEO_URL` внутри RecoveryVideoStage.
              </div>
            )}
          </div>
          {firstEnded && <div className="mt-4 text-center text-lg font-semibold text-amber-300">Код от шкатулки 666.</div>}
        </div>

        {(loadingSecond || showSecondVideo) && (
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/90 p-5 shadow-2xl md:p-8">
            {loadingSecond && (
              <div className="flex h-56 items-center justify-center rounded-[1.5rem] border border-cyan-400/30 bg-cyan-500/5">
                <div className="h-24 w-24 animate-pulse rounded-[1.75rem] border border-cyan-300/60 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.45),rgba(15,23,42,0.2))] shadow-[0_0_32px_rgba(34,211,238,0.22)]" />
              </div>
            )}
            {showSecondVideo && (
              <div className="overflow-hidden rounded-[1.75rem] border border-zinc-800 bg-black">
                {secondaryVideoId ? (
                  <YouTube
                    videoId={secondaryVideoId}
                    className="aspect-video w-full"
                    iframeClassName="h-full w-full"
                    opts={{ width: "100%", height: "100%", playerVars: { autoplay: 1, rel: 0 } }}
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-[radial-gradient(circle_at_bottom,rgba(249,115,22,0.16),transparent_35%),#020617] px-6 text-center text-zinc-400">
                    Вставь ссылку на второй YouTube-ролик в `SECONDARY_VIDEO_URL` внутри RecoveryVideoStage.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showPrompt && (
        <div className="fixed bottom-6 right-6 z-20 w-full max-w-sm rounded-[1.5rem] border border-emerald-400/30 bg-zinc-950/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
          <div className="text-sm text-zinc-300">Сайт был удачно загружен на 99%. Дозагрузить ещё 1 процент?</div>
          <button onClick={loadFinalPercent} className="mt-4 rounded-full bg-emerald-400 px-5 py-2 font-bold text-zinc-950 transition hover:bg-emerald-300">Да</button>
        </div>
      )}
    </div>
  );
}


