type Props = {
  hasShawarma: boolean;
  contestDone: boolean;
  flashlight: boolean;
  onBuyShawarma: () => void;
  onStartContest: () => void;
  onGetFlashlight: () => void;
};

export default function ShawarmaTab({
  hasShawarma,
  contestDone,
  flashlight,
  onBuyShawarma,
  onStartContest,
  onGetFlashlight,
}: Props) {
  return (
    <div className="w-full h-full bg-white p-8 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold mb-4">Шаурмист</h2>
      <p className="mb-3">
        Он дает билет первому клиенту и квест: купи шаурму, отдай организатору,
        пройди реакцию и пианино (3 песни), получи ковер и обменяй на фонарик.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onBuyShawarma}
          disabled={hasShawarma}
          className={`px-4 py-2 rounded ${
            hasShawarma ? "bg-neutral-200 text-neutral-500" : "bg-amber-600 text-white"
          }`}
        >
          Купить шаурму
        </button>

        <button
          onClick={onStartContest}
          disabled={!hasShawarma || contestDone}
          className={`px-4 py-2 rounded ${
            !hasShawarma || contestDone
              ? "bg-neutral-200 text-neutral-500"
              : "bg-blue-600 text-white"
          }`}
        >
          Отдать шаурму и пройти конкурс
        </button>

        <button
          onClick={onGetFlashlight}
          disabled={!contestDone || flashlight}
          className={`px-4 py-2 rounded ${
            !contestDone || flashlight
              ? "bg-neutral-200 text-neutral-500"
              : "bg-lime-600 text-black"
          }`}
        >
          Получить фонарик
        </button>
      </div>

      <div className="mt-4 text-sm text-neutral-700">
        <p>Шаурма: {hasShawarma ? "куплена" : "нет"}</p>
        <p>Конкурс ковров: {contestDone ? "победа" : "не пройден"}</p>
        <p>Фонарик: {flashlight ? "получен" : "недоступен"}</p>
      </div>
    </div>
  );
}
