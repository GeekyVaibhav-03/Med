// src/pages/Login.jsx
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
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

export default function Login() {
  const location = useLocation();
  const requiredRole = location.state?.requiredRole;
  
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [hospital, setHospital] = useState('');
  const [err, setErr] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showHospitalSelect, setShowHospitalSelect] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  const [roleTab, setRoleTab] = useState(requiredRole || 'doctor');
  const refresh = useAuthStore((s) => s.refresh);

const submit = async (e) => {
  e.preventDefault();
  setErr('');
  setLoading(true);

  try {
    const res = await api.post('/auth/login', {
      username: u,
      password: p
    });

    if (res.data?.user && res.data?.token) {
      const userRole = res.data.user.role;
      
      // Check if user role matches the selected tab (admin tab accepts admin role)
      if (roleTab === 'admin' && userRole !== 'admin') {
        setErr(`Invalid credentials. This account is not an admin account.`);
        setLoading(false);
        return;
      }
      
      if (roleTab === 'doctor' && userRole === 'admin') {
        setErr(`Invalid credentials. Admin accounts must use the Admin/Hospital login tab.`);
        setLoading(false);
        return;
      }

      // Check if a specific role was required (from protected route)
      if (requiredRole && userRole !== requiredRole) {
        setErr(`Access denied. ${requiredRole} role required.`);
        setLoading(false);
        return;
      }

      // Store session immediately
      useAuthStore.getState().setSession({
        user: res.data.user,
        token: res.data.token
      });

      // Redirect based on user role
      if (userRole === 'admin') {
        window.location.href = '/admin';
      } else if (userRole === 'doctor' || userRole === 'nurse' || userRole === 'pharmacist') {
        window.location.href = '/doctor';
      } else {
        window.location.href = '/doctor'; // default fallback
      }
    } else {
      setErr('Login failed');
      setLoading(false);
    }
  } catch (err) {
    setErr(err?.response?.data?.error || 'Login failed');
    setLoading(false);
  }
};

const handleHospitalSubmit = (e) => {
  e.preventDefault();
  setErr('');
  
  // Hospital selection is optional, proceed anyway
  setLoading(true);

  // Redirect immediately (hospital already stored if selected)
  window.location.href = '/admin';
};


  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0E8B86] to-[#28B99A] items-center justify-center p-12">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 text-white max-w-lg">
          <h1 className="text-5xl font-bold mb-6">Welcome to MedWatch</h1>
          <p className="text-xl mb-8 text-teal-50">
            Advanced MDR Contact Tracing & Healthcare Management System
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Real-Time Tracking</h3>
                <p className="text-teal-100 text-sm">Monitor patient and staff movements in real-time</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Instant Alerts</h3>
                <p className="text-teal-100 text-sm">Get notified of potential MDR exposures immediately</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Comprehensive Analytics</h3>
                <p className="text-teal-100 text-sm">Access detailed reports and contact network insights</p>
              </div>
            </div>
          </div>
        </div>
        {/* Medical Pattern Overlay */}
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <pattern id="medical-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 5 L20 35 M5 20 L35 20" stroke="white" strokeWidth="3"/>
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#medical-pattern)"/>
          </svg>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo for Mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0E8B86] to-[#28B99A] rounded-2xl mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">MedWatch</h2>
          </div>

          {/* Role Selection Tabs */}
          {!showHospitalSelect && (
            <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setRoleTab('doctor')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                  roleTab === 'doctor'
                    ? 'bg-white text-[#0E8B86] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Doctor</span>
                </div>
              </button>
              <button
                onClick={() => setRoleTab('admin')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                  roleTab === 'admin'
                    ? 'bg-white text-[#0E8B86] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Admin/Hospital</span>
                </div>
              </button>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {showHospitalSelect ? 'Select Hospital' : 'Sign In'}
            </h2>
            <p className="text-gray-600">
              {showHospitalSelect 
                ? 'Choose your hospital to access the admin panel' 
                : `Sign in as ${roleTab === 'doctor' ? 'Doctor' : 'Hospital Administrator'} to access your dashboard`}
            </p>
          </div>

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

          {/* Login Form */}
          {!showHospitalSelect ? (
            <form onSubmit={submit} className="space-y-5">
              {/* Username Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={u}
                    onChange={(e) => setU(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0E8B86] focus:border-transparent transition duration-200 outline-none text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={p}
                    onChange={(e) => setP(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0E8B86] focus:border-transparent transition duration-200 outline-none text-gray-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#0E8B86] to-[#28B99A] hover:from-[#0c7570] hover:to-[#239683] text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleHospitalSubmit} className="space-y-5">
              {/* Hospital Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Your Hospital
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <select
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0E8B86] focus:border-transparent transition duration-200 outline-none text-gray-900 appearance-none bg-white"
                    required
                  >
                    <option value="">Choose a hospital...</option>
                    {HOSPITALS.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
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

              {/* Continue Button */}
              <button
                type="submit"
                disabled={loading || !hospital}
                className="w-full bg-gradient-to-r from-[#0E8B86] to-[#28B99A] hover:from-[#0c7570] hover:to-[#239683] text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Completing login...
                  </span>
                ) : (
                  'Continue to Admin Panel'
                )}
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => {
                  setShowHospitalSelect(false);
                  setTempUserData(null);
                  setHospital('');
                }}
                className="w-full inline-flex items-center justify-center px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition duration-200"
              >
                <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Back to Login
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Don't have an account?</span>
            </div>
          </div>

          {/* Signup Link */}
          <Link
            to="/signup"
            className="w-full inline-flex items-center justify-center px-6 py-3.5 border-2 border-[#0E8B86] text-[#0E8B86] font-bold rounded-xl hover:bg-teal-50 transition duration-200"
          >
            Create New Account
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
