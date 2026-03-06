type Props = {
  removedSquares: number[];
  flashlight: boolean;
  removeSquare: (id: number) => void;
};

export default function BlackSquares({
  removedSquares,
  flashlight,
  removeSquare,
}: Props) {
  return (
    <>
      {[0, 1, 2].map((id) =>
        !removedSquares.includes(id) ? (
          <div
            key={id}
            onClick={() => removeSquare(id)}
            className={`absolute bg-black z-30 ${
              flashlight ? "cursor-pointer" : "cursor-not-allowed"
            }`}
            style={{
              top: `${100 + id * 120}px`,
              left: `${50 + id * 150}px`,
              width: "200px",
              height: "100px",
            }}
          />
        ) : null,
      )}
    </>
  );
}
