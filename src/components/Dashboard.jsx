import {
    Calendar,
    Target,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    BookOpen,
    Code2,
    Flame,
    Clock,
    ChevronLeft,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import DayDetails from './DayDetails';
import NoteHistory from './NoteHistory';
import lectureData from '../data/lectureData';
import { useMemo, useState } from 'react';
import { PenTool, History as HistoryIcon, PlusCircle } from 'lucide-react';

const Dashboard = ({
    data,
    setStartDate,
    getSolvedCount,
    getWeeklyData,
    totalQuestions,
    userName,
    updateDailyNote,
    addDailyTodo,
    toggleDailyTodo,
    deleteDailyTodo
}) => {
    const totalLectures = lectureData.length;
    const completedLectures = data.completedLectures.length;
    const solvedQuestions = getSolvedCount();

    // Calendar state
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [historyOpen, setHistoryOpen] = useState(false);

    // Calculate days info
    const daysInfo = useMemo(() => {
        if (!data.startDate) return null;

        const start = new Date(data.startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 90);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysPassed = Math.max(0, Math.floor((today - start) / (1000 * 60 * 60 * 24)));
        const daysRemaining = Math.max(0, Math.floor((end - today) / (1000 * 60 * 60 * 24)));

        return { start, end, daysPassed, daysRemaining };
    }, [data.startDate]);

    // Calculate pacing
    const pacingInfo = useMemo(() => {
        if (!daysInfo) return null;

        const { daysPassed } = daysInfo;

        // Expected lectures per day
        const lecturesPerDay = totalLectures / 90;
        const expectedLectures = Math.floor(daysPassed * lecturesPerDay);
        const lectureDifference = expectedLectures - completedLectures;

        // Expected questions per day
        const questionsPerDay = totalQuestions / 90;
        const expectedQuestions = Math.floor(daysPassed * questionsPerDay);
        const questionDifference = expectedQuestions - solvedQuestions;

        return {
            expectedLectures,
            lectureDifference,
            expectedQuestions,
            questionDifference,
            lecturesPerDay: lecturesPerDay.toFixed(1),
            questionsPerDay: questionsPerDay.toFixed(1),
        };
    }, [daysInfo, completedLectures, solvedQuestions, totalLectures, totalQuestions]);

    // Calendar data for the current month with weeks in rows
    const calendarData = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
        // We want Monday to be the start, so adjust
        let startDayOfWeek = firstDay.getDay();
        startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Convert to Monday = 0

        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Add empty cells for days before the first of the month
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push({ empty: true });
        }

        // Add all days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            // Use local date string construction to avoid timezone shifts caused by toISOString() check
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = date.getTime() === today.getTime();
            const isPast = date < today;
            const isActive = data.activityDates.includes(dateStr);

            days.push({
                day,
                dateStr,
                isToday,
                isPast,
                isActive,
                empty: false
            });
        }

        // Group into weeks (7 days each)
        const weeks = [];
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }

        // Pad the last week if necessary
        const lastWeek = weeks[weeks.length - 1];
        while (lastWeek && lastWeek.length < 7) {
            lastWeek.push({ empty: true });
        }

        return weeks;
    }, [currentMonth, data.activityDates]);

    const activeDaysInMonth = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        return data.activityDates.filter(dateStr => {
            const date = new Date(dateStr);
            return date.getFullYear() === year && date.getMonth() === month;
        }).length;
    }, [currentMonth, data.activityDates]);

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getMonthName = (date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const navigateMonth = (direction) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + direction);
        setCurrentMonth(newMonth);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const getCurrentDateInfo = () => {
        const now = new Date();
        return now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });
    };

    const weekDays = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

    // Calculate completion percentages
    const lecturePercentage = Math.round((completedLectures / totalLectures) * 100);
    const dsaPercentage = Math.round((solvedQuestions / totalQuestions) * 100);
    const overallPercentage = Math.round(((completedLectures / totalLectures) + (solvedQuestions / totalQuestions)) / 2 * 100);

    return (
        <div className="dashboard animate-fade-in">
            {/* Header with Greeting */}
            <div className="dashboard-header">
                <div className="dashboard-greeting">
                    <p className="greeting-date">{getCurrentDateInfo()}</p>
                    <h1 className="greeting-text">
                        {getGreeting()}, <span className="greeting-name">{userName || 'User'}</span>
                    </h1>
                </div>

                {/* Quick Filters */}
                {/* <div className="quick-filters">
                    <button className="filter-chip active">all</button>
                    <button className="filter-chip">today</button>
                    <button className="filter-chip">tomorrow</button>
                    <button className="filter-chip">week</button>
                </div> */}
            </div>

            {/* Main Grid */}
            <div className="dashboard-grid">
                {/* Analytics Card */}
                <div className="analytics-card glass-card">
                    <div className="analytics-header">
                        <h3>Analytics</h3>

                    </div>

                    <div className="analytics-content">
                        <div className="analytics-chart">
                            <svg viewBox="0 0 120 120" className="progress-ring">
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="none"
                                    stroke="var(--bg-dark)"
                                    strokeWidth="12"
                                />
                                {/* DSA Progress (Orange) */}
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="none"
                                    stroke="#F5923E"
                                    strokeWidth="12"
                                    strokeDasharray={`${(dsaPercentage * 314) / 100} 314`}
                                    strokeDashoffset="-100"
                                    strokeLinecap="round"
                                    transform="rotate(-90 60 60)"
                                />
                                {/* Lecture Progress (Blue-gray) */}
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="none"
                                    stroke="#B8C5CE"
                                    strokeWidth="12"
                                    strokeDasharray={`${(lecturePercentage * 314) / 100} 314`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 60 60)"
                                />
                            </svg>
                            <div className="analytics-percentage">
                                <span className="percentage-value">{overallPercentage} %</span>
                                <span className="percentage-label">completed</span>
                            </div>
                        </div>

                        {/* <div className="analytics-dropdown">
                            <select className="priority-select">
                                <option>priority</option>
                                <option>date</option>
                                <option>type</option>
                            </select>
                        </div> */}

                        <div className="analytics-legend">
                            <div className="legend-item">
                                <span className="legend-dot legend-high"></span>
                                <span>Lectures · {completedLectures}</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot legend-medium"></span>
                                <span>DSA · {solvedQuestions}</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot legend-low"></span>
                                <span>Remaining · {totalLectures - completedLectures + totalQuestions - solvedQuestions}</span>
                            </div>
                        </div>

                        {/* Weekly Bar Chart */}
                        <div className="weekly-chart">
                            <h4 className="weekly-chart-title">This Week's Progress</h4>
                            <div className="bar-chart-grouped">
                                {getWeeklyData().map((day, index) => {
                                    const maxLectures = Math.max(
                                        ...getWeeklyData().map(d => d.lectures),
                                        3 // Minimum scale
                                    );
                                    const maxQuestions = Math.max(
                                        ...getWeeklyData().map(d => d.questions),
                                        5 // Minimum scale
                                    );
                                    const lectureHeight = (day.lectures / maxLectures) * 100;
                                    const questionHeight = (day.questions / maxQuestions) * 100;

                                    return (
                                        <div key={index} className={`bar-group ${day.isToday ? 'today' : ''}`}>
                                            <div className="bar-group-container">
                                                {/* Lectures Bar */}
                                                <div className="bar-wrapper">
                                                    <div className="bar-value">{day.lectures}</div>
                                                    <div className="bar-track">
                                                        <div
                                                            className="bar-fill lectures"
                                                            style={{ height: `${lectureHeight}%` }}
                                                            title={`${day.lectures} lectures`}
                                                        />
                                                    </div>
                                                </div>
                                                {/* Questions Bar */}
                                                <div className="bar-wrapper">
                                                    <div className="bar-value">{day.questions}</div>
                                                    <div className="bar-track">
                                                        <div
                                                            className="bar-fill questions"
                                                            style={{ height: `${questionHeight}%` }}
                                                            title={`${day.questions} questions`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="bar-day-label">{day.day}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="chart-legend">
                                <div className="chart-legend-item">
                                    <span className="chart-legend-dot lectures"></span>
                                    <span>Lectures</span>
                                </div>
                                <div className="chart-legend-item">
                                    <span className="chart-legend-dot questions"></span>
                                    <span>Questions</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar Card */}
                <div className="calendar-card glass-card">
                    <div className="calendar-header">
                        <button onClick={() => navigateMonth(-1)} className="calendar-nav-btn">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h3 className="calendar-month">{getMonthName(currentMonth)}</h3>
                        <button onClick={() => navigateMonth(1)} className="calendar-nav-btn">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="calendar-grid">
                        {/* Week day headers */}
                        {weekDays.map(day => (
                            <div key={day} className="calendar-weekday">{day}</div>
                        ))}

                        {/* Calendar days */}
                        {calendarData.flat().map((day, index) => (
                            <div
                                key={index}
                                onClick={() => !day.empty && setSelectedDate(day.dateStr)}
                                className={`calendar-day ${day.empty ? 'empty' : ''} ${day.isToday ? 'today' : ''} ${day.isActive ? 'active' : ''} ${day.isPast && !day.isActive ? 'missed' : ''} ${!day.empty ? 'cursor-pointer hover:bg-slate-700/50 transition-colors' : ''}`}
                                title={day.dateStr ? `${day.dateStr} - ${day.isActive ? 'Active' : 'Inactive'}` : ''}
                            >
                                {!day.empty && day.day}
                                {/* Brief indicator if day has notes/todos? Maybe later. */}
                            </div>
                        ))}
                    </div>

                    <div className="calendar-legend">
                        <div className="legend-item">
                            <span className="legend-box active"></span>
                            <span>Active ({activeDaysInMonth})</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-box missed"></span>
                            <span>Missed</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Cards Row */}
            <div className="progress-cards-row">
                {/* Lectures Progress */}
                <div className="progress-card glass-card">
                    <div className="progress-card-header">
                        <div className="progress-card-icon lectures">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="progress-card-info">
                            <h4>Lectures</h4>
                            <p className="progress-sublabel">Video content</p>
                        </div>
                    </div>
                    <div className="progress-stats">
                        <div className="progress-numbers">
                            <span className="progress-current">{completedLectures}</span>
                            <span className="progress-total">/ {totalLectures}</span>
                        </div>
                        <span className="progress-badge">{lecturePercentage}%</span>
                    </div>
                    <div className="progress-bar-wrapper">
                        <div className="progress-bar">
                            <div
                                className="progress-fill lectures"
                                style={{ width: `${lecturePercentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* DSA Progress */}
                <div className="progress-card glass-card">
                    <div className="progress-card-header">
                        <div className="progress-card-icon dsa">
                            <Code2 className="w-5 h-5" />
                        </div>
                        <div className="progress-card-info">
                            <h4>DSA Questions</h4>
                            <p className="progress-sublabel">Practice problems</p>
                        </div>
                    </div>
                    <div className="progress-stats">
                        <div className="progress-numbers">
                            <span className="progress-current">{solvedQuestions}</span>
                            <span className="progress-total">/ {totalQuestions}</span>
                        </div>
                        <span className="progress-badge dsa">{dsaPercentage}%</span>
                    </div>
                    <div className="progress-bar-wrapper">
                        <div className="progress-bar">
                            <div
                                className="progress-fill dsa"
                                style={{ width: `${dsaPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Streak Card */}
                <div className="progress-card glass-card streak-card">
                    <div className="progress-card-header">
                        <div className="progress-card-icon streak">
                            <Flame className="w-5 h-5" />
                        </div>
                        <div className="progress-card-info">
                            <h4>Consistency</h4>
                            <p className="progress-sublabel">Current month</p>
                        </div>
                    </div>
                    <div className="streak-stats">
                        <span className="streak-number">{activeDaysInMonth}</span>
                        <span className="streak-label">active days</span>
                    </div>
                </div>
            </div>

            {/* Planner & Quick Access Section */}
            <div className="planner-section glass-card mb-6 p-6 h-20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-orange-500/20 text-orange-400">
                            <PenTool size={28} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Daily Planner & Notes</h3>
                            <p className="text-slate-400 text-sm">Manage your tasks and keep track of your journey</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => {
                                // Open today
                                const today = new Date();
                                const y = today.getFullYear();
                                const m = String(today.getMonth() + 1).padStart(2, '0');
                                const d = String(today.getDate()).padStart(2, '0');
                                setSelectedDate(`${y}-${m}-${d}`);
                            }}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium text-sm"
                        >
                            <PlusCircle size={18} />
                            Open Today's Plan
                        </button>

                        <button
                            onClick={() => setHistoryOpen(true)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors font-medium text-sm"
                        >
                            <HistoryIcon size={18} />
                            View History
                        </button>
                    </div>
                </div>
            </div>

            {/* Goal & Pacing Section */}
            {daysInfo ? (
                <div className="goal-section glass-card">
                    <div className="goal-header">
                        <div className="goal-icon">
                            <Target className="w-6 h-6" />
                        </div>
                        <div className="goal-info">
                            <h3>3-Month Goal Progress</h3>
                            <p>{formatDate(daysInfo.start)} → {formatDate(daysInfo.end)}</p>
                        </div>
                    </div>

                    <div className="goal-stats">
                        <div className="goal-stat">
                            <span className="goal-stat-value">{daysInfo.daysPassed}</span>
                            <span className="goal-stat-label">Days Passed</span>
                        </div>
                        <div className="goal-stat">
                            <span className="goal-stat-value accent">{daysInfo.daysRemaining}</span>
                            <span className="goal-stat-label">Days Left</span>
                        </div>
                        <div className="goal-stat">
                            <span className="goal-stat-value">{pacingInfo?.lecturesPerDay}</span>
                            <span className="goal-stat-label">Lectures/Day</span>
                        </div>
                        <div className="goal-stat">
                            <span className="goal-stat-value">{pacingInfo?.questionsPerDay}</span>
                            <span className="goal-stat-label">Questions/Day</span>
                        </div>
                    </div>

                    {/* Pacing Warnings */}
                    {pacingInfo && (pacingInfo.lectureDifference > 0 || pacingInfo.questionDifference > 0) && (
                        <div className="pacing-warnings">
                            {pacingInfo.lectureDifference > 0 && (
                                <div className="warning-alert">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span>
                                        <strong>{pacingInfo.lectureDifference} lectures behind</strong> schedule
                                    </span>
                                </div>
                            )}
                            {pacingInfo.questionDifference > 0 && (
                                <div className="warning-alert">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span>
                                        <strong>{pacingInfo.questionDifference} questions behind</strong> schedule
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="start-card glass-card">
                    <div className="start-card-content">
                        <Clock className="w-16 h-16 text-slate-600" />
                        <h3>Set Your Start Date</h3>
                        <p>Begin your 3-month placement preparation journey</p>
                        <div className="start-date-input">
                            <Calendar className="w-5 h-5" />
                            <input
                                type="date"
                                value={data.startDate || ''}
                                onChange={handleStartDateChange}
                                className="date-input"
                            />
                        </div>
                    </div>
                </div>
            )}

            {data.startDate && (
                <div className="date-change-section">
                    <div className="date-change-input">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="date-change-label">Change Start Date:</span>
                        <input
                            type="date"
                            value={data.startDate}
                            onChange={handleStartDateChange}
                            className="date-input-small"
                        />
                    </div>
                </div>
            )}

            {/* Daily Details Modal */}
            {selectedDate && (
                <DayDetails
                    dateStr={selectedDate}
                    onClose={() => setSelectedDate(null)}
                    note={data.dailyNotes?.[selectedDate]}
                    todos={data.dailyTodos?.[selectedDate]}
                    onUpdateNote={updateDailyNote}
                    onAddTodo={addDailyTodo}
                    onToggleTodo={toggleDailyTodo}
                    onDeleteTodo={deleteDailyTodo}
                />
            )}

            {/* History Modal */}
            {historyOpen && (
                <NoteHistory
                    data={data}
                    onClose={() => setHistoryOpen(false)}
                    onSelectDate={(date) => {
                        setSelectedDate(date);
                        setHistoryOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default Dashboard;
