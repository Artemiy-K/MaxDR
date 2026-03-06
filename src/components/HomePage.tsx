import { useEffect, useState } from "react";
import Navigation from "./Navigation";
import BlackSquares from "./BlackSquares";
import TabOne from "./TabOne";
import TabTwo from "./TabTwo";
import HorrorOverlay from "./HorrorOverlay";

export type Position = {
  top: number;
  left: number;
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const [money, setMoney] = useState(100);
  const [flashlight, setFlashlight] = useState(false);
  const [removedSquares, setRemovedSquares] = useState<number[]>([]);

  const [verified, setVerified] = useState(false);
  const [engineSolved, setEngineSolved] = useState(false);

  const [eyes, setEyes] = useState<Position[]>([]);
  const [popups, setPopups] = useState<Position[]>([]);

  const effectActive = verified && activeTab === 1 && !engineSolved;

  useEffect(() => {
    if (!effectActive) {
      setEyes([]);
      setPopups([]);
      return;
    }

    const generatedEyes = Array.from({ length: 20 }).map(() => ({
      top: Math.random() * 90,
      left: Math.random() * 90,
    }));

    setEyes(generatedEyes);

    let count = 0;
    const interval = setInterval(() => {
      if (count >= 80) {
        clearInterval(interval);
        return;
      }

      setPopups((prev) => [
        ...prev,
        { top: Math.random() * 90, left: Math.random() * 90 },
      ]);

      count++;
    }, 200);

    return () => clearInterval(interval);
  }, [effectActive]);

  const removeSquare = (id: number) => {
    if (!flashlight) return;
    setRemovedSquares((prev) => [...prev, id]);
  };

  const buyFlashlight = () => {
    if (money >= 50) {
      setMoney((m) => m - 50);
      setFlashlight(true);
    }
  };

  return (
    <div className="relative flex h-screen bg-neutral-100 overflow-hidden">
      <BlackSquares
        removedSquares={removedSquares}
        flashlight={flashlight}
        removeSquare={removeSquare}
      />

      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        money={money}
        flashlight={flashlight}
        buyFlashlight={buyFlashlight}
      />

      <div className="flex-1 flex items-center justify-center relative z-10">
        {activeTab === 1 && <TabOne onVerified={() => setVerified(true)} />}

        {activeTab === 2 && (
          <TabTwo
            verified={verified}
            onEngineSolved={() => setEngineSolved(true)}
          />
        )}
      </div>

      <HorrorOverlay effectActive={effectActive} eyes={eyes} popups={popups} />
    </div>
  );
}
