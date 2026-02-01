import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword as firebaseSignIn,
    createUserWithEmailAndPassword as firebaseSignUp,
    signInWithPopup,
    signOut as firebaseSignOut,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Get additional user data from Firestore
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                const userData = userDoc.exists() ? userDoc.data() : {};

                setUser({
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || userData.name || 'User',
                    email: firebaseUser.email,
                    createdAt: userData.createdAt || new Date().toISOString(),
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signup = useCallback(async (name, email, password) => {
        try {
            const userCredential = await firebaseSignUp(auth, email, password);
            const firebaseUser = userCredential.user;

            // Update display name
            await updateProfile(firebaseUser, { displayName: name });

            // Create user document in Firestore
            await setDoc(doc(db, 'users', firebaseUser.uid), {
                name,
                email: email.toLowerCase(),
                createdAt: new Date().toISOString(),
            });

            return { success: true };
        } catch (error) {
            let errorMessage = 'Signup failed';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Email already registered';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password should be at least 6 characters';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                default:
                    errorMessage = error.message;
            }
            return { success: false, error: errorMessage };
        }
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            await firebaseSignIn(auth, email, password);
            return { success: true };
        } catch (error) {
            let errorMessage = 'Login failed';
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = 'Invalid email or password';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many attempts. Try again later';
                    break;
                default:
                    errorMessage = error.message;
            }
            return { success: false, error: errorMessage };
        }
    }, []);

    const loginWithGoogle = useCallback(async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;

            // Check if user document exists, create if not
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, 'users', firebaseUser.uid), {
                    name: firebaseUser.displayName || 'User',
                    email: firebaseUser.email,
                    createdAt: new Date().toISOString(),
                });
            }

            return { success: true };
        } catch (error) {
            let errorMessage = 'Google login failed';
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Login cancelled';
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = 'Popup blocked. Please allow popups';
            }
            return { success: false, error: errorMessage };
        }
    }, []);

    const continueAsGuest = useCallback(() => {
        // Set a guest user that uses localStorage only
        setUser({
            id: 'guest',
            name: 'Guest',
            email: null,
            isGuest: true,
        });
    }, []);

    const logout = useCallback(async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, []);

    const value = useMemo(() => ({
        user,
        loading,
        login,
        signup,
        loginWithGoogle,
        continueAsGuest,
        logout,
        isAuthenticated: !!user,
        isGuest: user?.isGuest || false,
    }), [user, loading, login, signup, loginWithGoogle, continueAsGuest, logout]);

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
