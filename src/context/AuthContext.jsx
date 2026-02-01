import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const USERS_KEY = 'prep-tracker-users';
const CURRENT_USER_KEY = 'prep-tracker-current-user';

const getStoredUsers = () => {
    try {
        const stored = localStorage.getItem(USERS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveStoredUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Get initial user from localStorage (runs synchronously before render)
const getInitialUser = () => {
    const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUserId) {
        const users = getStoredUsers();
        const existingUser = users.find(u => u.id === currentUserId);
        if (existingUser) {
            return existingUser;
        }
    }
    return null;
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(getInitialUser);

    const signup = useCallback((name, email, password) => {
        const users = getStoredUsers();

        // Check if user already exists
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, error: 'Email already registered' };
        }

        const newUser = {
            id: `user-${Date.now()}`,
            name,
            email: email.toLowerCase(),
            password, // In production, this should be hashed
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        saveStoredUsers(users);

        localStorage.setItem(CURRENT_USER_KEY, newUser.id);
        setUser(newUser);

        return { success: true };
    }, []);

    const login = useCallback((email, password) => {
        const users = getStoredUsers();
        const existingUser = users.find(
            u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!existingUser) {
            return { success: false, error: 'Invalid email or password' };
        }

        localStorage.setItem(CURRENT_USER_KEY, existingUser.id);
        setUser(existingUser);

        return { success: true };
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(CURRENT_USER_KEY);
        setUser(null);
    }, []);

    const value = useMemo(() => ({
        user,
        loading: false, // No longer needed since we initialize synchronously
        login,
        signup,
        logout,
        isAuthenticated: !!user,
    }), [user, login, signup, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
