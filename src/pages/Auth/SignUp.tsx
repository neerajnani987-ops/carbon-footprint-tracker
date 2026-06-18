import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf, Eye, EyeOff, Lock, Mail, User, AlertCircle } from 'lucide-react';

const SignUp: React.FC = () => {
  const { signUp, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!name || !email || !password || !confirmPassword) {
      setLocalError('Please fill out all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await signUp(name, email, password);
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
            Create an account to start calculating and reducing your carbon footprint.
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-8 border border-white/5">
          <h2 className="font-outfit font-bold text-xl text-white mb-6">Create Account</h2>

          {/* Form validations error */}
          {(localError || error) && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400 text-sm leading-relaxed items-start">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{localError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-eco-muted uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-eco-muted">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-eco-green/40 focus:bg-white/10 text-white placeholder-eco-muted/50 focus:outline-none transition-all text-sm font-outfit"
                  placeholder="Eco Citizen"
                  required
                />
              </div>
            </div>

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
              <label htmlFor="password" className="text-xs font-semibold text-eco-muted uppercase tracking-wider">
                Password
              </label>
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

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-eco-muted uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-eco-muted">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-eco-green/40 focus:bg-white/10 text-white placeholder-eco-muted/50 focus:outline-none transition-all text-sm font-outfit"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 w-full py-3.5 bg-eco-green hover:bg-eco-emerald disabled:bg-eco-green/50 text-white font-outfit font-bold rounded-xl shadow-lg shadow-eco-green/10 transition-all flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-eco-muted font-outfit">
            Already have an account?{' '}
            <Link to="/signin" className="text-eco-green hover:text-eco-accent font-bold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
