import { GlitchText } from "./GlitchText";

export type TabId = 1 | 2 | 3 | 4 | 5 | 6;

type Props = {
  activeTab: TabId;
  setActiveTab: (n: TabId) => void;
  unlockedTabs: Record<TabId, boolean>;
  money: number;
  flashlight: boolean;
};

const labels: Record<TabId, string> = {
  1: "Вкладка 1",
  2: "Вкладка 2",
  3: "Вкладка 3 (Казино)",
  4: "Вкладка 4",
  5: "Вкладка 5",
  6: "Шаурмист",
};

const lockedSymbols: Record<TabId, string> = {
  1: "",
  2: "",
  3: "Ж©С®О”ГР–в€‘Й…",
  4: "О¦С®в±®О”ГОЁЙЋ",
  5: "ГћОЈТњГЖ©",
  6: "ЉЖ®ФґОє∑",
};

export default function Navigation({
  activeTab,
  setActiveTab,
  unlockedTabs,
  money,
  flashlight,
}: Props) {
  return (
    <div className="w-72 p-6 shadow-xl bg-white relative z-20 overflow-y-auto">
      {([1, 2, 3, 4, 5, 6] as TabId[]).map((tabId) => {
        const unlocked = unlockedTabs[tabId];
        const isActive = activeTab === tabId;

        return (
          <button
            key={tabId}
            onClick={() => unlocked && setActiveTab(tabId)}
            disabled={!unlocked}
            className={`w-full text-left px-4 py-3 mb-3 rounded-lg shadow-md transition-colors ${
              isActive ? "ring-2 ring-black" : ""
            } ${
              unlocked
                ? "bg-white hover:bg-neutral-100"
                : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
            }`}
          >
            {unlocked ? (
              labels[tabId]
            ) : (
              <GlitchText text={lockedSymbols[tabId]} speed={180} intensity={0.2} />
            )}
          </button>
        );
      })}

      <div className="mt-8 rounded-lg border p-3">
        <p className="font-bold">Деньги: {money}</p>
        <p className="text-sm mt-1">Фонарик: {flashlight ? "есть" : "нет"}</p>
      </div>
    </div>
  );
}
