import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlus, FiCalendar, FiArrowLeft, FiSave, FiX } from 'react-icons/fi';
import { engineerAPI } from '../utils/api';

const AddDailyTask = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // State for tasks
  const [tasks, setTasks] = useState([{ title: '', note: '' }]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
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

    fetchProjectDetails();
  }, [projectId]);

  const addTaskField = () => {
    setTasks([...tasks, { title: '', note: '' }]);
  };

  const removeTaskField = (index) => {
    if (tasks.length > 1) {
      const newTasks = tasks.filter((_, i) => i !== index);
      setTasks(newTasks);
    }
  };

  const updateTaskField = (index, field, value) => {
    const newTasks = tasks.map((task, i) => 
      i === index ? { ...task, [field]: value } : task
    );
    setTasks(newTasks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate) {
      setMessage('Please select a date');
      return;
    }

    const validTasks = tasks.filter(task => task.title.trim() !== '');
    if (validTasks.length === 0) {
      setMessage('Please add at least one task with a title');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      // Create all daily tasks
      const promises = validTasks.map(task => 
        engineerAPI.addDailyTask({
          projectId,
          title: task.title,
          note: task.note
        })
      );

      await Promise.all(promises);
      
      setMessage(`${validTasks.length} daily task(s) added successfully!`);
      setTasks([{ title: '', note: '' }]);
      
      setTimeout(() => {
        navigate('/dashboard/add-tasks');
      }, 2000);
      
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add daily tasks');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8 sm:py-12">
        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading project details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-2 sm:px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/dashboard/add-tasks')}
            className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl sm:rounded-2xl transition-colors"
          >
            <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Add Daily Tasks</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {project?.name} - Add multiple daily tasks
            </p>
          </div>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg">
          <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200/50 p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Message */}
          {message && (
            <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-sm sm:text-base ${
              message.includes('successfully') 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {message}
            </div>
          )}

          {/* Date Selection */}
          <div className="space-y-2 sm:space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Select Date *
            </label>
            <div className="relative group">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-3 sm:py-4 pr-10 sm:pr-12 border-2 border-gray-200 rounded-xl sm:rounded-2xl transition-all duration-300 bg-white text-gray-800 group-hover:border-blue-300 shadow-sm focus:border-blue-500 focus:ring-0 focus:outline-none text-sm sm:text-base"
              />
              <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2">
                <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Daily Tasks ({tasks.length})
              </h3>
              <button
                type="button"
                onClick={addTaskField}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                <FiPlus className="w-4 h-4" />
                Add Another Task
              </button>
            </div>

            {tasks.map((task, index) => (
              <div key={index} className="border-2 border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-700 text-sm sm:text-base">Task {index + 1}</h4>
                  {tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTaskField(index)}
                      className="p-1 sm:p-2 text-rose-600 hover:bg-rose-50 rounded-lg sm:rounded-xl transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Task Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => updateTaskField(index, 'title', e.target.value)}
                    placeholder="Enter task title..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    required
                  />
                </div>

                {/* Task Note */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Task Note (Optional)
                  </label>
                  <textarea
                    value={task.note}
                    onChange={(e) => updateTaskField(index, 'note', e.target.value)}
                    placeholder="Add any additional notes..."
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed group transform hover:scale-[1.02]"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding Tasks...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:scale-110 transition-transform" />
                  <span>Add {tasks.length} Daily Task(s)</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/dashboard/add-tasks')}
              className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-2 border-gray-200 text-gray-700 rounded-xl sm:rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-semibold text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDailyTask;