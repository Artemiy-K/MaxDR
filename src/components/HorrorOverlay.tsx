import type { Position } from "./HomePage";

type Props = {
  effectActive: boolean;
  eyes: Position[];
  popups: Position[];
};

export default function HorrorOverlay({ effectActive, eyes, popups }: Props) {
  if (!effectActive) return null;

  return (
    <>
      <div className="absolute inset-0 bg-black/80 z-20 pointer-events-none" />

      <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
        <h1 className="text-white text-4xl animate-pulse">так значит это ты</h1>
      </div>

      {eyes.map((eye, i) => (
        <div
          key={i}
          className="absolute text-4xl animate-pulse z-30 pointer-events-none"
          style={{ top: `${eye.top}%`, left: `${eye.left}%` }}
        >
          👁
        </div>
      ))}

      {popups.map((popup, i) => (
        <div
          key={i}
          className="absolute bg-white shadow-lg border px-4 py-2 text-sm z-40"
          style={{ top: `${popup.top}%`, left: `${popup.left}%` }}
        >
          ⚠ сайт попытался узнать ваше местоположение
        </div>
      ))}
    </>
  );
}
