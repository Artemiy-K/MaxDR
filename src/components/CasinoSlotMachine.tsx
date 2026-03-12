import { useEffect, useMemo, useState } from "react";

export type ReelItem =
  | { type: "text"; value: string }
  | { type: "image"; src: string; alt: string };

export type SpinOutcome = {
  reels: ReelItem[];
  payout: number;
  status: string;
};

type Props = {
  hasTicket: boolean;
  ticketInserted: boolean;
  freeSpinsRemaining: number;
  money: number;
  blockedMessage?: string | null;
  onInsertTicket: () => void;
  onSpin: () => SpinOutcome;
};

const defaultReels: ReelItem[] = [
  { type: "text", value: "7" },
  { type: "text", value: "★" },
  { type: "text", value: "$" },
];

export default function CasinoSlotMachine({
  hasTicket,
  ticketInserted,
  freeSpinsRemaining,
  money,
  blockedMessage,
  onInsertTicket,
  onSpin,
}: Props) {
  const [reels, setReels] = useState<ReelItem[]>(defaultReels);
  const [status, setStatus] = useState("Автомат ждет билет.");
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    if (blockedMessage) {
      setStatus(blockedMessage);
      return;
    }

    if (!ticketInserted) {
      setStatus("Автомат ждет билет.");
      return;
    }

    if (freeSpinsRemaining > 0) {
      setStatus(`Билет принят. Осталось ${freeSpinsRemaining} фри-спина.`);
      return;
    }

    setStatus("Фри-спины закончились.");
  }, [blockedMessage, freeSpinsRemaining, ticketInserted]);

  const actionLabel = useMemo(() => {
    if (blockedMessage) {
      return "Недоступно";
    }

    if (!ticketInserted) {
      return hasTicket ? "Вставить билет" : "Билет нужен";
    }

    if (freeSpinsRemaining <= 0) {
      return "Фри-спины закончились";
    }

    return spinning ? "Крутится..." : "Spin";
  }, [blockedMessage, freeSpinsRemaining, hasTicket, spinning, ticketInserted]);

  const handleAction = () => {
    if (blockedMessage) {
      setStatus(blockedMessage);
      return;
    }

    if (!ticketInserted) {
      if (!hasTicket) {
        setStatus("Сначала загляни к шаурмисту за билетом.");
        return;
      }

      onInsertTicket();
      setStatus("Билет принят. Доступно 3 фри-спина.");
      return;
    }

    if (spinning || freeSpinsRemaining <= 0) {
      return;
    }

    setSpinning(true);
    setStatus("Барабаны раскручиваются...");

    window.setTimeout(() => {
      const outcome = onSpin();
      setReels(outcome.reels);
      setSpinning(false);
      setStatus(outcome.status);
    }, 1100);
  };

  const disabled = blockedMessage
    ? true
    : !ticketInserted
      ? !hasTicket
      : spinning || freeSpinsRemaining <= 0;

  return (
    <div className="relative w-full max-w-4xl">
      <div className="overflow-hidden rounded-[2rem] border-4 border-yellow-400 bg-gradient-to-b from-red-700 via-red-800 to-red-950 shadow-2xl">
        <div className="border-b-4 border-yellow-500 bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 py-5 text-center text-zinc-900">
          <h1 className="text-4xl font-black uppercase tracking-[0.25em] md:text-6xl">
            Jackpot
          </h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.3em] md:text-base">
            Lucky Spin Machine
          </p>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1fr_auto]">
          <div className="p-6 md:p-10">
            <div className="rounded-[1.75rem] border-8 border-zinc-800 bg-zinc-950 p-4 shadow-inner md:p-6">
              <div className="rounded-[1.25rem] border-4 border-yellow-300 bg-gradient-to-b from-zinc-200 to-zinc-100 p-4 md:p-6">
                <div className="grid grid-cols-3 gap-3 md:gap-5">
                  {reels.map((item, index) => (
                    <div
                      key={index}
                      className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl border-4 border-zinc-300 bg-white shadow-[inset_0_8px_18px_rgba(0,0,0,0.18)]"
                    >
                      {item.type === "image" ? (
                        <img
                          src={item.src}
                          alt={item.alt}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl font-black text-red-600 md:text-7xl">
                          {item.value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border-2 border-yellow-500 bg-zinc-900 px-5 py-4 text-yellow-300">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-yellow-200/80">
                      Balance
                    </p>
                    <p className="text-2xl font-bold md:text-3xl">${money.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.3em] text-yellow-200/80">
                      Free Spins
                    </p>
                    <p className="text-2xl font-bold md:text-3xl">{freeSpinsRemaining}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-between">
              <div className="rounded-2xl border border-zinc-700 bg-zinc-900/70 px-5 py-4 text-sm text-zinc-100">
                {status}
              </div>

              <button
                onClick={handleAction}
                disabled={disabled}
                className={`rounded-full border-4 px-10 py-4 text-xl font-black uppercase tracking-[0.2em] transition-transform ${
                  disabled
                    ? "border-zinc-500 bg-zinc-700 text-zinc-300"
                    : "border-yellow-200 bg-gradient-to-b from-yellow-300 to-yellow-500 text-zinc-950 hover:scale-105"
                }`}
              >
                {actionLabel}
              </button>
            </div>
          </div>

          <div className="hidden items-center justify-center px-8 lg:flex">
            <div className="relative flex items-center">
              <div className="h-72 w-10 rounded-full border-4 border-zinc-700 bg-gradient-to-b from-zinc-300 to-zinc-500 shadow-xl" />
              <div className="absolute -right-8 top-4 h-20 w-20 rounded-full border-4 border-zinc-900 bg-gradient-to-b from-red-400 to-red-700 shadow-2xl" />
            </div>
          </div>
        </div>

        <div className="border-t-4 border-yellow-500 bg-zinc-950/90 px-6 py-5">
          <div className="grid grid-cols-2 gap-3 text-center md:grid-cols-4">
            {[
              ["7 7 7", "$5,000"],
              ["★ ★ ★", "$2,500"],
              ["$ $ $", "$1,000"],
              ["Any 2x 7", "$500"],
            ].map(([combo, prize]) => (
              <div
                key={combo}
                className="rounded-2xl border border-yellow-500/40 bg-red-950/60 px-4 py-3"
              >
                <p className="text-sm uppercase tracking-[0.2em] text-yellow-200">{combo}</p>
                <p className="mt-1 text-xl font-bold text-white">{prize}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
