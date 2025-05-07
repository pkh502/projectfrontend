import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from './Navbar.jsx';

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null); // Track the selected course
  const [sessions, setSessions] = useState([]); // Store sessions for the selected course
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const headers = user ? { Authorization: `Bearer ${user.token}` } : {};
        const response = await axios.get(`${API_URL}/courses`, { headers });
        console.log(response.data);
        setCourses(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [API_URL, user]);

  // Fetch sessions when a course is selected
  useEffect(() => {
    if (selectedCourseId) {
      const fetchSessions = async () => {
        try {
          const response = await axios.get(`${API_URL}/courses/${selectedCourseId}/sessions`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          setSessions(response.data.data || []);
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to fetch sessions');
        }
      };

      fetchSessions();
    }
  }, [API_URL, selectedCourseId, user]);

  const handleEnroll = async (courseId) => {
    if (!user) {
      navigate('/login'); // Redirect to login if not logged in
      return;
    }

    try {
      await axios.post(
        `${API_URL}/enrollments`,
        { courseId },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      alert('Enrolled successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to enroll');
    }
  };

  if (loading) {
    return <div className="text-center p-4 text-gray-400">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-400">{error}</div>;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900 p-4 text-gray-200">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-gray-100">Available Courses</h1>

          {courses.length === 0 ? (
            <p className="text-gray-400">No courses available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-100">{course.title}</h2>
                    <p className="text-gray-400 mb-2">{course.description}</p>

                    <button
                      onClick={() => setSelectedCourseId(course.id)} // Set selected course ID
                      className="text-blue-400 hover:underline"
                    >
                      View Sessions
                    </button>

                    {/* Render sessions dropdown if this course is selected */}
                    {selectedCourseId === course.id && (
                      <div className="mt-4 p-4 bg-gray-700 rounded-lg shadow-md">
                        <h3 className="font-semibold text-lg text-gray-100">Sessions</h3>
                        {sessions.length === 0 ? (
                          <p className="text-gray-400">No sessions available.</p>
                        ) : (
                          <ul className="space-y-2">
                            {sessions.map((session) => (
                              <li key={session.id} className="text-gray-300">
                                <strong>{session.title}</strong>
                                <br />
                                <a
                                  href={session.youtubeLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline"
                                >
                                  {session.youtubeLink}
                                </a>
                                <p>{session.explanation}</p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleEnroll(course.id)}
                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Enroll
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}