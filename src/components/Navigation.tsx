import { GlitchText } from "./GlitchText";

type Props = {
  activeTab: number;
  setActiveTab: (n: number) => void;
  money: number;
  flashlight: boolean;
  buyFlashlight: () => void;
};

export default function Navigation({
  activeTab,
  setActiveTab,
  money,
  flashlight,
  buyFlashlight,
}: Props) {
  return (
    <div className="w-64 p-6 shadow-xl bg-white relative z-10">
      {/* Рабочие вкладки */}
      <button
        onClick={() => setActiveTab(0)}
        className={`w-full text-left px-4 py-3 mb-3 rounded-lg bg-white shadow-md ${
          activeTab === 0 ? "ring-2 ring-black" : ""
        }`}
      >
        Старт
      </button>

      <button
        onClick={() => setActiveTab(1)}
        className={`w-full text-left px-4 py-3 mb-3 rounded-lg bg-white shadow-md ${
          activeTab === 1 ? "ring-2 ring-black" : ""
        }`}
      >
        Вкладка 1
      </button>

      <button
        onClick={() => setActiveTab(2)}
        className={`w-full text-left px-4 py-3 mb-3 rounded-lg bg-white shadow-md ${
          activeTab === 2 ? "ring-2 ring-black" : ""
        }`}
      >
        Вкладка 2
      </button>

      {/* Сломанные вкладки */}
      <button>
        <span className="font-black text-xl tracking-widest">
          <button
            className={`w-full text-left px-4 py-3 mb-3 rounded-lg bg-white shadow-md `}
          >
            ƩѮΔØЖ∑ɅҨ Ɣ
          </button>
        </span>
      </button>

      <button className="w-full text-left px-4 py-3 mb-3 rounded-lg bg-white shadow-md cursor-not-allowed">
        <GlitchText text="ΞɊѺÞΣҜØƩ ÞΣ" speed={200} />
      </button>

      <button>
        <span className="font-black text-xl tracking-widest">
          <button
            className={`w-full text-left px-4 py-3 mb-3 rounded-lg bg-white shadow-md `}
          >
            ΦѮⱮΔØΨɎЖ Ɐ
          </button>
        </span>
      </button>

      {/* Деньги */}
      <div className="mt-10">
        <p className="font-bold">💰 Деньги: {money}</p>

        {!flashlight && (
          <button
            onClick={buyFlashlight}
            className="mt-2 px-3 py-2 bg-black text-white rounded"
          >
            Купить фонарик (50)
          </button>
        )}
      </div>
    </div>
  );
}
