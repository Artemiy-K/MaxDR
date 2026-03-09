import { useEffect, useMemo, useState } from "react";
import Navigation, { type TabId } from "./Navigation";
import TabOne from "./TabOne";
import TabTwo from "./TabTwo";
import TabThree from "./TabThree";
import TabFour from "./TabFour";
import TabFive from "./TabFive";
import ShawarmaTab from "./ShawarmaTab";
import HorrorOverlay from "./HorrorOverlay";
import RebootOverlay from "./RebootOverlay";

export type Position = {
  top: number;
  left: number;
};

type StoryStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>(1);
  const [storyStep, setStoryStep] = useState<StoryStep>(8);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [masterVolume, setMasterVolume] = useState(70);
  const [musicVolume, setMusicVolume] = useState(55);
  const [speechVolume, setSpeechVolume] = useState(60);
  const [sfxVolume, setSfxVolume] = useState(65);

  const [money, setMoney] = useState(100);
  const [flashlight, setFlashlight] = useState(false);

  const [engineSolveCount, setEngineSolveCount] = useState(0);
  const [rebooting, setRebooting] = useState(false);

  const [canSleep, setCanSleep] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [policeNearby, setPoliceNearby] = useState(false);
  const [casinoRuns, setCasinoRuns] = useState(0);
  const [reasonSolved, setReasonSolved] = useState(false);

  const [hasShawarma, setHasShawarma] = useState(false);
  const [contestDone, setContestDone] = useState(false);

  const [boxEventDone, setBoxEventDone] = useState(false);
  const [tabFiveUnlocked, setTabFiveUnlocked] = useState(false);

  const [eyes, setEyes] = useState<Position[]>([]);
  const [popups, setPopups] = useState<Position[]>([]);

  const tabOneMode = useMemo(() => {
    if (storyStep >= 7) return "goodbye" as const;
    if (storyStep >= 5) return "address" as const;
    if (storyStep >= 2) return "crossword" as const;
    return "questions" as const;
  }, [storyStep]);

  const canReboot =
    (storyStep === 1 && engineSolveCount >= 1) ||
    (storyStep === 4 &&
      engineSolveCount >= 2 &&
      reasonSolved &&
      casinoRuns >= 3);

  const unlockedTabs: Record<TabId, boolean> = {
    1: true,
    2: true,
    3: storyStep >= 3,
    4: storyStep >= 5,
    5: storyStep >= 6,
    6: storyStep >= 2,
  };

  const effectActive = storyStep === 1 && activeTab === 1;

  useEffect(() => {
    if (!effectActive) {
      setEyes([]);
      setPopups([]);
      return;
    }

    const generatedEyes = Array.from({ length: 20 }).map(() => ({
      top: Math.random() * 90,
      left: Math.random() * 90,
    }));

    setEyes(generatedEyes);

    let count = 0;
    const interval = setInterval(() => {
      if (count >= 40) {
        clearInterval(interval);
        return;
      }

      setPopups((prev) => [
        ...prev,
        { top: Math.random() * 90, left: Math.random() * 90 },
      ]);
      count++;
    }, 200);

    return () => clearInterval(interval);
  }, [effectActive]);

  const handleQuestionsComplete = () => {
    if (storyStep !== 0) return;
    setStoryStep(1);
  };

  const handleCrosswordComplete = () => {
    if (storyStep !== 2) return;
    setStoryStep(3);
    setActiveTab(3);
  };

  const handleEngineSolved = () => {
    if (storyStep === 1 && engineSolveCount < 1) {
      setEngineSolveCount(1);
      return;
    }

    if (storyStep === 4 && engineSolveCount < 2) {
      setEngineSolveCount(2);
    }
  };

  const handleReboot = () => {
    if (!canReboot) return;

    setRebooting(true);
    window.setTimeout(() => {
      if (storyStep === 1) {
        setStoryStep(2);
        setActiveTab(1);
      } else if (storyStep === 4) {
        setStoryStep(5);
        setMoney((m) => m + 500);
        setActiveTab(4);
      }
      setRebooting(false);
    }, 3000);
  };

  const handleToggleNight = () => {
    setNightMode((prev) => !prev);
    setPoliceNearby(Math.random() < 0.4);
  };

  const handlePlayCasino = () => {
    if (!nightMode || policeNearby || casinoRuns >= 3) return;

    const next = casinoRuns + 1;
    setCasinoRuns(next);

    if (next === 3) {
      setStoryStep(4);
      setActiveTab(2);
    }
  };

  const handleBoxComplete = (foundRecordings: boolean) => {
    if (boxEventDone) return;
    setBoxEventDone(true);
    setStoryStep(6);
    if (foundRecordings) {
      setTabFiveUnlocked(true);
      setActiveTab(5);
    }
  };

  const objective = useMemo(() => {
    switch (storyStep) {
      case 0:
        return "Ответь на 3 вопроса во вкладке 1.";
      case 1:
        return "Вкладка 1 зависла. Перейди во вкладку 2, реши задачу двигателя и сделай reboot.";
      case 2:
        return "После reboot открылся кроссворд во вкладке 1.";
      case 3:
        return "Вкладка 3 активна: включи ночь, сыграй в казино 3 раза, разблокируй сон через немецкие слова.";
      case 4:
        return "Казино зажевало процесс. Вернись во вкладку 2, реши задачу и сделай второй reboot.";
      case 5:
        return "Деньги начислены, вкладка 4 открыта. Открой одну коробку.";
      case 6:
        return "Открой 5 вкладку чит-кодом и пройди финальные мини-этапы.";
      case 7:
        return "Осталась вкладка 'Прощай'. Подтверди восстановление последних 1%.";
      case 8:
        return "Финал: все вкладки и видео восстановлены. Игра завершена.";
      default:
        return "";
    }
  }, [storyStep]);

  return (
    <div className="relative flex h-screen bg-neutral-100 overflow-hidden">
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unlockedTabs={unlockedTabs}
        money={money}
        flashlight={flashlight}
      />

      <div className="flex-1 p-6 flex flex-col gap-4 relative z-10 min-h-0">
        <button
          onClick={() => setSettingsOpen((prev) => !prev)}
          className="absolute right-6 top-4 z-30 h-10 w-10 rounded-lg border border-neutral-300 bg-white shadow-md text-lg"
          aria-label="Открыть настройки"
          title="Настройки"
        >
          ⚙
        </button>

        {settingsOpen && (
          <div className="absolute right-6 top-16 z-30 w-72 rounded-xl border border-neutral-300 bg-white p-4 shadow-2xl">
            <h3 className="mb-3 text-sm font-bold">Настройки звука</h3>

            <label className="mb-2 block text-xs font-semibold text-neutral-700">
              Звук: {masterVolume}
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              className="mb-3 w-full"
            />

            <label className="mb-2 block text-xs font-semibold text-neutral-700">
              Музыка: {musicVolume}
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={musicVolume}
              onChange={(e) => setMusicVolume(Number(e.target.value))}
              className="mb-3 w-full"
            />

            <label className="mb-2 block text-xs font-semibold text-neutral-700">
              Речь: {speechVolume}
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={speechVolume}
              onChange={(e) => setSpeechVolume(Number(e.target.value))}
              className="mb-3 w-full"
            />

            <label className="mb-2 block text-xs font-semibold text-neutral-700">
              Звук эффектов: {sfxVolume}
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={sfxVolume}
              onChange={(e) => setSfxVolume(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}
        <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
          <p className="text-sm font-semibold">Цель: {objective}</p>
          {storyStep === 5 && (
            <p className="text-sm text-emerald-700 mt-1">
              Деньги начислены: +500
            </p>
          )}
          {storyStep === 8 && (
            <p className="text-sm text-indigo-700 mt-1">
              Песня про Макса и Варю играет. Буквы: index rubej.
            </p>
          )}
        </div>

        <div className="flex-1 relative min-h-0">
          {activeTab === 1 && (
            <div className="w-full h-full overflow-y-auto">
              <TabOne
                mode={tabOneMode}
                onQuestionsComplete={handleQuestionsComplete}
                onCrosswordComplete={handleCrosswordComplete}
                onFinalRestore={() => setStoryStep(8)}
              />
            </div>
          )}

          {activeTab === 2 && (
            <div className="w-full h-full overflow-y-auto">
              <TabTwo
                stage={
                  storyStep === 1 || storyStep === 4
                    ? "firstBreakdown"
                    : "restored"
                }
                canReboot={canReboot}
                onEngineSolved={handleEngineSolved}
                onReboot={handleReboot}
              />
            </div>
          )}

          {activeTab === 3 && (
            <div className="w-full h-full overflow-y-auto">
              <TabThree
                nightMode={nightMode}
                canSleep={canSleep}
                casinoRuns={casinoRuns}
                policeNearby={policeNearby}
                reasonSolved={reasonSolved}
                onLearnGerman={() => setCanSleep(true)}
                onToggleNight={handleToggleNight}
                onPlayCasino={handlePlayCasino}
                onSolveReason={() => setReasonSolved(true)}
              />
            </div>
          )}

          {activeTab === 4 && (
            <div className="w-full h-full overflow-y-auto">
              <TabFour opened={boxEventDone} onComplete={handleBoxComplete} />
            </div>
          )}

          {activeTab === 5 && (
            <div className="w-full h-full overflow-y-auto">
              <TabFive
                unlocked={tabFiveUnlocked}
                onUnlock={() => setTabFiveUnlocked(true)}
                onComplete={() => {
                  setStoryStep(7);
                  setActiveTab(1);
                }}
              />
            </div>
          )}

          {activeTab === 6 && (
            <div className="w-full h-full overflow-y-auto">
              <ShawarmaTab
                hasShawarma={hasShawarma}
                contestDone={contestDone}
                flashlight={flashlight}
                onBuyShawarma={() => {
                  if (money >= 50 && !hasShawarma) {
                    setMoney((m) => m - 50);
                    setHasShawarma(true);
                  }
                }}
                onStartContest={() => {
                  if (hasShawarma) {
                    setContestDone(true);
                  }
                }}
                onGetFlashlight={() => {
                  if (contestDone) {
                    setFlashlight(true);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      <HorrorOverlay effectActive={effectActive} eyes={eyes} popups={popups} />
      <RebootOverlay active={rebooting} />
    </div>
  );
}

