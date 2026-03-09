type Props = {
  active: boolean;
};

export default function RebootOverlay({ active }: Props) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-white">
      <div className="text-3xl font-bold mb-4 animate-pulse">Перезапуск системы...</div>
      <div className="w-80 h-3 rounded bg-neutral-700 overflow-hidden">
        <div className="h-full bg-red-500 animate-[reboot_3s_linear_forwards]" />
      </div>
      <style>{`@keyframes reboot { from { width: 0%; } to { width: 100%; } }`}</style>
    </div>
  );
}
