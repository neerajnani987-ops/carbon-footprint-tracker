import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

const SignIn: React.FC = () => {
  const { signIn, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please fill out all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await signIn(email, password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setLocalError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050c09] text-eco-text flex flex-col items-center justify-center p-6 relative font-jakarta">
      {/* Background glow effects */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-3">
            <div className="p-2.5 bg-eco-green/10 rounded-xl">
              <Leaf className="w-8 h-8 text-eco-green" />
            </div>
            <span className="font-outfit font-black text-2xl tracking-wider text-white">EcoTrace</span>
          </Link>
          <p className="text-eco-muted text-sm text-center">
            Sign in to track your carbon score and manage daily eco-savings.
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-8 border border-white/5">
          <h2 className="font-outfit font-bold text-xl text-white mb-6">Welcome Back</h2>

          {/* Fallback info alert */}
          <div className="mb-6 p-3 bg-eco-green/10 border border-eco-green/20 rounded-xl text-xs text-eco-green leading-relaxed">
            <strong>Demo Account:</strong><br />
            Email: <code className="bg-black/35 px-1 py-0.5 rounded text-white select-all">eco@citizen.com</code><br />
            Password: <code className="bg-black/35 px-1 py-0.5 rounded text-white select-all">sustainability</code>
          </div>

          {/* Form validations error */}
          {(localError || error) && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400 text-sm leading-relaxed items-start">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{localError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-eco-muted uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-eco-muted">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-eco-green/40 focus:bg-white/10 text-white placeholder-eco-muted/50 focus:outline-none transition-all text-sm font-outfit"
                  placeholder="name@domain.com"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-semibold text-eco-muted uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-eco-green hover:text-eco-accent transition-all font-outfit font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-eco-muted">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-eco-green/40 focus:bg-white/10 text-white placeholder-eco-muted/50 focus:outline-none transition-all text-sm font-outfit"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-eco-muted hover:text-white transition-all"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full py-3.5 bg-eco-green hover:bg-eco-emerald disabled:bg-eco-green/50 text-white font-outfit font-bold rounded-xl shadow-lg shadow-eco-green/10 transition-all flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-eco-muted font-outfit">
            Don't have an account?{' '}
            <Link to="/signup" className="text-eco-green hover:text-eco-accent font-bold">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
