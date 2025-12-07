import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Sidebar = ({ items, type }) => {
  const location = useLocation();
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (sidebarRef.current && sidebarRef.current.children) {
      gsap.fromTo(
        sidebarRef.current.children,
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );
    }
  }, []);

  return (
    <aside
      ref={sidebarRef}
      className="w-64 bg-gray-800 shadow-xl h-full p-6 border-r-4 border-primary-teal"
    >
      <nav className="space-y-2">
        {items.map((item) => {
          const isActive = location.pathname === `/${type}${item.path}`;
          return (
            <Link
              key={item.path}
              to={`/${type}${item.path}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all hover:bg-primary-teal hover:scale-105 hover:text-white ${
                isActive ? 'bg-primary-teal text-white shadow-lg' : 'text-gray-300 hover:text-white'
              }`}
            >
              <i className={`${item.icon} text-xl`}></i>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
