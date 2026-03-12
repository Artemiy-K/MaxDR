import { useState } from "react";
import CasinoSlotMachine from "./CasinoSlotMachine";

type Props = {
  loading: boolean;
  nightMode: boolean;
  policeNearby: boolean;
  germanQuizOpen: boolean;
  caseResolved: boolean;
  casinoBroken: boolean;
  jamMessage: string;
  freeSpinTickets: number;
  freeSpinsRemaining: number;
  ticketInserted: boolean;
  money: number;
  hiddenAnswerClicks: number;
  reasonChoice: string | null;
  onOpenGermanQuiz: () => void;
  onGermanQuizPass: () => void;
  onInsertTicket: () => void;
  onPlayCasino: () => import("./CasinoSlotMachine").SpinOutcome;
  onHiddenAnswerClick: () => void;
  onSelectReason: (answer: string) => void;
  onResolveCase: () => void;
};

type MultipleQuestion = {
  prompt: string;
  correct: string;
  options: string[];
};

const multipleQuestions: MultipleQuestion[] = [
  {
    prompt: "leisten",
    correct: "позволить",
    options: ["позволить", "переезжать", "сомневаться"],
  },
  {
    prompt: "verzichten",
    correct: "отказываться",
    options: ["отказываться", "побеждать", "объяснять"],
  },
  {
    prompt: "umgehend",
    correct: "немедленно",
    options: ["немедленно", "по очереди", "бесшумно"],
  },
];

const textQuestions = [
  {
    prompt:
      "Viele Experten sind der Meinung, dass künstliche Intelligenz in Zukunft eine noch größere Rolle ______.",
    correct: "spielt",
  },
  {
    prompt:
      "Er hat das Projekt erfolgreich abgeschlossen, ______ er nur sehr wenig Zeit dafür hatte.",
    correct: "obwohl",
  },
  {
    prompt:
      "Wenn ich gewusst ______, dass du heute kommst, hätte ich etwas vorbereitet.",
    correct: "hätte",
  },
] as const;

const correctReason = "так он просто отдыхает, расслабляется";

function StatusBadge({ nightMode }: { nightMode: boolean }) {
  return (
    <div className="absolute right-0 top-0 flex items-center gap-4 rounded-3xl border border-amber-200 bg-white/80 px-5 py-3 shadow-lg backdrop-blur">
      <div
        className={`relative h-12 w-12 rounded-full ${
          nightMode
            ? "bg-gradient-to-b from-indigo-200 to-indigo-500"
            : "bg-gradient-to-b from-yellow-200 to-yellow-500"
        }`}
      >
        {nightMode ? (
          <span className="absolute left-3 top-2 h-7 w-7 rounded-full bg-indigo-950/80" />
        ) : (
          Array.from({ length: 8 }).map((_, index) => (
            <span
              key={index}
              className="absolute left-1/2 top-1/2 h-1 w-5 rounded-full bg-yellow-400"
              style={{
                transform: `translate(-50%, -50%) rotate(${index * 45}deg) translateY(-22px)`,
              }}
            />
          ))
        )}
      </div>
      <div className="text-right">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-700">
          Статус
        </p>
        <p className="text-2xl font-black uppercase tracking-[0.2em] text-zinc-900">
          {nightMode ? "Ночь" : "День"}
        </p>
      </div>
    </div>
  );
}

