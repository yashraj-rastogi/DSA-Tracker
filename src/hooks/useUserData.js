import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

const getLocalStorageKey = (userId) => `placement-prep-tracker-${userId || 'guest'}`;

const getDefaultData = () => ({
    startDate: null,
    completedLectures: [],
    dsaProgress: {},
    activityDates: [],
    dailyLectures: {},
    dailyQuestions: {},
    dailyNotes: {},
    dailyTodos: {},
});

const getLocalData = (userId) => {
    const stored = localStorage.getItem(getLocalStorageKey(userId));
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
    return getDefaultData();
};

const saveLocalData = (userId, data) => {
    localStorage.setItem(getLocalStorageKey(userId), JSON.stringify(data));
};

export const useUserData = () => {
    const { user, isGuest } = useAuth();
    const [data, setData] = useState(getDefaultData());
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const syncTimeoutRef = useRef(null);
    const isInitializedRef = useRef(false);

    // Load data on mount or user change
    useEffect(() => {
        let unsubscribe = null;
        isInitializedRef.current = false;

        const loadData = async () => {
            setLoading(true);

            if (!user) {
                // Not logged in, use guest data
                setData(getLocalData('guest'));
                setLoading(false);
                isInitializedRef.current = true;
                return;
            }

            if (isGuest) {
                // Guest mode - localStorage only
                setData(getLocalData('guest'));
                setLoading(false);
                isInitializedRef.current = true;
                return;
            }

            // Authenticated user - sync with Firestore
            try {
                const userDocRef = doc(db, 'users', user.id, 'data', 'progress');
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    // User has cloud data
                    const cloudData = docSnap.data();
                    setData(cloudData);
                    saveLocalData(user.id, cloudData);
                } else {
                    // First time user - check for existing local data to migrate
                    const localData = getLocalData('guest');
                    const hasLocalData = localData.completedLectures.length > 0 ||
                        Object.keys(localData.dsaProgress).length > 0;

                    if (hasLocalData) {
                        // Migrate local data to cloud
                        await setDoc(userDocRef, localData);
                        setData(localData);
                        saveLocalData(user.id, localData);
                    } else {
                        // Start fresh
                        const defaultData = getDefaultData();
                        await setDoc(userDocRef, defaultData);
                        setData(defaultData);
                    }
                }

                // Set up real-time listener for cloud changes
                unsubscribe = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists() && isInitializedRef.current) {
                        const cloudData = docSnap.data();
                        setData(cloudData);
                        saveLocalData(user.id, cloudData);
                    }
                });

            } catch (error) {
                console.error('Error loading data from Firestore:', error);
                // Fallback to local data
                setData(getLocalData(user.id));
            }

            setLoading(false);
            isInitializedRef.current = true;
        };

        loadData();

        return () => {
            if (unsubscribe) unsubscribe();
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        };
    }, [user, isGuest]);

    // Debounced sync to Firestore
    const syncToCloud = useCallback(async (newData) => {
        if (!user || isGuest) return;

        setSyncing(true);
        try {
            const userDocRef = doc(db, 'users', user.id, 'data', 'progress');
            await setDoc(userDocRef, newData);
        } catch (error) {
            console.error('Error syncing to Firestore:', error);
        }
        setSyncing(false);
    }, [user, isGuest]);

    const updateData = useCallback((updater) => {
        setData((prev) => {
            const newData = typeof updater === 'function' ? updater(prev) : updater;

            // Save to localStorage immediately
            const userId = user?.id || 'guest';
            saveLocalData(userId, newData);

            // Debounced sync to cloud (only for authenticated users)
            if (user && !isGuest && isInitializedRef.current) {
                if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
                syncTimeoutRef.current = setTimeout(() => syncToCloud(newData), 1000);
            }

            return newData;
        });
    }, [user, isGuest, syncToCloud]);

    // Helper functions
    const setStartDate = useCallback((date) => {
        updateData((prev) => ({ ...prev, startDate: date }));
    }, [updateData]);

    const toggleLecture = useCallback((lectureId) => {
        const today = new Date().toISOString().split('T')[0];
        updateData((prev) => {
            const wasCompleted = prev.completedLectures.includes(lectureId);
            const completed = wasCompleted
                ? prev.completedLectures.filter((id) => id !== lectureId)
                : [...prev.completedLectures, lectureId];

            const activityDates = prev.activityDates.includes(today)
                ? prev.activityDates
                : [...prev.activityDates, today];

            const dailyLectures = { ...prev.dailyLectures };
            const currentCount = dailyLectures[today] || 0;
            dailyLectures[today] = wasCompleted
                ? Math.max(0, currentCount - 1)
                : currentCount + 1;

            return { ...prev, completedLectures: completed, activityDates, dailyLectures };
        });
    }, [updateData]);

    const updateDSAStatus = useCallback((questionId, status) => {
        const today = new Date().toISOString().split('T')[0];
        updateData((prev) => {
            const prevStatus = prev.dsaProgress[questionId] || 'unsolved';
            const activityDates = prev.activityDates.includes(today)
                ? prev.activityDates
                : [...prev.activityDates, today];

            const dailyQuestions = { ...prev.dailyQuestions };
            const currentCount = dailyQuestions[today] || 0;

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
    }, [updateData]);

    const getDSAStatus = useCallback((questionId) => {
        return data.dsaProgress[questionId] || 'unsolved';
    }, [data.dsaProgress]);

    const getSolvedCount = useCallback(() => {
        return Object.values(data.dsaProgress).filter((s) => s === 'solved').length;
    }, [data.dsaProgress]);

    const getWeeklyData = useCallback(() => {
        const today = new Date();
        const weekData = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
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
    }, [data.dailyLectures, data.dailyQuestions]);

    const resetData = useCallback(() => {
        const defaultData = getDefaultData();
        updateData(defaultData);
    }, [updateData]);

    const updateDailyNote = useCallback((dateStr, note) => {
        updateData((prev) => ({
            ...prev,
            dailyNotes: { ...prev.dailyNotes, [dateStr]: note }
        }));
    }, [updateData]);

    const addDailyTodo = useCallback((dateStr, text) => {
        const newTodo = { id: Date.now(), text, completed: false };
        updateData((prev) => {
            const currentTodos = prev.dailyTodos[dateStr] || [];
            return {
                ...prev,
                dailyTodos: { ...prev.dailyTodos, [dateStr]: [...currentTodos, newTodo] }
            };
        });
    }, [updateData]);

    const toggleDailyTodo = useCallback((dateStr, todoId) => {
        updateData((prev) => {
            const currentTodos = prev.dailyTodos[dateStr] || [];
            const updatedTodos = currentTodos.map((todo) =>
                todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
            );
            return {
                ...prev,
                dailyTodos: { ...prev.dailyTodos, [dateStr]: updatedTodos }
            };
        });
    }, [updateData]);

    const deleteDailyTodo = useCallback((dateStr, todoId) => {
        updateData((prev) => {
            const currentTodos = prev.dailyTodos[dateStr] || [];
            const updatedTodos = currentTodos.filter((todo) => todo.id !== todoId);
            return {
                ...prev,
                dailyTodos: { ...prev.dailyTodos, [dateStr]: updatedTodos }
            };
        });
    }, [updateData]);

    return {
        data,
        loading,
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
    };
};

export default useUserData;
