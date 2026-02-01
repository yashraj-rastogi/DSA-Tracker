import { useState } from 'react';
import { Sparkles, Mail, Lock, User, ArrowRight, Check, Chrome, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, signup, loginWithGoogle, continueAsGuest } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Validation
        if (!email || !password || (!isLogin && !name)) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        let result;
        if (isLogin) {
            result = await login(email, password);
        } else {
            result = await signup(name, email, password);
        }

        if (!result.success) {
            setError(result.error);
        }

        setIsLoading(false);
    };

    const handleGoogleLogin = async () => {
        setError('');
        setIsLoading(true);
        const result = await loginWithGoogle();
        if (!result.success) {
            setError(result.error);
        }
        setIsLoading(false);
    };

    const handleGuestMode = () => {
        continueAsGuest();
    };

    const features = [
        'Track your placement prep progress',
        'Monitor lecture completion',
        'DSA question tracking',
        'Consistency calendar',
    ];

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Side - Branding */}
                <div className="auth-branding">
                    <div className="auth-branding-content">
                        <div className="auth-logo">
                            <div className="auth-logo-icon">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <span className="auth-logo-text">PrepTracker</span>
                        </div>

                        <h1 className="auth-tagline">
                            Plan your tasks<br />
                            and increase<br />
                            productivity
                        </h1>

                        <div className="auth-features">
                            {features.map((feature, index) => (
                                <div key={index} className="auth-feature">
                                    <div className="auth-feature-icon">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="auth-decoration">
                            <div className="decoration-circle decoration-circle-1"></div>
                            <div className="decoration-circle decoration-circle-2"></div>
                            <div className="decoration-path"></div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="auth-form-container">
                    <div className="auth-form-wrapper">
                        <div className="auth-form-header">
                            <h2 className="auth-form-title">
                                {isLogin ? 'Welcome back' : 'Create account'}
                            </h2>
                            <p className="auth-form-subtitle">
                                {isLogin
                                    ? 'Sign in to continue your prep journey'
                                    : 'Start your placement prep today'}
                            </p>
                        </div>

                        {/* Social Login Buttons */}
                        <div className="auth-social-buttons">
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="auth-social-btn auth-google-btn"
                            >
                                <Chrome className="w-5 h-5" />
                                <span>Continue with Google</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleGuestMode}
                                disabled={isLoading}
                                className="auth-social-btn auth-guest-btn"
                            >
                                <UserCircle className="w-5 h-5" />
                                <span>Continue as Guest</span>
                            </button>
                        </div>

                        <div className="auth-divider">
                            <span>or continue with email</span>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            {!isLogin && (
                                <div className="auth-input-group">
                                    <label className="auth-label">Full Name</label>
                                    <div className="auth-input-wrapper">
                                        <User className="auth-input-icon" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your name"
                                            className="auth-input"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="auth-input-group">
                                <label className="auth-label">Email</label>
                                <div className="auth-input-wrapper">
                                    <Mail className="auth-input-icon" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="auth-input"
                                    />
                                </div>
                            </div>

                            <div className="auth-input-group">
                                <label className="auth-label">Password</label>
                                <div className="auth-input-wrapper">
                                    <Lock className="auth-input-icon" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="auth-input"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="auth-error">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="auth-submit-btn"
                                disabled={isLoading}
                            >
                                <span>{isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
                                {!isLoading && <ArrowRight className="w-5 h-5" />}
                            </button>
                        </form>

                        <div className="auth-switch">
                            <span className="auth-switch-text">
                                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                            </span>
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                }}
                                className="auth-switch-btn"
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