function GermanQuizModal({
  open,
  onPass,
}: {
  open: boolean;
  onPass: () => void;
}) {
  const [choices, setChoices] = useState<string[]>(["", "", ""]);
  const [inputs, setInputs] = useState<string[]>(["", "", ""]);
  const [error, setError] = useState("");

  if (!open) {
    return null;
  }

  const submit = () => {
    const multipleOk = multipleQuestions.every(
      (question, index) => choices[index] === question.correct,
    );
    const textOk = textQuestions.every(
      (question, index) =>
        inputs[index].trim().toLowerCase() === question.correct,
    );

    if (multipleOk && textOk) {
      setError("");
      onPass();
      return;
    }

    setError("Что-то не сходится. Проверь ответы еще раз.");
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
      <div className="max-h-full w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-2xl md:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-red-700">
          Немецкий тест
        </p>
        <h3 className="mt-3 text-3xl font-black uppercase tracking-[0.12em] text-zinc-900">
          Сначала переживи эту ночь грамотно
        </h3>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
              Выбери перевод
            </p>
            <div className="mt-4 space-y-5">
              {multipleQuestions.map((question, index) => (
                <div
                  key={question.prompt}
                  className="rounded-2xl bg-white p-4 shadow-sm"
                >
                  <p className="text-lg font-bold text-zinc-900">
                    {question.prompt}
                  </p>
                  <div className="mt-3 grid gap-2">
                    {question.options.map((option) => (
                      <button
                        key={option}
                        onClick={() =>
                          setChoices((prev) =>
                            prev.map((item, itemIndex) =>
                              itemIndex === index ? option : item,
                            ),
                          )
                        }
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                          choices[index] === option
                            ? "border-red-500 bg-red-50 text-red-900"
                            : "border-zinc-200 bg-white hover:border-zinc-400"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
              Вставь слово
            </p>
            <div className="mt-4 space-y-5">
              {textQuestions.map((question, index) => (
                <div
                  key={question.prompt}
                  className="rounded-2xl bg-white p-4 shadow-sm"
                >
                  <p className="text-sm leading-6 text-zinc-800">
                    {question.prompt}
                  </p>
                  <input
                    value={inputs[index]}
                    onChange={(e) =>
                      setInputs((prev) =>
                        prev.map((item, itemIndex) =>
                          itemIndex === index ? e.target.value : item,
                        ),
                      )
                    }
                    className="mt-3 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-red-500"
                    placeholder="Вставь слово"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={submit}
            className="rounded-2xl bg-zinc-950 px-6 py-3 font-bold uppercase tracking-[0.14em] text-white transition hover:bg-zinc-800"
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TabThree({
  loading,
  nightMode,
  policeNearby,
  germanQuizOpen,
  caseResolved,
  casinoBroken,
  jamMessage,
  freeSpinTickets,
  freeSpinsRemaining,
  ticketInserted,
  money,
  hiddenAnswerClicks,
  reasonChoice,
  onOpenGermanQuiz,
  onGermanQuizPass,
  onInsertTicket,
  onPlayCasino,
  onHiddenAnswerClick,
  onSelectReason,
  onResolveCase,
}: Props) {
  const hiddenAnswerUnlocked = hiddenAnswerClicks >= 10000;
  const casinoBlockedMessage = !nightMode
    ? "Казино спит днем. Сначала пропусти ночь."
    : policeNearby
      ? "казино не работает пока рядом полиция"
      : casinoBroken
        ? jamMessage
        : null;

  const bottomBadgeText = !nightMode
    ? "Казино работает только ночью"
    : policeNearby
      ? "казино не работает пока рядом полиция"
      : casinoBroken
        ? jamMessage
        : "Казино открыто";

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-zinc-950 via-red-950 to-zinc-900 p-8 text-white shadow-xl">
        <div className="w-full max-w-2xl rounded-[2rem] border border-red-500/40 bg-black/40 p-8">
          <p className="text-sm uppercase tracking-[0.4em] text-red-300">
            Tab 3 boot
          </p>
          <h2 className="mt-4 text-4xl font-black uppercase tracking-[0.18em]">
            Подключаем казино
          </h2>
          <div className="mt-8 h-4 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-yellow-300 via-red-400 to-yellow-300" />
          </div>
          <p className="mt-4 text-sm text-zinc-300">
            Загружаем игровой зал и синхронизируем доступ к автомату...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-y-auto rounded-xl bg-gradient-to-br from-stone-100 via-orange-50 to-red-100 p-8 shadow-xl">
      <StatusBadge nightMode={nightMode} />
      <GermanQuizModal open={germanQuizOpen} onPass={onGermanQuizPass} />

      <div className="max-w-6xl pt-24">
        <div className="mb-8 max-w-3xl rounded-[2rem] border border-zinc-200 bg-white/85 p-6 shadow-lg backdrop-blur">
          <p className="text-xs uppercase tracking-[0.35em] text-red-700">
            Вкладка 3
          </p>
          <h2 className="mt-3 text-4xl font-black uppercase tracking-[0.16em] text-zinc-900">
            Игровой автомат просит билет
          </h2>
          <p className="mt-3 text-base text-zinc-700">
            Сначала добудь билет у шаурмиста, а потом вернись сюда. Один билет
            открывает 3 фри-спина.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900">
              Билетов на руках: {freeSpinTickets}
              {ticketInserted
                ? ` · Фри-спинов осталось: ${freeSpinsRemaining}`
                : ""}
            </div>
            {!nightMode && (
              <button
                onClick={onOpenGermanQuiz}
                className="rounded-full bg-zinc-950 px-5 py-2 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-zinc-800"
              >
                Пропустить день
              </button>
            )}
          </div>
          {casinoBroken && (
            <p className="mt-4 text-sm font-semibold text-red-700">
              {jamMessage}
            </p>
          )}
        </div>

        <CasinoSlotMachine
          hasTicket={freeSpinTickets > 0}
          ticketInserted={ticketInserted}
          freeSpinsRemaining={freeSpinsRemaining}
          money={money}
          blockedMessage={casinoBlockedMessage}
          onInsertTicket={onInsertTicket}
          onSpin={onPlayCasino}
        />

        <div
          className={`mt-10 rounded-[2rem] border p-6 shadow-lg backdrop-blur ${
            caseResolved
              ? "border-zinc-900 bg-zinc-950"
              : "border-zinc-200 bg-white/85"
          }`}
        >
          {!nightMode ? (
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex h-[320px] w-full items-center justify-center rounded-[2rem] bg-black text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500 lg:max-w-[520px]">
                Ничего не происходит
              </div>
              <p className="max-w-md text-base text-zinc-600">
                Пока день, под экраном пусто. Дождись ночи — тогда тут появится
                кое-что важное.
              </p>
            </div>
          ) : caseResolved ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-[2rem] bg-zinc-950">
              <div className="rounded-[2rem] border border-emerald-500/40 bg-zinc-900 px-8 py-6 text-center shadow-2xl">
                <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">
                  Статус дела
                </p>
                <p className="mt-3 text-3xl font-black uppercase tracking-[0.12em] text-white">
                  дело раскрыто, полиция уехала
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
              <div>
                <div className="flex h-[320px] w-full items-center justify-center rounded-[2rem] border border-zinc-200 bg-zinc-900 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">
                  <img
                    src="/zaval.jpg"
                    alt={`zavala`}
                    className="h-72 w-56 rounded-3xl border-2 border-zinc-900 object-cover shadow-xl transition group-hover:scale-[1.02]"
                  />
                </div>
                <p className="mt-5 text-xl font-black uppercase tracking-[0.08em] text-zinc-900">
                  Почему произошел само выпел?
                </p>
                <div className="mt-5 grid gap-3">
                  {[
                    "из-за вальхейма",
                    "из-за ура патриотика",
                    "из-за любви к маленьким сиськам",
                    correctReason,
                  ].map((option) => {
                    const isCorrect = option === correctReason;
                    const isChosen = reasonChoice === option;

                    let buttonClass =
                      "border-zinc-200 bg-white hover:border-zinc-400";

                    if (reasonChoice !== null && isCorrect) {
                      buttonClass =
                        "border-emerald-500 bg-emerald-50 text-emerald-900";
                    } else if (reasonChoice !== null && isChosen) {
                      buttonClass = "border-red-500 bg-red-50 text-red-900";
                    }

                    return (
                      <div key={option} className="relative">
                        <button
                          onClick={() => {
                            if (isCorrect && !hiddenAnswerUnlocked) {
                              return;
                            }
                            onSelectReason(option);
                          }}
                          disabled={
                            reasonChoice !== null ||
                            (isCorrect && !hiddenAnswerUnlocked)
                          }
                          className={`w-full rounded-2xl border px-5 py-4 text-left font-semibold transition ${buttonClass}`}
                        >
                          {option}
                        </button>
                        {isCorrect &&
                          !hiddenAnswerUnlocked &&
                          reasonChoice === null && (
                            <button
                              onClick={onHiddenAnswerClick}
                              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#088F8F] text-center text-sm font-bold uppercase tracking-[0.16em] text-zinc-100"
                            >
                              Нажми 10 000 раз, чтобы открыть ответ ·{" "}
                              {hiddenAnswerClicks}/10000
                            </button>
                          )}
                      </div>
                    );
                  })}
                </div>

                {reasonChoice && (
                  <div className="mt-5 rounded-2xl bg-red-50 px-5 py-4 font-semibold text-red-800">
                    {reasonChoice === correctReason
                      ? "Да, правильный ответ найден."
                      : `Неверно. Правильный ответ: ${correctReason}.`}
                    <p>https://youtube.com/shorts/AXVZvnwXZSY</p>
                  </div>
                )}

                {reasonChoice && !caseResolved && (
                  <button
                    onClick={onResolveCase}
                    className="mt-5 rounded-2xl bg-zinc-950 px-6 py-3 font-bold uppercase tracking-[0.14em] text-white transition hover:bg-zinc-800"
                  >
                    Раскрыть дело
                  </button>
                )}
              </div>

              <div className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-5">
                {casinoBroken ? (
                  <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800">
                    {jamMessage}
                  </div>
                ) : (
                  <>
                    <div className="flex h-[220px] items-center justify-center rounded-[1.5rem] border-2 border-dashed border-zinc-300 bg-white text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                      <img src="/qrcode.jpg" alt="qrcode" />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-zinc-700">
                      Если хочешь выяснить, что произошло то просканируй.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 right-8 rounded-full border border-zinc-800 bg-zinc-950/90 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-100 shadow-lg">
        {bottomBadgeText}
      </div>
    </div>
  );
}
