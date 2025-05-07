import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function EnrolledCourses() {
  const { user, loading: authLoading } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchEnrolledCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/enrollments`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // Only course data, no session/progress fetching
      const courses = response.data.data.map((enrollment) => enrollment.course);
      setEnrolledCourses(courses);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch enrolled courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchEnrolledCourses();
  }, [user]);

  useEffect(() => {
    const handleEnrollmentChange = () => {
      fetchEnrolledCourses();
    };
    window.addEventListener('courseEnrolled', handleEnrollmentChange);
    return () => {
      window.removeEventListener('courseEnrolled', handleEnrollmentChange);
    };
  }, []);

  if (authLoading || loading) return <div className="text-center p-4 text-gray-400">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-400 bg-gray-800 rounded-md">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto bg-gray-900 shadow-md p-6 rounded-lg mt-6 text-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-100">My Enrolled Courses</h2>
      {enrolledCourses.length === 0 ? (
        <p className="text-gray-400">You haven't enrolled in any courses yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrolledCourses.map((course) => (
            <div
              key={course.id}
              className="border border-gray-700 p-4 rounded-md bg-gray-800 shadow-sm hover:shadow-md cursor-pointer transition"
              onClick={() => navigate(`/course/${course.id}/progress`)}
            >
              <h3 className="text-xl font-semibold text-gray-100">{course.title}</h3>
              <p className="text-gray-400">{course.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}