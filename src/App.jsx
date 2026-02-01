import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  Sparkles,
  Trash2,
  LogOut,
  User,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import LectureTracker from './components/LectureTracker';
import DSATracker from './components/DSATracker';
import About from './components/About';
import AuthPage from './components/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import useUserData from './hooks/useUserData';
import dsaQuestions from './data/dsaQuestions';
import './index.css';

function AppContent() {
  const { user, isAuthenticated, isGuest, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('preptracker-theme');
    return savedTheme || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('preptracker-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const {
    data,
    loading: dataLoading,
    syncing,
    setStartDate,
    toggleLecture,
    updateDSAStatus,
    getDSAStatus,
    getSolvedCount,
    getWeeklyData,
    resetData,
    updateDailyNote,
    addDailyTodo,
    toggleDailyTodo,
    deleteDailyTodo,
  } = useUserData();

  // Calculate total questions from nested structure
  const totalQuestions = dsaQuestions?.content?.reduce((total, topic) => {
    return total + (topic.categoryList?.reduce((catTotal, category) => {
      return catTotal + (category.questionList?.length || 0);
    }, 0) || 0);
  }, 0) || 0;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'lectures', label: 'Lectures', icon: BookOpen },
    { id: 'dsa', label: 'DSA Sheet', icon: Code2 },
    { id: 'about', label: 'About', icon: User },
  ];

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
      resetData();
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="mobile-header-content">
          <div className="mobile-logo">
            <Sparkles className="w-6 h-6 text-orange-400" />
            <span className="logo-text">PrepTracker</span>
          </div>
          <div className="mobile-header-actions">
            <button
              className="mobile-theme-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu" onClick={e => e.stopPropagation()}>
            <div className="mobile-user-info">
              <div className="user-avatar">
                <User className="w-6 h-6" />
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name || 'Guest'}</span>
                <span className="user-email">{user?.email || 'Local data only'}</span>
              </div>
            </div>

            <nav className="mobile-nav">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`mobile-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mobile-menu-actions">
              <button onClick={toggleTheme} className="mobile-action-btn theme">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <button onClick={handleReset} className="mobile-action-btn danger">
                <Trash2 className="w-5 h-5" />
                <span>Reset Progress</span>
              </button>
              <button onClick={handleLogout} className="mobile-action-btn">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar / Top Navigation */}
      <nav className="desktop-nav glass-card">
        <div className="nav-brand">
          <Sparkles className="w-6 h-6 text-orange-400" />
          <span className="brand-text">PrepTracker</span>
        </div>

        <div className="nav-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="nav-actions">
          <div className="user-badge">
            <User className="w-4 h-4" />
            <span className="user-name-badge">{user?.name?.split(' ')[0] || 'Guest'}</span>
          </div>
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={handleReset}
            className="nav-action-btn"
            title="Reset all progress"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="nav-action-btn logout"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            data={data}
            setStartDate={setStartDate}
            getSolvedCount={getSolvedCount}
            getWeeklyData={getWeeklyData}
            totalQuestions={totalQuestions}
            userName={user?.name}
            updateDailyNote={updateDailyNote}
            addDailyTodo={addDailyTodo}
            toggleDailyTodo={toggleDailyTodo}
            deleteDailyTodo={deleteDailyTodo}
          />
        )}

        {activeTab === 'lectures' && (
          <LectureTracker
            data={data}
            toggleLecture={toggleLecture}
          />
        )}

        {activeTab === 'dsa' && (
          <DSATracker
            updateDSAStatus={updateDSAStatus}
            getDSAStatus={getDSAStatus}
            getSolvedCount={getSolvedCount}
          />
        )}

        {activeTab === 'about' && <About />}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`bottom-nav-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span className="bottom-nav-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
