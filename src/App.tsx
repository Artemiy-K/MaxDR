import { useCallback, useState } from "react";
import StartPage from "./components/StartPage";
import MatrixConsole from "./components/loadingPage";
import HomePage from "./components/HomePage";

function App() {
  const [stage, setStage] = useState<"start" | "loading" | "TheGame">(
    "TheGame",
  ); // fix start
  const setStageLoading = useCallback(() => {
    setStage("loading");
  }, [setStage]);

  const setStageFVW = useCallback(() => {
    setStage("TheGame");
  }, [setStage]);
  return (
    <div className="w-full h-full">
      {stage === "start" && <StartPage setStageLoading={setStageLoading} />}
      {stage === "loading" && <MatrixConsole setStageFVW={setStageFVW} />}
      {stage === "TheGame" && <HomePage />}
    </div>
  );
}

export default App;
