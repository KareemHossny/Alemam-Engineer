import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiMenu,
  FiX,
  FiLogOut,
  FiPlus,
  FiEye,
  FiUser,
  FiBarChart2,
  FiBriefcase
} from 'react-icons/fi';
import AddTasks from './AddTasks';
import AddDailyTask from './AddDailyTask';
import AddMonthlyTask from './AddMonthlyTask';
import ViewTasks from './ViewTasks';
import ViewDailyTasks from './ViewDailyTasks';
import ViewMonthlyTasks from './ViewMonthlyTasks';
import { engineerAPI } from '../utils/api';

const EngineerDashboard = ({ onLogout, engineerInfo }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingTasks: 0,
    completedTasks: 0,
    totalTasks: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch real projects data
      const projectsResponse = await engineerAPI.getMyProjects();
      const projects = projectsResponse.data;
      
      let pendingTasks = 0;
      let completedTasks = 0;
      let totalTasks = 0;

      // Fetch tasks for each project
      for (const project of projects) {
        try {
          const [dailyTasksResponse, monthlyTasksResponse] = await Promise.all([
            engineerAPI.getDailyTasks(project._id),
            engineerAPI.getMonthlyTasks(project._id)
          ]);
          
          const dailyTasks = dailyTasksResponse.data;
          const monthlyTasks = monthlyTasksResponse.data;
          
          // Count tasks by status
          dailyTasks.forEach(task => {
            totalTasks++;
            if (task.status === 'pending') pendingTasks++;
            if (task.status === 'done') completedTasks++;
          });
          
          monthlyTasks.forEach(task => {
            totalTasks++;
            if (task.status === 'pending') pendingTasks++;
            if (task.status === 'done') completedTasks++;
          });
        } catch (error) {
          console.error(`Error fetching tasks for project ${project._id}:`, error);
        }
      }

      setStats({
        totalProjects: projects.length,
        pendingTasks,
        completedTasks,
        totalTasks
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await engineerAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      onLogout();
      navigate('/login');
    }
  };

  const menuItems = [
    {
      path: '/dashboard/add-tasks',
      label: 'Add Tasks',
      icon: FiPlus,
      description: 'Add daily or monthly tasks'
    },
    {
      path: '/dashboard/view-tasks',
      label: 'View Tasks',
      icon: FiEye,
      description: 'View your tasks progress'
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white/95 backdrop-blur-2xl shadow-2xl border-r border-gray-200/60 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header - Clickable to go to Dashboard */}
          <div 
            className="p-7 border-b border-gray-200/60 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/dashboard')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-xl">
                  <FiUser className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-extrabold text-gray-800 leading-tight">Engineer Portal</h1>
                  <p className="text-sm text-gray-500 mt-1 font-medium">Task Management System</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FiX className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-7 space-y-3">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group font-medium ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-700 hover:bg-blue-50 hover:shadow-lg hover:border hover:border-blue-200/50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <IconComponent className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${
                    active ? 'text-white' : 'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <div className={`font-semibold text-lg transition-colors ${
                      active ? 'text-white' : 'text-gray-900'
                    }`}>
                      {item.label}
                    </div>
                    <div className={`text-sm transition-colors ${
                      active ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white/90 backdrop-blur-2xl border-b border-gray-200/60 shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-3 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                <FiMenu className="w-7 h-7 text-gray-600" />
              </button>
              <div className="lg:block">
                <h1 className="text-3xl font-extrabold text-gray-800">
                  {location.pathname === '/dashboard' ? 'Dashboard' :
                   location.pathname.includes('add-tasks') ? 'Add Tasks' :
                   location.pathname.includes('view-tasks') ? 'View Tasks' :
                   location.pathname.includes('add-daily') ? 'Add Daily Task' :
                   location.pathname.includes('add-monthly') ? 'Add Monthly Task' :
                   location.pathname.includes('view-daily') ? 'View Daily Tasks' : 'View Monthly Tasks'}
                </h1>
                <p className="text-gray-500 text-lg font-medium">
                  Manage your engineering tasks efficiently
                </p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-3 text-red-700 hover:bg-rose-50 hover:text-rose-700 rounded-2xl transition-all duration-300 group border border-red-200 hover:border-rose-200 font-semibold shadow-sm"
            >
              <FiLogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-8 py-8 bg-transparent">
          <Routes>
            <Route path="add-tasks" element={<AddTasks />} />
            <Route path="add-daily-task/:projectId" element={<AddDailyTask />} />
            <Route path="add-monthly-task/:projectId" element={<AddMonthlyTask />} />
            <Route path="view-tasks" element={<ViewTasks />} />
            <Route path="view-daily-tasks/:projectId" element={<ViewDailyTasks />} />
            <Route path="view-monthly-tasks/:projectId" element={<ViewMonthlyTasks />} />
            <Route path="/" element={<EngineerWelcomeSection stats={stats} loading={loading} engineerInfo={engineerInfo} />} />
          </Routes>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Welcome Section for Engineer
const EngineerWelcomeSection = ({ stats, loading, engineerInfo }) => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header مع اسم المهندس */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4 leading-tight">
          Welcome back,Engineer{' '}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            {engineerInfo?.name || 'Engineer'}
          </span>
          . 👋
        </h1>
        <p className="text-2xl text-gray-600 max-w-3xl mx-auto font-medium leading-relaxed">
          Here's your overview of projects and tasks. Stay productive and track your progress efficiently.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/60 p-8 text-center hover:scale-105 transition-transform duration-300">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FiBriefcase className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-4xl font-extrabold text-gray-800 mb-3">
            {loading ? '...' : stats.totalProjects}
          </h3>
          <p className="text-xl text-gray-600 font-semibold">Total Projects</p>
          <p className="text-sm text-gray-500 mt-2">Assigned to you</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/60 p-8 text-center hover:scale-105 transition-transform duration-300">
          <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FiBarChart2 className="w-10 h-10 text-orange-600" />
          </div>
          <h3 className="text-4xl font-extrabold text-gray-800 mb-3">
            {loading ? '...' : stats.pendingTasks}
          </h3>
          <p className="text-xl text-gray-600 font-semibold">Pending Tasks</p>
          <p className="text-sm text-gray-500 mt-2">Awaiting review</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/60 p-8 text-center hover:scale-105 transition-transform duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FiBarChart2 className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-4xl font-extrabold text-gray-800 mb-3">
            {loading ? '...' : stats.completedTasks}
          </h3>
          <p className="text-xl text-gray-600 font-semibold">Completed Tasks</p>
          <p className="text-sm text-gray-500 mt-2">Approved by supervisors</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/60 p-8 text-center hover:scale-105 transition-transform duration-300">
          <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FiBarChart2 className="w-10 h-10 text-purple-600" />
          </div>
          <h3 className="text-4xl font-extrabold text-gray-800 mb-3">
            {loading ? '...' : stats.totalTasks}
          </h3>
          <p className="text-xl text-gray-600 font-semibold">Total Tasks</p>
          <p className="text-sm text-gray-500 mt-2">All time tasks</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/60 p-10">
          <h3 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center gap-4">
            <FiBarChart2 className="w-8 h-8 text-blue-600" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/dashboard/add-tasks"
              className="flex items-center gap-4 p-6 rounded-2xl border-2 border-gray-200/60 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 group bg-white/60 hover:bg-blue-50 font-semibold text-gray-800 hover:text-blue-700"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <FiPlus className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold transition-colors">Add New Tasks</div>
                <div className="text-gray-600 text-lg mt-1">Create daily or monthly tasks</div>
              </div>
            </Link>
            
            <Link
              to="/dashboard/view-tasks"
              className="flex items-center gap-4 p-6 rounded-2xl border-2 border-gray-200/60 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 group bg-white/60 hover:bg-blue-50 font-semibold text-gray-800 hover:text-blue-700"
            >
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <FiEye className="w-8 h-8 text-green-600 group-hover:text-green-700 transition-colors" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold transition-colors">View My Tasks</div>
                <div className="text-gray-600 text-lg mt-1">Monitor task progress</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerDashboard;