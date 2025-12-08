// src/pages/Signup.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

const HOSPITALS = [
  { id: 'myhospital', name: 'MY Hospital (Maharaja Yeshwantrao)', city: 'Indore' },
  { id: 'chl', name: 'Choithram Hospital & Research Centre', city: 'Indore' },
  { id: 'bombay', name: 'Bombay Hospital', city: 'Indore' },
  { id: 'greater_kailash', name: 'Greater Kailash Hospital', city: 'Indore' },
  { id: 'apollo', name: 'Apollo Hospital', city: 'Indore' },
  { id: 'care_chl', name: 'CARE CHL Hospital', city: 'Indore' },
  { id: 'medanta', name: 'Medanta Hospital', city: 'Indore' },
  { id: 'index', name: 'Index Medical College', city: 'Indore' },
  { id: 'shalby', name: 'Shalby Hospital', city: 'Indore' },
  { id: 'noble', name: 'Noble Hospital', city: 'Indore' },
];

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'doctor',
    hospital: '',
    email: '',
    fullName: '',
    phone: ''
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErr('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');

    // Validation
    if (!formData.username || !formData.password || !formData.hospital) {
      setErr('Please fill all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setErr('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErr('Passwords do not match');
      return;
    }

    if (formData.email && !formData.email.includes('@')) {
      setErr('Please enter a valid email');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/signup', {
        username: formData.username,
        password: formData.password,
        role: formData.role,
        hospital: formData.hospital,
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone
      });

      if (res.data?.ok) {
        // Auto-login after signup
        const loginRes = await api.post('/auth/login', {
          username: formData.username,
          password: formData.password
        });

        if (loginRes.data?.user && loginRes.data?.token) {
          useAuthStore.getState().setSession({
            user: loginRes.data.user,
            token: loginRes.data.token
          });

          // Redirect based on role
          if (loginRes.data.user.role === 'admin') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/doctor'; // doctor, nurse, pharmacist, visitor
          }
        } else {
          setErr('Account created! Please login.');
          setTimeout(() => navigate('/login'), 2000);
        }
      }
    } catch (err) {
      setErr(err?.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0E8B86] to-[#28B99A] items-center justify-center p-12">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 text-white max-w-lg">
          <h1 className="text-5xl font-bold mb-6">Join MedWatch Today</h1>
          <p className="text-xl mb-8 text-teal-50">
            Register your healthcare facility and start tracking MDR cases effectively
          </p>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg mb-4">Why Choose MedWatch?</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-teal-50">Advanced RFID-based contact tracing</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-teal-50">Real-time alerts and notifications</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-teal-50">Comprehensive analytics dashboard</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-teal-50">Multi-hospital network support</p>
              </div>
            </div>
          </div>
        </div>
        {/* Medical Pattern Overlay */}
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <pattern id="signup-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 5 L20 35 M5 20 L35 20" stroke="white" strokeWidth="3"/>
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#signup-pattern)"/>
          </svg>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Logo for Mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0E8B86] to-[#28B99A] rounded-2xl mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">MedWatch</h2>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">
              Register to access MedWatch contact tracing and MDR tracking system
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              I am a <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'doctor' })}
                className={`py-3 px-4 rounded-xl font-semibold transition border-2 ${
                  formData.role === 'doctor'
                    ? 'bg-[#0E8B86] text-white border-[#0E8B86]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#0E8B86]'
                }`}
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'nurse' })}
                className={`py-3 px-4 rounded-xl font-semibold transition border-2 ${
                  formData.role === 'nurse'
                    ? 'bg-[#0E8B86] text-white border-[#0E8B86]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#0E8B86]'
                }`}
              >
                Nurse
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'pharmacist' })}
                className={`py-3 px-4 rounded-xl font-semibold transition border-2 ${
                  formData.role === 'pharmacist'
                    ? 'bg-[#0E8B86] text-white border-[#0E8B86]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#0E8B86]'
                }`}
              >
                Pharmacist
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'visitor' })}
                className={`py-3 px-4 rounded-xl font-semibold transition border-2 ${
                  formData.role === 'visitor'
                    ? 'bg-[#0E8B86] text-white border-[#0E8B86]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#0E8B86]'
                }`}
              >
                Visitor
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Note: Admin accounts must be created by existing administrators.
            </p>
          </div>

          {/* Error Alert */}
          {err && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{err}</p>
              </div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {/* Hospital Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hospital <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <select
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  className="w-full pl-11 pr-10 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0E8B86] focus:border-transparent transition duration-200 outline-none appearance-none bg-white"
                  required
                >
                  <option value="">Select your hospital</option>
                  {HOSPITALS.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name}, {hospital.city}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0E8B86] focus:border-transparent transition duration-200 outline-none"
                  required
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-gray-400 text-xs font-normal">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Dr. John Doe"
                  className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0E8B86] focus:border-transparent transition duration-200 outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-gray-400 text-xs font-normal">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0E8B86] focus:border-transparent transition duration-200 outline-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-gray-400 text-xs font-normal">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0E8B86] focus:border-transparent transition duration-200 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0E8B86] focus:border-transparent transition duration-200 outline-none"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0E8B86] focus:border-transparent transition duration-200 outline-none"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0E8B86] to-[#28B99A] hover:from-[#0c7570] hover:to-[#239683] text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="w-full inline-flex items-center justify-center px-6 py-3.5 border-2 border-[#0E8B86] text-[#0E8B86] font-bold rounded-xl hover:bg-teal-50 transition duration-200"
          >
            Sign In to Your Account
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
