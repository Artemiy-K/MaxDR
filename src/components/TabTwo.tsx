import EnginePanel from "./engineTaks";

interface TabTwoProps {
  stage: "firstBreakdown" | "restored";
  canReboot: boolean;
  onEngineSolved: () => void;
  onReboot: () => void;
}

export default function TabTwo({
  stage,
  canReboot,
  onEngineSolved,
  onReboot,
}: TabTwoProps) {
  return (
    <div className="bg-white p-10 rounded-xl shadow-xl text-center w-full h-full flex items-center justify-center relative overflow-y-auto">
      <div className="transition-all duration-500">
        <EnginePanel stage={stage} onSolved={onEngineSolved} />
      </div>

      {canReboot && (
        <button
          onClick={onReboot}
          className="absolute bottom-6 right-6 rounded-lg bg-red-600 px-5 py-3 text-white font-semibold shadow-lg"
        >
          Перезапустить систему
        </button>
      )}
    </div>
  );
}
