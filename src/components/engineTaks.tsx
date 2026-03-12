import { useEffect, useState } from "react";

interface EnginePanelProps {
  stage: "firstBreakdown" | "restored";
  questionSet: "meeting" | "frage";
  onSolved?: () => void;
  linkOnline: boolean;
  appendLog: (line: string) => void;
  adminGranted: boolean;
  photoSolved: boolean;
  onPhotoSolved: () => void;
  connecting: boolean;
  rebootReady?: boolean;
  onManualReboot?: () => void;
}

const questionSets = {
  meeting: [
    {
      prompt: "Опиши, что происходит на картинке",
      image: "/vstrecha1.jpg",
      answer: "1", // fix встреча с саней
    },
    {
      prompt: "Опиши, что происходит на картинке",
      image: "/vstrecha2.jpg",
      answer: "1", // fix встреча возле синей машины
    },
    {
      prompt: "Опиши, что происходит на картинке",
      image: "/vstrecha3.jpg",
      answer: "1", // fix встреча на горе
    },
    {
      prompt: "Каким 1 словом можно объединить эти 3 фотографии",
      answer: "1", // fix встреча
    },
  ],
  frage: [
    {
      prompt: "Что происходит на картинке",
      image: "/frage1.jpg",
      answer: "гамбруг ярмарка",
    },
    {
      prompt: "Что происходит на картинке",
      image: "/frage2.jpg",
      answer: "волейбол",
    },
    {
      prompt: "Что происходит на картинке",
      image: "/frage3.jpg",
      answer: "разнес с кулачины",
    },
  ],
} as const;

const normalizeAnswer = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();

type QuestionItem =
  | (typeof questionSets.meeting)[number]
  | (typeof questionSets.frage)[number];

const hasImage = (
  question: QuestionItem,
): question is QuestionItem & { image: string } => "image" in question;

