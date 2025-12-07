import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import useAppStore from '../store/useAppStore';
import useAuthStore from '../store/useAuthStore';
import LogoutButton from './LogoutButton';

const Header = ({ title }) => {
  const location = useLocation();
  const alerts = useAppStore((state) => state.alerts || []);
  const unreadCount = alerts.filter((a) => !a.read).length;
  const headerRef = useRef(null);

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, []);

  const isAdmin = location.pathname.startsWith('/admin');
  const isDoctor = location.pathname.startsWith('/doctor');

  return (
    <header
      ref={headerRef}
      className="bg-primary-teal text-white shadow-lg sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* LEFT: Logo */}
        <div className="flex items-center gap-4">
          <i className="ri-hospital-line text-4xl"></i>
          <div>
            <h1 className="text-3xl font-bold tracking-wide">MEDWATCH</h1>
            <p className="text-sm opacity-90">Real-time MDR Contact Tracing System</p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <nav className="flex items-center gap-6">
          {/* Doctor */}
          <Link
            to="/doctor"
            className={`px-4 py-2 rounded-lg font-semibold transition-all hover:bg-white hover:text-primary-teal ${
              isDoctor ? 'bg-white text-primary-teal' : ''
            }`}
          >
            <i className="ri-stethoscope-line mr-2"></i>
            Doctor Dashboard
          </Link>

          {/* Admin */}
          <Link
            to="/admin"
            className={`px-4 py-2 rounded-lg font-semibold transition-all hover:bg-white hover:text-primary-teal ${
              isAdmin ? 'bg-white text-primary-teal' : ''
            }`}
          >
            <i className="ri-admin-line mr-2"></i>
            Admin Panel
          </Link>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition">
            <i className="ri-notification-3-line text-2xl"></i>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* LOGIN / LOGOUT SECTION */}
          {!user ? (
            /* NOT LOGGED IN → Show Login link */
            <Link
              to="/login"
              className="px-4 py-2 bg-white text-primary-teal font-semibold rounded-lg hover:bg-opacity-80"
            >
              Login
            </Link>
          ) : (
            /* LOGGED IN → Show User + Logout */
            <div className="flex items-center gap-3">
              <span className="font-medium text-white/90">
                Hi, <span className="font-bold">{user.name || user.username}</span>
              </span>
              <LogoutButton className="px-4 py-2 bg-white text-primary-teal font-semibold rounded-lg hover:bg-opacity-80" />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
