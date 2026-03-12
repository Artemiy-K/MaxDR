import { useMemo, useState } from "react";

type Props = {
  mode: "ticket" | "flashlight";
  ticketReceived: boolean;
  hasShawarma: boolean;
  respectEarned: boolean;
  flashlight: boolean;
  onReceiveTicket: () => void;
  onTakeShawarma: () => void;
  onGrantFlashlight: () => void;
};

const ticketDialog = [
  "привет, я токо открыл шаурмечную и тут клиенты тут как тут!",
  "но вижу у тебя нету денег, ладно парень, помогу, я вообще лудик",
  "у меня есть билет на 3 фри спина, попробуй выиграть деньги и я позволю купить тебе свою шаурму",
] as const;

const flashlightDialog = [
  "О опять ты? Видел поднялся, по деньгам не так ли?",
  "Вижу ты не знаешь что дальше делать, но вообще я тут давно и знаю, что до того как сайт сломался тут были справа сверху настройки звука",
  "сейчас их перекрывает багованый черный квадрат, но есть одна идея...",
  "мой брат айрат, у него есть фонарик. Он с ним переплывал тысу в афганиистане и он может помочь тебе в том чтобы убрать квадрат",
  "единственное...",
  "он не дает его тем, кого не уважает, но ты можешь заслужить уважение!",
  "пройди на вкладку 5 и пройди конкурс, тогда то он тебя и зауважает!",
  "Тебе возможно для участия понадобится шаурма берешь?",
] as const;

const respectDialog = [
  "Бро, ты похоже охеренно умеешь играть на пианино!",
  "Кайло был в восторге от твоей игры! Молодец!",
  "...",
  "...",
  "Что ты ещё хочешь шаурмы или че ты пялишь?",
  "А фонарик точно!",
] as const;

export default function ShawarmaTab({
  mode,
  ticketReceived,
  hasShawarma,
  respectEarned,
  flashlight,
  onReceiveTicket,
  onTakeShawarma,
  onGrantFlashlight,
}: Props) {
  const [step, setStep] = useState(0);
  const [respectStep, setRespectStep] = useState(0);

  const dialog = mode === "ticket" ? ticketDialog : flashlightDialog;

  const showingRespectDialog = mode === "flashlight" && respectEarned && !flashlight;

  const currentLine = useMemo(() => {
    if (mode === "ticket" && ticketReceived) {
      return "билет уже у тебя. дуй в казино и попробуй раскрутить автомат.";
    }

    if (showingRespectDialog) {
      return respectDialog[Math.min(respectStep, respectDialog.length - 1)];
    }

    if (mode === "flashlight" && hasShawarma) {
      return "шаурма у тебя. теперь можешь смело идти на вкладку 5 и зарабатывать уважение Айрата.";
    }

    return dialog[Math.min(step, dialog.length - 1)];
  }, [dialog, hasShawarma, mode, respectStep, showingRespectDialog, step, ticketReceived]);

  const handleNext = () => {
    if (mode === "ticket") {
      if (ticketReceived) {
        return;
      }

      if (step < dialog.length - 1) {
        setStep((prev) => prev + 1);
        return;
      }

      onReceiveTicket();
      return;
    }

    if (showingRespectDialog) {
      if (respectStep < respectDialog.length - 1) {
        setRespectStep((prev) => prev + 1);
        return;
      }

      onGrantFlashlight();
      return;
    }

    if (hasShawarma) {
      return;
    }

    if (step < dialog.length - 1) {
      setStep((prev) => prev + 1);
      return;
    }

    onTakeShawarma();
  };

  const buttonLabel = mode === "ticket"
    ? step < dialog.length - 1
      ? "Дальше"
      : "Забрать билет"
    : step < dialog.length - 1
      ? "Дальше"
      : "Взять шаурму";

  return (
    <div className="h-full w-full rounded-xl bg-[url(/shawarma.jpg)] bg-cover bg-center bg-no-repeat p-8 shadow-xl">
      <div className="flex h-full max-w-4xl flex-col justify-end">
        <div className="rounded-[2rem] border border-amber-200 bg-black/55 p-6 shadow-2xl backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-300">
            Шаурмист
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-[0.12em] text-white">
            Разговор у стойки
          </h2>
          <p className="mt-5 text-lg leading-8 text-white">{currentLine}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {!showingRespectDialog && ((mode === "ticket" && !ticketReceived) ||
              (mode === "flashlight" && !hasShawarma)) && (
              <button
                onClick={handleNext}
                className="rounded-2xl bg-amber-500 px-5 py-3 font-bold text-zinc-950 transition hover:bg-amber-400"
              >
                {buttonLabel}
              </button>
            )}

            {showingRespectDialog && !flashlight && (
              <button
                onClick={handleNext}
                className="rounded-2xl bg-emerald-400 px-5 py-3 font-bold text-zinc-950 transition hover:bg-emerald-300"
              >
                {respectStep < respectDialog.length - 1 ? "Дальше" : "Забрать фонарик"}
              </button>
            )}

            {mode === "ticket" && ticketReceived && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                Билет на 3 фри-спина получен.
              </div>
            )}

            {mode === "flashlight" && hasShawarma && !respectEarned && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                Шаурма получена. Дальше путь лежит на вкладку 5.
              </div>
            )}

            {flashlight && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                Фонарик у тебя. Можно убрать черные квадраты и открыть настройки.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
