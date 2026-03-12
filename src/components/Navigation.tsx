import { GlitchText } from "./GlitchText";

export type TabId = 1 | 2 | 3 | 4 | 5 | 6;

type Props = {
  activeTab: TabId;
  setActiveTab: (n: TabId) => void;
  unlockedTabs: Record<TabId, boolean>;
  money: number;
  flashlight: boolean;
  internetBoosted: boolean;
  freeSpinTickets: number;
  secretTabUnlocked?: boolean;
  secretTabRevealed?: boolean;
  onSecretTabActivate?: () => void;
};

const labels: Record<TabId, string> = {
  1: "Вкладка 1",
  2: "Вкладка 2",
  3: "Вкладка 3",
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
  internetBoosted,
  freeSpinTickets,
  secretTabUnlocked = false,
  secretTabRevealed = false,
  onSecretTabActivate,
}: Props) {
  return (
    <div className="relative z-20 w-72 overflow-y-auto bg-white p-6 shadow-xl">
      {internetBoosted && (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 shadow-sm">
          Ваш интернет усилен!
        </div>
      )}

      {([1, 2, 3, 4, 5, 6] as TabId[]).map((tabId) => {
        const unlocked = tabId === 6 && secretTabUnlocked ? true : unlockedTabs[tabId];
        const isActive = activeTab === tabId;
        const isHiddenSecret = tabId === 6 && secretTabUnlocked && !secretTabRevealed;
        const label = tabId === 6 && secretTabUnlocked ? "Вкладка 6" : labels[tabId];

        return (
          <button
            key={tabId}
            onClick={() => {
              if (!unlocked) return;
              if (tabId === 6 && secretTabUnlocked && !secretTabRevealed) {
                onSecretTabActivate?.();
              }
              setActiveTab(tabId);
            }}
            disabled={!unlocked}
            aria-label={tabId === 6 && secretTabUnlocked ? "Секретная вкладка" : label}
            className={`mb-3 w-full rounded-lg px-4 py-3 text-left shadow-md transition-colors ${isActive ? "ring-2 ring-black" : ""} ${unlocked ? "bg-white hover:bg-neutral-100" : "cursor-not-allowed bg-neutral-200 text-neutral-500"} ${isHiddenSecret ? "opacity-0" : ""}`}
          >
            {unlocked ? label : <GlitchText text={lockedSymbols[tabId]} speed={180} intensity={0.2} />}
          </button>
        );
      })}

      <div className="mt-8 rounded-2xl border p-4">
        <p className="font-bold">Деньги: {money}</p>
        <p className="mt-1 text-sm">Фонарик: {flashlight ? "есть" : "нет"}</p>
        <p className="mt-1 text-sm">Фри спин: {freeSpinTickets}</p>
      </div>
    </div>
  );
}
