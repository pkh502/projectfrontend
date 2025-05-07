import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [expandedSessions, setExpandedSessions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses/${id}/details`);
      setCourse(response.data.data);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError(err.response?.data?.error || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const toggleSession = (sessionId) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (loading) return <div className="text-center p-4 text-gray-400">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-400">{error}</div>;
  if (!course) return <div className="text-center p-4 text-gray-400">Course not found.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* Breadcrumb Navigation */}
      <nav className="bg-gray-800 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex space-x-2 text-sm text-gray-400">
            <li>
              <Link to="/" className="hover:text-blue-400">Home</Link>
            </li>
            <li>/</li>
            <li className="text-gray-300">{course.title}</li>
          </ol>
        </div>
      </nav>

      {/* Course Header */}
      <section className="bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-gray-400 mb-4">{course.description || 'No description available'}</p>
              <p className="text-sm text-gray-500 mb-2">
                Category: {course.category?.name || 'Uncategorized'}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Status: {course.isPublished ? 'Published' : 'Draft'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Created: {new Date(course.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sessions List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-6">Sessions</h2>
        {course.sessions?.length === 0 ? (
          <p className="text-gray-400">No sessions available for this course.</p>
        ) : (
          <ul className="space-y-6">
            {course.sessions.map((session) => {
              const youtubeId = getYouTubeId(session.youtubeLink);
              return (
                <li
                  key={session.id}
                  className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {youtubeId && (
                      <div className="md:w-1/3">
                        <img
                          src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                          alt="YouTube Thumbnail"
                          className="w-full h-auto rounded-lg cursor-pointer hover:opacity-80 transition"
                          onClick={() => window.open(session.youtubeLink, '_blank')}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{session.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">
                        Duration: {session.duration ? `${session.duration} minutes` : 'N/A'}
                      </p>
                      <div
                        className={`prose prose-invert max-w-none text-gray-300 mb-2 ${expandedSessions[session.id] ? '' : 'line-clamp-2'}`}
                        dangerouslySetInnerHTML={{ __html: session.explanation }}
                      />
                      <button
                        onClick={() => toggleSession(session.id)}
                        className="text-blue-400 underline hover:text-blue-500 mb-2"
                      >
                        {expandedSessions[session.id] ? 'Show Less' : 'Show More'}
                      </button>
                      <div>
                        <a
                          href={session.youtubeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline hover:text-blue-500"
                        >
                          Watch on YouTube
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default CourseDetails;
