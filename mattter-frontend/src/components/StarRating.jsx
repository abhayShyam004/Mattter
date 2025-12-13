import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, count, size = 'md', showCount = true, className = '' }) => {
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
        xl: 'w-6 h-6'
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg'
    };

    const starSize = sizeClasses[size];
    const textSize = textSizeClasses[size];
    const numRating = parseFloat(rating) || 0;
    const displayRating = numRating.toFixed(1);

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => {
                    const filled = star <= Math.round(numRating);
                    return (
                        <Star
                            key={star}
                            className={`${starSize} ${filled
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-none text-gray-600'
                                }`}
                        />
                    );
                })}
            </div>
            <span className={`${textSize} text-text-secondary ml-1`}>
                {displayRating}
            </span>
            {showCount && count > 0 && (
                <span className={`${textSize} text-text-muted`}>
                    ({count})
                </span>
            )}
        </div>
    );
};

export default StarRating;
