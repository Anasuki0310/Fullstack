import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useRole } from '../contexts/RoleContext';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { setRole } = useRole();
  const { signInWithGoogle, setManualUser } = useAuth();

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedEmail = email.trim();

    // Validate input fields
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setManualUser(trimmedEmail);

    // Hardcoded mock authentication for testing roles
    if (trimmedEmail === 'bimcub12345@cmu.ac.th' && password === '123456') {
      setRole('admin');
      navigate('/dashboard');
    } else {
      setRole('student');
      navigate('/tickets');
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMessage('');
    
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        navigate('/tickets');
      } else {
        setErrorMessage(result.error || 'Failed to sign in with Google.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google OAuth sign-in encountered an error.';
      setErrorMessage(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans text-slate-900">
      {/* Left Side: Image & Branding */}
      <div className="hidden md:flex md:w-1/2 relative bg-[#0A3D91] items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="University Campus"
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A3D91] to-transparent opacity-80"></div>
        
        <div className="relative z-10 px-12 lg:px-24 flex flex-col justify-center h-full w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white/10 p-4 rounded-xl inline-flex mb-8 backdrop-blur-md border border-white/20 shadow-xl">
              <Building2 className="text-white w-10 h-10" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
              Maintain Our <br />Campus Together
            </h1>
            <p className="text-blue-100 text-lg lg:text-xl max-w-md leading-relaxed font-light">
              Quickly report issues and track requests to ensure our university remains a pristine environment for learning and growth.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Login Container */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-white md:bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md bg-white md:rounded-2xl md:shadow-xl md:shadow-blue-900/5 md:border md:border-slate-100 p-8 lg:p-10 flex flex-col"
        >
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              Sign In to CampusFix
            </h2>
            <p className="text-slate-500 text-sm">
              Enter your credentials to access maintenance services.
            </p>
          </div>

          {/* 1. Social Login Section */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 transition-colors disabled:opacity-75 cursor-pointer"
          >
            {isGoogleLoading ? (
              <div className="flex items-center gap-2 text-slate-600">
                <Loader2 className="w-5 h-5 animate-spin text-[#0A3D91]" />
                <span>Authorizing with Google...</span>
              </div>
            ) : (
              <>
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 mr-3">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          {/* 2. Divider */}
          <div className="relative flex py-6 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase tracking-wider font-medium">OR continue with email</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Error message alert */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 3. Manual Login Section */}
          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="student@cmu.ac.th"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] sm:text-sm transition-all outline-none placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] sm:text-sm transition-all outline-none placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end pt-1">
              <a href="#" className="text-sm font-medium text-[#0A3D91] hover:text-blue-800 transition-colors">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0A3D91] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A3D91] transition-colors mt-2"
            >
              Log In
            </button>
          </form>

          {/* 4. Registration Section */}
          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500">Don't have an account? </span>
            <a href="#" className="font-medium text-[#0A3D91] hover:text-blue-800 transition-colors">
              Register Here
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
