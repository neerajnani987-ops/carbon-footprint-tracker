import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Leaf, Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const { resetPassword, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    setSuccess(false);

    if (!email) {
      setLocalError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isSent = await resetPassword(email);
      if (isSent) {
        setSuccess(true);
      }
    } catch {
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
            <span className="font-outfit font-black text-2xl tracking-wider text-white">
              EcoTrace
            </span>
          </Link>
          <p className="text-eco-muted text-sm text-center">
            Recover your account password to continue logging eco-savings.
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-8 border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <Link
              to="/signin"
              className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-eco-muted hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h2 className="font-outfit font-bold text-xl text-white">Reset Password</h2>
          </div>

          {success ? (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-12 h-12 bg-eco-green/10 rounded-full flex items-center justify-center mb-4 border border-eco-green/20">
                <CheckCircle className="w-6 h-6 text-eco-green" />
              </div>
              <h3 className="font-outfit font-bold text-white text-lg mb-2">Instructions Sent</h3>
              <p className="text-xs text-eco-muted leading-relaxed mb-6">
                If an account exists for <strong className="text-white">{email}</strong>, we have
                sent password reset instructions to that address.
              </p>
              <Link
                to="/signin"
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-outfit font-semibold rounded-xl text-sm transition-all"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {/* Form validations error */}
              {(localError || error) && (
                <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400 text-sm leading-relaxed items-start">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{localError || error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-xs font-semibold text-eco-muted uppercase tracking-wider"
                  >
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full py-3.5 bg-eco-green hover:bg-eco-emerald disabled:bg-eco-green/50 text-white font-outfit font-bold rounded-xl shadow-lg shadow-eco-green/10 transition-all flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Send Reset Code'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
