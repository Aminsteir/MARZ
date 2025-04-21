import { Star } from "lucide-react";

export default function ReviewBar({
  rating,
  count,
}: {
  rating: number;
  count: number;
}) {
  return (
    <span className="flex items-center gap-1 text-yellow-600">
      {count > 0 ? (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              fill={i + 1 <= rating ? "currentColor" : "none"}
              stroke="currentColor"
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">
            ({count.toFixed(0)})
          </span>
        </>
      ) : (
        <span className="text-xs text-gray-500 ml-1">(0 Reviews)</span>
      )}
    </span>
  );
}
