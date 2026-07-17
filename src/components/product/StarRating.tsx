import React, { useState } from 'react';
import { Star } from 'lucide-react';

export function StarRating({ rating, size = 16, className = '' }: { rating: number; size?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.round(rating)
              ? 'fill-[#CA8A04] text-[#CA8A04]'
              : 'fill-none text-[#CA8A04]/30'
          }
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 focus:outline-none"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            size={28}
            className={
              star <= (hover || value)
                ? 'fill-[#CA8A04] text-[#CA8A04] transition-colors'
                : 'fill-none text-[#CA8A04]/30 transition-colors'
            }
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}
