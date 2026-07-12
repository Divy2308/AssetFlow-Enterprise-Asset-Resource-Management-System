import React, { useState } from 'react';
import { MailIcon, EyeIcon, EyeOffIcon, LockIcon } from '../components/Icons';

// Self-contained UserPlusIcon for the signup card
const UserPlusIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="16" y1="11" x2="22" y2="11" />
  </svg>
);

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate login delay
    setTimeout(() => {
      setIsSubmitting(false);
      onLogin();
    }, 1000);
  };

  const handleCreateAccount = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Creating employee account... logging you in.');
      onLogin();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-50/40 via-white to-orange-100/30 flex flex-col items-center justify-center p-4 z-[9999] overflow-y-auto">
      {/* Background decoration grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Login Card Wrapper */}
      <div className="relative w-full max-w-md bg-white border border-border-color/60 rounded-[2rem] shadow-xl p-8 flex flex-col gap-6 animate-in fade-in duration-300">

        {/* 1. Header Brand Logo */}
        <div className="flex items-center gap-2 justify-center select-none">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="#FF5A1F" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M12 22V12" stroke="#FF5A1F" strokeWidth="2.5" />
            <path d="M12 12L3 7" stroke="#FF5A1F" strokeWidth="2.5" />
            <path d="M12 12l9-5" stroke="#FF5A1F" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="3" fill="#FF5A1F" />
          </svg>
          <span className="font-heading text-2xl font-black text-text-primary tracking-tight">
            Asset<span className="text-primary-orange">Flow</span>
          </span>
        </div>

        {/* 2. Welcome Back Title Block */}
        <div className="flex flex-col gap-1.5 text-center">
          <h2 className="font-heading text-xl font-extrabold text-text-primary">
            Welcome back!
          </h2>
          <p className="text-xs font-semibold text-text-secondary">
            Sign in to access your AssetFlow admin dashboard
          </p>
        </div>

        {/* 3. Circular AF Avatar Badge */}
        <div className="flex justify-center select-none">
          <div className="w-20 h-20 rounded-full bg-primary-orange-light border border-primary-orange-border/30 flex items-center justify-center shadow-xs">
            <span className="font-heading text-xl font-black text-primary-orange">
              AF
            </span>
          </div>
        </div>

        {/* 4. Form inputs */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email field */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[11px] font-bold text-text-primary tracking-wide">
              Email
            </label>
            <div className="relative h-11">
              <span className="absolute left-4 top-3.5 text-text-secondary">
                <MailIcon size={16} />
              </span>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                className="w-full h-full border border-border-color bg-white pl-11 pr-4 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary-orange text-text-primary placeholder:text-text-muted"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[11px] font-bold text-text-primary tracking-wide">
              Password
            </label>
            <div className="relative h-11">
              <span className="absolute left-4 top-3.5 text-text-secondary">
                <LockIcon size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="**********"
                value={password}
                className="w-full h-full border border-border-color bg-white pl-11 pr-11 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary-orange text-text-primary placeholder:text-text-muted"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-4 top-3 text-text-secondary hover:text-text-primary transition cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <button
                type="button"
                className="text-xs font-bold text-primary-orange hover:text-primary-orange-hover transition cursor-pointer"
                onClick={() => alert('Forgot password link clicked (simulated).')}
              >
                Forgot password?
              </button>
            </div>
          </div>

          {/* Sign In submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-orange hover:bg-primary-orange-hover text-white text-xs font-extrabold py-3.5 px-6 rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-2 mt-1 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin-custom w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* 5. Horizontal Line "or" divider */}
        <div className="flex items-center justify-center my-1 select-none">
          <div className="border-t border-border-color flex-grow" />
          <span className="text-[10px] font-bold text-text-secondary uppercase px-3 select-none">
            or
          </span>
          <div className="border-t border-border-color flex-grow" />
        </div>

        {/* 6. New here? signup block */}
        <div className="flex flex-col gap-4">
          <div className="text-left select-none">
            <h4 className="text-[11px] font-extrabold text-text-primary tracking-wide mb-2">
              New here?
            </h4>

            {/* Outlined Info Box */}
            <div className="border border-primary-orange-border/20 bg-primary-orange-light p-4 rounded-2xl flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#FFF4EF] flex items-center justify-center text-primary-orange shrink-0">
                <UserPlusIcon size={18} />
              </div>
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-xs font-bold text-text-primary">
                  Create your admin account
                </span>
                <span className="text-[10px] font-semibold text-text-secondary leading-relaxed">
                  Sign up to create an employee account. Admin roles will be assigned later.
                </span>
              </div>
            </div>
          </div>

          {/* Action button: Create Account */}
          <button
            type="button"
            className="w-full bg-primary-orange hover:bg-primary-orange-hover text-white text-xs font-extrabold py-3.5 px-6 rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
            onClick={handleCreateAccount}
            disabled={isSubmitting}
          >
            Create Account
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

      </div>

      {/* 7. Footer below the card */}
      <footer className="flex flex-col items-center gap-2 mt-6 text-[11px] font-bold text-text-secondary select-none">
        <div>&copy; 2025 AssetFlow. All rights reserved.</div>
        <div className="flex gap-4 text-primary-orange">
          <a href="#privacy" className="hover:text-primary-orange-hover transition-all">Privacy Policy</a>
          <span className="text-text-muted font-normal">|</span>
          <a href="#terms" className="hover:text-primary-orange-hover transition-all">Terms of Service</a>
        </div>
      </footer>

    </div>
  );
}
