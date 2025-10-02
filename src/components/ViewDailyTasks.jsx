import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEye, FiCalendar, FiArrowLeft, FiCheckCircle, FiClock, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import { engineerAPI } from '../utils/api';

const ViewDailyTasks = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  useEffect(() => {
    if (project && selectedDate) {
      fetchTasks();
    }
  }, [selectedDate, project]);

  const fetchProjectDetails = async () => {
    try {
      const response = await engineerAPI.getMyProjects();
      const projectData = response.data.find(p => p._id === projectId);
      setProject(projectData);
    } catch (err) {
      setMessage('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await engineerAPI.getDailyTasks(projectId);
      
      // Filter tasks based on selected date
      const filteredTasks = response.data.filter(task => {
        const taskDate = new Date(task.date).toISOString().split('T')[0];
        return taskDate === selectedDate;
      });
      
      setTasks(filteredTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setTasks([]);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await engineerAPI.deleteDailyTask(taskId);
      setMessage('Task deleted successfully');
      fetchTasks(); // Refresh the list
    } catch (err) {
      setMessage('Error deleting task');
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FiClock className="w-4 h-4 text-orange-500" />,
      done: <FiCheckCircle className="w-4 h-4 text-green-500" />,
      failed: <FiAlertCircle className="w-4 h-4 text-rose-500" />
    };
    return icons[status] || icons.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending Review',
      done: 'Approved',
      failed: 'Rejected'
    };
    return texts[status] || 'Pending Review';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard/view-tasks')}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">View Daily Tasks</h1>
            <p className="text-gray-600">
              {project?.name} - Monitor your daily task progress
            </p>
          </div>
        </div>
        <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
          <FiEye className="w-6 h-6" />
        </div>
      </div>

      {/* Date Selection */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Date
            </label>
            <div className="relative group">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-2xl transition-all duration-300 bg-white text-gray-800 group-hover:border-purple-300 shadow-sm focus:border-purple-500 focus:ring-0 focus:outline-none"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <FiCalendar className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {tasks.length} task(s) for {selectedDate}
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-2xl border mb-6 ${
          message.includes('successfully') 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {message}
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 p-12 text-center">
            <FiEye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Tasks Found</h3>
            <p className="text-gray-500">
              No daily tasks found for the selected date.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {task.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(task.status)}
                      <span>{getStatusText(task.status)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiCalendar className="w-4 h-4" />
                      <span>{new Date(task.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>

              {task.note && (
                <div className="mb-4">
                  <p className="text-gray-600 text-sm">{task.note}</p>
                </div>
              )}

              {task.supervisorNote && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-800 mb-1">Supervisor Feedback:
                  {task.reviewedBy && ` (by ${task.reviewedBy?.name})`}
                  </h4>
                  <p className="text-blue-700 text-sm">{task.supervisorNote}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewDailyTasks;