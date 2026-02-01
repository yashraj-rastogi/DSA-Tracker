import { useState, useEffect } from 'react';

const getStorageKey = (userId) => `placement-prep-tracker-${userId || 'guest'}`;

const getInitialState = (userId) => {
    const stored = localStorage.getItem(getStorageKey(userId));
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            // Migrate old data structure if needed
            if (!parsed.dailyLectures) parsed.dailyLectures = {};
            if (!parsed.dailyQuestions) parsed.dailyQuestions = {};
            if (!parsed.dailyNotes) parsed.dailyNotes = {};
            if (!parsed.dailyTodos) parsed.dailyTodos = {};
            return parsed;
        } catch (e) {
            console.error('Error parsing stored data:', e);
        }
    }
    return {
        startDate: null,
        completedLectures: [],
        dsaProgress: {},
        activityDates: [],
        dailyLectures: {},  // { "2026-01-30": 3, ... } - lectures completed per day
        dailyQuestions: {}, // { "2026-01-30": 5, ... } - questions solved per day
    };
};

export const useLocalStorage = (userId = null) => {
    const [data, setData] = useState(() => getInitialState(userId));

    // Update data when userId changes
    useEffect(() => {
        setData(getInitialState(userId));
    }, [userId]);

    useEffect(() => {
        localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
    }, [data, userId]);

    const setStartDate = (date) => {
        setData((prev) => ({ ...prev, startDate: date }));
    };

    const toggleLecture = (lectureId) => {
        const today = new Date().toISOString().split('T')[0];
        setData((prev) => {
            const wasCompleted = prev.completedLectures.includes(lectureId);
            const completed = wasCompleted
                ? prev.completedLectures.filter((id) => id !== lectureId)
                : [...prev.completedLectures, lectureId];

            const activityDates = prev.activityDates.includes(today)
                ? prev.activityDates
                : [...prev.activityDates, today];

            // Track daily lecture completions
            const dailyLectures = { ...prev.dailyLectures };
            const currentCount = dailyLectures[today] || 0;
            dailyLectures[today] = wasCompleted
                ? Math.max(0, currentCount - 1)
                : currentCount + 1;

            return { ...prev, completedLectures: completed, activityDates, dailyLectures };
        });
    };

    const updateDSAStatus = (questionId, status) => {
        const today = new Date().toISOString().split('T')[0];
        setData((prev) => {
            const prevStatus = prev.dsaProgress[questionId] || 'unsolved';
            const activityDates = prev.activityDates.includes(today)
                ? prev.activityDates
                : [...prev.activityDates, today];

            // Track daily question solves
            const dailyQuestions = { ...prev.dailyQuestions };
            const currentCount = dailyQuestions[today] || 0;

            // Only count when changing to/from solved status
            if (status === 'solved' && prevStatus !== 'solved') {
                dailyQuestions[today] = currentCount + 1;
            } else if (status !== 'solved' && prevStatus === 'solved') {
                dailyQuestions[today] = Math.max(0, currentCount - 1);
            }

            return {
                ...prev,
                dsaProgress: { ...prev.dsaProgress, [questionId]: status },
                activityDates,
                dailyQuestions,
            };
        });
    };

    const getDSAStatus = (questionId) => {
        return data.dsaProgress[questionId] || 'unsolved';
    };

    const getSolvedCount = () => {
        return Object.values(data.dsaProgress).filter((s) => s === 'solved').length;
    };

    const getWeeklyData = () => {
        const today = new Date();
        const weekData = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Get the start of the week (Monday)
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday start
        startOfWeek.setDate(today.getDate() - diff);

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            weekData.push({
                day: dayNames[date.getDay()],
                date: dateStr,
                lectures: data.dailyLectures?.[dateStr] || 0,
                questions: data.dailyQuestions?.[dateStr] || 0,
                isToday: date.toDateString() === today.toDateString(),
            });
        }

        return weekData;
    };

    const resetData = () => {
        setData({
            startDate: null,
            completedLectures: [],
            dsaProgress: {},
            activityDates: [],
            dailyLectures: {},
            dailyQuestions: {},
            dailyNotes: {},     // { "2026-01-30": "My summary..." }
            dailyTodos: {},     // { "2026-01-30": [{ id: 1706600, text: "Revise Graph", completed: false }] }
        });
    };

    const updateDailyNote = (dateStr, note) => {
        setData(prev => ({
            ...prev,
            dailyNotes: { ...prev.dailyNotes, [dateStr]: note }
        }));
    };

    const addDailyTodo = (dateStr, text) => {
        const newTodo = { id: Date.now(), text, completed: false };
        setData(prev => {
            const currentTodos = prev.dailyTodos[dateStr] || [];
            return {
                ...prev,
                dailyTodos: { ...prev.dailyTodos, [dateStr]: [...currentTodos, newTodo] }
            };
        });
    };

    const toggleDailyTodo = (dateStr, todoId) => {
        setData(prev => {
            const currentTodos = prev.dailyTodos[dateStr] || [];
            const updatedTodos = currentTodos.map(todo =>
                todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
            );
            return {
                ...prev,
                dailyTodos: { ...prev.dailyTodos, [dateStr]: updatedTodos }
            };
        });
    };

    const deleteDailyTodo = (dateStr, todoId) => {
        setData(prev => {
            const currentTodos = prev.dailyTodos[dateStr] || [];
            const updatedTodos = currentTodos.filter(todo => todo.id !== todoId);
            return {
                ...prev,
                dailyTodos: { ...prev.dailyTodos, [dateStr]: updatedTodos }
            };
        });
    };

    return {
        data,
        setStartDate,
        toggleLecture,
        updateDSAStatus,
        getDSAStatus,
        getSolvedCount,
        getWeeklyData,
        getWeeklyData,
        resetData,
        updateDailyNote,
        addDailyTodo,
        toggleDailyTodo,
        deleteDailyTodo,
    };
};

export default useLocalStorage;
