import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiBriefcase, FiCalendar } from 'react-icons/fi';
import { engineerAPI } from '../utils/api';

const AddTasks = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await engineerAPI.getMyProjects();
      setProjects(response.data);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8 sm:py-12">
        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8 sm:py-12">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-rose-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <FiBriefcase className="w-6 h-6 sm:w-8 sm:h-8 text-rose-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Error Loading Projects</h3>
          <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">{error}</p>
          <button 
            onClick={fetchProjects}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-xl font-semibold text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-2 sm:px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Add Tasks</h1>
          <p className="text-gray-600 text-sm sm:text-base">Add daily or monthly tasks to your projects</p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg">
          <FiPlus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200/50 p-6 sm:p-8 lg:p-12 text-center">
          <FiBriefcase className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No Projects Assigned</h3>
          <p className="text-gray-500 text-sm sm:text-base">You haven't been assigned to any projects yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200/50 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Project Header */}
              <div className="mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                  {project.name}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm line-clamp-3">
                  {project.scopeOfWork}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 sm:space-y-3">
                <Link
                  to={`/dashboard/add-daily-task/${project._id}`}
                  className="flex items-center justify-center gap-2 w-full p-2 sm:p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:rounded-xl transition-colors font-semibold text-xs sm:text-sm"
                >
                  <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  Add Daily Task
                </Link>
                
                <Link
                  to={`/dashboard/add-monthly-task/${project._id}`}
                  className="flex items-center justify-center gap-2 w-full p-2 sm:p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg sm:rounded-xl transition-colors font-semibold text-xs sm:text-sm"
                >
                  <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  Add Monthly Task
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddTasks;