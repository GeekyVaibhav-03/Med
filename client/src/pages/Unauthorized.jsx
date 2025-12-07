import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';

export default function Unauthorized() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(true);
  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);

  // Determine what role is required based on the attempted path
  // First check location.state, then check the referrer/previous path
  const requiredRole = location.state?.requiredRole || 
    (document.referrer.includes('/admin') ? 'admin' : 
     window.location.pathname.startsWith('/admin') ? 'admin' : 
     location.pathname.startsWith('/admin') ? 'admin' : 'doctor');

  useEffect(() => {
    // Show modal when component mounts
    setShowModal(true);
  }, []);

  const handleLoginAsRequired = () => {
    // Clear current session and redirect to login
    clearUser();
    navigate('/login', { state: { requiredRole } });
  };

  const handleGoBack = () => {
    // Go back to the appropriate dashboard based on current user role
    if (user?.role === 'doctor') {
      navigate('/doctor');
    } else if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/login');
    }
  };

  const getRoleDisplay = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Backdrop */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 animate-fade-in">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Access Denied
            </h2>

            {/* Message */}
            <p className="text-gray-600 text-center mb-6">
              You don't have permission to access the {getRoleDisplay(requiredRole)} Panel.
              {user && (
                <span className="block mt-2 text-sm">
                  Current user: <span className="font-semibold">{user.username}</span> ({user.role})
                </span>
              )}
            </p>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleLoginAsRequired}
                className="w-full bg-gradient-to-r from-[#0E8B86] to-[#28B99A] hover:from-[#0c7570] hover:to-[#239683] text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
                Login as {getRoleDisplay(requiredRole)}
              </button>

              {user && (
                <button
                  onClick={handleGoBack}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition duration-200"
                >
                  Go Back to My Dashboard
                </button>
              )}

              {!user && (
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition duration-200"
                >
                  Create New Account
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
