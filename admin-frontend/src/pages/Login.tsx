import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import './Login.css';

export const Login: React.FC = () => {
    const { login } = useAuth();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            await login({ phone, password });
            window.location.href = '/';
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-split-container">
            <div className="login-image-side" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2000')" }}>
                <div className="login-image-overlay">
                    <div className="brand-logo-large animate-fade-in">
                        <span className="brand-logo-dot-xl" />
                        SPEEDCOPY
                    </div>
                    <h2 className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        The central nervous system for your operations.
                    </h2>
                    <p className="login-hero-text animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        Manage hubs, vendors, and orders seamlessly from one powerful dashboard.
                    </p>
                </div>
            </div>

            <div className="login-form-side">
                <div className="login-form-wrapper animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="login-header">
                        <h2>Welcome back</h2>
                        <p>Sign in to the Admin Console</p>
                    </div>
                    
                    {error && <div className="login-error">{error}</div>}
                    
                    <form onSubmit={handleSubmit} className="login-form">
                        <Input 
                            label="Phone Number" 
                            type="tel" 
                            placeholder="+919876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            autoFocus
                        />
                        
                        <Input 
                            label="Password" 
                            type="password" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        
                        <Button 
                            type="submit" 
                            className="login-submit-btn" 
                            size="lg"
                            isLoading={isLoading}
                        >
                            Sign In to Console
                        </Button>
                    </form>
                    
                    <div className="login-footer">
                        Protected by SpeedCopy Security
                    </div>
                </div>
            </div>
        </div>
    );
};
