import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ReviewSection({ courseId, user, token }) {
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [error, setError] = useState(null);
  const [isCommenting, setIsCommenting] = useState({});
  const [newComment, setNewComment] = useState({});
  const [hasReviewed, setHasReviewed] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/reviews/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedReviews = response.data.data || [];
      setReviews(fetchedReviews);
      const userReview = fetchedReviews.find((review) => review.userId === user.id);
      setHasReviewed(!!userReview);
    } catch (err) {
      console.error('Failed to fetch reviews:', err.response ? err.response.data : err.message);
      setError('Failed to load reviews');
    }
  };

  const handleReviewSubmit = async () => {
    if (hasReviewed) {
      alert('You have already reviewed this course.');
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      setError('Please provide a rating between 1 and 5 stars.');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/reviews/${courseId}`,
        { rating: Number(rating), text: reviewText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviewText('');
      setRating(0);
      setHasReviewed(true);
      fetchReviews();
      setError(null);
    } catch (err) {
      console.error('Error submitting review:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.error || 'Failed to add review');
    }
  };

  const handleCommentSubmit = async (reviewId) => {
    if (!newComment[reviewId] || !newComment[reviewId].trim()) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/reviews/comment/${reviewId}`,
        { text: newComment[reviewId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment((prev) => ({ ...prev, [reviewId]: '' }));
      setIsCommenting((prev) => ({ ...prev, [reviewId]: false }));
      fetchReviews();
      alert('Comment added successfully');
    } catch (err) {
      alert('Error adding comment: ' + (err.response?.data?.error || 'Please try again'));
    }
  };

  const toggleCommentInput = (reviewId) => {
    setIsCommenting((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }));
    if (!isCommenting[reviewId]) {
      setNewComment((prev) => ({ ...prev, [reviewId]: '' }));
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchReviews();
    }
  }, [user, token, courseId]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`cursor-pointer text-2xl ${i <= rating ? 'text-yellow-400' : 'text-gray-500'}`}
          onClick={() => !hasReviewed && setRating(i)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const isInstructor = user?.role === 'Instructor';

  return (
    <div className="mt-6 bg-gray-900 p-6 rounded-lg shadow-md text-gray-200">
      <h3 className="text-xl font-semibold text-gray-100 mb-4">Reviews</h3>
      {error && (
        <p className="text-red-400 bg-gray-800 p-2 rounded-md mb-4">{error}</p>
      )}
      {reviews.length === 0 ? (
        <p className="text-gray-400 italic">No reviews yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-gray-800 p-4 border border-gray-700 rounded-md shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-100">{review.user.name}</span>
                <div className="flex gap-1">{renderStars(review.rating)}</div>
              </div>
              <p className="text-gray-300 mb-4">{review.text || 'No review text provided'}</p>

              <div className="ml-4">
                <button
                  onClick={() => toggleCommentInput(review.id)}
                  className="text-blue-400 underline hover:text-blue-600 mb-2"
                >
                  {isCommenting[review.id] ? 'Cancel' : 'Add Comment'}
                </button>
                {isCommenting[review.id] && (
                  <div className="mt-2">
                    <textarea
                      value={newComment[review.id] || ''}
                      onChange={(e) => setNewComment((prev) => ({ ...prev, [review.id]: e.target.value }))}
                      rows="2"
                      className="w-full p-2 rounded-md border border-gray-600 bg-gray-700 text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Write your comment..."
                    />
                    <button
                      onClick={() => handleCommentSubmit(review.id)}
                      className="mt-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
                    >
                      Submit Comment
                    </button>
                  </div>
                )}

                {review.comments && review.comments.length > 0 ? (
                  <div className="mt-2">
                    {review.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-700 p-2 rounded-md mb-2">
                        <p className="text-sm text-gray-300">
                          <strong className="text-gray-100">{comment.user.name}</strong>: {comment.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mt-2">No comments yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isInstructor && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h4 className="text-lg font-medium text-gray-100 mb-2">Add Review</h4>
          {hasReviewed ? (
            <p className="text-gray-400 italic">You have already reviewed this course.</p>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex gap-1">{renderStars(rating)}</div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows="3"
                className="w-full p-2 rounded-md border border-gray-600 bg-gray-700 text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Write your review here..."
              />
              <button
                onClick={handleReviewSubmit}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
              >
                Submit Review
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}