import { Star } from 'lucide-react';
import { useState } from 'react';

interface RatingProps {
  rating: number;
  maxStars?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (newRating: number) => void;
  reviewsCount?: number;
}

export default function RatingComponent({
  rating,
  maxStars = 5,
  size = 'sm',
  interactive = false,
  onChange,
  reviewsCount,
}: RatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleClick = (starValue: number) => {
    if (interactive && onChange) {
      onChange(starValue);
    }
  };

  const handleMouseEnter = (starValue: number) => {
    if (interactive) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1.5" id={`rating-${Math.random().toString(36).substring(2, 6)}`}>
      <div className="flex items-center gap-0.5" onMouseLeave={handleMouseLeave}>
        {[...Array(maxStars)].map((_, i) => {
          const starValue = i + 1;
          const isFilled = displayRating >= starValue;
          // For fractional values like 4.5, handle rendering half star if not interactive
          const isHalf = !interactive && displayRating > i && displayRating < starValue;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              className={`transition-all duration-150 ${interactive ? 'cursor-pointer hover:scale-120 active:scale-95' : 'cursor-default'}`}
            >
              <div className="relative">
                {isHalf ? (
                  <>
                    <Star className={`${sizeClasses[size]} text-zinc-300 dark:text-zinc-700`} />
                    <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
                      <Star className={`${sizeClasses[size]} fill-amber-400 text-amber-400`} />
                    </div>
                  </>
                ) : (
                  <Star
                    className={`${sizeClasses[size]} ${
                      isFilled
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-300 dark:text-zinc-700'
                    }`}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
      {reviewsCount !== undefined && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium font-mono">
          ({reviewsCount})
        </span>
      )}
    </div>
  );
}
