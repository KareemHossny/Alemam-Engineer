import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlus, FiCalendar, FiArrowLeft, FiSave, FiX } from 'react-icons/fi';
import { engineerAPI } from '../utils/api';

const AddMonthlyTask = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // State for tasks
  const [tasks, setTasks] = useState([{ title: '', note: '' }]);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

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
      // Create all monthly tasks
      const promises = validTasks.map(task => 
        engineerAPI.addMonthlyTask({
          projectId,
          title: task.title,
          note: task.note,
          date: selectedDate
        })
      );

      await Promise.all(promises);
      
      setMessage(`${validTasks.length} monthly task(s) added successfully!`);
      setTasks([{ title: '', note: '' }]);
      
      setTimeout(() => {
        navigate('/dashboard/add-tasks');
      }, 2000);
      
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add monthly tasks');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard/add-tasks')}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Add Monthly Tasks</h1>
            <p className="text-gray-600">
              {project?.name} - Add multiple monthly tasks
            </p>
          </div>
        </div>
        <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
          <FiCalendar className="w-6 h-6" />
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Message */}
          {message && (
            <div className={`p-4 rounded-2xl border ${
              message.includes('successfully') 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {message}
            </div>
          )}

          {/* Date Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Select Date *
            </label>
            <div className="relative group">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-2xl transition-all duration-300 bg-white text-gray-800 group-hover:border-green-300 shadow-sm focus:border-green-500 focus:ring-0 focus:outline-none"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <FiCalendar className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Monthly Tasks ({tasks.length})
              </h3>
              <button
                type="button"
                onClick={addTaskField}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Add Another Task
              </button>
            </div>

            {tasks.map((task, index) => (
              <div key={index} className="border-2 border-gray-200 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-700">Task {index + 1}</h4>
                  {tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTaskField(index)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 text-base tracking-wide focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed group transform hover:scale-[1.02]"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding Tasks...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
                  <span>Add {tasks.length} Monthly Task(s)</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/dashboard/add-tasks')}
              className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMonthlyTask;