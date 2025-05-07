import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    // Redirect if user is not an Instructor
    if (user.role !== 'Instructor') {
      navigate('/login'); // or navigate('/unauthorized')
      return;
    }

    const loadInstructorCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/courses?instructorId=${user.id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setCourses(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    loadInstructorCourses();
  }, [authLoading, user, navigate, API_URL]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (authLoading || loading) {
    return <div className="text-center p-4 text-gray-400">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-400 bg-gray-800 rounded-md">{error}</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 p-4 text-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-100">
            Welcome, {user.name} (Instructor)
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Your Courses</h2>
          {courses.length === 0 ? (
            <p className="text-gray-400">No courses created yet.</p>
          ) : (
            <div className="grid gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-100">{course.title}</h3>
                    <p className="text-gray-400">{course.description}</p>
                    <p className="text-sm text-gray-400">
                      Status: {course.isPublished ? 'Published' : 'Draft'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/courses/${course.id}/manage`)}
                      className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => navigate(`/courses/add`)}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Create New Course
          </button>
        </div>
      </div>
    </div>
  );
}