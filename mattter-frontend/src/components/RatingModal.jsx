import React, { useState, useEffect } from 'react';
import { Star, X, Send, Loader } from 'lucide-react';
import { API_BASE_URL } from '../config';

const RatingModal = ({ catalyst, booking, existingRating, onClose, onRatingSubmitted }) => {
    const [rating, setRating] = useState(existingRating?.rating || 0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [review, setReview] = useState(existingRating?.review || '');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const payload = {
                catalyst_id: catalyst.id,
                booking_id: booking?.id || null,
                rating: rating,
                review: review.trim() || ''
            };

            console.log('Submitting rating with payload:', payload);
            console.log('Existing rating:', existingRating);

            // Use PUT if editing, POST if creating
            const url = existingRating
                ? `${API_BASE_URL}/api/ratings/${existingRating.id}/`
                : `${API_BASE_URL}/api/ratings/`;
            const method = existingRating ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Rating submitted:', data);
                if (onRatingSubmitted) {
                    onRatingSubmitted(data);
                }
                onClose();
            } else {
                const errorData = await response.json();
                console.error('Error response:', errorData);

                // Display detailed error messages
                let errorMessage = 'Failed to submit rating';
                if (errorData.detail) {
                    errorMessage = errorData.detail;
                } else if (typeof errorData === 'object') {
                    // Show field-specific errors
                    const errors = Object.entries(errorData).map(([field, msgs]) =>
                        `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`
                    ).join('; ');
                    errorMessage = errors || errorMessage;
                }

                setError(errorMessage);
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            setError('Failed to submit rating. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-surface border border-dark-border rounded-2xl max-w-md w-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-text-primary">
                        {existingRating ? 'Update' : 'Rate'} {catalyst.username}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text-primary transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Star Rating Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-text-secondary mb-3">
                        How would you rate this catalyst?
                    </label>
                    <div className="flex gap-2 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-12 h-12 ${star <= (hoveredRating || rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'fill-none text-gray-600'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <p className="text-center mt-2 text-text-secondary">
                            {rating === 1 && 'Poor'}
                            {rating === 2 && 'Fair'}
                            {rating === 3 && 'Good'}
                            {rating === 4 && 'Very Good'}
                            {rating === 5 && 'Excellent'}
                        </p>
                    )}
                </div>

                {/* Review Text Area */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Share your experience (optional)
                    </label>
                    <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Tell others about your experience with this catalyst..."
                        rows={4}
                        className="w-full px-4 py-3 bg-dark-elevated border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple transition-colors resize-none"
                        maxLength={500}
                    />
                    <p className="text-xs text-text-muted mt-1">
                        {review.length}/500 characters
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-dark-border hover:bg-dark-border/70 rounded-lg text-text-primary transition-all"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || rating === 0}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-accent-purple to-accent-pink rounded-lg text-white font-medium hover:shadow-lg hover:shadow-accent-purple/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                {existingRating ? 'Updating...' : 'Submitting...'}
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                {existingRating ? 'Update Rating' : 'Submit Rating'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RatingModal;
