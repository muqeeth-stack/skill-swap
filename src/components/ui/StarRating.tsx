"use client";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ rating, maxRating = 5, size = "md", interactive = false, onChange }: StarRatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i < Math.floor(rating);
        const halfFilled = !filled && i < rating;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            aria-label={
              interactive
                ? `Rate ${i + 1} out of ${maxRating} stars`
                : `${i + 1} out of ${maxRating} stars`
            }
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          >
            <svg
              className={`${sizeClasses[size]} ${
                filled ? "text-amber-400" : halfFilled ? "text-amber-400" : "text-gray-300"
              }`}
              fill={filled || halfFilled ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              />
            </svg>
          </button>
        );
      })}
      {rating > 0 && (
        <span className="ml-1 text-sm font-medium text-gray-600">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
