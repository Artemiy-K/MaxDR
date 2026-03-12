import { useEffect, useMemo, useRef, useState } from "react";
import Navigation, { type TabId } from "./Navigation";
import TabOne from "./TabOne";
import TabTwo from "./TabTwo";
import TabThree from "./TabThree";
import TabFour from "./TabFour";
import TabFive from "./TabFive";
import ShawarmaTab from "./ShawarmaTab";
import HorrorOverlay from "./HorrorOverlay";
import RebootOverlay from "./RebootOverlay";
import SoundSettingsModal from "./SoundSettingsModal";
import ChipOverloadGame from "./ChipOverloadGame";
import ServerCrashSequence from "./ServerCrashSequence";
import RecoveryVideoStage from "./RecoveryVideoStage";
import type { ReelItem, SpinOutcome } from "./CasinoSlotMachine";

export type Position = { top: number; left: number };
type StoryStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type EndingStage = "main" | "overload" | "video";
type BlockSquare = { id: number; top: number; right: number; size: number };

const maxuinReels: ReelItem[] = Array.from({ length: 3 }, () => ({
  type: "image",
  src: "/maxuinprivetis.jpg",
  alt: "maxuinprivetis",
}));
const famasReels: ReelItem[] = Array.from({ length: 3 }, () => ({
  type: "image",
  src: "/famas.jpg",
  alt: "famas",
}));
const moneyReels: ReelItem[] = Array.from({ length: 3 }, () => ({
  type: "text",
  value: "$",
}));
const defaultSquares: BlockSquare[] = [
  { id: 1, top: 16, right: 24, size: 52 },
  { id: 2, top: 72, right: 28, size: 40 },
  { id: 3, top: 110, right: 54, size: 34 },
];
const radioDialog = [
  'Подручный: "Шеф, сайту *шиииииш*"',
  'Подручный: "Похоже мусара облавят, но я не думаю что это для нас проблема, этот малакосос... *шиииш*"',
  'Шеф: "Что с ним?"',
  'Подручный: "Уже почти нашли его адрес, всё по нашему плану, но..."',
  'Шеф: "Какие ещё тут но?"',
  'Подручный: "Мы забыли убрать бекдор доступ к ядрам сервера, теперь пытаемся вспомнить как он вообще открывается."',
  'Шеф: "Не волнуйся, я помню: в настройках звука снизу справа невидимый пока ты на него не нажмешь инпут. Туда нужно вписать код и 6 вкладка будет доступна."',
  'Подручный: "Мы *шииш* код *шиииииш* забыли, шеф"',
  'Шеф: "Код находится всегда у меня *шииииииш* (слово из-за шумов невозможно услышать) тем, что носит королей, что могут выжить от 8 стрел в сердце"',
  'Подручный: "Понял, будем искать, конец связи"',
  'Шеф: "Конец связи"',
] as const;

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>(1);
  const [storyStep, setStoryStep] = useState<StoryStep>(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsPuzzleSolved, setSettingsPuzzleSolved] = useState(false);
  const [settingsBackdoorUnlocked, setSettingsBackdoorUnlocked] =
    useState(false);
  const [tabSixRevealed, setTabSixRevealed] = useState(false);
  const [boxThreeHovered, setBoxThreeHovered] = useState(false);
  const [radioVisible, setRadioVisible] = useState(false);
  const [radioDialogOpen, setRadioDialogOpen] = useState(false);
  const [radioDialogIndex, setRadioDialogIndex] = useState(0);
  const [radioConversationFinished, setRadioConversationFinished] =
    useState(false);
  const [endingStage, setEndingStage] = useState<EndingStage>("main");

  const [money, setMoney] = useState(0);
  const [flashlight, setFlashlight] = useState(false);
  const [hasShawarma, setHasShawarma] = useState(false);
  const [contestAccess, setContestAccess] = useState(false);
  const [airatRespect, setAiratRespect] = useState(false);
  const [engineSolveCount, setEngineSolveCount] = useState(0);
  const [rebooting, setRebooting] = useState(false);
  const [casinoRuns, setCasinoRuns] = useState(0);
  const [freeSpinTickets, setFreeSpinTickets] = useState(0);
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState(0);
  const [slotTicketInserted, setSlotTicketInserted] = useState(false);
  const [shawarmaTicketClaimed, setShawarmaTicketClaimed] = useState(false);
  const [tabThreeBooted, setTabThreeBooted] = useState(false);
  const [tabThreeLoading, setTabThreeLoading] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [germanQuizOpen, setGermanQuizOpen] = useState(false);
  const [policeNearby, setPoliceNearby] = useState(false);
  const [caseResolved, setCaseResolved] = useState(false);
  const [casinoBroken, setCasinoBroken] = useState(false);
  const [jamMessage, setJamMessage] = useState("");
  const [hiddenAnswerClicks, setHiddenAnswerClicks] = useState(0);
  const [reasonChoice, setReasonChoice] = useState<string | null>(null);
  const [rewardQueue, setRewardQueue] = useState<string[]>([]);
  const [boxEventDone, setBoxEventDone] = useState(false);
  const [blockedSquares, setBlockedSquares] = useState(defaultSquares);
  const [eyes, setEyes] = useState<Position[]>([]);
  const [popups, setPopups] = useState<Position[]>([]);

  const siteMusicRef = useRef<HTMLAudioElement | null>(null);
  const currentRewardImage = rewardQueue[0] ?? null;
  const settingsUnlocked = storyStep >= 5 && blockedSquares.length === 0;
  const musicSuppressed =
    radioVisible ||
    radioConversationFinished ||
    settingsBackdoorUnlocked ||
    endingStage !== "main";
  const tabOneMode = useMemo(
    () =>
      storyStep >= 7
        ? ("goodbye" as const)
        : storyStep >= 5
          ? ("address" as const)
          : storyStep >= 2
            ? ("crossword" as const)
            : ("questions" as const),
    [storyStep],
  );
  const canReboot = storyStep === 1 && engineSolveCount >= 1;
  const unlockedTabs: Record<TabId, boolean> = {
    1: true,
    2: true,
    3: storyStep >= 3,
    4: storyStep >= 5,
    5: storyStep >= 5,
    6: storyStep >= 2 || settingsBackdoorUnlocked,
  };
  const effectActive = storyStep === 1 && activeTab === 1;

  useEffect(() => {
    if (!effectActive) {
      setEyes([]);
      setPopups([]);
      return;
    }
    setEyes(
      Array.from({ length: 20 }).map(() => ({
        top: Math.random() * 90,
        left: Math.random() * 90,
      })),
    );
    let count = 0;
    const interval = setInterval(() => {
      if (count >= 40) return clearInterval(interval);
      setPopups((current) => [
        ...current,
        { top: Math.random() * 90, left: Math.random() * 90 },
      ]);
      count += 1;
    }, 200);
    return () => clearInterval(interval);
  }, [effectActive]);

  useEffect(() => {
    if (activeTab !== 3 || tabThreeBooted) return;
    setTabThreeLoading(true);
    const timeout = window.setTimeout(() => {
      setTabThreeLoading(false);
      setTabThreeBooted(true);
    }, 2200);
    return () => window.clearTimeout(timeout);
  }, [activeTab, tabThreeBooted]);

  useEffect(() => {
    const shouldPlay = settingsPuzzleSolved && !musicSuppressed;
    if (!shouldPlay) {
      if (siteMusicRef.current) {
        siteMusicRef.current.pause();
        siteMusicRef.current.currentTime = 0;
      }
      return;
    }
    if (!siteMusicRef.current) {
      siteMusicRef.current = new Audio("/zrodilis.mp3");
      siteMusicRef.current.loop = true;
    }
    const currentAudio = siteMusicRef.current;
    currentAudio.volume = boxThreeHovered ? 0.7 : 0.3;
    void currentAudio.play().catch(() => undefined);
  }, [boxThreeHovered, musicSuppressed, settingsPuzzleSolved]);

  useEffect(
    () => () => {
      if (siteMusicRef.current) {
        siteMusicRef.current.pause();
        siteMusicRef.current.currentTime = 0;
      }
    },
    [],
  );

  const stopSiteMusic = () => {
    if (siteMusicRef.current) {
      siteMusicRef.current.pause();
      siteMusicRef.current.currentTime = 0;
    }
  };
  const handleQuestionsComplete = () => storyStep === 0 && setStoryStep(1);
  const handleCrosswordComplete = () => {
    if (storyStep !== 2) return;
    setStoryStep(3);
    setActiveTab(3);
  };
  const handleEngineSolved = () => {
    if (storyStep === 1 && engineSolveCount < 1) return setEngineSolveCount(1);
    if (storyStep === 4 && engineSolveCount < 2) setEngineSolveCount(2);
  };
  const handleReboot = () => {
    if (storyStep === 1 && !canReboot) return;
    setRebooting(true);
    window.setTimeout(() => {
      if (storyStep === 1) {
        setStoryStep(2);
        setActiveTab(1);
      } else if (storyStep === 4) {
        setStoryStep(5);
        setMoney((current) => current + 1000);
        setCasinoBroken(false);
        setJamMessage("");
        setActiveTab(6);
      }
      setRebooting(false);
    }, 3000);
  };
  const handleInsertTicket = () => {
    if (freeSpinTickets <= 0 || slotTicketInserted) return;
    setFreeSpinTickets((current) => Math.max(0, current - 1));
    setSlotTicketInserted(true);
    setFreeSpinsRemaining(3);
  };
  const handlePlayCasino = (): SpinOutcome => {
    if (
      !slotTicketInserted ||
      freeSpinsRemaining <= 0 ||
      !nightMode ||
      policeNearby ||
      casinoBroken
    )
      return {
        reels: moneyReels,
        payout: 0,
        status: jamMessage || "Автомат сейчас недоступен.",
      };
    const nextRuns = casinoRuns + 1;
    const nextFreeSpins = freeSpinsRemaining - 1;
    setCasinoRuns(nextRuns);
    setFreeSpinsRemaining(nextFreeSpins);
    if (nextRuns === 1) {
      setRewardQueue((current) => [...current, "/maxuinprivetis.jpg"]);
      return {
        reels: maxuinReels,
        payout: 0,
        status: "Выпало maxuinprivetis.jpg",
      };
    }
    if (nextRuns === 2) {
      setRewardQueue((current) => [...current, "/famas.jpg"]);
      return { reels: famasReels, payout: 0, status: "Выпало famas.jpg" };
    }
    setSlotTicketInserted(false);
    setCasinoBroken(true);
    setJamMessage(
      "автомат сломался, деньги зажевало, перезапустите сайт в вкладке 2",
    );
    setStoryStep(4);
    return {
      reels: moneyReels,
      payout: 0,
      status: "1000 баксов зажевало внутри автомата.",
    };
  };

  const handleBoxComplete = (selectedBox: number) => {
    if (boxEventDone) return;
    setBoxEventDone(true);
    setStoryStep(6);
    if (selectedBox === 2) {
      setActiveTab(5);
      return;
    }
    if (selectedBox === 3) {
      stopSiteMusic();
      setBoxThreeHovered(false);
      setRadioVisible(true);
      setRadioDialogOpen(false);
      setRadioDialogIndex(0);
    }
  };

  const advanceRadioDialog = () => {
    if (radioDialogIndex < radioDialog.length - 1)
      return setRadioDialogIndex((current) => current + 1);
    setRadioDialogOpen(false);
    setRadioVisible(false);
    setRadioConversationFinished(true);
  };

  const unlockBackdoor = () => {
    setSettingsBackdoorUnlocked(true);
    setTabSixRevealed(false);
    setSettingsOpen(false);
  };

  if (endingStage === "overload")
    return <ServerCrashSequence onComplete={() => setEndingStage("video")} />;
  if (endingStage === "video") return <RecoveryVideoStage />;

  return (
    <div className="relative flex h-screen overflow-hidden bg-neutral-100">
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unlockedTabs={unlockedTabs}
        money={money}
        flashlight={flashlight}
        internetBoosted={storyStep >= 3}
        freeSpinTickets={freeSpinTickets}
        secretTabUnlocked={settingsBackdoorUnlocked}
        secretTabRevealed={tabSixRevealed}
        onSecretTabActivate={() => setTabSixRevealed(true)}
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 p-6">
        {settingsUnlocked ? (
          <button
            onClick={() => setSettingsOpen(true)}
            className="absolute right-6 top-4 z-30 flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-300 bg-white text-2xl shadow-md transition hover:scale-[1.03] hover:bg-neutral-100"
            aria-label="Open settings"
            title="Settings"
          >
            {"\u2699"}
          </button>
        ) : (
          <div className="pointer-events-none absolute right-6 top-4 z-30 h-12 w-12 rounded-lg bg-black shadow-[0_0_30px_rgba(0,0,0,0.45)]" />
        )}

        {!settingsUnlocked && storyStep >= 5 && (
          <div className="absolute right-0 top-0 z-30">
            {blockedSquares.map((square) => (
              <button
                key={square.id}
                onClick={() =>
                  flashlight &&
                  setBlockedSquares((current) =>
                    current.filter((item) => item.id !== square.id),
                  )
                }
                className="absolute rounded bg-black shadow-[0_0_30px_rgba(0,0,0,0.45)]"
                style={{
                  top: square.top,
                  right: square.right,
                  width: square.size,
                  height: square.size,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative min-h-0 flex-1">
          {activeTab === 1 && (
            <div className="h-full w-full overflow-y-auto">
              <TabOne
                mode={tabOneMode}
                onQuestionsComplete={handleQuestionsComplete}
                onCrosswordComplete={handleCrosswordComplete}
                onFinalRestore={() => setStoryStep(8)}
              />
            </div>
          )}
          {activeTab === 2 && (
            <div className="h-full w-full overflow-y-auto">
              <TabTwo
                stage={
                  storyStep === 1 || storyStep === 4
                    ? "firstBreakdown"
                    : "restored"
                }
                questionSet={storyStep === 4 ? "frage" : "meeting"}
                consoleMode={storyStep === 4 ? "none" : "full"}
                canReboot={canReboot}
                onEngineSolved={handleEngineSolved}
                onReboot={handleReboot}
              />
            </div>
          )}
          {activeTab === 3 && (
            <div className="h-full w-full overflow-y-auto">
              <TabThree
                loading={tabThreeLoading}
                nightMode={nightMode}
                policeNearby={policeNearby}
                germanQuizOpen={germanQuizOpen}
                caseResolved={caseResolved}
                casinoBroken={casinoBroken}
                jamMessage={jamMessage}
                freeSpinTickets={freeSpinTickets}
                freeSpinsRemaining={freeSpinsRemaining}
                ticketInserted={slotTicketInserted}
                money={money}
                hiddenAnswerClicks={hiddenAnswerClicks}
                reasonChoice={reasonChoice}
                onOpenGermanQuiz={() => setGermanQuizOpen(true)}
                onGermanQuizPass={() => {
                  setGermanQuizOpen(false);
                  setNightMode(true);
                  setPoliceNearby(true);
                  setCaseResolved(false);
                }}
                onInsertTicket={handleInsertTicket}
                onPlayCasino={handlePlayCasino}
                onHiddenAnswerClick={() =>
                  setHiddenAnswerClicks((current) => current + 1)
                }
                onSelectReason={setReasonChoice}
                onResolveCase={() => {
                  setCaseResolved(true);
                  setPoliceNearby(false);
                }}
              />
            </div>
          )}
          {activeTab === 4 && (
            <div className="h-full w-full overflow-y-auto">
              <TabFour
                opened={boxEventDone}
                onComplete={handleBoxComplete}
                onBoxThreeHoverChange={setBoxThreeHovered}
              />
            </div>
          )}
          {activeTab === 5 && (
            <div className="h-full w-full overflow-y-auto">
              <TabFive
                hasShawarma={hasShawarma}
                contestAccess={contestAccess}
                respected={airatRespect}
                onSubmitShawarma={() => {
                  if (!hasShawarma || contestAccess) return;
                  setHasShawarma(false);
                  setContestAccess(true);
                }}
                onEarnRespect={() => setAiratRespect(true)}
              />
            </div>
          )}
          {activeTab === 6 && (
            <div className="h-full w-full overflow-y-auto">
              {settingsBackdoorUnlocked ? (
                <ChipOverloadGame
                  onSystemCollapse={() => setEndingStage("overload")}
                />
              ) : (
                <ShawarmaTab
                  mode={storyStep >= 5 ? "flashlight" : "ticket"}
                  ticketReceived={shawarmaTicketClaimed}
                  hasShawarma={hasShawarma}
                  respectEarned={airatRespect}
                  flashlight={flashlight}
                  onReceiveTicket={() => {
                    if (shawarmaTicketClaimed) return;
                    setShawarmaTicketClaimed(true);
                    setFreeSpinTickets(1);
                  }}
                  onTakeShawarma={() => {
                    if (hasShawarma || money < 50) return;
                    setMoney((current) => current - 50);
                    setHasShawarma(true);
                  }}
                  onGrantFlashlight={() => setFlashlight(true)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {currentRewardImage && (
        <div className="absolute inset-0 z-40 flex items-end justify-center bg-black/85 p-8">
          <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-zinc-700 bg-black shadow-2xl">
            <img
              src={currentRewardImage}
              alt="reward"
              className="max-h-[78vh] w-full object-contain bg-black"
            />
            <div className="flex justify-center border-t border-zinc-800 bg-zinc-950 p-5">
              <button
                onClick={() => setRewardQueue((current) => current.slice(1))}
                className="rounded-2xl bg-white px-6 py-3 font-bold text-black transition hover:bg-zinc-200"
              >
                Окей
              </button>
            </div>
          </div>
        </div>
      )}

      <SoundSettingsModal
        open={settingsOpen && settingsUnlocked}
        solved={settingsPuzzleSolved}
        onClose={() => setSettingsOpen(false)}
        onSolved={() => setSettingsPuzzleSolved(true)}
        secretInputEnabled={radioConversationFinished}
        secretUnlocked={settingsBackdoorUnlocked}
        onSecretUnlock={unlockBackdoor}
      />

      <RadioOverlay
        visible={radioVisible}
        dialogOpen={radioDialogOpen}
        currentLine={radioDialog[radioDialogIndex]}
        onOpenDialog={() => {
          setRadioDialogOpen(true);
          setRadioDialogIndex(0);
        }}
        onAdvance={advanceRadioDialog}
      />
      <HorrorOverlay effectActive={effectActive} eyes={eyes} popups={popups} />
      <RebootOverlay active={rebooting} />
    </div>
  );
}

function RadioOverlay({
  visible,
  dialogOpen,
  currentLine,
  onOpenDialog,
  onAdvance,
}: {
  visible: boolean;
  dialogOpen: boolean;
  currentLine: string;
  onOpenDialog: () => void;
  onAdvance: () => void;
}) {
  if (!visible) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm">
      <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-8 text-center">
        <button
          onClick={() => {
            if (!dialogOpen) onOpenDialog();
          }}
          className={`group flex flex-col items-center gap-5 rounded-[2rem] border border-zinc-700 bg-zinc-950/90 px-8 py-10 shadow-[0_0_60px_rgba(255,255,255,0.05)] transition ${dialogOpen ? "cursor-default" : "hover:border-cyan-400/50 hover:bg-zinc-900"}`}
        >
          <img
            src="/radio.png"
            alt="Радио"
            className="w-full max-w-sm object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)]"
          />
          {!dialogOpen && (
            <div className="text-sm uppercase tracking-[0.35em] text-cyan-200">
              Нажми на радио
            </div>
          )}
        </button>

        {dialogOpen && (
          <div className="w-full max-w-3xl rounded-[2rem] border border-zinc-700 bg-zinc-950/95 p-8 text-white shadow-2xl">
            <div className="text-xs uppercase tracking-[0.35em] text-zinc-500">
              Перехваченный эфир
            </div>
            <p className="mt-6 text-lg leading-8 text-zinc-100 md:text-xl">
              {currentLine}
            </p>
            <button
              onClick={onAdvance}
              className="mt-8 rounded-full bg-cyan-300 px-6 py-3 font-bold text-zinc-950 transition hover:bg-cyan-200"
            >
              Дальше
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
