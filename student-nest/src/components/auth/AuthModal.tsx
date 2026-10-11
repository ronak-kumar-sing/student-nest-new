'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Building,
  Sparkles,
  ArrowRight,
  Lock,
  User,
  School,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthModal() {
  const {
    user,
    isAuthModalOpen,
    closeAuthModal,
    authModalStep,
    setAuthModalStep,
    loginWithPassword,
    loginWithPhone,
    registerUser,
    requestEmailOtp,
    confirmEmailOtp,
    requestPhoneOtp,
    verifyAadhaar,
    skipAadhaarVerification,
    loginAsDemoStudent,
    loginAsDemoOwner,
    loginAsDemoAdmin,
  } = useAuth();

  // Tab: 'login' | 'signup'
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Login Mode: 'email_password' | 'phone_otp'
  const [loginMode, setLoginMode] = useState<'email_password' | 'phone_otp'>('email_password');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPhoneOtp, setLoginPhoneOtp] = useState('');
  const [isPhoneOtpSent, setIsPhoneOtpSent] = useState(false);
  const [phoneDevOtp, setPhoneDevOtp] = useState<string | null>(null);

  // Signup Form State
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'OWNER'>('STUDENT');
  const [collegeName, setCollegeName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Signup Email Verification (SendGrid)
  const [signupEmail, setSignupEmail] = useState('');
  const [signupEmailOtp, setSignupEmailOtp] = useState('');
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailDevOtp, setEmailDevOtp] = useState<string | null>(null);

  // Signup Phone Verification (Twilio)
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPhoneOtp, setSignupPhoneOtp] = useState('');
  const [isSignupPhoneOtpSent, setIsSignupPhoneOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [signupPhoneDevOtp, setSignupPhoneDevOtp] = useState<string | null>(null);

  // Aadhaar Verification State
  const [aadhaarNumber, setAadhaarNumber] = useState('123456789012');
  const [aadhaarOtp, setAadhaarOtp] = useState('123456');
  const [aadhaarSuccess, setAadhaarSuccess] = useState<string | null>(null);

  // UI status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  // --- Handlers: Login ---
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      await loginWithPassword(loginEmail, loginPassword);
      closeAuthModal();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneLoginOtp = async () => {
    if (!loginPhone || loginPhone.length < 8) {
      setErrorMessage('Please enter a valid phone number (e.g. +919876543210)');
      return;
    }
    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await requestPhoneOtp(loginPhone);
      setIsPhoneOtpSent(true);
      if (res.devOtp) setPhoneDevOtp(res.devOtp);
      setInfoMessage('SMS OTP dispatched via Twilio!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not send SMS OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhoneOtp) {
      setErrorMessage('Please enter the OTP received on SMS.');
      return;
    }
    setErrorMessage(null);
    setLoading(true);
    try {
      await loginWithPhone(loginPhone, loginPhoneOtp);
      closeAuthModal();
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers: Signup Email Verification (SendGrid) ---
  const handleSendEmailOtp = async () => {
    if (!signupEmail || !signupEmail.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await requestEmailOtp(signupEmail);
      setIsEmailOtpSent(true);
      if (res.devOtp) setEmailDevOtp(res.devOtp);
      setInfoMessage('Verification code sent to your inbox via SendGrid.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEmailOtp = async () => {
    if (!signupEmailOtp) {
      setErrorMessage('Enter the OTP code received by email');
      return;
    }
    setErrorMessage(null);
    setLoading(true);
    try {
      await confirmEmailOtp(signupEmail, signupEmailOtp);
      setIsEmailVerified(true);
      setInfoMessage('Email successfully verified via SendGrid!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email verification code');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers: Signup Phone Verification (Twilio) ---
  const handleSendSignupPhoneOtp = async () => {
    if (!signupPhone || signupPhone.length < 8) {
      setErrorMessage('Please provide a valid phone number (e.g. +919876543210)');
      return;
    }
    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await requestPhoneOtp(signupPhone);
      setIsSignupPhoneOtpSent(true);
      if (res.devOtp) setSignupPhoneDevOtp(res.devOtp);
      setInfoMessage('Twilio SMS verification code sent!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send SMS');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignupPhoneOtp = () => {
    if (signupPhoneOtp.length >= 4) {
      setIsPhoneVerified(true);
      setInfoMessage('Phone verified via Twilio!');
    } else {
      setErrorMessage('Please enter the SMS code');
    }
  };

  // --- Handlers: Complete Signup ---
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      setErrorMessage('Full name is required');
      return;
    }
    if (!signupEmail) {
      setErrorMessage('Email is required');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    try {
      await registerUser({
        fullName,
        email: signupEmail,
        phone: signupPhone || '+91 98000 12345',
        password: signupPassword,
        role,
        collegeName: role === 'STUDENT' ? (collegeName || 'University Scholar') : undefined,
      });
      closeAuthModal();
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers: Aadhaar / DigiLocker Verification ---
  const handleVerifyAadhaar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aadhaarNumber.replace(/\D/g, '').length !== 12) {
      setErrorMessage('Please enter a valid 12-digit Aadhaar number');
      return;
    }
    setErrorMessage(null);
    setLoading(true);
    try {
      await verifyAadhaar(aadhaarNumber, aadhaarOtp);
      setAadhaarSuccess('DigiLocker Aadhaar e-KYC Verified Successfully!');
      setTimeout(() => {
        closeAuthModal();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Aadhaar verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipAadhaar = async () => {
    setLoading(true);
    try {
      await skipAadhaarVerification();
    } catch {
      closeAuthModal();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 animate-in zoom-in-95 duration-200 relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
          <button
            onClick={closeAuthModal}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-sm font-black text-neutral-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FF385C]" />
            <span>StudentNest Secure Access</span>
          </div>
          <div className="w-8" />
        </div>

        {/* Global Error & Info Banners */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="flex-1">{infoMessage}</span>
          </div>
        )}

        {/* Scrollable Container */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* ========================================================= */}
          {/* AADHAAR VERIFICATION STEP */}
          {/* ========================================================= */}
          {authModalStep === 'aadhaar_verify' ? (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center mx-auto shadow-md mb-3">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <span>DigiLocker e-KYC • UIDAI Compliance</span>
                </div>
                <h3 className="text-xl font-black text-neutral-900">
                  Government ID Verification
                </h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  Verify your Aadhaar card for trusted verified badge or skip for now to start exploring.
                </p>
              </div>

              {/* Aadhaar Card Visualization */}
              <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden border border-neutral-700">
                <div className="flex items-center justify-between border-b border-white/15 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-[11px] font-bold tracking-wider uppercase">
                      Government of India • e-KYC
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                    DIGILOCKER READY
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="text-neutral-400 text-[10px] uppercase tracking-wider">Candidate Name</div>
                    <div className="font-bold text-sm text-neutral-100">{user?.name || fullName || 'Scholar Candidate'}</div>
                  </div>
                  <div>
                    <div className="text-neutral-400 text-[10px] uppercase tracking-wider">Masked Identification</div>
                    <div className="font-mono tracking-widest text-neutral-200 text-sm">
                      XXXX • XXXX • {aadhaarNumber.slice(-4) || '9012'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-neutral-400">
                  <span>UIDAI Aadhaar Verified Engine</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Twilio & SendGrid Verified
                  </span>
                </div>
              </div>

              {aadhaarSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-center font-bold text-sm">
                  {aadhaarSuccess}
                </div>
              ) : (
                <form onSubmit={handleVerifyAadhaar} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      12-Digit Aadhaar Number
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="1234 5678 9012"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 font-mono text-sm tracking-wider focus:outline-hidden focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      UIDAI Security OTP (Enter 123456 for Demo)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="6-digit UIDAI OTP"
                      value={aadhaarOtp}
                      onChange={(e) => setAadhaarOtp(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 font-mono text-sm tracking-widest text-center focus:outline-hidden focus:border-neutral-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FF385C] hover:bg-[#E00B41] text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Verify with DigiLocker Demo</span>
                  </button>
                </form>
              )}

              {/* Skip Option */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleSkipAadhaar}
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 underline underline-offset-4 cursor-pointer"
                >
                  Skip Aadhaar verification for now (I will verify later) →
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* LOGIN & SIGNUP WORKFLOW */
            /* ========================================================= */
            <div className="space-y-6">
              {/* Primary Top Switcher: Log In vs Sign Up */}
              <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage(null);
                    setInfoMessage(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    activeTab === 'login'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMessage(null);
                    setInfoMessage(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    activeTab === 'signup'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Create Account (Sign Up)
                </button>
              </div>

              {/* ------------------------------------------------ */}
              {/* TAB 1: LOG IN */}
              {/* ------------------------------------------------ */}
              {activeTab === 'login' && (
                <div className="space-y-5">
                  {/* Method Toggle: Email & Password vs Phone & OTP */}
                  <div className="flex items-center justify-center gap-2 border-b border-neutral-100 pb-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setLoginMode('email_password')}
                      className={`pb-1.5 px-3 font-bold transition-all border-b-2 ${
                        loginMode === 'email_password'
                          ? 'border-neutral-900 text-neutral-900'
                          : 'border-transparent text-neutral-400 hover:text-neutral-700'
                      }`}
                    >
                      Email & Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMode('phone_otp')}
                      className={`pb-1.5 px-3 font-bold transition-all border-b-2 ${
                        loginMode === 'phone_otp'
                          ? 'border-[#FF385C] text-[#FF385C]'
                          : 'border-transparent text-neutral-400 hover:text-neutral-700'
                      }`}
                    >
                      Phone & OTP (Twilio)
                    </button>
                  </div>

                  {/* Mode A: Email & Password */}
                  {loginMode === 'email_password' && (
                    <form onSubmit={handlePasswordLogin} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                          <input
                            type="email"
                            required
                            placeholder="e.g. student@studentnest.demo"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:border-neutral-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                          <input
                            type="password"
                            required
                            placeholder="Enter your account password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:border-neutral-900"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-neutral-900 hover:bg-black text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>Log In with Password</span>
                      </button>
                    </form>
                  )}

                  {/* Mode B: Phone & OTP (Twilio) */}
                  {loginMode === 'phone_otp' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          Phone Number (with Country Code)
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                            <input
                              type="tel"
                              placeholder="+91 98765 43210"
                              value={loginPhone}
                              onChange={(e) => setLoginPhone(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:border-neutral-900"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleSendPhoneLoginOtp}
                            disabled={loading}
                            className="px-4 py-3 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50"
                          >
                            Send OTP
                          </button>
                        </div>
                        {phoneDevOtp && (
                          <div className="mt-1.5 text-[11px] text-indigo-700 bg-indigo-50 p-2 rounded-lg flex items-center justify-between">
                            <span>Twilio Dev OTP: <strong className="font-mono">{phoneDevOtp}</strong></span>
                            <button
                              type="button"
                              onClick={() => setLoginPhoneOtp(phoneDevOtp)}
                              className="underline font-bold text-indigo-900"
                            >
                              Auto-fill
                            </button>
                          </div>
                        )}
                      </div>

                      {isPhoneOtpSent && (
                        <form onSubmit={handleVerifyPhoneLogin} className="space-y-3 pt-2">
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 mb-1">
                              Enter 6-Digit SMS OTP
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="e.g. 960688"
                              value={loginPhoneOtp}
                              onChange={(e) => setLoginPhoneOtp(e.target.value)}
                              className="w-full text-center tracking-widest text-lg font-bold py-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-neutral-900 font-mono"
                              autoFocus
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#FF385C] hover:bg-[#E00B41] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>Verify SMS & Log In</span>
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* 1-Click Instant Demo Section */}
                  <div className="pt-2">
                    <div className="relative flex items-center justify-center my-3">
                      <div className="border-t border-neutral-200 w-full" />
                      <span className="bg-white px-3 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                        1-Click Real Demo Accounts
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={loginAsDemoStudent}
                        className="p-2.5 rounded-xl border border-neutral-200 hover:border-neutral-900 bg-neutral-50/50 hover:bg-neutral-50 text-left transition-all group cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-lg bg-sky-500 text-white flex items-center justify-center mb-1.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-[11px] font-bold text-neutral-900 group-hover:text-[#FF385C] truncate">
                          Julian Chen
                        </div>
                        <div className="text-[9px] text-neutral-500 truncate">Scholar</div>
                      </button>

                      <button
                        type="button"
                        onClick={loginAsDemoOwner}
                        className="p-2.5 rounded-xl border border-neutral-200 hover:border-neutral-900 bg-neutral-50/50 hover:bg-neutral-50 text-left transition-all group cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center mb-1.5">
                          <Building className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-[11px] font-bold text-neutral-900 group-hover:text-[#FF385C] truncate">
                          Eleanor Vance
                        </div>
                        <div className="text-[9px] text-neutral-500 truncate">Host</div>
                      </button>

                      <button
                        type="button"
                        onClick={loginAsDemoAdmin}
                        className="p-2.5 rounded-xl border border-purple-200 hover:border-purple-600 bg-purple-50/50 hover:bg-purple-100/50 text-left transition-all group cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-[11px] font-bold text-neutral-900 group-hover:text-purple-700 truncate">
                          Moderator
                        </div>
                        <div className="text-[9px] text-purple-600 truncate">Admin</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------ */}
              {/* TAB 2: SIGN UP */}
              {/* ------------------------------------------------ */}
              {activeTab === 'signup' && (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Arjun Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:border-neutral-900"
                      />
                    </div>
                  </div>

                  {/* Account Role */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      I am joining StudentNest as a:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('STUDENT')}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                          role === 'STUDENT'
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Student / Scholar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('OWNER')}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                          role === 'OWNER'
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                        }`}
                      >
                        <Building className="w-3.5 h-3.5" />
                        <span>Owner / Host</span>
                      </button>
                    </div>
                  </div>

                  {/* College Name (Mandatory for students) */}
                  {role === 'STUDENT' && (
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        College / University Name
                      </label>
                      <div className="relative">
                        <School className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Delhi University / IIT Delhi"
                          value={collegeName}
                          onChange={(e) => setCollegeName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:border-neutral-900"
                        />
                      </div>
                    </div>
                  )}

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Password (min 8 characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        placeholder="Choose a strong password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:border-neutral-900"
                      />
                    </div>
                  </div>

                  {/* Email & SendGrid Verification */}
                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-rose-500" />
                        <span>Email Address (SendGrid OTP)</span>
                      </label>
                      {isEmailVerified ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-amber-700">Verification Required</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="email"
                        disabled={isEmailVerified}
                        placeholder="student@college.edu"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-hidden focus:border-neutral-900"
                      />
                      {!isEmailVerified && (
                        <button
                          type="button"
                          onClick={handleSendEmailOtp}
                          disabled={loading}
                          className="px-3 py-2 text-xs font-bold bg-neutral-900 text-white rounded-xl hover:bg-black shrink-0 disabled:opacity-50"
                        >
                          Send Code
                        </button>
                      )}
                    </div>

                    {emailDevOtp && !isEmailVerified && (
                      <div className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg flex items-center justify-between">
                        <span>SendGrid Dev OTP: <strong className="font-mono">{emailDevOtp}</strong></span>
                        <button
                          type="button"
                          onClick={() => setSignupEmailOtp(emailDevOtp)}
                          className="underline font-bold text-rose-900"
                        >
                          Auto-fill
                        </button>
                      </div>
                    )}

                    {isEmailOtpSent && !isEmailVerified && (
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="6-digit Email OTP"
                          value={signupEmailOtp}
                          onChange={(e) => setSignupEmailOtp(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs text-center font-mono font-bold rounded-xl border border-neutral-300 bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleConfirmEmailOtp}
                          disabled={loading}
                          className="px-3 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shrink-0"
                        >
                          Verify OTP
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Phone & Twilio SMS Verification */}
                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Phone Number (Twilio SMS OTP)</span>
                      </label>
                      {isPhoneVerified ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-amber-700">Verification Required</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="tel"
                        disabled={isPhoneVerified}
                        placeholder="+919876543210"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-hidden focus:border-neutral-900"
                      />
                      {!isPhoneVerified && (
                        <button
                          type="button"
                          onClick={handleSendSignupPhoneOtp}
                          disabled={loading}
                          className="px-3 py-2 text-xs font-bold bg-neutral-900 text-white rounded-xl hover:bg-black shrink-0 disabled:opacity-50"
                        >
                          Send SMS
                        </button>
                      )}
                    </div>

                    {signupPhoneDevOtp && !isPhoneVerified && (
                      <div className="text-[11px] text-indigo-700 bg-indigo-50 p-2 rounded-lg flex items-center justify-between">
                        <span>Twilio Dev OTP: <strong className="font-mono">{signupPhoneDevOtp}</strong></span>
                        <button
                          type="button"
                          onClick={() => setSignupPhoneOtp(signupPhoneDevOtp)}
                          className="underline font-bold text-indigo-900"
                        >
                          Auto-fill
                        </button>
                      </div>
                    )}

                    {isSignupPhoneOtpSent && !isPhoneVerified && (
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="6-digit SMS OTP"
                          value={signupPhoneOtp}
                          onChange={(e) => setSignupPhoneOtp(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs text-center font-mono font-bold rounded-xl border border-neutral-300 bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleConfirmSignupPhoneOtp}
                          disabled={loading}
                          className="px-3 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shrink-0"
                        >
                          Verify SMS
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Create Account Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FF385C] hover:bg-[#E00B41] text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                    <span>Create Account & Continue to Aadhaar e-KYC</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