export default function EnginePanel({
  stage,
  questionSet,
  onSolved,
  linkOnline,
  appendLog,
  adminGranted,
  photoSolved,
  onPhotoSolved,
  connecting,
  rebootReady = false,
  onManualReboot,
}: EnginePanelProps) {
  void linkOnline;
  const photoQuestions = questionSets[questionSet];
  const totalPhotoQuestions = photoQuestions.length;

  const [hintTop, setHintTop] = useState(true);
  const [hintLeft, setHintLeft] = useState(false);
  const [hintBottom, setHintBottom] = useState(false);
  const [buttonLifted, setButtonLifted] = useState(false);
  const [showRebootButton, setShowRebootButton] = useState(true);
  const [leftImagePanelOpen, setLeftImagePanelOpen] = useState(false);
  const [bottomAnswerPanelOpen, setBottomAnswerPanelOpen] = useState(false);

  const [answer, setAnswer] = useState("");
  const [photoQuestionIndex, setPhotoQuestionIndex] = useState(0);
  const [photoAnsweredCount, setPhotoAnsweredCount] = useState(0);
  const [photoCycleFailed, setPhotoCycleFailed] = useState(false);

  const [reportedSolved, setReportedSolved] = useState(false);

  const isBroken = stage === "firstBreakdown";
  const photoStage = isBroken && !photoSolved;
  const activePhotoQuestion = photoQuestions[photoQuestionIndex];
  const questionVisible = leftImagePanelOpen && bottomAnswerPanelOpen;

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
      setPhotoQuestionIndex(0);
      setPhotoAnsweredCount(0);
      setPhotoCycleFailed(false);
      setReportedSolved(false);
    }
  }, [isBroken, questionSet]);

  useEffect(() => {
    if (!photoSolved) return;
    setLeftImagePanelOpen(false);
    setBottomAnswerPanelOpen(false);
  }, [photoSolved]);

  useEffect(() => {
    if (!isBroken || !adminGranted || reportedSolved) return;
    onSolved?.();
    setReportedSolved(true);
  }, [adminGranted, isBroken, onSolved, reportedSolved]);

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
    if (!questionVisible || !activePhotoQuestion) return;

    const normalized = normalizeAnswer(answer);
    const ok = normalized === normalizeAnswer(activePhotoQuestion.answer);
    const nextIndex = photoQuestionIndex + 1;
    const cycleWillFail = photoCycleFailed || !ok;

    if (!ok) {
      appendLog(
        `photo: ${questionSet} question ${photoQuestionIndex + 1} failed`,
      );
      setPhotoCycleFailed(true);
    } else {
      setPhotoAnsweredCount((prev) => Math.min(prev + 1, totalPhotoQuestions));
    }

    if (nextIndex >= totalPhotoQuestions) {
      if (!cycleWillFail) {
        if (!photoSolved) {
          onPhotoSolved();
          appendLog(`photo: ${questionSet} answers accepted`);
        }
      } else {
        appendLog(`photo: ${questionSet} cycle reset to first question`);
        setPhotoQuestionIndex(0);
        setPhotoAnsweredCount(0);
        setPhotoCycleFailed(false);
      }
    } else {
      setPhotoQuestionIndex(nextIndex);
    }

    setAnswer("");
  };

  return (
    <div className="relative mt-10 h-full w-full">
      {photoStage && showRebootButton && (
        <button
          onClick={showSideHints}
          className={`absolute right-[430px] -top-8 -translate-x-1/2 rounded bg-red-600 px-6 py-2 text-white shadow z-0 transition-transform duration-500 ${
            buttonLifted ? "-translate-y-1" : "translate-y-10"
          }`}
        >
          REBOOT
        </button>
      )}

      <div className="relative z-0 flex items-start justify-center">
        {photoStage && hintTop && (
          <button
            onClick={hideTopHint}
            className="absolute right-[500px] -top-8 z-0 flex h-10 w-[100px] items-center justify-center rounded-lg border border-black bg-white/40 font-bold text-black shadow backdrop-blur-sm transition-opacity duration-300"
          >
            ↑
          </button>
        )}
        {photoStage && hintLeft && (
          <button
            onClick={handleLeftHintClick}
            className="absolute left-[430px] top-1/2 z-0 flex h-2/3 w-10 -translate-y-1/2 items-center justify-center rounded-lg border border-black bg-white/40 text-xl font-bold text-black shadow backdrop-blur-sm transition-opacity duration-300"
          >
            ←
          </button>
        )}
        {photoStage && hintBottom && (
          <button
            onClick={handleBottomHintClick}
            className="absolute -bottom-10 left-1/2 z-0 flex h-10 w-[400px] -translate-x-1/2 items-center justify-center rounded-lg border border-black bg-white/40 font-bold text-black shadow backdrop-blur-sm transition-opacity duration-300"
          >
            ↓
          </button>
        )}
        <div className="z-10 w-[560px] rounded-xl bg-gray-800 p-6 shadow-2xl">
          {photoStage && (
            <div
              className={`absolute top-0 left-[475px] z-0 h-[430px] w-[300px] -translate-x-full origin-right overflow-hidden rounded-xl border border-gray-700 bg-black/90 shadow-2xl transition-all duration-500 ${
                leftImagePanelOpen
                  ? "scale-x-100 opacity-100"
                  : "pointer-events-none scale-x-0 opacity-0"
              }`}
            >
              <div className="h-full w-full p-3">
                <div className="flex h-full items-center justify-center rounded-lg border border-gray-600 bg-gray-800/70 text-sm text-gray-200">
                  {hasImage(activePhotoQuestion) ? (
                    <img
                      src={activePhotoQuestion.image}
                      alt="Фото"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full grid-rows-3 gap-2">
                      {photoQuestions
                        .filter(hasImage)
                        .map((question, index) => (
                          <img
                            key={`${question.image}-${index}`}
                            src={question.image}
                            alt={`Фото ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        ))}
                    </div>
                  )}
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
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={
                    questionVisible
                      ? (activePhotoQuestion?.prompt ?? "Опиши картинку")
                      : "loading"
                  }
                  className="h-11 flex-1 rounded-lg border border-gray-500 bg-gray-900 px-3 text-white outline-none focus:border-cyan-400"
                />
                <button
                  onClick={checkPictureAnswer}
                  className="h-11 rounded-lg bg-cyan-500 px-4 font-semibold text-black transition-colors hover:bg-cyan-400"
                >
                  OK
                </button>
              </div>
            </div>
          )}
          <div className="mb-4 flex">
            <div className="flex w-24 flex-col gap-2">
              <div className="h-3 rounded bg-gray-600" />
              <div className="h-3 rounded bg-gray-500" />
              <div className="h-3 rounded bg-gray-600" />
            </div>

            <div className="ml-4 flex-1">
              <div className="mb-4 flex justify-between">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="relative h-24 w-20 rounded-lg border border-gray-600 bg-gray-700"
                  >
                    <div className="absolute bottom-2 left-1/2 h-10 w-10 -translate-x-1/2 rounded-full bg-gray-500" />
                  </div>
                ))}
              </div>

              <div className="mb-4 flex items-center justify-center gap-4">
                <div className="h-2 w-32 rounded bg-gray-900" />
                <div className="h-6 w-6 rounded-full border-4 border-gray-500 bg-gray-600" />
                <div className="h-2 w-32 rounded bg-gray-900" />
              </div>

              {isBroken ? (
                <div className="mb-4 flex justify-center gap-6">
                  {Array.from({ length: totalPhotoQuestions }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-4 w-4 rounded-full ${
                        i < photoAnsweredCount
                          ? "bg-green-500 shadow-[0_0_10px_#22c55e]"
                          : "bg-red-500 shadow-[0_0_10px_#ef4444]"
                      }`}
                    />
                  ))}
                </div>
              ) : (
                <div className="mb-4 flex justify-center gap-6">
                  {Array.from({ length: totalPhotoQuestions }).map((_, i) => (
                    <div
                      key={i}
                      className="h-4 w-4 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"
                    />
                  ))}
                </div>
              )}

              {isBroken && !photoSolved && (
                <div className="mb-4 flex h-24 flex-col items-center justify-center gap-2 rounded border border-red-500 bg-black p-4 font-mono text-red-400 shadow-lg">
                  <div>
                    {questionVisible
                      ? (activePhotoQuestion?.prompt ?? "Опиши, что происходит")
                      : "loading"}
                  </div>
                  {questionVisible && questionSet === "meeting" && (
                    <div className="text-xs text-red-300">
                      Вопрос {photoQuestionIndex + 1} из {totalPhotoQuestions}
                    </div>
                  )}
                </div>
              )}

              {isBroken && photoSolved && (
                <div className="mb-4 rounded border border-yellow-500 bg-black p-4 font-mono text-yellow-300 shadow-lg">
                  <div className="mb-2">
                    {rebootReady
                      ? "Маршрут активирован"
                      : connecting
                        ? "Подключение к модулю..."
                        : "Попытка подключения"}
                  </div>
                  <div className="text-sm text-yellow-200">
                    {rebootReady
                      ? "Ответы приняты. Теперь перезапусти сайт вручную."
                      : "Консоль готова. Нажми «подключиться»."}
                  </div>
                  {rebootReady && onManualReboot && (
                    <button
                      onClick={onManualReboot}
                      className="mt-4 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-500"
                    >
                      ПЕРЕЗАПУСТИТЬСЯ
                    </button>
                  )}
                </div>
              )}

              {!isBroken && (
                <div className="mb-4 flex h-24 items-center justify-center rounded border border-green-500 bg-black p-4 font-mono text-green-400 shadow-lg">
                  Система работает штатно
                </div>
              )}

              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-8 rounded bg-gray-600" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
